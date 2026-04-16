<!-- 织梦 - 深海记忆气泡页面，含星云背景和记忆收集机制 -->
<template>
  <div class="dream-weaver" :class="{ 'entrance-complete': entranceComplete }">
    <!-- 深海层 -->
    <div class="deep-sea-layer"></div>

    <!-- 月光星云层 -->
    <canvas ref="nebulaCanvas" class="nebula-canvas"></canvas>

    <!-- 星尘粒子层 -->
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>

    <!-- 记忆气泡层 -->
    <div class="bubble-layer">
      <div
        v-for="bubble in memoryBubbles"
        :key="bubble.id"
        class="memory-bubble"
        :style="{
          left: bubble.x + '%',
          bottom: bubble.y + 'px',
          width: bubble.size + 'px',
          height: bubble.size + 'px',
          animationDelay: bubble.delay + 's',
          animationDuration: bubble.duration + 's'
        }"
        @click="popBubble(bubble)"
      >
        <span class="bubble-text">{{ bubble.date }}</span>
      </div>
    </div>

    <!-- 梦之池层 - 主角 -->
    <div class="dream-pool-layer">
      <canvas ref="poolCanvas" class="dream-pool-canvas"></canvas>
      <div class="pool-moonlight"></div>
      <div class="pool-ripple-layer">
        <div
          v-for="(ripple, index) in activeRipples"
          :key="'ripple-' + index"
          class="pool-ripple"
          :style="{
            left: ripple.x + 'px',
            top: ripple.y + 'px',
            borderColor: ripple.color,
            transform: `scale(${ripple.scale})`,
            opacity: ripple.opacity
          }"
        ></div>
      </div>

      <!-- 已吸收的光点 -->
      <div
        v-for="(fragment, index) in absorbedFragments"
        :key="'absorbed-' + index"
        class="absorbed-orb"
        :style="{
          left: fragment.x + 'px',
          top: fragment.y + 'px',
          background: fragment.color,
          boxShadow: `0 0 20px ${fragment.color}, 0 0 40px ${fragment.color}40`
        }"
      ></div>
    </div>

    <!-- 碎片层 -->
    <div class="fragment-layer">
      <div
        v-for="fragment in dreamFragments"
        :key="fragment.id"
        class="dream-fragment"
        :class="{ 
          'dragging': draggingFragment === fragment.id,
          'absorbed': fragment.absorbed 
        }"
        :style="{
          left: fragment.x + '%',
          top: fragment.y + '%',
          '--fragment-glow': fragment.glowColor,
          '--fragment-core': fragment.coreColor,
          animationDelay: fragment.floatDelay + 's'
        }"
        @mousedown="startDrag($event, fragment)"
        @touchstart.prevent="startDrag($event, fragment)"
      >
        <span class="fragment-icon">{{ fragment.icon }}</span>
        <span class="fragment-label">{{ fragment.label }}</span>
        <div class="fragment-trail" v-if="draggingFragment === fragment.id && trails.length > 0">
          <div
            v-for="(trail, idx) in trails.slice(-5)"
            :key="'trail-' + idx"
            class="trail-dot"
            :style="{
              left: trail.x + 'px',
              top: trail.y + 'px',
              opacity: (idx + 1) / 5 * 0.3
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 意识流文字层 -->
    <div class="consciousness-layer">
      <transition name="ink-spread">
        <div
          v-if="consciousnessText.visible"
          class="consciousness-text"
          :style="{ 
            left: consciousnessText.x + 'px', 
            top: consciousnessText.y + 'px' 
          }"
        >
          <div class="ink-drop" :class="{ spreading: consciousnessText.spreading }"></div>
          <p class="text-content" :class="{ revealed: consciousnessText.revealed }">
            {{ consciousnessText.text }}
          </p>
        </div>
      </transition>
    </div>

    <!-- 操作层 -->
    <div class="action-layer">
      <button
        class="weave-button"
        :class="{ 
          'ready': absorbedCount >= 3,
          'weaving': isWeaving 
        }"
        :disabled="absorbedCount < 3"
        @click="weaveDream"
      >
        <span class="button-text">织梦</span>
        <div class="button-moon-glow"></div>
      </button>
    </div>

    <!-- 入场引导 -->
    <transition name="guide-fade">
      <div v-if="showGuide" class="entrance-guide">
        <p class="guide-text">今晚，想做什么样的梦？</p>
        <div class="guide-sparkle"></div>
      </div>
    </transition>

    <!-- 梦境预览 -->
    <transition name="preview-fade">
      <div v-if="showPreview" class="dream-preview-overlay">
        <div class="preview-tunnel"></div>
        <div class="preview-core">
          <div class="core-light"></div>
        </div>
        <p class="preview-message">梦境已编织完成</p>
        <p class="preview-sub">晚安</p>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'

const nebulaCanvas = ref(null)
const poolCanvas = ref(null)
const particleCanvas = ref(null)

let nebulaCtx = null
let poolCtx = null
let particleCtx = null
let nebulaAnimationId = null
let particleAnimationId = null
let poolAnimationId = null

const entranceComplete = ref(false)
const showGuide = ref(false)
const showPreview = ref(false)
const isWeaving = ref(false)
const draggingFragment = ref(null)
const dragOffset = reactive({ x: 0, y: 0 })
const trails = ref([])
const lastTrailTime = ref(0)

const absorbedFragments = ref([])
const activeRipples = ref([])

const memoryBubbles = ref([
  { id: 1, x: 15 + Math.random() * 70, y: -120, size: 50 + Math.random() * 30, date: '03.12', delay: 0, duration: 14 + Math.random() * 10 },
  { id: 2, x: 20 + Math.random() * 60, y: -180, size: 60 + Math.random() * 25, date: '03.15', delay: 3, duration: 16 + Math.random() * 8 },
  { id: 3, x: 10 + Math.random() * 80, y: -140, size: 45 + Math.random() * 35, date: '03.18', delay: 6, duration: 13 + Math.random() * 12 }
])

const dreamFragments = ref([
  { id: 1, label: '飞翔', icon: '✧', coreColor: '#d4e4f7', glowColor: 'rgba(212,228,247,0.5)', x: 12, y: 22, originX: 12, originY: 22, absorbed: false, floatDelay: 0 },
  { id: 2, label: '海边', icon: '～', coreColor: '#c9dae8', glowColor: 'rgba(201,218,232,0.5)', x: 78, y: 18, originX: 78, originY: 18, absorbed: false, floatDelay: 1.2 },
  { id: 3, label: '星空', icon: '✦', coreColor: '#e0d4eb', glowColor: 'rgba(224,212,235,0.5)', x: 82, y: 58, originX: 82, originY: 58, absorbed: false, floatDelay: 2.4 },
  { id: 4, label: '糖果', icon: '♡', coreColor: '#ecd4dc', glowColor: 'rgba(236,212,220,0.5)', x: 18, y: 72, originX: 18, originY: 72, absorbed: false, floatDelay: 3.6 },
  { id: 5, label: '奔跑', icon: '›', coreColor: '#d4e8da', glowColor: 'rgba(212,232,218,0.5)', x: 72, y: 80, originX: 72, originY: 80, absorbed: false, floatDelay: 4.8 },
  { id: 6, label: '月光', icon: '◯', coreColor: '#dde4f0', glowColor: 'rgba(221,228,240,0.55)', x: 10, y: 48, originX: 10, originY: 48, absorbed: false, floatDelay: 6.0 }
])

const consciousnessText = reactive({
  visible: false,
  text: '',
  x: 0,
  y: 0,
  spreading: false,
  revealed: false
})

const particles = ref([])

const absorbedCount = computed(() => {
  return dreamFragments.value.filter(f => f.absorbed).length
})

onMounted(() => {
  nextTick(() => {
    initCanvases()
    initParticles()
    startEntranceSequence()
    startNebulaAnimation()
    startPoolAnimation()
    startParticleAnimation()
  })

  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', handleTouchDrag)
  window.addEventListener('touchend', stopDrag)
})

onUnmounted(() => {
  if (nebulaAnimationId) cancelAnimationFrame(nebulaAnimationId)
  if (particleAnimationId) cancelAnimationFrame(particleAnimationId)
  if (poolAnimationId) cancelAnimationFrame(poolAnimationId)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', handleTouchDrag)
  window.removeEventListener('touchend', stopDrag)
})

function initCanvases() {
  const w = window.innerWidth
  const h = window.innerHeight

  if (nebulaCanvas.value) {
    nebulaCanvas.value.width = w
    nebulaCanvas.value.height = h
    nebulaCtx = nebulaCanvas.value.getContext('2d')
  }

  if (poolCanvas.value) {
    const size = Math.min(w * 0.38, 360)
    poolCanvas.value.width = size
    poolCanvas.value.height = size * 0.65
    poolCtx = poolCanvas.value.getContext('2d')
  }

  if (particleCanvas.value) {
    particleCanvas.value.width = w
    particleCanvas.value.height = h
    particleCtx = particleCanvas.value.getContext('2d')
  }
}

function initParticles() {
  particles.value = []
  for (let i = 0; i < 60; i++) {
    particles.value.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 0.5 + Math.random() * 2,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: -0.05 - Math.random() * 0.1,
      opacity: 0.2 + Math.random() * 0.5,
      twinkleSpeed: 0.005 + Math.random() * 0.01,
      twinklePhase: Math.random() * Math.PI * 2
    })
  }
}

function handleResize() {
  initCanvases()
  initParticles()
}

function startEntranceSequence() {
  setTimeout(() => entranceComplete.value = true, 400)
  setTimeout(() => showGuide.value = true, 3200)
  setTimeout(() => showConsciousnessText('今晚，想做什么样的梦？'), 3800)
}

function startNebulaAnimation() {
  let angle = 0
  let breathPhase = 0

  function animate() {
    if (!nebulaCtx || !nebulaCanvas.value) return
    
    const w = nebulaCanvas.value.width
    const h = nebulaCanvas.value.height
    const cx = w / 2
    const cy = h / 2

    nebulaCtx.clearRect(0, 0, w, h)

    breathPhase += 0.003
    const breathe = 0.85 + Math.sin(breathPhase) * 0.15

    nebulaCtx.save()
    nebulaCtx.globalAlpha = breathe
    nebulaCtx.translate(cx, cy)
    nebulaCtx.rotate((angle * Math.PI) / 180)

    const maxR = Math.max(w, h) * 0.65

    const gradients = [
      { color1: 'rgba(100,120,160,0.08)', color2: 'rgba(100,120,160,0)', dist: 0.28, offset: 0 },
      { color1: 'rgba(140,130,170,0.07)', color2: 'rgba(140,130,170,0)', dist: 0.42, offset: 120 },
      { color1: 'rgba(120,140,160,0.06)', color2: 'rgba(120,140,160,0)', dist: 0.32, offset: 240 }
    ]

    gradients.forEach(g => {
      const rad = (g.offset * Math.PI) / 180
      const dx = Math.cos(rad) * maxR * g.dist
      const dy = Math.sin(rad) * maxR * g.dist
      
      const grad = nebulaCtx.createRadialGradient(dx, dy, 0, dx, dy, maxR * 0.45)
      grad.addColorStop(0, g.color1)
      grad.addColorStop(1, g.color2)
      
      nebulaCtx.fillStyle = grad
      nebulaCtx.beginPath()
      nebulaCtx.arc(dx, dy, maxR * 0.45, 0, Math.PI * 2)
      nebulaCtx.fill()
    })

    nebulaCtx.restore()

    angle += 0.008
    nebulaAnimationId = requestAnimationFrame(animate)
  }

  animate()
}

function startPoolAnimation() {
  let time = 0
  let moonAngle = 0

  function animatePool() {
    if (!poolCtx || !poolCanvas.value) return

    const w = poolCanvas.value.width
    const h = poolCanvas.value.height
    const cx = w / 2
    const cy = h / 2
    const rx = w * 0.46
    const ry = h * 0.44

    poolCtx.clearRect(0, 0, w, h)

    time += 0.0008
    moonAngle += 0.006

    const breathe = 1 + Math.sin(time) * 0.02

    poolCtx.save()
    poolCtx.translate(cx, cy)
    poolCtx.scale(breathe, breathe)

    const surfaceGrad = poolCtx.createRadialGradient(
      -rx * 0.2, -ry * 0.25, 0,
      0, 0, Math.max(rx, ry)
    )
    surfaceGrad.addColorStop(0, '#e8eef5')
    surfaceGrad.addColorStop(0.3, '#ccd8e4')
    surfaceGrad.addColorStop(0.65, '#98aabb')
    surfaceGrad.addColorStop(1, '#607080')

    poolCtx.beginPath()
    poolCtx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
    poolCtx.fillStyle = surfaceGrad
    poolCtx.fill()

    const edgeGrad = poolCtx.createLinearGradient(-rx, 0, rx, 0)
    edgeGrad.addColorStop(0, 'rgba(200,215,230,0.4)')
    edgeGrad.addColorStop(0.5, 'rgba(235,242,250,0.7)')
    edgeGrad.addColorStop(1, 'rgba(200,215,230,0.4)')
    
    poolCtx.strokeStyle = edgeGrad
    poolCtx.lineWidth = 1.5
    poolCtx.stroke()

    const mx = Math.cos(moonAngle) * rx * 0.65
    const my = Math.sin(moonAngle) * ry * 0.45 - ry * 0.15

    const moonGlow = poolCtx.createRadialGradient(mx, my, 0, mx, my, rx * 0.4)
    moonGlow.addColorStop(0, 'rgba(255,255,255,0.28)')
    moonGlow.addColorStop(0.5, 'rgba(220,235,250,0.12)')
    moonGlow.addColorStop(1, 'rgba(220,235,250,0)')

    poolCtx.fillStyle = moonGlow
    poolCtx.beginPath()
    poolCtx.ellipse(mx, my, rx * 0.4, ry * 0.28, moonAngle * 0.4, 0, Math.PI * 2)
    poolCtx.fill()

    poolCtx.restore()

    poolAnimationId = requestAnimationFrame(animatePool)
  }

  animatePool()
}

function startParticleAnimation() {
  function animateParticles() {
    if (!particleCtx || !particleCanvas.value) return

    const w = particleCanvas.value.width
    const h = particleCanvas.value.height

    particleCtx.clearRect(0, 0, w, h)

    particles.value.forEach(p => {
      p.twinklePhase += p.twinkleSpeed
      const twinkle = 0.4 + Math.sin(p.twinklePhase) * 0.6

      p.x += p.speedX
      p.y += p.speedY

      if (p.y < -10) {
        p.y = h + 10
        p.x = Math.random() * w
      }
      if (p.x < -10) p.x = w + 10
      if (p.x > w + 10) p.x = -10

      particleCtx.beginPath()
      particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      particleCtx.fillStyle = `rgba(220, 232, 245, ${p.opacity * twinkle})`
      particleCtx.fill()
    })

    particleAnimationId = requestAnimationFrame(animateParticles)
  }

  animateParticles()
}

function startDrag(event, fragment) {
  if (fragment.absorbed) return
  
  draggingFragment.value = fragment.id
  trails.value = []
  
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY

  dragOffset.x = clientX - (fragment.x / 100) * window.innerWidth
  dragOffset.y = clientY - (fragment.y / 100) * window.innerHeight
}

function handleDrag(event) {
  if (!draggingFragment.value) return

  const fragment = dreamFragments.value.find(f => f.id === draggingFragment.value)
  if (!fragment) return

  const newX = ((event.clientX - dragOffset.x) / window.innerWidth) * 100
  const newY = ((event.clientY - dragOffset.y) / window.innerHeight) * 100

  fragment.x = newX
  fragment.y = newY

  const now = Date.now()
  if (now - lastTrailTime.value > 50) {
    trails.value.push({ x: event.clientX, y: event.clientY })
    if (trails.value.length > 8) trails.value.shift()
    lastTrailTime.value = now
  }
}

function handleTouchDrag(event) {
  if (!draggingFragment.value || !event.touches[0]) return

  const fragment = dreamFragments.value.find(f => f.id === draggingFragment.value)
  if (!fragment) return

  fragment.x = ((event.touches[0].clientX - dragOffset.x) / window.innerWidth) * 100
  fragment.y = ((event.touches[0].clientY - dragOffset.y) / window.innerHeight) * 100
}

function stopDrag() {
  if (!draggingFragment.value) return

  const fragment = dreamFragments.value.find(f => f.id === draggingFragment.value)
  if (!fragment) return

  const poolRect = poolCanvas.value?.getBoundingClientRect()
  if (poolRect) {
    const fx = (fragment.x / 100) * window.innerWidth
    const fy = (fragment.y / 100) * window.innerHeight

    const inPool = fx > poolRect.left && fx < poolRect.right &&
                   fy > poolRect.top && fy < poolRect.bottom

    if (inPool) {
      absorbFragment(fragment)
    } else {
      returnToOrigin(fragment)
    }
  }

  draggingFragment.value = null
  trails.value = []
}

function absorbFragment(fragment) {
  fragment.absorbed = true

  const poolRect = poolCanvas.value.getBoundingClientRect()
  absorbedFragments.value.push({
    x: ((fragment.x / 100) * window.innerWidth) - poolRect.left + poolRect.width / 2,
    y: ((fragment.y / 100) * window.innerHeight) - poolRect.top + poolRect.height / 2,
    color: fragment.glowColor
  })

  addRipple(fragment)

  setTimeout(() => {
    if (absorbedCount.value >= 3) {
      showConsciousnessText('碎片正在凝聚...意识开始流动...')
    } else {
      const msgs = [
        '我感受到了这个愿望...',
        '这片碎片带着温度呢。',
        '它在池中轻轻荡漾。',
        '像是月光落入水中。'
      ]
      showConsciousnessText(msgs[Math.floor(Math.random() * msgs.length)])
    }
  }, 700)
}

function addRipple(fragment) {
  const poolRect = poolCanvas.value.getBoundingClientRect()
  const rx = ((fragment.x / 100) * window.innerWidth) - poolRect.left
  const ry = ((fragment.y / 100) * window.innerHeight) - poolRect.top

  const ripple = {
    x: rx,
    y: ry,
    scale: 0,
    opacity: 0.6,
    color: fragment.glowColor
  }
  activeRipples.value.push(ripple)

  let frame = 0
  function animateRipple() {
    ripple.scale += 1.5
    ripple.opacity -= 0.008

    if (ripple.opacity > 0 && frame < 75) {
      frame++
      requestAnimationFrame(animateRipple)
    } else {
      const idx = activeRipples.value.indexOf(ripple)
      if (idx > -1) activeRipples.value.splice(idx, 1)
    }
  }
  animateRipple()
}

function returnToOrigin(fragment) {
  fragment.x = fragment.originX
  fragment.y = fragment.originY
}

function popBubble(bubble) {
  const idx = memoryBubbles.value.findIndex(b => b.id === bubble.id)
  if (idx === -1) return

  memoryBubbles.value.splice(idx, 1)

  setTimeout(() => {
    const themes = ['星辰', '海洋', '飞翔', '相遇', '月光', '花海']
    showConsciousnessText(`那晚的梦...关于${themes[Math.floor(Math.random() * themes.length)]}...`)

    memoryBubbles.value.push({
      id: Date.now(),
      x: 15 + Math.random() * 70,
      y: -120,
      size: 45 + Math.random() * 35,
      date: `${String(new Date().getMonth() + 1).padStart(2,'0')}.${String(new Date().getDate()).padStart(2,'0')}`,
      delay: 0,
      duration: 13 + Math.random() * 11
    })
  }, 500)
}

async function showConsciousnessText(text) {
  consciousnessText.visible = false
  consciousnessText.spreading = false
  consciousnessText.revealed = false

  await nextTick()

  const container = document.querySelector('.dream-weaver')
  if (!container) return

  consciousnessText.text = text
  consciousnessText.x = container.offsetWidth / 2 - 140
  consciousnessText.y = container.offsetHeight * 0.74
  consciousnessText.visible = true

  setTimeout(() => consciousnessText.spreading = true, 60)
  setTimeout(() => consciousnessText.revealed = true, 400)
  setTimeout(() => consciousnessText.revealed = false, 9000)
  setTimeout(() => consciousnessText.spreading = false, 9500)
  setTimeout(() => consciousnessText.visible = false, 10000)
}

async function weaveDream() {
  if (isWeaving.value || absorbedCount.value < 3) return

  isWeaving.value = true
  showGuide.value = false

  await new Promise(r => setTimeout(r, 1800))
  showPreview.value = true
  showConsciousnessText('...所有的碎片都找到了归宿...')

  await new Promise(r => setTimeout(r, 4500))

  showPreview.value = false

  dreamFragments.value.forEach(f => {
    f.absorbed = false
    f.x = f.originX
    f.y = f.originY
  })
  absorbedFragments.value = []
  activeRipples.value = []

  isWeaving.value = false

  setTimeout(() => showConsciousnessText('新的夜晚，新的梦境在等待...'), 900)
}
</script>

<style scoped>
.dream-weaver {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 40%, #141c2e 0%, #0c1220 40%, #070d18 70%, #030810 100%);
  opacity: 0;
  transition: opacity 2s ease-in-out;
}

.dream-weaver.entrance-complete {
  opacity: 1;
}

/* 深海层 */
.deep-sea-layer {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(80, 100, 140, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 75% 70%, rgba(100, 90, 130, 0.03) 0%, transparent 45%),
    radial-gradient(ellipse at 50% 50%, rgba(60, 80, 110, 0.02) 0%, transparent 70%);
  z-index: 0;
}

/* 星云 */
.nebula-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  mix-blend-mode: screen;
}

/* 星尘粒子 */
.particle-canvas {
  position: absolute;
  inset: 0;
  z-index: 1.2;
  pointer-events: none;
}

/* 记忆气泡 */
.bubble-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1.5;
  overflow: hidden;
}

.memory-bubble {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 28%, rgba(255, 255, 255, 0.09), rgba(180, 200, 230, 0.04) 45%, transparent 68%);
  box-shadow:
    inset 0 0 25px rgba(180, 210, 240, 0.05),
    0 0 20px rgba(180, 210, 240, 0.03);
  cursor: pointer;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: bubbleDrift linear infinite;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.memory-bubble:hover {
  transform: scale(1.1);
  box-shadow:
    inset 0 0 30px rgba(200, 220, 245, 0.08),
    0 0 30px rgba(200, 220, 245, 0.06);
}

.bubble-text {
  font-size: 11px;
  color: rgba(190, 210, 235, 0.45);
  font-family: Georgia, 'Times New Roman', serif;
  letter-spacing: 1.5px;
  font-style: italic;
}

@keyframes bubbleDrift {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  8% { opacity: 0.65; }
  92% { opacity: 0.65; }
  100% { transform: translateY(-135vh) translateX(25px); opacity: 0; }
}

/* 梦之池 - 主角 */
.dream-pool-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  z-index: 2;
  animation: poolMaterialize 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1.4s forwards;
}

@keyframes poolMaterialize {
  0% { transform: translate(-50%, -50%) scale(0.15); opacity: 0; filter: blur(20px); }
  60% { filter: blur(4px); }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; filter: blur(0); }
}

.dream-pool-canvas {
  border-radius: 50%;
}

.pool-moonlight {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140%;
  height: 140%;
  background: radial-gradient(
    ellipse at center,
    rgba(200, 220, 245, 0.07) 0%,
    rgba(200, 220, 245, 0.025) 35%,
    transparent 65%
  );
  border-radius: 50%;
  pointer-events: none;
  animation: moonBreath 7s ease-in-out infinite;
}

@keyframes moonBreath {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.06); }
}

.pool-ripple-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
}

.pool-ripple {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1.5px solid;
  transform-origin: center;
  pointer-events: none;
}

/* 已吸收的光点 */
.absorbed-orb {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: orbPulse 2.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes orbPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.4); }
}

/* 碎片层 */
.fragment-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}

.dream-fragment {
  position: absolute;
  padding: 11px 19px;
  border-radius: 26px;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.025) 100%
  );
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 0 16px var(--fragment-glow),
    inset 0 0 10px rgba(255, 255, 255, 0.04);
  cursor: grab;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.4s ease,
              opacity 0.6s ease;
  animation: fragmentFloat 10s ease-in-out infinite;
  user-select: none;
}

.dream-fragment:hover:not(.absorbed):not(.dragging) {
  transform: translateY(-5px) scale(1.06);
  box-shadow:
    0 0 28px var(--fragment-glow),
    0 6px 20px rgba(0, 0, 0, 0.2),
    inset 0 0 14px rgba(255, 255, 255, 0.06);
}

.dream-fragment.dragging {
  cursor: grabbing;
  transform: scale(1.1);
  box-shadow:
    0 0 36px var(--fragment-glow),
    0 10px 28px rgba(0, 0, 0, 0.3);
  z-index: 15;
}

.dream-fragment.absorbed {
  opacity: 0;
  transform: scale(0);
  pointer-events: none;
  transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fragment-icon {
  font-size: 20px;
  color: var(--fragment-core);
  text-shadow: 0 0 10px var(--fragment-glow);
  line-height: 1;
}

.fragment-label {
  font-size: 12px;
  color: rgba(220, 230, 245, 0.65);
  letter-spacing: 2px;
  font-weight: 300;
  font-family: Georgia, serif;
}

.fragment-trail {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
}

.trail-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--fragment-glow);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

@keyframes fragmentFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-7px) rotate(0.8deg); }
  66% { transform: translateY(3px) rotate(-0.4deg); }
}

/* 意识流文字 */
.consciousness-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 4;
}

.consciousness-text {
  position: absolute;
  max-width: 320px;
}

.ink-drop {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 5px;
  height: 5px;
  background: rgba(200, 220, 245, 0.85);
  border-radius: 50%;
  box-shadow: 0 0 14px rgba(200, 220, 245, 0.5), 0 0 28px rgba(200, 220, 245, 0.2);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease;
}

.ink-drop.spreading {
  transform: translate(-50%, -50%) scale(22);
  opacity: 0;
}

.text-content {
  position: relative;
  margin: 0;
  padding: 22px 30px;
  font-size: 17px;
  line-height: 2;
  color: rgba(210, 225, 240, 0.88);
  font-family: Georgia, 'Songti SC', 'SimSun', serif;
  letter-spacing: 4px;
  text-shadow: 0 0 24px rgba(180, 200, 230, 0.25);
  opacity: 0;
  filter: blur(4px);
  transition: opacity 1s ease, filter 0.7s ease;
}

.text-content.revealed {
  opacity: 1;
  filter: blur(0);
}

.ink-spread-enter-active { transition: opacity 0.5s ease; }
.ink-spread-enter-from { opacity: 0; }
.ink-spread-leave-active { transition: opacity 0.7s ease, transform 0.7s ease; }
.ink-spread-leave-to { opacity: 0; transform: scale(0.96); }

/* 操作按钮 */
.action-layer {
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  opacity: 0;
  animation: actionAppear 0.8s ease 2.8s forwards;
}

@keyframes actionAppear {
  to { opacity: 1; }
}

.weave-button {
  position: relative;
  padding: 16px 48px;
  border: none;
  border-radius: 30px 56px 38px 48px;
  background: linear-gradient(
    145deg,
    rgba(190, 205, 225, 0.5) 0%,
    rgba(150, 175, 200, 0.35) 100%
  );
  backdrop-filter: blur(16px);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow:
    0 3px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.weave-button:disabled {
  opacity: 0.28;
  cursor: not-allowed;
  background: linear-gradient(145deg, rgba(140, 155, 175, 0.25), rgba(100, 125, 150, 0.18));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.weave-button:not(:disabled).ready:hover {
  transform: translateY(-4px) scale(1.03);
  border-radius: 34px 52px 42px 46px;
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.22),
    0 0 35px rgba(190, 210, 230, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
}

.weave-button:not(:disabled).ready:active {
  transform: translateY(-2px) scale(0.99);
}

.weave-button.weaving {
  animation: weavingGlow 2s ease-in-out infinite;
}

@keyframes weavingGlow {
  0%, 100% { box-shadow: 0 3px 16px rgba(0,0,0,0.2), 0 0 18px rgba(190,210,230,0.1); }
  50% { box-shadow: 0 3px 16px rgba(0,0,0,0.2), 0 0 50px rgba(190,210,230,0.22); }
}

.button-text {
  position: relative;
  z-index: 2;
  font-size: 15px;
  font-weight: 400;
  font-family: Georgia, serif;
  color: rgba(200, 215, 235, 0.92);
  letter-spacing: 5px;
  text-shadow: 0 0 10px rgba(180, 200, 225, 0.3);
}

.button-moon-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(200, 220, 245, 0.08) 0%,
    transparent 50%,
    rgba(200, 220, 245, 0.04) 100%
  );
  opacity: 0;
  transition: opacity 0.5s ease;
}

.weave-button.ready .button-moon-glow {
  opacity: 1;
  animation: moonSweep 4s ease-in-out infinite;
}

@keyframes moonSweep {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}

/* 入场引导 */
.entrance-guide {
  position: absolute;
  top: 16%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 6;
}

.guide-text {
  margin: 0;
  font-size: 20px;
  color: rgba(190, 210, 235, 0.55);
  font-family: Georgia, 'Songti SC', 'SimSun', serif;
  letter-spacing: 8px;
  font-weight: 300;
  animation: guideBreath 5s ease-in-out infinite;
}

.guide-sparkle {
  margin: 16px auto 0;
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200, 220, 245, 0.3), transparent);
  animation: sparkleShimmer 3s ease-in-out infinite;
}

@keyframes guideBreath {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.85; }
}

@keyframes sparkleShimmer {
  0%, 100% { opacity: 0.3; transform: scaleX(0.8); }
  50% { opacity: 0.8; transform: scaleX(1.2); }
}

.guide-fade-enter-active { transition: opacity 1.4s ease; }
.guide-fade-enter-from { opacity: 0; }
.guide-fade-leave-active { transition: opacity 1s ease; }
.guide-fade-leave-to { opacity: 0; }

/* 梦境预览 */
.dream-preview-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  background: radial-gradient(ellipse at center, rgba(10, 18, 32, 0.94) 0%, rgba(5, 10, 20, 0.98) 100%);
}

.preview-tunnel {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 30%,
    rgba(5, 10, 20, 0.6) 70%,
    rgba(3, 6, 14, 0.95) 100%
  );
  animation: tunnelClose 1.5s ease-out forwards;
}

@keyframes tunnelClose {
  from { opacity: 0; }
  to { opacity: 1; }
}

.preview-core {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  animation: coreForm 2s ease-out 0.5s both;
}

@keyframes coreForm {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.core-light {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(
    circle at 40% 35%,
    rgba(220, 235, 250, 0.5) 0%,
    rgba(190, 210, 235, 0.2) 35%,
    rgba(160, 185, 220, 0.06) 60%,
    transparent 80%
  );
  box-shadow:
    0 0 60px rgba(190, 210, 235, 0.3),
    0 0 100px rgba(180, 200, 225, 0.15);
  animation: lightPulse 2.5s ease-in-out infinite;
}

@keyframes lightPulse {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.08); opacity: 1; }
}

.preview-message {
  margin-top: 48px;
  font-size: 22px;
  color: rgba(200, 218, 238, 0.82);
  font-family: Georgia, 'Songti SC', serif;
  letter-spacing: 6px;
  font-weight: 300;
  animation: msgFade 1s ease-out 1.2s both;
}

.preview-sub {
  margin-top: 12px;
  font-size: 16px;
  color: rgba(180, 200, 225, 0.5);
  font-family: Georgia, serif;
  letter-spacing: 10px;
  font-style: italic;
  animation: subFade 1s ease-out 1.8s both;
}

@keyframes msgFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes subFade { from { opacity: 0; } to { opacity: 1; } }

.preview-fade-enter-active { transition: opacity 1s ease; }
.preview-fade-enter-from { opacity: 0; }
.preview-fade-leave-active { transition: opacity 1.2s ease; }
.preview-fade-leave-to { opacity: 0; }

/* 响应式 */
@media (max-width: 768px) {
  .dream-fragment {
    padding: 9px 15px;
    border-radius: 22px;
  }
  .fragment-icon { font-size: 17px; }
  .fragment-label { font-size: 10px; letter-spacing: 1.5px; }
  .weave-button { padding: 13px 38px; }
  .button-text { font-size: 13px; letter-spacing: 4px; }
  .text-content { font-size: 15px; padding: 18px 24px; letter-spacing: 3px; }
  .guide-text { font-size: 17px; letter-spacing: 5px; }
  .preview-message { font-size: 19px; letter-spacing: 4px; }
}
</style>