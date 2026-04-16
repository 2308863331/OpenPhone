<!-- 禅意森林 - 禅意森林专注页面，含生命光环、植物生长和番茄钟 -->
<template>
  <div class="zen-forest" :class="{ 'is-focusing': isFocusing, 'is-resting': isResting, 'is-pomodoro': isPomodoro }">
    <div class="background-layer"></div>
    <div class="texture-layer"></div>
    <div class="atmosphere-layer"></div>

    <div class="healing-phrase" :class="{ 'phrase-enter': phraseVisible }">
      {{ currentPhrase }}
    </div>

    <div class="life-container" :class="{ 'container-enter': containerVisible }">
      <svg class="life-halo" viewBox="0 0 200 200">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle
          class="halo-bg"
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="rgba(139, 154, 125, 0.15)"
          stroke-width="2"
        />
        <circle
          class="halo-progress"
          cx="100"
          cy="100"
          r="90"
          fill="none"
          :stroke="currentHaloColor"
          stroke-width="2.5"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="progressOffset"
          filter="url(#glow)"
        />
      </svg>

      <div class="plant-wrapper" :style="plantStyle">
        <svg class="plant-svg" viewBox="0 0 100 120">
          <g class="plant-body">
            <path
              v-if="plantStage >= 1"
              class="stem"
              d="M50 110 Q50 80 50 60"
              stroke="#8B9A7D"
              stroke-width="3"
              fill="none"
              stroke-linecap="round"
            />
            <ellipse
              v-if="plantStage >= 1"
              class="leaf leaf-left"
              cx="35"
              cy="65"
              rx="12"
              ry="6"
              fill="#9BAA8D"
              transform="rotate(-30 35 65)"
            />
            <ellipse
              v-if="plantStage >= 2"
              class="leaf leaf-right"
              cx="65"
              cy="55"
              rx="14"
              ry="7"
              fill="#8B9A7D"
              transform="rotate(25 65 55)"
            />
            <ellipse
              v-if="plantStage >= 3"
              class="leaf leaf-top"
              cx="50"
              cy="40"
              rx="10"
              ry="18"
              fill="#7A8A6D"
            />
            <ellipse
              v-if="plantStage >= 3"
              class="leaf leaf-small"
              cx="38"
              cy="50"
              rx="8"
              ry="5"
              fill="#9BAA8D"
              transform="rotate(-45 38 50)"
            />
            <circle
              v-if="plantStage === 0"
              class="seed"
              cx="50"
              cy="95"
              r="8"
              fill="#8B9A7D"
            />
          </g>
        </svg>
      </div>

      <div class="time-display" v-if="showTime" @click="showTime = false">
        {{ formattedTime }}
      </div>
      <div class="time-hint" v-else @click="showTime = true">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
          <path d="M12 6v6l4 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>

      <div class="session-info" v-if="isPomodoro">
        <span class="session-text">{{ currentSession }} / {{ totalSessions }}</span>
      </div>
    </div>

    <div class="action-buttons" :class="{ 'buttons-enter': buttonsVisible }">
      <button class="action-btn focus-btn" @click="startFocus" :disabled="isFocusing">
        <span class="btn-text">{{ isFocusing ? '正在滋养...' : '种下时间' }}</span>
      </button>
      <button class="action-btn rest-btn" @click="startRest" :disabled="isResting">
        <span class="btn-text">{{ isResting ? '听风中...' : '停下来' }}</span>
      </button>
      <button class="action-btn pomodoro-btn" @click="togglePomodoro" :disabled="isFocusing || isResting">
        <span class="btn-text">{{ isPomodoro ? '退出番茄' : '番茄模式' }}</span>
      </button>
    </div>

    <div class="pomodoro-settings" v-if="isPomodoro && !isFocusing && !isResting">
      <div class="setting-item">
        <label>专注时间 (分钟)</label>
        <div class="setting-controls">
          <button @click="decreasePomodoroTime" class="setting-btn">-</button>
          <span class="setting-value">{{ pomodoroTime }}</span>
          <button @click="increasePomodoroTime" class="setting-btn">+</button>
        </div>
      </div>
      <div class="setting-item">
        <label>休息时间 (分钟)</label>
        <div class="setting-controls">
          <button @click="decreaseShortBreak" class="setting-btn">-</button>
          <span class="setting-value">{{ shortBreakTime }}</span>
          <button @click="increaseShortBreak" class="setting-btn">+</button>
        </div>
      </div>
      <div class="setting-item">
        <label>长休息 (分钟)</label>
        <div class="setting-controls">
          <button @click="decreaseLongBreak" class="setting-btn">-</button>
          <span class="setting-value">{{ longBreakTime }}</span>
          <button @click="increaseLongBreak" class="setting-btn">+</button>
        </div>
      </div>
    </div>

    <div class="sound-toggle" @click="toggleSoundPanel" :class="{ 'sound-active': soundPanelVisible }">
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M18 8a4 4 0 0 0-4-4v2a2 2 0 0 1 2 2h2z" fill="currentColor"/>
        <path d="M18 12a6 6 0 0 0-6-6v2a4 4 0 0 1 4 4h2z" fill="currentColor"/>
        <path d="M18 16a10 10 0 0 0-10-10v2a8 8 0 0 1 8 8h2z" fill="currentColor"/>
        <circle cx="8" cy="12" r="2" fill="currentColor"/>
      </svg>
      <div class="sound-panel" v-if="soundPanelVisible">
        <div
          v-for="sound in sounds"
          :key="sound.id"
          class="sound-option"
          :class="{ 'sound-selected': currentSound === sound.id }"
          @click.stop="selectSound(sound.id)"
        >
          {{ sound.name }}
        </div>
      </div>
    </div>

    <div class="falling-leaves" v-if="isFocusing">
      <div
        v-for="leaf in fallingLeaves"
        :key="leaf.id"
        class="leaf-particle"
        :style="leaf.style"
        @click="collectLeaf(leaf)"
        @mouseenter="hoverLeaf(leaf)"
      ></div>
    </div>

    <div class="completion-ripple" v-if="showCompletion">
      <div class="ripple-wave"></div>
      <div class="ripple-wave ripple-delay-1"></div>
      <div class="ripple-wave ripple-delay-2"></div>
    </div>

    <div class="completion-message" v-if="showCompletion">
      {{ completionMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ZenForest',
  data() {
    return {
      isFocusing: false,
      isResting: false,
      isPomodoro: false,
      focusTime: 25 * 60,
      restTime: 5 * 60,
      currentTime: 0,
      totalTime: 0,
      timer: null,
      plantStage: 0,
      showTime: false,
      showCompletion: false,
      phraseVisible: false,
      containerVisible: false,
      buttonsVisible: false,
      soundPanelVisible: false,
      currentSound: 'rain',
      sounds: [
        { id: 'rain', name: '窗外有雨' },
        { id: 'forest', name: '林间风起' },
        { id: 'fire', name: '炉火微明' }
      ],
      phrases: [
        '此时此刻，唯有呼吸',
        '慢下来，也是一种前进',
        '种一棵树最好的时间是现在',
        '让时间穿过你，而非追赶时间',
        '一呼一吸，皆是修行'
      ],
      currentPhraseIndex: 0,
      fallingLeaves: [],
      leafId: 0,
      circumference: 2 * Math.PI * 90,
      // Pomodoro settings
      pomodoroTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      sessionsBeforeLongBreak: 4,
      currentSession: 0,
      totalSessions: 0
    }
  },
  computed: {
    currentPhrase() {
      return this.phrases[this.currentPhraseIndex]
    },
    progressOffset() {
      if (this.totalTime === 0) return this.circumference
      const progress = this.currentTime / this.totalTime
      return this.circumference * (1 - progress)
    },
    formattedTime() {
      const minutes = Math.floor(this.currentTime / 60)
      const seconds = this.currentTime % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    },
    plantStyle() {
      const scale = 1 + this.plantStage * 0.1
      return {
        transform: `scale(${scale})`
      }
    },
    currentHaloColor() {
      if (this.isPomodoro) {
        return this.isFocusing ? '#E74C3C' : '#27AE60'
      }
      return '#8B9A7D'
    },
    completionMessage() {
      if (this.isPomodoro) {
        if (this.isFocusing) {
          return '专注时间结束，休息一下吧'
        } else {
          return '休息结束，准备开始下一个番茄'
        }
      }
      return '一片新叶展开了'
    }
  },
  mounted() {
    this.playEntrance()
    this.phraseTimer = setInterval(() => {
      this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.phrases.length
    }, 15000)
  },
  beforeUnmount() {
    clearInterval(this.phraseTimer)
    if (this.timer) clearInterval(this.timer)
    if (this.leafTimer) clearInterval(this.leafTimer)
  },
  methods: {
    playEntrance() {
      setTimeout(() => {
        this.containerVisible = true
      }, 800)
      setTimeout(() => {
        this.phraseVisible = true
      }, 1600)
      setTimeout(() => {
        this.buttonsVisible = true
      }, 2000)
    },
    startFocus() {
      if (this.isFocusing) return
      this.isFocusing = true
      this.isResting = false
      
      if (this.isPomodoro) {
        this.currentTime = this.pomodoroTime * 60
        this.totalTime = this.pomodoroTime * 60
      } else {
        this.currentTime = this.focusTime
        this.totalTime = this.focusTime
      }
      
      this.plantStage = 0
      this.startTimer()
      this.startLeafFall()
    },
    startRest() {
      if (this.isResting) return
      this.isResting = true
      this.isFocusing = false
      
      if (this.isPomodoro) {
        const isLongBreak = (this.currentSession + 1) % this.sessionsBeforeLongBreak === 0
        this.currentTime = (isLongBreak ? this.longBreakTime : this.shortBreakTime) * 60
        this.totalTime = this.currentTime
      } else {
        this.currentTime = this.restTime
        this.totalTime = this.restTime
      }
      
      this.plantStage = 0
      this.startTimer()
    },
    startTimer() {
      if (this.timer) clearInterval(this.timer)
      this.timer = setInterval(() => {
        if (this.currentTime > 0) {
          this.currentTime--
          this.updatePlantStage()
        } else {
          this.complete()
        }
      }, 1000)
    },
    updatePlantStage() {
      if (this.totalTime === 0) return
      const progress = 1 - this.currentTime / this.totalTime
      if (progress < 0.25) this.plantStage = 0
      else if (progress < 0.5) this.plantStage = 1
      else if (progress < 0.75) this.plantStage = 2
      else this.plantStage = 3
    },
    complete() {
      clearInterval(this.timer)
      this.timer = null
      this.showCompletion = true
      
      if (this.isPomodoro) {
        if (this.isFocusing) {
          this.currentSession++
          if (this.currentSession % this.sessionsBeforeLongBreak === 0) {
            this.totalSessions = this.currentSession
          }
        }
      }
      
      setTimeout(() => {
        this.showCompletion = false
        
        if (this.isPomodoro) {
          if (this.isFocusing) {
            this.isFocusing = false
            this.startRest()
          } else {
            this.isResting = false
            if (this.currentSession < this.totalSessions || this.totalSessions === 0) {
              this.startFocus()
            }
          }
        } else {
          this.isFocusing = false
          this.isResting = false
          this.currentTime = 0
          this.totalTime = 0
          this.plantStage = 0
          this.stopLeafFall()
        }
      }, 3000)
    },
    toggleSoundPanel() {
      this.soundPanelVisible = !this.soundPanelVisible
    },
    selectSound(soundId) {
      this.currentSound = soundId
      this.soundPanelVisible = false
    },
    startLeafFall() {
      this.leafTimer = setInterval(() => {
        if (this.fallingLeaves.length < 5) {
          this.createLeaf()
        }
      }, 3000)
    },
    stopLeafFall() {
      if (this.leafTimer) clearInterval(this.leafTimer)
      this.fallingLeaves = []
    },
    createLeaf() {
      const id = this.leafId++
      const startX = Math.random() * 80 + 10
      const duration = 8 + Math.random() * 4
      const delay = Math.random() * 2
      const size = 15 + Math.random() * 10
      const leaf = {
        id,
        style: {
          left: `${startX}%`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          width: `${size}px`,
          height: `${size}px`
        }
      }
      this.fallingLeaves.push(leaf)
      setTimeout(() => {
        const index = this.fallingLeaves.findIndex(l => l.id === id)
        if (index > -1) {
          this.fallingLeaves.splice(index, 1)
        }
      }, (duration + delay) * 1000)
    },
    hoverLeaf(leaf) {
      leaf.style.transform = 'scale(1.2)'
      leaf.style.filter = 'drop-shadow(0 0 8px rgba(139, 154, 125, 0.8))'
    },
    collectLeaf(leaf) {
      const index = this.fallingLeaves.findIndex(l => l.id === leaf.id)
      if (index > -1) {
        this.fallingLeaves.splice(index, 1)
      }
    },
    togglePomodoro() {
      this.isPomodoro = !this.isPomodoro
      if (this.isPomodoro) {
        this.currentSession = 0
        this.totalSessions = this.sessionsBeforeLongBreak
      }
    },
    increasePomodoroTime() {
      if (this.pomodoroTime < 60) this.pomodoroTime++
    },
    decreasePomodoroTime() {
      if (this.pomodoroTime > 5) this.pomodoroTime--
    },
    increaseShortBreak() {
      if (this.shortBreakTime < 15) this.shortBreakTime++
    },
    decreaseShortBreak() {
      if (this.shortBreakTime > 1) this.shortBreakTime--
    },
    increaseLongBreak() {
      if (this.longBreakTime < 30) this.longBreakTime++
    },
    decreaseLongBreak() {
      if (this.longBreakTime > 5) this.longBreakTime--
    }
  }
}
</script>

<style scoped>
.zen-forest {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 10vh;
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #F7F5F0;
  z-index: 0;
  animation: bgFadeIn 0.8s ease-out;
  transition: background 0.5s ease;
}

.texture-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(139, 154, 125, 0.03) 2px,
      rgba(139, 154, 125, 0.03) 4px
    );
  z-index: 1;
  pointer-events: none;
}

.atmosphere-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 60%,
    rgba(139, 154, 125, 0.08) 100%
  );
  z-index: 2;
  pointer-events: none;
}

.healing-phrase {
  position: relative;
  z-index: 10;
  font-size: 1.1rem;
  font-weight: 300;
  letter-spacing: 0.3em;
  color: rgba(90, 100, 80, 0.7);
  margin-bottom: 8vh;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.healing-phrase.phrase-enter {
  opacity: 1;
  transform: translateY(0);
}

.life-container {
  position: relative;
  z-index: 10;
  width: 280px;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.life-container.container-enter {
  opacity: 1;
  transform: scale(1);
}

.life-halo {
  position: absolute;
  width: 100%;
  height: 100%;
  animation: haloBreath 10s ease-in-out infinite;
}

.halo-progress {
  transform: rotate(-90deg);
  transform-origin: center;
  transition: stroke-dashoffset 1s linear, stroke 0.3s ease;
}

.plant-wrapper {
  position: relative;
  width: 100px;
  height: 120px;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.plant-svg {
  width: 100%;
  height: 100%;
}

.plant-body {
  animation: plantSway 4s ease-in-out infinite;
}

.stem {
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: drawStem 1s ease-out forwards;
}

.leaf {
  opacity: 0;
  transform-origin: center;
  animation: leafGrow 0.8s ease-out forwards;
}

.leaf-left {
  animation-delay: 0.3s;
}

.leaf-right {
  animation-delay: 0.6s;
}

.leaf-top {
  animation-delay: 0.9s;
}

.leaf-small {
  animation-delay: 1.2s;
}

.seed {
  opacity: 0;
  animation: seedAppear 0.5s ease-out forwards;
}

.time-display {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.85rem;
  font-weight: 300;
  letter-spacing: 0.15em;
  color: rgba(90, 100, 80, 0.6);
  cursor: pointer;
}

.time-hint {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(90, 100, 80, 0.4);
  cursor: pointer;
  transition: color 0.3s ease;
}

.time-hint:hover {
  color: rgba(90, 100, 80, 0.7);
}

.session-info {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  font-weight: 300;
  letter-spacing: 0.1em;
  color: rgba(90, 100, 80, 0.6);
}

.action-buttons {
  position: relative;
  z-index: 10;
  display: flex;
  gap: 16px;
  margin-top: 10vh;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-buttons.buttons-enter {
  opacity: 1;
  transform: translateY(0);
}

.action-btn {
  padding: 14px 28px;
  border: none;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 400;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    transparent 40%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 60%
  );
  pointer-events: none;
}

.focus-btn {
  background: linear-gradient(145deg, #9BAA8D, #8B9A7D);
  color: #F7F5F0;
  box-shadow: 
    0 4px 15px rgba(139, 154, 125, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.focus-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(139, 154, 125, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.focus-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 
    0 2px 10px rgba(139, 154, 125, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rest-btn {
  background: linear-gradient(145deg, #E8E5E0, #DDD9D2);
  color: rgba(90, 100, 80, 0.8);
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.rest-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.rest-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 
    0 2px 10px rgba(0, 0, 0, 0.05),
    inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.pomodoro-btn {
  background: linear-gradient(145deg, #E74C3C, #C0392B);
  color: #F7F5F0;
  box-shadow: 
    0 4px 15px rgba(231, 76, 60, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.pomodoro-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(231, 76, 60, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.pomodoro-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 
    0 2px 10px rgba(231, 76, 60, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pomodoro-settings {
  position: relative;
  z-index: 10;
  margin-top: 24px;
  display: flex;
  gap: 32px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  animation: settingsSlideIn 0.5s ease-out;
}

.setting-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.setting-item label {
  font-size: 0.8rem;
  font-weight: 300;
  color: rgba(90, 100, 80, 0.7);
  letter-spacing: 0.05em;
}

.setting-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(139, 154, 125, 0.1);
  color: rgba(90, 100, 80, 0.7);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.setting-btn:hover {
  background: rgba(139, 154, 125, 0.2);
  transform: scale(1.05);
}

.setting-value {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(90, 100, 80, 0.9);
  min-width: 40px;
  text-align: center;
}

.sound-toggle {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 20;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  color: rgba(90, 100, 80, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
}

.sound-toggle:hover {
  background: rgba(255, 255, 255, 0.8);
  color: rgba(90, 100, 80, 0.9);
}

.sound-toggle.sound-active {
  background: rgba(139, 154, 125, 0.2);
}

.sound-panel {
  position: absolute;
  top: 54px;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 8px 0;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  min-width: 140px;
  animation: panelSlideIn 0.3s ease-out;
}

.sound-option {
  padding: 12px 20px;
  font-size: 0.9rem;
  color: rgba(90, 100, 80, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
}

.sound-option:hover {
  background: rgba(139, 154, 125, 0.1);
  color: rgba(90, 100, 80, 0.9);
}

.sound-option.sound-selected {
  color: #8B9A7D;
  font-weight: 500;
}

.falling-leaves {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  pointer-events: none;
  overflow: hidden;
}

.leaf-particle {
  position: absolute;
  top: -30px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #9BAA8D, #8B9A7D);
  border-radius: 50% 0 50% 50%;
  opacity: 0.7;
  pointer-events: auto;
  cursor: pointer;
  animation: leafFall linear forwards;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.completion-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 15;
  pointer-events: none;
}

.ripple-wave {
  position: absolute;
  width: 280px;
  height: 280px;
  border: 2px solid rgba(139, 154, 125, 0.5);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  animation: rippleExpand 2s ease-out forwards;
}

.ripple-delay-1 {
  animation-delay: 0.3s;
}

.ripple-delay-2 {
  animation-delay: 0.6s;
}

.completion-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, calc(-50% + 180px));
  z-index: 20;
  font-size: 1rem;
  font-weight: 300;
  letter-spacing: 0.2em;
  color: rgba(90, 100, 80, 0.8);
  animation: messageFadeIn 0.8s ease-out;
}

.zen-forest.is-focusing .background-layer {
  background: #F5F3EE;
}

.zen-forest.is-resting .background-layer {
  background: #EAE8E3;
}

.zen-forest.is-pomodoro .background-layer {
  background: #F8F6F1;
}

.zen-forest.is-pomodoro.is-focusing .background-layer {
  background: #F5F0EE;
}

.zen-forest.is-pomodoro.is-resting .background-layer {
  background: #F0F5EE;
}

.zen-forest.is-resting .halo-progress {
  stroke: rgba(139, 154, 125, 0.4);
}

@keyframes bgFadeIn {
  from {
    opacity: 0;
    background: #fff;
  }
  to {
    opacity: 1;
    background: #F7F5F0;
  }
}

@keyframes haloBreath {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(139, 154, 125, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 15px rgba(139, 154, 125, 0.5));
  }
}

@keyframes plantSway {
  0%, 100% {
    transform: rotate(-1deg);
  }
  50% {
    transform: rotate(1deg);
  }
}

@keyframes drawStem {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes leafGrow {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes seedAppear {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes leafFall {
  0% {
    top: -30px;
    transform: rotate(0deg) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.7;
  }
  100% {
    top: 110%;
    transform: rotate(360deg) translateX(100px);
    opacity: 0;
  }
}

@keyframes rippleExpand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

@keyframes messageFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, calc(-50% + 200px));
  }
  to {
    opacity: 1;
    transform: translate(-50%, calc(-50% + 180px));
  }
}

@keyframes panelSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes settingsSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .zen-forest {
    padding-top: 8vh;
  }

  .healing-phrase {
    font-size: 0.95rem;
    letter-spacing: 0.2em;
    margin-bottom: 6vh;
  }

  .life-container {
    width: 240px;
    height: 240px;
  }

  .action-buttons {
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    margin-top: 8vh;
  }

  .action-btn {
    padding: 12px 24px;
    font-size: 0.9rem;
  }

  .pomodoro-settings {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    margin-top: 16px;
  }

  .setting-item {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }

  .setting-controls {
    order: -1;
  }

  .sound-toggle {
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
  }
}
</style>
