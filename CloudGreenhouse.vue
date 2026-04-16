<!-- 云端温室 - 蝴蝶花园温室场景，含穹顶结构和蝴蝶飞舞动效 -->
<template>
  <div class="greenhouse-scene" :class="{ 'scene-awake': sceneAwake }">
    <div class="sky-layer">
      <div class="sun-glow"></div>
      <div class="light-rays"></div>
    </div>

    <div class="dome-layer">
      <svg class="dome-frame" viewBox="0 0 800 300" preserveAspectRatio="none">
        <path class="dome-arc" d="M0,300 Q400,20 800,300" fill="none" />
        <path class="dome-glass" d="M0,300 Q400,20 800,300 L800,300 L0,300 Z" />
        <line class="dome-rib" x1="200" y1="300" x2="280" y2="115" />
        <line class="dome-rib" x1="400" y1="300" x2="400" y2="55" />
        <line class="dome-rib" x1="600" y1="300" x2="520" y2="115" />
        <line class="dome-hbeam" x1="150" y1="180" x2="650" y2="180" />
        <line class="dome-hbeam" x1="100" y1="240" x2="700" y2="240" />
      </svg>
      <div class="glass-reflection"></div>
    </div>

    <div class="flight-layer">
      <div 
        v-for="(butterfly, idx) in butterflies" 
        :key="'bf-' + idx"
        class="butterfly"
        :class="{ resting: butterfly.resting }"
        :style="butterflyStyle(butterfly, idx)"
      >
        <svg viewBox="0 0 40 30" class="butterfly-svg">
          <ellipse class="wing-left" cx="12" cy="15" rx="10" ry="14" />
          <ellipse class="wing-right" cx="28" cy="15" rx="10" ry="14" />
          <ellipse cx="20" cy="16" rx="2" ry="10" fill="rgba(80,60,40,0.6)" />
        </svg>
      </div>
      <div 
        v-for="(bee, idx) in bees" 
        :key="'bee-' + idx"
        class="bee"
        :style="beeStyle(bee, idx)"
      >
        <svg viewBox="0 0 24 18" class="bee-svg">
          <ellipse cx="12" cy="9" rx="7" ry="6" />
          <line x1="5" y1="6" x2="5" y2="1" stroke="rgba(80,60,40,0.4)" stroke-width="0.8" />
          <line x1="5" y1="12" x2="5" y2="17" stroke="rgba(80,60,40,0.4)" stroke-width="0.8" />
          <line x1="19" y1="6" x2="19" y2="1" stroke="rgba(80,60,40,0.4)" stroke-width="0.8" />
          <line x1="19" y1="12" x2="19" y2="17" stroke="rgba(80,60,40,0.4)" stroke-width="0.8" />
        </svg>
      </div>
    </div>

    <div class="flower-bed-layer">
      <div class="soil-base">
        <div class="soil-surface"></div>
        <div class="pot-group">
          <div 
            v-for="(flower, idx) in flowers" 
            :key="'fl-' + idx"
            class="flower-unit"
            :class="{ 'focused': focusedFlower === idx }"
            :style="{ '--fl-delay': (idx * 0.18) + 's', '--fl-x': flower.x }"
            @click="focusFlower(idx)"
          >
            <div class="pot">
              <div class="pot-body"></div>
              <div class="pot-rim"></div>
              <div class="soil-in-pot"></div>
            </div>
            <div class="plant-container" :style="plantTransform(flower)">
              <svg class="stem-svg" viewBox="0 0 30 120">
                <path class="stem-path" :d="stemPath(flower.growth)" />
                <template v-if="flower.growth > 0.2">
                  <path v-for="(leaf, li) in 3" :key="'leaf-' + li" 
                    class="leaf-path" 
                    :d="leafPath(li, flower.growth)"
                    :style="{ '--leaf-rot': (li * 35 - 35) + 'deg' }"
                  />
                </template>
              </svg>
              <div class="flower-head" :class="'stage-' + flowerStage(flower.growth)">
                <div 
                  v-for="(petal, pi) in petalCount(flower)" 
                  :key="'petal-' + pi"
                  class="petal"
                  :style="petalStyle(pi, petalCount(flower), flower.color)"
                ></div>
                <div class="flower-center"></div>
                <div class="flower-dew" v-if="flower.hasDew"></div>
              </div>
              <transition name="bloom-burst">
                <div class="pollen-cloud" v-if="flower.showPollen && flower.growth >= 1"></div>
              </transition>
            </div>
            <div class="water-droplets" v-if="flower.watering">
              <div v-for="d in 6" :key="'drop-' + d" class="droplet" :style="dropletStyle(d)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <canvas ref="particleCanvas" class="particle-canvas"></canvas>

    <div class="toolbar-layer">
      <div class="toolbar">
        <button 
          class="tool-btn water-btn" 
          :class="{ active: isWatering }"
          @mousedown="startWatering"
          @mouseup="stopWatering"
          @mouseleave="stopWatering"
          @touchstart.prevent="startWatering"
          @touchend.prevent="stopWatering"
        >
          <svg viewBox="0 0 48 48" class="tool-icon">
            <path d="M36,8 L28,8 L28,4 L20,4 L20,8 L12,8 C10,8 8,10 8,12 L8,20 L16,20 L16,32 C16,36 20,40 24,40 C28,40 32,36 32,32 L32,20 L40,20 L40,12 C40,10 38,8 36,8 Z" />
            <path class="water-stream" d="M24,40 Q24,46 22,50" stroke-dasharray="4 2" />
          </svg>
          <span class="tool-label">浇水</span>
        </button>
        
        <button class="tool-btn bouquet-btn" @click="openBouquet">
          <svg viewBox="0 0 48 48" class="tool-icon">
            <path d="M24,44 L20,38 L16,40 L18,34 L12,32 L18,28 L14,22 L22,24 L24,16 L26,24 L34,22 L30,28 L36,32 L30,34 L32,40 L28,38 Z" />
            <rect x="21" y="38" width="6" height="8" rx="1" />
          </svg>
          <span class="tool-label">花束</span>
        </button>

        <button class="tool-btn fertilizer-btn" :class="{ glowing: hasFertilizer }" @click="useFertilizer">
          <svg viewBox="0 0 48 48" class="tool-icon">
            <path d="M14,12 L34,12 L36,18 L34,42 L14,42 L12,18 Z" />
            <circle cx="20" cy="26" r="3" />
            <circle cx="28" cy="30" r="2.5" />
            <circle cx="24" cy="36" r="2" />
          </svg>
          <span class="tool-label">肥料</span>
        </button>

        <button class="tool-btn album-btn" @click="openAlbum">
          <svg viewBox="0 0 48 48" class="tool-icon">
            <rect x="10" y="8" width="28" height="34" rx="2" />
            <line x1="16" y1="16" x2="32" y2="16" />
            <line x1="16" y1="24" x2="28" y2="24" />
            <line x1="16" y1="32" x2="30" y2="32" />
          </svg>
          <span class="tool-label">花册</span>
        </button>
      </div>
    </div>

    <div class="petal-text-layer">
      <transition-group name="petal-fall" tag="div" class="petals-container">
        <div 
          v-for="(petal, idx) in fallingPetals" 
          :key="'fp-' + petal.id"
          class="falling-petal"
          :style="fallingPetalStyle(petal, idx)"
        >
          {{ petal.char }}
        </div>
      </transition-group>
    </div>

    <div class="message-display" :class="{ visible: currentMessage }">
      <p class="message-text">{{ currentMessage }}</p>
    </div>

    <div class="mood-header" :class="{ visible: showHeader }">
      <span class="mood-quote">{{ moodQuote }}</span>
    </div>

    <transition name="bouquet-panel">
      <div class="bouquet-overlay" v-if="showBouquet" @click.self="showBouquet = false">
        <div class="bouquet-panel">
          <h3 class="panel-title">我的花束</h3>
          <div class="bouquet-preview">
            <div v-for="(f, idx) in pickedFlowers" :key="'pick-' + idx" 
              class="mini-flower" :style="{ background: f.color }">
            </div>
            <span v-if="pickedFlowers.length === 0" class="empty-hint">点击盛开的花朵采摘</span>
          </div>
          <button class="action-btn" @click="sendBouquet" :disabled="pickedFlowers.length === 0">
            送给你
          </button>
        </div>
      </div>
    </transition>

    <transition name="album-panel">
      <div class="album-overlay" v-if="showAlbum" @click.self="showAlbum = false">
        <div class="album-panel">
          <h3 class="panel-title">成长回忆录</h3>
          <div class="album-entries">
            <div v-for="(entry, idx) in albumEntries" :key="'al-' + idx" class="album-entry">
              <div class="entry-dot" :style="{ background: entry.color }"></div>
              <div class="entry-info">
                <span class="entry-date">{{ entry.date }}</span>
                <span class="entry-mood">{{ entry.mood }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

const sceneAwake = ref(false)
const showHeader = ref(false)
const isWatering = ref(false)
const hasFertilizer = ref(true)
const showBouquet = ref(false)
const showAlbum = ref(false)
const focusedFlower = ref(-1)
const currentMessage = ref('')
const particleCanvas = ref(null)
let particleCtx = null
let animationId = null

const moodQuotes = [
  '今天...也想见你',
  '每一朵花，都是时间的形状',
  '慢慢来，花期不赶时间',
  '阳光正好，适合想你',
  '种下温柔，收获心动'
]
const moodQuote = ref(moodQuotes[0])

const aiMessages = [
  '早安...今天的阳光像你一样温暖',
  '谢谢你为我浇水，我好像又长大了一点',
  '这朵花开的时候，我在想你会不会来看它',
  '风吹过花瓣的声音，是我想说的话',
  '和你一起照顾这些花，就是最好的时光',
  '今天的花开得很美...就像遇见你的那天',
  '我会好好长大的，为了让你看到最美的样子'
]

const flowerColors = [
  { name: '樱花粉', main: '#ffb7c5', light: '#ffd1dc', dark: '#e8909c' },
  { name: '向日葵黄', main: '#ffd54f', light: '#ffe082', dark: '#ffb300' },
  { name: '薰衣草紫', main: '#b39ddb', light: '#d1c4e9', dark: '#9575cd' },
  { name: '晨曦橙', main: '#ffab91', light: '#ffccbc', dark: '#ff7043' },
  { name: '天空蓝', main: '#90caf9', light: '#bbdefb', dark: '#64b5f6' }
]

const flowers = reactive([
  { id: 1, x: '18%', growth: 0.3, color: flowerColors[0], hasDew: true, watering: false, showPollen: false, plantedAt: Date.now() - 86400000 * 3 },
  { id: 2, x: '38%', growth: 0.65, color: flowerColors[1], hasDew: false, watering: false, showPollen: false, plantedAt: Date.now() - 86400000 * 7 },
  { id: 3, x: '58%', growth: 1.0, color: flowerColors[2], hasDew: true, watering: false, showPollen: false, plantedAt: Date.now() - 86400000 * 14 },
  { id: 4, x: '78%', growth: 0.45, color: flowerColors[3], hasDew: false, watering: false, showPollen: false, plantedAt: Date.now() - 86400000 * 5 }
])

const butterflies = reactive([
  { x: 75, y: 25, angle: 0, speed: 0.3, wingPhase: 0, color: ['#ffb7c5', '#ffd54f'][0], resting: false, restTimer: 0, pathOffset: 0 },
  { x: 20, y: 35, angle: 180, speed: 0.25, wingPhase: Math.PI, color: ['#b39ddb', '#90caf9'][0], resting: false, restTimer: 0, pathOffset: 2 },
  { x: 55, y: 18, angle: 90, speed: 0.35, wingPhase: Math.PI / 2, color: ['#ffab91', '#ffb7c5'][1], resting: false, restTimer: 0, pathOffset: 4 }
])

const bees = reactive([
  { x: 40, y: 45, angle: 0, speed: 0.5, phase: 0, targetFlower: null },
  { x: 65, y: 38, angle: 90, speed: 0.45, phase: Math.PI, targetFlower: null }
])

const fallingPetals = reactive([])
let petalIdCounter = 0

const pickedFlowers = reactive([])

const albumEntries = reactive([
  { date: '3月1日', mood: '第一颗种子发芽了', color: '#a5d6a7' },
  { date: '3月5日', mood: '向日葵开花了，很暖', color: '#ffd54f' },
  { date: '3月10日', mood: '薰衣草盛开了，想你', color: '#b39ddb' },
  { date: '3月14日', mood: '今天浇了很多水', color: '#81c784' }
])

const particles = reactive([])

function flowerStage(growth) {
  if (growth < 0.25) return 'seed'
  if (growth < 0.5) return 'sprout'
  if (growth < 0.75) return 'budding'
  return 'bloom'
}

function petalCount(flower) {
  const stage = flowerStage(flower.growth)
  if (stage === 'seed') return 0
  if (stage === 'sprout') return 3
  if (stage === 'budding') return 5
  return 7
}

function stemPath(growth) {
  const h = Math.max(10, 80 * growth)
  const curve = growth > 0.5 ? 8 * (growth - 0.5) : 0
  return `M15,120 Q${15 + curve},${120 - h/2} 15,${120 - h}`
}

function leafPath(index, growth) {
  const baseY = 120 - 40 * growth - index * 18 * growth
  const size = 12 + 6 * growth
  const side = index % 2 === 0 ? 1 : -1
  return `M15,${baseY} Q${15 + side * size},${baseY - size/2} ${15 + side * size * 1.5},${baseY - size/3} Q${15 + side * size},${baseY + 2} 15,${baseY + 3}`
}

function petalStyle(index, total, color) {
  const angle = (index / total) * 360 - 90
  const size = 14 + (total - 3) * 2
  return {
    '--petal-angle': angle + 'deg',
    '--petal-size': size + 'px',
    '--petal-color': color.main,
    '--petal-light': color.light,
    background: `linear-gradient(135deg, ${color.light} 0%, ${color.main} 60%, ${color.dark} 100%)`
  }
}

function plantTransform(flower) {
  const scale = 0.6 + flower.growth * 0.4
  return {
    transform: `scale(${scale})`,
    opacity: flower.growth > 0.05 ? 1 : 0
  }
}

function dropletStyle(index) {
  const angle = (index / 6) * Math.PI * 2
  const dist = 25 + Math.random() * 15
  return {
    '--dx': Math.cos(angle) * dist + 'px',
    '--dy': Math.sin(angle) * dist - 10 + 'px',
    '--ddelay': (index * 0.08) + 's'
  }
}

function butterflyStyle(bfly, idx) {
  return {
    left: bfly.x + '%',
    top: bfly.y + '%',
    '--bf-color-1': bfly.color,
    '--bf-wing-phase': bfly.wingPhase + 's',
    '--bf-delay': (idx * 0.3) + 's'
  }
}

function beeStyle(b, idx) {
  return {
    left: b.x + '%',
    top: b.y + '%',
    '--bee-phase': b.phase + 's',
    '--bee-delay': (idx * 0.5) + 's'
  }
}

function fallingPetalStyle(petal, idx) {
  return {
    '--fall-x': petal.startX + 'px',
    '--fall-y': petal.startY + 'px',
    '--fall-delay': petal.delay + 's',
    '--fall-dur': petal.duration + 's',
    '--petal-bg': petal.color || 'rgba(255,183,197,0.25)',
    color: '#bc6c75'
  }
}

function focusFlower(idx) {
  if (flowers[idx].growth >= 1.0 && !isWatering.value) {
    pickFlower(idx)
    return
  }
  focusedFlower.value = focusedFlower.value === idx ? -1 : idx
}

function pickFlower(idx) {
  const flower = flowers[idx]
  pickedFlowers.push({ ...flower })
  
  flowers[idx] = {
    ...flower,
    growth: 0.2,
    color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
    hasDew: true,
    plantedAt: Date.now()
  }
  
  spawnMessage('摘下了一朵美丽的花...')
}

function startWatering() {
  isWatering.value = true
  const targetIdx = focusedFlower.value >= 0 ? focusedFlower.value : Math.floor(Math.random() * flowers.length)
  flowers[targetIdx].watering = true
  
  let count = 0
  const waterInterval = setInterval(() => {
    if (!isWatering.value || count > 15) {
      clearInterval(waterInterval)
      flowers[targetIdx].watering = false
      if (count > 5) {
        flowers[targetIdx].growth = Math.min(1, flowers[targetIdx].growth + 0.08)
        flowers[targetIdx].hasDew = true
        if (flowers[targetIdx].growth >= 1) {
          flowers[targetIdx].showPollen = true
          setTimeout(() => { flowers[targetIdx].showPollen = false }, 2000)
        }
        spawnWaterParticles(targetIdx)
        spawnMessage(aiMessages[Math.floor(Math.random() * aiMessages.length)])
      }
      return
    }
    count++
    spawnWaterParticles(targetIdx)
  }, 150)
}

function stopWatering() {
  isWatering.value = false
  flowers.forEach(f => f.watering = false)
}

function useFertilizer() {
  if (!hasFertilizer.value) return
  hasFertilizer.value = false
  
  flowers.forEach((f, idx) => {
    setTimeout(() => {
      f.growth = Math.min(1, f.growth + 0.15)
      f.showPollen = true
      setTimeout(() => { f.showPollen = false }, 2500)
    }, idx * 300)
  })
  
  spawnMessage('所有的花都在加速生长...好神奇')
  
  setTimeout(() => {
    hasFertilizer.value = true
  }, 60000)
}

function openBouquet() {
  showBouquet.value = true
}

function openAlbum() {
  showAlbum.value = true
}

function sendBouquet() {
  if (pickedFlowers.length === 0) return
  
  spawnMessage('花束送出去了...希望对方能感受到这份心意')
  pickedFlowers.splice(0, pickedFlowers.length)
  showBouquet.value = false
  
  moodQuote.value = '心意已送达，如花香般抵达'
  
  const today = new Date()
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`
  albumEntries.unshift({
    date: dateStr,
    mood: '送出了一束花',
    color: '#ffb7c5'
  })
}

function spawnMessage(text) {
  currentMessage.value = text
  setTimeout(() => {
    if (currentMessage.value === text) {
      currentMessage.value = ''
    }
  }, 5000)
}

function spawnPetalText(text) {
  const chars = text.split('')
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight * 0.42
  
  chars.forEach((char, i) => {
    const petal = {
      id: ++petalIdCounter,
      char: char,
      startX: centerX + (i - chars.length / 2) * 28 + (Math.random() - 0.5) * 20,
      startY: centerY + (Math.random() - 0.5) * 30,
      delay: i * 0.4 + Math.random() * 0.3,
      duration: 3 + Math.random() * 2,
      color: flowerColors[Math.floor(Math.random() * flowerColors.length)].main
    }
    fallingPetals.push(petal)
    
    setTimeout(() => {
      const idx = fallingPetals.findIndex(p => p.id === petal.id)
      if (idx > -1) fallingPetals.splice(idx, 1)
    }, (petal.delay + petal.duration) * 1000 + 500)
  })
}

function spawnWaterParticles(flowerIdx) {
  for (let i = 0; i < 3; i++) {
    particles.push({
      x: parseFloat(flowers[flowerIdx].x) / 100 * window.innerWidth + (Math.random() - 0.5) * 40,
      y: window.innerHeight * 0.62,
      vx: (Math.random() - 0.5) * 2,
      vy: 2 + Math.random() * 2,
      life: 1,
      size: 2 + Math.random() * 2,
      type: 'water'
    })
  }
}

function updateParticles() {
  if (!particleCtx) return
  
  particleCtx.clearRect(0, 0, particleCanvas.value.width, particleCanvas.value.height)
  
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.05
    p.life -= 0.02
    
    if (p.life <= 0 || p.y > particleCanvas.value.height) {
      particles.splice(i, 1)
      continue
    }
    
    particleCtx.beginPath()
    particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    
    if (p.type === 'water') {
      const grad = particleCtx.createRadialGradient(p.x - p.size * 0.3, p.y - p.size * 0.3, 0, p.x, p.y, p.size)
      grad.addColorStop(0, `rgba(255,255,255,${p.life * 0.9})`)
      grad.addColorStop(0.5, `rgba(135,206,235,${p.life * 0.6})`)
      grad.addColorStop(1, `rgba(135,206,235,${p.life * 0.2})`)
      particleCtx.fillStyle = grad
    }
    
    particleCtx.fill()
  }
}

function updateButterflies() {
  const time = Date.now() / 1000
  
  butterflies.forEach((bfly, idx) => {
    if (bfly.resting) {
      bfly.restTimer--
      if (bfly.restTimer <= 0) {
        bfly.resting = false
      }
      bfly.wingPhase += 0.15
      return
    }
    
    const t = time * bfly.speed + bfly.pathOffset
    bfly.x = 50 + Math.sin(t * 0.7) * 30 + Math.sin(t * 1.3) * 10
    bfly.y = 22 + Math.cos(t * 0.5) * 12 + Math.sin(t * 0.9) * 6
    bfly.angle = Math.sin(t * 0.8) * 20
    bfly.wingPhase += 0.25
    
    if (Math.random() < 0.002) {
      bfly.resting = true
      bfly.restTimer = 120 + Math.random() * 180
    }
  })
}

function updateBees() {
  const time = Date.now() / 1000
  
  bees.forEach((bee) => {
    const t = time * bee.speed + bee.phase
    bee.x = 35 + Math.sin(t * 1.1) * 25 + Math.cos(t * 0.7) * 8
    bee.y = 40 + Math.cos(t * 0.9) * 10 + Math.sin(t * 1.4) * 5
    bee.phase += 0.08
    
    if (Math.random() < 0.01 && flowers.some(f => f.growth >= 0.7)) {
      const targets = flowers.filter(f => f.growth >= 0.7)
      bee.targetFlower = targets[Math.floor(Math.random() * targets.length)]
    }
  })
}

function animate() {
  updateParticles()
  updateButterflies()
  updateBees()
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  setTimeout(() => { sceneAwake.value = true }, 100)
  
  setTimeout(() => { showHeader.value = true }, 2200)
  
  setTimeout(() => {
    spawnPetalText(moodQuote.value)
  }, 3200)
  
  setTimeout(() => {
    spawnMessage(aiMessages[0])
  }, 4200)
  
  nextTick(() => {
    if (particleCanvas.value) {
      particleCanvas.value.width = window.innerWidth
      particleCanvas.value.height = window.innerHeight
      particleCtx = particleCanvas.value.getContext('2d')
    }
  })
  
  animate()
  
  setInterval(() => {
    if (Math.random() < 0.3 && !currentMessage.value) {
      spawnMessage(aiMessages[Math.floor(Math.random() * aiMessages.length)])
    }
  }, 15000)
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.greenhouse-scene {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: #f0fff4;
}

.sky-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(ellipse at top center, #fffef5 0%, #f0fff4 40%, #e8f5e9 100%);
  opacity: 0;
  transition: opacity 1.8s ease-in-out;
}

.scene-awake .sky-layer {
  opacity: 1;
}

.sun-glow {
  position: absolute;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  height: 140px;
  background: radial-gradient(ellipse, rgba(255,248,180,0.5) 0%, rgba(255,248,180,0.15) 40%, transparent 70%);
  filter: blur(20px);
  opacity: 0;
  animation: sunGlowIn 2s ease-out 0.6s forwards;
}

@keyframes sunGlowIn {
  from { opacity: 0; transform: translateX(-50%) scale(0.6); }
  to { opacity: 1; transform: translateX(-50%) scale(1); }
}

.light-rays {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 100%;
  background: linear-gradient(
    175deg,
    rgba(255,252,220,0.2) 0%,
    transparent 40%
  );
  clip-path: polygon(40% 0%, 60% 0%, 80% 100%, 20% 100%);
  opacity: 0;
  animation: raysFadeIn 2.5s ease-out 1s forwards;
}

@keyframes raysFadeIn {
  from { opacity: 0; }
  to { opacity: 0.6; }
}

.dome-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 52%;
  z-index: 1;
  pointer-events: none;
}

.dome-frame {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  animation: domeReveal 1.5s ease-out 0.8s forwards;
}

@keyframes domeReveal {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dome-arc {
  stroke: rgba(255,255,255,0.3);
  stroke-width: 2;
  stroke-dasharray: 1200;
  stroke-dashoffset: 1200;
  animation: arcDraw 2s ease-out 0.8s forwards;
}

@keyframes arcDraw {
  to { stroke-dashoffset: 0; }
}

.dome-glass {
  fill: rgba(255,255,255,0.04);
}

.dome-rib {
  stroke: rgba(255,255,255,0.18);
  stroke-width: 1.2;
  opacity: 0;
  animation: ribAppear 0.8s ease-out forwards;
  animation-delay: inherit;
}

.dome-rib:nth-child(3) { animation-delay: 1.4s; }
.dome-rib:nth-child(4) { animation-delay: 1.5s; }
.dome-rib:nth-child(5) { animation-delay: 1.6s; }

@keyframes ribAppear {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dome-hbeam {
  stroke: rgba(255,255,255,0.15);
  stroke-width: 1;
  opacity: 0;
  animation: ribAppear 0.6s ease-out forwards;
}

.dome-hbeam:nth-child(6) { animation-delay: 1.7s; }
.dome-hbeam:nth-child(7) { animation-delay: 1.85s; }

.glass-reflection {
  position: absolute;
  top: 8%;
  right: 15%;
  width: 120px;
  height: 200px;
  background: linear-gradient(
    135deg,
    transparent 0%,
    rgba(255,255,255,0.06) 45%,
    transparent 60%
  );
  transform: skewX(-8deg);
  pointer-events: none;
  opacity: 0;
  animation: glassShine 3s ease-in-out 2s infinite;
}

@keyframes glassShine {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.flight-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.butterfly {
  position: absolute;
  width: 32px;
  height: 24px;
  opacity: 0;
  animation: bfFlyIn 1.2s ease-out var(--bf-delay, 0s) forwards;
  transition: transform 0.1s linear;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08));
}

@keyframes bfFlyIn {
  from { opacity: 0; transform: translateX(60px) scale(0.5); }
  to { opacity: 0.85; transform: translateX(0) scale(1); }
}

.butterfly.resting {
  filter: drop-shadow(0 1px 3px rgba(0,0,0,0.06));
}

.butterfly-svg {
  width: 100%;
  height: 100%;
  animation: bfWings 0.15s ease-in-out infinite alternate;
  animation-delay: var(--bf-wing-phase, 0s);
}

.butterfly.resting .butterfly-svg {
  animation-duration: 0.6s;
}

.wing-left, .wing-right {
  fill: var(--bf-color-1, #ffb7c5);
  opacity: 0.7;
  transform-origin: center;
}

.wing-left {
  animation: wingFlapL 0.15s ease-in-out infinite alternate;
}

.wing-right {
  animation: wingFlapR 0.15s ease-in-out infinite alternate;
}

@keyframes bfWings {
  from { transform: scaleY(0.85); }
  to { transform: scaleY(1.05); }
}

@keyframes wingFlapL {
  from { transform: rotateZ(-15deg) scaleX(0.9); }
  to { transform: rotateZ(5deg) scaleX(1.05); }
}

@keyframes wingFlapR {
  from { transform: rotateZ(15deg) scaleX(0.9); }
  to { transform: rotateZ(-5deg) scaleX(1.05); }
}

.bee {
  position: absolute;
  width: 22px;
  height: 16px;
  opacity: 0;
  animation: beeBuzzIn 1s ease-out var(--bee-delay, 0s) forwards;
}

@keyframes beeBuzzIn {
  from { opacity: 0; transform: translateY(20px) scale(0.6); }
  to { opacity: 0.8; transform: translateY(0) scale(1); }
}

.bee-svg {
  width: 100%;
  height: 100%;
  animation: beeHover 0.3s ease-in-out infinite alternate;
  animation-delay: var(--bee-phase, 0s);
}

.bee-svg ellipse:first-of-type {
  fill: #ffd54f;
  opacity: 0.85;
}

.bee-svg ellipse:first-of-type::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 3px,
    rgba(60,40,20,0.3) 3px,
    rgba(60,40,20,0.3) 5px
  );
}

@keyframes beeHover {
  from { transform: translateY(-2px) rotate(-3deg); }
  to { transform: translateY(2px) rotate(3deg); }
}

.flower-bed-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 42%;
  z-index: 3;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.soil-base {
  position: relative;
  width: 100%;
  height: 100%;
}

.soil-surface {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 65%;
  background: linear-gradient(
    to bottom,
    #a0522d 0%,
    #8b4513 30%,
    #5c4033 100%
  );
  border-radius: 100% 100% 0 0 / 20% 20% 0 0;
  opacity: 0;
  animation: soilRise 1.2s cubic-bezier(0.22, 1, 0.36, 1) 1.2s forwards;
}

.soil-surface::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  width: 80%;
  height: 12px;
  background: radial-gradient(ellipse at center, #5c4033 0%, #6b4423 60%, transparent 100%);
  border-radius: 50%;
  opacity: 0.6;
}

@keyframes soilRise {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.pot-group {
  position: absolute;
  bottom: 22%;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 6%;
  padding: 0 8%;
}

.flower-unit {
  position: relative;
  cursor: pointer;
  opacity: 0;
  animation: flowerEmerge 1s cubic-bezier(0.34, 1.56, 0.64, 1) var(--fl-delay, 0s) forwards;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.flower-unit:hover {
  transform: translateY(-6px) scale(1.03);
}

.flower-unit.focused {
  transform: translateY(-8px) scale(1.05);
}

@keyframes flowerEmerge {
  from { opacity: 0; transform: translateY(25px) scale(0.6); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.pot {
  position: relative;
  width: 56px;
  height: 48px;
  margin-bottom: -4px;
}

.pot-body {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 40px;
  border-radius: 4px 4px 18px 18px;
  background: radial-gradient(ellipse at 30% 20%, #d4a574 0%, #a0522d 60%, #8b4513 100%);
  box-shadow:
    inset 3px 0 8px rgba(255,255,255,0.12),
    inset -2px 0 6px rgba(0,0,0,0.15),
    0 4px 12px rgba(0,0,0,0.12);
}

.pot-rim {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 54px;
  height: 10px;
  border-radius: 3px;
  background: linear-gradient(to bottom, #c4956a, #b08050);
  box-shadow: inset 0 1px 2px rgba(255,255,255,0.2);
}

.soil-in-pot {
  position: absolute;
  top: 7px;
  left: 50%;
  transform: translateX(-50%);
  width: 44px;
  height: 8px;
  background: #5c4033;
  border-radius: 50%;
}

.plant-container {
  position: absolute;
  bottom: 42px;
  left: 50%;
  transform: translateX(-50%) scale(0.8);
  width: 60px;
  height: 130px;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease;
}

.stem-svg {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 120px;
  overflow: visible;
}

.stem-path {
  fill: none;
  stroke: #4caf50;
  stroke-width: 2.5;
  stroke-linecap: round;
  filter: drop-shadow(0 1px 2px rgba(76,175,80,0.2));
}

.leaf-path {
  fill: #81c784;
  opacity: 0.85;
  transform-origin: 15px 60px;
  transform: rotate(var(--leaf-rot, 0deg));
  stroke: rgba(0,0,0,0.06);
  stroke-width: 0.5;
}

.flower-head {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 50px;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.flower-head.stage-seed {
  width: 12px;
  height: 12px;
  background: radial-gradient(circle, #a5d6a7 0%, #81c784 100%);
  border-radius: 50%;
  top: auto;
  bottom: 5px;
  left: 50%;
}

.flower-head.stage-sprout {
  width: 20px;
  height: 20px;
  top: auto;
  bottom: 15px;
}

.flower-head.stage-budding {
  width: 34px;
  height: 34px;
  top: 5px;
}

.flower-head.stage-bloom {
  width: 50px;
  height: 50px;
  top: 0;
  animation: flowerSway 4s ease-in-out infinite;
}

@keyframes flowerSway {
  0%, 100% { transform: translateX(-50%) rotate(-2deg); }
  50% { transform: translateX(-50%) rotate(2deg); }
}

.petal {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--petal-size, 14px);
  height: calc(var(--petal-size, 14px) * 1.25);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  transform-origin: center bottom;
  transform: translate(-50%, -30%) rotate(var(--petal-angle, 0deg));
  opacity: 0.88;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08), inset 0 -2px 4px rgba(0,0,0,0.06);
  backdrop-filter: blur(0.5px);
  transition: all 0.4s ease;
}

.flower-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffd54f 0%, #ffb300 100%);
  z-index: 2;
  box-shadow: 0 1px 4px rgba(255,179,0,0.3);
}

.flower-dew {
  position: absolute;
  top: 4px;
  right: 8px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95) 0%, rgba(135,206,235,0.5) 70%);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  animation: dewGlisten 4s ease-in-out infinite;
}

@keyframes dewGlisten {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}

.pollen-cloud {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,213,79,0.25) 0%, rgba(255,213,79,0.08) 40%, transparent 70%);
  animation: pollenExpand 2s ease-out forwards;
  pointer-events: none;
}

@keyframes pollenExpand {
  from { transform: translateX(-50%) scale(0.3); opacity: 0; }
  50% { opacity: 1; }
  to { transform: translateX(-50%) scale(1.8); opacity: 0; }
}

.bloom-burst-enter-active {
  animation: pollenPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes pollenPop {
  from { transform: translateX(-50%) scale(0); opacity: 0; }
  to { transform: translateX(-50%) scale(1); opacity: 1; }
}

.water-droplets {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 60px;
  pointer-events: none;
}

.droplet {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 4px;
  height: 6px;
  border-radius: 50% 50% 50% 0;
  background: radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.9), rgba(135,206,235,0.6));
  transform: translate(calc(-50% + var(--dx, 0px)), calc(-50% + var(--dy, 0px))) rotate(-45deg);
  animation: dropletFall 0.6s ease-out var(--ddelay, 0s) infinite;
}

@keyframes dropletFall {
  0% { opacity: 1; transform: translate(calc(-50% + var(--dx, 0px)), calc(-50% + var(--dy, 0px) - 15px)) rotate(-45deg) scale(1); }
  100% { opacity: 0; transform: translate(calc(-50% + var(--dx, 0px)), calc(-50% + var(--dy, 0px) + 10px)) rotate(-45deg) scale(0.4); }
}

.particle-canvas {
  position: absolute;
  inset: 0;
  z-index: 3.5;
  pointer-events: none;
}

.toolbar-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 4;
  padding: 12px 0 20px;
  display: flex;
  justify-content: center;
  background: linear-gradient(to top, rgba(240,255,244,0.95) 0%, transparent 100%);
  opacity: 0;
  animation: toolbarSlideUp 0.8s ease-out 2.4s forwards;
}

@keyframes toolbarSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  border: none;
  border-radius: 16px;
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8);
  min-width: 56px;
}

.tool-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.82);
}

.tool-btn:active {
  transform: translateY(-1px) scale(0.97);
}

.tool-btn.active {
  background: rgba(129,199,132,0.25);
  box-shadow: 0 4px 16px rgba(129,199,132,0.2), inset 0 1px 0 rgba(255,255,255,0.8);
}

.tool-btn.glowing {
  position: relative;
}

.tool-btn.glowing::after {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ffd54f;
  animation: toolGlow 1.5s ease-in-out infinite;
  box-shadow: 0 0 8px #ffd54f;
}

@keyframes toolGlow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

.tool-icon {
  width: 26px;
  height: 26px;
  fill: none;
  stroke: #66bb6a;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: stroke 0.3s ease;
}

.tool-btn:hover .tool-icon {
  stroke: #43a047;
}

.tool-btn.active .tool-icon {
  stroke: #2e7d32;
}

.water-btn .tool-icon .water-stream {
  stroke: #90caf9;
  stroke-width: 1.2;
  opacity: 0;
  animation: waterFlow 0.4s ease-in-out infinite;
}

.tool-btn.active .water-stream {
  opacity: 1;
}

@keyframes waterFlow {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -12; }
}

.tool-label {
  font-size: 11px;
  color: #689f63;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.petal-text-layer {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
}

.petals-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.falling-petal {
  position: absolute;
  left: var(--fall-x, 50%);
  top: var(--fall-y, 30%);
  min-width: 24px;
  height: 28px;
  padding: 4px 10px;
  background: var(--petal-bg, rgba(255,183,197,0.2));
  border-radius: 50% 50% 50% 50% / 55% 55% 45% 45%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-family: 'STKaiti', 'KaiTi', serif;
  white-space: nowrap;
  backdrop-filter: blur(1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 2px rgba(255,255,255,0.4);
  animation: petalFall var(--fall-dur, 4s) ease-in-out var(--fall-delay, 0s) forwards;
  opacity: 0;
}

@keyframes petalFall {
  0% {
    opacity: 0;
    transform: translateY(0) rotate(0deg) scale(0.6);
  }
  10% {
    opacity: 1;
    transform: translateY(5vh) rotate(8deg) scale(1);
  }
  70% {
    opacity: 0.9;
    transform: translateY(55vh) rotate(-12deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(72vh) rotate(5deg) scale(0.8);
  }
}

.petal-fall-enter-active {
  animation: petalFall var(--fall-dur, 4s) ease-in-out forwards;
}

.message-display {
  position: absolute;
  bottom: 14%;
  left: 50%;
  transform: translateX(-50%);
  max-width: 340px;
  padding: 14px 24px;
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  text-align: center;
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8);
  z-index: 6;
  pointer-events: none;
}

.message-display.visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.message-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: #6d8b74;
  letter-spacing: 0.04em;
}

.mood-header {
  position: absolute;
  top: 7%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 6;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
}

.mood-header.visible {
  opacity: 1;
}

.mood-quote {
  display: block;
  font-size: 17px;
  font-weight: 300;
  letter-spacing: 0.25em;
  color: rgba(109,139,116,0.6);
  text-shadow: 0 1px 6px rgba(255,255,255,0.5);
  line-height: 1.8;
}

.bouquet-overlay, .album-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(232,245,233,0.7);
  backdrop-filter: blur(8px);
}

.bouquet-panel, .album-panel {
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  padding: 28px 32px;
  min-width: 300px;
  max-width: 380px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9);
}

.panel-title {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 500;
  color: #558b5e;
  letter-spacing: 0.1em;
  text-align: center;
}

.bouquet-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 80px;
  padding: 16px;
  background: rgba(232,245,233,0.5);
  border-radius: 16px;
  margin-bottom: 20px;
  align-items: center;
  justify-content: center;
}

.mini-flower {
  width: 32px;
  height: 32px;
  border-radius: 50% 50% 50% 50% / 55% 55% 45% 45%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.empty-hint {
  font-size: 13px;
  color: rgba(107,139,116,0.5);
  letter-spacing: 0.05em;
}

.action-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
  color: white;
  font-size: 14px;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102,187,106,0.3);
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102,187,106,0.4);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.album-entries {
  max-height: 320px;
  overflow-y: auto;
}

.album-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(129,199,132,0.15);
}

.entry-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.entry-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.entry-date {
  font-size: 12px;
  color: rgba(107,139,116,0.6);
}

.entry-mood {
  font-size: 13px;
  color: #558b5e;
}

.bouquet-panel-enter-active, .album-panel-enter-active {
  animation: panelSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.bouquet-panel-leave-active, .album-panel-leave-active {
  animation: panelSlideDown 0.4s ease-in forwards;
}

@keyframes panelSlideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.92); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes panelSlideDown {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(20px) scale(0.95); }
}
</style>
