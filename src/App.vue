<script setup>
import { ref, onMounted, computed, watchEffect, onUnmounted } from 'vue'
import axios from './api'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const toggleLang = () => {
  locale.value = locale.value === 'zh' ? 'en' : 'zh'
}

// Data State
const symbols = ref([])
const count = ref(0)
const loading = ref(false)
const error = ref(null)

// Modal State
const showModal = ref(false)
const showSubscribeModal = ref(false)
const modalData = ref(null)

// Funds Modal State
const fundsLoading = ref(false)
const fundsData = ref([])
const fundsError = ref(null)

// 更多弹窗状态
const moreMenuOpen = ref(null)   // 当前打开的行 id，null 表示关闭
const moreMenuRow = ref(null)    // 当前行数据，用于「查看更多」
const moreMenuPos = ref({ top: 0, left: 0 })

// Filters
const filterSymbol = ref('')
const filterCycle = ref('15m')
const filterShape = ref('')
const filterRsi = ref('')
const filterCrossType = ref('')
const page = ref(1)

// Sorting
const orderBy = ref('updated_at')
const orderType = ref('desc')

const handleSort = (field) => {
  if (orderBy.value === field) {
    orderType.value = orderType.value === 'asc' ? 'desc' : 'asc'
  } else {
    orderBy.value = field
    orderType.value = 'desc'
  }
  page.value = 1
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const params = {}
    if (filterSymbol.value) params.symbol = filterSymbol.value
    if (filterCycle.value) params.cycle = filterCycle.value
    if (filterShape.value) params.shape = filterShape.value
    if (filterRsi.value) params.rsi = filterRsi.value
    if (filterCrossType.value) params.cross_type = filterCrossType.value
    params.page = page.value
    params.order_by = orderBy.value
    params.order_type = orderType.value

    const response = await axios.get('/api/symbol', { params })
    
    // 根据新的后端API响应格式处理数据
    if (response.data.code === 200 && response.data.data) {
      symbols.value = response.data.data.data || []
      count.value = response.data.data.count || 0
    } else {
      symbols.value = []
      count.value = 0
      error.value = response.data.error || 'Unknown error occurred'
    }
  } catch (err) {
    console.error(err)
    error.value = 'Failed to load data. Please check backend.'
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filterSymbol.value = ''
  filterCycle.value = '15m'
  filterShape.value = ''
  filterRsi.value = ''
  filterCrossType.value = ''
  page.value = 1
  orderBy.value = 'updated_at'
  orderType.value = 'desc'
  fetchData()
}

onMounted(() => {
  fetchData()
  window.addEventListener('click', () => {
    moreMenuOpen.value = null
    moreMenuRow.value = null
  })
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      showModal.value = false
      showSubscribeModal.value = false
      moreMenuOpen.value = null
    }
  })
})

watchEffect(() => {
  const isModalOpen = showModal.value || showSubscribeModal.value
  document.body.classList.toggle('modal-open', isModalOpen)
})

onUnmounted(() => {
  document.body.classList.remove('modal-open')
})

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // Optional: add a tiny toast or transient state here
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}

const formatTime = (ts) => {
  return new Date(ts).toLocaleString()
}

const formatCrossTime = (ts) => {
  if (!ts || ts.startsWith('0001')) return '-'
  const date = new Date(ts)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

const formatNumber = (num) => {
  if (!num || num === 0) return '-'
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K'
  }
  return num.toFixed(2)
}

const formatPrice = (price) => {
  if (!price || price === 0 || price === false) return '-'
  if (typeof price === 'boolean') return '-'
  return price.toFixed(4)
}

const getFvgClass = (val) => {
  const s = String(val ?? '').trim()
  if (!s || s === '-' || s.toLowerCase() === 'none') return 'fvg-neutral'
  const lower = s.toLowerCase()
  // 英文关键词
  if (lower.includes('bull') || lower.includes('up') || lower.includes('support')) return 'fvg-positive'
  if (lower.includes('bear') || lower.includes('down') || lower.includes('resistance')) return 'fvg-negative'
  // 中文关键词
  if (s.includes('多') || s.includes('上') || s.includes('支撑')) return 'fvg-positive'
  if (s.includes('空') || s.includes('下') || s.includes('压力')) return 'fvg-negative'
  return 'fvg-neutral'
}

const getShapeLabel = (shape) => {
  if (shape === 1) return t('table.top')
  if (shape === 2) return t('table.bottom')
  return '-'
}

const getCrossLabel = (type) => {
  if (!type || type === 0) return '-'
  return t(`table.macdLabels.${type}`)
}

const getVPLabel = (signal) => {
  if (!signal) return '-'
  
  // 如果是数字（兼容旧数据），走 i18n
  if (typeof signal === 'number') {
    return t(`table.vpLabels.${signal}`) || t('table.none')
  }
  
  // 如果是字符串，根据当前语言处理
  if (typeof signal === 'string') {
    // 如果是中文模式，直接返回原字符串
    if (locale.value === 'zh') {
      return signal
    }
    
    // 如果是英文模式，将中文信号翻译成英文
    if (locale.value === 'en') {
      const translations = {
        // 简单信号
        '量价齐升': 'Price Up Vol Up',
        '量价齐跌': 'Price Down Vol Down',
        '上涨': 'Price Up',
        '下跌': 'Price Down',
        '齐升': 'Volume Up',
        '齐跌': 'Volume Down',
        '上行': 'Rising',
        '下行': 'Falling',
        '无': '-',
        'none': '-',
        
        // 实际的复杂信号
        '缩量上涨-背离': 'Volume Up - Divergence',
        '缩量下跌-洗盘': 'Volume Down - Shakeout',
        '缩量上涨': 'Volume Up',
        '缩量下跌': 'Volume Down',
        '放量上涨': 'High Volume Up',
        '放量下跌': 'High Volume Down',
        '放量上行': 'High Volume Rising',
        '放量下行': 'High Volume Falling',
        '放量下行-健康': 'High Volume Falling - Healthy',
        '放量上行-健康': 'High Volume Rising - Healthy',
        '背离': 'Divergence',
        '洗盘': 'Shakeout',
        '健康': 'Healthy',
        '': '-'
      }
      return translations[signal] || signal
    }
  }
  
  return signal
}

const getVPClass = (signal) => {
  if (!signal) return ''
  
  // 先获取翻译后的信号文本
  const translatedSignal = getVPLabel(signal)
  
  // 英文信号判断（包括复杂信号）
  const positiveEnglish = [
    'up', 'bullish', 'rise', 'increasing', 'price up', 'volume up', 'high volume up'
  ]
  const negativeEnglish = [
    'down', 'bearish', 'fall', 'decreasing', 'price down', 'volume down', 'high volume down'
  ]
  
  // 中文信号判断（包括复杂信号）
  const positiveChinese = [
    '上涨', '齐升', '上行', '量价齐升', '缩量上涨', '放量上涨'
  ]
  const negativeChinese = [
    '下跌', '齐跌', '下行', '量价齐跌', '缩量下跌', '放量下跌'
  ]
  
  const signalLower = translatedSignal.toLowerCase()
  
  // 检查正向信号
  const isPositive = positiveEnglish.some(word => signalLower.includes(word)) ||
                     positiveChinese.some(word => translatedSignal.includes(word)) ||
                     signal.includes('上涨') || signal.includes('齐升')
  
  // 检查负向信号
  const isNegative = negativeEnglish.some(word => signalLower.includes(word)) ||
                     negativeChinese.some(word => translatedSignal.includes(word)) ||
                     signal.includes('下跌') || signal.includes('齐跌')
  
  if (isPositive) return 'text-success'
  if (isNegative) return 'text-danger'
  return ''
}

const getDisplaySymbol = (symbol) => {
  if (!symbol) return '-'
  // 如果后4位为USDT则去掉
  if (symbol.length >= 4 && symbol.substring(symbol.length - 4).toUpperCase() === 'USDT') {
    return symbol.substring(0, symbol.length - 4)
  }
  return symbol
}

const getNetFlow = (inflow, outflow) => {
  if (!inflow || !outflow) return '-'
  const net = inflow - outflow
  if (net === 0) return '0'
  return (net > 0 ? '+' : (net < 0 ? '-' : '')) + formatNumber(Math.abs(net))
}

const getNetFlowClass = (inflow, outflow) => {
  if (!inflow || !outflow) return ''
  const net = inflow - outflow
  if (net > 0) return 'text-success'
  if (net < 0) return 'text-danger'
  return ''
}

const totalPages = computed(() => Math.ceil(count.value / 10))

// 过滤和排序资金流向数据
const filteredFundsData = computed(() => {
  if (!fundsData.value || fundsData.value.length === 0) return []
  
  // 定义时间优先级顺序
  const timePriority = {
    '5m': 1, '15m': 2, '30m': 3, '1h': 4, '2h': 5, '4h': 6, '6h': 7, '8h': 8, '12h': 9,
    '1d': 10, '2d': 11, '3d': 12, '5d': 13, '7d': 14, '10d': 15, '15d': 16, '30d': 17,
    '60d': 18, '90d': 19, '120d': 20, '150d': 21, '180d': 22, '1y': 23, '2y': 24, '3y': 25
  }
  
  // 过滤掉没有数据的记录
  const filtered = fundsData.value.filter(fund => {
    // 检查是否有任何有意义的数据
    return (fund.stop && fund.stop !== false && fund.stop > 0) ||
           (fund.contract && fund.contract !== false && fund.contract > 0) ||
           (fund.stop_trade_inflow && fund.stop_trade_inflow > 0) ||
           (fund.contract_trade_inflow && fund.contract_trade_inflow > 0) ||
           (fund.stop_trade_amount && fund.stop_trade_amount > 0) ||
           (fund.contract_trade_amount && fund.contract_trade_amount > 0)
  })
  
  // 按时间优先级排序
  return filtered.sort((a, b) => {
    const priorityA = timePriority[a.time] || 999
    const priorityB = timePriority[b.time] || 999
    return priorityA - priorityB
  })
})

const openSMCModal = async (data) => {
  modalData.value = data
  showModal.value = true
  moreMenuOpen.value = null
  
  // 获取资金流向数据
  await fetchFundsData(data.symbol)
}

/**
 * 解析资金接口响应。后端结构：{ code, error, data }，其中 data 为 ListData：{ data: [], count }。
 * 兼容：data 直接为数组 或 data.data 为数组。
 */
function parseFundsResponse(res) {
  if (!res || typeof res !== 'object') return []
  const code = res.code
  const payload = res.data

  if (code !== 200) {
    return { list: [], error: res.error || '请求失败' }
  }

  // 兼容两种结构：data 为 { data: [], count } 或 data 直接为数组
  let list = []
  if (Array.isArray(payload)) {
    list = payload
  } else if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.data)) {
      list = payload.data
    } else if (Array.isArray(payload.list)) {
      list = payload.list
    }
  }

  return { list, error: null }
}

const fetchFundsData = async (symbol) => {
  fundsLoading.value = true
  fundsError.value = null
  fundsData.value = []

  try {
    const response = await axios.get(`/api/funds/`, { params: { symbol } })
    const res = response.data
    const { list, error } = parseFundsResponse(res)

    fundsData.value = Array.isArray(list) ? list : []
    if (error) {
      fundsError.value = error
    } else if (fundsData.value.length === 0) {
      fundsError.value = null
    }
  } catch (err) {
    console.error('Error fetching funds data:', err)
    fundsData.value = []
    if (err.response != null) {
      const data = err.response.data
      fundsError.value = (data && (data.error || data.message)) || `请求失败 (${err.response.status})`
    } else {
      fundsError.value = '网络错误，请稍后重试'
    }
  } finally {
    fundsLoading.value = false
  }
}

const handleSubscribe = () => {
  showSubscribeModal.value = true
  moreMenuOpen.value = null
}

function openMoreMenu(row, ev) {
  ev.stopPropagation()
  if (moreMenuOpen.value === row.id) {
    moreMenuOpen.value = null
    moreMenuRow.value = null
    return
  }
  moreMenuOpen.value = row.id
  moreMenuRow.value = row
  const el = ev.currentTarget
  const rect = el.getBoundingClientRect()
  const gap = 4
  moreMenuPos.value = {
    top: rect.bottom + gap,
    left: rect.left,
  }
}
</script>

<template>
  <div class="container animated-entry">
    <header class="main-header">
      <div class="header-content">
        <h1>{{ t('title') }}</h1>
        <button class="lang-toggle" @click="toggleLang">
          {{ locale === 'zh' ? 'English' : '中文' }}
        </button>
      </div>
    </header>

    <section class="glass-card filter-section">
      <div class="input-group">
        <label>{{ t('filters.symbol') }}</label>
        <input v-model="filterSymbol" placeholder="e.g. BTCUSDT" @keyup.enter="fetchData" />
      </div>
      
      <div class="input-group">
        <label>{{ t('filters.cycle') }}</label>
        <select v-model="filterCycle">
          <option value="">{{ t('filters.all') }}</option>
          <option value="5m">5m</option>
          <option value="15m">15m</option>
          <option value="1h">1h</option>
          <option value="4h">4h</option>
          <option value="1d">1d</option>
          <option value="1w">1w</option>
          <option value="1M">1M</option>
        </select>
      </div>

      <div class="input-group">
        <label>{{ t('filters.shape') }}</label>
        <select v-model="filterShape">
          <option value="">{{ t('filters.all') }}</option>
          <option value="1">{{ t('table.top') }}</option>
          <option value="2">{{ t('table.bottom') }}</option>
        </select>
      </div>

      <div class="input-group">
        <label>{{ t('filters.rsi') }}</label>
        <input v-model="filterRsi" type="number" placeholder="Value (e.g. 70)" />
      </div>

      <div class="input-group">
        <label>{{ t('filters.macd') }}</label>
        <select v-model="filterCrossType">
          <option value="">{{ t('filters.all') }}</option>
          <option value="1">{{ t('filters.macdOptions.1') }}</option>
          <option value="2">{{ t('filters.macdOptions.2') }}</option>
          <option value="3">{{ t('filters.macdOptions.3') }}</option>
          <option value="4">{{ t('filters.macdOptions.4') }}</option>
        </select>
      </div>

      <div class="btn-group">
        <button class="primary-btn" @click="fetchData">{{ t('filters.search') }}</button>
        <button class="primary-btn reset-btn" @click="resetFilters">{{ t('filters.reset') }}</button>
      </div>
    </section>

    <main>
      <div v-if="loading" class="text-center" style="padding: 3rem">
        <div class="spinner">{{ t('loading') }}</div>
      </div>

      <div v-else-if="error" class="glass-card text-danger text-center">
        {{ error }}
      </div>

      <div v-else>
        <div class="stats-row">
          <span v-if="filterCycle" class="text-success">{{ filterCycle }} -</span>
          <span>{{ t('stats', { count }) }}</span>
        </div>

        <div class="table-container glass-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>
                  {{ t('table.symbol') }}
                </th>
                <th>{{ t('table.cycle') }}</th>
                <th>{{ t('table.price') }}</th>
                <th @click="handleSort('change')" class="sortable">
                  {{ t('table.change') }}
                  <span class="sort-icon" v-if="orderBy === 'change'">{{ orderType === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="handleSort('rsi')" class="sortable">
                  {{ t('table.rsi') }}
                  <span class="sort-icon" v-if="orderBy === 'rsi'">{{ orderType === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th>{{ t('table.fractal') }}</th>
                <th>{{ t('table.macd') }}</th>
                <th>{{ t('table.crossTime') }}</th>
                <th>{{ t('table.rate') }}</th>
                <th>{{ t('table.vpAnalysis') }}</th>
                <th>{{ t('table.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in symbols" :key="s.id">
                <td>
                  <div class="symbol-box">
                    <div class="symbol-info-row">
                      <a :href="`https://www.coinglass.com/tv/zh/Binance_${s.symbol}`" target="_blank" class="symbol-link">
                        <span class="symbol-name">{{ s.symbol }}</span>
                      </a>
                      <button class="copy-btn" @click="copyToClipboard(s.symbol)" title="Copy symbol">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      </button>
                    </div>
                  </div>
                </td>
                <td class="text-center">
                  <span class="badge badge-blue">{{ s.cycle || '-' }}</span>
                </td>
                <td class="font-mono font-bold">${{ s.price?.toFixed(4) }}</td>
                <td :class="s.change >= 0 ? 'text-success' : 'text-danger'">
                  {{ s.change >= 0 ? '+' : '' }}{{ s.change?.toFixed(2) }}%
                </td>
                <td :class="s.rsi >= 70 ? 'text-danger' : (s.rsi <= 30 ? 'text-success' : '')">
                  {{ s.rsi?.toFixed(2) }}
                </td>
                <td :class="s.shape === 1 ? 'text-danger' : (s.shape === 2 ? 'text-success' : '') + ' text-center'">
                  {{ getShapeLabel(s.shape) }}
                </td>
                <td class="text-center">{{ getCrossLabel(s.cross_type) }}</td>
                <td class="font-mono text-warning text-center">{{ formatCrossTime(s.cross_time) }}</td>
                <td class="text-center">
                  <div class="rate-info">
                    {{ (s.rate * 100).toFixed(4) }}%
                    <span class="text-muted">({{ s.rate_cycle || 1 }}h)</span>
                  </div>
                </td>
                <td :class="getVPClass(s.vp_signal) + ' text-center'">
                  {{ getVPLabel(s.vp_signal) }}
                </td>
                <td class="action-cell">
                  <button type="button" class="more-btn" @click="openMoreMenu(s, $event)">
                    {{ t('table.actions') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="symbols.length === 0" class="no-data">
            {{ t('noResults') }}
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="count > 0" class="pagination">
          <button :disabled="page === 1" class="page-btn" @click="page--; fetchData()">{{ t('pagination.prev') }}</button>
          <span class="page-info">{{ t('pagination.pageInfo', { current: page, total: totalPages }) }}</span>
          <button :disabled="page >= totalPages" class="page-btn" @click="page++; fetchData()">{{ t('pagination.next') }}</button>
        </div>
      </div>
    </main>

    <teleport to="body">
      <!-- Funds Modal -->
      <div v-if="showModal" class="modal-overlay" @click="showModal = false">
        <div class="modal-content funds-modal glass-card animated-modal" @click.stop>
          <div class="modal-header">
            <h2>{{ modalData ? getDisplaySymbol(modalData.symbol) : t('table.fundsFlow') }}</h2>
            <button class="close-btn" @click="showModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <!-- 其他信息 -->
            <div v-if="modalData" class="modal-section">
              <div class="modal-section-title">{{ t('table.otherInfo') }}</div>
              <div class="info-details-card">
                <div class="detail-item">
                  <label>{{ t('table.smcSignal') }}</label>
                  <span class="value nowrap">{{ modalData.smc_signal || '-' }}</span>
                </div>
                <div class="detail-item">
                  <label>{{ t('table.fvg') }}</label>
                  <span class="value nowrap" :class="getFvgClass(modalData.fvg)">{{ modalData.fvg || '-' }}</span>
                </div>
                <div class="detail-item">
                  <label>{{ t('table.ob') }}</label>
                  <span class="value nowrap">{{ modalData.ob || '-' }}</span>
                </div>
              </div>
            </div>

            <div class="modal-divider"></div>

            <div class="modal-section-title">{{ t('table.fundsFlow') }}</div>

            <!-- 资金流向数据 -->
            <div v-if="fundsLoading" class="text-center" style="padding: 2rem;">
              <div class="spinner">{{ t('loading') }}</div>
            </div>
            
            <div v-else-if="fundsError" class="text-center text-danger" style="padding: 2rem;">
              {{ fundsError }}
            </div>
            
            <div v-else-if="fundsData.length === 0" class="text-center" style="padding: 2rem; color: var(--text-muted);">
              {{ t('noResults') }}
            </div>
            
            <div v-else class="funds-table-container">
              <div class="funds-tables-wrapper">
                <!-- 现货表格 -->
                <div class="funds-table-section">
                  <h3 class="section-title">{{ t('table.spot') }}</h3>
                  <div class="funds-table">
                    <table>
                      <thead>
                        <tr>
                          <th>{{ t('table.cycle') }}</th>
                          <th>{{ t('table.inflow') }}</th>
                          <th>{{ t('table.outflow') }}</th>
                          <th>{{ t('table.netFlow') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="fund in filteredFundsData" :key="fund.id">
                          <td>{{ fund.time }}</td>
                          <td class="font-mono text-success">{{ formatNumber(fund.stop_trade_in) }}</td>
                          <td class="font-mono text-danger">{{ formatNumber(fund.stop_trade_out) }}</td>
                          <td class="font-mono" :class="getNetFlowClass(fund.stop_trade_in, fund.stop_trade_out)">
                            {{ getNetFlow(fund.stop_trade_in, fund.stop_trade_out) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- 合约表格 -->
                <div class="funds-table-section">
                  <h3 class="section-title">{{ t('table.contract') }}</h3>
                  <div class="funds-table">
                    <table>
                      <thead>
                        <tr>
                          <th>{{ t('table.cycle') }}</th>
                          <th>{{ t('table.inflow') }}</th>
                          <th>{{ t('table.outflow') }}</th>
                          <th>{{ t('table.netFlow') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="fund in filteredFundsData" :key="fund.id">
                          <td>{{ fund.time }}</td>
                          <td class="font-mono text-success">{{ formatNumber(fund.contract_trade_in) }}</td>
                          <td class="font-mono text-danger">{{ formatNumber(fund.contract_trade_out) }}</td>
                          <td class="font-mono" :class="getNetFlowClass(fund.contract_trade_in, fund.contract_trade_out)">
                            {{ getNetFlow(fund.contract_trade_in, fund.contract_trade_out) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="primary-btn" style="width: 100%; margin-top: 2rem;" @click="showModal = false">{{ t('table.close') }}</button>
          </div>
        </div>
      </div>

      <!-- Subscribe Modal -->
      <div v-if="showSubscribeModal" class="modal-overlay" @click="showSubscribeModal = false">
        <div class="modal-content glass-card animated-modal" @click.stop>
          <div class="modal-header">
            <h2>{{ t('table.subscribe') }}</h2>
            <button class="close-btn" @click="showSubscribeModal = false">&times;</button>
          </div>
          <div class="modal-body text-center" style="padding: 2rem 0;">
            <div class="coming-soon-icon">🚀</div>
            <p style="font-size: 1.1rem; color: var(--text-muted); margin-top: 1rem;">
              {{ t('table.notImplemented') }}
            </p>
            <div class="modal-footer">
              <button class="primary-btn" style="width: 100%; margin-top: 2rem;" @click="showSubscribeModal = false">{{ t('table.close') }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 更多弹窗：固定定位，两个选项「查看更多」「订阅」 -->
      <template v-if="moreMenuOpen !== null && moreMenuRow">
        <div class="more-overlay" @click="moreMenuOpen = null; moreMenuRow = null" />
        <div
          class="more-popup"
          :style="{ top: moreMenuPos.top + 'px', left: moreMenuPos.left + 'px' }"
          @click.stop
        >
          <button type="button" class="more-popup-item" @click="openSMCModal(moreMenuRow); moreMenuOpen = null; moreMenuRow = null">
            {{ t('table.viewMore') }}
          </button>
          <button type="button" class="more-popup-item" @click="handleSubscribe()">
            {{ t('table.subscribe') }}
          </button>
        </div>
      </template>
    </teleport>
  </div>
</template>

<style scoped>
.main-header {
  margin-bottom: 1rem;
}

.header-content {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 1800px;
  margin: 0 auto;
  position: relative;
  padding: 0; /* 移除 padding，与 container 对齐 */
  height: 60px; /* 固定高度，防止塌陷 */
}

.header-content h1 {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  text-align: center;
  margin-bottom: 0;
  width: auto;
}

.lang-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.lang-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--primary);
}

.btn-group {
  display: flex;
  gap: 0.5rem;
  padding-top: 1.5rem;
}

.reset-btn {
  background: #475569 !important;
}

.stats-row {
  margin-bottom: 1rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
}

.table-container {
  overflow-x: visible;
  overflow-y: visible;
  min-height: 400px;
  padding-bottom: 50px;
  width: 100%;
  max-width: 1800px; /* 限制最大宽度 */
  margin: 0 auto; /* 居中显示 */
}

/* 美化滚动条样式 */
.table-container::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  table-layout: fixed;
}

.data-table th {
  padding: 0.9rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--glass-border);
  white-space: nowrap;
}

/* 为各列设置固定宽度 */
.data-table th:nth-child(1), .data-table td:nth-child(1) { width: 130px; text-align: left; }   /* Symbol */
.data-table th:nth-child(2), .data-table td:nth-child(2) { width: 58px; text-align: left; padding-left: 0.5rem; }  /* Cycle 左靠，更贴近币种 */
.data-table th:nth-child(3), .data-table td:nth-child(3) { width: 110px; text-align: left; }  /* Price */
.data-table th:nth-child(4), .data-table td:nth-child(4) { width: 95px; text-align: left; }   /* Change */
.data-table th:nth-child(5), .data-table td:nth-child(5) { width: 90px; text-align: left; }   /* RSI */
.data-table th:nth-child(6), .data-table td:nth-child(6) { width: 100px; text-align: center; }  /* Fractal */
.data-table th:nth-child(7), .data-table td:nth-child(7) { width: 140px; text-align: center; }  /* MACD */
.data-table th:nth-child(8), .data-table td:nth-child(8) { width: 130px; text-align: center; }  /* Cross Time */
.data-table th:nth-child(9), .data-table td:nth-child(9) { width: 140px; text-align: center; }  /* Rate */
.data-table th:nth-child(10), .data-table td:nth-child(10) { width: 180px; text-align: center; } /* VP Analysis */
.data-table th:nth-child(11), .data-table td:nth-child(11) { width: 120px; text-align: center; } /* Actions */

.data-table th.sortable {
  cursor: pointer;
  transition: all 0.2s;
}

.data-table th.sortable:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--primary);
}

.sort-icon {
  margin-left: 0.5rem;
  color: var(--primary);
  font-size: 1rem;
}

.data-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
  white-space: nowrap;
}

/* 为各列数据设置固定宽度，与表头对应 */
/* 删除重复定义，已合并到上方 */

.data-table td .symbol-box {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  white-space: nowrap;  /* 防止换行 */
}

.data-table td .symbol-info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;  /* 防止换行 */
}

.data-table td .rate-info {
  display: flex;
  flex-direction: row;  /* 改为行布局 */
  align-items: center;
  justify-content: center; /* 内容水平居中 */
  gap: 0.5rem;
  white-space: nowrap;  /* 防止换行 */
  width: 100%; /* 占满单元格宽度 */
}

.data-table tr:hover {
  background: rgba(59, 130, 246, 0.05);
}

.symbol-box {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.symbol-info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.symbol-link {
  text-decoration: none;
  transition: opacity 0.2s;
}

.symbol-link:hover {
  opacity: 0.8;
}

.symbol-name {
  font-weight: 700;
  color: var(--primary);
  font-size: 1.1rem;
}

.copy-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s, transform 0.1s;
}

.copy-btn:hover {
  color: var(--primary);
  transform: scale(1.1);
}

.copy-btn:active {
  transform: scale(0.9);
}

.font-mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; }
.font-bold { font-weight: 700; }
.small { font-size: 0.8rem; }
.small-text { 
  font-size: 0.75rem; 
  opacity: 0.7;
  margin-top: 2px;
}
.text-center { text-align: center; }

/* 资金流向模态框专用样式 */
.funds-table-container {
  max-height: 600px;  /* 增加最大高度 */
  overflow-y: auto;
  margin-top: 1rem;
}

.funds-tables-wrapper {
  display: flex;
  gap: 2rem;
  min-height: 500px;  /* 增加最小高度 */
}

.funds-table-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--glass-border);
}

.funds-table {
  flex: 1;
  border-collapse: collapse;
  table-layout: auto;
  width: 90%;  /* 使用90%宽度，与现货/合约表格保持一致 */
  margin: 0 auto;  /* 居中显示 */
}

.funds-table th,
.funds-table td {
  padding: 0.5rem 0.8rem;  /* 增加内边距 */
  text-align: center;
  border-bottom: 1px solid var(--glass-border);
  white-space: nowrap;
}

/* 周期列 */
.funds-table th:first-child,
.funds-table td:first-child {
  min-width: 70px;
  max-width: 90px;
}

/* 流入流出列 */
.funds-table th:nth-child(2),
.funds-table th:nth-child(3),
.funds-table th:nth-child(4),
.funds-table td:nth-child(2),
.funds-table td:nth-child(3),
.funds-table td:nth-child(4) {
  min-width: 100px;
  max-width: 120px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.funds-table th {
  background: rgba(59, 130, 246, 0.1);
  font-weight: 600;
  color: var(--text-primary);
  position: sticky;
  top: 0;
  z-index: 10;
  font-size: 0.85rem;   /* 稍微缩小字体 */
  padding: 0.5rem 0.4rem; /* 表头内边距 */
}

.funds-table tr:hover {
  background: rgba(59, 130, 246, 0.05);
}

.no-data {
  padding: 5rem;
  text-align: center;
  color: var(--text-muted);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 3rem;
}

.page-btn {
  background: #334155;
  border: none;
  color: white;
  padding: 0.6rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.page-btn:hover:not(:disabled) {
  background: var(--primary);
  transform: translateY(-2px);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: var(--text-muted);
}

.action-cell {
  position: relative;
}

.more-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  color: var(--text-main);
  width: 80px;            /* 固定宽度 */
  min-width: 80px;
  max-width: 80px;
  height: 30px;           /* 固定高度 */
  min-height: 30px;
  max-height: 30px;
  padding: 0;             /* padding 不参与尺寸变化 */
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.45rem;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1;         /* 防止行高导致高度变化 */
  box-sizing: border-box; /* 尺寸包含边框 */
  transition: background 0.2s, border-color 0.2s;
}

.more-btn:hover {
  background: rgba(59, 130, 246, 0.25);
  border-color: var(--primary);
}

/* Glass Card Style */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
}

/* Modal Styles moved to global section below */

.info-row-single {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  padding: 1.25rem;
  border-radius: 0.8rem 0.8rem 0 0;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: none;
}

.info-details-card {
  background: rgba(255, 255, 255, 0.02);
  padding: 1rem 1.5rem;
  border-radius: 0 0 0.8rem 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 600;
}

.detail-item .value {
  font-size: 0.95rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}

.nowrap {
  white-space: nowrap;
}

.modal-section-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0.25rem 0 0.75rem;
  letter-spacing: 0.02em;
}

.modal-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 1rem 0;
}

.fvg-positive {
  color: var(--success);
}

.fvg-negative {
  color: var(--danger);
}

.fvg-neutral {
  color: var(--text-main);
  opacity: 0.9;
}

.info-item-mini {
  flex: 1;
  text-align: center;
}

.info-item-mini label {
  display: block;
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 0.4rem;
  font-weight: 600;
}

.info-item-mini .value {
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}

.coming-soon-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 1rem;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}
</style>

<style>
/* 更多弹窗：透明遮罩 + 固定定位小弹窗（Teleport 到 body） */
.more-overlay {
  position: fixed;
  inset: 0;
  z-index: 19990;
  background: transparent;
  pointer-events: auto;
}

.more-popup {
  position: fixed;
  z-index: 19991;
  min-width: 108px;
  padding: 0.3rem 0;
  background: rgba(30, 41, 59, 1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
}

.more-popup-item {
  display: block;
  width: 100%;
  padding: 0.45rem 0.7rem;
  text-align: left;
  background: transparent;
  border: none;
  color: #e2e8f0;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.more-popup-item:hover {
  background: rgba(59, 130, 246, 0.2);
  color: var(--primary);
}

.modal-overlay {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: var(--bg-color) !important;
  z-index: 99999 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  pointer-events: auto !important;
}

.modal-content {
  position: relative !important;
  z-index: 100000 !important;
  width: 90%;
  max-width: 600px;
  padding: 2rem;
  border: 1px solid var(--glass-border);
}

.funds-modal {
  width: 95%;
  max-width: 1100px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
}

.animated-modal {
  animation: modalIn 0.3s ease-out;
}

.spinner {
  font-weight: 600;
  color: var(--primary);
  animation: pulse 2s infinite;
}

/* Ensure body scroll is locked when modal is open */
body.modal-open {
  overflow: hidden !important;
  position: fixed !important;
  width: 100% !important;
}

</style>
