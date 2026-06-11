# 发码网接入说明 (Integration Guide)

本项目提供了一个标准的卡密验证接口，您可以对接任意发卡网（如自动发卡平台）。

## 1. 核心流程
1. **玩家购卡**: 玩家在第三方发卡网购买卡密。
2. **获取卡密**: 发卡网自动发货（例如：`M-8888-AAAA`）。
3. **前往官网**: 玩家拿着卡密来到本站（`http://localhost:3000`）。
4. **验证使用**: 玩家在首页输入卡密，后端验证有效性并发放奖励。

## 2. 接口对接 (API Reference)
如果您需要自动化对接（例如游戏服务器自动验证），请使用以下接口：

### 验证并消费卡密 (Redeem Card)
- **Endpoint**: `POST /api/cards/use`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <Your_Token>` (登录后获取)
- **Request**:
  ```json
  {
    "card_no": "M-8888-AAAA"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Card used successfully!",
    "reward": "Month Card Activated", // or "1000 Xianyu Added"
    "card_type": "monthly" // or "xianyu"
  }
  ```

## 3. 发卡网配置建议
在您的发卡网后台配置商品时：
- **商品类型**: 自动发货
- **卡密来源**:
  - 方式A（手动导入）: 使用管理员 API 生成卡密，导出为 TXT，上传到发卡网后台。
  - 方式B（API对接）: 发卡网如果支持 API 提取，可对接 `GET /api/cards` (需增加鉴权)。

**推荐方式**: 方式A。管理员定期生成一批卡密，导入发卡网售卖即可。安全且简单。
