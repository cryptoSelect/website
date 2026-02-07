# ========== 构建阶段 ==========
FROM node:22-alpine AS builder

WORKDIR /app

# 依赖
COPY package.json package-lock.json ./
RUN npm ci

# 源码并构建
COPY . .
RUN npm run build

# ========== 运行阶段：Nginx 托管静态文件 ==========
FROM nginx:1.27-alpine

# 使用项目内的 nginx 配置（SPA 路由、静态缓存等）
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 将构建产物放入 nginx 默认站点目录
COPY --from=builder /app/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 8080

# 以 root 运行 master 进程（可写 pid/cache），worker 由 nginx.conf 的 user 指定
CMD ["nginx", "-g", "daemon off;"]
