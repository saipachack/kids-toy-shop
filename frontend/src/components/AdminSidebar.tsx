'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, ArrowLeft, Shield, QrCode } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const links = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      color: 'text-brand-purple-500',
    },
    {
      name: 'Toys Catalog CRUD',
      href: '/admin/products',
      icon: Package,
      color: 'text-brand-pink-500',
    },
    {
      name: 'Customer Orders',
      href: '/admin/orders',
      icon: ShoppingCart,
      color: 'text-brand-blue-500',
    },
    {
      name: 'QR Code Settings',
      href: '/admin/qr-settings',
      icon: QrCode,
      color: 'text-brand-yellow-500',
    },
  ];

  return (
    <aside className="flex flex-col gap-6 p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm h-fit">
      
      {/* Admin Title badge */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
        <Shield className="h-5 w-5 text-brand-purple-500 shrink-0" />
        <span className="font-display font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">
          Admin Panel
        </span>
      </div>

      {/* Navigation list */}
      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-600'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${link.color}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Back to store CTA */}
      <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Exit Panel
        </Link>
      </div>

    </aside>
  );
}
