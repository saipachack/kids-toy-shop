'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { User, Phone, MapPin, ClipboardList, CheckCircle, Save, Calendar, FileText } from 'lucide-react';

export default function Profile() {
  const router = useRouter();
  const { user, updateProfile, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Sync parameters
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile');
    } else if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user, isAuthenticated, authLoading, router]);

  // Load orders history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const history = await api.get('/orders');
        setOrders(history);
      } catch (err) {
        console.error('Failed to load order history:', err);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      await updateProfile({ name, phone, address });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return <div className="py-20 text-center text-sm font-semibold">Validating session profile...</div>;
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      
      {/* Title */}
      <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2">
        <User className="h-6 w-6 text-brand-pink-500" /> {t('navProfile')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column Edit Info */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-4 h-fit">
          <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
            Personal Information
          </h3>

          {error && <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-xl">{error}</div>}
          {success && (
            <div className="text-xs text-brand-mint-500 bg-brand-mint-50/50 p-2.5 rounded-xl flex items-center gap-1">
              <CheckCircle className="h-4 w-4" /> Profile updated successfully.
            </div>
          )}

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('nameLabel')}</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-10 pr-4 text-xs focus:border-brand-pink-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('phoneLabel')}</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-10 pr-4 text-xs focus:border-brand-pink-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('addressLabel')}</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-10 pr-4 text-xs focus:border-brand-pink-400 focus:outline-none resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-2 w-full flex items-center justify-center gap-1.5 cursor-pointer rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold py-2.5 text-xs shadow-md shadow-brand-pink-500/20 transition-all duration-300 active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Right column: Orders history list */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-4">
          <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-1.5">
            <ClipboardList className="h-4.5 w-4.5 text-brand-blue-500" /> {t('orderHistory')}
          </h3>

          {ordersLoading ? (
            <div className="py-10 text-center text-xs text-slate-400">Loading history...</div>
          ) : orders.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">{t('noOrders')}</div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => router.push(`/orders/${ord.id}`)}
                  className="p-4 border border-slate-100 dark:border-slate-700 hover:border-brand-pink-200 dark:hover:border-brand-pink-900 rounded-2xl flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-brand-pink-50 dark:bg-brand-pink-950/20 text-brand-pink-500 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800 dark:text-white">{ord.orderNumber}</span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-display font-bold text-xs text-slate-800 dark:text-white">
                        {ord.totalAmount.toLocaleString()} LAK
                      </span>
                      <span className="block text-[9px] text-slate-400 uppercase font-semibold mt-0.5">{ord.paymentMethod}</span>
                    </div>

                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      ord.status === 'DELIVERED'
                        ? 'bg-brand-mint-100 text-brand-mint-500'
                        : ord.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-500'
                        : 'bg-brand-orange-100 text-brand-orange-500'
                    }`}>
                      {t(ord.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
