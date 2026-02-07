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
            },
            rsiNotSelected: 'Not selected',
            rsiEscHint: 'Press ESC to cancel'
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
            copySymbol: 'Copy symbol',
            copySuccess: 'Copied',
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
        loading: 'Loading Analysis...',
            user: {
            notLoggedIn: 'Not logged in',
            login: 'Login',
            logout: 'Logout',
            email: 'Email',
            auth: 'Account'
        },
        auth: {
            login: 'Login',
            register: 'Register',
            email: 'Email',
            password: 'Password',
            confirmPassword: 'Confirm Password',
            passwordMismatch: 'Passwords do not match',
            goLogin: 'Already have an account? Login',
            goRegister: 'No account? Register',
            loginSuccess: 'Login success',
            registerSuccess: 'Register success',
            pleaseLogin: 'Please login first',
            networkError: 'Network error, please try again later',
            errors: {
                invalid_request: 'Please check your input format',
                email_or_password_wrong: 'Incorrect email or password, please try again',
                email_already_registered: 'This email is already registered, please login directly',
                server_error: 'Service temporarily unavailable, please try again later'
            },
            tgBindBtn: 'Bind Telegram',
            tgBindHint: 'Bind your Telegram to receive alerts. Click the button to get the link, then send /start in the bot.',
            tgBindWaiting: 'Waiting for you to open Telegram and send /start...',
            tgBound: 'Bound: {id}',
            tgBindSuccess: 'Binding successful!',
            openTelegram: 'Open Telegram Bot'
        },
        subscribe: {
            success: 'Subscribed successfully',
            pleaseLogin: 'Please login first to subscribe',
            mySubs: 'My Subscriptions',
            unsubscribe: 'Unsubscribe',
            empty: 'No subscriptions yet',
            selectCycle: 'Select cycle',
            save: 'Save'
        }
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
            },
            rsiNotSelected: '未选择',
            rsiEscHint: '按 ESC 取消选择'
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
            copySymbol: '复制代币',
            copySuccess: '已复制',
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
        loading: '正在加载分析数据...',
        user: {
            notLoggedIn: '未登录',
            login: '登录',
            logout: '退出',
            email: '邮箱',
            auth: '账号'
        },
        auth: {
            login: '登录',
            register: '注册',
            email: '邮箱',
            password: '密码',
            confirmPassword: '确认密码',
            passwordMismatch: '两次输入的密码不一致',
            goLogin: '已有账号？去登录',
            goRegister: '没有账号？去注册',
            loginSuccess: '登录成功',
            registerSuccess: '注册成功',
            pleaseLogin: '请先登录',
            networkError: '网络异常，请稍后重试',
            errors: {
                invalid_request: '请检查输入格式是否正确',
                email_or_password_wrong: '邮箱或密码错误，请重试',
                email_already_registered: '该邮箱已注册，请直接登录',
                server_error: '服务暂时不可用，请稍后重试'
            },
            tgBindBtn: '绑定 Telegram',
            tgBindHint: '绑定 Telegram 后可接收提醒。点击按钮获取链接，在机器人里发送 /start。',
            tgBindWaiting: '等待您在 Telegram 中打开机器人并发送 /start…',
            tgBound: '已绑定: {id}',
            tgBindSuccess: '绑定成功！',
            openTelegram: '打开 Telegram 机器人'
        },
        subscribe: {
            success: '订阅成功',
            pleaseLogin: '请先登录后再订阅',
            mySubs: '我的订阅',
            unsubscribe: '取消订阅',
            empty: '暂无订阅',
            selectCycle: '请选择周期',
            save: '保存'
        }
    }
}

export const i18n = createI18n({
    legacy: false,
    locale: 'zh',
    fallbackLocale: 'en',
    messages
})
