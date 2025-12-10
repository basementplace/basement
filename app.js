// app.js - Основной функционал приложения с Firebase Firestore

// Firebase конфигурация (используйте ваши данные)
const firebaseConfig = {
    apiKey: "AIzaSyC_XhDZ9rUv7wFlQkHMFwvkA5muZY4T-5I",
    authDomain: "estels-86a9c.firebaseapp.com",
    projectId: "estels-86a9c",
    storageBucket: "estels-86a9c.firebasestorage.app",
    messagingSenderId: "886795277090",
    appId: "1:886795277090:web:0e7cff9111d69e8b828b7b",
    measurementId: "G-FCH1Y0WX17"
};

// Инициализация Firebase
let db;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    console.log('✅ Firebase успешно инициализирован');
} catch (error) {
    console.error('❌ Ошибка инициализации Firebase:', error);
    showToast('Ошибка подключения к базе данных', 'error');
}

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация приложения
    initApp();
    
    // Загрузка товаров из Firestore
    loadProductsFromFirestore();
    
    // Инициализация корзины и избранного
    initCart();
    initFavorites();
    
    // Инициализация фильтров
    initFilters();
    
    // Инициализация поиска
    initSearch();
    
    // Инициализация карусели
    initCarousel();
});

// ========================
// ОСНОВНЫЕ ФУНКЦИИ
// ========================

function initApp() {
    console.log('🚀 CosmeSpace приложение инициализировано');
    
    // Инициализация Toast уведомлений
    window.showToast = function(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = 'toast';
        toast.classList.add(type);
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };
    
    // Инициализация удаления из корзины
    initRemoveFromCart();
}

function initCarousel() {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const totalSlides = slides.length;
    let slideInterval;

    if (slides.length === 0) return;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    // Автопрокрутка каждые 5 секунд
    function startAutoSlide() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    // Остановка автопрокрутки при наведении
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });

        carouselContainer.addEventListener('mouseleave', () => {
            startAutoSlide();
        });
    }

    // Индикаторы
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            clearInterval(slideInterval);
            showSlide(index);
            startAutoSlide();
        });
    });

    // Инициализация
    if (totalSlides > 1) {
        startAutoSlide();
    }
}

// ========================
// РАБОТА С КОРЗИНОЙ
// ========================

function initCart() {
    // Загрузка корзины из localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Обновление счетчика корзины
    updateCartCount();
    
    // Функция добавления в корзину
    window.addToCart = function(product) {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Проверяем, есть ли товар уже в корзине
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showToast('✅ Товар добавлен в корзину', 'success');
    };
    
    // Функция удаления из корзины
    window.removeFromCart = function(productId) {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showToast('🗑️ Товар удален из корзины', 'error');
        
        // Если мы на странице корзины, перезагружаем список
        if (window.location.pathname.includes('cart.html')) {
            loadCartItems();
        }
    };
    
    // Функция обновления количества
    window.updateCartQuantity = function(productId, newQuantity) {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            
            // Если на странице корзины, обновляем отображение
            if (window.location.pathname.includes('cart.html')) {
                loadCartItems();
            }
        }
    };
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Обновляем все счетчики корзины
    document.querySelectorAll('#cartTabBadge').forEach(element => {
        if (element) {
            element.textContent = totalItems;
            element.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    });
}

function initRemoveFromCart() {
    // Обработчик для кнопок удаления
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item-btn') || e.target.closest('.remove-btn')) {
            const productId = e.target.closest('[data-product-id]')?.dataset.productId;
            if (productId) {
                removeFromCart(productId);
            }
        }
    });
}

// ========================
// ИЗБРАННОЕ
// ========================

function initFavorites() {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // Обновление счетчика избранного
    updateFavoritesCount();
    
    // Функция добавления/удаления из избранного
    window.toggleFavorite = function(product) {
        favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        const index = favorites.findIndex(item => item.id === product.id);
        
        if (index > -1) {
            // Удаляем из избранного
            favorites.splice(index, 1);
            showToast('🗑️ Удалено из избранного', 'error');
        } else {
            // Добавляем в избранное
            favorites.push(product);
            showToast('❤️ Добавлено в избранное', 'success');
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesCount();
        return index === -1;
    };
    
    // Проверка, находится ли товар в избранном
    window.isFavorite = function(productId) {
        favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        return favorites.some(item => item.id === productId);
    };
}

function updateFavoritesCount() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const count = favorites.length;
    
    // Обновляем все счетчики избранного
    document.querySelectorAll('#favoritesTabBadge').forEach(element => {
        if (element) {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        }
    });
}

// ========================
// ТОВАРЫ ИЗ FIRESTORE
// ========================

let allProducts = [];
let filteredProducts = [];

async function loadProductsFromFirestore() {
    const productsGrid = document.getElementById('productsGrid');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const emptyState = document.getElementById('emptyState');
    
    if (!productsGrid) return;
    
    try {
        // Показываем индикатор загрузки
        if (loadingIndicator) loadingIndicator.style.display = 'flex';
        if (emptyState) emptyState.style.display = 'none';
        
        // Проверяем, инициализирован ли Firebase
        if (!db) {
            throw new Error('Firebase не инициализирован');
        }
        
        console.log('📥 Загружаем товары из Firestore...');
        
        // Получаем товары из Firestore
        const snapshot = await db.collection('products')
            .orderBy('createdAt', 'desc')
            .get();
        
        // Очищаем массив товаров
        allProducts = [];
        
        if (snapshot.empty) {
            console.log('📭 Товаров не найдено в Firestore');
            
            // Создаем несколько демо-товаров
            createDemoProducts();
            
            showToast('Используются демо-товары', 'info');
        } else {
            // Преобразуем данные из Firestore
            snapshot.forEach(doc => {
                const productData = doc.data();
                const product = {
                    id: doc.id,
                    name: productData.name || 'Без названия',
                    category: productData.category || 'other',
                    brand: productData.brand || 'other',
                    skinType: productData.skinType || [],
                    price: productData.price || 0,
                    oldPrice: productData.oldPrice || null,
                    image: productData.image || 'https://images.unsplash.com/photo-1556228578-9c360e2d0b4a?w=400&h=400&fit=crop',
                    rating: productData.rating || 4.5,
                    reviews: productData.reviews || 0,
                    description: productData.description || 'Описание отсутствует',
                    new: productData.new || false,
                    popular: productData.popular || false,
                    createdAt: productData.createdAt || new Date(),
                    updatedAt: productData.updatedAt || new Date()
                };
                allProducts.push(product);
            });
            
            console.log(`✅ Загружено ${allProducts.length} товаров`);
        }
        
        // Обновляем отфильтрованные товары
        filteredProducts = [...allProducts];
        
        // Отображаем товары
        renderProducts();
        
    } catch (error) {
        console.error('❌ Ошибка загрузки товаров из Firestore:', error);
        showToast('Ошибка загрузки товаров', 'error');
        
        // Показываем демо-товары как запасной вариант
        createDemoProducts();
        renderProducts();
        
    } finally {
        // Скрываем индикатор загрузки
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
}

async function createDemoProducts() {
    console.log('🛠️ Создаем демо-товары...');
    
    // Демо-товары
    const demoProducts = [
        {
            name: "Увлажняющий крем для лица",
            category: "face",
            brand: "la_roche",
            skinType: ["normal", "dry"],
            price: 1890,
            oldPrice: 2190,
            image: "https://images.unsplash.com/photo-1556228578-9c360e2d0b4a?w=400&h=400&fit=crop",
            rating: 4.8,
            reviews: 142,
            description: "Интенсивное увлажнение на 24 часа",
            popular: true,
            new: false,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: "Очищающий гель для умывания",
            category: "face",
            brand: "cerave",
            skinType: ["oily", "sensitive"],
            price: 890,
            oldPrice: 990,
            image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop",
            rating: 4.6,
            reviews: 89,
            description: "Мягкое очищение без пересушивания",
            popular: true,
            new: false,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: "Сыворотка с гиалуроновой кислотой",
            category: "face",
            brand: "ordinary",
            skinType: ["normal", "dry", "sensitive"],
            price: 1250,
            image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop",
            rating: 4.9,
            reviews: 256,
            description: "Глубокое увлажнение и разглаживание",
            popular: false,
            new: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    
    // Сохраняем демо-товары в локальный массив
    allProducts = demoProducts.map((product, index) => ({
        id: `demo_${index + 1}`,
        ...product
    }));
    
    // Если есть подключение к Firestore, сохраняем туда
    if (db) {
        try {
            for (const product of demoProducts) {
                await db.collection('products').add(product);
            }
            console.log('✅ Демо-товары сохранены в Firestore');
        } catch (error) {
            console.log('⚠️ Не удалось сохранить демо-товары в Firestore');
        }
    }
}

function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!productsGrid) return;
    
    // Очищаем сетку
    productsGrid.innerHTML = '';
    
    // Обновляем количество товаров
    updateProductsCount(filteredProducts.length);
    
    if (filteredProducts.length === 0) {
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }
    
    // Создаем карточки товаров
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;
    
    const priceHTML = product.oldPrice 
        ? `<span class="current-price">${formatPrice(product.price)} ₽</span>
           <span class="old-price">${formatPrice(product.oldPrice)} ₽</span>`
        : `<span class="current-price">${formatPrice(product.price)} ₽</span>`;
    
    const badgeHTML = product.new 
        ? '<span class="product-badge new">Новинка</span>'
        : (product.popular ? '<span class="product-badge">Популярное</span>' : '');
    
    card.innerHTML = `
        ${badgeHTML}
        <div class="product-image-container">
            <img src="${product.image}" alt="${product.name}" loading="lazy" 
                 onerror="this.src='https://images.unsplash.com/photo-1556228578-9c360e2d0b4a?w=400&h=400&fit=crop'">
        </div>
        <div class="product-info">
            <div class="product-category">
                <i class="fas fa-${getCategoryIcon(product.category)}"></i>
                ${getCategoryName(product.category)}
            </div>
            <h3>${product.name}</h3>
            <div class="product-meta">
                <span><i class="fas fa-star"></i> ${product.rating || 4.5}</span>
                <span><i class="fas fa-comment"></i> ${product.reviews || 0}</span>
            </div>
            <div class="product-price">
                ${priceHTML}
            </div>
            <button class="btn-add-to-cart" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                <i class="fas fa-shopping-bag"></i>
                В корзину
            </button>
        </div>
    `;
    
    return card;
}

function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price);
}

function getCategoryIcon(category) {
    const icons = {
        'face': 'smile',
        'body': 'user',
        'hair': 'cut',
        'sunscreen': 'sun',
        'other': 'tag'
    };
    return icons[category] || 'tag';
}

function getCategoryName(category) {
    const names = {
        'face': 'Лицо',
        'body': 'Тело',
        'hair': 'Волосы',
        'sunscreen': 'Защита',
        'other': 'Другое'
    };
    return names[category] || 'Другое';
}

function updateProductsCount(count) {
    const countElement = document.getElementById('productsCount');
    if (countElement) {
        countElement.textContent = `${count} ${getNoun(count, 'товар', 'товара', 'товаров')}`;
    }
}

function getNoun(number, one, two, five) {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
        return five;
    }
    n %= 10;
    if (n === 1) {
        return one;
    }
    if (n >= 2 && n <= 4) {
        return two;
    }
    return five;
}

// ========================
// ФИЛЬТРЫ И ПОИСК
// ========================

function initFilters() {
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    const closeFiltersBtn = document.getElementById('closeFiltersBtn');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const filtersPanel = document.getElementById('filtersPanel');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', clearFilters);
    }
    
    if (closeFiltersBtn) {
        closeFiltersBtn.addEventListener('click', () => {
            if (filtersPanel) filtersPanel.style.display = 'none';
        });
    }
    
    // Инициализация фильтр-чипсов
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            const group = this.closest('.filter-options');
            group.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Инициализация сортировки
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', applySorting);
    }
    
    // Инициализация ценового диапазона
    const priceSlider = document.getElementById('priceSlider');
    if (priceSlider) {
        priceSlider.addEventListener('input', function() {
            const maxPriceElement = document.getElementById('currentMaxPrice');
            if (maxPriceElement) {
                maxPriceElement.textContent = `${formatPrice(this.value)} ₽`;
            }
        });
    }
}

function applyFilters() {
    const category = document.querySelector('.filter-chip[data-filter="category"].active')?.value || 'all';
    const skinType = document.querySelector('.filter-chip[data-filter="skinType"].active')?.value || 'all';
    const brand = document.querySelector('.filter-chip[data-filter="brand"].active')?.value || 'all';
    const minPrice = parseInt(document.getElementById('minPrice')?.value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPrice')?.value) || 10000;
    
    filteredProducts = allProducts.filter(product => {
        // Фильтр по категории
        if (category !== 'all' && product.category !== category) return false;
        
        // Фильтр по типу кожи
        if (skinType !== 'all' && (!product.skinType || !product.skinType.includes(skinType))) return false;
        
        // Фильтр по бренду
        if (brand !== 'all' && product.brand !== brand) return false;
        
        // Фильтр по цене
        if (product.price < minPrice || product.price > maxPrice) return false;
        
        return true;
    });
    
    // Применяем сортировку
    applySorting();
    
    // Закрываем панель фильтров
    const filtersPanel = document.getElementById('filtersPanel');
    if (filtersPanel) filtersPanel.style.display = 'none';
    
    // Обновляем активные фильтры
    updateActiveFilters(category, skinType, brand, minPrice, maxPrice);
    
    // Загружаем отфильтрованные товары
    renderProducts();
}

function applySorting() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;
    
    const sortBy = sortSelect.value;
    
    switch (sortBy) {
        case 'price_asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'popular':
            filteredProducts.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || b.rating - a.rating);
            break;
        default:
            // По умолчанию - как в исходном массиве
            break;
    }
    
    renderProducts();
}

function clearFilters() {
    // Сброс фильтр-чипсов
    document.querySelectorAll('.filter-chip').forEach(chip => {
        if (chip.dataset.filter === 'category' && chip.value === 'all') {
            chip.classList.add('active');
        } else if (chip.dataset.filter !== 'category') {
            chip.classList.remove('active');
        } else {
            chip.classList.remove('active');
        }
    });
    
    // Сброс ценового диапазона
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const priceSlider = document.getElementById('priceSlider');
    const currentMaxPrice = document.getElementById('currentMaxPrice');
    
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';
    if (priceSlider) priceSlider.value = 10000;
    if (currentMaxPrice) currentMaxPrice.textContent = '10 000 ₽';
    
    // Очистка активных фильтров
    const activeFilters = document.getElementById('activeFilters');
    if (activeFilters) activeFilters.innerHTML = '';
    
    // Сброс сортировки
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'default';
    
    // Загрузка всех товаров
    filteredProducts = [...allProducts];
    renderProducts();
}

function updateActiveFilters(category, skinType, brand, minPrice, maxPrice) {
    const activeFilters = document.getElementById('activeFilters');
    if (!activeFilters) return;
    
    activeFilters.innerHTML = '';
    
    const filters = [];
    
    if (category !== 'all') {
        filters.push({
            name: getCategoryName(category),
            type: 'category',
            value: category
        });
    }
    
    if (skinType !== 'all') {
        const skinTypeNames = {
            'normal': 'Нормальная',
            'dry': 'Сухая',
            'oily': 'Жирная',
            'sensitive': 'Чувствительная'
        };
        filters.push({
            name: skinTypeNames[skinType],
            type: 'skinType',
            value: skinType
        });
    }
    
    if (brand !== 'all') {
        const brandNames = {
            'la_roche': 'La Roche-Posay',
            'cerave': 'CeraVe',
            'ordinary': 'The Ordinary',
            'avene': 'Avene'
        };
        filters.push({
            name: brandNames[brand],
            type: 'brand',
            value: brand
        });
    }
    
    if (minPrice > 0 || maxPrice < 10000) {
        filters.push({
            name: `${formatPrice(minPrice || 0)} - ${formatPrice(maxPrice || 10000)} ₽`,
            type: 'price',
            value: `${minPrice}-${maxPrice}`
        });
    }
    
    filters.forEach(filter => {
        const chip = document.createElement('div');
        chip.className = 'active-filter-chip';
        chip.innerHTML = `
            ${filter.name}
            <button onclick="removeActiveFilter('${filter.type}', '${filter.value}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        activeFilters.appendChild(chip);
    });
}

function removeActiveFilter(type, value) {
    // Сбрасываем соответствующий фильтр
    switch(type) {
        case 'category':
            document.querySelector(`.filter-chip[data-filter="category"][value="all"]`).click();
            break;
        case 'skinType':
            document.querySelector(`.filter-chip[data-filter="skinType"][value="all"]`).click();
            break;
        case 'brand':
            document.querySelector(`.filter-chip[data-filter="brand"][value="all"]`).click();
            break;
        case 'price':
            document.getElementById('minPrice').value = '';
            document.getElementById('maxPrice').value = '';
            document.getElementById('priceSlider').value = 10000;
            document.getElementById('currentMaxPrice').textContent = '10 000 ₽';
            break;
    }
    
    // Переприменяем фильтры
    applyFilters();
}

// ========================
// ПОИСК
// ========================

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            if (searchTerm.length > 0) {
                if (clearSearchBtn) clearSearchBtn.style.display = 'flex';
                
                // Фильтрация товаров по поисковому запросу
                filteredProducts = allProducts.filter(product => 
                    product.name.toLowerCase().includes(searchTerm) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                    getCategoryName(product.category).toLowerCase().includes(searchTerm)
                );
                
                renderProducts();
            } else {
                if (clearSearchBtn) clearSearchBtn.style.display = 'none';
                filteredProducts = [...allProducts];
                renderProducts();
            }
        });
        
        // Обработчик для кнопки очистки
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', function() {
                searchInput.value = '';
                this.style.display = 'none';
                filteredProducts = [...allProducts];
                renderProducts();
            });
        }
    }
}

// ========================
// ЗАГРУЗКА КОРЗИНЫ (для cart.html)
// ========================

function loadCartItems() {
    const itemsList = document.querySelector('.items-list');
    const cartTotal = document.querySelector('.total-amount');
    const emptyCart = document.querySelector('.empty-cart');
    const cartMain = document.querySelector('.cart-main');
    
    if (!itemsList) return;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        if (emptyCart) emptyCart.style.display = 'flex';
        if (cartMain) cartMain.style.display = 'none';
        if (cartTotal) cartTotal.textContent = '0 ₽';
        return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartMain) cartMain.style.display = 'block';
    
    // Очищаем список
    itemsList.innerHTML = '';
    
    let total = 0;
    
    // Создаем элементы для каждого товара
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.productId = item.id;
        
        const priceHTML = item.oldPrice 
            ? `<div class="cart-item-price">${formatPrice(item.price)} ₽</div>
               <div class="cart-item-old-price">${formatPrice(item.oldPrice)} ₽</div>`
            : `<div class="cart-item-price">${formatPrice(item.price)} ₽</div>`;
        
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" 
                     onerror="this.src='https://images.unsplash.com/photo-1556228578-9c360e2d0b4a?w=400&h=400&fit=crop'">
            </div>
            <div class="cart-item-info">
                <h3 class="cart-item-name">${item.name}</h3>
                <div class="cart-item-category">
                    <i class="fas fa-${getCategoryIcon(item.category)}"></i>
                    ${getCategoryName(item.category)}
                </div>
                ${priceHTML}
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn minus" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn plus" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        itemsList.appendChild(cartItem);
    });
    
    // Обновляем общую сумму
    if (cartTotal) {
        cartTotal.textContent = `${formatPrice(total)} ₽`;
    }
}

// ========================
// REAL-TIME ОБНОВЛЕНИЯ
// ========================

function startRealTimeUpdates() {
    if (!db) return;
    
    console.log('🔄 Запускаем real-time обновления...');
    
    db.collection('products')
        .onSnapshot((snapshot) => {
            console.log('📡 Получены изменения из Firestore');
            
            const changes = snapshot.docChanges();
            let hasUpdates = false;
            
            changes.forEach(change => {
                if (change.type === 'added' || change.type === 'modified') {
                    console.log(`🔄 Товар обновлен: ${change.doc.data().name}`);
                    hasUpdates = true;
                }
            });
            
            if (hasUpdates) {
                // Перезагружаем товары
                loadProductsFromFirestore();
                showToast('Товары обновлены', 'info');
            }
        }, (error) => {
            console.error('❌ Ошибка real-time обновлений:', error);
        });
}

// Запускаем real-time обновления через 3 секунды после загрузки
setTimeout(startRealTimeUpdates, 3000);

// ========================
// ДОПОЛНИТЕЛЬНЫЕ СТРАНИЦЫ
// ========================

// Для страницы корзины
if (window.location.pathname.includes('cart.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        loadCartItems();
        updateCartCount();
    });
}

// Для страницы избранного
if (window.location.pathname.includes('favorites.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        loadFavoritesPage();
    });
}

function loadFavoritesPage() {
    const favoritesGrid = document.getElementById('favoritesGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!favoritesGrid) return;
    
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    if (favorites.length === 0) {
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }
    
    favoritesGrid.innerHTML = '';
    
    favorites.forEach(product => {
        const productCard = createProductCard(product);
        favoritesGrid.appendChild(productCard);
    });
}