// ==========================================
// 桃汽水的魔力补给站 - 主骨架逻辑
// 负责：路由管理、模块加载、事件处理
// ==========================================

class TaociFramework {
    constructor() {
        this.modules = new Map(); // 存储已注册模块
        this.currentModule = null; // 当前激活模块
        this.moduleContainer = document.getElementById('module-container');
        this.navList = document.getElementById('nav-list');
        this.notificationArea = document.getElementById('notification-area');
        
        // 默认模块配置（后续可通过配置文件扩展）
        this.defaultModules = [
            {
                id: 'home',
                name: '首页',
                icon: 'fas fa-home',
                enabled: true
            },
            {
                id: 'game-bubble',
                name: '魔力泡泡',
                icon: 'fas fa-gamepad',
                enabled: false  // 默认不启用，需要时加载
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
        this.loadModule('home');
        
        // 4. 绑定全局事件
        this.bindEvents();
        
        // 5. 显示欢迎通知
        this.showNotification('欢迎来到桃汽水的魔力补给站！', 'info');
    }
    
    // 初始化导航栏
    initNavigation() {
        this.defaultModules.forEach(module => {
            if (module.enabled) {
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
            console.error(`加载模块 ${moduleId} 失败:`, error);
            this.showNotification(`加载模块失败: ${error.message}`, 'error');
            this.showErrorState();
        }
    }
    
    // 加载模块内容
    async loadModule(moduleId) {
        // 如果是首页，使用内置欢迎页面
        if (moduleId === 'home') {
            this.renderHomePage();
            return;
        }
        
        // 检查模块是否已注册
        if (!this.modules.has(moduleId)) {
            // 动态加载模块文件
            await this.loadModuleFiles(moduleId);
        }
        
        // 获取模块配置
        const module = this.modules.get(moduleId);
        
        // 渲染模块内容
        this.moduleContainer.innerHTML = `
            <div class="module-header">
                <h2><i class="${module.icon}"></i> ${module.name}</h2>
                <p>${module.description || ''}</p>
            </div>
            <div class="module-content">
                ${module.content || '<p>模块内容加载中...</p>'}
            </div>
        `;
        
        // 执行模块初始化函数（如果存在）
        if (module.onLoad) {
            setTimeout(() => module.onLoad(), 100);
        }
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
                content: html
            });
            
            console.log(`✅ 模块 ${moduleId} 加载成功`);
            
        } catch (error) {
            console.error(`❌ 加载模块文件失败: ${moduleId}`, error);
            throw error;
        }
    }
    
    // 渲染首页（内置）
    renderHomePage() {
        this.moduleContainer.innerHTML = `
            <div class="home-page">
                <div class="hero-section">
                    <h1 class="hero-title">欢迎回来，契约者！</h1>
                    <p class="hero-subtitle">异世界精灵公主桃汽水的周年庆典正在进行中</p>
                    
                    <div class="hero-character">
                        <div class="character-display">
                            <div class="character-emoji-large">👸✨🍑</div>
                            <div class="character-quote">
                                "收集魔力，一起庆祝吧！"
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <h2>✨ 快速开始</h2>
                    <div class="action-grid" id="quick-action-grid">
                        <!-- 快速操作按钮由JS动态生成 -->
                    </div>
                </div>
                
                <div class="module-intro">
                    <h2>🎮 功能模块介绍</h2>
                    <div class="intro-cards">
                        <div class="intro-card">
                            <div class="intro-icon">🎮</div>
                            <h3>魔力泡泡</h3>
                            <p>点击泡泡收集魔力，小心调皮泡泡捣乱！</p>
                        </div>
                        <div class="intro-card">
                            <div class="intro-icon">📚</div>
                            <h3>答案之书</h3>
                            <p>向精灵公主提问，获取神秘答案</p>
                        </div>
                        <div class="intro-card">
                            <div class="intro-icon">🎁</div>
                            <h3>B站抽奖复刻</h3>
                            <p>复刻B站经典抽奖玩法，赢取虚拟奖励</p>
                        </div>
                        <div class="intro-card">
                            <div class="intro-icon">💬</div>
                            <h3>留言板</h3>
                            <p>给桃汽水公主留言，表达你的祝福</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 添加快速操作按钮
        this.renderQuickActions();
    }
    
    // 渲染快速操作
    renderQuickActions() {
        const grid = document.getElementById('quick-action-grid');
        if (!grid) return;
        
        const actions = [
            { id: 'game-bubble', icon: '🎮', label: '玩泡泡游戏', color: 'var(--neon-green)' },
            { id: 'answer-book', icon: '📚', label: '查看答案之书', color: 'var(--neon-purple)' },
            { id: 'lottery-bilibili', icon: '🎁', label: '参与抽奖', color: 'var(--neon-orange)' },
            { id: 'message-board', icon: '💬', label: '写留言', color: 'var(--neon-blue)' }
        ];
        
        grid.innerHTML = actions.map(action => `
            <button class="quick-action-btn" 
                    data-module="${action.id}"
                    style="--btn-color: ${action.color}">
                <span class="action-icon">${action.icon}</span>
                <span class="action-label">${action.label}</span>
            </button>
        `).join('');
        
        // 绑定按钮事件
        grid.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const moduleId = btn.dataset.module;
                this.activateModule(moduleId);
            });
        });
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
                <p>正在加载模块...</p>
            </div>
        `;
    }
    
    // 显示错误状态
    showErrorState() {
        this.moduleContainer.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>模块加载失败</h3>
                <p>请检查网络连接或稍后重试</p>
                <button id="retry-load" class="retry-btn">重试加载</button>
            </div>
        `;
        
        // 绑定重试按钮
        document.getElementById('retry-load')?.addEventListener('click', () => {
            this.activateModule(this.currentModule);
        });
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
    
    // 绑定全局事件
    bindEvents() {
        // 监听模块注册事件
        window.addEventListener('taoci-module-register', (e) => {
            this.registerModule(e.detail);
        });
        
        // 监听模块加载请求
        window.addEventListener('taoci-load-module', (e) => {
            this.activateModule(e.detail.moduleId);
        });
    }
    
    // 注册模块（供外部调用）
    registerModule(moduleConfig) {
        const { id, name, icon, content, onLoad } = moduleConfig;
        
        this.modules.set(id, {
            id,
            name: name || this.getModuleName(id),
            icon: icon || this.getModuleIcon(id),
            content,
            onLoad
        });
        
        // 添加到导航（如果尚未添加）
        if (!document.querySelector(`.nav-link[data-module="${id}"]`)) {
            this.addNavItem({
                id,
                name: name || this.getModuleName(id),
                icon: icon || this.getModuleIcon(id),
                enabled: true
            });
        }
        
        console.log(`✅ 模块 ${id} 已注册`);
    }
}

// ==========================================
// 启动应用
// ==========================================

// 页面加载完成后启动框架
window.addEventListener('DOMContentLoaded', () => {
    window.TaociApp = new TaociFramework();
    
    // 暴露全局API
    window.Taoci = {
        loadModule: (moduleId) => window.TaociApp.activateModule(moduleId),
        showNotification: (msg, type) => window.TaociApp.showNotification(msg, type),
        registerModule: (config) => window.TaociApp.registerModule(config)
    };
    
    console.log('🍑 桃汽水的魔力补给站 已启动！');
});

// ==========================================
// 全局样式（添加到home页面）
// ==========================================

const homeStyles = `
.home-page {
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.hero-section {
    text-align: center;
    padding: 40px 20px;
    background: linear-gradient(135deg, 
        rgba(255, 0, 255, 0.05), 
        rgba(255, 102, 204, 0.05));
    border-radius: var(--border-radius);
    margin-bottom: 40px;
}

.hero-title {
    color: var(--flamingo-pink);
    font-size: 36px;
    margin-bottom: 10px;
    text-shadow: var(--glow-effect);
}

.hero-subtitle {
    color: var(--text-secondary);
    font-size: 18px;
    margin-bottom: 30px;
}

.character-display {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    border: 2px dashed var(--hot-pink);
}

.character-emoji-large {
    font-size: 60px;
    animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.character-quote {
    font-style: italic;
    color: var(--flamingo-pink);
    font-size: 18px;
    padding: 10px 20px;
    background: white;
    border-radius: 30px;
    box-shadow: var(--shadow-light);
}

.quick-actions {
    margin-bottom: 40px;
}

.quick-actions h2 {
    color: var(--neon-purple);
    margin-bottom: 20px;
    text-align: center;
}

.action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.quick-action-btn {
    background: white;
    border: none;
    border-radius: var(--border-radius);
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all var(--transition-speed);
    border: 2px solid var(--btn-color, var(--hot-pink));
    box-shadow: var(--shadow-light);
}

.quick-action-btn:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-medium);
    border-color: var(--flamingo-pink);
}

.action-icon {
    font-size: 32px;
}

.action-label {
    font-weight: 500;
    color: var(--text-primary);
}

.module-intro h2 {
    color: var(--neon-green);
    margin-bottom: 30px;
    text-align: center;
}

.intro-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 25px;
}

.intro-card {
    background: white;
    padding: 25px;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    text-align: center;
    border-top: 4px solid var(--hot-pink);
    transition: all var(--transition-speed);
}

.intro-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-medium);
}

.intro-icon {
    font-size: 40px;
    margin-bottom: 15px;
}

.intro-card h3 {
    color: var(--flamingo-pink);
    margin-bottom: 10px;
}

.intro-card p {
    color: var(--text-secondary);
    font-size: 14px;
}

.error-state {
    text-align: center;
    padding: 60px 20px;
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
}

.retry-btn:hover {
    background: var(--flamingo-pink);
    box-shadow: var(--glow-effect);
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 28px;
    }
    
    .character-emoji-large {
        font-size: 40px;
    }
    
    .action-grid {
        grid-template-columns: 1fr 1fr;
    }
    
    .intro-cards {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .action-grid {
        grid-template-columns: 1fr;
    }
}
`;

// 注入home页样式
const styleElement = document.createElement('style');
styleElement.textContent = homeStyles;
document.head.appendChild(styleElement);