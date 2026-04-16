<!-- 糖果视频播放器 - 糖果风格视频播放器，含进度环和糖果粒子特效 -->
<template>
  <div class="candy-player" :class="{ 'is-playing': isPlaying, 'is-paused': isPaused, 'is-hovering': isHovering }">
    <!-- 背景层 -->
    <div class="background-layer"></div>
    <!-- 糖果粒子装饰 -->
    <div class="candy-particles">
      <div v-for="(particle, index) in particles" :key="index" class="particle" :style="particle.style"></div>
    </div>

    <!-- 主视频容器 -->
    <div class="video-container" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
      <!-- 视频元素 -->
      <video
        ref="videoRef"
        class="video-element"
        :src="videoSrc"
        @timeupdate="handleTimeUpdate"
        @loadedmetadata="handleLoadedMetadata"
        @ended="handleEnded"
        @waiting="isLoading = true"
        @canplay="isLoading = false"
      ></video>

      <!-- 噪点滤镜层 -->
      <div class="noise-overlay"></div>

      <!-- 进度环 -->
      <svg class="progress-ring" viewBox="0 0 400 300">
        <defs>
          <linearGradient id="jellyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFB6C1;stop-opacity:0.8" />
            <stop offset="50%" style="stop-color:#98D8C8;stop-opacity:0.6" />
            <stop offset="100%" style="stop-color:#FFE66D;stop-opacity:0.8" />
          </linearGradient>
          <filter id="ringGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect
          class="ring-bg"
          x="10"
          y="10"
          width="380"
          height="280"
          rx="40"
          fill="none"
          stroke="rgba(255, 182, 193, 0.15)"
          stroke-width="3"
        />
        <rect
          class="ring-progress"
          x="10"
          y="10"
          width="380"
          height="280"
          rx="40"
          fill="none"
          stroke="url(#jellyGradient)"
          stroke-width="3"
          :stroke-dasharray="totalPathLength"
          :stroke-dashoffset="progressOffset"
          filter="url(#ringGlow)"
        />
      </svg>

      <!-- 加载动画 -->
      <div class="loading-candy" v-if="isLoading">
        <div class="candy-spinner"></div>
        <span class="loading-text">小糖果正在加载中...</span>
      </div>

      <!-- 水波纹播放按钮 -->
      <div class="ripple-play-button" v-if="isPaused && !isLoading" @click="togglePlay">
        <div class="ripple-ring ripple-1"></div>
        <div class="ripple-ring ripple-2"></div>
        <div class="ripple-ring ripple-3"></div>
        <div class="play-icon">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path d="M8 5v14l11-7z" fill="#FFB6C1"/>
          </svg>
        </div>
      </div>

      <!-- 左侧音量控制 -->
      <transition name="slide-fade-left">
        <div class="side-control volume-control" v-if="showControls || isHovering">
          <div class="control-icon" @click="toggleMute">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path v-if="!isMuted" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/>
              <path v-else d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" fill="currentColor"/>
            </svg>
          </div>
          <div class="control-slider vertical-slider">
            <input
              type="range"
              min="0"
              max="100"
              v-model.number="volume"
              orient="vertical"
              class="slider-input"
            />
          </div>
          <span class="control-value">{{ volume }}%</span>
        </div>
      </transition>

      <!-- 右侧亮度控制 -->
      <transition name="slide-fade-right">
        <div class="side-control brightness-control" v-if="showControls || isHovering">
          <div class="control-icon">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" fill="currentColor"/>
            </svg>
          </div>
          <div class="control-slider vertical-slider">
            <input
              type="range"
              min="0"
              max="100"
              v-model.number="brightness"
              orient="vertical"
              class="slider-input"
            />
          </div>
          <span class="control-value">{{ brightness }}%</span>
        </div>
      </transition>

      <!-- 右上角状态标签 -->
      <transition name="fade-slide-down">
        <div class="status-pills" v-if="showControls || isHovering">
          <div class="status-pill fps-pill">
            <span>{{ currentFps }}帧</span>
          </div>
          <div class="status-pill quality-pill" @click="cycleQuality">
            <span>{{ qualityLabels[currentQuality] }}</span>
          </div>
        </div>
      </transition>
    </div>

    <!-- 底部标题区域 -->
    <div class="title-section">
      <h2 class="video-title">{{ videoTitle }}</h2>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CandyVideoPlayer',
  props: {
    videoSrc: {
      type: String,
      required: true,
      default: ''
    },
    videoTitle: {
      type: String,
      default: '夏 日 的 风'
    }
  },
  data() {
    return {
      isPlaying: false,
      isPaused: true,
      isLoading: false,
      showControls: false,
      isHovering: false,
      currentTime: 0,
      duration: 0,
      volume: 80,
      brightness: 60,
      isMuted: false,
      currentFps: 60,
      currentQuality: 0,
      qualityLabels: ['超清', '高清', '流畅', '省流'],
      totalPathLength: 1320,
      particles: []
    }
  },
  computed: {
    progressOffset() {
      if (this.duration === 0) return this.totalPathLength
      const progress = this.currentTime / this.duration
      return this.totalPathLength * (1 - progress)
    }
  },
  mounted() {
    this.generateParticles()
    this.playEntrance()
  },
  methods: {
    generateParticles() {
      for (let i = 0; i < 12; i++) {
        const size = 4 + Math.random() * 8
        const left = Math.random() * 100
        const top = Math.random() * 100
        const duration = 15 + Math.random() * 20
        const delay = Math.random() * 10
        const colors = ['#FFB6C1', '#98D8C8', '#FFE66D', '#DDA0DD']
        const color = colors[Math.floor(Math.random() * colors.length)]
        
        this.particles.push({
          id: i,
          style: {
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            top: `${top}%`,
            background: color,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`
          }
        })
      }
    },
    
    playEntrance() {
      setTimeout(() => {
        document.querySelector('.video-container').classList.add('container-enter')
      }, 200)
    },

    togglePlay() {
      const video = this.$refs.videoRef
      if (this.isPlaying || !this.isPaused) {
        video.pause()
        this.isPlaying = false
        this.isPaused = true
      } else {
        video.play().then(() => {
          this.isPlaying = true
          this.isPaused = false
        }).catch(err => {
          console.log('播放失败:', err)
        })
      }
    },

    handleTimeUpdate(e) {
      this.currentTime = e.target.currentTime
    },

    handleLoadedMetadata(e) {
      this.duration = e.target.duration
      this.isLoading = false
    },

    handleEnded() {
      this.isPlaying = false
      this.isPaused = true
    },

    handleMouseEnter() {
      this.isHovering = true
      this.showControls = true
    },

    handleMouseLeave() {
      this.isHovering = false
      if (this.isPlaying) {
        setTimeout(() => {
          if (!this.isHovering) {
            this.showControls = false
          }
        }, 1500)
      }
    },

    toggleMute() {
      const video = this.$refs.videoRef
      this.isMuted = !this.isMuted
      video.muted = this.isMuted
    },

    cycleQuality() {
      this.currentQuality = (this.currentQuality + 1) % this.qualityLabels.length
    }
  },
  watch: {
    volume(newVal) {
      const video = this.$refs.videoRef
      if (video) {
        video.volume = newVal / 100
        if (newVal === 0) {
          this.isMuted = true
          video.muted = true
        } else if (this.isMuted) {
          this.isMuted = false
          video.muted = false
        }
      }
    },
    brightness(newVal) {
      const container = document.querySelector('.video-container')
      if (container) {
        container.style.filter = `brightness(${newVal / 100})`
      }
    }
  }
}
</script>

<style scoped>
.candy-player {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow: hidden;
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #FFF8F0 0%, #FFE8F0 50%, #E8FFF0 100%);
  z-index: 0;
  animation: bgExpand 0.8s ease-out;
}

.candy-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.3;
  animation: particleFloat linear infinite;
}

.video-container {
  position: relative;
  z-index: 10;
  width: 800px;
  height: 500px;
  border-radius: 40px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  box-shadow:
    0 20px 60px rgba(255, 182, 193, 0.25),
    0 8px 32px rgba(152, 216, 200, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -2px 0 rgba(0, 0, 0, 0.05);
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.video-container.container-enter {
  opacity: 1;
  transform: scale(1);
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 40px;
  filter: brightness(0.6);
}

.noise-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
  border-radius: 40px;
}

.progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 11;
}

.ring-progress {
  transition: stroke-dashoffset 0.3s linear;
}

.loading-candy {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.candy-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 182, 193, 0.2);
  border-top-color: #FFB6C1;
  border-radius: 50%;
  animation: candySpin 1s linear infinite;
}

.loading-text {
  font-size: 0.9rem;
  font-weight: 300;
  letter-spacing: 0.1em;
  color: rgba(90, 100, 80, 0.7);
}

.ripple-play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 25;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ripple-ring {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px solid rgba(255, 182, 193, 0.4);
  animation: rippleExpand 2s ease-out infinite;
}

.ripple-2 {
  animation-delay: 0.5s;
  width: 140px;
  height: 140px;
}

.ripple-3 {
  animation-delay: 1s;
  width: 160px;
  height: 160px;
}

.play-icon {
  position: relative;
  z-index: 26;
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(255, 182, 193, 0.3);
  animation: playButtonBreath 3s ease-in-out infinite;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.play-icon:hover {
  transform: scale(1.1);
}

.side-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.volume-control {
  left: 20px;
}

.brightness-control {
  right: 20px;
}

.control-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(90, 100, 80, 0.7);
  transition: all 0.2s ease;
}

.control-icon:hover {
  color: #FFB6C1;
  transform: scale(1.1);
}

.control-slider {
  width: 4px;
  height: 100px;
  position: relative;
}

.vertical-slider input[type="range"] {
  writing-mode: bt-lr;
  -webkit-appearance: slider-vertical;
  width: 4px;
  height: 100px;
  margin: 0;
  background: transparent;
  outline: none;
}

.slider-input {
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.slider-input::-webkit-slider-runnable-track {
  width: 4px;
  height: 100px;
  background: linear-gradient(to bottom, #FFB6C1, #98D8C8);
  border-radius: 2px;
  opacity: 0.3;
}

.slider-input::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  border: 2px solid #FFB6C1;
  box-shadow: 0 2px 8px rgba(255, 182, 193, 0.4);
  margin-left: -5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slider-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(255, 182, 193, 0.6);
}

.control-value {
  font-size: 0.75rem;
  font-weight: 400;
  color: rgba(90, 100, 80, 0.6);
  letter-spacing: 0.05em;
}

.status-pills {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 22;
  display: flex;
  gap: 10px;
}

.status-pill {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 400;
  letter-spacing: 0.05em;
  color: rgba(90, 100, 80, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  cursor: default;
  transition: all 0.2s ease;
}

.fps-pill {
  cursor: default;
}

.quality-pill {
  cursor: pointer;
}

.quality-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 182, 193, 0.2);
  background: rgba(255, 182, 193, 0.2);
}

.title-section {
  position: relative;
  z-index: 10;
  margin-top: 32px;
  text-align: center;
  opacity: 0;
  transform: translateY(20px);
  animation: titleRise 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s forwards;
}

.video-title {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-size: 1.8rem;
  font-weight: 300;
  letter-spacing: 0.3em;
  color: rgba(90, 100, 80, 0.8);
  text-shadow: 0 2px 12px rgba(255, 182, 193, 0.2);
  line-height: 1.8;
}

/* 过渡动画 */
.slide-fade-left-enter-active,
.slide-fade-left-leave-active,
.slide-fade-right-enter-active,
.slide-fade-right-leave-active,
.fade-slide-down-enter-active,
.fade-slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-fade-left-enter-from,
.slide-fade-right-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-fade-right-enter-from,
.slide-fade-left-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-down-enter-from,
.fade-slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 关键帧动画 */
@keyframes bgExpand {
  from {
    clip-path: circle(0% at 50% 50%);
  }
  to {
    clip-path: circle(100% at 50% 50%);
  }
}

@keyframes particleFloat {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(20px, -30px) rotate(90deg);
  }
  50% {
    transform: translate(-15px, -60px) rotate(180deg);
  }
  75% {
    transform: translate(25px, -30px) rotate(270deg);
  }
}

@keyframes candySpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes rippleExpand {
  0% {
    transform: scale(0.5);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes playButtonBreath {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 32px rgba(255, 182, 193, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 40px rgba(255, 182, 193, 0.4);
  }
}

@keyframes titleRise {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 1024px) {
  .video-container {
    width: 600px;
    height: 380px;
  }
  
  .candy-player {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .video-container {
    width: 90vw;
    height: 56.25vw;
    border-radius: 28px;
  }

  .video-element {
    border-radius: 28px;
  }

  .noise-overlay {
    border-radius: 28px;
  }

  .status-pills {
    top: 12px;
    right: 12px;
  }

  .status-pill {
    padding: 6px 12px;
    font-size: 0.7rem;
  }

  .side-control {
    padding: 12px 8px;
  }

  .volume-control {
    left: 12px;
  }

  .brightness-control {
    right: 12px;
  }

  .video-title {
    font-size: 1.4rem;
  }
}
</style>