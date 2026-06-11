import { api } from '../api.js';
import { Toast } from './toast.js';

const toast = new Toast();

export function renderMyCard() {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    if (!user) {
        return `
            <div class="text-center py-20 animate-fade-in-up">
                <h2 class="text-2xl font-bold text-gray-700 dark:text-white mb-4">请先登录</h2>
                <p class="text-gray-500">登录后即可查看您的月卡信息。</p>
            </div>
        `;
    }

    return `
        <div class="max-w-3xl mx-auto animate-fade-in-up">
            <div id="mycard-loading" class="flex items-center justify-center py-12 text-gray-400">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                加载中...
            </div>
            <div id="mycard-content"></div>
        </div>
    `;
}

export function initMyCard() {
    loadMyCardData();
}

async function loadMyCardData() {
    const contentDiv = document.getElementById('mycard-content');
    const loadingDiv = document.getElementById('mycard-loading');
    if (!contentDiv) return;

    try {
        const response = await api.getUserCards();
        if (response.status === 'success') {
            loadingDiv.classList.add('hidden');
            renderMyCardContent(contentDiv, response.data);
        } else {
            loadingDiv.classList.add('hidden');
            contentDiv.innerHTML = `<div class="text-center py-12 text-red-500">${response.message || '加载失败'}</div>`;
        }
    } catch (error) {
        loadingDiv.classList.add('hidden');
        contentDiv.innerHTML = `<div class="text-center py-12 text-red-500">网络错误</div>`;
    }
}

function renderMyCardContent(container, data) {
    const user = data.user;
    const cards = data.cards;
    const expiresAt = user.monthly_card_expires_at;
    const isActive = expiresAt && new Date(expiresAt) > new Date();

    let statusHtml = '';
    if (isActive) {
        const remaining = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
        statusHtml = `
            <div class="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-xl mb-6">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="flex items-center mb-2">
                            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                            <span class="font-bold text-lg">月卡生效中</span>
                        </div>
                        <p class="text-yellow-100 text-sm">到期时间：${new Date(expiresAt).toLocaleString('zh-CN')}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-3xl font-extrabold">${remaining}</div>
                        <div class="text-yellow-100 text-xs">天剩余</div>
                    </div>
                </div>
                <div class="mt-4 bg-white/20 rounded-full h-2">
                    <div class="bg-white rounded-full h-2 transition-all" style="width: ${Math.min(100, (remaining / 30) * 100)}%"></div>
                </div>
            </div>
        `;
    } else {
        statusHtml = `
            <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl p-6 mb-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div class="flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span class="font-bold text-lg">月卡未激活</span>
                </div>
                <p class="text-center text-gray-400 dark:text-gray-500 text-sm mt-2">${expiresAt ? '月卡已于 ' + new Date(expiresAt).toLocaleString('zh-CN') + ' 过期' : '您尚未激活月卡'}</p>
            </div>
        `;
    }

    const typeLabel = (type) => type === 'monthly' ? '月卡' : '仙玉卡';
    const typeBadge = (type) => {
        const map = {
            monthly: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            xianyu: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        };
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${map[type]}">${typeLabel(type)}</span>`;
    };

    let historyHtml = '';
    if (cards.length > 0) {
        historyHtml = `
            <div class="bg-white dark:bg-gray-800 ring-1 ring-gray-900/5 rounded-2xl shadow-xl overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white">使用记录</h3>
                </div>
                <div class="divide-y divide-gray-100 dark:divide-gray-700">
                    ${cards.map(card => `
                        <div class="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div class="flex items-center space-x-3">
                                ${typeBadge(card.type)}
                                <span class="font-mono text-sm text-gray-700 dark:text-gray-300">${card.card_no}</span>
                            </div>
                            <span class="text-xs text-gray-500 dark:text-gray-400">${new Date(card.used_at).toLocaleString('zh-CN')}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        historyHtml = `
            <div class="bg-white dark:bg-gray-800 ring-1 ring-gray-900/5 rounded-2xl shadow-xl p-8 text-center">
                <svg class="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <p class="text-gray-400 dark:text-gray-500">暂无使用记录</p>
            </div>
        `;
    }

    const xianyuHtml = `
        <div class="bg-white dark:bg-gray-800 ring-1 ring-gray-900/5 rounded-2xl p-6 shadow-xl mb-6">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-3">
                        <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">仙玉余额</p>
                        <p class="text-2xl font-extrabold text-gray-900 dark:text-white">${user.xianyu_balance}</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = `
        ${statusHtml}
        ${xianyuHtml}
        ${historyHtml}
    `;
}
