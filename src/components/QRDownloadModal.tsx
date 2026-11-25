import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, Smartphone, Share2 } from 'lucide-react';
import type { Translations } from '../i18n/translations';
import { getLiveInstallUrl } from '../hooks/usePWAInstall';

interface QRDownloadModalProps {
  t: Translations;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onInstallPWA: () => void;
  onClose: () => void;
}

export const QRDownloadModal: React.FC<QRDownloadModalProps> = ({
  t,
  isInstallable,
  isInstalled,
  isIOS,
  onInstallPWA,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(isIOS);
  const targetUrl = getLiveInstallUrl();

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(targetUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#143820',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [targetUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard fallback ignored silently
    }
  };

  const handleDownloadQrPng = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'yayle-juara-android-ios-qr.png';
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 42, 24, 0.74)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl bg-[#fefce8] border-[4px] border-[#143820] shadow-[0_8px_0_#143820] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b-2 border-[#143820]/10">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-6 h-6 text-emerald-700 shrink-0" />
            <h2 id="qr-modal-title" className="font-display text-xl font-bold text-[#143820]">
              {t.qrTitle}
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
        <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center text-center gap-4">
          <p className="text-sm font-semibold text-emerald-900 leading-relaxed">
            {t.qrSubtitle}
          </p>

          {/* Auto-generated live internet QR Code */}
          <div className="p-3 rounded-2xl bg-white border-[3px] border-[#143820] shadow-[0_4px_0_#143820]">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code Yayle Juara Android & iOS"
                data-testid="qr-code-image"
                className="w-52 h-52 sm:w-56 sm:h-56 block"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-xs font-bold text-emerald-800">
                QR...
              </div>
            )}
          </div>

          <div className="text-xs font-bold text-emerald-800">
            {t.qrAutoNote}
          </div>

          {/* Direct PWA Install CTA (Android/Chrome) or iOS Safari Steps */}
          <div className="w-full flex flex-col gap-2.5">
            {isInstalled ? (
              <div className="py-2.5 px-4 rounded-xl bg-emerald-100 text-emerald-900 font-extrabold text-sm">
                {t.installedBadge}
              </div>
            ) : (
              <>
                {isInstallable && (
                  <button
                    type="button"
                    onClick={onInstallPWA}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-base border-[3px] border-[#143820] shadow-[0_4px_0_#143820] cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    <span>{t.installAppBtn}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowIosSteps((v) => !v)}
                  className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-emerald-50 text-[#143820] text-xs font-extrabold border-2 border-[#143820]/25 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-sky-700" />
                  <span>{t.installIOSBtn}</span>
                </button>

                {showIosSteps && (
                  <div className="rounded-2xl bg-white border-2 border-[#143820]/15 p-3.5 text-left text-xs font-semibold text-[#1c2e1f] space-y-1.5">
                    <div className="font-display font-bold text-sm text-[#143820]">
                      {t.iosGuideTitle}
                    </div>
                    <p>{t.iosStep1}</p>
                    <p>{t.iosStep2}</p>
                  </div>
                )}
              </>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadQrPng}
                className="h-10 flex items-center justify-center gap-1.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-[#451a03] text-xs font-extrabold border-2 border-[#143820] cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>{t.downloadQrPng}</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="h-10 flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-emerald-50 text-[#143820] text-xs font-extrabold border-2 border-[#143820]/25 cursor-pointer whitespace-nowrap"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
                <span>{copied ? t.linkCopied : t.copyLink}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
