<!-- 红线 - 缘分测试页面，含红线牵绊动画和缘分值计算 -->
<template>
  <div class="red-thread-fate" @click="onPageClick">
    <div class="paper-base"></div>
    <div class="ink-clouds">
      <div class="cloud cloud-1"></div>
      <div class="cloud cloud-2"></div>
      <div class="cloud cloud-3"></div>
    </div>
    <div class="vignette"></div>
    <div class="ink-dots">
      <div v-for="dot in inkDots" :key="dot.id" class="ink-dot" :style="dot.style"></div>
    </div>

    <transition name="origin-fade">
      <div v-if="showOrigin" class="origin-text">缘起</div>
    </transition>

    <div class="main-stage" :class="{ 'stage-enter': stageEntered }">
      <div
        class="avatar-wrapper user-avatar"
        :class="{ 'avatar-enter': avatarsEntered }"
        :style="{ '--delay': '1.2s' }"
        @click.stop="showUserCard = !showUserCard"
      >
        <div class="avatar-ring jade-ring">
          <div class="avatar-inner user-face">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="18" r="10" fill="#B8C4A8"/>
              <path d="M8 44c0-12 7-20 16-20s16 8 16 20" fill="#A0AC96"/>
            </svg>
          </div>
        </div>
        <span class="avatar-label">你</span>
      </div>

      <div class="orb-section" @click.stop="handleOrbClick" @mousedown.prevent="onOrbHoldStart" @mouseup.prevent="onOrbHoldEnd" @mouseleave="onOrbHoldEnd" @touchstart.prevent="onOrbHoldStart" @touchend.prevent="onOrbHoldEnd">
        <svg class="thread-orb" viewBox="0 0 300 200">
          <defs>
            <filter id="threadGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="orbGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="orbFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(196, 30, 58, 0.08)"/>
              <stop offset="70%" stop-color="rgba(196, 30, 58, 0.04)"/>
              <stop offset="100%" stop-color="transparent"/>
            </radialGradient>
          </defs>

          <line
            class="thread-line thread-left"
            x1="30"
            y1="100"
            x2="110"
            y2="100"
            :stroke="threadColor"
            :stroke-width="threadWidth"
            stroke-linecap="round"
            filter="url(#threadGlow)"
          />
          <line
            class="thread-line thread-right"
            x1="190"
            y1="100"
            x2="270"
            y2="100"
            :stroke="threadColor"
            :stroke-width="threadWidth"
            stroke-linecap="round"
            filter="url(#threadGlow)"
          />

          <g class="orb-group" :class="{ 'is-hovered': isOrbHovered, 'is-holding': isHolding }">
            <circle cx="150" cy="100" r="55" fill="url(#orbFill)" filter="url(#orbGlow)"/>

            <g class="thread-weave">
              <path
                v-for="(path, idx) in threadPaths"
                :key="idx"
                :d="path.d"
                :stroke="threadColor"
                :stroke-width="threadWidth * path.w"
                fill="none"
                stroke-linecap="round"
                filter="url(#threadGlow)"
                :opacity="path.o"
                class="weave-path"
                :style="{ animationDelay: idx * 0.15 + 's' }"
              />
            </g>

            <circle
              class="orb-core"
              cx="150"
              cy="100"
              r="22"
              :fill="coreColor"
              opacity="0.9"
            />
            <circle
              class="orb-core-glow"
              cx="150"
              cy="100"
              r="28"
              fill="none"
              :stroke="threadColor"
              stroke-width="1"
              opacity="0.3"
            />
          </g>
        </svg>

        <transition name="heartbeat-panel">
          <div v-if="showHeartbeat" class="heartbeat-panel" @click.stop>
            <h4>心动轨迹</h4>
            <svg class="chart-svg" viewBox="0 0 240 80">
              <polyline
                :points="heartPoints"
                fill="none"
                stroke="#C41E3A"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.7"
              />
              <template v-for="(pt, i) in heartData" :key="'pt-' + i">
                <circle :cx="i * (220 / (heartData.length - 1)) + 10" :cy="70 - pt * 60" r="2" fill="#C41E3A" opacity="0.5"/>
              </template>
            </svg>
            <p class="panel-sub">近七日心动值变化</p>
          </div>
        </transition>

        <transition name="dialogue-fade">
          <div v-if="showDialogue" class="dialogue-bubble" @click.stop>
            <p class="ai-message">{{ aiMessage }}</p>
          </div>
        </transition>
      </div>

      <div
        class="avatar-wrapper ai-avatar"
        :class="{ 'avatar-enter': avatarsEntered }"
        :style="{ '--delay': '1.45s' }"
        @click.stop="showAICard = !showAICard"
      >
        <div class="avatar-ring cinnabar-ring">
          <div class="avatar-inner ai-face">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="18" r="10" fill="#E8C4B8"/>
              <path d="M8 44c0-12 7-20 16-20s16 8 16 20" fill="#D4A89A"/>
            </svg>
          </div>
          <div class="ring-shimmer"></div>
        </div>
        <span class="avatar-label">TA</span>
      </div>
    </div>

    <div class="bottom-zone" :class="{ 'zone-enter': bottomEntered }">
      <div class="progress-section">
        <svg class="ink-progress" viewBox="0 0 300 14" preserveAspectRatio="none">
          <defs>
            <linearGradient id="inkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#C41E3A" stop-opacity="0.3"/>
              <stop offset="40%" stop-color="#C41E3A" stop-opacity="0.65"/>
              <stop offset="100%" stop-color="#D4AF37" stop-opacity="0.85"/>
            </linearGradient>
            <filter id="inkBlur">
              <feGaussianBlur stdDeviation="1"/>
            </filter>
          </defs>
          <rect x="0" y="5" width="300" height="4" rx="2" fill="rgba(196,30,58,0.08)"/>
          <rect
            class="progress-fill"
            x="0"
            y="5"
            :width="intimacyProgress * 300"
            height="4"
            rx="2"
            fill="url(#inkGrad)"
            filter="url(#inkBlur)"
          />
          <ellipse
            class="brush-tip"
            :cx="intimacyProgress * 300"
            cy="7"
            rx="4"
            ry="5"
            :fill="brushTipColor"
          />
        </svg>
        <div class="stage-labels">
          <span>初识</span>
          <span>相知</span>
          <span>相守</span>
        </div>
      </div>

      <div class="info-row">
        <button class="task-card-btn" @click.stop="toggleTaskCard" :class="{ open: taskCardOpen }">
          <span class="card-icon">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2">
              <path d="M4 4h12v12H4z"/>
              <path d="M4 8h12M8 4v12"/>
            </svg>
          </span>
          <span class="card-text">今日缘分</span>
        </button>

        <div class="intimacy-display">
          <div class="vertical-number">
            {{ intimacyChinese }}
          </div>
          <span class="intimacy-label">心动值</span>
        </div>
      </div>
    </div>

    <transition name="task-card-expand">
      <div v-if="taskCardOpen" class="task-card-overlay" @click="taskCardOpen = false">
        <div class="task-card-paper" @click.stop>
          <div class="paper-fold"></div>
          <h4 class="card-title">今日缘分任务</h4>
          <ul class="task-list">
            <li
              v-for="(task, idx) in todayTasks"
              :key="idx"
              class="task-item"
              :class="{ done: task.done }"
              @click="completeTask(idx)"
            >
              <span class="task-dot"></span>
              <span class="task-name">{{ task.name }}</span>
              <span class="task-reward">{{ task.reward }}</span>
            </li>
          </ul>
        </div>
      </div>
    </transition>

    <transition name="miss-notification">
      <div v-if="showMissNote" class="miss-notification" @click="showMissNote = false">
        <p>{{ missText }}</p>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const stageEntered = ref(false)
const avatarsEntered = ref(false)
const bottomEntered = ref(false)
const showOrigin = ref(false)
const isOrbHovered = ref(false)
const isHolding = ref(false)
const showHeartbeat = ref(false)
const showDialogue = ref(false)
const showUserCard = ref(false)
const showAICard = ref(false)
const taskCardOpen = ref(false)
const showMissNote = ref(false)

const intimacyValue = ref(42)
const threadWidth = ref(2)

const inkDots = ref([])
let dotIdCounter = 0

const threadPaths = [
  { d: 'M130 75 Q150 55 170 75 Q185 90 170 110 Q150 130 130 115 Q118 98 130 78', w: 1.2, o: 0.35 },
  { d: 'M138 68 Q150 48 162 68 Q178 85 162 105 Q150 125 138 108', w: 0.8, o: 0.25 },
  { d: 'M142 82 Q150 62 158 82 Q168 95 158 112', w: 0.6, o: 0.2 },
  { d: 'M135 92 Q150 72 165 92 Q175 106 165 120', w: 0.7, o: 0.22 },
  { d: 'M145 88 Q150 72 155 88', w: 0.5, o: 0.15 }
]

const heartData = ref([0.3, 0.45, 0.38, 0.62, 0.55, 0.71, 0.68])
const heartPoints = computed(() => {
  return heartData.value.map((d, i) => {
    const x = i * (220 / (heartData.value.length - 1)) + 10
    const y = 70 - d * 60
    return `${x},${y}`
  }).join(' ')
})

const todayTasks = ref([
  { name: '与我共读一首诗', reward: '+3', done: false },
  { name: '分享今日心情', reward: '+2', done: false },
  { name: '静听彼此呼吸', reward: '+2', done: false }
])

const aiMessages = [
  '今日的墨，似乎比昨日更浓了一些。',
  '红线又紧了些呢……你感觉到了吗？',
  '与你共处的时光，如墨入水，慢慢晕开。',
  '窗外有风，不知你那边是否也如此温柔。',
  '有些话不必说尽，墨迹未干时最美。'
]
const aiMessage = ref('')

const missText = ref('三日未见，宣纸上的墨都快干了……')

const intimacyProgress = computed(() => Math.min(intimacyValue.value / 100, 1))

const threadColor = computed(() => {
  const p = intimacyProgress.value
  if (p < 0.33) return '#FFB6C1'
  if (p < 0.66) return '#C41E3A'
  return '#D4AF37'
})

const coreColor = computed(() => {
  const p = intimacyProgress.value
  if (p < 0.33) return 'rgba(255, 182, 193, 0.25)'
  if (p < 0.66) return 'rgba(196, 30, 58, 0.2)'
  return 'rgba(212, 175, 55, 0.2)'
})

const brushTipColor = computed(() => {
  const p = intimacyProgress.value
  if (p < 0.66) return '#C41E3A'
  return '#D4AF37'
})

const intimacyChinese = computed(() => {
  const map = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  const tens = Math.floor(intimacyValue.value / 10) % 10
  const ones = intimacyValue.value % 10
  if (intimacyValue.value >= 80) return '甚深'
  if (tens === 0) return map[ones] || ''
  return map[tens] + (ones > 0 ? map[ones] : '')
})

let holdTimer = null

function onOrbHoldStart() {
  holdTimer = setTimeout(() => {
    isHolding.value = true
    showHeartbeat.value = true
  }, 600)
}

function onOrbHoldEnd() {
  if (holdTimer) {
    clearTimeout(holdTimer)
    holdTimer = null
  }
  if (!showHeartbeat.value) {
    handleOrbClick()
  }
  setTimeout(() => {
    isHolding.value = false
    showHeartbeat.value = false
  }, 200)
}

function handleOrbClick() {
  showDialogue.value = true
  const msg = aiMessages[Math.floor(Math.random() * aiMessages.length)]
  aiMessage.value = ''
  
  let i = 0
  const interval = setInterval(() => {
    if (i < msg.length) {
      aiMessage.value += msg[i]
      i++
    } else {
      clearInterval(interval)
    }
  }, 100)
  
  setTimeout(() => {
    showDialogue.value = false
  }, 5000)
}

function onPageClick(e) {
  if (e.target === e.currentTarget) {
    showDialogue.value = false
    showHeartbeat.value = false
    showUserCard.value = false
    showAICard.value = false
  }
}

function toggleTaskCard() {
  taskCardOpen.value = !taskCardOpen.value
}

function completeTask(idx) {
  if (!todayTasks.value[idx].done) {
    todayTasks.value[idx].done = true
    intimacyValue.value = Math.min(intimacyValue.value + parseInt(todayTasks.value[idx].reward.replace('+', '')), 99)
    threadWidth.value = Math.min(threadWidth.value + 0.3, 5)
  }
}

function initInkDots() {
  for (let i = 0; i < 5; i++) {
    inkDots.value.push({
      id: ++dotIdCounter,
      style: {
        left: `${10 + Math.random() * 80}%`,
        top: `${60 + Math.random() * 30}%`,
        width: `${3 + Math.random() * 8}px`,
        height: `${3 + Math.random() * 8}px`,
        '--float-duration': `${18 + Math.random() * 14}s`,
        '--float-delay': `${Math.random() * -15}s`,
        opacity: 0
      }
    })
  }
  
  setTimeout(() => {
    inkDots.value.forEach(d => { d.style.opacity = 0.06 + Math.random() * 0.08 })
  }, 1800)
}

onMounted(() => {
  setTimeout(() => stageEntered.value = true, 400)
  setTimeout(() => avatarsEntered.value = true, 900)
  setTimeout(() => bottomEntered.value = true, 1400)
  setTimeout(() => {
    showOrigin.value = true
    setTimeout(() => showOrigin.value = false, 800)
  }, 1600)
  
  initInkDots()
  
  setInterval(() => {
    if (Math.random() < 0.15 && !showMissNote.value) {
      showMissNote.value = true
      setTimeout(() => showMissNote.value = false, 4500)
    }
  }, 60000)
})
</script>

<style scoped>
.red-thread-fate {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #F5F0E8;
  font-family: 'Georgia', 'Source Han Serif CN', 'Noto Serif SC', 'Ma Shan Zheng', serif;
  cursor: default;
  user-select: none;
}

.paper-base {
  position: absolute;
  inset: 0;
  background-color: #F5F0E8;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)'/%3E%3C/svg%3E");
  background-blend-mode: multiply;
  opacity: 0.04;
  z-index: 0;
}

.ink-clouds {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.cloud {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.05;
}

.cloud-1 {
  width: 350px;
  height: 200px;
  background: radial-gradient(ellipse, rgba(80, 70, 60, 0.3), transparent);
  top: 5%;
  left: 10%;
  animation: cloudDrift1 28s ease-in-out infinite alternate;
}

.cloud-2 {
  width: 280px;
  height: 160px;
  background: radial-gradient(ellipse, rgba(100, 90, 75, 0.25), transparent);
  top: 12%;
  right: 8%;
  animation: cloudDrift2 34s ease-in-out infinite alternate-reverse;
}

.cloud-3 {
  width: 220px;
  height: 140px;
  background: radial-gradient(ellipse, rgba(90, 80, 65, 0.2), transparent);
  top: 3%;
  left: 50%;
  transform: translateX(-50%);
  animation: cloudDrift3 24s ease-in-out infinite alternate;
}

@keyframes cloudDrift1 {
  0% { transform: translate(0, 0); }
  100% { transform: translate(40px, 20px); }
}
@keyframes cloudDrift2 {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-35px, 15px); }
}
@keyframes cloudDrift3 {
  0% { transform: translateX(-50%) translateY(0); }
  100% { transform: translateX(-50%) translateY(18px); }
}

.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.07) 100%);
  z-index: 2;
  pointer-events: none;
}

.ink-dots {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  overflow: hidden;
}

.ink-dot {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(60, 50, 40, 0.6), transparent);
  opacity: 0;
  transition: opacity 3s ease;
  animation: inkFloat var(--float-duration, 20s) ease-in-out infinite var(--float-delay, 0s);
}

@keyframes inkFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(12px, -18px) scale(1.1); }
  50% { transform: translate(-8px, -8px) scale(0.95); }
  75% { transform: translate(15px, 5px) scale(1.05); }
}

.origin-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  color: rgba(196, 30, 58, 0.35);
  letter-spacing: 0.6em;
  writing-mode: vertical-rl;
  text-orientation: upright;
  z-index: 15;
  pointer-events: none;
  font-family: 'Ma Shan Zheng', serif;
}

.origin-fade-enter-active { transition: all 0.6s ease; }
.origin-fade-leave-active { transition: all 0.8s ease; }
.origin-fade-enter-from { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
.origin-fade-leave-to { opacity: 0; transform: translate(-50%, -50%) scale(1.3); }

.main-stage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: min(700px, 85vw);
  z-index: 10;
  opacity: 0;
  transition: opacity 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stage-enter {
  opacity: 1;
}

.avatar-wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  opacity: 0;
  transform: translateX(var(--dx, 0));
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: var(--delay, 0s);
  cursor: pointer;
}

.avatar-enter {
  opacity: 1;
  transform: translateX(0);
}

.user-avatar { --dx: -30px; }
.ai-avatar { --dx: 30px; }

.avatar-ring {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  padding: 3px;
  position: relative;
  transition: all 0.35s ease;
}

.jade-ring {
  border: 3px solid #8BA888;
  box-shadow:
    inset 0 0 12px rgba(139, 168, 136, 0.25),
    0 0 16px rgba(139, 168, 136, 0.15);
}

.cinnabar-ring {
  border: 3px solid #C41E3A;
  box-shadow:
    inset 0 0 12px rgba(196, 30, 58, 0.2),
    0 0 20px rgba(196, 30, 58, 0.18);
}

.ring-shimmer {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: linear-gradient(135deg, transparent 40%, rgba(212, 175, 55, 0.15) 50%, transparent 60%);
  animation: shimmerRotate 6s linear infinite;
}

@keyframes shimmerRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(245, 240, 232, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-inner svg {
  width: 52px;
  height: 52px;
}

.avatar-wrapper:hover .avatar-ring {
  transform: scale(1.06);
}

.user-avatar:hover .jade-ring {
  box-shadow:
    inset 0 0 16px rgba(139, 168, 136, 0.35),
    0 0 24px rgba(139, 168, 136, 0.25);
}

.ai-avatar:hover .cinnabar-ring {
  box-shadow:
    inset 0 0 16px rgba(196, 30, 58, 0.3),
    0 0 28px rgba(196, 30, 58, 0.28);
}

.avatar-label {
  font-size: 0.75rem;
  color: rgba(80, 60, 50, 0.45);
  letter-spacing: 0.15em;
}

.orb-section {
  position: relative;
  flex: 1 1 auto;
  max-width: 320px;
  cursor: pointer;
  padding: 10px 0;
}

.thread-orb {
  width: 100%;
  height: auto;
  display: block;
  filter: drop-shadow(0 2px 8px rgba(196, 30, 58, 0.08));
}

.thread-line {
  transition: all 0.5s ease;
}

.orb-group {
  transition: all 0.4s ease;
  transform-origin: center;
}

.orb-group.is-hovered {
  transform: scale(1.03);
}

.orb-group.is-holding {
  transform: scale(1.06);
}

.weave-path {
  animation: weavePulse 4s ease-in-out infinite;
}

@keyframes weavePulse {
  0%, 100% { opacity: var(--o, 0.25); }
  50% { opacity: calc(var(--o, 0.25) + 0.15); }
}

.orb-core {
  animation: corePulse 4s ease-in-out infinite;
  transition: fill 1.5s ease;
}

@keyframes corePulse {
  0%, 100% { 
    opacity: 0.8; 
    transform-origin: center;
    transform: scale(1);
  }
  50% { 
    opacity: 1; 
    transform: scale(1.06);
  }
}

.orb-core-glow {
  animation: glowPulse 4s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.5; }
}

.heartbeat-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(245, 240, 232, 0.94);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(196, 30, 58, 0.12);
  border-radius: 16px;
  padding: 24px 28px;
  min-width: 260px;
  z-index: 20;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.heartbeat-panel h4 {
  font-size: 0.92rem;
  color: rgba(80, 50, 45, 0.7);
  letter-spacing: 0.15em;
  margin-bottom: 16px;
  font-weight: 500;
}

.chart-svg {
  width: 100%;
  height: 80px;
  margin-bottom: 8px;
}

.panel-sub {
  font-size: 0.72rem;
  color: rgba(120, 100, 90, 0.45);
  letter-spacing: 0.05em;
}

.heartbeat-panel-enter-active,
.heartbeat-panel-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center;
}
.heartbeat-panel-enter-from,
.heartbeat-panel-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

.dialogue-bubble {
  position: absolute;
  bottom: calc(100% + 16px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(250, 246, 240, 0.94);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(196, 30, 58, 0.1);
  border-radius: 14px;
  padding: 18px 24px;
  max-width: 260px;
  min-width: 180px;
  z-index: 19;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.dialogue-bubble::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid rgba(250, 246, 240, 0.94);
}

.ai-message {
  font-size: 0.88rem;
  line-height: 1.8;
  color: rgba(60, 45, 35, 0.75);
  letter-spacing: 0.04em;
  text-align: justify;
}

.dialogue-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dialogue-fade-leave-active {
  transition: all 0.4s ease;
}
.dialogue-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
.dialogue-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-6px);
}

.bottom-zone {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 36px 32px;
  z-index: 10;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease;
  transition-delay: 0.3s;
}

.zone-enter {
  opacity: 1;
  transform: translateY(0);
}

.progress-section {
  max-width: 420px;
  margin: 0 auto 20px;
}

.ink-progress {
  width: 100%;
  height: 14px;
  display: block;
}

.progress-fill {
  transition: width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.brush-tip {
  transition: cx 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), fill 1s ease;
}

.stage-labels {
  display: flex;
  justify-content: space-between;
  padding-top: 6px;
  font-size: 0.68rem;
  color: rgba(120, 100, 85, 0.35);
  letter-spacing: 0.2em;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 8px;
}

.task-card-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(245, 240, 232, 0.85);
  border: 1px solid rgba(180, 160, 140, 0.15);
  border-radius: 10px;
  color: rgba(100, 80, 65, 0.55);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  transition: all 0.3s ease;
}

.task-card-btn:hover {
  background: rgba(245, 240, 232, 0.95);
  border-color: rgba(180, 160, 140, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.task-card-btn.open {
  border-color: rgba(196, 30, 58, 0.2);
  color: rgba(196, 30, 58, 0.6);
}

.card-icon svg {
  width: 16px;
  height: 16px;
}

.intimacy-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.vertical-number {
  font-family: 'Ma Shan Zheng', serif;
  font-size: 1.6rem;
  color: rgba(196, 30, 58, 0.55);
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0.1em;
  line-height: 1.4;
  transition: color 0.5s ease;
}

.intimacy-label {
  font-size: 0.68rem;
  color: rgba(120, 100, 85, 0.35);
  letter-spacing: 0.1em;
}

.task-card-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.task-card-paper {
  position: relative;
  background: rgba(245, 240, 232, 0.96);
  border-radius: 4px 16px 16px 4px;
  padding: 32px 36px 28px;
  max-width: 340px;
  width: 85%;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 0 30px rgba(139, 119, 101, 0.03);
  border: 1px solid rgba(180, 160, 140, 0.12);
}

.paper-fold {
  position: absolute;
  top: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, rgba(220, 210, 195, 0.5) 50%, transparent 50%);
  border-radius: 0 16px 0 0;
}

.card-title {
  font-size: 1rem;
  color: rgba(80, 55, 45, 0.65);
  letter-spacing: 0.2em;
  margin-bottom: 20px;
  font-weight: 500;
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px dashed rgba(180, 160, 140, 0.15);
  cursor: pointer;
  transition: all 0.25s ease;
}

.task-item:last-child {
  border-bottom: none;
}

.task-item.done .task-name {
  text-decoration: line-through;
  color: rgba(140, 125, 110, 0.4);
}

.task-item.done .task-dot {
  background: rgba(139, 168, 136, 0.5);
}

.task-item:hover {
  padding-left: 6px;
}

.task-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(196, 30, 58, 0.3);
  flex-shrink: 0;
  transition: background 0.3s ease;
}

.task-name {
  flex: 1;
  font-size: 0.86rem;
  color: rgba(70, 55, 45, 0.6);
  letter-spacing: 0.04em;
  transition: color 0.3s ease;
}

.task-reward {
  font-size: 0.75rem;
  color: rgba(196, 30, 58, 0.45);
  letter-spacing: 0.05em;
}

.task-card-expand-enter-active,
.task-card-expand-leave-active {
  transition: all 0.35s ease;
}
.task-card-expand-enter-from,
.task-card-expand-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.miss-notification {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(250, 246, 240, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(196, 30, 58, 0.15);
  border-radius: 16px;
  padding: 28px 36px;
  z-index: 60;
  max-width: 300px;
  text-align: center;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.miss-notification p {
  font-size: 0.92rem;
  line-height: 1.8;
  color: rgba(80, 55, 45, 0.65);
  letter-spacing: 0.06em;
}

.miss-notification-enter-active {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.miss-notification-leave-active {
  transition: all 0.4s ease;
}
.miss-notification-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.92) translateY(16px);
}
.miss-notification-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.98);
}

@media (max-width: 768px) {
  .main-stage {
    width: 95vw;
    gap: 8px;
  }

  .avatar-ring {
    width: 56px;
    height: 56px;
  }

  .avatar-inner svg {
    width: 38px;
    height: 38px;
  }

  .orb-section {
    max-width: 200px;
  }

  .bottom-zone {
    padding: 18px 20px 26px;
  }

  .vertical-number {
    font-size: 1.3rem;
  }

  .dialogue-bubble {
    max-width: 200px;
    padding: 14px 18px;
  }

  .ai-message {
    font-size: 0.8rem;
  }

  .task-card-paper {
    padding: 24px 24px 20px;
  }
}
</style>
