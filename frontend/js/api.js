// API Client
const API_BASE = 'http://localhost:8000/api';

export async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    // Get token from localStorage
    const storedUser = localStorage.getItem('user');
    const token = storedUser ? JSON.parse(storedUser).token : null;

    const config = {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        }
    };

    if (options.body) {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
}

export const api = {
    // 卡密兑换
    useCard: (cardNo) => apiCall('/cards/use', {
        method: 'POST',
        body: { card_no: cardNo }
    }),

    // 登录
    login: (username, password) => apiCall('/login', {
        method: 'POST',
        body: { username, password }
    }),

    // 注册
    register: (username, password) => apiCall('/register', {
        method: 'POST',
        body: { username, password }
    }),

    // 生成卡号
    generateCards: (type, count) => apiCall('/cards/generate', {
        method: 'POST',
        body: { type, count }
    }),

    // 获取卡号列表（调试用）
    getCards: () => apiCall('/cards')
};
