'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api, getMediaUrl } from '../../utils/api';
import { User, Phone, MapPin, ClipboardList, CheckCircle, Save, Calendar, FileText, ClipboardCheck } from 'lucide-react';

export default function Profile() {
  const router = useRouter();
  const { user, updateProfile, isAuthenticated, loading: authLoading } = useAuth();
  const { t, language, tObj } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Review Modal States
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewProductId, setSelectedReviewProductId] = useState<string | null>(null);
  const [selectedReviewProduct, setSelectedReviewProduct] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Sync parameters
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile');
    } else if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user, isAuthenticated, authLoading, router]);

  // Load orders history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const history = await api.get('/orders');
        setOrders(history);
      } catch (err) {
        console.error('Failed to load order history:', err);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      await updateProfile({ name, phone, address });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const confirmMsg = language === 'TH'
      ? 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?'
      : language === 'LA'
      ? 'ທ່ານແນ່ໃຈຫຼືບໍ່ວ່າຕ້ອງການຍົກເລີກຄຳສັ່ງຊື້ນີ້?'
      : 'Are you sure you want to cancel this order?';

    if (!confirm(confirmMsg)) return;

    try {
      await api.post(`/orders/${orderId}/cancel`, {});
      const history = await api.get('/orders');
      setOrders(history);
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      alert(err.message || 'Failed to cancel order.');
    }
  };

  const handleOpenReviewModal = (productId: string, product: any) => {
    setSelectedReviewProductId(productId);
    setSelectedReviewProduct(product);
    setRating(5);
    setComment('');
    setReviewError(null);
    setReviewSuccess(false);
    setReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedReviewProductId(null);
    setSelectedReviewProduct(null);
  };

  const handleSubmitReview = async () => {
    if (!selectedReviewProductId) return;

    setReviewSubmitting(true);
    setReviewError(null);

    try {
      await api.post(`/products/${selectedReviewProductId}/reviews`, {
        rating,
        comment
      });
      setReviewSuccess(true);
      setTimeout(() => {
        handleCloseReviewModal();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return <div className="py-20 text-center text-sm font-semibold">Validating session profile...</div>;
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      
      {/* Title */}
      <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2">
        <User className="h-6 w-6 text-brand-pink-500" /> {t('navProfile')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column Edit Info */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-4 h-fit">
          <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
            Personal Information
          </h3>

          {error && <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-xl">{error}</div>}
          {success && (
            <div className="text-xs text-brand-mint-500 bg-brand-mint-50/50 p-2.5 rounded-xl flex items-center gap-1">
              <CheckCircle className="h-4 w-4" /> Profile updated successfully.
            </div>
          )}

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('nameLabel')}</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-10 pr-4 text-xs focus:border-brand-pink-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('phoneLabel')}</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-10 pr-4 text-xs focus:border-brand-pink-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('addressLabel')}</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-10 pr-4 text-xs focus:border-brand-pink-400 focus:outline-none resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-2 w-full flex items-center justify-center gap-1.5 cursor-pointer rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold py-2.5 text-xs shadow-md shadow-brand-pink-500/20 transition-all duration-300 active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Right column: Orders history list */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-4">
          <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-1.5">
            <ClipboardList className="h-4.5 w-4.5 text-brand-blue-500" /> {t('orderHistory')}
          </h3>

          {ordersLoading ? (
            <div className="py-10 text-center text-xs text-slate-400">Loading history...</div>
          ) : orders.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">{t('noOrders')}</div>
          ) : (
            <div className="flex flex-col gap-6">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden flex flex-col"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-150 dark:border-slate-700 text-xs">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Order Number</span>
                        <span className="font-extrabold text-slate-805 dark:text-white">{ord.orderNumber}</span>
                      </div>
                      <div className="border-l border-slate-250 dark:border-slate-700 h-6 pl-4">
                        <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Order Date</span>
                        <span className="font-medium text-slate-600 dark:text-slate-350">{new Date(ord.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-semibold">{ord.paymentMethod}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        ord.status === 'DELIVERED'
                          ? 'bg-brand-mint-100 text-brand-mint-500'
                          : ord.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-500'
                          : 'bg-brand-orange-100 text-brand-orange-500'
                      }`}>
                        {t(ord.status)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-700 px-4">
                    {ord.orderItems.map((item: any) => (
                      <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex gap-3 min-w-0">
                          {/* Image */}
                          <div className="h-14 w-14 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center">
                            {item.product.images && item.product.images.length > 0 ? (
                              <img 
                                src={getMediaUrl(item.product.images[0])} 
                                alt={tObj(item.product.nameEn, item.product.nameTh, item.product.nameLa)} 
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <FileText className="h-6 w-6 text-slate-300" />
                            )}
                          </div>
                          {/* Name and Price */}
                          <div className="min-w-0">
                            <span 
                              className="font-bold text-xs text-slate-800 dark:text-white block hover:text-brand-pink-500 transition-colors cursor-pointer truncate max-w-[280px] sm:max-w-[320px]" 
                              onClick={() => router.push(`/products/detail?id=${item.productId}`)}
                            >
                              {tObj(item.product.nameEn, item.product.nameTh, item.product.nameLa)}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {item.price.toLocaleString()} LAK x {item.quantity}
                            </span>
                          </div>
                        </div>

                        {/* Item Review Action */}
                        {ord.status === 'DELIVERED' && (
                          <button
                            onClick={() => handleOpenReviewModal(item.productId, item.product)}
                            className="w-full sm:w-auto text-center cursor-pointer rounded-full border border-brand-pink-200 hover:bg-brand-pink-500 hover:text-white dark:hover:bg-brand-pink-950/20 text-brand-pink-500 font-bold px-4 py-1.5 text-[10px] transition-all"
                          >
                            {language === 'TH' ? 'เขียนรีวิวสินค้า' : language === 'LA' ? 'ຂຽນຣີວິວສິນຄ້າ' : 'Write Review'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Order Footer summary & general actions */}
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-150 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px]">Total Amount: </span>
                      <span className="font-display font-black text-slate-805 dark:text-white">
                        {ord.totalAmount.toLocaleString()} LAK
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Cancel Order */}
                      {(ord.status === 'PENDING_PAYMENT' || ord.status === 'AWAITING_VERIFICATION') && (
                        <button
                          onClick={() => handleCancelOrder(ord.id)}
                          className="px-4 py-2 rounded-full border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-500 text-red-500 font-bold text-[10px] cursor-pointer transition-all"
                        >
                          {language === 'TH' ? 'ยกเลิกคำสั่งซื้อ' : language === 'LA' ? 'ຍົກເລີກຄຳສັ່ງຊື້' : 'Cancel Order'}
                        </button>
                      )}

                      {/* Detail View */}
                      <button
                        onClick={() => router.push(`/orders/detail?id=${ord.id}`)}
                        className="px-4 py-2 rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold text-[10px] cursor-pointer transition-all shadow-sm"
                      >
                        {ord.status === 'PENDING_PAYMENT' 
                          ? (language === 'TH' ? 'ชำระเงิน' : language === 'LA' ? 'ຊຳລະເງິນ' : 'Pay / Upload Slip')
                          : (language === 'TH' ? 'ดูรายละเอียด' : language === 'LA' ? 'ເບິ່ງລາຍລະອຽດ' : 'View Details')
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedReviewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md shadow-2xl space-y-5 flex flex-col">
            <div className="flex justify-between items-start">
              <h3 className="font-display font-black text-sm text-slate-800 dark:text-white">
                {language === 'TH' ? 'เขียนรีวิวสินค้า' : language === 'LA' ? 'ຂຽນຣີວິວສິນຄ້າ' : 'Write a Review'}
              </h3>
              <button 
                onClick={handleCloseReviewModal} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Product details header inside modal */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="h-10 w-10 bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                {selectedReviewProduct.images && selectedReviewProduct.images.length > 0 ? (
                  <img 
                    src={getMediaUrl(selectedReviewProduct.images[0])} 
                    alt={tObj(selectedReviewProduct.nameEn, selectedReviewProduct.nameTh, selectedReviewProduct.nameLa)} 
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <FileText className="h-5 w-5 text-slate-300" />
                )}
              </div>
              <span className="font-bold text-xs text-slate-700 dark:text-slate-300 truncate max-w-[240px]">
                {tObj(selectedReviewProduct.nameEn, selectedReviewProduct.nameTh, selectedReviewProduct.nameLa)}
              </span>
            </div>

            {/* Star Rating Selectors */}
            <div className="flex flex-col items-center gap-2 py-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Rating</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-90"
                  >
                    <svg
                      className={`h-7 w-7 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Area */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comment / Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={language === 'TH' ? 'แบ่งปันประสบการณ์การใช้งานสินค้า...' : language === 'LA' ? 'ແບ່ງປັນປະສົບການການໃຊ້ງານສິນຄ້າ...' : 'Share your thoughts about this product...'}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-xs text-slate-850 dark:text-white placeholder-slate-400 focus:border-brand-pink-500 focus:outline-none focus:ring-1 focus:ring-brand-pink-500 resize-none"
              />
            </div>

            {reviewError && (
              <div className="text-[10px] text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-xl border border-red-100 dark:border-red-900/30">
                {reviewError}
              </div>
            )}
            {reviewSuccess && (
              <div className="text-[10px] text-brand-mint-500 bg-brand-mint-50/50 p-2.5 rounded-xl border border-brand-mint-100 flex items-center gap-1.5 font-bold">
                <CheckCircle className="h-4 w-4 text-brand-mint-500" />
                <span>Review submitted successfully!</span>
              </div>
            )}

            <button
              onClick={handleSubmitReview}
              disabled={reviewSubmitting}
              className="w-full flex items-center justify-center gap-1.5 cursor-pointer rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold py-3 text-xs shadow-md shadow-brand-pink-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
