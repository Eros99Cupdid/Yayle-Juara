import React, { useEffect, useImperativeHandle, useRef } from 'react';
import type { AvatarId, EcoCategory, GamePhase, HudState, PowerUpType, RunSnapshot } from '../types';
import {
  GROUND_Y,
  MAX_PULL_DISTANCE,
  STAGE_DEFINITIONS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  calculateShotScore,
  calculateStarRating,
  checkCircleRectCollision,
  clampDt,
  computeLaunchVelocity,
  resolveBumperCollision,
  sampleTrajectoryPoints,
  stepProjectile,
  type BumperEntity,
  type HazardEntity,
  type ProjectileState,
  type QuizStarEntity,
  type TargetEntity,
} from '../game/physicsLogic';
import { soundEngine } from '../utils/soundEngine';

export interface EcoPhysicsCanvasHandle {
  resetStage: (stageIndex: number) => void;
  applyQuizReward: (powerUp: PowerUpType, bonusPoints: number) => void;
  launchAimedShot: () => void;
}

interface EcoPhysicsCanvasProps {
  phase: GamePhase;
  stageIndex: number;
  avatarId: AvatarId;
  bestScore: number;
  categoryLabels: Record<EcoCategory, string>;
  onHudChange: (hud: HudState) => void;
  onTriggerQuiz: () => void;
  onStageComplete: (snapshot: RunSnapshot) => void;
}

interface PooledParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  shape: 'circle' | 'leaf' | 'star';
}

interface FloatingText {
  active: boolean;
  x: number;
  y: number;
  vy: number;
  life: number;
  text: string;
  color: string;
}

const PARTICLE_POOL_SIZE = 96;
const FLOATING_TEXT_POOL_SIZE = 12;

const CATEGORY_COLORS: Record<EcoCategory, { fill: string; stroke: string; light: string }> = {
  organic: { fill: '#22c55e', stroke: '#14532d', light: '#bbf7d0' },
  plastic: { fill: '#facc15', stroke: '#713f12', light: '#fef08a' },
  paper: { fill: '#38bdf8', stroke: '#0c4a6e', light: '#bae6fd' },
  energy: { fill: '#fb923c', stroke: '#7c2d12', light: '#fed7aa' },
};

export const EcoPhysicsCanvas = React.forwardRef<EcoPhysicsCanvasHandle, EcoPhysicsCanvasProps>(
  function EcoPhysicsCanvas(
    { phase, stageIndex, avatarId, bestScore, categoryLabels, onHudChange, onTriggerQuiz, onStageComplete },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Keep live props in refs so the 60fps loop mounts once and never resets on HUD updates
    const phaseRef = useRef(phase);
    const avatarRef = useRef(avatarId);
    const bestScoreRef = useRef(bestScore);
    const categoryLabelsRef = useRef(categoryLabels);
    const onHudChangeRef = useRef(onHudChange);
    const onTriggerQuizRef = useRef(onTriggerQuiz);
    const onStageCompleteRef = useRef(onStageComplete);

    phaseRef.current = phase;
    avatarRef.current = avatarId;
    bestScoreRef.current = bestScore;
    categoryLabelsRef.current = categoryLabels;
    onHudChangeRef.current = onHudChange;
    onTriggerQuizRef.current = onTriggerQuiz;
    onStageCompleteRef.current = onStageComplete;

    // Mutable simulation state (zero React state churn inside rAF)
    const simRef = useRef<{
      stageIndex: number;
      time: number;
      hitstop: number;
      trauma: number;
      score: number;
      combo: number;
      quizzesCorrect: number;
      orbIndex: number;
      orbsLeft: number;
      maxOrbs: number;
      orbQueue: EcoCategory[];
      activePowerUp: PowerUpType;
      targets: TargetEntity[];
      bumpers: BumperEntity[];
      hazards: HazardEntity[];
      quizStar: QuizStarEntity;
      projectile: ProjectileState;
      dragging: boolean;
      pullX: number;
      pullY: number;
      keyAngleDeg: number; // 18..75 degrees
      keyPower: number; // 0.35..1.0
      mascotCheerTimer: number;
      endDelayTimer: number;
      pendingOutcome: 'victory' | 'defeat' | null;
      particles: PooledParticle[];
      particleCursor: number;
      floatingTexts: FloatingText[];
      floatingCursor: number;
      keysHeld: Set<string>;
      viewScale: number;
      viewOffsetX: number;
      viewOffsetY: number;
      canvasW: number;
      canvasH: number;
    } | null>(null);

    const buildStageSim = (idx: number) => {
      const def = STAGE_DEFINITIONS[Math.max(0, Math.min(STAGE_DEFINITIONS.length - 1, idx))];
      const particles: PooledParticle[] = Array.from({ length: PARTICLE_POOL_SIZE }, () => ({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        size: 6,
        color: '#facc15',
        shape: 'circle',
      }));
      const floatingTexts: FloatingText[] = Array.from({ length: FLOATING_TEXT_POOL_SIZE }, () => ({
        active: false,
        x: 0,
        y: 0,
        vy: -55,
        life: 0,
        text: '',
        color: '#fefce8',
      }));

      const prevCanvasW = simRef.current?.canvasW ?? 1200;
      const prevCanvasH = simRef.current?.canvasH ?? 675;
      const prevScale = simRef.current?.viewScale ?? 1;
      const prevOffX = simRef.current?.viewOffsetX ?? 0;
      const prevOffY = simRef.current?.viewOffsetY ?? 0;

      simRef.current = {
        stageIndex: def.index,
        time: 0,
        hitstop: 0,
        trauma: 0,
        score: 0,
        combo: 0,
        quizzesCorrect: 0,
        orbIndex: 0,
        orbsLeft: def.maxOrbs,
        maxOrbs: def.maxOrbs,
        orbQueue: [...def.orbQueue],
        activePowerUp: 'none',
        targets: def.targets.map((t) => ({ ...t, cleared: false, hitFlash: 0 })),
        bumpers: def.bumpers.map((b) => ({ ...b, bounceAnim: 0 })),
        hazards: def.hazards.map((h) => ({ ...h, telegraphTimer: 0 })),
        quizStar: { ...def.quizStar, collected: false, bobPhase: 0 },
        projectile: {
          active: false,
          x: def.slingshotPos.x,
          y: def.slingshotPos.y,
          vx: 0,
          vy: 0,
          radius: 21,
          category: def.orbQueue[0],
          bounces: 0,
          age: 0,
          scaleX: 1,
          scaleY: 1,
        },
        dragging: false,
        pullX: def.slingshotPos.x - 95,
        pullY: def.slingshotPos.y + 42,
        keyAngleDeg: 40,
        keyPower: 0.78,
        mascotCheerTimer: 0,
        endDelayTimer: 0,
        pendingOutcome: null,
        particles,
        particleCursor: 0,
        floatingTexts,
        floatingCursor: 0,
        keysHeld: new Set<string>(),
        viewScale: prevScale,
        viewOffsetX: prevOffX,
        viewOffsetY: prevOffY,
        canvasW: prevCanvasW,
        canvasH: prevCanvasH,
      };
      emitHud();
    };

    const spawnBurst = (
      x: number,
      y: number,
      count: number,
      colors: string[],
      shape: PooledParticle['shape'] = 'circle',
      speedMax = 280
    ) => {
      const sim = simRef.current;
      if (!sim) return;
      for (let i = 0; i < count; i++) {
        const p = sim.particles[sim.particleCursor];
        sim.particleCursor = (sim.particleCursor + 1) % PARTICLE_POOL_SIZE;
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const speed = 70 + Math.random() * speedMax;
        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed - 60;
        p.maxLife = 0.45 + Math.random() * 0.45;
        p.life = p.maxLife;
        p.size = 5 + Math.random() * 6;
        p.color = colors[i % colors.length];
        p.shape = shape;
      }
    };

    const spawnFloatingText = (x: number, y: number, text: string, color: string) => {
      const sim = simRef.current;
      if (!sim) return;
      const ft = sim.floatingTexts[sim.floatingCursor];
      sim.floatingCursor = (sim.floatingCursor + 1) % FLOATING_TEXT_POOL_SIZE;
      ft.active = true;
      ft.x = x;
      ft.y = y;
      ft.vy = -72;
      ft.life = 1.05;
      ft.text = text;
      ft.color = color;
    };

    const getCurrentOrbCategory = (): EcoCategory => {
      const sim = simRef.current;
      if (!sim) return 'organic';
      // Smart kid-friendly orb cycling: prefer a remaining uncleared target category!
      const uncleared = sim.targets.filter((t) => !t.cleared);
      if (uncleared.length > 0) {
        const queued = sim.orbQueue[sim.orbIndex % sim.orbQueue.length];
        if (uncleared.some((t) => t.category === queued)) {
          return queued;
        }
        return uncleared[sim.orbIndex % uncleared.length].category;
      }
      return sim.orbQueue[sim.orbIndex % sim.orbQueue.length] ?? 'organic';
    };

    const emitHud = () => {
      const sim = simRef.current;
      if (!sim) return;
      const def = STAGE_DEFINITIONS[sim.stageIndex];
      const cleared = sim.targets.filter((t) => t.cleared).length;
      onHudChangeRef.current({
        score: Math.round(sim.score),
        combo: sim.combo,
        stageIndex: sim.stageIndex,
        orbsLeft: sim.orbsLeft,
        maxOrbs: sim.maxOrbs,
        targetsCleared: cleared,
        totalTargets: sim.targets.length,
        currentCategory: sim.projectile.active ? sim.projectile.category : getCurrentOrbCategory(),
        activePowerUp: sim.activePowerUp,
        quizStarAvailable: !sim.quizStar.collected,
        windStrength: def.baseWind / 100,
      });
    };

    const fireProjectile = (vx: number, vy: number) => {
      const sim = simRef.current;
      if (!sim || phaseRef.current !== 'playing') return;
      if (sim.projectile.active || sim.orbsLeft <= 0 || sim.pendingOutcome) return;

      const def = STAGE_DEFINITIONS[sim.stageIndex];
      const category = getCurrentOrbCategory();
      sim.projectile = {
        active: true,
        x: def.slingshotPos.x,
        y: def.slingshotPos.y,
        vx,
        vy,
        radius: 21,
        category,
        bounces: 0,
        age: 0,
        scaleX: 0.82,
        scaleY: 1.22,
      };
      sim.orbsLeft -= 1;
      sim.orbIndex += 1;
      sim.dragging = false;
      soundEngine.playLaunch();
      spawnBurst(def.slingshotPos.x, def.slingshotPos.y, 7, ['#bbf7d0', '#fef08a', '#ffffff'], 'leaf', 140);
      emitHud();
    };

    const launchKeyboardShot = () => {
      const sim = simRef.current;
      if (!sim) return;
      const def = STAGE_DEFINITIONS[sim.stageIndex];
      const rad = (sim.keyAngleDeg * Math.PI) / 180;
      const pullDist = sim.keyPower * MAX_PULL_DISTANCE;
      const pullPt = {
        x: def.slingshotPos.x - Math.cos(rad) * pullDist,
        y: def.slingshotPos.y + Math.sin(rad) * pullDist,
      };
      const vel = computeLaunchVelocity(def.slingshotPos, pullPt);
      fireProjectile(vel.x, vel.y);
    };

    useImperativeHandle(ref, () => ({
      resetStage: (idx: number) => {
        buildStageSim(idx);
      },
      applyQuizReward: (powerUp: PowerUpType, bonusPoints: number) => {
        const sim = simRef.current;
        if (!sim) return;
        if (bonusPoints > 0) {
          sim.score += bonusPoints;
          sim.quizzesCorrect += 1;
          sim.mascotCheerTimer = 1.4;
          sim.activePowerUp = powerUp;
          if (powerUp === 'extra_orb') {
            sim.orbsLeft = Math.min(sim.maxOrbs + 2, sim.orbsLeft + 2);
          }
          const def = STAGE_DEFINITIONS[sim.stageIndex];
          spawnBurst(def.slingshotPos.x, def.slingshotPos.y - 30, 18, ['#facc15', '#4ade80', '#38bdf8', '#fb923c'], 'star', 240);
          spawnFloatingText(def.slingshotPos.x + 20, def.slingshotPos.y - 60, `+${bonusPoints} KUIS!`, '#facc15');
        }
        emitHud();
      },
      launchAimedShot: () => {
        launchKeyboardShot();
      },
    }));

    // Re-initialize when stageIndex prop changes
    useEffect(() => {
      buildStageSim(stageIndex);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stageIndex]);

    // Mount single isolated ResizeObserver, input listeners, and 60fps loop
    useEffect(() => {
      if (!simRef.current) {
        buildStageSim(stageIndex);
      }
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const updateBounds = () => {
        const rect = container.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(320, Math.floor(rect.width));
        const h = Math.max(240, Math.floor(rect.height));
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        const scale = Math.min(w / WORLD_WIDTH, h / WORLD_HEIGHT);
        const offsetX = (w - WORLD_WIDTH * scale) / 2;
        const offsetY = (h - WORLD_HEIGHT * scale) / 2;

        if (simRef.current) {
          simRef.current.canvasW = w;
          simRef.current.canvasH = h;
          simRef.current.viewScale = scale;
          simRef.current.viewOffsetX = offsetX;
          simRef.current.viewOffsetY = offsetY;
        }
      };

      updateBounds();
      const ro = new ResizeObserver(updateBounds);
      ro.observe(container);

      const screenToWorld = (clientX: number, clientY: number) => {
        const rect = canvas.getBoundingClientRect();
        const sim = simRef.current;
        if (!sim) return { x: 0, y: 0 };
        const sx = clientX - rect.left;
        const sy = clientY - rect.top;
        return {
          x: (sx - sim.viewOffsetX) / sim.viewScale,
          y: (sy - sim.viewOffsetY) / sim.viewScale,
        };
      };

      const handlePointerDown = (e: PointerEvent) => {
        const sim = simRef.current;
        if (!sim || phaseRef.current !== 'playing' || sim.projectile.active || sim.orbsLeft <= 0) return;
        const pt = screenToWorld(e.clientX, e.clientY);
        const def = STAGE_DEFINITIONS[sim.stageIndex];
        const dist = Math.hypot(pt.x - def.slingshotPos.x, pt.y - def.slingshotPos.y);
        // Generous kid-friendly grab zone around slingshot / left side
        if (dist < 240 || pt.x < 430) {
          sim.dragging = true;
          sim.pullX = pt.x;
          sim.pullY = pt.y;
          canvas.setPointerCapture?.(e.pointerId);
        }
      };

      const handlePointerMove = (e: PointerEvent) => {
        const sim = simRef.current;
        if (!sim || !sim.dragging) return;
        const pt = screenToWorld(e.clientX, e.clientY);
        sim.pullX = pt.x;
        sim.pullY = pt.y;
      };

      const handlePointerUp = () => {
        const sim = simRef.current;
        if (!sim || !sim.dragging) return;
        sim.dragging = false;
        const def = STAGE_DEFINITIONS[sim.stageIndex];
        const vel = computeLaunchVelocity(def.slingshotPos, { x: sim.pullX, y: sim.pullY });
        if (Math.hypot(vel.x, vel.y) > 95) {
          fireProjectile(vel.x, vel.y);
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        const sim = simRef.current;
        if (!sim || phaseRef.current !== 'playing') return;
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        sim.keysHeld.add(e.code);
        if (e.code === 'Space' && !e.repeat) {
          e.preventDefault();
          launchKeyboardShot();
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        simRef.current?.keysHeld.delete(e.code);
      };

      const clearHeldInputs = () => {
        if (simRef.current) {
          simRef.current.keysHeld.clear();
          simRef.current.dragging = false;
        }
      };

      canvas.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('blur', clearHeldInputs);
      document.addEventListener('visibilitychange', clearHeldInputs);

      let rafId = 0;
      let lastTs = performance.now();

      const drawScene = (sim: NonNullable<typeof simRef.current>, dpr: number) => {
        const def = STAGE_DEFINITIONS[sim.stageIndex];
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Full-bleed sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, sim.canvasH);
        if (def.theme === 'meadow') {
          skyGrad.addColorStop(0, '#bae6fd');
          skyGrad.addColorStop(0.58, '#e0f2fe');
          skyGrad.addColorStop(1, '#fef9c3');
        } else if (def.theme === 'windmill') {
          skyGrad.addColorStop(0, '#93c5fd');
          skyGrad.addColorStop(0.55, '#fde68a');
          skyGrad.addColorStop(1, '#fef3c7');
        } else {
          skyGrad.addColorStop(0, '#7dd3fc');
          skyGrad.addColorStop(0.6, '#cffafe');
          skyGrad.addColorStop(1, '#ecfccb');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, sim.canvasW, sim.canvasH);

        // Decaying trauma^2 camera shake
        const shakeMag = sim.trauma * sim.trauma * 11;
        const shakeX = shakeMag > 0.1 ? (Math.random() - 0.5) * 2 * shakeMag : 0;
        const shakeY = shakeMag > 0.1 ? (Math.random() - 0.5) * 2 * shakeMag : 0;

        ctx.translate(sim.viewOffsetX + shakeX, sim.viewOffsetY + shakeY);
        ctx.scale(sim.viewScale, sim.viewScale);

        // Warm morning sun
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(1055, 96, 46, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
        ctx.beginPath();
        ctx.arc(1055, 96, 68 + Math.sin(sim.time * 1.5) * 4, 0, Math.PI * 2);
        ctx.fill();

        // Drifting storybook clouds
        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        for (let i = 0; i < 4; i++) {
          const cx = ((i * 340 + sim.time * (12 + i * 3)) % (WORLD_WIDTH + 220)) - 110;
          const cy = 78 + (i % 2) * 44;
          ctx.beginPath();
          ctx.arc(cx, cy, 28, 0, Math.PI * 2);
          ctx.arc(cx + 26, cy - 8, 34, 0, Math.PI * 2);
          ctx.arc(cx + 56, cy, 25, 0, Math.PI * 2);
          ctx.fill();
        }

        // Far terraced emerald hills
        ctx.fillStyle = def.theme === 'river' ? '#6ee7b7' : '#86efac';
        ctx.beginPath();
        ctx.moveTo(-200, GROUND_Y);
        ctx.quadraticCurveTo(220, 415, 580, 495);
        ctx.quadraticCurveTo(920, 395, WORLD_WIDTH + 200, 485);
        ctx.lineTo(WORLD_WIDTH + 200, WORLD_HEIGHT + 200);
        ctx.lineTo(-200, WORLD_HEIGHT + 200);
        ctx.closePath();
        ctx.fill();

        // Mid rolling hills
        ctx.fillStyle = def.theme === 'windmill' ? '#4ade80' : '#34d399';
        ctx.beginPath();
        ctx.moveTo(-200, GROUND_Y);
        ctx.quadraticCurveTo(320, 495, 720, 535);
        ctx.quadraticCurveTo(1000, 480, WORLD_WIDTH + 200, 540);
        ctx.lineTo(WORLD_WIDTH + 200, WORLD_HEIGHT + 200);
        ctx.lineTo(-200, WORLD_HEIGHT + 200);
        ctx.closePath();
        ctx.fill();

        // Background wooden eco-windmill on Stage 2 (and distant accent on Stage 1)
        const drawWindmill = (wx: number, wy: number, scale: number) => {
          ctx.save();
          ctx.translate(wx, wy);
          ctx.scale(scale, scale);
          ctx.fillStyle = '#b45309';
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-22, 70);
          ctx.lineTo(-12, 0);
          ctx.lineTo(12, 0);
          ctx.lineTo(22, 70);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Rotating blades
          ctx.save();
          ctx.rotate(sim.time * (def.theme === 'windmill' ? 1.8 : 0.8));
          for (let b = 0; b < 4; b++) {
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(0, -6, 56, 12);
            ctx.strokeRect(0, -6, 56, 12);
          }
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
          ctx.restore();
        };

        if (def.theme === 'windmill') {
          drawWindmill(390, 468, 0.9);
          drawWindmill(955, 455, 0.72);
        } else if (def.theme === 'meadow') {
          drawWindmill(345, 485, 0.65);
        }

        // Ground meadow or sparkling river
        if (def.theme === 'river') {
          // Left bank grass
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(-200, GROUND_Y, 540, WORLD_HEIGHT - GROUND_Y + 200);
          // Sparkling turquoise river
          ctx.fillStyle = '#0ea5e9';
          ctx.fillRect(340, GROUND_Y, WORLD_WIDTH, WORLD_HEIGHT - GROUND_Y + 200);
          // Animated river ripples
          ctx.strokeStyle = 'rgba(224, 242, 254, 0.75)';
          ctx.lineWidth = 3;
          for (let r = 0; r < 6; r++) {
            const rx = 380 + ((r * 150 + sim.time * 42) % 800);
            const ry = GROUND_Y + 22 + (r % 2) * 26;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.quadraticCurveTo(rx + 18, ry - 5, rx + 36, ry);
            ctx.stroke();
          }
        } else {
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(-200, GROUND_Y, WORLD_WIDTH + 400, WORLD_HEIGHT - GROUND_Y + 200);
          ctx.fillStyle = '#15803d';
          ctx.fillRect(-200, GROUND_Y + 24, WORLD_WIDTH + 400, WORLD_HEIGHT - GROUND_Y + 200);
        }
        // Crisp grass rim line
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-200, GROUND_Y);
        ctx.lineTo(WORLD_WIDTH + 200, GROUND_Y);
        ctx.stroke();

        // Environmental Hazards & Force Zones
        for (const h of sim.hazards) {
          if (h.kind === 'wind_zone') {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
            ctx.strokeStyle = 'rgba(2, 132, 199, 0.45)';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.roundRect(h.x - h.width / 2, h.y - h.height / 2, h.width, h.height, 20);
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);
            // Animated wind streamlines blowing left
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 3;
            for (let s = 0; s < 4; s++) {
              const sy = h.y - h.height / 2 + 28 + s * 32;
              const offset = ((sim.time * 130 + s * 45) % (h.width - 40));
              const sx = h.x + h.width / 2 - 20 - offset;
              ctx.beginPath();
              ctx.moveTo(sx, sy);
              ctx.lineTo(sx - 34, sy);
              ctx.stroke();
            }
            ctx.restore();
          } else if (h.kind === 'bubble_lift') {
            ctx.save();
            ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
            ctx.strokeStyle = 'rgba(2, 132, 199, 0.42)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(h.x - h.width / 2, h.y - h.height / 2, h.width, h.height, 24);
            ctx.fill();
            ctx.stroke();
            // Rising bubbles
            for (let b = 0; b < 7; b++) {
              const bx = h.x - h.width / 2 + 24 + ((b * 37) % (h.width - 48));
              const by =
                h.y + h.height / 2 - ((sim.time * 95 + b * 36) % h.height);
              ctx.fillStyle = 'rgba(255,255,255,0.72)';
              ctx.strokeStyle = '#0284c7';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(bx, by, 7 + (b % 3) * 3, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
            }
            ctx.restore();
          } else if (h.kind === 'smog_patrol') {
            // Patrolling smog cloud with windup puff pulse
            const pulse = 1 + Math.sin(sim.time * 5 + h.phase) * 0.06;
            ctx.save();
            ctx.translate(h.x, h.y);
            ctx.scale(pulse, pulse);
            ctx.fillStyle = h.telegraphTimer > 0 ? '#a855f7' : '#64748b';
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(-22, 4, 22, 0, Math.PI * 2);
            ctx.arc(0, -6, 26, 0, Math.PI * 2);
            ctx.arc(24, 4, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Grumpy cute cartoon eyes so kids recognize obstacle immediately
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(-8, -2, 5, 0, Math.PI * 2);
            ctx.arc(10, -2, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(-8, -2, 2.5, 0, Math.PI * 2);
            ctx.arc(10, -2, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        // Bouncy Bumpers (Bamboo trampolines / Lily pads)
        for (const b of sim.bumpers) {
          const bounceScale = 1 + b.bounceAnim * 0.25;
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.scale(bounceScale, 2 - bounceScale);
          ctx.fillStyle = b.kind === 'lilypad' ? '#22c55e' : '#eab308';
          ctx.strokeStyle = '#14532d';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = b.kind === 'lilypad' ? '#86efac' : '#fef08a';
          ctx.beginPath();
          ctx.arc(0, 0, b.radius * 0.56, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Bobbing Golden Eco-Quiz Star
        if (!sim.quizStar.collected) {
          const starY = sim.quizStar.y + Math.sin(sim.time * 3.2) * 9;
          ctx.save();
          ctx.translate(sim.quizStar.x, starY);
          ctx.rotate(Math.sin(sim.time * 2) * 0.14);
          // Warm glow halo
          ctx.fillStyle = 'rgba(250, 204, 21, 0.34)';
          ctx.beginPath();
          ctx.arc(0, 0, sim.quizStar.radius + 12, 0, Math.PI * 2);
          ctx.fill();
          // 5-point star
          ctx.fillStyle = '#facc15';
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? sim.quizStar.radius : sim.quizStar.radius * 0.48;
            const a = (i * Math.PI) / 5 - Math.PI / 2;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#78350f';
          ctx.font = '700 18px Fredoka, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', 0, 2);
          ctx.restore();
        }

        // Eco-Targets (Bins & Solar Windmill Crystals)
        for (const t of sim.targets) {
          const palette = CATEGORY_COLORS[t.category];
          ctx.save();
          ctx.translate(t.x, t.y);
          if (t.cleared) {
            ctx.globalAlpha = 0.45;
          }

          // River eco-boat hull under moving river targets
          if (def.theme === 'river' && t.baseY > 450) {
            ctx.fillStyle = '#b45309';
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(-t.width * 0.62, t.height * 0.32);
            ctx.lineTo(t.width * 0.62, t.height * 0.32);
            ctx.lineTo(t.width * 0.45, t.height * 0.62);
            ctx.lineTo(-t.width * 0.45, t.height * 0.62);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else if (t.baseY < 450) {
            // Wooden shelf platform for elevated targets
            ctx.fillStyle = '#92400e';
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(-t.width * 0.65, t.height / 2 - 4, t.width * 1.3, 14, 6);
            ctx.fill();
            ctx.stroke();
          }

          // Target body
          ctx.fillStyle = t.hitFlash > 0 ? '#ffffff' : palette.fill;
          ctx.strokeStyle = palette.stroke;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.roundRect(-t.width / 2, -t.height / 2, t.width, t.height, 14);
          ctx.fill();
          ctx.stroke();

          // Top lid rim
          ctx.fillStyle = palette.light;
          ctx.beginPath();
          ctx.roundRect(-t.width / 2 - 5, -t.height / 2 - 6, t.width + 10, 18, 8);
          ctx.fill();
          ctx.stroke();

          // Symbol + readable category text (never hue-only!)
          ctx.fillStyle = palette.stroke;
          ctx.font = '700 14px Nunito, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const symbol =
            t.category === 'organic'
              ? '🌿'
              : t.category === 'plastic'
                ? '♻️'
                : t.category === 'paper'
                  ? '📄'
                  : '☀️';
          ctx.font = '24px sans-serif';
          ctx.fillText(t.cleared ? '✓' : symbol, 0, -4);
          ctx.font = '800 13px Nunito, sans-serif';
          ctx.fillText(categoryLabelsRef.current[t.category] ?? t.category, 0, 24);
          ctx.restore();
        }

        // Cute Animated Mascot standing next to the Eco-Catapult
        const sx = def.slingshotPos.x;
        const sy = def.slingshotPos.y;
        const cheerBounce = sim.mascotCheerTimer > 0 ? Math.abs(Math.sin(sim.time * 14)) * 20 : Math.sin(sim.time * 3) * 3;
        const mx = sx - 76;
        const my = GROUND_Y - 36 - cheerBounce;
        ctx.save();
        ctx.translate(mx, my);
        const mascotColors =
          avatarRef.current === 'kiko'
            ? { body: '#2dd4bf', ear: '#0d9488', scarf: '#38bdf8' }
            : avatarRef.current === 'nara'
              ? { body: '#fb923c', ear: '#ea580c', scarf: '#22c55e' }
              : { body: '#f59e0b', ear: '#d97706', scarf: '#16a34a' };
        // Body
        ctx.fillStyle = mascotColors.body;
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, 14, 24, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Ears
        ctx.fillStyle = mascotColors.ear;
        ctx.beginPath();
        ctx.moveTo(-20, -22);
        ctx.lineTo(-10, -46);
        ctx.lineTo(-2, -24);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(20, -22);
        ctx.lineTo(10, -46);
        ctx.lineTo(2, -24);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Head
        ctx.fillStyle = mascotColors.body;
        ctx.beginPath();
        ctx.arc(0, -14, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Cute leaf sprout on Yayle
        if (avatarRef.current === 'yayle') {
          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.ellipse(5, -42, 9, 5, -0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        // Eyes (blinking smoothly)
        const blinking = Math.sin(sim.time * 1.1) > 0.96;
        ctx.fillStyle = '#291507';
        if (blinking) {
          ctx.fillRect(-11, -17, 7, 2.5);
          ctx.fillRect(4, -17, 7, 2.5);
        } else {
          ctx.beginPath();
          ctx.arc(-8, -16, 4, 0, Math.PI * 2);
          ctx.arc(8, -16, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-9.2, -17.5, 1.4, 0, Math.PI * 2);
          ctx.arc(6.8, -17.5, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
        // Smile
        ctx.strokeStyle = '#291507';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, -10, 6, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        // Scarf
        ctx.fillStyle = mascotColors.scarf;
        ctx.strokeStyle = '#143820';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-20, 4, 40, 11, 5);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Wooden Eco-Catapult Fork (back prong)
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sx, GROUND_Y);
        ctx.lineTo(sx, sy + 28);
        ctx.lineTo(sx - 18, sy - 8);
        ctx.stroke();

        // Determine active aiming point (drag OR keyboard preview)
        let aimPullX = sim.pullX;
        let aimPullY = sim.pullY;
        if (!sim.dragging) {
          const rad = (sim.keyAngleDeg * Math.PI) / 180;
          const dist = sim.keyPower * MAX_PULL_DISTANCE;
          aimPullX = sx - Math.cos(rad) * dist;
          aimPullY = sy + Math.sin(rad) * dist;
        } else {
          const dx = aimPullX - sx;
          const dy = aimPullY - sy;
          const d = Math.hypot(dx, dy);
          if (d > MAX_PULL_DISTANCE) {
            aimPullX = sx + (dx / d) * MAX_PULL_DISTANCE;
            aimPullY = sy + (dy / d) * MAX_PULL_DISTANCE;
          }
        }

        const drawEcoOrb = (x: number, y: number, r: number, cat: EcoCategory, scX = 1, scY = 1) => {
          const p = CATEGORY_COLORS[cat];
          ctx.save();
          ctx.translate(x, y);
          ctx.scale(scX, scY);
          if (sim.activePowerUp === 'double_points') {
            ctx.fillStyle = 'rgba(250, 204, 21, 0.42)';
            ctx.beginPath();
            ctx.arc(0, 0, r + 9, 0, Math.PI * 2);
            ctx.fill();
          } else if (sim.activePowerUp === 'magnet') {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.arc(0, 0, r + 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          ctx.fillStyle = p.fill;
          ctx.strokeStyle = p.stroke;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Gloss highlight
          ctx.fillStyle = p.light;
          ctx.beginPath();
          ctx.arc(-r * 0.3, -r * 0.3, r * 0.28, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        };

        // Slingshot Rubber Band + Parabolic Trajectory Preview when ready to fire
        if (!sim.projectile.active && sim.orbsLeft > 0 && !sim.pendingOutcome) {
          const orbX = sim.dragging ? aimPullX : sx;
          const orbY = sim.dragging ? aimPullY : sy;

          // Back elastic band
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(sx - 16, sy - 6);
          ctx.lineTo(orbX, orbY);
          ctx.stroke();

          // Dotted parabolic trajectory preview
          const previewVel = computeLaunchVelocity(def.slingshotPos, { x: aimPullX, y: aimPullY });
          if (Math.hypot(previewVel.x, previewVel.y) > 95) {
            const pts = sampleTrajectoryPoints(def.slingshotPos, previewVel, def.gravity, def.baseWind, 15, 0.072);
            pts.forEach((pt, idx) => {
              const alpha = Math.max(0.2, 0.92 - idx * 0.05);
              ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
              ctx.strokeStyle = `rgba(20, 56, 32, ${alpha})`;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, Math.max(3.5, 7 - idx * 0.25), 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
            });
          }

          drawEcoOrb(orbX, orbY, 21, getCurrentOrbCategory());

          // Front elastic band
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(sx + 16, sy - 4);
          ctx.lineTo(orbX, orbY);
          ctx.stroke();
        }

        // Wooden Eco-Catapult Fork (front prong)
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.moveTo(sx, sy + 28);
        ctx.lineTo(sx + 18, sy - 6);
        ctx.stroke();

        // Active Flying Projectile
        if (sim.projectile.active) {
          drawEcoOrb(
            sim.projectile.x,
            sim.projectile.y,
            sim.projectile.radius,
            sim.projectile.category,
            sim.projectile.scaleX,
            sim.projectile.scaleY
          );
        }

        // Pooled Particles
        for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
          const p = sim.particles[i];
          if (!p.active) continue;
          const alpha = Math.max(0, p.life / p.maxLife);
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(p.x, p.y);
          ctx.fillStyle = p.color;
          ctx.strokeStyle = '#143820';
          ctx.lineWidth = 1.5;
          if (p.shape === 'leaf') {
            ctx.rotate(p.life * 7);
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * alpha + 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // Floating Score Popups
        for (let i = 0; i < FLOATING_TEXT_POOL_SIZE; i++) {
          const ft = sim.floatingTexts[i];
          if (!ft.active) continue;
          ctx.save();
          ctx.globalAlpha = Math.min(1, ft.life * 1.4);
          ctx.font = '700 26px Fredoka, sans-serif';
          ctx.textAlign = 'center';
          ctx.strokeStyle = '#143820';
          ctx.lineWidth = 6;
          ctx.strokeText(ft.text, ft.x, ft.y);
          ctx.fillStyle = ft.color;
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();
        }

        ctx.restore();
      };

      const drawFrameRef = () => {
        const sim = simRef.current;
        if (!sim) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        drawScene(sim, dpr);
      };

      const stepAndDraw = (dt: number) => {
        const sim = simRef.current;
        if (!sim) return;
        const activePhase = phaseRef.current;
        const def = STAGE_DEFINITIONS[sim.stageIndex];

        // Decay camera shake & hit flash in real dt
        sim.trauma = Math.max(0, sim.trauma - dt * 2.4);
        if (sim.mascotCheerTimer > 0) sim.mascotCheerTimer = Math.max(0, sim.mascotCheerTimer - dt);

        // Keyboard aim controls during playing
        if (activePhase === 'playing' && !sim.projectile.active) {
          if (sim.keysHeld.has('ArrowUp') || sim.keysHeld.has('KeyW')) {
            sim.keyAngleDeg = Math.min(74, sim.keyAngleDeg + 42 * dt);
          }
          if (sim.keysHeld.has('ArrowDown') || sim.keysHeld.has('KeyS')) {
            sim.keyAngleDeg = Math.max(16, sim.keyAngleDeg - 42 * dt);
          }
          if (sim.keysHeld.has('ArrowRight') || sim.keysHeld.has('KeyD')) {
            sim.keyPower = Math.min(1, sim.keyPower + 0.55 * dt);
          }
          if (sim.keysHeld.has('ArrowLeft') || sim.keysHeld.has('KeyA')) {
            sim.keyPower = Math.max(0.32, sim.keyPower - 0.55 * dt);
          }
        }

        // Advance physics simulation only when actively playing & not in hitstop
        if (activePhase === 'playing') {
          sim.time += dt;

          if (sim.hitstop > 0) {
            sim.hitstop = Math.max(0, sim.hitstop - dt);
          } else {
            for (const t of sim.targets) {
              if (t.moveAmpX > 0 && !t.cleared) {
                t.x = t.baseX + Math.sin(sim.time * t.moveSpeed + t.phase) * t.moveAmpX;
              }
              if (t.hitFlash > 0) t.hitFlash = Math.max(0, t.hitFlash - dt);
            }

            for (const h of sim.hazards) {
              if (h.kind === 'smog_patrol') {
                h.x = h.baseX + Math.sin(sim.time * h.speed + h.phase) * h.rangeX;
                if (h.telegraphTimer > 0) h.telegraphTimer = Math.max(0, h.telegraphTimer - dt);
              }
            }

            for (const b of sim.bumpers) {
              if (b.bounceAnim > 0) b.bounceAnim = Math.max(0, b.bounceAnim - dt * 5);
            }

            if (sim.projectile.active) {
              const magnetTarget =
                sim.activePowerUp === 'magnet'
                  ? sim.targets.find((t) => !t.cleared && t.category === sim.projectile.category) ?? null
                  : null;

              sim.projectile = stepProjectile(
                sim.projectile,
                dt,
                def.gravity,
                def.baseWind,
                sim.hazards,
                magnetTarget
              );

              for (const b of sim.bumpers) {
                const res = resolveBumperCollision(sim.projectile, b);
                if (res.hit) {
                  sim.projectile = res.proj;
                  b.bounceAnim = 1;
                  sim.trauma = Math.min(1, sim.trauma + 0.24);
                  soundEngine.playBounce();
                  spawnBurst(b.x, b.y, 8, ['#fef08a', '#4ade80', '#ffffff'], 'circle', 160);
                }
              }

              for (const h of sim.hazards) {
                if (
                  h.kind === 'smog_patrol' &&
                  checkCircleRectCollision(
                    sim.projectile.x,
                    sim.projectile.y,
                    sim.projectile.radius,
                    h.x,
                    h.y,
                    h.width,
                    h.height
                  )
                ) {
                  sim.projectile.vx = h.forceX;
                  sim.projectile.vy = Math.abs(sim.projectile.vy) * 0.5 + 90;
                  h.telegraphTimer = 0.45;
                  sim.trauma = Math.min(1, sim.trauma + 0.32);
                  soundEngine.playSoftMiss();
                  spawnBurst(h.x, h.y, 10, ['#94a3b8', '#c084fc', '#e2e8f0'], 'circle', 180);
                }
              }

              if (!sim.quizStar.collected) {
                const starY = sim.quizStar.y + Math.sin(sim.time * 3.2) * 9;
                const dStar = Math.hypot(sim.projectile.x - sim.quizStar.x, sim.projectile.y - starY);
                if (dStar < sim.projectile.radius + sim.quizStar.radius + 6) {
                  sim.quizStar.collected = true;
                  sim.hitstop = 0.05;
                  soundEngine.playQuizStar();
                  spawnBurst(sim.quizStar.x, starY, 18, ['#facc15', '#fef08a', '#4ade80'], 'star', 240);
                  emitHud();
                  onTriggerQuizRef.current();
                }
              }

              for (const t of sim.targets) {
                if (t.cleared) continue;
                if (
                  checkCircleRectCollision(
                    sim.projectile.x,
                    sim.projectile.y,
                    sim.projectile.radius,
                    t.x,
                    t.y,
                    t.width,
                    t.height
                  )
                ) {
                  const exact = t.category === sim.projectile.category;
                  t.cleared = true;
                  t.hitFlash = 0.25;
                  sim.projectile.active = false;
                  sim.combo = exact ? sim.combo + 1 : 1;
                  const gained = calculateShotScore({
                    exactCategoryMatch: exact,
                    bounces: sim.projectile.bounces,
                    combo: sim.combo,
                    doublePointsActive: sim.activePowerUp === 'double_points',
                  });
                  sim.score += gained;
                  sim.hitstop = 0.055;
                  sim.trauma = Math.min(1, sim.trauma + 0.45);
                  sim.mascotCheerTimer = 1.1;
                  if (sim.activePowerUp === 'double_points' || sim.activePowerUp === 'magnet') {
                    sim.activePowerUp = 'none';
                  }
                  soundEngine.playScore(sim.combo);
                  spawnBurst(
                    t.x,
                    t.y - 10,
                    22,
                    [CATEGORY_COLORS[t.category].fill, '#facc15', '#ffffff'],
                    'leaf',
                    290
                  );
                  spawnFloatingText(
                    t.x,
                    t.y - 45,
                    exact ? `+${gained}!` : `+${gained}`,
                    exact ? '#fef08a' : '#e2e8f0'
                  );
                  emitHud();
                  break;
                }
              }

              if (!sim.projectile.active) {
                emitHud();
              }
            }

            const clearedCount = sim.targets.filter((t) => t.cleared).length;
            if (!sim.pendingOutcome) {
              if (clearedCount >= sim.targets.length) {
                sim.pendingOutcome = 'victory';
                sim.endDelayTimer = 0.65;
                soundEngine.playVictory();
                spawnBurst(WORLD_WIDTH * 0.5, WORLD_HEIGHT * 0.35, 32, ['#4ade80', '#facc15', '#38bdf8', '#fb923c'], 'star', 340);
              } else if (!sim.projectile.active && sim.orbsLeft <= 0) {
                sim.pendingOutcome = 'defeat';
                sim.endDelayTimer = 0.55;
                soundEngine.playSoftMiss();
              }
            } else {
              sim.endDelayTimer -= dt;
              if (sim.endDelayTimer <= 0) {
                const outcome = sim.pendingOutcome;
                sim.pendingOutcome = null;
                const starsEarned = calculateStarRating({
                  targetsCleared: clearedCount,
                  totalTargets: sim.targets.length,
                  orbsRemaining: sim.orbsLeft,
                  quizzesCorrect: sim.quizzesCorrect,
                });
                const finalScore = Math.round(sim.score + sim.orbsLeft * 50);
                onStageCompleteRef.current({
                  stageIndex: sim.stageIndex,
                  score: finalScore,
                  bestScore: Math.max(bestScoreRef.current, finalScore),
                  starsEarned,
                  targetsCleared: clearedCount,
                  totalTargets: sim.targets.length,
                  quizzesCorrect: sim.quizzesCorrect,
                  orbsRemaining: sim.orbsLeft,
                  outcome,
                });
              }
            }
          }
        }

        for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
          const p = sim.particles[i];
          if (!p.active) continue;
          p.life -= dt;
          if (p.life <= 0) {
            p.active = false;
            continue;
          }
          p.vy += 380 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }

        for (let i = 0; i < FLOATING_TEXT_POOL_SIZE; i++) {
          const ft = sim.floatingTexts[i];
          if (!ft.active) continue;
          ft.life -= dt;
          if (ft.life <= 0) {
            ft.active = false;
            continue;
          }
          ft.y += ft.vy * dt;
        }

        drawFrameRef();
      };

      const tick = (now: number) => {
        const rawDt = (now - lastTs) / 1000;
        lastTs = now;
        const dt = clampDt(rawDt);
        if (phaseRef.current === 'playing') {
          stepAndDraw(dt);
          rafId = requestAnimationFrame(tick);
        } else {
          // Idle-check gently while paused/quiz/title so zero CPU is wasted on mid-range devices
          rafId = window.setTimeout(() => {
            lastTs = performance.now();
            rafId = requestAnimationFrame(tick);
          }, 220) as unknown as number;
        }
      };

      drawFrameRef();
      rafId = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(rafId);
        window.clearTimeout(rafId);
        ro.disconnect();
        canvas.removeEventListener('pointerdown', handlePointerDown);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('blur', clearHeldInputs);
        document.removeEventListener('visibilitychange', clearHeldInputs);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div
        ref={containerRef}
        className="fixed inset-0 w-full h-full select-none overflow-hidden"
        data-testid="eco-physics-canvas-container"
      >
        <canvas
          ref={canvasRef}
          data-testid="eco-physics-canvas"
          className="block w-full h-full cursor-crosshair touch-none"
        />
      </div>
    );
  }
);
