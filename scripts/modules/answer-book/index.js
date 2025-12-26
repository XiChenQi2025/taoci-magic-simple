// 答案之书模块主类
import { getRandomAnswer } from './answer-data.js';

export default class AnswerBookModule {
    constructor() {
        this.state = 'IDLE'; // IDLE, THINKING, REVEALING, SHOWING
        this.currentAnswer = '';
        this.answerHistory = [];
        this.isHistoryOpen = false;
        
        // 绑定方法
        this.handleAskClick = this.handleAskClick.bind(this);
        this.toggleHistory = this.toggleHistory.bind(this);
        this.clearHistory = this.clearHistory.bind(this);
    }

    async init(appContainer) {
        try {
            // 1. 注入模块样式
            this.injectStyles();
            
            // 2. 渲染模块结构
            this.render(appContainer);
            
            // 3. 加载历史记录
            this.loadHistory();
            
            // 4. 绑定事件
            this.bindEvents();
            
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
        const book = document.querySelector('.book');
        const askButton = document.querySelector('.ask-button');
        const historyToggle = document.querySelector('.history-toggle');
        const closeHistory = document.querySelector('.close-history');
        const clearHistoryBtn = document.querySelector('.clear-history');
        
        if (book) book.removeEventListener('click', this.handleAskClick);
        if (askButton) askButton.removeEventListener('click', this.handleAskClick);
        if (historyToggle) historyToggle.removeEventListener('click', this.toggleHistory);
        if (closeHistory) closeHistory.removeEventListener('click', this.toggleHistory);
        if (clearHistoryBtn) clearHistoryBtn.removeEventListener('click', this.clearHistory);
        
        // 清理样式
        const style = document.getElementById('answer-book-styles');
        if (style) style.remove();
        
        const link = document.getElementById('answer-book-styles-external');
        if (link) link.remove();
    }

    injectStyles() {
        // 检查是否已注入样式
        if (!document.getElementById('answer-book-styles-external')) {
            // 动态加载外部CSS文件（使用主骨架的模块样式路径）
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/styles/modules/answer-book.css'; // 修正为正确的路径
            link.id = 'answer-book-styles-external';
            document.head.appendChild(link);
        }
    }

    render(container) {
        container.innerHTML = `
            <div class="answer-book-container">
                <!-- 背景光效 -->
                <div class="background-glow" id="background-glow"></div>
                
                <!-- 粒子容器 -->
                <div class="particle-container" id="particle-container"></div>
                
                <!-- 标题区域 -->
                <div class="book-header">
                    <h1 class="book-title">答案之书</h1>
                    <p class="book-subtitle">请在心中思考你的问题，然后点击下方书本</p>
                    <p class="book-disclaimer">本玩法仅供娱乐，切勿迷信</p>
                </div>
                
                <!-- 书本容器 -->
                <div class="book-container">
                    <div class="book-glow"></div>
                    <div class="book">
                        <div class="book-cover">
                            <div class="book-spine"></div>
                            <div class="book-title-text">Answer</div>
                        </div>
                        <div class="book-pages"></div>
                        <div class="answer-display" id="answer-display">
                            <div class="answer-text" id="answer-text"></div>
                        </div>
                    </div>
                </div>
                
                <!-- 状态指示器 -->
                <div class="status-indicator" id="status-indicator">
                    准备好接受答案了吗？点击书本开始
                </div>
                
                <!-- 控制按钮 -->
                <div class="book-controls">
                    <button class="btn btn-purple ask-button" id="ask-button">
                        <span class="button-text">点击获取答案</span>
                        <div class="button-loader"></div>
                    </button>
                </div>
                
                <!-- 历史记录侧边栏 -->
                <button class="history-toggle" id="history-toggle">
                    📜
                </button>
                
                <div class="history-sidebar" id="history-sidebar">
                    <div class="history-header">
                        <h3 class="history-title">历史答案</h3>
                        <button class="close-history">×</button>
                    </div>
                    <ul class="history-list" id="history-list"></ul>
                    <button class="clear-history">清空历史</button>
                </div>
            </div>
        `;
        
        // 保存重要元素的引用
        this.book = container.querySelector('.book');
        this.answerDisplay = container.querySelector('#answer-display');
        this.answerText = container.querySelector('#answer-text');
        this.statusIndicator = container.querySelector('#status-indicator');
        this.askButton = container.querySelector('#ask-button');
        this.backgroundGlow = container.querySelector('#background-glow');
        this.particleContainer = container.querySelector('#particle-container');
        this.historyToggle = container.querySelector('#history-toggle');
        this.historySidebar = container.querySelector('#history-sidebar');
        this.historyList = container.querySelector('#history-list');
    }

    async handleAskClick() {
        if (this.state === 'IDLE' || this.state === 'SHOWING') {
            await this.startThinking();
        }
    }

    async startThinking() {
        // 进入思考状态
        this.setState('THINKING');
        
        // 1. 打开书本
        this.openBook();
        
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
                this.statusIndicator.textContent = '准备好接受答案了吗？点击书本开始';
                this.statusIndicator.className = 'status-indicator';
                this.askButton.disabled = false;
                this.askButton.classList.remove('loading');
                this.askButton.querySelector('.button-text').textContent = '点击获取答案';
                this.backgroundGlow.classList.remove('intense');
                break;
                
            case 'THINKING':
                this.statusIndicator.textContent = '答案之书正在寻找答案…';
                this.statusIndicator.className = 'status-indicator thinking';
                this.askButton.disabled = true;
                this.askButton.classList.add('loading');
                this.backgroundGlow.classList.add('intense');
                break;
                
            case 'REVEALING':
                this.statusIndicator.textContent = '答案正在显现…';
                break;
                
            case 'SHOWING':
                this.statusIndicator.textContent = '这是你的答案';
                this.statusIndicator.className = 'status-indicator';
                this.askButton.disabled = false;
                this.askButton.classList.remove('loading');
                this.askButton.querySelector('.button-text').textContent = '再问一次';
                this.backgroundGlow.classList.remove('intense');
                break;
        }
    }

    openBook() {
        // 打开书本动画
        this.book.classList.add('opened');
        
        // 创建书页翻动效果
        this.createPageFlippingEffect();
    }

    createPageFlippingEffect() {
        const bookPages = this.book.querySelector('.book-pages');
        bookPages.innerHTML = '';
        
        // 创建多个书页层
        for (let i = 0; i < 5; i++) {
            const page = document.createElement('div');
            page.className = 'book-page';
            page.style.transform = `rotateY(${i * 5}deg) translateZ(-${i * 2}px)`;
            page.style.animationDelay = `${i * 0.1}s`;
            page.style.animationDuration = '0.5s';
            page.style.animationName = 'flipPages';
            page.style.animationIterationCount = 'infinite';
            page.style.animationTimingFunction = 'ease-in-out';
            bookPages.appendChild(page);
        }
        
        // 创建粒子效果
        this.createParticles();
    }

    createParticles() {
        // 清除现有粒子
        this.particleContainer.innerHTML = '';
        
        // 创建星光粒子
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'star-particle';
            
            // 随机起始位置（屏幕边缘）
            const side = Math.floor(Math.random() * 4);
            let startX, startY;
            
            switch (side) {
                case 0: // 上边
                    startX = Math.random() * window.innerWidth;
                    startY = -10;
                    break;
                case 1: // 右边
                    startX = window.innerWidth + 10;
                    startY = Math.random() * window.innerHeight;
                    break;
                case 2: // 下边
                    startX = Math.random() * window.innerWidth;
                    startY = window.innerHeight + 10;
                    break;
                case 3: // 左边
                    startX = -10;
                    startY = Math.random() * window.innerHeight;
                    break;
            }
            
            // 书本中心位置
            const bookRect = this.book.getBoundingClientRect();
            const targetX = bookRect.left + bookRect.width / 2;
            const targetY = bookRect.top + bookRect.height / 2;
            
            // 设置粒子起始位置
            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            
            // 计算距离和时间
            const distance = Math.sqrt(
                Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2)
            );
            const duration = Math.min(distance / 100, 3); // 最大3秒
            
            // 粒子动画
            particle.animate([
                {
                    transform: 'translate(0, 0) scale(0)',
                    opacity: 0
                },
                {
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1,
                    offset: 0.1
                },
                {
                    transform: `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.5)`,
                    opacity: 0.7
                },
                {
                    transform: `translate(${targetX - startX}px, ${targetY - startY}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: duration * 1000,
                easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)'
            });
            
            this.particleContainer.appendChild(particle);
            
            // 移除粒子
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, duration * 1000);
        }
    }

    playSearchingAnimation(duration) {
        return new Promise(resolve => {
            setTimeout(() => {
                // 停止书页翻动
                const pages = this.book.querySelectorAll('.book-page');
                pages.forEach(page => {
                    page.style.animation = 'none';
                    
                    // 减速定格动画
                    page.animate([
                        {
                            transform: page.style.transform,
                            opacity: 0.8
                        },
                        {
                            transform: 'rotateY(90deg) translateZ(-10px)',
                            opacity: 0.5
                        },
                        {
                            transform: 'rotateY(180deg) translateZ(-20px)',
                            opacity: 0.3
                        }
                    ], {
                        duration: 500,
                        easing: 'ease-out',
                        fill: 'forwards'
                    });
                });
                
                // 粒子聚集效果
                this.createFinalParticles();
                
                resolve();
            }, duration);
        });
    }

    createFinalParticles() {
        const bookRect = this.book.getBoundingClientRect();
        const centerX = bookRect.left + bookRect.width / 2;
        const centerY = bookRect.top + bookRect.height / 2;
        
        // 创建向中心聚集的粒子
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'star-particle';
            
            // 从书本周围随机位置开始
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 100;
            const startX = centerX + Math.cos(angle) * distance;
            const startY = centerY + Math.sin(angle) * distance;
            
            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            
            this.particleContainer.appendChild(particle);
            
            // 粒子向中心移动
            particle.animate([
                {
                    transform: 'scale(1)',
                    opacity: 1
                },
                {
                    transform: `translate(${centerX - startX}px, ${centerY - startY}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 500,
                easing: 'ease-in',
                delay: i * 10
            });
            
            // 移除粒子
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 1000);
        }
    }

    async playRevealAnimation(answer) {
        // 显示答案区域
        this.answerDisplay.classList.add('show');
        
        // 清空答案文本
        this.answerText.innerHTML = '';
        
        // 逐字显示答案
        const chars = answer.split('');
        const delay = 100; // 每个字符的显示延迟
        
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
                charSpan.animate([
                    {
                        opacity: 0,
                        transform: 'translateY(10px)'
                    },
                    {
                        opacity: 1,
                        transform: 'translateY(0)'
                    }
                ], {
                    duration: 300,
                    easing: 'ease-out',
                    fill: 'forwards'
                });
                
                // 播放打字音效（可选）
                if (chars[i] !== ' ') {
                    this.playTypeSound();
                }
            }, i * delay);
        }
        
        // 等待动画完成
        await new Promise(resolve => {
            setTimeout(resolve, chars.length * delay + 500);
        });
    }

    playTypeSound() {
        // 简单的打字音效
        try {
            // 创建音频上下文
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // 随机音高
            oscillator.frequency.value = 800 + Math.random() * 400;
            oscillator.type = 'sine';
            
            gainNode.gain.value = 0.1;
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            
        } catch (error) {
            // 音频播放失败，静默处理
        }
    }

    resetBook() {
        // 关闭书本
        this.book.classList.remove('opened');
        
        // 清空书页
        const bookPages = this.book.querySelector('.book-pages');
        if (bookPages) {
            bookPages.innerHTML = '';
        }
        
        // 隐藏答案
        this.answerDisplay.classList.remove('show');
        this.answerText.innerHTML = '';
        
        // 清空粒子
        this.particleContainer.innerHTML = '';
    }

    bindEvents() {
        // 书本点击事件
        this.book.addEventListener('click', this.handleAskClick);
        
        // 按钮点击事件
        this.askButton.addEventListener('click', this.handleAskClick);
        
        // 历史记录切换
        this.historyToggle.addEventListener('click', this.toggleHistory);
        
        // 关闭历史记录
        const closeHistory = document.querySelector('.close-history');
        if (closeHistory) {
            closeHistory.addEventListener('click', this.toggleHistory);
        }
        
        // 清空历史记录
        const clearHistoryBtn = document.querySelector('.clear-history');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', this.clearHistory);
        }
        
        // 点击其他地方关闭历史记录
        document.addEventListener('click', (e) => {
            if (this.isHistoryOpen && 
                !e.target.closest('.history-sidebar') && 
                !e.target.closest('.history-toggle')) {
                this.toggleHistory();
            }
        });
    }

    // 历史记录功能
    loadHistory() {
        const savedHistory = localStorage.getItem('taoci_answer_history');
        if (savedHistory) {
            this.answerHistory = JSON.parse(savedHistory);
            this.renderHistory();
        }
    }

    saveHistory() {
        localStorage.setItem('taoci_answer_history', JSON.stringify(this.answerHistory));
    }

    addToHistory(answer) {
        const historyItem = {
            answer: answer,
            timestamp: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        this.answerHistory.unshift(historyItem);
        
        // 最多保存50条记录
        if (this.answerHistory.length > 50) {
            this.answerHistory = this.answerHistory.slice(0, 50);
        }
        
        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        if (!this.historyList) return;
        
        if (this.answerHistory.length === 0) {
            this.historyList.innerHTML = `
                <li style="color: rgba(255,255,255,0.5); text-align: center; padding: 2rem;">
                    还没有历史记录
                </li>
            `;
            return;
        }
        
        this.historyList.innerHTML = this.answerHistory.map(item => `
            <li class="history-item">
                <div class="history-answer">${item.answer}</div>
                <div class="history-time">${item.timestamp}</div>
            </li>
        `).join('');
    }

    clearHistory() {
        if (confirm('确定要清空所有历史记录吗？')) {
            this.answerHistory = [];
            this.saveHistory();
            this.renderHistory();
        }
    }

    toggleHistory() {
        this.isHistoryOpen = !this.isHistoryOpen;
        
        if (this.isHistoryOpen) {
            this.historySidebar.classList.add('open');
            this.historyToggle.style.transform = 'rotate(180deg)';
        } else {
            this.historySidebar.classList.remove('open');
            this.historyToggle.style.transform = 'rotate(0deg)';
        }
    }
}