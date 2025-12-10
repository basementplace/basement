// register.js
document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const registerForm = document.getElementById('registerForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const registerBtn = document.getElementById('registerBtn');
    const usernameCheck = document.getElementById('usernameCheck');
    const passwordStrength = document.querySelector('.password-strength');
    const strengthBar = passwordStrength.querySelector('.strength-bar');
    const strengthText = passwordStrength.querySelector('.strength-text');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
    
    // Список занятых логинов
    const takenUsernames = ['admin', 'user', 'test', 'demo'];
    
    // Инициализация
    initPhoneMask();
    
    // Валидация в реальном времени
    fullNameInput.addEventListener('blur', validateFullName);
    emailInput.addEventListener('blur', validateEmail);
    usernameInput.addEventListener('input', checkUsernameAvailability);
    passwordInput.addEventListener('input', checkPasswordStrength);
    confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
    
    // Обработчики показа/скрытия пароля
    togglePasswordBtn.addEventListener('click', function() {
        togglePasswordVisibility(passwordInput, this);
    });
    
    toggleConfirmPasswordBtn.addEventListener('click', function() {
        togglePasswordVisibility(confirmPasswordInput, this);
    });
    
    // Обработчик формы регистрации
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validateRegistrationForm()) {
            await registerUser();
        }
    });
    
    // Функции
    function initPhoneMask() {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length === 0) return;
            
            if (!value.startsWith('7') && !value.startsWith('8')) {
                value = '7' + value;
            }
            
            let formatted = '+7 ';
            
            if (value.length > 1) {
                formatted += '(' + value.substring(1, 4);
            }
            if (value.length >= 5) {
                formatted += ') ' + value.substring(4, 7);
            }
            if (value.length >= 8) {
                formatted += '-' + value.substring(7, 9);
            }
            if (value.length >= 10) {
                formatted += '-' + value.substring(9, 11);
            }
            
            e.target.value = formatted;
        });
    }
    
    function validateFullName() {
        const name = fullNameInput.value.trim();
        const isValid = name.split(' ').length >= 2 && name.length >= 5;
        
        updateInputValidation(fullNameInput, isValid, 'Введите имя и фамилию');
        return isValid;
    }
    
    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        
        updateInputValidation(emailInput, isValid, 'Введите корректный email');
        return isValid;
    }
    
    function checkUsernameAvailability() {
        const username = usernameInput.value.trim().toLowerCase();
        
        if (username.length < 3) {
            usernameCheck.textContent = '';
            usernameCheck.className = 'username-available';
            return false;
        }
        
        const isAvailable = !takenUsernames.includes(username);
        
        if (isAvailable) {
            usernameCheck.textContent = '✓ Доступен';
            usernameCheck.className = 'username-available available';
        } else {
            usernameCheck.textContent = '✗ Занят';
            usernameCheck.className = 'username-available taken';
        }
        
        return isAvailable;
    }
    
    function checkPasswordStrength() {
        const password = passwordInput.value;
        let strength = 0;
        
        // Проверяем длину
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        
        // Проверяем наличие цифр
        if (/\d/.test(password)) strength++;
        
        // Проверяем наличие букв в разных регистрах
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        
        // Проверяем наличие спецсимволов
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // Обновляем отображение
        strengthBar.className = 'strength-bar';
        
        if (password.length === 0) {
            strengthText.textContent = '';
            return;
        }
        
        if (strength <= 2) {
            strengthBar.classList.add('weak');
            strengthText.textContent = 'Слабый';
            strengthText.style.color = '#FF3B30';
        } else if (strength <= 4) {
            strengthBar.classList.add('medium');
            strengthText.textContent = 'Средний';
            strengthText.style.color = '#FFD60A';
        } else {
            strengthBar.classList.add('strong');
            strengthText.textContent = 'Надежный';
            strengthText.style.color = '#30D158';
        }
        
        return strength;
    }
    
    function validateConfirmPassword() {
        const password = passwordInput.value;
        const confirm = confirmPasswordInput.value;
        const isValid = password === confirm && password.length > 0;
        
        updateInputValidation(confirmPasswordInput, isValid, 'Пароли не совпадают');
        return isValid;
    }
    
    function validateRegistrationForm() {
        const isNameValid = validateFullName();
        const isEmailValid = validateEmail();
        const isUsernameValid = checkUsernameAvailability() && usernameInput.value.trim().length >= 3;
        const isPasswordValid = passwordInput.value.length >= 6;
        const isConfirmValid = validateConfirmPassword();
        const termsAccepted = document.getElementById('terms').checked;
        
        if (!termsAccepted) {
            showToast('Примите условия использования', 'error');
            return false;
        }
        
        return isNameValid && isEmailValid && isUsernameValid && isPasswordValid && isConfirmValid;
    }
    
    function updateInputValidation(input, isValid, errorMessage) {
        const parent = input.parentElement;
        
        // Удаляем предыдущие сообщения об ошибке
        const existingError = parent.nextElementSibling;
        if (existingError && existingError.classList.contains('error-message')) {
            existingError.remove();
        }
        
        // Обновляем стили
        input.classList.remove('error', 'success');
        
        if (input.value.trim() === '') {
            return;
        }
        
        if (isValid) {
            input.classList.add('success');
        } else {
            input.classList.add('error');
            // Добавляем сообщение об ошибке
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.style.color = '#FF3B30';
            errorElement.style.fontSize = '12px';
            errorElement.style.marginTop = '4px';
            errorElement.style.marginLeft = '48px';
            errorElement.textContent = errorMessage;
            parent.parentElement.appendChild(errorElement);
        }
    }
    
    function togglePasswordVisibility(input, button) {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        button.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    }
    
    async function registerUser() {
        const userData = {
            name: fullNameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim() || null,
            username: usernameInput.value.trim().toLowerCase(),
            password: passwordInput.value,
            newsletter: document.getElementById('newsletter').checked,
            registeredAt: new Date().toISOString()
        };
        
        // Показываем индикатор загрузки
        const originalText = registerBtn.innerHTML;
        registerBtn.innerHTML = '<span class="loader"></span>';
        registerBtn.disabled = true;
        
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        try {
            // Сохраняем пользователя в localStorage (в реальном приложении - запрос к серверу)
            saveUser(userData);
            
            // Автоматически входим после регистрации
            const sessionData = {
                userId: Date.now(),
                username: userData.username,
                email: userData.email,
                name: userData.name,
                isAdmin: false,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('currentUser', JSON.stringify(sessionData));
            localStorage.setItem('isLoggedIn', 'true');
            
            // Показываем успех
            showToast('Регистрация успешна! Добро пожаловать!', 'success');
            
            // Перенаправляем на главную через 2 секунды
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
        } catch (error) {
            showToast('Ошибка регистрации. Попробуйте позже.', 'error');
        } finally {
            // Восстанавливаем кнопку
            registerBtn.innerHTML = originalText;
            registerBtn.disabled = false;
        }
    }
    
    function saveUser(userData) {
        // В реальном приложении здесь был бы запрос к серверу
        // Для демонстрации сохраняем в localStorage
        
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        
        // Проверяем, нет ли уже пользователя с таким email или username
        const existingUser = users.find(user => 
            user.email === userData.email || user.username === userData.username
        );
        
        if (existingUser) {
            throw new Error('Пользователь уже существует');
        }
        
        // Хешируем пароль (в реальном приложении это делается на сервере)
        const hashedPassword = btoa(userData.password); // Простая демонстрация
        
        users.push({
            ...userData,
            password: hashedPassword, // В реальном приложении здесь должен быть хеш
            id: Date.now()
        });
        
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        // Добавляем логин в список занятых
        takenUsernames.push(userData.username);
    }
    
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.display = 'block';
        
        switch(type) {
            case 'error':
                toast.style.background = 'rgba(255, 59, 48, 0.9)';
                break;
            case 'success':
                toast.style.background = 'rgba(48, 209, 88, 0.9)';
                break;
            default:
                toast.style.background = 'rgba(40, 40, 40, 0.9)';
        }
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
});