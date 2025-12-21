// 盲盒运势模块数据配置
export const fortuneConfig = [
    { 
        range: [0, 5], 
        level: '天选之子', 
        color: 'var(--neon-yellow)',
        glow: 'var(--glow-yellow)'
    },
    { 
        range: [6, 20], 
        level: '大吉', 
        color: 'var(--neon-pink)',
        glow: 'var(--glow-pink)'
    },
    { 
        range: [21, 40], 
        level: '中吉', 
        color: 'var(--neon-green)',
        glow: 'var(--glow-green)'
    },
    { 
        range: [41, 60], 
        level: '小吉', 
        color: 'var(--neon-blue)',
        glow: 'var(--glow-blue)'
    },
    { 
        range: [61, 80], 
        level: '平', 
        color: '#AAAAAA',
        glow: '0 0 10px #AAAAAA, 0 0 20px rgba(170, 170, 170, 0.5)'
    },
    { 
        range: [81, 95], 
        level: '小凶', 
        color: 'var(--neon-orange)',
        glow: 'var(--glow-orange)'
    },
    { 
        range: [96, 99], 
        level: '大凶', 
        color: '#FF3333',
        glow: '0 0 10px #FF3333, 0 0 20px rgba(255, 51, 51, 0.5)'
    }
];

// 运势解读文案库（每个评级至少3条）
export const fortuneMessages = {
    '天选之子': [
        "哇！桃汽水都感受到你今天的欧气冲天了！大约会在第 [幸运数字] 次附近邂逅大奖哦！现在就去抽吧，今天你就是直播间最亮的星！",
        "天哪！这欧气已经冲出屏幕了！大约会在第 [幸运数字] 次附近邂逅大奖哦！建议直接冲限定款，今天你就是天选之人！",
        "金光闪闪！桃汽水都被你的好运闪到了！大约会在第 [幸运数字] 次附近邂逅大奖哦！这种欧气，不抽奖都可惜了！",
        "欧皇降临！直播间都要为你放烟花了！大约会在第 [幸运数字] 次附近邂逅大奖哦！快去开盒，今天必出金！"
    ],
    '大吉': [
        "好运来啦！桃汽水给你点赞！大约会在第 [幸运数字] 次附近邂逅大奖哦！准备好迎接惊喜吧！",
        "今日份的好运已签收！大约会在第 [幸运数字] 次附近邂逅大奖哦！可以小小期待一下了～",
        "锦鲤附体！桃汽水都羡慕了！大约会在第 [幸运数字] 次附近邂逅大奖哦！今天的手气一定不错！",
        "粉色好运加载完成！大约会在第 [幸运数字] 次附近邂逅大奖哦！是时候展示真正的欧气了！"
    ],
    '中吉': [
        "运势平稳上升中～大约会在第 [幸运数字] 次附近邂逅大奖哦！可以先看会儿直播热身！",
        "小幸运正在路上！大约会在第 [幸运数字] 次附近邂逅大奖哦！耐心等待，好事会发生！",
        "桃汽水给你加了个小buff！大约会在第 [幸运数字] 次附近邂逅大奖哦！今天的开盒会有惊喜！",
        "稳中求胜！大约会在第 [幸运数字] 次附近邂逅大奖哦！保持节奏，大奖会来的！"
    ],
    '小吉': [
        "需要一点点耐心哦～大约会在第 [幸运数字] 次附近邂逅大奖哦！好事多磨，惊喜在后头！",
        "积攒欧气中...大约会在第 [幸运数字] 次附近邂逅大奖哦！多看看桃汽水直播，好运自然来！",
        "小幸运正在充电！大约会在第 [幸运数字] 次附近邂逅大奖哦！先享受直播，好运随后就到！",
        "桃汽水说：好事不怕晚！大约会在第 [幸运数字] 次附近邂逅大奖哦！今天的坚持会有回报！"
    ],
    '平': [
        "重在参与，开心最重要！大约会在第 [幸运数字] 次附近邂逅大奖哦！享受开盒的过程吧～",
        "随缘就好，开心最重要！大约会在第 [幸运数字] 次附近邂逅大奖哦！桃汽水陪你一起等！",
        "平常心，平常心～大约会在第 [幸运数字] 次附近邂逅大奖哦！开盒的乐趣在于期待！",
        "今天的运气很佛系呢～大约会在第 [幸运数字] 次附近邂逅大奖哦！开心就好，结果随缘！"
    ],
    '小凶': [
        "呃…今天的幸运值需要充值…大约会在第 [幸运数字] 次附近邂逅大奖哦！建议抱住桃汽水许个愿！",
        "欧气暂时离线…大约会在第 [幸运数字] 次附近邂逅大奖哦！不过别灰心，快乐第一！",
        "需要一点点运气加持～大约会在第 [幸运数字] 次附近邂逅大奖哦！桃汽水给你加油打气！",
        "今天的开盒需要耐心哦～大约会在第 [幸运数字] 次附近邂逅大奖哦！积攒欧气，下次一定！"
    ],
    '大凶': [
        "……（桃汽水沉默并递给你一杯奶茶）。大约会在第 [幸运数字] 次附近邂逅大奖哦！但最重要的是开心！",
        "非酋时刻…桃汽水给你一个安慰的抱抱！大约会在第 [幸运数字] 次附近邂逅大奖哦！快乐开盒，结果随缘！",
        "今天的运气在睡觉…大约会在第 [幸运数字] 次附近邂逅大奖哦！不过有桃汽水陪着你呀！",
        "反向欧皇也是皇！大约会在第 [幸运数字] 次附近邂逅大奖哦！享受过程，快乐开盒！"
    ]
};

// 生成幸运数字
export function generateLuckyNumber() {
    return Math.floor(Math.random() * 100); // 0 到 99
}

// 根据数字获取运势结果
export function getFortuneResult(number) {
    const config = fortuneConfig.find(c => number >= c.range[0] && number <= c.range[1]);
    
    // 从该评级对应的文案库中随机选一条解读
    const messagePool = fortuneMessages[config.level];
    const randomMessage = messagePool[Math.floor(Math.random() * messagePool.length)];
    
    // 将核心预言句中的占位符替换为实际数字
    const finalMessage = randomMessage.replace(/\[幸运数字\]/g, number);
    
    return {
        luckyNumber: number,
        level: config.level,
        color: config.color,
        glow: config.glow,
        message: finalMessage
    };
}

// 获取今日扫描次数
export function getTodayScans() {
    const today = new Date().toDateString();
    const scans = JSON.parse(localStorage.getItem('fortune_daily_scans') || '{}');
    return scans[today] || 0;
}

// 增加今日扫描次数
export function incrementTodayScans() {
    const today = new Date().toDateString();
    const scans = JSON.parse(localStorage.getItem('fortune_daily_scans') || '{}');
    scans[today] = (scans[today] || 0) + 1;
    localStorage.setItem('fortune_daily_scans', JSON.stringify(scans));
    return scans[today];
}