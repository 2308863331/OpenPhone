<template>
  <div class="page-chatdetail">
    <div class="anime-bg-layer"></div>

    <!-- Header -->
    <div class="chatdetail-header-glass">
      <button class="back-btn" @click="$emit('back')">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"><polyline points="15,18 9,12 15,6"/></svg>
      </button>
      <div class="header-info">
        <span class="header-name">{{ conversation.name }}</span>
      </div>
      <button class="header-more-btn">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="#999"><circle cx="12" cy="5.5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="18.5" r="1.8"/></svg>
      </button>
    </div>

    <!-- Messages -->
    <div class="messages-scroll-area" ref="messagesContainer">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="message-bubble-wrapper"
        :class="{ 'from-me': msg.isMe }"
        :style="{}">
        <div v-if="!msg.isMe" class="bubble-avatar-small">{{ conversation.initial }}</div>
        <div class="message-bubble" :class="{ 'my-bubble': msg.isMe, 'their-bubble': !msg.isMe }">
          {{ msg.text }}
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="input-bar-area">
      <button class="plus-btn">+</button>
      <input
        v-model="draftText"
        type="text"
        placeholder="Say something..."
        @keyup.enter="sendMessage"
        class="chat-input-field" />
      <button
        class="send-btn"
        :class="{ active: draftText.trim() }"
        @click="sendMessage">
        Send
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { getChatMessages } from '../composables/appData'

const props = defineProps({
  conversation: { type: Object, required: true }
})

defineEmits(['back'])

const messagesContainer = ref(null)
const draftText = ref('')
const messages = ref(getChatMessages(props.conversation.id))

watch(() => props.conversation.id, (newId) => {
  messages.value = getChatMessages(newId)
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}, { immediate: true })

const sendMessage = () => {
  if (!draftText.value.trim()) return
  messages.value.push({ text: draftText.value.trim(), isMe: true })
  draftText.value = ''
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}
</script>

<style scoped>
.page-chatdetail {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #f5f5f5;
}

.anime-bg-layer {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg,
      rgba(200,210,230,0.06) 0%,
      rgba(220,215,225,0.04) 30%,
      transparent 60%
    ),
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(0,0,0,0.008) 10px,
      rgba(0,0,0,0.008) 20px
    );
  z-index: 0;
}

.chatdetail-header-glass {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px;
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-bottom: 0.5px solid rgba(0,0,0,0.05);
  position: relative; z-index: 20;
}

.back-btn { background: none; border: none; cursor: pointer; padding: 4px; }
.header-info { text-align: center; flex: 1; }
.header-name { font-size: 17px; font-weight: 700; color: #111; letter-spacing: -0.3px; }
.header-more-btn { background: none; border: none; cursor: pointer; padding: 4px; }

.messages-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative; z-index: 5;
}

.message-bubble-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 7px;
  max-width: 80%;
  opacity: 1;
}

.message-bubble-wrapper.from-me { align-self: flex-end; flex-direction: row-reverse; }

.bubble-avatar-small {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.message-bubble {
  padding: 11px 15px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.45;
  max-width: 240px;
  word-break: break-word;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.their-bubble {
  background: #fff;
  color: #222;
  border-bottom-left-radius: 5px;
}

.my-bubble {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-bottom-right-radius: 5px;
}

.input-bar-area {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 14px 22px;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(25px);
  border-top: 0.5px solid rgba(0,0,0,0.04);
  position: relative; z-index: 20;
}

.plus-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: none;
  border: 1.5px solid #ddd;
  color: #888;
  font-size: 22px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.plus-btn:hover { border-color: #bbb; color: #666; }

.chat-input-field {
  flex: 1;
  height: 38px;
  border: none;
  border-radius: 19px;
  background: #f2f2f7;
  padding: 0 16px;
  font-size: 15px;
  outline: none;
  font-family: inherit;
  color: #111;
  transition: all 0.25s;
}
.chat-input-field:focus { background: #ebebf0; }

.send-btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 18px;
  border: none;
  background: #ddd;
  color: #999;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: inherit;
}
.send-btn.active {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
  transform: scale(1.03);
  box-shadow: 0 4px 14px rgba(245,87,108,0.35);
}
</style>
