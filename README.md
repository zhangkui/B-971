# 卡号管理系统 (Card Generator System)

## 🛠 技术栈
- **前端 (Frontend)**: 原生 HTML5 + Tailwind CSS (CDN) + Vanilla JavaScript (ES Modules, 现代毛玻璃 UI)
- **后端 (Backend)**: PHP 8.2 (REST API, Eloquent ORM, Composer)
- **数据库 (Database)**: MySQL 8.0 (Docker 容器化, 自动注入)
- **构建工具**: Docker Compose (全环境容器化), Phinx (数据库迁移)

## 🚀 启动指南
1. 确保您的电脑已安装并启动 Docker Desktop。
2. 在项目根目录执行以下命令进行快速启动：
   ```bash
   ./run.sh
   ```
   或者手动构建并启动：
   ```bash
   docker compose up --build
   ```
3. 等待容器启动。首次启动时，MySQL 会自动按照 `database/init.sql` 初始化数据。

## 🔗 服务入口
- **总控制台/首页**: <http://localhost:3000>
  - 包含「卡密兑换」、「购买月卡」和「后台管理」三大功能模块。
- **用户登录与权限**: 
  - 首次访问需登录。
  - **管理员账号**: `admin` / **密码**: `123456` (具备卡号生成权限)。
  - **用户注册**: 支持在线注册新账号。
- **后端 API**: <http://localhost:8000>
- **数据库**: `localhost:3306` (账号: `root` / 密码: `root` / 库名: `card_db`)

## 💡 核心机制
1. **双卡系统**:
   - **月卡 (Monthly Card)**: 激活后可获得会员期限。
   - **仙玉卡 (Xianyu Card)**: 激活后充值「仙玉」余额。
2. **余额购买**:
   - 用户可以使用充值的「仙玉」余额直接在「购买月卡」页面购买不同权限。
3. **后台管理**:
   - 管理员登录后可进入后台生成新的卡密，支持自定义数量和类型。

## 🧪 测试卡密 (已内置)
**月卡激活码 (Monthly Cards):**
- `M-8888-AAAA`
- `M-8888-BBBB`

**仙玉充值码 (Xianyu Cards):**
- `X-6666-1111`
- `X-6666-2222`

## 👨‍💻 API & 集成
API 详细对接文档请参考 [INTEGRATION.md](./INTEGRATION.md)。

快速测试示例 (生成卡号):
```bash
curl -X POST http://localhost:8000/api/cards/generate \
  -H "Content-Type: application/json" \
  -d '{"count": 5, "type": "monthly"}'
```
> 注意: 实际 API 调用可能需要 Session 或 Token 验证，详情请查看后端代码实现。