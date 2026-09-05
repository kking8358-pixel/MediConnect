import React, { useState, useEffect } from 'react';
import { KeyRound, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const OtpVerifyModal: React.FC = () => {
  const { isOtpModalOpen, setIsOtpModalOpen, verifyOtp, pendingPhone, language } = useAuth();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOtpModalOpen) return;
    setTimer(45);
    setDigits(['', '', '', '', '', '']);
    setError(null);

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOtpModalOpen]);

  if (!isOtpModalOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }
    const nextDigits = [...digits];
    nextDigits[index] = val;
    setDigits(nextDigits);

    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D+/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    document.getElementById(`otp-input-${focusIdx}`)?.focus();
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (!/^\d{6}$/.test(code)) {
      setError(language === 'en' ? 'Please enter all 6 digits (numbers only).' : '৬ সংখ্যার কোডটি সম্পূর্ণ পূরণ করুন।');
      return;
    }
    const success = await verifyOtp(code);
    if (!success) {
      setError(language === 'en' ? 'Invalid verification code.' : 'ভুল ভেরিফিকেশন কোড।');
    }
  };

  const autoFillDemoCode = () => {
    setDigits(['5', '4', '7', '0', '9', '1']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/90 backdrop-blur-sm animate-fade-in text-ink font-sans">
      <div className="relative w-full max-w-sm chart-panel p-6 sm:p-8 animate-slide-up space-y-6 shadow-none">
        
        {/* Close */}
        <button
          onClick={() => setIsOtpModalOpen(false)}
          className="absolute top-4 right-4 p-2 border border-transparent hover:border-ink hover:bg-paper-raised text-ink transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 pt-2 border-b border-line pb-4">
          <div className="w-12 h-12 mx-auto border-2 border-ink bg-paper text-ink flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest">
            {language === 'en' ? 'Security Verification' : 'নিরাপত্তা যাচাই (OTP)'}
          </h2>
          <p className="text-[10px] font-mono uppercase text-ink-soft">
            {language === 'en'
              ? `Enter the 6-digit code sent to ${pendingPhone || '+880 1798-123456'}`
              : `${pendingPhone || '+880 1798-123456'} নম্বরে প্রেরিত কোডটি লিখুন`}
          </p>
        </div>

        {/* Digits */}
        <div className="flex justify-between gap-2">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-input-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value.replace(/\D+/g, ''))}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="w-10 h-12 text-center text-lg font-bold font-mono bg-paper border border-line focus:bg-paper-raised focus:border-ink focus:outline-none text-ink transition-colors"
            />
          ))}
        </div>

        {error && (
          <p className="text-[10px] font-mono font-bold uppercase text-clinical-red text-center">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase text-ink-soft pt-2">
          <span>
            {language === 'en' ? 'Expires in:' : 'মেয়াদ:'}{' '}
            <span className="text-ink ml-1">00:{String(timer).padStart(2, '0')}</span>
          </span>
          {timer === 0 ? (
            <button
              onClick={() => setTimer(45)}
              className="text-ink hover:text-ink-soft"
            >
              Resend Code
            </button>
          ) : (
            <button
              onClick={autoFillDemoCode}
              className="text-ink hover:text-ink-soft underline"
            >
              Demo Auto-Fill
            </button>
          )}
        </div>

        <button
          onClick={handleVerify}
          className="w-full py-3 border border-ink bg-ink hover:bg-ink-soft text-paper font-mono font-bold uppercase text-[10px] flex items-center justify-center gap-3 transition-colors"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Confirm & Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
