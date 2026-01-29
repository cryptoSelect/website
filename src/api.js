import axios from 'axios'

/**
 * 后端 API 基础地址（上线用域名时在此配置）：
 * - 不设置或为空：使用相对路径 /api，由 nginx 反向代理到后端（在 nginx/default.conf 中配置 proxy_pass）
 * - 设置为完整地址：如 https://api.example.com，前端直连该后端（需后端支持 CORS）
 * 构建时通过环境变量 VITE_API_BASE_URL 注入，例如：
 *   VITE_API_BASE_URL=https://api.example.com npm run build
 */
const baseURL = typeof import.meta.env.VITE_API_BASE_URL === 'string' && import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')  // 去掉末尾斜杠
  : ''

export default axios.create({ baseURL })
export { axios }
