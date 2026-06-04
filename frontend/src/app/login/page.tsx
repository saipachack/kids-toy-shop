'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AlertCircle, Lock, Mail } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, googleLogin, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push(redirectTo);
    } catch (err: any) {
      try {
        const parsedErr = JSON.parse(err.message);
        setError(t('TH') === 'เข้าสู่ระบบ' ? parsedErr.messageTh : parsedErr.messageEn);
      } catch (e) {
        setError(err.message || 'Login failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate Google Login callback returning user info
      await googleLogin('google.user@gmail.com', 'Google Playful User');
      router.push(redirectTo);
    } catch (err: any) {
      setError('Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
            {t('loginTitle')}
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {t('loginSub')}
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
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">
                {t('emailLabel')}
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm focus:border-brand-pink-400 focus:outline-none dark:focus:border-brand-pink-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {t('passwordLabel')}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-brand-pink-500 hover:text-brand-pink-600 font-semibold"
                >
                  {t('forgotPasswordLink')}
                </Link>
              </div>
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
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm focus:border-brand-pink-400 focus:outline-none dark:focus:border-brand-pink-400 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer justify-center rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold py-2.5 text-sm shadow-md shadow-brand-pink-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {loading ? 'Please wait...' : t('signInButton')}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100 dark:border-slate-700"></div>
          </div>
          <span className="relative px-3 bg-white dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-400">Or continue with</span>
        </div>

        {/* Social Google Sign in */}
        <div>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors active:scale-95 disabled:opacity-50"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span>Google Login</span>
          </button>
        </div>

        {/* Signup redirection link */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          <span>{t('dontHaveAccount')} </span>
          <Link
            href={redirectTo !== '/' ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"}
            className="text-brand-pink-500 hover:text-brand-pink-600 font-bold"
          >
            {t('navRegister')}
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm font-semibold">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
