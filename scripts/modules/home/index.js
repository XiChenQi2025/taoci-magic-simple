// 首页模块主类 - 简化版
import config from './home-config.js';

export default class HomeModule {
    constructor() {
        this.config = config;
        this.currentImageIndex = 0;
        this.currentAnnouncementIndex = 0;
        this.currentMessageIndex = 0;
        this.container = null;
        this.timers = [];
        this.eventListeners = [];
        
        console.log('首页模块初始化完成');
    }

    async init(appContainer) {
        try {
            // 1. 加载配置
            await this.loadConfig();
            
            // 2. 创建样式链接
            this.loadStyles();
            
            // 3. 渲染模块HTML结构到appContainer
            this.render(appContainer);
            
            // 4. 初始化各子系统
            await this.initImageGallery();
            this.initAnnouncement();
            this.initMessageWall();
            
            // 5. 初始化弹幕效果（只在留言区域）
            if (window.innerWidth >= 768) {
                this.initMessageBarrage();
            }
            
            // 6. 绑定事件
            this.bindEvents();
            
            console.log('首页模块加载完成');
            return this;
            
        } catch (error) {
            console.error('首页模块初始化失败:', error);
            this.showError(appContainer, error);
        }
    }

    destroy() {
        console.log('正在销毁首页模块...');
        
        // 清理所有定时器
        this.timers.forEach(timer => {
            clearInterval(timer);
            clearTimeout(timer);
        });
        this.timers = [];
        
        // 清理弹幕动画帧
        this.barrageAnimations?.forEach(id => cancelAnimationFrame(id));
        
        // 移除事件监听器
        this.eventListeners.forEach(listener => {
            if (listener.element && listener.handler) {
                listener.element.removeEventListener(listener.event, listener.handler);
            }
        });
        this.eventListeners = [];
        
        // 移除样式
        const styleLink = document.querySelector('link[href*="home-styles.css"]');
        if (styleLink) {
            styleLink.remove();
        }
        
        // 清理DOM元素
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('首页模块已销毁');
    }

    // ==================== 核心方法 ====================

    async loadConfig() {
        // 配置已通过import导入，直接使用
        if (!this.config) {
            throw new Error('配置加载失败');
        }
        
        console.log('首页配置加载成功');
        return this.config;
    }
    
    loadStyles() {
        // 检查是否已经加载了样式
        const existingStyle = document.querySelector('link[href*="home-styles.css"]');
        if (existingStyle) {
            return;
        }
        
        // 创建样式链接
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'scripts/modules/home/home-styles.css';
        link.id = 'home-module-styles';
        
        // 添加到head
        document.head.appendChild(link);
        
        console.log('首页样式已加载');
    }

    render(container) {
        this.container = container;
        
        const html = `
            <div id="home-module" class="home-module">
                <!-- 皮套图展示区 -->
                <section class="character-section">
                    <div class="character-container">
                        <img id="character-image" src="" alt="" class="character-image">
                        <div id="image-info" class="image-info">
                            <span class="image-credit"></span>
                            <span class="image-description"></span>
                        </div>
                    </div>
                </section>
                
                <!-- 公告板区域 -->
                <section class="announcement-section">
                    <div class="section-header">
                        <h2 class="section-title">
                            <span class="title-icon">📢</span> 最新公告
                        </h2>
                    </div>
                    <div class="announcement-board">
                        <div class="announcement-carousel">
                            <!-- 公告内容由JS动态生成 -->
                        </div>
                        <button class="btn-prev-announcement">❮</button>
                        <button class="btn-next-announcement">❯</button>
                        <div class="announcement-indicators">
                            <!-- 指示点由JS生成 -->
                        </div>
                    </div>
                </section>
                
                <!-- 留言墙区域 -->
                <section class="message-section">
                    <div class="section-header">
                        <h2 class="section-title">
                            <span class="title-icon">💌</span> 主播留言
                        </h2>
                    </div>
                    <div class="message-wall">
                        <div class="message-barrage-container"></div>
                        <div class="message-item">
                            <!-- 留言内容由JS动态生成 -->
                        </div>
                    </div>
                </section>
            </div>
        `;
        
        container.innerHTML = html;
        console.log('首页HTML结构已渲染');
    }
    
    // ==================== 图片画廊系统 ====================

    async initImageGallery() {
        const imageElement = document.getElementById('character-image');
        const imageCredit = document.querySelector('.image-credit');
        const imageDescription = document.querySelector('.image-description');
        
        if (!imageElement || !this.config?.characterImages?.length) {
            console.warn('图片元素未找到或配置为空');
            return;
        }
        
        // 随机选择一张图片
        const randomIndex = Math.floor(Math.random() * this.config.characterImages.length);
        this.currentImageIndex = randomIndex;
        const selectedImage = this.config.characterImages[randomIndex];
        
        // 加载图片
        await this.loadImage(selectedImage, imageElement, imageCredit, imageDescription);
        
        console.log('图片画廊初始化完成');
    }
    
    async loadImage(selectedImage, imageElement, imageCredit, imageDescription) {
        const img = new Image();
        
        return new Promise((resolve) => {
            img.onload = () => {
                imageElement.src = selectedImage.url;
                imageElement.alt = selectedImage.alt;
                imageElement.classList.remove('loading');
                
                // 更新图片信息
                if (imageCredit) imageCredit.textContent = selectedImage.credit || '';
                if (imageDescription) imageDescription.textContent = selectedImage.description || '';
                
                // 淡入效果
                imageElement.style.opacity = 0;
                requestAnimationFrame(() => {
                    imageElement.style.transition = 'opacity 0.8s ease';
                    imageElement.style.opacity = 1;
                });
                
                console.log('图片加载成功:', selectedImage.url);
                resolve(true);
            };
            
            img.onerror = () => {
                console.error('图片加载失败:', selectedImage.url);
                // 加载失败，使用默认图片
                this.loadDefaultImage(imageElement, imageCredit, imageDescription);
                resolve(false);
            };
            
            img.src = selectedImage.url;
        });
    }
    
    loadDefaultImage(imageElement, imageCredit, imageDescription) {
        const defaultImage = this.config.defaultImage;
        
        const img = new Image();
        img.onload = () => {
            imageElement.src = defaultImage.url;
            imageElement.alt = defaultImage.alt;
            imageElement.classList.remove('loading');
            
            if (imageCredit) imageCredit.textContent = defaultImage.credit;
            if (imageDescription) imageDescription.textContent = defaultImage.description;
            
            imageElement.style.opacity = 0;
            requestAnimationFrame(() => {
                imageElement.style.transition = 'opacity 0.8s ease';
                imageElement.style.opacity = 1;
            });
        };
        
        img.onerror = () => {
            // 如果默认图片也加载失败，使用纯色背景
            console.error('默认图片也加载失败，使用纯色背景');
            imageElement.style.backgroundColor = 'var(--primary-light)';
            imageElement.style.display = 'flex';
            imageElement.style.alignItems = 'center';
            imageElement.style.justifyContent = 'center';
            imageElement.innerHTML = '<span style="color: white; font-size: 1.2rem;">🍑 桃汽水</span>';
            imageElement.classList.remove('loading');
            
            if (imageCredit) imageCredit.textContent = '图片加载失败';
            if (imageDescription) imageDescription.textContent = '显示默认形象';
        };
        
        img.src = defaultImage.url;
    }
    
    // ==================== 公告板系统 ====================

    initAnnouncement() {
        const carousel = document.querySelector('.announcement-carousel');
        const indicators = document.querySelector('.announcement-indicators');
        if (!carousel || !indicators) {
            console.warn('公告板元素未找到');
            return;
        }
        
        const announcements = this.config.announcements || [];
        if (!announcements.length) {
            carousel.innerHTML = this.createDefaultAnnouncement();
            return;
        }
        
        // 生成公告项和指示点
        carousel.innerHTML = announcements.map((announcement, index) => 
            this.createAnnouncementHTML(announcement, index)
        ).join('');
        
        indicators.innerHTML = announcements.map((_, index) => 
            `<div class="announcement-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`
        ).join('');
        
        this.currentAnnouncementIndex = 0;
        
        console.log('公告板初始化完成');
    }
    
    createDefaultAnnouncement() {
        return `
            <div class="announcement-item">
                <div class="announcement-header">
                    <h3 class="announcement-title">欢迎来到魔力补给站！</h3>
                </div>
                <p class="announcement-content">这里是桃汽水的粉丝互动站，最新公告将在这里显示～</p>
                <div class="announcement-footer">
                    <span class="announcement-date">${this.formatDate(new Date().toISOString().split('T')[0])}</span>
                </div>
            </div>
        `;
    }
    
    createAnnouncementHTML(announcement, index) {
        const isUrgent = announcement.type === 'urgent';
        
        return `
            <div class="announcement-item" data-index="${index}">
                <div class="announcement-header">
                    <h3 class="announcement-title">${announcement.title}</h3>
                    ${isUrgent ? '<span class="urgent-badge">紧急</span>' : ''}
                </div>
                <p class="announcement-content">${announcement.content}</p>
                <div class="announcement-footer">
                    <span class="announcement-date">${this.formatDate(announcement.date)}</span>
                </div>
            </div>
        `;
    }
    
    showPrevAnnouncement() {
        const announcements = this.config.announcements || [];
        if (announcements.length <= 1) return;
        
        const carousel = document.querySelector('.announcement-carousel');
        const dots = document.querySelectorAll('.announcement-dot');
        
        this.currentAnnouncementIndex = (this.currentAnnouncementIndex - 1 + announcements.length) % announcements.length;
        
        // 更新位置
        carousel.scrollLeft = this.currentAnnouncementIndex * carousel.offsetWidth;
        
        // 更新指示点
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentAnnouncementIndex);
        });
    }
    
    showNextAnnouncement() {
        const announcements = this.config.announcements || [];
        if (announcements.length <= 1) return;
        
        const carousel = document.querySelector('.announcement-carousel');
        const dots = document.querySelectorAll('.announcement-dot');
        
        this.currentAnnouncementIndex = (this.currentAnnouncementIndex + 1) % announcements.length;
        
        // 更新位置
        carousel.scrollLeft = this.currentAnnouncementIndex * carousel.offsetWidth;
        
        // 更新指示点
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentAnnouncementIndex);
        });
    }
    
    // ==================== 留言墙系统 ====================

    initMessageWall() {
        const wall = document.querySelector('.message-item');
        if (!wall) {
            console.warn('留言墙元素未找到');
            return;
        }
        
        if (!this.config?.fanMessages?.length) {
            wall.innerHTML = this.createDefaultMessage();
            return;
        }
        
        this.currentMessageIndex = 0;
        this.renderMessage(wall, this.currentMessageIndex);
        
        console.log('留言墙初始化完成');
    }
    
    createDefaultMessage() {
        return `
            <div class="message-header">
                <span class="message-avatar">🍑</span>
                <div class="message-meta">
                    <span class="message-author">桃汽水</span>
                    <span class="message-date">${this.formatDate(new Date().toISOString().split('T')[0])}</span>
                </div>
            </div>
            <p class="message-content">留言正在准备中，稍后再来看看吧～</p>
            <div class="message-controls">
                <button class="btn-prev-message" disabled>❮</button>
                <span class="message-counter">1/1</span>
                <button class="btn-next-message" disabled>❯</button>
            </div>
        `;
    }
    
    renderMessage(container, index) {
        const message = this.config.fanMessages[index];
        if (!message) return;
        
        container.innerHTML = `
            <div class="message-header">
                <span class="message-avatar">${message.emoji || '🍑'}</span>
                <div class="message-meta">
                    <span class="message-author">桃汽水</span>
                    <span class="message-date">${this.formatDate(message.date)}</span>
                </div>
            </div>
            <p class="message-content">${message.text}</p>
            <div class="message-controls">
                <button class="btn-prev-message">❮</button>
                <span class="message-counter">${index + 1}/${this.config.fanMessages.length}</span>
                <button class="btn-next-message">❯</button>
            </div>
        `;
        
        console.log('留言已渲染:', index + 1);
    }
    
    showPrevMessage() {
        if (!this.config?.fanMessages?.length) return;
        
        this.currentMessageIndex = (this.currentMessageIndex - 1 + this.config.fanMessages.length) % this.config.fanMessages.length;
        this.renderMessage(document.querySelector('.message-item'), this.currentMessageIndex);
    }
    
    showNextMessage() {
        if (!this.config?.fanMessages?.length) return;
        
        this.currentMessageIndex = (this.currentMessageIndex + 1) % this.config.fanMessages.length;
        this.renderMessage(document.querySelector('.message-item'), this.currentMessageIndex);
    }
    
    // ==================== 弹幕系统 ====================

    initMessageBarrage() {
        const container = document.querySelector('.message-barrage-container');
        if (!container) return;
        
        const barrageTimer = setInterval(() => {
            this.createMessageBarrage(container);
        }, 3000);
        
        this.timers.push(barrageTimer);
        
        // 初始创建几个弹幕
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.createMessageBarrage(container);
            }, i * 800);
        }
    }
    
    createMessageBarrage(container) {
        const messages = [
            '桃汽水加油！',
            '最喜欢你了！',
            '明天也要直播哦！',
            '注意休息～',
            '新衣服好可爱！',
            '唱歌太好听了！',
            '永远支持你！',
            '直播辛苦了！'
        ];
        
        const text = messages[Math.floor(Math.random() * messages.length)];
        
        const barrage = document.createElement('div');
        barrage.className = 'message-barrage';
        barrage.textContent = text;
        
        // 随机起始位置（从上到下）
        const top = Math.random() * 80 + 10; // 10% - 90%
        
        barrage.style.cssText = `
            top: ${top}%;
            left: 100%;
            font-size: ${Math.random() * 4 + 12}px;
        `;
        
        container.appendChild(barrage);
        
        // 简单动画
        const startTime = Date.now();
        const duration = 10000; // 10秒
        const startLeft = container.offsetWidth;
        const endLeft = -barrage.offsetWidth;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (progress < 1) {
                const currentLeft = startLeft + progress * (endLeft - startLeft);
                barrage.style.left = `${currentLeft}px`;
                requestAnimationFrame(animate);
            } else {
                if (barrage.parentNode) {
                    barrage.parentNode.removeChild(barrage);
                }
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // ==================== 事件绑定 ====================

    bindEvents() {
        // 公告左右切换按钮
        const prevAnnouncementBtn = document.querySelector('.btn-prev-announcement');
        const nextAnnouncementBtn = document.querySelector('.btn-next-announcement');
        
        if (prevAnnouncementBtn) {
            this.addEventListener(prevAnnouncementBtn, 'click', () => this.showPrevAnnouncement());
        }
        
        if (nextAnnouncementBtn) {
            this.addEventListener(nextAnnouncementBtn, 'click', () => this.showNextAnnouncement());
        }
        
        // 公告指示点点击
        const dotsContainer = document.querySelector('.announcement-indicators');
        if (dotsContainer) {
            this.addEventListener(dotsContainer, 'click', (e) => {
                const dot = e.target.closest('.announcement-dot');
                if (dot) {
                    const index = parseInt(dot.getAttribute('data-index'));
                    const carousel = document.querySelector('.announcement-carousel');
                    const dots = document.querySelectorAll('.announcement-dot');
                    
                    this.currentAnnouncementIndex = index;
                    carousel.scrollLeft = index * carousel.offsetWidth;
                    
                    dots.forEach((d, i) => {
                        d.classList.toggle('active', i === index);
                    });
                }
            });
        }
        
        // 留言翻页按钮
        const messageClickHandler = (e) => {
            const prevBtn = e.target.closest('.btn-prev-message');
            const nextBtn = e.target.closest('.btn-next-message');
            
            if (prevBtn) {
                this.showPrevMessage();
            } else if (nextBtn) {
                this.showNextMessage();
            }
        };
        
        this.addEventListener(document, 'click', messageClickHandler);
        
        // 窗口大小变化
        this.addEventListener(window, 'resize', this.handleResize.bind(this));
        
        console.log('事件绑定完成');
    }
    
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }
    
    handleResize() {
        // 重新初始化弹幕效果（如果窗口大小变化）
        if (window.innerWidth >= 768) {
            const container = document.querySelector('.message-barrage-container');
            if (container) {
                container.innerHTML = '';
                this.initMessageBarrage();
            }
        }
    }
    
    // ==================== 工具方法 ====================

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (isNaN(diffDays)) {
                return dateString;
            }
            
            if (diffDays === 0) return '今天';
            if (diffDays === 1) return '昨天';
            if (diffDays < 7) return `${diffDays}天前`;
            
            return date.toLocaleDateString('zh-CN', { 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (error) {
            console.error('日期格式化错误:', error);
            return dateString;
        }
    }
    
    showError(container, error) {
        container.innerHTML = `
            <div class="card" style="max-width: 600px; margin: 2rem auto;">
                <h2 class="card-title">页面加载失败</h2>
                <p class="card-content">抱歉，首页模块加载时出现了问题：${error.message}</p>
                <div class="mt-2">
                    <button id="retry-home" class="btn btn-primary">重试</button>
                    <button onclick="window.app.navigate('/')" class="btn btn-pink ml-2">返回首页</button>
                </div>
            </div>
        `;
        
        const retryBtn = document.getElementById('retry-home');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.destroy();
                this.init(container);
            });
        }
    }
}