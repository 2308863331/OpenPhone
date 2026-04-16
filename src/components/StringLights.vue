<template>
  <div class="string-lights" :class="{ 'night-mode': isNight }">
    <svg class="lights-svg" viewBox="0 0 400 200">
      <path
        d="M 20 30 Q 100 80 200 50 Q 300 20 380 60"
        stroke="#4A3728"
        stroke-width="2"
        fill="none"
        class="wire"
      />
      <circle
        v-for="(light, index) in lights"
        :key="index"
        :cx="light.x"
        :cy="light.y"
        :r="isNight ? 6 : 5"
        :fill="light.color"
        :class="{ glowing: isNight }"
        :style="{ animationDelay: light.delay + 's' }"
        class="light-bulb"
      />
    </svg>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isNight: {
    type: Boolean,
    default: false
  }
})

const colors = ['#FFD93D', '#FFB5A7', '#A8DADC', '#FFD93D', '#FFB5A7', '#A8DADC', '#FFD93D', '#FFB5A7', '#A8DADC', '#FFD93D']

const lights = computed(() => {
  const positions = [
    { x: 35, y: 42 },
    { x: 75, y: 58 },
    { x: 115, y: 68 },
    { x: 155, y: 65 },
    { x: 195, y: 55 },
    { x: 235, y: 45 },
    { x: 275, y: 38 },
    { x: 315, y: 40 },
    { x: 355, y: 52 }
  ]

  return positions.map((pos, i) => ({
    ...pos,
    color: colors[i],
    delay: i * 0.15
  }))
})
</script>

<style scoped>
.string-lights {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 380px;
  height: 100px;
  pointer-events: none;
  z-index: 15;
}

.lights-svg {
  width: 100%;
  height: 100%;
}

.wire {
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2));
}

.light-bulb {
  transition: all 0.3s ease;
  opacity: 0.7;
}

.light-bulb.glowing {
  animation: twinkle 2s ease-in-out infinite;
  opacity: 1;
}

@keyframes twinkle {
  0%, 100% {
    filter: drop-shadow(0 0 6px currentColor) brightness(1);
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 14px currentColor) drop-shadow(0 0 20px rgba(255, 217, 61, 0.5)) brightness(1.3);
    transform: scale(1.15);
  }
}

.night-mode .light-bulb {
  opacity: 1;
}
</style>
