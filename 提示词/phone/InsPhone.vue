<template>
  <PhoneFrame>
    <StatusBar />

    <DesktopPage
      v-if="activePage === 'desktop'"
      :apps="desktopApps"
      :dock-apps="dockApps"
      @app-tap="handleAppTap"
      @dock-tap="handleDockTap" />

    <ChatListPage
      v-else-if="activePage === 'chatlist'"
      :conversations="conversations"
      @back="goBack"
      @open-chat="openChat" />

    <ChatDetailPage
      v-else-if="activePage === 'chatdetail'"
      :conversation="currentConversation"
      @back="goBack" />

    <MomentsPage
      v-else-if="activePage === 'moments'"
      :feed="momentsFeed"
      @back="goBack"
      @toggle-like="togglePostLike" />

    <div v-else-if="isExternalPage(activePage)" class="external-page-wrapper">
      <div class="external-page-header">
        <button class="ext-back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <span class="ext-title">{{ currentPageTitle }}</span>
        <div style="width:28px"></div>
      </div>
      <div class="external-page-body">
        <div class="ext-content-scale-wrap">
          <component :is="externalComponent" />
        </div>
      </div>
    </div>
  </PhoneFrame>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, shallowRef } from 'vue'
import PhoneFrame from './components/PhoneFrame.vue'
import StatusBar from './components/StatusBar.vue'
import DesktopPage from './components/DesktopPage.vue'
import ChatListPage from './components/ChatListPage.vue'
import ChatDetailPage from './components/ChatDetailPage.vue'
import MomentsPage from './components/MomentsPage.vue'
import { useNavigation } from './composables/useNavigation.js'
import {
  desktopApps,
  dockApps,
  conversations,
  momentsFeed
} from './composables/appData.js'

const externalPages = {
  radio: () => import('../../DuoRadio.vue'),
  diner: () => import('../../MidnightDiner.vue'),
  romantic: () => import('../../JinShuRomantic/JinShuRomantic.vue'),
  photo: () => import('../../Photo.vue'),
  firefly: () => import('../../FireflyDate.vue'),
  fate: () => import('../../RedThreadFate.vue'),
  dreamweaver: () => import('../../DreamWeaver.vue'),
  bottle: () => import('../../no/drift-bottle-lover.vue'),
  'mystery-new': () => import('../../noval/MysteryWall.vue'),
  'mystery-old': () => import('../../no/MysteryWall.vue'),
  timecapsule: () => import('../../TimeCapsule.vue'),
  timetransaction: () => import('../../TimeTransaction.vue'),
  travel: () => import('../../Travel.vue'),
  treehouse: () => import('../../src/TreeHouse.vue'),
  videoplayer: () => import('../../CandyVideoPlayer.vue'),
  companion: () => import('../../JinShuCompanion.vue'),
  weathercrystal: () => import('../../WeatherCrystal.vue')
}

const pageTitles = {
  radio: '电台',
  diner: '深夜食堂',
  romantic: '锦书',
  photo: '相册',
  firefly: '萤火',
  fate: '红线',
  dreamweaver: '织梦',
  bottle: '漂流瓶',
  'mystery-new': '秘闻墙',
  'mystery-old': '粒子墙',
  timecapsule: '时间胶囊',
  timetransaction: '时光当铺',
  travel: '旅行日记',
  treehouse: '秘密基地',
  videoplayer: '视频播放',
  companion: '锦书伴侣',
  weathercrystal: '气象水晶'
}

const internalPages = ['desktop', 'chatlist', 'chatdetail', 'moments']

const {
  activePage,
  navigateTo,
  goBack
} = useNavigation()

const currentConversation = ref(null)
const externalComponent = shallowRef(null)

const isExternalPage = (page) => !internalPages.includes(page)

const currentPageTitle = computed(() => pageTitles[activePage.value] || '')

const handleAppTap = (item) => {
  if (!item.page) return
  if (item.navType === 'internal') {
    navigateTo(item.page)
  } else if (item.navType === 'external' && externalPages[item.page]) {
    externalComponent.value = defineAsyncComponent(externalPages[item.page])
    navigateTo(item.page)
  }
}

const handleDockTap = (item) => {
  if (!item.page) return
  if (item.navType === 'internal') {
    navigateTo(item.page)
  } else if (item.navType === 'external' && externalPages[item.page]) {
    externalComponent.value = defineAsyncComponent(externalPages[item.page])
    navigateTo(item.page)
  }
}

const openChat = (conv) => {
  currentConversation.value = conv
  navigateTo('chatdetail')
}

const togglePostLike = (postId) => {
  const post = momentsFeed.find(p => p.id === postId)
  if (post) {
    post.isLiked = !post.isLiked
    post.likes += post.isLiked ? 1 : -1
  }
}
</script>

<style scoped>
.external-page-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  overflow: hidden;
}

.external-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(20px);
  border-bottom: 0.5px solid rgba(0,0,0,0.05);
  flex-shrink: 0;
  z-index: 20;
}

.ext-back-btn {
  background: none; border: none; cursor: pointer;
  padding: 4px; display: flex; align-items: center;
  color: #333;
}

.ext-title {
  font-size: 16px; font-weight: 700; color: #111;
  letter-spacing: -0.3px;
}

.external-page-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.ext-content-scale-wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 393px;
  min-height: 852px;
  transform-origin: top left;
  transform: scale(var(--ext-scale, 0.91));
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.ext-content-scale-wrap > :deep(:first-child) {
  width: 100% !important;
  height: auto !important;
  min-height: 852px !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  overflow: hidden;
}
</style>
