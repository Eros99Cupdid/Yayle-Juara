import React, { useState } from 'react';
import { X, LogIn, LogOut, Lock, Check } from 'lucide-react';
import type { AvatarId, PlayerProfile } from '../types';
import type { Translations } from '../i18n/translations';
import { CHARACTERS } from '../data/characters';

interface AuthModalProps {
  profile: PlayerProfile;
  t: Translations;
  isOnline: boolean;
  authBusy: boolean;
  authError: string | null;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onSaveProfile: (nickname: string, avatarId: AvatarId) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  profile,
  t,
  isOnline,
  authBusy,
  authError,
  onGoogleSignIn,
  onGoogleSignOut,
  onSaveProfile,
  onClose,
}) => {
  const [nickname, setNickname] = useState(profile.nickname);
  const [avatarId, setAvatarId] = useState<AvatarId>(profile.avatarId);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = nickname.trim().slice(0, 32);
    if (!cleaned) return;
    onSaveProfile(cleaned, avatarId);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 42, 24, 0.74)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-md rounded-3xl bg-[#fefce8] border-[4px] border-[#143820] shadow-[0_8px_0_#143820] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b-2 border-[#143820]/10">
          <h2 id="auth-modal-title" className="font-display text-xl font-bold text-[#143820]">
            {t.authTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="w-9 h-9 rounded-xl bg-white hover:bg-stone-100 border-2 border-[#143820]/20 flex items-center justify-center text-[#143820] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs sm:text-sm font-semibold text-emerald-900 leading-relaxed">
            {t.authDesc}
          </p>

          {/* Google Cloud Sync Button */}
          {profile.isCloudSignedIn ? (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-100 border-2 border-emerald-700/30">
              <div className="text-xs font-extrabold text-emerald-950">
                {t.signedInCloud} · {profile.nickname}
              </div>
              <button
                type="button"
                disabled={authBusy}
                onClick={onGoogleSignOut}
                className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white hover:bg-stone-100 text-[#143820] text-xs font-extrabold border-2 border-[#143820]/25 cursor-pointer whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.signOut}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!isOnline || authBusy}
              onClick={onGoogleSignIn}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-white hover:bg-sky-50 disabled:opacity-50 text-[#143820] font-display font-bold text-base border-[3px] border-[#143820] shadow-[0_4px_0_#143820] cursor-pointer"
            >
              <LogIn className="w-5 h-5 text-sky-700" />
              <span>{t.googleLoginBtn}</span>
            </button>
          )}

          {authError && (
            <p className="text-xs font-bold text-amber-800" role="alert">
              {authError}
            </p>
          )}

          {/* Kid Nickname & Avatar Editor (Encrypted Local + Cloud Sync) */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2 border-t border-[#143820]/10">
            <div>
              <label htmlFor="kid-nickname-input" className="block text-xs font-extrabold text-emerald-900 mb-1.5">
                {t.nicknameLabel}
              </label>
              <input
                id="kid-nickname-input"
                type="text"
                maxLength={32}
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-white border-2 border-[#143820]/25 font-bold text-sm text-[#143820] focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => setAvatarId(char.id)}
                  className={`flex flex-col items-center p-2 rounded-xl border-2 cursor-pointer ${
                    avatarId === char.id
                      ? 'border-emerald-700 bg-emerald-100'
                      : 'border-[#143820]/15 bg-white'
                  }`}
                >
                  <img
                    src={char.portrait}
                    alt={char.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <span className="mt-1 text-xs font-extrabold text-[#143820]">{char.name}</span>
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="h-11 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-base border-[3px] border-[#143820] shadow-[0_3px_0_#143820] cursor-pointer"
            >
              {saved && <Check className="w-4 h-4" />}
              <span>{saved ? t.profileSaved : t.saveProfile}</span>
            </button>
          </form>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>{t.encryptionBadge}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
