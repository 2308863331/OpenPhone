<template>
  <div class="bird-house" @click="triggerBird" :class="{ 'has-bird': showBird }">
    <div class="house-body">
      <svg width="56" height="65" viewBox="0 0 56 65">
        <defs>
          <linearGradient id="houseWood" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#A0826D;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#C4A484;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#A0826D;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="roofWood" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#8B7355;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#6B5344;stop-opacity:1" />
          </linearGradient>
        </defs>

        <rect x="12" y="28" width="32" height="35" rx="3" fill="url(#houseWood)" stroke="#8B7355" stroke-width="1.5"/>
        <circle cx="28" cy="42" r="8" fill="#3a3028"/>
        <circle cx="28" cy="42" r="6" fill="#1a1510"/>

        <path d="M 6 30 L 28 8 L 50 30 Z" fill="url(#roofWood)" stroke="#6B5344" stroke-width="1.5"/>

        <rect x="24" y="52" width="8" height="11" rx="1" fill="#6B5344" stroke="#5a4739" stroke-width="1"/>
        <circle cx="26" cy="57" r="1" fill="#C4A484"/>
        <circle cx="30" cy="59" r="1" fill="#C4A484"/>
      </svg>
    </div>

    <transition name="bird-appear">
      <div v-if="showBird" class="bird" :style="{ left: birdPosition.x + '%', top: birdPosition.y + '%' }">
        <span class="bird-icon">🐦</span>
      </div>
    </transition>

    <div class="bird-house-pole">
      <div class="pole"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showBird = ref(false)
const birdPosition = ref({ x: 45, y: -20 })

function triggerBird() {
  if (!showBird.value) {
    showBird.value = true
    setTimeout(() => {
      showBird.value = false
    }, 3000)
  }
}
</script>

<style scoped>
.bird-house {
  position: absolute;
  right: 10%;
  bottom: 22%;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.bird-house:hover {
  transform: scale(1.05) translateY(-3px);
}

.house-body {
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.2));
  animation: gentleFloat 4s ease-in-out infinite;
}

@keyframes gentleFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-4px) rotate(1deg); }
}

.bird {
  position: absolute;
  font-size: 24px;
  animation: birdHop 0.5s ease-out;
  pointer-events: none;
}

.bird-icon {
  display: block;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

@keyframes birdHop {
  0% {
    opacity: 0;
    transform: translate(-20px, 10px) scale(0.5);
  }
  50% {
    transform: translate(0, -15px) scale(1.2);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
}

.bird.has-bird .house-body {
  animation: houseShake 0.3s ease-in-out;
}

@keyframes houseShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px) rotate(-1deg); }
  75% { transform: translateX(2px) rotate(1deg); }
}

.bird-house-pole {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
}

.pole {
  width: 4px;
  height: 45px;
  background: linear-gradient(to right, #8B7355, #A0826D, #8B7355);
  border-radius: 2px;
}

.bird-appear-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bird-appear-enter-from {
  opacity: 0;
  transform: scale(0) translateY(20px);
}
</style>
