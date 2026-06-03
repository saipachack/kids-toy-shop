'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { api, API_STATIC_URL } from '../../../utils/api';
import AdminSidebar from '../../../components/AdminSidebar';
import { ShoppingBag, Search, Eye, Edit2, X, Check, Truck, CreditCard, User, AlertCircle } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  trackingNumber: string | null;
  slipUrl: string | null;
  shippingSlipUrl: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  orderItems: any[];
}

export default function AdminOrders() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { t, tObj } = useLanguage();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detail sidebar drawer state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newTracking, setNewTracking] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedShippingFile, setSelectedShippingFile] = useState<File | null>(null);
  const [shippingUploadError, setShippingUploadError] = useState<string | null>(null);

  // Auth block
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, authLoading, router]);

  const loadOrders = async () => {
    if (!user || !isAdmin) return;
    try {
      const data = await api.get('/orders');
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user, isAdmin]);

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewTracking(order.trackingNumber || '');
    setSaveSuccess(false);
    setSelectedShippingFile(null);
    setShippingUploadError(null);
  };

  const handleUpdateStatus = async (statusOverride?: string) => {
    if (!selectedOrder) return;
    
    setSubmitting(true);
    setSaveSuccess(false);
    setShippingUploadError(null);

    const statusToApply = statusOverride || newStatus;

    const payload: any = {
      status: statusToApply,
      trackingNumber: newTracking,
    };

    if (statusToApply === 'PAID') {
      payload.paymentStatus = 'PAID';
    }

    try {
      // 1. Update status and tracking first
      let updated = await api.put(`/orders/${selectedOrder.id}/status`, payload);

      // 2. If transitioning to SHIPPING and a shipping slip file is chosen, upload it
      if (statusToApply === 'SHIPPING' && selectedShippingFile) {
        const formData = new FormData();
        formData.append('shippingSlip', selectedShippingFile);
        
        updated = await api.upload(`/orders/${selectedOrder.id}/upload-shipping-slip`, formData);
        setSelectedShippingFile(null);
      }
      
      // Update local state list
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, ...updated } : o));
      
      // Update selected drawer state
      setSelectedOrder(prev => prev ? { ...prev, ...updated } : null);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      try {
        const parsed = JSON.parse(err.message);
        setShippingUploadError(parsed.messageEn || 'Failed to save changes.');
      } catch (e) {
        setShippingUploadError(err.message || 'Failed to save changes.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) => o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
           o.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return <div className="py-20 text-center text-sm font-semibold">Loading orders queue...</div>;
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      
      {/* Title */}
      <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2">
        <ShoppingBag className="h-6 w-6 text-brand-purple-500" /> {t('adminOrdersHeader')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <AdminSidebar />
        </div>

        {/* Orders List & Search Grid */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Search bar */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order # or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-10 pr-4 text-xs focus:outline-none"
            />
          </div>

          <div className="w-full rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-400">
                    <th className="p-4">Order Number</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Order Total</th>
                    <th className="p-4">Fulfillment</th>
                    <th className="p-4 w-20 text-center">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-bold text-slate-800 dark:text-white">
                        {o.orderNumber}
                        <span className="block text-[9px] font-semibold text-slate-400 mt-0.5">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">
                        {o.user.name}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold block">{o.paymentMethod}</span>
                        <span className={`inline-block rounded px-1.5 py-0.1 text-[8px] font-bold mt-0.5 ${
                          o.paymentStatus === 'PAID' ? 'bg-brand-mint-100 text-brand-mint-500' : 'bg-brand-orange-100 text-brand-orange-500'
                        }`}>
                          {o.paymentStatus}
                          {o.paymentMethod === 'QR_CODE' && o.slipUrl && o.paymentStatus !== 'PAID' && ' 📎 (slip uploaded)'}
                        </span>
                      </td>
                      <td className="p-4 font-display font-extrabold text-slate-900 dark:text-white">
                        {o.totalAmount.toLocaleString()} LAK
                      </td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          o.status === 'DELIVERED'
                            ? 'bg-brand-mint-100 text-brand-mint-500'
                            : o.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-500'
                            : 'bg-brand-orange-100 text-brand-orange-500'
                        }`}>
                          {t(o.status)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenDetails(o)}
                          className="flex items-center gap-1 cursor-pointer mx-auto bg-slate-100 hover:bg-brand-pink-500 hover:text-white dark:bg-slate-700 dark:hover:bg-brand-pink-500 text-slate-600 dark:text-slate-350 px-2.5 py-1 rounded-full font-bold transition-all text-[10px]"
                        >
                          <Eye className="h-3 w-3" /> Audit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Details AUDIT Drawer overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-[1px] print:hidden">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 p-6 shadow-2xl flex flex-col gap-5 h-full overflow-y-auto animate-fadeIn border-l border-slate-100 dark:border-slate-700">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="font-display font-black text-base text-slate-800 dark:text-white">
                  Audit Order
                </h3>
                <span className="text-[10px] font-bold text-slate-400">{selectedOrder.orderNumber}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Success Alert */}
            {saveSuccess && (
              <div className="text-[10px] text-brand-mint-500 bg-brand-mint-50/50 p-2.5 rounded-xl font-bold flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Order changes saved successfully!
              </div>
            )}

            {/* Content info */}
            <div className="flex flex-col gap-4 text-xs">
              
              {/* User section */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><User className="h-3.5 w-3.5 text-brand-blue-500" /> Buyer Profile</span>
                <span className="font-bold text-slate-800 dark:text-white">{selectedOrder.user.name}</span>
                <span className="text-slate-500">{selectedOrder.user.email}</span>
              </div>

              {/* Items listing */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Items Checklist</span>
                <div className="border border-slate-100 dark:border-slate-700 rounded-2xl p-3 flex flex-col gap-2.5">
                  {selectedOrder.orderItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="font-medium text-slate-700 dark:text-slate-350">{tObj(item.product.nameEn, item.product.nameTh, item.product.nameLa)} <span className="font-bold text-slate-400">x{item.quantity}</span></span>
                      <span className="font-semibold text-slate-900 dark:text-white">{(item.price * item.quantity).toLocaleString()} LAK</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center font-bold border-t border-slate-50 dark:border-slate-700/50 pt-2 text-slate-800 dark:text-white">
                    <span>Total Amount</span>
                    <span>{selectedOrder.totalAmount.toLocaleString()} LAK</span>
                  </div>
                </div>
              </div>

              {/* Bank slip auditing image */}
              {selectedOrder.paymentMethod === 'QR_CODE' && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Bank Transfer Receipt Auditing</span>
                  {selectedOrder.slipUrl ? (
                    <div className="flex flex-col gap-3">
                      <a
                        href={`${API_STATIC_URL}${selectedOrder.slipUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block aspect-[3/4] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 group hover:scale-[1.01] transition-transform"
                      >
                        <img
                          src={`${API_STATIC_URL}${selectedOrder.slipUrl}`}
                          alt="Bank Slip Receipt Upload"
                          className="h-full w-full object-cover"
                        />
                      </a>
                      
                      {selectedOrder.status === 'AWAITING_VERIFICATION' && (
                        <div className="flex items-start gap-2 bg-brand-pink-50/50 dark:bg-brand-pink-950/20 text-brand-pink-500 border border-brand-pink-100 p-3 rounded-2xl animate-pulse">
                          <AlertCircle className="h-4 w-4 shrink-0 text-brand-pink-500 mt-0.5" />
                          <div>
                            <span className="font-bold text-[10px] block">Awaiting Verification Notice</span>
                            <span className="text-[9px]">The customer has uploaded a payment slip receipt. Please audit the slip carefully and confirm the payment.</span>
                          </div>
                        </div>
                      )}

                      {selectedOrder.paymentStatus !== 'PAID' && (
                        <button
                          onClick={() => handleUpdateStatus('PAID')}
                          disabled={submitting}
                          className="w-full flex items-center justify-center gap-1.5 cursor-pointer rounded-full bg-brand-mint-500 hover:bg-brand-mint-600 text-white font-bold py-2 text-xs transition-colors active:scale-95 shadow-md shadow-brand-mint-500/25 disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" /> Confirm Payment & Approve
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-brand-orange-50/50 dark:bg-brand-orange-950/20 text-brand-orange-500 border border-brand-orange-100 p-3 rounded-2xl">
                      <AlertCircle className="h-4 w-4 shrink-0 text-brand-orange-500" />
                      <span>Customer has not uploaded a payment slip receipt yet.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Status Update Fields */}
              <div className="flex flex-col gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Update Status</span>
                
                <div className="grid grid-cols-1 gap-3">
                  {/* Status selection */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400">Order Fulfillment Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full mt-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2 px-3 text-xs focus:outline-none"
                    >
                      <option value="PENDING_PAYMENT">Waiting Payment</option>
                      <option value="AWAITING_VERIFICATION">Awaiting Verification</option>
                      <option value="PAID">Paid / Payment Confirmed</option>
                      <option value="PREPARING">Preparing Items</option>
                      <option value="SHIPPING">Shipping Package</option>
                      <option value="DELIVERED">Delivered Successfully</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  {/* Tracking number & Shipping Slip input (shows when status is SHIPPING) */}
                  {newStatus === 'SHIPPING' && (
                    <div className="flex flex-col gap-3 animate-fadeIn">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400">Courier Tracking Code</label>
                        <div className="relative mt-1">
                          <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            value={newTracking}
                            onChange={(e) => setNewTracking(e.target.value)}
                            placeholder="e.g. TH1204859203EX"
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2.5 pl-10 pr-4 text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400">
                          Upload Shipping Slip (ສະລິບຂົນສົ່ງ)
                        </label>
                        {selectedOrder.shippingSlipUrl && !selectedShippingFile && (
                          <div className="mb-2 mt-1">
                            <span className="text-[9px] text-slate-400 block mb-0.5">Current shipping slip:</span>
                            <a href={`${API_STATIC_URL}${selectedOrder.shippingSlipUrl}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-brand-blue-500 hover:underline truncate block">
                              {selectedOrder.shippingSlipUrl}
                            </a>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              setSelectedShippingFile(e.target.files[0]);
                            }
                          }}
                          className="w-full mt-1 text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-brand-pink-50 file:text-brand-pink-500 hover:file:bg-brand-pink-100"
                        />
                        {selectedShippingFile && (
                          <span className="text-[9px] text-brand-mint-500 block mt-1 font-bold">
                            Selected: {selectedShippingFile.name}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {shippingUploadError && (
                  <div className="text-[10px] text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-150 p-2 rounded-xl text-left w-full flex items-start gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                    <span>{shippingUploadError}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={() => handleUpdateStatus()}
                  disabled={submitting}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 cursor-pointer rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold py-2.5 text-xs shadow-md shadow-brand-pink-500/20 transition-all duration-300 active:scale-95 disabled:opacity-50"
                >
                  <Edit2 className="h-4 w-4" /> Save Order Changes
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
