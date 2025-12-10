// firebase-config.js
function initializeFirebase() {
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
    
    try {
        // Проверяем, инициализировано ли Firebase
        if (!firebase.apps.length) {
            // Инициализируем Firebase
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized');
        }
        
        // Возвращаем сервисы Firebase
        return {
            app: firebase.app(),
            auth: firebase.auth(),
            database: firebase.database()
        };
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        throw error;
    }
}