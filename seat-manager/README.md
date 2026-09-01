# Hotpot Seat Manager 在线版

这套程序供餐厅员工在 iPad、Android 平板和电脑上共用。服务器保存唯一的正式状态；各设备登录后会实时收到更新。公开餐厅网站与本系统分开部署。

## 本地开发与测试

要求 Node.js 22.13 或更新版本。第一次使用先运行 `npm install`。

```bash
npm run build
npm test
npm run e2e
```

本地开发服务器使用测试 PIN `2468`，只可用于本机测试：

```bash
npm run dev
```

打开 `https://127.0.0.1:8787/`。本地 HTTPS 证书是开发证书，浏览器可能要求确认继续访问。

## 安全规则

- 正式 PIN 必须在电脑的隐藏终端提示中输入，绝不能贴到聊天、README、截图或 Git。
- PIN 不会直接上传；工具会产生随机 salt、pepper、版本和 HMAC verifier，并一次上传四项 Cloudflare 加密 secret。
- 浏览器只保存不含个人资料的随机设备编号。登录 cookie 为 HttpOnly、Secure、SameSite=Strict，有效期 12 小时。
- 不在任何设备上保存客人资料离线副本；PWA 只缓存程序外壳。
- 测试环境和正式环境使用不同的 Worker、Durable Object 数据库及 PIN。

## 测试服务器（staging）

必须先获得店主当次确认，再执行：

```bash
npm run provision:staging
npm run deploy:staging
```

`provision:staging` 会要求在终端中隐藏输入并确认 4 位 PIN。部署后应先确认未登录访问 `/api/session` 返回 401，再用电脑、iPad 和 Android 完成实时同步、通知、Arrived、拖动入座、清桌、断线重连及错误 PIN 冷却测试。

## 正式服务器（production）

只有测试服务器完成三设备验收并再次获得店主确认后，才执行：

```bash
npm run provision:production
npm run deploy:production
```

正式地址计划为 `https://reservation.centrestjhotpot.ca/`。首次登录后必须确认快照完全为空，且 `https://centrestjhotpot.ca/` 原餐厅网站没有变化。正式 PIN 应与测试 PIN 不同。

## 备份与退出

- 登录后访问同一网站的 `/api/export`，保存返回的 JSON；该接口需要当前登录 cookie，响应禁止缓存。
- 每次使用完可按右上角 `Logout / 安全退出`。12 小时后会自动要求重新输入 PIN。
- 备份包含客人姓名、电话和订位资料，应放在受保护的位置，不要上传到公开网盘或 Git。

## 免费额度检查

上线一周后在 Cloudflare Dashboard 查看 Worker requests、Durable Object requests/duration 和 SQLite reads/writes。只有在确认免费额度不足并得到店主另外批准后，才可以开通付费计划。

## 当前发布状态

- 本地业务、服务器与四种屏幕自动测试已通过。
- 测试 Worker 名称：`hotpot-seat-manager-staging`。
- 正式 Worker 名称：`hotpot-seat-manager-production`。
- 测试和正式服务器尚未在本说明记录为已部署；以当次 Wrangler 输出和现场验收为准。
