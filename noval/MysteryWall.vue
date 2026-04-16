<!-- 墨隐秘闻 - 悬疑小说创作辅助墙，线索卡片管理和烟雾氛围 -->
<template>
  <div class="mystery-wall">
    <canvas ref="smokeCanvas" class="smoke-canvas"></canvas>
    <div class="paper-texture"></div>

    <header class="title-area">
      <h1 class="main-title">墨隐秘闻</h1>
      <p class="sub-title">悬疑小说创作辅助墙</p>
    </header>

    <div class="center-stage">
      <svg class="rope-lines" :viewBox="`0 0 ${stageWidth} ${stageHeight}`">
        <path v-for="(rope, index) in ropes" :key="index"
              :d="rope.path"
              class="rope-path"
              :style="{ animationDelay: `${1.5 + index * 0.15}s` }"/>
      </svg>

      <div class="pocket-watch">
        <div class="watch-glow"></div>
        <svg viewBox="0 0 120 150" class="watch-svg">
          <ellipse cx="60" cy="75" rx="50" ry="58" fill="#D4C4A8" stroke="#A89070" stroke-width="2"/>
          <circle cx="60" cy="75" r="42" fill="#F5F0E6" stroke="#B8A088" stroke-width="1.5"/>
          <line x1="60" y1="75" x2="60" y2="45" stroke="#5A4A3A" stroke-width="2.5" stroke-linecap="round" class="hour-hand"/>
          <line x1="60" y1="75" x2="78" y2="68" stroke="#7A6A5A" stroke-width="1.8" stroke-linecap="round" class="minute-hand"/>
          <circle cx="60" cy="75" r="3" fill="#4A3A2A"/>
          <path d="M55 20 Q60 15 65 20 L63 35 Q60 33 57 35 Z" fill="#A89070" stroke="#8A7058" stroke-width="1"/>
          <path d="M52 130 Q60 138 68 130 L66 118 Q60 122 54 118 Z" fill="#A89070" stroke="#8A7058" stroke-width="1"/>
          <path d="M30 55 Q25 50 28 42 M90 55 Q95 50 92 42" stroke="#8A7058" stroke-width="1.5" fill="none" opacity="0.6"/>
          <path d="M35 95 Q28 98 26 105 M85 95 Q92 98 94 105" stroke="#8A7058" stroke-width="1.5" fill="none" opacity="0.6"/>
        </svg>
      </div>

      <div v-for="(card, index) in cards" :key="card.id"
           class="clue-card"
           :class="{ 'card-hover': hoveredCard === card.id }"
           :style="getCardStyle(card, index)"
           @mouseenter="hoveredCard = card.id"
           @mouseleave="hoveredCard = null"
           @click="openCardDetail(card)">
        <div class="pin">
          <div class="pin-head"></div>
          <div class="pin-shadow"></div>
        </div>
        <div class="card-content">
          <span class="card-number">{{ card.number }}</span>
          <p class="card-title">{{ card.title }}</p>
          <div class="card-stars">
            <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= card.importance }">★</span>
          </div>
        </div>
      </div>
    </div>

    <transition name="detail-fade">
      <div v-if="selectedCard" class="detail-overlay" @click.self="selectedCard = null">
        <div class="detail-panel">
          <button class="close-btn" @click="selectedCard = null">×</button>
          <div class="detail-pin">◉</div>
          <h2 class="detail-title">{{ selectedCard.title }}</h2>
          <div class="detail-meta">
            <span>线索编号：{{ selectedCard.number }}</span>
            <span>关键度：<span v-for="star in 5" :key="star" class="star small" :class="{ filled: star <= selectedCard.importance }">★</span></span>
          </div>
          <p class="detail-content">{{ selectedCard.content }}</p>
          <div class="detail-tags">
            <span v-for="tag in selectedCard.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </transition>

    <footer class="toolbar">
      <button class="tool-btn" @click="addClue">
        <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" fill="none"/></svg>
        添加线索
      </button>
      <button class="tool-btn">
        <svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 10l4 4 8-8" stroke="currentColor" stroke-width="2" fill="none"/></svg>
        编辑
      </button>
      <button class="tool-btn">
        <svg width="16" height="16" viewBox="0 0 16 16"><path d="M14 9v4a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h4M11 2h3v3M8 8l6-6" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
        导出
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const smokeCanvas = ref(null)
const hoveredCard = ref(null)
const selectedCard = ref(null)
const stageWidth = ref(800)
const stageHeight = ref(600)

const cards = ref([
  { id: 1, number: '线索 #001', title: '那封未寄出的信', importance: 3, content: '在书房的抽屉夹层中发现一封泛黄的信笺，信纸边缘已经脆化，字迹模糊不清。收信人姓名被刻意涂黑，只留下日期：民国二十三年秋。信中提到"北边的仓库"和"第七个夜晚"。', tags: ['物证', '文字'] },
  { id: 2, number: '线索 #002', title: '阁楼上的旧皮箱', importance: 4, content: '一只落满灰尘的棕色皮箱，锁扣已锈蚀。撬开后发现里面整齐叠放着七件旧式旗袍，每件袖口都绣着不同的花卉图案。最底层压着一本日记，记录了从民国二十年到二十四年的日常。', tags: ['物品', '服饰'] },
  { id: 3, number: '线索 #003', title: '消失的第三个人', importance: 5, content: '据老住户回忆，这栋宅院原本住着三兄妹。但所有档案中只有长兄和幼妹的记录，关于二姐的信息仿佛被人为抹去。唯一能证明她存在过的，是一张模糊的合影——照片右下角有半个身影被剪掉了。', tags: ['人物', '档案'] },
  { id: 4, number: '线索 #004', title: '地下室的水声', importance: 2, content: '每逢雨夜，地下室的某个角落会传出断续的水滴声。声音的节奏似乎遵循某种规律，像是摩斯密码，又像是在倒数什么。当地老人说，这里曾经有一口被封死的古井。', tags: ['环境', '声音'] },
  { id: 5, number: '线索 #005', title: '墙内的暗格', importance: 4, content: '二楼书房东墙的书架后方藏着一个暗格，里面存放着三封来自同一人的匿名信。信纸用的是特制的暗纹纸，在烛光下才能看清隐藏的文字。内容涉及一笔从未入账的款项流向。', tags: ['密室', '财务'] },
  { id: 6, number: '线索 #006', title: '园丁的遗言', importance: 3, content: '最后一位园丁在离世前留下了一句话："花开了的时候，别去后院。"这句话被记录在他的工作日志最后一页，旁边画着一朵从未见过的黑色花朵草图。', tags: ['证言', '植物'] },
  { id: 7, number: '线索 #007', title: '钟表的停摆时间', importance: 5, content: '宅院里所有的机械钟都在同一天停止走动，指针永远停在凌晨三点十七分。那天是民国二十四年冬至。更奇怪的是，之后更换的新钟表，每到这个时刻都会莫名慢上几分钟。', tags: ['时间', '异常'] }
])

const ropes = computed(() => {
  const centerX = stageWidth.value / 2
  const centerY = stageHeight.value / 2 - 30
  return cards.value.map((card, index) => {
    const positions = [
      { x: 140, y: 160 }, { x: 640, y: 170 },
      { x: 110, y: 340 }, { x: 670, y: 350 },
      { x: 160, y: 480 }, { x: 620, y: 490 },
      { x: 380, y: 520 }
    ]
    const pos = positions[index] || { x: 400, y: 500 }
    return {
      path: `M${centerX},${centerY} Q${(centerX + pos.x)/2 + (Math.random()-0.5)*40},${(centerY + pos.y)/2} ${pos.x + 80},${pos.y + 20}`
    }
  })
})

const getCardStyle = (card, index) => {
  const positions = [
    { left: '12%', top: '18%' },
    { left: '72%', top: '19%' },
    { left: '8%', top: '43%' },
    { left: '76%', top: '44%' },
    { left: '14%', top: '66%' },
    { left: '70%', top: '67%' },
    { left: '42%', top: '73%' }
  ]
  const pos = positions[index] || { left: '45%', top: '70%' }
  const rotations = [-3, 2, -2, 3, 1, -1, 0]
  return {
    ...pos,
    '--rotation': `${rotations[index] || 0}deg`,
    animationDelay: `${2.5 + index * 0.15}s`
  }
}

let smokeCtx = null
let particles = []
let animFrameId = null

const initSmoke = () => {
  if (!smokeCanvas.value) return
  const canvas = smokeCanvas.value
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  smokeCtx = canvas.getContext('2d')
  particles = []
  for (let i = 0; i < 25; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 30 + Math.random() * 80,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: 0.04 + Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2
    })
  }
}

const animateSmoke = () => {
  if (!smokeCtx) return
  const canvas = smokeCanvas.value
  smokeCtx.clearRect(0, 0, canvas.width, canvas.height)
  particles.forEach(p => {
    p.x += p.vx
    p.y += p.vy
    p.phase += 0.008
    if (p.x < -p.radius) p.x = canvas.width + p.radius
    if (p.x > canvas.width + p.radius) p.x = -p.radius
    if (p.y < -p.radius) p.y = canvas.height + p.radius
    if (p.y > canvas.height + p.radius) p.y = -p.radius
    const currentAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.phase))
    const gradient = smokeCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius)
    gradient.addColorStop(0, `rgba(200, 195, 180, ${currentAlpha})`)
    gradient.addColorStop(1, 'rgba(200, 195, 180, 0)')
    smokeCtx.beginPath()
    smokeCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    smokeCtx.fillStyle = gradient
    smokeCtx.fill()
  })
  animFrameId = requestAnimationFrame(animateSmoke)
}

const openCardDetail = (card) => {
  selectedCard.value = card
}

const addClue = () => {
  alert('添加新线索功能')
}

onMounted(() => {
  initSmoke()
  animateSmoke()
  window.addEventListener('resize', initSmoke)
})

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
  window.removeEventListener('resize', initSmoke)
})
</script>

<style scoped>
.mystery-wall {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #E8E0D0;
  font-family: 'Noto Serif SC', 'Source Han Serif CN', serif;
}

.smoke-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.paper-texture {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(139, 119, 99, 0.02) 2px,
      rgba(139, 119, 99, 0.02) 4px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(139, 119, 99, 0.015) 2px,
      rgba(139, 119, 99, 0.015) 4px
    );
  opacity: 0.6;
  z-index: 2;
  pointer-events: none;
  animation: textureFadeIn 0.8s ease-out forwards;
}

@keyframes textureFadeIn {
  from { opacity: 0; }
  to { opacity: 0.6; }
}

.title-area {
  position: absolute;
  top: 24px;
  left: 32px;
  z-index: 10;
  animation: titleSlideIn 1s ease-out 0.3s both;
}

@keyframes titleSlideIn {
  from { opacity: 0; transform: translateY(-15px); }
  to { opacity: 1; transform: translateY(0); }
}

.main-title {
  font-size: 22px;
  font-weight: 600;
  color: #4A3A2A;
  letter-spacing: 6px;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
}

.sub-title {
  font-size: 11px;
  color: #8A7A6A;
  letter-spacing: 3px;
  margin: 4px 0 0 0;
  font-weight: 400;
}

.center-stage {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
}

.rope-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.rope-path {
  fill: none;
  stroke: #8B3A3A;
  stroke-width: 3;
  stroke-linecap: round;
  filter: drop-shadow(1px 2px 2px rgba(60, 30, 30, 0.25));
  stroke-dasharray: 800;
  stroke-dashoffset: 800;
  animation: ropeGrow 0.8s ease-out forwards;
  opacity: 0.75;
}

@keyframes ropeGrow {
  to { stroke-dashoffset: 0; }
}

.pocket-watch {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 150px;
  z-index: 6;
  animation: watchAppear 0.7s ease-out 0.8s both;
  cursor: default;
}

@keyframes watchAppear {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.75); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.watch-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 160px;
  height: 190px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(180, 140, 100, 0.25) 0%, transparent 70%);
  animation: breatheGlow 3s ease-in-out infinite;
  pointer-events: none;
  z-index: -1;
}

@keyframes breatheGlow {
  0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.08); }
}

.watch-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(2px 4px 8px rgba(60, 50, 40, 0.3));
}

.hour-hand {
  transform-origin: 60px 75px;
  animation: hourTick 20s linear infinite;
}

.minute-hand {
  transform-origin: 60px 75px;
  animation: minuteTick 3s linear infinite;
}

@keyframes hourTick {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes minuteTick {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.clue-card {
  position: absolute;
  width: 150px;
  padding: 32px 14px 14px;
  background: linear-gradient(135deg, #F5F0E6 0%, #EBE4D5 100%);
  border-radius: 2px;
  box-shadow:
    2px 4px 12px rgba(60, 50, 40, 0.18),
    inset 0 0 20px rgba(139, 119, 99, 0.05);
  cursor: pointer;
  transform: rotate(var(--rotation));
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  opacity: 0;
  animation: cardAppear 0.5s ease-out forwards;
  z-index: 7;
}

.clue-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, transparent 50%, rgba(200, 190, 175, 0.4) 50%);
  border-bottom-left-radius: 8px;
}

@keyframes cardAppear {
  from { opacity: 0; transform: rotate(var(--rotation)) translateY(15px); }
  to { opacity: 1; transform: rotate(var(--rotation)) translateY(0); }
}

.clue-card:hover {
  box-shadow:
    4px 8px 20px rgba(60, 50, 40, 0.28),
    inset 0 0 20px rgba(139, 119, 99, 0.08);
  animation: swing 1.5s ease-in-out infinite;
}

@keyframes swing {
  0%, 100% { transform: rotate(calc(var(--rotation) - 2deg)); }
  50% { transform: rotate(calc(var(--rotation) + 2deg)); }
}

.pin {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 8;
}

.pin-head {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #D4A574 0%, #A07248 50%, #7A5432 100%);
  box-shadow:
    0 2px 4px rgba(60, 40, 20, 0.4),
    inset 0 -1px 2px rgba(0, 0, 0, 0.2);
  transition: filter 0.3s ease;
}

.card-hover .pin-head {
  filter: brightness(1.2);
}

.pin-shadow {
  position: absolute;
  top: 13px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 8px;
  background: linear-gradient(to bottom, rgba(90, 70, 50, 0.3), transparent);
  border-radius: 0 0 3px 3px;
}

.card-content {
  text-align: center;
}

.card-number {
  display: block;
  font-size: 10px;
  color: #8A7A6A;
  letter-spacing: 1px;
  margin-bottom: 6px;
  font-family: 'Courier New', monospace;
}

.card-title {
  font-size: 13px;
  color: #4A3A2A;
  margin: 0 0 8px;
  line-height: 1.4;
  font-weight: 500;
}

.card-stars {
  display: flex;
  justify-content: center;
  gap: 2px;
}

.star {
  font-size: 11px;
  color: #D4C4A8;
}

.star.filled {
  color: #B8956A;
}

.detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(40, 30, 20, 0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-panel {
  position: relative;
  width: 420px;
  max-height: 70vh;
  padding: 40px 32px 28px;
  background: linear-gradient(145deg, #FAF6EE 0%, #F0EAD8 100%);
  border-radius: 3px;
  box-shadow:
    0 12px 40px rgba(40, 30, 20, 0.35),
    inset 0 0 30px rgba(139, 119, 99, 0.06);
  overflow-y: auto;
}

.detail-panel::before {
  content: '';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, transparent 50%, rgba(200, 190, 175, 0.35) 50%);
  border-bottom-left-radius: 10px;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(139, 119, 99, 0.15);
  color: #6A5A4A;
  font-size: 20px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(139, 70, 70, 0.2);
  color: #8B3A3A;
}

.detail-pin {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  color: #A07248;
  text-shadow: 0 2px 4px rgba(60, 40, 20, 0.3);
}

.detail-title {
  font-size: 20px;
  color: #3A2A1A;
  margin: 0 0 12px;
  text-align: center;
  letter-spacing: 2px;
}

.detail-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #8A7A6A;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(139, 119, 99, 0.2);
}

.star.small {
  font-size: 10px;
}

.detail-content {
  font-size: 13px;
  color: #5A4A3A;
  line-height: 1.8;
  margin: 0 0 16px;
  text-indent: 2em;
}

.detail-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 3px 10px;
  background: rgba(139, 119, 99, 0.12);
  color: #7A6A5A;
  font-size: 11px;
  border-radius: 10px;
  letter-spacing: 1px;
}

.toolbar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  padding: 10px 24px;
  background: rgba(232, 224, 208, 0.85);
  backdrop-filter: blur(8px);
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(60, 50, 40, 0.15);
  z-index: 50;
  animation: toolbarSlideUp 0.6s ease-out 2.8s both;
}

@keyframes toolbarSlideUp {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #6A5A4A;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  border-radius: 16px;
  transition: all 0.25s ease;
  letter-spacing: 1px;
}

.tool-btn:hover {
  background: rgba(139, 58, 58, 0.1);
  color: #8B3A3A;
}

.detail-fade-enter-active,
.detail-fade-leave-active {
  transition: opacity 0.3s ease;
}

.detail-fade-enter-from,
.detail-fade-leave-to {
  opacity: 0;
}

.detail-fade-enter-active .detail-panel {
  animation: panelZoomIn 0.35s ease-out;
}

@keyframes panelZoomIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
