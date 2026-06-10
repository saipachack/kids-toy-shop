'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { api, API_STATIC_URL } from '../../../utils/api';
import AdminSidebar from '../../../components/AdminSidebar';
import { QrCode, Upload, Save, Check, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminQrSettings() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // QR Settings State
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');

  // Auth block
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, authLoading, router]);

  const loadSettings = async () => {
    if (!user || !isAdmin) return;
    try {
      const data = await api.get('/payments/qr-details');
      setBankName(data.bankName || '');
      setAccountName(data.accountName || '');
      setAccountNumber(data.accountNumber || '');
      setQrImageUrl(data.qrImageUrl || '');
    } catch (e) {
      console.error(e);
      setError('Failed to load QR details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user, isAdmin]);

  const handleSaveTextSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountName || !accountNumber) {
      setError('Please fill in all bank coordinate fields.');
      return;
    }

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const updated = await api.put('/payments/qr-details', {
        bankName,
        accountName,
        accountNumber,
      });
      setBankName(updated.bankName);
      setAccountName(updated.accountName);
      setAccountNumber(updated.accountNumber);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('qrCode', file);

    setUploading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const data = await api.upload('/payments/qr-details/upload', formData);
      setQrImageUrl(data.settings.qrImageUrl);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Image upload failed. Supports JPEG/PNG under 5MB.');
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="py-20 text-center text-sm font-semibold">Loading QR payment details...</div>;
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      
      {/* Title */}
      <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2">
        <QrCode className="h-6 w-6 text-brand-yellow-500" /> QR Code Payment Settings
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

          {saveSuccess && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-brand-mint-50/50 p-4 text-xs text-brand-mint-600 font-bold border border-brand-mint-100">
              <Check className="h-4 w-4 shrink-0 text-brand-mint-500" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            
            {/* Preview Panel */}
            <div className="md:col-span-2 flex flex-col gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-[var(--border-color)]">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Checkout Preview</h3>
              
              <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm text-center">
                <div className="h-60 w-60 bg-white flex items-center justify-center border border-slate-100 p-1.5 rounded-xl overflow-hidden shadow-inner">
                  {qrImageUrl ? (
                    <img 
                      src={qrImageUrl.startsWith('http') ? qrImageUrl : `${API_STATIC_URL}${qrImageUrl}`} 
                      alt="BCEL One QR Code" 
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="text-[10px] text-slate-400 font-semibold flex flex-col items-center gap-1">
                      <QrCode className="h-8 w-8 text-slate-300" />
                      <span>No QR Uploaded</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-800 dark:text-white mt-3 block">
                  {bankName || 'BCEL Bank'}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5 font-medium leading-relaxed">
                  Account: {accountNumber || 'XXX-XX-XX-XXXXXXX'} <br/>
                  ({accountName || 'PATTIE PLAY SHOP'})
                </span>
              </div>

              {/* Upload input trigger */}
              <label className="w-full flex items-center justify-center gap-2 cursor-pointer border border-dashed border-brand-pink-200 hover:border-brand-pink-500 rounded-2xl bg-white dark:bg-slate-800 py-3.5 transition-all text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                {uploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 text-brand-pink-500 animate-spin" />
                    <span>Uploading QR...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-brand-pink-500" />
                    <span>Upload QR Image</span>
                  </>
                )}
                <input
                  type="file"
                  disabled={uploading}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>

            {/* Inputs Form */}
            <div className="md:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm h-fit">
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">
                Bank Details & Account Coordinates
              </h3>

              <form onSubmit={handleSaveTextSettings} className="flex flex-col gap-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bank Name / Provider</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Banque Pour Le Commerce Exterieur Lao (BCEL)"
                    className="w-full mt-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2.5 px-3 text-xs focus:border-brand-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. PATTIE PLAY SHOP CO., LTD."
                    className="w-full mt-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2.5 px-3 text-xs focus:border-brand-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Number</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 160-12-00-0123456-001"
                    className="w-full mt-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2.5 px-3 text-xs focus:border-brand-pink-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 cursor-pointer rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold py-3 text-xs shadow-md shadow-brand-pink-500/20 transition-all duration-300 active:scale-95 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> Save Bank Coordinates
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
