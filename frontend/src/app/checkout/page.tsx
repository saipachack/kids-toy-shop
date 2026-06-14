'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { CreditCard, Wallet, QrCode, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function Checkout() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { cartItems, cartSubtotal, cartCount, clearCart } = useCart();
  const { t, tObj } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'PAYPAL' | 'QR_CODE'>('QR_CODE');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const shippingFee = cartSubtotal > 500000 ? 0 : 40000;
  const orderTotal = cartSubtotal + shippingFee;

  // Sync profile details
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    } else if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user, isAuthenticated, authLoading, router]);

  // Handle zero cart item redirects
  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      router.push('/cart');
    }
  }, [cartItems, router, loading]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      setError('Please fill in all delivery fields.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 1. Create order in backend
      const itemsPayload = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const order = await api.post('/orders', {
        items: itemsPayload,
        shippingAddress: `${name} | Tel: ${phone} | Address: ${address}`,
        paymentMethod,
      });

      // Clear local shopping cart state
      clearCart();

      // 2. Handle Payment Workflows
      if (paymentMethod === 'STRIPE') {
        const stripeRes = await api.post('/payments/stripe/create-session', {
          orderId: order.id,
        });
        // Redirect to Stripe checkout page
        window.location.href = stripeRes.url;
      } else if (paymentMethod === 'PAYPAL') {
        // Capture mock PayPal transaction
        await api.post('/paypal/capture', {
          orderId: order.id,
          paypalOrderId: `PAYPAL_MOCK_TX_${Date.now()}`,
        });
        router.push(`/orders/detail?id=${order.id}&status=paid&method=paypal`);
      } else {
        // QR CODE bank transfer
        router.push(`/orders/detail?id=${order.id}`);
      }
    } catch (err: any) {
      try {
        const parsedErr = JSON.parse(err.message);
        setError(t('TH') === 'เข้าสู่ระบบ' ? parsedErr.messageTh : parsedErr.messageEn);
      } catch (e) {
        setError(err.message || 'Failed to process order. Please try again.');
      }
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return <div className="py-20 text-center text-sm font-semibold">Validating checkout session...</div>;
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      
      {/* Title */}
      <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2">
        <ShieldCheck className="h-7 w-7 text-brand-pink-500" /> {t('checkoutTitle')}
      </h1>

      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form fields */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Shipping details */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] flex flex-col gap-4">
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
              {t('shippingDetails')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('nameLabel')}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 px-3 text-xs focus:border-brand-pink-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('phoneLabel')}</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 px-3 text-xs focus:border-brand-pink-400 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('addressLabel')}</label>
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full mt-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 px-3 text-xs focus:border-brand-pink-400 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] flex flex-col gap-4">
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
              {t('paymentMethod')}
            </h3>

            <div className="flex flex-col gap-3">
              {/* QR Code */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-brand-yellow-500 bg-brand-yellow-50/10 dark:bg-brand-yellow-950/10">
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 dark:text-white block">QR Code / Bank Transfer</span>
                    <span className="text-[10px] text-slate-400 block">{t('payWithQR')}</span>
                  </div>
                </div>
                <QrCode className="h-5 w-5 text-brand-yellow-500" />
              </div>
            </div>
          </div>

        </div>

        {/* Right column Summary card */}
        <div className="flex flex-col gap-5 p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm h-fit">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
            <ShoppingBag className="h-4.5 w-4.5 text-brand-pink-500" /> Checkout Items
          </h3>

          <div className="flex flex-col gap-3.5 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-4 max-h-48 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex justify-between items-center gap-2">
                <span className="truncate flex-1">{tObj(item.product.nameEn, item.product.nameTh, item.product.nameLa)} <span className="font-bold text-[10px] text-slate-400">x{item.quantity}</span></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{(item.product.price * item.quantity).toLocaleString()} LAK</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 text-xs text-slate-500 border-b border-slate-100 dark:border-slate-700 pb-3">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{cartSubtotal.toLocaleString()} LAK</span>
            </div>
            <div className="flex justify-between items-center">
              <span>{t('shipping')}</span>
              <span className="font-bold text-brand-mint-500">{shippingFee === 0 ? t('free') : `${shippingFee.toLocaleString()} LAK`}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-sm font-bold text-slate-800 dark:text-white">{t('total')}</span>
            <span className="font-display text-lg font-black text-slate-900 dark:text-white">
              {orderTotal.toLocaleString()} <span className="text-xs font-bold text-slate-500">LAK</span>
            </span>
          </div>

          {/* Place Order Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center cursor-pointer rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold py-3 text-xs shadow-md shadow-brand-pink-500/25 transition-all duration-300 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing Order...' : t('placeOrder')}
          </button>
        </div>

      </form>
    </div>
  );
}
