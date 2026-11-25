import React, { useState } from 'react';
import { Trophy, ShieldCheck, QrCode, UserCircle2, Lock, Play, Download } from 'lucide-react';
import type { AvatarId, Language, PlayerProfile } from '../types';
import type { Translations } from '../i18n/translations';
import { CHARACTERS, TITLE_BACKDROP_SRC } from '../data/characters';
import { YayleLogoSvg } from './EcoIcons';

interface TitleScreenProps {
  profile: PlayerProfile;
  selectedStage: number;
  t: Translations;
  isInstallable: boolean;
  isInstalled: boolean;
  onStartGame: () => void;
  onSelectAvatar: (id: AvatarId) => void;
  onSelectStage: (idx: number) => void;
  onChangeLanguage: (lang: Language) => void;
  onOpenLeaderboard: () => void;
  onOpenParental: () => void;
  onOpenQR: () => void;
  onOpenAccount: () => void;
  onDirectInstall: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  profile,
  selectedStage,
  t,
  isInstallable,
  isInstalled,
  onStartGame,
  onSelectAvatar,
  onSelectStage,
  onChangeLanguage,
  onOpenLeaderboard,
  onOpenParental,
  onOpenQR,
  onOpenAccount,
  onDirectInstall,
}) => {
  const [bgFailed, setBgFailed] = useState(false);

  return (
    <div className="fixed inset-0 z-30 overflow-hidden select-none bg-[#d9f99d]">
      {/* Illustrated Key-Art Backdrop with CSS fallback */}
      {!bgFailed ? (
        <img
          src={TITLE_BACKDROP_SRC}
          alt="Yayle Juara sunlit eco-park meadow"
          referrerPolicy="no-referrer"
          onError={() => setBgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, #bae6fd 0%, #fef9c3 48%, #4ade80 100%)' }}
        />
      )}

      {/* Subtle top-to-bottom readability scrim keeping upper sky calm & luminous */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(14, 58, 34, 0.12) 0%, rgba(14, 58, 34, 0.04) 45%, rgba(14, 58, 34, 0.56) 100%)',
        }}
      />

      <div className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden flex flex-col justify-between">

      {/* Top Utility Row: Language Switch + Game Feature Buttons (no website navbar!) */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-3 pt-3 sm:px-6 sm:pt-4">
        {/* Language Segmented Selector */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl border-2 border-[#143820] shadow-[0_3px_0_#143820]"
          style={{ backgroundColor: 'rgba(254, 252, 232, 0.94)' }}
          role="group"
          aria-label="Language"
        >
          {(['id', 'en', 'ms'] as Language[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => onChangeLanguage(lang)}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                profile.language === lang
                  ? 'bg-emerald-600 text-white'
                  : 'text-[#143820] hover:bg-emerald-100'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Compact Functional Triggers */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-[#fefce8] hover:bg-amber-100 text-[#143820] text-xs sm:text-sm font-extrabold border-2 border-[#143820] shadow-[0_3px_0_#143820] transition-transform active:translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{t.leaderboard}</span>
          </button>

          <button
            type="button"
            onClick={onOpenParental}
            className="flex items-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-[#fefce8] hover:bg-emerald-100 text-[#143820] text-xs sm:text-sm font-extrabold border-2 border-[#143820] shadow-[0_3px_0_#143820] transition-transform active:translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{t.parentalControls}</span>
          </button>

          <button
            type="button"
            onClick={onOpenQR}
            className="flex items-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-amber-300 hover:bg-amber-200 text-[#451a03] text-xs sm:text-sm font-extrabold border-2 border-[#143820] shadow-[0_3px_0_#143820] transition-transform active:translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span>{t.qrDownload}</span>
          </button>

          {isInstallable && !isInstalled && (
            <button
              type="button"
              onClick={onDirectInstall}
              className="flex items-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-extrabold border-2 border-[#143820] shadow-[0_3px_0_#143820] transition-transform active:translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>{t.installAppBtn}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAccount}
            className="flex items-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-[#fefce8] hover:bg-sky-100 text-[#143820] text-xs sm:text-sm font-extrabold border-2 border-[#143820] shadow-[0_3px_0_#143820] transition-transform active:translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <UserCircle2 className="w-4 h-4 text-sky-700 shrink-0" />
            <span className="max-w-[96px] sm:max-w-[110px] truncate">{profile.nickname}</span>
          </button>
        </div>
      </div>

      {/* Center Stage: Upper-Sky SVG Lockup + Clean Interactive Play Console */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-between gap-3 py-2 sm:py-4 px-3 sm:px-4">
        {/* Bespoke inline SVG Title Lockup positioned cleanly in the upper 35% calm sky */}
        <div className="w-full max-w-[270px] sm:max-w-[430px] mt-1 sm:mt-2">
          <YayleLogoSvg className="w-full h-auto" />
        </div>

        {/* Lower Focused Play Panel — Mascot Picker + Stage Selector + Primary Start CTA */}
        <div
          className="w-full max-w-[660px] rounded-3xl border-[3px] border-[#143820] shadow-[0_6px_0_#143820] p-4 sm:p-5 flex flex-col gap-4"
          style={{ backgroundColor: 'rgba(254, 252, 232, 0.96)' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Mascot Selector */}
            <div>
              <div className="text-xs font-extrabold text-emerald-900 mb-2">
                {t.chooseHero}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {CHARACTERS.map((char) => {
                  const selected = profile.avatarId === char.id;
                  return (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => onSelectAvatar(char.id)}
                      aria-pressed={selected}
                      className={`flex flex-col items-center p-1.5 rounded-2xl border-2 transition-transform cursor-pointer ${
                        selected
                          ? 'border-emerald-700 bg-emerald-100 scale-[1.03] shadow-[0_2px_0_#14532d]'
                          : 'border-[#143820]/20 bg-white hover:border-emerald-500'
                      }`}
                    >
                      <img
                        src={char.portrait}
                        alt={char.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-[#143820]/20"
                      />
                      <span className="mt-1 text-xs font-extrabold text-[#143820]">
                        {char.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stage Selector */}
            <div>
              <div className="text-xs font-extrabold text-emerald-900 mb-2">
                {t.stageSelect}
              </div>
              <div className="flex flex-col gap-1.5">
                {[0, 1, 2].map((idx) => {
                  const locked = idx > profile.highestStage;
                  const active = selectedStage === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={locked}
                      onClick={() => onSelectStage(idx)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border-2 text-left text-xs sm:text-sm font-extrabold transition-colors ${
                        locked
                          ? 'border-stone-300 bg-stone-100 text-stone-400 cursor-not-allowed'
                          : active
                            ? 'border-emerald-700 bg-emerald-600 text-white cursor-pointer'
                            : 'border-[#143820]/20 bg-white text-[#143820] hover:bg-emerald-50 cursor-pointer'
                      }`}
                    >
                      <span className="truncate">
                        {idx + 1}. {t.stageNames[idx]}
                      </span>
                      {locked && <Lock className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Primary Start CTA + Quiet Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-[#143820]/10">
            <div className="flex items-center gap-3 text-xs font-bold text-emerald-900">
              <span>
                {t.best}: <strong className="font-mono-num text-[#143820]">{profile.highScore}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {t.stars}: <strong className="font-mono-num text-[#143820]">{profile.totalStars}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {profile.isCloudSignedIn ? t.signedInCloud : t.offlineProfile}
              </span>
            </div>

            <button
              type="button"
              data-start="true"
              onClick={onStartGame}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 text-white font-display font-bold text-lg border-[3px] border-[#143820] shadow-[0_4px_0_#143820] transition-transform whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current shrink-0" />
              <span>{t.playNow}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Single Flat Borderless Control-Hint Line in Bottom Safe Margin */}
      <div className="relative z-10 pb-2.5 px-4 text-center">
        <p className="text-xs sm:text-[13px] font-bold text-[#fefce8] drop-shadow-[0_1px_2px_rgba(20,56,32,0.95)]">
          {t.controlHint}
        </p>
      </div>
      </div>
    </div>
  );
};
