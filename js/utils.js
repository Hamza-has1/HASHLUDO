/**
 * Ludo Game Utilities
 * Provides helper functions for storage, screen detection, audio toggles, transitions, and logging.
 */
const LudoUtils = {
    // Local Storage Helpers
    storage: {
        set(key, val) {
            try {
                localStorage.setItem(key, JSON.stringify(val));
                return true;
            } catch (e) {
                console.error('Error writing to localStorage', e);
                return false;
            }
        },
        get(key) {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                console.error('Error reading from localStorage', e);
                return null;
            }
        }
    },

    // Responsive and Device Detection
    device: {
        getScreenInfo() {
            const width = window.innerWidth;
            const height = window.innerHeight;
            let type = 'desktop';

            if (width < 576) {
                type = 'mobile-portrait';
            } else if (width < 992) {
                // Check orientation
                if (width > height) {
                    type = 'mobile-landscape';
                } else {
                    type = 'tablet';
                }
            }

            return {
                width,
                height,
                type,
                isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
            };
        }
    },

    // DOM Helpers
    dom: {
        show(elementId, className = 'active') {
            const el = document.getElementById(elementId);
            if (el) {
                el.classList.add(className);
                el.removeAttribute('aria-hidden');
            }
        },
        hide(elementId, className = 'active') {
            const el = document.getElementById(elementId);
            if (el) {
                el.classList.remove(className);
                el.setAttribute('aria-hidden', 'true');
            }
        },
        fadeTransition(fromId, toId, duration = 400) {
            const fromEl = document.getElementById(fromId);
            const toEl = document.getElementById(toId);
            
            if (fromEl) {
                fromEl.style.transition = `opacity ${duration}ms ease`;
                fromEl.style.opacity = '0';
                setTimeout(() => {
                    fromEl.classList.remove('active');
                    fromEl.setAttribute('aria-hidden', 'true');
                    
                    if (toEl) {
                        toEl.classList.add('active');
                        toEl.removeAttribute('aria-hidden');
                        toEl.style.opacity = '0';
                        // Force reflow
                        toEl.offsetHeight;
                        toEl.style.transition = `opacity ${duration}ms ease`;
                        toEl.style.opacity = '1';
                    }
                }, duration);
            } else if (toEl) {
                toEl.classList.add('active');
                toEl.removeAttribute('aria-hidden');
                toEl.style.opacity = '1';
            }
        }
    }
};

// Export to window object for global usage
window.LudoUtils = LudoUtils;
