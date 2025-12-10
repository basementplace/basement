// Инициализация Telegram Mini Apps
const tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('#1C1C1E');
tg.setBackgroundColor('#000000');

// Данные товаров (те же, что и в основном приложении)
const products = [
    { 
        id: 1, 
        name: "Гиалуроновый крем", 
        desc: "Интенсивное увлажнение на 24 часа", 
        category: "face",
        price: 1890, 
        oldPrice: 2220, 
        image: "https://images.unsplash.com/photo-1556228578-9c360e1d8d34?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", 
        badge: "-15%",
        rating: 4.8,
        reviews: 128
    },
    { 
        id: 2, 
        name: "Сыворотка с витамином C", 
        desc: "Осветление и сияние", 
        category: "face",
        price: 2450, 
        oldPrice: null, 
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", 
        badge: "New",
        rating: 4.9,
        reviews: 89
    },
    { 
        id: 3, 
        name: "Очищающий гель", 
        desc: "Для чувствительной кожи", 
        category: "face",
        price: 950, 
        oldPrice: 1100, 
        image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", 
        badge: "-10%",
        rating: 4.5,
        reviews: 56
    },
    { 
        id: 4, 
        name: "Крем для век", 
        desc: "Против морщин", 
        category: "face",
        price: 3100, 
        oldPrice: null, 
        image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", 
        badge: null,
        rating: 4.7,
        reviews: 204
    },
    { 
        id: 5, 
        name: "Увлажняющая маска", 
        desc: "Ночное восстановление", 
        category: "face",
        price: 1650, 
        oldPrice: 2000, 
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", 
        badge: "-18%",
        rating: 4.6,
        reviews: 72
    },
    { 
        id: 6, 
        name: "Солнцезащитный крем", 
        desc: "SPF 50+ для лица", 
        category: "sunscreen",
        price: 1250, 
        oldPrice: 1500, 
        image: "https://images.unsplash.com/photo-1556228578-9c360e1d8d34?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", 
        badge: "-17%",
        rating: 4.8,
        reviews: 156
    },
    { 
        id: 7, 
        name: "Ночной крем", 
        desc: "Восстановление кожи", 
        category: "face",
        price: 2750, 
        oldPrice: 3200, 
        image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", 
        badge: "-14%",
        rating: 4.7,
        reviews: 91
    },
    { 
        id: 8, 
        name: "Шампунь для объема", 
        desc: "Для тонких волос", 
        category: "hair",
        price: 1250, 
        oldPrice: 1500, 
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60", 
        badge: "-17%",
        rating: 4.4,
        reviews: 43
    }
];

// Состояние избранного
const state = {
    favorites: [],
    selectedItems: []
};

// DOM элементы
const elements = {
    emptyFavorites: document.getElementById('emptyFavorites'),
    favoritesContainer: document.getElementById('favoritesContainer'),
    favoritesGrid: document.getElementById('favoritesGrid'),
    favoritesCount: document.getElementById('favoritesCount'),
    favoritesSort: document.getElementById('favoritesSort'),
    recommendationsSection: document.getElementById('recommendationsSection'),
    recommendationsGrid: document.getElementById('recommendationsGrid'),
    favoritesActions: document.getElementById('favoritesActions'),
    
    // Кнопки
    sortFavoritesBtn: document.getElementById('sortFavoritesBtn'),
    clearAllFavoritesBtn: document.getElementById('clearAllFavoritesBtn'),
    addAllToCartBtn: document.getElementById('addAllToCartBtn'),
    buySelectedBtn: document.getElementById('buySelectedBtn'),
    
    // Модальные окна
    clearModal: document.getElementById('clearModal'),
    cancelClearBtn: document.getElementById('cancelClearBtn'),
    confirmClearBtn: document.getElementById('confirmClearBtn'),
    selectionModal: document.getElementById('selectionModal'),
    
    // Кнопки модального окна выбора
    selectAllBtn: document.getElementById('selectAllBtn'),
    deselectAllBtn: document.getElementById('deselectAllBtn'),
    removeSelectedBtn: document.getElementById('removeSelectedBtn'),
    addSelectedToCartBtn: document.getElementById('addSelectedToCartBtn'),
    
    // Бейджи
    cartTabBadge: document.getElementById('cartTabBadge'),
    favoritesTabBadge: document.getElementById('favoritesTabBadge'),
    
    // Toast
    toast: document.getElementById('toast')
};

// Инициализация
function init() {
    loadFavorites();
    setupEventListeners();
    renderFavorites();
    updateFavoritesCount();
    renderRecommendations();
    updateCartCount();
}

// Загрузка избранного из localStorage
function loadFavorites() {
    const savedFavorites = localStorage.getItem('cosmespace_favorites');
    if (savedFavorites) {
        state.favorites = JSON.parse(savedFavorites);
    }
}

// Сохранение избранного в localStorage
function saveFavorites() {
    localStorage.setItem('cosmespace_favorites', JSON.stringify(state.favorites));
    updateFavoritesCount();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Сортировка
    elements.favoritesSort.addEventListener('change', () => {
        renderFavorites();
    });
    
    elements.sortFavoritesBtn.addEventListener('click', () => {
        elements.favoritesSort.focus();
    });

    // Очистка избранного
    elements.clearAllFavoritesBtn.addEventListener('click', () => {
        if (state.favorites.length > 0) {
            elements.clearModal.style.display = 'flex';
        }
    });

    elements.cancelClearBtn.addEventListener('click', () => {
        elements.clearModal.style.display = 'none';
    });

    elements.confirmClearBtn.addEventListener('click', clearAllFavorites);

    // Закрытие модальных окон
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').style.display = 'none';
        });
    });

    elements.clearModal.addEventListener('click', (e) => {
        if (e.target === elements.clearModal) {
            elements.clearModal.style.display = 'none';
        }
    });

    elements.selectionModal.addEventListener('click', (e) => {
        if (e.target === elements.selectionModal) {
            elements.selectionModal.style.display = 'none';
        }
    });

    // Кнопки действий
    elements.addAllToCartBtn.addEventListener('click', addAllToCart);
    elements.buySelectedBtn.addEventListener('click', () => {
        if (state.selectedItems.length > 0) {
            addSelectedToCart();
            showToast('Товары добавлены в корзину');
        } else {
            showToast('Выберите товары для покупки', 'error');
        }
    });

    // Кнопки модального окна выбора
    elements.selectAllBtn.addEventListener('click', selectAllItems);
    elements.deselectAllBtn.addEventListener('click', deselectAllItems);
    elements.removeSelectedBtn.addEventListener('click', removeSelectedItems);
    elements.addSelectedToCartBtn.addEventListener('click', () => {
        addSelectedToCart();
        elements.selectionModal.style.display = 'none';
    });
}

// Рендер избранных товаров
function renderFavorites() {
    if (state.favorites.length === 0) {
        elements.emptyFavorites.style.display = 'flex';
        elements.favoritesContainer.style.display = 'none';
        elements.favoritesActions.style.display = 'none';
        return;
    }

    elements.emptyFavorites.style.display = 'none';
    elements.favoritesContainer.style.display = 'block';
    elements.favoritesActions.style.display = 'flex';

    // Сортировка
    const sortedFavorites = sortFavorites([...state.favorites]);

    elements.favoritesCount.textContent = `${state.favorites.length} ${getPluralForm(state.favorites.length, ['товар', 'товара', 'товаров'])}`;
    elements.favoritesGrid.innerHTML = '';

    sortedFavorites.forEach(item => {
        const product = getProductById(item.id) || item;
        const isSelected = state.selectedItems.includes(item.id);
        const favoriteItem = createFavoriteItemElement(product, isSelected, item.dateAdded);
        elements.favoritesGrid.appendChild(favoriteItem);
    });
}

// Создание элемента избранного товара
function createFavoriteItemElement(product, isSelected, dateAdded) {
    const itemElement = document.createElement('div');
    itemElement.className = `favorite-item ${isSelected ? 'selected' : ''}`;
    itemElement.dataset.id = product.id;
    
    const timeAgo = getTimeAgo(dateAdded);
    const isInCart = checkIfInCart(product.id);
    
    itemElement.innerHTML = `
        <div class="favorite-item-select">
            <div class="select-checkbox ${isSelected ? 'selected' : ''}"></div>
        </div>
        <div class="favorite-item-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="favorite-item-info">
            <div class="favorite-item-header">
                <h4 class="favorite-item-name">${product.name}</h4>
                ${product.badge ? `<span class="favorite-item-badge">${product.badge}</span>` : ''}
            </div>
            <div class="favorite-item-category">
                <i class="fas fa-tag"></i>
                ${getCategoryName(product.category)}
            </div>
            <p class="favorite-item-desc">${product.desc}</p>
            <div class="favorite-item-price">
                <span class="favorite-item-current-price">${formatPrice(product.price)} ₽</span>
                ${product.oldPrice ? 
                    `<span class="favorite-item-old-price">${formatPrice(product.oldPrice)} ₽</span>` : 
                    ''
                }
            </div>
            <div class="favorite-item-meta">
                <small style="color: #8E8E93;">
                    <i class="far fa-clock"></i> Добавлено ${timeAgo}
                </small>
            </div>
            <div class="favorite-item-actions">
                <button class="favorite-action-btn btn-move-to-cart ${isInCart ? 'added' : ''}" 
                        data-id="${product.id}" ${isInCart ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    ${isInCart ? 'В корзине' : 'В корзину'}
                </button>
                <button class="favorite-action-btn btn-remove-favorite" data-id="${product.id}">
                    <i class="fas fa-trash-alt"></i>
                    Удалить
                </button>
            </div>
        </div>
    `;
    
    // Обработчики событий
    const selectCheckbox = itemElement.querySelector('.select-checkbox');
    const moveToCartBtn = itemElement.querySelector('.btn-move-to-cart');
    const removeBtn = itemElement.querySelector('.btn-remove-favorite');
    
    selectCheckbox.addEventListener('click', () => {
        toggleSelectItem(product.id);
    });
    
    moveToCartBtn.addEventListener('click', () => {
        if (!isInCart) {
            addToCart(product.id);
            moveToCartBtn.innerHTML = '<i class="fas fa-check"></i> В корзине';
            moveToCartBtn.classList.add('added');
            moveToCartBtn.disabled = true;
            showToast(`${product.name} добавлен в корзину`);
        }
    });
    
    removeBtn.addEventListener('click', () => {
        removeFromFavorites(product.id);
        showToast(`${product.name} удален из избранного`);
    });
    
    return itemElement;
}

// Рендер рекомендаций
function renderRecommendations() {
    if (state.favorites.length === 0) {
        elements.recommendationsSection.style.display = 'none';
        return;
    }
    
    elements.recommendationsSection.style.display = 'block';
    
    // Получаем категории из избранного
    const favoriteCategories = state.favorites.map(item => {
        const product = getProductById(item.id);
        return product ? product.category : null;
    }).filter(Boolean);
    
    // Ищем товары из тех же категорий, которых нет в избранном
    const favoriteIds = state.favorites.map(item => item.id);
    const recommendations = products
        .filter(product => 
            !favoriteIds.includes(product.id)
        )
        .slice(0, 4);
    
    if (recommendations.length === 0) {
        elements.recommendationsSection.style.display = 'none';
        return;
    }
    
    renderRecommendationItems(recommendations);
}

function renderRecommendationItems(items) {
    elements.recommendationsGrid.innerHTML = '';
    
    items.forEach(product => {
        const isInFavorites = state.favorites.some(item => item.id === product.id);
        const isInCart = checkIfInCart(product.id);
        
        const itemElement = document.createElement('div');
        itemElement.className = 'recommendation-card';
        
        itemElement.innerHTML = `
            <div class="recommendation-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <h4 class="recommendation-name">${product.name}</h4>
            <div class="recommendation-price">${formatPrice(product.price)} ₽</div>
            <div class="recommendation-actions">
                <button class="recommendation-btn ${isInFavorites ? 'added' : ''}" 
                        data-id="${product.id}">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="recommendation-btn ${isInCart ? 'added' : ''}" 
                        data-id="${product.id}">
                    <i class="fas ${isInCart ? 'fa-check' : 'fa-cart-plus'}"></i>
                </button>
            </div>
        `;
        
        const favoriteBtn = itemElement.querySelectorAll('.recommendation-btn')[0];
        const cartBtn = itemElement.querySelectorAll('.recommendation-btn')[1];
        
        favoriteBtn.addEventListener('click', () => {
            if (isInFavorites) {
                removeFromFavorites(product.id);
                favoriteBtn.classList.remove('added');
                showToast(`${product.name} удален из избранного`);
            } else {
                addToFavorites(product.id);
                favoriteBtn.classList.add('added');
                showToast(`${product.name} добавлен в избранное`);
            }
        });
        
        cartBtn.addEventListener('click', () => {
            if (!isInCart) {
                addToCart(product.id);
                cartBtn.innerHTML = '<i class="fas fa-check"></i>';
                cartBtn.classList.add('added');
                showToast(`${product.name} добавлен в корзину`);
            }
        });
        
        elements.recommendationsGrid.appendChild(itemElement);
    });
}

// Управление избранным
function addToFavorites(productId) {
    const product = getProductById(productId);
    if (!product) return;
    
    if (!state.favorites.some(item => item.id === productId)) {
        state.favorites.push({
            id: productId,
            dateAdded: new Date().toISOString()
        });
        saveFavorites();
        renderFavorites();
        renderRecommendations();
        updateFavoritesCount();
    }
}

function removeFromFavorites(productId) {
    state.favorites = state.favorites.filter(item => item.id !== productId);
    // Удаляем из выбранных, если был выбран
    state.selectedItems = state.selectedItems.filter(id => id !== productId);
    saveFavorites();
    renderFavorites();
    renderRecommendations();
    updateFavoritesCount();
}

function clearAllFavorites() {
    state.favorites = [];
    state.selectedItems = [];
    saveFavorites();
    renderFavorites();
    renderRecommendations();
    updateFavoritesCount();
    elements.clearModal.style.display = 'none';
    showToast('Избранное очищено');
}

// Управление выбором товаров
function toggleSelectItem(productId) {
    const index = state.selectedItems.indexOf(productId);
    if (index > -1) {
        state.selectedItems.splice(index, 1);
    } else {
        state.selectedItems.push(productId);
    }
    
    // Обновляем отображение
    const itemElement = document.querySelector(`.favorite-item[data-id="${productId}"]`);
    if (itemElement) {
        const checkbox = itemElement.querySelector('.select-checkbox');
        itemElement.classList.toggle('selected');
        checkbox.classList.toggle('selected');
    }
}

function selectAllItems() {
    state.selectedItems = state.favorites.map(item => item.id);
    renderFavorites();
}

function deselectAllItems() {
    state.selectedItems = [];
    renderFavorites();
}

function removeSelectedItems() {
    state.selectedItems.forEach(productId => {
        removeFromFavorites(productId);
    });
    state.selectedItems = [];
    elements.selectionModal.style.display = 'none';
    showToast('Выбранные товары удалены');
}

// Работа с корзиной
function addToCart(productId) {
    const savedCart = localStorage.getItem('cosmespace_cart');
    let cart = savedCart ? JSON.parse(savedCart) : [];
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ 
            id: productId, 
            quantity: 1
        });
    }
    
    localStorage.setItem('cosmespace_cart', JSON.stringify(cart));
    updateCartCount();
}

function addAllToCart() {
    state.favorites.forEach(item => {
        addToCart(item.id);
    });
    showToast('Все товары добавлены в корзину');
}

function addSelectedToCart() {
    state.selectedItems.forEach(productId => {
        addToCart(productId);
    });
    state.selectedItems = [];
    renderFavorites();
    showToast('Выбранные товары добавлены в корзину');
}

function checkIfInCart(productId) {
    const savedCart = localStorage.getItem('cosmespace_cart');
    if (!savedCart) return false;
    
    const cart = JSON.parse(savedCart);
    return cart.some(item => item.id === productId);
}

// Обновление счетчиков
function updateFavoritesCount() {
    const count = state.favorites.length;
    if (elements.favoritesTabBadge) {
        elements.favoritesTabBadge.textContent = count;
        elements.favoritesTabBadge.style.display = count > 0 ? 'flex' : 'none';
    }
    
    // Также обновляем счетчик в шапке избранного
    if (elements.favoritesCount) {
        elements.favoritesCount.textContent = `${count} ${getPluralForm(count, ['товар', 'товара', 'товаров'])}`;
    }
}

function updateCartCount() {
    const savedCart = localStorage.getItem('cosmespace_cart');
    if (!savedCart) {
        if (elements.cartTabBadge) {
            elements.cartTabBadge.textContent = '0';
            elements.cartTabBadge.style.display = 'none';
        }
        return;
    }
    
    const cart = JSON.parse(savedCart);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (elements.cartTabBadge) {
        elements.cartTabBadge.textContent = totalItems;
        elements.cartTabBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Вспомогательные функции
function getProductById(productId) {
    return products.find(p => p.id === productId);
}

function sortFavorites(favorites) {
    const sortBy = elements.favoritesSort.value;
    
    return favorites.sort((a, b) => {
        const productA = getProductById(a.id) || a;
        const productB = getProductById(b.id) || b;
        
        switch (sortBy) {
            case 'date_desc':
                return new Date(b.dateAdded) - new Date(a.dateAdded);
            case 'date_asc':
                return new Date(a.dateAdded) - new Date(b.dateAdded);
            case 'price_asc':
                return productA.price - productB.price;
            case 'price_desc':
                return productB.price - productA.price;
            default:
                return 0;
        }
    });
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function getCategoryName(category) {
    const categories = {
        face: 'Для лица',
        body: 'Для тела',
        hair: 'Для волос',
        sunscreen: 'Солнцезащита'
    };
    return categories[category] || category;
}

function getTimeAgo(dateString) {
    if (!dateString) return 'давно';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'сегодня';
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} дня назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} недели назад`;
    return `${Math.floor(diffDays / 30)} месяца назад`;
}

function getPluralForm(number, forms) {
    const cases = [2, 0, 1, 1, 1, 2];
    return forms[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[Math.min(number % 10, 5)]];
}

function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.className = 'toast';
    elements.toast.classList.add(type === 'error' ? 'error' : 'show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show', 'error');
    }, 3000);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);