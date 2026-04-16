<!-- 禅林副本 - 禅意森林专注页面（副本版本），含生命光环和落叶收集 -->
<template>
  <div class="zen-forest" :class="{ 'rest-mode': isRestMode }" ref="containerRef">
    <div class="background-layer">
      <div class="gradient-base"></div>
      <div class="texture-overlay"></div>
      <div class="forest-mist"></div>
    </div>

    <div class="falling-leaves" v-if="isFocusing">
      <div
        v-for="leaf in leaves"
        :key="leaf.id"
        class="leaf"
        :style="leaf.style"
        @click="collectLeaf(leaf)"
      ></div>
    </div>

    <div class="content-wrapper">
      <div class="healing-phrase" :class="{ visible: phraseVisible }">
        {{ currentPhrase }}
      </div>

      <div class="life-circle-container">
        <svg class="life-circle" viewBox="0 0 200 200">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle
            class="circle-bg"
            cx="100"
            cy="100"
            r="90"
          />
          <circle
            class="circle-progress"
            cx="100"
            cy="100"
            r="90"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="progressOffset"
            filter="url(#glow)"
          />
          <circle
            class="circle-glow"
            cx="100"
            cy="100"
            r="90"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="progressOffset"
          />
        </svg>

        <div class="plant-container" :class="plantStage">
          <div class="plant-glow"></div>
          <div class="plant">
            <svg viewBox="0 0 100 120" class="plant-svg">
              <g class="plant-body" :style="{ transform: `scale(${plantScale})` }">
                <ellipse class="pot" cx="50" cy="110" rx="25" ry="10" fill="#8B7355"/>
                <rect class="pot-body" x="30" y="100" width="40" height="12" rx="2" fill="#9C8465"/>
                <path class="stem" d="M50 100 Q50 70 50 50" stroke="#6B8E6B" stroke-width="3" fill="none"/>
                <ellipse class="leaf-left" cx="35" cy="65" rx="12" ry="6" fill="#7BA17B" transform="rotate(-30 35 65)"/>
                <ellipse class="leaf-right" cx="65" cy="65" rx="12" ry="6" fill="#7BA17B" transform="rotate(30 65 65)"/>
                <ellipse class="leaf-top" cx="50" cy="45" rx="8" ry="12" fill="#8BC48B"/>
              </g>
            </svg>
          </div>
        </div>

        <div class="time-display" v-if="showTime">
          <span class="time-value">{{ formattedTime }}</span>
          <span class="time-label">{{ isFocusing ? '正在滋养' : '准备生长' }}</span>
        </div>
      </div>

      <div class="action-buttons">
        <button class="action-btn primary" @click="toggleFocus" :disabled="isTransitioning">
          <span class="btn-icon">{{ isFocusing ? '⏸' : '🌱' }}</span>
          <span class="btn-text">{{ isFocusing ? '暂停' : '种下时间' }}</span>
        </button>
        <button class="action-btn secondary" @click="toggleRestMode">
          <span class="btn-icon">🍃</span>
          <span class="btn-text">{{ isRestMode ? '回来' : '听风' }}</span>
        </button>
      </div>

      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-value">{{ completedSessions }}</span>
          <span class="stat-label">片叶</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ totalMinutes }}</span>
          <span class="stat-label">分钟</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ collectedLeaves }}</span>
          <span class="stat-label">收集</span>
        </div>
      </div>
    </div>

    <div class="sound-toggle" @click="toggleSoundPanel" :class="{ active: soundEnabled }">
      <svg viewBox="0 0 24 24" class="sound-icon">
        <path d="M12 3v18M6 8l6-5v14l-6-5H2V8h4z" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <path v-if="soundEnabled" d="M15 9c1.5 1 2.5 2.5 2.5 4s-1 3-2.5 4M18 6c2.5 1.5 4 4 4 7s-1.5 5.5-4 7" fill="none" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    </div>

    <transition name="fade">
      <div class="sound-panel" v-if="showSoundPanel">
        <div class="sound-panel-header">选择声音</div>
        <div class="sound-options">
          <div
            v-for="sound in sounds"
            :key="sound.id"
            class="sound-option"
            :class="{ active: currentSound === sound.id }"
            @click="selectSound(sound.id)"
          >
            <span class="sound-emoji">{{ sound.emoji }}</span>
            <span class="sound-name">{{ sound.name }}</span>
          </div>
        </div>
        <div class="volume-control">
          <span class="volume-label">音量</span>
          <input type="range" min="0" max="100" v-model="volume" class="volume-slider" />
        </div>
      </div>
    </transition>

    <transition name="ripple">
      <div class="completion-ripple" v-if="showCompletion">
        <div class="ripple-ring" v-for="i in 3" :key="i"></div>
        <div class="completion-text">一片新叶展开了</div>
      </div>
    </transition>

    <div class="settings-toggle" @click="showSettings = true">
      <svg viewBox="0 0 24 24" class="settings-icon">
        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" fill="none" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    </div>

    <transition name="slide-up">
      <div class="settings-panel" v-if="showSettings">
        <div class="settings-header">
          <span class="settings-title">设置</span>
          <button class="close-btn" @click="showSettings = false">×</button>
        </div>
        <div class="settings-content">
          <div class="setting-item">
            <span class="setting-label">专注时长</span>
            <div class="duration-selector">
              <button
                v-for="d in [15, 25, 45, 60]"
                :key="d"
                :class="{ active: focusDuration === d }"
                @click="focusDuration = d"
              >{{ d }}分钟</button>
            </div>
          </div>
          <div class="setting-item">
            <span class="setting-label">小憩时长</span>
            <div class="duration-selector">
              <button
                v-for="d in [5, 10, 15]"
                :key="d"
                :class="{ active: restDuration === d }"
                @click="restDuration = d"
              >{{ d }}分钟</button>
            </div>
          </div>
          <div class="setting-item">
            <span class="setting-label">显示时间</span>
            <label class="toggle-switch">
              <input type="checkbox" v-model="showTime" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="setting-item">
            <span class="setting-label">落叶效果</span>
            <label class="toggle-switch">
              <input type="checkbox" v-model="enableLeaves" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const containerRef = ref(null)
const isFocusing = ref(false)
const isRestMode = ref(false)
const isTransitioning = ref(false)
const showTime = ref(true)
const enableLeaves = ref(true)
const showSettings = ref(false)
const showSoundPanel = ref(false)
const soundEnabled = ref(false)
const showCompletion = ref(false)

const focusDuration = ref(25)
const restDuration = ref(5)
const currentTime = ref(0)
const completedSessions = ref(0)
const totalMinutes = ref(0)
const collectedLeaves = ref(0)
const currentSound = ref('rain')
const volume = ref(50)

const phraseVisible = ref(false)
const currentPhraseIndex = ref(0)

const phrases = [
  '此时此刻，唯有呼吸',
  '慢下来，也是一种前进',
  '种一棵树最好的时间是现在',
  '让时间穿过你，而非追赶时间',
  '一呼一吸，皆是修行',
  '静坐一隅，听风过林',
  '心若沉静，万物皆安',
  '不急不躁，自有归途'
]

const sounds = [
  { id: 'rain', name: '窗外有雨', emoji: '🌧' },
  { id: 'forest', name: '林间风起', emoji: '🌲' },
  { id: 'fire', name: '炉火微明', emoji: '🔥' },
  { id: 'stream', name: '溪水潺潺', emoji: '💧' }
]

const currentPhrase = computed(() => phrases[currentPhraseIndex.value])

const circumference = 2 * Math.PI * 90

const progressOffset = computed(() => {
  const total = isRestMode.value ? restDuration.value * 60 : focusDuration.value * 60
  const progress = currentTime.value / total
  return circumference * (1 - progress)
})

const formattedTime = computed(() => {
  const total = isRestMode.value ? restDuration.value * 60 : focusDuration.value * 60
  const remaining = total - currentTime.value
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

const plantStage = computed(() => {
  const total = focusDuration.value * 60
  const progress = currentTime.value / total
  if (progress < 0.25) return 'seed'
  if (progress < 0.5) return 'sprout'
  if (progress < 0.75) return 'sapling'
  return 'tree'
})

const plantScale = computed(() => {
  const total = focusDuration.value * 60
  const progress = currentTime.value / total
  return 0.8 + progress * 0.4
})

const leaves = ref([])

let timer = null
let leafTimer = null
let phraseTimer = null

function generateLeaf() {
  if (!enableLeaves.value || !isFocusing.value) return
  
  const id = Date.now() + Math.random()
  const startX = Math.random() * 100
  const duration = 8 + Math.random() * 4
  const swayAmount = 20 + Math.random() * 30
  const rotation = Math.random() * 360
  const size = 12 + Math.random() * 8
  
  leaves.value.push({
    id,
    style: {
      left: `${startX}%`,
      top: '-20px',
      '--sway': `${swayAmount}px`,
      '--rotation': `${rotation}deg`,
      '--size': `${size}px`,
      animationDuration: `${duration}s`
    }
  })
  
  setTimeout(() => {
    leaves.value = leaves.value.filter(l => l.id !== id)
  }, duration * 1000)
}

function collectLeaf(leaf) {
  collectedLeaves.value++
  leaves.value = leaves.value.filter(l => l.id !== leaf.id)
}

function toggleFocus() {
  if (isTransitioning.value) return
  
  if (isFocusing.value) {
    clearInterval(timer)
    isFocusing.value = false
    currentTime.value = 0
  } else {
    isFocusing.value = true
    isTransitioning.value = true
    setTimeout(() => {
      isTransitioning.value = false
    }, 500)
    
    timer = setInterval(() => {
      currentTime.value++
      const total = isRestMode.value ? restDuration.value * 60 : focusDuration.value * 60
      
      if (currentTime.value >= total) {
        completeSession()
      }
    }, 1000)
  }
}

function completeSession() {
  clearInterval(timer)
  isFocusing.value = false
  
  if (!isRestMode.value) {
    completedSessions.value++
    totalMinutes.value += focusDuration.value
    showCompletion.value = true
    setTimeout(() => {
      showCompletion.value = false
    }, 3000)
  }
  
  currentTime.value = 0
}

function toggleRestMode() {
  if (isFocusing.value) {
    clearInterval(timer)
    isFocusing.value = false
    currentTime.value = 0
  }
  isRestMode.value = !isRestMode.value
}

function toggleSoundPanel() {
  showSoundPanel.value = !showSoundPanel.value
}

function selectSound(id) {
  currentSound.value = id
  soundEnabled.value = true
}

function rotatePhrase() {
  phraseVisible.value = false
  setTimeout(() => {
    currentPhraseIndex.value = (currentPhraseIndex.value + 1) % phrases.length
    phraseVisible.value = true
  }, 500)
}

onMounted(() => {
  setTimeout(() => {
    phraseVisible.value = true
  }, 800)
  
  phraseTimer = setInterval(rotatePhrase, 8000)
  
  leafTimer = setInterval(generateLeaf, 3000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
  clearInterval(leafTimer)
  clearInterval(phraseTimer)
})
</script>

<style scoped>
.zen-forest {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Noto Serif SC', 'Source Han Serif CN', serif;
  transition: all 1s ease;
}

.background-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.gradient-base {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #F7F5F0 0%, #EDE8E0 50%, #E8E3DB 100%);
  transition: background 1s ease;
}

.zen-forest.rest-mode .gradient-base {
  background: linear-gradient(180deg, #E8E3DB 0%, #D8D3CB 50%, #C8C3BB 100%);
}

.texture-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.forest-mist {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(180deg, transparent 0%, rgba(139, 154, 125, 0.05) 100%);
  pointer-events: none;
}

.falling-leaves {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
}

.leaf {
  position: absolute;
  width: var(--size, 15px);
  height: var(--size, 15px);
  background: linear-gradient(135deg, #8BC48B 0%, #6B8E6B 100%);
  border-radius: 0 50% 50% 50%;
  transform: rotate(var(--rotation, 0deg));
  animation: leafFall linear forwards, leafSway 2s ease-in-out infinite;
  pointer-events: auto;
  cursor: pointer;
  opacity: 0.7;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.leaf:hover {
  transform: rotate(var(--rotation, 0deg)) scale(1.3);
  opacity: 1;
  box-shadow: 0 0 10px rgba(139, 196, 139, 0.5);
}

@keyframes leafFall {
  from {
    top: -20px;
    opacity: 0;
  }
  10% {
    opacity: 0.7;
  }
  to {
    top: 110vh;
    opacity: 0;
  }
}

@keyframes leafSway {
  0%, 100% {
    margin-left: 0;
  }
  50% {
    margin-left: var(--sway, 20px);
  }
}

.content-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
}

.healing-phrase {
  position: absolute;
  top: 12%;
  font-size: 16px;
  font-weight: 300;
  letter-spacing: 4px;
  color: rgba(107, 110, 97, 0.6);
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.8s ease, transform 0.8s ease;
  text-align: center;
  max-width: 80%;
}

.healing-phrase.visible {
  opacity: 1;
  transform: translateY(0);
}

.life-circle-container {
  position: relative;
  width: min(60vw, 360px);
  height: min(60vw, 360px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.life-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.circle-bg {
  fill: none;
  stroke: rgba(139, 154, 125, 0.1);
  stroke-width: 2;
}

.circle-progress {
  fill: none;
  stroke: #8B9A7D;
  stroke-width: 2.5;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}

.circle-glow {
  fill: none;
  stroke: rgba(139, 154, 125, 0.3);
  stroke-width: 8;
  stroke-linecap: round;
  filter: blur(4px);
  transition: stroke-dashoffset 1s linear;
  animation: breatheGlow 10s ease-in-out infinite;
}

@keyframes breatheGlow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.5;
  }
}

.plant-container {
  position: relative;
  width: 50%;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.5s ease;
}

.plant-container.seed .plant-body {
  transform: scale(0.8);
}

.plant-container.sprout .plant-body {
  transform: scale(0.9);
}

.plant-container.sapling .plant-body {
  transform: scale(1);
}

.plant-container.tree .plant-body {
  transform: scale(1.1);
}

.plant-glow {
  position: absolute;
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(139, 196, 139, 0.15) 0%, transparent 70%);
  animation: plantGlow 4s ease-in-out infinite;
}

@keyframes plantGlow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.plant {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plant-svg {
  width: 80%;
  height: 80%;
}

.plant-body {
  transform-origin: center bottom;
  transition: transform 0.5s ease;
}

.stem {
  stroke-dasharray: 50;
  stroke-dashoffset: 0;
  animation: stemGrow 0.5s ease forwards;
}

.leaf-left, .leaf-right, .leaf-top {
  transform-origin: center;
  animation: leafWave 4s ease-in-out infinite;
}

.leaf-left {
  animation-delay: 0s;
}

.leaf-right {
  animation-delay: 0.5s;
}

.leaf-top {
  animation-delay: 1s;
}

@keyframes leafWave {
  0%, 100% {
    transform: rotate(var(--base-rotation, 0deg));
  }
  50% {
    transform: rotate(calc(var(--base-rotation, 0deg) + 3deg));
  }
}

.time-display {
  position: absolute;
  bottom: -60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.time-value {
  font-size: 28px;
  font-weight: 300;
  letter-spacing: 2px;
  color: rgba(107, 110, 97, 0.8);
  font-variant-numeric: tabular-nums;
}

.time-label {
  font-size: 12px;
  letter-spacing: 3px;
  color: rgba(107, 110, 97, 0.5);
}

.action-buttons {
  display: flex;
  gap: 20px;
  margin-top: 80px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  min-width: 120px;
}

.action-btn.primary {
  background: linear-gradient(135deg, rgba(139, 154, 125, 0.2) 0%, rgba(139, 154, 125, 0.1) 100%);
  color: #6B7A5D;
  box-shadow: 0 4px 20px rgba(139, 154, 125, 0.15);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(139, 154, 125, 0.25);
  background: linear-gradient(135deg, rgba(139, 154, 125, 0.3) 0%, rgba(139, 154, 125, 0.15) 100%);
}

.action-btn.primary:active {
  transform: translateY(0);
}

.action-btn.secondary {
  background: rgba(200, 195, 187, 0.2);
  color: #8B8578;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.action-btn.secondary:hover {
  transform: translateY(-2px);
  background: rgba(200, 195, 187, 0.3);
}

.btn-icon {
  font-size: 20px;
}

.btn-text {
  font-size: 13px;
  letter-spacing: 2px;
  font-weight: 400;
}

.stats-bar {
  position: absolute;
  bottom: 40px;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 28px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.03);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 20px;
  font-weight: 500;
  color: #6B7A5D;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 11px;
  letter-spacing: 1px;
  color: rgba(107, 110, 97, 0.6);
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(139, 154, 125, 0.2);
}

.sound-toggle {
  position: absolute;
  top: 30px;
  right: 30px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 20;
}

.sound-toggle:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: scale(1.05);
}

.sound-toggle.active {
  background: rgba(139, 154, 125, 0.2);
}

.sound-icon {
  width: 20px;
  height: 20px;
  color: #6B7A5D;
}

.sound-panel {
  position: absolute;
  top: 85px;
  right: 30px;
  width: 200px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  z-index: 20;
}

.sound-panel-header {
  font-size: 13px;
  font-weight: 500;
  color: #6B7A5D;
  margin-bottom: 16px;
  letter-spacing: 1px;
}

.sound-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.sound-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sound-option:hover {
  background: rgba(139, 154, 125, 0.1);
}

.sound-option.active {
  background: rgba(139, 154, 125, 0.2);
}

.sound-emoji {
  font-size: 18px;
}

.sound-name {
  font-size: 13px;
  color: #6B7A5D;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.volume-label {
  font-size: 12px;
  color: rgba(107, 110, 97, 0.6);
}

.volume-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(139, 154, 125, 0.2);
  border-radius: 2px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: #8B9A7D;
  border-radius: 50%;
  cursor: pointer;
}

.completion-ripple {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  pointer-events: none;
}

.ripple-ring {
  position: absolute;
  width: 200px;
  height: 200px;
  border: 2px solid rgba(139, 154, 125, 0.5);
  border-radius: 50%;
  animation: rippleExpand 2s ease-out forwards;
}

.ripple-ring:nth-child(2) {
  animation-delay: 0.3s;
}

.ripple-ring:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes rippleExpand {
  from {
    transform: scale(0.5);
    opacity: 1;
  }
  to {
    transform: scale(3);
    opacity: 0;
  }
}

.completion-text {
  font-size: 18px;
  color: #6B7A5D;
  letter-spacing: 3px;
  animation: fadeInUp 1s ease forwards;
  animation-delay: 0.5s;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-toggle {
  position: absolute;
  top: 30px;
  left: 30px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 20;
}

.settings-toggle:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: rotate(30deg);
}

.settings-icon {
  width: 18px;
  height: 18px;
  color: #6B7A5D;
}

.settings-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px 24px 0 0;
  padding: 24px;
  z-index: 100;
  max-height: 60vh;
  overflow-y: auto;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.settings-title {
  font-size: 18px;
  font-weight: 500;
  color: #6B7A5D;
  letter-spacing: 2px;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 154, 125, 0.1);
  border: none;
  border-radius: 50%;
  font-size: 20px;
  color: #6B7A5D;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(139, 154, 125, 0.2);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-label {
  font-size: 14px;
  color: #6B7A5D;
  letter-spacing: 1px;
}

.duration-selector {
  display: flex;
  gap: 8px;
}

.duration-selector button {
  padding: 8px 14px;
  border: 1px solid rgba(139, 154, 125, 0.3);
  background: transparent;
  border-radius: 20px;
  font-size: 12px;
  color: #6B7A5D;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.duration-selector button:hover {
  background: rgba(139, 154, 125, 0.1);
}

.duration-selector button.active {
  background: rgba(139, 154, 125, 0.2);
  border-color: #8B9A7D;
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: rgba(139, 154, 125, 0.2);
  border-radius: 26px;
  transition: all 0.3s ease;
}

.toggle-slider::before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.toggle-switch input:checked + .toggle-slider {
  background: #8B9A7D;
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(22px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.ripple-enter-active,
.ripple-leave-active {
  transition: opacity 0.5s ease;
}

.ripple-enter-from,
.ripple-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
