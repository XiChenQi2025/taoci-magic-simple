// SPA应用核心
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
        // 清理当前模块
        if (this.currentModule) {
            try {
                await this.currentModule.destroy();
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
                link.style.boxShadow = '0 0 15px currentColor';
            } else {
                link.style.fontWeight = 'normal';
                link.style.textShadow = 'none';
                link.style.boxShadow = 'none';
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