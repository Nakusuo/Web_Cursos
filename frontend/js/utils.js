// Sistema de notificaciones Toast
class ToastNotification {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'info', duration = 3000) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);

        // Inicializar Bootstrap Toast
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: duration
        });

        bsToast.show();

        // Eliminar del DOM después de ocultarse
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });

        return bsToast;
    }

    createToast(message, type) {
        const icons = {
            success: 'bi-check-circle-fill',
            error: 'bi-x-circle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };

        const bgColors = {
            success: 'bg-success',
            error: 'bg-danger',
            warning: 'bg-warning',
            info: 'bg-primary'
        };

        const titles = {
            success: 'Éxito',
            error: 'Error',
            warning: 'Advertencia',
            info: 'Información'
        };

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        toast.innerHTML = `
            <div class="toast-header ${bgColors[type]} text-white">
                <i class="bi ${icons[type]} me-2"></i>
                <strong class="me-auto">${titles[type]}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;

        return toast;
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Crear instancia global
const toast = new ToastNotification();

// Sistema de Loading Overlay
class LoadingOverlay {
    constructor() {
        this.overlay = this.createOverlay();
    }

    createOverlay() {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.style.cssText = `
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 10000;
                justify-content: center;
                align-items: center;
            `;
            overlay.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border text-light" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="text-light mt-3 fw-bold" id="loading-message">Cargando...</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        return overlay;
    }

    show(message = 'Cargando...') {
        const messageEl = document.getElementById('loading-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
        this.overlay.style.display = 'flex';
    }

    hide() {
        this.overlay.style.display = 'none';
    }
}

const loading = new LoadingOverlay();

// Sistema de confirmación con modales
class ConfirmDialog {
    show(options = {}) {
        const {
            title = '¿Estás seguro?',
            message = '¿Deseas continuar con esta acción?',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            type = 'warning', // success, warning, danger
            onConfirm = () => {},
            onCancel = () => {}
        } = options;

        const colors = {
            success: 'btn-success',
            warning: 'btn-warning',
            danger: 'btn-danger'
        };

        const icons = {
            success: 'bi-check-circle',
            warning: 'bi-exclamation-triangle',
            danger: 'bi-x-circle'
        };

        // Crear modal
        const modalId = 'confirm-modal-' + Date.now();
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi ${icons[type]} me-2"></i>${title}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${message}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                ${cancelText}
                            </button>
                            <button type="button" class="btn ${colors[type]}" id="confirm-btn-${modalId}">
                                ${confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modalEl = document.getElementById(modalId);
        const modal = new bootstrap.Modal(modalEl);

        // Manejar confirmación
        document.getElementById(`confirm-btn-${modalId}`).addEventListener('click', () => {
            modal.hide();
            onConfirm();
        });

        // Limpiar al cerrar
        modalEl.addEventListener('hidden.bs.modal', () => {
            modalEl.remove();
            onCancel();
        });

        modal.show();
    }

    confirm(message, onConfirm) {
        this.show({ message, onConfirm });
    }

    danger(message, onConfirm) {
        this.show({
            title: '¡Precaución!',
            message,
            type: 'danger',
            confirmText: 'Eliminar',
            onConfirm
        });
    }
}

const confirm = new ConfirmDialog();

// Utilidades de validación de formularios
const FormValidator = {
    email(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    phone(phone) {
        const re = /^\+51\d{9}$/;
        return re.test(phone);
    },

    password(password) {
        return password.length >= 8 && 
               /[a-z]/.test(password) && 
               /[A-Z]/.test(password) && 
               /[0-9]/.test(password);
    },

    required(value) {
        return value && value.trim().length > 0;
    },

    minLength(value, min) {
        return value && value.length >= min;
    },

    maxLength(value, max) {
        return value && value.length <= max;
    }
};

// Utilidad de formato
const Formatter = {
    currency(amount) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount);
    },

    date(date) {
        return new Intl.DateTimeFormat('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    },

    dateTime(date) {
        return new Intl.DateTimeFormat('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },

    timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        const intervals = {
            año: 31536000,
            mes: 2592000,
            día: 86400,
            hora: 3600,
            minuto: 60
        };

        for (const [name, secondsCount] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsCount);
            if (interval >= 1) {
                return interval === 1 
                    ? `hace 1 ${name}` 
                    : `hace ${interval} ${name}${interval > 1 ? 's' : ''}`;
            }
        }

        return 'hace un momento';
    }
};

// Exportar para uso global
window.toast = toast;
window.loading = loading;
window.confirm = confirm;
window.FormValidator = FormValidator;
window.Formatter = Formatter;
