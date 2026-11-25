import type { LeaderboardItem, PlayerProfile } from '../types';
import {
  decryptVault,
  encryptVault,
  getOrCreateDeviceVaultKey,
  getTodayDateKey,
} from '../utils/cryptoVault';

const ENCRYPTED_PROFILE_KEY = 'yayle_juara_encrypted_profile_v1';

export const SEED_CHAMPIONS: LeaderboardItem[] = [
  {
    id: 'seed_ayla',
    nickname: 'Ayla Rimba',
    avatarId: 'yayle',
    score: 2850,
    stars: 9,
    quizzesSolved: 14,
    stage: 3,
    isSeed: true,
  },
  {
    id: 'seed_rafi',
    nickname: 'Rafi Surya',
    avatarId: 'nara',
    score: 2340,
    stars: 8,
    quizzesSolved: 11,
    stage: 3,
    isSeed: true,
  },
  {
    id: 'seed_dina',
    nickname: 'Dina Sungai',
    avatarId: 'kiko',
    score: 1890,
    stars: 6,
    quizzesSolved: 9,
    stage: 2,
    isSeed: true,
  },
  {
    id: 'seed_bima',
    nickname: 'Bima Hijau',
    avatarId: 'yayle',
    score: 1420,
    stars: 5,
    quizzesSolved: 7,
    stage: 2,
    isSeed: true,
  },
  {
    id: 'seed_sari',
    nickname: 'Sari Pelangi',
    avatarId: 'nara',
    score: 960,
    stars: 3,
    quizzesSolved: 4,
    stage: 1,
    isSeed: true,
  },
];

export function createDefaultProfile(): PlayerProfile {
  const today = getTodayDateKey();
  return {
    uid: null,
    isCloudSignedIn: false,
    nickname: 'Juara Cilik',
    avatarId: 'yayle',
    language: 'id',
    highScore: 0,
    totalStars: 0,
    highestStage: 0,
    quizzesSolved: 0,
    parental: {
      dailyLimitMinutes: 30,
      reminderEnabled: true,
      reminderTime: '16:00',
      lastReminderDate: '',
      pinHash: null,
      pinSalt: null,
      playtimeLog: [{ date: today, seconds: 0 }],
      quizCorrectByTopic: {
        sorting: 0,
        water: 0,
        energy: 0,
        forest: 0,
        ocean: 0,
      },
    },
  };
}

export async function loadEncryptedLocalProfile(): Promise<PlayerProfile> {
  const fallback = createDefaultProfile();
  try {
    const cipher = localStorage.getItem(ENCRYPTED_PROFILE_KEY);
    if (!cipher) return fallback;
    const key = getOrCreateDeviceVaultKey();
    const parsed = await decryptVault<PlayerProfile>(cipher, key);
    if (!parsed) return fallback;
    return {
      ...fallback,
      ...parsed,
      parental: {
        ...fallback.parental,
        ...(parsed.parental ?? {}),
      },
    };
  } catch {
    return fallback;
  }
}

export async function saveEncryptedLocalProfile(profile: PlayerProfile): Promise<void> {
  try {
    const key = getOrCreateDeviceVaultKey();
    const cipher = await encryptVault(profile, key);
    localStorage.setItem(ENCRYPTED_PROFILE_KEY, cipher);
  } catch {
    // Ignore quota or storage restriction errors silently
  }
}

export function mergeLeaderboardEntries(
  cloudItems: LeaderboardItem[],
  currentProfile: PlayerProfile
): LeaderboardItem[] {
  const map = new Map<string, LeaderboardItem>();

  for (const seed of SEED_CHAMPIONS) {
    map.set(seed.id, seed);
  }
  for (const item of cloudItems) {
    map.set(item.id, item);
  }

  const selfId = currentProfile.uid ?? 'local_current_player';
  map.set(selfId, {
    id: selfId,
    nickname: currentProfile.nickname || 'Juara Cilik',
    avatarId: currentProfile.avatarId,
    score: currentProfile.highScore,
    stars: currentProfile.totalStars,
    quizzesSolved: currentProfile.quizzesSolved,
    stage: Math.min(3, currentProfile.highestStage + 1),
    isCurrentUser: true,
  });

  return Array.from(map.values())
    .sort((a, b) => b.score - a.score || b.stars - a.stars)
    .slice(0, 15);
}

export function getTodayPlaytimeSeconds(profile: PlayerProfile, today = getTodayDateKey()): number {
  const found = profile.parental.playtimeLog.find((entry) => entry.date === today);
  return found ? found.seconds : 0;
}

export function addPlaytimeSeconds(profile: PlayerProfile, deltaSec: number, today = getTodayDateKey()): PlayerProfile {
  const existing = [...profile.parental.playtimeLog];
  const idx = existing.findIndex((entry) => entry.date === today);
  if (idx >= 0) {
    existing[idx] = { date: today, seconds: existing[idx].seconds + deltaSec };
  } else {
    existing.push({ date: today, seconds: deltaSec });
  }
  const trimmed = existing.slice(-7);
  return {
    ...profile,
    parental: {
      ...profile.parental,
      playtimeLog: trimmed,
    },
  };
}
