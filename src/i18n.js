import { createI18n } from 'vue-i18n'

const messages = {
    en: {
        title: 'CryptoAlert Dashboard',
        filters: {
            symbol: 'Symbol',
            cycle: 'Cycle',
            shape: 'Fractal',
            rsi: 'RSI',
            macd: 'MACD',
            all: 'All',
            search: 'Search',
            reset: 'Reset',
            macdOptions: {
                1: 'Golden-Above 0',
                2: 'Golden-Below 0',
                3: 'Death-Above 0',
                4: 'Death-Below 0'
            }
        },
        table: {
            symbol: 'Symbol',
            price: 'Close Price',
            change: 'Change',
            rsi: 'RSI',
            fractal: 'Fractal',
            macd: 'MACD Signal',
            macdLabels: {
                1: 'Golden Cross (Above 0)',
                2: 'Golden Cross (Below 0)',
                3: 'Death Cross (Above 0)',
                4: 'Death Cross (Below 0)'
            },
            top: 'Top Fractal',
            bottom: 'Bottom Fractal',
            none: 'None',
            volume: 'Volume',
            rate: 'Funding Rate',
            time: 'Last Update',
            cycle: 'Cycle',
            crossTime: 'Cross Time',
            vpAnalysis: 'VP Analysis',
            vpLabels: {
                1: 'Price Up Vol Up',
                2: 'Price Down Vol Up',
                0: 'None'
            },
            support: 'Support',
            resistance: 'Resistance',
            smcSignal: 'SMC Signal',
            actions: 'More',
            viewMore: 'View More',
            subscribe: 'Subscribe',
            notImplemented: 'This feature is coming soon!',
            close: 'Close',
            fvg: 'FVG Gap',
            ob: 'Order Block',
            fundsFlow: 'Short-term Funds Flow',
            otherInfo: 'Other Info',
            spot: 'Spot',
            contract: 'Contract',
            inflow: 'Inflow',
            outflow: 'Outflow',
            netFlow: 'Net Flow',
            stopInflow: 'Spot Inflow',
            stopOutflow: 'Spot Outflow',
            stopNetFlow: 'Spot Net Flow',
            contractInflow: 'Contract Inflow',
            contractOutflow: 'Contract Outflow',
            contractNetFlow: 'Contract Net Flow'
        },
        pagination: {
            pageInfo: 'Page {current} of {total}',
            prev: 'Prev',
            next: 'Next'
        },
        stats: 'Found {count} records',
        noResults: 'No results match your criteria.',
        loading: 'Loading Analysis...'
    },
    zh: {
        title: '加密货币分析仪表盘',
        filters: {
            symbol: '币种',
            cycle: '周期',
            shape: '分型',
            rsi: 'RSI',
            macd: 'MACD',
            all: '全部',
            search: '搜索',
            reset: '重置',
            macdOptions: {
                1: '金叉-0轴上',
                2: '金叉-0轴下',
                3: '死叉-0轴上',
                4: '死叉-0轴下'
            }
        },
        table: {
            symbol: '币种',
            price: '周期收盘价',
            change: '涨跌幅',
            rsi: 'RSI值',
            fractal: '缠论分型',
            macd: 'MACD信号',
            macdLabels: {
                1: '金叉-0轴上',
                2: '金叉-0轴下',
                3: '死叉-0轴上',
                4: '死叉-0轴下'
            },
            top: '顶分型',
            bottom: '底分型',
            none: '无',
            volume: '成交量',
            rate: '资金费率',
            time: '更新时间',
            cycle: '周期',
            crossTime: '交叉时间',
            vpAnalysis: '量价分析',
            vpLabels: {
                1: '量价齐升',
                2: '量价齐跌',
                0: '无'
            },
            support: '支撑位',
            resistance: '压力位',
            smcSignal: 'SMC信号',
            actions: '更多',
            viewMore: '查看更多',
            subscribe: '订阅',
            notImplemented: '该功能暂未上线！',
            close: '关闭',
            fvg: 'FVG 缺口',
            ob: '订单块 OB',
            fundsFlow: '短期资金流向',
            otherInfo: '其他信息',
            spot: '现货',
            contract: '合约',
            inflow: '流入',
            outflow: '流出',
            netFlow: '净流入',
            stopInflow: '现货流入',
            stopOutflow: '现货流出',
            stopNetFlow: '现货净流入',
            contractInflow: '合约流入',
            contractOutflow: '合约流出',
            contractNetFlow: '合约净流入'
        },
        pagination: {
            pageInfo: '第 {current} 页，共 {total} 页',
            prev: '上一页',
            next: '下一页'
        },
        stats: '共找到 {count} 条记录',
        noResults: '没有匹配的数据。',
        loading: '正在加载分析数据...'
    }
}

export const i18n = createI18n({
    legacy: false,
    locale: 'zh',
    fallbackLocale: 'en',
    messages
})
