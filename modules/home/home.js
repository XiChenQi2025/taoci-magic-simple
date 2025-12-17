// 桃汽水首页模块 - 随机展示皮套图片

class HomeModule {
  constructor() {
    this.config = null;
    this.currentImageIndex = 0;
    this.totalImages = 0;
    this.particles = [];
  }
  
  // 加载配置
  async loadConfig() {
    try {
      const response = await fetch('modules/home/config.json');
      this.config = await response.json();
      this.totalImages = this.config.images.count;
      console.log('✅ 首页配置加载完成，图片数量:', this.totalImages);
    } catch (error) {
      console.error('❌ 加载配置失败:', error);
      // 使用默认配置
      this.config = {
        images: {
          count: 3,
          folder: './assets/images/character/',
          files: ['taoci-avatar-1.png', 'taoci-avatar-2.png', 'taoci-avatar-3.png'],
          fallbackEmoji: '🍑',
          altText: '桃汽水 - 异世界精灵公主'
        },
        greeting: {
          title: '欢迎来到我的魔力补给站！',
          message: '我是来自异世界的精灵公主桃汽水~ 周年庆活动马上就要开始啦，快来一起收集魔力，参加有趣的游戏吧！'
        },
        features: {
          enable3DEffect: true,
          enableParticles: true,
          enableShadow: true,
          enableHoverEffect: true
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
    
    const fileName = this.config.images.files[index] || `taoci-avatar-${index + 1}.png`;
    return `${this.config.images.folder}${fileName}`;
  }
  
  // 创建图片元素
  createImageElement(imageUrl, altText) {
    const img = document.createElement('img');
    img.className = 'character-image';
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
    const display = document.getElementById('character-display');
    if (!display) return;
    
    display.innerHTML = `
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
  }
  
  // 更新欢迎文本
  updateGreeting() {
    const title = document.getElementById('greeting-title');
    const text = document.getElementById('greeting-text');
    
    if (title && this.config.greeting.title) {
      title.textContent = this.config.greeting.title;
    }
    
    if (text && this.config.greeting.message) {
      text.textContent = this.config.greeting.message;
    }
  }
  
  // 创建粒子效果
  createParticles() {
    if (!this.config.features.enableParticles) return;
    
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    // 清除现有粒子
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
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
      `;
      
      // 添加浮动动画
      particle.style.animation = 'float-particle linear infinite';
      
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
  
  // 初始化功能开关
  initFeatures() {
    const features = this.config.features;
    
    // 控制阴影显示
    const shadow = document.getElementById('character-shadow');
    if (shadow) {
      shadow.style.display = features.enableShadow ? 'block' : 'none';
    }
    
    // 控制粒子效果
    const particlesContainer = document.getElementById('particles-container');
    if (particlesContainer) {
      particlesContainer.style.display = features.enableParticles ? 'block' : 'none';
    }
    
    // 控制悬停效果
    const characterDisplay = document.getElementById('character-display');
    if (characterDisplay) {
      characterDisplay.style.pointerEvents = features.enableHoverEffect ? 'auto' : 'none';
    }
  }
  
  // 初始化
  async init() {
    console.log('🏠 首页模块初始化中...');
    
    // 1. 加载配置
    await this.loadConfig();
    
    // 2. 随机选择图片
    this.currentImageIndex = this.getRandomImageIndex();
    
    // 3. 获取图片URL
    const imageUrl = this.getImageUrl(this.currentImageIndex);
    
    // 4. 创建并显示图片
    const display = document.getElementById('character-display');
    if (display) {
      const img = this.createImageElement(imageUrl, this.config.images.altText);
      
      // 移除现有内容（保留占位符）
      const placeholder = display.querySelector('.loading-placeholder');
      if (placeholder) {
        // 在占位符后面插入图片
        placeholder.parentNode.insertBefore(img, placeholder.nextSibling);
      } else {
        display.appendChild(img);
      }
    }
    
    // 5. 更新指示器
    this.updateIndicator(this.currentImageIndex);
    
    // 6. 更新欢迎文本
    this.updateGreeting();
    
    // 7. 初始化功能开关
    this.initFeatures();
    
    // 8. 创建粒子效果
    this.createParticles();
    
    console.log('✅ 首页模块初始化完成，当前图片:', this.currentImageIndex + 1);
  }
  
  // 刷新图片（手动切换）
  refreshImage() {
    const oldIndex = this.currentImageIndex;
    let newIndex;
    
    // 确保新图片与旧图片不同
    do {
      newIndex = this.getRandomImageIndex();
    } while (newIndex === oldIndex && this.totalImages > 1);
    
    this.currentImageIndex = newIndex;
    const imageUrl = this.getImageUrl(newIndex);
    
    // 更新图片
    const img = document.querySelector('.character-image');
    if (img) {
      img.src = imageUrl;
      // 显示加载状态
      const placeholder = document.querySelector('.loading-placeholder');
      if (placeholder) {
        placeholder.style.display = 'flex';
      }
    }
    
    // 更新指示器
    this.updateIndicator(newIndex);
    
    // 重新创建粒子效果
    this.createParticles();
    
    console.log(`🔄 图片刷新: ${oldIndex + 1} → ${newIndex + 1}`);
  }
  
  // 销毁（清理资源）
  destroy() {
    // 清理粒子效果
    const container = document.getElementById('particles-container');
    if (container) {
      container.innerHTML = '';
    }
    
    console.log('🗑️ 首页模块已清理');
  }
}

// 创建模块实例
const homeModule = new HomeModule();

// 模块配置（供主骨架注册）
const moduleConfig = {
  id: 'home',
  name: '首页',
  icon: 'fas fa-home',
  content: document.querySelector('.home-module')?.outerHTML || '',
  onLoad: async function() {
    console.log('🏠 首页模块开始加载');
    await homeModule.init();
    
    // 添加刷新按钮（仅用于开发调试）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      addRefreshButton();
    }
  }
};

// 添加开发调试按钮
function addRefreshButton() {
  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'dev-refresh-btn';
  refreshBtn.innerHTML = '🔄 刷新图片';
  refreshBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    background: var(--hot-pink);
    color: white;
    border: none;
    border-radius: 20px;
    padding: 10px 15px;
    font-size: 12px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(255, 102, 204, 0.3);
    transition: all 0.3s ease;
  `;
  
  refreshBtn.onmouseenter = () => {
    refreshBtn.style.transform = 'translateY(-2px)';
    refreshBtn.style.boxShadow = '0 6px 16px rgba(255, 102, 204, 0.4)';
  };
  
  refreshBtn.onmouseleave = () => {
    refreshBtn.style.transform = '';
    refreshBtn.style.boxShadow = '0 4px 12px rgba(255, 102, 204, 0.3)';
  };
  
  refreshBtn.onclick = () => {
    homeModule.refreshImage();
  };
  
  document.body.appendChild(refreshBtn);
}

// 注册模块到主框架
if (window.Taoci) {
  window.Taoci.registerModule(moduleConfig);
  console.log('✅ 首页模块已注册到主框架');
}

// 导出模块实例（如果其他模块需要）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HomeModule, homeModule };
}