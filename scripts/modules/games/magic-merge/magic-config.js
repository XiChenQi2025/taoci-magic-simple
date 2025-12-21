// 游戏配置常量
export const GAME_CONFIG = {
  // 网格大小
  GRID_SIZE: 4,
  
  // 目标等级
  TARGET_LEVEL: 2048,
  
  // 初始水晶生成配置
  INITIAL_TILES: 2,
  INITIAL_LEVEL_PROBABILITY: {
    1: 0.9, // 90%概率生成1级
    2: 0.1  // 10%概率生成2级
  },
  
  // 新水晶生成配置
  NEW_TILE_PROBABILITY: {
    1: 0.9,
    2: 0.1
  },
  
  // 等级配置
  LEVELS: [
    { level: 1, emoji: '✨', name: '微弱魔力', color: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)' },
    { level: 2, emoji: '🌟', name: '初级魔力', color: 'linear-gradient(135deg, #fdfd96 0%, #f9d423 100%)' },
    { level: 4, emoji: '💎', name: '闪耀魔力', color: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
    { level: 8, emoji: '🔮', name: '水晶魔力', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { level: 16, emoji: '🌈', name: '彩虹魔力', color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { level: 32, emoji: '🌠', name: '流星魔力', color: 'linear-gradient(135deg, #a3bded 0%, #6991c7 100%)' },
    { level: 64, emoji: '☄️', name: '彗星魔力', color: 'linear-gradient(135deg, #ff5858 0%, #f09819 100%)' },
    { level: 128, emoji: '🪐', name: '行星魔力', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { level: 256, emoji: '🌌', name: '银河魔力', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { level: 512, emoji: '🎇', name: '烟火魔力', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { level: 1024, emoji: '💫', name: '宇宙魔力', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { level: 2048, emoji: '🍑💖', name: '桃汽水の祝福', color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #a3bded 100%)' }
  ],
  
  // 动画持续时间
  ANIMATION_DURATION: {
    TILE_SPAWN: 200,
    TILE_MERGE: 300,
    TILE_MOVE: 150,
    SCORE_UPDATE: 300,
    MESSAGE_SHOW: 5000
  },
  
  // 本地存储键名
  STORAGE_KEYS: {
    GAME_STATE: 'magicMerge_gameState',
    HIGH_SCORE: 'magicMerge_highScore',
    UNLOCKED_LEVELS: 'magicMerge_unlockedLevels'
  },
  
  // 游戏状态枚举
  GAME_STATES: {
    NOT_STARTED: 'not_started',
    READY: 'ready',
    PLAYING: 'playing',
    WON: 'won',
    GAME_OVER: 'game_over'
  },
  
  // 控制方式
  CONTROL_TYPES: {
    KEYBOARD: 'keyboard',
    TOUCH: 'touch',
    VIRTUAL: 'virtual'
  }
};

// 根据等级获取配置
export function getLevelConfig(level) {
  return GAME_CONFIG.LEVELS.find(l => l.level === level) || {
    level,
    emoji: '❓',
    name: `未知魔力 ${level}`,
    color: 'linear-gradient(135deg, #cccccc 0%, #999999 100%)'
  };
}

// 获取所有等级
export function getAllLevels() {
  return GAME_CONFIG.LEVELS.map(l => l.level);
}

// 获取下一个等级
export function getNextLevel(currentLevel) {
  const levels = getAllLevels();
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex >= 0 && currentIndex < levels.length - 1 
    ? levels[currentIndex + 1] 
    : null;
}