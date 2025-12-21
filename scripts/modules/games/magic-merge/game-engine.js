import { GAME_CONFIG, getLevelConfig, getNextLevel } from './game-config.js';

export class GameEngine {
  constructor() {
    this.gridSize = GAME_CONFIG.GRID_SIZE;
    this.grid = this.createEmptyGrid();
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.moves = 0;
    this.gameState = GAME_CONFIG.GAME_STATES.NOT_STARTED;
    this.unlockedLevels = new Set(this.loadUnlockedLevels());
    this.deviceType = this.detectDeviceType();
    this.hasChanged = false;
    
    // 绑定方法
    this.initGame = this.initGame.bind(this);
    this.move = this.move.bind(this);
    this.canMove = this.canMove.bind(this);
    this.isGameOver = this.isGameOver.bind(this);
    this.isGameWon = this.isGameWon.bind(this);
  }
  
  // 检测设备类型
  detectDeviceType() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      ? 'mobile'
      : 'desktop';
  }
  
  // 创建空网格
  createEmptyGrid() {
    return Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
  }
  
  // 初始化游戏
  initGame() {
    this.grid = this.createEmptyGrid();
    this.score = 0;
    this.moves = 0;
    this.gameState = GAME_CONFIG.GAME_STATES.READY;
    this.hasChanged = false;
    
    // 生成初始水晶
    for (let i = 0; i < GAME_CONFIG.INITIAL_TILES; i++) {
      this.addRandomTile();
    }
    
    // 保存初始状态
    this.saveGameState();
    
    return {
      grid: this.getGridCopy(),
      score: this.score,
      gameState: this.gameState,
      unlockedLevels: Array.from(this.unlockedLevels)
    };
  }
  
  // 开始游戏
  startGame() {
    if (this.gameState === GAME_CONFIG.GAME_STATES.NOT_STARTED ||
        this.gameState === GAME_CONFIG.GAME_STATES.GAME_OVER) {
      this.gameState = GAME_CONFIG.GAME_STATES.PLAYING;
      return true;
    }
    return false;
  }
  
  // 移动方向
  move(direction) {
    if (this.gameState !== GAME_CONFIG.GAME_STATES.PLAYING) {
      return null;
    }
    
    const oldGrid = this.getGridCopy();
    let moved = false;
    let scoreAdded = 0;
    let mergedTiles = [];
    
    // 根据方向处理移动
    switch (direction) {
      case 'up':
        ({ moved, scoreAdded, mergedTiles } = this.moveUp());
        break;
      case 'down':
        ({ moved, scoreAdded, mergedTiles } = this.moveDown());
        break;
      case 'left':
        ({ moved, scoreAdded, mergedTiles } = this.moveLeft());
        break;
      case 'right':
        ({ moved, scoreAdded, mergedTiles } = this.moveRight());
        break;
      default:
        return null;
    }
    
    // 如果有移动，添加新水晶并更新状态
    if (moved) {
      this.moves++;
      this.score += scoreAdded;
      
      // 检查是否获胜
      if (this.isGameWon()) {
        this.gameState = GAME_CONFIG.GAME_STATES.WON;
      } else {
        this.addRandomTile();
        
        // 检查是否游戏结束
        if (this.isGameOver()) {
          this.gameState = GAME_CONFIG.GAME_STATES.GAME_OVER;
        }
      }
      
      // 更新最高分
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.saveHighScore();
      }
      
      // 保存游戏状态
      this.saveGameState();
      
      return {
        grid: this.getGridCopy(),
        oldGrid,
        moved,
        scoreAdded,
        totalScore: this.score,
        mergedTiles,
        gameState: this.gameState,
        moves: this.moves,
        unlockedLevels: Array.from(this.unlockedLevels)
      };
    }
    
    return null;
  }
  
  // 向上移动
  moveUp() {
    let moved = false;
    let scoreAdded = 0;
    const mergedTiles = [];
    
    for (let col = 0; col < this.gridSize; col++) {
      const column = this.grid.map(row => row[col]);
      const { newColumn, merged, score } = this.slideAndMerge(column);
      
      if (merged) {
        moved = true;
        scoreAdded += score;
        
        // 记录合并的水晶位置
        newColumn.forEach((value, row) => {
          if (value > 0 && column[row] !== value) {
            mergedTiles.push({ row, col, level: value });
            this.unlockedLevels.add(value);
          }
        });
        
        // 更新网格
        for (let row = 0; row < this.gridSize; row++) {
          this.grid[row][col] = newColumn[row];
        }
      }
    }
    
    return { moved, scoreAdded, mergedTiles };
  }
  
  // 向下移动
  moveDown() {
    let moved = false;
    let scoreAdded = 0;
    const mergedTiles = [];
    
    for (let col = 0; col < this.gridSize; col++) {
      const column = this.grid.map(row => row[col]).reverse();
      const { newColumn, merged, score } = this.slideAndMerge(column);
      
      if (merged) {
        moved = true;
        scoreAdded += score;
        
        // 记录合并的水晶位置
        newColumn.reverse().forEach((value, row) => {
          if (value > 0 && this.grid[row][col] !== value) {
            mergedTiles.push({ row, col, level: value });
            this.unlockedLevels.add(value);
          }
        });
        
        // 更新网格
        for (let row = 0; row < this.gridSize; row++) {
          this.grid[row][col] = newColumn[this.gridSize - 1 - row];
        }
      }
    }
    
    return { moved, scoreAdded, mergedTiles };
  }
  
  // 向左移动
  moveLeft() {
    let moved = false;
    let scoreAdded = 0;
    const mergedTiles = [];
    
    for (let row = 0; row < this.gridSize; row++) {
      const rowArray = [...this.grid[row]];
      const { newRow, merged, score } = this.slideAndMerge(rowArray);
      
      if (merged) {
        moved = true;
        scoreAdded += score;
        
        // 记录合并的水晶位置
        newRow.forEach((value, col) => {
          if (value > 0 && this.grid[row][col] !== value) {
            mergedTiles.push({ row, col, level: value });
            this.unlockedLevels.add(value);
          }
        });
        
        // 更新网格
        this.grid[row] = newRow;
      }
    }
    
    return { moved, scoreAdded, mergedTiles };
  }
  
  // 向右移动
  moveRight() {
    let moved = false;
    let scoreAdded = 0;
    const mergedTiles = [];
    
    for (let row = 0; row < this.gridSize; row++) {
      const rowArray = [...this.grid[row]].reverse();
      const { newRow, merged, score } = this.slideAndMerge(rowArray);
      
      if (merged) {
        moved = true;
        scoreAdded += score;
        
        // 记录合并的水晶位置
        newRow.reverse().forEach((value, col) => {
          if (value > 0 && this.grid[row][col] !== value) {
            mergedTiles.push({ row, col, level: value });
            this.unlockedLevels.add(value);
          }
        });
        
        // 更新网格
        this.grid[row] = newRow.reverse();
      }
    }
    
    return { moved, scoreAdded, mergedTiles };
  }
  
  // 滑动并合并行/列
  slideAndMerge(array) {
    const original = [...array];
    const filtered = array.filter(cell => cell !== 0);
    const merged = [];
    let score = 0;
    
    // 合并相同的水晶
    for (let i = 0; i < filtered.length; i++) {
      if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
        const newLevel = filtered[i] * 2;
        merged.push(newLevel);
        score += newLevel;
        i++; // 跳过下一个，因为已经合并
      } else {
        merged.push(filtered[i]);
      }
    }
    
    // 填充空位
    while (merged.length < this.gridSize) {
      merged.push(0);
    }
    
    // 检查是否有变化
    const hasChanged = original.some((val, idx) => val !== merged[idx]);
    
    return {
      newRow: merged,
      merged: hasChanged,
      score
    };
  }
  
  // 添加随机水晶
  addRandomTile() {
    const emptyCells = [];
    
    // 找到所有空单元格
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    if (emptyCells.length === 0) return null;
    
    // 随机选择一个空单元格
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    // 根据概率生成等级
    const rand = Math.random();
    let level = 1;
    if (rand <= GAME_CONFIG.NEW_TILE_PROBABILITY[2]) {
      level = 2;
    }
    
    // 放置水晶
    this.grid[randomCell.row][randomCell.col] = level;
    
    return {
      row: randomCell.row,
      col: randomCell.col,
      level
    };
  }
  
  // 检查是否可以移动
  canMove() {
    // 检查是否有空单元格
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col] === 0) {
          return true;
        }
      }
    }
    
    // 检查是否可以合并
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const current = this.grid[row][col];
        
        // 检查右侧
        if (col < this.gridSize - 1 && this.grid[row][col + 1] === current) {
          return true;
        }
        
        // 检查下方
        if (row < this.gridSize - 1 && this.grid[row + 1][col] === current) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  // 检查游戏是否结束
  isGameOver() {
    return !this.canMove();
  }
  
  // 检查游戏是否获胜
  isGameWon() {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col] === GAME_CONFIG.TARGET_LEVEL) {
          return true;
        }
      }
    }
    return false;
  }
  
  // 获取网格副本
  getGridCopy() {
    return this.grid.map(row => [...row]);
  }
  
  // 获取当前游戏状态
  getGameState() {
    return {
      grid: this.getGridCopy(),
      score: this.score,
      highScore: this.highScore,
      moves: this.moves,
      gameState: this.gameState,
      unlockedLevels: Array.from(this.unlockedLevels),
      deviceType: this.deviceType
    };
  }
  
  // 保存游戏状态到本地存储
  saveGameState() {
    try {
      const gameState = {
        grid: this.grid,
        score: this.score,
        moves: this.moves,
        gameState: this.gameState,
        unlockedLevels: Array.from(this.unlockedLevels),
        timestamp: Date.now()
      };
      
      localStorage.setItem(
        GAME_CONFIG.STORAGE_KEYS.GAME_STATE,
        JSON.stringify(gameState)
      );
      
      return true;
    } catch (error) {
      console.error('保存游戏状态失败:', error);
      return false;
    }
  }
  
  // 从本地存储加载游戏状态
  loadGameState() {
    try {
      const saved = localStorage.getItem(GAME_CONFIG.STORAGE_KEYS.GAME_STATE);
      if (!saved) return null;
      
      const gameState = JSON.parse(saved);
      
      // 验证数据完整性
      if (!gameState.grid || !Array.isArray(gameState.grid)) return null;
      if (gameState.grid.length !== this.gridSize) return null;
      
      // 恢复状态
      this.grid = gameState.grid;
      this.score = gameState.score || 0;
      this.moves = gameState.moves || 0;
      this.gameState = gameState.gameState || GAME_CONFIG.GAME_STATES.NOT_STARTED;
      this.unlockedLevels = new Set(gameState.unlockedLevels || []);
      
      // 如果游戏正在进行但实际已结束，更新状态
      if (this.gameState === GAME_CONFIG.GAME_STATES.PLAYING && this.isGameOver()) {
        this.gameState = GAME_CONFIG.GAME_STATES.GAME_OVER;
      }
      
      // 如果游戏正在进行但实际已获胜，更新状态
      if (this.gameState === GAME_CONFIG.GAME_STATES.PLAYING && this.isGameWon()) {
        this.gameState = GAME_CONFIG.GAME_STATES.WON;
      }
      
      return this.getGameState();
    } catch (error) {
      console.error('加载游戏状态失败:', error);
      return null;
    }
  }
  
  // 保存最高分
  saveHighScore() {
    try {
      localStorage.setItem(
        GAME_CONFIG.STORAGE_KEYS.HIGH_SCORE,
        this.highScore.toString()
      );
      return true;
    } catch (error) {
      console.error('保存最高分失败:', error);
      return false;
    }
  }
  
  // 加载最高分
  loadHighScore() {
    try {
      const saved = localStorage.getItem(GAME_CONFIG.STORAGE_KEYS.HIGH_SCORE);
      return saved ? parseInt(saved, 10) : 0;
    } catch (error) {
      console.error('加载最高分失败:', error);
      return 0;
    }
  }
  
  // 加载已解锁等级
  loadUnlockedLevels() {
    try {
      const saved = localStorage.getItem(GAME_CONFIG.STORAGE_KEYS.UNLOCKED_LEVELS);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('加载已解锁等级失败:', error);
      return [];
    }
  }
  
  // 保存已解锁等级
  saveUnlockedLevels() {
    try {
      localStorage.setItem(
        GAME_CONFIG.STORAGE_KEYS.UNLOCKED_LEVELS,
        JSON.stringify(Array.from(this.unlockedLevels))
      );
      return true;
    } catch (error) {
      console.error('保存已解锁等级失败:', error);
      return false;
    }
  }
  
  // 重置游戏（保留最高分和已解锁等级）
  resetGame() {
    const savedHighScore = this.highScore;
    const savedUnlockedLevels = new Set(this.unlockedLevels);
    
    this.grid = this.createEmptyGrid();
    this.score = 0;
    this.moves = 0;
    this.gameState = GAME_CONFIG.GAME_STATES.NOT_STARTED;
    this.unlockedLevels = savedUnlockedLevels;
    this.hasChanged = false;
    
    // 保存解锁等级
    this.saveUnlockedLevels();
    
    // 清除游戏状态保存，但不清除最高分
    localStorage.removeItem(GAME_CONFIG.STORAGE_KEYS.GAME_STATE);
    
    return {
      grid: this.getGridCopy(),
      score: this.score,
      highScore: savedHighScore,
      gameState: this.gameState,
      unlockedLevels: Array.from(this.unlockedLevels)
    };
  }
  
  // 销毁游戏引擎
  destroy() {
    // 保存最终状态
    this.saveGameState();
    this.saveUnlockedLevels();
    
    // 清理引用
    this.grid = null;
    this.unlockedLevels.clear();
  }
}