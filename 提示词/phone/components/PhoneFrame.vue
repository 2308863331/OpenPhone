<template>
  <div class="phone-universe">
    <div class="ambient-glow">
      <div class="glow-orb orb-main"></div>
      <div class="glow-orb orb-secondary"></div>
      <div class="glow-ambient"></div>
    </div>

    <div class="phone-artifact">
      <div class="device-body">
        <div class="dynamic-island">
          <div class="island-camera"></div>
        </div>

        <div class="screen-container">
          <slot></slot>
          <div class="home-indicator"></div>
        </div>

        <div class="device-shine"></div>
      </div>

      <div class="shadow-layer"></div>
    </div>
  </div>
</template>

<style scoped>
.phone-universe {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #faf8f5 0%, #f5ece4 50%, #ede4db 100%);
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
}

.ambient-glow {
  position: absolute;
  inset: -30%;
  pointer-events: none;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
}

.orb-main {
  width: 700px; height: 700px;
  top: 10%; left: 15%;
  background:
    radial-gradient(circle,
      rgba(255,200,220,0.20) 0%,
      rgba(255,180,200,0.12) 30%,
      rgba(255,160,180,0.05) 55%,
      transparent 70%
    );
}

.orb-secondary {
  width: 600px; height: 600px;
  bottom: 15%; right: 10%;
  background:
    radial-gradient(circle,
      rgba(180,210,240,0.18) 0%,
      rgba(160,195,230,0.10) 35%,
      rgba(140,180,220,0.04) 58%,
      transparent 72%
    );
}

.glow-ambient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 40% 45%, rgba(255,250,245,0.15) 0%, transparent 50%);
}

.phone-artifact {
  position: relative;
  z-index: 1;
}

.device-body {
  width: 380px;
  height: 800px;
  background: linear-gradient(175deg, #0c0c0c 0%, #000000 50%, #080808 100%);
  border-radius: 58px;
  padding: 11px;
  position: relative;

  box-shadow:
    0 0 0 0.5px rgba(255,255,255,0.06),
    0 0 0 1.5px rgba(0,0,0,0.5),
    0 35px 70px -18px rgba(0,0,0,0.45),
    0 20px 45px -10px rgba(0,0,0,0.32),
    0 8px 24px rgba(0,0,0,0.18),
    0 0 100px -25px rgba(255,180,200,0.12),
    inset 0 1px 0 rgba(255,255,255,0.05),
    inset 0 -1px 0 rgba(0,0,0,0.35);

  overflow: hidden;
}

.dynamic-island {
  position: absolute;
  top: 11px;
  left: 50%;
  transform: translateX(-50%);
  width: 126px;
  height: 36px;
  background: linear-gradient(180deg, #161616 0%, #0a0a0a 100%);
  border-radius: 22px;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 2px 12px rgba(0,0,0,0.5),
    inset 0 1px 0 rgba(255,255,255,0.03);
}

.island-camera {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 35%, #3a3a3a 0%, #151515 70%, #000 100%);
  box-shadow:
    inset 0 0 2px rgba(255,255,255,0.04),
    0 0 8px rgba(0,0,0,0.6),
    0 0 16px rgba(0,0,0,0.2);
  position: relative;
}

.island-camera::after {
  content: '';
  position: absolute;
  top: 2px; left: 3px;
  width: 4px; height: 3px;
  border-radius: 50%;
  background: rgba(120,160,220,0.15);
}

.screen-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 47px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.device-shine {
  position: absolute;
  top: 6%;
  left: 8%;
  width: 22%;
  height: 38%;
  background: linear-gradient(135deg,
    rgba(255,255,255,0.03) 0%,
    transparent 60%
  );
  border-radius: 40px;
  pointer-events: none;
  z-index: 150;
}

.home-indicator {
  position: absolute;
  bottom: 9px;
  left: 50%;
  transform: translateX(-50%);
  width: 134px;
  height: 5px;
  background: rgba(0,0,0,0.18);
  border-radius: 3px;
  z-index: 200;
}

.shadow-layer {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 70px;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(ellipse,
      rgba(0,0,0,0.15) 0%,
      rgba(0,0,0,0.08) 35%,
      rgba(0,0,0,0.02) 65%,
      transparent 80%
    );
  filter: blur(20px);
}
</style>
