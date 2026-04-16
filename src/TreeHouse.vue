<!-- 秘密基地 - 树屋场景页，含粒子系统、昼夜切换和树木生长 -->
<template>
  <div class="treehouse-container" :class="{ 'night-mode': isNight }">
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>

    <div class="sky-layer" :style="skyStyle">
      <div class="sun-moon" :class="{ night: isNight }"></div>
    </div>

    <transition name="entrance-fade">
      <div v-if="showContent" class="main-scene" :style="{ transform: `scale(${sceneScale})` }">
        <div class="forest-background">
          <div class="tree-silhouette left"></div>
          <div class="tree-silhouette right"></div>
        </div>

        <div class="tree-container">
          <transition name="tree-grow">
            <div v-if="growthStage >= 1" class="life-tree" :class="`stage-${growthStage}`">
              <svg class="tree-svg" viewBox="0 0 400 600">
                <defs>
                  <filter id="woodTexture">
                    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise"/>
                    <feDiffuseLighting in="noise" lightingColor="#C4A484" surfaceScale="2">
                      <feDistantLight azimuth="45" elevation="60"/>
                    </feDiffuseLighting>
                  </filter>
                  <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#A0826D;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#C4A484;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#A0826D;stop-opacity:1" />
                  </linearGradient>
                  <radialGradient id="glowEffect">
                    <stop offset="0%" style="stop-color:#FFD93D;stop-opacity:0.4" />
                    <stop offset="100%" style="stop-color:#FFD93D;stop-opacity:0" />
                  </radialGradient>
                </defs>

                <g class="trunk-group">
                  <path class="tree-trunk"
                    d="M 185 600 Q 180 450 175 350 L 175 280 Q 170 250 180 220 L 180 200 Q 178 180 185 160 L 200 160 Q 207 180 205 200 L 205 220 Q 215 250 210 280 L 210 350 Q 205 450 200 600 Z"
                    fill="url(#trunkGradient)"
                  />
                  <path class="trunk-detail" d="M 190 550 Q 192 400 188 300 M 195 520 Q 193 380 197 280" stroke="#8B7355" stroke-width="1.5" fill="none" opacity="0.4"/>
                </g>

                <g v-if="growthStage >= 2" class="branches-group">
                  <path class="branch" d="M 175 280 Q 140 260 120 230" stroke="#A0826D" stroke-width="8" fill="none" stroke-linecap="round"/>
                  <path class="branch" d="M 210 280 Q 240 255 265 235" stroke="#A0826D" stroke-width="7" fill="none" stroke-linecap="round"/>
                  <path class="branch" d="M 180 220 Q 150 200 130 170" stroke="#A0826D" stroke-width="6" fill="none" stroke-linecap="round"/>
                  <path class="branch" d="M 205 220 Q 235 195 255 165" stroke="#A0826D" stroke-width="6" fill="none" stroke-linecap="round"/>
                </g>

                <g v-if="growthStage >= 3" class="leaves-cluster" :class="`season-${currentSeason}`">
                  <ellipse cx="120" cy="210" rx="45" ry="35" :fill="leafColor" opacity="0.85"/>
                  <ellipse cx="145" cy="190" rx="40" ry="32" :fill="leafColor" opacity="0.88"/>
                  <ellipse cx="110" cy="240" rx="38" ry="30" :fill="leafColor" opacity="0.82"/>
                  <ellipse cx="270" cy="215" rx="42" ry="34" :fill="leafColor" opacity="0.86"/>
                  <ellipse cx="250" cy="195" rx="38" ry="30" :fill="leafColor" opacity="0.84"/>
                  <ellipse cx="285" cy="245" rx="36" ry="28" :fill="leafColor" opacity="0.80"/>
                  <ellipse cx="135" cy="155" rx="35" ry="28" :fill="leafColor" opacity="0.83"/>
                  <ellipse cx="260" cy="155" rx="33" ry="27" :fill="leafColor" opacity="0.81"/>
                  <ellipse cx="195" cy="140" rx="50" ry="38" :fill="leafColor" opacity="0.87"/>
                </g>
              </svg>

              <div v-if="growthStage >= 4" class="rooms-container">
                <div
                  v-for="room in rooms"
                  :key="room.id"
                  class="tree-room"
                  :class="[room.type, { built: room.isBuilt, active: activeRoom === room.id }]"
                  :style="{ bottom: room.position.y + '%', left: room.position.x + '%' }"
                  @click="handleRoomClick(room)"
                >
                  <div class="room-body">
                    <div class="room-roof"></div>
                    <div class="room-walls">
                      <span class="room-icon">{{ room.icon }}</span>
                      <span class="room-name">{{ room.name }}</span>
                    </div>
                  </div>
                  <div v-if="!room.isBuilt" class="build-hint">点击建造</div>
                  <div v-if="activeRoom === room.id" class="room-glow"></div>
                </div>
              </div>

              <StringLights v-if="growthStage >= 4 && showLights" :isNight="isNight" />
            </div>
          </transition>
        </div>

        <GardenArea
          v-if="showGarden"
          :woodCount="resources.wood"
          @collect-wood="collectWood"
          @toggle-swing="triggerSwing"
        />

        <div class="decorations">
          <Swing :isAnimating="swingAnimating" />
          <BirdHouse />
        </div>

        <StickyNoteSystem
          v-if="showNotes"
          :notes="stickyNotes"
          @add-note="addNote"
          @collect-note="collectNote"
        />
      </div>
    </transition>

    <transition name="welcome-fade">
      <div v-if="showWelcome" class="welcome-overlay">
        <div class="seed-container">
          <div class="seed" :class="{ sprouting: isSprouting }">
            <svg width="60" height="80" viewBox="0 0 60 80">
              <ellipse cx="30" cy="55" rx="18" ry="22" fill="#8B7355"/>
              <path d="M 30 55 Q 28 35 30 20 Q 32 35 30 55" stroke="#6B8E6B" stroke-width="2" fill="none" class="sprout-stem"/>
              <ellipse cx="30" cy="18" rx="8" ry="12" fill="#9ACD70" class="sprout-leaf" opacity="0"/>
            </svg>
          </div>
          <p class="welcome-text">{{ welcomeText }}</p>
        </div>
      </div>
    </transition>

    <div class="ui-controls">
      <SeasonController :currentSeason="currentSeason" @change-season="changeSeason" />
      <ResourceDisplay :wood="resources.wood" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import StringLights from './components/StringLights.vue'
import GardenArea from './components/GardenArea.vue'
import StickyNoteSystem from './components/StickyNoteSystem.vue'
import Swing from './components/Swing.vue'
import BirdHouse from './components/BirdHouse.vue'
import SeasonController from './components/SeasonController.vue'
import ResourceDisplay from './components/ResourceDisplay.vue'

const particleCanvas = ref(null)
const growthStage = ref(0)
const currentSeason = ref('spring')
const isNight = ref(false)
const showContent = ref(false)
const showWelcome = ref(true)
const isSprouting = ref(false)
const showNotes = ref(false)
const showGarden = ref(false)
const showLights = ref(false)
const swingAnimating = ref(false)
const sceneScale = ref(1)
const activeRoom = ref(null)

const welcomeTexts = [
  '让我们一起种下它…',
  '看，它开始发芽了！',
  '哇，长出枝桠了！',
  '我们的家，慢慢成形…'
]
const welcomeText = ref(welcomeTexts[0])

const resources = ref({
  wood: 15,
  decorations: []
})

const stickyNotes = ref([
  {
    id: 1,
    content: '欢迎来到我们的秘密基地！',
    color: '#FFF9C4',
    position: { x: 65, y: 25 },
    isCollected: false,
    fromAI: true
  }
])

const rooms = ref([
  {
    id: 'balcony',
    type: 'balcony',
    name: '阳台',
    icon: '🌸',
    position: { x: 50, y: 25 },
    isBuilt: true,
    buildLevel: 1
  },
  {
    id: 'living',
    type: 'living',
    name: '客厅',
    icon: '💫',
    position: { x: 50, y: 38 },
    isBuilt: false,
    buildLevel: 0
  },
  {
    id: 'study',
    type: 'study',
    name: '书房',
    icon: '📚',
    position: { x: 50, y: 51 },
    isBuilt: false,
    buildLevel: 0
  },
  {
    id: 'attic',
    type: 'attic',
    name: '阁楼',
    icon: '🔒',
    position: { x: 50, y: 64 },
    isBuilt: false,
    buildLevel: 0
  }
])

const leafColors = {
  spring: '#9ACD70',
  summer: '#6B8E6B',
  autumn: '#DEB887',
  winter: '#E8E8E8'
}

const leafColor = computed(() => leafColors[currentSeason.value])

const skyStyle = computed(() => {
  if (isNight.value) {
    return {
      background: 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    }
  }
  const gradients = {
    spring: 'linear-gradient(to bottom, #87CEEB 0%, #B0E0E6 50%, #FFF8E7 100%)',
    summer: 'linear-gradient(to bottom, #4A90E2 0%, #87CEEB 50%, #FFE4B5 100%)',
    autumn: 'linear-gradient(to bottom, #DDA15E 0%, #FEFAE0 50%, #BC6C25 100%)',
    winter: 'linear-gradient(to bottom, #A8DADC 0%, #E8F4F8 50%, #FFFFFF 100%)'
  }
  return { background: gradients[currentSeason.value] }
})

let particleCtx = null
let particles = []
let animationId = null

function initParticles() {
  if (!particleCanvas.value) return

  const canvas = particleCanvas.value
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  particleCtx = canvas.getContext('2d')

  createParticles()
  animateParticles()
}

function createParticles() {
  particles = []
  const count = getParticleCount()

  for (let i = 0; i < count; i++) {
    particles.push(createParticle())
  }
}

function createParticle() {
  const types = {
    spring: { symbol: '🌸', size: [8, 14], speed: [0.5, 1.5], rotationSpeed: [0.02, 0.05] },
    summer: { symbol: '✦', size: [3, 6], speed: [0.3, 0.8], rotationSpeed: [0.01, 0.03], glow: true },
    autumn: { symbol: '🍂', size: [10, 16], speed: [1, 2], rotationSpeed: [0.03, 0.07] },
    winter: { symbol: '❄', size: [4, 10], speed: [0.5, 1.2], rotationSpeed: [0.02, 0.04] }
  }

  const config = types[currentSeason.value]
  return {
    x: Math.random() * (particleCanvas.value?.width || window.innerWidth),
    y: -20,
    size: config.size[0] + Math.random() * (config.size[1] - config.size[0]),
    speedY: config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]),
    speedX: (Math.random() - 0.5) * 0.8,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: config.rotationSpeed[0] + Math.random() * (config.rotationSpeed[1] - config.rotationSpeed[0]),
    opacity: 0.6 + Math.random() * 0.4,
    symbol: config.symbol,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.01 + Math.random() * 0.02,
    glow: config.glow || false
  }
}

function getParticleCount() {
  const counts = { spring: 35, summer: 18, autumn: 45, winter: 60 }
  return counts[currentSeason.value]
}

function animateParticles() {
  if (!particleCtx || !particleCanvas.value) return

  const canvas = particleCanvas.value
  particleCtx.clearRect(0, 0, canvas.width, canvas.height)

  particles.forEach((p, index) => {
    p.wobble += p.wobbleSpeed
    p.x += p.speedX + Math.sin(p.wobble) * 0.5
    p.y += p.speedY
    p.rotation += p.rotationSpeed

    if (p.glow) {
      particleCtx.shadowBlur = 10
      particleCtx.shadowColor = '#ADFF2F'
    }

    particleCtx.save()
    particleCtx.translate(p.x, p.y)
    particleCtx.rotate(p.rotation)
    particleCtx.globalAlpha = p.opacity
    particleCtx.font = `${p.size}px Arial`
    particleCtx.textAlign = 'center'
    particleCtx.fillText(p.symbol, 0, 0)
    particleCtx.restore()

    if (p.y > canvas.height + 20) {
      particles[index] = createParticle()
    }
  })

  animationId = requestAnimationFrame(animateParticles)
}

async function playEntranceSequence() {
  await new Promise(resolve => setTimeout(resolve, 800))

  isSprouting.value = true
  welcomeText.value = welcomeTexts[1]

  await new Promise(resolve => setTimeout(resolve, 800))

  growthStage.value = 1
  welcomeText.value = welcomeTexts[2]

  await new Promise(resolve => setTimeout(resolve, 1000))

  growthStage.value = 2
  welcomeText.value = welcomeTexts[3]

  await new Promise(resolve => setTimeout(resolve, 900))

  growthStage.value = 3

  await new Promise(resolve => setTimeout(resolve, 700))

  growthStage.value = 4
  showGarden.value = true
  showLights.value = true
  showNotes.value = true

  await new Promise(resolve => setTimeout(resolve, 500))

  showWelcome.value = false
  showContent.value = true

  await nextTick()
  sceneScale.value = 1
}

function handleRoomClick(room) {
  if (!room.isBuilt) {
    if (resources.value.wood >= 5) {
      resources.value.wood -= 5
      room.isBuilt = true
      addNote({
        content: `哇！${room.name}建好了！虽然...有点歪...`,
        color: getRandomNoteColor(),
        fromAI: true
      })
    } else {
      addNote({
        content: '我在树下捡到了好多木头！够我们搭个窗户了！（需要收集更多木材）',
        color: '#FCE4EC',
        fromAI: true
      })
    }
  }

  activeRoom.value = room.id
  setTimeout(() => { activeRoom.value = null }, 2000)
}

function collectWood(amount) {
  resources.value.wood += amount
  if (amount > 3) {
    addNote({
      content: '我在花园里发现了宝藏般的木材！',
      color: '#E8F5E9',
      fromAI: true
    })
  }
}

function triggerSwing() {
  swingAnimating.value = true
  setTimeout(() => { swingAnimating.value = false }, 3000)
}

function addNote(noteData) {
  const newNote = {
    id: Date.now(),
    content: noteData.content,
    color: noteData.color || getRandomNoteColor(),
    position: {
      x: 20 + Math.random() * 60,
      y: 15 + Math.random() * 50
    },
    isCollected: false,
    fromAI: noteData.fromAI || false,
    timestamp: new Date()
  }
  stickyNotes.value.push(newNote)

  if (stickyNotes.value.length > 8) {
    stickyNotes.value.shift()
  }
}

function collectNote(noteId) {
  const note = stickyNotes.value.find(n => n.id === noteId)
  if (note) {
    note.isCollected = true
  }
}

function changeSeason(season) {
  currentSeason.value = season
  createParticles()
}

function getRandomNoteColor() {
  const colors = ['#FFF9C4', '#FCE4EC', '#E3F2FD', '#E8F5E9', '#F3E5F5']
  return colors[Math.floor(Math.random() * colors.length)]
}

function checkTimeOfDay() {
  const hour = new Date().getHours()
  isNight.value = hour < 6 || hour >= 19
}

function handleResize() {
  if (particleCanvas.value) {
    particleCanvas.value.width = window.innerWidth
    particleCanvas.value.height = window.innerHeight
  }
}

onMounted(() => {
  checkTimeOfDay()
  initParticles()
  playEntranceSequence()

  setInterval(checkTimeOfDay, 60000)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.treehouse-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(to bottom, #87CEEB 0%, #B0E0E6 50%, #FFF8E7 100%);
  transition: background 2s ease;
}

.treehouse-container.night-mode {
  background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.sky-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  transition: background 2s ease;
  z-index: 0;
}

.sun-moon {
  position: absolute;
  top: 8%;
  right: 15%;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(circle, #FFD93D 0%, #FFA500 100%);
  box-shadow: 0 0 40px rgba(255, 217, 61, 0.6), 0 0 80px rgba(255, 217, 61, 0.3);
  transition: all 2s ease;
}

.sun-moon.night {
  background: radial-gradient(circle, #F5F5DC 0%, #E8E8E8 100%);
  box-shadow: 0 0 30px rgba(245, 245, 220, 0.4);
  width: 45px;
  height: 45px;
}

.main-scene {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.95);
  transition: transform 1s ease-out;
  z-index: 2;
}

.forest-background {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.tree-silhouette {
  position: absolute;
  bottom: 15%;
  width: 120px;
  height: 250px;
  background: linear-gradient(to top, rgba(107, 142, 107, 0.15), rgba(107, 142, 107, 0.05));
  border-radius: 50% 50% 0 0;
}

.tree-silhouette.left {
  left: 8%;
  transform: scaleX(-1);
}

.tree-silhouette.right {
  right: 8%;
}

.tree-container {
  position: relative;
  width: 420px;
  height: 650px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.life-tree {
  position: relative;
  width: 100%;
  height: 100%;
  transition: all 0.8s ease-out;
}

.tree-svg {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 380px;
  height: 580px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.tree-trunk {
  filter: url(#woodTexture);
}

.branches-group {
  animation: branchGrow 1s ease-out forwards;
}

@keyframes branchGrow {
  from {
    opacity: 0;
    transform: scaleY(0);
    transform-origin: bottom center;
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
}

.leaves-cluster {
  animation: leavesAppear 1.2s ease-out forwards;
  transition: fill 1.5s ease;
}

.leaves-cluster.season-spring ellipse {
  animation: leafSway 4s ease-in-out infinite;
}

.leaves-cluster.season-autumn ellipse {
  animation: leafFall 6s ease-in-out infinite;
}

@keyframes leavesAppear {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes leafSway {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  50% { transform: translateX(3px) rotate(1deg); }
}

@keyframes leafFall {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(2px) rotate(2deg); }
}

.rooms-container {
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0;
}

.tree-room {
  position: absolute;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: translateX(-50%);
  z-index: 10;
}

.room-body {
  background: linear-gradient(135deg, #FFF8E7 0%, #F5E6D3 100%);
  border-radius: 8px 8px 4px 4px;
  padding: 12px 16px;
  box-shadow:
    2px 3px 10px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 2px solid #D4B494;
  position: relative;
  min-width: 90px;
  text-align: center;
  transition: all 0.3s ease;
}

.room-body::before {
  content: '';
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 55px solid transparent;
  border-right: 55px solid transparent;
  border-bottom: 20px solid #C4A484;
}

.room-roof {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 58px solid transparent;
  border-right: 58px solid transparent;
  border-bottom: 24px solid #A0826D;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
}

.room-walls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.room-icon {
  font-size: 22px;
}

.room-name {
  font-size: 13px;
  font-weight: 600;
  color: #5a4a3a;
  letter-spacing: 0.5px;
}

.build-hint {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  color: #8B7355;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.tree-room:not(.built):hover .build-hint {
  opacity: 1;
}

.tree-room:not(.built) .room-body {
  opacity: 0.6;
  filter: grayscale(30%);
}

.tree-room.built:hover .room-body {
  transform: translateY(-4px);
  box-shadow:
    4px 6px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.tree-room.active .room-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 140%;
  background: radial-gradient(circle, rgba(255, 217, 61, 0.3) 0%, transparent 70%);
  border-radius: 12px;
  animation: pulse 1.5s ease-in-out infinite;
  pointer-events: none;
  z-index: -1;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
}

.decorations {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.ui-controls {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  align-items: center;
  z-index: 100;
}

.welcome-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255, 248, 231, 0.95) 0%, rgba(255, 248, 231, 0.98) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.seed-container {
  text-align: center;
}

.seed {
  margin-bottom: 24px;
  transition: all 1s ease;
}

.seed.sprouting {
  animation: sproutGrow 1.5s ease-out forwards;
}

.seed.sprouting .sprout-stem {
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: stemGrow 1s ease-out 0.3s forwards;
}

.seed.sprouting .sprout-leaf {
  animation: leafUnfold 0.8s ease-out 1s forwards;
}

@keyframes sproutGrow {
  0% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.1) translateY(-10px); }
  100% { transform: scale(1.2) translateY(-20px); }
}

@keyframes stemGrow {
  to { stroke-dashoffset: 0; }
}

@keyframes leafUnfold {
  to { opacity: 1; transform: scale(1); }
}

.welcome-text {
  font-family: 'Quicksand', 'Nunito', sans-serif;
  font-size: 20px;
  color: #5a4a3a;
  letter-spacing: 1px;
  font-weight: 500;
  animation: textFadeIn 0.8s ease-out;
}

@keyframes textFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.entrance-fade-enter-active {
  transition: opacity 1.2s ease-out, transform 1.2s ease-out;
}
.entrance-fade-enter-from {
  opacity: 0;
  transform: scale(0.92);
}

.tree-grow-enter-active {
  transition: all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.tree-grow-enter-from {
  opacity: 0;
  transform: scale(0.3) translateY(50px);
}

.welcome-fade-leave-active {
  transition: opacity 1s ease-out;
}
.welcome-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .tree-container {
    width: 320px;
    height: 520px;
  }

  .tree-svg {
    width: 290px;
    height: 460px;
  }

  .room-body {
    padding: 8px 12px;
    min-width: 70px;
  }

  .room-icon {
    font-size: 18px;
  }

  .room-name {
    font-size: 11px;
  }

  .welcome-text {
    font-size: 16px;
  }

  .ui-controls {
    flex-direction: column;
    gap: 12px;
    bottom: 16px;
  }
}
</style>
