<template>
  <div class="status-bar-premium">
    <span class="time-display">{{ time }}</span>
    <div class="status-cluster">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
        <path d="M1.5 19.5h3v3h-3zM6.5 15.5h3v7h-3zM11.5 10.5h3v12h-3zM16.5 4.5h3v18h-3z"/>
      </svg>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M12 20.5l-2.2-2.2h4.4L12 20.5zm4.8-4.8L12 11l-4.8 4.8h9.6zm4.8-4.8L12 3 2.4 12h19.2z"/>
      </svg>
      <div class="battery-cell">
        <div class="battery-level"></div>
        <div class="battery-cap"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const time = ref('')
let timer = null

const updateClock = () => {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  time.value = `${hh}:${mm}`
}

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 30000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
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

.time-display { margin-top: 1px; }

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
</style>
