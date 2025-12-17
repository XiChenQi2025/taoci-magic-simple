// ==========================================
// 桃汽水的魔力补给站 - 主骨架逻辑
// 简化版本：直接集成首页模块，支持后续模块扩展
// ==========================================

class TaociFramework {
    constructor() {
        this.modules = new Map(); // 存储已注册模块
        this.currentModule = null; // 当前激活模块
        this.moduleContainer = document.getElementById('module-container');
        this.navList = document.getElementById('nav-list');
        this.notificationArea = document.getElementById('notification-area');
        
        // 默认模块配置（首页内置，其他模块按需加载）
        this.defaultModules = [
            {
                id: 'home',
                name: '首页',
                icon: 'fas fa-home',
                enabled: true,
                builtIn: true // 内置模块
            },
            {
                id: 'game-bubble',
                name: '魔力泡泡',
                icon: 'fas fa-gamepad',
                enabled: false
            },
            {
                id: 'answer-book',
                name: '答案之书',
                icon: 'fas fa-book',
                enabled: false
            },
            {
                id: 'lottery-bilibili',
                name: 'B站抽奖',
                icon: 'fas fa-gift',
                enabled: false
            },
            {
                id: 'message-board',
                name: '留言板',
                icon: 'fas fa-comments',
                enabled: false
            }
        ];
        
        this.init();
    }
    
    // 初始化框架
    init() {
        console.log('🍑 桃汽水的魔力补给站 - 主骨架初始化');
        
        // 1. 初始化导航
        this.initNavigation();
        
        // 2. 设置路由监听
        this.initRouter();
        
        // 3. 加载初始模块（首页）
        this.activateModule('home');
        
        // 4. 显示欢迎通知
        this.showNotification('欢迎来到桃汽水的魔力补给站！', 'success');
        
        // 5. 暴露全局API
        this.exposeAPI();
    }
    
    // 初始化导航栏
    initNavigation() {
        this.defaultModules.forEach(module => {
            if (module.enabled || module.builtIn) {
                this.addNavItem(module);
            }
        });
    }
    
    // 添加导航项
    addNavItem(module) {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#${module.id}" class="nav-link" data-module="${module.id}">
                <i class="${module.icon}"></i> ${module.name}
            </a>
        `;
        
        li.querySelector('.nav-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.activateModule(module.id);
        });
        
        this.navList.appendChild(li);
    }
    
    // 初始化路由（基于hash）
    initRouter() {
        // 监听hash变化
        window.addEventListener('hashchange', () => {
            const moduleId = window.location.hash.substring(1) || 'home';
            this.activateModule(moduleId);
        });
        
        // 初始路由
        const initialHash = window.location.hash.substring(1);
        if (initialHash) {
            this.activateModule(initialHash);
        }
    }
    
    // 激活模块
    async activateModule(moduleId) {
        // 防止重复加载
        if (this.currentModule === moduleId) return;
        
        console.log(`🔄 切换模块: ${moduleId}`);
        
        // 更新导航激活状态
        this.updateNavActive(moduleId);
        
        // 显示加载状态
        this.showLoading();
        
        try {
            // 加载模块
            await this.loadModule(moduleId);
            
            // 更新当前模块
            this.currentModule = moduleId;
            
            // 更新URL hash（不触发页面刷新）
            window.history.pushState(null, null, `#${moduleId}`);
            
        } catch (error) {
            console.error(`❌ 加载模块 ${moduleId} 失败:`, error);
            this.showNotification(`加载模块失败: ${moduleId}`, 'error');
            this.showErrorState(moduleId);
        }
    }
    
    // 加载模块内容
    async loadModule(moduleId) {
        // 如果是首页，使用内置内容
        if (moduleId === 'home') {
            this.loadHomeModule();
            return;
        }
        
        // 检查模块是否已注册
        if (this.modules.has(moduleId)) {
            const module = this.modules.get(moduleId);
            this.moduleContainer.innerHTML = module.content || '<p>模块内容</p>';
            
            // 执行模块初始化函数（如果存在）
            if (module.onLoad) {
                setTimeout(() => module.onLoad(), 100);
            }
            return;
        }
        
        // 动态加载模块文件
        await this.loadModuleFiles(moduleId);
    }
    
    // 加载首页模块（内置）
    loadHomeModule() {
        // 首页HTML内容
        const homeHTML = `
            <section class="home-module">
                <!-- 角色展示区域 -->
                <div class="character-container">
                    <div class="character-display" id="character-display">
                        <div class="loading-placeholder">
                            <div class="loading-emoji">🍑</div>
                            <p>加载中...</p>
                        </div>
                    </div>
                    
                    <!-- 3D立体阴影 -->
                    <div class="character-shadow" id="character-shadow"></div>
                    
                    <!-- 漂浮粒子效果 -->
                    <div class="particles-container" id="particles-container"></div>
                </div>
                
                <!-- 欢迎卡片 -->
                <div class="greeting-card">
                    <h2 class="greeting-title" id="greeting-title">欢迎来到我的魔力补给站！</h2>
                    <p class="greeting-text" id="greeting-text">我是来自异世界的精灵公主桃汽水~ 周年庆活动马上就要开始啦，快来一起收集魔力，参加有趣的游戏吧！</p>
                    
                    <!-- 随机图片指示器 -->
                    <div class="random-indicator">
                        <span class="indicator-label">当前展示：</span>
                        <span class="indicator-value" id="current-image-index">加载中...</span>
                        <span class="indicator-hint">（每次刷新随机展示）</span>
                    </div>
                </div>
                
                <!-- 操作提示 -->
                <div class="action-hint">
                    <div class="hint-item">
                        <div class="hint-icon">🎮</div>
                        <p>点击左侧导航开始探索功能</p>
                    </div>
                    <div class="hint-item">
                        <div class="hint-icon">✨</div>
                        <p>将鼠标移到图片上查看3D效果</p>
                    </div>
                </div>
            </section>
        `;
        
        // 设置内容
        this.moduleContainer.innerHTML = homeHTML;
        
        // 加载首页逻辑
        this.loadHomeLogic();
    }
    
    // 加载首页逻辑
    async loadHomeLogic() {
        // 等待DOM渲染完成
        setTimeout(() => {
            // 配置
            const config = {
                images: {
                    count: 3,
                    folder: './assets/images/character/',
                    files: ['taoci-avatar-1.png', 'taoci-avatar-2.png', 'taoci-avatar-3.png'],
                    fallbackEmoji: '🍑',
                    altText: '桃汽水 - 异世界精灵公主'
                },
                features: {
                    enable3DEffect: true,
                    enableParticles: true,
                    enableShadow: true,
                    enableHoverEffect: true
                }
            };
            
            // 随机选择图片
            const randomIndex = Math.floor(Math.random() * config.images.count);
            const imageUrl = `${config.images.folder}${config.images.files[randomIndex]}`;
            
            // 获取元素
            const display = document.getElementById('character-display');
            const indicator = document.getElementById('current-image-index');
            const shadow = document.getElementById('character-shadow');
            const particlesContainer = document.getElementById('particles-container');
            
            if (display && indicator) {
                // 创建图片元素
                const img = document.createElement('img');
                img.className = 'character-image';
                img.src = imageUrl;
                img.alt = config.images.altText;
                
                // 图片加载成功
                img.onload = () => {
                    console.log(`✅ 图片加载成功: ${imageUrl}`);
                    
                    // 移除加载占位符
                    const placeholder = display.querySelector('.loading-placeholder');
                    if (placeholder) {
                        placeholder.style.display = 'none';
                    }
                    
                    // 添加到显示区域
                    display.appendChild(img);
                    
                    // 更新指示器
                    indicator.textContent = `图片 ${randomIndex + 1} / ${config.images.count}`;
                    
                    // 初始化功能
                    this.initHomeFeatures(config, img, shadow, particlesContainer);
                };
                
                // 图片加载失败
                img.onerror = () => {
                    console.warn(`❌ 图片加载失败: ${imageUrl}, 使用Emoji回退`);
                    
                    // 显示Emoji回退
                    display.innerHTML = `
                        <div class="emoji-fallback">
                            <div class="fallback-emoji">${config.images.fallbackEmoji}</div>
                            <p class="fallback-text">图片加载失败，请检查文件路径</p>
                        </div>
                    `;
                    
                    indicator.textContent = '加载失败';
                };
            }
            
        }, 100);
    }
    
    // 初始化首页功能
    initHomeFeatures(config, img, shadow, particlesContainer) {
        // 控制阴影显示
        if (shadow) {
            shadow.style.display = config.features.enableShadow ? 'block' : 'none';
        }
        
        // 控制粒子效果
        if (particlesContainer) {
            if (config.features.enableParticles) {
                this.createParticles(particlesContainer);
            } else {
                particlesContainer.style.display = 'none';
            }
        }
        
        // 控制悬停效果
        if (img && !config.features.enableHoverEffect) {
            img.style.pointerEvents = 'none';
        }
    }
    
    // 创建粒子效果
    createParticles(container) {
        if (!container) return;
        
        container.innerHTML = '';
        
        // 创建5个粒子
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // 随机属性
            const size = Math.random() * 6 + 2;
            const color = this.getRandomColor();
            const left = Math.random() * 80 + 10;
            const top = Math.random() * 80 + 10;
            const delay = Math.random() * 10;
            const duration = Math.random() * 10 + 15;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                top: ${top}%;
                left: ${left}%;
                animation: float-particle ${duration}s linear ${delay}s infinite;
            `;
            
            container.appendChild(particle);
        }
    }
    
    // 获取随机颜色
    getRandomColor() {
        const colors = [
            'rgba(255, 0, 255, 0.8)',    // 荧光粉
            'rgba(255, 102, 204, 0.8)',  // 热粉
            'rgba(51, 255, 153, 0.8)',   // 霓虹绿
            'rgba(255, 255, 51, 0.8)',   // 霓虹黄
            'rgba(204, 102, 255, 0.8)',  // 霓虹紫
            'rgba(51, 153, 255, 0.8)',   // 霓虹蓝
            'rgba(255, 153, 102, 0.8)'   // 霓虹橙
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // 动态加载模块文件
    async loadModuleFiles(moduleId) {
        try {
            // 加载HTML
            const htmlResponse = await fetch(`modules/${moduleId}/${moduleId}.html`);
            if (!htmlResponse.ok) throw new Error('HTML文件不存在');
            const html = await htmlResponse.text();
            
            // 加载CSS
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = `modules/${moduleId}/${moduleId}.css`;
            document.head.appendChild(cssLink);
            
            // 加载JS
            const script = document.createElement('script');
            script.src = `modules/${moduleId}/${moduleId}.js`;
            script.type = 'module'; // 支持ES6模块
            document.body.appendChild(script);
            
            // 注册模块
            this.modules.set(moduleId, {
                id: moduleId,
                name: this.getModuleName(moduleId),
                icon: this.getModuleIcon(moduleId),
                content: html,
                onLoad: () => {
                    console.log(`✅ 模块 ${moduleId} 加载完成`);
                }
            });
            
            // 显示模块内容
            this.moduleContainer.innerHTML = html;
            
            console.log(`✅ 模块 ${moduleId} 加载成功`);
            
        } catch (error) {
            console.error(`❌ 加载模块文件失败: ${moduleId}`, error);
            throw error;
        }
    }
    
    // 更新导航激活状态
    updateNavActive(moduleId) {
        // 移除所有激活状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // 添加当前激活状态
        const activeLink = document.querySelector(`.nav-link[data-module="${moduleId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    // 显示加载状态
    showLoading() {
        this.moduleContainer.innerHTML = `
            <div class="module-loading">
                <div class="loading-spinner"></div>
                <p>正在加载...</p>
            </div>
        `;
    }
    
    // 显示错误状态
    showErrorState(moduleId) {
        this.moduleContainer.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>模块加载失败</h3>
                <p>无法加载模块: ${this.getModuleName(moduleId)}</p>
                <p>请检查模块文件是否存在</p>
                <button onclick="window.TaociApp.activateModule('home')" class="retry-btn">
                    <i class="fas fa-home"></i> 返回首页
                </button>
            </div>
        `;
    }
    
    // 获取模块名称
    getModuleName(moduleId) {
        const moduleMap = {
            'home': '首页',
            'game-bubble': '魔力泡泡',
            'answer-book': '答案之书',
            'lottery-bilibili': 'B站抽奖',
            'message-board': '留言板'
        };
        return moduleMap[moduleId] || moduleId;
    }
    
    // 获取模块图标
    getModuleIcon(moduleId) {
        const iconMap = {
            'home': 'fas fa-home',
            'game-bubble': 'fas fa-gamepad',
            'answer-book': 'fas fa-book',
            'lottery-bilibili': 'fas fa-gift',
            'message-board': 'fas fa-comments'
        };
        return iconMap[moduleId] || 'fas fa-cube';
    }
    
    // 显示通知
    showNotification(message, type = 'info') {
        if (!this.notificationArea) return;
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        this.notificationArea.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // 获取通知图标
    getNotificationIcon(type) {
        const icons = {
            'info': 'info-circle',
            'success': 'check-circle',
            'warning': 'exclamation-triangle',
            'error': 'times-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    // 暴露全局API
    exposeAPI() {
        window.TaociApp = this;
        
        window.Taoci = {
            loadModule: (moduleId) => this.activateModule(moduleId),
            showNotification: (msg, type) => this.showNotification(msg, type),
            registerModule: (config) => this.registerModule(config)
        };
    }
    
    // 注册模块（供外部模块调用）
    registerModule(moduleConfig) {
        const { id, name, icon, content, onLoad } = moduleConfig;
        
        this.modules.set(id, {
            id,
            name: name || this.getModuleName(id),
            icon: icon || this.getModuleIcon(id),
            content,
            onLoad
        });
        
        console.log(`✅ 模块 ${id} 已注册`);
    }
}

// ==========================================
// 启动应用
// ==========================================

// 页面加载完成后启动框架
window.addEventListener('DOMContentLoaded', () => {
    // 创建框架实例
    const app = new TaociFramework();
    
    console.log('🍑 桃汽水的魔力补给站 已启动！');
});

// ==========================================
// 添加首页模块样式
// ==========================================

const homeModuleStyles = `
/* 首页模块样式 */
.home-module {
    animation: fadeIn 0.8s ease-out;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* 角色展示容器 */
.character-container {
    position: relative;
    width: 100%;
    max-width: 810px;
    height: 810px;
    margin: 0 auto 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
    pointer-events: none;
}

/* 角色显示区域 */
.character-display {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

/* 图片样式 */
.character-image {
    width: 80%;
    height: 80%;
    object-fit: contain;
    position: relative;
    z-index: 100;
    transform-style: preserve-3d;
    perspective: 1000px;
    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    pointer-events: auto;
    border-radius: 20px;
    background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.1), 
        rgba(255, 255, 255, 0.05));
    box-shadow: 
        0 15px 35px rgba(255, 0, 255, 0.2),
        0 0 40px rgba(255, 102, 204, 0.4),
        0 0 60px rgba(255, 102, 204, 0.3);
    animation: float-3d 8s ease-in-out infinite;
}

/* 3D浮动动画 */
@keyframes float-3d {
    0%, 100% { 
        transform: 
            translateZ(0px) 
            rotateX(0deg) 
            rotateY(0deg)
            scale(1); 
    }
    20% { 
        transform: 
            translateZ(20px) 
            rotateX(1deg) 
            rotateY(2deg)
            scale(1.02); 
    }
    40% { 
        transform: 
            translateZ(10px) 
            rotateX(-1deg) 
            rotateY(-1deg)
            scale(1.01); 
    }
    60% { 
        transform: 
            translateZ(15px) 
            rotateX(1.5deg) 
            rotateY(-2deg)
            scale(1.015); 
    }
    80% { 
        transform: 
            translateZ(5px) 
            rotateX(-0.5deg) 
            rotateY(1.5deg)
            scale(1.005); 
    }
}

/* 悬停效果 */
.character-container:hover .character-image {
    transform: 
        translateZ(30px) 
        rotateX(5deg) 
        rotateY(5deg)
        scale(1.05);
    box-shadow: 
        0 20px 45px rgba(255, 0, 255, 0.3),
        0 0 50px rgba(255, 102, 204, 0.6),
        0 0 70px rgba(255, 102, 204, 0.5);
    animation-play-state: paused;
}

/* 3D立体阴影 */
.character-shadow {
    position: absolute;
    bottom: -60px;
    left: 50%;
    transform: translateX(-50%) rotateX(80deg);
    width: 700px;
    height: 100px;
    background: radial-gradient(
        ellipse at center,
        rgba(0, 0, 0, 0.4) 0%,
        rgba(0, 0, 0, 0.3) 20%,
        rgba(0, 0, 0, 0.2) 40%,
        rgba(0, 0, 0, 0.1) 60%,
        transparent 80%
    );
    border-radius: 50%;
    filter: blur(20px);
    z-index: 10;
    opacity: 0.7;
    pointer-events: none;
    animation: shadow-pulse 8s ease-in-out infinite;
}

@keyframes shadow-pulse {
    0%, 100% { 
        opacity: 0.7;
        transform: translateX(-50%) rotateX(80deg) scale(1);
        filter: blur(20px);
    }
    50% { 
        opacity: 0.9;
        transform: translateX(-50%) rotateX(80deg) scale(1.1);
        filter: blur(25px);
    }
}

/* 加载占位符 */
.loading-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: var(--text-secondary);
}

.loading-emoji {
    font-size: 80px;
    margin-bottom: 20px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Emoji回退 */
.emoji-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.fallback-emoji {
    font-size: 120px;
    margin-bottom: 20px;
    animation: bounce 2s ease-in-out infinite;
}

.fallback-text {
    color: var(--text-secondary);
    font-size: 16px;
    text-align: center;
}

@keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

/* 欢迎卡片 */
.greeting-card {
    background: var(--bg-secondary);
    border-radius: var(--border-radius);
    padding: 30px;
    box-shadow: var(--shadow-light);
    margin: 40px auto;
    max-width: 800px;
    text-align: center;
    border: 2px solid rgba(255, 102, 204, 0.3);
}

.greeting-title {
    color: var(--flamingo-pink);
    font-size: 28px;
    margin-bottom: 15px;
    text-shadow: 0 2px 4px rgba(255, 102, 204, 0.2);
}

.greeting-text {
    color: var(--text-secondary);
    font-size: 18px;
    line-height: 1.6;
    margin-bottom: 25px;
}

/* 随机指示器 */
.random-indicator {
    background: rgba(255, 102, 204, 0.1);
    padding: 12px 20px;
    border-radius: 30px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: var(--text-secondary);
    border: 1px solid rgba(255, 102, 204, 0.2);
}

.indicator-label {
    font-weight: 500;
    color: var(--flamingo-pink);
}

.indicator-value {
    background: var(--flamingo-pink);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: bold;
    box-shadow: 0 0 10px rgba(255, 0, 255, 0.3);
}

.indicator-hint {
    font-size: 12px;
    opacity: 0.7;
}

/* 操作提示 */
.action-hint {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-top: 40px;
    flex-wrap: wrap;
}

.hint-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px 25px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    transition: all var(--transition-speed);
}

.hint-item:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-medium);
}

.hint-icon {
    font-size: 24px;
}

.hint-item p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
}

/* 粒子效果 */
.particle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 5;
    opacity: 0;
}

/* 粒子动画 */
@keyframes float-particle {
    0% {
        transform: translate(0, 0) rotate(0deg);
        opacity: 0;
    }
    10% {
        opacity: 1;
    }
    90% {
        opacity: 1;
    }
    100% {
        transform: translate(100px, -100px) rotate(360deg);
        opacity: 0;
    }
}

/* 错误状态 */
.error-state {
    text-align: center;
    padding: 60px 20px;
    animation: fadeIn 0.5s ease-out;
}

.error-icon {
    font-size: 60px;
    color: var(--neon-red);
    margin-bottom: 20px;
}

.error-state h3 {
    color: var(--text-primary);
    margin-bottom: 10px;
}

.error-state p {
    color: var(--text-secondary);
    margin-bottom: 20px;
    line-height: 1.6;
}

.retry-btn {
    background: var(--hot-pink);
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 30px;
    cursor: pointer;
    font-weight: 500;
    transition: all var(--transition-speed);
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.retry-btn:hover {
    background: var(--flamingo-pink);
    box-shadow: var(--glow-effect);
    transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .character-container {
        max-width: 700px;
        height: 700px;
    }
    
    .character-shadow {
        width: 600px;
        bottom: -50px;
    }
}

@media (max-width: 992px) {
    .character-container {
        max-width: 600px;
        height: 600px;
    }
    
    .character-shadow {
        width: 500px;
        bottom: -40px;
    }
}

@media (max-width: 768px) {
    .character-container {
        max-width: 500px;
        height: 500px;
    }
    
    .character-shadow {
        width: 400px;
        bottom: -30px;
        height: 80px;
    }
    
    .greeting-card {
        padding: 20px;
    }
    
    .greeting-title {
        font-size: 24px;
    }
    
    .greeting-text {
        font-size: 16px;
    }
    
    .action-hint {
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }
    
    .hint-item {
        width: 100%;
        max-width: 300px;
    }
}

@media (max-width: 576px) {
    .character-container {
        max-width: 350px;
        height: 350px;
    }
    
    .character-shadow {
        width: 300px;
        bottom: -20px;
        height: 60px;
    }
    
    .greeting-title {
        font-size: 22px;
    }
    
    .greeting-text {
        font-size: 15px;
    }
    
    .random-indicator {
        flex-direction: column;
        gap: 8px;
        padding: 15px;
    }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
    .character-container:hover .character-image {
        transform: none;
        animation-play-state: running;
    }
}
`;

// 注入首页样式
const styleElement = document.createElement('style');
styleElement.textContent = homeModuleStyles;
document.head.appendChild(styleElement);