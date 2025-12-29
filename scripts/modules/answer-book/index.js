// 答案之书模块主类 - 云朵版
import { getRandomAnswer } from './answer-data.js';
import { cssLoader } from '../../utils/css-loader.js';

export default class AnswerBookModule {
    constructor() {
        this.state = 'IDLE'; // IDLE, THINKING, REVEALING, SHOWING
        this.currentAnswer = '';
        this.answerHistory = [];
        this.isHistoryExpanded = false;
        
        // 绑定方法
        this.handleAskClick = this.handleAskClick.bind(this);
        this.toggleHistory = this.toggleHistory.bind(this);
        this.clearHistory = this.clearHistory.bind(this);
    }

    async init(appContainer) {
        try {
            // 1. 注入模块样式
            await this.loadStyles();
            
            // 2. 渲染模块结构
            this.render(appContainer);
            
            // 3. 加载历史记录
            this.loadHistory();
            
            // 4. 绑定事件
            this.bindEvents();
            
            // 5. 创建背景星星
            this.createStars();
            
        } catch (error) {
            console.error('答案之书模块初始化失败:', error);
            appContainer.innerHTML = `
                <div class="card">
                    <h2 class="card-title">答案之书加载失败</h2>
                    <p class="card-content">魔法暂时失效了，请刷新页面重试</p>
                </div>
            `;
        }
    }

    destroy() {
        // 清理事件监听
        const cloudBg = document.querySelector('.cloud-bg');
        const askButton = document.querySelector('.ask-button');
        const historyTab = document.querySelector('.history-tab');
        const clearHistoryBtn = document.querySelector('.clear-history-btn');
        
        if (cloudBg) cloudBg.removeEventListener('click', this.handleAskClick);
        if (askButton) askButton.removeEventListener('click', this.handleAskClick);
        if (historyTab) historyTab.removeEventListener('click', this.toggleHistory);
        if (clearHistoryBtn) clearHistoryBtn.removeEventListener('click', this.clearHistory);
        
        // 清理样式
        cssLoader.unload('answer-book-styles');
    }

    async loadStyles() {
        try {
            await cssLoader.load(
                'scripts/modules/answer-book/answer-book.css',
                'answer-book-styles'
            );
        } catch (error) {
            console.warn('CSS加载失败，使用回退样式:', error);
            this.addFallbackStyles();
        }
    }

    addFallbackStyles() {
        const style = document.createElement('style');
        style.id = 'answer-book-fallback-styles';
        style.textContent = `
            .answer-book-container {
                max-width: 900px;
                margin: 0 auto;
                padding: 2rem 1rem;
                min-height: 100vh;
                background: #fff0f5;
                text-align: center;
            }
            .cloud-bg {
                width: 320px;
                height: 200px;
                margin: 1.5rem auto;
                position: relative;
            }
            .cloud {
                position: absolute;
                width: 180px;
                height: 80px;
                background: white;
                border-radius: 50%;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                box-shadow: 
                    0 0 0 20px white,
                    -50px -20px 0 25px white,
                    50px -25px 0 30px white,
                    -70px 0 0 20px white,
                    70px -10px 0 25px white,
                    -30px 20px 0 15px white,
                    40px 15px 0 20px white;
            }
            .answer-display {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 280px;
                height: 150px;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            }
            .answer-text {
                font-size: 1.5rem;
                color: #333;
                font-family: 'Georgia', serif;
                background: white;
                padding: 1rem;
                border-radius: 10px;
            }
            .ask-button {
                width: 85px;
                height: 85px;
                border-radius: 50%;
                background: linear-gradient(135deg, #F48FB1, #FF8E53);
                color: white;
                border: none;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    render(container) {
        container.innerHTML = `
            <div class="answer-book-container">
                <!-- 标题区域 -->
                <div class="book-header">
                    <h1 class="book-title">答案之书</h1>
                    <p class="book-subtitle">向魔法提问，获取你内心的答案</p>
                </div>
                
                <!-- 云朵背景容器 -->
                <div class="cloud-bg" id="cloud-bg">
                    <div class="cloud" id="cloud"></div>
                    
                    <!-- 答案显示区域 -->
                    <div class="answer-display" id="answer-display">
                        <div class="answer-text" id="answer-text"></div>
                    </div>
                </div>
                
                <!-- 控制区域 -->
                <div class="control-area">
                    <!-- 状态提示 -->
                    <div class="status-indicator" id="status-indicator">
                        准备好了吗？点击魔法球开始提问
                    </div>
                    
                    <!-- 获取答案按钮 -->
                    <button class="ask-button" id="ask-button">
                        <span class="button-text">提问</span>
                        <div class="button-loader"></div>
                    </button>
                    
                    <!-- 操作提示文本 -->
                    <div class="instruction-text">
                        双手合十，专注你的问题，然后点击上方按钮<br>
                        答案仅供参考，最终的选择在你心中
                    </div>
                </div>
                
                <!-- 历史记录区域 -->
                <div class="history-section" id="history-section">
                    <div class="history-tab">
                        <div style="display: flex; align-items: center;">
                            <h3 class="history-tab-title">历史答案</h3>
                            <span class="history-count" id="history-count">0</span>
                        </div>
                        <div class="history-tab-icon">▼</div>
                    </div>
                    
                    <div class="history-content" id="history-content">
                        <ul class="history-list" id="history-list"></ul>
                        <button class="clear-history-btn" id="clear-history-btn">清空历史</button>
                    </div>
                </div>
            </div>
        `;
        
        // 保存重要元素的引用
        this.cloudBg = container.querySelector('#cloud-bg');
        this.cloud = container.querySelector('#cloud');
        this.answerDisplay = container.querySelector('#answer-display');
        this.answerText = container.querySelector('#answer-text');
        this.statusIndicator = container.querySelector('#status-indicator');
        this.askButton = container.querySelector('#ask-button');
        this.historySection = container.querySelector('#history-section');
        this.historyList = container.querySelector('#history-list');
        this.historyContent = container.querySelector('#history-content');
        this.historyTab = container.querySelector('.history-tab');
        this.historyCount = document.querySelector('#history-count');
        this.clearHistoryBtn = document.querySelector('#clear-history-btn');
    }

    async handleAskClick() {
        if (this.state === 'IDLE' || this.state === 'SHOWING') {
            await this.startThinking();
        }
    }

    async startThinking() {
        // 进入思考状态
        this.setState('THINKING');
        
        // 1. 开始思考动画
        this.showThinkingText();
        
        // 2. 播放3秒寻找答案动画
        await this.playSearchingAnimation(3000);
        
        // 3. 获取随机答案
        this.currentAnswer = getRandomAnswer();
        
        // 4. 进入揭示状态
        this.setState('REVEALING');
        
        // 5. 播放答案揭示动画
        await this.playRevealAnimation(this.currentAnswer);
        
        // 6. 进入显示状态
        this.setState('SHOWING');
        
        // 7. 保存到历史记录
        this.addToHistory(this.currentAnswer);
    }

    setState(newState) {
        this.state = newState;
        
        // 更新UI状态
        switch (newState) {
            case 'IDLE':
                this.statusIndicator.textContent = '准备好了吗？点击魔法球开始提问';
                this.statusIndicator.className = 'status-indicator';
                this.cloud.classList.remove('thinking');
                this.askButton.disabled = false;
                this.askButton.classList.remove('loading');
                this.askButton.querySelector('.button-text').textContent = '提问';
                break;
                
            case 'THINKING':
                this.statusIndicator.textContent = '魔法正在寻找答案，请稍候...';
                this.statusIndicator.className = 'status-indicator thinking';
                this.cloud.classList.add('thinking');
                this.askButton.disabled = true;
                this.askButton.classList.add('loading');
                break;
                
            case 'REVEALING':
                this.statusIndicator.textContent = '魔法答案正在显现...';
                break;
                
            case 'SHOWING':
                this.statusIndicator.textContent = '这是魔法给你的答案';
                this.statusIndicator.className = 'status-indicator';
                this.cloud.classList.remove('thinking');
                this.askButton.disabled = false;
                this.askButton.classList.remove('loading');
                this.askButton.querySelector('.button-text').textContent = '再次提问';
                break;
        }
    }

    showThinkingText() {
        // 清空答案文本
        this.answerText.innerHTML = '';
        
        // 显示思考中文本
        const thinkingText = document.createElement('div');
        thinkingText.className = 'thinking-text';
        thinkingText.innerHTML = `
            思考中<span class="dot"></span><span class="dot"></span><span class="dot"></span>
        `;
        this.answerText.appendChild(thinkingText);
        
        // 显示答案区域
        this.answerDisplay.classList.add('show');
    }

    playSearchingAnimation(duration) {
        return new Promise(resolve => {
            // 创建星星动画
            this.createSearchingStars();
            
            setTimeout(() => {
                // 停止星星动画
                this.stopSearchingStars();
                resolve();
            }, duration);
        });
    }

    createSearchingStars() {
        const cloudRect = this.cloudBg.getBoundingClientRect();
        const centerX = cloudRect.left + cloudRect.width / 2;
        const centerY = cloudRect.top + cloudRect.height / 2;
        
        // 创建围绕云朵旋转的星星
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createStar(centerX, centerY, i * 45, 60);
            }, i * 200);
        }
    }

    createStar(centerX, centerY, angle, radius) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // 计算起始位置
        const radians = angle * (Math.PI / 180);
        const startX = centerX + Math.cos(radians) * radius;
        const startY = centerY + Math.sin(radians) * radius;
        
        star.style.left = `${startX}px`;
        star.style.top = `${startY}px`;
        document.querySelector('.answer-book-container').appendChild(star);
        
        // 星星出现动画
        star.animate([
            { opacity: 0, transform: 'scale(0)' },
            { opacity: 1, transform: 'scale(1)', offset: 0.3 },
            { opacity: 0.8, transform: 'scale(0.8)', offset: 0.7 },
            { opacity: 0, transform: 'scale(0)' }
        ], {
            duration: 1500,
            easing: 'ease-in-out'
        });
        
        // 移除星星
        setTimeout(() => {
            if (star.parentNode) star.remove();
        }, 1500);
    }

    stopSearchingStars() {
        // 星星聚集到云朵中心
        const cloudRect = this.cloudBg.getBoundingClientRect();
        const centerX = cloudRect.left + cloudRect.width / 2;
        const centerY = cloudRect.top + cloudRect.height / 2;
        
        // 创建几个聚集的星星
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // 随机起始位置
            const startX = centerX + (Math.random() - 0.5) * 200;
            const startY = centerY + (Math.random() - 0.5) * 200;
            
            star.style.left = `${startX}px`;
            star.style.top = `${startY}px`;
            document.querySelector('.answer-book-container').appendChild(star);
            
            // 向中心聚集
            star.animate([
                { opacity: 0.8, transform: 'scale(1)' },
                { opacity: 0, transform: `translate(${centerX - startX}px, ${centerY - startY}px) scale(0)` }
            ], {
                duration: 800,
                easing: 'ease-in',
                delay: i * 100
            });
            
            // 移除星星
            setTimeout(() => {
                if (star.parentNode) star.remove();
            }, 1500);
        }
    }

    async playRevealAnimation(answer) {
        // 清空思考文本
        this.answerText.innerHTML = '';
        
        // 逐字显示答案
        const chars = answer.split('');
        const delay = 60; // 每个字符的显示延迟
        
        for (let i = 0; i < chars.length; i++) {
            const charSpan = document.createElement('span');
            charSpan.className = 'char';
            charSpan.textContent = chars[i];
            
            // 处理空格
            if (chars[i] === ' ') {
                charSpan.innerHTML = '&nbsp;';
            }
            
            this.answerText.appendChild(charSpan);
            
            // 字符显示动画
            setTimeout(() => {
                charSpan.style.animation = 'char-appear 0.6s ease forwards';
            }, i * delay);
        }
        
        // 等待动画完成
        await new Promise(resolve => {
            setTimeout(resolve, chars.length * delay + 400);
        });
    }

    resetCloud() {
        // 停止思考动画
        this.cloud.classList.remove('thinking');
        
        // 隐藏答案
        this.answerDisplay.classList.remove('show');
        this.answerText.innerHTML = '';
    }

    bindEvents() {
        // 云朵背景点击事件
        if (this.cloudBg) {
            this.cloudBg.addEventListener('click', this.handleAskClick);
        }
        
        // 按钮点击事件
        if (this.askButton) {
            this.askButton.addEventListener('click', this.handleAskClick);
        }
        
        // 历史记录标签页点击事件
        if (this.historyTab) {
            this.historyTab.addEventListener('click', this.toggleHistory);
        }
        
        // 清空历史记录
        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.addEventListener('click', this.clearHistory);
        }
    }

    // 背景星星
    createStars() {
        const container = document.querySelector('.answer-book-container');
        const starCount = 15;
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // 随机位置
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            
            star.style.left = `${left}%`;
            star.style.top = `${top}%`;
            
            // 随机闪烁动画
            const delay = Math.random() * 3;
            const duration = 1 + Math.random() * 2;
            
            star.style.animation = `
                star-twinkle ${duration}s ease-in-out ${delay}s infinite alternate
            `;
            
            // 定义动画
            const style = document.createElement('style');
            style.textContent = `
                @keyframes star-twinkle {
                    0%, 100% { opacity: 0.2; transform: scale(0.8); }
                    50% { opacity: 0.8; transform: scale(1.2); }
                }
            `;
            
            container.appendChild(star);
            if (i === 0) document.head.appendChild(style);
        }
    }

    // 历史记录功能
    loadHistory() {
        const savedHistory = localStorage.getItem('taoci_answer_history');
        if (savedHistory) {
            this.answerHistory = JSON.parse(savedHistory);
            this.renderHistory();
            this.updateHistoryCount();
        }
    }

    saveHistory() {
        localStorage.setItem('taoci_answer_history', JSON.stringify(this.answerHistory));
    }

    addToHistory(answer) {
        const historyItem = {
            answer: answer,
            timestamp: new Date().toLocaleString('zh-CN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        this.answerHistory.unshift(historyItem);
        
        // 最多保存30条记录
        if (this.answerHistory.length > 30) {
            this.answerHistory = this.answerHistory.slice(0, 30);
        }
        
        this.saveHistory();
        this.renderHistory();
        this.updateHistoryCount();
        
        // 如果历史记录是收起的，自动展开
        if (!this.isHistoryExpanded) {
            this.toggleHistory();
        }
    }

    renderHistory() {
        if (!this.historyList) return;
        
        if (this.answerHistory.length === 0) {
            this.historyList.innerHTML = `
                <li class="no-history">
                    还没有历史答案，点击上方按钮开始提问
                </li>
            `;
            return;
        }
        
        this.historyList.innerHTML = this.answerHistory.map((item, index) => `
            <li class="history-item" data-index="${index}">
                <div class="history-answer">${item.answer}</div>
                <div class="history-time">${item.timestamp}</div>
            </li>
        `).join('');
    }

    updateHistoryCount() {
        if (this.historyCount) {
            this.historyCount.textContent = this.answerHistory.length;
        }
    }

    clearHistory() {
        if (confirm('确定要清空所有历史答案吗？')) {
            this.answerHistory = [];
            this.saveHistory();
            this.renderHistory();
            this.updateHistoryCount();
        }
    }

    toggleHistory() {
        this.isHistoryExpanded = !this.isHistoryExpanded;
        
        const historyTabIcon = document.querySelector('.history-tab-icon');
        const historyContent = this.historyContent;
        
        if (this.isHistoryExpanded) {
            historyContent.classList.add('expanded');
            if (historyTabIcon) {
                historyTabIcon.classList.add('expanded');
            }
        } else {
            historyContent.classList.remove('expanded');
            if (historyTabIcon) {
                historyTabIcon.classList.remove('expanded');
            }
        }
    }
}