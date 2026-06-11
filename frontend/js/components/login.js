// Login Component Module
import { api } from '../api.js';
import { Toast } from './toast.js';

const toast = new Toast();

export function renderLogin() {
    return `
        <div class="max-w-md mx-auto animate-fade-in-up">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <div class="px-8 pt-8 pb-6">
                    <h2 class="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">欢迎回来</h2>
                    <p class="text-center text-gray-500 dark:text-gray-400 mb-8">请登录或注册以继续</p>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">用户名</label>
                            <input 
                                id="login-username" 
                                type="text" 
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white outline-none transition-all"
                                placeholder="请输入用户名"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">密码</label>
                            <input 
                                id="login-password" 
                                type="password" 
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white outline-none transition-all"
                                placeholder="请输入密码"
                            />
                        </div>
                        
                        <div class="flex space-x-4 pt-4">
                            <button 
                                id="login-btn" 
                                class="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition hover:-translate-y-0.5 active:scale-95"
                            >
                                登录
                            </button>
                            <button 
                                id="register-btn" 
                                class="flex-1 bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 border-2 border-purple-600 dark:border-purple-400 font-bold py-3 px-4 rounded-xl hover:bg-purple-50 dark:hover:bg-gray-600 transition-all active:scale-95"
                            >
                                注册
                            </button>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 px-8 py-4 text-center">
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        安全提示: 请定期修改您的初始密码。
                    </p>
                </div>
            </div>
        </div>
    `;
}

export function initLogin(onLoginSuccess) {
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');

    const handleLogin = async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            toast.show('请输入用户名和密码', 'error');
            return;
        }

        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="animate-pulse">登录中...</span>';

        try {
            const response = await api.login(username, password);
            if (response.status === 'success') {
                toast.show('登录成功', 'success');
                onLoginSuccess(response.data);
            } else {
                toast.show(response.message || '登录失败', 'error');
            }
        } catch (error) {
            toast.show('服务不可用', 'error');
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '登录';
        }
    };

    const handleRegister = async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            toast.show('请输入用户名和密码', 'error');
            return;
        }

        registerBtn.disabled = true;
        const originalText = registerBtn.innerText;
        registerBtn.innerText = '注册中...';

        try {
            const response = await api.register(username, password);
            if (response.status === 'success') {
                toast.show('注册成功，请登录', 'success');
            } else {
                toast.show(response.message || '注册失败', 'error');
            }
        } catch (error) {
            toast.show('服务不可用', 'error');
        } finally {
            registerBtn.disabled = false;
            registerBtn.innerText = originalText;
        }
    };

    loginBtn.addEventListener('click', handleLogin);
    registerBtn.addEventListener('click', handleRegister);
    
    [usernameInput, passwordInput].forEach(el => {
        el.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    });
}
