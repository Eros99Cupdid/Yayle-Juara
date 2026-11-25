import React from 'react';
import { Volume2, VolumeX, Pause, RotateCcw, HelpCircle, Wind, Sparkles } from 'lucide-react';
import type { HudState } from '../types';
import type { Translations } from '../i18n/translations';
import { CategoryIconSvg, OrbSocketSvg } from './EcoIcons';

interface GameHudProps {
  hud: HudState;
  t: Translations;
  muted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
  onOpenQuiz: () => void;
  onQuickLaunch: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  hud,
  t,
  muted,
  onToggleMute,
  onPause,
  onRestart,
  onOpenQuiz,
  onQuickLaunch,
}) => {
  const stageName = t.stageNames[hud.stageIndex] ?? t.stageNames[0];
  const sockets = Math.min(hud.maxOrbs, 10);

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-3 sm:p-4">
      {/* Top Perimeter Clusters — keeps >= 85% viewport unobstructed, zero backdrop-blur */}
      <div className="flex items-start justify-between gap-3">
        {/* Top-Left: Score, Stage & Target Progress */}
        <div
          className="pointer-events-auto flex items-center gap-3 sm:gap-5 px-4 py-2 rounded-2xl border-[3px] border-[#143820] shadow-[0_4px_0_#143820]"
          style={{ backgroundColor: 'rgba(254, 252, 232, 0.94)' }}
        >
          <div>
            <div className="text-[10px] font-extrabold tracking-wider text-emerald-800 uppercase">
              {t.score}
            </div>
            <div
              className="font-mono-num text-2xl sm:text-3xl font-bold leading-none text-amber-400 hud-text-stroke-sm"
              data-testid="hud-score"
            >
              {hud.score}
            </div>
          </div>

          <div className="h-8 w-[2px] bg-[#143820]/15" />

          <div>
            <div className="text-[10px] font-extrabold tracking-wider text-emerald-800 uppercase">
              {t.stage} {hud.stageIndex + 1} · {stageName}
            </div>
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#143820]">
              <span className="font-mono-num" data-testid="hud-targets">
                {hud.targetsCleared}/{hud.totalTargets} {t.targets}
              </span>
              {hud.combo > 1 && (
                <span className="text-orange-600 font-mono-num">· {hud.combo}x</span>
              )}
            </div>
          </div>

          {Math.abs(hud.windStrength) > 0.1 && (
            <>
              <div className="hidden sm:block h-8 w-[2px] bg-[#143820]/15" />
              <div className="hidden sm:flex items-center gap-1.5 text-sky-800 font-bold text-xs">
                <Wind className="w-4 h-4 shrink-0" />
                <span>
                  {hud.windStrength < 0 ? '←' : '→'} {t.wind}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Top-Right: Compact World-Matched Utility Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenQuiz();
            }}
            aria-label={t.quizReady}
            className="flex items-center gap-1.5 h-11 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:translate-y-0.5 text-[#451a03] font-display font-bold text-sm border-[3px] border-[#143820] shadow-[0_3px_0_#143820] transition-transform whitespace-nowrap shrink-0 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>{t.quizBonus} [Q]</span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            aria-label={t.muteToggle}
            title={`${t.muteToggle} [M]`}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#fefce8] hover:bg-amber-100 active:translate-y-0.5 text-[#143820] border-[3px] border-[#143820] shadow-[0_3px_0_#143820] transition-transform cursor-pointer"
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onRestart();
            }}
            aria-label={t.restartStage}
            title={`${t.restartStage} [R]`}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#fefce8] hover:bg-amber-100 active:translate-y-0.5 text-[#143820] border-[3px] border-[#143820] shadow-[0_3px_0_#143820] transition-transform cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onPause();
            }}
            aria-label={t.pauseGame}
            title={`${t.pauseGame} [P]`}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#fefce8] hover:bg-amber-100 active:translate-y-0.5 text-[#143820] border-[3px] border-[#143820] shadow-[0_3px_0_#143820] transition-transform cursor-pointer"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Perimeter Strip: Active Eco-Orb Socket Cluster + Quick Fire Assist */}
      <div className="flex items-end justify-between gap-3">
        <div
          className="pointer-events-auto flex items-center gap-3 px-3.5 py-2 rounded-2xl border-[3px] border-[#143820] shadow-[0_4px_0_#143820]"
          style={{ backgroundColor: 'rgba(254, 252, 232, 0.94)' }}
        >
          <div className="flex items-center gap-2">
            <CategoryIconSvg category={hud.currentCategory} className="w-7 h-7 shrink-0" />
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                {t.orbs} (<span className="font-mono-num" data-testid="hud-orbs">{hud.orbsLeft}</span>)
              </div>
              <div className="text-sm font-extrabold text-[#143820] leading-tight">
                {t.categories[hud.currentCategory]}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: sockets }).map((_, idx) => (
              <OrbSocketSvg key={idx} filled={idx < hud.orbsLeft} className="w-4 h-4" />
            ))}
          </div>

          {hud.activePowerUp !== 'none' && (
            <div className="flex items-center gap-1 pl-2 border-l-2 border-[#143820]/15 text-xs font-extrabold text-amber-700">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{t.powerUps[hud.activePowerUp]}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            onQuickLaunch();
          }}
          className="pointer-events-auto px-4 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 text-white font-display font-bold text-sm border-[3px] border-[#143820] shadow-[0_3px_0_#143820] transition-transform whitespace-nowrap shrink-0 cursor-pointer"
        >
          {t.playNow === 'Play Now' ? 'Launch [Space]' : t.playNow === 'Mula Bermain' ? 'Lancar [Space]' : 'Luncur [Spasi]'}
        </button>
      </div>
    </div>
  );
};
