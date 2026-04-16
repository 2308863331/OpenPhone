<!-- 时光当铺 - 复古当铺主题页面，含视差滚动和交易记录系统 -->
<template>
  <div class="pawnshop-container" :class="{ 'entrance-complete': entranceComplete }" @mousemove="handleParallax">
    <!-- 入场遮罩 -->
    <transition name="fade-door">
      <div v-if="showDoorText" class="door-overlay">
        <span class="door-text">推门声...</span>
      </div>
    </transition>

    <!-- Layer 6: 底层氛围 -->
    <div class="layer-base"></div>

    <!-- Layer 5: 老照片墙背景 -->
    <div class="photo-wall">
      <div v-for="(photo, index) in photos" :key="index" class="photo-item"
           :style="{ ...photo.style, transform: `translate(${parallaxX * photo.depth}px, ${parallaxY * photo.depth}px)` }">
        <div class="photo-inner" :style="{ backgroundImage: `url(${photo.url})` }"></div>
      </div>
    </div>

    <!-- Layer 4: 背景道具层 -->
    <div class="props-layer">
      <div class="ledger-book" @click="toggleLedger" title="查看交易记录">
        <svg viewBox="0 0 64 80" width="48" height="60">
          <rect x="4" y="8" width="56" height="68" rx="2" fill="#5D4037" stroke="#3E2723" stroke-width="2"/>
          <line x1="12" y1="20" x2="52" y2="20" stroke="#D4C5A9" stroke-width="1.5"/>
          <line x1="12" y1="30" x2="52" y2="30" stroke="#D4C5A9" stroke-width="1.5"/>
          <line x1="12" y1="40" x2="52" y2="40" stroke="#D4C5A9" stroke-width="1.5"/>
          <line x1="12" y1="50" x2="42" y2="50" stroke="#D4C5A9" stroke-width="1.5"/>
          <circle cx="18" cy="14" r="2" fill="#B8860B"/>
        </svg>
        <span class="prop-label">账本</span>
      </div>
      <div class="abacus-prop" title="算盘">
        <svg viewBox="0 0 80 100" width="50" height="62">
          <rect x="10" y="5" width="60" height="90" rx="4" fill="#8B4513" stroke="#5D4037" stroke-width="2"/>
          <line x1="15" y1="25" x2="65" y2="25" stroke="#DEB887" stroke-width="2"/>
          <line x1="15" y1="55" x2="65" y2="55" stroke="#DEB887" stroke-width="2"/>
          <circle cx="22" cy="17" r="4" fill="#CD853F"/>
          <circle cx="34" cy="17" r="4" fill="#CD853F"/>
          <circle cx="46" cy="17" r="4" fill="#CD853F"/>
          <circle cx="58" cy="17" r="4" fill="#CD853F"/>
          <circle cx="22" cy="40" r="3.5" fill="#DEB887"/>
          <circle cx="34" cy="40" r="3.5" fill="#DEB887"/>
          <circle cx="46" cy="40" r="3.5" fill="#DEB887"/>
          <circle cx="58" cy="40" r="3.5" fill="#DEB887"/>
          <circle cx="22" cy="68" r="3.5" fill="#DEB887"/>
          <circle cx="34" cy="68" r="3.5" fill="#DEB887"/>
          <circle cx="46" cy="68" r="3.5" fill="#DEB887"/>
          <circle cx="58" cy="68" r="3.5" fill="#DEB887"/>
        </svg>
        <span class="prop-label">算盘</span>
      </div>
    </div>

    <!-- Layer 3: 柜台层 -->
    <div class="counter-layer">
      <div class="counter-surface"></div>
    </div>

    <!-- 顶部招牌 -->
    <transition name="fade-sign">
      <div v-if="entranceComplete" class="shop-sign">
        <div class="sign-board">
          <h1 class="shop-title">时光当铺</h1>
          <div class="sign-nails">
            <span class="nail nail-left"></span>
            <span class="nail nail-right"></span>
          </div>
        </div>
        <p class="shop-subtitle">以记忆易愿望</p>
      </div>
    </transition>

    <!-- Layer 2: 主体物件层 - 天平柜台 -->
    <transition name="fade-counter">
      <div v-if="entranceComplete" class="main-stage">
        <!-- 天平系统 -->
        <div class="balance-system" :style="{ transform: `rotate(${balanceAngle}deg)` }">
          <!-- 中央支点 -->
          <div class="balance-pivot">
            <svg viewBox="0 0 60 80" width="50" height="66">
              <polygon points="30,0 45,70 15,70" fill="#4A7C59" stroke="#2D4A35" stroke-width="2"/>
              <circle cx="30" cy="10" r="6" fill="#B8860B" stroke="#8B6914" stroke-width="2"/>
              <rect x="18" y="72" width="24" height="8" rx="2" fill="#3E2723"/>
            </svg>
          </div>

          <!-- 横梁 -->
          <div class="balance-beam">
            <div class="beam-line"></div>
          </div>

          <!-- 左侧托盘 - 回忆输入 -->
          <div class="tray tray-left" :class="{ 'active': hasMemory }">
            <div class="tray-plate">
              <div class="tray-chain chain-left"></div>
              <div class="memory-input-area">
                <textarea v-model="memoryContent" placeholder="在这里放下你的回忆..."
                          @focus="onMemoryFocus" @blur="onMemoryBlur"
                          :disabled="isTrading"></textarea>
                <button v-if="memoryContent && !isTrading" class="submit-memory-btn" @click="submitMemory">
                  典当此回忆
                </button>
              </div>
              <span class="tray-label">回忆</span>
            </div>
          </div>

          <!-- 右侧托盘 - 愿望输出 -->
          <div class="tray tray-right" :class="{ 'active': hasWish }">
            <div class="tray-plate">
              <div class="tray-chain chain-right"></div>
              <div class="wish-output-area">
                <div v-if="!currentWish" class="empty-wish">
                  <span>等待愿望降临</span>
                </div>
                <div v-else class="wish-ticket">
                  <div class="ticket-header">
                    <span class="ticket-no">No. {{ transactionCount }}</span>
                    <span class="ticket-date">{{ currentDate }}</span>
                  </div>
                  <div class="ticket-content">
                    <p class="wish-text">{{ displayedWish }}</p>
                  </div>
                  <div class="ticket-stamp" :class="{ 'stamped': showStamp }">
                    <span>成交</span>
                  </div>
                </div>
              </div>
              <span class="tray-label">愿望</span>
            </div>
          </div>
        </div>

        <!-- 老板台词区域 -->
        <div class="shopkeeper-dialog">
          <div class="dialog-bubble" :class="{ 'typing': isTyping }">
            <p class="dialog-text">{{ shopkeeperMessage }}</p>
            <span v-if="isTyping" class="typing-cursor">|</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- 蜡烛火焰 -->
    <transition name="fade-candle">
      <div v-if="entranceComplete" class="candle-container" @click="toggleCandle">
        <canvas ref="flameCanvas" class="flame-canvas" width="120" height="180"></canvas>
        <div class="candle-body">
          <div class="candle-wax"></div>
          <div class="candle-drip drip-1"></div>
          <div class="candle-drip drip-2"></div>
        </div>
        <div class="candle-glow"></div>
      </div>
    </transition>

    <!-- 保险柜入口 -->
    <transition name="fade-safebox">
      <div v-if="entranceComplete" class="safebox-entry" @click="toggleSafeBox" title="已典当的回忆">
        <svg viewBox="0 0 80 100" width="56" height="70">
          <rect x="10" y="10" width="60" height="80" rx="4" fill="#37474F" stroke="#263238" stroke-width="3"/>
          <rect x="16" y="16" width="48" height="68" rx="2" fill="#455A64" stroke="#37474F" stroke-width="2"/>
          <circle cx="40" cy="52" r="12" fill="#1A1A1A" stroke="#B8860B" stroke-width="3"/>
          <circle cx="40" cy="52" r="6" fill="#B8860B"/>
          <line x1="40" y1="46" x2="40" y2="50" stroke="#1A1A1A" stroke-width="2"/>
          <rect x="32" y="75" width="16" height="4" rx="1" fill="#546E7A"/>
        </svg>
        <span class="safebox-label">保险柜</span>
        <span v-if="transactionCount > 0" class="safebox-count">{{ transactionCount }}</span>
      </div>
    </transition>

    <!-- 账本面板 -->
    <transition name="slide-ledger">
      <div v-if="showLedgerPanel" class="ledger-panel">
        <div class="panel-header">
          <h3>交易记录</h3>
          <button class="close-panel-btn" @click="toggleLedger">×</button>
        </div>
        <div class="panel-content">
          <div v-if="transactions.length === 0" class="empty-record">
            <p>还没有任何交易记录</p>
            <p class="hint">典当一段回忆，开启第一笔交易</p>
          </div>
          <div v-for="(tx, index) in transactions" :key="tx.id" class="record-item">
            <div class="record-header">
              <span class="record-no">#{{ index + 1 }}</span>
              <span class="record-date">{{ formatDate(tx.date) }}</span>
            </div>
            <div class="record-memory">
              <strong>回忆:</strong> {{ tx.memory.content.substring(0, 30) }}...
            </div>
            <div class="record-wish">
              <strong>愿望:</strong> {{ tx.wish.content.substring(0, 30) }}...
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 保险柜面板 -->
    <transition name="slide-safebox">
      <div v-if="showSafeBoxPanel" class="safebox-panel">
        <div class="panel-header">
          <h3>已典当的回忆</h3>
          <button class="close-panel-btn" @click="toggleSafeBox">×</button>
        </div>
        <div class="panel-content">
          <div v-if="transactions.length === 0" class="empty-safebox">
            <p>保险柜空空如也</p>
            <p class="hint">你的回忆还都在你身边</p>
          </div>
          <div v-for="tx in transactions" :key="tx.id" class="memory-locker">
            <div class="locker-door">
              <span class="locker-id">{{ tx.id.substring(0, 8).toUpperCase() }}</span>
              <div class="locker-handle"></div>
            </div>
            <p class="locker-preview">{{ tx.memory.content.substring(0, 20) }}...</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const entranceComplete = ref(false)
const showDoorText = ref(true)
const parallaxX = ref(0)
const parallaxY = ref(0)

const memoryContent = ref('')
const hasMemory = ref(false)
const hasWish = ref(false)
const currentWish = ref(null)
const displayedWish = ref('')
const isTyping = ref(false)
const showStamp = ref(false)
const isTrading = ref(false)
const transactionCount = ref(0)
const transactions = ref([])

const balanceAngle = ref(0)
const targetAngle = ref(0)
let balanceAnimationId = null

const showLedgerPanel = ref(false)
const showSafeBoxPanel = ref(false)

const flameCanvas = ref(null)
let candleLit = ref(true)
let flameAnimationId = null
let particles = []

const shopkeeperMessages = [
  '又有人推开了这扇门…坐吧，蜡烛刚点上。',
  '嗯…这段记忆的分量，我掂量得出来。',
  '这可不是普通的回忆。你愿意拿它换什么？',
  '成交。这张当票收好，它比你想的更值钱。',
  '还是舍不得吧？那就拿回去，我不收手续费。',
  '今天是个特别的日子…这个愿望，我送你了。'
]
const shopkeeperMessage = ref(shopkeeperMessages[0])

const photos = ref([
  {
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iIzRhNGE0YSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjODg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+MTk0MCBlcmE8L3RleHQ+PC9zdmc+',
    style: { left: '5%', top: '15%', width: '140px', height: '175px' },
    depth: 0.3
  },
  {
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTgwIiBoZWlnaHQ9IjIyMCIgZmlsbD0iIzVhNGUzYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Zyo5Zyo6K6k5aSHPC90ZXh0Pjwvc3ZnPg==',
    style: { right: '8%', top: '10%', width: '126px', height: '154px' },
    depth: 0.5
  },
  {
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzRhNGU0YyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjExIiBmaWxsPSIjNzc3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5rS76Lev5YqoPC90ZXh0Pjwvc3ZnPg==',
    style: { left: '12%', bottom: '20%', width: '112px', height: '140px' },
    depth: 0.4
  },
  {
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTcwIiBoZWlnaHQ9IjIxMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTcwIiBoZWlnaHQ9IjIxMCIgZmlsbD0iIzVhNGQ0ZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOGFiYWZhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+6aaW5a6J5aSHPC90ZXh0Pjwvc3ZnPg==',
    style: { right: '15%', bottom: '15%', width: '119px', height: '147px' },
    depth: 0.6
  },
  {
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE5MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE5MCIgZmlsbD0iIzRhNGUzZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5bCP5aGr5aSHPC90ZXh0Pjwvc3ZnPg==',
    style: { left: '3%', top: '55%', width: '105px', height: '133px' },
    depth: 0.25
  },
  {
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTkwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iIzVkNGU0ZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEzIiBmaWxsPSIjOWFhOThhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5LiO5piPPC90ZXh0Pjwvc3ZnPg==',
    style: { right: '5%', top: '50%', width: '133px', height: '168px' },
    depth: 0.35
  }
])

const currentDate = ref('')

function getCurrentDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  currentDate.value = `${year}.${month}.${day}`
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('zh-CN')
}

async function startEntranceSequence() {
  await new Promise(resolve => setTimeout(resolve, 800))
  showDoorText.value = false
  
  await new Promise(resolve => setTimeout(resolve, 700))
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  entranceComplete.value = true
  
  await nextTick()
  initFlame()
  startBalanceIdle()
}

function handleParallax(e) {
  if (!entranceComplete.value) return
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  parallaxX.value = (e.clientX - centerX) / centerX * 15
  parallaxY.value = (e.clientY - centerY) / centerY * 10
}

function onMemoryFocus() {
  targetAngle.value = -8
}

function onMemoryBlur() {
  if (!hasMemory.value) {
    targetAngle.value = 0
  }
}

async function submitMemory() {
  if (!memoryContent.value.trim() || isTrading.value) return
  
  isTrading.value = true
  hasMemory.value = true
  targetAngle.value = -12
  
  shopkeeperMessage.value = shopkeeperMessages[1]
  
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  shopkeeperMessage.value = shopkeeperMessages[2]
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  await generateWish()
}

async function generateWish() {
  const wishes = [
    '愿你在某个午后，再次遇见那个让你心动的瞬间，而这一次，你会勇敢地伸出手。',
    '愿这段记忆化作一颗种子，在未来的某一天，开出你不曾预料的花朵。',
    '我为你换来了一个承诺：当你最需要勇气的时候，会想起今天放下的这份温柔。',
    '这笔交易的代价不小，但我给你的是——在迷茫时能找到方向的直觉。',
    '成交了。作为回报，命运会在你意想不到的时候，给你一个温柔的惊喜。',
    '你的回忆很珍贵。我用它换取了一个可能：未来某天，你会原谅那个曾经不够完美的自己。'
  ]
  
  currentWish = ref(wishes[Math.floor(Math.random() * wishes.length)])
  hasWish.value = true
  targetAngle.value = 8
  
  shopkeeperMessage.value = shopkeeperMessages[3]
  
  await new Promise(resolve => setTimeout(resolve, 800))
  
  await typeWriterEffect(currentWish.value)
  
  await new Promise(resolve => setTimeout(resolve, 500))
  
  showStamp.value = true
  
  const transaction = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    memory: {
      content: memoryContent.value,
      value: Math.floor(Math.random() * 50) + 51,
      timestamp: new Date(),
      status: 'pawned'
    },
    wish: {
      type: 'story',
      content: currentWish.value,
      costMemoryId: '',
      isGranted: true
    },
    date: new Date(),
    shopkeeperNote: shopkeeperMessages[3]
  }
  
  transactions.value.push(transaction)
  transactionCount.value++
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  targetAngle.value = 0
  isTrading.value = false
  memoryContent.value = ''
}

async function typeWriterEffect(text) {
  isTyping.value = true
  displayedWish.value = ''
  
  for (let i = 0; i < text.length; i++) {
    displayedWish.value += text[i]
    const delay = text[i] === '，' || text[i] === '。' ? 200 : 80
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  
  isTyping.value = false
}

function startBalanceIdle() {
  let time = 0
  const idleAnimate = () => {
    if (!entranceComplete.value) return
    
    time += 0.02
    const idleOffset = Math.sin(time) * 1.5
    
    const diff = targetAngle.value - balanceAngle.value
    balanceAngle.value += diff * 0.05 + idleOffset * 0.02
    
    balanceAnimationId = requestAnimationFrame(idleAnimate)
  }
  
  idleAnimate()
}

function initFlame() {
  if (!flameCanvas.value || !candleLit.value) return
  
  const ctx = flameCanvas.value.getContext('2d')
  const canvasWidth = 120
  const canvasHeight = 180
  
  for (let i = 0; i < 40; i++) {
    particles.push(createParticle(canvasWidth / 2, 140))
  }
  
  const animateFlame = () => {
    if (!candleLit.value || !ctx) return
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    
    particles.forEach((particle, index) => {
      particle.life -= 0.015
      particle.y -= particle.vy
      particle.x += Math.sin(particle.life * 10) * 0.5 + (Math.random() - 0.5) * 0.8
      particle.r *= 0.99
      
      if (particle.life <= 0) {
        particles[index] = createParticle(canvasWidth / 2, 140)
      }
      
      const alpha = particle.life
      const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.r)
      
      if (particle.life > 0.7) {
        gradient.addColorStop(0, `rgba(255, 255, 240, ${alpha})`)
        gradient.addColorStop(0.5, `rgba(255, 220, 100, ${alpha * 0.8})`)
        gradient.addColorStop(1, `rgba(255, 150, 50, 0)`)
      } else if (particle.life > 0.4) {
        gradient.addColorStop(0, `rgba(255, 230, 120, ${alpha})`)
        gradient.addColorStop(0.6, `rgba(255, 160, 60, ${alpha * 0.7})`)
        gradient.addColorStop(1, `rgba(200, 80, 20, 0)`)
      } else {
        gradient.addColorStop(0, `rgba(255, 140, 50, ${alpha * 0.8})`)
        gradient.addColorStop(0.5, `rgba(200, 60, 20, ${alpha * 0.5})`)
        gradient.addColorStop(1, `rgba(100, 20, 0, 0)`)
      }
      
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    })
    
    flameAnimationId = requestAnimationFrame(animateFlame)
  }
  
  animateFlame()
}

function createParticle(x, y) {
  return {
    x: x + (Math.random() - 0.5) * 15,
    y: y,
    r: Math.random() * 8 + 4,
    life: 1,
    vy: Math.random() * 1.5 + 0.8,
    vx: (Math.random() - 0.5) * 0.3
  }
}

function toggleCandle() {
  candleLit.value = !candleLit.value
  
  if (candleLit.value) {
    nextTick(() => initFlame())
  } else {
    if (flameAnimationId) {
      cancelAnimationFrame(flameAnimationId)
    }
    const ctx = flameCanvas.value?.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, 120, 180)
  }
}

function toggleLedger() {
  showLedgerPanel.value = !showLedgerPanel.value
  if (showLedgerPanel.value) {
    showSafeBoxPanel.value = false
  }
}

function toggleSafeBox() {
  showSafeBoxPanel.value = !showSafeBoxPanel.value
  if (showSafeBoxPanel.value) {
    showLedgerPanel.value = false
  }
}

onMounted(() => {
  getCurrentDate()
  startEntranceSequence()
})

onUnmounted(() => {
  if (balanceAnimationId) cancelAnimationFrame(balanceAnimationId)
  if (flameAnimationId) cancelAnimationFrame(flameAnimationId)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Ma+Shan+Zheng&family=ZCOOL+XiaoWei&display=swap');

.pawnshop-container {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  background: #1A1A1A;
  font-family: 'Noto Serif SC', serif;
}

.pawnshop-container.entrance-complete {
  background: #2A2520;
}

.layer-base {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(ellipse at center, rgba(212, 197, 169, 0.08) 0%, transparent 70%),
    linear-gradient(180deg, #2A2520 0%, #1F1B17 50%, #1A1613 100%);
  z-index: 0;
}

.layer-base::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(184, 134, 11, 0.03) 2px,
      rgba(184, 134, 11, 0.03) 3px
    );
  opacity: 0;
  transition: opacity 1.5s ease-in;
}

.pawnshop-container.entrance-complete .layer-base::before {
  opacity: 1;
}

.door-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.door-text {
  color: #D4C5A9;
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 28px;
  letter-spacing: 8px;
  animation: doorPulse 2s ease-in-out infinite;
}

@keyframes doorPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.fade-door-enter-active,
.fade-door-leave-active {
  transition: opacity 1s ease-out;
}

.fade-door-enter-from,
.fade-door-leave-to {
  opacity: 1;
}

.fade-door-enter-to,
.fade-door-leave-from {
  opacity: 0;
}

.photo-wall {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  transition: opacity 2s ease-in 0.8s;
}

.pawnshop-container.entrance-complete .photo-wall {
  opacity: 1;
}

.photo-item {
  position: absolute;
  filter: blur(8px);
  opacity: 0.25;
  transition: all 0.4s ease-out;
  will-change: transform;
}

.photo-item:hover {
  filter: blur(2px);
  opacity: 0.5;
  transform: scale(1.08) !important;
}

.photo-inner {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  border: 3px solid rgba(212, 197, 169, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.props-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1.5s ease-in 1.5s;
}

.pawnshop-container.entrance-complete .props-layer {
  opacity: 1;
  pointer-events: auto;
}

.ledger-book,
.abacus-prop {
  position: absolute;
  cursor: pointer;
  transition: transform 0.3s ease, filter 0.3s ease;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
}

.ledger-book:hover,
.abacus-prop:hover {
  transform: scale(1.08) translateY(-3px);
  filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.8)) brightness(1.1);
}

.ledger-book {
  top: 18%;
  right: 12%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.abacus-prop {
  top: 22%;
  left: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.prop-label {
  font-size: 11px;
  color: #D4C5A9;
  letter-spacing: 2px;
  writing-mode: vertical-rl;
  text-orientation: upright;
  opacity: 0.7;
}

.counter-layer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 35%;
  z-index: 3;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1.5s ease-in 1.8s;
}

.pawnshop-container.entrance-complete .counter-layer {
  opacity: 1;
}

.counter-surface {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, 
    transparent 0%,
    rgba(93, 64, 55, 0.3) 20%,
    rgba(93, 64, 55, 0.6) 40%,
    rgba(74, 54, 44, 0.85) 70%,
    #4E342E 100%
  );
  box-shadow: 
    0 -10px 40px rgba(0, 0, 0, 0.5),
    inset 0 2px 10px rgba(141, 110, 99, 0.3);
}

.counter-surface::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, 
    transparent 0%,
    rgba(184, 134, 11, 0.4) 30%,
    rgba(184, 134, 11, 0.6) 50%,
    rgba(184, 134, 11, 0.4) 70%,
    transparent 100%
  );
}

.shop-sign {
  position: fixed;
  top: 8%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  text-align: center;
}

.sign-board {
  position: relative;
  display: inline-block;
  padding: 20px 50px;
  background: linear-gradient(135deg, #5D4037 0%, #8D6E63 50%, #4E342E 100%);
  border: 4px solid #3E2723;
  border-radius: 4px;
  box-shadow: 
    0 8px 30px rgba(0, 0, 0, 0.6),
    inset 0 2px 8px rgba(141, 110, 99, 0.4),
    inset 0 -2px 8px rgba(0, 0, 0, 0.3);
}

.shop-title {
  margin: 0;
  font-size: 36px;
  font-weight: 700;
  color: #FFD93D;
  letter-spacing: 12px;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(255, 217, 61, 0.3);
  font-family: 'Noto Serif SC', serif;
}

.sign-nails {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.nail {
  position: absolute;
  top: 12px;
  width: 10px;
  height: 10px;
  background: radial-gradient(circle, #B8860B 40%, #8B6914 100%);
  border-radius: 50%;
  box-shadow: 
    inset 0 1px 2px rgba(255, 217, 61, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.5);
}

.nail-left {
  left: 14px;
}

.nail-right {
  right: 14px;
}

.shop-subtitle {
  margin-top: 12px;
  font-size: 14px;
  color: #D4C5A9;
  letter-spacing: 6px;
  opacity: 0.85;
}

.main-stage {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  width: 900px;
  max-width: 92vw;
}

.balance-system {
  position: relative;
  width: 100%;
  height: 420px;
  transform-origin: center center;
  transition: transform 0.1s ease-out;
}

.balance-pivot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 15;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.6));
}

.balance-beam {
  position: absolute;
  top: calc(50% - 33px);
  left: 10%;
  width: 80%;
  height: 4px;
  background: linear-gradient(90deg, #8B6914 0%, #B8860B 50%, #8B6914 100%);
  border-radius: 2px;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.5),
    inset 0 1px 2px rgba(255, 217, 61, 0.3);
}

.beam-line::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  background: rgba(74, 124, 89, 0.3);
  transform: translateY(-50%);
}

.tray {
  position: absolute;
  top: calc(50% + 10px);
  width: 320px;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tray-left {
  left: 5%;
}

.tray-right {
  right: 5%;
}

.tray.active {
  transform: translateY(15px);
}

.tray-plate {
  position: relative;
  background: linear-gradient(135deg, #4A7C59 0%, #5D8A6B 50%, #3D6B4A 100%);
  border: 3px solid #2D4A35;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.5),
    inset 0 2px 8px rgba(74, 124, 89, 0.3),
    inset 0 -2px 8px rgba(0, 0, 0, 0.2);
  min-height: 180px;
}

.tray-chain {
  position: absolute;
  top: -35px;
  width: 3px;
  height: 35px;
  background: repeating-linear-gradient(
    180deg,
    #B8860B 0px,
    #B8860B 6px,
    transparent 6px,
    transparent 10px
  );
}

.chain-left {
  left: 30%;
}

.chain-right {
  right: 30%;
}

.tray-label {
  position: absolute;
  bottom: -28px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 13px;
  color: #D4C5A9;
  letter-spacing: 4px;
  white-space: nowrap;
}

.memory-input-area textarea {
  width: 100%;
  height: 130px;
  background: rgba(212, 197, 169, 0.95);
  border: 2px solid #8D6E63;
  border-radius: 6px;
  padding: 14px;
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 16px;
  color: #3E2723;
  resize: none;
  outline: none;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.15);
  line-height: 1.6;
}

.memory-input-area textarea:focus {
  border-color: #B8860B;
  box-shadow: 
    inset 0 2px 8px rgba(0, 0, 0, 0.15),
    0 0 0 3px rgba(184, 134, 11, 0.2);
}

.memory-input-area textarea::placeholder {
  color: #8D6E63;
  font-style: italic;
}

.submit-memory-btn {
  margin-top: 12px;
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #B8860B 0%, #DAA520 100%);
  border: 2px solid #8B6914;
  border-radius: 6px;
  color: #FFF8DC;
  font-family: 'Noto Serif SC', serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 3px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 248, 220, 0.3);
}

.submit-memory-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 18px rgba(0, 0, 0, 0.4),
    inset 0 1px 2px rgba(255, 248, 220, 0.4);
  background: linear-gradient(135deg, #DAA520 0%, #FFD700 100%);
}

.submit-memory-btn:active {
  transform: translateY(1px);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.wish-output-area {
  min-height: 130px;
}

.empty-wish {
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(212, 197, 169, 0.5);
  font-style: italic;
  font-size: 14px;
  letter-spacing: 2px;
}

.wish-ticket {
  background: linear-gradient(135deg, #D4C5A9 0%, #E8DCC8 50%, #C9BA9A 100%);
  border: 2px solid #8D6E63;
  border-radius: 6px;
  padding: 16px;
  position: relative;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.3),
    inset 0 0 20px rgba(141, 110, 99, 0.1);
  filter: sepia(20%) contrast(95%);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #8D6E63;
  font-size: 11px;
  color: #5D4037;
  font-family: 'Courier New', monospace;
}

.ticket-content {
  min-height: 60px;
}

.wish-text {
  margin: 0;
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 15px;
  color: #3E2723;
  line-height: 1.7;
}

.ticket-stamp {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 50px;
  height: 50px;
  border: 3px solid #C41E3A;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(2) rotate(-20deg);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ticket-stamp span {
  color: #C41E3A;
  font-family: 'Noto Serif SC', serif;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 2px;
}

.ticket-stamp.stamped {
  opacity: 0.7;
  transform: scale(1) rotate(-15deg);
}

.shopkeeper-dialog {
  position: absolute;
  bottom: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  max-width: 88vw;
}

.dialog-bubble {
  background: linear-gradient(135deg, rgba(212, 197, 169, 0.95) 0%, rgba(232, 220, 200, 0.95) 100%);
  border: 2px solid #8D6E63;
  border-radius: 16px;
  padding: 18px 24px;
  position: relative;
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.4),
    inset 0 2px 8px rgba(255, 255, 255, 0.2);
  filter: sepia(15%);

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid #8D6E63;
  }

  &::after {
    content: '';
    position: absolute;
    top: -7px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid rgba(212, 197, 169, 0.95);
  }
}

.dialog-text {
  margin: 0;
  font-family: 'ZCOOL XiaoWei', 'Ma Shan Zheng', cursive;
  font-size: 15px;
  color: #3E2723;
  line-height: 1.7;
  min-height: 24px;
}

.typing-cursor {
  color: #B8860B;
  animation: cursorBlink 0.8s infinite;
  font-weight: bold;
}

@keyframes cursorBlink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.candle-container {
  position: fixed;
  bottom: 8%;
  right: 8%;
  z-index: 8;
  cursor: pointer;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 8px 20px rgba(255, 217, 61, 0.3));
}

.candle-container:hover {
  transform: scale(1.05);
}

.flame-canvas {
  position: absolute;
  top: -160px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.candle-body {
  position: relative;
  width: 40px;
  height: 120px;
  margin: 0 auto;
  background: linear-gradient(90deg, #F5E6D3 0%, #FFF8E7 40%, #F5E6D3 100%);
  border-radius: 4px 4px 0 0;
  box-shadow: 
    inset -5px 0 15px rgba(0, 0, 0, 0.1),
    inset 5px 0 15px rgba(0, 0, 0, 0.05),
    0 4px 15px rgba(0, 0, 0, 0.3);
}

.candle-wax {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: linear-gradient(180deg, transparent 0%, rgba(210, 180, 140, 0.4) 100%);
  border-radius: 0 0 4px 4px;
}

.candle-drip {
  position: absolute;
  width: 6px;
  height: 20px;
  background: linear-gradient(180deg, #FFF8E7 0%, #F5E6D3 100%);
  border-radius: 3px;
  top: 25%;
}

.drip-1 {
  left: -3px;
  transform: rotate(-8deg);
  height: 28px;
}

.drip-2 {
  right: -2px;
  transform: rotate(5deg);
  height: 22px;
  top: 35%;
}

.candle-glow {
  position: absolute;
  top: -180px;
  left: 50%;
  transform: translateX(-50%);
  width: 250px;
  height: 280px;
  background: radial-gradient(circle, rgba(255, 217, 61, 0.15) 0%, rgba(255, 183, 0, 0.06) 40%, transparent 70%);
  pointer-events: none;
  animation: glowPulse 4s ease-in-out infinite;
  opacity: 0;
  transition: opacity 1s ease;
}

.pawnshop-container.entrance-complete .candle-glow {
  opacity: 1;
}

@keyframes glowPulse {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.8; }
  50% { transform: translateX(-50%) scale(1.08); opacity: 1; }
}

.safebox-entry {
  position: fixed;
  bottom: 8%;
  left: 8%;
  z-index: 8;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: transform 0.3s ease, filter 0.3s ease;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
}

.safebox-entry:hover {
  transform: scale(1.08) translateY(-3px);
  filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.7));
}

.safebox-label {
  font-size: 11px;
  color: #D4C5A9;
  letter-spacing: 2px;
  writing-mode: vertical-rl;
  text-orientation: upright;
  opacity: 0.7;
}

.safebox-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #C41E3A;
  color: white;
  font-size: 11px;
  font-weight: bold;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', monospace;
  box-shadow: 0 2px 6px rgba(196, 30, 58, 0.5);
}

.ledger-panel,
.safebox-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 520px;
  max-width: 92vw;
  max-height: 70vh;
  background: linear-gradient(135deg, #D4C5A9 0%, #E8DCC8 100%);
  border: 4px solid #5D4037;
  border-radius: 12px;
  z-index: 100;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.6),
    inset 0 2px 10px rgba(255, 255, 255, 0.2);
  filter: sepia(10%);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 2px solid #8D6E63;
  background: linear-gradient(90deg, rgba(93, 64, 55, 0.1) 0%, transparent 100%);
}

.panel-header h3 {
  margin: 0;
  font-size: 20px;
  color: #3E2723;
  letter-spacing: 4px;
  font-weight: 600;
}

.close-panel-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #8D6E63;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  line-height: 1;
}

.close-panel-btn:hover {
  background: rgba(141, 110, 99, 0.2);
  color: #3E2723;
  transform: rotate(90deg);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.panel-content::-webkit-scrollbar {
  width: 8px;
}

.panel-content::-webkit-scrollbar-track {
  background: rgba(141, 110, 99, 0.1);
  border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #8D6E63;
  border-radius: 4px;
}

.empty-record,
.empty-safebox {
  text-align: center;
  padding: 40px 20px;
  color: #8D6E63;
}

.empty-record p:first-child,
.empty-safebox p:first-child {
  font-size: 16px;
  margin-bottom: 8px;
  color: #5D4037;
}

.hint {
  font-size: 13px;
  font-style: italic;
  opacity: 0.7;
}

.record-item,
.memory-locker {
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(141, 110, 99, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 14px;
  transition: all 0.3s ease;
}

.record-item:hover,
.memory-locker:hover {
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.record-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px;
  color: #8D6E63;
  font-family: 'Courier New', monospace;
}

.record-no {
  font-weight: bold;
  color: #B8860B;
}

.record-memory,
.record-wish {
  font-size: 14px;
  color: #3E2723;
  margin: 6px 0;
  line-height: 1.5;
}

.record-memory strong,
.record-wish strong {
  color: #5D4037;
}

.locker-door {
  background: linear-gradient(135deg, #37474F 0%, #546E7A 100%);
  border: 2px solid #263238;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.locker-id {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #B8860B;
  letter-spacing: 1px;
  font-weight: bold;
}

.locker-handle {
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #B8860B 40%, #8B6914 100%);
  border-radius: 50%;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
}

.locker-preview {
  margin: 0;
  font-size: 13px;
  color: #5D4037;
  font-style: italic;
}

.fade-sign-enter-active,
.fade-sign-leave-active,
.fade-counter-enter-active,
.fade-counter-leave-active,
.fade-candle-enter-active,
.fade-candle-leave-active {
  transition: opacity 1.2s ease-out, transform 1.2s ease-out;
}

.fade-sign-enter-from,
.fade-counter-enter-from,
.fade-candle-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-sign-leave-from,
.fade-counter-leave-from,
.fade-candle-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-sign-enter-to,
.fade-counter-enter-to,
.fade-candle-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.slide-ledger-enter-active,
.slide-ledger-leave-active,
.slide-safebox-enter-active,
.slide-safebox-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-ledger-enter-from,
.slide-safebox-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.slide-ledger-leave-to,
.slide-safebox-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

@media (max-width: 768px) {
  .main-stage {
    width: 96vw;
  }

  .balance-system {
    height: auto;
    min-height: 550px;
  }

  .tray {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    width: 100%;
    margin-bottom: 30px;
  }

  .tray-left {
    order: 1;
  }

  .tray-right {
    order: 2;
  }

  .balance-beam {
    display: none;
  }

  .balance-pivot {
    position: relative;
    top: auto;
    left: auto;
    transform: none;
    order: 0;
    margin-bottom: 20px;
  }

  .shop-title {
    font-size: 26px;
    letter-spacing: 6px;
  }

  .sign-board {
    padding: 14px 30px;
  }

  .candle-container {
    bottom: 5%;
    right: 5%;
    transform: scale(0.8);
  }

  .safebox-entry {
    bottom: 5%;
    left: 5%;
    transform: scale(0.8);
  }

  .shopkeeper-dialog {
    bottom: -120px;
  }

  .ledger-panel,
  .safebox-panel {
    width: 94vw;
    max-height: 75vh;
  }
}
</style>
