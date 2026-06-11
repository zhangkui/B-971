const API_BASE = 'http://localhost:8000/api';

export async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
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
    useCard: (cardNo) => apiCall('/cards/use', {
        method: 'POST',
        body: { card_no: cardNo }
    }),

    login: (username, password) => apiCall('/login', {
        method: 'POST',
        body: { username, password }
    }),

    register: (username, password) => apiCall('/register', {
        method: 'POST',
        body: { username, password }
    }),

    generateCards: (type, count) => apiCall('/cards/generate', {
        method: 'POST',
        body: { type, count }
    }),

    getCards: () => apiCall('/cards'),

    getCardList: (params = {}) => {
        const query = new URLSearchParams();
        if (params.type) query.set('type', params.type);
        if (params.status) query.set('status', params.status);
        if (params.created_from) query.set('created_from', params.created_from);
        if (params.created_to) query.set('created_to', params.created_to);
        if (params.page) query.set('page', params.page);
        if (params.page_size) query.set('page_size', params.page_size);
        const qs = query.toString();
        return apiCall(`/cards/list${qs ? '?' + qs : ''}`);
    },

    voidCard: (id) => apiCall('/cards/void', {
        method: 'POST',
        body: { id }
    }),

    exportCards: (type = '') => {
        const query = new URLSearchParams();
        if (type) query.set('type', type);
        const qs = query.toString();
        return apiCall(`/cards/export${qs ? '?' + qs : ''}`);
    },

    getUserCards: () => apiCall('/user/cards')
};
