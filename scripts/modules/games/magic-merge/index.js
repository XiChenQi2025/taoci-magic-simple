import { GameEngine } from './game-engine.js';
import { VirtualJoystick } from './virtual-joystick.js';
import { GAME_CONFIG, getLevelConfig, getAllLevels } from './magic-config.js';

export class MagicMergeGame {
  constructor() {
    this.container = null;
    this.onExit = null;
    this.config = {};
    
    this.gameEngine = null;
    this.virtualJoystick = null;
    
    this.isInitialized = false;
    this.isGameStarted = false;
    
    this.keyboardControls = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      'w': 'up',
      'W': 'up',
      's': 'down',
      'S': 'down',
      'a': 'left',
      'A': 'left',
      'd': 'right',
      'D': 'right'
    };
    
    // 绑定方法
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleDirection = this.handleDirection.bind(this);
    this.startGame = this.startGame.bind(this);
    this.restartGame = this.restartGame.bind(this);
    this.exitGame = this.exitGame.bind(this);
  }
  
  async init(options) {
    try {
      const { container, onExit, config = {} } = options;
      
      if (!container) {
        throw new Error('游戏容器未提供');
      }
      
      this.container = container;
      this.onExit = onExit;
      this.config = config;
      
      // 清理容器
      this.container.innerHTML = '';
      this.container.className = 'magic-merge-game';
      
      // 渲染初始界面（不初始化游戏引擎）
      this.renderInitialUI();
      
      // 绑定全局事件
      this.bindGlobalEvents();
      
      this.isInitialized = true;
      
      console.log('魔力合成游戏初始化完成');
      return true;
      
    } catch (error) {
      console.error('游戏初始化失败:', error);
      this.showError('游戏初始化失败，请刷新页面重试');
      return false;
    }
  }
  
  renderInitialUI() {
    // 创建游戏主结构
    this.container.innerHTML = `
      <div class="game-container">
        <!-- 头部区域 -->
        <header class="game-header">
          <div class="title-section">
            <h1 class="game-title">✨ 魔力合成 ✨</h1>
            <p class="game-subtitle">滑动合并梦幻水晶，解锁桃汽水の祝福</p>
          </div>
          
          <div class="stats-section">
            <div class="score-display">
              <div class="score-label">当前分数</div>
              <div class="score-value" id="current-score">0</div>
            </div>
            <div class="score-display best-score">
              <div class="score-label">最高分数</div>
              <div class="score-value" id="high-score">0</div>
            </div>
            <div class="moves-display">
              <div class="moves-label">移动次数</div>
              <div class="moves-value" id="moves-count">0</div>
            </div>
          </div>
          
          <div class="controls-section">
            <button class="control-btn btn-start" id="start-btn">
              <span class="btn-icon">▶️</span>
              <span class="btn-text">开始游戏</span>
            </button>
            <button class="control-btn btn-restart" id="restart-btn" disabled>
              <span class="btn-icon">🔄</span>
              <span class="btn-text">重新开始</span>
            </button>
            <button class="control-btn btn-exit" id="exit-btn">
              <span class="btn-icon">🚪</span>
              <span class="btn-text">退出游戏</span>
            </button>
          </div>
        </header>
        
        <!-- 主游戏区域 -->
        <main class="game-main">
          <div class="game-grid-container" id="grid-container">
            <div class="game-intro" id="game-intro">
              <h2>欢迎来到魔力合成！</h2>
              <p>使用键盘方向键或滑动屏幕合并相同等级的水晶</p>
              <p>目标：合成<span class="target-emoji">🍑💖</span>桃汽水の祝福</p>
              <div class="intro-controls">
                <div class="control-hint desktop-hint">
                  <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> 或 <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
                </div>
                <div class="control-hint mobile-hint">
                  ← 滑动屏幕或使用虚拟控制 →
                </div>
              </div>
            </div>
            <div class="game-grid" id="game-grid"></div>
            <div class="virtual-controls-container" id="virtual-controls"></div>
            <div class="control-hint" id="control-hint"></div>
          </div>
        </main>
        
        <!-- 信息区域 -->
        <footer class="game-footer">
          <div class="info-section">
            <div class="info-toggle">
              <button class="info-toggle-btn" id="info-toggle">
                <span class="toggle-icon">📖</span>
                <span class="toggle-text">游戏说明</span>
              </button>
            </div>
            
            <div class="info-content" id="info-content">
              <div class="game-rules">
                <h3>游戏规则</h3>
                <ul>
                  <li>使用方向键或滑动屏幕移动水晶</li>
                  <li>相同等级的水晶碰撞时会合并为下一等级</li>
                  <li>每次移动后会在空白处生成新的水晶</li>
                  <li>当网格填满且无法移动时游戏结束</li>
                  <li>合成2048级水晶获得胜利</li>
                </ul>
              </div>
              
              <div class="levels-section">
                <h3>魔力水晶等级</h3>
                <div class="levels-grid" id="levels-grid"></div>
              </div>
            </div>
          </div>
        </footer>
        
        <!-- 消息提示 -->
        <div class="message-container" id="message-container"></div>
      </div>
    `;
    
    // 获取DOM元素引用
    this.elements = {
      currentScore: document.getElementById('current-score'),
      highScore: document.getElementById('high-score'),
      movesCount: document.getElementById('moves-count'),
      startBtn: document.getElementById('start-btn'),
      restartBtn: document.getElementById('restart-btn'),
      exitBtn: document.getElementById('exit-btn'),
      gameGrid: document.getElementById('game-grid'),
      gridContainer: document.getElementById('grid-container'),
      gameIntro: document.getElementById('game-intro'),
      virtualControls: document.getElementById('virtual-controls'),
      controlHint: document.getElementById('control-hint'),
      infoToggle: document.getElementById('info-toggle'),
      infoContent: document.getElementById('info-content'),
      levelsGrid: document.getElementById('levels-grid'),
      messageContainer: document.getElementById('message-container')
    };
    
    // 绑定按钮事件
    this.elements.startBtn.addEventListener('click', this.startGame);
    this.elements.restartBtn.addEventListener('click', this.restartGame);
    this.elements.exitBtn.addEventListener('click', this.exitGame);
    this.elements.infoToggle.addEventListener('click', () => {
      this.elements.infoContent.classList.toggle('expanded');
    });
    
    // 初始化等级展示
    this.renderLevelsGrid();
    
    // 更新控制提示
    this.updateControlHint();
  }
  
  renderLevelsGrid() {
    const levels = getAllLevels();
    const levelsGrid = this.elements.levelsGrid;
    levelsGrid.innerHTML = '';
    
    levels.forEach(level => {
      const levelConfig = getLevelConfig(level);
      const levelEl = document.createElement('div');
      levelEl.className = 'level-preview';
      levelEl.dataset.level = level;
      levelEl.innerHTML = `
        <div class="level-emoji">${levelConfig.emoji}</div>
        <div class="level-name">${levelConfig.name}</div>
        <div class="level-value">${level}</div>
      `;
      levelsGrid.appendChild(levelEl);
    });
  }
  
  updateLevelsGrid(unlockedLevels = []) {
    const levelElements = this.elements.levelsGrid.querySelectorAll('.level-preview');
    
    levelElements.forEach(el => {
      const level = parseInt(el.dataset.level, 10);
      if (unlockedLevels.includes(level)) {
        el.classList.add('unlocked');
      } else {
        el.classList.remove('unlocked');
      }
    });
  }
  
  updateControlHint() {
    const isMobile = this.gameEngine ? this.gameEngine.deviceType === 'mobile' : 
                     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      this.elements.controlHint.textContent = '滑动屏幕或使用虚拟控制移动水晶';
      this.elements.controlHint.classList.add('mobile-hint');
      this.elements.controlHint.classList.remove('desktop-hint');
    } else {
      this.elements.controlHint.textContent = '使用方向键或WASD移动水晶';
      this.elements.controlHint.classList.add('desktop-hint');
      this.elements.controlHint.classList.remove('mobile-hint');
    }
  }
  
  bindGlobalEvents() {
    // 绑定键盘事件
    document.addEventListener('keydown', this.handleKeyDown);
    
    // 绑定窗口大小变化事件
    window.addEventListener('resize', this.updateControlHint.bind(this));
  }
  
  unbindGlobalEvents() {
    document.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('resize', this.updateControlHint.bind(this));
  }
  
  handleKeyDown(e) {
    // 如果游戏未开始或已经结束，忽略按键
    if (!this.isGameStarted || !this.gameEngine) return;
    
    const direction = this.keyboardControls[e.key];
    if (direction) {
      e.preventDefault();
      this.handleDirection(direction);
    }
  }
  
  async startGame() {
    try {
      if (!this.isGameStarted) {
        // 第一次开始游戏，初始化游戏引擎
        this.gameEngine = new GameEngine();
        
        // 尝试加载保存的游戏
        const savedState = this.gameEngine.loadGameState();
        
        if (savedState && savedState.gameState === GAME_CONFIG.GAME_STATES.PLAYING) {
          // 继续游戏
          this.showMessage('继续上次游戏', 'info');
          this.initializeGameGrid(savedState.grid);
          this.updateUI(savedState);
          this.gameEngine.gameState = GAME_CONFIG.GAME_STATES.PLAYING;
        } else {
          // 开始新游戏
          const initialState = this.gameEngine.initGame();
          this.initializeGameGrid(initialState.grid);
          this.updateUI(initialState);
          this.gameEngine.startGame();
          this.showMessage('游戏开始！', 'info');
        }
        
        // 隐藏介绍，显示网格
        this.elements.gameIntro.style.display = 'none';
        this.elements.gameGrid.style.display = 'grid';
        
        // 初始化虚拟控制
        this.initializeVirtualControls();
        
        // 更新按钮状态
        this.elements.startBtn.disabled = true;
        this.elements.startBtn.innerHTML = '<span class="btn-icon">⏸️</span><span class="btn-text">游戏中</span>';
        this.elements.restartBtn.disabled = false;
        
        this.isGameStarted = true;
        
      } else if (this.gameEngine.gameState === GAME_CONFIG.GAME_STATES.PLAYING) {
        // 游戏暂停/继续逻辑
        // 这里可以添加暂停功能
      }
      
    } catch (error) {
      console.error('开始游戏失败:', error);
      this.showError('开始游戏失败，请重试');
    }
  }
  
  initializeGameGrid(grid) {
    const gameGrid = this.elements.gameGrid;
    gameGrid.innerHTML = '';
    gameGrid.style.display = 'grid';
    
    // 设置网格样式
    gameGrid.style.gridTemplateColumns = `repeat(${GAME_CONFIG.GRID_SIZE}, 1fr)`;
    gameGrid.style.gridTemplateRows = `repeat(${GAME_CONFIG.GRID_SIZE}, 1fr)`;
    
    // 创建网格单元格
    for (let row = 0; row < GAME_CONFIG.GRID_SIZE; row++) {
      for (let col = 0; col < GAME_CONFIG.GRID_SIZE; col++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        gameGrid.appendChild(cell);
      }
    }
    
    // 更新水晶显示
    this.updateGridTiles(grid);
  }
  
  updateGridTiles(grid) {
    // 清除所有水晶
    const cells = this.elements.gameGrid.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
      cell.innerHTML = '';
      cell.className = 'grid-cell';
      cell.style.background = '';
    });
    
    // 添加水晶
    for (let row = 0; row < GAME_CONFIG.GRID_SIZE; row++) {
      for (let col = 0; col < GAME_CONFIG.GRID_SIZE; col++) {
        const level = grid[row][col];
        if (level > 0) {
          const cell = this.elements.gameGrid.querySelector(
            `.grid-cell[data-row="${row}"][data-col="${col}"]`
          );
          
          if (cell) {
            const levelConfig = getLevelConfig(level);
            const tile = document.createElement('div');
            tile.className = 'crystal-tile';
            tile.dataset.level = level;
            tile.innerHTML = `
              <div class="tile-emoji">${levelConfig.emoji}</div>
              <div class="tile-value">${level}</div>
            `;
            tile.style.background = levelConfig.color;
            
            // 添加动画类
            tile.classList.add('tile-spawn');
            setTimeout(() => {
              tile.classList.remove('tile-spawn');
            }, GAME_CONFIG.ANIMATION_DURATION.TILE_SPAWN);
            
            cell.appendChild(tile);
            cell.classList.add('has-tile');
          }
        }
      }
    }
  }
  
  initializeVirtualControls() {
    if (!this.virtualJoystick && this.gameEngine.deviceType === 'mobile') {
      this.virtualJoystick = new VirtualJoystick(
        this.elements.virtualControls,
        this.handleDirection
      );
      this.elements.virtualControls.style.display = 'block';
    }
  }
  
  async handleDirection(direction) {
    if (!this.gameEngine || this.gameEngine.gameState !== GAME_CONFIG.GAME_STATES.PLAYING) {
      return;
    }
    
    try {
      const result = this.gameEngine.move(direction);
      
      if (result) {
        // 显示移动动画
        this.animateMove(result.oldGrid, result.grid, result.mergedTiles);
        
        // 更新UI
        this.updateUI(result);
        
        // 显示合并提示
        if (result.mergedTiles.length > 0) {
          const highestMerge = Math.max(...result.mergedTiles.map(t => t.level));
          if (highestMerge >= 128) {
            const levelConfig = getLevelConfig(highestMerge);
            this.showMessage(`合成 ${levelConfig.emoji} ${levelConfig.name}！`, 'success');
          }
        }
        
        // 检查游戏状态
        if (result.gameState === GAME_CONFIG.GAME_STATES.WON) {
          this.handleGameWin();
        } else if (result.gameState === GAME_CONFIG.GAME_STATES.GAME_OVER) {
          this.handleGameOver();
        }
      }
    } catch (error) {
      console.error('移动失败:', error);
      this.showError('移动失败，请重试');
    }
  }
  
  animateMove(oldGrid, newGrid, mergedTiles) {
    // 这里可以添加更复杂的动画逻辑
    // 暂时使用简单的重新渲染
    
    // 标记合并的水晶
    mergedTiles.forEach(({ row, col }) => {
      const cell = this.elements.gameGrid.querySelector(
        `.grid-cell[data-row="${row}"][data-col="${col}"]`
      );
      if (cell) {
        const tile = cell.querySelector('.crystal-tile');
        if (tile) {
          tile.classList.add('tile-merge');
          setTimeout(() => {
            tile.classList.remove('tile-merge');
          }, GAME_CONFIG.ANIMATION_DURATION.TILE_MERGE);
        }
      }
    });
    
    // 更新网格显示
    setTimeout(() => {
      this.updateGridTiles(newGrid);
    }, GAME_CONFIG.ANIMATION_DURATION.TILE_MOVE);
  }
  
  updateUI(state) {
    // 更新分数
    this.animateScoreChange(this.elements.currentScore, state.totalScore || state.score);
    this.elements.highScore.textContent = state.highScore || this.gameEngine.highScore;
    this.elements.movesCount.textContent = state.moves || 0;
    
    // 更新解锁等级
    if (state.unlockedLevels) {
      this.updateLevelsGrid(state.unlockedLevels);
    }
    
    // 更新游戏状态指示器
    this.updateGameStatusIndicator(state.gameState);
  }
  
  animateScoreChange(element, newScore) {
    const oldScore = parseInt(element.textContent, 10) || 0;
    
    if (oldScore !== newScore) {
      element.textContent = newScore;
      element.classList.add('score-changing');
      
      setTimeout(() => {
        element.classList.remove('score-changing');
      }, GAME_CONFIG.ANIMATION_DURATION.SCORE_UPDATE);
    }
  }
  
  updateGameStatusIndicator(gameState) {
    const statusClasses = ['playing', 'won', 'game-over'];
    
    // 移除所有状态类
    this.container.classList.remove(...statusClasses);
    
    // 添加当前状态类
    switch (gameState) {
      case GAME_CONFIG.GAME_STATES.WON:
        this.container.classList.add('won');
        break;
      case GAME_CONFIG.GAME_STATES.GAME_OVER:
        this.container.classList.add('game-over');
        break;
      case GAME_CONFIG.GAME_STATES.PLAYING:
        this.container.classList.add('playing');
        break;
    }
  }
  
  handleGameWin() {
    this.showMessage('🎉 恭喜！你获得了桃汽水の祝福！', 'success');
    
    // 添加胜利动画
    this.container.classList.add('victory-animation');
    
    // 播放胜利音效（如果有）
    this.playVictorySound();
    
    // 10秒后停止动画
    setTimeout(() => {
      this.container.classList.remove('victory-animation');
    }, 10000);
  }
  
  handleGameOver() {
    this.showMessage('游戏结束！网格已满无法移动', 'error');
    
    // 禁用方向控制
    this.isGameStarted = false;
  }
  
  playVictorySound() {
    // 这里可以添加音效播放逻辑
    // 例如：new Audio('victory-sound.mp3').play();
    console.log('播放胜利音效');
  }
  
  showMessage(text, type = 'info') {
    const messageContainer = this.elements.messageContainer;
    
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = text;
    
    // 添加到容器
    messageContainer.appendChild(messageEl);
    
    // 添加动画
    setTimeout(() => {
      messageEl.classList.add('show');
    }, 10);
    
    // 自动移除
    setTimeout(() => {
      messageEl.classList.remove('show');
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 300);
    }, GAME_CONFIG.ANIMATION_DURATION.MESSAGE_SHOW);
  }
  
  showError(text) {
    this.showMessage(text, 'error');
  }
  
  async restartGame() {
    try {
      if (!this.gameEngine) {
        this.gameEngine = new GameEngine();
      }
      
      const newState = this.gameEngine.resetGame();
      this.gameEngine.startGame();
      
      // 重新初始化网格
      this.initializeGameGrid(newState.grid);
      this.updateUI(newState);
      
      this.showMessage('游戏已重新开始', 'info');
      
    } catch (error) {
      console.error('重新开始游戏失败:', error);
      this.showError('重新开始失败，请重试');
    }
  }
  
  async exitGame() {
    try {
      // 保存游戏进度
      if (this.gameEngine) {
        this.gameEngine.saveGameState();
        this.gameEngine.saveUnlockedLevels();
      }
      
      // 清理资源
      await this.destroy();
      
      // 调用退出回调
      if (this.onExit) {
        this.onExit();
      }
      
    } catch (error) {
      console.error('退出游戏失败:', error);
      this.showError('退出游戏时发生错误');
    }
  }
  
  async destroy() {
    try {
      // 解除事件绑定
      this.unbindGlobalEvents();
      
      // 销毁虚拟控制
      if (this.virtualJoystick) {
        this.virtualJoystick.destroy();
        this.virtualJoystick = null;
      }
      
      // 销毁游戏引擎
      if (this.gameEngine) {
        this.gameEngine.destroy();
        this.gameEngine = null;
      }
      
      // 清理DOM事件
      if (this.elements) {
        const elements = this.elements;
        elements.startBtn.removeEventListener('click', this.startGame);
        elements.restartBtn.removeEventListener('click', this.restartGame);
        elements.exitBtn.removeEventListener('click', this.exitGame);
        elements.infoToggle.removeEventListener('click', () => {
          elements.infoContent.classList.toggle('expanded');
        });
      }
      
      // 清理容器
      if (this.container) {
        this.container.innerHTML = '';
        this.container.className = '';
      }
      
      // 重置状态
      this.isInitialized = false;
      this.isGameStarted = false;
      this.elements = null;
      
      console.log('魔力合成游戏资源已清理');
      
    } catch (error) {
      console.error('游戏销毁失败:', error);
      throw error;
    }
  }
}

// 导出游戏类
export default MagicMergeGame;