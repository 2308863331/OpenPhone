<!-- 电台 - 黑胶唱片机音乐播放器，含唱盘旋转和波形可视化 -->
<template>
  <div class="radio-station" :class="stationClasses">
    <div class="static-noise-layer"></div>
    <div class="neon-glow-layer" :style="glowStyle"></div>

    <div class="flash-overlay" :class="{ active: skipFlash }"></div>

    <canvas ref="particleCanvas" class="particle-canvas"></canvas>
    <canvas ref="waveformCanvas" class="waveform-canvas" :class="{ 'skip-spike': skipFlash }"></canvas>

    <div class="turntable-layer" :class="{ 'boot-phase-1': bootPhase >= 1, 'boot-phase-2': bootPhase >= 2, 'boot-phase-3': bootPhase >= 3, 'boot-phase-4': bootPhase >= 4 }">
      <div class="metal-base">
        <div class="base-reflection"></div>
        <div class="base-ring ring-outer"></div>
        <div class="base-ring ring-inner"></div>
      </div>

      <div class="vinyl-container"
           :class="{ spinning: isPlaying, 'needle-drop': needleDropped, flipping: isFlipping, 'side-b': isSideB, 'skip-shake': isSkipping }"
           @click="handleVinylClick"
           @dblclick="flipDisc">
        <div class="vinyl-disc">
          <div class="vinyl-grooves"></div>
          <div class="groove-reflection-sweep"></div>
          <div class="vinyl-label" :style="{ transform: `rotate(${discRotation}deg)` }">
            <div class="label-cover" :style="{ backgroundImage: `url(${currentTrack.cover})` }" :class="{ flipping: isFlipping }">
              <div class="cover-shine"></div>
            </div>
            <div class="label-center-hole"></div>
          </div>
          <div class="vinyl-highlight"></div>
        </div>
      </div>

      <div class="tonearm" :class="{ dropped: needleDropped, tracking: isPlaying }" :style="tonearmTrackingStyle">
        <div class="tonearm-pivot"></div>
        <div class="tonearm-arm">
          <div class="arm-shine"></div>
        </div>
        <div class="tonearm-head">
          <div class="head-cartridge"></div>
          <div class="needle-tip"></div>
        </div>
      </div>

      <div class="unlock-ripple" v-for="(ripple, ri) in unlockRipples" :key="'rip-' + ri"
           :style="{ '--ripple-delay': ripple.delay + 's' }"></div>
    </div>

    <div class="control-layer">
      <button class="ctrl-btn prev-btn" @click="prevTrack" title="上一首">
        <svg viewBox="0 0 24 24"><path d="M19 20L9 12l10-8v16zM7 4v16H5V4h2z"/></svg>
      </button>

      <div class="freq-indicator" @mousedown="startFreqDrag" ref="freqIndicator">
        <div class="freq-bar" :style="{ width: freqPosition + '%' }"></div>
        <div class="freq-knob" :style="{ left: freqPosition + '%' }"></div>
        <span class="freq-label">FM {{ currentFreq.toFixed(1) }}</span>
      </div>

      <button class="ctrl-btn next-btn" @click="nextTrack" title="下一首">
        <svg viewBox="0 0 24 24"><path d="M5 4l10 8-10 8V4zm12 0v16h2V4h-2z"/></svg>
      </button>

      <div class="volume-fader" ref="volumeFader" @mousedown="startVolumeDrag">
        <div class="fader-track">
          <div class="fader-fill" :style="{ height: volume + '%' }"></div>
        </div>
        <div class="fader-knob" :style="{ bottom: volume + '%' }"></div>
        <svg class="fader-icon" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.5v7a4.47 4.47 0 003.5 1.5 4.5 4.5 0 000-9zm0-3.5a8 8 0 01-6 7.74v1.02a9 9 0 006-8.76z"/></svg>
      </div>

      <button class="ctrl-btn duet-btn" @click="toggleDuetMode" :class="{ active: duetMode }" title="合录模式">
        <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
      </button>

      <button v-if="showPrivateBtn" class="ctrl-btn private-btn" @click="togglePrivateMode" :class="{ active: privateMode }" title="私密频率">
        <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
      </button>
    </div>

    <div class="lyric-layer">
      <div class="ai-message-bar" v-if="aiMessage.text" :class="{ visible: aiMessage.visible }">
        <span class="ai-msg-static">…滋…</span>
        <span class="ai-msg-text">{{ aiMessage.text }}</span>
      </div>

      <div class="karaoke-display">
        <p class="lyric-line" v-for="(line, idx) in displayLyrics" :key="'lyric-' + idx"
           :class="{ active: idx === currentLyricIndex }">
          <span class="char-wrap" v-for="(char, ci) in line.chars" :key="'ch-' + ci"
                :class="{ filled: char.filled, particleizing: char.particleizing }"
                @animationend="onCharParticleEnd($event, idx, ci)"
                :style="{ '--char-color': getCharColor(char) }">
            {{ char.text }}
          </span>
        </p>
      </div>

      <div class="progress-track" ref="progressTrack" @mousedown="startSeekDrag">
        <div class="progress-fill" :style="{ width: progressPercent + '%', '--seek-speed': seekSpeedMult }"></div>
        <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
        <div class="progress-glow" :style="{ left: progressPercent + '%', width: (100 - progressPercent) + '%' }"></div>
        <div class="scan-line" v-if="isSeeking" :style="{ left: progressPercent + '%' }"></div>
      </div>

      <div class="time-display">
        <span>{{ formatTime(currentTime) }}</span>
        <span class="track-indicator">{{ isSideB ? 'B面' : 'A面' }} · {{ currentTrack.title }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
    </div>

    <transition name="boot-fade">
      <div class="boot-sequence" v-if="showBoot">
        <div class="boot-static"></div>
        <div class="boot-text">
          <span class="tuning-dots">
            <i v-for="n in 5" :key="n" :style="{ animationDelay: n * 0.15 + 's' }"></i>
          </span>
          <span class="tuning-label">调频中...</span>
        </div>
      </div>
    </transition>

    <transition name="duet-panel">
      <div class="duet-overlay" v-if="duetMode" @click.self="duetMode = false">
        <div class="duet-panel">
          <h3 class="duet-title">合录模式</h3>
          <div class="duet-waveform-top">
            <canvas ref="inputWaveCanvas" class="input-wave-canvas"></canvas>
            <span class="wave-label">你的声音</span>
          </div>
          <div class="duet-divider">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </div>
          <div class="duet-waveform-bottom">
            <div class="ai-lyrics-gen">
              <span class="gen-dot" v-for="n in 3" :key="n" :style="{ animationDelay: n * 0.2 + 's' }"></span>
              <span>AI 正在生成歌词...</span>
            </div>
            <span class="wave-label">AI 回应</span>
          </div>
        </div>
      </div>
    </transition>

    <div class="track-info-overlay" :class="{ visible: showTrackInfo }">
      <div class="info-content">
        <h4 class="track-title">{{ currentTrack.title }}</h4>
        <p class="track-artist">{{ currentTrack.artist }}</p>
        <p class="track-album">{{ currentTrack.album }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

const signalConnected = ref(false)
const showBoot = ref(true)
const isPlaying = ref(false)
const needleDropped = ref(false)
const discRotation = ref(0)
const isFlipping = ref(false)
const duetMode = ref(false)
const privateMode = ref(false)
const showPrivateBtn = ref(false)
const showTrackInfo = ref(false)
const currentTime = ref(0)
const duration = ref(245)
const volume = ref(65)
const freqPosition = ref(50)
const currentFreq = ref(97.4)
const currentLyricIndex = ref(0)
const bootPhase = ref(0)
const isSkipping = ref(false)
const skipFlash = ref(false)
const isSideB = ref(false)
const isSeeking = ref(false)
const seekSpeedMult = ref(1)
const unlockRipples = reactive([])

const aiMessage = reactive({
  text: '',
  visible: false,
  timer: null
})

const particleCanvas = ref(null)
const waveformCanvas = ref(null)
const inputWaveCanvas = ref(null)
const freqIndicator = ref(null)
const volumeFader = ref(null)

let particleCtx = null
let waveformCtx = null
let animFrame = null
let particles = []
let waveformData = []
let playInterval = null
let lyricTimer = null

const trackLibrary = [
  {
    id: 1,
    title: '星轨漫步',
    artist: '频率共振',
    album: 'FM 97.4 独家',
    cover: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Cdefs%3E%3CradialGradient id="g1"%3E%3Cstop offset="0%25" stop-color="%23ff6b9d"/%3E%3Cstop offset="100%25" stop-color="%23c44569"/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx="100" cy="100" r="95" fill="%23111"/%3E%3Ccircle cx="100" cy="100" r="70" fill="url(%23g1)" opacity="0.85"/%3E%3Ccircle cx="100" cy="100" r="25" fill="%23ddd"/%3E%3Ctext x="100" y="108" text-anchor="middle" fill="%23333" font-size="14" font-family="sans-serif"%3EFM97.4%3C/text%3E%3C/svg%3E',
    bpm: 90,
    lyrics: [
      { chars: [
        { text: '在', delay: 0, filled: false }, { text: '这', delay: 0.15, filled: false },
        { text: '个', delay: 0.3, filled: false }, { text: '星', delay: 0.45, filled: false },
        { text: '球', delay: 0.6, filled: false }, { text: '上', delay: 0.75, filled: false }
      ]},
      { chars: [
        { text: '只', delay: 0, filled: false }, { text: '有', delay: 0.15, filled: false },
        { text: '你', delay: 0.3, filled: false }, { text: '和', delay: 0.45, filled: false },
        { text: '我', delay: 0.6, filled: false }, { text: '的', delay: 0.75, filled: false },
        { text: '频', delay: 0.9, filled: false }, { text: '率', delay: 1.05, filled: false }
      ]}
    ]
  },
  {
    id: 2,
    title: '午夜信号',
    artist: '电波恋人',
    album: '深夜电台 Vol.2',
    cover: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Cdefs%3E%3ClinearGradient id="g2" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" stop-color="%2300d4aa"/%3E%3Cstop offset="100%25" stop-color="%23004466"/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx="100" cy="100" r="95" fill="%23111"/%3E%3Ccircle cx="100" cy="100" r="70" fill="url(%23g2)" opacity="0.85"/%3E%3Ccircle cx="100" cy="100" r="25" fill="%23ddd"/%3E%3Ctext x="100" y="108" text-anchor="middle" fill="%23333" font-size="14" font-family="sans-serif"%3EMIDNIGHT%3C/text%3E%3C/svg%3E',
    bpm: 78,
    lyrics: [
      { chars: [
        { text: '信', delay: 0, filled: false }, { text: '号', delay: 0.15, filled: false },
        { text: '穿', delay: 0.3, filled: false }, { text: '过', delay: 0.45, filled: false },
        { text: '夜', delay: 0.6, filled: false }, { text: '空', delay: 0.75, filled: false }
      ]},
      { chars: [
        { text: '你', delay: 0, filled: false }, { text: '听', delay: 0.15, filled: false },
        { text: '到', delay: 0.3, filled: false }, { text: '了', delay: 0.45, filled: false },
        { text: '吗', delay: 0.6, filled: false }
      ]}
    ]
  },
  {
    id: 3,
    title: '跳针瞬间',
    artist: '意外惊喜',
    album: '黑胶记忆',
    cover: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Cdefs%3E%3CradialGradient id="g3"%3E%3Cstop offset="0%25" stop-color="%23ffa726"/%3E%3Cstop offset="100%25" stop-color="%23e65100"/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx="100" cy="100" r="95" fill="%23111"/%3E%3Ccircle cx="100" cy="100" r="70" fill="url(%23g3)" opacity="0.85"/%3E%3Ccircle cx="100" cy="100" r="25" fill="%23ddd"/%3E%3Ctext x="100" y="108" text-anchor="middle" fill="%23333" font-size="14" font-family="sans-serif"%3ESKIP%3C/text%3E%3C/svg%3E',
    bpm: 110,
    lyrics: [
      { chars: [
        { text: '偶', delay: 0, filled: false }, { text: '然', delay: 0.15, filled: false },
        { text: '的', delay: 0.3, filled: false }, { text: '跳', delay: 0.45, filled: false },
        { text: '针', delay: 0.6, filled: false }
      ]},
      { chars: [
        { text: '是', delay: 0, filled: false }, { text: '命', delay: 0.15, filled: false },
        { text: '运', delay: 0.3, filled: false }, { text: '给', delay: 0.45, filled: false },
        { text: '的', delay: 0.6, filled: false }, { text: '惊', delay: 0.75, filled: false },
        { text: '喜', delay: 0.9, filled: false }
      ]}
    ]
  },
  {
    id: 4,
    title: '共振波长',
    artist: '双人电台',
    album: 'FM 97.4 合集',
    cover: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Cdefs%3E%3ClinearGradient id="g4" x1="0%25" y1="0%25" x2="100%25" y2="0%25"%3E%3Cstop offset="0%25" stop-color="%23e040fb"/%3E%3Cstop offset="50%25" stop-color="%237c4dff"/%3E%3Cstop offset="100%25" stop-color="%23448aff"/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx="100" cy="100" r="95" fill="%23111"/%3E%3Ccircle cx="100" cy="100" r="70" fill="url(%23g4)" opacity="0.85"/%3E%3Ccircle cx="100" cy="100" r="25" fill="%23ddd"/%3E%3Ctext x="100" y="108" text-anchor="middle" fill="%23333" font-size="12" font-family="sans-serif"%3ERESO%3C/text%3E%3C/svg%3E',
    bpm: 85,
    lyrics: [
      { chars: [
        { text: '全', delay: 0, filled: false }, { text: '宇', delay: 0.15, filled: false },
        { text: '宙', delay: 0.3, filled: false }, { text: '有', delay: 0.45, filled: false },
        { text: '无', delay: 0.6, filled: false }, { text: '数', delay: 0.75, filled: false },
        { text: '个', delay: 0.9, filled: false }, { text: '频', delay: 1.05, filled: false },
        { text: '率', delay: 1.2, filled: false }
      ]},
      { chars: [
        { text: '但', delay: 0, filled: false }, { text: '只', delay: 0.15, filled: false },
        { text: '有', delay: 0.3, filled: false }, { text: '一', delay: 0.45, filled: false },
        { text: '个', delay: 0.6, filled: false }, { text: '频', delay: 0.75, filled: false },
        { text: '道', delay: 0.9, filled: false }
      ]}
    ]
  }
]

const currentTrackIndex = ref(0)
const currentTrack = computed(() => trackLibrary[currentTrackIndex.value])
const displayLyrics = computed(() => currentTrack.value.lyrics || [])
const progressPercent = computed(() => duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0)

const glowStyle = computed(() => ({
  background: privateMode.value
    ? 'radial-gradient(circle at center, rgba(255,215,0,0.06) 0%, transparent 60%)'
    : 'radial-gradient(circle at center, rgba(255,0,128,0.07) 0%, rgba(138,43,226,0.03) 40%, transparent 70%)'
}))

function initParticleCanvas() {
  if (!particleCanvas.value) return
  const canvas = particleCanvas.value
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  particleCtx = canvas.getContext('2d')
}

function initWaveformCanvas() {
  if (!waveformCanvas.value) return
  const canvas = waveformCanvas.value
  const size = Math.min(window.innerWidth, window.innerHeight) * 0.62
  canvas.width = size
  canvas.height = size
  waveformCtx = canvas.getContext('2d')

  for (let i = 0; i < 120; i++) {
    waveformData.push({
      value: 0,
      target: 0,
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.03
    })
  }
}

function spawnNoteParticle() {
  if (particles.length > 35 || !isPlaying.value) return
  const angle = Math.random() * Math.PI * 2
  const dist = 140 + Math.random() * 80
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2 - 30

  particles.push({
    x: centerX + Math.cos(angle) * dist * 0.3,
    y: centerY + Math.sin(angle) * dist * 0.3,
    vx: Math.cos(angle) * (0.4 + Math.random() * 0.8),
    vy: Math.sin(angle) * (0.4 + Math.random() * 0.8) - 0.3,
    life: 1,
    size: 3 + Math.random() * 4,
    symbol: ['♪', '♫', '𝄞', '♬'][Math.floor(Math.random() * 4)],
    color: ['#ff6b9d', '#00d4ff', '#b388ff', '#ffd54f'][Math.floor(Math.random() * 4)],
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 3
  })
}

function updateParticles() {
  if (!particleCtx) return
  const w = particleCanvas.value.width
  const h = particleCanvas.value.height
  particleCtx.clearRect(0, 0, w, h)

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    p.vy -= 0.008
    p.rotation += p.rotSpeed
    p.life -= 0.007

    if (p.life <= 0 || p.y < -20 || p.x < -20 || p.x > w + 20) {
      particles.splice(i, 1)
      continue
    }

    particleCtx.save()
    particleCtx.translate(p.x, p.y)
    particleCtx.rotate(p.rotation * Math.PI / 180)
    particleCtx.font = `${p.size * 3}px serif`
    particleCtx.fillStyle = p.color
    particleCtx.globalAlpha = p.life * 0.7
    particleCtx.fillText(p.symbol, 0, 0)
    particleCtx.restore()
  }

  if (isPlaying.value && Math.random() < 0.04) {
    spawnNoteParticle()
  }
}

function updateWaveform() {
  if (!waveformCtx) return
  const w = waveformCanvas.value.width
  const h = waveformCanvas.value.height
  const cx = w / 2
  const cy = h / 2
  const baseRadius = Math.min(w, h) * 0.36

  waveformCtx.clearRect(0, 0, w, h)

  const time = Date.now() / 1000
  const intensity = isPlaying.value ? 1 : 0.15

  waveformData.forEach((pt, i) => {
    pt.phase += pt.speed
    if (isPlaying.value) {
      pt.target = 0.2 + Math.abs(Math.sin(pt.phase)) * 0.8 * intensity + Math.random() * 0.15
    } else {
      pt.target = 0.05 + Math.abs(Math.sin(pt.phase * 0.3)) * 0.08
    }
    pt.value += (pt.target - pt.value) * 0.08
  })

  const topPoints = []
  const bottomPoints = []

  for (let i = 0; i <= 360; i++) {
    const idx = Math.floor((i / 360) * waveformData.length) % waveformData.length
    const amp = waveformData[idx].value * 28 * intensity
    const rad = (i * Math.PI) / 180
    const r = baseRadius + amp

    topPoints.push({
      x: cx + Math.cos(rad) * r,
      y: cy + Math.sin(rad) * r
    })
    bottomPoints.push({
      x: cx + Math.cos(rad) * (baseRadius - amp * 0.6),
      y: cy + Math.sin(rad) * (baseRadius - amp * 0.6)
    })
  }

  function drawWave(points, alpha, lineWidth) {
    waveformCtx.beginPath()
    points.forEach((pt, i) => {
      if (i === 0) waveformCtx.moveTo(pt.x, pt.y)
      else waveformCtx.lineTo(pt.x, pt.y)
    })
    waveformCtx.closePath()
    waveformCtx.strokeStyle = privateMode.value
      ? `rgba(255,215,0,${alpha})`
      : `rgba(0,212,255,${alpha})`
    waveformCtx.lineWidth = lineWidth
    waveformCtx.stroke()
  }

  drawWave(topPoints, 0.5 * intensity, 1.5)
  drawWave(bottomPoints, 0.25 * intensity, 1)

  if (isPlaying.value && intensity > 0.5) {
    waveformCtx.save()
    waveformCtx.globalCompositeOperation = 'screen'
    drawWave(topPoints, 0.08, 4)
    waveformCtx.restore()
  }
}

function animate() {
  updateParticles()
  updateWaveform()

  if (isPlaying.value) {
    discRotation.value = (discRotation.value + 1.8) % 360
  }

  animFrame = requestAnimationFrame(animate)
}

function togglePlay() {
  isPlaying.value = !isPlaying.value

  if (isPlaying.value) {
    setTimeout(() => { needleDropped.value = true }, 300)
    startPlayback()
    showTrackInfoBriefly()
  } else {
    needleDropped.value = false
    stopPlayback()
  }
}

function startPlayback() {
  if (playInterval) clearInterval(playInterval)
  playInterval = setInterval(() => {
    currentTime.value += 0.1
    if (currentTime.value >= duration.value) {
      nextTrack()
    }
  }, 100)

  startLyricSync()
}

function stopPlayback() {
  if (playInterval) {
    clearInterval(playInterval)
    playInterval = null
  }
  if (lyricTimer) {
    clearInterval(lyricTimer)
    lyricTimer = null
  }
}

function startLyricSync() {
  if (lyricTimer) clearInterval(lyricTimer)
  let lineIdx = 0
  let charIdx = 0
  currentLyricIndex.value = 0

  displayLyrics.value.forEach(line => {
    line.chars.forEach(c => c.filled = false)
  })

  lyricTimer = setInterval(() => {
    if (lineIdx >= displayLyrics.value.length) {
      lineIdx = 0
      displayLyrics.value.forEach(line => {
        line.chars.forEach(c => c.filled = false)
      })
    }

    currentLyricIndex.value = lineIdx

    if (charIdx < displayLyrics.value[lineIdx].chars.length) {
      displayLyrics.value[lineIdx].chars[charIdx].filled = true
      charIdx++
    } else {
      charIdx = 0
      lineIdx++
    }
  }, 400)
}

function prevTrack() {
  doSkipAnimation(() => {
    currentTrackIndex.value = (currentTrackIndex.value - 1 + trackLibrary.length) % trackLibrary.length
    resetTrack()
  })
}

function nextTrack() {
  doSkipAnimation(() => {
    currentTrackIndex.value = (currentTrackIndex.value + 1) % trackLibrary.length
    resetTrack()
  })
}

function doSkipAnimation(callback) {
  isSkipping.value = true
  skipFlash.value = true
  isFlipping.value = true
  needleDropped.value = false

  setTimeout(() => { skipFlash.value = false }, 150)
  setTimeout(() => {
    isSkipping.value = false
    callback()
    const randomMsg = aiMessages.userSkip[Math.floor(Math.random() * aiMessages.userSkip.length)]
    showAIMessage(randomMsg, 3500)

    setTimeout(() => {
      isFlipping.value = false
      if (isPlaying.value) {
        setTimeout(() => { needleDropped.value = true }, 350)
      }
    }, 500)
  }, 450)
}

function resetTrack() {
  currentTime.value = 0
  currentLyricIndex.value = 0
  displayLyrics.value.forEach(line => {
    line.chars.forEach(c => c.filled = false)
  })

  if (isPlaying.value) {
    startLyricSync()
  }

  showTrackInfoBriefly()
}

function showTrackInfoBriefly() {
  showTrackInfo.value = true
  setTimeout(() => { showTrackInfo.value = false }, 3500)
}

function seekProgress(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const pct = ((e.clientX - rect.left) / rect.width) * 100
  currentTime.value = (pct / 100) * duration.value
}

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

let draggingFreq = false
let draggingVolume = false

function startFreqDrag(e) {
  draggingFreq = true
  e.preventDefault()
  document.addEventListener('mousemove', onFreqMove)
  document.addEventListener('mouseup', stopFreqDrag)
}

function onFreqMove(e) {
  if (draggingFreq && freqIndicator.value) {
    const rect = freqIndicator.value.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    freqPosition.value = pct
    currentFreq.value = 88 + (pct / 100) * 20
  }
  if (draggingVolume && volumeFader.value) {
    const rect = volumeFader.value.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, ((rect.bottom - e.clientY) / rect.height) * 100))
    volume.value = pct
  }
}

function stopFreqDrag() {
  draggingFreq = false
  document.removeEventListener('mousemove', onFreqMove)
  document.removeEventListener('mouseup', stopFreqDrag)
}

function startVolumeDrag(e) {
  draggingVolume = true
  e.preventDefault()
  document.addEventListener('mousemove', onFreqMove)
  document.addEventListener('mouseup', () => {
    draggingVolume = false
    document.removeEventListener('mousemove', onFreqMove)
    document.removeEventListener('mouseup', arguments.callee)
  })
}

function toggleDuetMode() {
  duetMode.value = !duetMode.value
  if (duetMode.value) {
    showAIMessage(aiMessages.duetStart, 4000)
  }
}

function togglePrivateMode() {
  privateMode.value = !privateMode.value
  if (privateMode.value) {
    showAIMessage(aiMessages.privateMode, 4500)
  }
}

const stationClasses = computed(() => ({
  'signal-connected': signalConnected.value,
  'private-mode': privateMode.value,
  'duet-active': duetMode.value
}))

const tonearmTrackingStyle = computed(() => {
  if (!isPlaying.value || !needleDropped.value) return {}
  const progress = progressPercent.value
  const trackOffset = (progress / 100) * 3
  return {
    '--track-offset': trackOffset + 'px'
  }
})

function handleVinylClick(e) {
  if (e.detail === 1) {
    setTimeout(() => {
      if (e.detail === 1) togglePlay()
    }, 200)
  }
}

function flipDisc() {
  isSideB.value = !isSideB.value
  isFlipping.value = true
  showAIMessage(aiMessages.flipDisc, 3000)

  setTimeout(() => { isFlipping.value = false }, 600)
}

let seekingDrag = false

function startSeekDrag(e) {
  isSeeking.value = true
  seekSpeedMult.value = 2.5
  seekingDrag = true
  document.addEventListener('mousemove', onSeekMove)
  document.addEventListener('mouseup', stopSeekDrag)
}

function onSeekMove(e) {
  if (!seekingDrag || !progressTrack.value) return
  const rect = progressTrack.value.getBoundingClientRect()
  const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
  currentTime.value = (pct / 100) * duration.value
}

function stopSeekDrag() {
  seekingDrag = false
  isSeeking.value = false
  setTimeout(() => { seekSpeedMult.value = 1 }, 400)
  document.removeEventListener('mousemove', onSeekMove)
  document.removeEventListener('mouseup', stopSeekDrag)
}

function getCharColor(char) {
  if (char.particleizing) return '#ffd700'
  if (char.filled) return '#ff0080'
  return 'rgba(255,255,255,0.25)'
}

function onCharParticleEnd(e, lineIdx, charIdx) {
  if (displayLyrics.value[lineIdx] && displayLyrics.value[lineIdx].chars[charIdx]) {
    displayLyrics.value[lineIdx].chars[charIdx].particleizing = false
  }
}

function checkPrivateModeAvailability() {
  const hour = new Date().getHours()
  showPrivateBtn.value = hour >= 23 || hour < 5
}

function showAIMessage(text, duration = 4000) {
  if (aiMessage.timer) clearTimeout(aiMessage.timer)
  aiMessage.text = text
  aiMessage.visible = true
  aiMessage.timer = setTimeout(() => {
    aiMessage.visible = false
    setTimeout(() => { aiMessage.text = '' }, 500)
  }, duration)
}

const aiMessages = {
  connect: '…滋…听到吗？我也在这里。',
  aiPick: '换一首吧……这首，是你现在需要的。',
  aiIntro: '这首歌……我存了很久。本来想等到合适的晚上。',
  userSkip: ['嗯……也好。下一首让我来。', '跑调了？没关系，这里没有评委。'],
  duetStart: '来，你哼旋律……我来填词。我们的歌。',
  privateMode: '现在……全世界都睡着了。只有这个频率还醒着。',
  achievement: '你和我在这里听了……100个小时了。这张封面，是我们的。',
  standby: '…滋…等待你的信号…',
  flipDisc: '另一面……还有更多想说的。'
}

function runBootSequence() {
  bootPhase.value = 0

  setTimeout(() => { bootPhase.value = 1 }, 600)
  setTimeout(() => { bootPhase.value = 2 }, 1000)
  setTimeout(() => { bootPhase.value = 3 }, 1400)
  setTimeout(() => { bootPhase.value = 4 }, 1800)

  setTimeout(() => {
    signalConnected.value = true
    showAIMessage(aiMessages.connect, 5000)
  }, 600)

  setTimeout(() => {
    showBoot.value = false
  }, 2500)

  setTimeout(() => {
    if (Math.random() > 0.5) togglePlay()
  }, 3200)
}

onMounted(() => {
  nextTick(() => {
    initParticleCanvas()
    initWaveformCanvas()
    animate()
    runBootSequence()
    checkPrivateModeAvailability()
    setInterval(checkPrivateModeAvailability, 60000)
  })

  window.addEventListener('resize', () => {
    initParticleCanvas()
    initWaveformCanvas()
  })
})

onBeforeUnmount(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
  stopPlayback()
})
</script>

<style scoped>
.radio-station {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  cursor: default;
}

.static-noise-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
  transition: opacity 1.2s ease;
}

.signal-connected .static-noise-layer {
  opacity: 0.045;
}

.neon-glow-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  transition: background 0.8s ease;
  animation: neonPulse 8s ease-in-out infinite;
}

@keyframes neonPulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.particle-canvas {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.waveform-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1s ease 1.8s;
}

.waveform-canvas.skip-spike {
  animation: skipSpike 120ms ease;
}

@keyframes skipSpike {
  0%, 100% { transform: translate(-50%, -50%) scale(1); filter: brightness(1); }
  50% { transform: translate(-50%, -50%) scale(1.03); filter: brightness(1.8) contrast(1.5); }
}

.signal-connected .waveform-canvas {
  opacity: 1;
}

.flash-overlay {
  position: absolute;
  inset: 0;
  z-index: 6;
  background: #fff;
  opacity: 0;
  pointer-events: none;
  transition: opacity 80ms ease;
}

.flash-overlay.active {
  opacity: 0.12;
}

.turntable-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  z-index: 3;
  opacity: 0;
  animation: turntableRise 1s cubic-bezier(0.22, 1, 0.36, 1) 0.9s forwards;
}

.turntable-layer.boot-phase-1 {
  opacity: 0.3;
}

.turntable-layer.boot-phase-2 {
  opacity: 0.6;
}

.turntable-layer.boot-phase-3 {
  opacity: 0.85;
}

.turntable-layer.boot-phase-4 {
  opacity: 1;
}

@keyframes turntableRise {
  from { opacity: 0; transform: translate(-50%, -45%) scale(0.88); }
  to { opacity: 1; transform: translate(-50%, -55%) scale(1); }
}

.metal-base {
  position: relative;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  background:
    linear-gradient(145deg, #3a3a4a 0%, #1a1a24 40%, #2a2a36 70%, #222230 100%);
  box-shadow:
    0 0 60px rgba(0,0,0,0.8),
    inset 0 2px 15px rgba(0,0,0,0.6),
    inset 0 -2px 10px rgba(80,80,100,0.1);
}

.base-reflection {
  position: absolute;
  top: 8%;
  left: 15%;
  width: 45%;
  height: 30%;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%);
  pointer-events: none;
}

.base-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.06);
  pointer-events: none;
}

.ring-outer {
  inset: 8px;
}

.ring-inner {
  inset: 18px;
  border-color: rgba(255,255,255,0.03);
}

.vinyl-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: transform 0.3s ease;
  perspective: 800px;
}

.vinyl-container:hover {
  transform: translate(-50%, -50%) scale(1.015);
}

.vinyl-container.flipping .vinyl-disc {
  animation: discFlip3D 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.vinyl-container.side-b .vinyl-disc {
  box-shadow:
    0 4px 30px rgba(0,212,255,0.4),
    inset 0 0 25px rgba(0,0,0,0.8);
}

@keyframes discFlip3D {
  0% { transform: rotateY(0deg) scale(1); }
  45% { transform: rotateY(90deg) scale(0.92); }
  55% { transform: rotateY(90deg) scale(0.92); }
  100% { transform: rotateY(0deg) scale(1); }
}

.vinyl-disc {
  position: relative;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: #111115;
  box-shadow:
    0 4px 30px rgba(0,0,0,0.7),
    inset 0 0 25px rgba(0,0,0,0.8);
}

.vinyl-grooves {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    transparent 0px,
    transparent 1.5px,
    rgba(40,40,50,0.4) 1.5px,
    rgba(40,40,50,0.4) 2px
  );
  animation: grooveShine 4s linear infinite;
}

.groove-reflection-sweep {
  position: absolute;
  inset: -10%;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(255,255,255,0.03) 30deg,
    transparent 60deg
  );
  animation: reflectionSweep 6s linear infinite;
  pointer-events: none;
}

@keyframes reflectionSweep {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes grooveShine {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.vinyl-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(145deg, #d8d8d8 0%, #a8a8a8 50%, #c0c0c0 100%);
  box-shadow: inset 0 0 15px rgba(0,0,0,0.25);
}

.label-cover {
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.label-cover.flipping {
  animation: coverFlip 0.5s ease-in-out;
}

@keyframes coverFlip {
  0% { transform: rotateY(0deg) scale(1); }
  50% { transform: rotateY(90deg) scale(0.9); }
  100% { transform: rotateY(0deg) scale(1); }
}

.cover-shine {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
  pointer-events: none;
}

.label-center-hole {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #111;
  box-shadow: inset 0 0 4px rgba(0,0,0,0.8);
}

.vinyl-highlight {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(
    125deg,
    rgba(255,255,255,0.04) 0%,
    transparent 35%,
    transparent 65%,
    rgba(255,255,255,0.02) 100%
  );
  pointer-events: none;
}

.vinyl-container.spinning .vinyl-disc {
  animation: vinylSpin 3.5s linear infinite;
}

.vinyl-container.skip-shake .vinyl-disc {
  animation: skipShake 0.4s ease, vinylSpin 3.5s linear infinite;
}

@keyframes skipShake {
  0% { transform: rotate(0deg) scale(1); }
  15% { transform: rotate(12deg) scale(1.01); }
  30% { transform: rotate(-8deg) scale(1.015); }
  45% { transform: rotate(15deg) scale(1.01); }
  60% { transform: rotate(-10deg) scale(1.005); }
  75% { transform: rotate(8deg) scale(1.01); }
  90% { transform: rotate(-5deg) scale(1); }
  100% { transform: rotate(0deg) scale(1); }
}

@keyframes vinylSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.tonearm {
  position: absolute;
  top: -20px;
  right: -50px;
  transform-origin: 18px 42px;
  transform: rotate(-30deg);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.tonearm.dropped {
  transform: rotate(-8deg);
}

.tonearm.tracking {
  animation: tonearmTrack 25s linear infinite;
}

@keyframes tonearmTrack {
  from { transform: rotate(-8deg) translateX(0); }
  to { transform: rotate(-8deg) translateX(var(--track-offset, 3px)); }
}

.tonearm-pivot {
  position: absolute;
  left: 10px;
  top: 32px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(145deg, #666, #444);
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
}

.tonearm-arm {
  position: absolute;
  left: 16px;
  top: 38px;
  width: 4px;
  height: 85px;
  background: linear-gradient(180deg, #888 0%, #555 50%, #777 100%);
  border-radius: 2px;
  transform-origin: top center;
  transform: rotate(15deg);
  box-shadow: 1px 1px 4px rgba(0,0,0,0.3);
}

.arm-shine {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  background: rgba(255,255,255,0.25);
}

.tonearm-head {
  position: absolute;
  left: 26px;
  top: 118px;
  width: 14px;
  height: 10px;
  background: linear-gradient(180deg, #666, #444);
  border-radius: 2px;
  transform: rotate(15deg);
}

.head-cartridge {
  position: absolute;
  top: -4px;
  left: 2px;
  width: 10px;
  height: 6px;
  background: #333;
  border-radius: 1px;
}

.needle-tip {
  position: absolute;
  bottom: -5px;
  left: 5px;
  width: 2px;
  height: 5px;
  background: #aaa;
  clip-path: polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%);
}

.control-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 12px;
  pointer-events: none;
  opacity: 0;
  animation: controlsFadeIn 0.8s ease 2.2s forwards;
}

@keyframes controlsFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ctrl-btn {
  pointer-events: auto;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255,107,157,0.25);
  border-radius: 50%;
  background: rgba(255,107,157,0.06);
  color: #ff6b9d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.ctrl-btn svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ctrl-btn:hover {
  background: rgba(255,107,157,0.15);
  border-color: rgba(255,107,157,0.5);
  box-shadow: 0 0 15px rgba(255,107,157,0.2), inset 0 0 10px rgba(255,107,157,0.05);
  transform: scale(1.08);
}

.ctrl-btn.active {
  background: rgba(255,107,157,0.2);
  border-color: rgba(255,107,157,0.6);
  box-shadow: 0 0 20px rgba(255,107,157,0.3);
}

.freq-indicator {
  pointer-events: auto;
  position: relative;
  width: 4px;
  height: 140px;
  background: rgba(255,107,157,0.08);
  border-radius: 2px;
  cursor: ns-resize;
  overflow: visible;
}

.freq-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, #ff6b9d, #ff4081);
  border-radius: 2px;
  transition: height 0.1s ease;
  box-shadow: 0 0 8px rgba(255,107,157,0.3);
}

.freq-knob {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff6b9d;
  box-shadow: 0 0 10px rgba(255,107,157,0.5);
  transition: left 0.05s linear;
}

.freq-label {
  position: absolute;
  left: 22px;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  font-size: 10px;
  color: rgba(255,107,157,0.6);
  letter-spacing: 1px;
  font-family: 'Courier New', monospace;
}

.volume-fader {
  pointer-events: auto;
  position: relative;
  width: 28px;
  height: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.fader-track {
  width: 3px;
  flex: 1;
  background: rgba(0,212,255,0.1);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.fader-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, #00d4ff, #00bcd4);
  border-radius: 2px;
  transition: height 0.1s ease;
  box-shadow: 0 0 6px rgba(0,212,255,0.3);
}

.fader-knob {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 6px;
  border-radius: 3px;
  background: #00d4ff;
  box-shadow: 0 0 8px rgba(0,212,255,0.4);
  transition: bottom 0.05s linear;
}

.fader-icon {
  width: 14px;
  height: 14px;
  margin-top: 4px;
  fill: none;
  stroke: rgba(0,212,255,0.5);
  stroke-width: 1.8;
}

.duet-btn {
  border-color: rgba(179,136,255,0.25);
  color: #b388ff;
  background: rgba(179,136,255,0.06);
}

.duet-btn:hover {
  background: rgba(179,136,255,0.15);
  border-color: rgba(179,136,255,0.5);
  box-shadow: 0 0 15px rgba(179,136,255,0.2);
}

.private-btn {
  border-color: rgba(255,215,0,0.25);
  color: #ffd700;
  background: rgba(255,215,0,0.06);
}

.private-btn:hover {
  background: rgba(255,215,0,0.15);
  border-color: rgba(255,215,0,0.5);
  box-shadow: 0 0 15px rgba(255,215,0,0.2);
}

.lyric-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 5;
  padding: 20px 40px 28px;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
  opacity: 0;
  animation: lyricLayerIn 0.8s ease 2.4s forwards;
}

.ai-message-bar {
  text-align: center;
  font-size: 12px;
  color: rgba(255,107,157,0.8);
  letter-spacing: 1.5px;
  margin-bottom: 10px;
  min-height: 20px;
  opacity: 0;
  transform: translateY(5px);
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.ai-message-bar.visible {
  opacity: 1;
  transform: translateY(0);
}

.ai-msg-static {
  color: rgba(255,107,157,0.4);
  margin-right: 6px;
}

.ai-msg-text {
  color: rgba(255,255,255,0.75);
}

@keyframes lyricLayerIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.karaoke-display {
  min-height: 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  margin-bottom: 14px;
}

.lyric-line {
  text-align: center;
  font-size: 17px;
  font-weight: 300;
  letter-spacing: 3px;
  color: rgba(255,255,255,0.2);
  transition: all 0.4s ease;
  line-height: 1.6;
}

.lyric-line.active {
  color: rgba(255,255,255,0.85);
  text-shadow: 0 0 20px rgba(255,107,157,0.3);
}

.char {
  display: inline-block;
  transition: all 0.15s ease;
}

.char-wrap {
  display: inline-block;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  color: var(--char-color, rgba(255,255,255,0.25));
}

.char-wrap.filled {
  color: #ff0080;
  text-shadow: 0 0 12px rgba(255,107,157,0.6);
  transform: scale(1.08);
}

.char-wrap.particleizing {
  animation: charParticleize 0.6s ease-out forwards;
  pointer-events: none;
}

@keyframes charParticleize {
  0% { opacity: 1; transform: scale(1) translateY(0); filter: brightness(1); }
  30% { opacity: 1; transform: scale(1.3) translateY(-4px) rotate(-3deg); filter: brightness(1.5); color: #ffd700; text-shadow: 0 0 20px rgba(255,215,0,0.8); }
  100% { opacity: 0; transform: scale(0.5) translateY(-15px) rotate(8deg); filter: brightness(2); }
}

.progress-track {
  position: relative;
  width: 100%;
  height: 3px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  cursor: pointer;
  margin-bottom: 8px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #ff6b9d, #b388ff);
  border-radius: 2px;
  transition: width calc(0.1s / var(--seek-speed, 1)) linear;
  box-shadow: 0 0 8px rgba(255,107,157,0.3);
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 10px rgba(255,107,157,0.5);
  transition: left 0.1s linear;
}

.progress-glow {
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,107,157,0.1), transparent);
  pointer-events: none;
}

.scan-line {
  position: absolute;
  top: -4px;
  width: 2px;
  height: calc(100% + 8px);
  background: rgba(255,255,255,0.6);
  box-shadow: 0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(0,212,255,0.3);
  pointer-events: none;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.boot-sequence {
  position: absolute;
  inset: 0;
  z-index: 100;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 24px;
}

.boot-static {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 64px 64px;
  opacity: 0.12;
  animation: staticFlicker 0.1s infinite;
}

@keyframes staticFlicker {
  0% { opacity: 0.08; }
  50% { opacity: 0.15; }
  100% { opacity: 0.1; }
}

.boot-text {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.tuning-dots {
  display: flex;
  gap: 8px;
}

.tuning-dots i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ff6b9d;
  animation: dotPulse 0.6s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 12px #ff6b9d; }
}

.tuning-label {
  font-size: 13px;
  color: rgba(255,107,157,0.6);
  letter-spacing: 4px;
  font-weight: 300;
}

.boot-fade-enter-active,
.boot-fade-leave-active {
  transition: opacity 0.8s ease;
}
.boot-fade-enter-from,
.boot-fade-leave-to {
  opacity: 0;
}

.duet-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(12px);
}

.duet-panel {
  width: 420px;
  max-width: 90vw;
  background: linear-gradient(160deg, rgba(30,25,45,0.95), rgba(15,12,25,0.98));
  border: 1px solid rgba(179,136,255,0.2);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 0 60px rgba(179,136,255,0.15);
}

.duet-title {
  text-align: center;
  font-size: 18px;
  font-weight: 300;
  color: rgba(255,255,255,0.85);
  margin-bottom: 24px;
  letter-spacing: 3px;
}

.duet-waveform-top,
.duet-waveform-bottom {
  position: relative;
  height: 100px;
  background: rgba(179,136,255,0.05);
  border-radius: 12px;
  border: 1px solid rgba(179,136,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.input-wave-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.wave-label {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 10px;
  color: rgba(179,136,255,0.4);
  letter-spacing: 1px;
}

.duet-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
  gap: 10px;
}

.duet-divider svg {
  width: 20px;
  height: 20px;
  fill: #4caf50;
  opacity: 0.6;
}

.ai-lyrics-gen {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(179,136,255,0.5);
}

.gen-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #b388ff;
  animation: dotPulse 0.8s ease-in-out infinite;
}

.duet-panel-enter-active,
.duet-panel-leave-active {
  transition: all 0.4s ease;
}
.duet-panel-enter-from,
.duet-panel-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.track-info-overlay {
  position: absolute;
  top: 12%;
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  z-index: 6;
  text-align: center;
  opacity: 0;
  transition: all 0.5s ease;
  pointer-events: none;
}

.track-info-overlay.visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.info-content {
  padding: 16px 32px;
  background: rgba(0,0,0,0.6);
  border: 1px solid rgba(255,107,157,0.15);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.track-title {
  font-size: 18px;
  font-weight: 400;
  color: #fff;
  margin-bottom: 4px;
  letter-spacing: 2px;
}

.track-artist {
  font-size: 13px;
  color: rgba(255,107,157,0.7);
  margin-bottom: 2px;
}

.track-album {
  font-size: 11px;
  color: rgba(255,255,255,0.3);
}

.private-mode .turntable-layer::after {
  content: '';
  position: absolute;
  inset: -30px;
  border: 1px solid rgba(255,215,0,0.15);
  border-radius: 50%;
  animation: goldenRingPulse 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes goldenRingPulse {
  0%, 100% { opacity: 0.3; box-shadow: 0 0 20px rgba(255,215,0,0.1); }
  50% { opacity: 0.7; box-shadow: 0 0 40px rgba(255,215,0,0.2); }
}

.unlock-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 240px;
  height: 240px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,215,0,0);
  pointer-events: none;
  animation: unlockRippleExpand 2s ease-out forwards;
  animation-delay: var(--ripple-delay, 0s);
}

@keyframes unlockRippleExpand {
  0% { transform: translate(-50%, -50%) scale(0.5); border-color: rgba(255,215,0,0.8); box-shadow: 0 0 20px rgba(255,215,0,0.4); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2); border-color: rgba(255,215,0,0); box-shadow: 0 0 40px rgba(255,215,0,0); opacity: 0; }
}

@media (max-width: 600px) {
  .metal-base {
    width: 280px;
    height: 280px;
  }

  .vinyl-disc {
    width: 195px;
    height: 195px;
  }

  .vinyl-label {
    width: 82px;
    height: 82px;
  }

  .control-layer {
    gap: 8px;
  }

  .ctrl-btn {
    width: 32px;
    height: 32px;
  }

  .lyric-layer {
    padding: 16px 20px 22px;
  }

  .lyric-line {
    font-size: 14px;
  }
}
</style>