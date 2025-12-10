// init.js - Общая инициализация для всех страниц
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем менеджер языка
    if (window.languageManager) {
        window.languageManager.init();
    }
    
    // Проверяем текущий язык
    const currentLang = localStorage.getItem('appLanguage') || 'ru';
    
    // Устанавливаем язык html документа
    document.documentElement.lang = currentLang;
    
    // Добавляем стили для уведомлений о смене языка
    if (!document.querySelector('#language-styles')) {
        const style = document.createElement('style');
        style.id = 'language-styles';
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            
            .language-toast {
                animation: slideDown 0.3s ease;
                transition: all 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Создаем глобальную функцию для смены языка
    window.changeLanguage = function(lang) {
        if (window.languageManager) {
            window.languageManager.setLanguage(lang);
        } else {
            localStorage.setItem('appLanguage', lang);
            location.reload();
        }
    };
});