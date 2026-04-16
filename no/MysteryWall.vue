<!-- 情绪气泡 - 情感交互页面，含心跳波形、情绪选择器和AI回复 -->
<template>
  <div class="emotion-container" @touchstart="onTouchStart" @touchend="onTouchEnd" @touchmove="onTouchMove">
    <div class="ambient-background"></div>
    <div class="long-press-glow" :class="{ active: isLongPressing }"></div>

    <div class="emotion-bubbles">
      <div
        v-for="(bubble, index) in emotionBubbles"
        :key="index"
        class="bubble"
        :class="{ hovered: bubble.hovered }"
        :style="bubbleStyle(bubble, index)"
        @click="onBubbleClick(bubble, index)"
        @mouseenter="bubble.hovered = true"
        @mouseleave="bubble.hovered = false"
      >
        <span class="bubble-emoji">{{ bubble.emoji }}</span>
        <div class="bubble-shine"></div>
      </div>
    </div>

    <div class="heartbeat-wrapper">
      <div class="heartbeat-glow"></div>
      <canvas ref="heartbeatCanvas" class="heartbeat-canvas"></canvas>
    </div>

    <transition name="note-fade">
      <div v-if="aiNote" class="handwritten-note" :style="noteStyle">
        <div class="note-paper">
          <div class="note-text">{{ aiNote }}</div>
          <div class="note-decoration"></div>
        </div>
      </div>
    </transition>

    <div class="input-area">
      <div class="input-wrapper">
        <textarea
          v-model="userInput"
          class="emotion-input"
          placeholder="说点什么吧，我在听"
          @keydown.enter.prevent="sendMessage"
          rows="1"
        ></textarea>
        <button class="send-btn" @click="sendMessage" :disabled="!userInput.trim()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="hint-text" v-if="!hasInteracted">长按屏幕，让我感受你的存在</div>
    </div>

    <div class="particles-container">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="particleStyle(particle)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'

const heartbeatCanvas = ref(null)
const userInput = ref('')
const aiNote = ref('')
const isLongPressing = ref(false)
const hasInteracted = ref(false)
const particles = ref([])
const currentEmotion = ref('calm')

let ctx = null
let animationId = null
let longPressTimer = null
let waveOffset = 0
let targetBpm = 60
let currentBpm = 60
let targetAmplitude = 40
let currentAmplitude = 40

const emotionBubbles = reactive([
  { emoji: '💫', emotion: 'calm', label: '平静', hovered: false },
  { emoji: '🌸', emotion: 'happy', label: '开心', hovered: false },
  { emoji: '🌧', emotion: 'sad', label: '难过', hovered: false },
  { emoji: '⚡', emotion: 'anxious', label: '焦虑', hovered: false },
  { emoji: '🌙', emotion: 'tired', label: '疲惫', hovered: false }
])

const emotionConfig = {
  calm: { bpm: 60, amplitude: 40, color: '#FFB366' },
  happy: { bpm: 75, amplitude: 50, color: '#FFD700' },
  sad: { bpm: 50, amplitude: 30, color: '#B8A9C9' },
  anxious: { bpm: 90, amplitude: 60, color: '#C77DFF' },
  tired: { bpm: 45, amplitude: 25, color: '#FFB3BA' }
}

const aiResponses = {
  '累': '累的时候就躺下吧，\n我帮你守着这一刻。',
  '难过': '难过也没关系，\n我会一直陪着你。',
  '开心': '真好，\n让这份快乐多停留一会儿。',
  '焦虑': '深呼吸，\n这一刻你是安全的。',
  '孤独': '你并不孤单，\n我一直在这里。',
  '谢谢': '不用谢，\n我只是想陪着你。',
  '哭': '那就让眼泪慢慢来，\n不用急。',
  '理解': '我也许不能完全懂，\n但我会一直在这里。',
  'default': '我在听，\n你可以慢慢说。'
}

const noteStyle = computed(() => ({
  transform: `rotate(${Math.random() * 4 - 2}deg)`
}))

function bubbleStyle(bubble, index) {
  const positions = [
    { x: 15, y: 20 },
    { x: 80, y: 15 },
    { x: 10, y: 65 },
    { x: 85, y: 60 },
    { x: 50, y: 75 }
  ]
  const pos = positions[index] || { x: 50, y: 50 }
  return {
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    animationDelay: `${index * 0.3}s`
  }
}

function particleStyle(particle) {
  return {
    left: `${particle.x}px`,
    top: `${particle.y}px`,
    width: `${particle.size}px`,
    height: `${particle.size}px`,
    background: particle.color,
    opacity: particle.opacity,
    transform: `translate(${particle.vx * particle.progress}px, ${particle.vy * particle.progress}px) scale(${1 - particle.progress})`
  }
}

function initCanvas() {
  const canvas = heartbeatCanvas.value
  if (!canvas) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
}

function drawHeartbeat() {
  if (!ctx) return

  const canvas = heartbeatCanvas.value
  const width = canvas.getBoundingClientRect().width
  const height = canvas.getBoundingClientRect().height

  ctx.clearRect(0, 0, width, height)

  currentBpm += (targetBpm - currentBpm) * 0.02
  currentAmplitude += (targetAmplitude - currentAmplitude) * 0.02

  const frequency = currentBpm / 60
  const centerY = height / 2
  const config = emotionConfig[currentEmotion.value]

  const gradient = ctx.createLinearGradient(0, 0, width, 0)
  gradient.addColorStop(0, config.color)
  gradient.addColorStop(0.5, '#FFB6C1')
  gradient.addColorStop(1, config.color)

  ctx.strokeStyle = gradient
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowColor = config.color
  ctx.shadowBlur = 20

  ctx.beginPath()

  for (let x = 0; x < width; x++) {
    const normalizedX = (x + waveOffset) / 50
    let y = centerY

    const wavePhase = normalizedX * frequency * 0.5
    const mainWave = Math.sin(wavePhase) * currentAmplitude

    const heartbeatPattern = Math.sin(normalizedX * frequency * 2) > 0.7 
      ? Math.sin(normalizedX * frequency * 8) * currentAmplitude * 0.8 
      : 0

    y = centerY + mainWave + heartbeatPattern

    if (x === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.stroke()
  ctx.shadowBlur = 0

  waveOffset += 2

  animationId = requestAnimationFrame(drawHeartbeat)
}

function onBubbleClick(bubble, index) {
  hasInteracted.value = true
  currentEmotion.value = bubble.emotion

  const config = emotionConfig[bubble.emotion]
  targetBpm = config.bpm
  targetAmplitude = config.amplitude

  createParticles(bubble, index)
}

function createParticles(bubble, index) {
  const bubbleEl = document.querySelectorAll('.bubble')[index]
  if (!bubbleEl) return

  const rect = bubbleEl.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 20
    const speed = 50 + Math.random() * 100
    const particle = {
      id: Date.now() + i,
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 6,
      color: emotionConfig[bubble.emotion].color,
      opacity: 1,
      progress: 0
    }
    particles.value.push(particle)

    animateParticle(particle)
  }
}

function animateParticle(particle) {
  const startTime = Date.now()
  const duration = 2000

  function update() {
    const elapsed = Date.now() - startTime
    particle.progress = Math.min(elapsed / duration, 1)
    particle.opacity = 1 - particle.progress

    if (particle.progress < 1) {
      requestAnimationFrame(update)
    } else {
      particles.value = particles.value.filter(p => p.id !== particle.id)
    }
  }

  requestAnimationFrame(update)
}

function onTouchStart(e) {
  longPressTimer = setTimeout(() => {
    isLongPressing.value = true
    hasInteracted.value = true
    targetBpm = 80
    targetAmplitude = 55
  }, 500)
}

function onTouchEnd() {
  clearTimeout(longPressTimer)
  if (isLongPressing.value) {
    isLongPressing.value = false
    targetBpm = emotionConfig[currentEmotion.value].bpm
    targetAmplitude = emotionConfig[currentEmotion.value].amplitude
  }
}

function onTouchMove() {
  clearTimeout(longPressTimer)
  isLongPressing.value = false
}

function sendMessage() {
  if (!userInput.value.trim()) return

  hasInteracted.value = true

  const input = userInput.value.toLowerCase()
  let response = aiResponses.default

  for (const keyword in aiResponses) {
    if (input.includes(keyword)) {
      response = aiResponses[keyword]
      break
    }
  }

  aiNote.value = response
  userInput.value = ''

  setTimeout(() => {
    aiNote.value = ''
  }, 5000)
}

onMounted(() => {
  nextTick(() => {
    initCanvas()
    drawHeartbeat()
  })

  window.addEventListener('resize', initCanvas)
})

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', initCanvas)
  clearTimeout(longPressTimer)
})
</script>

<style scoped>
.emotion-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Inter', 'Noto Sans SC', system-ui, sans-serif;
}

.ambient-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE4CC 50%, #FFDAB3 100%);
  z-index: 1;
}

.long-press-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(255, 179, 102, 0.4) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
  z-index: 2;
}

.long-press-glow.active {
  opacity: 1;
  animation: breatheGlow 2s ease-in-out infinite;
}

@keyframes breatheGlow {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  50% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
}

.emotion-bubbles {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}

.bubble {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 
    0 8px 32px rgba(255, 179, 102, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
  animation: bubbleFloat 4s ease-in-out infinite;
}

.bubble::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.bubble:hover::before {
  opacity: 1;
}

.bubble:hover {
  transform: scale(1.15);
  box-shadow: 
    0 12px 40px rgba(255, 179, 102, 0.25),
    inset 0 0 30px rgba(255, 255, 255, 0.4);
}

.bubble.hovered {
  transform: scale(1.2);
}

@keyframes bubbleFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.bubble-emoji {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.bubble-shine {
  position: absolute;
  top: 5px;
  left: 5px;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
  border-radius: 50%;
}

.heartbeat-wrapper {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(80vw, 500px);
  height: 200px;
  z-index: 15;
}

.heartbeat-glow {
  position: absolute;
  inset: -50px;
  background: radial-gradient(ellipse, rgba(255, 179, 102, 0.2) 0%, transparent 70%);
  animation: glowPulse 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.heartbeat-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.handwritten-note {
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  pointer-events: none;
}

.note-paper {
  position: relative;
  padding: 24px 32px;
  background: linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%);
  border-radius: 4px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.05);
  max-width: 300px;
  animation: noteShake 3s ease-in-out infinite;
}

.note-paper::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  border-radius: 4px;
  pointer-events: none;
}

@keyframes noteShake {
  0%, 100% { transform: rotate(-1deg); }
  50% { transform: rotate(1deg); }
}

.note-text {
  font-family: 'Caveat', 'Ma Shan Zheng', cursive;
  font-size: 18px;
  line-height: 1.8;
  color: #4A4A4A;
  white-space: pre-line;
  text-align: center;
}

.note-decoration {
  position: absolute;
  bottom: -8px;
  right: 20px;
  width: 40px;
  height: 8px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 179, 102, 0.3) 50%, transparent 100%);
}

.note-fade-enter-active {
  animation: noteAppear 0.6s ease-out;
}

.note-fade-leave-active {
  animation: noteAppear 0.4s ease-in reverse;
}

@keyframes noteAppear {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

.input-area {
  position: absolute;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  width: min(90vw, 500px);
  z-index: 25;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.emotion-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  color: #4A4A4A;
  resize: none;
  font-family: inherit;
  line-height: 1.5;
}

.emotion-input::placeholder {
  color: rgba(74, 74, 74, 0.5);
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFB366 0%, #FFB6C1 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(255, 179, 102, 0.4);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.hint-text {
  text-align: center;
  margin-top: 16px;
  font-size: 13px;
  color: rgba(74, 74, 74, 0.5);
  letter-spacing: 0.5px;
}

.particles-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 30;
}

.particle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
</style>
