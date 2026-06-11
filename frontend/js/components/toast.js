// Toast Component
export class Toast {
    show(message, type = 'info', duration = 3000) {
        const typeClasses = {
            success: 'border-green-500 text-green-600',
            error: 'border-red-500 text-red-600',
            warning: 'border-yellow-500 text-yellow-600',
            info: 'border-blue-500 text-blue-600'
        };

        const toastHTML = `
            <div class="toast-item flex items-center p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-xl dark:text-gray-400 dark:bg-gray-800 border-l-4 ${typeClasses[type] || typeClasses.info}" style="animation: slideIn 0.3s ease-out">
                <div class="ml-3 text-sm font-normal">${message}</div>
                <button onclick="this.parentElement.remove()" class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700">
                    <span class="sr-only">Close</span>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                </button>
            </div>
        `;

        const container = document.getElementById('toast-container');
        const div = document.createElement('div');
        div.innerHTML = toastHTML;
        const toastElement = div.firstElementChild;
        container.appendChild(toastElement);

        if (duration > 0) {
            setTimeout(() => {
                toastElement.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => toastElement.remove(), 300);
            }, duration);
        }
    }
}

// Add slide animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(30px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(30px); }
    }
`;
document.head.appendChild(style);
