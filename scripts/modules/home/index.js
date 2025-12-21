// 首页模块主类
import { homeConfig } from './home-config.js';

export default class HomeModule {
    constructor() {
        this.config = homeConfig;
        this.currentImageIndex = -1;
        this.currentMessageIndex = 0;
        this.isAutoPlaying = true;
        this.likedMessages = new Set();
        this.barrageInterval = null;
        this.particles = [];
        this.timers = [];
        
        // 尝试获取上次的图片记录
        const lastImageId = localStorage.getItem('lastCharacterImageId');
        if (lastImageId) {
            this.lastImageId = parseInt(lastImageId);
        }
    }

    async init(appContainer) {
        try {
            // 1. 注入模块样式
            this.injectStyles();
            
            // 2. 渲染模块结构
            this.render(appContainer);
            
            // 3. 初始化各子系统
            await this.initImageGallery();
            this.initAnnouncement();
            this.initMessageWall();
            this.initInteractiveEffects();
            
            // 4. 绑定事件
            this.bindEvents();
            
        } catch (error) {
            console.error('首页模块初始化失败:', error);
            appContainer.innerHTML = `
                <div class="card">
                    <h2 class="card-title">首页加载失败</h2>
                    <p class="card-content">网络开小差了，请刷新页面重试</p>
                </div>
            `;
        }
    }

    destroy() {
        // 清理所有定时器
        this.timers.forEach(timer => clearInterval(timer));
        this.timers = [];
        
        if (this.barrageInterval) {
            clearInterval(this.barrageInterval);
            this.barrageInterval = null;
        }
        
        // 清理粒子动画
        if (this.particleAnimationFrame) {
            cancelAnimationFrame(this.particleAnimationFrame);
        }
        
        // 移除事件监听
        if (this.messageCard) {
            this.messageCard.removeEventListener('mouseenter', this.pauseMessages);
            this.messageCard.removeEventListener('mouseleave', this.resumeMessages);
        }
        
        // 清理DOM元素
        const style = document.getElementById('home-module-styles');
        if (style) style.remove();
        
        const barrage = document.querySelector('.barrage-container');
        if (barrage) barrage.remove();
        
        const particles = document.querySelector('.particle-container');
        if (particles) particles.remove();
    }

    injectStyles() {
        // 创建style标签并插入CSS
        const style = document.createElement('style');
        style.id = 'home-module-styles';
        style.textContent = document.querySelector('#home-module-styles') ? '' : `
            /* 这里应该是home-styles.css的内容 */
            /* 由于CSS内容较长，我们在外部文件中定义 */
        `;
        document.head.appendChild(style);
        
        // 动态加载外部CSS文件
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './home-styles.css';
        link.id = 'home-module-styles-external';
        document.head.appendChild(link);
    }

    render(container) {
        container.innerHTML = `
            <!-- 动态皮套图容器 -->
            <div class="character-container">
                <div class="character-mask"></div>
                <img class="character-image" src="" alt="" />
                <div class="character-credit"></div>
            </div>
            
            <!-- 内容悬浮层 -->
            <div class="home-content-layer">
                <div class="home-top-space"></div>
                
                <div class="home-middle-content">
                    <!-- 留言墙卡片 -->
                    <div class="message-card">
                        <img class="streamer-avatar" src="./assets/avatar.png" alt="桃汽水头像">
                        <div class="message-content">
                            <span class="message-emoji"></span>
                            <span class="message-text"></span>
                        </div>
                        <div class="message-meta">
                            <div class="message-date"></div>
                            <div class="message-controls">
                                <button class="control-btn prev-btn">◀</button>
                                <button class="control-btn pause-btn">⏸</button>
                                <button class="control-btn next-btn">▶</button>
                                <button class="like-btn">
                                    <span class="like-emoji">❤️</span>
                                    <span class="like-count">0</span>
                                </button>
                            </div>
                        </div>
                        <div class="message-counter"></div>
                    </div>
                    
                    <!-- 公告板卡片 -->
                    <div class="announcement-card">
                        <h2 class="announcement-title">${this.config.anniversaryEvents.title}</h2>
                        <div class="countdown-display"></div>
                        <ul class="highlights-list">
                            ${this.config.anniversaryEvents.highlights.map(item => `
                                <li>
                                    <span class="highlight-icon">${item.icon}</span>
                                    <span>${item.text}</span>
                                </li>
                            `).join('')}
                        </ul>
                        <button class="schedule-btn">查看详细日程</button>
                        <div class="schedule-panel">
                            ${this.config.anniversaryEvents.schedule.map(item => `
                                <div class="schedule-item">
                                    <div class="schedule-time">${item.time}</div>
                                    <div>${item.event}</div>
                                </div>
                            `).join('')}
                        </div>
                        <button class="btn btn-yellow subscribe-btn">点击订阅直播提醒</button>
                    </div>
                </div>
                
                <div class="home-bottom-space"></div>
            </div>
            
            <!-- 弹幕容器 -->
            <div class="barrage-container"></div>
            
            <!-- 粒子容器 -->
            <div class="particle-container"></div>
        `;
        
        // 保存重要元素的引用
        this.characterImage = container.querySelector('.character-image');
        this.characterCredit = container.querySelector('.character-credit');
        this.messageCard = container.querySelector('.message-card');
        this.messageText = container.querySelector('.message-text');
        this.messageEmoji = container.querySelector('.message-emoji');
        this.messageDate = container.querySelector('.message-date');
        this.messageCounter = container.querySelector('.message-counter');
        this.prevBtn = container.querySelector('.prev-btn');
        this.pauseBtn = container.querySelector('.pause-btn');
        this.nextBtn = container.querySelector('.next-btn');
        this.likeBtn = container.querySelector('.like-btn');
        this.likeCount = container.querySelector('.like-count');
        this.countdownDisplay = container.querySelector('.countdown-display');
        this.scheduleBtn = container.querySelector('.schedule-btn');
        this.schedulePanel = container.querySelector('.schedule-panel');
        this.subscribeBtn = container.querySelector('.subscribe-btn');
        this.barrageContainer = container.querySelector('.barrage-container');
        this.particleContainer = container.querySelector('.particle-container');
    }

    async initImageGallery() {
        const images = this.config.characterImages;
        
        // 防重复逻辑：如果上次有记录，尝试选不同的图片
        let availableIndices = images.map((_, index) => index);
        
        if (this.lastImageId !== undefined) {
            const lastIndex = images.findIndex(img => img.id === this.lastImageId);
            if (lastIndex !== -1) {
                availableIndices = availableIndices.filter(i => i !== lastIndex);
            }
        }
        
        // 随机选择一张图片
        const randomIndex = availableIndices.length > 0 
            ? availableIndices[Math.floor(Math.random() * availableIndices.length)]
            : Math.floor(Math.random() * images.length);
            
        this.currentImageIndex = randomIndex;
        const selectedImage = images[randomIndex];
        
        // 保存选择记录
        localStorage.setItem('lastCharacterImageId', selectedImage.id.toString());
        
        // 设置图片
        this.characterImage.alt = selectedImage.alt;
        this.characterCredit.textContent = selectedImage.credit || '';
        
        // 预加载图片
        await this.loadImage(selectedImage.url);
    }

    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.characterImage.src = url;
                setTimeout(() => {
                    this.characterImage.classList.add('loaded');
                    resolve();
                }, 100);
            };
            img.onerror = () => {
                // 加载失败时使用占位图
                this.characterImage.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><rect width="400" height="600" fill="%230a0a0a"/><text x="200" y="300" font-family="Arial" font-size="20" fill="white" text-anchor="middle">桃汽水の魔力补给站</text></svg>';
                this.characterImage.alt = '图片加载失败';
                this.characterCredit.textContent = '图片加载失败，请刷新重试';
                this.characterImage.classList.add('loaded');
                reject(new Error('图片加载失败'));
            };
            img.src = url;
        });
    }

    initAnnouncement() {
        // 初始化倒计时
        this.updateCountdown();
        this.timers.push(setInterval(() => this.updateCountdown(), 1000));
        
        // 计算距离周年庆的天数
        const targetDate = new Date(this.config.anniversaryEvents.countdownTo);
        const today = new Date();
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 0) {
            this.countdownDisplay.textContent = '🎉 庆典进行中！ 🎉';
        } else {
            this.countdownDisplay.textContent = `距离庆典还有 ${diffDays} 天`;
        }
    }

    updateCountdown() {
        const targetDate = new Date(this.config.anniversaryEvents.countdownTo);
        const now = new Date();
        
        const diffMs = targetDate - now;
        
        if (diffMs <= 0) {
            this.countdownDisplay.textContent = '🎉 庆典进行中！ 🎉';
            return;
        }
        
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        this.countdownDisplay.textContent = `距离庆典还有 ${days}天 ${hours}时 ${minutes}分 ${seconds}秒`;
    }

    initMessageWall() {
        // 加载点赞记录
        this.loadLikedMessages();
        
        // 显示第一条留言
        this.showMessage(this.currentMessageIndex);
        
        // 自动轮播
        this.startAutoPlay();
        
        // 保存方法引用用于事件监听
        this.pauseMessages = () => this.pauseAutoPlay();
        this.resumeMessages = () => this.startAutoPlay();
        
        // 添加鼠标悬停暂停/恢复
        this.messageCard.addEventListener('mouseenter', this.pauseMessages);
        this.messageCard.addEventListener('mouseleave', this.resumeMessages);
    }

    showMessage(index) {
        const messages = this.config.streamerMessages;
        if (messages.length === 0) return;
        
        // 循环索引
        if (index >= messages.length) index = 0;
        if (index < 0) index = messages.length - 1;
        
        this.currentMessageIndex = index;
        const message = messages[index];
        
        // 更新显示
        this.messageText.textContent = message.text;
        this.messageEmoji.textContent = message.emoji + ' ';
        this.messageDate.textContent = message.date;
        this.messageCounter.textContent = `${index + 1} / ${messages.length}`;
        
        // 更新点赞按钮状态
        const isLiked = this.likedMessages.has(message.id);
        this.likeBtn.classList.toggle('liked', isLiked);
        
        // 获取点赞数
        const likes = localStorage.getItem(`message_likes_${message.id}`) || '0';
        this.likeCount.textContent = likes;
    }

    startAutoPlay() {
        if (this.autoPlayTimer) clearInterval(this.autoPlayTimer);
        
        this.autoPlayTimer = setInterval(() => {
            this.currentMessageIndex++;
            this.showMessage(this.currentMessageIndex);
        }, 8000);
        
        this.isAutoPlaying = true;
        this.pauseBtn.textContent = '⏸';
    }

    pauseAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
        
        this.isAutoPlaying = false;
        this.pauseBtn.textContent = '▶';
    }

    toggleAutoPlay() {
        if (this.isAutoPlaying) {
            this.pauseAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    loadLikedMessages() {
        const liked = localStorage.getItem('liked_messages');
        if (liked) {
            this.likedMessages = new Set(JSON.parse(liked));
        }
    }

    saveLikedMessages() {
        localStorage.setItem('liked_messages', JSON.stringify([...this.likedMessages]));
    }

    initInteractiveEffects() {
        // 初始化弹幕系统（桌面端）
        if (window.innerWidth > 768) {
            this.initBarrageSystem();
        }
        
        // 初始化粒子系统（桌面端）
        if (window.innerWidth > 768) {
            this.initParticleSystem();
        }
    }

    initBarrageSystem() {
        // 创建弹幕
        const createBarrage = () => {
            const messages = this.config.barrageMessages;
            const text = messages[Math.floor(Math.random() * messages.length)];
            
            const barrage = document.createElement('div');
            barrage.className = 'barrage-item';
            barrage.textContent = text;
            
            // 随机颜色
            const colors = ['#FF00FF', '#BF00FF', '#00BFFF', '#00FF00', '#FFFF00', '#FFA500'];
            barrage.style.color = colors[Math.floor(Math.random() * colors.length)];
            
            // 随机位置和速度
            const top = Math.random() * 80 + 10; // 10% - 90%
            const speed = Math.random() * 100 + 50; // 50-150px每秒
            const duration = (window.innerWidth + 200) / speed;
            
            barrage.style.top = `${top}%`;
            barrage.style.left = `-200px`;
            barrage.style.transform = `translateX(-100%)`;
            
            this.barrageContainer.appendChild(barrage);
            
            // 动画
            barrage.animate([
                { transform: `translateX(-100%)`, opacity: 0 },
                { transform: `translateX(0%)`, opacity: 1 },
                { transform: `translateX(0%)`, opacity: 1, offset: 0.8 },
                { transform: `translateX(100%)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                easing: 'linear'
            });
            
            // 点击效果
            barrage.addEventListener('click', () => {
                barrage.style.opacity = '1';
                barrage.style.textShadow = '0 0 15px currentColor';
                setTimeout(() => {
                    barrage.style.opacity = '';
                    barrage.style.textShadow = '';
                }, 1000);
            });
            
            // 移除元素
            setTimeout(() => {
                if (barrage.parentNode) {
                    barrage.remove();
                }
            }, duration * 1000 + 1000);
        };
        
        // 定时生成弹幕
        this.barrageInterval = setInterval(createBarrage, 2000);
        // 初始创建一些弹幕
        for (let i = 0; i < 5; i++) {
            setTimeout(createBarrage, i * 300);
        }
    }

    initParticleSystem() {
        // 根据当前皮套图的主色调设置粒子颜色
        const currentImage = this.config.characterImages[this.currentImageIndex];
        const mainColor = currentImage?.mainColor || '#FF00FF';
        
        // 鼠标移动时生成粒子
        document.addEventListener('mousemove', (e) => {
            if (window.innerWidth <= 768) return;
            
            // 创建一些粒子
            for (let i = 0; i < 3; i++) {
                this.createParticle(e.clientX, e.clientY, mainColor);
            }
        });
        
        // 动画循环
        const animateParticles = () => {
            this.updateParticles();
            this.particleAnimationFrame = requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
    }

    createParticle(x, y, color) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.backgroundColor = color;
        
        // 随机大小和透明度
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.opacity = Math.random() * 0.5 + 0.3;
        
        this.particleContainer.appendChild(particle);
        
        // 粒子数据
        const particleData = {
            element: particle,
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 3 - 1,
            life: 1.0,
            decay: Math.random() * 0.02 + 0.01
        };
        
        this.particles.push(particleData);
        
        // 限制粒子数量
        if (this.particles.length > 100) {
            const oldParticle = this.particles.shift();
            if (oldParticle.element.parentNode) {
                oldParticle.element.remove();
            }
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98; // 阻力
            particle.vy += 0.05; // 重力
            
            // 更新生命周期
            particle.life -= particle.decay;
            
            // 更新元素
            particle.element.style.left = `${particle.x}px`;
            particle.element.style.top = `${particle.y}px`;
            particle.element.style.opacity = particle.life;
            
            // 移除死亡粒子
            if (particle.life <= 0) {
                if (particle.element.parentNode) {
                    particle.element.remove();
                }
                this.particles.splice(i, 1);
            }
        }
    }

    bindEvents() {
        // 留言墙控制
        this.prevBtn.addEventListener('click', () => {
            this.currentMessageIndex--;
            this.showMessage(this.currentMessageIndex);
        });
        
        this.nextBtn.addEventListener('click', () => {
            this.currentMessageIndex++;
            this.showMessage(this.currentMessageIndex);
        });
        
        this.pauseBtn.addEventListener('click', () => this.toggleAutoPlay());
        
        this.likeBtn.addEventListener('click', () => {
            const currentMessage = this.config.streamerMessages[this.currentMessageIndex];
            const isLiked = this.likedMessages.has(currentMessage.id);
            
            if (isLiked) {
                // 取消点赞
                this.likedMessages.delete(currentMessage.id);
                this.likeBtn.classList.remove('liked');
                
                // 更新本地存储点赞数
                let likes = parseInt(localStorage.getItem(`message_likes_${currentMessage.id}`) || '0');
                likes = Math.max(0, likes - 1);
                localStorage.setItem(`message_likes_${currentMessage.id}`, likes.toString());
                this.likeCount.textContent = likes;
            } else {
                // 点赞
                this.likedMessages.add(currentMessage.id);
                this.likeBtn.classList.add('liked');
                
                // 更新本地存储点赞数
                let likes = parseInt(localStorage.getItem(`message_likes_${currentMessage.id}`) || '0');
                likes += 1;
                localStorage.setItem(`message_likes_${currentMessage.id}`, likes.toString());
                this.likeCount.textContent = likes;
            }
            
            this.saveLikedMessages();
        });
        
        // 公告板控制
        this.scheduleBtn.addEventListener('click', () => {
            this.schedulePanel.classList.toggle('active');
            this.scheduleBtn.textContent = this.schedulePanel.classList.contains('active') 
                ? '收起日程' 
                : '查看详细日程';
        });
        
        this.subscribeBtn.addEventListener('click', () => {
            alert('已订阅直播提醒！周年庆开始前会通过浏览器通知提醒您～');
            // 实际应用中这里应该调用通知API
        });
        
        // 窗口大小变化时调整效果
        window.addEventListener('resize', () => {
            // 移动端关闭特效，桌面端重新初始化
            if (window.innerWidth <= 768) {
                if (this.barrageInterval) {
                    clearInterval(this.barrageInterval);
                    this.barrageInterval = null;
                }
                if (this.particleContainer) {
                    this.particleContainer.style.display = 'none';
                }
            } else {
                if (!this.barrageInterval) {
                    this.initBarrageSystem();
                }
                if (this.particleContainer) {
                    this.particleContainer.style.display = 'block';
                }
            }
        });
    }
}