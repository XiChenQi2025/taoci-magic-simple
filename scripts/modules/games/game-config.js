/**
 * 魔力游戏厅 - 游戏目录配置
 */
const gameCatalog = [
/**
 * 魔力游戏厅 - 游戏目录配置
 */
  {
    id: 'magic-merge',
    display: {
      title: '魔力合成',
      snapshot: './assets/games/snapshot-merge.jpg',
      tags: ['合成', '益智'],
      difficulty: 3,
      description: '滑动合并，合成桃汽水の终极祝福！',
      themeColor: 'var(--neon-purple)'
    },
    moduleInfo: {
      path: './magic-merge/',
      entry: 'index.js'  // 指向我们的新模块入口
    }
  },
  {
    id: 'peach-puzzle',
    display: {
      title: '桃桃拼图',
      snapshot: './assets/games/snapshot-puzzle.jpg',
      tags: ['拼图', '休闲'],
      difficulty: 2,
      description: '拖动碎片，拼出完整的魔法少女！',
      themeColor: 'var(--neon-pink)'
    },
    moduleInfo: {
      path: './scripts/modules/games/peach-puzzle/',
      entry: 'index.js'
    }
  },
  {
    id: 'bubble-shooter',
    display: {
      title: '魔法泡泡',
      snapshot: './assets/games/snapshot-bubble.jpg',
      tags: ['射击', '消除'],
      difficulty: 4,
      description: '发射彩色泡泡，完成三个以上消除！',
      themeColor: 'var(--neon-blue)'
    },
    moduleInfo: {
      path: './scripts/modules/games/bubble-shooter/',
      entry: 'index.js'
    }
  }
];

export default gameCatalog;