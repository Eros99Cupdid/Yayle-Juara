import test from 'node:test';
import assert from 'node:assert/strict';
import {
  encryptVault,
  decryptVault,
  hashPin,
  verifyPin,
  checkDailyTimeLimit,
  generateParentMathChallenge,
} from './cryptoVault';

test('AES-256-GCM vault round-trips kid profile data and rejects wrong keys or tampering', async () => {
  const payload = {
    nickname: 'Bima',
    dailyLimitMinutes: 30,
    playtime: [{ date: '2026-11-25', seconds: 420 }],
  };
  const secret = 'test-device-key-yayle-juara-2026';
  const cipher = await encryptVault(payload, secret);

  assert.ok(cipher.startsWith('yjv1:'), 'should use versioned envelope prefix');
  assert.ok(!cipher.includes('Bima'), 'plaintext should not appear in ciphertext');

  const decrypted = await decryptVault<typeof payload>(cipher, secret);
  assert.deepEqual(decrypted, payload);

  const wrongKeyResult = await decryptVault<typeof payload>(cipher, 'wrong-key');
  assert.equal(wrongKeyResult, null);

  // Tamper with ciphertext tail
  const tampered = cipher.slice(0, -4) + 'AAAA';
  const tamperedResult = await decryptVault<typeof payload>(tampered, secret);
  assert.equal(tamperedResult, null);
});

test('Salted SHA-256 parent PIN hashing verifies valid PIN and rejects wrong PIN', async () => {
  const { hash, salt } = await hashPin('2468');
  assert.equal(hash.length, 64);
  assert.equal(await verifyPin('2468', hash, salt), true);
  assert.equal(await verifyPin('9999', hash, salt), false);
});

test('checkDailyTimeLimit accurately enforces parental daily time limits', () => {
  const mid = checkDailyTimeLimit(900, 30); // 15m of 30m
  assert.equal(mid.limitReached, false);
  assert.equal(mid.remainingSeconds, 900);
  assert.equal(mid.percentUsed, 50);

  const reached = checkDailyTimeLimit(1800, 30);
  assert.equal(reached.limitReached, true);
  assert.equal(reached.remainingSeconds, 0);
  assert.equal(reached.percentUsed, 100);
});

test('generateParentMathChallenge produces a valid arithmetic check', () => {
  const challenge = generateParentMathChallenge();
  assert.ok(challenge.prompt.includes('×'));
  assert.ok(challenge.answer >= 14 && challenge.answer <= 64);
});
