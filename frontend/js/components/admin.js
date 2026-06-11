import { api } from '../api.js';
import { Modal } from './modal.js';
import { Toast } from './toast.js';
import { renderCardList, initCardList } from './cardList.js';

const modal = new Modal();
const toast = new Toast();

let adminSubTab = 'generate';

export function renderAdmin() {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    if (!user) {
        return `
            <div class="text-center py-20 animate-fade-in-up">
                <h2 class="text-2xl font-bold text-gray-700 dark:text-white mb-4">请先登录</h2>
                <p class="text-gray-500">必须要管理员权限才能访问此页面。</p>
            </div>
        `;
    }

    if (user.role !== 'admin') {
        return `
            <div class="text-center py-20 animate-fade-in-up">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 mb-6">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-700 dark:text-white mb-2">权限不足</h2>
                <p class="text-gray-500">您没有访问此页面的权限。</p>
            </div>
        `;
    }

    return `
        <div class="max-w-6xl mx-auto animate-fade-in-up">
            <div class="flex justify-center mb-6">
                <div class="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-lg inline-flex">
                    <button onclick="switchAdminTab('generate')" id="admin-tab-generate" class="px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${adminSubTab === 'generate' ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}">
                        卡号生成
                    </button>
                    <button onclick="switchAdminTab('list')" id="admin-tab-list" class="px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${adminSubTab === 'list' ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}">
                        卡密列表
                    </button>
                </div>
            </div>

            <div id="admin-content-area">
                ${adminSubTab === 'generate' ? renderGeneratePage() : renderCardList()}
            </div>
        </div>
    `;
}

function renderGeneratePage() {
    return `
        <div class="max-w-xl mx-auto">
            <div class="bg-white dark:bg-gray-800 ring-1 ring-gray-900/5 rounded-2xl p-8 shadow-xl">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">卡号生成</h2>
                    <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">管理员</span>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">卡片类型</label>
                        <select id="card-type" class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white outline-none">
                            <option value="monthly">月卡 (Monthly)</option>
                            <option value="xianyu">仙玉 (Xianyu)</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">生成数量</label>
                        <input id="card-count" type="number" min="1" max="100" value="5" class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white outline-none" />
                    </div>
                    
                    <button 
                        id="generate-btn" 
                        class="w-full bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition hover:-translate-y-0.5"
                    >
                        生成卡号
                    </button>
                </div>

                <div id="result-area" class="hidden mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="font-bold text-gray-700 dark:text-gray-200">生成结果:</h3>
                        <button id="copy-btn" class="text-xs text-blue-500 hover:text-blue-600">复制全部</button>
                    </div>
                    <textarea id="result-text" readonly class="w-full h-40 p-3 text-sm font-mono border rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-gray-300 focus:outline-none"></textarea>
                    <p class="text-xs text-gray-500 mt-2 flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        请复制以上卡号并保存到安全的地方。
                    </p>
                </div>
            </div>
        </div>
    `;
}

export function initAdmin() {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    if (!user || user.role !== 'admin') return;

    if (adminSubTab === 'generate') {
        initGeneratePage();
    } else {
        initCardList();
    }
}

window.switchAdminTab = function(tab) {
    adminSubTab = tab;
    const contentArea = document.getElementById('admin-content-area');

    if (tab === 'generate') {
        contentArea.innerHTML = renderGeneratePage();
        initGeneratePage();
    } else {
        contentArea.innerHTML = renderCardList();
        initCardList();
    }

    document.getElementById('admin-tab-generate').className = `px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${tab === 'generate' ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`;
    document.getElementById('admin-tab-list').className = `px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${tab === 'list' ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`;
};

function initGeneratePage() {
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const resultText = document.getElementById('result-text');

    generateBtn.addEventListener('click', () => {
        const type = document.getElementById('card-type').value;
        const count = parseInt(document.getElementById('card-count').value);
        
        modal.show({
            title: '确认生成',
            message: `确定要生成 ${count} 张 ${type === 'monthly' ? '月卡' : '仙玉'} 吗？`,
            onConfirm: () => handleGenerate(type, count)
        });
    });

    copyBtn.addEventListener('click', () => {
        if (!resultText.value) return;
        navigator.clipboard.writeText(resultText.value).then(() => {
            toast.show('已复制到剪贴板', 'success');
        });
    });
}

async function handleGenerate(type, count) {
    try {
        const response = await api.generateCards(type, count);
        
        if (response.status === 'success') {
            const resultArea = document.getElementById('result-area');
            const resultText = document.getElementById('result-text');
            
            resultText.value = response.cards.join('\n');
            resultArea.classList.remove('hidden');
            
            toast.show(`成功生成 ${response.cards.length} 张卡号`, 'success');
        } else {
            toast.show('生成失败: ' + response.message, 'error');
        }
    } catch (error) {
        toast.show('请求失败,请检查网络', 'error');
    }
}
