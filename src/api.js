import axios from 'axios'

const TOKEN_KEY = 'crypto_alert_token'

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

const instance = axios.create({ baseURL })

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default instance
export { axios }

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/** 登录：{ email, password } -> { token, email } */
export async function login(email, password) {
  const { data } = await instance.post('/api/auth/login', { email, password })
  return data
}

/** 注册：{ email, password } -> { token, email } */
export async function register(email, password) {
  const { data } = await instance.post('/api/auth/register', { email, password })
  return data
}

/** 发起 Telegram 绑定：返回 { token, expires_in, bot_name, start_url } */
export async function tgBindStart() {
  const { data } = await instance.post('/api/auth/tg/bind/start')
  return data
}

/** 查询 Telegram 绑定状态：GET ?token=xxx -> { bound, telegram_id } */
export async function tgBindStatus(token) {
  const { data } = await instance.get('/api/auth/tg/bind/status', { params: { token } })
  return data
}

/** 获取当前用户信息（需已登录） */
export async function getMe() {
  const { data } = await instance.get('/api/user/me')
  return data
}

/** 获取当前用户订阅列表（需已登录）-> { data: [{ symbol, cycle }, ...] }。symbol 可选，传则只返回该代币的订阅 */
export async function listSubscriptions(symbol) {
  const params = symbol ? { symbol: symbol.toUpperCase() } : {}
  const { data } = await instance.get('/api/subscription/', { params })
  return data
}

/** 创建订阅（需已登录），支持多周期 cycles: string[] */
export async function createSubscription(symbol, cycles) {
  const { data } = await instance.post('/api/subscription/', { symbol, cycles })
  return data
}

/** 删除订阅（需已登录） */
export async function deleteSubscription(symbol, cycle) {
  const { data } = await instance.delete('/api/subscription/', { params: { symbol, cycle } })
  return data
}
