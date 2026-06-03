'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import { ChevronRight, ArrowRight, ShieldCheck, Truck, Sparkles, Smile } from 'lucide-react';

interface Category {
  id: string;
  nameEn: string;
  nameTh: string;
  nameLa: string;
  slug: string;
}

export default function Home() {
  const { t, tObj } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick category bubble icons mapping
  const categoryIcons: { [key: string]: string } = {
    educational: '🧠',
    'dolls-figures': '🧸',
    'puzzles-games': '🧩',
    'plush-toys': '🦕',
    'outdoor-ride': '🛴',
  };

  const bannerGrps = [
    {
      titleEn: 'Spark Imagination with Coding Robots!',
      titleTh: 'เปิดโลกการเรียนรู้ด้วยหุ่นยนต์ Coding!',
      descEn: 'Build early STEM skills with screen-free programming toys.',
      descTh: 'พัฒนาทักษะวิทย์คณิตผ่านของเล่นควบคุมง่าย ปลอดภัย ไม่ทำร้ายสายตา',
      btnEn: 'Shop Robots Now',
      btnTh: 'ช้อปหุ่นยนต์เลย',
      link: '/products?search=coding',
      bgClass: 'from-brand-blue-500 to-brand-purple-600',
    },
    {
      titleEn: 'Super Fluffy Dino Cushions!',
      titleTh: 'ตุ๊กตาไดโนน้อยตัวอ้วน นุ่มนิ่มขนปุย!',
      descEn: 'Extra soft materials, hypoallergenic, the perfect sleeping partner.',
      descTh: 'ขนเรียบขัดผิวบอบบาง ซักแห้งได้ นอนกอดสบายหนุนหัวก็เยี่ยม',
      btnEn: 'Explore Plushies',
      btnTh: 'ดูตุ๊กตาทั้งหมด',
      link: '/products?category=plush-toys',
      bgClass: 'from-brand-pink-500 to-brand-orange-500',
    }
  ];

  const [activeBanner, setActiveBanner] = useState(0);

  // Rotate banner every 6s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % bannerGrps.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const cats = await api.get('/products/categories');
        setCategories(cats);

        const bests = await api.get('/products?isBestSeller=true');
        setBestSellers(bests.slice(0, 4));

        const news = await api.get('/products?isNewArrival=true');
        setNewArrivals(news.slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="flex flex-col gap-12 pb-16">
      
      {/* 1. Hero Animated Banner Carousel */}
      <section className="relative w-full rounded-3xl overflow-hidden shadow-lg h-72 sm:h-96 text-white transition-all duration-500">
        {bannerGrps.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-gradient-to-r ${banner.bgClass} flex flex-col justify-center px-8 sm:px-16 gap-4 transition-all duration-700 ${
              index === activeBanner ? 'opacity-100 translate-x-0 scale-100 z-10' : 'opacity-0 translate-x-12 scale-95 pointer-events-none'
            }`}
          >
            <span className="text-xs font-bold tracking-widest bg-white/20 uppercase px-3 py-1 rounded-full w-max text-white border border-white/10">
              Promo of the week 🎁
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl leading-tight max-w-xl">
              {tObj(banner.titleEn, banner.titleTh)}
            </h1>
            <p className="text-xs sm:text-sm text-white/90 max-w-lg">
              {tObj(banner.descEn, banner.descTh)}
            </p>
            <Link
              href={banner.link}
              className="mt-2 flex items-center gap-1.5 bg-white text-slate-900 font-bold px-6 py-2.5 rounded-full text-xs hover:bg-slate-50 shadow-md w-max group active:scale-95 transition-all"
            >
              {tObj(banner.btnEn, banner.btnTh)}
              <ArrowRight className="h-4 w-4 text-slate-700 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ))}

        {/* Carousel indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {bannerGrps.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveBanner(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${i === activeBanner ? 'bg-white w-6' : 'bg-white/40 w-2.5'}`}
            />
          ))}
        </div>
      </section>

      {/* 2. Key Value Propositions */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 p-5 rounded-3xl bg-brand-pink-50/50 dark:bg-brand-pink-950/10 border border-brand-pink-100/50 dark:border-brand-pink-900/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-pink-500 text-white shrink-0">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white">Free & Fast Delivery</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Free shipping on orders above 500,000 LAK</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-3xl bg-brand-blue-50/50 dark:bg-brand-blue-950/10 border border-brand-blue-100/50 dark:border-brand-blue-900/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue-500 text-white shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white">100% Non-Toxic & Safe</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Approved by international safety certificates</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-3xl bg-brand-yellow-100/30 dark:bg-brand-yellow-950/10 border border-brand-yellow-200/20 dark:border-brand-yellow-900/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-yellow-500 text-white shrink-0">
            <Smile className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white">Happiness Guarantee</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Easy returns and dedicated customer care</p>
          </div>
        </div>
      </section>

      {/* 3. Category Circle Browsing */}
      <section className="flex flex-col gap-4 text-center items-center">
        <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-brand-yellow-500 animate-spin-slow" /> {t('categoriesHeader')}
        </h2>
        <div className="flex flex-wrap justify-center gap-6 mt-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="flex flex-col items-center gap-2.5 group cursor-pointer"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full text-2xl bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-pink-500 group-hover:border-brand-pink-500 group-hover:text-white">
                {categoryIcons[cat.slug] || '🧸'}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-350 group-hover:text-brand-pink-500 transition-colors">
                {tObj(cat.nameEn, cat.nameTh, cat.nameLa)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Best Sellers Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
            {t('bestSellers')}
          </h2>
          <Link
            href="/products?isBestSeller=true"
            className="flex items-center text-xs font-bold text-brand-pink-500 hover:text-brand-pink-600 group"
          >
            See All <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="bg-slate-200 dark:bg-slate-700 aspect-square w-full rounded-3xl" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bestSellers.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 5. New Arrivals Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
            {t('newArrivals')}
          </h2>
          <Link
            href="/products?isNewArrival=true"
            className="flex items-center text-xs font-bold text-brand-blue-500 hover:text-brand-blue-600 group"
          >
            See All <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="bg-slate-200 dark:bg-slate-700 aspect-square w-full rounded-3xl" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
