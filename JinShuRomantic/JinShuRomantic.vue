<!-- 锦书难托 - 毕业答辩倒计时书卷组件，含里程碑展示和展卷动效 -->
<template>
  <div class="scroll-widget" :class="{ 'is-expanded': isExpanded }">
    <div class="smoke-layer">
      <div class="smoke smoke-1"></div>
      <div class="smoke smoke-2"></div>
    </div>
    
    <div class="desk-base">
      <div class="scattered-paper paper-1"></div>
      <div class="scattered-paper paper-2"></div>
      <div class="desk-corner"></div>
    </div>

    <div class="brush-decoration">
      <div class="brush-body"></div>
      <div class="brush-tip"></div>
      <div class="ink-drip" :class="{ 'active': showInkDrip }"></div>
    </div>

    <div class="scroll-main" @click="toggleExpand">
      <div class="scroll-paper">
        <div class="scroll-header">
          <h1 class="title">锦书难托</h1>
          <p class="subtitle">距毕业答辩</p>
        </div>
        
        <div class="countdown-section">
          <span class="countdown-number">{{ daysLeft }}</span>
          <span class="countdown-unit">天</span>
        </div>

        <div class="seal-area">
          <div 
            v-for="(milestone, index) in milestones" 
            :key="index"
            class="seal" 
            :class="{ 'completed': milestone.completed, 'animating': milestone.animating }"
          >
            <svg viewBox="0 0 40 40" class="seal-svg">
              <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="2"/>
              <text x="20" y="24" text-anchor="middle" font-size="10" font-weight="bold">{{ milestone.label }}</text>
            </svg>
          </div>
        </div>

        <div class="footer-text">壬寅年 · 孟夏可期</div>
      </div>

      <div class="page-curl"></div>
    </div>

    <transition name="expand">
      <div v-if="isExpanded" class="expanded-content" @click.stop>
        <div class="module-list">
          <div 
            v-for="(module, index) in modules" 
            :key="index"
            class="module-item"
            :class="{ 'completed': module.completed }"
          >
            <div class="module-line"></div>
            <div class="module-info">
              <span class="module-name">{{ module.name }}</span>
              <span class="module-status">{{ module.status }}</span>
            </div>
          </div>
        </div>
        <button class="close-btn" @click="toggleExpand">收卷</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isExpanded = ref(false)
const showInkDrip = ref(false)
const defenseDate = new Date('2026-06-15')
const daysLeft = ref(Math.ceil((defenseDate - new Date()) / (1000 * 60 * 60 * 24)))

const milestones = ref([
  { label: '开题', completed: true, animating: false },
  { label: '初稿', completed: true, animating: false },
  { label: '查重', completed: false, animating: false },
  { label: '答辩', completed: false, animating: false }
])

const modules = ref([
  { name: '知识库系统 · 数据层', status: '已完稿', completed: true },
  { name: '知识库系统 · 接口层', status: '已完稿', completed: true },
  { name: '前端交互模块', status: '撰写中', completed: false },
  { name: '论文正文 · 第一章', status: '撰写中', completed: false },
  { name: '论文正文 · 第二章', status: '待启动', completed: false }
])

let inkDripTimer = null

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

onMounted(() => {
  inkDripTimer = setInterval(() => {
    if (Math.random() > 0.7) {
      showInkDrip.value = true
      setTimeout(() => {
        showInkDrip.value = false
      }, 800)
    }
  }, 30000)

  milestones.value.forEach((m, i) => {
    if (m.completed) {
      setTimeout(() => {
        m.animating = true
        setTimeout(() => {
          m.animating = false
        }, 500)
      }, 900 + i * 200)
    }
  })
})

onUnmounted(() => {
  if (inkDripTimer) clearInterval(inkDripTimer)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600;700&family=ZCOOL+XiaoWei&display=swap');

:root {
  --paper-white: #faf8f5;
  --ink-dark: #2c3e40;
  --ink-light: #5a6d70;
  --seal-red: #c23a3a;
  --seal-red-glow: rgba(194,58,58,0.3);
  --faded-text: rgba(44,62,64,0.35);
  --hover-ink: rgba(44,62,64,0.85);
  --smoke-color: rgba(180,180,180,0.12);
}

.scroll-widget {
  position: relative;
  width: 340px;
  min-height: 480px;
  margin: 60px auto;
  font-family: 'Noto Serif SC', serif;
  animation: widgetFadeIn 2s ease-out forwards;
  opacity: 0;
}

.smoke-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.smoke {
  position: absolute;
  width: 200px;
  height: 80px;
  background: radial-gradient(ellipse at center, var(--smoke-color) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(20px);
  opacity: 0;
}

.smoke-1 {
  bottom: 20%;
  right: -50px;
  animation: smokeFloat1 12s linear infinite;
  animation-delay: 2s;
}

.smoke-2 {
  bottom: 30%;
  right: -30px;
  animation: smokeFloat2 15s linear infinite;
  animation-delay: 5s;
}

.desk-base {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  z-index: 1;
  animation: deskRise 0.4s ease-out 0s forwards;
  opacity: 0;
}

.scattered-paper {
  position: absolute;
  background: #f5f2ed;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.paper-1 {
  width: 80px;
  height: 100px;
  bottom: 30px;
  right: 40px;
  transform: rotate(-8deg);
  animation: paperFloat 4s ease-in-out infinite;
}

.paper-2 {
  width: 60px;
  height: 75px;
  bottom: 25px;
  right: 100px;
  transform: rotate(12deg);
  animation: paperFloat 4s ease-in-out infinite 1s;
}

.desk-corner {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 140px;
  height: 60px;
  background: linear-gradient(135deg, transparent 40%, #e8e4dc 40%);
  border-radius: 0 0 8px 0;
}

.brush-decoration {
  position: absolute;
  top: 60px;
  left: -20px;
  z-index: 3;
  animation: brushSlide 0.5s ease-out 1.2s forwards;
  opacity: 0;
  transform: translateX(-30px);
}

.brush-body {
  width: 8px;
  height: 120px;
  background: linear-gradient(to bottom, #4a3728 0%, #2d1f16 100%);
  border-radius: 4px 4px 2px 2px;
  transform: rotate(-15deg);
  box-shadow: 2px 2px 8px rgba(0,0,0,0.2);
}

.brush-tip {
  position: absolute;
  bottom: -18px;
  left: 2px;
  width: 4px;
  height: 20px;
  background: radial-gradient(ellipse at center, #1a1410 0%, #2c3e40 100%);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  transform: rotate(-15deg);
}

.ink-drip {
  position: absolute;
  bottom: -35px;
  left: 1px;
  width: 6px;
  height: 0;
  background: radial-gradient(ellipse at center, var(--ink-dark) 0%, transparent 70%);
  border-radius: 50%;
  transition: height 0.8s ease-in, opacity 0.8s ease-in;
  opacity: 0;
}

.ink-drip.active {
  height: 15px;
  opacity: 0.6;
}

.scroll-main {
  position: relative;
  z-index: 2;
  width: 280px;
  margin: 80px auto 0;
  cursor: pointer;
  animation: scrollUnfold 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) 0.3s forwards;
  opacity: 0;
  transform: scale(0.9) translateY(20px);
  transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.scroll-main:hover {
  transform: scale(1.02) translateY(-2px);
}

.is-expanded .scroll-main {
  transform: scale(1);
}

.scroll-paper {
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(60,80,90,0.15);
  border-radius: 4px;
  padding: 32px 28px 28px;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.8);
  position: relative;
  overflow: hidden;
}

.scroll-paper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 28px,
      rgba(44,62,64,0.03) 28px,
      rgba(44,62,64,0.03) 29px
    );
  pointer-events: none;
}

.page-curl {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, transparent 50%, rgba(240,235,228,0.9) 50%);
  border-radius: 0 0 4px 0;
  animation: pageWave 4s ease-in-out infinite;
}

.scroll-header {
  text-align: center;
  margin-bottom: 24px;
  animation: textReveal 0.4s ease-in-out 0.7s forwards;
  opacity: 0;
}

.title {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 22px;
  font-weight: 600;
  color: var(--ink-dark);
  letter-spacing: 4px;
  margin: 0 0 8px;
}

.subtitle {
  font-size: 14px;
  color: var(--ink-light);
  margin: 0;
  letter-spacing: 2px;
}

.countdown-section {
  text-align: center;
  margin: 32px 0;
  animation: numberReveal 0.3s ease-in-out 0.9s forwards;
  opacity: 0;
}

.countdown-number {
  font-family: 'Noto Serif SC', serif;
  font-size: 48px;
  font-weight: 700;
  color: var(--ink-dark);
  display: inline-block;
  transition: all 0.3s ease;
  line-height: 1;
}

.countdown-unit {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 18px;
  color: var(--ink-light);
  margin-left: 6px;
  vertical-align: baseline;
}

.seal-area {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 28px;
  animation: sealsReveal 0.5s ease-out 1.1s forwards;
  opacity: 0;
}

.seal {
  width: 36px;
  height: 36px;
  color: var(--faded-text);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 0.4;
}

.seal.completed {
  color: var(--seal-red);
  opacity: 1;
  filter: drop-shadow(0 1px 3px var(--seal-red-glow));
}

.seal.animating {
  animation: sealStamp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.seal-svg {
  width: 100%;
  height: 100%;
}

.footer-text {
  text-align: center;
  font-size: 11px;
  color: var(--faded-text);
  margin-top: 24px;
  letter-spacing: 2px;
  font-style: italic;
}

.expanded-content {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  margin-top: 12px;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(60,80,90,0.12);
  border-radius: 4px;
  padding: 24px 20px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.1);
  z-index: 10;
}

.module-list {
  margin-bottom: 16px;
}

.module-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(44,62,64,0.06);
  transition: all 0.25s ease-out;
  cursor: default;
}

.module-item:last-child {
  border-bottom: none;
}

.module-item:hover .module-name {
  color: var(--hover-ink);
}

.module-item.completed {
  opacity: 0.65;
}

.module-line {
  width: 2px;
  height: 100%;
  min-height: 24px;
  background: linear-gradient(to bottom, var(--ink-light), transparent);
  border-radius: 1px;
  flex-shrink: 0;
}

.module-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.module-name {
  font-size: 14px;
  color: var(--ink-dark);
  transition: color 0.25s ease-out;
  letter-spacing: 0.5px;
}

.module-status {
  font-size: 12px;
  color: var(--ink-light);
  opacity: 0.7;
}

.close-btn {
  display: block;
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid rgba(44,62,64,0.15);
  border-radius: 3px;
  color: var(--ink-light);
  font-family: 'Noto Serif SC', serif;
  font-size: 13px;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.close-btn:hover {
  background: rgba(44,62,64,0.04);
  border-color: rgba(44,62,64,0.25);
  color: var(--ink-dark);
}

@keyframes widgetFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes deskRise {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scrollUnfold {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes brushSlide {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes textReveal {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes numberReveal {
  from {
    opacity: 0;
    filter: blur(4px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes sealsReveal {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes sealStamp {
  0% {
    transform: scale(0.3) rotate(-10deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.15) rotate(3deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes smokeFloat1 {
  0% {
    opacity: 0;
    transform: translateX(0) translateY(0);
  }
  20% {
    opacity: 0.6;
  }
  80% {
    opacity: 0.4;
  }
  100% {
    opacity: 0;
    transform: translateX(-250px) translateY(-150px);
  }
}

@keyframes smokeFloat2 {
  0% {
    opacity: 0;
    transform: translateX(0) translateY(0) scale(0.8);
  }
  20% {
    opacity: 0.5;
  }
  80% {
    opacity: 0.3;
  }
  100% {
    opacity: 0;
    transform: translateX(-200px) translateY(-120px) scale(1.2);
  }
}

@keyframes pageWave {
  0%, 100% {
    border-radius: 0 0 4px 0;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  50% {
    border-radius: 0 0 4px 2px;
    clip-path: polygon(0 0, 95% 0, 100% 100%, 0 100%);
  }
}

@keyframes paperFloat {
  0%, 100% {
    transform: rotate(-8deg) translateY(0);
  }
  50% {
    transform: rotate(-6deg) translateY(-3px);
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px) scale(0.95);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
