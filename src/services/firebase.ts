import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { AvatarId, Language, LeaderboardItem, PlayerProfile } from '../types';
import { encryptVault, decryptVault } from '../utils/cryptoVault';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let connectionChecked = false;
export async function testFirestoreConnection(): Promise<void> {
  if (connectionChecked) return;
  connectionChecked = true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

function sanitizeNickname(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, ' ').slice(0, 32);
  return cleaned.length > 0 ? cleaned : 'Juara Cilik';
}

function clampInt(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, Math.round(val)));
}

function isValidAvatar(val: unknown): val is AvatarId {
  return val === 'yayle' || val === 'kiko' || val === 'nara';
}

function isValidLang(val: unknown): val is Language {
  return val === 'id' || val === 'en' || val === 'ms';
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutGoogle(): Promise<void> {
  await signOut(auth);
}

export function subscribeAuth(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}

export async function loadCloudProfile(user: User, fallbackProfile: PlayerProfile): Promise<PlayerProfile> {
  const path = `users/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) {
      return {
        ...fallbackProfile,
        uid: user.uid,
        isCloudSignedIn: true,
        nickname: sanitizeNickname(fallbackProfile.nickname || user.displayName?.split(' ')[0] || 'Juara Cilik'),
      };
    }
    const data = snap.data();
    let parental = fallbackProfile.parental;
    if (typeof data.encryptedVault === 'string' && data.encryptedVault.startsWith('yjv1:')) {
      const decrypted = await decryptVault<PlayerProfile['parental']>(
        data.encryptedVault,
        `yayle-cloud-${user.uid}`
      );
      if (decrypted) {
        parental = { ...parental, ...decrypted };
      }
    }
    return {
      uid: user.uid,
      isCloudSignedIn: true,
      nickname: typeof data.nickname === 'string' ? sanitizeNickname(data.nickname) : fallbackProfile.nickname,
      avatarId: isValidAvatar(data.avatarId) ? data.avatarId : fallbackProfile.avatarId,
      language: isValidLang(data.language) ? data.language : fallbackProfile.language,
      highScore: Math.max(fallbackProfile.highScore, clampInt(Number(data.highScore ?? 0), 0, 1000000)),
      totalStars: Math.max(fallbackProfile.totalStars, clampInt(Number(data.totalStars ?? 0), 0, 999)),
      highestStage: Math.max(fallbackProfile.highestStage, clampInt(Number(data.highestStage ?? 0), 0, 2)),
      quizzesSolved: Math.max(fallbackProfile.quizzesSolved, clampInt(Number(data.quizzesSolved ?? 0), 0, 100000)),
      parental,
    };
  } catch (error) {
    if (navigator.onLine) {
      handleFirestoreError(error, OperationType.GET, path);
    }
    return { ...fallbackProfile, uid: user.uid, isCloudSignedIn: true };
  }
}

export async function saveCloudProfileAndLeaderboard(user: User, profile: PlayerProfile): Promise<void> {
  if (!navigator.onLine || !user.emailVerified) return;

  const userPath = `users/${user.uid}`;
  const lbPath = `leaderboard/${user.uid}`;
  const nickname = sanitizeNickname(profile.nickname);
  const avatarId: AvatarId = isValidAvatar(profile.avatarId) ? profile.avatarId : 'yayle';
  const language: Language = isValidLang(profile.language) ? profile.language : 'id';
  const highScore = clampInt(profile.highScore, 0, 1000000);
  const totalStars = clampInt(profile.totalStars, 0, 999);
  const highestStage = clampInt(profile.highestStage, 0, 2);
  const quizzesSolved = clampInt(profile.quizzesSolved, 0, 100000);

  let encryptedVault = '';
  try {
    const cipher = await encryptVault(profile.parental, `yayle-cloud-${user.uid}`);
    encryptedVault = cipher.length <= 8192 ? cipher : '';
  } catch {
    encryptedVault = '';
  }

  // Save /users/{uid}
  try {
    const userRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      await setDoc(userRef, {
        ownerId: user.uid,
        nickname,
        avatarId,
        language,
        highScore,
        totalStars,
        highestStage,
        quizzesSolved,
        encryptedVault,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(userRef, {
        nickname,
        avatarId,
        language,
        highScore,
        totalStars,
        highestStage,
        quizzesSolved,
        encryptedVault,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }

  // Save /leaderboard/{uid} (strictly zero-PII public ranking)
  try {
    const lbRef = doc(db, 'leaderboard', user.uid);
    const existingLb = await getDoc(lbRef);
    if (!existingLb.exists()) {
      await setDoc(lbRef, {
        ownerId: user.uid,
        nickname,
        avatarId,
        score: highScore,
        stars: totalStars,
        quizzesSolved,
        stage: clampInt(highestStage + 1, 1, 3),
        isPublic: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(lbRef, {
        nickname,
        avatarId,
        score: highScore,
        stars: totalStars,
        quizzesSolved,
        stage: clampInt(highestStage + 1, 1, 3),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, lbPath);
  }
}

export async function fetchCloudLeaderboard(): Promise<LeaderboardItem[]> {
  if (!navigator.onLine) return [];
  const path = 'leaderboard';
  try {
    const q = query(collection(db, path), where('isPublic', '==', true), limit(40));
    const snap = await getDocs(q);
    const items: LeaderboardItem[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      items.push({
        id: docSnap.id,
        nickname: typeof d.nickname === 'string' ? d.nickname : 'Juara',
        avatarId: isValidAvatar(d.avatarId) ? d.avatarId : 'yayle',
        score: clampInt(Number(d.score ?? 0), 0, 1000000),
        stars: clampInt(Number(d.stars ?? 0), 0, 999),
        quizzesSolved: clampInt(Number(d.quizzesSolved ?? 0), 0, 100000),
        stage: clampInt(Number(d.stage ?? 1), 1, 3),
      });
    });
    return items;
  } catch (error) {
    // Graceful offline fallback if network drops mid-query
    if (!navigator.onLine) return [];
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
