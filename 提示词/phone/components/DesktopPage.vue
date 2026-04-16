<template>
  <div class="page-desktop">
    <div class="dream-wallpaper">
      <div class="wallpaper-base"></div>
    </div>

    <div class="icon-grid-system">
      <AppIcon
        v-for="(item, index) in apps"
        :key="item.uid"
        :item="item"
        :index="index"
        :isDragging="draggingUid === item.uid"
        @tap="$emit('appTap', item)" />
    </div>

    <div class="page-dots">
      <span class="dot active-dot"></span>
      <span class="dot" v-for="i in 4" :key="i"></span>
    </div>

    <DockBar :items="dockApps" @tap="$emit('dockTap', $event)" />
  </div>
</template>

<script setup>
import AppIcon from './AppIcon.vue'
import DockBar from './DockBar.vue'
import { useDrag } from '../composables/useDrag'

defineProps({
  apps: { type: Array, required: true },
  dockApps: { type: Array, required: true }
})

defineEmits(['appTap', 'dockTap'])

const { draggingUid } = useDrag()
</script>

<style scoped>
.page-desktop {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.dream-wallpaper {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.wallpaper-base {
  position: absolute;
  inset: -20px;
  background:
    radial-gradient(ellipse at 28% 22%,
      rgba(255,210,225,0.35) 0%,
      rgba(255,190,210,0.18) 35%,
      rgba(255,170,195,0.06) 55%,
      transparent 65%
    ),
    radial-gradient(ellipse at 75% 28%,
      rgba(200,220,245,0.30) 0%,
      rgba(180,205,235,0.15) 38%,
      rgba(160,190,225,0.04) 58%,
      transparent 68%
    ),
    radial-gradient(ellipse at 48% 78%,
      rgba(225,195,235,0.26) 0%,
      rgba(210,175,225,0.12) 40%,
      rgba(195,160,215,0.03) 58%,
      transparent 70%
    ),
    linear-gradient(175deg,
      #fefaf7 0%,
      #faf3ed 25%,
      #f5e9e1 50%,
      #efdfd5 75%,
      #e9d5ca 100%
    );
}

.icon-grid-system {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-flow: dense;
  gap: 14px 10px;
  padding: 24px 18px 98px;
  align-content: start;
}

.page-dots {
  position: absolute;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 7px;
  z-index: 90;
}

.dot {
  width: 7px; height: 7px;
  border-radius: 3.5px;
  background: rgba(140, 140, 160, 0.24);
}

.active-dot {
  width: 20px; border-radius: 3px;
  background: linear-gradient(90deg,
    rgba(110, 110, 145, 0.48) 0%,
    rgba(90, 90, 125, 0.55) 100%
  );
}
</style>
