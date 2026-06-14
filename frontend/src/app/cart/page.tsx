'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Cart() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, cartSubtotal, cartCount } = useCart();
  const { t, tObj } = useLanguage();
  const { isAuthenticated } = useAuth();

  const shippingFee = cartSubtotal > 500000 || cartSubtotal === 0 ? 0 : 40000;
  const orderTotal = cartSubtotal + shippingFee;

  const handleCheckoutRedirect = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4 animate-fadeIn">
        <div className="text-6xl animate-bounce">🧸</div>
        <h2 className="font-display font-extrabold text-xl text-slate-800 dark:text-white">
          {t('cartTitle')}
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-400 max-w-sm">
          {t('cartEmpty')}
        </p>
        <Link
          href="/products"
          className="mt-2 inline-flex items-center gap-1.5 bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-md transition-all active:scale-95"
        >
          {t('navProducts')} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      
      {/* Title */}
      <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2">
        <ShoppingBag className="h-6 w-6 text-brand-pink-500" /> {t('cartTitle')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Items List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all duration-200"
            >
              
              {/* Product Thumbnail */}
              <Link href={`/products/detail?id=${item.productId}`} className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
                <img
                  src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : 'https://images.unsplash.com/photo-1531641098792-4f3951222129?w=100'}
                  alt={tObj(item.product.nameEn, item.product.nameTh, item.product.nameLa)}
                  className="h-full w-full object-cover"
                />
              </Link>

              {/* Title & Price info */}
              <div className="flex-1 min-w-0">
                <Link href={`/products/detail?id=${item.productId}`}>
                  <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white hover:text-brand-pink-500 transition-colors truncate">
                    {tObj(item.product.nameEn, item.product.nameTh, item.product.nameLa)}
                  </h3>
                </Link>
                <span className="text-xs text-slate-400 dark:text-slate-400 font-semibold block mt-0.5">
                  {item.product.price.toLocaleString()} LAK / unit
                </span>
              </div>

              {/* Quantity Changer */}
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-full bg-slate-50 dark:bg-slate-800 shrink-0">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-white">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Action Bin */}
              <button
                onClick={() => removeFromCart(item.productId)}
                className="p-2 rounded-full hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>

            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="flex flex-col gap-5 p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm h-fit">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-700">
            {t('cartSummary')}
          </h3>

          <div className="flex flex-col gap-3.5 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="flex justify-between items-center">
              <span>{t('subtotal')} ({cartCount} items)</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{cartSubtotal.toLocaleString()} LAK</span>
            </div>
            <div className="flex justify-between items-center">
              <span>{t('shipping')}</span>
              <span className="font-bold text-brand-mint-500">
                {shippingFee === 0 ? t('free') : `${shippingFee.toLocaleString()} LAK`}
              </span>
            </div>
            {shippingFee > 0 && (
              <div className="text-[10px] bg-brand-blue-50/50 dark:bg-brand-blue-950/20 text-brand-blue-500 px-3 py-1.5 rounded-xl font-bold leading-normal">
                💡 Tip: Add {(500000 - cartSubtotal).toLocaleString()} LAK more of toys to get Free Shipping!
              </div>
            )}
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-sm font-bold text-slate-800 dark:text-white">{t('total')}</span>
            <span className="font-display text-xl font-black text-slate-900 dark:text-white">
              {orderTotal.toLocaleString()} <span className="text-xs font-bold text-slate-500">LAK</span>
            </span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckoutRedirect}
            className="w-full flex items-center justify-center gap-1.5 cursor-pointer rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold py-3 text-xs shadow-md shadow-brand-pink-500/20 transition-all duration-300 active:scale-95"
          >
            <span>{t('checkoutButton')}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
