// DOMが読み込まれた後に実行
document.addEventListener('DOMContentLoaded', function() {
    // 要素の取得
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    // ナビゲーションのスクロール効果
    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ハンバーガーメニューの切り替え
    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
    }

    // スムーズスクロール
    function smoothScrollTo(targetId) {
        const target = document.querySelector(targetId);
        if (target) {
            const offsetTop = target.offsetTop - 70; // ナビバーの高さ分を考慮
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // アクティブリンクの更新
    function updateActiveLink() {
        const sections = document.querySelectorAll('section');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos <= bottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // インターセクションオブザーバーによるフェードインアニメーション
    function setupFadeInAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // アニメーション対象要素にクラスを追加してオブザーバーに登録
        const animateElements = [
            '.section-header',
            '.concept-item',
            '.concept-image',
            '.menu-category',
            '.menu-image',
            '.feature-item',
            '.space-image',
            '.payment-item',
            '.payment-image',
            '.info-item',
            '.map-container'
        ];

        animateElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.classList.add('fade-in');
                observer.observe(element);
            });
        });
    }

    // パフォーマンス最適化のためのスロットル関数
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // スクロールイベントの処理（スロットル付き）
    const throttledScrollHandler = throttle(() => {
        handleNavbarScroll();
        updateActiveLink();
    }, 16); // 約60FPS

    // イベントリスナーの設定
    window.addEventListener('scroll', throttledScrollHandler);

    // ハンバーガーメニューのクリックイベント
    hamburger.addEventListener('click', toggleMobileMenu);

    // ナビゲーションリンクのクリックイベント
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            // モバイルメニューを閉じる
            if (navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
            
            // スムーズスクロール
            smoothScrollTo(targetId);
        });
    });

    // スクロールインジケーターのクリックイベント
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            smoothScrollTo('#concept');
        });
    }

    // CTAボタンのクリックイベント
    const ctaButtons = document.querySelectorAll('.btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                smoothScrollTo(href);
            }
        });
    });

    // リサイズイベントでモバイルメニューを閉じる
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    });

    // 外部リンクに対するtarget="_blank"の自動設定
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    externalLinks.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });

    // ページ読み込み時のアニメーション初期化
    setupFadeInAnimations();
    
    // 初期状態でのナビバーとアクティブリンクの設定
    handleNavbarScroll();
    updateActiveLink();

    // パフォーマンス監視（開発時のみ）
    if ('performance' in window && 'getEntriesByType' in performance) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    console.log(`ページ読み込み時間: ${navigation.loadEventEnd - navigation.fetchStart}ms`);
                }
            }, 0);
        });
    }
});

// ユーティリティ関数
const CafeUtils = {
    // 画像の遅延読み込み
    lazyLoadImages: function() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // フォールバック: IntersectionObserverが使えない場合
            images.forEach(img => {
                img.src = img.dataset.src || img.src;
            });
        }
    },

    // フォームバリデーション（将来の拡張用）
    validateForm: function(formElement) {
        const inputs = formElement.querySelectorAll('input, textarea, select');
        let isValid = true;

        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        return isValid;
    },

    // Cookie管理（GDPR対応用）
    setCookie: function(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    },

    getCookie: function(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    // アクセシビリティの向上
    enhanceAccessibility: function() {
        // フォーカス管理
        const focusableElements = document.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );

        // Escキーでモーダルを閉じる
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                }
                
                const activeMenu = document.querySelector('.nav-menu.active');
                if (activeMenu) {
                    document.getElementById('hamburger').click();
                }
            }
        });

        // スキップリンクの追加
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'メインコンテンツにスキップ';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-brown);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 9999;
            transform: translateY(-100%);
            transition: transform 0.3s;
        `;
        
        skipLink.addEventListener('focus', function() {
            this.style.transform = 'translateY(0%)';
        });
        
        skipLink.addEventListener('blur', function() {
            this.style.transform = 'translateY(-100%)';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }
};

// PWA対応（Service Worker）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('Service Worker registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('Service Worker registration failed: ', registrationError);
            });
    });
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    CafeUtils.lazyLoadImages();
    CafeUtils.enhanceAccessibility();
});
