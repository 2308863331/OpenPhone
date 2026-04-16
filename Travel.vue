<!-- 旅行日记 - 世界地图明信片系统，城市探索和旅行记录 -->
<template>
  <div class="travel-diary" :class="{ 'is-loaded': isLoaded }">
    <!-- 背景纸张层 -->
    <div class="paper-layer"></div>

    <!-- 顶部状态栏 -->
    <header class="journey-header">
      <div class="plane-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>
      <div class="station-info">
        <span class="station-number">第 {{ currentStation }} 站</span>
        <span class="separator">·</span>
        <span class="city-name">{{ currentCity.name }}</span>
        <span class="arrow">→</span>
        <span class="next-city">下一站: {{ nextCity ? nextCity.name : '?' }}</span>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 世界地图层 -->
      <section class="map-container"
               @wheel.prevent="handleMapZoom"
               @mousedown="startDrag"
               @mousemove="onDrag"
               @mouseup="endDrag"
               @mouseleave="endDrag">
        <div class="map-wrapper" :style="mapTransform">
          <!-- SVG 地图 -->
          <svg class="world-map" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
            <!-- 简化的世界地图轮廓 -->
            <g class="map-continents" opacity="0.6">
              <path d="M150,120 Q180,100 220,110 L240,130 Q260,140 250,160 L230,170 Q200,175 170,165 Z" fill="#d4c4a8"/>
              <path d="M280,100 Q320,90 360,95 L380,120 Q385,150 370,170 L340,180 Q300,175 285,150 Z" fill="#d4c4a8"/>
              <path d="M420,80 Q480,70 520,85 L550,120 Q555,160 540,190 L500,210 Q450,215 430,185 Z" fill="#d4c4a8"/>
              <path d="M580,100 Q620,95 650,105 L665,135 Q668,165 650,185 L615,195 Q585,188 578,155 Z" fill="#d4c4a8"/>
              <path d="M700,120 Q740,115 770,125 L785,155 Q788,185 770,205 L735,215 Q705,208 698,175 Z" fill="#d4c4a8"/>
              <path d="M820,140 Q860,135 885,148 L898,178 Q900,205 880,225 L848,235 Q818,228 812,198 Z" fill="#d4c4a8"/>
            </g>

            <!-- 航线连线 -->
            <g class="routes">
              <path v-for="(route, index) in visibleRoutes"
                    :key="'route-' + index"
                    :d="route.path"
                    class="route-line"
                    :class="{ 'route-active': route.active }"
                    stroke-dasharray="6 4"
                    :stroke-width="route.active ? 2 : 1.5"
                    :style="{ animationDelay: (index * 50) + 'ms' }"/>
            </g>

            <!-- 城市图钉 -->
            <g class="city-pins">
                <g v-for="city in cities"
                   :key="city.id"
                   :transform="`translate(${city.x}, ${city.y})`"
                   class="pin-group"
                   :class="{ 'pin-current': city.id === currentCity.id, 'pin-unlocked': city.unlocked }"
                   @click="selectCity(city)">
                  <!-- 图钉光晕 -->
                  <circle v-if="city.unlocked && city.id === currentCity.id"
                          class="pin-glow"
                          r="18"
                          :fill="city.color + '33'"/>
                  <!-- 图钉主体 -->
                  <circle v-if="city.unlocked" r="8" :fill="city.color" class="pin-head"/>
                  <circle v-if="!city.unlocked" r="8" fill="none" stroke="#8b7355" stroke-width="1.5" stroke-dasharray="2 2"/>
                  <!-- 图钉阴影 -->
                  <ellipse cy="10" rx="5" ry="2" fill="rgba(0,0,0,0.15)"/>
                  <!-- 城市名称 -->
                  <text y="-15" text-anchor="middle" class="city-label" :opacity="city.unlocked ? 1 : 0.4">
                    {{ city.name }}
                  </text>
                </g>
            </g>

            <!-- 小飞机 -->
            <g v-if="showPlane" class="plane-marker" :style="{ transform: `translate(${planePosition.x}px, ${planePosition.y}px)` }">
              <g transform="scale(0.8)">
                <path d="M12 2L4 12h3l-2 9 9-11h-3l2-9z" fill="#d4a84b" stroke="#b8934a" stroke-width="0.5"/>
              </g>
            </g>
          </svg>
        </div>
      </section>

      <!-- 明信片区 -->
      <section class="postcard-section">
        <div class="postcard-container"
             :class="{ 'is-flipped': isFlipped }"
             @click="flipPostcard">
          <!-- 明信片正面 -->
          <div class="postcard-front">
            <div class="photo-frame">
              <div class="polaroid-photo" :style="{ backgroundImage: `url(${currentCity.image})` }">
                <div class="photo-overlay"></div>
              </div>
            </div>
            <div class="postcard-decoration">
              <component :is="currentCity.decorIcon" />
            </div>
            <div class="flip-hint">
              <span>点击翻面查看导游词</span>
            </div>
          </div>

          <!-- 明信片背面 -->
          <div class="postcard-back">
            <div class="stamp-area">
              <!-- 邮戳 -->
              <div class="postmark" :style="{ transform: `rotate(${currentCity.postmarkRotation}deg)` }">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="#8b4513" stroke-width="2" opacity="0.75"/>
                  <text x="40" y="30" text-anchor="middle" font-size="10" fill="#8b4513" font-weight="bold">{{ currentCity.code }}</text>
                  <text x="40" y="45" text-anchor="middle" font-size="8" fill="#8b4513">{{ currentDate }}</text>
                  <line x1="20" y1="52" x2="60" y2="52" stroke="#8b4513" stroke-width="1" opacity="0.5"/>
                </svg>
              </div>
              <!-- 邮票 -->
              <div class="stamp">
                <svg width="60" height="72" viewBox="0 0 60 72">
                  <rect x="2" y="2" width="56" height="68" fill="#fffef8" stroke="#d4c4a8" stroke-width="1" stroke-dasharray="3 2"/>
                  <component :is="currentCity.stampIcon" />
                </svg>
              </div>
            </div>
            <div class="guide-text">
              <h3>{{ currentCity.guide.title }}</h3>
              <p class="intro">{{ currentCity.guide.intro }}</p>
              <p class="fact">{{ currentCity.guide.fact }}</p>
              <p class="secret">{{ currentCity.guide.secret }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 装饰粒子层 -->
    <div class="particles-layer">
      <div v-for="particle in particles"
           :key="particle.id"
           class="particle"
           :class="`particle-${currentCity.particleType}`"
           :style="{
             left: particle.x + '%',
             top: particle.y + '%',
             animationDelay: particle.delay + 's',
             animationDuration: particle.duration + 's'
           }"></div>
    </div>

    <!-- 底部工具栏 -->
    <footer class="toolbar">
      <button class="tool-btn" @click="openSouvenirs" title="纪念品">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
        <span>纪念品</span>
      </button>
      <button class="tool-btn" @click="openCamera" title="合影">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        <span>合影</span>
      </button>
      <button class="tool-btn" @click="openAlbum" title="相册">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>相册</span>
      </button>
      <button class="tool-btn" @click="showTask = true" title="今日任务">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <span>任务</span>
      </button>
    </footer>

    <!-- 今日任务弹窗 -->
    <transition name="modal">
      <div v-if="showTask" class="task-modal" @click.self="showTask = false">
        <div class="task-card">
          <div class="task-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="task-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <h3>今日任务</h3>
          </div>
          <div class="task-content">
            <p class="task-text">{{ todayTask.text }}</p>
            <button v-if="!todayTask.completed" class="complete-task-btn" @click="completeTask">
              完成任务
            </button>
            <div v-else class="task-stamp">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="26" fill="none" stroke="#8b4513" stroke-width="2"/>
                <text x="30" y="35" text-anchor="middle" font-size="12" fill="#8b4513" font-weight="bold">CLEARED</text>
              </svg>
            </div>
          </div>
          <button class="close-task-btn" @click="showTask = false">关闭</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

const isLoaded = ref(false)
const isFlipped = ref(false)
const showTask = ref(false)
const showPlane = ref(true)

const mapScale = ref(1)
const mapTranslateX = ref(0)
const mapTranslateY = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)

const planePosition = reactive({ x: 400, y: 250 })

const cities = ref([
  {
    id: 1,
    name: '京都',
    code: 'KYOTO',
    x: 720,
    y: 180,
    unlocked: true,
    color: '#ffb7c5',
    particleType: 'sakura',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600',
    postmarkRotation: -2,
    guide: {
      title: '京都 · 千年古都的低语',
      intro: '在这座拥有千年历史的古都里，每一块石板都记录着时光的流转。清晨的岚山竹林中，阳光透过竹叶洒下斑驳光影。',
      fact: '冷知识：京都共有17处世界文化遗产，是日本最多的城市。其中金阁寺的金箔使用了约20万张金箔。',
      secret: '一句私房话：如果你在黄昏时分独自走在�的的小巷里，会听到远处传来三味线的声音——那是这座城市在和你说话。'
    },
    decorIcon: {
      template: `<svg viewBox="0 0 40 40"><ellipse cx="20" cy="25" rx="8" ry="12" fill="#ffb7c5" opacity="0.6"/><ellipse cx="20" cy="20" rx="6" ry="10" fill="#ffc0cb" opacity="0.7"/><ellipse cx="19" cy="18" rx="4" ry="8" fill="#ffd1dc" opacity="0.8"/></svg>`
    },
    stampIcon: {
      template: `<svg viewBox="0 0 56 68"><text x="28" y="35" text-anchor="middle" font-size="32">桜</text></svg>`
    }
  },
  {
    id: 2,
    name: '巴黎',
    code: 'PARIS',
    x: 420,
    y: 145,
    unlocked: true,
    color: '#daa520',
    particleType: 'leaf',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
    postmarkRotation: 3,
    guide: {
      title: '巴黎 · 塞纳河畔的诗行',
      intro: '当夕阳落在埃菲尔铁塔上时，整个城市都被镀上了一层金色。塞纳河上的游船缓缓驶过，两岸的梧桐树影婆娑。',
      fact: '冷知识：巴黎有超过450座公园和花园，其中卢森堡公园是巴黎人最爱的午后去处。',
      secret: '一句私房话：在蒙马特高地等待日落时，你会发现——原来浪漫不是刻意制造的，而是当你停下脚步的那一刻自然降临的。'
    },
    decorIcon: {
      template: `<svg viewBox="0 0 40 40"><path d="M20 5 L25 15 L20 12 L15 15 Z" fill="#daa520" opacity="0.7"/><ellipse cx="20" cy="22" rx="6" ry="8" fill="#f4a460" opacity="0.6"/></svg>`
    },
    stampIcon: {
      template: `<svg viewBox="0 0 56 68"><text x="28" y="42" text-anchor="middle" font-size="36">🗼</text></svg>`
    }
  },
  {
    id: 3,
    name: '雷克雅未克',
    code: 'REYKJAVIK',
    x: 320,
    y: 95,
    unlocked: true,
    color: '#98fb98',
    particleType: 'aurora',
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600',
    postmarkRotation: -1,
    guide: {
      title: '雷克雅未克 · 极光下的冰与火',
      intro: '在这个世界最北的首都，你可以在同一周内看到火山喷发和北极光漫天。这里的大地仍在呼吸，每一次呼吸都是一场自然的奇迹。',
      fact: '冷知识：雷克雅未克是世界上纬度最高的首都，但得益于墨西哥湾暖流，冬季气温并不像想象中那么严寒。',
      secret: '一句私房话：当绿色的极光在天幕上舞动时，你会明白为什么维京人相信那是神灵的桥梁——那一刻，你也想永远留在桥上。'
    },
    decorIcon: {
      template: `<svg viewBox="0 0 40 40"><path d="M10 20 Q15 10 20 20 T30 20" stroke="#98fb98" stroke-width="2" fill="none" opacity="0.7"/><path d="M12 25 Q17 15 22 25 T32 25" stroke="#90ee90" stroke-width="1.5" fill="none" opacity="0.5"/></svg>`
    },
    stampIcon: {
      template: `<svg viewBox="0 0 56 68"><path d="M15 20 L28 10 L41 20 L28 48 Z" fill="none" stroke="#98fb98" stroke-width="2"/><text x="28" y="35" text-anchor="middle" font-size="16" fill="#98fb98">✧</text></svg>`
    }
  },
  { id: 4, name: '威尼斯', code: 'VENICE', x: 445, y: 155, unlocked: false, color: '#add8e6', particleType: 'wave' },
  { id: 5, name: '开罗', code: 'CAIRO', x: 485, y: 210, unlocked: false, color: '#f4a460', particleType: 'sand' },
  { id: 6, name: '纽约', code: 'NYC', x: 220, y: 165, unlocked: false, color: '#ff8c00', particleType: 'taxi' }
])

const currentStation = computed(() => cities.value.filter(c => c.unlocked).length)
const currentCity = computed(() => cities.value.find(c => c.id === 1) || cities.value[0])
const nextCity = computed(() => {
  const idx = cities.value.findIndex(c => c.id === currentCity.value.id)
  return cities.value[idx + 1] || null
})

const currentDate = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')

const visibleRoutes = computed(() => [
  { path: 'M720,180 Q570,162 420,145', active: true },
  { path: 'M420,145 Q370,120 320,95', active: true }
])

const particles = ref([])

const todayTask = reactive({
  text: '分享你的一餐，告诉我它让你想起了什么味道的记忆',
  completed: false
})

const mapTransform = computed(() => ({
  transform: `translate(${mapTranslateX.value}px, ${mapTranslateY.value}px) scale(${mapScale.value})`
}))

function initParticles() {
  const types = ['sakura', 'leaf', 'aurora']
  for (let i = 0; i < 12; i++) {
    particles.value.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 4
    })
  }
}

function selectCity(city) {
  if (!city.unlocked) return
  console.log('选择城市:', city.name)
}

function flipPostcard() {
  isFlipped.value = !isFlipped.value
}

function handleMapZoom(e) {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newScale = Math.max(0.8, Math.min(3, mapScale.value + delta))
  mapScale.value = newScale
}

function startDrag(e) {
  isDragging.value = true
  dragStartX.value = e.clientX - mapTranslateX.value
  dragStartY.value = e.clientY - mapTranslateY.value
}

function onDrag(e) {
  if (!isDragging.value) return
  mapTranslateX.value = e.clientX - dragStartX.value
  mapTranslateY.value = e.clientY - dragStartY.value
}

function endDrag() {
  isDragging.value = false
}

function openSouvenirs() {
  alert('打开纪念品收集柜')
}

function openCamera() {
  alert('打开合影相机')
}

function openAlbum() {
  alert('打开电子相册')
}

function completeTask() {
  todayTask.completed = true
}

onMounted(() => {
  initParticles()
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.travel-diary {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(to bottom, #fffef8 0%, #f5f0e1 100%);
  font-family: 'Georgia', 'STKaiti', serif;
  color: #3d3426;
  opacity: 0;
  transition: opacity 0.8s ease-out;
}

.travel-diary.is-loaded {
  opacity: 1;
}

/* 背景纸张层 */
.paper-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  background:
    repeating-linear-gradient(
      transparent 0,
      transparent 28px,
      rgba(200, 190, 170, 0.08) 28px,
      rgba(200, 190, 170, 0.08) 29px
    );
}

/* 顶部状态栏 */
.journey-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 30px;
  animation: slideDown 0.8s ease-out 0.3s both;
}

.plane-icon {
  width: 28px;
  height: 28px;
  color: #d4a84b;
  animation: float 3s ease-in-out infinite;
}

.station-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.station-number {
  font-weight: 600;
  color: #5c4a3d;
}

.separator {
  color: #d4a84b;
}

.city-name {
  font-weight: 600;
  color: #c23a3a;
}

.arrow {
  color: #8b7355;
}

.next-city {
  color: rgba(61, 52, 38, 0.6);
  font-style: italic;
}

/* 主内容区 */
.main-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 30px;
  max-height: calc(100vh - 160px);
}

/* 地图容器 */
.map-container {
  position: relative;
  width: 90%;
  max-width: 800px;
  aspect-ratio: 2 / 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: grab;
  background: linear-gradient(135deg, #faf6ee 0%, #f0e8d5 100%);
  box-shadow:
    inset 0 0 30px rgba(92, 74, 61, 0.08),
    0 4px 20px rgba(0, 0, 0, 0.1);
  animation: mapExpand 1s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both;
}

.map-container:active {
  cursor: grabbing;
}

.map-wrapper {
  width: 100%;
  height: 100%;
  transition: transform 0.2s ease-out;
  transform-origin: center center;
}

.world-map {
  width: 100%;
  height: 100%;
  filter: saturate(0.7) brightness(1.05);
}

.map-continents path {
  transition: all 0.3s ease;
}

/* 航线 */
.route-line {
  fill: none;
  stroke: #d4a84b;
  opacity: 0.6;
  animation: drawRoute 1.5s ease-out forwards;
}

.route-line.route-active {
  opacity: 1;
  stroke: #d4a84b;
}

@keyframes drawRoute {
  from {
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dashoffset: 0;
  }
}

/* 图钉 */
.pin-group {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.pin-group:hover {
  transform: scale(1.1);
}

.pin-head {
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

.pin-glow {
  animation: pulse 3s ease-in-out infinite;
}

.pin-current .pin-head {
  animation: breathe 3s ease-in-out infinite;
}

.city-label {
  font-size: 11px;
  fill: #5c4a3d;
  font-weight: 500;
  pointer-events: none;
}

/* 小飞机 */
.plane-marker {
  position: absolute;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(212, 168, 75, 0.5));
  animation: planeFloat 2s ease-in-out infinite;
}

/* 明信片区 */
.postcard-section {
  position: relative;
  perspective: 1200px;
  animation: slideUp 0.8s ease-out 1.3s both;
}

.postcard-container {
  position: relative;
  width: 380px;
  height: 480px;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
}

.postcard-container.is-flipped {
  transform: rotateY(180deg);
}

.postcard-front,
.postcard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 4px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f4ec 100%);
  box-shadow:
    3px 4px 12px rgba(0, 0, 0, 0.12),
    inset 0 0 0 1px rgba(200, 190, 170, 0.2);
  overflow: hidden;
}

.postcard-back {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, #faf6ee 0%, #f5edd8 100%);
  padding: 25px;
}

/* 正面照片 */
.photo-frame {
  padding: 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.polaroid-photo {
  width: 100%;
  height: 85%;
  background-size: cover;
  background-position: center;
  border-radius: 2px;
  position: relative;
  filter: contrast(1.05) saturate(0.85) sepia(0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 60%,
    rgba(255, 248, 220, 0.3)
  );
}

.postcard-decoration {
  position: absolute;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  opacity: 0.7;
}

.flip-hint {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: rgba(61, 52, 38, 0.5);
  letter-spacing: 1px;
}

/* 背面内容 */
.stamp-area {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.postmark {
  transition: transform 0.3s ease;
}

.stamp {
  opacity: 0.8;
}

.guide-text h3 {
  font-size: 18px;
  font-weight: 600;
  color: #5c4a3d;
  margin-bottom: 15px;
  line-height: 1.4;
}

.guide-text p {
  font-size: 13px;
  line-height: 1.8;
  color: #3d3426;
  margin-bottom: 12px;
}

.guide-text .intro {
  font-style: italic;
  color: #5c4a3d;
}

.guide-text .fact {
  color: #8b7355;
  border-left: 2px solid #d4a84b;
  padding-left: 12px;
}

.guide-text .secret {
  color: #c23a3a;
  font-style: italic;
  font-size: 12px;
}

/* 装饰粒子层 */
.particles-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;
}

.particle {
  position: absolute;
  opacity: 0;
  animation: particleFall linear infinite;
}

.particle-sakura {
  width: 12px;
  height: 12px;
  background: radial-gradient(circle, #ffb7c5 0%, transparent 70%);
  border-radius: 50% 0 50% 50%;
}

.particle-leaf {
  width: 14px;
  height: 14px;
  background: radial-gradient(circle, #daa520 0%, #f4a460 100%);
  border-radius: 50% 0 50% 0;
  transform: rotate(45deg);
}

.particle-aurora {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #98fb98, transparent);
  border-radius: 2px;
  filter: blur(1px);
}

@keyframes particleFall {
  0% {
    opacity: 0;
    transform: translateY(-20px) rotate(0deg);
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    opacity: 0;
    transform: translateY(100vh) rotate(360deg);
  }
}

/* 底部工具栏 */
.toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(to top, rgba(245, 240, 225, 0.95), transparent);
  animation: slideUp 0.8s ease-out 2s both;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(255, 254, 248, 0.9), rgba(248, 244, 236, 0.9));
  border: 1px solid rgba(200, 190, 170, 0.3);
  border-radius: 20px;
  color: #5c4a3d;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tool-btn svg {
  width: 24px;
  height: 24px;
}

.tool-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #ffffff, #faf6ee);
}

.tool-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 任务弹窗 */
.task-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(61, 52, 38, 0.4);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.task-card {
  background: linear-gradient(135deg, #fffef8, #f8f4ec);
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 0 0 1px rgba(200, 190, 170, 0.3);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.task-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(200, 190, 170, 0.3);
}

.task-icon {
  width: 28px;
  height: 28px;
  color: #d4a84b;
}

.task-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #5c4a3d;
}

.task-content {
  margin-bottom: 20px;
}

.task-text {
  font-size: 14px;
  line-height: 1.8;
  color: #3d3426;
  margin-bottom: 20px;
  font-style: italic;
}

.complete-task-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #d4a84b, #c9983f);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.complete-task-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 168, 75, 0.4);
}

.task-stamp {
  display: flex;
  justify-content: center;
  animation: stampBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.close-task-btn {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid rgba(200, 190, 170, 0.4);
  border-radius: 6px;
  color: #8b7355;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-task-btn:hover {
  background: rgba(200, 190, 170, 0.1);
}

/* 动画关键帧 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes mapExpand {
  from {
    opacity: 0;
    transform: scale(0.3) rotate(2deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.15);
  }
}

@keyframes breathe {
  0%, 100% {
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
  }
  50% {
    filter: drop-shadow(0 2px 8px rgba(194, 58, 58, 0.5));
  }
}

@keyframes planeFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-3px) rotate(2deg); }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes stampBounce {
  0% {
    transform: scale(2) rotate(-15deg);
    opacity: 0;
  }
  60% {
    transform: scale(0.95) rotate(2deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .journey-header {
    padding: 15px 20px;
    flex-wrap: wrap;
  }

  .station-info {
    font-size: 12px;
  }

  .map-container {
    width: 95%;
  }

  .postcard-container {
    width: 320px;
    height: 420px;
  }

  .toolbar {
    gap: 12px;
    padding: 15px;
  }

  .tool-btn {
    padding: 10px 16px;
  }

  .tool-btn span {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .postcard-container {
    width: 290px;
    height: 380px;
  }

  .toolbar {
    gap: 8px;
  }

  .tool-btn {
    padding: 8px 12px;
  }

  .tool-btn svg {
    width: 20px;
    height: 20px;
  }
}
</style>
