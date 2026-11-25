import React, { useMemo, useState } from 'react';
import { X, ShieldCheck, Clock, Bell, Lock, KeyRound } from 'lucide-react';
import type { ParentalSettings, PlayerProfile } from '../types';
import type { Translations } from '../i18n/translations';
import {
  checkDailyTimeLimit,
  generateParentMathChallenge,
  hashPin,
  verifyPin,
} from '../utils/cryptoVault';
import { getTodayPlaytimeSeconds } from '../services/profileStorage';
import { requestAndSendPracticeNotification } from '../utils/notifications';

interface ParentalControlModalProps {
  profile: PlayerProfile;
  t: Translations;
  onUpdateParental: (next: ParentalSettings) => void;
  onClose: () => void;
}

const LIMIT_OPTIONS = [15, 30, 45, 60];

export const ParentalControlModal: React.FC<ParentalControlModalProps> = ({
  profile,
  t,
  onUpdateParental,
  onClose,
}) => {
  const hasCustomPin = Boolean(profile.parental.pinHash && profile.parental.pinSalt);
  const [unlocked, setUnlocked] = useState(false);
  const [gateInput, setGateInput] = useState('');
  const [gateError, setGateError] = useState(false);
  const [challenge] = useState(() => generateParentMathChallenge());

  const [newPin, setNewPin] = useState('');
  const [pinSavedMsg, setPinSavedMsg] = useState(false);
  const [notifFeedback, setNotifFeedback] = useState<string | null>(null);

  const todaySeconds = getTodayPlaytimeSeconds(profile);
  const limitStatus = useMemo(
    () => checkDailyTimeLimit(todaySeconds, profile.parental.dailyLimitMinutes),
    [todaySeconds, profile.parental.dailyLimitMinutes]
  );

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(false);

    if (hasCustomPin && profile.parental.pinHash && profile.parental.pinSalt) {
      const ok = await verifyPin(gateInput.trim(), profile.parental.pinHash, profile.parental.pinSalt);
      if (ok) {
        setUnlocked(true);
        return;
      }
      setGateError(true);
      return;
    }

    if (Number(gateInput.trim()) === challenge.answer) {
      setUnlocked(true);
    } else {
      setGateError(true);
    }
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newPin.trim();
    if (!/^\d{4}$/.test(cleaned)) return;
    const { hash, salt } = await hashPin(cleaned);
    onUpdateParental({
      ...profile.parental,
      pinHash: hash,
      pinSalt: salt,
    });
    setNewPin('');
    setPinSavedMsg(true);
    setTimeout(() => setPinSavedMsg(false), 3000);
  };

  const handleTestNotification = async () => {
    const res = await requestAndSendPracticeNotification(
      t.reminderBannerTitle,
      t.reminderBannerBody
    );
    if (res === 'sent') {
      setNotifFeedback(t.notificationSent);
    } else {
      setNotifFeedback(t.notificationDenied);
    }
  };

  const formatMinSec = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${mins}m ${String(rem).padStart(2, '0')}s`;
  };

  const maxLogSeconds = Math.max(
    60,
    ...profile.parental.playtimeLog.map((d) => d.seconds)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 42, 24, 0.74)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="parental-modal-title"
    >
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-[#fefce8] border-[4px] border-[#143820] shadow-[0_8px_0_#143820] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b-2 border-[#143820]/10">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
            <h2 id="parental-modal-title" className="font-display text-xl font-bold text-[#143820]">
              {unlocked ? t.parentalTitle : t.parentGateTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="w-9 h-9 rounded-xl bg-white hover:bg-stone-100 border-2 border-[#143820]/20 flex items-center justify-center text-[#143820] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {!unlocked ? (
            <form onSubmit={handleUnlock} className="flex flex-col gap-4">
              <p className="text-sm font-semibold text-emerald-900">
                {hasCustomPin ? t.parentPinPrompt : t.parentGatePrompt}
              </p>

              {!hasCustomPin && (
                <div
                  className="text-center py-3 px-4 rounded-2xl bg-white border-2 border-[#143820]/15 font-mono-num text-2xl font-bold text-[#143820]"
                  data-testid="parent-math-prompt"
                >
                  {challenge.prompt}
                </div>
              )}

              <div>
                <label htmlFor="parent-gate-input" className="sr-only">
                  {hasCustomPin ? t.parentPinPrompt : t.parentGatePrompt}
                </label>
                <input
                  id="parent-gate-input"
                  type={hasCustomPin ? 'password' : 'number'}
                  inputMode="numeric"
                  value={gateInput}
                  onChange={(e) => setGateInput(e.target.value)}
                  placeholder={hasCustomPin ? '••••' : '0'}
                  required
                  className="w-full h-12 px-4 rounded-2xl bg-white border-2 border-[#143820]/25 font-mono-num text-lg font-bold text-[#143820] focus:outline-none focus:border-emerald-700"
                />
              </div>

              {gateError && (
                <p className="text-xs font-extrabold text-amber-800" role="alert">
                  {t.wrongAnswer}
                </p>
              )}

              <button
                type="submit"
                className="h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-base border-[3px] border-[#143820] shadow-[0_4px_0_#143820] cursor-pointer"
              >
                {t.unlock}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Today's Playtime & Limit */}
              <div className="rounded-2xl bg-white border-2 border-[#143820]/15 p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 font-display font-bold text-base text-[#143820]">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    <span>{t.todayPlaytime}</span>
                  </div>
                  <span className="font-mono-num text-sm font-bold text-emerald-800">
                    {formatMinSec(todaySeconds)} / {profile.parental.dailyLimitMinutes} {t.minutes}
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-emerald-100 overflow-hidden mb-3">
                  <div
                    className={`h-full transition-all ${
                      limitStatus.percentUsed >= 90 ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${limitStatus.percentUsed}%` }}
                  />
                </div>

                <div className="text-xs font-extrabold text-emerald-900 mb-2">
                  {t.dailyLimit}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {LIMIT_OPTIONS.map((mins) => {
                    const active = profile.parental.dailyLimitMinutes === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() =>
                          onUpdateParental({
                            ...profile.parental,
                            dailyLimitMinutes: mins,
                          })
                        }
                        className={`h-10 rounded-xl font-mono-num text-sm font-bold border-2 transition-colors cursor-pointer ${
                          active
                            ? 'bg-emerald-600 text-white border-[#143820]'
                            : 'bg-[#fefce8] text-[#143820] border-[#143820]/20 hover:bg-emerald-50'
                        }`}
                      >
                        {mins} {t.minutes}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 7-Day Activity Mini Chart */}
              <div className="rounded-2xl bg-white border-2 border-[#143820]/15 p-4">
                <div className="text-xs font-extrabold text-emerald-900 mb-3">
                  {t.weeklyActivity}
                </div>
                <div className="flex items-end gap-2 h-20">
                  {profile.parental.playtimeLog.map((day) => {
                    const pct = Math.max(10, Math.round((day.seconds / maxLogSeconds) * 100));
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div
                          className="w-full max-w-[34px] rounded-t-lg bg-emerald-500 border border-[#143820]/30"
                          style={{ height: `${pct}%` }}
                          title={`${day.date}: ${Math.round(day.seconds / 60)}m`}
                        />
                        <span className="font-mono-num text-[10px] font-bold text-emerald-900">
                          {day.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Daily Practice Notification Reminder */}
              <div className="rounded-2xl bg-white border-2 border-[#143820]/15 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-display font-bold text-base text-[#143820]">
                    <Bell className="w-4 h-4 text-amber-600" />
                    <span>{t.dailyReminder}</span>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs font-extrabold text-[#143820] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.parental.reminderEnabled}
                      onChange={(e) =>
                        onUpdateParental({
                          ...profile.parental,
                          reminderEnabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-emerald-600"
                    />
                    <span>{profile.parental.reminderEnabled ? 'ON' : 'OFF'}</span>
                  </label>
                </div>

                <p className="text-xs font-semibold text-emerald-800">{t.reminderDesc}</p>

                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="flex items-center gap-2 text-xs font-extrabold text-[#143820]">
                    <span>{t.reminderTime}</span>
                    <input
                      type="time"
                      value={profile.parental.reminderTime}
                      onChange={(e) =>
                        onUpdateParental({
                          ...profile.parental,
                          reminderTime: e.target.value,
                        })
                      }
                      className="h-9 px-2.5 rounded-lg bg-[#fefce8] border-2 border-[#143820]/20 font-mono-num text-xs font-bold text-[#143820]"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleTestNotification}
                    className="h-9 px-3.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-[#451a03] text-xs font-extrabold border-2 border-[#143820] cursor-pointer"
                  >
                    {t.testNotification}
                  </button>
                </div>

                {notifFeedback && (
                  <p className="text-xs font-bold text-emerald-800">{notifFeedback}</p>
                )}
              </div>

              {/* Optional 4-Digit Parent PIN */}
              <form
                onSubmit={handleSavePin}
                className="rounded-2xl bg-white border-2 border-[#143820]/15 p-4 flex flex-col gap-2.5"
              >
                <div className="flex items-center gap-2 font-display font-bold text-sm text-[#143820]">
                  <KeyRound className="w-4 h-4 text-emerald-700" />
                  <span>{t.setPinTitle}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    pattern="\d{4}"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder={t.pinPlaceholder}
                    className="flex-1 h-10 px-3 rounded-xl bg-[#fefce8] border-2 border-[#143820]/20 font-mono-num text-sm font-bold text-[#143820]"
                  />
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold border-2 border-[#143820] cursor-pointer whitespace-nowrap"
                  >
                    {t.savePin}
                  </button>
                </div>
                {pinSavedMsg && (
                  <p className="text-xs font-bold text-emerald-700">{t.pinSaved}</p>
                )}
              </form>

              {/* Verified AES-256-GCM Encryption Assurance */}
              <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-2xl bg-emerald-100/80 border border-emerald-700/25">
                <Lock className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-extrabold text-emerald-950">
                    {t.encryptionBadge}
                  </div>
                  <p className="text-xs font-semibold text-emerald-900">
                    {t.encryptionDesc}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
