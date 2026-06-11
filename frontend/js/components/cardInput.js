// CardInput Page Module
import { api } from '../api.js';
import { Toast } from './toast.js';

const toast = new Toast();

export function renderCardInput() {
    return `
        <div class="max-w-xl mx-auto animate-fade-in-up">
            <div class="relative group">
                <div class="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div class="relative bg-white dark:bg-gray-800 ring-1 ring-gray-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
                    <div class="p-8 w-full">
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">卡密兑换</h2>
                        <p class="text-gray-500 dark:text-gray-400 mb-6 text-sm">请输入您的卡号以领取月卡或仙玉奖励。</p>
                        
                        <div class="space-y-4">
                            <input 
                                id="card-input" 
                                type="text" 
                                placeholder="例如: M-8888-AAAA" 
                                class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white transition-all"
                            />
                            
                            <button 
                                id="redeem-btn" 
                                class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition hover:-translate-y-0.5"
                            >
                                立即兑换
                            </button>
                        </div>

                        <div id="redeem-message" class="hidden mt-4 p-3 rounded-md text-sm animate-fade-in-up">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function initCardInput() {
    const input = document.getElementById('card-input');
    const button = document.getElementById('redeem-btn');

    const handleRedeem = async () => {
        const cardNo = input.value.trim();
        if (!cardNo) {
            toast.show('请输入卡号', 'error');
            return;
        }

        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            toast.show('请先登录', 'error');
            return;
        }

        button.disabled = true;
        button.innerHTML = '<span class="animate-pulse">处理中...</span>';

        try {
            const response = await api.useCard(cardNo);
            
            if (response.status === 'success') {
                toast.show(`${response.message}${response.reward}`, 'success');
                input.value = '';
                
                const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = {
                    ...existingUser,
                    ...response.user,
                    token: response.user.token || existingUser.token
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                if (window.currentUser !== undefined) {
                    window.currentUser = updatedUser;
                }
                
                if (window.updateUserInfo) window.updateUserInfo();
                if (window.switchTab) window.switchTab('redeem');
            } else {
                toast.show(response.message || '兑换失败', 'error');
            }
        } catch (error) {
            toast.show('网络错误或服务不可用', 'error');
        } finally {
            button.disabled = false;
            button.innerHTML = '立即兑换';
        }
    };

    button.addEventListener('click', handleRedeem);
    input.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleRedeem();
    });
}
