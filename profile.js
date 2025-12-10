// profile.js - Полный рабочий код профиля с Firebase

console.log('🚀 Profile script loading...');

// Firebase конфигурация - ОБЯЗАТЕЛЬНО ЗАМЕНИТЕ НА СВОЮ!
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
let auth = null;
let database = null;

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized');
    }
    
    auth = firebase.auth();
    database = firebase.database();
    console.log('✅ Firebase services loaded');
    
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    showToast('Ошибка инициализации Firebase', 'error');
}

// Глобальные переменные
let currentUser = null;

// Основная функция инициализации
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📱 DOM loaded, starting profile...');
    
    // Показываем скелетоны загрузки
    showLoadingSkeleton();
    
    // Проверяем аутентификацию
    await checkAuth();
});

// Проверка аутентификации
async function checkAuth() {
    console.log('🔐 Checking authentication...');
    
    try {
        // Ждем немного для инициализации Firebase
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Проверяем текущего пользователя Firebase
        if (auth && auth.currentUser) {
            console.log('✅ Firebase user found:', auth.currentUser.email);
            await handleFirebaseUser(auth.currentUser);
            return;
        }
        
        // Если нет пользователя Firebase, проверяем localStorage
        const savedUser = localStorage.getItem('currentUser');
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (savedUser && isLoggedIn === 'true') {
            console.log('📦 Found saved user in localStorage');
            currentUser = JSON.parse(savedUser);
            
            // Загружаем данные из localStorage
            loadFromLocalStorage();
            setupEventListeners();
            hideLoadingSkeleton();
            
            // В фоне пробуем проверить Firebase
            setTimeout(() => {
                checkFirebaseInBackground();
            }, 2000);
            
        } else {
            console.log('❌ No saved session, redirecting to login');
            redirectToLogin();
        }
        
    } catch (error) {
        console.error('❌ Auth check error:', error);
        redirectToLogin();
    }
}

// Обработка пользователя Firebase
async function handleFirebaseUser(firebaseUser) {
    try {
        console.log('👤 Processing Firebase user:', firebaseUser.email);
        
        currentUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
        };
        
        // Сохраняем в localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('lastLogin', Date.now().toString());
        
        // Загружаем или создаем профиль
        await loadOrCreateProfile();
        
        // Настраиваем интерфейс
        setupEventListeners();
        hideLoadingSkeleton();
        
        console.log('✅ Profile ready');
        
    } catch (error) {
        console.error('❌ Error handling Firebase user:', error);
        showToast('Ошибка загрузки профиля', 'error');
        loadFromLocalStorage();
    }
}

// Загрузка или создание профиля
async function loadOrCreateProfile() {
    try {
        if (!currentUser || !currentUser.uid) {
            throw new Error('No user ID');
        }
        
        console.log('📂 Loading profile for user:', currentUser.uid);
        
        // Проверяем, есть ли профиль в Firebase
        if (database) {
            const userRef = database.ref('users/' + currentUser.uid);
            const snapshot = await userRef.once('value');
            
            if (snapshot.exists()) {
                const userData = snapshot.val();
                console.log('✅ Profile loaded from Firebase');
                updateProfileDisplay(userData);
                saveToLocalStorage(userData);
            } else {
                console.log('🆕 Creating new profile in Firebase');
                await createNewProfileInFirebase();
            }
        } else {
            console.log('⚠️ Database not available, using localStorage');
            loadFromLocalStorage();
        }
        
    } catch (error) {
        console.error('❌ Error in loadOrCreateProfile:', error);
        loadFromLocalStorage();
    }
}

// Создание нового профиля в Firebase
async function createNewProfileInFirebase() {
    try {
        const newProfile = {
            username: currentUser.displayName || 'Пользователь',
            bio: 'Расскажите о себе',
            phone: '',
            email: currentUser.email || '',
            avatarBase64: '',
            stats: {
                orders: 0,
                favorites: 0,
                reviews: 0
            },
            settings: {
                notifications: true,
                darkMode: false
            },
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };

        if (database) {
            await database.ref('users/' + currentUser.uid).set(newProfile);
            console.log('✅ New profile created in Firebase');
        }
        
        updateProfileDisplay(newProfile);
        saveToLocalStorage(newProfile);
        
        // Генерируем аватар
        const generatedAvatar = generateAvatar(currentUser.email || currentUser.displayName || 'User');
        document.getElementById('avatarImage').src = generatedAvatar;
        
    } catch (error) {
        console.error('❌ Error creating profile in Firebase:', error);
        throw error;
    }
}

// Обновление отображения профиля
function updateProfileDisplay(userData) {
    console.log('🎨 Updating profile display...');
    
    // Основная информация
    document.getElementById('username').textContent = userData.username || 'Пользователь';
    document.getElementById('userBio').textContent = userData.bio || 'Расскажите о себе';
    document.getElementById('userPhone').textContent = userData.phone || 'Не указан';
    document.getElementById('userEmail').textContent = userData.email || 'Не указан';
    
    // Статистика
    document.getElementById('ordersCount').textContent = userData.stats?.orders || 0;
    document.getElementById('favoritesCount').textContent = userData.stats?.favorites || 0;
    document.getElementById('reviewsCount').textContent = userData.stats?.reviews || 0;
    
    // Заполняем форму редактирования
    document.getElementById('editUsername').value = userData.username || '';
    document.getElementById('editBio').value = userData.bio || '';
    document.getElementById('editPhone').value = userData.phone || '';
    document.getElementById('editEmail').value = userData.email || '';
    
    // Настройки
    const notificationsToggle = document.getElementById('notificationsToggle');
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    if (notificationsToggle) {
        notificationsToggle.checked = userData.settings?.notifications !== false;
    }
    
    if (darkModeToggle) {
        darkModeToggle.checked = userData.settings?.darkMode === true;
        updateDarkMode(userData.settings?.darkMode);
    }
    
    // Обновляем аватар
    if (userData.avatarBase64 && userData.avatarBase64.trim() !== '') {
        document.getElementById('avatarImage').src = userData.avatarBase64;
    } else {
        const generatedAvatar = generateAvatar(userData.email || userData.username || 'User');
        document.getElementById('avatarImage').src = generatedAvatar;
    }
    
    console.log('✅ Profile display updated');
}

// Сохранение в localStorage
function saveToLocalStorage(userData) {
    try {
        localStorage.setItem('userProfile', JSON.stringify(userData));
        
        if (userData.avatarBase64) {
            localStorage.setItem('userAvatar', userData.avatarBase64);
        }
        
        console.log('💾 Profile saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
    }
}

// Загрузка из localStorage
function loadFromLocalStorage() {
    try {
        const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
            username: 'Пользователь',
            bio: 'Расскажите о себе',
            phone: 'Не указан',
            email: currentUser?.email || 'Не указан',
            stats: { orders: 0, favorites: 0, reviews: 0 },
            settings: { notifications: true, darkMode: false }
        };
        
        updateProfileDisplay(userProfile);
        
        // Загружаем аватар
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
            document.getElementById('avatarImage').src = savedAvatar;
        }
        
        console.log('📦 Profile loaded from localStorage');
        
    } catch (error) {
        console.error('❌ Error loading from localStorage:', error);
        
        // Отображаем базовые данные
        document.getElementById('username').textContent = 'Пользователь';
        document.getElementById('userBio').textContent = 'Расскажите о себе';
        document.getElementById('userEmail').textContent = currentUser?.email || 'Не указан';
    }
}

// Фоновая проверка Firebase
async function checkFirebaseInBackground() {
    try {
        if (auth && auth.currentUser) {
            console.log('🔄 Background check: Firebase user exists');
            await loadOrCreateProfile();
        }
    } catch (error) {
        console.log('⚠️ Background check failed:', error);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // Редактирование профиля
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileModal = document.getElementById('editProfileModal');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Модальные окна
    const logoutConfirmModal = document.getElementById('logoutConfirmModal');
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    
    // Загрузка аватара
    const avatarUploadModal = document.getElementById('avatarUploadModal');
    const galleryOption = document.getElementById('galleryOption');
    const generateAvatarOption = document.getElementById('generateAvatarOption');
    const avatarFileInput = document.getElementById('avatarFileInput');
    
    // === РЕДАКТИРОВАНИЕ ПРОФИЛЯ ===
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            editProfileModal.style.display = 'flex';
            console.log('📝 Edit profile modal opened');
        });
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            editProfileModal.style.display = 'none';
        });
    }
    
    if (editProfileModal) {
        editProfileModal.addEventListener('click', (e) => {
            if (e.target === editProfileModal || e.target.classList.contains('modal-close')) {
                editProfileModal.style.display = 'none';
            }
        });
    }
    
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }
    
    // === ЗАГРУЗКА АВАТАРА ===
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', () => {
            avatarUploadModal.style.display = 'flex';
            console.log('🖼️ Avatar upload modal opened');
        });
    }
    
    if (galleryOption) {
        galleryOption.addEventListener('click', () => {
            avatarFileInput.click();
        });
    }
    
    if (generateAvatarOption) {
        generateAvatarOption.addEventListener('click', generateNewAvatar);
    }
    
    if (avatarFileInput) {
        avatarFileInput.addEventListener('change', handleAvatarUpload);
    }
    
    if (avatarUploadModal) {
        const avatarModalClose = avatarUploadModal.querySelector('.modal-close');
        if (avatarModalClose) {
            avatarModalClose.addEventListener('click', () => {
                avatarUploadModal.style.display = 'none';
            });
        }
        
        avatarUploadModal.addEventListener('click', (e) => {
            if (e.target === avatarUploadModal) {
                avatarUploadModal.style.display = 'none';
            }
        });
    }
    
    // === ВЫХОД ИЗ АККАУНТА ===
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logoutConfirmModal.style.display = 'flex';
            console.log('👋 Logout confirmation requested');
        });
    }
    
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', performLogout);
    }
    
    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener('click', () => {
            logoutConfirmModal.style.display = 'none';
        });
    }
    
    if (logoutConfirmModal) {
        logoutConfirmModal.addEventListener('click', (e) => {
            if (e.target === logoutConfirmModal || e.target.classList.contains('modal-close')) {
                logoutConfirmModal.style.display = 'none';
            }
        });
    }
    
    // === НАСТРОЙКИ ===
    const notificationsToggle = document.getElementById('notificationsToggle');
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', saveSettings);
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            saveSettings();
            updateDarkMode(darkModeToggle.checked);
        });
    }
    
    console.log('✅ Event listeners setup complete');
}

// === ФУНКЦИИ ПРОФИЛЯ ===

// Сохранение профиля
async function saveProfile() {
    console.log('💾 Saving profile...');
    
    const username = document.getElementById('editUsername').value.trim();
    const bio = document.getElementById('editBio').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    
    // Валидация
    if (!username) {
        showToast('Введите имя пользователя', 'error');
        return;
    }
    
    // Показываем загрузку
    const saveBtn = document.getElementById('saveProfileBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
    saveBtn.disabled = true;
    
    try {
        const profileData = {
            username: username,
            bio: bio,
            phone: phone,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        // Сохраняем в Firebase
        if (database && currentUser?.uid) {
            await database.ref('users/' + currentUser.uid).update(profileData);
            console.log('✅ Profile saved to Firebase');
        }
        
        // Обновляем интерфейс
        document.getElementById('username').textContent = username;
        document.getElementById('userBio').textContent = bio || 'Расскажите о себе';
        document.getElementById('userPhone').textContent = phone || 'Не указан';
        
        // Обновляем localStorage
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const updatedProfile = { ...userProfile, ...profileData };
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        
        // Обновляем currentUser
        if (currentUser) {
            currentUser.displayName = username;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        // Закрываем модальное окно
        document.getElementById('editProfileModal').style.display = 'none';
        
        showToast('Профиль сохранен!', 'success');
        
    } catch (error) {
        console.error('❌ Error saving profile:', error);
        showToast('Ошибка сохранения профиля', 'error');
        
    } finally {
        // Восстанавливаем кнопку
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

// Обработка загрузки аватара
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('📸 Processing avatar upload...');
    
    // Проверка размера (макс. 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Файл слишком большой (макс. 5MB)', 'error');
        return;
    }
    
    // Проверка типа
    if (!file.type.match('image.*')) {
        showToast('Выберите изображение', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        try {
            // Сжимаем изображение
            const compressedBase64 = await compressImage(e.target.result, 300, 300, 0.8);
            
            // Сохраняем аватар
            await saveAvatar(compressedBase64);
            
        } catch (error) {
            console.error('❌ Avatar processing error:', error);
            showToast('Ошибка обработки изображения', 'error');
        }
    };
    
    reader.onerror = function() {
        showToast('Ошибка чтения файла', 'error');
    };
    
    reader.readAsDataURL(file);
}

// Сжатие изображения
function compressImage(base64, maxWidth, maxHeight, quality) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64;
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Рассчитываем новые размеры
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round(height * maxWidth / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round(width * maxHeight / height);
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedBase64);
        };
        
        img.onerror = reject;
    });
}

// Сохранение аватара
async function saveAvatar(avatarBase64) {
    try {
        // Закрываем модальное окно
        document.getElementById('avatarUploadModal').style.display = 'none';
        
        // Показываем загрузку
        showToast('Сохранение аватара...', 'success');
        
        // Сохраняем в Firebase
        if (database && currentUser?.uid) {
            await database.ref('users/' + currentUser.uid).update({
                avatarBase64: avatarBase64,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            });
            console.log('✅ Avatar saved to Firebase');
        }
        
        // Обновляем интерфейс
        document.getElementById('avatarImage').src = avatarBase64;
        
        // Сохраняем в localStorage
        localStorage.setItem('userAvatar', avatarBase64);
        
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        userProfile.avatarBase64 = avatarBase64;
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        showToast('Аватар обновлен!', 'success');
        
    } catch (error) {
        console.error('❌ Error saving avatar:', error);
        showToast('Ошибка сохранения аватара', 'error');
    }
}

// Генерация нового аватара
async function generateNewAvatar() {
    try {
        console.log('🎨 Generating new avatar...');
        
        // Закрываем модальное окно
        document.getElementById('avatarUploadModal').style.display = 'none';
        
        const generatedAvatar = generateAvatar(currentUser?.email || currentUser?.displayName || 'User');
        
        // Показываем загрузку
        showToast('Генерация аватара...', 'success');
        
        // Сохраняем в Firebase
        if (database && currentUser?.uid) {
            await database.ref('users/' + currentUser.uid).update({
                avatarBase64: generatedAvatar,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            });
            console.log('✅ Generated avatar saved to Firebase');
        }
        
        // Обновляем интерфейс
        document.getElementById('avatarImage').src = generatedAvatar;
        
        // Сохраняем в localStorage
        localStorage.setItem('userAvatar', generatedAvatar);
        
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        userProfile.avatarBase64 = generatedAvatar;
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        showToast('Аватар сгенерирован!', 'success');
        
    } catch (error) {
        console.error('❌ Error generating avatar:', error);
        showToast('Ошибка генерации аватара', 'error');
    }
}

// Генерация аватара
function generateAvatar(seed) {
    if (!seed) seed = 'user' + Date.now();
    
    const colors = [
        '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0',
        '#118AB2', '#073B4C', '#EF476F', '#7209B7',
        '#3A86FF', '#FB5607', '#8338EC', '#FF006E'
    ];
    
    const colorIndex = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const color = colors[colorIndex];
    
    const nameParts = seed.split(/[@._\s-]+/);
    let initials = 'U';
    
    if (nameParts.length > 1) {
        initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    } else if (seed.length >= 2) {
        initials = seed.substring(0, 2).toUpperCase();
    }
    
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
            <rect width="200" height="200" fill="${color}" rx="100"/>
            <text x="100" y="115" text-anchor="middle" fill="white" font-family="Arial, sans-serif" 
                  font-size="70" font-weight="bold" dy="0.35em">${initials}</text>
        </svg>
    `;
    
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

// Сохранение настроек
async function saveSettings() {
    try {
        if (!currentUser?.uid) return;
        
        const notificationsToggle = document.getElementById('notificationsToggle');
        const darkModeToggle = document.getElementById('darkModeToggle');
        
        const settings = {
            notifications: notificationsToggle ? notificationsToggle.checked : true,
            darkMode: darkModeToggle ? darkModeToggle.checked : false
        };
        
        // Сохраняем в Firebase
        if (database) {
            await database.ref('users/' + currentUser.uid + '/settings').update(settings);
            console.log('✅ Settings saved to Firebase');
        }
        
        // Обновляем localStorage
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        if (!userProfile.settings) userProfile.settings = {};
        userProfile.settings = { ...userProfile.settings, ...settings };
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        console.log('⚙️ Settings updated');
        
    } catch (error) {
        console.error('❌ Error saving settings:', error);
    }
}

// Обновление темной темы
function updateDarkMode(isDarkMode) {
    if (isDarkMode) {
        document.body.style.backgroundColor = '#1C1C1E';
        document.body.style.color = '#FFFFFF';
    } else {
        document.body.style.backgroundColor = '#FFFFFF';
        document.body.style.color = '#000000';
    }
}

// Выход из аккаунта
async function performLogout() {
    console.log('👋 Starting logout process...');
    
    try {
        // Закрываем модальное окно
        document.getElementById('logoutConfirmModal').style.display = 'none';
        
        // Показываем загрузку
        const logoutBtn = document.getElementById('logoutBtn');
        const originalText = logoutBtn.innerHTML;
        logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Выход...';
        logoutBtn.disabled = true;
        
        // Устанавливаем флаг выхода
        localStorage.setItem('isLoggingOut', 'true');
        
        // Выход из Firebase
        if (auth) {
            try {
                await auth.signOut();
                console.log('✅ Signed out from Firebase');
            } catch (firebaseError) {
                console.log('⚠️ Firebase sign out error:', firebaseError);
            }
        }
        
        // Очищаем localStorage (сохраняем только флаг выхода)
        const isLoggingOut = localStorage.getItem('isLoggingOut');
        localStorage.clear();
        localStorage.setItem('isLoggingOut', isLoggingOut);
        
        // Устанавливаем куку с временной меткой
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (5 * 60 * 1000));
        document.cookie = "logout_time=" + Date.now() + "; expires=" + expiryDate.toUTCString() + "; path=/";
        
        console.log('🔄 Redirecting to login...');
        
        // Перенаправляем на страницу входа
        setTimeout(() => {
            window.location.href = 'login.html?logout=success';
        }, 500);
        
    } catch (error) {
        console.error('❌ Logout error:', error);
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.innerHTML = originalText;
            logoutBtn.disabled = false;
        }
        
        showToast('Ошибка при выходе', 'error');
    }
}

// Перенаправление на страницу входа
function redirectToLogin() {
    console.log('🔄 Redirecting to login page...');
    
    // Показываем сообщение
    showToast('Пожалуйста, войдите в систему', 'warning');
    
    // Перенаправляем через 1 секунду
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// Скелетоны загрузки
function showLoadingSkeleton() {
    const elements = ['username', 'userBio', 'userPhone', 'userEmail', 'ordersCount', 'favoritesCount', 'reviewsCount'];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('skeleton-loading');
            element.textContent = ' ';
        }
    });
    
    // Скелетон для аватара
    const avatar = document.getElementById('avatarImage');
    if (avatar) {
        avatar.classList.add('skeleton-loading');
    }
    
    console.log('⏳ Showing loading skeleton');
}

function hideLoadingSkeleton() {
    const elements = ['username', 'userBio', 'userPhone', 'userEmail', 'ordersCount', 'favoritesCount', 'reviewsCount'];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove('skeleton-loading');
        }
    });
    
    // Убираем скелетон с аватара
    const avatar = document.getElementById('avatarImage');
    if (avatar) {
        avatar.classList.remove('skeleton-loading');
    }
    
    console.log('✅ Loading skeleton hidden');
}

// Показать уведомление
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast ' + type;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Добавляем CSS для скелетонов
const skeletonStyles = `
    .skeleton-loading {
        background: linear-gradient(90deg, #3A3A3C 25%, #48484A 50%, #3A3A3C 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 4px;
        color: transparent !important;
    }
    
    .skeleton-loading#avatarImage {
        background: linear-gradient(90deg, #3A3A3C 25%, #48484A 50%, #3A3A3C 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border: none !important;
    }
    
    @keyframes loading {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }
`;

// Вставляем стили
const styleSheet = document.createElement("style");
styleSheet.textContent = skeletonStyles;
document.head.appendChild(styleSheet);

console.log('✅ Profile script loaded successfully');