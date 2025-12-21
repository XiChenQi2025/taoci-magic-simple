// 盲盒运势模块主类
import { generateLuckyNumber, getFortuneResult, getTodayScans, incrementTodayScans } from './fortune-data.js';

export default class FortuneModule {
    constructor() {
        this.state = 'IDLE'; // IDLE, SCANNING, REVEALING, SHOWING
        this.currentResult = null;
        this.scanCount = 0;
        this.needleAngle = 0;
        this.needleAnimation = null;
        
        // 绑定方法
        this.handleScanClick = this.handleScanClick.bind(this);
    }

    async init(appContainer) {
        try {
            // 1. 注入模块样式
            this.injectStyles();
            
            // 2. 渲染模块结构
            this.render(appContainer);
            
            // 3. 初始化今日扫描次数
            this.scanCount = getTodayScans();
            this.updateScanCounter();
            
            // 4. 初始化数字刻度
            this.createNumberScale();
            
            // 5. 绑定事件
            this.bindEvents();
            
        } catch (error) {
            console.error('盲盒运势模块初始化失败:', error);
            appContainer.innerHTML = `
                <div class="card">
                    <h2 class="card-title">开盒先知加载失败</h2>
                    <p class="card-content">命运之轮暂时卡住了，请刷新页面重试</p>
                </div>
            `;
        }
    }

    destroy() {
        // 清理事件监听
        const scanButton = document.querySelector('.scan-button');
        if (scanButton) {
            scanButton.removeEventListener('click', this.handleScanClick);
        }
        
        // 清理动画
        if (this.needleAnimation) {
            clearInterval(this.needleAnimation);
        }
        
        // 清理样式
        const style = document.getElementById('fortune-styles');
        if (style) style.remove();
    }

    injectStyles() {
        // 检查是否已注入样式
        if (!document.getElementById('fortune-styles')) {
            const style = document.createElement('style');
            style.id = 'fortune-styles';
            style.textContent = `
                /* 这里应该是fortune.css的内容 */
                /* 由于CSS内容较长，我们在外部文件中定义 */
            `;
            document.head.appendChild(style);
            
            // 动态加载外部CSS文件
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = './fortune.css';
            link.id = 'fortune-styles-external';
            document.head.appendChild(link);
        }
    }

    render(container) {
        container.innerHTML = `
            <div class="fortune-container">
                <!-- 背景特效 -->
                <div class="background-effect" id="background-effect"></div>
                
                <!-- 粒子容器 -->
                <div class="particle-container" id="particle-container"></div>
                
                <!-- 标题区域 -->
                <div class="fortune-header">
                    <h1 class="fortune-title">开盒先知</h1>
                    <p class="fortune-subtitle">默念你在直播间的开盒愿望，点击启动预言</p>
                    <div class="disclaimer-box">
                        ✨ 仅供娱乐，结果随机，开心最重要！ ✨
                    </div>
                </div>
                
                <!-- 表盘区域 -->
                <div class="dial-container">
                    <div class="radar-background">
                        <div class="radar-grid"></div>
                        <div class="number-scale" id="number-scale"></div>
                        <div class="number-runner" id="number-runner"></div>
                    </div>
                    
                    <!-- 指针 -->
                    <div class="needle" id="needle" style="transform: rotate(0deg);"></div>
                    
                    <!-- 表盘中心 -->
                    <div class="dial-center">
                        <div class="ready-text" id="ready-text">READY</div>
                    </div>
                    
                    <!-- 幸运数字显示 -->
                    <div class="lucky-number-display" id="lucky-number-display"></div>
                    
                    <!-- 评级徽章 -->
                    <div class="level-badge" id="level-badge"></div>
                </div>
                
                <!-- 状态指示器 -->
                <div class="status-indicator" id="status-indicator">
                    准备好启动命运扫描了吗？
                </div>
                
                <!-- 解读显示 -->
                <div class="fortune-message">
                    <div class="message-bubble">
                        <div class="message-text" id="message-text"></div>
                    </div>
                </div>
                
                <!-- 控制按钮 -->
                <div class="fortune-controls">
                    <button class="btn scan-button" id="scan-button">
                        <span class="button-text">启动命运扫描</span>
                        <div class="button-loader"></div>
                    </button>
                </div>
                
                <!-- 扫描次数 -->
                <div class="scan-counter" id="scan-counter">
                    今日扫描次数: <span id="scan-count">0</span>
                </div>
            </div>
        `;
        
        // 保存重要元素的引用
        this.needle = document.querySelector('#needle');
        this.readyText = document.querySelector('#ready-text');
        this.luckyNumberDisplay = document.querySelector('#lucky-number-display');
        this.levelBadge = document.querySelector('#level-badge');
        this.statusIndicator = document.querySelector('#status-indicator');
        this.scanButton = document.querySelector('#scan-button');
        this.messageText = document.querySelector('#message-text');
        this.backgroundEffect = document.querySelector('#background-effect');
        this.particleContainer = document.querySelector('#particle-container');
        this.numberRunner = document.querySelector('#number-runner');
        this.scanCountElement = document.querySelector('#scan-count');
    }

    createNumberScale() {
        const numberScale = document.querySelector('#number-scale');
        if (!numberScale) return;
        
        numberScale.innerHTML = '';
        
        // 创建0-99的数字刻度
        for (let i = 0; i < 100; i++) {
            const angle = (i / 100) * 360;
            const isMajor = i % 10 === 0;
            
            const tick = document.createElement('div');
            tick.className = `number-tick ${isMajor ? 'major' : ''}`;
            tick.textContent = isMajor ? i : '';
            tick.dataset.number = i;
            
            // 位置计算
            const radius = 45; // 百分比
            const rad = (angle - 90) * Math.PI / 180;
            const x = 50 + radius * Math.cos(rad);
            const y = 50 + radius * Math.sin(rad);
            
            tick.style.left = `${x}%`;
            tick.style.top = `${y}%`;
            tick.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
            
            numberScale.appendChild(tick);
        }
    }

    async handleScanClick() {
        if (this.state === 'IDLE' || this.state === 'SHOWING') {
            await this.startScanning();
        }
    }

    async startScanning() {
        // 进入扫描状态
        this.setState('SCANNING');
        
        // 增加扫描次数
        this.scanCount = incrementTodayScans();
        this.updateScanCounter();
        
        // 1. 启动表盘动画
        this.startDialAnimation();
        
        // 2. 播放数字奔腾效果
        this.startNumberRunning();
        
        // 3. 创建粒子效果
        this.createScanningParticles();
        
        // 4. 等待3秒扫描动画
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 5. 生成幸运数字
        const luckyNumber = generateLuckyNumber();
        this.currentResult = getFortuneResult(luckyNumber);
        
        // 6. 进入揭示状态
        this.setState('REVEALING');
        
        // 7. 减速并定格指针
        await this.slowDownAndStop(luckyNumber);
        
        // 8. 显示结果
        await this.showResult();
        
        // 9. 进入显示状态
        this.setState('SHOWING');
    }

    setState(newState) {
        this.state = newState;
        
        // 更新UI状态
        switch (newState) {
            case 'IDLE':
                this.statusIndicator.textContent = '准备好启动命运扫描了吗？';
                this.statusIndicator.className = 'status-indicator';
                this.scanButton.disabled = false;
                this.scanButton.classList.remove('loading');
                this.scanButton.querySelector('.button-text').textContent = '启动命运扫描';
                this.backgroundEffect.classList.remove('intense');
                this.readyText.textContent = 'READY';
                this.readyText.style.color = 'rgba(255, 255, 255, 0.7)';
                break;
                
            case 'SCANNING':
                this.statusIndicator.textContent = '命运扫描中…正在分析你的开盒运势…';
                this.statusIndicator.className = 'status-indicator scanning';
                this.scanButton.disabled = true;
                this.scanButton.classList.add('loading');
                this.backgroundEffect.classList.add('intense');
                this.readyText.textContent = 'SCANNING';
                this.readyText.style.color = 'var(--neon-blue)';
                break;
                
            case 'REVEALING':
                this.statusIndicator.textContent = '运势分析完成！正在揭示结果…';
                break;
                
            case 'SHOWING':
                this.statusIndicator.textContent = '这就是你的开盒运势！';
                this.statusIndicator.className = 'status-indicator';
                this.scanButton.disabled = false;
                this.scanButton.classList.remove('loading');
                this.scanButton.querySelector('.button-text').textContent = '再次扫描';
                this.backgroundEffect.classList.remove('intense');
                this.readyText.textContent = 'DONE';
                this.readyText.style.color = 'var(--neon-green)';
                break;
        }
    }

    startDialAnimation() {
        // 清除之前的动画
        if (this.needleAnimation) {
            clearInterval(this.needleAnimation);
        }
        
        // 启动指针旋转
        let speed = 5; // 初始速度
        let acceleration = 0.5;
        
        this.needleAnimation = setInterval(() => {
            this.needleAngle += speed;
            if (this.needleAngle >= 360) {
                this.needleAngle -= 360;
            }
            
            this.needle.style.transform = `rotate(${this.needleAngle}deg)`;
            
            // 逐渐加速
            if (speed < 50) {
                speed += acceleration;
                acceleration *= 0.98; // 逐渐减小加速度
            }
        }, 16); // 约60fps
    }

    startNumberRunning() {
        // 清空之前的数字
        this.numberRunner.innerHTML = '';
        
        // 创建奔腾的数字效果
        const numbers = Array.from({length: 100}, (_, i) => i);
        
        for (let i = 0; i < 20; i++) { // 同时显示20个数字
            const num = document.createElement('div');
            num.className = 'running-number';
            
            // 随机位置
            const angle = Math.random() * 360;
            const radius = 30 + Math.random() * 40;
            const rad = (angle - 90) * Math.PI / 180;
            const x = 50 + radius * Math.cos(rad);
            const y = 50 + radius * Math.sin(rad);
            
            num.style.left = `${x}%`;
            num.style.top = `${y}%`;
            num.textContent = numbers[Math.floor(Math.random() * numbers.length)];
            
            this.numberRunner.appendChild(num);
            
            // 数字动画
            num.animate([
                {
                    opacity: 0,
                    transform: `translate(-50%, -50%) scale(0.5)`
                },
                {
                    opacity: 1,
                    transform: `translate(-50%, -50%) scale(1)`,
                    offset: 0.1
                },
                {
                    opacity: 0.8,
                    transform: `translate(-50%, -50%) scale(1)`,
                    offset: 0.8
                },
                {
                    opacity: 0,
                    transform: `translate(-50%, -50%) scale(0.5)`
                }
            ], {
                duration: 1000 + Math.random() * 1000,
                easing: 'ease-in-out',
                delay: i * 50
            });
            
            // 移除数字
            setTimeout(() => {
                if (num.parentNode) {
                    num.remove();
                }
            }, 2000);
        }
        
        // 持续创建新数字
        this.numberRunningInterval = setInterval(() => {
            if (this.state !== 'SCANNING') {
                clearInterval(this.numberRunningInterval);
                return;
            }
            
            const num = document.createElement('div');
            num.className = 'running-number';
            
            // 随机位置
            const angle = Math.random() * 360;
            const radius = 30 + Math.random() * 40;
            const rad = (angle - 90) * Math.PI / 180;
            const x = 50 + radius * Math.cos(rad);
            const y = 50 + radius * Math.sin(rad);
            
            num.style.left = `${x}%`;
            num.style.top = `${y}%`;
            num.textContent = numbers[Math.floor(Math.random() * numbers.length)];
            
            this.numberRunner.appendChild(num);
            
            // 数字动画
            num.animate([
                {
                    opacity: 0,
                    transform: `translate(-50%, -50%) scale(0.5)`
                },
                {
                    opacity: 1,
                    transform: `translate(-50%, -50%) scale(1)`,
                    offset: 0.1
                },
                {
                    opacity: 0.8,
                    transform: `translate(-50%, -50%) scale(1)`,
                    offset: 0.8
                },
                {
                    opacity: 0,
                    transform: `translate(-50%, -50%) scale(0.5)`
                }
            ], {
                duration: 1000 + Math.random() * 1000,
                easing: 'ease-in-out'
            });
            
            // 移除数字
            setTimeout(() => {
                if (num.parentNode) {
                    num.remove();
                }
            }, 2000);
        }, 100);
    }

    createScanningParticles() {
        // 创建扫描粒子效果
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                if (this.state !== 'SCANNING') return;
                
                this.createDataParticle();
            }, i * 50);
        }
        
        // 持续创建粒子
        this.particleInterval = setInterval(() => {
            if (this.state !== 'SCANNING') {
                clearInterval(this.particleInterval);
                return;
            }
            
            this.createDataParticle();
        }, 100);
    }

    createDataParticle() {
        const particle = document.createElement('div');
        particle.className = 'data-particle';
        
        // 从屏幕边缘随机位置开始
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
        
        // 表盘中心位置
        const dialRect = document.querySelector('.dial-container').getBoundingClientRect();
        const targetX = dialRect.left + dialRect.width / 2;
        const targetY = dialRect.top + dialRect.height / 2;
        
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        
        this.particleContainer.appendChild(particle);
        
        // 粒子动画
        particle.animate([
            {
                opacity: 0,
                transform: 'scale(0)'
            },
            {
                opacity: 1,
                transform: 'scale(1)',
                offset: 0.1
            },
            {
                opacity: 0.7,
                transform: `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.5)`
            },
            {
                opacity: 0,
                transform: `translate(${targetX - startX}px, ${targetY - startY}px) scale(0)`
            }
        ], {
            duration: 2000,
            easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)'
        });
        
        // 移除粒子
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 2000);
    }

    async slowDownAndStop(targetNumber) {
        // 清除高速旋转动画
        if (this.needleAnimation) {
            clearInterval(this.needleAnimation);
            this.needleAnimation = null;
        }
        
        // 计算目标角度
        const targetAngle = (targetNumber / 100) * 360;
        
        // 计算当前角度到目标角度的最短路径
        let currentAngle = this.needleAngle % 360;
        let diff = targetAngle - currentAngle;
        
        // 调整到最短路径
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        
        // 减速动画
        let speed = 30;
        const deceleration = 0.95;
        
        return new Promise(resolve => {
            const slowDownInterval = setInterval(() => {
                // 更新速度
                speed *= deceleration;
                
                // 如果接近目标，逐渐减小速度
                if (Math.abs(diff) < 10) {
                    speed *= 0.8;
                }
                
                if (Math.abs(diff) < 2) {
                    // 到达目标位置
                    this.needleAngle = targetAngle;
                    this.needle.style.transform = `rotate(${this.needleAngle}deg)`;
                    
                    // 播放定格音效
                    this.playStopSound();
                    
                    clearInterval(slowDownInterval);
                    resolve();
                    return;
                }
                
                // 向目标移动
                if (diff > 0) {
                    currentAngle += Math.min(speed, diff);
                } else {
                    currentAngle -= Math.min(speed, -diff);
                }
                
                diff = targetAngle - currentAngle;
                this.needleAngle = currentAngle;
                this.needle.style.transform = `rotate(${this.needleAngle}deg)`;
            }, 16);
        });
    }

    async showResult() {
        // 显示幸运数字
        this.luckyNumberDisplay.textContent = this.currentResult.luckyNumber;
        this.luckyNumberDisplay.style.color = this.currentResult.color;
        this.luckyNumberDisplay.style.textShadow = this.currentResult.glow;
        this.luckyNumberDisplay.classList.add('show');
        
        // 添加脉冲动画
        this.luckyNumberDisplay.style.animation = 'numberPulse 1s infinite';
        
        // 显示评级徽章
        this.levelBadge.textContent = this.currentResult.level;
        this.levelBadge.style.background = this.currentResult.color;
        this.levelBadge.style.boxShadow = this.currentResult.glow;
        this.levelBadge.classList.add('show');
        
        // 徽章弹出动画
        this.levelBadge.style.animation = 'badgePop 0.5s ease-out forwards';
        
        // 等待动画完成
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 显示解读文案
        await this.displayMessage(this.currentResult.message);
    }

    async displayMessage(message) {
        // 清空消息文本
        this.messageText.innerHTML = '';
        
        // 逐字显示消息
        const chars = message.split('');
        const delay = 50; // 每个字符的显示延迟
        
        for (let i = 0; i < chars.length; i++) {
            const charSpan = document.createElement('span');
            charSpan.className = 'char';
            charSpan.textContent = chars[i];
            
            // 处理空格
            if (chars[i] === ' ') {
                charSpan.innerHTML = '&nbsp;';
            }
            
            this.messageText.appendChild(charSpan);
            
            // 字符显示动画
            setTimeout(() => {
                charSpan.animate([
                    {
                        opacity: 0,
                        transform: 'translateY(5px)'
                    },
                    {
                        opacity: 1,
                        transform: 'translateY(0)'
                    }
                ], {
                    duration: 200,
                    easing: 'ease-out',
                    fill: 'forwards'
                });
                
                // 播放打字音效（可选）
                if (chars[i] !== ' ') {
                    this.playTypeSound();
                }
            }, i * delay);
        }
        
        // 等待消息显示完成
        await new Promise(resolve => {
            setTimeout(resolve, chars.length * delay + 500);
        });
    }

    playStopSound() {
        // 播放指针定格音效
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.value = 0.1;
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
            
        } catch (error) {
            // 音频播放失败，静默处理
        }
    }

    playTypeSound() {
        // 简单的打字音效
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // 随机音高
            oscillator.frequency.value = 600 + Math.random() * 400;
            oscillator.type = 'sine';
            
            gainNode.gain.value = 0.05;
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.05);
            
        } catch (error) {
            // 音频播放失败，静默处理
        }
    }

    updateScanCounter() {
        if (this.scanCountElement) {
            this.scanCountElement.textContent = this.scanCount;
        }
    }

    bindEvents() {
        // 扫描按钮点击事件
        this.scanButton.addEventListener('click', this.handleScanClick);
        
        // 按钮涟漪效果
        this.scanButton.addEventListener('click', (e) => {
            this.scanButton.classList.add('ripple-effect');
            setTimeout(() => {
                this.scanButton.classList.remove('ripple-effect');
            }, 600);
        });
    }
}