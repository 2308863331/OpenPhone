<template>
  <div class="resource-display">
    <div class="resource-item wood">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="8" width="14" height="6" rx="1" fill="#C4A484" stroke="#A0826D" stroke-width="1"/>
        <line x1="6" y1="10" x2="6" y2="12" stroke="#8B7355" stroke-width="1"/>
        <line x1="10" y1="10" x2="10" y2="12" stroke="#8B7355" stroke-width="1"/>
        <line x1="14" y1="10" x2="14" y2="12" stroke="#8B7355" stroke-width="1"/>
      </svg>
      <span class="resource-count">{{ wood }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  wood: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
.resource-display {
  background: rgba(255, 248, 231, 0.9);
  backdrop-filter: blur(10px);
  padding: 10px 18px;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(212, 180, 148, 0.3);
  display: flex;
  align-items: center;
  gap: 16px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resource-item.wood {
  color: #8B7355;
}

.resource-count {
  font-size: 18px;
  font-weight: 700;
  color: #5a4a3a;
  min-width: 24px;
  text-align: center;
  font-family: 'Quicksand', sans-serif;
}
</style>
