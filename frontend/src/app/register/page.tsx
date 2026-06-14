'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AlertCircle } from 'lucide-react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { googleLogin, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/';
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  // Initialize secure Google Sign-In if client ID is configured
  useEffect(() => {
    if (!clientId) return;

    const initializeGoogle = () => {
      const google = (window as any).google;
      if (google) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            setLoading(true);
            setError(null);
            try {
              await googleLogin(response.credential);
              router.push(redirectTo);
            } catch (err: any) {
              setError('Google Sign-In failed.');
            } finally {
              setLoading(false);
            }
          },
        });

        google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { 
            theme: 'outline', 
            size: 'large', 
            shape: 'pill', 
            width: '380', 
            text: 'signup_with',
            logo_alignment: 'left'
          }
        );
      }
    };

    const checkInterval = setInterval(() => {
      if ((window as any).google) {
        initializeGoogle();
        clearInterval(checkInterval);
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, [clientId, redirectTo]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await googleLogin({ email: 'google.user@gmail.com', name: 'Google Playful User' });
      router.push(redirectTo);
    } catch (err: any) {
      setError('Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const registerSubMsg = language === 'TH'
    ? 'ลงทะเบียนด้วยบัญชี Google ของคุณเพื่อเริ่มต้นช็อปปิ้งทันที'
    : language === 'LA'
    ? 'ລົງທະບຽນດ້ວຍບັນຊີ Google ຂອງທ່ານເພື່ອເລີ່ມຕົ້ນການຊື້ເຄື່ອງທັນທີ'
    : 'Sign up with your Google account to start shopping instantly.';

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-[var(--border-color)] bg-white dark:bg-slate-800/80 p-8 shadow-lg">
        
        {/* Header */}
        <div className="text-center">
          <span className="font-display text-4xl font-black tracking-tight select-none">
            <span className="text-brand-pink-500">P</span>
            <span className="text-brand-blue-500">a</span>
            <span className="text-brand-yellow-500">t</span>
            <span className="text-brand-mint-500">t</span>
            <span className="text-brand-purple-500">i</span>
            <span className="text-brand-orange-500">e</span>
            <span className="text-brand-pink-500">P</span>
            <span className="text-brand-blue-500">l</span>
            <span className="text-brand-yellow-500">a</span>
            <span className="text-brand-mint-500">y</span>
            <span className="text-brand-purple-500">S</span>
            <span className="text-brand-orange-500">h</span>
            <span className="text-brand-pink-500">o</span>
            <span className="text-brand-blue-500">p</span>
          </span>
          <h2 className="mt-4 font-display text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            {t('registerTitle')}
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {registerSubMsg}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center text-xs text-slate-550 font-bold py-2 animate-pulse">
            {language === 'LA' ? 'ກຳລັງໂຫລດ...' : language === 'TH' ? 'กำลังโหลด...' : 'Loading authentication...'}
          </div>
        )}

        {/* Social Google Sign in */}
        <div className="flex justify-center w-full py-4">
          {clientId ? (
            <div id="google-signin-btn" className="w-full flex justify-center"></div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors active:scale-95 disabled:opacity-50"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Google Login (Mock Mode)</span>
            </button>
          )}
        </div>

        {/* Signin redirection link */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          <span>{t('alreadyHaveAccount')} </span>
          <Link
            href={redirectTo !== '/' ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
            className="text-brand-pink-500 hover:text-brand-pink-600 font-bold"
          >
            {t('navLogin')}
          </Link>
        </div>

      </div>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
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
