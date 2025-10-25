/* =====================================================
   Progress Tracking System - Система отслеживания прогресса
   ===================================================== */

class ProgressTracker {
    constructor() {
        this.storageKey = 'mahjongProgress';
        this.progress = this.loadProgress();
    }

    // Загрузить прогресс из LocalStorage
    loadProgress() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Инициализация прогресса по умолчанию
        return {
            sections: {
                basics: false,
                tiles: false,
                yaku: false,
                scoring: false,
                glossary: false
            },
            tests: {
                test1: false,
                test2: false,
                test3: false,
                test4: false,
                test5: false
            },
            yaku_learned: [],
            visits: {
                basics: 0,
                tiles: 0,
                yaku: 0,
                scoring: 0,
                practice: 0,
                glossary: 0
            },
            lastVisit: new Date().toISOString()
        };
    }

    // Сохранить прогресс
    saveProgress() {
        this.progress.lastVisit = new Date().toISOString();
        localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
        this.updateUI();
    }

    // Отметить раздел как изученный
    markSectionComplete(sectionName) {
        if (this.progress.sections.hasOwnProperty(sectionName)) {
            this.progress.sections[sectionName] = true;
            this.saveProgress();
        }
    }

    // Отметить тест как пройденный
    markTestComplete(testNumber) {
        const testKey = `test${testNumber}`;
        if (this.progress.tests.hasOwnProperty(testKey)) {
            this.progress.tests[testKey] = true;
            this.saveProgress();
        }
    }

    // Добавить изученное яку
    addLearnedYaku(yakuName) {
        if (!this.progress.yaku_learned.includes(yakuName)) {
            this.progress.yaku_learned.push(yakuName);
            this.saveProgress();
        }
    }

    // Зарегистрировать посещение страницы
    recordVisit(pageName) {
        if (this.progress.visits.hasOwnProperty(pageName)) {
            this.progress.visits[pageName]++;
            this.saveProgress();
        }
    }

    // Получить общий процент прогресса
    getTotalProgress() {
        const sectionsComplete = Object.values(this.progress.sections).filter(v => v).length;
        const totalSections = Object.keys(this.progress.sections).length;
        
        const testsComplete = Object.values(this.progress.tests).filter(v => v).length;
        const totalTests = Object.keys(this.progress.tests).length;
        
        // Веса: разделы 60%, тесты 40%
        const sectionProgress = (sectionsComplete / totalSections) * 60;
        const testProgress = (testsComplete / totalTests) * 40;
        
        return Math.round(sectionProgress + testProgress);
    }

    // Получить статистику
    getStats() {
        const sectionsComplete = Object.values(this.progress.sections).filter(v => v).length;
        const totalSections = Object.keys(this.progress.sections).length;
        
        const testsComplete = Object.values(this.progress.tests).filter(v => v).length;
        const totalTests = Object.keys(this.progress.tests).length;
        
        return {
            totalProgress: this.getTotalProgress(),
            sectionsComplete,
            totalSections,
            testsComplete,
            totalTests,
            yakuLearned: this.progress.yaku_learned.length,
            totalVisits: Object.values(this.progress.visits).reduce((a, b) => a + b, 0)
        };
    }

    // Обновить UI с прогрессом
    updateUI() {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const sectionsCount = document.getElementById('sectionsCount');
        const testsCount = document.getElementById('testsCount');
        const yakuCount = document.getElementById('yakuCount');
        
        const stats = this.getStats();
        
        if (progressBar) {
            progressBar.style.width = `${stats.totalProgress}%`;
            progressBar.textContent = `${stats.totalProgress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${stats.totalProgress}%`;
        }
        
        if (sectionsCount) {
            sectionsCount.textContent = `${stats.sectionsComplete}/${stats.totalSections}`;
        }
        
        if (testsCount) {
            testsCount.textContent = `${stats.testsComplete}/${stats.totalTests}`;
        }
        
        if (yakuCount) {
            yakuCount.textContent = stats.yakuLearned;
        }
        
        // Обновить чекбоксы разделов
        Object.keys(this.progress.sections).forEach(section => {
            const checkbox = document.getElementById(`section-${section}`);
            if (checkbox) {
                checkbox.checked = this.progress.sections[section];
            }
        });
    }

    // Показать рекомендацию следующего раздела
    getNextRecommendation() {
        const order = ['basics', 'tiles', 'yaku', 'scoring', 'glossary'];
        
        for (let section of order) {
            if (!this.progress.sections[section]) {
                return {
                    section,
                    title: this.getSectionTitle(section),
                    url: `${section}.html`
                };
            }
        }
        
        // Если все разделы пройдены, рекомендовать практику
        if (this.getStats().testsComplete < 5) {
            return {
                section: 'practice',
                title: 'Практика и тесты',
                url: 'practice.html'
            };
        }
        
        return null;
    }

    getSectionTitle(section) {
        const titles = {
            basics: 'Основы игры',
            tiles: 'Фишки маджонга',
            yaku: 'Выигрышные комбинации (Яку)',
            scoring: 'Система подсчета очков',
            glossary: 'Глоссарий терминов',
            practice: 'Практика и тесты'
        };
        return titles[section] || section;
    }

    // Сбросить прогресс (для тестирования)
    resetProgress() {
        if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
            localStorage.removeItem(this.storageKey);
            this.progress = this.loadProgress();
            this.updateUI();
        }
    }

    // Экспортировать прогресс
    exportProgress() {
        const dataStr = JSON.stringify(this.progress, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `mahjong-progress-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
}

// Создать глобальный экземпляр
const progressTracker = new ProgressTracker();

// Автоматически записывать посещение при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Определить текущую страницу
    const path = window.location.pathname;
    const pageName = path.split('/').pop().replace('.html', '') || 'index';
    
    if (pageName !== 'index') {
        progressTracker.recordVisit(pageName);
    }
    
    // Обновить UI
    progressTracker.updateUI();
    
    // Показать рекомендацию
    showRecommendation();
});

// Показать рекомендацию следующего раздела
function showRecommendation() {
    const recommendationElement = document.getElementById('nextRecommendation');
    if (!recommendationElement) return;
    
    const recommendation = progressTracker.getNextRecommendation();
    
    if (recommendation) {
        recommendationElement.innerHTML = `
            <div class="info-box" style="background: linear-gradient(135deg, #e7f3ff 0%, #f0f4ff 100%); border-left: 4px solid #667eea;">
                <strong>📚 Рекомендуем изучить:</strong>
                <p style="margin-top: 0.5rem;">
                    <a href="${recommendation.url}" class="btn" style="text-decoration: none;">
                        ${recommendation.title} →
                    </a>
                </p>
            </div>
        `;
    } else {
        recommendationElement.innerHTML = `
            <div class="success-box">
                <strong>🎉 Поздравляем!</strong>
                <p style="margin-top: 0.5rem;">
                    Вы изучили все разделы учебника! Теперь вы готовы к реальным играм.
                </p>
            </div>
        `;
    }
}

// Функция для отметки раздела как изученного (вызывается вручную)
function markCurrentSectionComplete() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop().replace('.html', '');
    
    if (pageName && pageName !== 'index' && pageName !== 'practice') {
        progressTracker.markSectionComplete(pageName);
        showNotification('✓ Раздел отмечен как изученный!', 'success');
    }
}

// Функция для показа уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#d4edda' : '#e7f3ff'};
        border-left: 4px solid ${type === 'success' ? '#28a745' : '#2196F3'};
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// CSS для анимации уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

