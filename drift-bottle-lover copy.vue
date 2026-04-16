<!--  画室主题漂流瓶页面，含画架和绘画交互 -->
<template>
  <div class="studio-container" :class="{ 'entrance-complete': entranceComplete }">
    <!-- 光源层 -->
    <div class="light-layer"></div>

    <!-- 桌面层 -->
    <div class="desk-layer">
      <svg class="wood-texture" xmlns="http://www.w3.org/2000/svg">
        <filter id="wood-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.003" numOctaves="5" result="noise"/>
          <feDiffuseLighting in="noise" lighting-color="#d4c4a8" surfaceScale="2" result="light">
            <feDistantLight azimuth="45" elevation="60"/>
          </feDiffuseLighting>
          <feBlend in="SourceGraphic" in2="light" mode="multiply"/>
        </filter>
      </svg>
    </div>

    <!-- 画架/画框层 -->
    <div class="easel-frame" :class="{ 'frame-visible': frameVisible }">
      <div class="frame-inner"></div>
    </div>

    <!-- 画布层 - 主角 -->
    <div class="canvas-wrapper" :class="{ 'canvas-unfolded': canvasUnfolded }">
      <canvas
        ref="mainCanvas"
        class="paint-canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="handleTouchStart"
        @touchmove.prevent="handleTouchMove"
        @touchend.prevent="stopDrawing"
      ></canvas>
      <canvas ref="aiCanvas" class="ai-canvas"></canvas>
      <div class="paper-texture-overlay"></div>
    </div>

    <!-- AI 画外音层 -->
    <transition name="note-float">
      <div
        v-if="currentNote.visible"
        class="ai-note"
        :style="{
          left: currentNote.x + 'px',
          top: currentNote.y + 'px',
          transform: `rotate(${currentNote.rotation}deg)`
        }"
      >
        {{ currentNote.text }}
      </div>
    </transition>

    <!-- 工具层 -->
    <div class="tools-layer">
      <!-- 画笔工具 -->
      <div
        class="tool brush-tool"
        :class="{ 'tool-active': activeTool === 'brush', 'tool-lifted': brushLifted }"
        :style="{ '--brush-color': currentColor }"
        @click="selectTool('brush')"
      >
        <svg viewBox="0 0 40 120" class="brush-svg">
          <defs>
            <linearGradient id="brush-handle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#8B7355"/>
              <stop offset="50%" style="stop-color:#A0896C"/>
              <stop offset="100%" style="stop-color:#8B7355"/>
            </linearGradient>
          </defs>
          <rect x="16" y="10" width="8" height="70" rx="2" fill="url(#brush-handle)"/>
          <ellipse cx="20" cy="85" rx="6" ry="12" :fill="currentColor" class="brush-bristles"/>
          <ellipse cx="20" cy="92" rx="3" ry="6" :fill="currentColor" class="brush-tip"/>
        </svg>
      </div>

      <!-- 调色盘 -->
      <div class="tool palette-tool" :class="{ 'palette-open': paletteOpen }" @click="togglePalette">
        <svg viewBox="0 0 120 80" class="palette-svg">
          <ellipse cx="60" cy="40" rx="55" ry="35" fill="#D4A574" stroke="#A0896C" stroke-width="2"/>
          <g class="color-dots">
            <circle
              v-for="(color, index) in paletteColors"
              :key="index"
              :cx="color.x"
              :cy="color.y"
              r="10"
              :fill="color.hex"
              class="palette-dot"
              :class="{ 'dot-selected': currentColor === color.hex }"
              @click.stop="selectColor(color.hex, $event)"
            />
          </g>
          <circle cx="95" cy="20" r="6" fill="#fdfbf7" stroke="#ccc" stroke-width="1" class="water-dot" @click.stop="selectColor('transparent', $event)"/>
        </svg>
      </div>

      <!-- 水桶/洗笔桶 -->
      <div class="tool bucket-tool" @click="washBrush">
        <svg viewBox="0 0 50 60" class="bucket-svg">
          <path d="M10 15 L15 55 L35 55 L40 15 Z" fill="#8B7355" stroke="#6B5345" stroke-width="1.5"/>
          <ellipse cx="25" cy="15" rx="15" ry="6" fill="#A0896C" stroke="#6B5345" stroke-width="1.5"/>
          <ellipse cx="25" cy="22" rx="12" ry="4" fill="#87CEEB" opacity="0.6" class="water-surface"/>
          <ellipse cx="25" cy="22" rx="12" ry="4" fill="none" stroke="#5F9EA0" stroke-width="0.5" class="water-ripple"/>
        </svg>
      </div>

      <!-- 新画布按钮 -->
      <div class="tool new-canvas-tool" @click="newCanvas">
        <svg viewBox="0 0 60 70" class="paper-stack-svg">
          <rect x="5" y="10" width="45" height="55" rx="1" fill="#f0ebe0" stroke="#d4c4a8" stroke-width="1"/>
          <rect x="8" y="7" width="45" height="55" rx="1" fill="#fdfbf7" stroke="#e8dcc8" stroke-width="1.5"/>
          <rect x="11" y="4" width="45" height="55" rx="1" fill="#fffefb" stroke="#ddd5c0" stroke-width="1"/>
          <line x1="18" y1="14" x2="48" y2="14" stroke="#e8dcc8" stroke-width="0.5"/>
          <line x1="18" y1="20" x2="42" y2="20" stroke="#e8dcc8" stroke-width="0.5"/>
          <line x1="18" y1="26" x2="45" y2="26" stroke="#e8dcc8" stroke-width="0.5"/>
        </svg>
      </div>
    </div>

    <!-- 笔刷大小控制 -->
    <div class="brush-size-control" v-if="activeTool === 'brush'">
      <input
        type="range"
        min="1"
        max="30"
        v-model.number="brushSize"
        class="size-slider"
      />
      <span class="size-label">{{ brushSize }}px</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'

const mainCanvas = ref(null)
const aiCanvas = ref(null)

let ctx = null
let aiCtx = null

const entranceComplete = ref(false)
const frameVisible = ref(false)
const canvasUnfolded = ref(false)

const activeTool = ref('brush')
const brushLifted = ref(false)
const paletteOpen = ref(false)

const currentColor = ref('#2c2416')
const brushSize = ref(4)

const isDrawing = ref(false)
const lastX = ref(0)
const lastY = ref(0)

const currentNote = reactive({
  visible: false,
  text: '',
  x: 0,
  y: 0,
  rotation: 0
})

const noteTimeout = ref(null)

const paletteColors = [
  { hex: '#c06c84', x: 25, y: 28 },
  { hex: '#6c8cbf', x: 45, y: 22 },
  { hex: '#556b55', x: 65, y: 20 },
  { hex: '#f4a261', x: 85, y: 25 },
  { hex: '#b8a9c9', x: 95, y: 42 },
  { hex: '#7eb8c9', x: 85, y: 58 },
  { hex: '#e8b4b8', x: 60, y: 62 },
  { hex: '#dcc89d', x: 38, y: 56 }
]

const aiMessages = [
  '这笔...画得真好。',
  '我喜欢你这里的用色。',
  '让我来接这一笔吧。',
  '这片留白很有意境。',
  '你的笔触很温柔呢。',
  '我们一起完成这幅画吧。',
  '这里的光影处理得很好。',
  '我感受到你的情绪了。'
]

onMounted(() => {
  nextTick(() => {
    initCanvas()
    startEntranceSequence()
  })

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (noteTimeout.value) clearTimeout(noteTimeout.value)
})

function initCanvas() {
  if (mainCanvas.value && aiCanvas.value) {
    const container = mainCanvas.value.parentElement
    const size = Math.min(container.offsetWidth * 0.65, 550)

    mainCanvas.value.width = size
    mainCanvas.value.height = size
    aiCanvas.value.width = size
    aiCanvas.value.height = size

    ctx = mainCanvas.value.getContext('2d')
    aiCtx = aiCanvas.value.getContext('2d')

    setupCanvasContext()
  }
}

function setupCanvasContext() {
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.globalAlpha = 0.75

  aiCtx.lineCap = 'round'
  aiCtx.lineJoin = 'round'
  aiCtx.globalAlpha = 0.65
}

function handleResize() {
  if (mainCanvas.value && aiCanvas.value) {
    const tempMainCanvas = document.createElement('canvas')
    const tempAiCanvas = document.createElement('canvas')

    tempMainCanvas.width = mainCanvas.value.width
    tempMainCanvas.height = mainCanvas.value.height
    tempAiCanvas.width = aiCanvas.value.width
    tempAiCanvas.height = aiCanvas.value.height

    const tempMainCtx = tempMainCanvas.getContext('2d')
    const tempAiCtx = tempAiCanvas.getContext('2d')

    tempMainCtx.drawImage(mainCanvas.value, 0, 0)
    tempAiCtx.drawImage(aiCanvas.value, 0, 0)

    initCanvas()

    ctx.drawImage(tempMainCanvas, 0, 0)
    aiCtx.drawImage(tempAiCanvas, 0, 0)
  }
}

function startEntranceSequence() {
  setTimeout(() => {
    entranceComplete.value = true
  }, 600)

  setTimeout(() => {
    frameVisible.value = true
  }, 900)

  setTimeout(() => {
    canvasUnfolded.value = true
  }, 1300)

  setTimeout(() => {
    showAINote('......准备好了吗？')
  }, 2200)
}

function getCanvasCoords(e) {
  const rect = mainCanvas.value.getBoundingClientRect()
  const scaleX = mainCanvas.value.width / rect.width
  const scaleY = mainCanvas.value.height / rect.height

  if (e.touches) {
    return {
      x: (e.touches[0].clientX - rect.left) * scaleX,
      y: (e.touches[0].clientY - rect.top) * scaleY
    }
  }

  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  }
}

function startDrawing(e) {
  isDrawing.value = true
  const coords = getCanvasCoords(e)
  lastX.value = coords.x
  lastY.value = coords.y

  brushLifted.value = true

  ctx.beginPath()
  ctx.moveTo(coords.x, coords.y)
}

function draw(e) {
  if (!isDrawing.value) return

  const coords = getCanvasCoords(e)

  const velocity = Math.sqrt(
    Math.pow(coords.x - lastX.value, 2) +
    Math.pow(coords.y - lastY.value, 2)
  )

  const dynamicWidth = Math.max(1, brushSize.value - velocity * 0.08)

  ctx.lineWidth = dynamicWidth

  if (currentColor.value === 'transparent') {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.strokeStyle = 'rgba(0,0,0,1)'
  } else {
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = currentColor.value
  }

  ctx.lineTo(coords.x, coords.y)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(coords.x, coords.y)

  lastX.value = coords.x
  lastY.value = coords.y
}

function stopDrawing() {
  if (isDrawing.value) {
    isDrawing.value = false
    ctx.closePath()

    brushLifted.value = false

    triggerAIResponse()
  }
}

function handleTouchStart(e) {
  startDrawing(e)
}

function handleTouchMove(e) {
  draw(e)
}

function selectTool(tool) {
  activeTool.value = tool
  if (tool === 'brush') {
    brushLifted.value = !brushLifted.value
  }
}

function togglePalette() {
  paletteOpen.value = !paletteOpen.value
}

function selectColor(color, event) {
  currentColor.value = color

  const dot = event.target
  dot.style.transform = 'scale(0.85)'
  setTimeout(() => {
    dot.style.transform = 'scale(1)'
  }, 150)
}

function washBrush() {
  currentColor.value = 'transparent'

  const bucket = document.querySelector('.bucket-tool')
  bucket.classList.add('washing')
  setTimeout(() => {
    bucket.classList.remove('washing')
  }, 600)

  showAINote('清水洗过，可以重新开始了。')
}

function newCanvas() {
  if (confirm('要开始一幅新画吗？当前的作品将被保存到记忆中。')) {
    ctx.clearRect(0, 0, mainCanvas.value.width, mainCanvas.value.height)
    aiCtx.clearRect(0, 0, aiCanvas.value.width, aiCanvas.value.height)

    canvasUnfolded.value = false

    setTimeout(() => {
      canvasUnfolded.value = true
      showAINote('新的画纸，新的故事...')
    }, 300)
  }
}

async function triggerAIResponse() {
  const delay = 400 + Math.random() * 600

  await new Promise(resolve => setTimeout(resolve, delay))

  await drawAIStroke()

  if (Math.random() > 0.4) {
    showRandomNote()
  }
}

async function drawAIStroke() {
  const colors = ['#b8a9c9', '#7eb8c9', '#e8b4b8', '#dcc89d', '#c06c84']
  const aiColor = colors[Math.floor(Math.random() * colors.length)]

  aiCtx.strokeStyle = aiColor
  aiCtx.lineWidth = 2 + Math.random() * 3

  const centerX = aiCanvas.value.width / 2
  const centerY = aiCanvas.value.height / 2
  const radius = 50 + Math.random() * 120
  const angle = Math.random() * Math.PI * 2

  const startX = centerX + Math.cos(angle) * radius * 0.8
  const startY = centerY + Math.sin(angle) * radius * 0.8

  aiCtx.beginPath()
  aiCtx.moveTo(startX, startY)

  const points = 3 + Math.floor(Math.random() * 4)
  let currentX = startX
  let currentY = startY

  for (let i = 0; i < points; i++) {
    const nextAngle = angle + (Math.random() - 0.5) * 1.2
    const distance = 20 + Math.random() * 40

    currentX += Math.cos(nextAngle) * distance
    currentY += Math.sin(nextAngle) * distance

    aiCtx.quadraticCurveTo(
      currentX + (Math.random() - 0.5) * 20,
      currentY + (Math.random() - 0.5) * 20,
      currentX,
      currentY
    )
  }

  aiCtx.stroke()

  if (Math.random() > 0.7) {
    drawAIDecoration(currentX, currentY, aiColor)
  }
}

function drawAIDecoration(x, y, color) {
  aiCtx.save()
  aiCtx.fillStyle = color
  aiCtx.globalAlpha = 0.4

  const decorationType = Math.floor(Math.random() * 3)

  if (decorationType === 0) {
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2
      const dist = 4 + Math.random() * 6
      aiCtx.beginPath()
      aiCtx.arc(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, 1.5, 0, Math.PI * 2)
      aiCtx.fill()
    }
  } else if (decorationType === 1) {
    aiCtx.font = `${10 + Math.random() * 8}px serif`
    aiCtx.fillText(['~', '*', '+', '·'][Math.floor(Math.random() * 4)], x, y)
  } else {
    aiCtx.beginPath()
    aiCtx.arc(x, y, 3 + Math.random() * 4, 0, Math.PI * 2)
    aiCtx.fill()
  }

  aiCtx.restore()
}

function showAINote(text) {
  if (noteTimeout.value) clearTimeout(noteTimeout.value)

  const canvasRect = mainCanvas.value.getBoundingClientRect()

  const positions = [
    { x: canvasRect.right - 180, y: canvasRect.top + 60 },
    { x: canvasRect.left + 20, y: canvasRect.bottom - 100 },
    { x: canvasRect.right - 160, y: canvasRect.bottom - 80 },
    { x: canvasRect.left + 30, y: canvasRect.top + 80 }
  ]

  const pos = positions[Math.floor(Math.random() * positions.length)]

  currentNote.text = text
  currentNote.x = pos.x
  currentNote.y = pos.y
  currentNote.rotation = -2 + Math.random() * 4
  currentNote.visible = true

  noteTimeout.value = setTimeout(() => {
    currentNote.visible = false
  }, 5000 + Math.random() * 3000)
}

function showRandomNote() {
  const message = aiMessages[Math.floor(Math.random() * aiMessages.length)]
  showAINote(message)
}
</script>

<style scoped>
.studio-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #faf8f5;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
}

.studio-container.entrance-complete {
  opacity: 1;
}

/* 光源层 */
.light-layer {
  position: absolute;
  top: -10%;
  left: -10%;
  width: 60%;
  height: 60%;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 248, 220, 0.18) 0%,
    rgba(255, 248, 220, 0.08) 30%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
  animation: lightShift 60s ease-in-out infinite alternate;
}

@keyframes lightShift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(30px, 20px); }
}

/* 桌面层 */
.desk-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: #e8dcc8;
}

.desk-layer::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(139, 119, 101, 0.03) 2px,
      rgba(139, 119, 101, 0.03) 4px
    );
  pointer-events: none;
}

.wood-texture {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.05;
  filter: url(#wood-grain);
}

/* 画框层 */
.easel-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: min(65vw, 600px);
  height: min(65vw, 600px);
  border-radius: 3px;
  background: linear-gradient(135deg, #6b4c35 0%, #4a3325 100%);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 -1px 0 rgba(255, 255, 255, 0.08),
    4px 6px 20px rgba(0, 0, 0, 0.25),
    0 0 60px rgba(107, 76, 53, 0.15);
  z-index: 2;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  padding: 12px;
}

.easel-frame.frame-visible {
  transform: translate(-50%, -50%) scale(1);
}

.frame-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #5c4033 0%, #3d2817 100%);
  border-radius: 2px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
}

/* 画布包装器 */
.canvas-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.1, 1);
  width: min(60vw, 560px);
  height: min(60vw, 560px);
  z-index: 3;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  cursor: crosshair;
}

.canvas-wrapper.canvas-unfolded {
  transform: translate(-50%, -50%) scale(1, 1);
}

.paint-canvas,
.ai-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 1px;
}

.ai-canvas {
  pointer-events: none;
  z-index: 1;
}

.paper-texture-overlay {
  position: absolute;
  inset: 0;
  background-color: #fdfbf7;
  pointer-events: none;
  z-index: 2;
  opacity: 0.93;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
}

/* AI 画外音便签 */
.ai-note {
  position: fixed;
  max-width: 200px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fffde7 0%, #fff9c4 100%);
  border-radius: 1px;
  box-shadow: 2px 3px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Ma Shan Zheng', cursive, serif;
  font-size: 15px;
  line-height: 1.6;
  color: #4a4a4a;
  z-index: 10;
  animation: noteAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes noteAppear {
  0% {
    opacity: 0;
    transform: scale(0.85) translateY(8px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.note-float-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.note-float-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}

/* 工具层 */
.tools-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
}

.tool {
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              filter 0.3s ease;
  filter: drop-shadow(2px 3px 6px rgba(0, 0, 0, 0.15));
}

.tool:hover {
  transform: translateY(-3px);
  filter: drop-shadow(3px 5px 10px rgba(0, 0, 0, 0.2));
}

.tool:active {
  transform: translateY(-1px);
  filter: drop-shadow(1px 2px 4px rgba(0, 0, 0, 0.15));
}

/* 画笔工具 */
.brush-tool {
  top: 18%;
  left: 12%;
  width: 50px;
  height: 140px;
  animation: toolSlideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) 1.4s both;
}

.brush-tool.tool-lifted {
  transform: translate(-5px, -8px);
  filter: drop-shadow(4px 6px 12px rgba(0, 0, 0, 0.25));
}

.brush-svg {
  width: 100%;
  height: 100%;
  color: var(--brush-color, #2c2416);
}

.brush-bristles,
.brush-tip {
  transition: fill 0.25s ease;
}

/* 调色盘工具 */
.palette-tool {
  top: 16%;
  right: 14%;
  width: 110px;
  height: 75px;
  animation: toolDropIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) 1.52s both;
}

.palette-svg {
  width: 100%;
  height: 100%;
}

.palette-dot {
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
              filter 0.2s ease;
  filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.2));
}

.palette-dot:hover {
  transform: scale(1.15);
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

.palette-dot.dot-selected {
  transform: scale(1.1);
  filter: drop-shadow(0 0 6px currentColor);
}

.water-dot {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.water-dot:hover {
  transform: scale(1.2);
}

/* 水桶工具 */
.bucket-tool {
  bottom: 18%;
  left: 13%;
  width: 65px;
  height: 78px;
  animation: toolFloatIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) 1.64s both;
}

.bucket-svg {
  width: 100%;
  height: 100%;
}

.bucket-tool.washing .bucket-svg {
  animation: washMotion 0.6s ease-in-out;
}

@keyframes washMotion {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

.water-surface {
  animation: waterWave 2s ease-in-out infinite;
}

@keyframes waterWave {
  0%, 100% { transform: scaleY(1); opacity: 0.6; }
  50% { transform: scaleY(1.1); opacity: 0.8; }
}

.water-ripple {
  animation: rippleExpand 1.5s ease-out infinite;
}

@keyframes rippleExpand {
  0% { transform: scale(0.95); opacity: 0.6; }
  100% { transform: scale(1.15); opacity: 0; }
}

/* 新画布工具 */
.new-canvas-tool {
  bottom: 17%;
  right: 14%;
  width: 72px;
  height: 85px;
  animation: toolFloatIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) 1.76s both;
}

.paper-stack-svg {
  width: 100%;
  height: 100%;
}

.new-canvas-tool:hover .paper-stack-svg {
  animation: paperShuffle 0.4s ease;
}

@keyframes paperShuffle {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px) rotate(-0.5deg); }
  75% { transform: translateX(2px) rotate(0.5deg); }
}

/* 工具入场动画 */
@keyframes toolSlideIn {
  0% {
    opacity: 0;
    transform: translateX(-40px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toolDropIn {
  0% {
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toolFloatIn {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 笔刷大小控制 */
.brush-size-control {
  position: fixed;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: rgba(253, 251, 247, 0.92);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  z-index: 6;
  animation: fadeInUp 0.4s ease;
}

.size-slider {
  width: 120px;
  height: 4px;
  appearance: none;
  background: #e8dcc8;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.size-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #8B9A7D;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.size-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.size-label {
  font-family: serif;
  font-size: 13px;
  color: #6b5d4d;
  min-width: 32px;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .easel-frame {
    width: 85vw;
    height: 85vw;
  }

  .canvas-wrapper {
    width: 80vw;
    height: 80vw;
  }

  .brush-tool {
    top: 10%;
    left: 5%;
    width: 40px;
    height: 110px;
  }

  .palette-tool {
    top: 8%;
    right: 5%;
    width: 85px;
    height: 58px;
  }

  .bucket-tool {
    bottom: 10%;
    left: 5%;
    width: 50px;
    height: 60px;
  }

  .new-canvas-tool {
    bottom: 9%;
    right: 5%;
    width: 56px;
    height: 66px;
  }

  .brush-size-control {
    bottom: 3%;
    padding: 8px 16px;
  }

  .size-slider {
    width: 80px;
  }

  .ai-note {
    font-size: 13px;
    max-width: 160px;
    padding: 10px 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
