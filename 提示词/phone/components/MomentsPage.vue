<template>
  <div class="page-moments">
    <div class="moments-header-glass">
      <button class="back-btn" @click="$emit('back')">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"><polyline points="15,18 9,12 15,6"/></svg>
      </button>
      <span class="header-title">Moments</span>
      <button class="camera-btn">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="#333"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
      </button>
    </div>

    <div class="cover-banner">
      <div class="cover-gradient"></div>
      <div class="cover-avatar-row">
        <div class="cover-avatar">
          <div class="avatar-inner" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">M</div>
        </div>
        <div class="cover-name-area">
          <span class="cover-name">Moments</span>
          <span class="cover-subtitle">My Diary</span>
        </div>
      </div>
    </div>

    <div class="moments-feed">
      <PostCard
        v-for="post in feed"
        :key="post.id"
        :post="post"
        @toggle-like="$emit('toggleLike', $event)" />
    </div>
  </div>
</template>

<script setup>
import PostCard from './PostCard.vue'

defineProps({
  feed: { type: Array, required: true }
})

defineEmits(['back', 'toggleLike'])
</script>

<style scoped>
.page-moments {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  overflow-y: auto;
}

.moments-header-glass {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-bottom: 0.5px solid rgba(0,0,0,0.05);
  position: sticky; top: 0; z-index: 20;
}

.back-btn { background: none; border: none; cursor: pointer; padding: 4px; }
.header-title { font-size: 18px; font-weight: 700; color: #111; letter-spacing: -0.4px; }
.camera-btn { background: none; border: none; cursor: pointer; padding: 4px; }

.cover-banner {
  position: relative;
  height: 170px;
  margin-bottom: -30px;
}

.cover-gradient {
  position: absolute; inset: 0;
  background:
    linear-gradient(135deg,
      rgba(102,126,234,0.15) 0%,
      rgba(240,147,251,0.12) 40%,
      rgba(79,172,254,0.1) 70%,
      rgba(67,233,123,0.08) 100%
    ),
    linear-gradient(180deg, #e8e0d8 0%, #f0ebe5 50%, #f5f1ec 100%);
}

.cover-avatar-row {
  position: absolute;
  bottom: -28px;
  left: 20px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  z-index: 10;
}

.cover-avatar {
  width: 68px; height: 68px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 3px 12px rgba(0,0,0,0.12);
  overflow: hidden;
}

.avatar-inner {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: 700; font-size: 24px;
}

.cover-name-area { padding-bottom: 6px; }
.cover-name { font-size: 17px; font-weight: 800; color: #222; display: block; }
.cover-subtitle { font-size: 13px; color: #888; font-weight: 500; }

.moments-feed {
  padding: 40px 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
