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
        
        const avatar = document.createElement('img');
        avatar.className = 'brand-avatar';
        avatar.src = 'https://via.placeholder.com/50/FF00FF/FFFFFF?text=桃';
        avatar.alt = '桃汽水';
        
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
            link.className = 'nav-link';
            link.href = route.path;
            link.textContent = route.name;
            link.setAttribute('data-path', route.path);
            link.style.color = route.navColor;
            link.style.setProperty('--neon-color', route.navColor);
            
            // 添加悬停效果
            link.style.setProperty('--hover-glow', 
                route.navColor.includes('pink') ? 'var(--glow-pink)' :
                route.navColor.includes('purple') ? 'var(--glow-purple)' :
                route.navColor.includes('blue') ? 'var(--glow-blue)' :
                route.navColor.includes('yellow') ? 'var(--glow-yellow)' :
                route.navColor.includes('green') ? 'var(--glow-green)' : 'var(--glow-orange)'
            );
            
            navDesktop.appendChild(link);
        });
        
        header.appendChild(navDesktop);
        
        // 移动端菜单按钮
        const mobileBtn = document.createElement('button');
        mobileBtn.className = 'mobile-menu-btn';
        mobileBtn.innerHTML = '≡';
        mobileBtn.setAttribute('aria-label', '打开菜单');
        
        header.appendChild(mobileBtn);
        
        // 移动端菜单
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-menu-btn';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', '关闭菜单');
        
        mobileMenu.appendChild(closeBtn);
        
        this.routes.forEach(route => {
            const link = document.createElement('a');
            link.className = 'nav-link';
            link.href = route.path;
            link.textContent = route.name;
            link.setAttribute('data-path', route.path);
            link.style.color = route.navColor;
            link.style.fontSize = '1.5rem';
            
            mobileMenu.appendChild(link);
        });
        
        document.body.appendChild(mobileMenu);
        
        // 移动端菜单状态
        this.mobileMenu = mobileMenu;
        this.mobileBtn = mobileBtn;
        this.closeBtn = closeBtn;
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
        
        // 窗口大小变化
        window.addEventListener('resize', () => {
            const newIsMobile = window.innerWidth <= 768;
            if (newIsMobile !== this.isMobile) {
                this.isMobile = newIsMobile;
            }
        });
    }
}