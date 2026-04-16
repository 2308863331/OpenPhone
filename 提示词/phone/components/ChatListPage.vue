<template>
  <div class="page-chatlist">
    <div class="chatlist-header-glass">
      <button class="back-btn" @click="$emit('back')">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15,18 9,12 15,6"/></svg>
      </button>
      <span class="header-title">Messages</span>
      <div class="header-actions">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
    </div>

    <!-- Tabs -->
    <div class="msg-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id">
        {{ tab.label }}
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </button>
      <div class="tab-indicator" :style="{ transform: `translateX(${activeTabIndex * 100}%)` }"></div>
    </div>

    <!-- Chat List -->
    <div class="chats-scroll-area">
      <div
        v-for="(conv, idx) in conversations"
        :key="conv.id"
        class="chat-row"
        :class="{ unread: conv.unread }"
        :style="{}"
        @click="$emit('openChat', conv)">
        <div class="row-avatar" :style="{ background: conv.avatarGradient }">
          {{ conv.initial }}
        </div>
        <div class="row-content">
          <div class="row-top">
            <span class="row-name">{{ conv.name }}</span>
            <span class="row-time">{{ conv.time }}</span>
          </div>
          <div class="row-bottom">
            <p class="row-preview">{{ conv.lastMessage }}</p>
            <span v-if="conv.unreadCount" class="row-unread-badge">{{ conv.unreadCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineProps({
  conversations: { type: Array, required: true }
})

defineEmits(['back', 'openChat'])

const tabs = [
  { id: 'chats', label: 'Chats' },
  { id: 'stories', label: 'Stories', badge: 3 }
]

const activeTab = ref('chats')
const activeTabIndex = computed(() => tabs.findIndex(t => t.id === activeTab.value))
</script>

<style scoped>
.page-chatlist {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.chatlist-header-glass {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-bottom: 0.5px solid rgba(0,0,0,0.05);
}

.back-btn {
  background: none; border: none; cursor: pointer;
  padding: 4px; display: flex; align-items: center;
  color: #333; transition: transform 0.2s;
}
.back-btn:hover { transform: translateX(-3px); }

.header-title { font-size: 18px; font-weight: 700; color: #111; letter-spacing: -0.4px; }

.msg-tabs {
  display: flex;
  position: relative;
  padding: 0 18px;
  margin-top: 6px;
  gap: 28px;
}

.tab-item {
  font-size: 14px;
  font-weight: 600;
  padding: 10px 4px 8px;
  background: none; border: none;
  cursor: pointer;
  color: #999;
  transition: color 0.25s;
  position: relative;
  z-index: 2;
}

.tab-item.active { color: #222; }
.tab-badge {
  margin-left: 5px;
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 8px;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 18px;
  width: calc(50% - 18px);
  height: 2.5px;
  background: #333;
  border-radius: 2px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chats-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.chat-row {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  cursor: pointer;
  opacity: 1;
  transition: background 0.2s;
}
.chat-row:hover { background: rgba(0,0,0,0.02); }
.chat-row.unread .row-name { font-weight: 800; }

.row-avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: 700; font-size: 19px;
  flex-shrink: 0; margin-right: 13px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.row-content { flex: 1; min-width: 0; }
.row-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.row-name { font-size: 16px; font-weight: 600; color: #111; }
.row-time { font-size: 12px; color: #bbb; font-weight: 500; }
.row-bottom { display: flex; justify-content: space-between; align-items: center; }
.row-preview { font-size: 14px; color: #999; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row-unread-badge {
  min-width: 21px; height: 21px;
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white; font-size: 11px; font-weight: 700;
  border-radius: 11px; display: flex; align-items: center; justify-content: center; padding: 0 6px;
}
</style>
