// Modal Component
export class Modal {
    constructor() {
        this.isVisible = false;
        this.onConfirm = null;
        this.onCancel = null;
    }

    show({ title = '提示', message, onConfirm, onCancel }) {
        this.isVisible = true;
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;

        const modalHTML = `
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm fade-in" id="modal-overlay">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 transform transition-all scale-100">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${title}</h3>
                    <p class="text-gray-600 dark:text-gray-300 mb-6">${message}</p>
                    
                    <div class="flex justify-end space-x-3">
                        <button 
                            onclick="window.modalInstance.cancel()" 
                            class="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition"
                        >
                            取消
                        </button>
                        <button 
                            onclick="window.modalInstance.confirm()" 
                            class="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition"
                        >
                            确认
                        </button>
                    </div>
                </div>
            </div>
        `;

        const container = document.getElementById('modal-container');
        container.innerHTML = modalHTML;
        window.modalInstance = this;
    }

    confirm() {
        if (this.onConfirm) this.onConfirm();
        this.hide();
    }

    cancel() {
        if (this.onCancel) this.onCancel();
        this.hide();
    }

    hide() {
        this.isVisible = false;
        const container = document.getElementById('modal-container');
        container.innerHTML = '';
    }
}
