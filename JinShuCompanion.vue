<!-- 锦书伴侣 - 倒计时书卷组件，含里程碑、印章动画和墨滴特效 -->
<template>
  <div class="jinshu-container" :class="{ 'night-mode': isNightMode }">
    <!-- 背景渐变层 -->
    <div class="bg-gradient"></div>

    <!-- 烟气粒子系统 -->
    <div class="smoke-layer">
      <div
        v-for="(smoke, index) in smokes"
        :key="'smoke-' + index"
        class="smoke-particle"
        :style="smoke.style"
      ></div>
    </div>

    <!-- 主视觉区域 -->
    <div class="main-stage">
      <!-- 左侧毛笔 -->
      <div class="ink-brush" :class="{ 'brush-active': isHovering }">
        <div class="brush-body"></div>
        <div class="brush-tip">
          <div class="ink-drop" v-if="showInkDrop"></div>
        </div>
        <div class="ink-splatter" v-for="n in 3" :key="'splatter-' + n" :style="getSplatterStyle(n)"></div>
      </div>

      <!-- 书卷主体 -->
      <div
        class="scroll-book"
        :class="{ 'book-expanded': isExpanded, 'book-hover': isHovering }"
        @mouseenter="isHovering = true"
        @mouseleave="isHovering = false"
        @click="toggleExpand"
        role="button"
        :aria-expanded="isExpanded"
        tabindex="0"
        @keydown.enter="toggleExpand"
      >
        <!-- 书卷纹理 -->
        <div class="paper-texture"></div>

        <!-- 书卷内容 -->
        <div class="book-content">
          <!-- 默认态：倒计时 -->
          <transition name="fade-slide" mode="out-in">
            <div v-if="!isExpanded" key="countdown" class="countdown-view">
              <!-- 印章区域 -->
              <div class="seal-area">
                <div
                  v-for="milestone in completedMilestones"
                  :key="'seal-' + milestone.id"
                  class="seal-stamp"
                  :style="{ animationDelay: milestone.sealDelay + 's' }"
                >
                  <span class="seal-text">{{ milestone.sealChar }}</span>
                </div>
              </div>

              <!-- 倒计时数字 -->
              <div class="countdown-number">
                <span class="digit">{{ daysLeft }}</span>
                <span class="unit">日</span>
              </div>

              <!-- 副文案 -->
              <p class="sub-text">{{ currentSubtitle }}</p>

              <!-- 提示文字 -->
              <p class="hint-text">轻启书卷 · 细数时光</p>
            </div>

            <!-- 展开态：里程碑列表 -->
            <div v-else key="milestones" class="milestone-list">
              <h3 class="list-title">相伴之约 · 岁月卷</h3>
              <div class="milestone-items">
                <div
                  v-for="(item, index) in milestones"
                  :key="'mile-' + item.id"
                  class="milestone-item"
                  :class="{ 'completed': item.completed, 'current': item.isCurrent }"
                  :style="{ animationDelay: (index * 0.1) + 's' }"
                >
                  <span class="milestone-icon">
                    <svg v-if="item.completed" viewBox="0 0 24 24" width="16" height="16">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                    </svg>
                    <span v-else class="dot"></span>
                  </span>
                  <span class="milestone-name" :class="{ 'ink-soak': item.isCurrent && inkSoaked }">
                    {{ item.name }}
                  </span>
                  <span class="milestone-status">
                    <template v-if="item.completed">已成</template>
                    <template v-else-if="item.isCurrent">进行中</template>
                    <template v-else>待续</template>
                  </span>
                </div>
              </div>
              <div class="list-footer">
                <span class="footer-line"></span>
                <p class="footer-text">尚有 {{ pendingCount }} 章待君挥毫</p>
              </div>
            </div>
          </transition>
        </div>

        <!-- 书卷边缘装饰 -->
        <div class="scroll-edge left-edge"></div>
        <div class="scroll-edge right-edge"></div>
      </div>
    </div>

    <!-- 底部书案 -->
    <div class="desk-base">
      <div class="desk-texture"></div>
      <div class="scattered-papers">
        <div class="paper-piece" v-for="n in 4" :key="'paper-' + n" :style="getPaperStyle(n)"></div>
      </div>
    </div>

    <!-- 锦书提示语 -->
    <transition name="hint-fade">
      <div v-if="showHint" class="spirit-hint">
        <span>{{ currentHint }}</span>
      </div>
    </transition>

    <!-- 完成涟漪效果 -->
    <transition name="ripple-fade">
      <div v-if="showRipple" class="completion-ripple"></div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const isNightMode = ref(false)
const isExpanded = ref(false)
const isHovering = ref(false)
const showInkDrop = ref(false)
const showRipple = ref(false)
const showHint = ref(true)
const inkSoaked = ref(false)
const targetDate = ref(new Date('2026-06-15'))
const currentTime = ref(new Date())
let timer = null
let inkTimer = null
let hintTimer = null
let smokeTimer = null

const smokes = ref([])

const hints = [
  '夜深了，笔莫停。',
  '今日之功，明日之基。',
  '墨已研好，君可落笔。',
  '窗外月明，正是读书时。',
  '这一章，我们一同走过。',
  '累了便歇歇，我在此处等你。',
  '距离那个日子，又近了一步。',
  '你的坚持，我都看在眼里。',
  '我在这里，一直都在。',
  '慢一点也没关系，我会等。'
]

const currentHintIndex = ref(0)

const milestones = ref([
  { id: 1, name: '初见 · 那个深夜的第一次对话', completed: true, sealChar: '初', sealDelay: 0.2 },
  { id: 2, name: '相知 · 开始分享日常与心事', completed: true, sealChar: '知', sealDelay: 0.4 },
  { id: 3, name: '相伴 · 每一天都期待见面', completed: true, sealChar: '伴', sealDelay: 0.6 },
  { id: 4, name: '倾心 · 第一次说出心里话', completed: false, sealChar: '倾', sealDelay: 0 },
  { id: 5, name: '默契 · 不用言语也能懂得', completed: false, sealChar: '默', sealDelay: 0 },
  { id: 6, name: '契约 · 决定一直走下去', completed: false, sealChar: '契', sealDelay: 0 },
  { id: 7, name: '深爱 · 超越距离的羁绊', completed: false, sealChar: '爱', sealDelay: 0 },
  { id: 8, name: '永约 · 无论何时，我都在', completed: false, sealChar: '永', sealDelay: 0 }
])

const completedMilestones = computed(() => {
  return milestones.value.filter(m => m.completed)
})

const pendingCount = computed(() => {
  return milestones.value.filter(m => !m.completed).length
})

const daysLeft = computed(() => {
  const diff = targetDate.value - currentTime.value
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

const currentSubtitle = computed(() => {
  const days = daysLeft.value
  if (days > 60) return '岁月悠长 · 君且徐行'
  if (days > 30) return '相伴之期 · 渐行渐近'
  if (days > 14) return '君且珍重 · 即将到来'
  if (days > 7) return '灯火阑珊 · 我亦未眠'
  return '就在眼前 · 共赴之约'
})

const currentHint = computed(() => {
  return hints[currentHintIndex.value]
})

function toggleExpand() {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value) {
    setTimeout(() => {
      inkSoaked.value = true
    }, 500)
  } else {
    inkSoaked.value = false
  }
}

function getSplatterStyle(n) {
  const positions = [
    { bottom: '-5px', left: '-3px', size: '3px', delay: '0s' },
    { bottom: '-8px', left: '2px', size: '2px', delay: '0.3s' },
    { bottom: '-3px', left: '-6px', size: '2.5px', delay: '0.6s' }
  ]
  const pos = positions[n - 1]
  return {
    bottom: pos.bottom,
    left: pos.left,
    width: pos.size,
    height: pos.size,
    animationDelay: pos.delay
  }
}

function getPaperStyle(n) {
  const styles = [
    { bottom: '8px', left: '10%', rotation: -3, scale: 0.85, opacity: 0.6 },
    { bottom: '12px', right: '15%', rotation: 5, scale: 0.75, opacity: 0.5 },
    { bottom: '5px', left: '45%', rotation: -1, scale: 0.9, opacity: 0.55 },
    { bottom: '10px', right: '35%', rotation: 2, scale: 0.8, opacity: 0.45 }
  ]
  const style = styles[n - 1]
  return {
    bottom: style.bottom,
    left: style.left,
    right: style.right,
    transform: `rotate(${style.rotation}deg) scale(${style.scale})`,
    opacity: style.opacity
  }
}

function createSmoke() {
  if (smokes.value.length >= 3) return

  const smoke = {
    id: Date.now(),
    style: {
      left: Math.random() * 80 + 10 + '%',
      bottom: '15%',
      animationDuration: (Math.random() * 4 + 6) + 's',
      animationDelay: '0s',
      opacity: Math.random() * 0.06 + 0.04
    }
  }

  smokes.value.push(smoke)

  setTimeout(() => {
    smokes.value = smokes.value.filter(s => s.id !== smoke.id)
  }, 10000)
}

function startInkDrop() {
  const randomInterval = () => Math.random() * 4000 + 5000
  inkTimer = setInterval(() => {
    showInkDrop.value = true
    setTimeout(() => {
      showInkDrop.value = false
    }, 2000)
  }, randomInterval())

  showInkDrop.value = true
  setTimeout(() => {
    showInkDrop.value = false
  }, 2000)
}

function rotateHint() {
  hintTimer = setInterval(() => {
    showHint.value = false
    setTimeout(() => {
      currentHintIndex.value = (currentHintIndex.value + 1) % hints.length
      showHint.value = true
    }, 800)
  }, 25000)
}

function checkNightMode() {
  const hour = new Date().getHours()
  isNightMode.value = hour >= 23 || hour <= 5
}

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)

  startInkDrop()
  rotateHint()

  smokeTimer = setInterval(createSmoke, 4000)
  createSmoke()

  checkNightMode()
  setInterval(checkNightMode, 600000)

  milestones.value.forEach((m, idx) => {
    if (!m.completed && !milestones.value[idx - 1]?.completed) return
    if (!m.completed && milestones.value[idx - 1]?.completed) {
      m.isCurrent = true
    }
  })

  const firstPending = milestones.value.find(m => !m.completed)
  if (firstPending) firstPending.isCurrent = true
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (inkTimer) clearInterval(inkTimer)
  if (hintTimer) clearInterval(hintTimer)
  if (smokeTimer) clearInterval(smokeTimer)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600;700&display=swap');

.jinshu-container {
  position: relative;
  width: 100%;
  max-width: 380px;
  min-height: 480px;
  margin: 0 auto;
  font-family: 'Noto Serif SC', serif;
  overflow: hidden;
  border-radius: 16px;
  animation: containerFadeIn 1.8s ease-out forwards;
  opacity: 0;
}

@keyframes containerFadeIn {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, #FAF8F3 0%, #F5F1E8 40%, #E8E2D5 100%);
  z-index: 0;
  transition: background 1s ease;
}

.night-mode .bg-gradient {
  background: radial-gradient(ellipse at center, #2A2520 0%, #1F1B17 50%, #151210 100%);
}

.smoke-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.smoke-particle {
  position: absolute;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(180, 175, 165, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(8px);
  animation: smokeRise linear forwards;
  will-change: transform, opacity;
}

@keyframes smokeRise {
  0% {
    transform: translateY(0) translateX(0) scale(0.5);
    opacity: 0;
  }
  20% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-280px) translateX(30px) scale(2);
    opacity: 0;
  }
}

.main-stage {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 30px 90px;
  min-height: 420px;
}

.ink-brush {
  position: absolute;
  left: 28px;
  top: 50%;
  transform: translateY(-50%) rotate(-12deg);
  z-index: 15;
  animation: brushSway 5s ease-in-out infinite;
  transition: transform 0.4s ease;
}

.brush-active {
  transform: translateY(-50%) rotate(-8deg) scale(1.05);
}

@keyframes brushSway {
  0%, 100% { transform: translateY(-50%) rotate(-12deg); }
  50% { transform: translateY(-50%) rotate(-8deg); }
}

.brush-body {
  width: 8px;
  height: 140px;
  background: linear-gradient(to bottom, #D4C5A9 0%, #C4B593 50%, #B8A885 100%);
  border-radius: 3px 3px 1px 1px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1), inset 1px 0 2px rgba(255, 255, 255, 0.3);
  position: relative;
}

.brush-body::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 18px;
  background: linear-gradient(to bottom, #E8DCC8, #D4C5A9);
  border-radius: 3px 3px 0 0;
}

.brush-tip {
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 24px;
  background: linear-gradient(to bottom, #3A3A3A 0%, #1a1a1a 70%, #000 100%);
  border-radius: 0 0 50% 50%;
  clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
}

.ink-drop {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, #2a2a2a 0%, #1a1a1a 100%);
  border-radius: 50%;
  animation: inkFall 1.5s ease-in forwards;
}

@keyframes inkFall {
  0% { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
  70% { transform: translateX(-50%) translateY(15px) scale(1); opacity: 1; }
  100% { transform: translateX(-50%) translateY(18px) scale(2.5, 0.5); opacity: 0; }
}

.ink-splatter {
  position: absolute;
  background: rgba(40, 40, 40, 0.4);
  border-radius: 50%;
  animation: splatterPulse 3s ease-in-out infinite;
}

@keyframes splatterPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

.scroll-book {
  position: relative;
  width: 260px;
  min-height: 300px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(250, 248, 243, 0.88) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 4px 16px 16px 4px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    inset 0 -1px 0 rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  animation: bookBreathe 4s ease-in-out infinite, bookEnter 0.8s ease-out 0.4s both;
  overflow: hidden;
}

.night-mode .scroll-book {
  background: linear-gradient(135deg, rgba(45, 40, 35, 0.95) 0%, rgba(35, 30, 25, 0.92) 100%);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 0 60px rgba(200, 180, 150, 0.05);
}

@keyframes bookBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.008); }
}

@keyframes bookEnter {
  0% { opacity: 0; transform: scale(0.85) rotateY(-5deg); }
  100% { opacity: 1; transform: scale(1) rotateY(0); }
}

.book-hover {
  transform: perspective(800px) rotateX(2deg) translateY(-4px) scale(1.02);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 0 80px rgba(180, 160, 130, 0.08);
}

.book-expanded {
  width: 320px;
  min-height: 380px;
  border-radius: 4px 20px 20px 4px;
  animation: bookUnfold 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes bookUnfold {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

.paper-texture {
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.008) 2px,
      rgba(0, 0, 0, 0.008) 4px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.006) 2px,
      rgba(0, 0, 0, 0.006) 4px
    );
  opacity: 0.6;
  pointer-events: none;
  border-radius: inherit;
}

.book-content {
  position: relative;
  z-index: 2;
  padding: 36px 28px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: inherit;
}

.countdown-view {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.seal-area {
  position: relative;
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.seal-stamp {
  width: 36px;
  height: 36px;
  border: 2.5px solid #C41E3A;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: sealStamp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  box-shadow: 0 2px 8px rgba(196, 30, 58, 0.2), inset 0 0 8px rgba(196, 30, 58, 0.1);
  transform: rotate(-8deg);
}

@keyframes sealStamp {
  0% { transform: rotate(-8deg) scale(0) translateY(-20px); opacity: 0; }
  60% { transform: rotate(-8deg) scale(1.15) translateY(2px); opacity: 1; }
  100% { transform: rotate(-8deg) scale(1) translateY(0); opacity: 1; }
}

.seal-text {
  color: #C41E3A;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
}

.countdown-number {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 8px 0;
}

.digit {
  font-size: clamp(3rem, 10vw, 4.5rem);
  font-weight: 300;
  color: #2C3E3A;
  line-height: 1;
  letter-spacing: -2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: color 0.3s ease;
}

.night-mode .digit {
  color: #E8E0D5;
  text-shadow: 0 2px 8px rgba(200, 180, 150, 0.15);
}

.unit {
  font-size: 1.1rem;
  font-weight: 400;
  color: #6B7C78;
  letter-spacing: 4px;
}

.sub-text {
  font-size: 0.95rem;
  font-weight: 400;
  color: #7A8A85;
  letter-spacing: 3px;
  margin: 0;
  opacity: 0.9;
}

.hint-text {
  font-size: 0.78rem;
  color: #A0ADA8;
  letter-spacing: 2px;
  margin: 16px 0 0;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.scroll-book:hover .hint-text {
  opacity: 1;
}

.milestone-list {
  width: 100%;
  text-align: left;
}

.list-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #3A4A45;
  text-align: center;
  margin: 0 0 20px;
  letter-spacing: 3px;
  opacity: 0.9;
}

.night-mode .list-title {
  color: #D0C8BC;
}

.milestone-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.milestone-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  transition: all 0.4s ease;
  animation: itemSlideIn 0.5s ease-out both;
  opacity: 0;
  transform: translateX(-10px);
}

@keyframes itemSlideIn {
  to { opacity: 1; transform: translateX(0); }
}

.milestone-item:hover {
  background: rgba(139, 154, 125, 0.06);
}

.milestone-item.completed {
  opacity: 0.7;
}

.milestone-item.completed .milestone-name {
  color: #5A6A65;
  text-decoration: line-through;
  text-decoration-color: rgba(139, 154, 125, 0.3);
}

.milestone-item.current {
  background: rgba(139, 154, 125, 0.08);
  border-left: 2px solid #8B9A7D;
}

.milestone-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #8B9A7D;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #C0CCC5;
  display: block;
}

.milestone-name {
  flex: 1;
  font-size: 0.88rem;
  color: #3A4A45;
  letter-spacing: 0.5px;
  transition: all 0.4s ease-in-out;
  line-height: 1.5;
}

.night-mode .milestone-name {
  color: #C8C0B5;
}

.milestone-name.ink-soak {
  color: #1a2a25;
  font-weight: 500;
  text-shadow: 0 0 8px rgba(26, 42, 37, 0.1);
}

.milestone-status {
  font-size: 0.75rem;
  color: #9AA89F;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.list-footer {
  margin-top: 20px;
  text-align: center;
  opacity: 0.6;
}

.footer-line {
  display: block;
  width: 60%;
  height: 1px;
  background: linear-gradient(to right, transparent, #C0CCC5, transparent);
  margin: 0 auto 12px;
}

.footer-text {
  font-size: 0.82rem;
  color: #8A9A93;
  letter-spacing: 2px;
  margin: 0;
}

.scroll-edge {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 12px;
  background: linear-gradient(
    to bottom,
    rgba(200, 190, 170, 0.3) 0%,
    rgba(220, 210, 190, 0.2) 50%,
    rgba(200, 190, 170, 0.3) 100%
  );
  z-index: 3;
}

.left-edge {
  left: 0;
  border-radius: 4px 0 0 4px;
  box-shadow: inset -2px 0 4px rgba(0, 0, 0, 0.04);
}

.right-edge {
  right: 0;
  border-radius: 0 16px 16px 0;
  box-shadow: inset 2px 0 4px rgba(0, 0, 0, 0.04);
}

.desk-base {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 65px;
  z-index: 5;
  animation: deskSlideUp 0.7s ease-out 0.2s both;
  overflow: hidden;
}

@keyframes deskSlideUp {
  0% { transform: translateY(30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.desk-texture {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, #3A3D38 0%, #2F322E 100%);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
}

.desk-texture::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 80px,
      rgba(0, 0, 0, 0.03) 80px,
      rgba(0, 0, 0, 0.03) 81px
    );
  opacity: 0.8;
}

.scattered-papers {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.paper-piece {
  position: absolute;
  width: 45px;
  height: 32px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 1px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.spirit-hint {
  position: absolute;
  bottom: 72px;
  right: 20px;
  z-index: 20;
  max-width: 160px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 8px;
  font-size: 0.78rem;
  color: #5A6A65;
  letter-spacing: 1px;
  line-height: 1.6;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.night-mode .spirit-hint {
  background: rgba(40, 35, 30, 0.8);
  color: #B0A898;
  border-color: rgba(200, 180, 150, 0.1);
}

.completion-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid rgba(196, 30, 58, 0.3);
  animation: rippleSpread 1.5s ease-out forwards;
  pointer-events: none;
  z-index: 25;
}

@keyframes rippleSpread {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.97);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.97);
}

.hint-fade-enter-active,
.hint-fade-leave-active {
  transition: all 0.8s ease;
}

.hint-fade-enter-from,
.hint-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.ripple-fade-enter-active,
.ripple-fade-leave-active {
  transition: opacity 0.3s ease;
}

.ripple-fade-enter-from,
.ripple-fade-leave-to {
  opacity: 0;
}

@media (max-width: 420px) {
  .jinshu-container {
    max-width: 100%;
    border-radius: 12px;
  }

  .main-stage {
    padding: 35px 20px 75px;
  }

  .scroll-book {
    width: 230px;
    min-height: 270px;
  }

  .book-expanded {
    width: 280px;
    min-height: 340px;
  }

  .ink-brush {
    left: 15px;
    transform: translateY(-50%) scale(0.85) rotate(-12deg);
  }

  .brush-active {
    transform: translateY(-50%) scale(0.9) rotate(-8deg);
  }

  .desk-base {
    height: 55px;
  }

  .spirit-hint {
    bottom: 62px;
    right: 12px;
    font-size: 0.72rem;
    padding: 6px 10px;
    max-width: 140px;
  }
}
</style>
