'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { AlertCircle, Lock, Mail, User, Phone, MapPin } from 'lucide-react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [userOtp, setUserOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpMessage, setOtpMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Resend OTP Countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError(null);
    setOtpMessage(null);

    try {
      const response = await api.post('/auth/send-otp', { email });
      setOtpSent(true);
      setResendCountdown(60);

      if (response.mock && response.code) {
        let successMsg = '';
        if (language === 'LA') {
          successMsg = `${response.messageLa || response.messageEn} (ລະຫັດຢືນຢັນຂອງທ່ານແມ່ນ: ${response.code})`;
        } else if (language === 'TH') {
          successMsg = `${response.messageTh || response.messageEn} (รหัสยืนยันของคุณคือ: ${response.code})`;
        } else {
          successMsg = `${response.messageEn} (Your code is: ${response.code})`;
        }
        setOtpMessage({
          text: successMsg,
          type: 'success'
        });
      } else {
        let successMsg = '';
        if (language === 'LA') {
          successMsg = response.messageLa || response.messageEn;
        } else if (language === 'TH') {
          successMsg = response.messageTh || response.messageEn;
        } else {
          successMsg = response.messageEn;
        }
        setOtpMessage({
          text: successMsg,
          type: 'success'
        });
      }
    } catch (err: any) {
      try {
        const parsedErr = JSON.parse(err.message);
        const errMsg = language === 'LA'
          ? (parsedErr.messageLa || parsedErr.messageEn)
          : language === 'TH'
            ? (parsedErr.messageTh || parsedErr.messageEn)
            : parsedErr.messageEn;
        setError(errMsg);
      } catch (e) {
        setError(err.message || 'Failed to send OTP code');
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (!userOtp) return;
    setError(null);
    setOtpMessage(null);

    try {
      await api.post('/auth/verify-otp', { email, code: userOtp });
      setIsEmailVerified(true);
      setOtpMessage(null);
    } catch (err: any) {
      try {
        const parsedErr = JSON.parse(err.message);
        const errMsg = language === 'LA'
          ? (parsedErr.messageLa || parsedErr.messageEn)
          : language === 'TH'
            ? (parsedErr.messageTh || parsedErr.messageEn)
            : parsedErr.messageEn;
        setOtpMessage({
          text: errMsg,
          type: 'error'
        });
      } catch (e) {
        setOtpMessage({
          text: err.message || 'Invalid OTP code. Please try again.',
          type: 'error'
        });
      }
    }
  };

  const redirectTo = searchParams.get('redirect') || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError('Please fill in all required fields');
      return;
    }
    if (phoneRaw.length !== 8) {
      setError('Phone number must be exactly 8 digits');
      return;
    }
    if (!isEmailVerified) {
      setError(t('pleaseVerifyPhone'));
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const finalPhone = `+85620${phoneRaw}`;
      await register({ email, password, name, phone: finalPhone, address });
      router.push(redirectTo);
    } catch (err: any) {
      try {
        const parsedErr = JSON.parse(err.message);
        setError(language === 'TH' ? (parsedErr.messageTh || parsedErr.messageEn) : language === 'LA' ? (parsedErr.messageLa || parsedErr.messageEn) : parsedErr.messageEn);
      } catch (e) {
        setError(err.message || 'Registration failed. Try a different email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-[var(--border-color)] bg-white dark:bg-slate-800/80 p-8 shadow-lg">
        
        {/* Header */}
        <div className="text-center">
          <span className="font-display text-4xl font-black tracking-tight select-none">
            <span className="text-brand-pink-500">K</span>
            <span className="text-brand-blue-500">i</span>
            <span className="text-brand-yellow-500">d</span>
            <span className="text-brand-mint-500">s</span>
            <span className="text-brand-purple-500">S</span>
            <span className="text-brand-orange-500">h</span>
            <span className="text-brand-pink-500">o</span>
            <span className="text-brand-blue-500">p</span>
          </span>
          <h2 className="mt-4 font-display text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            {t('registerTitle')}
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {t('registerSub')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-3.5 shadow-sm">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">
                {t('nameLabel')} *
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2 pl-10 pr-4 text-sm focus:border-brand-pink-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">
                {t('emailLabel')} *
              </label>
              <div className="relative mt-1 flex items-center">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  disabled={isEmailVerified}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2 pl-10 pr-28 text-sm focus:border-brand-pink-400 focus:outline-none disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-900/50"
                />
                <button
                  type="button"
                  disabled={!email || resendCountdown > 0 || isEmailVerified}
                  onClick={handleSendOtp}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-brand-pink-500 hover:bg-brand-pink-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white disabled:text-slate-400 dark:disabled:text-slate-500 px-3 py-1.5 text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                >
                  {isEmailVerified ? '✓' : resendCountdown > 0 ? `${resendCountdown}s` : t('sendOtp')}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">
                {t('passwordLabel')} *
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2 pl-10 pr-4 text-sm focus:border-brand-pink-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">
                {t('phoneLabel')} *
              </label>
              <div className="relative mt-1 flex items-center">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 dark:text-slate-400 text-sm font-semibold border-r border-slate-200 dark:border-slate-700 pr-2">
                  <Phone className="h-4 w-4 mr-1.5 text-slate-400" />
                  <span>+856 20</span>
                </div>
                <input
                  type="text"
                  maxLength={8}
                  required
                  value={phoneRaw}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // numbers only
                    setPhoneRaw(val);
                  }}
                  placeholder={t('phonePlaceholder')}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2 pl-[105px] pr-4 text-sm focus:border-brand-pink-400 focus:outline-none"
                />
              </div>
            </div>

            {otpSent && !isEmailVerified && (
              <div className="p-4 rounded-2xl bg-brand-pink-50/30 dark:bg-brand-pink-950/10 border border-brand-pink-100/50 dark:border-brand-pink-900/20 space-y-3 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-350">
                    {t('otpLabel')} *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpMessage(null);
                    }}
                    className="text-[10px] font-bold text-slate-400 hover:text-brand-pink-500"
                  >
                    Change Email
                  </button>
                </div>
                <div className="relative flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={userOtp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ''); // numbers only
                      setUserOtp(val);
                    }}
                    placeholder={t('otpPlaceholder')}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs focus:border-brand-pink-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="rounded-xl bg-brand-pink-500 hover:bg-brand-pink-600 text-white px-4 py-1.5 text-xs font-bold active:scale-95 transition-all cursor-pointer"
                  >
                    {t('verifyOtp')}
                  </button>
                </div>
                
                {otpMessage && (
                  <p className={`text-[10px] font-bold ${otpMessage.type === 'success' ? 'text-brand-mint-500' : 'text-red-500'}`}>
                    {otpMessage.text}
                  </p>
                )}
              </div>
            )}
            
            {isEmailVerified && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-brand-mint-50/50 dark:bg-brand-mint-950/10 border border-brand-mint-100/30 text-brand-mint-600 dark:text-brand-mint-400 text-xs font-bold animate-fadeIn">
                <span className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-mint-500 text-white text-[10px]">✓</span>
                  Email verified ({email})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsEmailVerified(false);
                    setOtpSent(false);
                    setOtpMessage(null);
                  }}
                  className="text-[10px] text-slate-400 hover:text-red-500 underline"
                >
                  Edit
                </button>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">
                {t('addressLabel')}
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-start pl-3 pt-2.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                </div>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Playful Lane..."
                  rows={2}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm focus:border-brand-pink-400 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer justify-center rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold py-2.5 text-sm shadow-md shadow-brand-pink-500/25 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Registering...' : t('signUpButton')}
            </button>
          </div>
        </form>

        {/* Signin redirection link */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
          <span>{t('alreadyHaveAccount')} </span>
          <Link
            href={redirectTo !== '/' ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
            className="text-brand-pink-500 hover:text-brand-pink-600 font-bold"
          >
            {t('navLogin')}
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm font-semibold">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
