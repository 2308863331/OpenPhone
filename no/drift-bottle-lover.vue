<!-- 漂流瓶 - 海洋主题漂流瓶页面，含海浪动画和瓶中信交互 -->
<template>
  <div class="drift-bottle-scene" :class="{ 'scene-entered': sceneEntered }">
    <svg width="0" height="0" style="position:absolute">
      <defs>
        <linearGradient id="coralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f08080"/>
          <stop offset="100%" stop-color="#fadadd"/>
        </linearGradient>
        <linearGradient id="coralGradientActive" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e06868"/>
          <stop offset="100%" stop-color="#f5c6c6"/>
        </linearGradient>
      </defs>
    </svg>
    <div class="sky-layer"></div>
    
    <div class="distant-layer">
      <svg class="sail-silhouette" viewBox="0 0 200 100" preserveAspectRatio="xMidYMax meet">
        <path d="M60 95 L60 35 L95 55 Z" fill="rgba(255,255,255,0.06)" />
        <path d="M60 95 L60 55 L40 70 Z" fill="rgba(255,255,255,0.04)" />
        <line x1="60" y1="25" x2="60" y2="98" stroke="rgba(255,255,255,0.08)" stroke-width="1.2" />
        <path d="M140 96 Q142 88 145 86 Q148 88 150 96" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.8" />
      </svg>
      <div class="horizon-line"></div>
    </div>

    <div class="wave-layer wave-far">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path class="wave-path wave-path-1" d="M0,60 C240,20 480,100 720,60 C960,20 1200,100 1440,60 L1440,120 L0,120 Z" />
        <path class="wave-path wave-path-2" d="M0,70 C240,110 480,30 720,70 C960,110 1200,30 1440,70 L1440,120 L0,120 Z" />
      </svg>
    </div>

    <div class="main-stage">
      <div 
        class="glass-bottle" 
        :class="{ shaking: isShaking, floating: !isShaking }"
        @dblclick="catchNewBottle"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @mousedown="onMouseDown"
        @mousemove="onMouseMoveBottle"
        @mouseup="onMouseUpBottle"
        :style="bottleTransform"
      >
        <div class="bottle-body">
          <div class="bottle-glass"></div>
          <div class="bottle-highlight"></div>
          <div class="bottle-rim"></div>
          <div class="bottle-neck"></div>
          <div class="bottle-reflection"></div>
          
          <div class="fragment-container">
            <span 
              v-for="(frag, idx) in currentFragments" 
              :key="'frag-' + idx"
              class="soul-fragment"
              :style="fragmentStyle(idx)"
            >{{ frag }}</span>
          </div>
          
          <div class="inner-glow" :class="{ pulsing: sceneEntered }"></div>
        </div>
        
        <div class="splash-particles" v-if="showSplash">
          <div v-for="i in 8" :key="'splash-' + i" class="splash-drop" :style="splashStyle(i)"></div>
        </div>
      </div>
      
      <transition name="paper-unfold">
        <div class="paper-strip" v-if="showPaper" :key="paperKey">
          <div class="paper-content">
            <p class="paper-text">{{ currentMessage }}</p>
            <div class="paper-drops">
              <span class="water-drop" v-for="d in 3" :key="'drop-' + d"></span>
            </div>
          </div>
          <div class="paper-shadow"></div>
        </div>
      </transition>
    </div>

    <div class="wave-layer wave-near">
      <svg viewBox="0 0 1440 160" preserveAspectRatio="none">
        <path class="wave-path-near wave-near-1" d="M0,80 C180,40 360,120 540,80 C720,40 900,120 1080,80 C1260,40 1380,100 1440,80 L1440,160 L0,160 Z" />
        <path class="wave-path-near wave-near-2" d="M0,90 C180,130 360,50 540,90 C720,130 900,50 1080,90 C1260,130 1380,70 1440,90 L1440,160 L0,160 Z" />
      </svg>
    </div>

    <div class="sand-layer">
      <div class="sand-texture"></div>
      <div class="shells-container">
        <div 
          v-for="(shell, idx) in shells" 
          :key="'shell-' + idx"
          class="shell-item"
          :class="{ active: selectedShell === idx, opened: shellOpened === idx }"
          :style="{ '--shell-delay': (idx * 0.15) + 's', '--shell-x': shell.x }"
          @click="selectShell(idx)"
        >
          <svg class="shell-svg" viewBox="0 0 60 50">
            <path class="shell-path" :d="shell.path" />
            <path class="shell-inner" :d="shell.innerPath" />
          </svg>
          <transition name="shell-label">
            <span class="shell-label" v-if="shellOpened === idx">{{ shell.label }}</span>
          </transition>
        </div>
      </div>
    </div>

    <div class="mood-text" :class="{ visible: showMoodText }">
      <span class="mood-line">{{ moodPhrase }}</span>
    </div>

    <div class="interaction-hint" :class="{ visible: showHint && !isShaking }">
      <svg viewBox="0 0 24 24" class="hint-icon"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2zm0-10h2v8h-2z" fill="currentColor"/></svg>
      <span>双击打捞新瓶 · 长按摇晃</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

const sceneEntered = ref(false)
const isShaking = ref(false)
const showSplash = ref(false)
const showPaper = ref(false)
const paperKey = ref(0)
const showMoodText = ref(false)
const showHint = ref(true)
const selectedShell = ref(-1)
const shellOpened = ref(-1)

const shakeStartPos = reactive({ x: 0, y: 0 })
const shakeCurrentPos = reactive({ x: 0, y: 0 })
const isShakeHolding = ref(false)
let shakeTimer = null
let holdTimer = null

const moodPhrases = [
  '此时此刻，唯有海风与你',
  '每一只漂来的瓶子里，都装着一个刚好需要遇见你的灵魂',
  '慢下来，等一个未知的回音',
  '让心事交给大海，然后安静地等待',
  '你敢打开吗？'
]
const moodPhrase = ref(moodPhrases[0])

const personalities = [
  { label: '温柔型', fragments: ['柔软', '倾听', '治愈', '陪伴'], messages: ['今天的海风有点甜，像你笑起来的样子', '我在等风，也在等你', '想把这片海的声音寄给你'] },
  { label: '傲娇型', fragments: ['哼', '才不是', '随便', '笨蛋'], messages: ['才、才不是特意为你漂过来的呢！', '别误会，我只是刚好路过这片海域', '……好吧，其实我想见你了'] },
  { label: '神秘型', fragments: ['秘密', '星辰', '深渊', '谜题'], messages: ['你知道大海藏了多少个无人知晓的故事吗？', '有些话，只有潮汐能听懂', '我在时间的尽头等你，你来了吗？'] },
  { label: '活泼型', fragments: ['冲鸭', '超开心', '哈哈', '一起玩'], messages: ['嘿！被你捡到啦！运气不错嘛~', '今天也要元气满满哦！', '快快快！来看看我给你带了什么！'] },
  { label: '文艺型', fragments: ['诗行', '远方', '暮光', '笔尖'], messages: ['我把黄昏折成一只纸船，让它替我去见你', '所有的相遇都是久别重逢', '你是我读过最美的那首诗'] }
]

const currentPersonality = ref(personalities[0])
const currentFragments = computed(() => currentPersonality.value.fragments)
const currentMessage = ref('')

const shells = [
  { x: '15%', path: 'M30 45 Q30 25 15 20 Q5 18 8 28 Q10 38 20 42 Q28 46 30 45 Z', innerPath: 'M26 40 Q24 30 18 27 Q12 25 14 32 Q16 38 22 40 Z', label: '温柔型' },
  { x: '35%', path: 'M30 45 Q32 22 20 15 Q8 12 10 25 Q12 38 22 43 Q28 46 30 45 Z', innerPath: 'M26 39 Q26 28 19 23 Q13 21 15 29 Q17 36 23 39 Z', label: '傲娇型' },
  { x: '55%', path: 'M30 45 Q28 20 18 14 Q6 10 9 24 Q11 38 21 43 Q27 46 30 45 Z', innerPath: 'M25 38 Q24 27 17 22 Q11 19 14 28 Q16 35 22 38 Z', label: '神秘型' },
  { x: '75%', path: 'M30 46 Q34 24 22 16 Q10 13 11 26 Q13 39 23 44 Q28 47 30 46 Z', innerPath: 'M26 40 Q27 29 20 24 Q14 22 15 30 Q17 37 23 40 Z', label: '活泼型' },
  { x: '90%', path: 'M30 45 Q29 23 17 17 Q7 14 10 27 Q12 39 22 43 Q28 46 30 45 Z', innerPath: 'M25 38 Q25 28 18 23 Q12 20 14 29 Q16 36 23 38 Z', label: '文艺型' }
]

const bottleTransform = computed(() => {
  if (!isShaking.value) return {}
  const dx = (shakeCurrentPos.x - shakeStartPos.x) * 0.3
  const dy = (shakeCurrentPos.y - shakeStartPos.y) * 0.2
  return {
    transform: `rotate(${dx * 0.15}deg) translateX(${dx * 0.05}px)`
  }
})

function fragmentStyle(idx) {
  const angle = (idx / currentFragments.value.length) * Math.PI * 2
  const radius = 28 + Math.random() * 18
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  return {
    '--fx': x + 'px',
    '--fy': y + 'px',
    '--fdelay': (idx * 0.3 + Math.random() * 0.5) + 's',
    '--frot': ((Math.random() - 0.5) * 30) + 'deg'
  }
}

function splashStyle(i) {
  const angle = (i / 8) * Math.PI * 2
  const dist = 40 + Math.random() * 30
  return {
    '--sx': Math.cos(angle) * dist + 'px',
    '--sy': Math.sin(angle) * dist - 20 + 'px',
    '--sdelay': (i * 0.05) + 's'
  }
}

function catchNewBottle() {
  showSplash.value = true
  setTimeout(() => { showSplash.value = false }, 800)
  
  const newIdx = Math.floor(Math.random() * personalities.length)
  currentPersonality.value = personalities[newIdx]
  
  const msgs = currentPersonality.value.messages
  currentMessage.value = msgs[Math.floor(Math.random() * msgs.length)]
  
  paperKey.value++
  showPaper.value = false
  
  setTimeout(() => {
    showPaper.value = true
  }, 600)
  
  moodPhrase.value = moodPhrases[Math.floor(Math.random() * moodPhrases.length)]
}

function selectShell(idx) {
  if (selectedShell.value === idx) {
    shellOpened.value = shellOpened.value === idx ? -1 : idx
    if (shellOpened.value === idx) {
      currentPersonality.value = personalities[idx]
      const msgs = currentPersonality.value.messages
      currentMessage.value = msgs[Math.floor(Math.random() * msgs.length)]
      paperKey.value++
      showPaper.value = false
      setTimeout(() => { showPaper.value = true }, 400)
    }
  } else {
    selectedShell.value = idx
    shellOpened.value = -1
  }
}

function onTouchStart(e) {
  isShakeHolding.value = true
  const touch = e.touches[0]
  shakeStartPos.x = touch.clientX
  shakeStartPos.y = touch.clientY
  shakeCurrentPos.x = touch.clientX
  shakeCurrentPos.y = touch.clientY
  
  holdTimer = setTimeout(() => {
    isShaking.value = true
  }, 500)
}

function onTouchMove(e) {
  if (!isShakeHolding.value) return
  const touch = e.touches[0]
  shakeCurrentPos.x = touch.clientX
  shakeCurrentPos.y = touch.clientY
}

function onTouchEnd() {
  isShakeHolding.value = false
  clearTimeout(holdTimer)
  
  if (isShaking.value) {
    setTimeout(() => {
      isShaking.value = false
    }, 300)
  }
}

function onMouseDown(e) {
  isShakeHolding.value = true
  shakeStartPos.x = e.clientX
  shakeStartPos.y = e.clientY
  shakeCurrentPos.x = e.clientX
  shakeCurrentPos.y = e.clientY
  
  holdTimer = setTimeout(() => {
    isShaking.value = true
  }, 500)
}

function onMouseMoveBottle(e) {
  if (!isShakeHolding.value) return
  shakeCurrentPos.x = e.clientX
  shakeCurrentPos.y = e.clientY
}

function onMouseUpBottle() {
  isShakeHolding.value = false
  clearTimeout(holdTimer)
  
  if (isShaking.value) {
    setTimeout(() => {
      isShaking.value = false
    }, 300)
  }
}

onMounted(() => {
  setTimeout(() => {
    sceneEntered.value = true
  }, 100)
  
  setTimeout(() => {
    showMoodText.value = true
  }, 2200)
  
  setTimeout(() => {
    currentMessage.value = currentPersonality.value.messages[0]
    showPaper.value = true
  }, 2600)
  
  setTimeout(() => {
    showHint.value = true
  }, 4000)
})

onBeforeUnmount(() => {
  clearTimeout(holdTimer)
  clearTimeout(shakeTimer)
})
</script>

<style scoped>
.drift-bottle-scene {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: transparent;
}

.sky-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    to bottom,
    #ffd6e0 0%,
    #ffb8a0 35%,
    #f0a080 60%,
    #e8d5e7 100%
  );
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
}

.scene-entered .sky-layer {
  opacity: 1;
}

.sky-layer::before {
  content: '';
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,200,120,0.25) 0%, transparent 70%);
  pointer-events: none;
}

.distant-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 42%;
  z-index: 1;
  pointer-events: none;
}

.sail-silhouette {
  position: absolute;
  top: 18%;
  right: 15%;
  width: 140px;
  height: 70px;
  opacity: 0;
  animation: sailFadeIn 2s ease-out 1.2s forwards;
}

@keyframes sailFadeIn {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

.horizon-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
}

.wave-layer {
  position: absolute;
  left: 0;
  width: 100%;
  pointer-events: none;
}

.wave-layer svg {
  display: block;
  width: 100%;
  height: 100%;
}

.wave-far {
  bottom: 38%;
  height: 120px;
  z-index: 2;
  opacity: 0;
  animation: waveRise 1s ease-out 0.8s forwards;
}

.wave-path {
  fill: #7ec8c8;
  opacity: 0.5;
}

.wave-path-1 {
  animation: waveMotionA 7s ease-in-out infinite;
}

.wave-path-2 {
  animation: waveMotionB 7s ease-in-out infinite;
  opacity: 0.35;
  margin-top: -120px;
}

@keyframes waveRise {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes waveMotionA {
  0%, 100% { d: path('M0,60 C240,20 480,100 720,60 C960,20 1200,100 1440,60 L1440,120 L0,120 Z'); }
  50% { d: path('M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z'); }
}

@keyframes waveMotionB {
  0%, 100% { d: path('M0,70 C240,110 480,30 720,70 C960,110 1200,30 1440,70 L1440,120 L0,120 Z'); }
  50% { d: path('M0,70 C240,30 480,110 720,70 C960,30 1200,110 1440,70 L1440,120 L0,120 Z'); }
}

.wave-near {
  bottom: 22%;
  height: 160px;
  z-index: 4;
  opacity: 0;
  animation: waveNearRise 1s ease-out 1.2s forwards;
}

.wave-path-near {
  fill: #89d4d4;
  opacity: 0.72;
}

.wave-near-1 {
  animation: waveNearA 5.5s ease-in-out infinite;
}

.wave-near-2 {
  animation: waveNearB 5.5s ease-in-out infinite;
  opacity: 0.5;
  margin-top: -160px;
}

@keyframes waveNearRise {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes waveNearA {
  0%, 100% { d: path('M0,80 C180,40 360,120 540,80 C720,40 900,120 1080,80 C1260,40 1380,100 1440,80 L1440,160 L0,160 Z'); }
  50% { d: path('M0,80 C180,120 360,40 540,80 C720,120 900,40 1080,80 C1260,120 1380,60 1440,80 L1440,160 L0,160 Z'); }
}

@keyframes waveNearB {
  0%, 100% { d: path('M0,90 C180,130 360,50 540,90 C720,130 900,50 1080,90 C1260,130 1380,70 1440,90 L1440,160 L0,160 Z'); }
  50% { d: path('M0,90 C180,50 360,130 540,90 C720,50 900,130 1080,90 C1260,50 1380,110 1440,90 L1440,160 L0,160 Z'); }
}

.main-stage {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 78%;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.glass-bottle {
  position: relative;
  width: 120px;
  height: 200px;
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.15s ease-out;
  opacity: 0;
  animation: bottleDriftIn 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.3s forwards;
}

@keyframes bottleDriftIn {
  from {
    opacity: 0;
    transform: translateX(120px) rotate(8deg);
  }
  to {
    opacity: 1;
    transform: translateX(0) rotate(0);
  }
}

.glass-bottle.floating {
  animation: bottleFloat 4.5s ease-in-out infinite, bottleDriftIn 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.3s forwards;
}

@keyframes bottleFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-6px) rotate(1.2deg); }
  75% { transform: translateY(4px) rotate(-0.8deg); }
}

.glass-bottle.shaking {
  animation: bottleShake 0.15s ease-in-out infinite;
}

@keyframes bottleShake {
  0%, 100% { transform: translateX(0) rotate(0); }
  25% { transform: translateX(-4px) rotate(-3deg); }
  75% { transform: translateX(4px) rotate(3deg); }
}

.bottle-body {
  position: relative;
  width: 100%;
  height: 100%;
}

.bottle-glass {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 90px;
  height: 150px;
  border-radius: 10px 10px 45px 45px;
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.2) 0%,
    rgba(255,255,255,0.06) 30%,
    rgba(255,255,255,0.1) 70%,
    rgba(255,255,255,0.15) 100%
  );
  border: 1.5px solid rgba(255,255,255,0.28);
  box-shadow:
    inset 2px 0 8px rgba(255,255,255,0.15),
    inset -2px 0 8px rgba(134,190,190,0.08),
    0 8px 32px rgba(134,190,190,0.15),
    0 2px 8px rgba(0,0,0,0.06);
  backdrop-filter: blur(2px);
  overflow: hidden;
}

.bottle-highlight {
  position: absolute;
  bottom: 15px;
  left: 12px;
  width: 18px;
  height: 100px;
  border-radius: 10px;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.35) 0%,
    rgba(255,255,255,0.08) 60%,
    transparent 100%
  );
  pointer-events: none;
}

.bottle-rim {
  position: absolute;
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
  width: 34px;
  height: 10px;
  border-radius: 4px 4px 0 0;
  border: 1.5px solid rgba(255,255,255,0.28);
  border-bottom: none;
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0.18),
    rgba(255,255,255,0.06)
  );
}

.bottle-neck {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 26px;
  height: 20px;
  border-radius: 3px 3px 0 0;
  border: 1.5px solid rgba(255,255,255,0.25);
  border-bottom: none;
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0.14),
    rgba(255,255,255,0.05)
  );
}

.bottle-reflection {
  position: absolute;
  bottom: 20px;
  right: 14px;
  width: 12px;
  height: 80px;
  border-radius: 8px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(255,255,255,0.08) 40%,
    rgba(255,255,255,0.12) 100%
  );
  transform: rotate(3deg);
  pointer-events: none;
}

.fragment-container {
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 110px;
  pointer-events: none;
}

.soul-fragment {
  position: absolute;
  left: 50%;
  top: 50%;
  font-size: 11px;
  color: #ffc857;
  text-shadow: 0 0 8px rgba(255,200,87,0.6), 0 0 16px rgba(255,200,87,0.3);
  white-space: nowrap;
  opacity: 0;
  animation: fragmentAppear 1.8s ease-out var(--fdelay, 0s) forwards;
  transform: translate(calc(-50% + var(--fx, 0px)), calc(-50% + var(--fy, 0px))) rotate(var(--frot, 0deg));
}

.scene-entered .soul-fragment {
  animation: fragmentAppear 1.8s ease-out var(--fdelay, 0s) forwards, fragmentFloat 3.5s ease-in-out infinite var(--fdelay, 0s);
}

@keyframes fragmentAppear {
  from { opacity: 0; transform: translate(calc(-50% + var(--fx, 0px)), calc(-50% + var(--fy, 0px))) scale(0.3) rotate(var(--frot, 0deg)); }
  to { opacity: 0.85; transform: translate(calc(-50% + var(--fx, 0px)), calc(-50% + var(--fy, 0px))) scale(1) rotate(var(--frot, 0deg)); }
}

@keyframes fragmentFloat {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

.inner-glow {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,200,87,0.2) 0%, transparent 70%);
  pointer-events: none;
  opacity: 0;
}

.inner-glow.pulsing {
  animation: innerPulse 10s ease-in-out infinite;
}

@keyframes innerPulse {
  0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.8; transform: translateX(-50%) scale(1.15); }
}

.splash-particles {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 60px;
  pointer-events: none;
}

.splash-drop {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(137,212,212,0.7);
  animation: splashFly 0.7s ease-out var(--sdelay, 0s) forwards;
}

@keyframes splashFly {
  from { opacity: 1; transform: translate(0, 0) scale(1); }
  to { opacity: 0; transform: translate(var(--sx, 0), var(--sy, 0)) scale(0.2); }
}

.paper-strip {
  position: absolute;
  bottom: -80px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 240px;
  max-width: 320px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff9f0 0%, #f5ead6 100%);
  border-radius: 2px;
  box-shadow:
    inset 0 0 20px rgba(137,212,212,0.12),
    0 4px 20px rgba(0,0,0,0.08),
    0 1px 3px rgba(0,0,0,0.04);
  transform: translateX(-50%) rotate(-1.5deg);
}

.paper-content {
  position: relative;
}

.paper-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: #4a7c82;
  letter-spacing: 0.03em;
}

.paper-drops {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.water-drop {
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50% 50% 50% 0;
  background: rgba(137,212,212,0.35);
  transform: rotate(-45deg);
  animation: dropGlisten 3s ease-in-out infinite;
}

.water-drop:nth-child(2) { animation-delay: 1s; }
.water-drop:nth-child(3) { animation-delay: 2s; }

@keyframes dropGlisten {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

.paper-shadow {
  position: absolute;
  bottom: -4px;
  left: 4px;
  right: -4px;
  height: 8px;
  background: rgba(134,190,190,0.1);
  border-radius: 50%;
  filter: blur(4px);
}

.paper-unfold-enter-active {
  animation: paperUnfold 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.paper-unfold-leave-active {
  animation: paperFold 0.5s ease-in forwards;
}

@keyframes paperUnfold {
  from { opacity: 0; transform: translateX(-50%) translateY(-30px) rotate(3deg) scale(0.8); }
  to { opacity: 1; transform: translateX(-50%) translateY(0) rotate(-1.5deg) scale(1); }
}

@keyframes paperFold {
  from { opacity: 1; transform: translateX(-50%) translateY(0) rotate(-1.5deg) scale(1); }
  to { opacity: 0; transform: translateX(-50%) translateY(20px) rotate(2deg) scale(0.9); }
}

.sand-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 24%;
  z-index: 5;
  background: #f5e6d3;
  overflow: hidden;
}

.sand-texture {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(210,185,155,0.3) 0.5px, transparent 0.5px),
    radial-gradient(circle at 60% 70%, rgba(200,175,145,0.25) 0.5px, transparent 0.5px),
    radial-gradient(circle at 80% 20%, rgba(215,190,160,0.2) 0.5px, transparent 0.5px),
    radial-gradient(circle at 40% 80%, rgba(205,180,150,0.28) 0.5px, transparent 0.5px);
  background-size: 40px 40px, 55px 55px, 35px 35px, 48px 48px;
}

.shells-container {
  position: absolute;
  bottom: 20px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 0 40px;
}

.shell-item {
  position: relative;
  cursor: pointer;
  pointer-events: auto;
  opacity: 0;
  transform: scale(0) translateY(15px);
  animation: shellEmerge 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) var(--shell-delay, 0s) forwards;
}

@keyframes shellEmerge {
  from { opacity: 0; transform: scale(0) translateY(15px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.shell-item:hover .shell-svg {
  transform: scale(1.12) translateY(-3px);
}

.shell-item.active .shell-path {
  fill: url(#coralGradientActive);
}

.shell-item.opened .shell-svg {
  transform: scale(1.08);
}

.shell-svg {
  width: 44px;
  height: 38px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: block;
}

.shell-path {
  fill: url(#coralGradient);
  transition: fill 0.3s ease;
}

.shell-inner {
  fill: rgba(250,218,218,0.5);
  transition: fill 0.3s ease;
}

.shell-label {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 11px;
  color: #f08080;
  background: rgba(245,230,211,0.95);
  padding: 3px 10px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.shell-label-enter-active {
  animation: labelPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.shell-label-leave-active {
  animation: labelFade 0.2s ease forwards;
}

@keyframes labelPop {
  from { opacity: 0; transform: translateX(-50%) translateY(5px) scale(0.8); }
  to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
}

@keyframes labelFade {
  from { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  to { opacity: 0; transform: translateX(-50%) translateY(3px) scale(0.9); }
}

.mood-text {
  position: absolute;
  top: 8%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 6;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
}

.mood-text.visible {
  opacity: 1;
}

.mood-line {
  display: block;
  font-size: 15px;
  font-weight: 300;
  letter-spacing: 0.2em;
  color: rgba(74,124,130,0.65);
  text-shadow: 0 1px 4px rgba(255,255,255,0.3);
  line-height: 1.8;
}

.interaction-hint {
  position: absolute;
  bottom: 28%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 7;
  font-size: 12px;
  color: rgba(74,124,130,0.4);
  opacity: 0;
  transition: opacity 0.8s ease;
  pointer-events: none;
}

.interaction-hint.visible {
  opacity: 1;
}

.hint-icon {
  width: 14px;
  height: 14px;
}
</style>
