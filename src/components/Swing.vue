<template>
  <div class="swing" :class="{ animating: isAnimating }">
    <div class="swing-rope">
      <div class="rope-left"></div>
      <div class="rope-right"></div>
    </div>
    <div class="swing-seat">
      <div class="seat-wood"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isAnimating: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.swing {
  position: absolute;
  left: 8%;
  bottom: 18%;
  width: 70px;
  height: 110px;
  transform-origin: top center;
}

.swing.animating {
  animation: swingMotion 2s ease-in-out 3;
}

.swing-rope {
  position: relative;
  width: 100%;
  height: 80px;
}

.rope-left,
.rope-right {
  position: absolute;
  width: 3px;
  height: 75px;
  background: linear-gradient(to bottom, #8B7355, #A0826D);
  top: 0;
  border-radius: 2px;
}

.rope-left {
  left: 15px;
  transform: rotate(-5deg);
  transform-origin: top center;
}

.rope-right {
  right: 15px;
  transform: rotate(5deg);
  transform-origin: top center;
}

.swing-seat {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.seat-wood {
  width: 55px;
  height: 10px;
  background: linear-gradient(135deg, #C4A484 0%, #D4B494 50%, #C4A484 100%);
  border-radius: 6px;
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  border: 1px solid #A0826D;
}

@keyframes swingMotion {
  0% { transform: rotate(0deg); }
  15% { transform: rotate(25deg); }
  30% { transform: rotate(0deg); }
  45% { transform: rotate(-22deg); }
  60% { transform: rotate(0deg); }
  75% { transform: rotate(18deg); }
  90% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}
</style>
