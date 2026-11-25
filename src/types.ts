export type Language = 'id' | 'en' | 'ms';

export type AvatarId = 'yayle' | 'kiko' | 'nara';

export type GamePhase = 'title' | 'playing' | 'quiz' | 'paused' | 'gameover';

export type OutcomeKind = 'victory' | 'defeat' | 'time_limit';

export type EcoCategory = 'organic' | 'plastic' | 'paper' | 'energy';

export type PowerUpType = 'none' | 'double_points' | 'magnet' | 'extra_orb';

export interface LocalizedText {
  id: string;
  en: string;
  ms: string;
}

export interface CharacterDef {
  id: AvatarId;
  name: string;
  role: LocalizedText;
  portrait: string;
  primaryColor: string;
  accentColor: string;
  bgTint: string;
}

export interface QuizQuestion {
  id: string;
  topic: 'sorting' | 'water' | 'energy' | 'forest' | 'ocean';
  question: LocalizedText;
  options: [LocalizedText, LocalizedText, LocalizedText];
  correctIndex: 0 | 1 | 2;
  funFact: LocalizedText;
  rewardPowerUp: PowerUpType;
}

export interface PlaytimeDay {
  date: string; // YYYY-MM-DD
  seconds: number;
}

export interface ParentalSettings {
  dailyLimitMinutes: number; // 15 | 30 | 45 | 60
  reminderEnabled: boolean;
  reminderTime: string; // HH:MM
  lastReminderDate: string; // YYYY-MM-DD
  pinHash: string | null;
  pinSalt: string | null;
  playtimeLog: PlaytimeDay[];
  quizCorrectByTopic: Record<string, number>;
}

export interface PlayerProfile {
  uid: string | null; // null when playing in local offline profile
  isCloudSignedIn: boolean;
  nickname: string;
  avatarId: AvatarId;
  language: Language;
  highScore: number;
  totalStars: number;
  highestStage: number; // 0..2
  quizzesSolved: number;
  parental: ParentalSettings;
}

export interface LeaderboardItem {
  id: string;
  nickname: string;
  avatarId: AvatarId;
  score: number;
  stars: number;
  quizzesSolved: number;
  stage: number;
  isCurrentUser?: boolean;
  isSeed?: boolean;
}

export interface RunSnapshot {
  stageIndex: number;
  score: number;
  bestScore: number;
  starsEarned: number;
  targetsCleared: number;
  totalTargets: number;
  quizzesCorrect: number;
  orbsRemaining: number;
  outcome: OutcomeKind;
}

export interface HudState {
  score: number;
  combo: number;
  stageIndex: number;
  orbsLeft: number;
  maxOrbs: number;
  targetsCleared: number;
  totalTargets: number;
  currentCategory: EcoCategory;
  activePowerUp: PowerUpType;
  quizStarAvailable: boolean;
  windStrength: number; // -1..1
}
