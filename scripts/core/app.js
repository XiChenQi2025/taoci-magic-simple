// SPA应用核心
class App {
    constructor() {
        this.routes = [
            { path: '/', name: '首页', module: 'home', navColor: 'var(--neon-pink)' },
            { path: '/games', name: '小游戏', module: 'games', navColor: 'var(--neon-blue)' },
            { path: '/answer-book', name: '答案之书', module: 'answer-book', navColor: 'var(--neon-purple)' },
            { path: '/fortune', name: '盲盒运势', module: 'fortune', navColor: 'var(--neon-yellow)' },
            { path: '/message-board', name: '留言角', module: 'message-board', navColor: 'var(--neon-green)' }
        ];
        
        this.currentModule = null;
        this.state = {
            userNickname: null,
            theme: 'dark'
        };
        
        this.init();
    }
    
    async init() {
        this.renderHeader();
        this.renderFooter();
        
        // 初始路由
        const path = window.location.pathname || '/';
        await this.navigate(path);
        
        // 监听路由变化
        window.addEventListener('popstate', () => {
            this.navigate(window.location.pathname);
        });
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
        // 清理当前模块
        if (this.currentModule) {
            try {
                this.currentModule.destroy();
            } catch (error) {
                console.error('清理模块失败:', error);
            }
        }
        
        // 更新URL
        if (window.location.pathname !== path) {
            window.history.pushState(null, '', path);
        }
        
        // 创建内容容器
        let content = document.getElementById('main-content');
        if (!content) {
            content = document.createElement('main');
            content.id = 'main-content';
            document.getElementById('app-container').appendChild(content);
        }
        
        // 显示加载状态
        content.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
                <div class="loading-spinner"></div>
            </div>
        `;
        
        try {
            // 动态导入模块
            const route = this.routes.find(r => r.path === path) || this.routes[0];
            
            // 更新导航激活状态
            this.updateActiveNav(route.path);
            
            const module = await import(`../modules/${route.module}/index.js`);
            this.currentModule = new module.default();
            await this.currentModule.init(content);
            
        } catch (error) {
            console.error('导航失败:', error);
            content.innerHTML = `
                <div class="card">
                    <h2 class="card-title">页面加载失败</h2>
                    <p class="card-content">网络开小差了，请重试或返回首页</p>
                    <button class="btn btn-pink mt-1" onclick="app.navigate('/')">返回首页</button>
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
            } else {
                link.style.fontWeight = 'normal';
                link.style.textShadow = 'none';
            }
        });
    }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    window.app = app; // 全局访问
});