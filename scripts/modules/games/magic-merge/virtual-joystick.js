import { GAME_CONFIG } from './game-config.js';

export class VirtualJoystick {
  constructor(container, onDirection) {
    this.container = container;
    this.onDirection = onDirection;
    this.isEnabled = false;
    this.touchStart = null;
    this.minSwipeDistance = 30;
    
    this.init();
  }
  
  init() {
    this.createUI();
    this.bindEvents();
  }
  
  createUI() {
    // 创建虚拟控制容器
    this.joystickEl = document.createElement('div');
    this.joystickEl.className = 'virtual-joystick';
    this.joystickEl.innerHTML = `
      <div class="joystick-inner">
        <button class="direction-btn btn-up" data-direction="up">
          <span>↑</span>
        </button>
        <button class="direction-btn btn-left" data-direction="left">
          <span>←</span>
        </button>
        <button class="direction-btn btn-center" data-direction="center">
          <span>•</span>
        </button>
        <button class="direction-btn btn-right" data-direction="right">
          <span>→</span>
        </button>
        <button class="direction-btn btn-down" data-direction="down">
          <span>↓</span>
        </button>
        <div class="joystick-connections">
          <div class="connection connection-h"></div>
          <div class="connection connection-v"></div>
        </div>
      </div>
      <div class="joystick-toggle">
        <label class="toggle-label">
          <input type="checkbox" class="toggle-input">
          <span class="toggle-slider"></span>
          <span class="toggle-text">虚拟控制</span>
        </label>
      </div>
    `;
    
    this.container.appendChild(this.joystickEl);
    
    // 获取元素引用
    this.toggleInput = this.joystickEl.querySelector('.toggle-input');
    this.directionBtns = this.joystickEl.querySelectorAll('.direction-btn');
    this.centerBtn = this.joystickEl.querySelector('.btn-center');
  }
  
  bindEvents() {
    // 绑定按钮点击事件
    this.directionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (!this.isEnabled) return;
        
        const direction = btn.dataset.direction;
        if (direction !== 'center') {
          this.handleDirection(direction);
          this.animateButtonPress(btn);
        }
      });
      
      // 触摸反馈
      btn.addEventListener('touchstart', () => {
        if (this.isEnabled) {
          btn.classList.add('pressed');
        }
      });
      
      btn.addEventListener('touchend', () => {
        btn.classList.remove('pressed');
      });
    });
    
    // 绑定切换开关事件
    this.toggleInput.addEventListener('change', (e) => {
      this.setEnabled(e.target.checked);
    });
    
    // 绑定触摸滑动事件
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // 默认禁用虚拟控制
    this.setEnabled(false);
  }
  
  handleTouchStart(e) {
    if (!this.isEnabled) return;
    
    this.touchStart = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
    
    e.preventDefault();
  }
  
  handleTouchMove(e) {
    if (!this.touchStart) return;
    
    e.preventDefault();
  }
  
  handleTouchEnd(e) {
    if (!this.touchStart || !this.isEnabled) return;
    
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    };
    
    const deltaX = touchEnd.x - this.touchStart.x;
    const deltaY = touchEnd.y - this.touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = touchEnd.time - this.touchStart.time;
    
    if (distance > this.minSwipeDistance && duration < 500) {
      let direction;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        // 垂直滑动
        direction = deltaY > 0 ? 'down' : 'up';
      }
      
      this.handleDirection(direction);
      this.animateSwipeFeedback(direction);
    }
    
    this.touchStart = null;
  }
  
  handleDirection(direction) {
    if (this.onDirection) {
      this.onDirection(direction);
    }
  }
  
  animateButtonPress(button) {
    button.classList.add('pressed');
    
    setTimeout(() => {
      button.classList.remove('pressed');
    }, 200);
  }
  
  animateSwipeFeedback(direction) {
    // 在中心按钮显示滑动方向
    const directions = {
      up: '↑',
      down: '↓',
      left: '←',
      right: '→'
    };
    
    const originalText = this.centerBtn.querySelector('span').textContent;
    this.centerBtn.querySelector('span').textContent = directions[direction];
    this.centerBtn.classList.add('swipe-feedback');
    
    setTimeout(() => {
      this.centerBtn.querySelector('span').textContent = originalText;
      this.centerBtn.classList.remove('swipe-feedback');
    }, 300);
  }
  
  setEnabled(enabled) {
    this.isEnabled = enabled;
    this.toggleInput.checked = enabled;
    
    if (enabled) {
      this.joystickEl.classList.add('enabled');
      this.container.classList.add('virtual-controls-enabled');
    } else {
      this.joystickEl.classList.remove('enabled');
      this.container.classList.remove('virtual-controls-enabled');
    }
  }
  
  isEnabledState() {
    return this.isEnabled;
  }
  
  destroy() {
    // 移除事件监听器
    this.directionBtns.forEach(btn => {
      btn.replaceWith(btn.cloneNode(true));
    });
    
    // 移除元素
    if (this.joystickEl.parentNode) {
      this.joystickEl.parentNode.removeChild(this.joystickEl);
    }
    
    // 清理引用
    this.container = null;
    this.onDirection = null;
    this.joystickEl = null;
    this.toggleInput = null;
    this.directionBtns = null;
    this.centerBtn = null;
  }
}