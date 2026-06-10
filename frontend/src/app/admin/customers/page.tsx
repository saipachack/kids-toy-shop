'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { api } from '../../../utils/api';
import AdminSidebar from '../../../components/AdminSidebar';
import { Users, Search, Phone, Mail, MapPin, Calendar, ShoppingBag, CreditCard, ArrowUpDown } from 'lucide-react';

interface CustomerReport {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
  totalOrdersCount: number;
  totalPaidOrdersCount: number;
  totalAmountSpent: number;
}

export default function CustomerReports() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();

  const [customers, setCustomers] = useState<CustomerReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'spent' | 'orders' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Auth Guard
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, authLoading, router]);

  const loadCustomers = async () => {
    if (!user || !isAdmin) return;
    try {
      const data = await api.get('/admin/customers');
      setCustomers(data);
    } catch (e) {
      console.error('Failed to load customer list:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [user, isAdmin]);

  const handleSort = (field: 'name' | 'spent' | 'orders' | 'date') => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Filter customers by search query
  const filteredCustomers = customers.filter(c => {
    const term = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.phone && c.phone.toLowerCase().includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term))
    );
  });

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    if (sortBy === 'name') {
      valueA = a.name.toLowerCase();
      valueB = b.name.toLowerCase();
    } else if (sortBy === 'spent') {
      valueA = a.totalAmountSpent;
      valueB = b.totalAmountSpent;
    } else if (sortBy === 'orders') {
      valueA = a.totalOrdersCount;
      valueB = b.totalOrdersCount;
    } else {
      valueA = new Date(a.createdAt).getTime();
      valueB = new Date(b.createdAt).getTime();
    }

    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate high-level summary statistics
  const totalCustomers = customers.length;
  const activeBuyers = customers.filter(c => c.totalPaidOrdersCount > 0).length;
  const totalRevenueGenerated = customers.reduce((sum, c) => sum + c.totalAmountSpent, 0);
  const averageSpentPerCustomer = activeBuyers > 0 ? Math.round(totalRevenueGenerated / activeBuyers) : 0;

  if (authLoading || loading) {
    return <div className="py-20 text-center text-sm font-semibold">Loading customer reports...</div>;
  }

  // Translating UI strings
  const labels = {
    title: { EN: 'Customer Reports', TH: 'รายงานลูกค้า', LA: 'ລາຍງານລູກຄ້າ' },
    subtitle: { EN: 'Overview and analytics of customer orders and spending habits.', TH: 'ภาพรวมและการวิเคราะห์การสั่งซื้อและพฤติกรรมการใช้จ่ายของลูกค้า', LA: 'ພາບລວມ ແລະ ການວິເຄາະການສັ່ງຊື້ ແລະ ພຶດຕິກຳການໃຊ້ຈ່າຍຂອງລູກຄ້າ' },
    totalCustomers: { EN: 'Total Customers', TH: 'จำนวนลูกค้าทั้งหมด', LA: 'ຈຳນວນລູກຄ້າທັງໝົດ' },
    activeBuyers: { EN: 'Active Buyers', TH: 'ลูกค้าที่ซื้อสำเร็จ', LA: 'ລູກຄ້າທີ່ຊື້ສຳເລັດ' },
    totalRevenue: { EN: 'Total LAK Spent', TH: 'ยอดใช้จ่ายสะสม', LA: 'ຍອດໃຊ້ຈ່າຍສະສົມ' },
    avgSpent: { EN: 'Average per Buyer', TH: 'ยอดใช้จ่ายเฉลี่ย', LA: 'ຍອດໃຊ້ຈ່າຍສະເລ່ຍ' },
    searchPlaceholder: { EN: 'Search by name, email, phone, or address...', TH: 'ค้นหาด้วยชื่อ, อีเมล, เบอร์โทร หรือที่อยู่...', LA: 'ຄົ້ນຫາດ້ວຍຊື່, ອີເມວ, ເບີໂທ ຫຼືທີ່ຢູ່...' },
    colCustomer: { EN: 'Customer Info', TH: 'ข้อมูลลูกค้า', LA: 'ຂໍ້ມູນລູກຄ້າ' },
    colJoined: { EN: 'Joined Date', TH: 'วันที่ลงทะเบียน', LA: 'ວັນທີລົງທະບຽນ' },
    colOrders: { EN: 'Orders (Paid/Total)', TH: 'คำสั่งซื้อ (จ่ายแล้ว/ทั้งหมด)', LA: 'ຄຳສັ່ງຊື້ (ຈ່າຍແລ້ວ/ທັງໝົດ)' },
    colSpent: { EN: 'Total LAK Spent', TH: 'ยอดชำระเงินรวม', LA: 'ຍອດຊຳລະເງິນລວມ' },
    colAddress: { EN: 'Address', TH: 'ที่อยู่', LA: 'ທີ່ຢູ່' },
    noCustomersFound: { EN: 'No customer data matches your search.', TH: 'ไม่พบข้อมูลลูกค้าที่ตรงกับการค้นหาของคุณ', LA: 'ບໍ່ພົບຂໍ້ມູນລູກຄ້າທີ່ກົງກັບການຄົ້ນຫາຂອງທ່ານ' },
  };

  const currentLang = (language === 'TH' ? 'TH' : language === 'LA' ? 'LA' : 'EN') as 'EN' | 'TH' | 'LA';
  const getLabel = (key: keyof typeof labels) => labels[key][currentLang];

  return (
    <div className="flex flex-col gap-6 pb-16">
      
      {/* Title */}
      <div>
        <h1 className="font-display font-black text-2xl text-slate-905 dark:text-white flex items-center gap-2">
          <Users className="h-6 w-6 text-brand-purple-500" />
          {getLabel('title')}
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {getLabel('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <AdminSidebar />
        </div>

        {/* Reports Content */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Total Registered Customers */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-pink-100 dark:bg-brand-pink-900/20 text-brand-pink-500 shrink-0">
                <Users className="h-4.5 w-4.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">{getLabel('totalCustomers')}</span>
              <span className="font-display font-black text-base md:text-lg text-slate-800 dark:text-white">{totalCustomers} <span className="text-[10px] text-slate-400 font-semibold">users</span></span>
            </div>

            {/* Active Buyers */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-blue-100 dark:bg-brand-blue-900/20 text-brand-blue-500 shrink-0">
                <ShoppingBag className="h-4.5 w-4.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">{getLabel('activeBuyers')}</span>
              <span className="font-display font-black text-base md:text-lg text-slate-800 dark:text-white">{activeBuyers} <span className="text-[10px] text-slate-400 font-semibold">buyers</span></span>
            </div>

            {/* Total LAK spent by all customers */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-yellow-100 dark:bg-brand-yellow-900/20 text-brand-yellow-500 shrink-0">
                <CreditCard className="h-4.5 w-4.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">{getLabel('totalRevenue')}</span>
              <span className="font-display font-black text-sm md:text-base text-slate-805 dark:text-white truncate">{totalRevenueGenerated.toLocaleString()} <span className="text-[9px] text-slate-400 font-semibold">LAK</span></span>
            </div>

            {/* Average spend per active buyer */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-mint-100 dark:bg-brand-mint-900/20 text-brand-mint-500 shrink-0">
                <CreditCard className="h-4.5 w-4.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">{getLabel('avgSpent')}</span>
              <span className="font-display font-black text-sm md:text-base text-slate-805 dark:text-white truncate">{averageSpentPerCustomer.toLocaleString()} <span className="text-[9px] text-slate-400 font-semibold">LAK</span></span>
            </div>

          </div>

          {/* Filtering and Search Controls */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
            
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={getLabel('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-9 pr-4 text-xs focus:border-brand-pink-400 focus:outline-none"
              />
            </div>

            {/* Sort State Summary */}
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              Sorted by: <span className="text-brand-pink-500">{sortBy.toUpperCase()} ({sortOrder})</span>
            </div>

          </div>

          {/* Customer Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm overflow-hidden flex flex-col gap-4">
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 pb-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4 cursor-pointer hover:text-brand-pink-500 transition-colors" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">
                        {getLabel('colCustomer')} <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="pb-3 pr-4 cursor-pointer hover:text-brand-pink-500 transition-colors" onClick={() => handleSort('date')}>
                      <div className="flex items-center gap-1">
                        {getLabel('colJoined')} <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="pb-3 pr-4 cursor-pointer hover:text-brand-pink-500 transition-colors" onClick={() => handleSort('orders')}>
                      <div className="flex items-center gap-1">
                        {getLabel('colOrders')} <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="pb-3 pr-4 cursor-pointer hover:text-brand-pink-500 transition-colors" onClick={() => handleSort('spent')}>
                      <div className="flex items-center gap-1">
                        {getLabel('colSpent')} <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="pb-3">{getLabel('colAddress')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                  {sortedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                        {getLabel('noCustomersFound')}
                      </td>
                    </tr>
                  ) : (
                    sortedCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        
                        {/* Name / Email / Phone */}
                        <td className="py-3.5 pr-4 max-w-[200px]">
                          <span className="font-extrabold text-slate-800 dark:text-white block text-xs">{cust.name}</span>
                          <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-slate-450 dark:text-slate-400">
                            <span className="flex items-center gap-1 truncate"><Mail className="h-3 w-3 shrink-0 text-slate-400" /> {cust.email}</span>
                            {cust.phone && (
                              <span className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0 text-slate-400" /> {cust.phone}</span>
                            )}
                          </div>
                        </td>

                        {/* Date Registered */}
                        <td className="py-3.5 pr-4 text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-brand-purple-400" /> {new Date(cust.createdAt).toLocaleDateString()}</span>
                        </td>

                        {/* Order Quantities */}
                        <td className="py-3.5 pr-4 font-semibold text-slate-600 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold">
                            <span className="text-brand-mint-500">{cust.totalPaidOrdersCount}</span>
                            <span className="text-slate-300 dark:text-slate-650">/</span>
                            <span>{cust.totalOrdersCount}</span>
                          </span>
                        </td>

                        {/* LAK Amount Spent */}
                        <td className="py-3.5 pr-4 font-black text-slate-800 dark:text-white">
                          <span className={`${cust.totalAmountSpent > 0 ? 'text-brand-pink-500' : ''}`}>
                            {cust.totalAmountSpent.toLocaleString()} LAK
                          </span>
                        </td>

                        {/* Shipping Address */}
                        <td className="py-3.5 max-w-[200px] text-slate-500 truncate text-[10px] font-medium" title={cust.address || 'N/A'}>
                          {cust.address ? (
                            <div className="flex items-start gap-1">
                              <MapPin className="h-3.5 w-3.5 text-brand-blue-400 shrink-0" />
                              <span className="truncate">{cust.address}</span>
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">No address set</span>
                          )}
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
