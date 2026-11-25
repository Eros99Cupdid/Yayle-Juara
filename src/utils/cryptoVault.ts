/**
 * AES-256-GCM + PBKDF2-SHA256 client-side encryption vault for Yayle Juara.
 * Protects children's profiles, playtime logs, and parental settings both
 * in offline local storage and optional encrypted cloud backup payloads.
 */

const VAULT_PREFIX = 'yjv1';
const PBKDF2_ITERATIONS = 100_000;
const derivedKeyCache = new Map<string, Promise<CryptoKey>>();
let cachedSessionSalt: Uint8Array | null = null;

function getSubtle(): SubtleCrypto {
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.subtle) {
    throw new Error('Web Crypto API is unavailable in this environment.');
  }
  return cryptoObj.subtle;
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(b64, 'base64'));
  }
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

function deriveAesKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const cacheKey = `${passphrase}:${bytesToBase64(salt)}`;
  const hit = derivedKeyCache.get(cacheKey);
  if (hit) return hit;

  const promise = (async () => {
    const subtle = getSubtle();
    const enc = new TextEncoder();
    const keyMaterial = await subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  })();

  if (derivedKeyCache.size > 16) {
    derivedKeyCache.clear();
  }
  derivedKeyCache.set(cacheKey, promise);
  return promise;
}

export async function encryptVault(payload: unknown, passphrase: string): Promise<string> {
  const subtle = getSubtle();
  if (!cachedSessionSalt) {
    cachedSessionSalt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  }
  const salt = cachedSessionSalt;
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(passphrase, salt);
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const cipherBuffer = await subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    encoded
  );
  const cipherBytes = new Uint8Array(cipherBuffer);
  return `${VAULT_PREFIX}:${bytesToBase64(salt)}:${bytesToBase64(iv)}:${bytesToBase64(cipherBytes)}`;
}

export async function decryptVault<T>(envelope: string, passphrase: string): Promise<T | null> {
  try {
    const parts = envelope.split(':');
    if (parts.length !== 4 || parts[0] !== VAULT_PREFIX) {
      return null;
    }
    const salt = base64ToBytes(parts[1]);
    const iv = base64ToBytes(parts[2]);
    const cipherBytes = base64ToBytes(parts[3]);
    if (salt.length !== 16 || iv.length !== 12 || cipherBytes.length < 16) {
      return null;
    }
    const key = await deriveAesKey(passphrase, salt);
    const plainBuffer = await getSubtle().decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      cipherBytes as BufferSource
    );
    const json = new TextDecoder().decode(plainBuffer);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export async function hashPin(pin: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const subtle = getSubtle();
  const salt =
    saltHex ??
    Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  const digest = await subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`yayle-pin:${salt}:${pin}`)
  );
  const hash = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return { hash, salt };
}

export async function verifyPin(pin: string, expectedHash: string, salt: string): Promise<boolean> {
  const { hash } = await hashPin(pin, salt);
  if (hash.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) {
    diff |= hash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return diff === 0;
}

export function generateParentMathChallenge(): { prompt: string; answer: number } {
  const a = 4 + Math.floor(Math.random() * 5); // 4..8
  const b = 3 + Math.floor(Math.random() * 5); // 3..7
  const c = 2 + Math.floor(Math.random() * 7); // 2..8
  return {
    prompt: `${a} × ${b} + ${c} = ?`,
    answer: a * b + c,
  };
}

export function checkDailyTimeLimit(usedSeconds: number, limitMinutes: number): {
  limitReached: boolean;
  remainingSeconds: number;
  percentUsed: number;
} {
  const limitSeconds = Math.max(60, limitMinutes * 60);
  const safeUsed = Math.max(0, Math.floor(usedSeconds));
  const remainingSeconds = Math.max(0, limitSeconds - safeUsed);
  const percentUsed = Math.min(100, Math.round((safeUsed / limitSeconds) * 100));
  return {
    limitReached: safeUsed >= limitSeconds,
    remainingSeconds,
    percentUsed,
  };
}

export function getTodayDateKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getOrCreateDeviceVaultKey(): string {
  const STORAGE_KEY = 'yayle_juara_device_key_v1';
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 32) return existing;
    const raw = globalThis.crypto.getRandomValues(new Uint8Array(24));
    const created = bytesToBase64(raw);
    localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    return 'yayle-juara-offline-session-fallback-key';
  }
}
