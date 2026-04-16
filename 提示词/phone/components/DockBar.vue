<template>
  <div class="dock-bar-premium">
    <div class="dock-glass">
      <div
        v-for="(item, idx) in items"
        :key="item.uid"
        class="dock-icon"
        @click="$emit('tap', item)">
        <div class="dock-icon-visual" :style="{ background: item.gradient }">
          <svg v-if="getIconData(item.icon) && !getIconData(item.icon).type" :viewBox="getIconData(item.icon).viewBox" width="26" height="26">
            <path :d="getIconData(item.icon).d" :fill="getIconData(item.icon).fill" />
          </svg>
          <svg v-else-if="getIconData(item.icon)?.type === 'multi'" :viewBox="getIconData(item.icon).viewBox" width="26" height="26">
            <template v-for="(el, i) in getIconData(item.icon).elements" :key="i">
              <component :is="el.tag" v-bind="el.attrs">
                <template v-if="el.children">
                  <component v-for="(child, j) in el.children" :key="j" :is="child.tag" v-bind="child.attrs" />
                </template>
              </component>
            </template>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { icons } from '../composables/icons'

defineProps({
  items: { type: Array, required: true }
})

defineEmits(['tap'])

const getIconData = (key) => icons[key] || null
</script>

<style scoped>
.dock-bar-premium {
  position: absolute;
  bottom: 22px;
  left: 16px;
  right: 16px;
  z-index: 100;
}

.dock-glass {
  background:
    linear-gradient(180deg,
      rgba(255,255,255,0.72) 0%,
      rgba(255,255,255,0.58) 100%
    );
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 28px;
  padding: 10px 18px 14px;
  display: flex;
  justify-content: space-around;
  align-items: center;

  box-shadow:
    0 10px 40px rgba(0,0,0,0.08),
    0 4px 16px rgba(0,0,0,0.04),
    inset 0 1.5px 0 rgba(255,255,255,0.75),
    inset 0 -1px 0 rgba(255,255,255,0.25);
  border: 0.5px solid rgba(255,255,255,0.5);
}

.dock-icon {
  cursor: pointer;
  opacity: 1;
}

.dock-icon:active {
  transform: scale(0.95);
}

.dock-icon-visual {
  width: 52px;
  height: 52px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  box-shadow:
    0 4px 14px rgba(0,0,0,0.10),
    0 2px 6px rgba(0,0,0,0.05),
    inset 0 1.5px 0 rgba(255,255,255,0.32);
}

.dock-icon-visual::after {
  content: '';
  position: absolute;
  top: 0; left: 12%; right: 28%;
  height: 42%;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.30) 0%,
    transparent 100%
  );
  border-radius: 13px 13px 50% 50%;
  pointer-events: none;
}
</style>
