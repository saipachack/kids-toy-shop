'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';
import { useCart, Product } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Star, ShoppingCart, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product & {
    category?: { nameEn: string; nameTh: string; nameLa: string; slug: string };
    isBestSeller?: boolean;
    isNewArrival?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t, tObj } = useLanguage();
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const hasStock = product.stock > 0;

  // Rating fallback helper
  const renderStars = () => {
    const starCount = 5;
    return (
      <div className="flex items-center gap-0.5 mt-1.5 text-brand-yellow-500">
        {Array.from({ length: starCount }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-current" />
        ))}
      </div>
    );
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-[var(--border-color)] bg-white dark:bg-slate-800/80 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md dark:shadow-black/25">
      
      {/* Product Image Link */}
      <Link href={`/products/${product.id}`} className="relative block aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1531641098792-4f3951222129?w=300'}
          alt={tObj(product.nameEn, product.nameTh, product.nameLa)}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Promo tags */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {product.isBestSeller && (
            <span className="rounded-full bg-brand-pink-500 px-2.5 py-0.5 text-[9px] font-bold text-white uppercase shadow-sm">
              Best Seller 🔥
            </span>
          )}
          {product.isNewArrival && (
            <span className="rounded-full bg-brand-blue-500 px-2.5 py-0.5 text-[9px] font-bold text-white uppercase shadow-sm">
              New ✨
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {!hasStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-15">
            <span className="rounded-full bg-red-600 px-4 py-1 text-xs font-bold text-white uppercase shadow-md animate-pulse">
              {t('outOfStock')}
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category label */}
        {product.category && (
          <span className="text-[10px] font-bold text-brand-purple-500 dark:text-brand-purple-400 uppercase tracking-wider">
            {tObj(product.category.nameEn, product.category.nameTh, product.category.nameLa)}
          </span>
        )}

        {/* Name Link */}
        <Link href={`/products/${product.id}`} className="mt-1 flex-1">
          <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-brand-pink-500 transition-colors line-clamp-2">
            {tObj(product.nameEn, product.nameTh, product.nameLa)}
          </h3>
        </Link>

        {/* Stars */}
        {renderStars()}

        {/* Price & Add to Cart button */}
        <div className="mt-3.5 flex items-center justify-between gap-2">
          <span className="font-display text-base font-extrabold text-slate-900 dark:text-white">
            {product.price.toLocaleString()} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">LAK</span>
          </span>

          {!isAdmin && (
            <button
              onClick={handleAddToCart}
              disabled={!hasStock || added}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow-md transition-all duration-300 active:scale-90 ${
                added
                  ? 'bg-brand-mint-500 text-white shadow-brand-mint-500/20'
                  : !hasStock
                  ? 'bg-slate-100 text-slate-300 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-brand-pink-50/50 dark:bg-brand-pink-950/20 hover:bg-brand-pink-600 hover:rotate-6 shadow-brand-pink-500/25'
              }`}
            >
              {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
