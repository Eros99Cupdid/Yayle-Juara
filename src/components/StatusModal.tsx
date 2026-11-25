import React from 'react';
import { Play, RotateCcw, Home, ArrowRight, ShieldCheck } from 'lucide-react';
import type { RunSnapshot } from '../types';
import type { Translations } from '../i18n/translations';
import { StarBadgeSvg } from './EcoIcons';

interface StatusModalProps {
  mode: 'paused' | 'gameover';
  snapshot: RunSnapshot | null;
  t: Translations;
  onResume: () => void;
  onRestart: () => void;
  onNextStage: () => void;
  onTitle: () => void;
  onOpenParental: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  mode,
  snapshot,
  t,
  onResume,
  onRestart,
  onNextStage,
  onTitle,
  onOpenParental,
}) => {
  if (mode === 'paused') {
    return (
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(15, 42, 24, 0.72)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-modal-title"
      >
        <div className="w-full max-w-sm rounded-3xl bg-[#fefce8] border-[4px] border-[#143820] shadow-[0_8px_0_#143820] p-6 text-center">
          <h2 id="pause-modal-title" className="font-display text-2xl font-bold text-[#143820] mb-5">
            {t.pausedTitle}
          </h2>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onResume}
              className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-base border-[3px] border-[#143820] shadow-[0_4px_0_#143820] cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t.resume}</span>
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="flex items-center justify-center gap-2 h-11 rounded-2xl bg-amber-300 hover:bg-amber-200 text-[#451a03] font-display font-bold text-base border-[3px] border-[#143820] shadow-[0_3px_0_#143820] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.restart}</span>
            </button>
            <button
              type="button"
              onClick={onTitle}
              className="flex items-center justify-center gap-2 h-11 rounded-2xl bg-white hover:bg-stone-100 text-[#143820] font-display font-bold text-base border-[3px] border-[#143820] shadow-[0_3px_0_#143820] cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>{t.backToTitle}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!snapshot) return null;

  if (snapshot.outcome === 'time_limit') {
    return (
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(15, 42, 24, 0.78)' }}
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-md rounded-3xl bg-[#fefce8] border-[4px] border-[#143820] shadow-[0_8px_0_#143820] p-6 text-center">
          <h2 className="font-display text-2xl font-bold text-[#143820] mb-2">
            {t.breakTimeTitle}
          </h2>
          <p className="text-sm font-semibold text-emerald-900 mb-5 leading-relaxed">
            {t.breakTimeDesc}
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onOpenParental}
              className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-base border-[3px] border-[#143820] shadow-[0_4px_0_#143820] cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{t.parentExtend}</span>
            </button>
            <button
              type="button"
              onClick={onTitle}
              className="flex items-center justify-center gap-2 h-11 rounded-2xl bg-white hover:bg-stone-100 text-[#143820] font-display font-bold text-sm border-[3px] border-[#143820] shadow-[0_3px_0_#143820] cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>{t.backToTitle}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isVictory = snapshot.outcome === 'victory';
  const hasNextStage = isVictory && snapshot.stageIndex < 2;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 42, 24, 0.72)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="outcome-modal-title"
    >
      <div className="w-full max-w-md rounded-3xl bg-[#fefce8] border-[4px] border-[#143820] shadow-[0_8px_0_#143820] p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          {[1, 2, 3].map((starNum) => (
            <StarBadgeSvg
              key={starNum}
              filled={starNum <= snapshot.starsEarned}
              className="w-11 h-11"
            />
          ))}
        </div>

        <h2 id="outcome-modal-title" className="font-display text-2xl sm:text-3xl font-bold text-[#143820] mb-1">
          {isVictory ? t.victoryTitle : t.defeatTitle}
        </h2>
        <p className="text-xs font-extrabold text-emerald-800 mb-5">
          {t.stage} {snapshot.stageIndex + 1} · {t.stageNames[snapshot.stageIndex]}
        </p>

        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="rounded-2xl bg-white border-2 border-[#143820]/15 p-3">
            <div className="text-[11px] font-extrabold text-emerald-800 uppercase">{t.score}</div>
            <div className="font-mono-num text-xl font-bold text-[#143820] mt-0.5">
              {snapshot.score}
            </div>
          </div>
          <div className="rounded-2xl bg-white border-2 border-[#143820]/15 p-3">
            <div className="text-[11px] font-extrabold text-emerald-800 uppercase">{t.targets}</div>
            <div className="font-mono-num text-xl font-bold text-[#143820] mt-0.5">
              {snapshot.targetsCleared}/{snapshot.totalTargets}
            </div>
          </div>
          <div className="rounded-2xl bg-white border-2 border-[#143820]/15 p-3">
            <div className="text-[11px] font-extrabold text-emerald-800 uppercase">{t.quizzesMastered}</div>
            <div className="font-mono-num text-xl font-bold text-[#143820] mt-0.5">
              {snapshot.quizzesCorrect}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {hasNextStage ? (
            <button
              type="button"
              data-start="true"
              onClick={onNextStage}
              className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-base border-[3px] border-[#143820] shadow-[0_4px_0_#143820] cursor-pointer"
            >
              <span>{t.nextStage}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              data-start="true"
              onClick={onRestart}
              className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-base border-[3px] border-[#143820] shadow-[0_4px_0_#143820] cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>{t.playAgain}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onTitle}
            className="flex items-center justify-center gap-2 h-11 rounded-2xl bg-white hover:bg-stone-100 text-[#143820] font-display font-bold text-sm border-[3px] border-[#143820] shadow-[0_3px_0_#143820] cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{t.backToTitle}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
