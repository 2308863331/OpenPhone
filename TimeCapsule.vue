<!-- 时间胶囊 - 怀旧风格时间胶囊页面，含摇晃交互和照片展示 -->
<template>
  <div class="time-capsule-container">
    <canvas ref="smokeCanvas" class="smoke-canvas"></canvas>
    <div class="old-paper-texture"></div>
    
    <div class="scene-layer">
      <div class="top-space">
        <p class="typewriter-text" :class="{ visible: showTitle }">{{ displayText }}<span class="cursor">|</span></p>
      </div>

      <div class="main-stage">
        <div 
          class="polaroid polaroid-left" 
          :class="{ visible: showPhotos }"
          :style="{ animationDelay: '1.0s' }"
        >
          <div class="photo-inner"></div>
          <p class="photo-caption">2024.03</p>
        </div>

        <div 
          class="capsule-wrapper" 
          :class="{ shaking: isShaking, visible: showCapsule }"
          @click="shakeCapsule"
        >
          <div class="glass-jar">
            <div class="jar-highlight"></div>
            <div class="jar-body">
              <div class="jar-lid"></div>
              <div class="jar-content">
                <div 
                  v-for="(note, idx) in floatingNotes" 
                  :key="idx"
                  class="inner-note"
                  :style="note.style"
                ></div>
              </div>
              <div class="jar-reflection"></div>
            </div>
            <div class="jar-dust"></div>
          </div>
          <div class="capsule-glow"></div>
        </div>

        <div 
          class="polaroid polaroid-right" 
          :class="{ visible: showPhotos }"
          :style="{ animationDelay: '1.4s' }"
        >
          <div class="photo-inner photo-inner-2"></div>
          <p class="photo-caption">2025.07</p>
        </div>

        <div 
          v-for="(note, idx) in fallenNotes" 
          :key="'fallen-' + idx"
          class="fallen-note"
          :style="note.style"
          @click="openNote(note)"
        >
          <div class="note-lines"></div>
        </div>
      </div>

      <div class="bottom-actions" :class="{ visible: showActions }">
        <button class="wax-seal-btn" @click="sealMemory">
          <div class="seal-ring"></div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
          <span>封存此刻</span>
        </button>
        
        <button class="text-btn" @click="showReminder = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          <span>纪念日</span>
        </button>
      </div>
    </div>

    <transition name="modal-fade">
      <div v-if="selectedNote" class="note-modal-overlay" @click="selectedNote = null">
        <div class="note-modal-content" @click.stop>
          <div class="modal-paper">
            <p class="modal-typewriter">{{ modalText }}<span class="cursor">|</span></p>
          </div>
          <button class="close-modal" @click="selectedNote = null">收起</button>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showReminder" class="reminder-modal-overlay" @click="showReminder = false">
        <div class="reminder-modal-content glass-effect" @click.stop>
          <h3>设置开启日期</h3>
          <input type="date" class="date-input" v-model="reminderDate" />
          <p class="hint-text">届时我会提醒你打开这个胶囊</p>
          <button class="seal-confirm" @click="confirmReminder">确认封存</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const smokeCanvas = ref(null)
let ctx = null
let animationId = null
const particles = []

const showTitle = ref(false)
const showCapsule = ref(false)
const showPhotos = ref(false)
const showActions = ref(false)
const isShaking = ref(false)
const displayText = ref('')
const fullText = '你的时光胶囊，已准备就绪'
const floatingNotes = ref([
  { style: { transform: 'rotate(-5deg) translateY(0px)', opacity: 0.7 } },
  { style: { transform: 'rotate(3deg) translateY(10px)', opacity: 0.5 } }
])
const fallenNotes = ref([])
const selectedNote = ref(null)
const modalText = ref('')
const showReminder = ref(false)
const reminderDate = ref('')

class SmokeParticle {
  constructor(canvasWidth, canvasHeight) {
    this.reset(canvasWidth, canvasHeight)
  }

  reset(w, h) {
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.vx = (Math.random() - 0.5) * 0.3
    this.vy = -Math.random() * 0.5 - 0.1
    this.opacity = Math.random() * 0.15 + 0.05
    this.size = Math.random() * 60 + 20
    this.life = 0
    this.maxLife = Math.random() * 300 + 200
  }

  update(w, h) {
    this.x += this.vx
    this.y += this.vy
    this.life++
    
    if (this.life > this.maxLife || this.y < -50 || this.x < -50 || this.x > w + 50) {
      this.reset(w, h)
      this.y = h + 20
    }
  }

  draw(ctx) {
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size)
    gradient.addColorStop(0, `rgba(180, 180, 190, ${this.opacity})`)
    gradient.addColorStop(1, `rgba(180, 180, 190, 0)`)
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

function initSmoke() {
  if (!smokeCanvas.value) return
  
  const canvas = smokeCanvas.value
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  ctx = canvas.getContext('2d')
  
  for (let i = 0; i < 60; i++) {
    particles.push(new SmokeParticle(canvas.width, canvas.height))
  }
  
  animate()
}

function animate() {
  if (!ctx || !smokeCanvas.value) return
  
  ctx.clearRect(0, 0, smokeCanvas.value.width, smokeCanvas.value.height)
  
  particles.forEach(p => {
    p.update(smokeCanvas.value.width, smokeCanvas.value.height)
    p.draw(ctx)
  })
  
  animationId = requestAnimationFrame(animate)
}

function typewriterEffect() {
  let i = 0
  const interval = setInterval(() => {
    if (i < fullText.length) {
      displayText.value += fullText[i]
      i++
    } else {
      clearInterval(interval)
    }
  }, 120)
}

function shakeCapsule() {
  isShaking.value = true
  
  setTimeout(() => {
    isShaking.value = false
    
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const angle = (Math.random() - 0.5) * 40
        const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 50
        const startY = window.innerHeight / 2 - 30
        
        fallenNotes.value.push({
          id: Date.now() + i,
          style: {
            left: `${startX}px`,
            top: `${startY}px`,
            transform: `rotate(${angle}deg)`,
            animation: `fall ${2 + Math.random()}s ease-in forwards`
          }
        })
      }, i * 200)
    }
  }, 800)
}

function openNote(note) {
  selectedNote.value = note
  modalText.value = ''
  const text = '这是一段来自过去的对话...\n\n有些话，当时只道是寻常。\n如今封存在这里，\n等待被重新阅读的时刻。'
  
  let i = 0
  const interval = setInterval(() => {
    if (i < text.length) {
      modalText.value += text[i]
      
      if (Math.random() < 0.05) {
        modalText.value = modalText.value.slice(0, -1) + String.fromCharCode(text.charCodeAt(i) + 1)
        setTimeout(() => {
          modalText.value = modalText.value.slice(0, -1) + text[i]
        }, 80)
      }
      
      i++
    } else {
      clearInterval(interval)
    }
  }, 90)
}

function sealMemory() {
  alert('已封存至未来某个时刻\n届时我会提醒你开启')
}

function confirmReminder() {
  if (reminderDate.value) {
    showReminder.value = false
    alert(`已设定在 ${reminderDate.value} 提醒你`)
  }
}

onMounted(() => {
  setTimeout(() => showTitle.value = true, 1600)
  setTimeout(() => typewriterEffect(), 2000)
  setTimeout(() => showCapsule.value = true, 800)
  setTimeout(() => showPhotos.value = true, 1200)
  setTimeout(() => showActions.value = true, 2200)
  
  initSmoke()
  
  window.addEventListener('resize', () => {
    if (smokeCanvas.value) {
      smokeCanvas.value.width = window.innerWidth
      smokeCanvas.value.height = window.innerHeight
    }
  })
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.time-capsule-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #F5F2EB;
  font-family: 'Georgia', 'Source Han Serif CN', serif;
}

.smoke-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.old-paper-texture {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(139, 119, 101, 0.02) 2px,
      rgba(139, 119, 101, 0.02) 4px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(139, 119, 101, 0.015) 2px,
      rgba(139, 119, 101, 0.015) 4px
    );
  background-color: #F5F2EB;
  z-index: 0;
}

.old-paper-texture::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(107, 124, 138, 0.08) 100%);
}

.old-paper-texture::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
}

.scene-layer {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.top-space {
  flex: 0 0 28%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 5vh;
}

.typewriter-text {
  font-size: 1.5rem;
  color: #6B7C8A;
  letter-spacing: 0.3em;
  font-weight: 300;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 1s ease;
  text-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.typewriter-text.visible {
  opacity: 1;
  transform: translateY(0);
}

.cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.main-stage {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.polaroid {
  position: absolute;
  width: 140px;
  background: #FFFEF9;
  padding: 12px 12px 45px 12px;
  box-shadow: 
    0 2px 8px rgba(0,0,0,0.08),
    0 8px 24px rgba(0,0,0,0.04);
  opacity: 0;
  transform: translateY(30px) rotate(0deg);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}

.polaroid.visible {
  opacity: 1;
  transform: translateY(0);
}

.polaroid:hover {
  transform: translateY(-8px) scale(1.03) !important;
  box-shadow: 
    0 4px 16px rgba(0,0,0,0.12),
    0 12px 32px rgba(0,0,0,0.08);
}

.polaroid-left {
  left: calc(50% - 280px);
  top: 50%;
  margin-top: -60px;
  transform: rotate(-8deg);
}

.polaroid-left.visible {
  transform: rotate(-8deg) translateY(0);
}

.polaroid-right {
  right: calc(50% - 280px);
  top: 50%;
  margin-top: 40px;
  transform: rotate(6deg);
}

.polaroid-right.visible {
  transform: rotate(6deg) translateY(0);
}

.photo-inner {
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(135deg, #D4C5B0 0%, #B8A99A 50%, #C9BBA8 100%);
  position: relative;
  overflow: hidden;
}

.photo-inner::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.05) 100%);
}

.photo-inner-2 {
  background: linear-gradient(135deg, #B5ADA0 0%, #9A9285 50%, #AFA79A 100%);
}

.photo-caption {
  position: absolute;
  bottom: 14px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.85rem;
  color: #8B7355;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.1em;
}

.capsule-wrapper {
  position: relative;
  cursor: pointer;
  opacity: 0;
  transform: translateY(60px) scale(0.9);
  transition: all 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: 0.3s;
  z-index: 10;
}

.capsule-wrapper.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.capsule-wrapper:hover .capsule-glow {
  opacity: 0.6;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.015); }
}

.capsule-wrapper.visible:not(.shaking) {
  animation: breathe 4s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  10% { transform: rotate(-8deg); }
  20% { transform: rotate(8deg); }
  30% { transform: rotate(-6deg); }
  40% { transform: rotate(6deg); }
  50% { transform: rotate(-4deg); }
  60% { transform: rotate(4deg); }
  70% { transform: rotate(-2deg); }
  80% { transform: rotate(2deg); }
  90% { transform: rotate(-1deg); }
}

.capsule-wrapper.shaking {
  animation: shake 0.8s ease-in-out;
}

.glass-jar {
  width: 200px;
  height: 260px;
  position: relative;
}

.jar-body {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  height: 200px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.05) 30%,
    rgba(200, 210, 220, 0.08) 70%,
    rgba(180, 190, 200, 0.12) 100%
  );
  border-radius: 20px 20px 40px 40px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  box-shadow:
    inset 0 0 30px rgba(255, 255, 255, 0.1),
    inset -5px -5px 20px rgba(0, 0, 0, 0.03),
    0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  backdrop-filter: blur(2px);
}

.jar-lid {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 20px;
  background: linear-gradient(180deg, #8B7355 0%, #6B5344 100%);
  border-radius: 4px 4px 0 0;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
}

.jar-lid::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 110px;
  height: 12px;
  background: linear-gradient(180deg, #9B8365 0%, #8B7355 100%);
  border-radius: 6px 6px 0 0;
}

.jar-content {
  position: absolute;
  top: 30px;
  left: 15px;
  right: 15px;
  bottom: 20px;
  overflow: hidden;
}

.inner-note {
  position: absolute;
  width: 50px;
  height: 65px;
  background: linear-gradient(135deg, #F4ECD8 0%, #E8DCC4 100%);
  border-radius: 2px;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.08);
}

.inner-note:nth-child(1) {
  left: 20px;
  top: 20px;
  transform: rotate(-8deg);
}

.inner-note:nth-child(2) {
  right: 15px;
  top: 50px;
  transform: rotate(5deg);
}

.jar-highlight {
  position: absolute;
  top: 20px;
  left: 15px;
  width: 30px;
  height: 150px;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.4) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  border-radius: 10px;
  pointer-events: none;
}

.jar-reflection {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%,
    transparent 50%
  );
  border-radius: 20px 20px 40px 40px;
  pointer-events: none;
}

.jar-dust {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='dust'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23dust)'/%3E%3C/svg%3E");
  opacity: 0.04;
  border-radius: 20px 20px 40px 40px;
  pointer-events: none;
}

.capsule-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 240px;
  height: 300px;
  background: radial-gradient(ellipse, rgba(139, 154, 125, 0.15) 0%, transparent 70%);
  opacity: 0.3;
  transition: opacity 0.5s ease;
  pointer-events: none;
  z-index: -1;
}

.bottom-actions {
  flex: 0 0 22%;
  display: flex;
  justify-content: center;
  gap: 32px;
  align-items: center;
  padding-bottom: 4vh;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease;
  transition-delay: 0.3s;
}

.bottom-actions.visible {
  opacity: 1;
  transform: translateY(0);
}

.wax-seal-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  background: linear-gradient(145deg, #8B3A3A 0%, #6B2A2A 100%);
  border: none;
  border-radius: 50%;
  width: 90px;
  height: 90px;
  color: #F5F2EB;
  cursor: pointer;
  box-shadow:
    0 4px 12px rgba(139, 58, 58, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.15),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  font-family: inherit;
}

.wax-seal-btn:hover {
  transform: translateY(-3px);
  box-shadow:
    0 8px 20px rgba(139, 58, 58, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.2),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2);
}

.wax-seal-btn:active {
  transform: translateY(0);
  box-shadow:
    0 2px 6px rgba(139, 58, 58, 0.3),
    inset 0 2px 8px rgba(0, 0, 0, 0.3);
}

.seal-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid rgba(139, 58, 58, 0.3);
  border-radius: 50%;
  pointer-events: none;
}

.wax-seal-btn svg {
  width: 28px;
  height: 28px;
}

.wax-seal-btn span {
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  font-weight: 500;
}

.text-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(107, 124, 138, 0.08);
  border: 1px solid rgba(107, 124, 138, 0.15);
  border-radius: 24px;
  color: #6B7C8A;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  transition: all 0.3s ease;
}

.text-btn:hover {
  background: rgba(107, 124, 138, 0.12);
  border-color: rgba(107, 124, 138, 0.25);
  transform: translateY(-2px);
}

.text-btn svg {
  width: 18px;
  height: 18px;
}

@keyframes fall {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  100% {
    opacity: 1;
    transform: translateY(250px) rotate(var(--rotate-end, 20deg));
  }
}

.fallen-note {
  position: fixed;
  width: 70px;
  height: 90px;
  background: linear-gradient(135deg, #F9F5ED 0%, #F0E8D8 100%);
  border-radius: 2px;
  box-shadow: 
    2px 3px 8px rgba(0, 0, 0, 0.08),
    inset 0 0 20px rgba(139, 119, 101, 0.05);
  cursor: pointer;
  z-index: 15;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.fallen-note::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border: 1px solid rgba(139, 119, 101, 0.1);
}

.note-lines {
  position: absolute;
  top: 15px;
  left: 12px;
  right: 12px;
}

.note-lines::before,
.note-lines::after {
  content: '';
  display: block;
  height: 2px;
  background: rgba(139, 119, 101, 0.15);
  margin-bottom: 8px;
  border-radius: 1px;
}

.fallen-note:hover {
  transform: scale(1.08) !important;
  box-shadow: 
    4px 6px 16px rgba(0, 0, 0, 0.12),
    0 0 20px rgba(139, 154, 125, 0.2);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.4s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.note-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(245, 242, 235, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.note-modal-content {
  max-width: 420px;
  width: 90%;
  animation: floatIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-paper {
  background: linear-gradient(135deg, #FBF8F3 0%, #F5F0E8 100%);
  padding: 48px 40px;
  border-radius: 4px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 12px 40px rgba(0, 0, 0, 0.04);
  position: relative;
  min-height: 280px;
}

.modal-paper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, #8B9A7D, transparent);
}

.modal-typewriter {
  font-size: 1.05rem;
  line-height: 2;
  color: #5A6268;
  letter-spacing: 0.05em;
  white-space: pre-wrap;
}

.close-modal {
  display: block;
  margin: 24px auto 0;
  padding: 10px 32px;
  background: transparent;
  border: 1px solid rgba(107, 124, 138, 0.2);
  border-radius: 20px;
  color: #6B7C8A;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  transition: all 0.3s ease;
}

.close-modal:hover {
  background: rgba(107, 124, 138, 0.08);
  border-color: rgba(107, 124, 138, 0.3);
}

.reminder-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(245, 242, 235, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.reminder-modal-content {
  padding: 48px 56px;
  text-align: center;
  min-width: 360px;
}

.glass-effect {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.6) 0%,
    rgba(255, 255, 255, 0.3) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    inset 0 1px 2px rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.reminder-modal-content h3 {
  font-size: 1.3rem;
  color: #5A6268;
  font-weight: 400;
  letter-spacing: 0.15em;
  margin-bottom: 28px;
}

.date-input {
  display: block;
  width: 100%;
  padding: 14px 20px;
  border: 1px solid rgba(107, 124, 138, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  font-family: inherit;
  font-size: 1rem;
  color: #5A6268;
  outline: none;
  transition: all 0.3s ease;
  margin-bottom: 16px;
  box-sizing: border-box;
}

.date-input:focus {
  border-color: rgba(139, 154, 125, 0.4);
  box-shadow: 0 0 0 3px rgba(139, 154, 125, 0.1);
}

.hint-text {
  font-size: 0.85rem;
  color: #9AA5AF;
  margin-bottom: 28px;
  letter-spacing: 0.05em;
}

.seal-confirm {
  padding: 12px 36px;
  background: linear-gradient(145deg, #8B3A3A 0%, #6B2A2A 100%);
  border: none;
  border-radius: 24px;
  color: #F5F2EB;
  font-family: inherit;
  font-size: 0.9rem;
  letter-spacing: 0.15em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(139, 58, 58, 0.25);
}

.seal-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 58, 58, 0.35);
}
</style>
