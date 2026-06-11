import { api } from '../api.js';
import { Modal } from './modal.js';
import { Toast } from './toast.js';

const modal = new Modal();
const toast = new Toast();

let currentPage = 1;
const pageSize = 20;

export function renderCardList() {
    return `
        <div class="max-w-6xl mx-auto animate-fade-in-up">
            <div class="bg-white dark:bg-gray-800 ring-1 ring-gray-900/5 rounded-2xl p-6 shadow-xl">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">卡密列表</h2>
                    <button id="export-btn" class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-sm rounded-lg shadow-md transform transition hover:-translate-y-0.5">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        导出未使用卡密
                    </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                    <select id="filter-type" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white outline-none text-sm">
                        <option value="">全部类型</option>
                        <option value="monthly">月卡</option>
                        <option value="xianyu">仙玉卡</option>
                    </select>
                    <select id="filter-status" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white outline-none text-sm">
                        <option value="">全部状态</option>
                        <option value="unused">未使用</option>
                        <option value="used">已使用</option>
                        <option value="voided">已作废</option>
                    </select>
                    <input id="filter-date-from" type="date" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white outline-none text-sm" placeholder="开始日期" />
                    <input id="filter-date-to" type="date" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white outline-none text-sm" placeholder="结束日期" />
                    <button id="filter-btn" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm rounded-lg shadow-md transition">
                        筛选
                    </button>
                </div>

                <div id="card-table-container" class="overflow-x-auto">
                    <div class="flex items-center justify-center py-12 text-gray-400">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        加载中...
                    </div>
                </div>

                <div id="pagination-container" class="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"></div>
            </div>
        </div>
    `;
}

export function initCardList() {
    loadCards(1);

    document.getElementById('filter-btn').addEventListener('click', () => {
        currentPage = 1;
        loadCards(1);
    });

    document.getElementById('export-btn').addEventListener('click', handleExport);
}

function getFilterParams() {
    return {
        type: document.getElementById('filter-type').value,
        status: document.getElementById('filter-status').value,
        created_from: document.getElementById('filter-date-from').value,
        created_to: document.getElementById('filter-date-to').value
    };
}

async function loadCards(page) {
    currentPage = page;
    const container = document.getElementById('card-table-container');
    container.innerHTML = `<div class="flex items-center justify-center py-12 text-gray-400">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        加载中...
    </div>`;

    try {
        const filters = getFilterParams();
        const response = await api.getCardList({
            ...filters,
            page,
            page_size: pageSize
        });

        if (response.status === 'success') {
            renderTable(response.data);
            renderPagination(response.pagination);
        } else {
            toast.show(response.message || '加载失败', 'error');
        }
    } catch (error) {
        toast.show('网络错误', 'error');
    }
}

function renderTable(cards) {
    const container = document.getElementById('card-table-container');

    if (cards.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            <p>暂无卡密数据</p>
        </div>`;
        return;
    }

    const statusBadge = (status) => {
        const map = {
            unused: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            used: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            voided: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        };
        const label = { unused: '未使用', used: '已使用', voided: '已作废' };
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${map[status] || ''}">${label[status] || status}</span>`;
    };

    const typeBadge = (type) => {
        const map = {
            monthly: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            xianyu: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        };
        const label = { monthly: '月卡', xianyu: '仙玉卡' };
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${map[type] || ''}">${label[type] || type}</span>`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '<span class="text-gray-400">-</span>';
        return new Date(dateStr).toLocaleString('zh-CN');
    };

    let html = `<table class="w-full text-sm text-left">
        <thead class="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
            <tr>
                <th class="px-4 py-3 rounded-tl-lg">卡号</th>
                <th class="px-4 py-3">类型</th>
                <th class="px-4 py-3">状态</th>
                <th class="px-4 py-3">生成时间</th>
                <th class="px-4 py-3">使用人</th>
                <th class="px-4 py-3">使用时间</th>
                <th class="px-4 py-3 rounded-tr-lg">操作</th>
            </tr>
        </thead>
        <tbody>`;

    cards.forEach(card => {
        html += `<tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td class="px-4 py-3 font-mono text-sm font-medium">${card.card_no}</td>
            <td class="px-4 py-3">${typeBadge(card.type)}</td>
            <td class="px-4 py-3">${statusBadge(card.status)}</td>
            <td class="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">${formatDate(card.created_at)}</td>
            <td class="px-4 py-3 text-xs">${card.used_by_username || '<span class="text-gray-400">-</span>'}</td>
            <td class="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">${formatDate(card.used_at)}</td>
            <td class="px-4 py-3">
                ${card.status === 'unused' ? `<button onclick="voidCard(${card.id}, '${card.card_no}')" class="inline-flex items-center px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition">作废</button>` : '<span class="text-gray-400 text-xs">-</span>'}
            </td>
        </tr>`;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderPagination(pagination) {
    const container = document.getElementById('pagination-container');
    const { total, page, total_pages } = pagination;

    if (total_pages <= 1) {
        container.innerHTML = `<span class="text-sm text-gray-500 dark:text-gray-400">共 ${total} 条记录</span><div></div>`;
        return;
    }

    let buttonsHtml = '';

    buttonsHtml += `<button onclick="loadCardPage(${page - 1})" ${page <= 1 ? 'disabled' : ''} class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 ${page <= 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} transition">上一页</button>`;

    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(total_pages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === page;
        buttonsHtml += `<button onclick="loadCardPage(${i})" class="px-3 py-1.5 text-sm rounded-lg ${isActive ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} transition">${i}</button>`;
    }

    buttonsHtml += `<button onclick="loadCardPage(${page + 1})" ${page >= total_pages ? 'disabled' : ''} class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 ${page >= total_pages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} transition">下一页</button>`;

    container.innerHTML = `
        <span class="text-sm text-gray-500 dark:text-gray-400">共 ${total} 条记录</span>
        <div class="flex items-center space-x-2">${buttonsHtml}</div>
    `;
}

window.voidCard = function(id, cardNo) {
    modal.show({
        title: '确认作废',
        message: `确定要作废卡密 ${cardNo} 吗？此操作不可撤销。`,
        onConfirm: () => handleVoid(id)
    });
};

async function handleVoid(id) {
    try {
        const response = await api.voidCard(id);
        if (response.status === 'success') {
            toast.show('卡密已作废', 'success');
            loadCards(currentPage);
        } else {
            toast.show(response.message || '作废失败', 'error');
        }
    } catch (error) {
        toast.show('网络错误', 'error');
    }
}

async function handleExport() {
    try {
        const filters = getFilterParams();
        const response = await api.exportCards(filters.type);

        if (response.status === 'success' && response.data.length > 0) {
            let csv = '\uFEFF卡号,类型,生成时间\n';
            response.data.forEach(card => {
                const typeLabel = card.type === 'monthly' ? '月卡' : '仙玉卡';
                csv += `${card.card_no},${typeLabel},${card.created_at}\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `未使用卡密_${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
            URL.revokeObjectURL(url);

            toast.show(`成功导出 ${response.data.length} 条未使用卡密`, 'success');
        } else if (response.status === 'success' && response.data.length === 0) {
            toast.show('没有未使用的卡密可导出', 'warning');
        } else {
            toast.show(response.message || '导出失败', 'error');
        }
    } catch (error) {
        toast.show('网络错误', 'error');
    }
}

window.loadCardPage = function(page) {
    loadCards(page);
};
