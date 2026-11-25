import type { EcoCategory } from '../types';

export interface Vec2 {
  x: number;
  y: number;
}

export interface TargetEntity {
  id: string;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  width: number;
  height: number;
  category: EcoCategory;
  cleared: boolean;
  hitFlash: number;
  moveAmpX: number;
  moveSpeed: number;
  phase: number;
}

export interface BumperEntity {
  id: string;
  x: number;
  y: number;
  radius: number;
  restitution: number;
  kind: 'bamboo' | 'lilypad';
  bounceAnim: number;
}

export interface HazardEntity {
  id: string;
  kind: 'smog_patrol' | 'wind_zone' | 'bubble_lift';
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  width: number;
  height: number;
  rangeX: number;
  speed: number;
  forceX: number;
  forceY: number;
  phase: number;
  telegraphTimer: number;
}

export interface QuizStarEntity {
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  bobPhase: number;
}

export interface ProjectileState {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  category: EcoCategory;
  bounces: number;
  age: number;
  scaleX: number;
  scaleY: number;
}

export interface StageDefinition {
  index: number;
  gravity: number;
  baseWind: number; // px/s^2 horizontal
  maxOrbs: number;
  slingshotPos: Vec2; // normalized 0..1 of logical 1200x675 world
  orbQueue: EcoCategory[];
  targets: Omit<TargetEntity, 'cleared' | 'hitFlash'>[];
  bumpers: Omit<BumperEntity, 'bounceAnim'>[];
  hazards: Omit<HazardEntity, 'telegraphTimer'>[];
  quizStar: Omit<QuizStarEntity, 'collected' | 'bobPhase'>;
  theme: 'meadow' | 'windmill' | 'river';
}

export const WORLD_WIDTH = 1200;
export const WORLD_HEIGHT = 675;
export const GROUND_Y = 590;
export const MAX_PULL_DISTANCE = 135;
export const LAUNCH_SPEED_SCALE = 7.4;

export const STAGE_DEFINITIONS: StageDefinition[] = [
  {
    index: 0,
    gravity: 690,
    baseWind: 0,
    maxOrbs: 9,
    slingshotPos: { x: 185, y: 468 },
    orbQueue: ['organic', 'plastic', 'paper', 'organic', 'plastic', 'paper', 'organic', 'plastic', 'paper'],
    targets: [
      { id: 't1', x: 640, y: 525, baseX: 640, baseY: 525, width: 92, height: 86, category: 'organic', moveAmpX: 0, moveSpeed: 0, phase: 0 },
      { id: 't2', x: 845, y: 525, baseX: 845, baseY: 525, width: 92, height: 86, category: 'plastic', moveAmpX: 0, moveSpeed: 0, phase: 0 },
      { id: 't3', x: 1040, y: 525, baseX: 1040, baseY: 525, width: 92, height: 86, category: 'paper', moveAmpX: 0, moveSpeed: 0, phase: 0 },
    ],
    bumpers: [
      { id: 'b1', x: 485, y: 410, radius: 34, restitution: 1.08, kind: 'bamboo' },
      { id: 'b2', x: 745, y: 315, radius: 30, restitution: 1.05, kind: 'bamboo' },
    ],
    hazards: [
      {
        id: 'h1',
        kind: 'smog_patrol',
        x: 780,
        y: 230,
        baseX: 780,
        baseY: 230,
        width: 96,
        height: 52,
        rangeX: 130,
        speed: 1.15,
        forceX: -240,
        forceY: 160,
        phase: 0,
      },
    ],
    quizStar: { x: 620, y: 240, radius: 28 },
    theme: 'meadow',
  },
  {
    index: 1,
    gravity: 670,
    baseWind: -95,
    maxOrbs: 10,
    slingshotPos: { x: 180, y: 468 },
    orbQueue: ['energy', 'plastic', 'energy', 'paper', 'organic', 'energy', 'plastic', 'paper', 'organic', 'energy'],
    targets: [
      { id: 'w1', x: 650, y: 345, baseX: 650, baseY: 345, width: 92, height: 86, category: 'energy', moveAmpX: 0, moveSpeed: 0, phase: 0 },
      { id: 'w2', x: 860, y: 525, baseX: 860, baseY: 525, width: 92, height: 86, category: 'plastic', moveAmpX: 50, moveSpeed: 1.2, phase: 0.4 },
      { id: 'w3', x: 1035, y: 270, baseX: 1035, baseY: 270, width: 92, height: 86, category: 'energy', moveAmpX: 0, moveSpeed: 0, phase: 0 },
      { id: 'w4', x: 1045, y: 525, baseX: 1045, baseY: 525, width: 92, height: 86, category: 'paper', moveAmpX: 0, moveSpeed: 0, phase: 0 },
    ],
    bumpers: [
      { id: 'wb1', x: 470, y: 350, radius: 34, restitution: 1.12, kind: 'bamboo' },
      { id: 'wb2', x: 760, y: 430, radius: 32, restitution: 1.1, kind: 'bamboo' },
    ],
    hazards: [
      {
        id: 'wh1',
        kind: 'wind_zone',
        x: 560,
        y: 165,
        baseX: 560,
        baseY: 165,
        width: 220,
        height: 150,
        rangeX: 0,
        speed: 1.8,
        forceX: -320,
        forceY: -120,
        phase: 0,
      },
      {
        id: 'wh2',
        kind: 'smog_patrol',
        x: 880,
        y: 205,
        baseX: 880,
        baseY: 205,
        width: 96,
        height: 52,
        rangeX: 120,
        speed: 1.45,
        forceX: -220,
        forceY: 180,
        phase: 1.2,
      },
    ],
    quizStar: { x: 825, y: 185, radius: 28 },
    theme: 'windmill',
  },
  {
    index: 2,
    gravity: 650,
    baseWind: 55,
    maxOrbs: 11,
    slingshotPos: { x: 175, y: 468 },
    orbQueue: ['plastic', 'organic', 'paper', 'energy', 'plastic', 'organic', 'paper', 'energy', 'plastic', 'organic', 'paper'],
    targets: [
      { id: 'r1', x: 645, y: 515, baseX: 645, baseY: 515, width: 96, height: 82, category: 'plastic', moveAmpX: 65, moveSpeed: 1.35, phase: 0 },
      { id: 'r2', x: 870, y: 515, baseX: 870, baseY: 515, width: 96, height: 82, category: 'organic', moveAmpX: 70, moveSpeed: 1.55, phase: 1.8 },
      { id: 'r3', x: 1045, y: 315, baseX: 1045, baseY: 315, width: 92, height: 86, category: 'paper', moveAmpX: 0, moveSpeed: 0, phase: 0 },
      { id: 'r4', x: 760, y: 240, baseX: 760, baseY: 240, width: 92, height: 86, category: 'energy', moveAmpX: 55, moveSpeed: 1.1, phase: 0.7 },
    ],
    bumpers: [
      { id: 'rb1', x: 465, y: 455, radius: 36, restitution: 1.16, kind: 'lilypad' },
      { id: 'rb2', x: 920, y: 390, radius: 34, restitution: 1.12, kind: 'lilypad' },
    ],
    hazards: [
      {
        id: 'rh1',
        kind: 'bubble_lift',
        x: 560,
        y: 350,
        baseX: 560,
        baseY: 350,
        width: 145,
        height: 220,
        rangeX: 0,
        speed: 2.0,
        forceX: 35,
        forceY: -880,
        phase: 0,
      },
      {
        id: 'rh2',
        kind: 'smog_patrol',
        x: 840,
        y: 330,
        baseX: 840,
        baseY: 330,
        width: 98,
        height: 54,
        rangeX: 145,
        speed: 1.65,
        forceX: -260,
        forceY: 160,
        phase: 0.9,
      },
    ],
    quizStar: { x: 630, y: 190, radius: 28 },
    theme: 'river',
  },
];

export function clampDt(rawDt: number): number {
  if (!Number.isFinite(rawDt) || rawDt < 0) return 0;
  return Math.min(rawDt, 0.05);
}

/**
 * Converts a slingshot drag delta (anchor -> pointer) into clamped launch velocity.
 * Pulling left & down launches up & right.
 */
export function computeLaunchVelocity(anchor: Vec2, pullPoint: Vec2): Vec2 {
  const dx = anchor.x - pullPoint.x;
  const dy = anchor.y - pullPoint.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 4) return { x: 0, y: 0 };
  const clampedDist = Math.min(dist, MAX_PULL_DISTANCE);
  const scale = (clampedDist / dist) * LAUNCH_SPEED_SCALE;
  return {
    x: dx * scale,
    y: dy * scale,
  };
}

/**
 * Predicts parabolic dotted trajectory arc under gravity and base wind.
 */
export function sampleTrajectoryPoints(
  origin: Vec2,
  velocity: Vec2,
  gravity: number,
  baseWind: number,
  count = 14,
  stepSec = 0.075
): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 1; i <= count; i++) {
    const t = i * stepSec;
    const x = origin.x + velocity.x * t + 0.5 * baseWind * t * t;
    const y = origin.y + velocity.y * t + 0.5 * gravity * t * t;
    if (y > GROUND_Y + 12 || x > WORLD_WIDTH + 40 || x < -40) break;
    pts.push({ x, y });
  }
  return pts;
}

export function stepProjectile(
  proj: ProjectileState,
  dt: number,
  gravity: number,
  baseWind: number,
  hazards: HazardEntity[],
  magnetTarget: TargetEntity | null
): ProjectileState {
  if (!proj.active) return proj;
  const safeDt = clampDt(dt);

  let ax = baseWind;
  let ay = gravity;

  // Apply environmental forces (wind zones & rising water bubbles)
  for (const h of hazards) {
    if (h.kind === 'wind_zone' || h.kind === 'bubble_lift') {
      const inside =
        proj.x >= h.x - h.width / 2 &&
        proj.x <= h.x + h.width / 2 &&
        proj.y >= h.y - h.height / 2 &&
        proj.y <= h.y + h.height / 2;
      if (inside) {
        ax += h.forceX;
        ay += h.forceY;
      }
    }
  }

  // Optional gentle eco-magnet assist earned from Eco-Quiz!
  if (magnetTarget && !magnetTarget.cleared) {
    const mdx = magnetTarget.x - proj.x;
    const mdy = magnetTarget.y - proj.y;
    const dist = Math.hypot(mdx, mdy);
    if (dist > 10 && dist < 240) {
      const pull = 780 * (1 - dist / 240);
      ax += (mdx / dist) * pull;
      ay += (mdy / dist) * pull;
    }
  }

  let vx = proj.vx + ax * safeDt;
  let vy = proj.vy + ay * safeDt;
  let x = proj.x + vx * safeDt;
  let y = proj.y + vy * safeDt;
  let bounces = proj.bounces;
  let scaleX = proj.scaleX + (1 - proj.scaleX) * Math.min(1, safeDt * 10);
  let scaleY = proj.scaleY + (1 - proj.scaleY) * Math.min(1, safeDt * 10);

  // Soft ground bounce
  if (y + proj.radius >= GROUND_Y) {
    y = GROUND_Y - proj.radius;
    if (Math.abs(vy) > 120 && bounces < 3) {
      vy = -vy * 0.56;
      vx *= 0.82;
      bounces += 1;
      scaleX = 1.24;
      scaleY = 0.78;
    } else {
      vy = 0;
      vx *= 0.85;
    }
  }

  // Left/right gentle wall bounce
  if (x - proj.radius < 16) {
    x = 16 + proj.radius;
    vx = Math.abs(vx) * 0.7;
    bounces += 1;
  } else if (x + proj.radius > WORLD_WIDTH - 16) {
    x = WORLD_WIDTH - 16 - proj.radius;
    vx = -Math.abs(vx) * 0.7;
    bounces += 1;
  }

  const age = proj.age + safeDt;
  const speed = Math.hypot(vx, vy);
  const settled = (y + proj.radius >= GROUND_Y - 2 && speed < 38 && age > 0.6) || age > 6.5;

  return {
    ...proj,
    x,
    y,
    vx,
    vy,
    bounces,
    age,
    scaleX,
    scaleY,
    active: !settled,
  };
}

export function resolveBumperCollision(
  proj: ProjectileState,
  bumper: BumperEntity
): { hit: boolean; proj: ProjectileState } {
  const dx = proj.x - bumper.x;
  const dy = proj.y - bumper.y;
  const dist = Math.hypot(dx, dy);
  const minDist = proj.radius + bumper.radius;
  if (dist >= minDist || dist === 0) {
    return { hit: false, proj };
  }

  const nx = dx / dist;
  const ny = dy / dist;
  const dot = proj.vx * nx + proj.vy * ny;
  const speed = Math.max(360, Math.hypot(proj.vx, proj.vy) * bumper.restitution);

  let rvx = proj.vx - 2 * dot * nx;
  let rvy = proj.vy - 2 * dot * ny;
  const rLen = Math.hypot(rvx, rvy) || 1;
  rvx = (rvx / rLen) * Math.min(speed, 920);
  rvy = (rvy / rLen) * Math.min(speed, 920);

  return {
    hit: true,
    proj: {
      ...proj,
      x: bumper.x + nx * (minDist + 2),
      y: bumper.y + ny * (minDist + 2),
      vx: rvx,
      vy: rvy,
      bounces: proj.bounces + 1,
      scaleX: 1.26,
      scaleY: 0.76,
    },
  };
}

export function checkCircleRectCollision(
  cx: number,
  cy: number,
  cr: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  const halfW = rw / 2;
  const halfH = rh / 2;
  const closestX = Math.max(rx - halfW, Math.min(cx, rx + halfW));
  const closestY = Math.max(ry - halfH, Math.min(cy, ry + halfH));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= cr * cr;
}

export function calculateShotScore(params: {
  exactCategoryMatch: boolean;
  bounces: number;
  combo: number;
  doublePointsActive: boolean;
}): number {
  const base = params.exactCategoryMatch ? 150 : 60;
  const bounceBonus = Math.min(params.bounces, 3) * 45;
  const comboBonus = Math.min(params.combo, 5) * 30;
  const raw = base + bounceBonus + comboBonus;
  return params.doublePointsActive ? raw * 2 : raw;
}

export function calculateStarRating(params: {
  targetsCleared: number;
  totalTargets: number;
  orbsRemaining: number;
  quizzesCorrect: number;
}): number {
  if (params.targetsCleared < params.totalTargets) return 0;
  if (params.orbsRemaining >= 3 || params.quizzesCorrect >= 2) return 3;
  if (params.orbsRemaining >= 1 || params.quizzesCorrect >= 1) return 2;
  return 1;
}
