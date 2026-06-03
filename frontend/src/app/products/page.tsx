'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';
import ProductCard from '../../components/ProductCard';
import { Filter, Grid, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface Category {
  id: string;
  nameEn: string;
  nameTh: string;
  nameLa: string;
  slug: string;
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, tObj } = useLanguage();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // States mirroring query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [isBestSeller, setIsBestSeller] = useState(searchParams.get('isBestSeller') === 'true');
  const [isNewArrival, setIsNewArrival] = useState(searchParams.get('isNewArrival') === 'true');

  // Trigger search fetch on param change
  useEffect(() => {
    const fetchFilteredData = async () => {
      setLoading(true);
      try {
        // Build URL query string
        const params = new URLSearchParams();
        if (searchParams.get('search')) params.append('search', searchParams.get('search')!);
        if (searchParams.get('category')) params.append('category', searchParams.get('category')!);
        if (searchParams.get('sort')) params.append('sort', searchParams.get('sort')!);
        if (searchParams.get('minPrice')) params.append('minPrice', searchParams.get('minPrice')!);
        if (searchParams.get('maxPrice')) params.append('maxPrice', searchParams.get('maxPrice')!);
        if (searchParams.get('isBestSeller')) params.append('isBestSeller', searchParams.get('isBestSeller')!);
        if (searchParams.get('isNewArrival')) params.append('isNewArrival', searchParams.get('isNewArrival')!);

        const prods = await api.get(`/products?${params.toString()}`);
        setProducts(prods);
      } catch (err) {
        console.error('Error fetching toys:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredData();
  }, [searchParams]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await api.get('/products/categories');
        setCategories(cats);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, []);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search);
    if (selectedCategory) params.append('category', selectedCategory);
    if (sort) params.append('sort', sort);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (isBestSeller) params.append('isBestSeller', 'true');
    if (isNewArrival) params.append('isNewArrival', 'true');

    router.push(`/products?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSort('');
    setMinPrice('');
    setMaxPrice('');
    setIsBestSeller(false);
    setIsNewArrival(false);
    router.push('/products');
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Title */}
      <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2">
        <Grid className="h-6 w-6 text-brand-pink-500" /> {t('navProducts')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="flex flex-col gap-5 p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-display font-bold text-base flex items-center gap-1.5 text-slate-800 dark:text-white">
              <SlidersHorizontal className="h-4.5 w-4.5 text-brand-blue-500" /> Filter Options
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-[10px] font-bold text-slate-400 hover:text-brand-pink-500 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" /> Clear
            </button>
          </div>

          {/* Search Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Search Keyword</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 px-3 text-xs focus:border-brand-pink-400 focus:outline-none"
            />
          </div>

          {/* Categories Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs focus:border-brand-pink-400 focus:outline-none"
            >
              <option value="">{t('allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {tObj(cat.nameEn, cat.nameTh, cat.nameLa)}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Inputs */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price Range (LAK)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 px-3 text-xs focus:outline-none text-center"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 px-3 text-xs focus:outline-none text-center"
              />
            </div>
          </div>

          {/* Sorting */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('sortBy')}</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs focus:border-brand-pink-400 focus:outline-none"
            >
              <option value="">{t('sortNewest')}</option>
              <option value="price_asc">{t('sortPriceAsc')}</option>
              <option value="price_desc">{t('sortPriceDesc')}</option>
            </select>
          </div>

          {/* Filter Promotion Badges */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="rounded text-brand-pink-500 focus:ring-brand-pink-500 h-4 w-4"
              />
              <span>Best Sellers 🔥</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="rounded text-brand-blue-500 focus:ring-brand-blue-500 h-4 w-4"
              />
              <span>New Arrivals ✨</span>
            </label>
          </div>

          {/* Filter CTA Button */}
          <button
            onClick={handleApplyFilters}
            className="w-full cursor-pointer rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold py-2 text-xs transition-colors active:scale-95 shadow-md shadow-brand-pink-500/20"
          >
            Apply Filters
          </button>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col gap-3">
                  <div className="bg-slate-200 dark:bg-slate-700 aspect-square w-full rounded-3xl" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <span className="text-4xl">😢</span>
              <p className="font-semibold text-sm">No toys match your filter criteria.</p>
              <button
                onClick={handleClearFilters}
                className="text-xs font-bold text-brand-pink-500 border border-brand-pink-500 rounded-full px-4 py-1.5 hover:bg-brand-pink-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div>
              <div className="text-xs text-slate-400 dark:text-slate-400 mb-4 font-semibold">
                Found {products.length} toys in catalog
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function Products() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
