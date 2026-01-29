# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## Nginx 部署说明

- **构建产物**：`npm run build` 输出到 `dist/`，nginx 只需托管该目录下的静态文件。
- **配置文件**：`nginx/default.conf` 已包含：
  - SPA 路由：`try_files $uri $uri/ /index.html`
  - 静态资源缓存（js/css/图片等）
  - 可选 API 反向代理（在 `nginx/default.conf` 中取消注释并修改 upstream 即可）

若在宿主机直接使用 nginx，可将 `dist/` 放到站点 root，并参考 `nginx/default.conf` 的 `location /` 和缓存配置。

## 上线用域名时：后端主机配置

前端请求 `/api/*` 时，后端地址可在以下**二选一**配置：

| 方式 | 配置位置 | 说明 |
|------|----------|------|
| **Nginx 反向代理**（推荐） | `nginx/default.conf` 中 `location /api/` | 取消注释并修改 `proxy_pass` 为实际后端地址（如 `http://后端内网:8080` 或 `https://api.你的域名.com`）。前端始终请求当前域名下的 `/api`，由 nginx 转发，无需改前端、无跨域。 |
| **前端直连后端** | 环境变量 `VITE_API_BASE_URL` | 构建时设置，如 `VITE_API_BASE_URL=https://api.你的域名.com npm run build`。前端会直连该地址，需后端开启 CORS。可复制 `.env.example` 为 `.env` 后填写。 |

- **后端主机信息**：若用 Nginx 代理，在 **`nginx/default.conf`** 的 `proxy_pass` 里写；若用前端直连，在 **`.env` 或构建命令** 里写 `VITE_API_BASE_URL`。

## Docker

```bash
# 构建
docker build -t cryptoselect-website .

# 运行（容器内以 nginx 用户监听 8080）
docker run --rm -p 8080:8080 cryptoselect-website
```
