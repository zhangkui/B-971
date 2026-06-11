<?php
// backend/public/index.php

require __DIR__ . '/../vendor/autoload.php';

use App\Database;

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Helper to send JSON response
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

// Helper to generate a random token
function generateToken() {
    return bin2hex(random_bytes(32));
}

// Helper to get authenticated user by token
function getAuthUser($pdo) {
    $authHeader = '';
    
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    
    if (empty($authHeader)) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    }
    if (empty($authHeader)) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    }
    
    if (strpos($authHeader, 'Bearer ') !== 0) {
        return null;
    }

    $token = substr($authHeader, 7);
    if (empty($token)) return null;

    $stmt = $pdo->prepare("SELECT id, username, role, xianyu_balance, monthly_card_expires_at, token FROM users WHERE token = ?");
    $stmt->execute([$token]);
    return $stmt->fetch();
}

try {
    $pdo = Database::getConnection();

    // Route: POST /api/register
    if ($method === 'POST' && $uri === '/api/register') {
        $input = json_decode(file_get_contents('php://input'), true);
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($username) || empty($password)) {
            jsonResponse(['status' => 'error', 'message' => '用户名和密码不能为空'], 400);
        }

        // Hash the password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        try {
            $stmt->execute([$username, $hashedPassword]);
            jsonResponse(['status' => 'success', 'message' => '注册成功']);
        } catch (\Exception $e) {
            jsonResponse(['status' => 'error', 'message' => '用户名已存在'], 400);
        }
    }

    // Route: POST /api/login
    if ($method === 'POST' && $uri === '/api/login') {
        $input = json_decode(file_get_contents('php://input'), true);
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';

        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        // Verify hashed password
        if ($user && password_verify($password, $user['password'])) {
            $token = generateToken();
            $pdo->prepare("UPDATE users SET token = ? WHERE id = ?")->execute([$token, $user['id']]);
            
            // Unset sensitive data
            unset($user['password']);
            $user['token'] = $token;
            
            jsonResponse(['status' => 'success', 'data' => $user]);
        } else {
            jsonResponse(['status' => 'error', 'message' => '账号或密码错误'], 401);
        }
    }

    // Route: GET /api/cards (Debug/List)
    if ($method === 'GET' && $uri === '/api/cards') {
        $stmt = $pdo->query("SELECT * FROM cards ORDER BY created_at DESC LIMIT 50");
        $cards = $stmt->fetchAll();
        jsonResponse(['status' => 'success', 'data' => $cards]);
    }

    // Route: POST /api/cards/use (User uses a card)
    if ($method === 'POST' && $uri === '/api/cards/use') {
        $input = json_decode(file_get_contents('php://input'), true);
        $cardNo = $input['card_no'] ?? '';
        
        $authUser = getAuthUser($pdo);
        if (!$authUser) {
            jsonResponse(['status' => 'error', 'message' => '请先登录'], 401);
        }
        $userId = $authUser['id'];

        if (empty($cardNo)) {
            jsonResponse(['status' => 'error', 'message' => '卡号不能为空'], 400);
        }

        // Check card
        $stmt = $pdo->prepare("SELECT * FROM cards WHERE card_no = ?");
        $stmt->execute([$cardNo]);
        $card = $stmt->fetch();

        if (!$card) {
            jsonResponse(['status' => 'error', 'message' => '无效的卡号'], 404);
        }

        if ($card['status'] === 'used') {
            jsonResponse(['status' => 'error', 'message' => '卡号已被使用'], 400);
        }

        if ($card['status'] === 'voided') {
            jsonResponse(['status' => 'error', 'message' => '卡号已作废，无法使用'], 400);
        }

        // Start transaction
        $pdo->beginTransaction();
        try {
            // Update card
            $updateCardStmt = $pdo->prepare("UPDATE cards SET status = 'used', used_at = NOW(), used_by_user_id = ? WHERE id = ?");
            $updateCardStmt->execute([$userId, $card['id']]);

            // Update user
            if ($card['type'] === 'monthly') {
                $updateUserStmt = $pdo->prepare("UPDATE users SET monthly_card_expires_at = IF(monthly_card_expires_at > NOW(), DATE_ADD(monthly_card_expires_at, INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY)) WHERE id = ?");
                $reward = '月卡已激活 (30天)';
            } else {
                $updateUserStmt = $pdo->prepare("UPDATE users SET xianyu_balance = xianyu_balance + 1000 WHERE id = ?");
                $reward = '1000 仙玉已到账';
            }
            $updateUserStmt->execute([$userId]);

            $pdo->commit();

            // Fetch updated user data
            $userStmt = $pdo->prepare("SELECT id, username, role, xianyu_balance, monthly_card_expires_at, token FROM users WHERE id = ?");
            $userStmt->execute([$userId]);
            $userData = $userStmt->fetch();

            jsonResponse([
                'status' => 'success',
                'message' => '兑换成功！',
                'reward' => $reward,
                'user' => $userData
            ]);
        } catch (\Exception $e) {
            $pdo->rollBack();
            jsonResponse(['status' => 'error', 'message' => '兑换失败: ' . $e->getMessage()], 500);
        }
    }

    // Route: POST /api/cards/generate (Admin - Generate cards)
    if ($method === 'POST' && $uri === '/api/cards/generate') {
         $input = json_decode(file_get_contents('php://input'), true);
         
         $authUser = getAuthUser($pdo);
         if (!$authUser || $authUser['role'] !== 'admin') {
             jsonResponse(['status' => 'error', 'message' => '权限不足 (Admin only)'], 403);
         }

         $type = $input['type'] ?? 'monthly';
         $count = (int)($input['count'] ?? 1);
         if ($count > 100) $count = 100;

         $generated = [];
         $insertStmt = $pdo->prepare("INSERT INTO cards (card_no, type) VALUES (?, ?)");

         for ($i = 0; $i < $count; $i++) {
             $prefix = ($type === 'monthly') ? 'M' : 'X';
             $code = $prefix . '-' . strtoupper(substr(md5(uniqid()), 0, 8)); // Simple random code
             try {
                 $insertStmt->execute([$code, $type]);
                 $generated[] = $code;
             } catch (\Exception $e) {
                 // Ignore dupes
             }
         }

         jsonResponse([
             'status' => 'success',
             'message' => "成功生成 " . count($generated) . " 张卡号",
             'cards' => $generated
         ]);
    }
    
    // Route: GET /api/cards/list (Admin - List cards with filters)
    if ($method === 'GET' && $uri === '/api/cards/list') {
        $authUser = getAuthUser($pdo);
        if (!$authUser || $authUser['role'] !== 'admin') {
            jsonResponse(['status' => 'error', 'message' => '权限不足 (Admin only)'], 403);
        }

        $type = $_GET['type'] ?? '';
        $status = $_GET['status'] ?? '';
        $createdFrom = $_GET['created_from'] ?? '';
        $createdTo = $_GET['created_to'] ?? '';
        $page = max(1, (int)($_GET['page'] ?? 1));
        $pageSize = max(1, min(100, (int)($_GET['page_size'] ?? 20)));

        $where = ['1=1'];
        $params = [];

        if (in_array($type, ['monthly', 'xianyu'])) {
            $where[] = 'c.type = ?';
            $params[] = $type;
        }
        if (in_array($status, ['unused', 'used', 'voided'])) {
            $where[] = 'c.status = ?';
            $params[] = $status;
        }
        if (!empty($createdFrom)) {
            $where[] = 'c.created_at >= ?';
            $params[] = $createdFrom . ' 00:00:00';
        }
        if (!empty($createdTo)) {
            $where[] = 'c.created_at <= ?';
            $params[] = $createdTo . ' 23:59:59';
        }

        $whereClause = implode(' AND ', $where);

        $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM cards c WHERE {$whereClause}");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetch()['total'];

        $offset = ($page - 1) * $pageSize;
        $stmt = $pdo->prepare("SELECT c.id, c.card_no, c.type, c.status, c.created_at, c.used_at, c.voided_at, u.username as used_by_username FROM cards c LEFT JOIN users u ON c.used_by_user_id = u.id WHERE {$whereClause} ORDER BY c.created_at DESC LIMIT {$pageSize} OFFSET {$offset}");
        $stmt->execute($params);
        $cards = $stmt->fetchAll();

        jsonResponse([
            'status' => 'success',
            'data' => $cards,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'page_size' => $pageSize,
                'total_pages' => ceil($total / $pageSize)
            ]
        ]);
    }

    // Route: POST /api/cards/void (Admin - Void a card)
    if ($method === 'POST' && $uri === '/api/cards/void') {
        $authUser = getAuthUser($pdo);
        if (!$authUser || $authUser['role'] !== 'admin') {
            jsonResponse(['status' => 'error', 'message' => '权限不足 (Admin only)'], 403);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $cardId = (int)($input['id'] ?? 0);

        if ($cardId <= 0) {
            jsonResponse(['status' => 'error', 'message' => '无效的卡密ID'], 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM cards WHERE id = ?");
        $stmt->execute([$cardId]);
        $card = $stmt->fetch();

        if (!$card) {
            jsonResponse(['status' => 'error', 'message' => '卡密不存在'], 404);
        }

        if ($card['status'] === 'used') {
            jsonResponse(['status' => 'error', 'message' => '已使用的卡密无法作废'], 400);
        }

        if ($card['status'] === 'voided') {
            jsonResponse(['status' => 'error', 'message' => '卡密已经作废'], 400);
        }

        $pdo->prepare("UPDATE cards SET status = 'voided', voided_at = NOW() WHERE id = ?")->execute([$cardId]);
        jsonResponse(['status' => 'success', 'message' => '卡密已作废']);
    }

    // Route: GET /api/cards/export (Admin - Export unused cards)
    if ($method === 'GET' && $uri === '/api/cards/export') {
        $authUser = getAuthUser($pdo);
        if (!$authUser || $authUser['role'] !== 'admin') {
            jsonResponse(['status' => 'error', 'message' => '权限不足 (Admin only)'], 403);
        }

        $type = $_GET['type'] ?? '';

        $where = ["c.status = 'unused'"];
        $params = [];

        if (in_array($type, ['monthly', 'xianyu'])) {
            $where[] = 'c.type = ?';
            $params[] = $type;
        }

        $whereClause = implode(' AND ', $where);
        $stmt = $pdo->prepare("SELECT c.card_no, c.type, c.created_at FROM cards c WHERE {$whereClause} ORDER BY c.created_at DESC");
        $stmt->execute($params);
        $cards = $stmt->fetchAll();

        jsonResponse([
            'status' => 'success',
            'data' => $cards
        ]);
    }

    // Route: GET /api/user/cards (User - View own card usage history)
    if ($method === 'GET' && $uri === '/api/user/cards') {
        $authUser = getAuthUser($pdo);
        if (!$authUser) {
            jsonResponse(['status' => 'error', 'message' => '请先登录'], 401);
        }

        $stmt = $pdo->prepare("SELECT c.card_no, c.type, c.used_at FROM cards c WHERE c.used_by_user_id = ? AND c.status = 'used' ORDER BY c.used_at DESC");
        $stmt->execute([$authUser['id']]);
        $cards = $stmt->fetchAll();

        $stmt2 = $pdo->prepare("SELECT id, username, xianyu_balance, monthly_card_expires_at FROM users WHERE id = ?");
        $stmt2->execute([$authUser['id']]);
        $userData = $stmt2->fetch();

        jsonResponse([
            'status' => 'success',
            'data' => [
                'user' => $userData,
                'cards' => $cards
            ]
        ]);
    }

    // Default 404
    jsonResponse(['status' => 'error', 'message' => '未找到接口'], 404);

} catch (\Exception $e) {
    jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
}
