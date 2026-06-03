'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-[var(--border-color)] bg-slate-50 dark:bg-slate-950 py-12 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* About Column */}
          <div className="flex flex-col gap-4">
            <span className="font-display text-xl font-bold tracking-tight">
              <span className="text-brand-pink-500">P</span>
              <span className="text-brand-blue-500">a</span>
              <span className="text-brand-yellow-500">t</span>
              <span className="text-brand-mint-500">t</span>
              <span className="text-brand-purple-500">i</span>
              <span className="text-brand-orange-500">e</span>
              <span className="text-slate-400 dark:text-slate-500 mx-0.5"> </span>
              <span className="text-brand-pink-500">P</span>
              <span className="text-brand-blue-500">l</span>
              <span className="text-brand-yellow-500">a</span>
              <span className="text-brand-mint-500">y</span>
              <span className="text-slate-400 dark:text-slate-500 mx-0.5"> </span>
              <span className="text-brand-purple-500">S</span>
              <span className="text-brand-orange-500">h</span>
              <span className="text-brand-pink-500">o</span>
              <span className="text-brand-blue-500">p</span>
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We design and curate premium educational toys, action figures, board games, and plushies that make learning fun and stimulate children\'s active imaginations.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Link href="#" className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm text-slate-400 hover:text-brand-blue-500 hover:scale-105 transition-all">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
                </svg>
              </Link>
              <Link href="#" className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm text-slate-400 hover:text-brand-pink-500 hover:scale-105 transition-all">
                <svg className="h-4 w-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </Link>
              <Link href="#" className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm text-slate-400 hover:text-slate-800 dark:hover:text-white hover:scale-105 transition-all">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">{t('navHome')} & Info</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <li><Link href="/" className="hover:text-brand-pink-500 transition-colors">Home Page</Link></li>
              <li><Link href="/products" className="hover:text-brand-pink-500 transition-colors">Browse Toys</Link></li>
              <li><Link href="/cart" className="hover:text-brand-pink-500 transition-colors">My Cart</Link></li>
              <li><Link href="/profile" className="hover:text-brand-pink-500 transition-colors">My Profile</Link></li>
            </ul>
          </div>

          {/* Help & Policies */}
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Support & FAQ</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <li><Link href="#" className="hover:text-brand-pink-500 transition-colors">Shipping Information</Link></li>
              <li><Link href="#" className="hover:text-brand-pink-500 transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="#" className="hover:text-brand-pink-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-brand-pink-500 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Contact Pattie Play Shop</h4>
            <ul className="flex flex-col gap-3.5 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-brand-pink-500 shrink-0 mt-0.5" />
                <span>Thongpong, Sikhodtabong District, Vientiane, Laos</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-brand-blue-500 shrink-0" />
                <div className="flex flex-wrap gap-1.5 items-center">
                  <a href="tel:+8562097777279" className="hover:text-brand-blue-500 hover:underline transition-colors font-medium">+85620 97777279</a>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <a 
                    href="https://wa.me/8562097777279" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1 text-[#25D366] hover:text-[#20ba5a] font-bold transition-colors"
                  >
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.735-3.17c1.644.976 3.256 1.488 4.957 1.49 5.373 0 9.743-4.307 9.745-9.606 0-2.567-1.002-4.98-2.822-6.797C16.832 4.1 14.437 3.1 12.008 3.1c-5.377 0-9.748 4.317-9.75 9.617 0 1.832.493 3.623 1.426 5.21l-.93 3.393 3.493-.94.01-.005zM17.432 14.1c-.31-.157-1.845-.913-2.133-1.018-.288-.105-.497-.157-.707.157-.21.314-.813 1.018-.996 1.226-.183.21-.367.236-.677.08-1.79-.887-2.92-1.748-3.83-3.32-.24-.415.24-.385.688-1.282.074-.15.038-.283-.018-.393-.056-.11-.497-1.2-.68-1.645-.18-.435-.37-.375-.506-.382l-.43-.008c-.147 0-.387.056-.588.275-.2.22-.767.75-.767 1.83 0 1.08.784 2.12.894 2.27.11.15 1.543 2.355 3.738 3.3.522.224.93.359 1.246.46.525.166 1.002.143 1.378.087.42-.063 1.285-.526 1.465-1.034.18-.507.18-.942.125-1.033-.055-.09-.204-.15-.515-.308z"/>
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-brand-purple-500 shrink-0" />
                <a href="mailto:support@pattieplayshop.com" className="hover:text-brand-purple-500 hover:underline transition-colors font-medium">support@pattieplayshop.com</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-400">
          <p>© {new Date().getFullYear()} Pattie Play Shop. All rights reserved. Created for premium kids\' happiness.</p>
        </div>
      </div>
    </footer>
  );
}
