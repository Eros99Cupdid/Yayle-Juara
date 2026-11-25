import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { Bell, WifiOff, X } from 'lucide-react';
import type {
  AvatarId,
  GamePhase,
  HudState,
  Language,
  LeaderboardItem,
  ParentalSettings,
  PlayerProfile,
  QuizQuestion,
  RunSnapshot,
} from './types';
import { TRANSLATIONS } from './i18n/translations';
import { pickNextQuiz } from './data/ecoQuizzes';
import { STAGE_DEFINITIONS } from './game/physicsLogic';
import {
  addPlaytimeSeconds,
  createDefaultProfile,
  getTodayPlaytimeSeconds,
  loadEncryptedLocalProfile,
  mergeLeaderboardEntries,
  saveEncryptedLocalProfile,
} from './services/profileStorage';
import {
  fetchCloudLeaderboard,
  loadCloudProfile,
  saveCloudProfileAndLeaderboard,
  signInWithGoogle,
  signOutGoogle,
  subscribeAuth,
  testFirestoreConnection,
} from './services/firebase';
import { checkDailyTimeLimit, getTodayDateKey } from './utils/cryptoVault';
import { isDailyReminderDue } from './utils/notifications';
import { soundEngine } from './utils/soundEngine';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { EcoPhysicsCanvas, type EcoPhysicsCanvasHandle } from './components/EcoPhysicsCanvas';
import { TitleScreen } from './components/TitleScreen';
import { GameHud } from './components/GameHud';
import { QuizModal } from './components/QuizModal';
import { StatusModal } from './components/StatusModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ParentalControlModal } from './components/ParentalControlModal';
import { QRDownloadModal } from './components/QRDownloadModal';
import { AuthModal } from './components/AuthModal';
import { ErrorBoundary } from './components/ErrorBoundary';

type ActiveDrawer = 'none' | 'leaderboard' | 'parental' | 'qr' | 'auth';

const INITIAL_HUD: HudState = {
  score: 0,
  combo: 0,
  stageIndex: 0,
  orbsLeft: STAGE_DEFINITIONS[0].maxOrbs,
  maxOrbs: STAGE_DEFINITIONS[0].maxOrbs,
  targetsCleared: 0,
  totalTargets: STAGE_DEFINITIONS[0].targets.length,
  currentCategory: 'organic',
  activePowerUp: 'none',
  quizStarAvailable: true,
  windStrength: 0,
};

function YayleJuaraApp() {
  const canvasHandleRef = useRef<EcoPhysicsCanvasHandle | null>(null);
  const seenQuizIdsRef = useRef<Set<string>>(new Set());
  const firebaseUserRef = useRef<User | null>(null);

  const [profile, setProfile] = useState<PlayerProfile>(() => createDefaultProfile());
  const [phase, setPhase] = useState<GamePhase>('title');
  const [selectedStage, setSelectedStage] = useState<number>(0);
  const [hud, setHud] = useState<HudState>(INITIAL_HUD);
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion | null>(null);
  const [runSnapshot, setRunSnapshot] = useState<RunSnapshot | null>(null);
  const [drawer, setDrawer] = useState<ActiveDrawer>('none');
  const [muted, setMuted] = useState(false);

  const [cloudLeaderboard, setCloudLeaderboard] = useState<LeaderboardItem[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showReminderToast, setShowReminderToast] = useState(false);

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  const t = TRANSLATIONS[profile.language];

  const persistProfile = useCallback((next: PlayerProfile) => {
    saveEncryptedLocalProfile(next);
    const fbUser = firebaseUserRef.current;
    if (fbUser && next.isCloudSignedIn) {
      saveCloudProfileAndLeaderboard(fbUser, next).catch(() => {});
    }
  }, []);

  const updateProfile = useCallback(
    (updater: (prev: PlayerProfile) => PlayerProfile) => {
      setProfile((prev) => {
        const next = updater(prev);
        persistProfile(next);
        return next;
      });
    },
    [persistProfile]
  );

  // Mirror game state to document.body.dataset.state for clean verification & accessibility
  useEffect(() => {
    const bodyState = phase === 'quiz' ? 'paused' : phase;
    document.body.dataset.state = bodyState;
  }, [phase]);

  // Initial load: encrypted local vault + URL flags (?autostart=1, ?install=1) + Firestore test
  useEffect(() => {
    testFirestoreConnection();

    let reminderTimer: number | undefined;
    loadEncryptedLocalProfile().then((loaded) => {
      setProfile(loaded);

      const isReturningPlayer = loaded.highScore > 0 || loaded.quizzesSolved > 0;
      if (
        isReturningPlayer &&
        isDailyReminderDue(
          loaded.parental.reminderEnabled,
          loaded.parental.reminderTime,
          loaded.parental.lastReminderDate
        )
      ) {
        reminderTimer = window.setTimeout(() => {
          setShowReminderToast(true);
        }, 12000);
      }
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      document.body.dataset.state = 'playing';
      setPhase('playing');
    } else if (params.get('install') === '1') {
      setDrawer('qr');
    }

    return () => {
      if (reminderTimer) window.clearTimeout(reminderTimer);
    };
  }, []);

  // Subscribe to Firebase Auth changes
  useEffect(() => {
    const unsub = subscribeAuth(async (user) => {
      firebaseUserRef.current = user;
      if (user) {
        const local = await loadEncryptedLocalProfile();
        const merged = await loadCloudProfile(user, local);
        setProfile(merged);
        await saveEncryptedLocalProfile(merged);
        saveCloudProfileAndLeaderboard(user, merged).catch(() => {});
      } else {
        setProfile((prev) => ({
          ...prev,
          uid: null,
          isCloudSignedIn: false,
        }));
      }
    });
    return unsub;
  }, []);

  // Refresh leaderboard helper
  const refreshLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const items = await fetchCloudLeaderboard();
      setCloudLeaderboard(items);
    } catch {
      // Keep cached/seed entries if offline
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (drawer === 'leaderboard') {
      refreshLeaderboard();
    }
  }, [drawer, refreshLeaderboard]);

  // Live playtime monitor & Parental Daily Limit enforcer (ticks every 5s during active play)
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'quiz') return;
    const timer = window.setInterval(() => {
      updateProfile((prev) => {
        const updated = addPlaytimeSeconds(prev, 5);
        const todaySec = getTodayPlaytimeSeconds(updated);
        const status = checkDailyTimeLimit(todaySec, updated.parental.dailyLimitMinutes);
        if (status.limitReached) {
          setRunSnapshot({
            stageIndex: selectedStage,
            score: hud.score,
            bestScore: prev.highScore,
            starsEarned: 0,
            targetsCleared: hud.targetsCleared,
            totalTargets: hud.totalTargets,
            quizzesCorrect: 0,
            orbsRemaining: hud.orbsLeft,
            outcome: 'time_limit',
          });
          setPhase('gameover');
        }
        return updated;
      });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [phase, selectedStage, hud.score, hud.targetsCleared, hud.totalTargets, hud.orbsLeft, updateProfile]);

  const startStage = useCallback(
    (stageIdx: number) => {
      const todaySec = getTodayPlaytimeSeconds(profile);
      const status = checkDailyTimeLimit(todaySec, profile.parental.dailyLimitMinutes);
      if (status.limitReached) {
        setRunSnapshot({
          stageIndex: stageIdx,
          score: 0,
          bestScore: profile.highScore,
          starsEarned: 0,
          targetsCleared: 0,
          totalTargets: STAGE_DEFINITIONS[stageIdx].targets.length,
          quizzesCorrect: 0,
          orbsRemaining: STAGE_DEFINITIONS[stageIdx].maxOrbs,
          outcome: 'time_limit',
        });
        setPhase('gameover');
        return;
      }

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      soundEngine.playButton();
      setSelectedStage(stageIdx);
      setRunSnapshot(null);
      setActiveQuiz(null);
      setDrawer('none');
      document.body.dataset.state = 'playing';
      setPhase('playing');
      canvasHandleRef.current?.resetStage(stageIdx);
    },
    [profile]
  );

  const openQuizChallenge = useCallback(() => {
    if (phase !== 'playing') return;
    const nextQ = pickNextQuiz(seenQuizIdsRef.current);
    seenQuizIdsRef.current.add(nextQ.id);
    setActiveQuiz(nextQ);
    setPhase('quiz');
  }, [phase]);

  const handleQuizComplete = useCallback(
    (correct: boolean, question: QuizQuestion) => {
      setActiveQuiz(null);
      setPhase('playing');
      if (correct) {
        canvasHandleRef.current?.applyQuizReward(question.rewardPowerUp, 200);
        updateProfile((prev) => ({
          ...prev,
          quizzesSolved: prev.quizzesSolved + 1,
          parental: {
            ...prev.parental,
            quizCorrectByTopic: {
              ...prev.parental.quizCorrectByTopic,
              [question.topic]: (prev.parental.quizCorrectByTopic[question.topic] ?? 0) + 1,
            },
          },
        }));
      }
    },
    [updateProfile]
  );

  const handleStageComplete = useCallback(
    (snapshot: RunSnapshot) => {
      setRunSnapshot(snapshot);
      setPhase('gameover');
      updateProfile((prev) => ({
        ...prev,
        highScore: Math.max(prev.highScore, snapshot.score),
        totalStars: prev.totalStars + snapshot.starsEarned,
        highestStage:
          snapshot.outcome === 'victory'
            ? Math.min(2, Math.max(prev.highestStage, snapshot.stageIndex + 1))
            : prev.highestStage,
      }));
    },
    [updateProfile]
  );

  const handleToggleMute = useCallback(() => {
    const next = soundEngine.toggleMute();
    setMuted(next);
  }, []);

  // Global keyboard shortcuts (Title Enter/Space start, Playing P/Esc pause, M mute, R restart, Q quiz)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (drawer !== 'none') {
        if (e.code === 'Escape') setDrawer('none');
        return;
      }

      if (phase === 'title' && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        startStage(selectedStage);
        return;
      }

      if (phase === 'playing') {
        if (e.code === 'KeyP' || e.code === 'Escape') {
          e.preventDefault();
          setPhase('paused');
        } else if (e.code === 'KeyM') {
          e.preventDefault();
          handleToggleMute();
        } else if (e.code === 'KeyR') {
          e.preventDefault();
          startStage(selectedStage);
        } else if (e.code === 'KeyQ') {
          e.preventDefault();
          openQuizChallenge();
        }
      } else if (phase === 'paused') {
        if (e.code === 'KeyP' || e.code === 'Escape') {
          e.preventDefault();
          setPhase('playing');
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, drawer, selectedStage, startStage, handleToggleMute, openQuizChallenge]);

  const handleGoogleSignIn = async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-in cancelled.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleGoogleSignOut = async () => {
    setAuthBusy(true);
    try {
      await signOutGoogle();
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSaveProfile = (nickname: string, avatarId: AvatarId) => {
    updateProfile((prev) => ({
      ...prev,
      nickname,
      avatarId,
    }));
  };

  const handleUpdateParental = (nextParental: ParentalSettings) => {
    updateProfile((prev) => ({
      ...prev,
      parental: nextParental,
    }));
  };

  const dismissDailyReminder = () => {
    setShowReminderToast(false);
    const today = getTodayDateKey();
    updateProfile((prev) => ({
      ...prev,
      parental: {
        ...prev.parental,
        lastReminderDate: today,
      },
    }));
  };

  const mergedLeaderboard = mergeLeaderboardEntries(cloudLeaderboard, profile);

  return (
    <main className="relative w-full h-full overflow-hidden">
      {/* Persistent Isolated 60fps Physics Canvas */}
      <EcoPhysicsCanvas
        ref={canvasHandleRef}
        phase={phase}
        stageIndex={selectedStage}
        avatarId={profile.avatarId}
        bestScore={profile.highScore}
        categoryLabels={t.categories}
        onHudChange={setHud}
        onTriggerQuiz={openQuizChallenge}
        onStageComplete={handleStageComplete}
      />

      {/* Title Screen */}
      {phase === 'title' && (
        <TitleScreen
          profile={profile}
          selectedStage={selectedStage}
          t={t}
          isInstallable={isInstallable}
          isInstalled={isInstalled}
          onStartGame={() => startStage(selectedStage)}
          onSelectAvatar={(avatarId: AvatarId) =>
            updateProfile((prev) => ({ ...prev, avatarId }))
          }
          onSelectStage={(idx) => setSelectedStage(idx)}
          onChangeLanguage={(language: Language) =>
            updateProfile((prev) => ({ ...prev, language }))
          }
          onOpenLeaderboard={() => setDrawer('leaderboard')}
          onOpenParental={() => setDrawer('parental')}
          onOpenQR={() => setDrawer('qr')}
          onOpenAccount={() => setDrawer('auth')}
          onDirectInstall={() => {
            install();
          }}
        />
      )}

      {/* Active Gameplay HUD */}
      {(phase === 'playing' || phase === 'quiz') && (
        <GameHud
          hud={hud}
          t={t}
          muted={muted}
          onToggleMute={handleToggleMute}
          onPause={() => setPhase('paused')}
          onRestart={() => startStage(selectedStage)}
          onOpenQuiz={openQuizChallenge}
          onQuickLaunch={() => canvasHandleRef.current?.launchAimedShot()}
        />
      )}

      {/* Interactive Environmental Quiz Overlay */}
      {phase === 'quiz' && activeQuiz && (
        <QuizModal
          question={activeQuiz}
          language={profile.language}
          t={t}
          onComplete={handleQuizComplete}
        />
      )}

      {/* Pause / Victory / Game Over / Parental Limit Modal */}
      {(phase === 'paused' || phase === 'gameover') && (
        <StatusModal
          mode={phase}
          snapshot={runSnapshot}
          t={t}
          onResume={() => setPhase('playing')}
          onRestart={() => startStage(selectedStage)}
          onNextStage={() => startStage(Math.min(2, selectedStage + 1))}
          onTitle={() => {
            setRunSnapshot(null);
            setPhase('title');
          }}
          onOpenParental={() => setDrawer('parental')}
        />
      )}

      {/* Feature Drawers / Modals */}
      {drawer === 'leaderboard' && (
        <LeaderboardModal
          entries={mergedLeaderboard}
          loading={leaderboardLoading}
          isOnline={isOnline}
          t={t}
          onRefresh={refreshLeaderboard}
          onClose={() => setDrawer('none')}
        />
      )}

      {drawer === 'parental' && (
        <ParentalControlModal
          profile={profile}
          t={t}
          onUpdateParental={handleUpdateParental}
          onClose={() => setDrawer('none')}
        />
      )}

      {drawer === 'qr' && (
        <QRDownloadModal
          t={t}
          isInstallable={isInstallable}
          isInstalled={isInstalled}
          isIOS={isIOS}
          onInstallPWA={() => {
            install();
          }}
          onClose={() => setDrawer('none')}
        />
      )}

      {drawer === 'auth' && (
        <AuthModal
          profile={profile}
          t={t}
          isOnline={isOnline}
          authBusy={authBusy}
          authError={authError}
          onGoogleSignIn={handleGoogleSignIn}
          onGoogleSignOut={handleGoogleSignOut}
          onSaveProfile={handleSaveProfile}
          onClose={() => setDrawer('none')}
        />
      )}

      {/* Daily Practice Reminder Toast */}
      {showReminderToast && phase === 'title' && drawer === 'none' && (
        <div
          className="fixed bottom-11 right-4 z-40 max-w-xs rounded-2xl bg-[#fefce8] border-[3px] border-[#143820] shadow-[0_4px_0_#143820] p-3.5 flex items-start gap-2.5"
          role="status"
        >
          <Bell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-sm text-[#143820]">
              {t.reminderBannerTitle}
            </div>
            <p className="text-xs font-semibold text-emerald-900 mt-0.5">
              {t.reminderBannerBody}
            </p>
          </div>
          <button
            type="button"
            onClick={dismissDailyReminder}
            aria-label={t.close}
            className="text-[#143820] hover:text-emerald-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Non-Intrusive Offline Mode Indicator */}
      {!isOnline && (
        <div
          className="fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-extrabold text-white border-2 border-[#451a03] shadow-md"
          role="status"
        >
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>{t.offlineBanner}</span>
        </div>
      )}
    </main>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <YayleJuaraApp />
    </ErrorBoundary>
  );
}
