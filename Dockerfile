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

# 非 root 无法绑定 80，nginx 配置中已改为 listen 8080
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && mkdir -p /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp /var/cache/nginx/scgi_temp \
    && chown -R nginx:nginx /var/cache/nginx

EXPOSE 8080

USER nginx

CMD ["nginx", "-g", "daemon off;"]
