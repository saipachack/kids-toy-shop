'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';
import { DollarSign, FileText, Users, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';

interface Metrics {
  salesToday: number;
  salesThisMonth: number;
  totalSales: number;
  totalOrdersCount: number;
  pendingOrdersCount: number;
  customerCount: number;
  lowStockProducts: any[];
  bestSellers: any[];
  chartData: any[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { t, tObj } = useLanguage();

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth block
  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/');
      }
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user || !isAdmin) return;
      try {
        const data = await api.get('/admin/metrics');
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user, isAdmin]);

  if (authLoading || loading) {
    return <div className="py-20 text-center text-sm font-semibold">Loading dashboard metrics...</div>;
  }

  if (!metrics) return null;

  // Custom SVG Bar Chart calculation helpers
  const chartHeight = 150;
  const maxSales = Math.max(...metrics.chartData.map((d) => d.sales), 5000);

  return (
    <div className="flex flex-col gap-6 pb-16">
      
      {/* Title */}
      <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-brand-purple-500 animate-pulse" /> {t('adminTitle')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <AdminSidebar />
        </div>

        {/* Dashboard Panels */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Sales Today */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-pink-100 dark:bg-brand-pink-900/20 text-brand-pink-500 shrink-0">
                <DollarSign className="h-4.5 w-4.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">{t('adminSalesToday')}</span>
              <span className="font-display font-black text-base truncate">{metrics.salesToday.toLocaleString()} <span className="text-[10px] text-slate-400 font-semibold">LAK</span></span>
            </div>

            {/* Sales Month */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-blue-100 dark:bg-brand-blue-900/20 text-brand-blue-500 shrink-0">
                <DollarSign className="h-4.5 w-4.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">{t('adminSalesMonth')}</span>
              <span className="font-display font-black text-base truncate">{metrics.salesThisMonth.toLocaleString()} <span className="text-[10px] text-slate-400 font-semibold">LAK</span></span>
            </div>

            {/* Total Orders */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-yellow-100 dark:bg-brand-yellow-900/20 text-brand-yellow-500 shrink-0">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">{t('adminTotalOrders')}</span>
              <span className="font-display font-black text-base">{metrics.totalOrdersCount} <span className="text-[10px] text-slate-400 font-semibold">orders</span></span>
            </div>

            {/* Customers count */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-mint-100 dark:bg-brand-mint-900/20 text-brand-mint-500 shrink-0">
                <Users className="h-4.5 w-4.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">{t('adminCustomers')}</span>
              <span className="font-display font-black text-base">{metrics.customerCount} <span className="text-[10px] text-slate-400 font-semibold">users</span></span>
            </div>
          </div>

          {/* SVG Sales bar chart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm">
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-brand-blue-500" /> Sales Revenue History (Last 6 Months)
            </h3>

            {/* SVG Renderer */}
            <div className="relative w-full h-[180px] mt-6 flex flex-col justify-end">
              <svg className="w-full h-[150px] overflow-visible" xmlns="http://www.w3.org/2000/svg">
                {metrics.chartData.map((dataPoint, idx) => {
                  const paddingPercent = 16;
                  const itemWidth = 100 / metrics.chartData.length;
                  const barX = `${idx * itemWidth + paddingPercent / 2}%`;
                  const barWidth = `${itemWidth - paddingPercent}%`;
                  const barHeight = (dataPoint.sales / maxSales) * chartHeight;
                  const barY = chartHeight - barHeight;

                  return (
                    <g key={dataPoint.month} className="group cursor-pointer">
                      {/* Bar back grid shadow */}
                      <rect
                        x={barX}
                        y={0}
                        width={barWidth}
                        height={chartHeight}
                        className="fill-slate-50 dark:fill-slate-700/20 opacity-0 group-hover:opacity-100 transition-opacity"
                        rx="4"
                      />
                      {/* Colored bar */}
                      <rect
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        className="fill-brand-purple-400 dark:fill-brand-purple-500 group-hover:fill-brand-pink-500 transition-colors"
                        rx="6"
                      />
                      {/* Label tooltip */}
                      <text
                        x={`${idx * itemWidth + itemWidth / 2}%`}
                        y={barY - 8}
                        textAnchor="middle"
                        className="text-[9px] font-bold fill-slate-700 dark:fill-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {dataPoint.sales.toLocaleString()} LAK
                      </text>
                      {/* X label */}
                      <text
                        x={`${idx * itemWidth + itemWidth / 2}%`}
                        y={chartHeight + 20}
                        textAnchor="middle"
                        className="text-[10px] font-bold fill-slate-400 dark:fill-slate-500"
                      >
                        {dataPoint.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Low Stock Panel */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-4">
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-4.5 w-4.5 text-brand-orange-500" /> {t('lowStockAlerts')}
              </h3>

              {metrics.lowStockProducts.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">All inventory levels healthy.</div>
              ) : (
                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                  {metrics.lowStockProducts.map((p) => (
                    <div key={p.id} className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                      <span className="font-semibold text-xs text-slate-700 dark:text-slate-200 truncate max-w-[150px]">
                        {tObj(p.nameEn, p.nameTh, p.nameLa)}
                      </span>
                      <span className="rounded-full bg-brand-orange-100 text-brand-orange-500 px-2 py-0.5 text-[9px] font-bold">
                        Only {p.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Best Sellers Panel */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-4">
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-brand-yellow-500" /> {t('bestSellersList')}
              </h3>

              {metrics.bestSellers.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">No orders placed yet.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {metrics.bestSellers.map((p, idx) => (
                    <div key={p.id} className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">{idx + 1}.</span>
                        <span className="font-semibold text-xs text-slate-700 dark:text-slate-200 truncate max-w-[150px]">
                          {tObj(p.nameEn, p.nameTh, p.nameLa)}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">
                        {p.soldCount} units sold
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
