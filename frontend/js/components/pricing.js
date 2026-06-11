// Pricing Page Module
import { Modal } from './modal.js';

const modal = new Modal();

export function renderPricing() {
    return `
        <div class="animate-fade-in-up">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
                <!-- Monthly Card -->
                <div class="relative group cursor-pointer hover:z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                    <div class="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">热销</div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">尊享月卡</h3>
                    <div class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
                        ¥30.00
                    </div>
                    <ul class="text-gray-600 dark:text-gray-300 text-sm space-y-2 mb-6">
                        <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> 30 天特权</li>
                        <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> 每日领取奖励</li>
                        <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> 专属 VIP 客服</li>
                    </ul>
                    <button onclick="showPurchaseNotice()" class="block w-full text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition">
                        立即购买
                    </button>
                </div>

                <!-- Xianyu Pack -->
                <div class="relative group cursor-pointer hover:z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">1000 仙玉包</h3>
                    <div class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 mb-4">
                        ¥6.00
                    </div>
                    <ul class="text-gray-600 dark:text-gray-300 text-sm space-y-2 mb-6">
                        <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> 秒速到账</li>
                        <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> 购买游戏道具</li>
                        <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> 永久有效</li>
                    </ul>
                    <button onclick="showPurchaseNotice()" class="block w-full text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition">
                        立即购买
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function initPricing() {
    window.showPurchaseNotice = () => {
        modal.show({
            title: '温馨提示',
            message: '请接入发卡网链接 再使用',
            onConfirm: () => {},
            onCancel: () => {}
        });
    };
}
