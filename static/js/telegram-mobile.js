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
        // Configure Telegram Web App
        this.tg.ready();
        this.tg.expand();
        
        // Set theme colors
        this.tg.setHeaderColor('#2563eb');
        this.tg.setBackgroundColor('#ffffff');
        
        // Configure main button
        this.tg.MainButton.setParams({
            text: 'Сохранить',
            color: '#2563eb',
            text_color: '#ffffff'
        });
        
        // Configure back button
        this.tg.BackButton.onClick(() => {
            this.handleBackButton();
        });
        
        // Handle viewport changes
        this.tg.onEvent('viewportChanged', () => {
            this.handleViewportChange();
        });
        
        // Handle theme changes
        this.tg.onEvent('themeChanged', () => {
            this.handleThemeChange();
        });
        
        // Apply initial theme
        this.applyTelegramTheme();
    }
    
    // Apply Telegram theme to CSS variables
    applyTelegramTheme() {
        if (!this.tg?.themeParams) return;
        
        const theme = this.tg.themeParams;
        const root = document.documentElement;
        
        if (theme.bg_color) {
            root.style.setProperty('--bg-primary', theme.bg_color);
        }
        if (theme.secondary_bg_color) {
            root.style.setProperty('--bg-secondary', theme.secondary_bg_color);
        }
        if (theme.text_color) {
            root.style.setProperty('--text-primary', theme.text_color);
        }
        if (theme.hint_color) {
            root.style.setProperty('--text-muted', theme.hint_color);
        }
        if (theme.link_color) {
            root.style.setProperty('--primary-color', theme.link_color);
        }
        if (theme.button_color) {
            root.style.setProperty('--tg-theme-button-color', theme.button_color);
        }
        if (theme.button_text_color) {
            root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
        }
    }
    
    // Handle back button
    handleBackButton() {
        const modal = document.querySelector('.modal.show');
        if (modal) {
            this.closeModal(modal);
            return;
        }
        
        const sidebar = document.querySelector('.sidebar.open');
        if (sidebar) {
            sidebar.classList.remove('open');
            return;
        }
        
        // Navigate back in history
        if (window.history.length > 1) {
            window.history.back();
        }
    }
    
    // Handle viewport changes
    handleViewportChange() {
        if (!this.tg) return;
        
        const viewportHeight = this.tg.viewportStableHeight || this.tg.viewportHeight;
        document.documentElement.style.setProperty('--tg-viewport-height', `${viewportHeight}px`);
        
        // Update main content height
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.minHeight = `${viewportHeight}px`;
        }
    }
    
    // Handle theme changes
    handleThemeChange() {
        this.applyTelegramTheme();
    }
    
    // Initialize mobile optimizations
    initMobileOptimizations() {
        // Prevent zoom on input focus
        this.preventZoomOnInputFocus();
        
        // Optimize touch interactions
        this.optimizeTouchInteractions();
        
        // Handle keyboard visibility
        this.handleKeyboardVisibility();
        
        // Prevent overscroll
        this.preventOverscroll();
    }
    
    // Prevent zoom on input focus (iOS)
    preventZoomOnInputFocus() {
        if (!this.isIOS) return;
        
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.fontSize = '16px';
            });
        });
    }
    
    // Optimize touch interactions
    optimizeTouchInteractions() {
        // Remove tap delay on iOS
        if (this.isIOS) {
            document.addEventListener('touchstart', () => {}, { passive: true });
        }
        
        // Improve button touch response
        const buttons = document.querySelectorAll('.btn, .nav-link, .mobile-card');
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                button.classList.add('touch-active');
            }, { passive: true });
            
            button.addEventListener('touchend', () => {
                setTimeout(() => {
                    button.classList.remove('touch-active');
                }, 150);
            }, { passive: true });
        });
    }
    
    // Handle keyboard visibility
    handleKeyboardVisibility() {
        let initialViewportHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;
            
            if (heightDifference > 150) {
                // Keyboard is visible
                document.body.classList.add('keyboard-visible');
                this.adjustForKeyboard(heightDifference);
            } else {
                // Keyboard is hidden
                document.body.classList.remove('keyboard-visible');
                this.removeKeyboardAdjustments();
            }
        });
    }
    
    // Adjust layout for keyboard
    adjustForKeyboard(keyboardHeight) {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName.match(/INPUT|TEXTAREA|SELECT/)) {
            const rect = activeElement.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            if (rect.bottom > viewportHeight - keyboardHeight) {
                const scrollOffset = rect.bottom - (viewportHeight - keyboardHeight) + 20;
                window.scrollBy(0, scrollOffset);
            }
        }
    }
    
    // Remove keyboard adjustments
    removeKeyboardAdjustments() {
        // Layout adjustments are handled by CSS
    }
    
    // Prevent overscroll
    preventOverscroll() {
        document.body.style.overscrollBehavior = 'none';
        
        // Prevent pull-to-refresh
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) return;
            
            const touch = e.touches[0];
            const startY = touch.pageY;
            
            if (startY <= 50 && window.scrollY === 0) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    // Initialize touch handlers
    initTouchHandlers() {
        this.initPullToRefresh();
        this.initLongPress();
        this.initDoubleTap();
    }
    
    // Initialize pull-to-refresh
    initPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let isPulling = false;
        
        const refreshThreshold = 100;
        const refreshIndicator = this.createRefreshIndicator();
        
        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].pageY;
                isPulling = true;
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;
            
            currentY = e.touches[0].pageY;
            const pullDistance = currentY - startY;
            
            if (pullDistance > 0) {
                const pullRatio = Math.min(pullDistance / refreshThreshold, 1);
                refreshIndicator.style.transform = `translateY(${pullDistance * 0.5}px)`;
                refreshIndicator.style.opacity = pullRatio;
                
                if (pullDistance > refreshThreshold) {
                    refreshIndicator.classList.add('ready');
                } else {
                    refreshIndicator.classList.remove('ready');
                }
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            if (!isPulling) return;
            
            const pullDistance = currentY - startY;
            isPulling = false;
            
            if (pullDistance > refreshThreshold) {
                this.refresh();
            }
            
            refreshIndicator.style.transform = '';
            refreshIndicator.style.opacity = '';
            refreshIndicator.classList.remove('ready');
        }, { passive: true });
    }
    
    // Create refresh indicator
    createRefreshIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'pull-refresh-indicator';
        indicator.innerHTML = '<i class="fas fa-sync-alt"></i>';
        document.body.appendChild(indicator);
        return indicator;
    }
    
    // Initialize long press
    initLongPress() {
        let pressTimer;
        
        document.addEventListener('touchstart', (e) => {
            const target = e.target.closest('.mobile-card, .nav-link, .btn');
            if (!target) return;
            
            pressTimer = setTimeout(() => {
                this.handleLongPress(target, e);
            }, 500);
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        }, { passive: true });
        
        document.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        }, { passive: true });
    }
    
    // Handle long press
    handleLongPress(element, event) {
        if (element.classList.contains('mobile-card')) {
            this.showCardContextMenu(element, event);
        } else if (element.classList.contains('nav-link')) {
            this.showNavContextMenu(element, event);
        }
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
    
    // Initialize double tap
    initDoubleTap() {
        let lastTap = 0;
        
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 500 && tapLength > 0) {
                this.handleDoubleTap(e);
            }
            
            lastTap = currentTime;
        }, { passive: true });
    }
    
    // Handle double tap
    handleDoubleTap(event) {
        const target = event.target.closest('.mobile-card');
        if (target) {
            this.expandCard(target);
        }
    }
    
    // Initialize viewport handlers
    initViewportHandlers() {
        this.handleOrientationChange();
        this.handleVisibilityChange();
    }
    
    // Handle orientation change
    handleOrientationChange() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.recalculateLayout();
            }, 100);
        });
    }
    
    // Handle visibility change
    handleVisibilityChange() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPageHide();
            } else {
                this.onPageShow();
            }
        });
    }
    
    // Initialize swipe gestures
    initSwipeGestures() {
        this.initHorizontalSwipe();
        this.initVerticalSwipe();
    }
    
    // Initialize horizontal swipe
    initHorizontalSwipe() {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isHorizontalSwipe = false;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX;
            startY = e.touches[0].pageY;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            currentX = e.touches[0].pageX;
            currentY = e.touches[0].pageY;
            
            const deltaX = Math.abs(currentX - startX);
            const deltaY = Math.abs(currentY - startY);
            
            if (deltaX > deltaY && deltaX > 20) {
                isHorizontalSwipe = true;
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            if (isHorizontalSwipe) {
                const deltaX = currentX - startX;
                
                if (deltaX > 50) {
                    this.handleSwipeRight();
                } else if (deltaX < -50) {
                    this.handleSwipeLeft();
                }
            }
            
            isHorizontalSwipe = false;
        }, { passive: true });
    }
    
    // Initialize vertical swipe
    initVerticalSwipe() {
        let startY = 0;
        let currentY = 0;
        let isVerticalSwipe = false;
        
        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].pageY;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            currentY = e.touches[0].pageY;
            
            const deltaY = Math.abs(currentY - startY);
            
            if (deltaY > 30) {
                isVerticalSwipe = true;
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            if (isVerticalSwipe) {
                const deltaY = currentY - startY;
                
                if (deltaY > 100) {
                    this.handleSwipeDown();
                } else if (deltaY < -100) {
                    this.handleSwipeUp();
                }
            }
            
            isVerticalSwipe = false;
        }, { passive: true });
    }
    
    // Handle swipe gestures
    handleSwipeRight() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && !sidebar.classList.contains('open')) {
            sidebar.classList.add('open');
        }
    }
    
    handleSwipeLeft() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    }
    
    handleSwipeDown() {
        const modal = document.querySelector('.modal.show');
        if (modal) {
            this.closeModal(modal);
        }
    }
    
    handleSwipeUp() {
        // Handle swipe up gesture
    }
    
    // Initialize mobile navigation
    initMobileNavigation() {
        this.initSidebarToggle();
        this.initBottomNavigation();
    }
    
    // Initialize sidebar toggle
    initSidebarToggle() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (toggle && sidebar) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                
                if (sidebar.classList.contains('open')) {
                    this.showBackButton();
                } else {
                    this.hideBackButton();
                }
            });
        }
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
                sidebar.classList.remove('open');
                this.hideBackButton();
            }
        });
    }
    
    // Initialize bottom navigation
    initBottomNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // НЕ блокируем переход по ссылке!
                
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Close sidebar
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    sidebar.classList.remove('open');
                }
                
                // Позволяем браузеру обработать переход по ссылке
            });
        });
    }
    
    // Initialize mobile table
    initMobileTable() {
        this.initMobileCardActions();
        this.initMobileSearch();
        this.initMobileSort();
        this.initMobilePagination();
    }
    
    // Initialize mobile card actions
    initMobileCardActions() {
        const cards = document.querySelectorAll('.mobile-card');
        
        cards.forEach(card => {
            this.initCardSwipe(card);
            this.initCardSelection(card);
        });
    }
    
    // Initialize card swipe
    initCardSwipe(card) {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        card.addEventListener('touchstart', (e) => {
            if (!card.classList.contains('swipeable')) return;
            
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });
        
        card.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;
            
            if (deltaX < -50) {
                card.classList.add('swiped');
            } else {
                card.classList.remove('swiped');
            }
        }, { passive: true });
        
        card.addEventListener('touchend', () => {
            isDragging = false;
        }, { passive: true });
    }
    
    // Initialize card selection
    initCardSelection(card) {
        const checkbox = card.querySelector('.mobile-card-checkbox');
        if (!checkbox) return;
        
        card.addEventListener('click', (e) => {
            if (e.target.closest('.mobile-card-actions')) return;
            
            checkbox.checked = !checkbox.checked;
            card.classList.toggle('selected', checkbox.checked);
            
            this.updateBulkActions();
        });
    }
    
    // Initialize mobile search
    initMobileSearch() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;
        
        let searchTimeout;
        
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            
            searchTimeout = setTimeout(() => {
                this.performSearch(searchInput.value);
            }, 300);
        });
    }
    
    // Initialize mobile sort
    initMobileSort() {
        const sortButtons = document.querySelectorAll('.mobile-sort-btn');
        
        sortButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sortBy = button.getAttribute('data-sort');
                const isAsc = button.classList.contains('asc');
                
                // Remove active class from all buttons
                sortButtons.forEach(b => b.classList.remove('active', 'asc', 'desc'));
                
                // Add active class to clicked button
                button.classList.add('active', isAsc ? 'desc' : 'asc');
                
                this.sortTable(sortBy, !isAsc);
            });
        });
    }
    
    // Initialize mobile pagination
    initMobilePagination() {
        const paginationButtons = document.querySelectorAll('.pagination-btn');
        
        paginationButtons.forEach(button => {
            button.addEventListener('click', () => {
                const page = button.textContent;
                if (page && !isNaN(page)) {
                    this.loadPage(parseInt(page));
                }
            });
        });
    }
    
    // Initialize mobile forms
    initMobileForms() {
        this.initFormValidation();
        this.initFormSubmission();
        this.initFormStepper();
    }
    
    // Initialize form validation
    initFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('.form-control');
            
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
                
                input.addEventListener('input', () => {
                    if (input.classList.contains('is-invalid')) {
                        this.validateField(input);
                    }
                });
            });
        });
    }
    
    // Initialize form submission
    initFormSubmission() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                if (this.validateForm(form)) {
                    this.submitForm(form);
                }
            });
        });
    }
    
    // Initialize form stepper
    initFormStepper() {
        const steppers = document.querySelectorAll('.form-steps');
        
        steppers.forEach(stepper => {
            const steps = stepper.querySelectorAll('.form-step');
            let currentStep = 0;
            
            steps.forEach((step, index) => {
                step.addEventListener('click', () => {
                    if (index <= currentStep + 1) {
                        this.navigateToStep(index);
                    }
                });
            });
        });
    }
    
    // Initialize notifications
    initNotifications() {
        this.initToastNotifications();
        this.initPushNotifications();
    }
    
    // Initialize toast notifications
    initToastNotifications() {
        // Toast functionality is handled by existing code
    }
    
    // Initialize push notifications
    initPushNotifications() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            this.registerServiceWorker();
        }
    }
    
    // Utility methods
    showToast(message, type = 'info') {
        if (typeof showToast === 'function') {
            showToast(message, type);
        }
    }
    
    showMainButton(text, callback) {
        if (this.tg) {
            this.tg.MainButton.setParams({ text });
            this.tg.MainButton.show();
            this.tg.MainButton.onClick(callback);
        }
    }
    
    hideMainButton() {
        if (this.tg) {
            this.tg.MainButton.hide();
        }
    }
    
    showBackButton() {
        if (this.tg) {
            this.tg.BackButton.show();
        }
    }
    
    hideBackButton() {
        if (this.tg) {
            this.tg.BackButton.hide();
        }
    }
    
    hapticFeedback(type = 'light') {
        if (this.tg) {
            this.tg.HapticFeedback.impactOccurred(type);
        } else if (navigator.vibrate) {
            const patterns = {
                light: 10,
                medium: 20,
                heavy: 30
            };
            navigator.vibrate(patterns[type] || 10);
        }
    }
    
    // Event handlers
    refresh() {
        location.reload();
    }
    
    recalculateLayout() {
        // Recalculate layout after orientation change
        const viewportHeight = window.innerHeight;
        document.documentElement.style.setProperty('--viewport-height', `${viewportHeight}px`);
    }
    
    onPageHide() {
        // Save state before page hide
    }
    
    onPageShow() {
        // Restore state after page show
    }
    
    closeModal(modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
    
    navigateToPage(href) {
        // Implement navigation logic
        window.location.href = href;
    }
    
    // Placeholder methods for implementation
    showCardContextMenu(card, event) {
        // Implement context menu
    }
    
    showNavContextMenu(nav, event) {
        // Implement context menu
    }
    
    expandCard(card) {
        card.classList.toggle('expanded');
    }
    
    updateBulkActions() {
        const selected = document.querySelectorAll('.mobile-card.selected').length;
        const bulkActions = document.querySelector('.bulk-actions');
        
        if (selected > 0) {
            bulkActions.classList.add('visible');
        } else {
            bulkActions.classList.remove('visible');
        }
    }
    
    performSearch(query) {
        // Implement search logic
    }
    
    sortTable(sortBy, ascending) {
        // Implement sort logic
    }
    
    loadPage(page) {
        // Implement pagination logic
    }
    
    validateField(field) {
        // Implement field validation
        const value = field.value.trim();
        const isValid = value.length > 0;
        
        field.classList.toggle('is-invalid', !isValid);
        field.classList.toggle('is-valid', isValid);
        
        return isValid;
    }
    
    validateForm(form) {
        const inputs = form.querySelectorAll('.form-control[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    submitForm(form) {
        // Implement form submission
        const formData = new FormData(form);
        
        // Show loading state
        this.showMainButton('Загрузка...', () => {});
        
        // Simulate form submission
        setTimeout(() => {
            this.hideMainButton();
            this.showToast('Форма отправлена успешно!', 'success');
        }, 1000);
    }
    
    navigateToStep(stepIndex) {
        // Implement step navigation
    }
    
    registerServiceWorker() {
        navigator.serviceWorker.register('/sw.js')
            .then(() => {})
            .catch(() => {});
    }
}

// КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Глобальная функция для кнопки меню
function toggleMobileMenuSimple() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
        
        // Добавляем вибрацию для лучшего UX
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }
}

// Дополнительная инициализация кнопки меню для надежности
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.getElementById('mobileMenuToggle');
    if (menuButton) {
        // Множественные обработчики для максимальной надежности
        menuButton.addEventListener('click', toggleMobileMenuSimple);
        menuButton.addEventListener('touchend', function(e) {
            e.preventDefault();
            toggleMobileMenuSimple();
        });
        
        // Убираем любые конфликтующие стили
        menuButton.style.pointerEvents = 'auto';
        menuButton.style.zIndex = '10000';
        
    }
});

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.telegramMobileApp = new TelegramMobileApp();
});

// Export for use in other scripts
window.TelegramMobileApp = TelegramMobileApp;