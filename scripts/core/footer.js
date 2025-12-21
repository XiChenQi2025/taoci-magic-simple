// 页脚组件
export default class Footer {
    constructor() {
        this.init();
    }
    
    init() {
        const footer = document.getElementById('app-footer');
        if (!footer) return;
        
        // 顶部彩虹线
        const topLine = document.createElement('div');
        topLine.className = 'footer-top-line';
        
        // 文本内容
        const textDiv = document.createElement('div');
        textDiv.className = 'footer-text';
        
        const line1 = document.createElement('p');
        line1.textContent = '本网站为桃汽水粉丝应援平台，仅供娱乐交流使用，非商业性质';
        
        const line2 = document.createElement('p');
        line2.textContent = '© 2024 桃汽水の魔力补给站 | 版本: v1.0.0 | 开发团队: taoci-dev-group';
        
        textDiv.appendChild(line1);
        textDiv.appendChild(line2);
        
        footer.appendChild(topLine);
        footer.appendChild(textDiv);
    }
}