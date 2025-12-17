// 桃汽水首页模块 - 幻彩星云主题
// 随机展示皮套图片 + 星空特效

class CosmicHomeModule {
  constructor() {
    this.config = null;
    this.currentImageIndex = 0;
    this.totalImages = 0;
    this.stars = [];
    this.meteors = [];
    this.particles = [];
    this.mouseTrail = [];
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    
    // 绑定方法
    this.init = this.init.bind(this);
    this.createStars = this.createStars.bind(this);
    this.createMeteors = this.createMeteors.bind(this);
    this.createStardust = this.createStardust.bind(this);
    this.updateMouseTrail = this.updateMouseTrail.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.refreshImage = this.refreshImage.bind(this);
  }
  
  // 加载配置
  async loadConfig() {
    try {
      const response = await fetch('modules/home/config.json');
      this.config = await response.json();
      this.totalImages = this.config.images.count;
      console.log('🌌 幻彩星云主题配置加载完成');
      console.log('✨ 图片数量:', this.totalImages);
      console.log('🎨 主题:', this.config.theme.name);
    } catch (error) {
      console.error('❌ 加载配置失败:', error);
      // 使用默认配置
      this.config = {
        theme: { name: '幻彩星云主题', version: '1.0.0' },
        images: {
          count: 3,
          folder: './assets/images/character/',
          files: ['taoci-avatar.png', 'taoci-avatar-2.png', 'taoci-avatar-3.png'],
          fallbackEmoji: '👸✨',
          altText: '桃汽水 - 异世界精灵公主',
          randomOnLoad: true
        },
        greeting: {
          title: '欢迎来到我的魔力补给站！',
          message: '我是来自异世界的精灵公主桃汽水~ 在这片星空中与你相遇，让我们一起收集魔力，创造美好的回忆吧！'
        },
        effects: {
          enableStars: true,
          enableNebula: true,
          enableParticles: true,
          enableShootingStars: true,
          enableParallax: true,
          enableMouseTrail: true
        }
      };
      this.totalImages = this.config.images.count;
    }
  }
  
  // 随机选择一张图片
  getRandomImageIndex() {
    return Math.floor(Math.random() * this.totalImages);
  }
  
  // 获取图片URL
  getImageUrl(index) {
    if (index < 0 || index >= this.totalImages) {
      index = 0;
    }
    
    // 如果配置中有文件名，使用配置的，否则按规则生成
    const fileName = this.config.images.files[index] || `taoci-avatar-${index + 1}.png`;
    return `${this.config.images.folder}${fileName}`;
  }
  
  // 创建图片元素
  createImageElement(imageUrl, altText) {
    const img = document.createElement('img');
    img.className = 'character-image cosmic';
    img.src = imageUrl;
    img.alt = altText;
    img.loading = 'eager';
    
    // 图片加载成功
    img.onload = () => {
      console.log(`✅ 图片加载成功: ${imageUrl}`);
      
      // 移除加载占位符
      const placeholder = document.querySelector('.loading-placeholder');
      if (placeholder) {
        placeholder.style.display = 'none';
      }
      
      // 添加加载完成动画
      img.style.animation = 'cosmic-float 15s ease-in-out infinite';
      
      // 创建星光粒子
      if (this.config.effects.enableParticles) {
        this.createStardust();
      }
    };
    
    // 图片加载失败时使用Emoji回退
    img.onerror = () => {
      console.warn(`❌ 图片加载失败: ${imageUrl}, 使用Emoji回退`);
      this.showFallbackEmoji();
    };
    
    return img;
  }
  
  // 显示Emoji回退
  showFallbackEmoji() {
    const wrapper = document.getElementById('image-wrapper');
    if (!wrapper) return;
    
    wrapper.innerHTML = `
      <div class="emoji-fallback">
        <div class="fallback-emoji">${this.config.images.fallbackEmoji}</div>
        <p class="fallback-text">图片加载失败，请检查文件路径</p>
      </div>
    `;
  }
  
  // 更新指示器
  updateIndicator(index) {
    const indicator = document.getElementById('current-image-index');
    if (indicator) {
      indicator.textContent = `图片 ${index + 1} / ${this.totalImages}`;
    }
    
    // 更新总图片数显示
    const totalEl = document.getElementById('total-images');
    if (totalEl) {
      totalEl.textContent = this.totalImages;
    }
  }
  
  // 更新欢迎文本
  updateGreeting() {
    const title = document.getElementById('greeting-title');
    const text = document.getElementById('greeting-text');
    
    if (title && this.config.greeting.title) {
      title.querySelector('.title-text').textContent = this.config.greeting.title;
    }
    
    if (text && this.config.greeting.message) {
      text.textContent = this.config.greeting.message;
    }
  }
  
  // 创建星空背景
  createStars() {
    if (!this.config.effects.enableStars) return;
    
    const container = document.getElementById('stars-container');
    if (!container) return;
    
    // 清空现有星星
    container.innerHTML = '';
    
    // 创建200颗星星
    for (let i = 0; i < 200; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      
      // 随机属性
      const size = Math.random() * 3 + 1;
      const opacity = Math.random() * 0.8 + 0.2;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 10 + 5;
      const delay = Math.random() * 10;
      
      star.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: white;
        border-radius: 50%;
        box-shadow: 0 0 ${size * 3}px white;
        left: ${x}%;
        top: ${y}%;
        opacity: ${opacity};
        animation: twinkle ${duration}s infinite ${delay}s;
      `;
      
      container.appendChild(star);
    }
    
    // 添加闪烁动画
    const style = document.createElement('style');
    style.textContent = `
      @keyframes twinkle {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // 创建流星
  createMeteors() {
    if (!this.config.effects.enableShootingStars) return;
    
    const container = document.getElementById('meteors-container');
    if (!container) return;
    
    // 清空现有流星
    container.innerHTML = '';
    
    // 创建5-10颗流星
    const count = Math.floor(Math.random() * 6) + 5;
    
    for (let i = 0; i < count; i++) {
      const meteor = document.createElement('div');
      meteor.className = 'meteor';
      
      // 随机属性
      const width = Math.random() * 100 + 50;
      const x = Math.random() * 120 - 20; // -20% 到 100%
      const y = Math.random() * 50;
      const duration = Math.random() * 3 + 2;
      const delay = Math.random() * 15;
      const color = this.getRandomMeteorColor();
      
      meteor.style.cssText = `
        position: absolute;
        width: ${width}px;
        height: 2px;
        background: linear-gradient(90deg, 
          ${color}, 
          rgba(255, 255, 255, 0.8), 
          transparent);
        left: ${x}%;
        top: ${y}%;
        transform: rotate(-45deg);
        transform-origin: left center;
        opacity: 0;
        animation: meteor-fly ${duration}s linear infinite ${delay}s;
      `;
      
      container.appendChild(meteor);
    }
    
    // 添加流星动画
    const style = document.createElement('style');
    style.textContent = `
      @keyframes meteor-fly {
        0% {
          opacity: 0;
          transform: rotate(-45deg) translateX(0);
        }
        10% {
          opacity: 1;
        }
        70% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform: rotate(-45deg) translateX(1000px);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // 获取流星随机颜色
  getRandomMeteorColor() {
    const colors = [
      'rgba(255, 110, 255, 0.9)',  // 粉色
      'rgba(110, 230, 255, 0.9)',  // 蓝色
      'rgba(255, 255, 110, 0.9)',  // 黄色
      'rgba(110, 255, 110, 0.9)'   // 绿色
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // 创建星光粒子
  createStardust() {
    if (!this.config.effects.enableParticles) return;
    
    const container = document.getElementById('stardust-particles');
    if (!container) return;
    
    // 清空现有粒子
    container.innerHTML = '';
    
    // 创建粒子
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'stardust';
      
      // 随机属性
      const size = Math.random() * 4 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 10 + 10;
      const delay = Math.random() * 10;
      const color = this.getRandomParticleColor();
      
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        box-shadow: 0 0 ${size * 2}px ${color};
        left: ${x}%;
        top: ${y}%;
        opacity: 0;
        animation: stardust-float ${duration}s linear infinite ${delay}s;
      `;
      
      container.appendChild(particle);
    }
    
    // 添加粒子动画
    const style = document.createElement('style');
    style.textContent = `
      @keyframes stardust-float {
        0% {
          opacity: 0;
          transform: translate(0, 0) scale(0.5);
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // 获取粒子随机颜色
  getRandomParticleColor() {
    const colors = [
      'rgba(255, 110, 255, 0.8)',
      'rgba(110, 230, 255, 0.8)',
      'rgba(255, 255, 110, 0.8)',
      'rgba(255, 110, 110, 0.8)',
      'rgba(110, 255, 110, 0.8)',
      'rgba(255, 255, 255, 0.8)'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // 初始化鼠标轨迹
  initMouseTrail() {
    if (!this.config.effects.enableMouseTrail) return;
    
    const container = document.getElementById('mouse-trail');
    if (!container) return;
    
    // 清空现有轨迹
    container.innerHTML = '';
    this.mouseTrail = [];
    
    // 监听鼠标移动
    document.addEventListener('mousemove', this.onMouseMove);
    
    // 开始更新轨迹
    this.trailInterval = setInterval(this.updateMouseTrail, 50);
  }
  
  // 鼠标移动处理
  onMouseMove(event) {
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    
    // 创建新的轨迹点
    if (this.config.effects.enableMouseTrail && this.mouseTrail.length < 20) {
      const trailPoint = document.createElement('div');
      trailPoint.className = 'trail-point';
      
      const size = Math.random() * 4 + 2;
      const color = this.getRandomTrailColor();
      
      trailPoint.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        box-shadow: 0 0 ${size * 2}px ${color};
        left: ${this.lastMouseX}px;
        top: ${this.lastMouseY}px;
        pointer-events: none;
        z-index: 5;
        opacity: 0.7;
      `;
      
      const container = document.getElementById('mouse-trail');
      if (container) {
        container.appendChild(trailPoint);
        this.mouseTrail.push({
          element: trailPoint,
          x: this.lastMouseX,
          y: this.lastMouseY,
          opacity: 0.7,
          size: size
        });
      }
    }
  }
  
  // 更新鼠标轨迹
  updateMouseTrail() {
    for (let i = this.mouseTrail.length - 1; i >= 0; i--) {
      const point = this.mouseTrail[i];
      
      // 逐渐减小透明度
      point.opacity -= 0.05;
      
      if (point.opacity <= 0) {
        // 移除完全透明的点
        if (point.element && point.element.parentNode) {
          point.element.parentNode.removeChild(point.element);
        }
        this.mouseTrail.splice(i, 1);
      } else {
        // 更新点的不透明度
        point.element.style.opacity = point.opacity;
        
        // 稍微随机移动
        const dx = (Math.random() - 0.5) * 10;
        const dy = (Math.random() - 0.5) * 10;
        point.element.style.left = (point.x + dx) + 'px';
        point.element.style.top = (point.y + dy) + 'px';
      }
    }
  }
  
  // 获取轨迹随机颜色
  getRandomTrailColor() {
    const colors = [
      'rgba(255, 110, 255, 0.6)',
      'rgba(110, 230, 255, 0.6)',
      'rgba(255, 255, 110, 0.6)'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // 绑定刷新按钮事件
  bindRefreshButton() {
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', this.refreshImage);
    }
  }
  
  // 刷新图片（手动切换）
  refreshImage() {
    const oldIndex = this.currentImageIndex;
    let newIndex;
    
    // 确保新图片与旧图片不同（如果有多张图片）
    do {
      newIndex = this.getRandomImageIndex();
    } while (newIndex === oldIndex && this.totalImages > 1);
    
    this.currentImageIndex = newIndex;
    const imageUrl = this.getImageUrl(newIndex);
    
    // 获取图片包装器
    const wrapper = document.getElementById('image-wrapper');
    if (!wrapper) return;
    
    // 显示加载动画
    const placeholder = wrapper.querySelector('.loading-placeholder');
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
    
    // 移除旧图片
    const oldImg = wrapper.querySelector('.character-image');
    if (oldImg) {
      oldImg.remove();
    }
    
    // 创建新图片
    const img = this.createImageElement(imageUrl, this.config.images.altText);
    wrapper.appendChild(img);
    
    // 更新指示器
    this.updateIndicator(newIndex);
    
    // 重新创建星光粒子
    if (this.config.effects.enableParticles) {
      this.createStardust();
    }
    
    console.log(`🔄 图片刷新: ${oldIndex + 1} → ${newIndex + 1}`);
    
    // 添加切换动画
    wrapper.style.animation = 'none';
    setTimeout(() => {
      wrapper.style.animation = 'pulse 0.5s';
    }, 10);
  }
  
  // 初始化视差效果
  initParallax() {
    if (!this.config.effects.enableParallax) return;
    
    window.addEventListener('mousemove', (e) => {
      const x = (window.innerWidth - e.pageX * 2) / 100;
      const y = (window.innerHeight - e.pageY * 2) / 100;
      
      // 移动星云层
      const nebula = document.getElementById('nebula-layer');
      if (nebula) {
        nebula.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
      }
      
      // 轻微移动轨道
      const orbit = document.querySelector('.cosmic-orbit');
      if (orbit) {
        orbit.style.transform = `rotate(${x * 0.1}deg)`;
      }
    });
  }
  
  // 初始化
  async init() {
    console.log('🌌 幻彩星云主题初始化中...');
    
    try {
      // 1. 加载配置
      await this.loadConfig();
      
      // 2. 随机选择图片
      this.currentImageIndex = this.config.images.randomOnLoad ? 
        this.getRandomImageIndex() : 0;
      
      // 3. 获取图片URL
      const imageUrl = this.getImageUrl(this.currentImageIndex);
      
      // 4. 创建并显示图片
      const wrapper = document.getElementById('image-wrapper');
      if (wrapper) {
        const img = this.createImageElement(imageUrl, this.config.images.altText);
        
        // 在占位符后面插入图片
        const placeholder = wrapper.querySelector('.loading-placeholder');
        if (placeholder) {
          wrapper.insertBefore(img, placeholder.nextSibling);
        } else {
          wrapper.appendChild(img);
        }
      }
      
      // 5. 更新指示器
      this.updateIndicator(this.currentImageIndex);
      
      // 6. 更新欢迎文本
      this.updateGreeting();
      
      // 7. 创建星空效果
      if (this.config.effects.enableStars) {
        this.createStars();
      }
      
      // 8. 创建流星
      if (this.config.effects.enableShootingStars) {
        this.createMeteors();
      }
      
      // 9. 初始化鼠标轨迹
      if (this.config.effects.enableMouseTrail) {
        this.initMouseTrail();
      }
      
      // 10. 绑定刷新按钮
      this.bindRefreshButton();
      
      // 11. 初始化视差效果
      if (this.config.effects.enableParallax) {
        this.initParallax();
      }
      
      console.log('✅ 幻彩星云主题初始化完成');
      console.log('✨ 当前图片:', this.currentImageIndex + 1);
      console.log('🎨 特效状态:', this.config.effects);
      
      // 添加开发调试按钮（仅本地开发）
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        this.addDebugControls();
      }
      
    } catch (error) {
      console.error('❌ 幻彩星云主题初始化失败:', error);
    }
  }
  
  // 添加调试控制（仅开发环境）
  addDebugControls() {
    const debugPanel = document.createElement('div');
    debugPanel.className = 'debug-panel';
    debugPanel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 15px;
      border-radius: 10px;
      font-size: 12px;
      z-index: 9999;
      border: 1px solid var(--cosmic-pink);
      max-width: 200px;
    `;
    
    debugPanel.innerHTML = `
      <h3 style="margin: 0 0 10px; color: var(--cosmic-pink);">开发调试</h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button id="debug-refresh" style="padding: 8px; background: var(--cosmic-pink); color: white; border: none; border-radius: 5px; cursor: pointer;">🔄 刷新图片</button>
        <button id="debug-stars" style="padding: 8px; background: var(--cosmic-blue); color: white; border: none; border-radius: 5px; cursor: pointer;">⭐ 重绘星空</button>
        <button id="debug-meteors" style="padding: 8px; background: var(--cosmic-green); color: white; border: none; border-radius: 5px; cursor: pointer;">☄️ 更多流星</button>
      </div>
      <div style="margin-top: 10px; font-size: 10px; opacity: 0.7;">
        当前: 图片 ${this.currentImageIndex + 1}
      </div>
    `;
    
    document.body.appendChild(debugPanel);
    
    // 绑定调试按钮
    document.getElementById('debug-refresh')?.addEventListener('click', () => this.refreshImage());
    document.getElementById('debug-stars')?.addEventListener('click', () => this.createStars());
    document.getElementById('debug-meteors')?.addEventListener('click', () => this.createMeteors());
  }
  
  // 销毁（清理资源）
  destroy() {
    // 清理定时器
    if (this.trailInterval) {
      clearInterval(this.trailInterval);
    }
    
    // 移除事件监听
    document.removeEventListener('mousemove', this.onMouseMove);
    
    // 清理DOM元素
    const mouseTrail = document.getElementById('mouse-trail');
    if (mouseTrail) mouseTrail.innerHTML = '';
    
    const debugPanel = document.querySelector('.debug-panel');
    if (debugPanel) debugPanel.remove();
    
    console.log('🗑️ 幻彩星云主题已清理');
  }
}

// 创建模块实例
const cosmicHomeModule = new CosmicHomeModule();

// 模块配置（供主骨架注册）
const moduleConfig = {
  id: 'home',
  name: '首页',
  icon: 'fas fa-home',
  content: document.querySelector('.home-module')?.outerHTML || '',
  onLoad: async function() {
    console.log('🌌 幻彩星云主题开始加载');
    await cosmicHomeModule.init();
  },
  onUnload: function() {
    cosmicHomeModule.destroy();
  }
};

// 注册模块到主框架
if (window.Taoci) {
  window.Taoci.registerModule(moduleConfig);
  console.log('✅ 幻彩星云主题已注册到主框架');
}

// 导出模块实例（如果其他模块需要）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CosmicHomeModule, cosmicHomeModule };
}

// 添加一些额外的全局样式
const extraStyles = `
/* 流星样式 */
.meteor {
  filter: drop-shadow(0 0 6px currentColor);
}

/* 调试面板动画 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .debug-panel {
    display: none !important;
  }
}
`;

const styleEl = document.createElement('style');
styleEl.textContent = extraStyles;
document.head.appendChild(styleEl);