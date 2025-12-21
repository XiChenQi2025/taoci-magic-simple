import GameHallModule from './index.js';
import gameCatalog from './game-config.js';
import './game-hall.css';

/**
 * 游戏厅模块导出
 */
export default {
  id: 'game-hall',
  name: '魔力游戏厅',
  description: '站内小游戏的集中展示与启动中心',
  
  /**
   * 初始化模块
   */
  async init(containerId) {
    try {
      const module = new GameHallModule(containerId);
      return module;
    } catch (error) {
      console.error('游戏厅模块初始化失败:', error);
      throw error;
    }
  },
  
  /**
   * 获取模块信息
   */
  getInfo() {
    return {
      version: '1.0.0',
      gamesCount: gameCatalog.length,
      games: gameCatalog.map(g => g.display.title)
    };
  },
  
  /**
   * 模块配置
   */
  config: {
    canMinimize: true,
    canMaximize: true,
    defaultWidth: '100%',
    defaultHeight: '100vh',
    minWidth: 800,
    minHeight: 600
  }
};