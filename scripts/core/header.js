// 页眉组件
export default class Header {
    constructor(routes, navigateCallback) {
        this.routes = routes;
        this.navigateCallback = navigateCallback;
        this.isMobile = window.innerWidth <= 768;
        
        this.init();
        this.bindEvents();
    }
    
    init() {
        const header = document.getElementById('app-header');
        if (!header) return;
        
        // 品牌区域
        const brandDiv = document.createElement('div');
        brandDiv.className = 'header-brand';
        
        const avatar = document.createElement('div');
        avatar.className = 'brand-avatar';
        avatar.textContent = '🍑'; // 使用桃子emoji
        
        const title = document.createElement('h1');
        title.className = 'brand-title';
        title.textContent = '桃汽水の魔力补给站';
        
        brandDiv.appendChild(avatar);
        brandDiv.appendChild(title);
        
        header.appendChild(brandDiv);
        
        // 桌面导航
        const navDesktop = document.createElement('nav');
        navDesktop.className = 'nav-desktop';
        
        this.routes.forEach(route => {
            const link = document.createElement('a');
            link.className = `nav-link ${this.getColorClass(route.navColor)}`;
            link.href = route.path;
            link.innerHTML = `${route.emoji} ${route.name}`;
            link.setAttribute('data-path', route.path);
            link.style.setProperty('--neon-color', route.navColor);
            
            navDesktop.appendChild(link);
        });
        
        header.appendChild(navDesktop);
        
        // 移动端菜单按钮
        const mobileBtn = document.createElement('button');
        mobileBtn.className = 'mobile-menu-btn';
        mobileBtn.innerHTML = '☰';
        mobileBtn.setAttribute('aria-label', '打开菜单');
        
        header.appendChild(mobileBtn);
        
        // 移动端菜单 - 使用新的结构
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        
        // 移动端菜单头部（包含关闭按钮）
        const mobileMenuHeader = document.createElement('div');
        mobileMenuHeader.className = 'mobile-menu-header';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-menu-btn';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', '关闭菜单');
        
        mobileMenuHeader.appendChild(closeBtn);
        mobileMenu.appendChild(mobileMenuHeader);
        
        // 移动端菜单内容区域
        const mobileMenuContent = document.createElement('div');
        mobileMenuContent.className = 'mobile-menu-content';
        
        this.routes.forEach(route => {
            const link = document.createElement('a');
            link.className = `nav-link ${this.getColorClass(route.navColor)}`;
            link.href = route.path;
            link.innerHTML = `${route.emoji} ${route.name}`;
            link.setAttribute('data-path', route.path);
            link.style.fontSize = '1.1rem';
            
            mobileMenuContent.appendChild(link);
        });
        
        mobileMenu.appendChild(mobileMenuContent);
        document.body.appendChild(mobileMenu);
        
        // 移动端菜单状态
        this.mobileMenu = mobileMenu;
        this.mobileBtn = mobileBtn;
        this.closeBtn = closeBtn;
    }
    
    getColorClass(navColor) {
        if (navColor.includes('pink')) return 'pink';
        if (navColor.includes('blue')) return 'blue';
        if (navColor.includes('purple')) return 'purple';
        if (navColor.includes('yellow')) return 'yellow';
        if (navColor.includes('orange')) return 'orange';
        return '';
    }
    
    bindEvents() {
        // 导航链接点击事件
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const path = link.getAttribute('data-path');
                
                if (this.navigateCallback) {
                    this.navigateCallback(path);
                }
                
                // 关闭移动端菜单
                if (this.mobileMenu.classList.contains('active')) {
                    this.mobileMenu.classList.remove('active');
                }
            });
        });
        
        // 移动端菜单按钮
        if (this.mobileBtn) {
            this.mobileBtn.addEventListener('click', () => {
                this.mobileMenu.classList.add('active');
            });
        }
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.mobileMenu.classList.remove('active');
            });
        }
        
        // 点击外部关闭移动菜单
        document.addEventListener('click', (e) => {
            if (this.mobileMenu.classList.contains('active') && 
                !this.mobileMenu.contains(e.target) && 
                e.target !== this.mobileBtn) {
                this.mobileMenu.classList.remove('active');
            }
        });
        
        // 窗口大小变化
        window.addEventListener('resize', () => {
            const newIsMobile = window.innerWidth <= 768;
            if (newIsMobile !== this.isMobile) {
                this.isMobile = newIsMobile;
            }
        });
    }
}