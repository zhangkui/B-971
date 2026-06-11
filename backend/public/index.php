<?php
// backend/public/index.php

require __DIR__ . '/../vendor/autoload.php';

use App\Database;

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (strpos($authHeader, 'Bearer ') !== 0) {
        return null;
    }

    $token = substr($authHeader, 7);
    if (empty($token)) return null;

    $stmt = $pdo->prepare("SELECT id, username, role, xianyu_balance, monthly_card_expires_at FROM users WHERE token = ?");
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
            $userStmt = $pdo->prepare("SELECT id, username, role, xianyu_balance, monthly_card_expires_at FROM users WHERE id = ?");
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
    
    // Default 404
    jsonResponse(['status' => 'error', 'message' => '未找到接口'], 404);

} catch (\Exception $e) {
    jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
}
