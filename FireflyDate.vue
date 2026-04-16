<!-- 萤火 - 萤火虫浪漫约会页面，含跟随交互和祝福语动效 -->
<template>
  <div class="firefly-date" @mousemove="onMouseMove" @touchmove="onTouchMove" @click="onClickRipple" ref="containerRef">
    <canvas ref="starCanvas" class="star-canvas"></canvas>
    <div class="abyss-layer"></div>
    <div class="nebula-layer"></div>

    <div class="background-fireflies">
      <div
        v-for="bf in bgFireflies"
        :key="bf.id"
        class="bg-firefly"
        :style="bf.style"
      ></div>
    </div>

    <div
      v-if="blessingVisible"
      class="blessing-firefly"
      :style="blessingStyle"
    >
      <span class="blessing-text">{{ blessingText }}</span>
    </div>

    <div
      class="main-firefly"
      :class="{ 'is-following': isFollowing, 'is-holding': isHolding, 'is-sleeping': isSleeping }"
      :style="mainFireflyStyle"
      @mousedown="onHoldStart"
      @mouseup="onHoldEnd"
      @mouseleave="onHoldEnd"
      @touchstart.prevent="onHoldStart"
      @touchend.prevent="onHoldEnd"
    >
      <div class="firefly-core"></div>
      <div class="firefly-glow-inner"></div>
      <div class="firefly-glow-outer"></div>
      <div class="firefly-glow-ambient"></div>
      <div v-if="showPulseRing" class="pulse-ring"></div>
    </div>

    <div class="particle-trail">
      <div
        v-for="(p, idx) in trailParticles"
        :key="'trail-' + idx"
        class="trail-particle"
        :style="p.style"
      ></div>
    </div>

    <transition name="light-trail">
      <div v-if="lightTrailActive" class="light-trail" :style="lightTrailStyle"></div>
    </transition>

    <div class="message-area" :class="{ visible: messageVisible }">
      <transition name="message-fade">
        <p v-if="currentMessage" class="glow-text">{{ currentMessage }}</p>
      </transition>
    </div>

    <div class="control-bar" :class="{ visible: controlsVisible, 'sleep-mode': isSleeping }">
      <button class="ctrl-btn mic-btn" :class="{ active: isListening }" @click="toggleListen" title="轻声说话">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
          <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
          <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
        </svg>
        <span v-if="isListening" class="mic-pulse"></span>
      </button>

      <button class="ctrl-btn sleep-btn" @click="openSleepPanel" title="入睡时间">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </button>

      <button class="ctrl-btn settings-btn" @click="toggleSettings" title="设置">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      </button>
    </div>

    <transition name="panel-fade">
      <div v-if="showSleepPanel" class="modal-overlay" @click="closeSleepPanel">
        <div class="glass-panel sleep-panel" @click.stop>
          <h3>设定入睡时间</h3>
          <div class="time-picker">
            <input type="number" v-model.number="sleepHour" min="0" max="23" class="time-input" />
            <span class="time-sep">:</span>
            <input type="number" v-model.number="sleepMinute" min="0" max="59" class="time-input" />
          </div>
          <p class="panel-hint">届时我会陪你慢慢变暗</p>
          <button class="glass-confirm" @click="confirmSleepTime">确认</button>
        </div>
      </div>
    </transition>

    <transition name="panel-fade">
      <div v-if="showSettingsPanel" class="modal-overlay" @click="closeSettings">
        <div class="glass-panel settings-panel" @click.stop>
          <h3>设置</h3>
          <div class="setting-row">
            <span>光晕强度</span>
            <input type="range" min="50" max="150" v-model.number="glowIntensity" class="range-slider" />
          </div>
          <div class="setting-row">
            <span>萤火虫数量</span>
            <input type="range" min="3" max="15" v-model.number="bgFireflyCount" class="range-slider" />
          </div>
          <button class="glass-confirm" @click="closeSettings">完成</button>
        </div>
      </div>
    </transition>

    <transition name="welcome-enter">
      <div v-if="showWelcome" class="welcome-text">我在</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const containerRef = ref(null)
const starCanvas = ref(null)

const showWelcome = ref(false)
const controlsVisible = ref(false)
const messageVisible = ref(false)
const currentMessage = ref('')
const lightTrailActive = ref(false)
const lightTrailStyle = ref({})
const showPulseRing = ref(false)

const mainX = ref(0)
const mainY = ref(0)
const targetX = ref(0)
const targetY = ref(0)
const isFollowing = ref(false)
const isHolding = ref(false)
const isListening = ref(false)
const isSleeping = ref(false)

const glowIntensity = ref(100)
const bgFireflyCount = ref(8)
const sleepHour = ref(22)
const sleepMinute = ref(30)
const showSleepPanel = ref(false)
const showSettingsPanel = ref(false)

const bgFireflies = ref([])
let bfIdCounter = 0

const trailParticles = ref([])
let trailIdCounter = 0

const blessingVisible = ref(false)
const blessingText = ref('好梦')
const blessingStyle = ref({})

const messages = [
  '我在',
  '今晚的夜很安静',
  '你还好吗',
  '慢慢来',
  '我会一直亮着',
  '闭上眼睛试试',
  '听，风的声音',
  '星星也在看着我们'
]
let messageIndex = 0

function initBgFireflies() {
  bgFireflies.value = []
  for (let i = 0; i < bgFireflyCount.value; i++) {
    createBgFirefly()
  }
}

function createBgFirefly() {
  const id = ++bfIdCounter
  const x = Math.random() * 100
  const y = Math.random() * 70 + 5
  const size = 2 + Math.random() * 3
  const duration = 15 + Math.random() * 20
  const delay = Math.random() * -20
  const hue = Math.random() > 0.6 ? 150 : 195
  
  bgFireflies.value.push({
    id,
    style: {
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      '--bf-duration': `${duration}s`,
      '--bf-delay': `${delay}s`,
      '--bf-hue': hue,
      opacity: 0
    }
  })
  
  setTimeout(() => {
    const f = bgFireflies.value.find(b => b.id === id)
    if (f) f.style.opacity = 1
  }, 800 + Math.random() * 1200)
}

function onMouseMove(e) {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  targetX.value = e.clientX - rect.left
  targetY.value = e.clientY - rect.top
  isFollowing.value = true
  
  if (Math.random() < 0.15) addTrailParticle(targetX.value, targetY.value)
}

function onTouchMove(e) {
  if (!containerRef.value || !e.touches[0]) return
  const rect = containerRef.value.getBoundingClientRect()
  targetX.value = e.touches[0].clientX - rect.left
  targetY.value = e.touches[0].clientY - rect.top
  isFollowing.value = true
  
  if (Math.random() < 0.12) addTrailParticle(targetX.value, targetY.value)
}

function onClickRipple(e) {
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  const ripple = document.createElement('div')
  ripple.className = 'click-ripple'
  ripple.style.cssText = `left:${x}px;top:${y}px`
  containerRef.value?.appendChild(ripple)
  setTimeout(() => ripple.remove(), 1200)
}

function addTrailParticle(x, y) {
  const id = ++trailIdCounter
  const size = 2 + Math.random() * 3
  trailParticles.value.push({
    id,
    style: {
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`
    }
  })
  
  setTimeout(() => {
    trailParticles.value = trailParticles.value.filter(p => p.id !== id)
  }, 500)
}

let holdTimer = null
function onHoldStart() {
  holdTimer = setTimeout(() => {
    isHolding.value = true
    showPulseRing.value = true
    triggerMessage()
  }, 500)
}

function onHoldEnd() {
  if (holdTimer) {
    clearTimeout(holdTimer)
    holdTimer = null
  }
  isHolding.value = false
  showPulseRing.value = false
}

let lerpFrame = null
function animateLerp() {
  const ease = 0.08
  mainX.value += (targetX.value - mainX.value) * ease
  mainY.value += (targetY.value - mainY.value) * ease
  
  lerpFrame = requestAnimationFrame(animateLerp)
}

function toggleListen() {
  isListening.value = !isListening.value
  if (isListening.value) {
    showPulseRing.value = true
    setTimeout(() => {
      triggerMessage()
    }, 600)
  } else {
    showPulseRing.value = false
  }
}

function openSleepPanel() {
  showSleepPanel.value = true
}

function closeSleepPanel() {
  showSleepPanel.value = false
}

function confirmSleepTime() {
  showSleepPanel.value = false
  isSleeping.value = true
}

function toggleSettings() {
  showSettingsPanel.value = !showSettingsPanel.value
}

function closeSettings() {
  showSettingsPanel.value = false
  nextTick(() => initBgFireflies())
}

function triggerMessage() {
  lightTrailActive.value = true
  const rect = containerRef.value?.getBoundingClientRect()
  if (rect) {
    lightTrailStyle.value = {
      left: `${mainX.value}px`,
      top: `${mainY.value}px`
    }
  }
  
  setTimeout(() => {
    lightTrailActive.value = false
    currentMessage.value = messages[messageIndex % messages.length]
    messageIndex++
    messageVisible.value = true
    
    setTimeout(() => {
      messageVisible.value = false
      setTimeout(() => {
        currentMessage.value = ''
      }, 600)
    }, 4000)
  }, 500)
}

function spawnBlessing() {
  const blessings = ['好梦', '晚安', '安睡', '好梦', '晚安']
  blessingText.value = blessings[Math.floor(Math.random() * blessings.length)]
  
  const fromLeft = Math.random() > 0.5
  blessingStyle.value = {
    '--start-x': fromLeft ? '-60px' : 'calc(100% + 60px)',
    '--end-x': fromLeft ? 'calc(100% + 60px)' : '-60px',
    '--arc-y': `${15 + Math.random() * 40}%`
  }
  blessingVisible.value = true
  
  setTimeout(() => {
    blessingVisible.value = false
  }, 3500)
}

let starCtx = null
let stars = []
function initStars() {
  const canvas = starCanvas.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  starCtx = canvas.getContext('2d')
  
  stars = []
  for (let i = 0; i < 80; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.75,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.4 + 0.05,
      twinkleSpeed: 2000 + Math.random() * 6000,
      twinkleOffset: Math.random() * 10000
    })
  }
  
  drawStars()
}

function drawStars() {
  if (!starCtx || !starCanvas.value) return
  starCtx.clearRect(0, 0, starCanvas.value.width, starCanvas.value.height)
  
  const now = Date.now()
  stars.forEach(s => {
    const twinkle = Math.sin((now + s.twinkleOffset) / s.twinkleSpeed * Math.PI * 2) * 0.5 + 0.5
    const alpha = s.alpha * (0.3 + twinkle * 0.7)
    
    starCtx.beginPath()
    starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    starCtx.fillStyle = `rgba(180, 200, 255, ${alpha})`
    starCtx.fill()
  })
  
  requestAnimationFrame(drawStars)
}

onMounted(() => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    mainX.value = rect.width / 2
    mainY.value = rect.height * 0.45
    targetX.value = mainX.value
    targetY.value = mainY.value
  }
  
  setTimeout(() => showWelcome.value = true, 2500)
  setTimeout(() => controlsVisible.value = true, 2000)
  
  initBgFireflies()
  initStars()
  animateLerp()
  
  setInterval(() => {
    if (!isSleeping.value && Math.random() < 0.25) {
      spawnBlessing()
    }
  }, 50000)
  
  window.addEventListener('resize', () => {
    if (starCanvas.value) {
      starCanvas.value.width = window.innerWidth
      starCanvas.value.height = window.innerHeight
    }
    initStars()
  })
})

onUnmounted(() => {
  if (lerpFrame) cancelAnimationFrame(lerpFrame)
})

const mainFireflyStyle = computed(() => ({
  left: `${mainX.value}px`,
  top: `${mainY.value}px`,
  '--glow-scale': glowIntensity.value / 100
}))
</script>

<style scoped>
.firefly-date {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000000;
  cursor: default;
  font-family: 'Georgia', 'Source Han Serif CN', 'Noto Serif SC', serif;
  user-select: none;
}

.star-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.abyss-layer {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 45%, #0a0e1a 0%, #050810 40%, #000000 70%);
  z-index: 0;
}

.nebula-layer {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(30, 60, 114, 0.04) 0%, transparent 45%),
    radial-gradient(ellipse at 80% 60%, rgba(75, 30, 90, 0.03) 0%, transparent 40%),
    radial-gradient(ellipse at 50% 85%, rgba(57, 255, 20, 0.015) 0%, transparent 35%);
  z-index: 1;
  pointer-events: none;
}

.background-fireflies {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

.bg-firefly {
  position: absolute;
  border-radius: 50%;
  background: hsl(var(--bf-hue), 100%, 60%);
  box-shadow: 0 0 6px hsl(var(--bf-hue), 100%, 55%), 0 0 18px hsla(var(--bf-hue), 100%, 55%, 0.25);
  opacity: 0;
  transition: opacity 2s ease;
  animation: bfFloat var(--bf-duration) ease-in-out infinite var(--bf-delay);
  will-change: transform, opacity;
}

@keyframes bfFloat {
  0%, 100% {
    transform: translate(0, 0);
    opacity: 0.18;
  }
  15% {
    transform: translate(25px, -18px);
    opacity: 0.32;
  }
  35% {
    transform: translate(-15px, 22px);
    opacity: 0.15;
  }
  55% {
    transform: translate(30px, 10px);
    opacity: 0.28;
  }
  75% {
    transform: translate(-20px, -15px);
    opacity: 0.2;
  }
}

.blessing-firefly {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 6;
  animation: blessingFly 3s ease-in-out forwards;
  pointer-events: none;
}

.blessing-text {
  color: #ffb347;
  font-size: 0.78rem;
  letter-spacing: 0.3em;
  text-shadow: 0 0 12px rgba(255, 179, 71, 0.6), 0 0 28px rgba(255, 179, 71, 0.25);
  white-space: nowrap;
  opacity: 0;
  animation: blessingFade 3s ease-in-out forwards;
}

@keyframes blessingFly {
  0% {
    transform: translate(var(--start-x), calc(var(--arc-y) - 30px));
  }
  50% {
    transform: translate(calc(var(--start-x) + var(--end-x)) / 2, calc(var(--arc-y) - 80px));
  }
  100% {
    transform: translate(var(--end-x), calc(var(--arc-y) - 20px));
  }
}

@keyframes blessingFade {
  0%, 15% { opacity: 0; }
  30% { opacity: 0.7; }
  70% { opacity: 0.5; }
  100% { opacity: 0; }
}

.main-firefly {
  position: absolute;
  width: 16px;
  height: 16px;
  margin-left: -8px;
  margin-top: -8px;
  z-index: 10;
  transition: left 0.08s linear, top 0.08s linear;
  pointer-events: auto;
  cursor: grab;
}

.main-firefly:active {
  cursor: grabbing;
}

.firefly-core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  border-radius: 50%;
  background: #39ff14;
  box-shadow: 0 0 8px #39ff14, 0 0 20px rgba(57, 255, 20, 0.6);
  animation: coreBreath 3s ease-in-out infinite;
}

.firefly-glow-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  margin: -20px 0 0 -20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(57, 255, 20, 0.35) 0%, rgba(57, 255, 20, 0.08) 50%, transparent 70%);
  animation: innerGlow 3s ease-in-out infinite;
  transform: scale(var(--glow-scale, 1));
}

.firefly-glow-outer {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 80px;
  margin: -40px 0 0 -40px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(57, 255, 20, 0.12) 0%, rgba(57, 255, 20, 0.03) 40%, transparent 65%);
  animation: outerGlow 3s ease-in-out infinite;
  transform: scale(var(--glow-scale, 1));
}

.firefly-glow-ambient {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 160px;
  height: 160px;
  margin: -80px 0 0 -80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(57, 255, 20, 0.04) 0%, transparent 55%);
  animation: ambientGlow 4s ease-in-out infinite;
  transform: scale(var(--glow-scale, 1));
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border: 1.5px solid rgba(57, 255, 20, 0.5);
  border-radius: 50%;
  animation: pulseExpand 1.2s ease-out infinite;
}

.is-sleeping .firefly-core {
  background: #1a3a0e;
  box-shadow: 0 0 4px rgba(57, 255, 20, 0.2);
  animation: sleepCore 6s ease-in-out infinite;
}

.is-sleeping .firefly-glow-inner,
.is-sleeping .firefly-glow-outer,
.is-sleeping .firefly-glow-ambient {
  opacity: 0.2;
  animation: sleepGlow 8s ease-in-out infinite;
}

@keyframes coreBreath {
  0%, 100% { 
    opacity: 0.75; 
    transform: scale(1); 
    box-shadow: 0 0 8px #39ff14, 0 0 20px rgba(57, 255, 20, 0.5); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.12); 
    box-shadow: 0 0 12px #39ff14, 0 0 32px rgba(57, 255, 20, 0.7); 
  }
}

@keyframes innerGlow {
  0%, 100% { opacity: 0.7; transform: scale(calc(0.95 * var(--glow-scale, 1))); }
  50% { opacity: 1; transform: scale(calc(1.1 * var(--glow-scale, 1))); }
}

@keyframes outerGlow {
  0%, 100% { opacity: 0.5; transform: scale(calc(0.92 * var(--glow-scale, 1))); }
  50% { opacity: 0.9; transform: scale(calc(1.08 * var(--glow-scale, 1))); }
}

@keyframes ambientGlow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

@keyframes pulseExpand {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  100% {
    transform: scale(5);
    opacity: 0;
  }
}

@keyframes sleepCore {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 0.5; transform: scale(0.9); }
}

@keyframes sleepGlow {
  0%, 100% { opacity: 0.08; }
  50% { opacity: 0.15; }
}

.particle-trail {
  position: absolute;
  inset: 0;
  z-index: 9;
  pointer-events: none;
}

.trail-particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(57, 255, 20, 0.5);
  box-shadow: 0 0 4px rgba(57, 255, 20, 0.3);
  animation: trailFade 500ms ease-out forwards;
  pointer-events: none;
}

@keyframes trailFade {
  0% {
    opacity: 0.7;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.2);
  }
}

.light-trail {
  position: absolute;
  width: 3px;
  height: 3px;
  margin-left: -1.5px;
  margin-top: -1.5px;
  border-radius: 50%;
  background: #39ff14;
  box-shadow: 0 0 12px #39ff14, 0 0 28px rgba(57, 255, 20, 0.5);
  z-index: 11;
  pointer-events: none;
  animation: lightShoot 450ms ease-out forwards;
}

@keyframes lightShoot {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-140px) scale(0.3);
  }
}

.message-area {
  position: absolute;
  bottom: 110px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 12;
  min-width: 200px;
}

.glow-text {
  font-size: 1.05rem;
  letter-spacing: 0.25em;
  color: rgba(57, 255, 20, 0.85);
  text-shadow:
    0 0 8px rgba(57, 255, 20, 0.6),
    0 0 20px rgba(57, 255, 20, 0.3),
    0 0 40px rgba(57, 255, 20, 0.12);
  font-weight: 300;
  line-height: 1.8;
}

.message-fade-enter-active {
  transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.message-fade-leave-active {
  transition: all 0.6s ease;
}
.message-fade-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.94);
  filter: blur(4px);
}
.message-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  filter: blur(2px);
}

.control-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 36px;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  z-index: 20;
  opacity: 0;
  transition: opacity 1s ease;
}

.control-bar.visible {
  opacity: 1;
}

.ctrl-btn {
  position: relative;
  width: 38px;
  height: 38px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: rgba(255, 255, 255, 0.18);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.35s ease;
}

.ctrl-btn svg {
  width: 20px;
  height: 20px;
}

.ctrl-btn:hover {
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.04);
}

.ctrl-btn.active {
  color: rgba(57, 255, 20, 0.7);
}

.mic-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid rgba(57, 255, 20, 0.3);
  animation: micPulseAnim 1.5s ease-out infinite;
}

@keyframes micPulseAnim {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.glass-panel {
  background: rgba(10, 14, 26, 0.85);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(57, 255, 20, 0.1);
  border-radius: 18px;
  padding: 32px 36px;
  min-width: 280px;
  text-align: center;
}

.glass-panel h3 {
  font-size: 1rem;
  color: rgba(57, 255, 20, 0.7);
  letter-spacing: 0.15em;
  font-weight: 400;
  margin-bottom: 24px;
}

.time-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.time-input {
  width: 56px;
  padding: 8px 4px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(57, 255, 20, 0.15);
  border-radius: 8px;
  color: rgba(57, 255, 20, 0.8);
  font-size: 1.2rem;
  text-align: center;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.time-input:focus {
  border-color: rgba(57, 255, 20, 0.4);
}

.time-sep {
  color: rgba(57, 255, 20, 0.4);
  font-size: 1.2rem;
}

.panel-hint {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.25);
  margin-bottom: 20px;
  letter-spacing: 0.05em;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
}

.setting-row span {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
  white-space: nowrap;
}

.range-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 3px;
  background: rgba(57, 255, 20, 0.15);
  border-radius: 2px;
  outline: none;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(57, 255, 20, 0.6);
  cursor: pointer;
  transition: background 0.2s;
}

.range-slider::-webkit-slider-thumb:hover {
  background: rgba(57, 255, 20, 0.9);
}

.glass-confirm {
  padding: 10px 32px;
  background: rgba(57, 255, 20, 0.12);
  border: 1px solid rgba(57, 255, 20, 0.2);
  border-radius: 20px;
  color: rgba(57, 255, 20, 0.75);
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s ease;
}

.glass-confirm:hover {
  background: rgba(57, 255, 20, 0.2);
  border-color: rgba(57, 255, 20, 0.35);
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: all 0.35s ease;
}
.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(10px);
}

.welcome-text {
  position: absolute;
  bottom: 130px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.3rem;
  color: rgba(57, 255, 20, 0.5);
  letter-spacing: 0.5em;
  text-shadow: 0 0 16px rgba(57, 255, 20, 0.3);
  z-index: 15;
  pointer-events: none;
}

.welcome-enter-active {
  transition: all 1.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.welcome-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
  filter: blur(6px);
}

.click-ripple {
  position: absolute;
  width: 8px;
  height: 8px;
  margin: -4px 0 0 -4px;
  border-radius: 50%;
  border: 1px solid rgba(57, 255, 20, 0.25);
  animation: rippleSpread 1.2s ease-out forwards;
  pointer-events: none;
  z-index: 8;
}

@keyframes rippleSpread {
  0% {
    width: 8px;
    height: 8px;
    opacity: 0.5;
  }
  100% {
    width: 120px;
    height: 120px;
    margin: -60px 0 0 -60px;
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .control-bar {
    height: 58px;
    padding: 0 24px;
  }

  .ctrl-btn {
    width: 34px;
    height: 34px;
  }

  .ctrl-btn svg {
    width: 18px;
    height: 18px;
  }

  .glow-text {
    font-size: 0.92rem;
  }

  .message-area {
    bottom: 96px;
  }

  .welcome-text {
    font-size: 1.1rem;
    bottom: 116px;
  }

  .glass-panel {
    padding: 24px 28px;
    min-width: 240px;
  }
}
</style>
