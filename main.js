// ==========================================
// 桃汽水の魔力补给站 - 主骨架逻辑
// 整合2.md功能 + 启动包模块化架构
// ==========================================

class TaociFramework {
    constructor() {
        this.modules = new Map(); // 存储已注册模块
        this.currentModule = null; // 当前激活模块
        this.moduleContainer = document.getElementById('module-container');
        this.navMenu = document.getElementById('nav-menu');
        this.notificationArea = document.getElementById('notification-area');
        this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
        this.backToTopBtn = document.getElementById('back-to-top');
        this.isMobileMenuOpen = false;
        
        // 默认模块配置
        this.defaultModules = [
            {
                id: 'home',
                name: '魔力大厅',
                icon: 'fas fa-home',
                enabled: true
            },
            {
                id: 'games',
                name: '收集魔力',
                icon: 'fas fa-gamepad',
                enabled: false
            },
            {
                id: 'wheel',
                name: '祈愿转盘',
                icon: 'fas fa-gift',
                enabled: false
            },
            {
                id: 'ranking',
                name: '魔力榜单',
                icon: 'fas fa-trophy',
                enabled: false
            },
            {
                id: 'messages',
                name: '留言板',
                icon: 'fas fa-comments',
                enabled: false
            }
        ];
        
        this.init();
    }
    
    // 初始化框架
    init() {
        console.log('🍑 桃汽水の魔力补给站 - 主骨架初始化');
        
        // 1. 初始化事件监听
        this.initEventListeners();
        
        // 2. 初始化导航
        this.initNavigation();
        
        // 3. 设置路由监听
        this.initRouter();
        
        // 4. 加载初始模块（首页）
        this.loadModule('home');
        
        // 5. 显示欢迎通知
        this.showNotification('欢迎来到桃汽水公主的魔力补给站！', 'info');
    }
    
    // 初始化事件监听
    initEventListeners() {
        // 滚动事件 - 显示回到顶部按钮
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // 窗口大小变化
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // 移动端菜单按钮
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', this.toggleMobileMenu.bind(this));
        }
        
        // 回到顶部按钮
        if (this.backToTopBtn) {
            this.backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }
    
    // 初始化导航栏
    initNavigation() {
        // 清空现有导航
        this.navMenu.innerHTML = '';
        
        // 添加导航项
        this.defaultModules.forEach(module => {
            if (module.enabled) {
                this.addNavItem(module);
            }
        });
        
        // 绑定页脚链接
        this.bindFooterLinks();
    }
    
    // 添加导航项
    addNavItem(module) {
        const link = document.createElement('a');
        link.href = `#${module.id}`;
        link.className = 'nav-link';
        link.dataset.module = module.id;
        link.innerHTML = `
            <i class="${module.icon}"></i>
            <span>${module.name}</span>
        `;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.activateModule(module.id);
            
            // 关闭移动端菜单
            if (this.isMobileMenuOpen) {
                this.toggleMobileMenu();
            }
        });
        
        this.navMenu.appendChild(link);
    }
    
    // 绑定页脚链接
    bindFooterLinks() {
        const footerLinks = document.querySelectorAll('.footer-links a');
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const moduleId = link.dataset.module;
                this.activateModule(moduleId);
            });
        });
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
            
            // 更新URL hash
            window.history.pushState(null, null, `#${moduleId}`);
            
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (error) {
            console.error(`加载模块 ${moduleId} 失败:`, error);
            this.showNotification(`加载模块失败: ${error.message}`, 'error');
            this.showErrorState();
        }
    }
    
    // 加载模块内容
    async loadModule(moduleId) {
        // 如果是首页，使用内置欢迎页面（稍后加载home模块）
        if (moduleId === 'home') {
            await this.loadModuleFiles('home');
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
            if (!htmlResponse.ok) {
                // 如果模块不存在，显示占位页面
                this.showPlaceholderPage(moduleId);
                return;
            }
            
            const html = await htmlResponse.text();
            
            // 加载CSS
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = `modules/${moduleId}/${moduleId}.css`;
            document.head.appendChild(cssLink);
            
            // 加载JS
            const script = document.createElement('script');
            script.src = `modules/${moduleId}/${moduleId}.js`;
            script.type = 'module';
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
    
    // 显示占位页面（用于未开发的模块）
    showPlaceholderPage(moduleId) {
        const moduleName = this.getModuleName(moduleId);
        const icon = this.getModuleIcon(moduleId);
        
        this.moduleContainer.innerHTML = `
            <div class="page-placeholder">
                <i class="${icon} fa-3x"></i>
                <h2>${moduleName}</h2>
                <p>${this.getModuleDescription(moduleId)}</p>
                <p class="placeholder-hint">功能开发中，敬请期待...</p>
            </div>
        `;
    }
    
    // 获取模块描述
    getModuleDescription(moduleId) {
        const descriptions = {
            'home': '我是来自异世界的精灵公主桃汽水~ 周年庆活动马上就要开始啦！',
            'games': '通过小游戏收集魔力，帮助公主维持次元裂缝',
            'wheel': '消耗魔力抽取桃汽水公主准备的特别礼物',
            'ranking': '查看魔力收集排行榜，前10名将获得公主的特别奖励',
            'messages': '写下对桃汽水公主的祝福和想说的话，所有留言都会被公主看到哦~'
        };
        return descriptions[moduleId] || '模块内容';
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
            'home': '魔力大厅',
            'games': '收集魔力',
            'wheel': '祈愿转盘',
            'ranking': '魔力榜单',
            'messages': '留言板'
        };
        return moduleMap[moduleId] || moduleId;
    }
    
    // 获取模块图标
    getModuleIcon(moduleId) {
        const iconMap = {
            'home': 'fas fa-home',
            'games': 'fas fa-gamepad',
            'wheel': 'fas fa-gift',
            'ranking': 'fas fa-trophy',
            'messages': 'fas fa-comments'
        };
        return iconMap[moduleId] || 'fas fa-cube';
    }
    
    // 切换移动端菜单
    toggleMobileMenu() {
        const navMenu = this.navMenu;
        const mobileBtn = this.mobileMenuBtn;
        
        if (!navMenu || !mobileBtn) return;
        
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        
        if (this.isMobileMenuOpen) {
            navMenu.classList.add('active');
            mobileBtn.innerHTML = '<i class="fas fa-times"></i>';
            mobileBtn.setAttribute('aria-label', '关闭菜单');
        } else {
            navMenu.classList.remove('active');
            mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
            mobileBtn.setAttribute('aria-label', '打开菜单');
        }
    }
    
    // 处理滚动事件
    handleScroll() {
        // 回到顶部按钮
        if (this.backToTopBtn) {
            if (window.scrollY > 300) {
                this.backToTopBtn.classList.add('visible');
            } else {
                this.backToTopBtn.classList.remove('visible');
            }
        }
        
        // 导航栏阴影
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 10) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }
    
    // 处理窗口大小变化
    handleResize() {
        // 如果窗口变宽且移动端菜单打开，则关闭菜单
        if (window.innerWidth > 768 && this.isMobileMenuOpen) {
            this.toggleMobileMenu();
        }
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
    
    console.log('🍑 桃汽水の魔力补给站 已启动！');
});