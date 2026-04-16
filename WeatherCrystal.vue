<!-- 气象水晶 - 天气展示组件，毛玻璃球体+翻转预报+鼠标视差 -->
<template>
  <div class="macaron-weather" :class="{ 'weather-rainy': weatherType === 'rainy' }" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
    <!-- 背景层 -->
    <div class="mw-background"></div>
    <div class="mw-bg-texture"></div>

    <!-- 呼吸圆球群 -->
    <div v-for="(sphere, index) in spheres" :key="index"
         class="mw-sphere"
         :style="getSphereStyle(sphere, index)">
    </div>

    <!-- 星光粒子 -->
    <div v-for="(star, idx) in stars" :key="'star-' + idx"
         class="mw-star"
         :style="star.style">
    </div>

    <!-- 左上角：城市锚点 -->
    <div class="mw-city-anchor" :class="{ 'visible': entranceStage >= 4 }"
         :style="cityAnchorTransform">
      <div class="city-name">{{ cityData.name }}</div>
      <div class="live-tag">
        <span class="live-dot"></span>实时更新中
      </div>
    </div>

    <!-- 中心主体：毛玻璃气象球 -->
    <div class="mw-orb-container" :class="{ 'visible': entranceStage >= 2, 'flipped': isFlipped }"
         :style="orbContainerTransform">
      <div class="orb-glow-ring"></div>
      <div class="mw-orb-inner" @click="toggleFlip">
        <!-- 正面 -->
        <div class="orb-face orb-front">
          <div class="weather-visual" :class="'type-' + weatherType">
            <img v-if="weatherType === 'sunny'" :src="sunImage" alt="" class="weather-img sunny-img" @load="onImageLoad" />
            <img v-if="weatherType === 'rainy'" :src="rainImage" alt="" class="weather-img rainy-img" @load="onImageLoad" />
          </div>
          <div class="temperature-display">
            <span class="temp-number">{{ cityData.temperature }}</span>
            <span class="temp-unit">°</span>
            <span class="weather-label">{{ weatherType === 'sunny' ? '晴' : '雨' }}</span>
          </div>
          <div class="orb-shine"></div>
        </div>
        <!-- 背面：三日预报 -->
        <div class="orb-face orb-back">
          <div class="forecast-title">未来三日</div>
          <div class="forecast-list">
            <div v-for="(day, idx) in forecastData" :key="idx" class="forecast-item">
              <span class="forecast-day">{{ day.label }}</span>
              <span class="forecast-icon">{{ day.icon }}</span>
              <span class="forecast-temp">{{ day.temp }}°</span>
            </div>
          </div>
          <div class="flip-hint">点击返回</div>
        </div>
      </div>
    </div>

    <!-- 右下角：兔子装饰 -->
    <div class="mw-mascot" :class="{ 'visible': entranceStage >= 5 }"
         :style="mascotTransform" @mouseenter="mascotHover = true" @mouseleave="mascotHover = false">
      <svg viewBox="0 0 64 64" width="56" height="56" class="mascot-svg">
        <ellipse cx="32" cy="42" rx="18" ry="16" fill="#FFB6C1" opacity="0.85"/>
        <ellipse cx="32" cy="40" rx="14" ry="12" fill="#FFC0CB" opacity="0.9"/>
        <circle cx="25" cy="38" r="2.5" fill="#5D4E5D"/>
        <circle cx="39" cy="38" r="2.5" fill="#5D4E5D"/>
        <ellipse cx="22" cy="18" rx="6" ry="14" fill="#FFB6C1" opacity="0.8" transform="rotate(-12 22 18)"/>
        <ellipse cx="42" cy="18" rx="6" ry="14" fill="#FFB6C1" opacity="0.8" transform="rotate(12 42 18)"/>
        <ellipse cx="22" cy="16" rx="3.5" ry="10" fill="#FFDDE1" opacity="0.7" transform="rotate(-12 22 16)"/>
        <ellipse cx="42" cy="16" rx="3.5" ry="10" fill="#FFDDE1" opacity="0.7" transform="rotate(12 42 16)"/>
        <path d="M29 44 Q32 47 35 44" stroke="#D4899A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <ellipse cx="20" cy="41" rx="4" ry="2.5" fill="#FF9AAC" opacity="0.3"/>
        <ellipse cx="44" cy="41" rx="4" ry="2.5" fill="#FF9AAC" opacity="0.3"/>
      </svg>
      <transition name="tooltip-fade">
        <div v-if="mascotHover" class="mascot-tooltip">戳戳我看预报~</div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

const weatherType = ref('sunny')
const isFlipped = ref(false)
const entranceStage = ref(0)
const mascotHover = ref(false)
const mousePosition = reactive({ x: 0.5, y: 0.5 })
const targetMousePosition = reactive({ x: 0.5, y: 0.5 })
let animationFrameId = null

const sunImage = 'https://i.mji.rip/demo/sun_3d.png'
const rainImage = 'https://i.mji.rip/demo/rain_3d.png'

const cityData = reactive({
  name: '上海',
  temperature: 26
})

const forecastData = reactive([
  { label: '明天', icon: '☀', temp: 28 },
  { label: '后天', icon: '⛅', temp: 24 },
  { label: '大后天', icon: '🌧', temp: 21 }
])

const spheres = [
  { x: '8%', y: '12%', size: 100, color: 'rgba(255,182,193,0.18)', delay: 0 },
  { x: '82%', y: '8%', size: 75, color: 'rgba(173,216,230,0.16)', delay: 0.6 },
  { x: '6%', y: '70%', size: 90, color: 'rgba(173,216,230,0.13)', delay: 1.2 },
  { x: '80%', y: '72%', size: 110, color: 'rgba(255,182,193,0.15)', delay: 1.8 },
  { x: '50%', y: '5%', size: 55, color: 'rgba(255,218,233,0.14)', delay: 2.4 }
]

const stars = Array.from({ length: 12 }, (_, i) => ({
  style: {
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    animationDelay: (Math.random() * 3) + 's',
    width: (2 + Math.random() * 3) + 'px',
    height: (2 + Math.random() * 3) + 'px'
  }
}))

function getSphereStyle(sphere, index) {
  const offsetX = (mousePosition.x - 0.5) * (24 + index * 5)
  const offsetY = (mousePosition.y - 0.5) * (24 + index * 5)
  return {
    left: sphere.x,
    top: sphere.y,
    width: sphere.size + 'px',
    height: sphere.size + 'px',
    background: `radial-gradient(circle at 40% 40%, ${sphere.color}, transparent 70%)`,
    animationDelay: sphere.delay + 's',
    transform: `translate(${offsetX}px, ${offsetY}px)`
  }
}

const orbContainerTransform = computed(() => {
  const offsetX = (mousePosition.x - 0.5) * 12
  const offsetY = (mousePosition.y - 0.5) * 12
  return {
    transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`
  }
})

const cityAnchorTransform = computed(() => {
  const offsetX = (mousePosition.x - 0.5) * 18
  const offsetY = (mousePosition.y - 0.5) * 18
  return {
    transform: `translate(${offsetX}px, ${offsetY}px)`
  }
})

const mascotTransform = computed(() => {
  const offsetX = (mousePosition.x - 0.5) * 20
  const offsetY = (mousePosition.y - 0.5) * 20
  return {
    transform: `translate(${offsetX}px, ${offsetY}px) scale(${mascotHover.value ? 1.15 : 1})`
  }
})

function handleMouseMove(e) {
  targetMousePosition.x = e.clientX / window.innerWidth
  targetMousePosition.y = e.clientY / window.innerHeight
}

function handleMouseLeave() {
  targetMousePosition.x = 0.5
  targetMousePosition.y = 0.5
}

function smoothFollow() {
  mousePosition.x += (targetMousePosition.x - mousePosition.x) * 0.05
  mousePosition.y += (targetMousePosition.y - mousePosition.y) * 0.05
  animationFrameId = requestAnimationFrame(smoothFollow)
}

function toggleFlip() {
  isFlipped.value = !isFlipped.value
}

function onImageLoad() {}

function runEntranceAnimation() {
  setTimeout(() => { entranceStage.value = 1 }, 0)
  setTimeout(() => { entranceStage.value = 2 }, 600)
  setTimeout(() => { entranceStage.value = 3 }, 900)
  setTimeout(() => { entranceStage.value = 4 }, 1100)
  setTimeout(() => { entranceStage.value = 5 }, 1300)
}

onMounted(() => {
  smoothFollow()
  runEntranceAnimation()
  const sunImg = new Image()
  sunImg.src = sunImage
  const rainImg = new Image()
  rainImg.src = rainImage
})

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})
</script>

<style scoped>
.macaron-weather {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 背景层 */
.mw-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(145deg, #FFF0F3 0%, #EDF5FC 45%, #FEF6FA 100%);
  opacity: 0;
  animation: bgFadeIn 1s ease-out forwards;
}

.mw-bg-texture {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255,200,215,0.06) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(180,210,235,0.06) 0%, transparent 50%);
  pointer-events: none;
}

.macaron-weather.weather-rainy .mw-background {
  background: linear-gradient(145deg, #E4ECF4 0%, #EBE6F2 45%, #E8EFF5 100%);
}

@keyframes bgFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 呼吸圆球 */
.mw-sphere {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  animation: sphereFloatIn 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, sphereBreathe 4s ease-in-out infinite;
  will-change: transform, opacity;
}

@keyframes sphereFloatIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.6);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes sphereBreathe {
  0%, 100% {
    opacity: 0.15;
    transform: scale(1);
  }
  50% {
    opacity: 0.32;
    transform: scale(1.1);
  }
}

/* 星光粒子 */
.mw-star {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 220, 230, 0.6);
  pointer-events: none;
  animation: starTwinkle 3s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(255, 200, 220, 0.3);
}

@keyframes starTwinkle {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 0.65; transform: scale(1.3); }
}

/* 城市锚点 */
.mw-city-anchor {
  position: absolute;
  top: 36px;
  left: 40px;
  z-index: 20;
  padding: 14px 22px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 18px;
  opacity: 0;
  transform: translateX(-20px);
  transition: opacity 0.7s ease-out, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity;
  box-shadow:
    0 4px 24px rgba(255, 182, 193, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.mw-city-anchor.visible {
  opacity: 1;
  transform: translateX(0);
}

.city-name {
  font-size: 17px;
  font-weight: 600;
  color: rgba(80, 55, 70, 0.88);
  letter-spacing: 3px;
  margin-bottom: 5px;
}

.live-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #E88FA0;
  background: rgba(255, 245, 248, 0.7);
  padding: 3px 11px;
  border-radius: 10px;
  letter-spacing: 1px;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #E88FA0;
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}

/* 中心毛玻璃容器 */
.mw-orb-container {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 10;
  opacity: 0;
  transform: translate(-50%, calc(-50% + 25px));
  transition: opacity 0.7s ease-out, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
  perspective: 1200px;
  will-change: transform, opacity;
}

.mw-orb-container.visible {
  opacity: 1;
  transform: translate(-50%, -50%);
}

.orb-glow-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 380px;
  height: 380px;
  margin-left: -190px;
  margin-top: -190px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,210,225,0.2) 0%, transparent 65%);
  filter: blur(30px);
  pointer-events: none;
  animation: ringPulse 5s ease-in-out infinite;
  z-index: -1;
}

@keyframes ringPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.08); }
}

.mw-orb-inner {
  position: relative;
  width: 300px;
  min-height: 370px;
  transform-style: preserve-3d;
  transition: transform 0.75s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  animation: gentleFloat 4s ease-in-out infinite 2s;
}

@keyframes gentleFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.mw-orb-container.flipped .mw-orb-inner {
  transform: rotateY(180deg);
  animation: none;
}

.orb-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1.5px solid rgba(255, 255, 255, 0.55);
  box-shadow:
    0 8px 40px rgba(255, 182, 193, 0.22),
    0 2px 16px rgba(173, 216, 230, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    inset 0 -1px 0 rgba(255, 182, 193, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 28px 36px;
  overflow: hidden;
}

.orb-face::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 55%;
  background: linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%);
  border-radius: 28px 28px 0 0;
  pointer-events: none;
}

.orb-back {
  transform: rotateY(180deg);
  background: rgba(255, 248, 250, 0.38);
}

.orb-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(from 140deg at 50% 50%, transparent 0%, rgba(255,255,255,0.08) 10%, transparent 20%);
  pointer-events: none;
  animation: shineRotate 12s linear infinite;
}

@keyframes shineRotate {
  to { transform: rotate(360deg); }
}

/* 气象图 */
.weather-visual {
  position: relative;
  width: 155px;
  height: 155px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.weather-img {
  max-width: 135px;
  max-height: 135px;
  object-fit: contain;
  opacity: 0;
  transform: scale(0.8) translateY(10px);
  animation: visualAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s forwards;
  filter: drop-shadow(0 0 24px rgba(255, 223, 0, 0.45));
}

.type-rainy .weather-img {
  filter: drop-shadow(0 0 18px rgba(100, 149, 200, 0.35));
}

.sunny-img {
  animation: visualAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s forwards, sunPulse 3s ease-in-out infinite 1s;
}

.rainy-img {
  animation: visualAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s forwards;
}

@keyframes visualAppear {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes sunPulse {
  0%, 100% {
    filter: drop-shadow(0 0 18px rgba(255, 223, 0, 0.35));
  }
  50% {
    filter: drop-shadow(0 0 32px rgba(255, 223, 0, 0.7));
  }
}

/* 温度显示 */
.temperature-display {
  text-align: center;
  opacity: 0;
  animation: tempFadeUp 0.6s ease-out 0.6s forwards;
  position: relative;
  z-index: 2;
}

.temp-number {
  font-size: 58px;
  font-weight: 200;
  color: rgba(75, 52, 68, 0.9);
  line-height: 1;
  letter-spacing: -3px;
  text-shadow: 0 2px 16px rgba(255, 255, 255, 0.7);
}

.temp-unit {
  font-size: 30px;
  font-weight: 200;
  color: rgba(75, 52, 68, 0.65);
  vertical-align: super;
  margin-left: 2px;
}

.weather-label {
  display: block;
  font-size: 19px;
  font-weight: 300;
  color: rgba(125, 95, 110, 0.7);
  margin-top: 6px;
  letter-spacing: 10px;
}

@keyframes tempFadeUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 背面预报 */
.forecast-title {
  font-size: 16px;
  font-weight: 400;
  color: rgba(90, 65, 80, 0.78);
  margin-bottom: 26px;
  letter-spacing: 5px;
}

.forecast-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.forecast-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 18px;
  background: rgba(255, 255, 255, 0.28);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.38);
  transition: all 0.3s ease;
}

.forecast-item:hover {
  background: rgba(255, 255, 255, 0.42);
  transform: translateX(4px);
}

.forecast-day {
  font-size: 14px;
  font-weight: 400;
  color: rgba(90, 65, 80, 0.72);
  letter-spacing: 1px;
}

.forecast-icon {
  font-size: 20px;
}

.forecast-temp {
  font-size: 17px;
  font-weight: 300;
  color: rgba(75, 52, 68, 0.82);
}

.flip-hint {
  margin-top: 26px;
  font-size: 12px;
  color: rgba(150, 120, 135, 0.45);
  letter-spacing: 2px;
}

/* 兔子装饰 */
.mw-mascot {
  position: absolute;
  bottom: 40px;
  right: 40px;
  z-index: 20;
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.7s ease-out, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  will-change: transform, opacity;
}

.mw-mascot.visible {
  opacity: 1;
  transform: translateX(0);
  animation: bunnyBreath 3s ease-in-out infinite 1.5s;
}

.mw-mascot:hover {
  animation-play-state: paused;
}

.mascot-svg {
  filter: drop-shadow(0 4px 14px rgba(255, 182, 193, 0.4));
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes bunnyBreath {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.07); }
}

.mascot-tooltip {
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  padding: 7px 15px;
  border-radius: 12px;
  font-size: 12px;
  color: #C07088;
  white-space: nowrap;
  box-shadow: 0 4px 18px rgba(255, 182, 193, 0.28);
  pointer-events: none;
}

.mascot-tooltip::after {
  content: '';
  position: absolute;
  bottom: -5px;
  right: 16px;
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.88);
  transform: rotate(45deg);
  border-radius: 2px;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

@media (prefers-reduced-motion: reduce) {
  .mw-sphere,
  .weather-img.sunny-img,
  .mw-orb-inner,
  .mw-mascot.visible,
  .mw-star,
  .orb-glow-ring,
  .live-dot {
    animation: none !important;
  }

  .mw-orb-inner {
    transition: transform 0.01s !important;
  }

  .weather-img {
    animation: none !important;
    opacity: 1 !important;
    transform: scale(1) translateY(0) !important;
  }

  .temperature-display {
    animation: none !important;
    opacity: 1 !important;
  }
}

@media (max-width: 480px) {
  .mw-orb-inner {
    width: 260px;
    min-height: 320px;
  }

  .orb-glow-ring {
    width: 320px;
    height: 320px;
    margin-left: -160px;
    margin-top: -160px;
  }

  .temp-number {
    font-size: 46px;
  }

  .weather-visual {
    width: 130px;
    height: 130px;
  }

  .weather-img {
    max-width: 110px;
    max-height: 110px;
  }

  .mascot-svg {
    width: 44px;
    height: 44px;
  }

  .city-name {
    font-size: 15px;
  }

  .mw-city-anchor {
    top: 24px;
    left: 20px;
    padding: 10px 16px;
  }

  .mw-mascot {
    bottom: 24px;
    right: 20px;
  }
}
</style>
