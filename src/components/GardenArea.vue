<template>
  <div class="garden-area">
    <div class="ground"></div>

    <div class="garden-items">
      <div
        v-for="(item, index) in woodPiles"
        :key="'wood-' + index"
        class="wood-pile"
        :style="{ left: item.x + '%', bottom: item.y + '%' }"
        @click="collectWood(item)"
      >
        <svg width="32" height="24" viewBox="0 0 32 24">
          <rect x="2" y="10" width="28" height="8" rx="2" fill="#C4A484" stroke="#A0826D" stroke-width="1"/>
          <rect x="6" y="12" width="3" height="4" fill="#8B7355" rx="0.5"/>
          <rect x="14" y="12" width="3" height="4" fill="#8B7355" rx="0.5"/>
          <rect x="22" y="12" width="3" height="4" fill="#8B7355" rx="0.5"/>
        </svg>
        <span class="collect-hint">+{{ item.amount }}</span>
      </div>

      <div
        v-for="(flower, index) in flowers"
        :key="'flower-' + index"
        class="flower"
        :style="{ left: flower.x + '%', bottom: flower.y + '%' }"
      >
        <span class="flower-emoji">{{ flower.emoji }}</span>
      </div>
    </div>

    <div class="grass-clusters">
      <div v-for="i in 12" :key="i" class="grass" :style="getGrassStyle(i)"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  woodCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['collect-wood', 'toggle-swing'])

const woodPiles = ref([
  { id: 1, x: 18, y: 8, amount: 2, collected: false },
  { id: 2, x: 72, y: 10, amount: 3, collected: false },
  { id: 3, x: 45, y: 5, amount: 1, collected: false }
])

const flowers = ref([
  { emoji: '🌸', x: 25, y: 12 },
  { emoji: '🌼', x: 65, y: 9 },
  { emoji: '💮', x: 38, y: 11 },
  { emoji: '🏵️', x: 78, y: 13 }
])

function collectWood(item) {
  if (!item.collected) {
    item.collected = true
    emit('collect-wood', item.amount)

    setTimeout(() => {
      item.x = 10 + Math.random() * 80
      item.y = 5 + Math.random() * 10
      item.amount = Math.floor(Math.random() * 3) + 1
      item.collected = false
    }, 5000)
  }
}

function getGrassStyle(index) {
  const positions = [
    { left: '8%', bottom: '3%', height: '18px' },
    { left: '22%', bottom: '4%', height: '22px' },
    { left: '35%', bottom: '2%', height: '16px' },
    { left: '48%', bottom: '5%', height: '25px' },
    { left: '62%', bottom: '3%', height: '19px' },
    { left: '75%', bottom: '4%', height: '21px' },
    { left: '88%', bottom: '2%', height: '17px' },
    { left: '15%', bottom: '6%', height: '14px' },
    { left: '30%', bottom: '5%', height: '16px' },
    { left: '55%', bottom: '6%', height: '15px' },
    { left: '70%', bottom: '5%', height: '18px' },
    { left: '82%', bottom: '6%', height: '13px' }
  ]
  return positions[index - 1] || {}
}
</script>

<style scoped>
.garden-area {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  pointer-events: auto;
  z-index: 8;
}

.ground {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to bottom,
    #9ACD70 0%,
    #7CB342 40%,
    #689F38 70%,
    #558B2F 100%
  );
  border-radius: 50% 50% 0 0 / 20px 20px 0 0;
  box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.1);
}

.garden-items {
  position: relative;
  width: 100%;
  height: 100%;
}

.wood-pile {
  position: absolute;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: gentleBobble 3s ease-in-out infinite;
}

.wood-pile:hover {
  transform: translateY(-5px) scale(1.1);
  filter: brightness(1.1);
}

.collect-hint {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(139, 195, 74, 0.95);
  color: white;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.wood-pile:hover .collect-hint {
  opacity: 1;
  animation: floatUp 1s ease-out forwards;
}

@keyframes floatUp {
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(-15px);
  }
}

.flower {
  position: absolute;
  animation: swayFlower 4s ease-in-out infinite;
}

.flower-emoji {
  font-size: 22px;
  display: block;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

@keyframes gentleBobble {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes swayFlower {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

.grass-clusters {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  pointer-events: none;
}

.grass {
  position: absolute;
  width: 3px;
  background: linear-gradient(to top, #558B2F, #7CB342);
  border-radius: 50% 50% 0 0;
  transform-origin: bottom center;
  animation: grassSway 3s ease-in-out infinite;
}

.grass:nth-child(odd) {
  animation-delay: -1.5s;
}

@keyframes grassSway {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}
</style>
