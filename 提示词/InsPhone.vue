<template>
  <div class="phone-universe">
    <div class="ambient-glow"></div>
    <div class="phone-device" :class="{ 'awakened': isAwakened }">
      <div class="device-shell">
        <div class="dynamic-island">
          <div class="island-camera"></div>
        </div>
        
        <div class="display-canvas">
          <!-- 状态栏 -->
          <div class="status-bar-premium">
            <span class="time-display">{{ currentTime }}</span>
            <div class="status-cluster">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M1.5 19.5h3v3h-3zM6.5 15.5h3v7h-3zM11.5 10.5h3v12h-3zM16.5 4.5h3v18h-3z"/></svg>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 20.5l-2.2-2.2h4.4L12 20.5zm4.8-4.8L12 11l-4.8 4.8h9.6zm4.8-4.8L12 3 2.4 12h19.2z"/></svg>
              <div class="battery-cell">
                <div class="battery-level"></div>
                <div class="battery-cap"></div>
              </div>
            </div>
          </div>

          <!-- 页面内容区 -->
          <transition :name="pageTransitionName" mode="out-in">
            
            <!-- 桌面主页 -->
            <div v-if="activePage === 'desktop'" key="desktop" class="page-desktop">
              <div class="wallpaper-layer">
                <div class="wallpaper-floral"></div>
                <div class="wallpaper-overlay"></div>
              </div>

              <!-- 桌面图标网格 -->
              <div class="icon-grid-system">
                <template v-for="(item, index) in desktopItems" :key="item.uid">
                  <!-- 标准图标 1x1 -->
                  <div v-if="item.size === 'standard'"
                       class="grid-item standard-item"
                       :class="{ 'dragging-active': draggingUid === item.uid }"
                       :style="getGridStyle(item, index)"
                       @mousedown.prevent="initiateDrag($event, item)"
                       @touchstart.prevent="initiateDrag($event, item)"
                       @click="handleIconTap($event, item)">
                    <div class="icon-visual" :style="{ background: item.gradient }">
                      <component :is="item.iconComponent" />
                    </div>
                    <span class="icon-label">{{ item.label }}</span>
                    <div v-if="item.badge" class="notification-badge">{{ item.badge }}</div>
                  </div>

                  <!-- 大图标/小组件 2x2 -->
                  <div v-if="item.size === 'large'"
                       class="grid-item large-item"
                       :class="{ 'dragging-active': draggingUid === item.uid }"
                       :style="getLargeGridStyle(item, index)"
                       @mousedown.prevent="initiateDrag($event, item)"
                       @touchstart.prevent="initiateDrag($event, item)"
                       @click="handleIconTap($event, item)">
                    <div class="widget-container" :style="{ background: item.gradient }">
                      <component :is="item.iconComponent" />
                      <span class="widget-text">{{ item.widgetText || '' }}</span>
                    </div>
                    <span class="icon-label-large">{{ item.label }}</span>
                  </div>
                </template>
              </div>

              <!-- 页面指示器 -->
              <div class="page-indicators">
                <span class="indicator-dot active"></span>
                <span class="indicator-dot"></span>
                <span class="indicator-dot"></span>
                <span class="indicator-dot"></span>
                <span class="indicator-dot"></span>
              </div>

              <!-- Dock栏 -->
              <div class="dock-premium">
                <div class="dock-glass">
                  <div 
                    v-for="dockItem in dockItems" 
                    :key="dockItem.uid"
                    class="dock-icon-unit"
                    @click="handleIconTap($event, dockItem)">
                    <div class="dock-icon-visual" :style="{ background: dockItem.gradient }">
                      <component :is="dockItem.iconComponent" />
                    </div>
                  </div>
                </div>
                <div class="home-bar"></div>
              </div>
            </div>

            <!-- 聊天列表页 -->
            <div v-else-if="activePage === 'chatlist'" key="chatlist" class="page-chatlist">
              <div class="chatlist-header">
                <button class="nav-back-btn" @click="navigateTo('desktop')">
                  <svg viewBox="0 0 24 24" width="22" height="22"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <h1 class="header-title">Messages</h1>
                <button class="nav-compose-btn">
                  <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
              </div>

              <div class="chatlist-tabs">
                <button class="tab-btn active">Chats</button>
                <button class="tab-btn">Stories</button>
              </div>

              <div class="conversation-list">
                <div 
                  v-for="(conv, idx) in conversations" 
                  :key="conv.id"
                  class="conversation-card"
                  :class="{ unread: conv.unread }"
                  @click="openConversation(conv)">
                  <div class="avatar-circle" :style="{ background: conv.avatarGradient }">
                    {{ conv.initial }}
                  </div>
                  <div class="conv-content">
                    <div class="conv-top">
                      <span class="conv-name">{{ conv.name }}</span>
                      <span class="conv-time">{{ conv.time }}</span>
                    </div>
                    <div class="conv-bottom">
                      <p class="conv-preview">{{ conv.lastMessage }}</p>
                      <span v-if="conv.unreadCount" class="unread-badge">{{ conv.unreadCount }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 聊天详情页 -->
            <div v-else-if="activePage === 'chatdetail'" key="chatdetail" class="page-chatdetail">
              <div class="anime-bg-layer"></div>
              
              <div class="chatdetail-header-glass">
                <button class="nav-back-btn" @click="navigateTo('chatlist')">
                  <svg viewBox="0 0 24 24" width="22" height="22"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <div class="chat-user-profile">
                  <div class="mini-avatar" :style="{ background: currentConversation?.avatarGradient }">{{ currentConversation?.initial }}</div>
                  <div class="user-status-group">
                    <span class="user-name-lg">{{ currentConversation?.name }}</span>
                    <span class="status-indicator online">online</span>
                  </div>
                </div>
                <button class="nav-more-btn">
                  <svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
                </button>
              </div>

              <div class="messages-scroll-area" ref="messagesContainer">
                <div 
                  v-for="(msg, msgIdx) in activeMessages" 
                  :key="msgIdx"
                  class="message-bubble-wrapper"
                  :class="{ 'from-me': msg.isMe }">
                  <div v-if="!msg.isMe" class="bubble-avatar-small">{{ currentConversation?.initial }}</div>
                  <div class="message-bubble" :class="{ 'my-bubble': msg.isMe, 'their-bubble': !msg.isMe }">
                    {{ msg.text }}
                  </div>
                </div>
              </div>

              <div class="input-bar-area">
                <button class="attach-action">
                  <svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                </button>
                <input 
                  type="text" 
                  class="message-input-field"
                  placeholder="Say something..."
                  v-model="draftMessage"
                  @keyup.enter="dispatchMessage" />
                <button class="send-action" :disabled="!draftMessage.trim()" @click="dispatchMessage">
                  Send
                </button>
              </div>
            </div>

            <!-- 朋友圈页 -->
            <div v-else-if="activePage === 'moments'" key="moments" class="page-moments">
              <div class="moments-hero-section">
                <div class="cover-banner">
                  <div class="cover-gradient-art"></div>
                </div>
                <div class="profile-info-overlay">
                  <div class="profile-avatar-ring">
                    <div class="profile-avatar-img">
                      <svg viewBox="0 0 100 100"><defs><linearGradient id="profGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f093fb"/><stop offset="100%" style="stop-color:#f5576c"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="url(#profGrad)"/><text x="50" y="60" text-anchor="middle" font-size="34" fill="#fff" font-weight="700">M</text></svg>
                    </div>
                  </div>
                  <div class="profile-name-row">
                    <span class="profile-name-text">My Diary</span>
                    <span class="profile-sparkle">*</span>
                  </div>
                </div>
              </div>

              <div class="moments-navigation-bar">
                <button class="nav-back-btn" @click="navigateTo('chatlist')">
                  <svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <span class="moments-nav-title">Moments</span>
                <button class="camera-capture-btn">
                  <svg viewBox="0 0 24 24" width="20" height="20"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="13" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
                </button>
              </div>

              <div class="moments-feed-stream">
                <article v-for="(post, postIdx) in momentsFeed" :key="postIdx" class="moment-post-card">
                  <header class="post-header-bar">
                    <div class="post-author-avatar" :style="{ background: post.authorGradient }">{{ post.initial }}</div>
                    <div class="post-meta-data">
                      <strong class="author-name">{{ post.author }}</strong>
                      <time class="post-timestamp">{{ post.timestamp }}</time>
                    </div>
                  </header>
                  
                  <p class="post-body-text">{{ post.content }}</p>

                  <div v-if="post.images && post.images.length" class="post-image-gallery">
                    <div 
                      v-for="(imgGrad, imgIdx) in post.images" 
                      :key="imgIdx"
                      class="gallery-thumb"
                      :style="{ background: imgGrad }">
                    </div>
                  </div>

                  <footer class="post-interaction-bar">
                    <button class="interaction-btn" :class="{ liked: post.isLiked }" @click="togglePostLike(post)">
                      <svg viewBox="0 0 24 24" width="17" height="17"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/></svg>
                      <span>{{ formatNumber(post.likes) }}</span>
                    </button>
                    <button class="interaction-btn">
                      <svg viewBox="0 0 24 24" width="17" height="17"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
                      <span>{{ formatNumber(post.comments) }}</span>
                    </button>
                    <button class="interaction-btn">
                      <svg viewBox="0 0 24 24" width="17" height="17"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
                      <span>{{ formatNumber(post.saves || 2159) }}</span>
                    </button>
                  </footer>
                </article>
              </div>
            </div>

          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, defineComponent, h, computed } from 'vue'

const isAwakened = ref(false)
const activePage = ref('desktop')
const previousPage = ref('desktop')
const pageTransitionName = ref('slide-in-right')
const currentTime = ref('')
const draftMessage = ref('')
const messagesContainer = ref(null)
const draggingUid = ref(null)

const clockTick = () => {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  currentTime.value = `${hh}:${mm}`
}

const IconMsg = defineComponent({
  render() { return h('svg', { viewBox: '0 0 24 24', width: '28', height: '28' }, [ h('path', { d: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z', fill: '#fff' }) ]) }
})
const IconCalendar = defineComponent({
  render() { return h('svg', { viewBox: '0 0 24 24', width: '28', height: '28' }, [ h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '3', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }), h('line', { x1: '3', y1: '10', x2: '21', y2: '10', stroke: '#fff', strokeWidth: '1.8' }), h('line', { x1: '8', y1: '2', x2: '8', y2: '6', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round' }), h('line', { x1: '16', y1: '2', x2: '16', y2: '6', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round' }) ]) }
})
const IconCameraRoll = defineComponent({
  render() { return h('svg', { viewBox: '0 0 24 24', width: '28', height: '28' }, [ h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '3', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }), h('circle', { cx: '8.5', cy: '8.5', r: '1.5', fill: '#fff' }), h('polyline', { points: '21,15 16,10 5,21', fill: 'none', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }) ]) }
})
const IconInstagram = defineComponent({
  render() { return h('svg', { viewBox: '0 0 24 24', width: '28', height: '28' }, [ h('rect', { x: '2', y: '2', width: '20', height: '20', rx: '5', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }), h('circle', { cx: '12', cy: '12', r: '4', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }), h('circle', { cx: '17.5', cy: '6.5', r: '1', fill: '#fff' }) ]) }
})
const IconWeather = defineComponent({
  render() { return h('svg', { viewBox: '0 0 24 24', width: '28', height: '28' }, [ h('circle', { cx: '12', cy: '12', r: '5', fill: '#fff' }), h('g', { stroke: '#fff', strokeWidth: '2', strokeLinecap: 'round' }, [ h('line', { x1: '12', y1: '1', x2: '12', y2: '3' }), h('line', { x1: '12', y1: '21', x2: '12', y2: '23' }), h('line', { x1: '4.22', y1: '4.22', x2: '5.64', y2: '5.64' }), h('line', { x1: '18.36', y1: '18.36', x2: '19.78', y2: '19.78' }), h('line', { x1: '1', y1: '12', x2: '3', y2: '12' }), h('line', { x1: '21', y1: '12', x2: '23', y2: '12' }) ]) ])}
})
const IconMusic = defineComponent({
  render() { return h('svg', { viewBox: '0 0 24 24', width: '28', height: '28' }, [ h('path', { d: 'M9 18V5l12-2v13', fill: 'none', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }), h('circle', { cx: '6', cy: '18', r: '3', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }), h('circle', { cx: '18', cy: '16', r: '3', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }) ]) }
})
const IconNotes = defineComponent({
  render() { return h('svg', { viewBox: '0 0 24 24', width: '28', height: '28' }, [ h('path', { d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }), h('polyline', { points: '14,2 14,8 20,8', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }), h('line', { x1: '16', y1: '13', x2: '8', y2: '13', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round' }), h('line', { x1: '16', y1: '17', x2: '8', y2: '17', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round' }) ]) }
})
const IconSettings = defineComponent({
  render() { return h('svg', { viewBox: '0 0 24 24', width: '28', height: '28' }, [ h('circle', { cx: '12', cy: '12', r: '3', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }), h('path', { d: 'M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round' }) ]) }
})
const IconWidgetClock = defineComponent({
  render() { return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#fff' } }, [ h('span', { style: { fontSize: '38px', fontWeight: '700', letterSpacing: '-1px' } }, '30'), h('span', { style: { fontSize: '14px', fontWeight: '500', opacity: '0.85' } }, '行事历') ])}
})

const desktopItems = reactive([
  { uid: 'd1', label: 'Messages', iconComponent: IconMsg, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', size: 'standard', badge: 3, gridPos: 0 },
  { uid: 'd2', label: '行事曆', iconComponent: IconWidgetClock, gradient: 'linear-gradient(135deg, #a8e6cf 0%, #88d8b0 50%, #7fcdbb 100%)', size: 'large', widgetText: '', gridPos: 1 },
  { uid: 'd3', label: 'Top Widgets', iconComponent: IconCameraRoll, gradient: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,245,0.9) 100%)', size: 'large', gridPos: 3 },
  { uid: 'd4', label: 'QQ邮箱', iconComponent: IconMsg, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', size: 'standard', badge: null, gridPos: 5 },
  { uid: 'd5', label: 'Instagram', iconComponent: IconInstagram, gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', size: 'standard', badge: null, gridPos: 6 },
])

const dockItems = [
  { uid: 'dock1', label: 'Phone', iconComponent: defineComponent({ render() { return h('svg', { viewBox: '0 0 24 24', width: '26', height: '26' }, [ h('path', { d: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z', fill: '#fff' })]) }}), gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { uid: 'dock2', label: 'Photo', iconComponent: defineComponent({ render() { return h('svg', { viewBox: '0 0 24 24', width: '26', height: '26' }, [ h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '3', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }), h('circle', { cx: '8.5', cy: '8.5', r: '1.5', fill: '#fff' }), h('polyline', { points: '21,15 16,10 5,21', fill: 'none', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' })]) }}), gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { uid: 'dock3', label: 'Globe', iconComponent: defineComponent({ render() { return h('svg', { viewBox: '0 0 24 24', width: '26', height: '26' }, [ h('circle', { cx: '12', cy: '12', r: '10', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }), h('ellipse', { cx: '12', cy: '12', rx: '4', ry: '10', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }), h('line', { x1: '2', y1: '12', x2: '22', y2: '12', stroke: '#fff', strokeWidth: '1.8' })]) }}), gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { uid: 'dock4', label: 'Messages', iconComponent: IconMsg, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
]

const conversations = reactive([
  { id: 'c1', name: '高冷男', initial: '高', avatarGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', time: 'now', lastMessage: '你话有点多了', unreadCount: null, unread: false },
  { id: 'c2', name: 'juhh', initial: 'W', avatarGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', time: '2h ago', lastMessage: '今日份的小确幸', unreadCount: 2, unread: true },
  { id: 'c3', name: 90989wwwow', initial: 'T', avatarGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', time: '5h ago', lastMessage: '[图片]', unreadCount: null, unread: false },
])

const currentConversation = ref(null)
const activeMessages = ref([])

const momentsFeed = reactive([
  {
    author: 'df!!!tfr',
    initial: 'W',
    authorGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    timestamp: '2h ago',
    content: '小天',
    images: ['linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'],
    likes: 7734,
    comments: 1611,
    saves: 2159,
    isLiked: false
  },
  {
    author: '高冷男',
    initial: 'G',
    authorGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    timestamp: '5h ago',
    content: '',
    images: [],
    likes: 2453,
    comments: 892,
    saves: 1024,
    isLiked: true
  }
])

let dragContext = {
  active: false,
  target: null,
  startX: 0,
  startY: 0,
  origX: 0,
  origY: 0,
  timer: null
}

const getGridStyle = (item, index) => ({
  transitionDelay: `${index * 60}ms`,
  transform: `translate(${item.dragOffsetX || 0}px, ${item.dragOffsetY || 0}px)`
})

const getLargeGridStyle = (item, index) => ({
  transitionDelay: `${index * 60 + 80}ms`,
  transform: `translate(${item.dragOffsetX || 0}px, ${item.dragOffsetY || 0}px)`
})

const initiateDrag = (event, item) => {
  const clientX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX
  const clientY = event.type === 'touchstart' ? event.touches[0].clientY : event.clientY

  dragContext.timer = setTimeout(() => {
    dragContext.active = true
    draggingUid.value = item.uid
    dragContext.startX = clientX
    dragContext.startY = clientY
    dragContext.origX = item.dragOffsetX || 0
    dragContext.origY = item.dragOffsetY || 0
    dragContext.target = item
  }, 280)

  const onMove = (moveEvent) => {
    if (!dragContext.active) return
    const mx = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientX : moveEvent.clientX
    const my = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientY : moveEvent.clientY
    const dx = mx - dragContext.startX
    const dy = my - dragContext.startY
    if (dragContext.target) {
      dragContext.target.dragOffsetX = dragContext.origX + dx
      dragContext.target.dragOffsetY = dragContext.origY + dy
    }
  }

  const onEnd = () => {
    clearTimeout(dragContext.timer)
    if (dragContext.active) {
      setTimeout(() => {
        draggingUid.value = null
        dragContext.active = false
        dragContext.target = null
      }, 120)
    }
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onEnd)
    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('touchend', onEnd)
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onEnd)
  document.addEventListener('touchmove', onMove, { passive: false })
  document.addEventListener('touchend', onEnd)
}

const handleIconTap = (event, item) => {
  if (dragContext.active || draggingUid.value === item.uid) return
  
  if (item.label === 'Messages' || item.label === 'QQ邮箱' || (item.uid && item.uid.startsWith('dock4'))) {
    navigateTo('chatlist')
  } else if (item.label === 'Photo' || item.label === 'Camera' || item.label === 'Instagram') {
    navigateTo('moments')
  }
}

const navigateTo = (targetPage) => {
  previousPage.value = activePage.value
  
  const pageOrder = ['desktop', 'chatlist', 'chatdetail', 'moments']
  const fromIdx = pageOrder.indexOf(activePage.value)
  const toIdx = pageOrder.indexOf(targetPage)
  
  pageTransitionName.value = toIdx > fromIdx ? 'slide-in-right' : 'slide-in-left'
  activePage.value = targetPage
  
  if (targetPage === 'chatlist') {
    // reset chat detail state
  }
}

const openConversation = (conv) => {
  currentConversation.value = conv
  previousPage.value = activePage.value
  pageTransitionName.value = 'slide-in-right'
  activePage.value = 'chatdetail'
  
  if (conv.id === 'c1') {
    activeMessages.value = [
      { text: '然后呢。', isMe: false },
      { text: '过来', isMe: true },
      { text: '找我，听不懂？', isMe: true },
      { text: '以什么身份。', isMe: false },
      { text: '情人', isMe: true },
      { text: '呵。', isMe: false },
      { text: '你把他置于何地。', isMe: false },
      { text: '死地', isMe: true },
      { text: '你对感情，一直这么随意？', isMe: false },
      { text: '你话有点多了', isMe: true },
      { text: '怕我说中什么？', isMe: false }
    ]
  } else if (conv.id === 'c2') {
    activeMessages.value = [
      { text: '今天天气真好呀~', isMe: false },
      { text: '是啊，适合出门走走', isMe: true },
      { text: '要不要一起去喝咖啡？', isMe: false }
    ]
  } else {
    activeMessages.value = [
      { text: '[图片]', isMe: false },
      { text: '好看！', isMe: true }
    ]
  }
  
  nextTick(() => {
    const container = document.querySelector('.messages-scroll-area')
    if (container) {
      setTimeout(() => { container.scrollTop = container.scrollHeight }, 50)
    }
  })
}

const dispatchMessage = () => {
  if (!draftMessage.value.trim()) return
  activeMessages.value.push({ text: draftMessage.value.trim(), isMe: true })
  draftMessage.value = ''
  nextTick(() => {
    const container = document.querySelector('.messages-scroll-area')
    if (container) {
      setTimeout(() => { container.scrollTop = container.scrollHeight }, 30)
    }
  })
}

const togglePostLike = (post) => {
  post.isLiked = !post.isLiked
  post.likes += post.isLiked ? 1 : -1
}

const formatNumber = (num) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

onMounted(() => {
  setTimeout(() => { isAwakened.value = true }, 150)
  clockTick()
  setInterval(clockTick, 30000)
})
</script>

<style scoped>
/* ===== 宇宙容器 ===== */
.phone-universe {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #f8f6f3 0%, #efeae4 40%, #e8e2da 100%);
  padding: 48px;
  position: relative;
  overflow: hidden;
}

.ambient-glow {
  position: absolute;
  top: -20%;
  left: -20%;
  right: -20%;
  bottom: -20%;
  background:
    radial-gradient(ellipse at 35% 30%, rgba(240,147,251,0.06) 0%, transparent 55%),
    radial-gradient(ellipse at 65% 70%, rgba(79,172,254,0.05) 0%, transparent 55%),
    radial-gradient(ellipse at 50% 95%, rgba(67,233,123,0.04) 0%, transparent 50%);
  pointer-events: none;
  animation: ambientBreath 12s ease-in-out infinite alternate;
}

@keyframes ambientBreath {
  0% { opacity: 0.6; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.05); }
}

/* ===== 手机设备本体 ===== */
.phone-device {
  width: 380px;
  height: 800px;
  background: #000000;
  border-radius: 58px;
  padding: 10px;
  box-shadow:
    0 0 0 0.5px rgba(255,255,255,0.06),
    0 0 0 1px rgba(0,0,0,0.4),
    0 30px 60px -15px rgba(0,0,0,0.45),
    0 18px 36px -8px rgba(0,0,0,0.32),
    0 0 100px -30px rgba(102,126,234,0.18),
    inset 0 1px 0 rgba(255,255,255,0.05);
  opacity: 0;
  transform: scale(0.94) translateY(30px);
  transition: all 1s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  z-index: 1;
}

.phone-device.awakened {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.device-shell {
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 50px;
  overflow: hidden;
  position: relative;
}

/* ===== 动态岛 ===== */
.dynamic-island {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 126px;
  height: 36px;
  background: #000;
  border-radius: 22px;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.island-camera {
  width: 14px;
  height: 14px;
  background: radial-gradient(circle at 35% 35%, #4a4a4a, #1a1a1a 70%);
  border-radius: 50%;
  box-shadow:
    inset 0 0 2px rgba(255,255,255,0.12),
    0 0 6px rgba(0,0,0,0.4);
}

/* ===== 显示画布 ===== */
.display-canvas {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 46px;
  overflow: hidden;
  position: relative;
}

/* ===== 高级状态栏 ===== */
.status-bar-premium {
  height: 54px;
  padding: 14px 28px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: #000;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.3px;
  position: relative;
  z-index: 190;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.time-display {
  margin-top: 1px;
}

.status-cluster {
  display: flex;
  align-items: center;
  gap: 7px;
  opacity: 0.92;
}

.battery-cell {
  position: relative;
  width: 25px;
  height: 12px;
  border: 1.5px solid currentColor;
  border-radius: 3px;
  padding: 1px;
}

.battery-level {
  width: 82%;
  height: 100%;
  background: currentColor;
  border-radius: 1px;
}

.battery-cap {
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 6px;
  background: currentColor;
  border-radius: 0 1px 1px 0;
}

/* ===== 桌面页 ===== */
.page-desktop {
  width: 100%;
  height: calc(100% - 54px);
  position: relative;
  overflow: hidden;
}

.wallpaper-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.wallpaper-floral {
  width: 100%;
  height: 100%;
  background:
    radial-gradient(ellipse at 25% 20%, rgba(255,245,230,0.9) 0%, transparent 50%),
    radial-gradient(ellipse at 75% 65%, rgba(220,235,210,0.7) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 85%, rgba(200,225,200,0.5) 0%, transparent 45%),
    linear-gradient(175deg, #fdfcf8 0%, #f5f2eb 35%, #ebe6dc 70%, #e5dfd2 100%);
  position: relative;
}

.wallpaper-floral::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 30% 35%, rgba(255,182,193,0.12) 0%, transparent 25%),
    radial-gradient(circle at 70% 25%, rgba(173,216,230,0.08) 0%, transparent 30%),
    radial-gradient(circle at 45% 70%, rgba(255,218,185,0.1) 0%, transparent 28%),
    radial-gradient(circle at 80% 80%, rgba(221,160,221,0.07) 0%, transparent 25%);
}

.wallpaper-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.03) 100%);
}

/* ===== 图标网格系统 ===== */
.icon-grid-system {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px 14px;
  padding: 24px 18px 130px;
  max-height: calc(100% - 140px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.icon-grid-system::-webkit-scrollbar { display: none; }

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: grab;
  opacity: 0;
  transform: translateY(12px) scale(0.96);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.awakened .grid-item {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.grid-item:active { cursor: grabbing; }

.grid-item.dragging-active {
  z-index: 999 !important;
  transition: none !important;
}

/* 标准图标 */
.standard-item {
  position: relative;
}

.icon-visual {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 14px rgba(0,0,0,0.12),
    0 1px 3px rgba(0,0,0,0.08);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.standard-item:hover .icon-visual {
  transform: scale(1.09) translateY(-3px);
  box-shadow: 
    0 10px 28px rgba(0,0,0,0.18),
    0 4px 10px rgba(0,0,0,0.1);
}

.standard-item.dragging-active .icon-visual {
  transform: scale(1.18);
  box-shadow: 0 16px 40px rgba(0,0,0,0.28);
}

.icon-label {
  font-size: 11px;
  color: #222;
  font-weight: 600;
  letter-spacing: -0.15px;
  margin-top: 5px;
  text-align: center;
  max-width: 68px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(255,255,255,0.7);
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ff3b30 0%, #ff6b6b 100%);
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  box-shadow: 0 2px 8px rgba(255,59,48,0.4);
  border: 2px solid #fff;
  z-index: 5;
}

/* 大图标/小组件 */
.large-item {
  grid-column: span 2;
  grid-row: span 2;
  position: relative;
}

.widget-container {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 6px 20px rgba(0,0,0,0.1),
    0 2px 6px rgba(0,0,0,0.06);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  position: relative;
}

.large-item:hover .widget-container {
  transform: scale(1.03) translateY(-2px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.15);
}

.large-item.dragging-active .widget-container {
  transform: scale(1.06);
  box-shadow: 0 20px 48px rgba(0,0,0,0.25);
}

.widget-text {
  /* reserved for widget content styling */
}

.icon-label-large {
  font-size: 11px;
  color: #222;
  font-weight: 600;
  margin-top: 6px;
  text-align: center;
  text-shadow: 0 1px 2px rgba(255,255,255,0.7);
}

/* ===== 页面指示器 ===== */
.page-indicators {
  position: absolute;
  bottom: 108px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 7px;
  z-index: 5;
}

.indicator-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(0,0,0,0.18);
  transition: all 0.3s ease;
}

.indicator-dot.active {
  width: 18px;
  border-radius: 4px;
  background: rgba(0,0,0,0.45);
}

/* ===== 高级 Dock 栏 ===== */
.dock-premium {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(25px);
  width: calc(100% - 44px);
  z-index: 10;
  opacity: 0;
  transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: 450ms;
}

.awakened .dock-premium {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.dock-glass {
  background: rgba(255,255,255,0.62);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 28px;
  padding: 12px 20px;
  display: flex;
  justify-content: space-around;
  box-shadow:
    0 10px 40px rgba(0,0,0,0.1),
    0 2px 12px rgba(0,0,0,0.05),
    inset 0 0.5px 0 rgba(255,255,255,0.6),
    inset 0 -0.5px 0 rgba(0,0,0,0.04);
  border: 0.5px solid rgba(255,255,255,0.3);
}

.dock-icon-unit {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.dock-icon-visual {
  width: 54px;
  height: 54px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dock-icon-unit:hover .dock-icon-visual {
  transform: translateY(-8px) scale(1.12);
  box-shadow: 0 10px 24px rgba(0,0,0,0.18);
}

.home-bar {
  width: 134px;
  height: 5px;
  background: rgba(0,0,0,0.18);
  border-radius: 3px;
  margin: 10px auto 0;
}

/* ===== 聊天列表页 ===== */
.page-chatlist {
  width: 100%;
  height: calc(100% - 54px);
  background: #fff;
  display: flex;
  flex-direction: column;
}

.chatlist-header {
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 0.5px solid rgba(0,0,0,0.06);
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
}

.nav-back-btn {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  color: #007AFF;
  transition: background 0.2s;
}

.nav-back-btn:hover { background: rgba(0,122,255,0.08); }

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin: 0;
}

.nav-compose-btn {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  color: #007AFF;
  transition: background 0.2s;
}

.nav-compose-btn:hover { background: rgba(0,122,255,0.08); }

.chatlist-tabs {
  display: flex;
  gap: 0;
  padding: 0 16px;
  border-bottom: 0.5px solid rgba(0,0,0,0.06);
  background: rgba(250,250,250,0.9);
}

.tab-btn {
  flex: 1;
  padding: 12px 0;
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 600;
  color: #8E8E93;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.tab-btn.active {
  color: #000;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: #007AFF;
  border-radius: 2px;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.conversation-list::-webkit-scrollbar { width: 3px; }
.conversation-list::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 2px; }

.conversation-card {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  gap: 12px;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}

.conversation-card:hover { background: rgba(0,0,0,0.02); }
.conversation-card.unread { background: rgba(0,122,255,0.03); }

.avatar-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.conv-content {
  flex: 1;
  min-width: 0;
}

.conv-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.conv-name {
  font-size: 16px;
  font-weight: 600;
  color: #000;
}

.conv-time {
  font-size: 13px;
  color: #8E8E93;
  font-weight: 500;
}

.conv-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conv-preview {
  font-size: 14px;
  color: #8E8E93;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-badge {
  min-width: 20px;
  height: 20px;
  background: #FF3B30;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

/* ===== 聊天详情页 ===== */
.page-chatdetail {
  width: 100%;
  height: calc(100% - 54px);
  background: #F2F2F7;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.anime-bg-layer {
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(180,195,210,0.03) 40px, rgba(180,195,210,0.03) 41px),
    repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(180,195,210,0.03) 40px, rgba(180,195,210,0.03) 41px);
  pointer-events: none;
  z-index: 0;
}

.chatdetail-header-glass {
  height: 56px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(25px);
  border-bottom: 0.5px solid rgba(0,0,0,0.06);
  position: relative;
  z-index: 10;
}

.chat-user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.mini-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-status-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.user-name-lg {
  font-size: 16px;
  font-weight: 700;
  color: #000;
}

.status-indicator {
  font-size: 12px;
  font-weight: 500;
}

.status-indicator.online { color: #34C759; }

.nav-more-btn {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  color: #8E8E93;
  transition: background 0.2s;
}

.nav-more-btn:hover { background: rgba(0,0,0,0.04); }

.messages-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  z-index: 1;
  -webkit-overflow-scrolling: touch;
}

.messages-scroll-area::-webkit-scrollbar { width: 4px; }
.messages-scroll-area::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }

.message-bubble-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  max-width: 80%;
  animation: bubbleIn 0.3s ease-out both;
}

.message-bubble-wrapper.from-me {
  align-self: flex-end;
  flex-direction: row-reverse;
}

@keyframes bubbleIn {
  from { opacity: 0; transform: translateY(10px) scale(0.94); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.bubble-avatar-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.4;
  word-break: break-word;
  max-width: 100%;
}

.their-bubble {
  background: #fff;
  color: #000;
  border-bottom-left-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.my-bubble {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  border-bottom-right-radius: 5px;
  box-shadow: 0 2px 10px rgba(240,147,251,0.25);
}

.input-bar-area {
  padding: 12px 14px 30px;
  display: flex;
  gap: 10px;
  align-items: center;
  background: rgba(255,255,255,0.98);
  backdrop-filter: blur(20px);
  border-top: 0.5px solid rgba(0,0,0,0.06);
  position: relative;
  z-index: 10;
}

.attach-action {
  background: none;
  border: none;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: #8E8E93;
  transition: all 0.2s;
  flex-shrink: 0;
}

.attach-action:hover { color: #007AFF; background: rgba(0,122,255,0.06); }

.message-input-field {
  flex: 1;
  height: 38px;
  border: none;
  background: #F2F2F7;
  border-radius: 19px;
  padding: 0 16px;
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}

.message-input-field:focus {
  background: #EBEBF0;
  box-shadow: 0 0 0 3px rgba(0,122,255,0.1);
}

.send-action {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  color: #fff;
  border: none;
  padding: 0 18px;
  height: 38px;
  border-radius: 19px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  flex-shrink: 0;
  font-family: inherit;
}

.send-action:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 14px rgba(0,122,255,0.3);
}

.send-action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ===== 朋友圈页 ===== */
.page-moments {
  width: 100%;
  height: calc(100% - 54px);
  background: #F2F2F7;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.moments-hero-section {
  position: relative;
  height: 200px;
  flex-shrink: 0;
}

.cover-banner {
  width: 100%;
  height: 170px;
  overflow: hidden;
}

.cover-gradient-art {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

.profile-info-overlay {
  position: absolute;
  bottom: 0;
  left: 20px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.profile-avatar-ring {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  border: 3.5px solid #fff;
  overflow: hidden;
  box-shadow: 0 3px 14px rgba(0,0,0,0.15);
  background: #fff;
}

.profile-avatar-img svg {
  display: block;
  width: 100%;
  height: 100%;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.profile-name-text {
  font-size: 19px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 1px 6px rgba(0,0,0,0.25);
}

.profile-sparkle {
  font-size: 16px;
}

.moments-navigation-bar {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 0.5px solid rgba(0,0,0,0.06);
}

.moments-nav-title {
  font-size: 17px;
  font-weight: 700;
  color: #000;
}

.camera-capture-btn {
  background: none;
  border: none;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  color: #000;
  transition: opacity 0.2s;
}

.camera-capture-btn:hover { opacity: 0.6; }

.moments-feed-stream {
  padding: 12px 0 24px;
}

.moment-post-card {
  background: #fff;
  margin: 0 0 12px;
  padding: 16px;
}

.post-header-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.post-author-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  flex-shrink: 0;
}

.post-meta-data {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-size: 15px;
  font-weight: 700;
  color: #000;
  margin: 0;
}

.post-timestamp {
  font-size: 12px;
  color: #8E8E93;
  font-weight: 500;
}

.post-body-text {
  font-size: 15px;
  line-height: 1.55;
  color: #000;
  margin: 0 0 12px;
  white-space: pre-line;
}

.post-image-gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  margin-bottom: 12px;
  border-radius: 10px;
  overflow: hidden;
}

.gallery-thumb {
  aspect-ratio: 1;
  background-size: cover;
  background-position: center;
}

.post-interaction-bar {
  display: flex;
  gap: 20px;
  padding-top: 10px;
  border-top: 0.5px solid rgba(0,0,0,0.06);
}

.interaction-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #8E8E93;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 0;
  transition: all 0.2s;
  font-family: inherit;
}

.interaction-btn:hover { color: #FF3B30; }
.interaction-btn.liked { color: #FF3B30; }
.interaction-btn.liked svg { animation: heartPop 0.35s ease-out; }

@keyframes heartPop {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.35); }
}

/* ===== 页面转场动画 ===== */
.slide-in-right-enter-active,
.slide-in-right-leave-active,
.slide-in-left-enter-active,
.slide-in-left-leave-active {
  transition: all 0.38s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-in-right-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-in-right-leave-to {
  transform: translateX(-25%);
  opacity: 0;
}

.slide-in-left-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-in-left-leave-to {
  transform: translateX(25%);
  opacity: 0;
}
</style>