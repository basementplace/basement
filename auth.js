// auth.js - Firebase Authentication
// Замените эти настройки на свои из Firebase Console

// Конфигурация Firebase
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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Проверка авторизации
function checkAuth() {
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged(user => {
            if (user) {
                resolve(user);
            } else {
                resolve(null);
            }
        }, reject);
    });
}

// Регистрация нового пользователя
async function registerUser(email, password, username, phone) {
    try {
        // Создаем пользователя в Firebase Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Создаем профиль в Firestore
        await db.collection('users').doc(user.uid).set({
            username: username,
            email: email,
            phone: phone,
            bio: 'Новый пользователь CosmeSpace',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            stats: {
                orders: 0,
                favorites: 0,
                reviews: 0
            },
            preferences: {
                skinTypes: [],
                brands: []
            },
            settings: {
                notifications: true,
                darkMode: true
            }
        });

        // Сохраняем в localStorage для быстрого доступа
        localStorage.setItem('currentUser', JSON.stringify({
            uid: user.uid,
            email: user.email,
            username: username,
            phone: phone
        }));
        localStorage.setItem('isLoggedIn', 'true');

        return { success: true, user: user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Вход пользователя
async function loginUser(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Получаем данные профиля из Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Сохраняем в localStorage
            localStorage.setItem('currentUser', JSON.stringify({
                uid: user.uid,
                email: user.email,
                username: userData.username,
                phone: userData.phone,
                bio: userData.bio
            }));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userProfile', JSON.stringify({
                username: userData.username,
                bio: userData.bio,
                phone: userData.phone,
                email: user.email
            }));

            return { success: true, user: user, profile: userData };
        } else {
            return { success: false, error: 'Профиль не найден' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Выход пользователя
async function logoutUser() {
    try {
        await auth.signOut();
        clearLocalStorage();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Обновление профиля
async function updateProfile(uid, profileData) {
    try {
        await db.collection('users').doc(uid).update({
            ...profileData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Обновляем localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        localStorage.setItem('currentUser', JSON.stringify({
            ...currentUser,
            username: profileData.username,
            phone: profileData.phone,
            bio: profileData.bio
        }));

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Сброс пароля
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Очистка localStorage
function clearLocalStorage() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userSettings');
    localStorage.removeItem('userPreferences');
    // Оставляем корзину и избранное
}

// Экспорт функций
window.authFunctions = {
    checkAuth,
    registerUser,
    loginUser,
    logoutUser,
    updateProfile,
    resetPassword,
    clearLocalStorage
};