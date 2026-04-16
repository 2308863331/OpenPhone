<!-- 深夜食堂 - 日式居酒屋主题页面，含菜单、心情选择和留言簿 -->
<template>
  <div class="midnight-diner" :class="{ 'is-entered': isEntered }">
    <!-- SVG 渐变定义 -->
    <svg width="0" height="0" style="position: absolute;">
      <defs>
        <radialGradient id="lanternGradient" cx="35%" cy="35%">
          <stop offset="0%" stop-color="#fff5e0" />
          <stop offset="100%" stop-color="#ffb347" />
        </radialGradient>
        <linearGradient id="sakeBottleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e8f0f8" />
          <stop offset="100%" stop-color="#c0d8e8" />
        </linearGradient>
        <radialGradient id="ceramicGradient" cx="30%" cy="25%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#e8dfd0" />
        </radialGradient>
      </defs>
    </svg>

    <!-- 暗室层 -->
    <div class="layer-dark-room"></div>

    <!-- 背景层 -->
    <div class="layer-background">
      <div class="shoji-door"></div>
      <div class="noren-curtain">
        <div class="curtain-wave"></div>
      </div>
    </div>

    <!-- 光源层 -->
    <div class="layer-light">
      <div class="lantern">
        <svg viewBox="0 0 80 100" class="lantern-svg">
          <ellipse cx="40" cy="50" rx="28" ry="38" class="lantern-body" />
          <ellipse cx="40" cy="15" rx="8" ry="4" class="lantern-top" />
          <line x1="40" y1="0" x2="40" y2="12" class="lantern-string" />
          <path d="M 30 86 Q 40 94 50 86" class="lantern-bottom" fill="none" />
          <ellipse cx="40" cy="88" rx="10" ry="3" class="lantern-cap" />
        </svg>
        <div class="lantern-glow"></div>
      </div>
    </div>

    <!-- 吧台主体 -->
    <div class="layer-counter">
      <div class="counter-structure">
        <div class="counter-front"></div>
        <div class="counter-top">
          <!-- 道具区 -->
          <div class="props-area">
            <div class="sake-bottle" @click="toggleSakeMode">
              <svg viewBox="0 0 40 80" class="bottle-svg">
                <path d="M 12 20 Q 10 25 10 35 L 10 70 Q 10 75 20 75 Q 30 75 30 70 L 30 35 Q 30 25 28 20 Q 24 15 20 15 Q 16 15 12 20 Z"
                      class="bottle-body" />
                <rect x="17" y="8" width="6" height="9" rx="1" class="bottle-neck" />
              </svg>
            </div>

            <div class="chopsticks">
              <div class="stick stick-1"></div>
              <div class="stick stick-2"></div>
            </div>

            <div class="ceramic-bowl">
              <svg viewBox="0 0 60 30" class="bowl-svg">
                <ellipse cx="30" cy="18" rx="26" ry="10" class="bowl-body" />
                <ellipse cx="30" cy="16" rx="22" ry="7" class="bowl-inner" />
              </svg>
            </div>
          </div>

          <!-- 菜单区域 -->
          <div class="menu-area" :class="{ 'is-open': isMenuOpen }">
            <div class="menu-book" @click="toggleMenu">
              <div class="menu-cover">
                <span class="menu-title">今日推荐</span>
              </div>
              <div class="menu-pages">
                <div class="menu-page" v-for="(dish, idx) in todayDishes" :key="idx">
                  <div class="dish-name">{{ dish.name }}</div>
                  <div class="dish-desc">{{ dish.desc }}</div>
                  <div class="dish-price">¥{{ dish.price }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 心情选择器 -->
          <div class="mood-selector">
            <div class="mood-rack">
              <div v-for="mood in moods" :key="mood.id"
                   class="mood-tag"
                   :class="{ 'is-active': currentMood === mood.id }"
                   @click="selectMood(mood.id)"
                   :style="{ transform: mood.flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }">
                <span class="mood-front">{{ mood.label }}</span>
                <span class="mood-back">✓</span>
              </div>
            </div>
          </div>

          <!-- AI回复区 - 手写便签 -->
          <div class="ai-response-area">
            <transition name="note-slide">
              <div class="handwritten-note" v-if="currentNote">
                <div class="note-content">{{ currentNote }}</div>
                <div class="note-seal"></div>
              </div>
            </transition>
          </div>

          <!-- 留言簿 -->
          <div class="guestbook" @click="openGuestbook">
            <div class="book-cover"></div>
            <span class="book-label">留言簿</span>
          </div>
        </div>
      </div>

      <!-- 店主形象 -->
      <div class="owner-figure" :class="ownerState">
        <div class="owner-silhouette">
          <svg viewBox="0 0 120 160" class="owner-svg">
            <ellipse cx="60" cy="35" rx="22" ry="25" class="owner-head" />
            <path d="M 30 60 Q 60 55 90 60 L 95 140 Q 60 145 25 140 Z" class="owner-body" />
            <path d="M 30 65 Q 20 90 25 130" class="owner-arm-left" fill="none" />
            <path d="M 90 65 Q 100 90 95 130" class="owner-arm-right" fill="none" />
          </svg>
        </div>
        <div class="owner-dialog" v-if="ownerDialog">
          {{ ownerDialog }}
        </div>
      </div>
    </div>

    <!-- 地基光层 -->
    <div class="layer-base-light"></div>

    <!-- 交互层 -->
    <transition name="panel-fade">
      <div class="layer-interaction" v-if="showInteractionPanel">
        <div class="interaction-panel" :class="panelType">
          <div class="panel-close" @click="closePanel">×</div>
          <div class="panel-content">
            <!-- 根据面板类型渲染不同内容 -->
            <template v-if="panelType === 'sake'">
              <h3>深夜时光</h3>
              <p>来杯清酒，说说今天的事吧</p>
              <div class="chat-input">
                <input type="text" placeholder="想说点什么..." v-model="chatInput" @keyup.enter="sendChat" />
                <button @click="sendChat">发送</button>
              </div>
              <div class="chat-history" v-if="chatHistory.length">
                <div v-for="(msg, i) in chatHistory" :key="i" class="chat-msg" :class="msg.role">
                  {{ msg.text }}
                </div>
              </div>
            </template>
            <template v-if="panelType === 'guestbook'">
              <h3>留下你的故事</h3>
              <textarea placeholder="在这里写下你想说的话..." v-model="guestbookText"></textarea>
              <button class="stamp-btn" @click="submitGuestbook">盖上印章</button>
            </template>
          </div>
        </div>
      </div>
    </transition>

    <!-- 装饰落叶/飘浮粒子 -->
    <div class="floating-particles">
      <div v-for="i in 5" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'

const isEntered = ref(false)
const isMenuOpen = ref(false)
const currentMood = ref(null)
const currentNote = ref('')
const ownerDialog = ref('')
const ownerState = ref('waiting')
const showInteractionPanel = ref(false)
const panelType = ref('')
const chatInput = ref('')
const chatHistory = reactive([])
const guestbookText = ref('')

const moods = reactive([
  { id: 'happy', label: '开心', flipped: false },
  { id: 'tired', label: '疲惫', flipped: false },
  { id: 'sad', label: '难过', flipped: false },
  { id: 'calm', label: '平静', flipped: false }
])

const todayDishes = reactive([
  { name: '味噌汤定食', desc: '暖胃的家的味道', price: 38 },
  { name: '照烧鸡排饭', desc: '甜咸适口的经典', price: 45 },
  { name: '茶泡饭', desc: '深夜的一碗慰藉', price: 28 },
  { name: '关东煮', desc: '热气腾腾的治愈', price: 32 }
])

const welcomeNotes = [
  '欢迎回来，外面冷吗？',
  '今晚想吃点什么？',
  '你来了，灯就亮了',
  '慢点坐，汤还热着呢'
]

function getParticleStyle(i) {
  const delay = (i * 1.5) + 's'
  const left = (10 + i * 18) + '%'
  const duration = (8 + Math.random() * 4) + 's'
  return {
    left,
    animationDelay: delay,
    animationDuration: duration
  }
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  if (isMenuOpen.value) {
    showOwnerDialog('今天的菜都很不错哦')
  }
}

function selectMood(moodId) {
  const mood = moods.find(m => m.id === moodId)
  if (mood) {
    mood.flipped = !mood.flipped
    currentMood.value = moodId
    handleMoodResponse(moodId)
  }
}

function handleMoodResponse(moodId) {
  const responses = {
    happy: '看你心情不错，今天一定发生了好事吧',
    tired: '累了就靠一会儿，这里永远为你亮着灯',
    sad: '有些事说出来会好受些，我在听',
    calm: '平静的日子最珍贵，慢慢享受这刻'
  }
  showNote(responses[moodId])
  ownerState.value = 'listening'
}

function toggleSakeMode() {
  panelType.value = 'sake'
  showInteractionPanel.value = true
  showOwnerDialog('今夜月色正好，喝一杯？')
  ownerState.value = 'serving'
}

function openGuestbook() {
  panelType.value = 'guestbook'
  showInteractionPanel.value = true
}

function closePanel() {
  showInteractionPanel.value = false
  panelType.value = ''
  ownerState.value = 'waiting'
}

function sendChat() {
  if (!chatInput.value.trim()) return
  chatHistory.push({ role: 'user', text: chatInput.value })
  const userMsg = chatInput.value
  chatInput.value = ''

  setTimeout(() => {
    const replies = [
      '嗯，我明白你的意思',
      '说得好，再来一杯？',
      '每个人都有不容易的时候',
      '明天会是更好的一天'
    ]
    chatHistory.push({ role: 'owner', text: replies[Math.floor(Math.random() * replies.length)] })
  }, 800)
}

function submitGuestbook() {
  if (!guestbookText.value.trim()) return
  showNote('谢谢你的留言，我会好好收着的')
  guestbookText.value = ''
  closePanel()
}

function showNote(text) {
  currentNote.value = text
  setTimeout(() => {
    currentNote.value = ''
  }, 4000)
}

function showOwnerDialog(text) {
  ownerDialog.value = text
  setTimeout(() => {
    ownerDialog.value = ''
  }, 3000)
}

onMounted(() => {
  setTimeout(() => {
    isEntered.value = true
  }, 100)

  setTimeout(() => {
    const randomNote = welcomeNotes[Math.floor(Math.random() * welcomeNotes.length)]
    showNote(randomNote)
  }, 2800)

  const hour = new Date().getHours()
  if (hour >= 0 && hour < 6) {
    ownerState.value = 'late-night'
    showOwnerDialog('这么晚还在外面啊，进来歇会儿')
  } else if (hour >= 18) {
    ownerState.value = 'evening'
  }
})
</script>

<style scoped>
/* ========== CSS 变量系统 ========== */
.midnight-dinner {
  --lantern-warm: #ffb347;
  --lantern-glow: rgba(255, 179, 71, 0.35);
  --wood-dark: #3e2723;
  --wood-medium: #5c4033;
  --wood-light: #d4a574;
  --paper-white: #f5ede0;
  --paper-cream: #fffef8;
  --ink-black: #2c2416;
  --accent-red: #8b2500;
  --ceramic-white: #e8dfd0;

  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #1a1410;
  font-family: 'Ma Shan Zheng', 'ZCOOL XiaoWei', serif;
}

/* ========== 暗室层 ========== */
.layer-dark-room {
  position: absolute;
  inset: 0;
  background: #1a1410;
  z-index: 0;
  transition: opacity 1.5s ease-out;
}

.is-entered .layer-dark-room {
  opacity: 0.15;
}

/* ========== 背景层 ========== */
.layer-background {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: var(--paper-white);
  opacity: 0;
  transform: scale(1.02);
  transition: all 1s ease-out 0.4s;
}

.is-entered .layer-background {
  opacity: 1;
  transform: scale(1);
}

.shoji-door {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, transparent 49.5%, rgba(200, 180, 160, 0.08) 49.5%, rgba(200, 180, 160, 0.08) 50.5%, transparent 50.5%),
    linear-gradient(0deg, transparent 49.5%, rgba(200, 180, 160, 0.08) 49.5%, rgba(200, 180, 160, 0.08) 50.5%, transparent 50.5%);
  background-size: 80px 100px;
}

.noren-curtain {
  position: absolute;
  top: 8%;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 25%;
  background: linear-gradient(180deg, rgba(255, 250, 245, 0.9), rgba(255, 250, 245, 0.7));
  border-radius: 0 0 8px 8px;
  backdrop-filter: blur(2px);
  clip-path: polygon(
    0% 0%, 100% 0%, 100% 85%,
    95% 92%, 88% 87%, 82% 94%,
    75% 88%, 68% 95%, 62% 89%,
    55% 93%, 48% 87%, 42% 92%,
    35% 88%, 28% 94%, 22% 87%,
    15% 93%, 8% 88%, 0% 92%
  );
  opacity: 0;
  transition: opacity 0.8s ease-out 0.6s;
}

.is-entered .noren-curtain {
  opacity: 1;
}

.curtain-wave {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 40px,
    rgba(180, 160, 140, 0.06) 40px,
    rgba(180, 160, 140, 0.06) 42px
  );
  animation: curtainSway 6s ease-in-out infinite;
}

@keyframes curtainSway {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(3px); }
}

/* ========== 光源层 ========== */
.layer-light {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.lantern {
  position: absolute;
  top: 5%;
  left: 12%;
  width: 70px;
  height: 90px;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s;
}

.is-entered .lantern {
  opacity: 1;
  transform: scale(1);
}

.lantern-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 30px var(--lantern-glow));
}

.lantern-body {
  fill: url(#lanternGradient);
  stroke: #8b4513;
  stroke-width: 1.5;
}

.lantern-top, .lantern-cap {
  fill: #8b4513;
}

.lantern-string {
  stroke: #5c4033;
  stroke-width: 1.5;
}

.lantern-bottom {
  stroke: #8b4513;
  stroke-width: 2;
}

.lantern-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, var(--lantern-glow) 0%, transparent 70%);
  animation: lanternBreath 10s ease-in-out infinite;
  pointer-events: none;
}

@keyframes lanternBreath {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.08); }
}

/* ========== 吧台主体 ========== */
.layer-counter {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 52%;
  z-index: 3;
  perspective: 800px;
}

.counter-structure {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 85%;
  max-width: 700px;
  height: 100%;
  opacity: 0;
  translateY: 60px;
  transition: all 1s cubic-bezier(0.22, 1, 0.36, 1) 0.8s;
}

.is-entered .counter-structure {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.counter-front {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 45%;
  background: linear-gradient(to bottom, var(--wood-medium), var(--wood-dark));
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
  border-radius: 4px 4px 0 0;
}

.counter-front::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 30px,
      rgba(0, 0, 0, 0.03) 30px,
      rgba(0, 0, 0, 0.03) 31px
    );
}

.counter-top {
  position: absolute;
  top: 0;
  left: -3%;
  right: -3%;
  height: 58%;
  background: linear-gradient(to bottom, #e8c896, var(--wood-light));
  border-radius: 6px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.counter-top::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      85deg,
      transparent,
      transparent 50px,
      rgba(120, 80, 50, 0.04) 50px,
      rgba(120, 80, 50, 0.04) 51px
    );
  border-radius: 6px;
  pointer-events: none;
}

/* ========== 道具区 ========== */
.props-area {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  height: 70px;
  opacity: 0;
  transform: translateY(20px) scale(0.8);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1.4s;
}

.is-entered .props-area {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.sake-bottle {
  cursor: pointer;
  transition: transform 0.3s ease;
  filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.2));
}

.sake-bottle:hover {
  transform: rotate(-5deg) translateY(-4px);
}

.bottle-svg {
  width: 28px;
  height: 56px;
}

.bottle-body {
  fill: url(#sakeBottleGradient);
  stroke: #a08060;
  stroke-width: 0.5;
}

.bottle-neck {
  fill: #d0e0f0;
}

.chopsticks {
  display: flex;
  flex-direction: column;
  gap: 3px;
  transform: rotate(15deg);
}

.stick {
  width: 4px;
  height: 55px;
  background: linear-gradient(to bottom, #4a3728, #2c1810);
  border-radius: 2px;
}

.stick-2 {
  margin-top: -50px;
  margin-left: 6px;
}

.ceramic-bowl {
  filter: drop-shadow(1px 3px 4px rgba(0, 0, 0, 0.15));
}

.bowl-svg {
  width: 50px;
  height: 25px;
}

.bowl-body {
  fill: url(#ceramicGradient);
  stroke: #c0b0a0;
  stroke-width: 0.5;
}

.bowl-inner {
  fill: rgba(255, 255, 255, 0.3);
}

/* ========== 菜单区域 ========== */
.menu-area {
  flex: 1;
  min-height: 0;
}

.menu-book {
  cursor: pointer;
  transition: transform 0.4s ease;
}

.menu-book:hover {
  transform: translateY(-2px);
}

.menu-cover {
  background: linear-gradient(135deg, var(--paper-cream), #f0e8d8);
  padding: 14px 20px;
  border-radius: 2px;
  box-shadow:
    2px 4px 10px rgba(0, 0, 0, 0.12),
    inset 0 0 30px rgba(200, 180, 150, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.menu-cover::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent-red);
  border-radius: 2px 0 0 2px;
}

.menu-title {
  font-size: 18px;
  color: var(--ink-black);
  letter-spacing: 3px;
  font-weight: 600;
}

.menu-pages {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s ease, opacity 0.3s ease;
  opacity: 0;
  background: var(--paper-cream);
  margin-top: 8px;
  border-radius: 2px;
  box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.1);
}

.menu-area.is-open .menu-pages {
  max-height: 320px;
  opacity: 1;
}

.menu-page {
  padding: 12px 18px;
  border-bottom: 1px dashed rgba(180, 160, 140, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s ease;
  cursor: pointer;
}

.menu-page:last-child {
  border-bottom: none;
}

.menu-page:hover {
  background: rgba(255, 200, 150, 0.08);
}

.dish-name {
  font-size: 15px;
  color: var(--ink-black);
  font-weight: 500;
}

.dish-desc {
  font-size: 12px;
  color: #8a7a6a;
  flex: 1;
  margin-left: 12px;
}

.dish-price {
  font-size: 14px;
  color: var(--accent-red);
  font-weight: 600;
}

/* ========== 心情选择器 ========== */
.mood-selector {
  display: flex;
  justify-content: center;
}

.mood-rack {
  display: flex;
  gap: 10px;
  padding: 8px 16px;
  background: rgba(100, 70, 50, 0.08);
  border-radius: 20px;
  border: 1px solid rgba(150, 120, 90, 0.15);
}

.mood-tag {
  width: 56px;
  height: 28px;
  cursor: pointer;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
  border-radius: 14px;
}

.mood-front, .mood-back {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  border-radius: 14px;
  backface-visibility: hidden;
}

.mood-front {
  background: linear-gradient(135deg, #f5efe6, #ebe0d0);
  color: var(--ink-black);
  border: 1px solid rgba(180, 160, 140, 0.3);
}

.mood-back {
  background: linear-gradient(135deg, var(--accent-red), #a03000);
  color: #fff;
  transform: rotateY(180deg);
}

.mood-tag.is-active .mood-front {
  background: linear-gradient(135deg, var(--wood-light), #c49560);
  color: #fff;
}

/* ========== AI回复区 ========== */
.ai-response-area {
  min-height: 60px;
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.handwritten-note {
  background: linear-gradient(135deg, var(--paper-cream), #f8f4e8);
  padding: 14px 24px;
  border-radius: 2px;
  box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 80%;
  position: relative;
  font-size: 15px;
  color: var(--ink-black);
  line-height: 1.7;
  letter-spacing: 1px;
}

.handwritten-note::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 23px,
      rgba(180, 160, 140, 0.08) 23px,
      rgba(180, 160, 140, 0.08) 24px
    );
  border-radius: 2px;
  pointer-events: none;
}

.note-content {
  position: relative;
  z-index: 1;
}

.note-seal {
  position: absolute;
  bottom: 6px;
  right: 8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #ff4444, #cc0000);
  opacity: 0.7;
}

.note-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.note-slide-leave-active {
  transition: all 0.4s ease-in;
}

.note-slide-enter-from {
  opacity: 0;
  transform: translateX(-30px) rotate(-3deg);
}

.note-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ========== 留言簿 ========== */
.guestbook {
  position: absolute;
  bottom: 16px;
  right: 20px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: transform 0.3s ease;
  opacity: 0;
  animation: propPlaceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.8s forwards;
}

.guestbook:hover {
  transform: translateY(-3px) rotate(-2deg);
}

@keyframes propPlaceIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.7);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.book-cover {
  width: 44px;
  height: 58px;
  background: linear-gradient(135deg, var(--accent-red), #6b1d00);
  border-radius: 2px;
  box-shadow:
    2px 4px 8px rgba(0, 0, 0, 0.25),
    inset 0 0 15px rgba(0, 0, 0, 0.3);
  position: relative;
}

.book-cover::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 200, 150, 0.4);
  border-radius: 50%;
}

.book-label {
  font-size: 11px;
  color: #8a7a6a;
  letter-spacing: 2px;
}

/* ========== 店主形象 ========== */
.owner-figure {
  position: absolute;
  top: -90px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  opacity: 0;
  transition: all 0.8s ease-out 1.6s;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.is-entered .owner-figure {
  opacity: 1;
}

.owner-silhouette {
  width: 90px;
  height: 120px;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

.owner-svg {
  width: 100%;
  height: 100%;
}

.owner-head {
  fill: #f0d0b0;
}

.owner-body {
  fill: #4a6fa5;
}

.owner-arm-left, .owner-arm-right {
  stroke: #4a6fa5;
  stroke-width: 8;
  stroke-linecap: round;
}

.owner-figure.waiting .owner-arm-right {
  animation: armRest 4s ease-in-out infinite;
}

.owner-figure.listening .owner-body {
  animation: leanForward 0.5s ease forwards;
}

.owner-figure.serving .owner-arm-right {
  animation: pourSake 2s ease-in-out infinite;
}

.owner-figure.late-night .owner-silhouette {
  animation: lateNightPose 6s ease-in-out infinite;
}

@keyframes armRest {
  0%, 100% { d: path('M 90 65 Q 100 90 95 130'); }
  50% { d: path('M 90 65 Q 105 85 98 128'); }
}

@keyframes leanForward {
  to { transform: rotate(3deg) translateY(5px); }
}

@keyframes pourSake {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(15deg); }
}

@keyframes lateNightPose {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-2deg) translateY(3px); }
}

.owner-dialog {
  margin-top: 8px;
  background: var(--paper-cream);
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  color: var(--ink-black);
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  position: relative;
  animation: dialogFloat 3s ease-in-out infinite;
}

.owner-dialog::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid var(--paper-cream);
}

@keyframes dialogFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

/* ========== 地基光层 ========== */
.layer-base-light {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  z-index: 6;
  background: linear-gradient(to top, rgba(255, 200, 120, 0.12), transparent);
  opacity: 0;
  transition: opacity 0.8s ease-in-out 2.2s;
  pointer-events: none;
}

.is-entered .layer-base-light {
  opacity: 1;
}

/* ========== 交互层 ========== */
.layer-interaction {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.interaction-panel {
  background: linear-gradient(135deg, var(--paper-cream), #f5ede0);
  width: 85%;
  max-width: 420px;
  max-height: 70vh;
  border-radius: 8px;
  padding: 28px 24px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.35),
    inset 0 0 40px rgba(200, 180, 150, 0.08);
  position: relative;
  overflow-y: auto;
}

.panel-close {
  position: absolute;
  top: 12px;
  right: 16px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #8a7a6a;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.panel-close:hover {
  background: rgba(0, 0, 0, 0.06);
}

.panel-content h3 {
  font-size: 20px;
  color: var(--ink-black);
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.panel-content p {
  font-size: 14px;
  color: #8a7a6a;
  margin-bottom: 20px;
  line-height: 1.6;
}

.chat-input {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.chat-input input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid rgba(180, 160, 140, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.6);
  font-family: inherit;
  font-size: 14px;
  color: var(--ink-black);
  outline: none;
  transition: border-color 0.2s ease;
}

.chat-input input:focus {
  border-color: var(--wood-light);
}

.chat-input button {
  padding: 10px 18px;
  background: linear-gradient(135deg, var(--wood-medium), var(--wood-dark));
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.chat-input button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.chat-history {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-msg {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  max-width: 80%;
  line-height: 1.5;
}

.chat-msg.user {
  align-self: flex-end;
  background: linear-gradient(135deg, var(--wood-light), #c49560);
  color: #fff;
  margin-left: auto;
}

.chat-msg.owner {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.7);
  color: var(--ink-black);
}

.panel-content textarea {
  width: 100%;
  height: 120px;
  padding: 12px 14px;
  border: 1px solid rgba(180, 160, 140, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.6);
  font-family: inherit;
  font-size: 14px;
  color: var(--ink-black);
  resize: none;
  outline: none;
  margin-bottom: 16px;
  line-height: 1.6;
}

.stamp-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, var(--accent-red), #a03000);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  letter-spacing: 2px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stamp-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 37, 0, 0.3);
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.4s ease;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
}

/* ========== 飘浮粒子 ========== */
.floating-particles {
  position: absolute;
  inset: 0;
  z-index: 7;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  top: -20px;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, rgba(255, 200, 120, 0.5), transparent);
  border-radius: 50%;
  animation: particleFall linear infinite;
}

@keyframes particleFall {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(110vh) translateX(40px) rotate(360deg);
    opacity: 0;
  }
}

/* ========== 响应式适配 ========== */
@media (max-width: 640px) {
  .counter-top {
    padding: 14px 16px;
    gap: 12px;
  }

  .menu-title {
    font-size: 15px;
  }

  .dish-name {
    font-size: 13px;
  }

  .mood-tag {
    width: 48px;
    height: 24px;
    font-size: 11px;
  }

  .owner-silhouette {
    width: 70px;
    height: 94px;
  }

  .lantern {
    width: 55px;
    height: 72px;
    top: 3%;
    left: 8%;
  }

  .interaction-panel {
    width: 92%;
    padding: 20px 16px;
  }
}
</style>
