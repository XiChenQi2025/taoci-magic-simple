// SPA应用核心 - 修复版
class App {
    constructor() {
        // 更新模块名称，使其更贴合网站设计理念
        this.routes = [
            { path: '/', name: '精灵圣殿', module: 'home', navColor: 'var(--primary)', emoji: '🏰' },
            { path: '/games', name: '幻游玩界', module: 'games', navColor: 'var(--blue)', emoji: '🎮' },
            { path: '/answer-book', name: '魔法秘典', module: 'answer-book', navColor: 'var(--purple)', emoji: '📚' },
            { path: '/fortune', name: '命运轮盘', module: 'fortune', navColor: 'var(--yellow)', emoji: '🎡' },
            { path: '/message-board', name: '契约之声', module: 'message-board', navColor: 'var(--orange)', emoji: '💌' }
        ];
        
        this.currentModule = null;
        this.state = {
            userNickname: null,
            theme: 'light'
        };
        
        // CSS管理器，解决路由切换时CSS加载问题
        this.cssManager = {
            loadedModules: new Set(),
            loadModuleCSS: async (moduleName) => {
                // 如果已经加载过，不再重复加载
                if (this.cssManager.loadedModules.has(moduleName)) {
                    return;
                }
                
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = `scripts/modules/${moduleName}/${moduleName}-styles.css`;
                link.id = `css-${moduleName}`;
                
                return new Promise((resolve) => {
                    link.onload = () => {
                        this.cssManager.loadedModules.add(moduleName);
                        console.log(`CSS加载成功: ${moduleName}`);
                        resolve();
                    };
                    
                    link.onerror = () => {
                        console.warn(`CSS加载失败: ${moduleName}，但继续执行`);
                        this.cssManager.loadedModules.add(moduleName); // 标记为已加载，避免重复尝试
                        resolve(); // 即使CSS加载失败，也继续执行，避免阻塞
                    };
                    
                    document.head.appendChild(link);
                });
            },
            unloadModuleCSS: (moduleName) => {
                // 注意：这里我们不卸载CSS，因为模块切换时可能会频繁加载/卸载
                // 只清理DOM元素，保留CSS缓存以提高性能
                const link = document.getElementById(`css-${moduleName}`);
                if (link && !this.cssManager.loadedModules.has(moduleName)) {
                    link.remove();
                }
            },
            // 清理指定模块的CSS（当明确知道不再需要时调用）
            cleanupModuleCSS: (moduleName) => {
                const link = document.getElementById(`css-${moduleName}`);
                if (link) {
                    link.remove();
                    this.cssManager.loadedModules.delete(moduleName);
                }
            }
        };
        
        this.init();
    }
    
    async init() {
        // 添加背景层
        this.addBackgroundOverlay();
        
        // 渲染页眉和页脚
        this.renderHeader();
        this.renderFooter();
        
        // 创建内容容器
        this.createContentContainer();
        
        // 初始路由
        const path = window.location.pathname || '/';
        await this.navigate(path);
        
        // 监听路由变化
        window.addEventListener('popstate', () => {
            this.navigate(window.location.pathname);
        });
        
        // 全局错误处理
        window.addEventListener('error', (event) => {
            console.error('全局错误捕获:', event.error);
            if (event.target.tagName === 'IMG') {
                console.error('图片加载失败:', event.target.src);
                // 为图片设置默认占位符
                event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjQjM5REQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaYr+WQpuWbvueJhzwvdGV4dD48L3N2Zz4=';
                event.target.alt = '图片加载失败';
            }
        });
    }
    
    addBackgroundOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'background-overlay';
        document.body.appendChild(overlay);
    }
    
    createContentContainer() {
        const container = document.getElementById('app-container');
        
        // 确保内容容器在页脚之前
        const footer = document.getElementById('app-footer');
        let content = document.getElementById('main-content');
        
        if (!content) {
            content = document.createElement('main');
            content.id = 'main-content';
            
            // 如果有页脚，在页脚之前插入；否则添加到容器末尾
            if (footer) {
                container.insertBefore(content, footer);
            } else {
                container.appendChild(content);
            }
        }
    }
    
    renderHeader() {
        const header = document.createElement('header');
        header.id = 'app-header';
        document.getElementById('app-container').appendChild(header);
        
        import('./header.js').then(module => {
            const Header = module.default;
            new Header(this.routes, (path) => this.navigate(path));
        }).catch(error => {
            console.error('加载页眉组件失败:', error);
            header.innerHTML = '<div class="header-brand">桃汽水の魔力补给站</div>';
        });
    }
    
    renderFooter() {
        const footer = document.createElement('footer');
        footer.id = 'app-footer';
        document.getElementById('app-container').appendChild(footer);
        
        import('./footer.js').then(module => {
            const Footer = module.default;
            new Footer();
        }).catch(error => {
            console.error('加载页脚组件失败:', error);
            footer.innerHTML = '<p>© 2024 桃汽水の魔力补给站</p>';
        });
    }
    
    async navigate(path) {
        console.log(`导航到: ${path}`);
        
        // 清理当前模块
        if (this.currentModule) {
            try {
                console.log('清理当前模块...');
                await this.currentModule.destroy();
                this.currentModule = null;
            } catch (error) {
                console.error('清理模块失败:', error);
            }
        }
        
        // 更新URL
        if (window.location.pathname !== path) {
            window.history.pushState(null, '', path);
        }
        
        // 获取内容容器
        let content = document.getElementById('main-content');
        if (!content) {
            this.createContentContainer();
            content = document.getElementById('main-content');
        }
        
        // 显示加载状态
        content.innerHTML = `
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 300px;">
                <div class="loading-spinner"></div>
                <p style="margin-top: 20px; color: var(--primary);">加载中...</p>
            </div>
        `;
        
        try {
            // 动态导入模块
            const route = this.routes.find(r => r.path === path) || this.routes[0];
            console.log(`加载模块: ${route.module}`);
            
            // 预加载模块CSS（避免CSS加载问题）
            await this.cssManager.loadModuleCSS(route.module);
            
            // 更新导航激活状态
            this.updateActiveNav(route.path);
            
            // 动态导入模块JS
            const module = await import(`../modules/${route.module}/index.js`);
            this.currentModule = new module.default();
            
            // 初始化模块
            await this.currentModule.init(content);
            
            console.log(`模块 ${route.module} 加载完成`);
            
        } catch (error) {
            console.error('导航失败:', error);
            content.innerHTML = `
                <div class="card" style="max-width: 600px; margin: 2rem auto;">
                    <h2 class="card-title">页面加载失败</h2>
                    <p class="card-content">抱歉，页面加载时出现了问题：${error.message}</p>
                    <div style="margin-top: 2rem;">
                        <button class="btn btn-pink" onclick="app.navigate('/')">返回首页</button>
                        <button class="btn btn-primary" onclick="location.reload()" style="margin-left: 1rem;">刷新页面</button>
                    </div>
                </div>
            `;
        }
    }
    
    updateActiveNav(activePath) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.getAttribute('data-path') === activePath) {
                link.style.fontWeight = 'bold';
                link.style.textShadow = '0 0 10px currentColor';
                link.style.boxShadow = '0 0 15px currentColor';
            } else {
                link.style.fontWeight = 'normal';
                link.style.textShadow = 'none';
                link.style.boxShadow = 'none';
            }
        });
    }
    
    // 工具方法：预加载资源
    preloadResources(moduleName) {
        // 可以根据模块名预加载特定资源
        const preloadMap = {
            'home': ['/assets/home/character-1.png', '/assets/home/character-2.png'],
            'games': [],
            'answer-book': [],
            'fortune': [],
            'message-board': []
        };
        
        const resources = preloadMap[moduleName] || [];
        resources.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = url;
            document.head.appendChild(link);
        });
    }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    window.app = app; // 全局访问
    
    // 全局错误处理
    window.onerror = function(message, source, lineno, colno, error) {
        console.error('全局错误:', { message, source, lineno, colno, error });
        return true; // 阻止默认错误处理
    };
    
    // 未处理的Promise拒绝
    window.addEventListener('unhandledrejection', function(event) {
        console.error('未处理的Promise拒绝:', event.reason);
    });
});