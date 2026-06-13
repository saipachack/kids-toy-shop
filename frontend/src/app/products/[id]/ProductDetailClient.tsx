'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../utils/api';
import { useLanguage } from '../../../context/LanguageContext';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { Star, ShoppingCart, Check, ArrowLeft, Heart, Minus, Plus } from 'lucide-react';

interface Category {
  id: string;
  nameEn: string;
  nameTh: string;
  nameLa: string;
  slug: string;
}

interface ProductDetail {
  id: string;
  nameEn: string;
  nameTh: string;
  nameLa: string;
  descriptionEn: string;
  descriptionTh: string;
  descriptionLa: string;
  price: number;
  stock: number;
  images: string[];
  isBestSeller: boolean;
  isNewArrival: boolean;
  category: Category;
}

export default function ProductDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { t, tObj } = useLanguage();
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const detail = await api.get(`/products/${id}`);
        setProduct(detail);
        if (detail.images && detail.images.length > 0) {
          setActiveImage(detail.images[0]);
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 animate-pulse flex flex-col md:flex-row gap-10">
        <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-96 rounded-3xl" />
        <div className="flex-1 flex flex-col gap-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="text-sm font-semibold">Toy not found.</p>
        <button
          onClick={() => router.push('/products')}
          className="text-xs font-bold text-brand-pink-500 hover:text-brand-pink-600 mt-2 cursor-pointer"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const hasStock = product.stock > 0;

  return (
    <div className="flex flex-col gap-6 pb-16">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left Column: Image Slider */}
        <div className="flex flex-col gap-4">
          
          {/* Active Image */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-50 border border-[var(--border-color)]">
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1531641098792-4f3951222129?w=500'}
              alt={tObj(product.nameEn, product.nameTh, product.nameLa)}
              className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
            />
            {product.isBestSeller && (
              <span className="absolute top-4 left-4 rounded-full bg-brand-pink-500 px-3 py-1 text-[10px] font-bold text-white uppercase shadow-sm">
                Best Seller 🔥
              </span>
            )}
            {product.isNewArrival && (
              <span className="absolute top-4 left-4 rounded-full bg-brand-blue-500 px-3 py-1 text-[10px] font-bold text-white uppercase shadow-sm">
                New ✨
              </span>
            )}
          </div>

          {/* Thumbnails grid */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative h-16 w-16 cursor-pointer rounded-xl overflow-hidden bg-slate-50 border transition-all ${
                    activeImage === img ? 'border-brand-pink-500 ring-2 ring-brand-pink-500/20' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Right Column: Toy Info */}
        <div className="flex flex-col gap-5 justify-start">
          
          {/* Category */}
          <span className="text-xs font-bold text-brand-purple-500 dark:text-brand-purple-400 uppercase tracking-widest">
            {tObj(product.category.nameEn, product.category.nameTh, product.category.nameLa)}
          </span>

          {/* Title */}
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-800 dark:text-white leading-tight">
            {tObj(product.nameEn, product.nameTh, product.nameLa)}
          </h1>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 text-brand-yellow-500 text-sm">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4.5 w-4.5 fill-current" />
              ))}
            </div>
            <span className="text-slate-400 font-semibold">(5.0 Rating / 24 reviews)</span>
          </div>

          {/* Price */}
          <div className="border-y border-slate-100 dark:border-slate-700 py-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
              <span className="font-display text-2xl font-black text-slate-900 dark:text-white">
                {product.price.toLocaleString()} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">LAK</span>
              </span>
            </div>

            {/* Inventory status badge */}
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Availability</span>
              {hasStock ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-mint-500">
                  ● {t('inStock')} ({product.stock} items)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500">
                  ● {t('outOfStock')}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('description')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {tObj(product.descriptionEn, product.descriptionTh, product.descriptionLa)}
            </p>
          </div>

          {/* Action Row: Quantities and Add to Cart */}
          {hasStock && !isAdmin && (
            <div className="flex flex-col gap-4 mt-4">
              
              {/* Quantity selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('quantity')}:</span>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-full bg-slate-50 dark:bg-slate-800">
                  <button
                    onClick={handleDecrement}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-slate-800 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={added}
                  className={`flex-1 flex cursor-pointer justify-center items-center gap-2 rounded-full py-3 text-sm font-bold text-white shadow-md transition-all duration-300 active:scale-95 ${
                    added
                      ? 'bg-brand-mint-500 shadow-brand-mint-500/25'
                      : 'bg-brand-pink-500 hover:bg-brand-pink-600 shadow-brand-pink-500/25'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{t('addedToCart')}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      <span>{t('addToCart')}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setFavorite(!favorite)}
                  className={`p-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer shadow-sm hover:scale-105 active:scale-90 transition-all ${
                    favorite ? 'text-red-500 border-red-200 dark:border-red-950/20' : 'text-slate-400'
                  }`}
                >
                  <Heart className="h-5 w-5 fill-current" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
