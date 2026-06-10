'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { api } from '../../../utils/api';
import AdminSidebar from '../../../components/AdminSidebar';
import { MessageSquare, RefreshCw, CheckCircle, AlertCircle, Link2, Link2Off } from 'lucide-react';

interface WhatsappStatusResponse {
  status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';
  qr: string | null;
  pairingCode: string | null;
  connectedNumber: string | null;
  connectedName: string | null;
}

export default function AdminWhatsappSettings() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WhatsApp connection state
  const [whatsappStatus, setWhatsappStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pairingMode, setPairingMode] = useState<'QR' | 'PHONE'>('QR');
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null);
  const [connectedName, setConnectedName] = useState<string | null>(null);

  // Polling ref/flag
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, authLoading, router]);

  // Load WhatsApp status from API
  const loadStatus = async (showLoading = true) => {
    if (!user || !isAdmin) return;
    if (showLoading) setLoading(true);

    try {
      const data: WhatsappStatusResponse = await api.get('/whatsapp/status');
      setWhatsappStatus(data.status);
      setQrCode(data.qr);
      setPairingCode(data.pairingCode);
      setConnectedNumber(data.connectedNumber);
      setConnectedName(data.connectedName);
    } catch (e: any) {
      console.error('[WhatsApp Settings] Load status error:', e);
      setError(e.message || 'Failed to load WhatsApp connection status.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();

    // Clean up polling on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [user, isAdmin]);

  // Handle connection polling (every 3 seconds when connecting or waiting for scan/pairing)
  useEffect(() => {
    const shouldPoll = whatsappStatus === 'CONNECTING' || (whatsappStatus === 'DISCONNECTED' && (!!qrCode || !!pairingCode));

    if (shouldPoll) {
      if (!pollIntervalRef.current) {
        console.log('[WhatsApp Settings] Starting DNS status polling...');
        pollIntervalRef.current = setInterval(() => {
          loadStatus(false);
        }, 3000);
      }
    } else {
      if (pollIntervalRef.current) {
        console.log('[WhatsApp Settings] Stopping polling...');
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [whatsappStatus, qrCode, pairingCode]);

  // Trigger manual WhatsApp connection process (generate QR or Pairing Code)
  const handleConnect = async () => {
    if (pairingMode === 'PHONE' && !phoneNumber.trim()) {
      setError('Please enter a WhatsApp phone number.');
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await api.post('/whatsapp/connect', {
        phone: pairingMode === 'PHONE' ? phoneNumber : undefined
      });
      // Immediately reload status to get the CONNECTING state and start polling
      await loadStatus(false);
    } catch (err: any) {
      console.error('[WhatsApp Settings] Connect error:', err);
      setError(err.message || 'Failed to start WhatsApp connection.');
    } finally {
      setActionLoading(false);
    }
  };

  // Trigger manual WhatsApp disconnection
  const handleDisconnect = async (silent = false) => {
    if (!silent && !confirm('Are you sure you want to disconnect your WhatsApp account? You will not be able to send real SMS OTP codes to customers until linked again.')) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await api.post('/whatsapp/disconnect', {});
      // Reset local state
      setWhatsappStatus('DISCONNECTED');
      setQrCode(null);
      setPairingCode(null);
      setConnectedNumber(null);
      setConnectedName(null);
    } catch (err: any) {
      console.error('[WhatsApp Settings] Disconnect error:', err);
      setError(err.message || 'Failed to disconnect WhatsApp.');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="py-20 text-center text-sm font-semibold flex items-center justify-center gap-2">
        <RefreshCw className="h-5 w-5 animate-spin text-brand-pink-500" />
        <span>Loading WhatsApp settings...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Title */}
      <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-brand-mint-500" />
        {t('whatsappTitle')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <AdminSidebar />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {error && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="max-w-2xl rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm p-6 space-y-6">
            {/* Status Header Block */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-700 pb-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('whatsappStatus')}
                </span>
                <div className="flex items-center gap-2">
                  {whatsappStatus === 'CONNECTED' ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-brand-mint-500" />
                      <span className="text-sm font-bold text-slate-800 dark:text-white">
                        {t('whatsappConnected')}
                      </span>
                    </>
                  ) : whatsappStatus === 'CONNECTING' ? (
                    <>
                      <RefreshCw className="h-5 w-5 text-brand-blue-500 animate-spin" />
                      <span className="text-sm font-bold text-slate-800 dark:text-white">
                        {t('whatsappConnecting')}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-slate-400" />
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        {t('whatsappDisconnected')}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {whatsappStatus === 'CONNECTED' ? (
                <button
                  onClick={() => handleDisconnect(false)}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 cursor-pointer rounded-full bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 text-xs shadow-md shadow-red-500/10 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Link2Off className="h-4.5 w-4.5" />
                  {t('whatsappDisconnectButton')}
                </button>
              ) : (
                whatsappStatus === 'DISCONNECTED' &&
                !qrCode && (
                  <button
                    onClick={handleConnect}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 cursor-pointer rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold px-5 py-2.5 text-xs shadow-md shadow-brand-pink-500/25 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Link2 className="h-4.5 w-4.5" />
                    {t('whatsappConnectButton')}
                  </button>
                )
              )}
            </div>

            {/* Status Details / QR Code Scanning Screen */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl min-h-[250px] text-center border border-slate-100 dark:border-slate-800">
              {whatsappStatus === 'CONNECTED' ? (
                <div className="space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-mint-500 text-white mx-auto shadow-lg shadow-brand-mint-500/20">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider">
                      {t('whatsappLinkedTo')}
                    </p>
                    <p className="text-lg font-black text-slate-800 dark:text-white">
                      +{connectedNumber}
                    </p>
                    <p className="text-xs text-slate-450 dark:text-slate-400">
                      {connectedName}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                    The bot is active and listening. Any customer registrations will receive automatic WhatsApp OTP verification SMS.
                  </p>
                </div>
              ) : whatsappStatus === 'CONNECTING' ? (
                <div className="space-y-3">
                  <RefreshCw className="h-10 w-10 text-brand-blue-500 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {pairingMode === 'PHONE' ? 'Generating Pairing Code...' : t('whatsappGeneratingQr')}
                  </p>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Setting up a secure instance and establishing connection to WhatsApp servers...
                  </p>
                </div>
              ) : qrCode ? (
                <div className="space-y-5 flex flex-col items-center animate-fadeIn">
                  <div className="p-3 bg-white border border-slate-200 dark:border-slate-700 rounded-2xl shadow-md overflow-hidden h-48 w-48 flex items-center justify-center">
                    <img src={qrCode} alt="WhatsApp Web QR Code" className="h-full w-full object-contain" />
                  </div>
                  <div className="space-y-1.5 max-w-md">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-350">
                      {t('whatsappQrInstruction')}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-relaxed px-4">
                      Open WhatsApp on your phone, go to **Settings** &gt; **Linked Devices** &gt; **Link a Device**, then point your camera at the QR code above.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConnect}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 cursor-pointer rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 text-[10px] active:scale-95 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Regenerate QR
                    </button>
                    <button
                      onClick={() => handleDisconnect(true)}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 cursor-pointer rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-750 font-bold px-4 py-2 text-[10px] active:scale-95 transition-all disabled:opacity-50"
                    >
                      Cancel / Reset
                    </button>
                  </div>
                </div>
              ) : pairingCode ? (
                <div className="space-y-6 flex flex-col items-center animate-fadeIn w-full max-w-md">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    Pairing Code
                  </span>
                  
                  <div className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full shadow-inner font-mono text-3xl font-black tracking-widest text-brand-pink-500">
                    {pairingCode}
                  </div>

                  <div className="space-y-3 text-left w-full">
                    <p className="text-xs font-bold text-slate-750 dark:text-slate-300">
                      How to link using this code:
                    </p>
                    <ol className="text-[10px] text-slate-450 dark:text-slate-400 space-y-1.5 list-decimal pl-4 leading-relaxed">
                      <li>Open **WhatsApp** on your mobile phone.</li>
                      <li>Go to **Settings** &gt; **Linked Devices** &gt; **Link a Device**.</li>
                      <li>Select **Link with phone number instead** on your phone screen.</li>
                      <li>Enter the 8-character pairing code shown above.</li>
                    </ol>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConnect}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 cursor-pointer rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 text-[10px] active:scale-95 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Regenerate Code
                    </button>
                    <button
                      onClick={() => handleDisconnect(true)}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 cursor-pointer rounded-full bg-slate-100 hover:bg-slate-200 text-slate-505 hover:text-slate-700 font-bold px-4 py-2 text-[10px] active:scale-95 transition-all disabled:opacity-50"
                    >
                      Cancel / Reset
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 w-full max-w-md mx-auto">
                  <div className="space-y-2">
                    <MessageSquare className="h-10 w-10 text-slate-350 dark:text-slate-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-650 dark:text-slate-400">
                      WhatsApp is currently Unlinked
                    </p>
                    <p className="text-[10px] text-slate-400 leading-relaxed px-4">
                      Link your store's WhatsApp number to start sending real OTP verification codes to your customers during registration.
                    </p>
                  </div>

                  <div className="flex border border-slate-200 dark:border-slate-700 p-1 rounded-xl bg-slate-100/50 dark:bg-slate-900/20">
                    <button
                      type="button"
                      onClick={() => { setPairingMode('QR'); setError(null); }}
                      className={`flex-1 text-center py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        pairingMode === 'QR'
                          ? 'bg-white dark:bg-slate-800 text-brand-pink-500 shadow-sm'
                          : 'text-slate-450 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    >
                      Pair via QR Code
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPairingMode('PHONE'); setError(null); }}
                      className={`flex-1 text-center py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        pairingMode === 'PHONE'
                          ? 'bg-white dark:bg-slate-800 text-brand-pink-500 shadow-sm'
                          : 'text-slate-450 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    >
                      Pair via Phone Number
                    </button>
                  </div>

                  {pairingMode === 'QR' ? (
                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-400">
                        Generates a QR Code which you can scan using WhatsApp's built-in QR scanner.
                      </p>
                      <button
                        onClick={handleConnect}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 cursor-pointer rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold px-6 py-2.5 text-xs shadow-md shadow-brand-pink-500/25 active:scale-95 transition-all mx-auto disabled:opacity-50"
                      >
                        <Link2 className="h-4.5 w-4.5" />
                        Generate QR Code
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-left">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          WhatsApp Phone Number (with Country Code)
                        </label>
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="e.g. 8562097777279"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 px-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:border-brand-pink-500 focus:outline-none focus:ring-1 focus:ring-brand-pink-500"
                        />
                        <p className="text-[8px] text-slate-400 leading-normal">
                          Include the country code first without `+` or spaces (e.g. `85620XXXXXXXX` for Laos, or `66XXXXXXXX` for Thailand).
                        </p>
                      </div>

                      <button
                        onClick={handleConnect}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 cursor-pointer rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold px-6 py-2.5 text-xs shadow-md shadow-brand-pink-500/25 active:scale-95 transition-all mx-auto disabled:opacity-50"
                      >
                        <Link2 className="h-4.5 w-4.5" />
                        Get Pairing Code
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
