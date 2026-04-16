<!--  太空站模拟游戏（副本版本），旅客接待和资源管理 -->
<template>
  <div class="space-station" :class="{ 'system-active': systemActive }">
    <canvas ref="spaceCanvas" class="deep-space-canvas"></canvas>

    <div class="porthole-frame">
      <svg class="frame-svg" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
        <rect class="frame-border" x="40" y="30" width="920" height="640" rx="12" />
        <rect class="frame-inner" x="50" y="40" width="900" height="620" rx="8" />
        <circle class="rivet" cx="60" cy="50" r="5" />
        <circle class="rivet" cx="940" cy="50" r="5" />
        <circle class="rivet" cx="60" cy="650" r="5" />
        <circle class="rivet" cx="940" cy="650" r="5" />
        <line class="frame-line-h" x1="200" y1="35" x2="800" y2="35" />
        <line class="frame-line-h" x1="200" y1="665" x2="800" y2="665" />
        <line class="frame-line-v" x1="45" y1="150" x2="45" y2="550" />
        <line class="frame-line-v" x1="955" y1="150" x2="955" y2="550" />
      </svg>
    </div>

    <div class="holo-console">
      <div class="console-shell">
        <div class="console-bezel"></div>
        <div class="console-screen">
          <div class="screen-header">
            <div class="station-id">
              <span class="id-label">STATION</span>
              <span class="id-value">{{ stationId }}</span>
            </div>
            <div class="credits-display">
              <svg class="credit-icon" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M12 6v12M8 10h8M8 14h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span class="credit-value">{{ animatedCredits }}</span>
            </div>
          </div>

          <div class="status-panel">
            <div class="status-bar" v-for="(stat, idx) in baseStats" :key="'stat-' + idx"
                 :class="{ warning: stat.value < 30, critical: stat.value < 15 }">
              <div class="stat-label">
                <svg class="stat-icon" viewBox="0 0 20 20" v-html="stat.icon"></svg>
                <span>{{ stat.name }}</span>
              </div>
              <div class="stat-track">
                <div class="stat-fill" :style="{ width: stat.value + '%', '--stat-color': stat.color }"></div>
                <span class="stat-num">{{ Math.round(stat.value) }}%</span>
              </div>
            </div>
          </div>

          <div class="traveler-card" v-if="currentTraveler" :class="{ arriving: travelerArriving }">
            <div class="card-glow"></div>
            <div class="card-content">
              <div class="traveler-avatar">
                <div class="avatar-ring"></div>
                <span class="avatar-symbol">{{ currentTraveler.symbol }}</span>
              </div>
              <div class="traveler-info">
                <h3 class="traveler-name">{{ currentTraveler.name }}</h3>
                <p class="traveler-origin">来自 {{ currentTraveler.origin }}</p>
                <div class="traveler-needs">
                  <span class="need-tag" v-for="(need, ni) in currentTraveler.needs" :key="'need-' + ni"
                        :style="{ '--tag-color': need.color }">{{ need.text }}</span>
                </div>
              </div>
              <div class="traveler-reward">
                <span class="reward-label">报酬</span>
                <span class="reward-value">+{{ currentTraveler.reward }}</span>
              </div>
            </div>
          </div>

          <div class="empty-traveler" v-else>
            <div class="waiting-indicator">
              <div class="pulse-ring"></div>
              <span>等待旅人信号...</span>
            </div>
          </div>

          <div class="event-alert" v-if="activeEvent" :class="activeEvent.severity">
            <div class="alert-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2L2 20h20L12 2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <line x1="12" y1="9" x2="12" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="17" r="1" fill="currentColor"/>
              </svg>
            </div>
            <div class="alert-text">
              <strong>{{ activeEvent.title }}</strong>
              <p>{{ activeEvent.desc }}</p>
            </div>
            <button class="resolve-btn" @click="resolveEvent">处理</button>
          </div>

          <div class="facilities-panel">
            <div class="facility-item" v-for="(fac, fi) in facilities" :key="'fac-' + fi"
                 :class="{ online: fac.online, upgrading: fac.upgrading }"
                 @click="upgradeFacility(fi)">
              <div class="facility-led" :style="{ background: fac.online ? '#00ff88' : '#334' }"></div>
              <span class="facility-name">{{ fac.name }}</span>
              <span class="facility-lvl">Lv.{{ fac.level }}</span>
            </div>
          </div>
        </div>

        <div class="console-controls">
          <button class="holo-btn primary-btn" @click="receiveTraveler" :disabled="!currentTraveler || processing">
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>接入旅客</span>
          </button>
          <button class="holo-btn secondary-btn" @click="scanForTravelers" :disabled="scanning">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span>扫描信号</span>
          </button>
          <button class="holo-btn info-btn" @click="toggleComm">
            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>通讯</span>
          </button>
        </div>

        <div class="data-stream-lines">
          <svg viewBox="0 0 400 200" preserveAspectRatio="none">
            <path class="data-line dl-1" d="M0,100 Q100,50 200,100 T400,100" />
            <path class="data-line dl-2" d="M0,120 Q100,170 200,120 T400,120" />
            <path class="data-line dl-3" d="M0,80 Q100,30 200,80 T400,80" />
          </svg>
        </div>
      </div>
    </div>

    <div class="comm-terminal" :class="{ expanded: commExpanded }">
      <div class="terminal-scanline"></div>
      <div class="terminal-content">
        <div class="comm-messages">
          <div class="comm-msg" v-for="(msg, mi) in commMessages" :key="'msg-' + mi"
               :class="msg.role">
            <span class="msg-prefix">{{ msg.role === 'ai' ? '>' : '>>' }}</span>
            <span class="msg-text">{{ msg.text }}</span>
          </div>
          <div class="comm-typing" v-if="isTyping">
            <span class="typing-cursor">></span>
            <span class="typed-text">{{ typedText }}</span>
            <span class="blink-block">_</span>
          </div>
        </div>
      </div>
      <button class="comm-toggle" @click="toggleComm">
        <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
    </div>

    <div class="ship-silhouette" v-for="(ship, si) in passingShips" :key="'ship-' + si"
         :style="shipStyle(ship)">
      <svg viewBox="0 0 60 20" class="ship-svg">
        <path d="M5,10 L20,6 L50,8 L58,10 L50,12 L20,14 Z" fill="rgba(180,190,210,0.15)" stroke="rgba(150,160,180,0.25)" stroke-width="0.5"/>
        <circle cx="48" cy="10" r="1.5" fill="rgba(255,200,100,0.4)"/>
      </svg>
    </div>

    <transition name="boot-overlay">
      <div class="boot-sequence" v-if="showBoot">
        <div class="boot-text">
          <span v-for="(char, ci) in bootText" :key="'bt-' + ci"
                :style="{ '--boot-delay': (ci * 0.04) + 's' }">{{ char }}</span>
        </div>
        <div class="boot-progress">
          <div class="boot-bar" :style="{ width: bootProgress + '%' }"></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

const spaceCanvas = ref(null)
let ctx = null
let stars = []
let nebulae = []
let meteors = []
let animFrame = null

const systemActive = ref(false)
const showBoot = ref(true)
const bootText = ref('SYSTEM INITIALIZING... ORION-7 STATION')
const bootProgress = ref(0)

const stationId = ref('ORI-7742')
const credits = ref(2847)
const displayCredits = ref(2847)
const animatedCredits = computed(() => displayCredits.value.toLocaleString())

const baseStats = reactive([
  {
    name: '能源核心',
    value: 78,
    color: '#00ff88',
    icon: '<polygon points="10,2 18,18 2,18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><line x1="10" y1="9" x2="10" y2="16" stroke="currentColor" stroke-width="1.5"/>'
  },
  {
    name: '生命维持',
    value: 92,
    color: '#00ddff',
    icon: '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" fill="none" stroke="currentColor" stroke-width="1.5"/>'
  },
  {
    name: '信誉指数',
    value: 65,
    color: '#bf7fff',
    icon: '<polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>'
  }
])

const travelerPool = [
  { name: '艾拉·星辰', origin: '半人马座α', symbol: '◆', needs: [{ text: '补给燃料', color: '#ffaa00' }, { text: '休息舱', color: '#00ddff' }], reward: 320 },
  { name: '凯尔·虚空', origin: '天狼星扇区', symbol: '◇', needs: [{ text: '医疗检查', color: '#ff4466' }, { text: '数据同步', color: '#bf7fff' }], reward: 450 },
  { name: '米拉·银河', origin: '仙女座边缘', symbol: '○', needs: [{ text: '量子通讯', color: '#00ff88' }, { text: '热饮', color: '#ff8844' }], reward: 280 },
  { name: '泽恩·暗物质', origin: '猎户座深空', symbol: '△', needs: [{ text: '引擎维修', color: '#ff6600' }, { text: '能量充能', color: '#00ff88' }], reward: 520 },
  { name: '露娜·星尘', origin: '英仙座旋臂', symbol: '□', needs: [{ text: '休眠舱', color: '#00ddff' }, { text: '食物合成', color: '#ffcc00' }], reward: 380 }
]

const currentTraveler = ref(null)
const travelerArriving = ref(false)
const processing = ref(false)
const scanning = ref(false)

const facilities = reactive([
  { name: '停机坪', level: 3, online: true, upgrading: false },
  { name: '生活区', level: 4, online: true, upgrading: false },
  { name: '能源塔', level: 2, online: true, upgrading: false },
  { name: '通讯阵列', level: 3, online: false, upgrading: false }
])

const activeEvent = ref(null)

const eventPool = [
  { title: '太阳风暴预警', desc: '检测到高能粒子流，能源输出将暂时下降', severity: 'warning', effect: () => { baseStats[0].value = Math.max(10, baseStats[0].value - 20) }},
  { title: '旅客紧急求救', desc: '附近飞船发出 distress 信号，需要立即响应', severity: 'critical', effect: () => {} },
  { title: '贸易船到访', desc: '一艘星际商船请求停靠交易', severity: 'info', effect: () => { credits.value += 150; animateCredits() }}
]

const commExpanded = ref(true)
const commMessages = reactive([
  { role: 'system', text: '系统启动完成。欢迎回到 Orion-7。' },
  { role: 'ai', text: '检测到你回来了...坐标确认：第七旋臂，未知扇区。这里是我们的小小世界。' }
])
const isTyping = ref(false)
const typedText = ref('')

const passingShips = reactive([])

function initSpaceBackground() {
  if (!spaceCanvas.value) return
  const canvas = spaceCanvas.value
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  ctx = canvas.getContext('2d')

  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.3,
      alpha: Math.random(),
      twinkleSpeed: 0.005 + Math.random() * 0.02,
      twinklePhase: Math.random() * Math.PI * 2
    })
  }

  const nebulaColors = [
    [138, 43, 226],
    [75, 0, 130],
    [25, 25, 112],
    [148, 0, 211]
  ]

  for (let i = 0; i < 5; i++) {
    const colorIdx = Math.floor(Math.random() * nebulaColors.length)
    nebulae.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 100 + Math.random() * 200,
      color: nebulaColors[colorIdx],
      alpha: 0.03 + Math.random() * 0.06,
      driftX: (Math.random() - 0.5) * 0.08,
      driftY: (Math.random() - 0.5) * 0.05
    })
  }
}

function spawnMeteor() {
  if (meteors.length > 2) return
  meteors.push({
    x: Math.random() * window.innerWidth * 0.8,
    y: -20,
    vx: (Math.random() - 0.3) * 3,
    vy: 4 + Math.random() * 4,
    length: 40 + Math.random() * 60,
    alpha: 0.6 + Math.random() * 0.4,
    life: 1
  })
}

function renderSpace() {
  if (!ctx) return
  const w = ctx.canvas.width
  const h = ctx.canvas.height

  const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7)
  grad.addColorStop(0, '#0d0d1a')
  grad.addColorStop(0.5, '#070712')
  grad.addColorStop(1, '#000000')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  nebulae.forEach(n => {
    n.x += n.driftX
    n.y += n.driftY
    if (n.x < -n.radius) n.x = w + n.radius
    if (n.x > w + n.radius) n.x = -n.radius
    if (n.y < -n.radius) n.y = h + n.radius
    if (n.y > h + n.radius) n.y = -n.radius

    const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius)
    ng.addColorStop(0, `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${n.alpha})`)
    ng.addColorStop(0.5, `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${n.alpha * 0.4})`)
    ng.addColorStop(1, 'transparent')
    ctx.fillStyle = ng
    ctx.fillRect(n.x - n.radius, n.y - n.radius, n.radius * 2, n.radius * 2)
  })

  const time = Date.now() / 1000
  stars.forEach(s => {
    s.twinklePhase += s.twinkleSpeed
    const twinkle = 0.4 + Math.sin(s.twinklePhase) * 0.6

    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(220, 230, 255, ${s.alpha * twinkle})`
    ctx.fill()

    if (s.size > 1.3) {
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(180, 200, 255, ${s.alpha * twinkle * 0.08})`
      ctx.fill()
    }
  })

  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i]
    m.x += m.vx
    m.y += m.vy
    m.life -= 0.008

    if (m.life <= 0 || m.y > h + 50) {
      meteors.splice(i, 1)
      continue
    }

    const mg = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * m.length * 0.15, m.y - m.vy * m.length * 0.15)
    mg.addColorStop(0, `rgba(255, 255, 255, ${m.alpha * m.life})`)
    mg.addColorStop(0.3, `rgba(200, 220, 255, ${m.alpha * m.life * 0.5})`)
    mg.addColorStop(1, 'transparent')

    ctx.beginPath()
    ctx.moveTo(m.x, m.y)
    ctx.lineTo(m.x - m.vx * m.length * 0.15, m.y - m.vy * m.length * 0.15)
    ctx.strokeStyle = mg
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
}

function spawnPassingShip() {
  if (passingShips.length > 1) return
  const fromLeft = Math.random() > 0.5
  passingShips.push({
    x: fromLeft ? -80 : window.innerWidth + 80,
    y: 10 + Math.random() * 25,
    speed: 0.3 + Math.random() * 0.4,
    fromLeft,
    opacity: 0.08 + Math.random() * 0.12
  })

  setTimeout(() => {
    if (passingShips.length > 0) passingShips.shift()
  }, 12000)
}

function shipStyle(ship) {
  return {
    left: ship.x + 'px',
    top: ship.y + '%',
    opacity: ship.opacity
  }
}

function updateShips() {
  passingShips.forEach(ship => {
    ship.x += ship.fromLeft ? ship.speed : -ship.speed
  })
}

function animateCredits() {
  const target = credits.value
  const start = displayCredits.value
  const diff = target - start
  const steps = 30
  let step = 0

  const tick = setInterval(() => {
    step++
    displayCredits.value = Math.round(start + (diff * step / steps))
    if (step >= steps) {
      displayCredits.value = target
      clearInterval(tick)
    }
  }, 25)
}

function scanForTravelers() {
  scanning.value = true
  addAiMessage('正在扫描周围空间信号...')
  
  setTimeout(() => {
    scanning.value = false
    if (!currentTraveler.value) {
      const traveler = { ...travelerPool[Math.floor(Math.random() * travelerPool.length)] }
      currentTraveler.value = traveler
      travelerArriving.value = true
      
      addAiMessage(`检测到旅人信号——"${traveler.name}"，来自${traveler.origin}。正在建立连接...`)
      
      setTimeout(() => {
        travelerArriving.value = false
        addAiMessage(`连接完成。${traveler.name}的飞船已进入对接轨道。`)
      }, 2000)
    } else {
      addAiMessage('当前已有旅人在等待接待。请先完成当前服务。')
    }
  }, 2500)
}

function receiveTraveler() {
  if (!currentTraveler.value || processing.value) return
  processing.value = true
  
  addAiMessage(`开始为 ${currentTraveler.value.name} 提供服务...`)
  
  setTimeout(() => {
    credits.value += currentTraveler.value.reward
    animateCredits()
    
    baseStats.forEach(stat => {
      stat.value = Math.min(100, stat.value + Math.random() * 5)
    })
    
    addAiMessage(`${currentTraveler.value.name} 的需求已满足。获得 ${currentTraveler.value.reward} 星际币。`)
    
    addAiMessage('看着对方的飞船缓缓离开...在这无垠宇宙中，每一次相遇都是奇迹。')
    
    currentTraveler.value = null
    processing.value = false
    
    if (Math.random() < 0.25) {
      triggerEvent()
    }
  }, 3000)
}

function upgradeFacility(idx) {
  const fac = facilities[idx]
  if (fac.upgrading) return
  
  fac.upgrading = true
  addAiMessage(`正在升级 ${fac.name}...消耗资源中。`)
  
  setTimeout(() => {
    fac.level++
    fac.upgrading = false
    fac.online = true
    credits.value = Math.max(0, credits.value - 200 * fac.level)
    animateCredits()
    
    addAiMessage(`${fac.name} 已升级至 Lv.${fac.level}。设施效率提升。`)
  }, 2500)
}

function triggerEvent() {
  if (activeEvent.value) return
  const evt = { ...eventPool[Math.floor(Math.random() * eventPool.length)] }
  activeEvent.value = evt
  
  addAiMessage(`【警报】${evt.title} - ${evt.desc}`)
}

function resolveEvent() {
  if (!activeEvent.value) return
  
  activeEvent.value.effect()
  addAiMessage(`事件已处理。系统恢复正常运行状态。`)
  activeEvent.value = null
}

function toggleComm() {
  commExpanded.value = !commExpanded.value
}

function addAiMessage(text) {
  isTyping.value = true
  typedText.value = ''
  const chars = text.split('')
  let ci = 0
  
  const typeInterval = setInterval(() => {
    if (ci < chars.length) {
      typedText.value += chars[ci]
      ci++
    } else {
      clearInterval(typeInterval)
      commMessages.push({ role: 'ai', text: text })
      isTyping.value = false
      typedText.value = ''
      
      if (commMessages.length > 15) {
        commMessages.shift()
      }
    }
  }, 35)
}

function runBootSequence() {
  let progress = 0
  const bootInterval = setInterval(() => {
    progress += 1.8
    bootProgress.value = Math.min(100, progress)
    
    if (progress >= 100) {
      clearInterval(bootInterval)
      setTimeout(() => {
        showBoot.value = false
        systemActive.value = true
        
        setTimeout(() => {
          addAiMessage('坐标：未知扇区·第七旋臂。这里是全银河最远的驿站——但至少，我们在一起。')
          
          setTimeout(() => {
            scanForTravelers()
          }, 3000)
        }, 500)
      }, 600)
    }
  }, 50)
}

function gameLoop() {
  renderSpace()
  updateShips()
  animFrame = requestAnimationFrame(gameLoop)
}

onMounted(() => {
  initSpaceBackground()
  runBootSequence()
  
  nextTick(() => {
    gameLoop()
  })
  
  setInterval(() => {
    if (Math.random() < 0.03) spawnMeteor()
  }, 2000)
  
  setInterval(() => {
    if (systemActive.value && Math.random() < 0.015) spawnPassingShip()
  }, 5000)
  
  setInterval(() => {
    if (systemActive.value && !activeEvent.value && Math.random() < 0.06) {
      triggerEvent()
    }
  }, 18000)
  
  setInterval(() => {
    baseStats.forEach(stat => {
      const drain = Math.random() * 0.8
      stat.value = Math.max(5, stat.value - drain)
    })
  }, 8000)
})

onBeforeUnmount(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&family=Share+Tech+Mono&display=swap');

.space-station {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Orbitron', 'Share Tech Mono', monospace;
  background: #000;
  color: #c8d4e8;
}

.deep-space-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.porthole-frame {
  position: absolute;
  inset: 3% 5%;
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.system-active .porthole-frame {
  opacity: 1;
}

.frame-svg {
  width: 100%;
  height: 100%;
}

.frame-border {
  fill: none;
  stroke: #5a6a7a;
  stroke-width: 3;
  stroke-dasharray: 3500;
  stroke-dashoffset: 3500;
  filter: drop-shadow(0 0 8px rgba(90,106,122,0.3));
}

.system-active .frame-border {
  animation: frameDraw 1.2s ease-out 0.5s forwards;
}

@keyframes frameDraw {
  to { stroke-dashoffset: 0; }
}

.frame-inner {
  fill: none;
  stroke: rgba(122,139,140,0.25);
  stroke-width: 1;
  opacity: 0;
}

.system-active .frame-inner {
  animation: innerFade 0.8s ease-out 1.4s forwards;
}

@keyframes innerFade {
  to { opacity: 1; }
}

.rivet {
  fill: #5a6a7a;
  opacity: 0;
}

.system-active .rivet:nth-child(3) { animation: rivetPop 0.3s ease-out 1.1s forwards; }
.system-active .rivet:nth-child(4) { animation: rivetPop 0.3s ease-out 1.2s forwards; }
.system-active .rivet:nth-child(5) { animation: rivetPop 0.3s ease-out 1.3s forwards; }
.system-active .rivet:nth-child(6) { animation: rivetPop 0.3s ease-out 1.4s forwards; }

@keyframes rivetPop {
  from { opacity: 0; transform: scale(0); }
  to { opacity: 1; transform: scale(1); }
}

.frame-line-h, .frame-line-v {
  stroke: rgba(122,139,140,0.2);
  stroke-width: 1;
  opacity: 0;
}

.system-active .frame-line-h { animation: lineFade 0.5s ease-out 1.5s forwards; }
.system-active .frame-line-v { animation: lineFade 0.5s ease-out 1.6s forwards; }

@keyframes lineFade {
  to { opacity: 1; }
}

.holo-console {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.85);
  width: min(680px, 82vw);
  z-index: 3;
  opacity: 0;
  transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.system-active .holo-console {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
  transition-delay: 1.3s;
}

.console-shell {
  position: relative;
  background: linear-gradient(145deg, rgba(18,22,38,0.92), rgba(10,12,24,0.95));
  border-radius: 16px;
  border: 1px solid rgba(138,86,214,0.2);
  box-shadow:
    0 0 40px rgba(138,86,214,0.08),
    0 0 80px rgba(0,0,0,0.5),
    inset 0 1px 0 rgba(255,255,255,0.05),
    inset 0 0 30px rgba(0,0,0,0.4);
  backdrop-filter: blur(12px);
  overflow: hidden;
}

.console-bezel {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  border: 1px solid rgba(138,86,214,0.15);
  pointer-events: none;
  background: linear-gradient(
    135deg,
    rgba(138,86,214,0.03) 0%,
    transparent 50%,
    rgba(0,221,255,0.02) 100%
  );
}

.console-screen {
  padding: 20px 22px 16px;
  position: relative;
  z-index: 1;
}

.screen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(138,86,214,0.15);
}

.station-id {
  display: flex;
  align-items: center;
  gap: 8px;
}

.id-label {
  font-size: 9px;
  letter-spacing: 0.25em;
  color: rgba(138,86,214,0.6);
}

.id-value {
  font-size: 14px;
  font-weight: 700;
  color: #bf7fff;
  letter-spacing: 0.1em;
  text-shadow: 0 0 12px rgba(191,127,255,0.4);
}

.credits-display {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(0,255,136,0.06);
  border: 1px solid rgba(0,255,136,0.2);
  border-radius: 8px;
}

.credit-icon {
  width: 16px;
  height: 16px;
  color: #00ff88;
}

.credit-value {
  font-size: 15px;
  font-weight: 600;
  color: #00ff88;
  letter-spacing: 0.05em;
  font-family: 'Share Tech Mono', monospace;
  text-shadow: 0 0 8px rgba(0,255,136,0.3);
}

.status-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-label {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 80px;
  flex-shrink: 0;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: rgba(200,212,232,0.7);
}

.stat-icon {
  width: 16px;
  height: 16px;
  color: var(--stat-color, #00ff88);
  flex-shrink: 0;
}

.stat-track {
  flex: 1;
  height: 8px;
  background: rgba(255,255,255,0.04);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.06);
}

.stat-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--stat-color), color-mix(in srgb, var(--stat-color) 70%, white));
  border-radius: 4px;
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 8px color-mix(in srgb, var(--stat-color) 40%, transparent);
  position: relative;
}

.stat-fill::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 12px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3));
  animation: statPulse 2s ease-in-out infinite;
}

@keyframes statPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.status-bar.warning .stat-fill {
  background: linear-gradient(90deg, #ffaa00, #ff8800);
  box-shadow: 0 0 8px rgba(255,170,0,0.4);
}

.status-bar.critical .stat-fill {
  background: linear-gradient(90deg, #ff4444, #ff2222);
  box-shadow: 0 0 12px rgba(255,68,68,0.5);
  animation: criticalFlash 0.8s ease-in-out infinite;
}

@keyframes criticalFlash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.stat-num {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 9px;
  font-family: 'Share Tech Mono', monospace;
  color: rgba(255,255,255,0.6);
  text-shadow: 0 0 4px rgba(0,0,0,0.5);
}

.traveler-card {
  background: linear-gradient(135deg, rgba(138,86,214,0.08), rgba(0,221,255,0.04));
  border: 1px solid rgba(138,86,214,0.2);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 14px;
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.traveler-card.arriving {
  animation: cardPulse 1.5s ease-in-out;
}

@keyframes cardPulse {
  0%, 100% { box-shadow: 0 0 0 rgba(138,86,214,0); }
  50% { box-shadow: 0 0 25px rgba(138,86,214,0.2), 0 0 50px rgba(138,86,214,0.1); }
}

.card-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(138,86,214,0.08) 0%, transparent 70%);
  pointer-events: none;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  z-index: 1;
}

.traveler-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid rgba(138,86,214,0.4);
  animation: ringRotate 8s linear infinite;
}

@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.avatar-ring::before {
  content: '';
  position: absolute;
  top: -3px;
  left: 50%;
  width: 4px;
  height: 4px;
  background: #bf7fff;
  border-radius: 50%;
  box-shadow: 0 0 6px #bf7fff;
}

.avatar-symbol {
  font-size: 20px;
  color: #bf7fff;
  text-shadow: 0 0 12px rgba(191,127,255,0.5);
}

.traveler-info {
  flex: 1;
  min-width: 0;
}

.traveler-name {
  margin: 0 0 3px;
  font-size: 13px;
  font-weight: 600;
  color: #e8eaf0;
  letter-spacing: 0.06em;
}

.traveler-origin {
  margin: 0 0 8px;
  font-size: 10px;
  color: rgba(200,212,232,0.5);
  letter-spacing: 0.05em;
}

.traveler-needs {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.need-tag {
  padding: 2px 8px;
  font-size: 9px;
  letter-spacing: 0.04em;
  background: color-mix(in srgb, var(--tag-color) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--tag-color) 30%, transparent);
  border-radius: 4px;
  color: var(--tag-color);
}

.traveler-reward {
  text-align: center;
  flex-shrink: 0;
}

.reward-label {
  display: block;
  font-size: 8px;
  color: rgba(200,212,232,0.4);
  letter-spacing: 0.1em;
  margin-bottom: 2px;
}

.reward-value {
  font-size: 16px;
  font-weight: 700;
  color: #00ff88;
  font-family: 'Share Tech Mono', monospace;
  text-shadow: 0 0 10px rgba(0,255,136,0.3);
}

.empty-traveler {
  background: rgba(255,255,255,0.02);
  border: 1px dashed rgba(138,86,214,0.15);
  border-radius: 12px;
  padding: 32px 16px;
  margin-bottom: 14px;
  text-align: center;
}

.waiting-indicator {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: rgba(200,212,232,0.35);
  letter-spacing: 0.1em;
}

.pulse-ring {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1.5px solid rgba(138,86,214,0.4);
  animation: pulseRing 2s ease-in-out infinite;
}

@keyframes pulseRing {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.4); opacity: 0.8; }
}

.event-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  margin-bottom: 14px;
  border: 1px solid;
  animation: alertSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.event-alert.warning {
  background: rgba(255,170,0,0.08);
  border-color: rgba(255,170,0,0.3);
}

.event-alert.critical {
  background: rgba(255,68,68,0.1);
  border-color: rgba(255,68,68,0.35);
  animation: alertSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1), criticalGlow 1s ease-in-out infinite;
}

.event-alert.info {
  background: rgba(0,221,255,0.06);
  border-color: rgba(0,221,255,0.25);
}

@keyframes alertSlideIn {
  from { opacity: 0; transform: translateY(-10px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes criticalGlow {
  0%, 100% { box-shadow: 0 0 10px rgba(255,68,68,0.1); }
  50% { box-shadow: 0 0 25px rgba(255,68,68,0.25); }
}

.alert-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  color: #ffaa00;
}

.event-alert.critical .alert-icon {
  color: #ff4444;
}

.event-alert.info .alert-icon {
  color: #00ddff;
}

.alert-text {
  flex: 1;
  min-width: 0;
}

.alert-text strong {
  display: block;
  font-size: 11px;
  color: #e8eaf0;
  letter-spacing: 0.06em;
  margin-bottom: 3px;
}

.alert-text p {
  margin: 0;
  font-size: 10px;
  color: rgba(200,212,232,0.6);
  line-height: 1.4;
}

.resolve-btn {
  padding: 6px 14px;
  font-family: 'Orbitron', monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(0,255,136,0.4);
  border-radius: 6px;
  background: rgba(0,255,136,0.1);
  color: #00ff88;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.resolve-btn:hover {
  background: rgba(0,255,136,0.2);
  box-shadow: 0 0 12px rgba(0,255,136,0.2);
}

.facilities-panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(138,86,214,0.1);
}

.facility-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 9px;
  letter-spacing: 0.04em;
}

.facility-item:hover {
  background: rgba(138,86,214,0.08);
  border-color: rgba(138,86,214,0.2);
}

.facility-item.upgrading {
  animation: upgradePulse 1s ease-in-out infinite;
}

@keyframes upgradePulse {
  0%, 100% { background: rgba(0,221,255,0.05); }
  50% { background: rgba(0,221,255,0.12); }
}

.facility-led {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 4px currentColor;
  transition: background 0.3s ease;
}

.facility-name {
  flex: 1;
  color: rgba(200,212,232,0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.facility-lvl {
  color: rgba(191,127,255,0.6);
  font-family: 'Share Tech Mono', monospace;
}

.console-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 14px 22px 18px;
  position: relative;
  z-index: 1;
}

.holo-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 12px 20px;
  border: 1px solid;
  border-radius: 10px;
  background: rgba(255,255,255,0.02);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: inherit;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(15px);
}

.system-active .holo-btn {
  opacity: 1;
  transform: translateY(0);
}

.system-active .primary-btn { transition-delay: 2.1s; }
.system-active .secondary-btn { transition-delay: 2.25s; }
.system-active .info-btn { transition-delay: 2.4s; }

.holo-btn svg {
  width: 22px;
  height: 22px;
  stroke: currentColor;
  stroke-width: 1.5;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.holo-btn span {
  font-size: 9px;
  letter-spacing: 0.12em;
}

.primary-btn {
  border-color: rgba(138,86,214,0.4);
  color: #bf7fff;
  box-shadow: 0 0 15px rgba(138,86,214,0.1), inset 0 0 12px rgba(138,86,214,0.05);
}

.primary-btn:hover:not(:disabled) {
  background: rgba(138,86,214,0.12);
  border-color: rgba(138,86,214,0.6);
  box-shadow: 0 0 25px rgba(138,86,214,0.25), inset 0 0 15px rgba(138,86,214,0.08);
  transform: translateY(-2px);
}

.primary-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.96);
}

.primary-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.secondary-btn {
  border-color: rgba(0,221,255,0.3);
  color: #00ddff;
  box-shadow: 0 0 12px rgba(0,221,255,0.08), inset 0 0 10px rgba(0,221,255,0.04);
}

.secondary-btn:hover:not(:disabled) {
  background: rgba(0,221,255,0.1);
  border-color: rgba(0,221,255,0.5);
  box-shadow: 0 0 20px rgba(0,221,255,0.2);
  transform: translateY(-2px);
}

.secondary-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.info-btn {
  border-color: rgba(0,255,136,0.25);
  color: #00ff88;
  box-shadow: 0 0 10px rgba(0,255,136,0.06), inset 0 0 8px rgba(0,255,136,0.03);
}

.info-btn:hover {
  background: rgba(0,255,136,0.08);
  border-color: rgba(0,255,136,0.4);
  box-shadow: 0 0 16px rgba(0,255,136,0.15);
  transform: translateY(-2px);
}

.data-stream-lines {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  opacity: 0.06;
  pointer-events: none;
  overflow: hidden;
}

.data-line {
  fill: none;
  stroke: #bf7fff;
  stroke-width: 0.8;
  animation: dataFlow 4s linear infinite;
}

.dl-1 { animation-delay: 0s; }
.dl-2 { animation-delay: -1.3s; }
.dl-3 { animation-delay: -2.6s; }

@keyframes dataFlow {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -800; }
}

.data-line {
  stroke-dasharray: 20 10 15 10;
}

.comm-terminal {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(640px, 88vw);
  max-height: 180px;
  z-index: 5;
  background: linear-gradient(to top, rgba(5,8,18,0.96), rgba(8,12,26,0.92));
  border: 1px solid rgba(0,221,255,0.15);
  border-bottom: none;
  border-radius: 12px 12px 0 0;
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0;
}

.system-active .comm-terminal {
  opacity: 1;
  transition-delay: 2.6s;
}

.comm-terminal:not(.expanded) {
  max-height: 42px;
}

.terminal-scanline {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,221,255,0.015) 2px,
    rgba(0,221,255,0.015) 4px
  );
  pointer-events: none;
  animation: scanMove 8s linear infinite;
}

@keyframes scanMove {
  from { background-position: 0 0; }
  to { background-position: 0 100px; }
}

.terminal-content {
  padding: 14px 18px 12px;
  max-height: 130px;
  overflow-y: auto;
}

.comm-messages {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comm-msg {
  display: flex;
  gap: 8px;
  font-size: 11px;
  line-height: 1.6;
  animation: msgFadeIn 0.3s ease-out;
}

@keyframes msgFadeIn {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}

.comm-msg.system .msg-prefix {
  color: rgba(0,221,255,0.5);
}

.comm-msg.ai .msg-prefix {
  color: #bf7fff;
}

.msg-prefix {
  font-family: 'Share Tech Mono', monospace;
  flex-shrink: 0;
  font-weight: 600;
}

.msg-text {
  color: rgba(200,212,232,0.8);
  word-break: break-word;
}

.comm-typing {
  display: flex;
  gap: 8px;
  font-size: 11px;
  line-height: 1.6;
  animation: msgFadeIn 0.3s ease-out;
}

.typing-cursor {
  color: #bf7fff;
  font-weight: 600;
  font-family: 'Share Tech Mono', monospace;
}

.typed-text {
  color: rgba(200,212,232,0.8);
}

.blink-block {
  color: #bf7fff;
  animation: blinkCursor 0.6s step-end infinite;
}

@keyframes blinkCursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.comm-toggle {
  position: absolute;
  top: 6px;
  right: 10px;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: rgba(0,221,255,0.4);
  transition: transform 0.3s ease, color 0.3s ease;
  padding: 4px;
}

.comm-toggle:hover {
  color: #00ddff;
}

.comm-toggle svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.3s ease;
}

.comm-terminal:not(.expanded) .comm-toggle svg {
  transform: rotate(180deg);
}

.ship-silhouette {
  position: absolute;
  z-index: 1;
  pointer-events: none;
  transition: opacity 0.5s ease;
}

.ship-svg {
  width: 60px;
  height: 20px;
}

.boot-sequence {
  position: absolute;
  inset: 0;
  z-index: 100;
  background: radial-gradient(ellipse at center, #0a0a1a 0%, #000000 70%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  animation: bootFadeOut 0.8s ease-in 3s forwards;
}

@keyframes bootFadeOut {
  to { opacity: 0; pointer-events: none; }
}

.boot-text {
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.2em;
  color: rgba(0,221,255,0.7);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 80%;
}

.boot-text span {
  opacity: 0;
  animation: bootCharIn 0.05s ease-out var(--boot-delay, 0s) forwards;
}

@keyframes bootCharIn {
  to { opacity: 1; }
}

.boot-progress {
  width: 260px;
  height: 2px;
  background: rgba(0,221,255,0.1);
  border-radius: 1px;
  overflow: hidden;
}

.boot-bar {
  height: 100%;
  background: linear-gradient(90deg, #00ddff, #bf7fff);
  border-radius: 1px;
  box-shadow: 0 0 10px rgba(0,221,255,0.4);
  transition: width 0.05s linear;
}
</style>
