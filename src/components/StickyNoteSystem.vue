<template>
  <div class="sticky-note-system">
    <transition-group name="note-fall" tag="div" class="notes-container">
      <div
        v-for="note in visibleNotes"
        :key="note.id"
        class="sticky-note"
        :class="{ collected: note.isCollected, 'from-ai': note.fromAI }"
        :style="{
          left: note.position.x + '%',
          top: note.position.y + '%',
          backgroundColor: note.color,
          transform: `rotate(${getRotation(note.id)}deg)`
        }"
        @click="handleNoteClick(note)"
      >
        <div class="note-content">{{ note.content }}</div>
        <div class="note-folded-corner"></div>
        <div v-if="!note.isCollected" class="collect-indicator">点击收集</div>
      </div>
    </transition-group>

    <button v-if="canAddNote" class="add-note-btn" @click="showAddDialog = true" title="写一张便利贴">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <transition name="dialog-fade">
      <div v-if="showAddDialog" class="dialog-overlay" @click.self="showAddDialog = false">
        <div class="dialog-box">
          <h3>写一张便利贴</h3>
          <textarea
            v-model="newNoteContent"
            placeholder="写下你想说的话..."
            maxlength="100"
            rows="4"
          ></textarea>
          <div class="color-picker">
            <button
              v-for="color in noteColors"
              :key="color"
              class="color-option"
              :class="{ selected: selectedColor === color }"
              :style="{ backgroundColor: color }"
              @click="selectedColor = color"
            ></button>
          </div>
          <div class="dialog-actions">
            <button class="btn-cancel" @click="showAddDialog = false">取消</button>
            <button class="btn-confirm" @click="submitNote" :disabled="!newNoteContent.trim()">贴上去</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  notes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['add-note', 'collect-note'])

const showAddDialog = ref(false)
const newNoteContent = ref('')
const selectedColor = ref('#FFF9C4')
const canAddNote = computed(() => props.notes.length < 8)

const noteColors = ['#FFF9C4', '#FCE4EC', '#E3F2FD', '#E8F5E9', '#F3E5F5']

const visibleNotes = computed(() => props.notes.filter(n => !n.isCollected))

function getRotation(id) {
  const seed = id % 10
  return (seed - 5) * 1.5
}

function handleNoteClick(note) {
  if (!note.isCollected) {
    setTimeout(() => {
      emit('collect-note', note.id)
    }, 300)
  }
}

function submitNote() {
  if (newNoteContent.value.trim()) {
    emit('add-note', {
      content: newNoteContent.value.trim(),
      color: selectedColor.value,
      fromAI: false
    })
    newNoteContent.value = ''
    showAddDialog.value = false
    selectedColor.value = '#FFF9C4'
  }
}
</script>

<style scoped>
.sticky-note-system {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 20;
}

.notes-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.sticky-note {
  position: absolute;
  width: 160px;
  min-height: 90px;
  padding: 14px 12px 20px;
  box-shadow:
    2px 3px 10px rgba(0, 0, 0, 0.12),
    inset 0 -2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: 'Caveat', 'Ma Shan Zheng', cursive;
  animation: noteFloatIn 0.8s ease-out backwards;
}

.sticky-note::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 16px 16px 0;
  border-color: transparent rgba(0, 0, 0, 0.08) transparent transparent;
}

.note-folded-corner {
  position: absolute;
  top: 0;
  right: 0;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, transparent 50%, rgba(0, 0, 0, 0.06) 50%);
  box-shadow: -2px 2px 3px rgba(0, 0, 0, 0.08);
}

.sticky-note:hover {
  transform: translateY(-8px) rotate(0deg) scale(1.05) !important;
  box-shadow:
    4px 8px 20px rgba(0, 0, 0, 0.18),
    inset 0 -2px 4px rgba(0, 0, 0, 0.05);
  z-index: 30;
}

.sticky-note.collected {
  opacity: 0;
  transform: scale(0.5) translateY(20px);
  pointer-events: none;
}

.sticky-note.from-ai {
  border-left: 3px solid #FFB5A7;
}

.note-content {
  font-size: 15px;
  line-height: 1.5;
  color: #4a4a4a;
  word-wrap: break-word;
}

.collect-indicator {
  position: absolute;
  bottom: 6px;
  right: 8px;
  font-size: 10px;
  color: #999;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sticky-note:hover .collect-indicator {
  opacity: 1;
}

.add-note-btn {
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #FFB5A7 0%, #FF9A8B 100%);
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 181, 167, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  transition: all 0.3s ease;
  z-index: 101;
}

.add-note-btn:hover {
  transform: scale(1.1) translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 181, 167, 0.5);
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  pointer-events: auto;
}

.dialog-box {
  background: #FFF8E7;
  padding: 28px;
  border-radius: 16px;
  width: 360px;
  max-width: 90vw;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border: 2px solid #E8DCC8;
}

.dialog-box h3 {
  margin: 0 0 16px;
  color: #5a4a3a;
  font-family: 'Quicksand', sans-serif;
  font-size: 20px;
  font-weight: 600;
}

.dialog-box textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #D4B494;
  border-radius: 10px;
  background: white;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  outline: none;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.dialog-box textarea:focus {
  border-color: #FFB5A7;
}

.color-picker {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  justify-content: center;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-option:hover {
  transform: scale(1.15);
}

.color-option.selected {
  border-color: #5a4a3a;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #5a4a3a;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f0e6d8;
  color: #8a7a6a;
}

.btn-cancel:hover {
  background: #e0d4c4;
}

.btn-confirm {
  background: linear-gradient(135deg, #6B8E6B 0%, #5a7d5a 100%);
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 142, 107, 0.3);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes noteFloatIn {
  from {
    opacity: 0;
    transform: translateY(-30px) rotate(10deg) scale(0.8);
  }
  to {
    opacity: 1;
  }
}

.note-fade-enter-active {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.note-fade-leave-active {
  transition: all 0.4s ease-in;
}
.note-fade-enter-from {
  opacity: 0;
  transform: translateY(-40px) rotate(15deg) scale(0.7);
}
.note-fade-leave-to {
  opacity: 0;
  transform: scale(0.3) translateY(30px);
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}
.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>
