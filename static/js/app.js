// FAST VPN Web Application JavaScript
// Initialize application

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupModals();
    setupTooltips();
    setupKeyboardShortcuts();
    checkConnectionStatus();
}

// Modal Management
function setupModals() {
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal[style*="flex"], .modal[style*="block"]');
            openModals.forEach(modal => { modal.style.display = 'none'; });
        }
    });
}

// Show/Hide Loading Overlay
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

// Toast Notifications
function showToast(message, type = 'info', duration = 5000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconMap = { success: 'check', error: 'times', warning: 'exclamation-triangle', info: 'info-circle' };

    toast.innerHTML = `
        <div class="toast-content">
            <i class="toast-icon fas fa-${iconMap[type] || 'info-circle'}"></i>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => { if (toast.parentElement) toast.remove(); }, duration);

    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';

    setTimeout(() => { toast.style.transform = 'translateX(0)'; toast.style.opacity = '1'; }, 50);
}

// Form Validation
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        const value = input.value.trim();
        if (!value) {
            input.classList.add('error');
            isValid = false;
            let errorElement = input.parentElement.querySelector('.form-error');
            if (!errorElement) {
                errorElement = document.createElement('span');
                errorElement.className = 'form-error';
                input.parentElement.appendChild(errorElement);
            }
            errorElement.textContent = 'Это поле обязательно';
        } else {
            input.classList.remove('error');
            const errorElement = input.parentElement.querySelector('.form-error');
            if (errorElement) errorElement.remove();
        }
    });

    return isValid;
}

// Setup tooltips
function setupTooltips() {
    const tooltipElements = document.querySelectorAll('[title]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('title');
            this.setAttribute('data-title', this.getAttribute('title'));
            this.removeAttribute('title');
            document.body.appendChild(tooltip);
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
            requestAnimationFrame(() => tooltip.classList.add('show'));
        });
        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) tooltip.remove();
            if (this.getAttribute('data-title')) {
                this.setAttribute('title', this.getAttribute('data-title'));
                this.removeAttribute('data-title');
            }
        });
    });
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === '/') {
            event.preventDefault();
            const searchInput = document.querySelector('.search-input, input[type="search"]');
            if (searchInput) searchInput.focus();
        }
        if (event.ctrlKey && event.key.toLowerCase() === 'n') {
            event.preventDefault();
            const createButton = document.querySelector('[onclick*="openCreateModal"], [onclick*="create"]');
            if (createButton) createButton.click();
        }
    });
}

// Connection status checker
function checkConnectionStatus() {
    let isOnline = navigator.onLine;
    function updateConnectionStatus() {
        if (navigator.onLine && !isOnline) {
            showToast('Соединение восстановлено', 'success');
            isOnline = true;
        } else if (!navigator.onLine && isOnline) {
            showToast('Соединение потеряно', 'warning');
            isOnline = false;
        }
    }
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
}

// Confirm Dialog
function confirmDialog(message, onConfirm, onCancel = null) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Подтверждение</h2>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger" id="confirmBtn">
                    <i class="fas fa-check"></i>
                    Да
                </button>
                <button class="btn btn-secondary" id="cancelBtn">
                    <i class="fas fa-times"></i>
                    Отмена
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const confirmBtn = modal.querySelector('#confirmBtn');
    const cancelBtn = modal.querySelector('#cancelBtn');

    confirmBtn.addEventListener('click', function() {
        modal.remove();
        if (onConfirm) onConfirm();
    });

    cancelBtn.addEventListener('click', function() {
        modal.remove();
        if (onCancel) onCancel();
    });

    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
            if (onCancel) onCancel();
        }
    });
}

// Format number with spaces
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Format currency
function formatCurrency(amount, currency = '₽') {
    return formatNumber(amount) + ' ' + currency;
}

// Format date
function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Скопировано в буфер обмена', 'success', 2000);
    }).catch(() => {
        showToast('Ошибка копирования', 'error');
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


// Export functions for global use
window.FastVPN = {
    showLoading,
    hideLoading,
    showToast,
    validateForm,
    confirmDialog,
    formatNumber,
    formatCurrency,
    formatDate,
    copyToClipboard,
    debounce
};

// Пример throttle-декоратора для scroll — можно вставить, если понадобятся обработчики скролла
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    }
}

// Tilt effect for elements with .tilt
(function initTilt() {
  const supportsPointer = window.matchMedia('(pointer:fine)').matches;
  if (!supportsPointer) return;
  const tiltElements = () => document.querySelectorAll('.tilt');
  const maxTilt = 6; // degrees
  const perspective = 900;
  function onMove(e) {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * (maxTilt * 2);
    const ry = (0.5 - px) * (maxTilt * 2);
    target.style.transform = `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
  }
  function onLeave(e) { e.currentTarget.style.transform = ''; }
  function bind(el) {
    el.style.willChange = 'transform';
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
  }
  function init() { tiltElements().forEach(bind); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
