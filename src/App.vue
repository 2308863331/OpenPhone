<template>
  <div class="app-container">
    <nav v-if="viewMode === 'fullscreen'" class="app-nav">
      <h1 class="nav-title">数字花园</h1>
      <div style="flex:1"></div>
      <button class="mode-toggle-btn" @click="viewMode = 'phone'" title="切换到小手机">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
      </button>
    </nav>

    <main class="app-main" :class="{ 'phone-mode': viewMode === 'phone' }">
      <InsPhone v-if="viewMode === 'phone'" />

      <component
        v-else-if="viewMode === 'fullscreen' && currentComponent"
        :is="currentComponent" />
    </main>

    <button
      v-if="viewMode === 'phone'"
      class="phone-mode-toggle"
      @click="viewMode = 'fullscreen'"
      title="切换到全屏">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><polyline points="15,3 21,3 21,9"/><polyline points="9,21 3,21 3,15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import InsPhone from '@phone/InsPhone.vue'

const viewMode = ref('phone')
const currentPage = ref('home')

const pages = [
  { key: 'home', name: '首页' },
  { key: 'radio', name: '电台' },
  { key: 'diner', name: '深夜食堂' },
  { key: 'romantic', name: '锦书' },
  { key: 'photo', name: '相册' },
  { key: 'zenforest', name: '时光胶囊' },
  { key: 'firefly', name: '萤火' },
  { key: 'fate', name: '红线' },
  { key: 'dreamweaver', name: '织梦' },
  { key: 'bottle', name: '漂流瓶' },
  { key: 'mystery-old', name: '秘闻墙' },
  { key: 'mystery-new', name: '秘闻墙·新版' },
  { key: 'video', name: '视频播放器' },
  { key: 'greenhouse', name: '云端温室' },
  { key: 'greenhouse-copy', name: '温室·副本' },
  { key: 'jinshu-companion', name: '锦书伴侣' },
  { key: 'travel', name: '旅行日记' },
  { key: 'weather', name: '气象水晶' },
  { key: 'zenforest2', name: '禅意森林' },
  { key: 'zenforest-copy', name: '禅林·副本' },
  { key: 'bottle-copy', name: '漂流瓶·副本' },
  { key: 'treehouse', name: '秘密基地' },
  { key: 'time-transaction', name: '时光当铺' }
]

const components = {
  home: defineAsyncComponent(() => import('./HomePage.vue')),
  radio: defineAsyncComponent(() => import('../DuoRadio.vue')),
  diner: defineAsyncComponent(() => import('../MidnightDiner.vue')),
  romantic: defineAsyncComponent(() => import('../JinShuRomantic/JinShuRomantic.vue')),
  photo: defineAsyncComponent(() => import('../Photo.vue')),
  zenforest: defineAsyncComponent(() => import('../TimeCapsule.vue')),
  firefly: defineAsyncComponent(() => import('../FireflyDate.vue')),
  fate: defineAsyncComponent(() => import('../RedThreadFate.vue')),
  dreamweaver: defineAsyncComponent(() => import('../DreamWeaver.vue')),
  bottle: defineAsyncComponent(() => import('../no/drift-bottle-lover.vue')),
  'mystery-old': defineAsyncComponent(() => import('../no/MysteryWall.vue')),
  'mystery-new': defineAsyncComponent(() => import('../noval/MysteryWall.vue')),
  video: defineAsyncComponent(() => import('../CandyVideoPlayer.vue')),
  greenhouse: defineAsyncComponent(() => import('../CloudGreenhouse.vue')),
  'greenhouse-copy': defineAsyncComponent(() => import('../CloudGreenhouse copy.vue')),
  'jinshu-companion': defineAsyncComponent(() => import('../JinShuCompanion.vue')),
  travel: defineAsyncComponent(() => import('../Travel.vue')),
  weather: defineAsyncComponent(() => import('../WeatherCrystal.vue')),
  zenforest2: defineAsyncComponent(() => import('../ZenForest.vue')),
  'zenforest-copy': defineAsyncComponent(() => import('../ZenForest copy.vue')),
  'bottle-copy': defineAsyncComponent(() => import('../drift-bottle-lover copy.vue')),
  treehouse: defineAsyncComponent(() => import('./TreeHouse.vue')),
  'time-transaction': defineAsyncComponent(() => import('../TimeTransaction.vue'))
}

const currentComponent = computed(() => components[currentPage.value])
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fdfcf9 0%, #f8f5f0 50%, #faf5f2 100%);
  position: relative;
}

.app-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: rgba(255, 253, 250, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(200, 180, 160, 0.15);
  flex-wrap: wrap;
  gap: 8px;
}

.nav-title {
  font-size: 18px; font-weight: 600; color: #5a4a3a; letter-spacing: 1px;
  flex-shrink: 0;
}

.nav-mobile-toggle {
  display: none;
  width: 36px; height: 36px;
  border: none; border-radius: 8px;
  background: rgba(230, 190, 170, 0.2);
  cursor: pointer; align-items: center; justify-content: center;
  color: #6a5a4a; flex-shrink: 0;
}

.nav-links {
  display: flex; gap: 6px; flex-wrap: wrap; flex: 1; justify-content: center;
  margin: 0 20px;
}

.nav-btn {
  padding: 8px 18px; border: none; border-radius: 20px;
  background: transparent; color: #8a7a6a; font-size: 14px;
  cursor: pointer; border: 1px solid transparent;
  white-space: nowrap;
}
.nav-btn:hover { background: rgba(220, 180, 160, 0.12); color: #6a5a4a; }
.nav-btn.active {
  background: rgba(230, 190, 170, 0.25);
  color: #5a4a3a;
  border-color: rgba(210, 170, 150, 0.35);
}

.mode-toggle-btn {
  width: 36px; height: 36px; border-radius: 10px;
  border: 1px solid rgba(200, 180, 160, 0.25);
  background: rgba(255, 253, 250, 0.7);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: #8a7a6a; flex-shrink: 0;
}
.mode-toggle-btn:hover { background: rgba(230, 190, 170, 0.2); }

.app-main {
  padding-top: 64px;
  min-height: 100vh;
}
.app-main.phone-mode {
  padding-top: 0;
  min-height: 100vh;
  overflow: hidden;
}

.phone-mode-toggle {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  width: 44px; height: 44px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #333 0%, #111 100%);
  color: #fff;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(0,0,0,0.08);
}
.phone-mode-toggle:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 28px rgba(0,0,0,0.35), 0 0 50px rgba(0,0,0,0.1);
}
</style>
