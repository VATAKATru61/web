// Telegram Web App Mobile Integration
class TelegramMobileApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        this.isAndroid = /Android/.test(navigator.userAgent);
        this.isMobile = this.isIOS || this.isAndroid;
        this.init();
    }
    
    init() {
        if (this.tg) {
            this.initTelegramWebApp();
        }
        this.initMobileOptimizations();
        this.initTouchHandlers();
        this.initViewportHandlers();
        this.initSwipeGestures();
        this.initMobileNavigation();
        this.initMobileTable();
        this.initMobileForms();
        this.initNotifications();
    }
    
    // Telegram Web App initialization
    initTelegramWebApp() {
        this.tg.ready();
        this.tg.expand();
        this.tg.setHeaderColor('#2563eb');
        this.tg.setBackgroundColor('#ffffff');
        this.tg.MainButton.setParams({ text: 'Сохранить', color: '#2563eb', text_color: '#ffffff' });
        this.tg.BackButton.onClick(() => { this.handleBackButton(); });
        this.tg.onEvent('viewportChanged', () => { this.handleViewportChange(); });
        this.tg.onEvent('themeChanged', () => { this.handleThemeChange(); });
        this.applyTelegramTheme();
    }
    
    applyTelegramTheme() {
        if (!this.tg?.themeParams) return;
        const theme = this.tg.themeParams;
        const root = document.documentElement;
        if (theme.bg_color) root.style.setProperty('--bg-primary', theme.bg_color);
        if (theme.secondary_bg_color) root.style.setProperty('--bg-secondary', theme.secondary_bg_color);
        if (theme.text_color) root.style.setProperty('--text-primary', theme.text_color);
        if (theme.hint_color) root.style.setProperty('--text-muted', theme.hint_color);
        if (theme.link_color) root.style.setProperty('--primary-color', theme.link_color);
        if (theme.button_color) root.style.setProperty('--tg-theme-button-color', theme.button_color);
        if (theme.button_text_color) root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
    }
    
    handleBackButton() {
        const modal = document.querySelector('.modal.show');
        if (modal) { this.closeModal(modal); return; }
        const sidebar = document.querySelector('.sidebar.open');
        if (sidebar) { sidebar.classList.remove('open'); return; }
        if (window.history.length > 1) window.history.back();
    }
    
    handleViewportChange() {
        if (!this.tg) return;
        const viewportHeight = this.tg.viewportStableHeight || this.tg.viewportHeight;
        document.documentElement.style.setProperty('--tg-viewport-height', `${viewportHeight}px`);
        const mainContent = document.querySelector('.main-content');
        if (mainContent) mainContent.style.minHeight = `${viewportHeight}px`;
    }
    
    handleThemeChange() { this.applyTelegramTheme(); }
    
    initMobileOptimizations() {
        this.preventZoomOnInputFocus();
        this.optimizeTouchInteractions();
        this.handleKeyboardVisibility();
        this.preventOverscroll();
    }
    
    preventZoomOnInputFocus() {
        if (!this.isIOS) return;
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => { input.addEventListener('focus', () => { input.style.fontSize = '16px'; }); });
    }
    
    optimizeTouchInteractions() {
        if (this.isIOS) document.addEventListener('touchstart', () => {}, { passive: true });
        const buttons = document.querySelectorAll('.btn, .nav-link, .mobile-card');
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => { button.classList.add('touch-active'); }, { passive: true });
            button.addEventListener('touchend', () => { setTimeout(() => button.classList.remove('touch-active'), 150); }, { passive: true });
        });
    }
    
    handleKeyboardVisibility() {
        let initialViewportHeight = window.innerHeight;
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;
            if (heightDifference > 150) {
                document.body.classList.add('keyboard-visible');
                this.adjustForKeyboard(heightDifference);
            } else {
                document.body.classList.remove('keyboard-visible');
                this.removeKeyboardAdjustments();
            }
        });
    }
    
    adjustForKeyboard() {}
    removeKeyboardAdjustments() {}
    preventOverscroll() { document.body.style.overscrollBehavior = 'none'; }
    initTouchHandlers() {}
    initViewportHandlers() {}
    initSwipeGestures() {}
    
    // Mobile navigation
    initMobileNavigation() { this.initSidebarToggle(); this.initBottomNavigation(); }
    
    initSidebarToggle() {
        const toggleBtn = document.querySelector('.mobile-menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        if (!toggleBtn || !sidebar) return;
        // Avoid duplicate handlers if base already binds
        if (!window.__BASE_HANDLES_MENU__) {
            const toggle = (e) => { e.preventDefault(); e.stopPropagation(); sidebar.classList.toggle('open'); };
            toggleBtn.addEventListener('pointerup', toggle, { passive: false });
        }
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('open');
                this.hideBackButton();
            }
        });
    }
    
    initBottomNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) sidebar.classList.remove('open');
            });
        });
    }
    
    // Tables
    initMobileTable() { this.initMobileCardActions(); this.initMobileSearch(); this.initMobileSort(); this.initMobilePagination(); }
    initMobileCardActions() {
        const cards = document.querySelectorAll('.mobile-card');
        cards.forEach(card => { this.initCardSwipe(card); this.initCardSelection(card); });
    }
    initCardSwipe(card) {
        let startX = 0; let isDragging = false;
        card.addEventListener('touchstart', (e) => { if (!card.classList.contains('swipeable')) return; startX = e.touches[0].clientX; isDragging = true; }, { passive: true });
        card.addEventListener('touchmove', (e) => { if (!isDragging) return; const deltaX = e.touches[0].clientX - startX; if (deltaX < -50) card.classList.add('swiped'); else card.classList.remove('swiped'); }, { passive: true });
        card.addEventListener('touchend', () => { isDragging = false; }, { passive: true });
    }
    initCardSelection(card) {
        const checkbox = card.querySelector('.mobile-card-checkbox'); if (!checkbox) return;
        card.addEventListener('click', (e) => { if (e.target.closest('.mobile-card-actions')) return; checkbox.checked = !checkbox.checked; card.classList.toggle('selected', checkbox.checked); this.updateBulkActions(); });
    }
    initMobileSearch() {
        const searchInput = document.querySelector('.search-input'); if (!searchInput) return;
        let t; searchInput.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { this.performSearch(searchInput.value); }, 300); });
    }
    initMobileSort() {
        const sortButtons = document.querySelectorAll('.mobile-sort-btn');
        sortButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sortBy = button.getAttribute('data-sort');
                const isAsc = button.classList.contains('asc');
                sortButtons.forEach(b => b.classList.remove('active', 'asc', 'desc'));
                button.classList.add('active', isAsc ? 'desc' : 'asc');
                this.sortTable(sortBy, !isAsc);
            });
        });
    }
    initMobilePagination() {
        const paginationButtons = document.querySelectorAll('.pagination-btn');
        paginationButtons.forEach(button => { button.addEventListener('click', () => { const page = button.textContent; if (page && !isNaN(page)) this.loadPage(parseInt(page)); }); });
    }
    
    // Forms
    initMobileForms() { this.initFormValidation(); this.initFormSubmission(); this.initFormStepper(); }
    initFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('.form-control');
            inputs.forEach(input => {
                input.addEventListener('blur', () => { this.validateField(input); });
                input.addEventListener('input', () => { if (input.classList.contains('is-invalid')) this.validateField(input); });
            });
        });
    }
    initFormSubmission() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => { form.addEventListener('submit', (e) => { e.preventDefault(); if (this.validateForm(form)) { this.submitForm(form); } }); });
    }
    initFormStepper() {
        const steppers = document.querySelectorAll('.form-steps');
        steppers.forEach(stepper => {
            const steps = stepper.querySelectorAll('.form-step'); let currentStep = 0;
            steps.forEach((step, index) => { step.addEventListener('click', () => { if (index <= currentStep + 1) { this.navigateToStep(index); } }); });
        });
    }
    
    // Notifications
    initNotifications() { this.initToastNotifications(); this.initPushNotifications(); }
    initToastNotifications() { /* handled by global showToast */ }
    initPushNotifications() { if ('serviceWorker' in navigator && 'PushManager' in window) { this.registerServiceWorker(); } }
    
    // Utils
    showToast(message, type = 'info') { if (typeof showToast === 'function') showToast(message, type); }
    showMainButton(text, callback) { if (this.tg) { this.tg.MainButton.setParams({ text }); this.tg.MainButton.show(); this.tg.MainButton.onClick(callback); } }
    hideMainButton() { if (this.tg) this.tg.MainButton.hide(); }
    showBackButton() { if (this.tg) this.tg.BackButton.show(); }
    hideBackButton() { if (this.tg) this.tg.BackButton.hide(); }
    hapticFeedback(type = 'light') {
        if (this.tg) { this.tg.HapticFeedback.impactOccurred(type); }
        else if (navigator.vibrate) { const patterns = { light: 10, medium: 20, heavy: 30 }; navigator.vibrate(patterns[type] || 10); }
    }
    refresh() { location.reload(); }
    recalculateLayout() { const viewportHeight = window.innerHeight; document.documentElement.style.setProperty('--viewport-height', `${viewportHeight}px`); }
    onPageHide() {}
    onPageShow() {}
    closeModal(modal) { modal.classList.remove('show'); modal.style.display = 'none'; }
    navigateToPage(href) { window.location.href = href; }
    expandCard(card) { card.classList.toggle('expanded'); }
    updateBulkActions() { const selected = document.querySelectorAll('.mobile-card.selected').length; const bulkActions = document.querySelector('.bulk-actions'); if (bulkActions) bulkActions.classList.toggle('visible', selected > 0); }
    performSearch(query) {}
    sortTable(sortBy, ascending) {}
    loadPage(page) {}
    validateField(field) { const value = field.value.trim(); const isValid = value.length > 0; field.classList.toggle('is-invalid', !isValid); field.classList.toggle('is-valid', isValid); return isValid; }
    validateForm(form) { const inputs = form.querySelectorAll('.form-control[required]'); let isValid = true; inputs.forEach(i => { if (!this.validateField(i)) isValid = false; }); return isValid; }
    submitForm(form) { const formData = new FormData(form); this.showMainButton('Загрузка...', () => {}); setTimeout(() => { this.hideMainButton(); this.showToast('Форма отправлена успешно!', 'success'); }, 1000); }
    navigateToStep(stepIndex) {}
    registerServiceWorker() { navigator.serviceWorker.register('/sw.js').catch(() => {}); }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => { window.telegramMobileApp = new TelegramMobileApp(); });

// Export for use in other scripts
window.TelegramMobileApp = TelegramMobileApp;