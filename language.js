// language.js - Система управления языком
class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('appLanguage') || 'ru';
        this.translations = {
            'ru': {
                // Общие элементы
                'searchPlaceholder': 'Искать на basement',
                'back': 'Назад',
                'cart': 'Корзина',
                'favorites': 'Избранное',
                'profile': 'Профиль',
                'loading': 'Загрузка...',
                'error': 'Ошибка',
                'success': 'Успешно',
                
                // Главная страница
                'shop': 'Магазин',
                'allProducts': 'Все товары',
                'face': 'Лицо',
                'body': 'Тело',
                'hair': 'Волосы',
                'sunscreen': 'Защита',
                'new': 'Новинки',
                'premiumCosmetics': 'Премиум косметика',
                'discountText': 'Скидка 25% на первую покупку. Подбор по типу кожи с бесплатной консультацией.',
                'matchProduct': 'Подобрать средство',
                'popularProducts': 'Популярные товары',
                'allProductsLink': 'Все товары',
                'addToCart': 'В корзину',
                'inCart': 'В корзине',
                'price': '₽',
                'category': 'Категория',
                'skinType': 'Тип кожи',
                'brand': 'Бренд',
                'applyFilters': 'Применить',
                'cancel': 'Отмена',
                'buyNow': 'Купить сейчас',
                
                // Корзина
                'cartEmpty': 'Корзина пуста',
                'cartEmptyText': 'Добавьте товары из магазина',
                'goToShop': 'Перейти в магазин',
                'total': 'Итого:',
                'checkout': 'Оформить заказ',
                'checkoutProcessing': 'Оформление...',
                'remove': 'Удалить',
                'quantity': 'Количество',
                
                // Избранное
                'favoritesEmpty': 'Нет избранных товаров',
                'favoritesEmptyText': 'Добавьте товары в избранное из магазина',
                'signInToSeeFavorites': 'Войдите, чтобы видеть избранное',
                'signInWithGoogle': 'Войти с Google',
                'favoritesSaved': 'Избранное будет сохранено в вашем аккаунте',
                'loadingFavorites': 'Загрузка избранного...',
                
                // Профиль
                'login': 'Войти',
                'register': 'Регистрация',
                'email': 'Email',
                'password': 'Пароль',
                'confirmPassword': 'Подтвердите пароль',
                'name': 'Имя',
                'loginBtn': 'Войти',
                'registerBtn': 'Зарегистрироваться',
                'editProfile': 'Редактировать профиль',
                'settings': 'Настройки',
                'language': 'Язык',
                'chooseLanguage': 'Выберите язык приложения',
                'help': 'Помощь',
                'helpSupport': 'Помощь и поддержка',
                'faqContacts': 'Частые вопросы и контакты',
                'about': 'О приложении',
                'version': 'Версия 1.0.0',
                'logout': 'Выйти',
                'logoutConfirm': 'Вы уверены, что хотите выйти?',
                'logoutText': 'Выйти из аккаунта'
            },
            'en': {
                // Общие элементы
                'searchPlaceholder': 'Search on basement',
                'back': 'Back',
                'cart': 'Cart',
                'favorites': 'Favorites',
                'profile': 'Profile',
                'loading': 'Loading...',
                'error': 'Error',
                'success': 'Success',
                
                // Главная страница
                'shop': 'Shop',
                'allProducts': 'All products',
                'face': 'Face',
                'body': 'Body',
                'hair': 'Hair',
                'sunscreen': 'Sunscreen',
                'new': 'New',
                'premiumCosmetics': 'Premium Cosmetics',
                'discountText': '25% discount on first purchase. Skin type matching with free consultation.',
                'matchProduct': 'Match product',
                'popularProducts': 'Popular products',
                'allProductsLink': 'All products',
                'addToCart': 'Add to cart',
                'inCart': 'In cart',
                'price': '$',
                'category': 'Category',
                'skinType': 'Skin type',
                'brand': 'Brand',
                'applyFilters': 'Apply',
                'cancel': 'Cancel',
                'buyNow': 'Buy now',
                
                // Корзина
                'cartEmpty': 'Cart is empty',
                'cartEmptyText': 'Add products from shop',
                'goToShop': 'Go to shop',
                'total': 'Total:',
                'checkout': 'Checkout',
                'checkoutProcessing': 'Processing...',
                'remove': 'Remove',
                'quantity': 'Quantity',
                
                // Избранное
                'favoritesEmpty': 'No favorites',
                'favoritesEmptyText': 'Add products to favorites from shop',
                'signInToSeeFavorites': 'Sign in to see favorites',
                'signInWithGoogle': 'Sign in with Google',
                'favoritesSaved': 'Favorites will be saved in your account',
                'loadingFavorites': 'Loading favorites...',
                
                // Профиль
                'login': 'Login',
                'register': 'Register',
                'email': 'Email',
                'password': 'Password',
                'confirmPassword': 'Confirm password',
                'name': 'Name',
                'loginBtn': 'Login',
                'registerBtn': 'Register',
                'editProfile': 'Edit profile',
                'settings': 'Settings',
                'language': 'Language',
                'chooseLanguage': 'Choose app language',
                'help': 'Help',
                'helpSupport': 'Help & Support',
                'faqContacts': 'FAQ and contacts',
                'about': 'About app',
                'version': 'Version 1.0.0',
                'logout': 'Logout',
                'logoutConfirm': 'Are you sure you want to logout?',
                'logoutText': 'Sign out of account'
            }
        };
    }

    // Установить язык
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('appLanguage', lang);
            this.applyLanguage();
            return true;
        }
        return false;
    }

    // Получить перевод
    get(key) {
        return this.translations[this.currentLang][key] || key;
    }

    // Применить язык ко всей странице
    applyLanguage() {
        // Применяем переводы для элементов с data-lang атрибутом
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            if (key && this.get(key)) {
                element.textContent = this.get(key);
            }
        });

        // Применяем переводы для placeholder
        document.querySelectorAll('[data-lang-placeholder]').forEach(element => {
            const key = element.getAttribute('data-lang-placeholder');
            if (key && this.get(key)) {
                element.placeholder = this.get(key);
            }
        });

        // Применяем переводы для value
        document.querySelectorAll('[data-lang-value]').forEach(element => {
            const key = element.getAttribute('data-lang-value');
            if (key && this.get(key)) {
                element.value = this.get(key);
            }
        });

        // Применяем переводы для title
        document.querySelectorAll('[data-lang-title]').forEach(element => {
            const key = element.getAttribute('data-lang-title');
            if (key && this.get(key)) {
                element.title = this.get(key);
            }
        });

        // Обновляем html lang атрибут
        document.documentElement.lang = this.currentLang;

        // Создаем событие изменения языка
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLang }
        }));
    }

    // Инициализация
    init() {
        this.applyLanguage();
        
        // Добавляем слушатель для кнопок смены языка
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-set-lang]')) {
                const lang = e.target.closest('[data-set-lang]').getAttribute('data-set-lang');
                if (this.setLanguage(lang)) {
                    // Показываем уведомление
                    this.showLanguageNotification(lang);
                }
            }
        });

        // Слушаем события смены языка
        window.addEventListener('languageChanged', (e) => {
            console.log('Language changed to:', e.detail.language);
        });
    }

    // Показать уведомление о смене языка
    showLanguageNotification(lang) {
        const messages = {
            'ru': 'Язык изменен на Русский',
            'en': 'Language changed to English'
        };
        
        // Создаем и показываем toast
        const toast = document.createElement('div');
        toast.className = 'language-toast';
        toast.textContent = messages[lang] || 'Language changed';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            padding: 12px 24px;
            border-radius: 12px;
            color: var(--ozon-white);
            font-weight: 500;
            z-index: 9999;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 2000);
    }

    // Получить текущий язык
    getCurrentLanguage() {
        return this.currentLang;
    }
}

// Создаем глобальный экземпляр менеджера языка
window.languageManager = new LanguageManager();