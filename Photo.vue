<!-- 相册 - 气泡风格相册画廊，含悬浮卡片和全屏查看模式 -->
<template>
  <div class="bubble-gallery" ref="galleryRef" @mousemove="onMouseMove" :class="{ 'grid-mode': isGridMode, 'fullscreen-mode': isFullscreen }">
    <div class="background-layer">
      <div class="gradient-base" :style="gradientStyle"></div>
      <div class="noise-overlay"></div>
      <div class="floating-particles">
        <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
      </div>
    </div>

    <div class="ambient-glow" :style="glowStyle"></div>

    <transition name="fade">
      <div class="main-display-wrapper" v-if="!isGridMode" :class="{ 'transitioning': isTransitioning }">
        <div class="main-display" :style="{ transform: mainDisplayTransform }" @dblclick="openFullscreen">
          <img class="main-image" :src="currentImage?.url" :alt="currentImage?.name" @load="onImageLoad" />
          <div class="display-shine"></div>
          <div class="display-vignette"></div>
        </div>
        
        <transition name="slide-up">
          <div class="polaroid-sign" v-if="showInfo" :style="signStyle" :class="{ visible: signVisible }">
            <div class="sign-header">
              <span class="sign-name">{{ currentImage?.name || '未命名' }}</span>
              <button class="like-btn" @click.stop="toggleLike" :class="{ liked: isCurrentLiked }">
                <svg viewBox="0 0 24 24" class="heart-icon">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>
            <div class="sign-meta">
              <span class="meta-item">
                <svg viewBox="0 0 24 24" class="meta-icon"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
                {{ currentImage?.width || 0 }} × {{ currentImage?.height || 0 }}
              </span>
              <span class="meta-item">
                <svg viewBox="0 0 24 24" class="meta-icon"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 6v6l4 2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
                {{ formatFileSize(currentImage?.size) }}
              </span>
            </div>
            <div class="sign-source" v-if="currentImage?.source">
              <svg viewBox="0 0 24 24" class="source-icon"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
              {{ currentImage.source }}
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <transition name="fade">
      <div class="grid-container" v-if="isGridMode">
        <div class="grid-header">
          <h2 class="grid-title">图片画廊</h2>
          <span class="grid-count">{{ images.length }} 张图片</span>
        </div>
        <div class="grid-scroll">
          <div
            v-for="(img, idx) in images"
            :key="'grid-' + idx"
            class="grid-item"
            :class="{ active: idx === currentIndex, liked: likedImages.includes(img.id) }"
            @click="selectFromGrid(idx)"
          >
            <img :src="img.thumb || img.url" :alt="img.name" loading="lazy" />
            <div class="grid-item-overlay">
              <span class="grid-item-name">{{ img.name }}</span>
            </div>
            <div class="grid-item-indicator" v-if="idx === currentIndex"></div>
          </div>
        </div>
      </div>
    </transition>

    <transition-group name="bubble" tag="div" class="bubbles-container">
      <preview-bubble
        v-for="(img, idx) in images"
        v-show="!isGridMode"
        :key="'bubble-' + idx"
        :image="img"
        :index="idx"
        :is-active="idx === currentIndex"
        :is-transitioning="isTransitioning && transitioningFrom === idx"
        :bubble-position="bubblePositions[idx]"
        @select="onSelectImage"
      />
    </transition-group>

    <div class="control-bar" :class="{ visible: controlBarVisible }">
      <div class="control-left">
        <button class="control-btn" @click="toggleGridMode" :class="{ active: isGridMode }" title="网格视图">
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="3" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="14" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="14" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        </button>
        <button class="control-btn" @click="toggleInfo" :class="{ active: showInfo }" title="图片信息">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 16v-4M12 8h.01" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        <button class="control-btn" @click="toggleSlideshow" :class="{ active: isPlaying }" title="自动播放">
          <svg viewBox="0 0 24 24" v-if="!isPlaying"><polygon points="5,3 19,12 5,21" fill="currentColor"/></svg>
          <svg viewBox="0 0 24 24" v-else><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>
        </button>
      </div>

      <div class="control-center">
        <div class="progress-track" @click="seekProgress">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
        </div>
        <div class="image-counter">
          <span class="current-num">{{ currentIndex + 1 }}</span>
          <span class="separator">/</span>
          <span class="total-num">{{ images.length }}</span>
        </div>
      </div>

      <div class="control-right">
        <button class="control-btn" @click="prevImage" title="上一张">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button class="control-btn" @click="nextImage" title="下一张">
          <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button class="control-btn" @click="downloadImage" title="下载">
          <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button class="control-btn" @click="openFullscreen" title="全屏">
          <svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>

    <transition name="fade">
      <div class="hint-text" v-if="showHint && !isGridMode">
        <span class="hint-icon">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 16v-4M12 8h.01" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </span>
        双击查看大图 · 方向键切换
      </div>
    </transition>

    <transition name="zoom">
      <div class="fullscreen-viewer" v-if="isFullscreen" @click="closeFullscreen">
        <img :src="currentImage?.url" :alt="currentImage?.name" class="fullscreen-image" @click.stop />
        <button class="fullscreen-close" @click="closeFullscreen">
          <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <div class="fullscreen-nav prev" @click.stop="prevImage">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2"/></svg>
        </div>
        <div class="fullscreen-nav next" @click.stop="nextImage">
          <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" stroke-width="2"/></svg>
        </div>
      </div>
    </transition>

    <transition name="toast">
      <div class="toast-message" v-if="toastMessage">
        <span class="toast-text">{{ toastMessage }}</span>
      </div>
    </transition>

    <div class="keyboard-hint" v-if="showKeyboardHints">
      <div class="hint-row"><kbd>←</kbd><kbd>→</kbd> 切换图片</div>
      <div class="hint-row"><kbd>Space</kbd> 播放/暂停</div>
      <div class="hint-row"><kbd>G</kbd> 网格视图</div>
      <div class="hint-row"><kbd>I</kbd> 图片信息</div>
      <div class="hint-row"><kbd>F</kbd> 全屏</div>
      <div class="hint-row"><kbd>L</kbd> 收藏</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => {
      const makeGradientSVG = (c1, c2, size) => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="${size}" height="${size}" fill="url(#g)" rx="8"/></svg>`
        return 'data:image/svg+xml,' + encodeURIComponent(svg)
      }
      const palette = [
        { c1: '#FFD4B8', c2: '#FFE8D8', name: '暖阳晨光' },
        { c1: '#F5C6AA', c2: '#FDE8D8', name: '蜜桃甜心' },
        { c1: '#E8C4B8', c2: '#F5E8E0', name: '旧时光影' },
        { c1: '#F5D8C8', c2: '#FFF0E8', name: '焦糖拿铁' },
        { c1: '#FFB8A8', c2: '#FFE4D8', name: '珊瑚海' },
        { c1: '#D8C4B8', c2: '#F0E8E0', name: '奶茶时光' },
        { c1: '#E8D4C8', c2: '#F8F0E8', name: '杏仁豆腐' },
        { c1: '#C8B8A8', c2: '#E8E0D8', name: '褐石古巷' },
        { c1: '#8FA89A', c2: '#EDE8E0', name: '竹露清响' },
        { c1: '#D4AA90', c2: '#FDF0E8', name: '落日余温' },
        { c1: '#B8D4E8', c2: '#E8F4FC', name: '晴空蔚蓝' },
        { c1: '#D4B8E8', c2: '#F0E8FC', name: '薰衣草田' }
      ]
      return palette.map((p, i) => ({
        id: String(i + 1),
        url: makeGradientSVG(p.c1, p.c2, 800),
        thumb: makeGradientSVG(p.c1, p.c2, 150),
        name: p.name + '_' + (i + 1) + '.jpg',
        width: 2400 + i * 80,
        height: 1600 + i * 50,
        size: 1024 * 1024 * (1 + Math.random()),
        source: '本地画廊',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }))
    }
  },
  defaultIndex: {
    type: Number,
    default: 0
  },
  autoplayInterval: {
    type: Number,
    default: 5000
  }
})

const emit = defineEmits(['imageSelect', 'doubleClick', 'like', 'unlike'])

const galleryRef = ref(null)
const currentIndex = ref(props.defaultIndex)
const isTransitioning = ref(false)
const transitioningFrom = ref(-1)
const showHint = ref(false)
const mousePos = reactive({ x: 0.5, y: 0.5 })
const bubblePositions = ref([])

const isGridMode = ref(false)
const showInfo = ref(true)
const signVisible = ref(false)
const isPlaying = ref(false)
const isFullscreen = ref(false)
const likedImages = ref([])
const toastMessage = ref('')
const controlBarVisible = ref(true)
const showKeyboardHints = ref(false)

let slideshowTimer = null
let hintTimer = null
let controlBarTimer = null
let hideTimer = null

const currentImage = computed(() => props.images[currentIndex.value] || props.images[0])

const isCurrentLiked = computed(() => likedImages.value.includes(currentImage.value?.id))

const progressPercent = computed(() => ((currentIndex.value + 1) / props.images.length) * 100)

const glowStyle = computed(() => ({
  background: `radial-gradient(800px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,183,153,0.15), transparent 60%)`
}))

const gradientStyle = computed(() => {
  const img = currentImage.value
  if (!img) return {}
  return {
    background: `linear-gradient(135deg, ${extractColor(img.url, 'c1')} 0%, ${extractColor(img.url, 'c2')} 100%)`
  }
})

function extractColor(url, key) {
  const match = url.match(new RegExp(`${key}['"]\\s*stop-color=['"]([^'"]+)`))
  return match ? match[1] : '#FFFBF7'
}

const mainDisplayTransform = computed(() =>
  isTransitioning.value ? 'scale(0.96)' : 'scale(1)'
)

const signStyle = computed(() => ({
  '--rot': (-2 - Math.random() * 3) + 'deg'
}))

function getParticleStyle(i) {
  return {
    '--delay': `${Math.random() * 20}s`,
    '--duration': `${15 + Math.random() * 10}s`,
    '--x': `${Math.random() * 100}%`,
    '--size': `${2 + Math.random() * 4}px`,
    '--opacity': 0.1 + Math.random() * 0.2
  }
}

function generateBubblePositions() {
  const count = props.images.length
  const positions = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
    const baseRadius = 32
    const radiusVar = 10 + Math.random() * 12
    const r = baseRadius + radiusVar
    const x = 50 + Math.cos(angle) * r
    const y = 50 + Math.sin(angle) * r
    const size = 48 + Math.random() * 24
    const floatDelay = Math.random() * 4
    const floatDuration = 4 + Math.random() * 3
    const rotation = (Math.random() - 0.5) * 12
    positions.push({
      x,
      y,
      size,
      floatDelay,
      floatDuration,
      rotation,
      delay: i * 80 + Math.random() * 80
    })
  }
  bubblePositions.value = positions
}

function onMouseMove(e) {
  if (!galleryRef.value) return
  const rect = galleryRef.value.getBoundingClientRect()
  mousePos.x = (e.clientX - rect.left) / rect.width
  mousePos.y = (e.clientY - rect.top) / rect.height
  
  clearTimeout(controlBarTimer)
  controlBarVisible.value = true
  controlBarTimer = setTimeout(() => {
    if (!isGridMode.value) controlBarVisible.value = false
  }, 3000)
}

function onSelectImage(index) {
  if (index === currentIndex.value || isTransitioning.value) return
  transitioningFrom.value = index
  isTransitioning.value = true
  signVisible.value = false
  
  setTimeout(() => {
    currentIndex.value = index
    setTimeout(() => {
      isTransitioning.value = false
      transitioningFrom.value = -1
      signVisible.value = true
    }, 500)
  }, 350)
}

function prevImage() {
  const newIndex = currentIndex.value > 0 ? currentIndex.value - 1 : props.images.length - 1
  onSelectImage(newIndex)
}

function nextImage() {
  const newIndex = currentIndex.value < props.images.length - 1 ? currentIndex.value + 1 : 0
  onSelectImage(newIndex)
}

function selectFromGrid(index) {
  isGridMode.value = false
  onSelectImage(index)
}

function toggleGridMode() {
  isGridMode.value = !isGridMode.value
  if (isGridMode.value) {
    stopSlideshow()
  }
}

function toggleInfo() {
  showInfo.value = !showInfo.value
}

function toggleSlideshow() {
  if (isPlaying.value) {
    stopSlideshow()
    showToast('已暂停播放')
  } else {
    startSlideshow()
    showToast('开始自动播放')
  }
}

function startSlideshow() {
  isPlaying.value = true
  slideshowTimer = setInterval(() => {
    nextImage()
  }, props.autoplayInterval)
}

function stopSlideshow() {
  isPlaying.value = false
  if (slideshowTimer) {
    clearInterval(slideshowTimer)
    slideshowTimer = null
  }
}

function toggleLike() {
  const img = currentImage.value
  if (!img) return
  
  const index = likedImages.value.indexOf(img.id)
  if (index > -1) {
    likedImages.value.splice(index, 1)
    emit('unlike', img)
    showToast('已取消收藏')
  } else {
    likedImages.value.push(img.id)
    emit('like', img)
    showToast('已添加收藏')
  }
}

function openFullscreen() {
  isFullscreen.value = true
  document.body.style.overflow = 'hidden'
}

function closeFullscreen() {
  isFullscreen.value = false
  document.body.style.overflow = ''
}

function downloadImage() {
  const img = currentImage.value
  if (!img) return
  
  const link = document.createElement('a')
  link.href = img.url
  link.download = img.name || 'image.jpg'
  link.click()
  showToast('开始下载: ' + img.name)
}

function seekProgress(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  const index = Math.floor(percent * props.images.length)
  onSelectImage(Math.max(0, Math.min(index, props.images.length - 1)))
}

function formatFileSize(bytes) {
  if (!bytes) return '未知'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }
  return bytes.toFixed(1) + ' ' + units[i]
}

function showToast(message) {
  toastMessage.value = message
  setTimeout(() => {
    toastMessage.value = ''
  }, 2000)
}

function onImageLoad() {
  signVisible.value = true
}

function handleKeydown(e) {
  if (isFullscreen.value && e.key === 'Escape') {
    closeFullscreen()
    return
  }
  
  switch (e.key) {
    case 'ArrowLeft':
      prevImage()
      break
    case 'ArrowRight':
      nextImage()
      break
    case ' ':
      e.preventDefault()
      toggleSlideshow()
      break
    case 'g':
    case 'G':
      toggleGridMode()
      break
    case 'i':
    case 'I':
      toggleInfo()
      break
    case 'f':
    case 'F':
      if (isFullscreen.value) closeFullscreen()
      else openFullscreen()
      break
    case 'l':
    case 'L':
      toggleLike()
      break
    case '?':
      showKeyboardHints.value = !showKeyboardHints.value
      break
  }
}

onMounted(() => {
  generateBubblePositions()
  
  nextTick(() => {
    setTimeout(() => { 
      showHint.value = true 
    }, 2000)
    setTimeout(() => { 
      showHint.value = false 
    }, 6000)
    
    setTimeout(() => {
      signVisible.value = true
    }, 1500)
  })
  
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  clearTimeout(hintTimer)
  clearTimeout(controlBarTimer)
  stopSlideshow()
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<script>
const PreviewBubble = {
  name: 'PreviewBubble',
  props: ['image', 'index', 'isActive', 'isTransitioning', 'bubblePosition'],
  emits: ['select'],
  template: `
    <div
      class="preview-bubble"
      :class="{
        active: isActive,
        transitioning: isTransitioning,
        entered: entered
      }"
      :style="bubbleStyle"
      @click="$emit('select', index)"
      role="button"
      :aria-label="image?.name || '图片'"
      tabindex="0"
      @keydown.enter="$emit('select', index)"
      @keydown.space.prevent="$emit('select', index)"
      @mouseenter="onHoverIn"
      @mouseleave="onHoverOut"
    >
      <div class="bubble-inner">
        <img :src="image?.thumb || image?.url" :alt="image?.name" loading="lazy" />
        <div class="bubble-shine"></div>
        <div class="bubble-ring" v-if="isActive"></div>
      </div>
      <transition name="fade">
        <div class="bubble-tooltip" v-if="showTooltip">
          <span class="tooltip-name">{{ image?.name }}</span>
          <span class="tooltip-index">{{ index + 1 }} / {{ total }}</span>
        </div>
      </transition>
    </div>
  `,
  data() {
    return {
      entered: false,
      showTooltip: false,
      hovered: false
    }
  },
  computed: {
    total() {
      return this.$parent?.images?.length || 10
    },
    bubbleStyle() {
      const pos = this.bubblePosition || {}
      const size = pos.size || 56
      let transform = `translate(${pos.x || 0}vw, ${pos.y || 0}vh) rotate(${pos.rotation || 0}deg)`
      if (this.isTransitioning) {
        transform += ' scale(1.15)'
      } else if (this.hovered && !this.isActive) {
        transform += ' scale(1.12)'
      }
      return {
        '--bubble-size': size + 'px',
        '--float-delay': (pos.floatDelay || 0) + 's',
        '--float-duration': (pos.floatDuration || 5) + 's',
        '--entry-delay': (pos.delay || 0) + 'ms',
        transform,
        opacity: this.isTransitioning ? 0.5 : (this.isActive ? 1 : undefined)
      }
    }
  },
  mounted() {
    const delay = this.bubblePosition?.delay || this.index * 100
    setTimeout(() => { this.entered = true }, delay + 800)
  },
  methods: {
    onHoverIn() {
      this.hovered = true
      setTimeout(() => { this.showTooltip = true }, 300)
    },
    onHoverOut() {
      this.hovered = false
      this.showTooltip = false
    }
  }
}

export { PreviewBubble }
</script>

<style scoped>
.bubble-gallery {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #FFFBF7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', 'Noto Sans SC', system-ui, sans-serif;
  transition: background 0.5s ease;
}

.background-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.gradient-base {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  transition: all 1s ease;
}

.noise-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.floating-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  left: var(--x);
  width: var(--size);
  height: var(--size);
  background: rgba(255, 200, 180, var(--opacity));
  border-radius: 50%;
  animation: particleFloat var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-20vh) scale(1);
    opacity: 0;
  }
}

.ambient-glow {
  position: absolute;
  inset: -20%;
  pointer-events: none;
  transition: background 0.8s ease;
  z-index: 1;
}

.main-display-wrapper {
  position: relative;
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: mainEntry 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: 0.3s;
}

.main-display-wrapper.transitioning .main-display {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes mainEntry {
  from {
    opacity: 0;
    transform: scale(0.3) rotate(-5deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.main-display {
  position: relative;
  width: min(48vw, 460px);
  height: min(48vw, 460px);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(30px) saturate(1.5);
  -webkit-backdrop-filter: blur(30px) saturate(1.5);
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 10px 50px rgba(255, 150, 100, 0.15),
    0 4px 20px rgba(255, 120, 80, 0.08),
    inset 0 0 40px rgba(255, 255, 255, 0.3);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: breathe 10s ease-in-out infinite;
  cursor: pointer;
}

.main-display:hover {
  transform: scale(1.02);
  box-shadow:
    0 15px 60px rgba(255, 150, 100, 0.2),
    0 6px 25px rgba(255, 120, 80, 0.1),
    inset 0 0 50px rgba(255, 255, 255, 0.35);
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.008); }
}

.main-image {
  width: 86%;
  height: 86%;
  object-fit: cover;
  border-radius: 50%;
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.display-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    135deg,
    transparent 35%,
    rgba(255, 255, 255, 0.08) 42%,
    rgba(255, 255, 255, 0.15) 48%,
    transparent 55%
  );
  pointer-events: none;
  animation: shineRotate 25s linear infinite;
}

@keyframes shineRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.display-vignette {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.05);
  pointer-events: none;
}

.polaroid-sign {
  position: absolute;
  bottom: -16px;
  right: -32px;
  min-width: 180px;
  padding: 14px 18px 12px;
  background: rgba(35, 30, 25, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 4px;
  color: #F5F0EA;
  font-family: 'Caveat', 'Ma Shan Zheng', cursive;
  line-height: 1.5;
  opacity: 0;
  transform: translateY(12px) rotate(var(--rot, -3deg));
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: auto;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  z-index: 16;
}

.polaroid-sign.visible {
  opacity: 1;
  transform: translateY(0) rotate(var(--rot, -3deg));
}

.sign-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.sign-name {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #FFF;
}

.like-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.like-btn .heart-icon {
  width: 18px;
  height: 18px;
  fill: transparent;
  stroke: rgba(255, 255, 255, 0.6);
  stroke-width: 1.5;
  transition: all 0.3s ease;
}

.like-btn:hover .heart-icon {
  stroke: #FF6B6B;
}

.like-btn.liked .heart-icon {
  fill: #FF6B6B;
  stroke: #FF6B6B;
  animation: heartPop 0.4s ease;
}

@keyframes heartPop {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.sign-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  opacity: 0.7;
  font-family: 'Inter', sans-serif;
}

.meta-icon {
  width: 12px;
  height: 12px;
}

.sign-source {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  opacity: 0.5;
  font-style: italic;
  font-family: 'Inter', sans-serif;
}

.source-icon {
  width: 10px;
  height: 10px;
}

.grid-container {
  position: relative;
  z-index: 20;
  width: 90%;
  max-width: 1200px;
  max-height: 80vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  animation: gridEntry 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes gridEntry {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.grid-title {
  font-size: 20px;
  font-weight: 600;
  color: #2D2620;
  margin: 0;
}

.grid-count {
  font-size: 13px;
  color: rgba(45, 38, 32, 0.5);
}

.grid-scroll {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px;
}

.grid-scroll::-webkit-scrollbar {
  width: 6px;
}

.grid-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 3px;
}

.grid-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.grid-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.grid-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.grid-item:hover img {
  transform: scale(1.08);
}

.grid-item.active {
  ring: 3px solid #FF9B7A;
  box-shadow: 0 0 0 3px #FF9B7A;
}

.grid-item.liked::after {
  content: '❤';
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 14px;
}

.grid-item-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.6) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  padding: 10px;
}

.grid-item:hover .grid-item-overlay {
  opacity: 1;
}

.grid-item-name {
  font-size: 11px;
  color: #FFF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid-item-indicator {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 8px;
  height: 8px;
  background: #FF9B7A;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 155, 122, 0.5);
}

.bubbles-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

.preview-bubble {
  position: absolute;
  width: var(--bubble-size, 56px);
  height: var(--bubble-size, 56px);
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.3);
  transition:
    transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.5s ease,
    box-shadow 0.3s ease;
  animation: bubbleFloat var(--float-duration, 5s) ease-in-out infinite var(--float-delay, 0s);
  will-change: transform, opacity;
  pointer-events: auto;
  z-index: 10;
}

.preview-bubble.entered {
  opacity: 0.85;
  transform: translate(var(--tx, 0), var(--ty, 0)) scale(1);
}

.preview-bubble.active {
  opacity: 1;
  box-shadow:
    0 8px 30px rgba(255, 140, 90, 0.25),
    0 3px 10px rgba(255, 120, 80, 0.15);
}

.preview-bubble.transitioning {
  animation: none;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}

.preview-bubble:not(.active):not(.transitioning):hover {
  opacity: 1;
  z-index: 18;
}

@keyframes bubbleFloat {
  0%, 100% { margin-top: 0; }
  50% { margin-top: -6px; }
}

.bubble-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(14px) saturate(1.4);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  border: 1.5px solid rgba(255, 255, 255, 0.55);
  box-shadow:
    0 5px 20px rgba(255, 140, 100, 0.12),
    inset 0 0 16px rgba(255, 255, 255, 0.25);
  position: relative;
}

.bubble-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 12s ease-in-out;
  animation: innerRotate 18s ease-in-out infinite;
}

@keyframes innerRotate {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(3deg) scale(1.05); }
}

.bubble-shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 45%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.25) 0%,
    transparent 100%
  );
  border-radius: 50% 50% 0 0;
  pointer-events: none;
}

.bubble-ring {
  position: absolute;
  inset: -3px;
  border: 2px solid rgba(255, 155, 122, 0.6);
  border-radius: 50%;
  animation: ringPulse 2s ease-in-out infinite;
}

@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.5; }
}

.bubble-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 14px;
  background: rgba(35, 30, 25, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tooltip-name {
  font-size: 12px;
  color: #FFF;
  font-weight: 500;
}

.tooltip-index {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.control-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: linear-gradient(180deg, transparent 0%, rgba(255, 251, 247, 0.95) 30%);
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 50;
}

.control-bar.visible {
  transform: translateY(0);
}

.control-left,
.control-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  color: #5A524A;
}

.control-btn svg {
  width: 18px;
  height: 18px;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.control-btn.active {
  background: rgba(255, 155, 122, 0.15);
  color: #FF9B7A;
  border-color: rgba(255, 155, 122, 0.3);
}

.control-center {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  max-width: 400px;
  margin: 0 24px;
}

.progress-track {
  flex: 1;
  height: 4px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFB8A8, #FF9B7A);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: #FF9B7A;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 6px rgba(255, 155, 122, 0.4);
  transition: left 0.3s ease;
}

.image-counter {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 13px;
}

.current-num {
  font-size: 16px;
  font-weight: 600;
  color: #2D2620;
}

.separator {
  color: rgba(45, 38, 32, 0.3);
  margin: 0 2px;
}

.total-num {
  color: rgba(45, 38, 32, 0.5);
}

.hint-text {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(35, 30, 25, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  letter-spacing: 0.5px;
  pointer-events: none;
  z-index: 5;
}

.hint-icon {
  display: flex;
  align-items: center;
}

.hint-icon svg {
  width: 14px;
  height: 14px;
}

.fullscreen-viewer {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: zoom-out;
}

.fullscreen-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  cursor: default;
}

.fullscreen-close {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.fullscreen-close svg {
  width: 24px;
  height: 24px;
  color: #FFF;
}

.fullscreen-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.fullscreen-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.fullscreen-nav svg {
  width: 24px;
  height: 24px;
  color: #FFF;
}

.fullscreen-nav:hover {
  background: rgba(255, 255, 255, 0.2);
}

.fullscreen-nav.prev {
  left: 24px;
}

.fullscreen-nav.next {
  right: 24px;
}

.toast-message {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: rgba(35, 30, 25, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 200;
}

.toast-text {
  font-size: 13px;
  color: #FFF;
  letter-spacing: 0.5px;
}

.keyboard-hint {
  position: fixed;
  bottom: 100px;
  right: 24px;
  padding: 16px 20px;
  background: rgba(35, 30, 25, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hint-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.hint-row kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 22px;
  padding: 0 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 11px;
  color: #FFF;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) rotate(var(--rot, -3deg));
}

.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

.bubble-enter-active {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bubble-leave-active {
  transition: all 0.4s ease;
}

.bubble-enter-from {
  opacity: 0;
  transform: scale(0.3);
}

.bubble-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>
