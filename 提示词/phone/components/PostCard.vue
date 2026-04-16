<template>
  <div class="post-glass-card">
    <div class="polka-art-bg"></div>
    <div class="glass-surface">
      <div class="author-header">
        <div class="author-avatar" :style="{ background: post.authorGradient }">{{ post.initial }}</div>
        <div class="author-meta">
          <span class="author-name">{{ post.author }}</span>
          <span class="post-time">{{ post.timestamp }}</span>
        </div>
        <button class="follow-btn">Follow</button>
      </div>

      <div v-if="post.content" class="post-text">{{ post.content }}</div>

      <div v-if="post.images && post.images.length" class="post-images">
        <div v-for="(img, i) in post.images" :key="i" class="post-image" :style="{ background: img }"></div>
      </div>

      <div class="engagement-bar">
        <button class="engage-btn" :class="{ liked: post.isLiked }" @click="$emit('toggleLike', post.id)">
          <svg viewBox="0 0 24 24" width="15" height="15" :fill="post.isLiked ? '#FF3B30' : 'none'" :stroke="post.isLiked ? '#FF3B30' : '#A0A0A8'" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          <span>{{ formatNum(post.likes) }}</span>
        </button>
        <button class="engage-btn">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#A0A0A8" stroke-width="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span>{{ formatNum(post.comments) }}</span>
        </button>
        <button class="engage-btn">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#A0A0A8" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span>{{ formatNum(post.saves) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ post: { type: Object, required: true } })
defineEmits(['toggleLike'])
const formatNum = (n) => n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n)
</script>

<style scoped>
.post-glass-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
}

.polka-art-bg {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle 12px at 12% 8%, rgba(255,180,200,0.4) 100%, transparent 100%),
    radial-gradient(circle 8px at 32% 5%, rgba(180,200,255,0.35) 100%, transparent 100%),
    radial-gradient(circle 10px at 52% 12%, rgba(200,180,255,0.38) 100%, transparent 100%),
    radial-gradient(circle 6px at 78% 7%, rgba(180,255,220,0.3) 100%, transparent 100%),
    radial-gradient(circle 14px at 8% 28%, rgba(255,200,180,0.35) 100%, transparent 100%),
    radial-gradient(circle 8px at 28% 35%, rgba(180,220,255,0.3) 100%, transparent 100%),
    radial-gradient(circle 10px at 48% 30%, rgba(220,180,255,0.35) 100%, transparent 100%),
    radial-gradient(circle 6px at 68% 25%, rgba(180,255,200,0.28) 100%, transparent 100%),
    radial-gradient(circle 12px at 88% 20%, rgba(255,180,220,0.35) 100%, transparent 100%),
    radial-gradient(circle 8px at 18% 52%, rgba(200,200,255,0.32) 100%, transparent 100%),
    radial-gradient(circle 10px at 38% 58%, rgba(255,200,200,0.3) 100%, transparent 100%),
    radial-gradient(circle 6px at 58% 48%, rgba(180,255,240,0.28) 100%, transparent 100%),
    radial-gradient(circle 14px at 78% 55%, rgba(220,180,255,0.35) 100%, transparent 100%),
    radial-gradient(circle 8px at 92% 45%, rgba(255,220,180,0.3) 100%, transparent 100%),
    radial-gradient(circle 10px at 22% 75%, rgba(180,200,255,0.28) 100%, transparent 100%),
    radial-gradient(circle 6px at 62% 72%, rgba(255,180,200,0.32) 100%, transparent 100%),
    radial-gradient(circle 12px at 42% 85%, rgba(200,220,255,0.3) 100%, transparent 100%),
    radial-gradient(circle 8px at 82% 78%, rgba(220,200,255,0.28) 100%, transparent 100%),
    radial-gradient(circle 10px at 15% 92%, rgba(255,200,220,0.25) 100%, transparent 100%),
    radial-gradient(circle 6px at 72% 92%, rgba(180,255,220,0.25) 100%, transparent 100%),
    linear-gradient(135deg, #faf0f5 0%, #f0f0fa 50%, #faf5f0 100%);
  z-index: 0;
}

.glass-surface {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  padding: 14px 15px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.06),
    0 2px 8px rgba(0, 0, 0, 0.03);
}

.author-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.author-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.author-name {
  font-size: 13px;
  font-weight: 700;
  color: #222;
}

.post-time {
  font-size: 11px;
  color: #aaa;
}

.follow-btn {
  padding: 5px 14px;
  border-radius: 14px;
  border: none;
  background: #222;
  color: white;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.post-text {
  font-size: 13px;
  line-height: 1.7;
  color: #444;
  white-space: pre-line;
  margin-bottom: 10px;
}

.post-images {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.post-image {
  flex: 1;
  aspect-ratio: 1;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.engagement-bar {
  display: flex;
  gap: 16px;
  padding-top: 8px;
  border-top: 0.5px solid rgba(0,0,0,0.06);
}

.engage-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #A0A0A8;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 0;
  font-family: inherit;
}

.engage-btn.liked {
  color: #FF3B30;
}
</style>
