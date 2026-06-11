import { renderCardInput, initCardInput } from './components/cardInput.js?v=2';
import { renderPricing, initPricing } from './components/pricing.js?v=2';
import { renderAdmin, initAdmin } from './components/admin.js?v=2';
import { renderLogin, initLogin } from './components/login.js?v=2';
import { renderMyCard, initMyCard } from './components/myCard.js?v=2';

let currentTab = 'redeem';
let currentUser = null;

window.currentUser = currentUser;

const storedUser = localStorage.getItem('user');
if (storedUser) {
    currentUser = JSON.parse(storedUser);
    window.currentUser = currentUser;
}

window.switchTab = function(tab) {
    currentUser = window.currentUser;
    if (!currentUser) {
        renderLoginView();
        return;
    }

    currentTab = tab;
    
    const tabs = ['redeem', 'buy', 'mycard', 'admin'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        if (!btn) return;
        if (t === tab) {
            if (t === 'buy') {
                btn.className = 'px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md';
            } else if (t === 'admin') {
                btn.className = 'px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-md';
            } else if (t === 'mycard') {
                btn.className = 'px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md';
            } else {
                btn.className = 'px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md';
            }
        } else {
            btn.className = 'px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200';
        }
    });
    
    const contentArea = document.getElementById('content-area');
    
    switch(tab) {
        case 'redeem':
            contentArea.innerHTML = renderCardInput();
            initCardInput();
            break;
        case 'buy':
            contentArea.innerHTML = renderPricing();
            initPricing();
            break;
        case 'mycard':
            contentArea.innerHTML = renderMyCard();
            initMyCard();
            break;
        case 'admin':
            contentArea.innerHTML = renderAdmin();
            initAdmin();
            break;
    }
};

function renderLoginView() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = renderLogin();
    initLogin((user) => {
        currentUser = user;
        window.currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
        updateUserInfo();
        switchTab('redeem');
    });
}

function updateUserInfo() {
    currentUser = window.currentUser;
    const userInfo = document.getElementById('user-info');
    if (currentUser) {
        userInfo.innerHTML = `
            <div class="flex items-center space-x-4 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    <i class="fas fa-user-circle mr-1"></i> ${currentUser.username}
                </span>
                <span class="text-xs text-purple-600 dark:text-purple-400 font-bold bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
                    仙玉: ${currentUser.xianyu_balance}
                </span>
                <button onclick="logout()" class="text-xs text-red-500 hover:text-red-600 font-bold ml-2">退出</button>
            </div>
        `;
    } else {
        userInfo.innerHTML = '';
    }
}

window.updateUserInfo = updateUserInfo;

window.logout = function() {
    currentUser = null;
    window.currentUser = null;
    localStorage.removeItem('user');
    updateUserInfo();
    switchTab('redeem');
};

document.addEventListener('DOMContentLoaded', () => {
    updateUserInfo();
    switchTab('redeem');
});
