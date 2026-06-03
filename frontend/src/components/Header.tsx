'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../utils/api';
import {
  Search,
  ShoppingCart,
  User,
  Sun,
  Moon,
  Menu,
  X,
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
} from 'lucide-react';

interface Category {
  id: string;
  nameEn: string;
  nameTh: string;
  slug: string;
}

export default function Header() {
  const router = useRouter();
  const { language, toggleLanguage, t, tObj } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();

  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Initialize theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Fetch categories & notifications
  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const cats = await api.get('/products/categories');
        setCategories(cats);
        
        if (user) {
          const notifs = await api.get('/notifications');
          setNotifications(notifs);
        }
      } catch (err) {
        console.error('Error fetching header details:', err);
      }
    };
    fetchHeaderData();
  }, [user]);

  const toggleTheme = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    // 1. Mark as read if unread
    if (!notif.isRead) {
      await markNotificationRead(notif.id);
    }

    // 2. Hide dropdown
    setShowNotifications(false);

    // 3. Try to extract orderNumber and redirect
    try {
      const match = notif.messageEn?.match(/KS-\d{8}-\d{4}/);
      if (match) {
        const orderNumber = match[0];
        const orderInfo = await api.get(`/orders/number/${orderNumber}`);
        if (orderInfo && orderInfo.id) {
          router.push(`/orders/${orderInfo.id}`);
          return;
        }
      }
    } catch (err) {
      console.error('Failed to resolve order from notification:', err);
    }

    // Fallback: navigate to profile (order history) or admin orders page
    if (isAdmin) {
      router.push('/admin/orders');
    } else {
      router.push('/profile');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Playful Brand Logo */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0 select-none">
            <span className="font-display text-2xl font-bold tracking-tight">
              <span className="text-brand-pink-500">P</span>
              <span className="text-brand-blue-500">a</span>
              <span className="text-brand-yellow-500">t</span>
              <span className="text-brand-mint-500">t</span>
              <span className="text-brand-purple-500">i</span>
              <span className="text-brand-orange-500">e</span>
              <span className="text-slate-400 dark:text-slate-500 mx-1"> </span>
              <span className="text-brand-pink-500">P</span>
              <span className="text-brand-blue-500">l</span>
              <span className="text-brand-yellow-500">a</span>
              <span className="text-brand-mint-500">y</span>
              <span className="text-slate-400 dark:text-slate-500 mx-1"> </span>
              <span className="text-brand-purple-500">S</span>
              <span className="text-brand-orange-500">h</span>
              <span className="text-brand-pink-500">o</span>
              <span className="text-brand-blue-500">p</span>
            </span>
          </Link>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex relative flex-1 max-w-md mx-4">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 pl-4 pr-10 text-sm focus:border-brand-pink-400 focus:outline-none dark:focus:border-brand-pink-400 transition-colors"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-pink-500">
              <Search className="h-4.5 w-4.5" />
            </button>
          </form>

          {/* Utility Controls (Lang, Theme, Cart, Auth) - Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {language === 'TH' ? 'TH 🇹🇭' : language === 'EN' ? 'EN 🇬🇧' : 'LA 🇱🇦'}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-brand-pink-500 dark:text-slate-400 dark:hover:text-brand-pink-400 transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Cart Button */}
            {!isAdmin && (
              <Link
                href="/cart"
                className="relative p-2 text-slate-500 hover:text-brand-blue-500 dark:text-slate-400 dark:hover:text-brand-blue-400 transition-colors"
              >
                <ShoppingCart className="h-5.5 w-5.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-pink-500 text-[10px] font-bold text-white animate-bounce">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-500 hover:text-brand-yellow-500 dark:text-slate-400 dark:hover:text-brand-yellow-400 transition-colors cursor-pointer"
                >
                  <Bell className="h-5.5 w-5.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-orange-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-800 p-2 shadow-xl ring-1 ring-black/5 dark:ring-white/10 z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{t('notificationsTitle')}</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={async () => {
                            try {
                              await Promise.all(
                                notifications
                                  .filter(n => !n.isRead)
                                  .map(n => api.put(`/notifications/${n.id}/read`, {}))
                              );
                              setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="text-[10px] text-brand-pink-500 hover:underline cursor-pointer font-bold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto mt-1 flex flex-col gap-1">
                      {notifications.length === 0 ? (
                        <div className="py-4 text-center text-xs text-slate-400">{t('noNotifications')}</div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`w-full p-2.5 rounded-xl text-left cursor-pointer transition-colors ${notif.isRead ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50' : 'bg-brand-pink-50/50 dark:bg-brand-pink-950/20 hover:bg-brand-pink-50 dark:hover:bg-brand-pink-950/30'}`}
                          >
                            <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                              {tObj(notif.titleEn, notif.titleTh, notif.titleLa)}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5 font-medium line-clamp-2">
                              {tObj(notif.messageEn, notif.messageTh, notif.messageLa)}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth Dropdown or Links */}
            {user ? (
              <div className="group relative">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  <User className="h-4 w-4 text-brand-purple-500" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
                </button>
                
                {/* User Dropdown */}
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl bg-white dark:bg-slate-800 p-1.5 shadow-xl ring-1 ring-black/5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-250 z-50 before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:content-['']">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-slate-700 hover:bg-brand-purple-50 hover:text-brand-purple-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {t('navAdmin')}
                    </Link>
                  )}
                  {!isAdmin && (
                    <>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-slate-700 hover:bg-brand-blue-50 hover:text-brand-blue-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                      >
                        <User className="h-4 w-4 text-brand-purple-500" />
                        {t('navProfile')}
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-slate-700 hover:bg-brand-blue-50 hover:text-brand-blue-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                      >
                        <ShoppingBag className="h-4 w-4 text-brand-pink-500" />
                        {t('orderHistory')}
                      </Link>
                    </>
                  )}
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('navLogout')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-semibold px-4 py-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white px-4 py-1.5 shadow-md shadow-brand-pink-500/20 transition-all duration-300 transform active:scale-95"
                >
                  {t('navRegister')}
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Menu - Mobile */}
          <div className="flex lg:hidden items-center gap-3">
            {/* Lang, Cart, Hamburg */}
            <button
              onClick={toggleLanguage}
              className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 dark:bg-slate-800"
            >
              {language === 'TH' ? 'TH' : language === 'EN' ? 'EN' : 'LA'}
            </button>

            {!isAdmin && (
              <Link href="/cart" className="relative p-1 text-slate-500">
                <ShoppingCart className="h-5.5 w-5.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-pink-500 text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full border-t border-[var(--border-color)] bg-white dark:bg-slate-900 p-4 transition-all duration-300 animate-fadeIn">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-4">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 pl-4 pr-10 text-sm focus:border-brand-pink-400 focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Navigation Links */}
          <div className="flex flex-col gap-3 font-semibold text-sm">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-pink-500 py-1 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-brand-blue-500" /> {t('navHome')}
            </Link>
            <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-pink-500 py-1 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-brand-pink-500" /> {t('navProducts')}
            </Link>
            
            {user ? (
              <>
                {!isAdmin && (
                  <>
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-pink-500 py-1 flex items-center gap-2">
                      <User className="h-4 w-4 text-brand-purple-500" /> {t('navProfile')}
                    </Link>
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-pink-500 py-1 flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-brand-pink-500" /> {t('orderHistory')}
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-pink-500 py-1 flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4 text-brand-yellow-500" /> {t('navAdmin')}
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-red-500 py-1 flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <LogOut className="h-4 w-4" /> {t('navLogout')}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center font-semibold rounded-full border border-slate-200 dark:border-slate-700 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center font-semibold rounded-full bg-brand-pink-500 text-white py-2 shadow-md"
                >
                  {t('navRegister')}
                </Link>
              </div>
            )}

            {/* Dark mode toggle mobile */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 mt-2">
              <span className="text-xs text-slate-500">Dark Mode</span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
