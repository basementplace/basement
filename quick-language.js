// quick-language.js - Быстрая смена языка из любой страницы
function createLanguageSwitcher() {
    // Создаем кнопку быстрой смены языка
    const langBtn = document.createElement('button');
    langBtn.className = 'quick-language-btn glass';
    langBtn.innerHTML = `
        <i class="fas fa-globe"></i>
        <span class="lang-text">${window.languageManager?.getCurrentLanguage() === 'ru' ? 'РУ' : 'EN'}</span>
    `;
    langBtn.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 16px;
        width: 50px;
        height: 50px;
        border-radius: 25px;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        color: var(--ozon-white);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        cursor: pointer;
        z-index: 999;
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    `;
    
    // Добавляем hover эффект
    langBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 8px 32px rgba(0, 91, 255, 0.3)';
    });
    
    langBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    });
    
    // Обработка клика
    langBtn.addEventListener('click', function() {
        const currentLang = window.languageManager?.getCurrentLanguage() || 'ru';
        const newLang = currentLang === 'ru' ? 'en' : 'ru';
        
        if (window.languageManager) {
            window.languageManager.setLanguage(newLang);
            this.querySelector('.lang-text').textContent = newLang.toUpperCase();
        }
    });
    
    // Добавляем кнопку на страницу
    document.body.appendChild(langBtn);
    
    // Скрываем кнопку на странице профиля (там уже есть переключатель)
    if (window.location.pathname.includes('profile.html')) {
        langBtn.style.display = 'none';
    }
}

// Добавляем кнопку при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createLanguageSwitcher);
} else {
    createLanguageSwitcher();
}