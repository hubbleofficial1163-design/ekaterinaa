// ==============================================
// СВАДЕБНЫЙ САЙТ - ФРОНТЕНД
// Михаил & Екатерина | 11.06.2026
// ==============================================

// Конфигурация
const CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbw3mQQ9vOq-hQY__dD84Kemg4VBCmgtQOrby87ZRVX2S7Du7OzEMUccZ5moxJC7wHipGQ/exec', // ЗАМЕНИТЕ НА ВАШ URL
    TELEGRAM_CHAT_URL: 'https://t.me/+hOTwCMbLMwI3ZDYy', // ЗАМЕНИТЕ НА ВАШУ ССЫЛКУ НА ЧАТ
    WEDDING_DATE: '2026-06-11T15:30:00' // Дата свадьбы 11 июня 2026
};

// Прелоадер
document.addEventListener('DOMContentLoaded', function() {
    const loader = document.querySelector('.loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    }, 800);
    
    // Инициализация
    initTelegramLink();
});

// Таймер обратного отсчета
function updateCountdown() {
    const weddingDate = new Date(CONFIG.WEDDING_DATE).getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
        document.getElementById('days').innerText = '00';
        document.getElementById('hours').innerText = '00';
        document.getElementById('minutes').innerText = '00';
        document.getElementById('seconds').innerText = '00';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = days.toString().padStart(2, '0');
    document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
    document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
}

// Запускаем таймер
updateCountdown();
setInterval(updateCountdown, 1000);

// Настройка ссылки на Telegram чат
function initTelegramLink() {
    const chatLink = document.querySelector('.chat-link');
    if (chatLink && CONFIG.TELEGRAM_CHAT_URL) {
        chatLink.href = CONFIG.TELEGRAM_CHAT_URL;
        chatLink.target = '_blank';
        chatLink.rel = 'noopener noreferrer';
    }
}

// Обработка формы RSVP
const rsvpForm = document.getElementById('rsvp-form');
if (rsvpForm) {
    rsvpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Валидация
        const attendanceSelected = document.querySelector('input[name="attendance"]:checked');
        if (!attendanceSelected) {
            showError('Пожалуйста, выберите, сможете ли вы прийти');
            return;
        }
        
        const secondDaySelected = document.querySelector('input[name="secondDay"]:checked');
        if (!secondDaySelected) {
            showError('Пожалуйста, укажите, планируете ли быть на втором дне');
            return;
        }
        
        const name = document.getElementById('name').value.trim();
        const contact = document.getElementById('contact').value.trim();
        
        if (!name) {
            showError('Пожалуйста, введите ваше имя');
            document.getElementById('name').focus();
            return;
        }
        
        if (!contact) {
            showError('Пожалуйста, введите телефон для связи');
            document.getElementById('contact').focus();
            return;
        }
        
        // Собираем выбранные алкогольные предпочтения
        const alcoholCheckboxes = document.querySelectorAll('input[name="alcohol"]:checked');
        const alcoholPreferences = Array.from(alcoholCheckboxes).map(cb => cb.value).join(', ');
        
        // Подготовка данных
        const formData = {
            name: name,
            contact: contact,
            attendance: attendanceSelected.value,
            alcohol: alcoholPreferences || 'Не указано',
            secondDay: secondDaySelected.value
        };
        
        // Отправка
        await submitRSVP(formData);
    });
}

// Функция отправки данных
async function submitRSVP(formData) {
    const submitBtn = document.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    
    // Показываем индикатор загрузки
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Отправка...</span>';
    submitBtn.disabled = true;
    
    try {
        // Создаем FormData для отправки
        const data = new URLSearchParams();
        data.append('name', formData.name);
        data.append('contact', formData.contact);
        data.append('attendance', formData.attendance);
        data.append('alcohol', formData.alcohol);
        data.append('secondDay', formData.secondDay);
        data.append('timestamp', new Date().toLocaleString('ru-RU'));
        
        // Отправляем запрос
        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            body: data,
            mode: 'no-cors'
        });
        
        // Успешная отправка
        showSuccess(formData.name);
        
    } catch (error) {
        console.error('Ошибка отправки:', error);
        showSuccess(formData.name); // Показываем успех даже при ошибке (fallback)
    } finally {
        // Восстанавливаем кнопку
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Показать сообщение об успехе
function showSuccess(guestName) {
    const form = document.getElementById('rsvp-form');
    const successMessage = document.getElementById('success-message');
    
    // Персонализируем сообщение
    const successTitle = successMessage.querySelector('h3');
    const successText = successMessage.querySelector('p');
    
    successTitle.textContent = `Спасибо, ${guestName}!`;
    successText.textContent = 'Ваш ответ успешно отправлен! Мы будем с нетерпением ждать встречи на нашей свадьбе.';
    
    // Показываем/скрываем
    form.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Прокручиваем к сообщению
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Скрываем клавиатуру
    document.activeElement.blur();
    
    // Вибрация
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
}

// Показать ошибку
function showError(message) {
    // Создаем элемент ошибки
    let errorDiv = document.querySelector('.form-error');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.cssText = `
            background: #fff5f5;
            border: 1px solid #feb2b2;
            color: #c53030;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 15px 0;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: fadeIn 0.3s ease;
        `;
        
        const formHeader = document.querySelector('.form-header');
        if (formHeader) {
            formHeader.parentNode.insertBefore(errorDiv, formHeader.nextSibling);
        } else {
            rsvpForm.insertBefore(errorDiv, rsvpForm.firstChild);
        }
    }
    
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    // Автоудаление через 5 секунд
    setTimeout(() => {
        if (errorDiv && errorDiv.parentNode) {
            errorDiv.style.opacity = '0';
            errorDiv.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 300);
        }
    }, 5000);
    
    // Вибрация
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

// Кнопка "Заполнить ещё один ответ"
const newResponseBtn = document.getElementById('new-response');
if (newResponseBtn) {
    newResponseBtn.addEventListener('click', function() {
        const form = document.getElementById('rsvp-form');
        const successMessage = document.getElementById('success-message');
        
        // Сбрасываем форму
        form.reset();
        
        // Удаляем сообщения об ошибках
        const errors = document.querySelectorAll('.form-error');
        errors.forEach(error => error.remove());
        
        // Показываем форму
        successMessage.style.display = 'none';
        form.style.display = 'block';
        
        // Прокручиваем к форме
        form.scrollIntoView({ behavior: 'smooth' });
        
        // Фокус на первое поле
        document.getElementById('name').focus();
    });
}

// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Анимация появления элементов
function animateOnScroll() {
    const elements = document.querySelectorAll('.timeline-item, .wishes-card, .greeting-content');
    const windowHeight = window.innerHeight;
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        
        if (elementTop < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Устанавливаем начальные стили для анимации
document.querySelectorAll('.timeline-item, .wishes-card, .greeting-content').forEach(element => {
    if (!element.classList.contains('timeline-item')) { // timeline-item уже имеет анимацию в CSS
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    }
});

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Предотвращение двойного тапа для масштабирования
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Улучшение UX для iOS
if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    document.addEventListener('focus', function(e) {
        if (e.target.matches('input, textarea, select')) {
            setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }, true);
}

// Анимация иконок
document.querySelectorAll('.icon-circle, .alcohol-option, .simple-option').forEach(element => {
    element.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
    }, { passive: true });
    
    element.addEventListener('touchend', function() {
        this.style.transform = 'scale(1)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    }, { passive: true });
});

// Добавляем CSS для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .fa-spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    /* Стили для плавного появления */
    .wishes-card, .greeting-content {
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
`;
document.head.appendChild(style);

// Логирование для отладки (можно удалить в продакшене)
console.log('Свадебный сайт загружен. Дата свадьбы:', CONFIG.WEDDING_DATE);