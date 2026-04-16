<template>
  <div class="season-controller">
    <button
      v-for="season in seasons"
      :key="season.key"
      class="season-btn"
      :class="[season.key, { active: currentSeason === season.key }]"
      :title="season.name"
      @click="$emit('change-season', season.key)"
    >
      <span class="season-icon">{{ season.icon }}</span>
      <span class="season-label">{{ season.name }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  currentSeason: {
    type: String,
    default: 'spring'
  }
})

defineEmits(['change-season'])

const seasons = [
  { key: 'spring', name: '春', icon: '🌸' },
  { key: 'summer', name: '夏', icon: '☀️' },
  { key: 'autumn', name: '秋', icon: '🍂' },
  { key: 'winter', name: '冬', icon: '❄️' }
]
</script>

<style scoped>
.season-controller {
  display: flex;
  gap: 8px;
  background: rgba(255, 248, 231, 0.9);
  backdrop-filter: blur(10px);
  padding: 10px 16px;
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(212, 180, 148, 0.3);
}

.season-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 14px;
  border: none;
  border-radius: 16px;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 52px;
}

.season-btn:hover {
  background: rgba(200, 180, 160, 0.15);
  transform: translateY(-2px);
}

.season-btn.active {
  background: rgba(107, 142, 107, 0.2);
  box-shadow: 0 2px 8px rgba(107, 142, 107, 0.2);
}

.season-btn.spring.active {
  background: rgba(154, 205, 112, 0.25);
}

.season-btn.summer.active {
  background: rgba(74, 144, 226, 0.2);
}

.season-btn.autumn.active {
  background: rgba(222, 177, 142, 0.3);
}

.season-btn.winter.active {
  background: rgba(168, 218, 220, 0.25);
}

.season-icon {
  font-size: 20px;
  line-height: 1;
}

.season-label {
  font-size: 11px;
  color: #5a4a3a;
  font-weight: 600;
  letter-spacing: 0.5px;
}
</style>
