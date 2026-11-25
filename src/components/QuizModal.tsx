import React, { useState } from 'react';
import { CheckCircle2, XCircle, Sparkles, Leaf } from 'lucide-react';
import type { Language, QuizQuestion } from '../types';
import type { Translations } from '../i18n/translations';
import { soundEngine } from '../utils/soundEngine';

interface QuizModalProps {
  question: QuizQuestion;
  language: Language;
  t: Translations;
  onComplete: (correct: boolean, question: QuizQuestion) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  question,
  language,
  t,
  onComplete,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const answered = selectedIdx !== null;
  const isCorrect = selectedIdx === question.correctIndex;

  const handleChoose = (idx: number) => {
    if (answered) return;
    setSelectedIdx(idx);
    if (idx === question.correctIndex) {
      soundEngine.playQuizCorrect();
    } else {
      soundEngine.playQuizWrong();
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 42, 24, 0.72)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="eco-quiz-heading"
    >
      <div className="w-full max-w-lg rounded-3xl bg-[#fefce8] border-[4px] border-[#143820] shadow-[0_8px_0_#143820] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-emerald-800 font-display font-bold text-base">
            <Leaf className="w-5 h-5 text-emerald-600 shrink-0" />
            <span id="eco-quiz-heading">{t.quizTitle}</span>
          </div>
          <span className="text-xs font-extrabold text-amber-800">
            +200 · {t.powerUps[question.rewardPowerUp]}
          </span>
        </div>

        <h2 className="font-display text-xl sm:text-2xl font-bold text-[#143820] leading-snug mb-4">
          {question.question[language]}
        </h2>

        <div className="flex flex-col gap-2.5">
          {question.options.map((opt, idx) => {
            const isThisSelected = selectedIdx === idx;
            const isThisCorrect = idx === question.correctIndex;
            let btnStyle =
              'bg-white hover:bg-emerald-50 border-[#143820]/25 text-[#143820]';

            if (answered) {
              if (isThisCorrect) {
                btnStyle = 'bg-emerald-100 border-emerald-700 text-emerald-950';
              } else if (isThisSelected) {
                btnStyle = 'bg-amber-100 border-amber-700 text-amber-950';
              } else {
                btnStyle = 'bg-stone-100 border-stone-300 text-stone-500';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={answered}
                onClick={() => handleChoose(idx)}
                className={`flex items-center justify-between gap-3 w-full min-h-[54px] px-4 py-3 rounded-2xl border-[2.5px] text-left font-bold text-sm sm:text-base transition-colors cursor-pointer disabled:cursor-default ${btnStyle}`}
              >
                <span>
                  <strong className="mr-2 font-mono-num">
                    {String.fromCharCode(65 + idx)}.
                  </strong>
                  {opt[language]}
                </span>
                {answered && isThisCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                )}
                {answered && isThisSelected && !isThisCorrect && (
                  <XCircle className="w-5 h-5 text-amber-700 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-4 pt-4 border-t-2 border-[#143820]/10">
            <div
              className={`flex items-center gap-2 font-display font-bold text-base mb-1.5 ${
                isCorrect ? 'text-emerald-700' : 'text-amber-800'
              }`}
            >
              {isCorrect ? (
                <Sparkles className="w-5 h-5 shrink-0" />
              ) : (
                <Leaf className="w-5 h-5 shrink-0" />
              )}
              <span>{isCorrect ? t.quizCorrect : t.quizWrong}</span>
            </div>

            <p className="text-sm font-semibold text-[#1c2e1f] leading-relaxed mb-3">
              <strong>{t.funFact}:</strong> {question.funFact[language]}
            </p>

            {isCorrect && (
              <div className="text-xs font-extrabold text-emerald-800 mb-3">
                {t.rewardEarned}: +200 · {t.powerUps[question.rewardPowerUp]}
              </div>
            )}

            <button
              type="button"
              onClick={() => onComplete(isCorrect, question)}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 text-white font-display font-bold text-base border-[3px] border-[#143820] shadow-[0_4px_0_#143820] transition-transform cursor-pointer"
            >
              {t.continuePlay}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
