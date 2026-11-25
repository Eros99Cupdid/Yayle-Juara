import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampDt,
  computeLaunchVelocity,
  sampleTrajectoryPoints,
  stepProjectile,
  resolveBumperCollision,
  checkCircleRectCollision,
  calculateShotScore,
  calculateStarRating,
  MAX_PULL_DISTANCE,
  LAUNCH_SPEED_SCALE,
  STAGE_DEFINITIONS,
} from './physicsLogic';

test('clampDt limits large frame spikes to 0.05s and rejects negatives', () => {
  assert.equal(clampDt(0.016), 0.016);
  assert.equal(clampDt(0.5), 0.05);
  assert.equal(clampDt(-1), 0);
  assert.equal(clampDt(Number.NaN), 0);
});

test('computeLaunchVelocity clamps pull distance and launches opposite to drag', () => {
  const anchor = { x: 200, y: 450 };
  const vel = computeLaunchVelocity(anchor, { x: 100, y: 500 });
  assert.ok(vel.x > 0, 'pulling left should launch right');
  assert.ok(vel.y < 0, 'pulling down should launch upward');

  const overPulled = computeLaunchVelocity(anchor, { x: -500, y: 900 });
  const speed = Math.hypot(overPulled.x, overPulled.y);
  assert.ok(Math.abs(speed - MAX_PULL_DISTANCE * LAUNCH_SPEED_SCALE) < 0.01);
});

test('sampleTrajectoryPoints predicts downward parabolic arc under gravity', () => {
  const pts = sampleTrajectoryPoints({ x: 180, y: 460 }, { x: 500, y: -420 }, 680, 0, 10, 0.08);
  assert.equal(pts.length, 10);
  assert.ok(pts[0].x < pts[9].x);
  assert.ok(pts[1].y < pts[0].y, 'initially rising');
});

test('stepProjectile applies gravity, wind zones, and bubble lift', () => {
  const baseProj = {
    active: true,
    x: 560,
    y: 350,
    vx: 200,
    vy: 0,
    radius: 22,
    category: 'organic' as const,
    bounces: 0,
    age: 0,
    scaleX: 1,
    scaleY: 1,
  };
  const bubbleLift = STAGE_DEFINITIONS[2].hazards[0];
  const next = stepProjectile(baseProj, 0.04, 650, 0, [{ ...bubbleLift, telegraphTimer: 0 }], null);
  assert.ok(next.vy < 0, 'bubble lift force (-880) should lift projectile against 650 gravity');
});

test('resolveBumperCollision reflects projectile and increments bounce count', () => {
  const proj = {
    active: true,
    x: 470,
    y: 410,
    vx: 300,
    vy: 0,
    radius: 20,
    category: 'plastic' as const,
    bounces: 0,
    age: 0.2,
    scaleX: 1,
    scaleY: 1,
  };
  const bumper = { id: 'b1', x: 500, y: 410, radius: 30, restitution: 1.1, kind: 'bamboo' as const, bounceAnim: 0 };
  const result = resolveBumperCollision(proj, bumper);
  assert.equal(result.hit, true);
  assert.equal(result.proj.bounces, 1);
  assert.ok(result.proj.vx < 0, 'projectile should rebound leftward');
});

test('checkCircleRectCollision accurately detects hits and misses', () => {
  assert.equal(checkCircleRectCollision(640, 520, 22, 640, 525, 90, 86), true);
  assert.equal(checkCircleRectCollision(200, 200, 22, 640, 525, 90, 86), false);
});

test('calculateShotScore rewards exact category match, bounces, combos, and 2x powerup', () => {
  const standard = calculateShotScore({
    exactCategoryMatch: true,
    bounces: 1,
    combo: 2,
    doublePointsActive: false,
  });
  assert.equal(standard, 150 + 45 + 60);

  const doubled = calculateShotScore({
    exactCategoryMatch: true,
    bounces: 1,
    combo: 2,
    doublePointsActive: true,
  });
  assert.equal(doubled, standard * 2);
});

test('calculateStarRating computes 0 to 3 stars deterministically', () => {
  assert.equal(calculateStarRating({ targetsCleared: 2, totalTargets: 3, orbsRemaining: 4, quizzesCorrect: 1 }), 0);
  assert.equal(calculateStarRating({ targetsCleared: 3, totalTargets: 3, orbsRemaining: 0, quizzesCorrect: 0 }), 1);
  assert.equal(calculateStarRating({ targetsCleared: 3, totalTargets: 3, orbsRemaining: 2, quizzesCorrect: 0 }), 2);
  assert.equal(calculateStarRating({ targetsCleared: 3, totalTargets: 3, orbsRemaining: 3, quizzesCorrect: 0 }), 3);
});
