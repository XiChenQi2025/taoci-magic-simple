import gameCatalog from './game-config.js';

/**
 * 游戏厅模块主类
 */
class GameHallModule {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.state = 'BROWSING'; // BROWSING, LOADING, GAMING
    this.currentGame = null;
    this.gameInstance = null;
    
    this.init();
  }

  /**
   * 初始化游戏厅
   */
  async init() {
    this.createStructure();
    await this.renderGames();
    this.setupEventListeners();
    this.createFloatingShapes();
    this.createStarParticles();
    
    console.log('魔力游戏厅初始化完成');
  }

  /**
   * 创建页面结构
   */
  createStructure() {
    // 创建主容器
    this.container.innerHTML = `
      <div class="game-hall-container">
        <!-- 背景漂浮图形 -->
        <div class="floating-shapes"></div>
        
        <!-- 主内容区 -->
        <div class="game-hall-content">
          <!-- 顶部功能区 -->
          <div class="top-section">
            <div class="title-area">
              <h1>魔力游戏厅</h1>
              <p class="subtitle">点击卡片，进入奇妙的游戏时光~</p>
            </div>
            <div class="controls-area">
              <button class="control-btn" id="refresh-btn">
                <span class="icon">🔄</span>
                <span>刷新列表</span>
              </button>
              <button class="control-btn" id="help-btn">
                <span class="icon">❓</span>
                <span>游戏帮助</span>
              </button>
            </div>
          </div>
          
          <!-- 游戏卡片网格区 -->
          <div class="games-grid-section">
            <div class="games-grid" id="games-grid"></div>
          </div>
          
          <!-- 底部状态区 -->
          <div class="bottom-section">
            <div class="game-count">当前收录游戏：${gameCatalog.length} 款</div>
            <div class="encouragement">更多游戏正在开发中…</div>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div class="loading-state" id="loading-state">
          <div class="loading-animation"></div>
          <div class="loading-text" id="loading-text">正在加载游戏…</div>
        </div>
        
        <!-- 游戏容器 -->
        <div class="game-container" id="game-container"></div>
      </div>
    `;
    
    // 缓存DOM元素
    this.gamesGrid = document.getElementById('games-grid');
    this.loadingState = document.getElementById('loading-state');
    this.loadingText = document.getElementById('loading-text');
    this.gameContainer = document.getElementById('game-container');
    this.gameHallContent = document.querySelector('.game-hall-content');
  }

  /**
   * 渲染游戏卡片
   */
  async renderGames() {
    this.gamesGrid.innerHTML = '';
    
    gameCatalog.forEach(game => {
      const card = this.createGameCard(game);
      this.gamesGrid.appendChild(card);
    });
  }

  /**
   * 创建游戏卡片
   */
  createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.dataset.gameId = game.id;
    card.style.setProperty('--theme-color', game.display.themeColor);
    
    // 生成星级难度
    const stars = this.generateStars(game.display.difficulty);
    
    card.innerHTML = `
      <div class="game-info">
        <h3 class="game-title">${game.display.title}</h3>
        <div class="game-tags">
          ${game.display.tags.map(tag => `<span class="game-tag">${tag}</span>`).join('')}
        </div>
        <div class="difficulty-stars">
          ${stars}
        </div>
        <p class="game-description">${game.display.description}</p>
      </div>
      <div class="game-snapshot">
        <div class="snapshot-bg" style="background-image: url('${game.display.snapshot}')"></div>
      </div>
      <div class="launch-overlay">
        <button class="btn-rainbow" data-action="launch">开始游戏</button>
      </div>
    `;
    
    // 添加点击事件
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="launch"]') || e.currentTarget === card) {
        this.launchGame(game.id);
      }
    });
    
    return card;
  }

  /**
   * 生成星级显示
   */
  generateStars(difficulty) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars += `<span class="star ${i <= difficulty ? 'filled' : ''}">★</span>`;
    }
    return stars;
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 刷新按钮
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn.addEventListener('click', () => {
      this.refreshGames();
    });
    
    // 帮助按钮
    const helpBtn = document.getElementById('help-btn');
    helpBtn.addEventListener('click', () => {
      this.showHelp();
    });
  }

  /**
   * 创建漂浮图形
   */
  createFloatingShapes() {
    const shapesContainer = document.querySelector('.floating-shapes');
    const shapes = ['tetris', 'snake', 'pacman', 'joystick'];
    
    shapes.forEach((shape, index) => {
      const shapeEl = document.createElement('div');
      shapeEl.className = `floating-shape shape-${shape}`;
      shapeEl.style.cssText = `
        top: ${Math.random() * 80 + 10}%;
        left: ${Math.random() * 80 + 10}%;
        font-size: ${Math.random() * 60 + 40}px;
        animation-duration: ${Math.random() * 10 + 15}s;
      `;
      shapeEl.textContent = this.getShapeIcon(shape);
      shapesContainer.appendChild(shapeEl);
    });
  }

  /**
   * 获取形状图标
   */
  getShapeIcon(shape) {
    const icons = {
      tetris: '◼◼◼\n◼◼', // 简化的俄罗斯方块
      snake: '⬤⬤⬤',    // 蛇
      pacman: '◐',      // 吃豆人
      joystick: '✛'     // 摇杆
    };
    return icons[shape] || '🎮';
  }

  /**
   * 创建星光粒子效果
   */
  createStarParticles() {
    const gridSection = document.querySelector('.games-grid-section');
    
    for (let i = 0; i < 50; i++) {
      const star = document.createElement('div');
      star.className = 'star-particle';
      
      // 随机位置和大小
      const size = Math.random() * 2 + 1;
      star.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.3 + 0.1};
      `;
      
      // 随机动画
      const duration = Math.random() * 3 + 2;
      const delay = Math.random() * 2;
      star.style.animation = `
        twinkle ${duration}s infinite ${delay}s,
        move ${duration * 2}s infinite linear ${delay}s
      `;
      
      gridSection.appendChild(star);
    }
  }

  /**
   * 启动游戏
   */
  async launchGame(gameId) {
    if (this.state !== 'BROWSING') return;
    
    const gameConfig = gameCatalog.find(g => g.id === gameId);
    if (!gameConfig) {
      console.error(`未找到游戏配置: ${gameId}`);
      return;
    }
    
    this.state = 'LOADING';
    this.currentGame = gameId;
    
    // 显示加载动画
    this.showLoading(gameConfig.display.title);
    
    // 卡片收缩动画
    const card = document.querySelector(`[data-game-id="${gameId}"]`);
    if (card) {
      card.classList.add('card-shrink');
    }
    
    // 隐藏游戏厅UI
    this.gameHallContent.classList.add('hidden');
    
    try {
      // 动态导入游戏模块
      const modulePath = `${gameConfig.moduleInfo.path}${gameConfig.moduleInfo.entry}`;
      const gameModule = await import(modulePath);
      
      // 初始化游戏
      this.gameInstance = await gameModule.default.init({
        container: this.gameContainer,
        onExit: () => this.exitGame(),
        config: gameConfig
      });
      
      // 进入游戏状态
      this.state = 'GAMING';
      this.loadingState.classList.remove('active');
      this.gameContainer.classList.add('active');
      
    } catch (error) {
      console.error(`加载游戏失败: ${gameId}`, error);
      this.showError(`游戏加载失败: ${error.message}`);
      this.exitGame();
    }
  }

  /**
   * 显示加载状态
   */
  showLoading(gameName) {
    this.loadingText.textContent = `正在加载「${gameName}」…`;
    this.loadingState.classList.add('active');
  }

  /**
   * 显示错误信息
   */
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <div style="color: var(--neon-red); text-align: center; padding: 20px;">
        <h3>😢 加载失败</h3>
        <p>${message}</p>
        <button onclick="location.reload()" class="control-btn" style="margin-top: 20px;">
          重新加载
        </button>
      </div>
    `;
    
    this.loadingState.appendChild(errorDiv);
  }

  /**
   * 退出游戏
   */
  exitGame() {
    // 清理游戏实例
    if (this.gameInstance && typeof this.gameInstance.destroy === 'function') {
      this.gameInstance.destroy();
    }
    
    // 重置游戏容器
    this.gameContainer.innerHTML = '';
    this.gameContainer.classList.remove('active');
    
    // 返回浏览状态
    this.state = 'BROWSING';
    this.currentGame = null;
    this.gameInstance = null;
    
    // 显示游戏厅UI
    this.gameHallContent.classList.remove('hidden');
    this.loadingState.classList.remove('active');
    
    // 重新渲染卡片（如果有变化）
    this.renderGames();
  }

  /**
   * 刷新游戏列表
   */
  async refreshGames() {
    // 添加刷新动画
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn.style.transform = 'rotate(360deg)';
    refreshBtn.style.transition = 'transform 0.5s';
    
    // 模拟重新加载
    setTimeout(() => {
      refreshBtn.style.transform = 'rotate(0deg)';
      // 这里可以添加实际的重载逻辑，比如从服务器获取最新游戏列表
      console.log('游戏列表已刷新');
    }, 500);
  }

  /**
   * 显示帮助信息
   */
  showHelp() {
    alert(`
🎮 魔力游戏厅帮助指南：

1. 浏览游戏：在网格中查看所有可用游戏
2. 启动游戏：点击卡片或"开始游戏"按钮
3. 游戏难度：★ 数量表示游戏难度
4. 退出游戏：游戏内通常有退出按钮或按ESC键
5. 刷新列表：点击刷新按钮获取最新游戏

如有问题，请联系管理员！
    `);
  }

  /**
   * 销毁模块
   */
  destroy() {
    // 清理所有事件监听器和定时器
    if (this.gameInstance) {
      this.exitGame();
    }
    
    // 清理DOM
    this.container.innerHTML = '';
    
    console.log('游戏厅模块已销毁');
  }
}

export default GameHallModule;