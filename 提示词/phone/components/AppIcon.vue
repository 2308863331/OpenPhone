<template>
  <div
    class="grid-item"
    :class="[sizeClass, { 'dragging-active': isDragging }]"
    :style="itemStyle"
    @mousedown="onDragStart($event)"
    @touchstart="onDragStart($event)"
    @click="onTap">
    <template v-if="item.size === 'standard'">
      <div class="icon-visual" :style="{ background: item.gradient }">
        <svg v-if="iconData && !iconData.type" :viewBox="iconData.viewBox" width="28" height="28">
          <path :d="iconData.d" :fill="iconData.fill" />
        </svg>
        <svg v-else-if="iconData?.type === 'multi'" :viewBox="iconData.viewBox" width="28" height="28">
          <template v-for="(el, i) in iconData.elements" :key="i">
            <component :is="el.tag" v-bind="el.attrs">
              <template v-if="el.children">
                <component v-for="(child, j) in el.children" :key="j" :is="child.tag" v-bind="child.attrs" />
              </template>
            </component>
          </template>
        </svg>
      </div>
      <span class="icon-label">{{ item.label }}</span>
      <div v-if="item.badge" class="notification-badge">{{ item.badge }}</div>
    </template>

    <template v-else>
      <div class="widget-container" :class="{ 'no-bg': item.gradient === 'transparent' }" :style="item.gradient !== 'transparent' ? { background: item.gradient } : {}">
        <div v-if="item.icon === 'widget-clock'" class="w-clock">
          <span class="w-clock-num">30</span>
          <span class="w-clock-label">行事曆</span>
        </div>
        <div v-else-if="item.icon === 'widget-photo'" class="w-photo">
          <div class="w-photo-inner">
            <div class="w-photo-phone">
              <div class="w-phone-island"></div>
              <div class="w-phone-screen"></div>
              <div class="w-phone-home"></div>
            </div>
          </div>
          <span class="w-tag">Top Widgets*</span>
        </div>
        <div v-else-if="item.icon === 'widget-circle'" class="w-circle">
          <div class="w-circle-ring">
            <svg viewBox="0 0 60 60" width="42" height="42"><text x="30" y="38" text-anchor="middle" font-size="22" fill="#667eea" font-weight="700">+</text></svg>
          </div>
          <span class="w-tag">Top Widgets*</span>
        </div>
        <div v-else-if="item.icon === 'widget-book'" class="w-book">
          <div class="w-book-page">
            <div class="w-book-line w-bl-1"></div>
            <div class="w-book-line w-bl-2"></div>
            <div class="w-book-line w-bl-3"></div>
            <svg viewBox="0 0 48 48" width="36" height="36" class="w-book-svg">
              <path d="M24 8 L24 38 M16 18 Q24 26 32 18" stroke="#7cb87c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
              <circle cx="34" cy="14" r="5" fill="#7cb87c" opacity="0.5"/>
            </svg>
          </div>
          <span class="w-tag-book">Top Widgets*</span>
        </div>
      </div>
      <span v-if="item.label && !item.icon?.startsWith('widget')" class="icon-label-large">{{ item.label }}</span>
    </template>
  </div>
</template>

<script setup>
import { computed, toRefs } from 'vue'
import { useDrag } from '../composables/useDrag'
import { icons } from '../composables/icons'

const props = defineProps({
  item: { type: Object, required: true },
  index: { type: Number, default: 0 },
  isDragging: { type: Boolean, default: false }
})

const emit = defineEmits(['tap'])

const { draggingUid, initiateDrag, context: dragContext } = useDrag()

const sizeClass = computed(() => props.item.size === 'large' ? 'large-item' : 'standard-item')

const itemStyle = computed(() => ({
  transform: `translate(${props.item.dragOffsetX || 0}px, ${props.item.dragOffsetY || 0}px)`
}))

const iconData = computed(() => icons[props.item.icon] || null)

const onDragStart = (event) => {
  initiateDrag(event, props.item)
}

const onTap = () => {
  if (draggingUid.value === props.item.uid || dragContext.hasMoved) return
  emit('tap', props.item)
}
</script>

<style scoped>
.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: grab;
  opacity: 1;
  will-change: transform;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  position: relative;
}

.grid-item.standard-item { position: relative; }
.grid-item.large-item { grid-column: span 2; grid-row: span 2; }

.grid-item:active { cursor: grabbing; }
.grid-item.dragging-active { z-index: 999 !important; }

.icon-visual {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 14px rgba(0,0,0,0.10),
    0 1px 3px rgba(0,0,0,0.06),
    inset 0 1.5px 0 rgba(255,255,255,0.35);
  overflow: hidden;
  position: relative;
}

.icon-visual::after {
  content: '';
  position: absolute;
  top: 0; left: 10%; right: 30%;
  height: 40%;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.28) 0%,
    transparent 100%
  );
  border-radius: 14px 14px 50% 50%;
  pointer-events: none;
}

.icon-label {
  font-size: 11px;
  color: #222;
  font-weight: 600;
  letter-spacing: -0.15px;
  margin-top: 5px;
  text-align: center;
  max-width: 68px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(255,255,255,0.7);
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ff3b30 0%, #ff6b6b 100%);
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  box-shadow: 0 2px 8px rgba(255,59,48,0.4);
  border: 2px solid #fff;
  z-index: 5;
}

.widget-container {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 6px 20px rgba(0,0,0,0.1),
    0 2px 6px rgba(0,0,0,0.06);
  overflow: hidden;
  position: relative;
}

.widget-container.no-bg {
  background: transparent;
  box-shadow: none;
}

.icon-label-large {
  font-size: 11px;
  color: #222;
  font-weight: 600;
  margin-top: 6px;
  text-align: center;
  text-shadow: 0 1px 2px rgba(255,255,255,0.7);
}

.w-clock { display:flex; flex-direction:column; align-items:center; gap:6px; color:#fff; }
.w-clock-num { font-size:40px; font-weight:800; letter-spacing:-1.5px; line-height:1; }
.w-clock-label { font-size:13px; font-weight:600; opacity:0.9; letter-spacing:0.5px; }

.w-photo {
  width:100%; height:100%;
  background:linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,245,248,0.95) 50%, rgba(235,238,245,0.92) 100%);
  border-radius:22px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;
}
.w-photo-inner { width:70%; height:55%; background:linear-gradient(135deg,#e8e8ed 0%,#d4d4dc 100%); border-radius:14px; display:flex; align-items:center; justify-content:center; box-shadow:inset 0 2px 8px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08); }
.w-photo-phone { width:32px; height:44px; background:linear-gradient(135deg,#333 0%,#111 100%); border-radius:8px; position:relative; }
.w-phone-island { position:absolute; top:6px; left:50%; transform:translateX(-50%); width:14px; height:4px; background:#222; border-radius:2px; }
.w-phone-screen { position:absolute; top:14px; left:50%; transform:translateX(-50%); width:18px; height:20px; background:linear-gradient(180deg,#667eea 0%,#f093fb 100%); border-radius:3px; opacity:0.6; }
.w-phone-home { position:absolute; bottom:8px; left:50%; transform:translateX(-50%); width:8px; height:8px; background:#222; border-radius:50%; }
.w-tag { position:absolute; bottom:12px; font-size:11px; color:#999; font-weight:600; letter-spacing:0.3px; }

.w-circle { width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; border-radius:22px; padding:16px; }
.w-circle-ring { width:68px; height:68px; border-radius:50%; background:linear-gradient(135deg,rgba(255,255,255,0.95) 0%,rgba(240,240,245,0.9) 100%); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 20px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,0.8); border:1px solid rgba(255,255,255,0.5); }
.w-circle .w-tag { position:static; font-size:11px; color:rgba(255,255,255,0.85); font-weight:600; letter-spacing:0.3px; }

.w-book {
  width:100%; height:100%;
  background:linear-gradient(160deg,#fdfbf7 0%,#f5f0e8 40%,#ede5d8 100%);
  border-radius:22px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;
  box-shadow:inset 0 2px 12px rgba(0,0,0,0.04);
}
.w-book-page { width:80%; height:65%; background:linear-gradient(175deg,#fff 0%,#faf8f4 100%); border-radius:12px; display:flex; align-items:center; justify-content:center; position:relative; box-shadow:0 2px 12px rgba(0,0,0,0.06); }
.w-book-line { position:absolute; left:12px; right:12px; height:2px; background:rgba(0,0,0,0.04); border-radius:1px; }
.w-bl-1 { top:10px; }
.w-bl-2 { top:16px; right:30px; }
.w-bl-3 { top:22px; right:20px; }
.w-book-svg { margin-top:8px; }
.w-tag-book { position:absolute; bottom:10px; font-size:10px; color:rgba(120,100,80,0.6); font-weight:600; }
</style>
