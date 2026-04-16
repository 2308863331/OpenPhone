<!-- 数字花园首页 - 功能模块导航页，聚合所有子页面入口 -->
<template>
  <div class="home-container" :class="{ 'night-mode': isNightMode }">
    <!-- 背景层 -->
    <div class="bg-layer">
      <div class="bg-gradient"></div>
      <div class="bg-texture"></div>
    </div>

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">数字花园</h1>
      <p class="page-subtitle">欢迎来到我们的小世界</p>
    </div>

    <!-- 功能导航 -->
    <div class="feature-nav">
      <button 
        v-for="feature in features" 
        :key="feature.key" 
        class="feature-btn"
        :class="{ active: currentFeature === feature.key }"
        @click="switchFeature(feature.key)"
      >
        <span class="feature-icon">{{ feature.icon }}</span>
        <span class="feature-name">{{ feature.name }}</span>
      </button>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <div v-if="currentFeature === 'companion'" class="feature-section">
        <JinShuCompanion />
      </div>

      <div v-else-if="currentFeature === 'photo'" class="feature-section">
        <PhotoGallery />
      </div>

      <div v-else-if="currentFeature === 'weather'" class="feature-section">
        <WeatherCrystal />
      </div>

      <div v-else-if="currentFeature === 'video'" class="feature-section">
        <CandyVideoPlayer 
          video-src="https://common.cnblogs.com/images/cnblogs_com/blogs/812134/galleries/123456789.mp4"
          video-title="夏 日 的 风"
        />
      </div>

      <div v-else-if="currentFeature === 'particle'" class="feature-section">
        <MysteryWall />
      </div>

      <div v-else-if="currentFeature === 'radio'" class="feature-section">
        <DuoRadio />
      </div>

      <div v-else-if="currentFeature === 'diner'" class="feature-section">
        <MidnightDiner />
      </div>

      <div v-else-if="currentFeature === 'romantic'" class="feature-section">
        <JinShuRomantic />
      </div>

      <div v-else-if="currentFeature === 'firefly'" class="feature-section">
        <FireflyDate />
      </div>

      <div v-else-if="currentFeature === 'fate'" class="feature-section">
        <RedThreadFate />
      </div>

      <div v-else-if="currentFeature === 'dreamweaver'" class="feature-section">
        <DreamWeaver />
      </div>

      <div v-else-if="currentFeature === 'bottle'" class="feature-section">
        <DriftBottle />
      </div>

      <div v-else-if="currentFeature === 'mystery-new'" class="feature-section">
        <MysteryWallNew />
      </div>

      <div v-else-if="currentFeature === 'timecapsule'" class="feature-section">
        <TimeCapsule />
      </div>

      <div v-else-if="currentFeature === 'timetransaction'" class="feature-section">
        <TimeTransaction />
      </div>

      <div v-else-if="currentFeature === 'travel'" class="feature-section">
        <TravelDiary />
      </div>

      <div v-else-if="currentFeature === 'treehouse'" class="feature-section">
        <TreeHouse />
      </div>
    </div>

    <!-- 页脚 -->
    <div class="page-footer">
      <p>数字花园 · 记录我们的美好时光</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import JinShuCompanion from '../JinShuCompanion.vue'
import PhotoGallery from '../Photo.vue'
import WeatherCrystal from '../WeatherCrystal.vue'
import CandyVideoPlayer from '../CandyVideoPlayer.vue'
import MysteryWall from '../no/MysteryWall.vue'
import DuoRadio from '../DuoRadio.vue'
import MidnightDiner from '../MidnightDiner.vue'
import JinShuRomantic from '../JinShuRomantic/JinShuRomantic.vue'
import FireflyDate from '../FireflyDate.vue'
import RedThreadFate from '../RedThreadFate.vue'
import DreamWeaver from '../DreamWeaver.vue'
import DriftBottle from '../no/drift-bottle-lover.vue'
import MysteryWallNew from '../noval/MysteryWall.vue'
import TimeCapsule from '../TimeCapsule.vue'
import TimeTransaction from '../TimeTransaction.vue'
import TravelDiary from '../Travel.vue'
import TreeHouse from './TreeHouse.vue'

const currentFeature = ref('companion')
const isNightMode = ref(false)

const features = [
  { key: 'companion', name: '锦书伴侣', icon: '📖' },
  { key: 'photo', name: '相册画廊', icon: '📷' },
  { key: 'weather', name: '气象水晶', icon: '🔮' },
  { key: 'video', name: '视频播放', icon: '▶️' },
  { key: 'particle', name: '粒子互动', icon: '✨' },
  { key: 'radio', name: '电台', icon: '📻' },
  { key: 'diner', name: '深夜食堂', icon: '🍜' },
  { key: 'romantic', name: '锦书', icon: '💌' },
  { key: 'firefly', name: '萤火之约', icon: '🌙' },
  { key: 'fate', name: '红线姻缘', icon: '🔴' },
  { key: 'dreamweaver', name: '织梦者', icon: '🕸️' },
  { key: 'bottle', name: '漂流瓶', icon: '🧊' },
  { key: 'mystery-new', name: '秘闻墙', icon: '🧱' },
  { key: 'timecapsule', name: '时间胶囊', icon: '💊' },
  { key: 'timetransaction', name: '时光当铺', icon: '⏳' },
  { key: 'travel', name: '旅行日记', icon: '✈️' },
  { key: 'treehouse', name: '秘密基地', icon: '🏠' }
]

function switchFeature(featureKey) {
  currentFeature.value = featureKey
}

function checkNightMode() {
  const hour = new Date().getHours()
  isNightMode.value = hour >= 22 || hour <= 6
}

onMounted(() => {
  checkNightMode()
  setInterval(checkNightMode, 60000)
})
</script>

<style scoped>
.home-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #fdfcf9 0%, #f8f5f0 50%, #faf5f2 100%);
  overflow-x: hidden;
}

.home-container.night-mode {
  background: linear-gradient(135deg, #1a1816 0%, #2a2520 50%, #1f1b17 100%);
}

.bg-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 30%, rgba(255, 200, 220, 0.08) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(180, 210, 235, 0.06) 0%, transparent 40%);
}

.bg-texture {
  position: absolute;
  inset: 0;
  background-image: 
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.005) 2px, rgba(0,0,0,0.005) 4px),
    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.003) 2px, rgba(0,0,0,0.003) 4px);
  opacity: 0.6;
}

.page-header {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 60px 20px 30px;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: #5a4a3a;
  letter-spacing: 8px;
  margin-bottom: 12px;
  text-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.page-subtitle {
  font-size: 1rem;
  color: #8a7a6a;
  letter-spacing: 2px;
  opacity: 0.8;
}

.feature-nav {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 16px 20px;
  flex-wrap: wrap;
}

.feature-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  color: #6a5a4a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: 1px solid rgba(200, 180, 160, 0.2);
}

.feature-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  background: rgba(255, 255, 255, 0.9);
}

.feature-btn.active {
  background: linear-gradient(135deg, #ffd4b8 0%, #ffccaa 100%);
  color: #5a4a3a;
  box-shadow: 0 6px 20px rgba(255, 179, 102, 0.3);
  border-color: rgba(255, 179, 102, 0.4);
}

.feature-icon {
  font-size: 16px;
}

.feature-name {
  letter-spacing: 1px;
}

.main-content {
  position: relative;
  z-index: 10;
  min-height: 600px;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.feature-section {
  width: 100%;
  max-width: 1000px;
  animation: sectionFadeIn 0.5s ease-out;
}

@keyframes sectionFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-footer {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 30px;
  color: #8a7a6a;
  font-size: 14px;
  letter-spacing: 1px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
    letter-spacing: 4px;
  }

  .feature-nav {
    gap: 6px;
    padding: 12px;
  }

  .feature-btn {
    padding: 8px 14px;
    font-size: 12px;
  }

  .main-content {
    padding: 16px;
  }
}
</style>
