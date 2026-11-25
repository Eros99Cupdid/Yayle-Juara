import React from 'react';
import { X, Trophy, Star, RefreshCw } from 'lucide-react';
import type { LeaderboardItem } from '../types';
import type { Translations } from '../i18n/translations';
import { getCharacterById } from '../data/characters';

interface LeaderboardModalProps {
  entries: LeaderboardItem[];
  loading: boolean;
  isOnline: boolean;
  t: Translations;
  onRefresh: () => void;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  entries,
  loading,
  isOnline,
  t,
  onRefresh,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 42, 24, 0.72)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-modal-title"
    >
      <div className="w-full max-w-lg max-h-[88vh] flex flex-col rounded-3xl bg-[#fefce8] border-[4px] border-[#143820] shadow-[0_8px_0_#143820] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b-2 border-[#143820]/10">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <h2 id="leaderboard-modal-title" className="font-display text-xl font-bold text-[#143820] leading-tight">
                {t.leaderboardTitle}
              </h2>
              <p className="text-xs font-semibold text-emerald-800">
                {t.leaderboardSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isOnline && (
              <button
                type="button"
                onClick={onRefresh}
                aria-label="Refresh leaderboard"
                className="w-9 h-9 rounded-xl bg-white hover:bg-emerald-50 border-2 border-[#143820]/20 flex items-center justify-center text-[#143820] cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              className="w-9 h-9 rounded-xl bg-white hover:bg-stone-100 border-2 border-[#143820]/20 flex items-center justify-center text-[#143820] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ranking Rows */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {entries.map((entry, idx) => {
            const char = getCharacterById(entry.avatarId);
            const rank = idx + 1;
            const medalBg =
              rank === 1
                ? 'bg-amber-400 text-[#451a03]'
                : rank === 2
                  ? 'bg-slate-200 text-slate-900'
                  : rank === 3
                    ? 'bg-orange-300 text-orange-950'
                    : 'bg-emerald-100 text-emerald-900';

            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl border-2 ${
                  entry.isCurrentUser
                    ? 'bg-emerald-100 border-emerald-700'
                    : 'bg-white border-[#143820]/12'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-lg font-mono-num text-xs font-extrabold flex items-center justify-center shrink-0 ${medalBg}`}
                  >
                    {rank}
                  </span>
                  <img
                    src={char.portrait}
                    alt={char.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover border border-[#143820]/20 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-extrabold text-sm text-[#143820] truncate">
                      <span className="truncate">{entry.nickname}</span>
                      {entry.isCurrentUser && (
                        <span className="text-xs font-extrabold text-emerald-700">({t.you})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                      <span className="flex items-center gap-0.5 font-mono-num">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        {entry.stars}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num">
                        {entry.quizzesSolved} {t.quizBonus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono-num text-lg font-bold text-[#143820]">
                    {entry.score}
                  </div>
                  <div className="text-[10px] font-extrabold text-emerald-700 uppercase">
                    {t.score}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
