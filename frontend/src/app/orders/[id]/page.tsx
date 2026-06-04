'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api, getMediaUrl } from '../../../utils/api';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import {
  FileText,
  Printer,
  Copy,
  Check,
  Upload,
  AlertCircle,
  Truck,
  Package,
  CreditCard,
  Calendar,
  MapPin,
  ClipboardCheck,
} from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    nameEn: string;
    nameTh: string;
    nameLa: string;
  };
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: 'PENDING_PAYMENT' | 'AWAITING_VERIFICATION' | 'PAID' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: 'STRIPE' | 'PAYPAL' | 'QR_CODE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  shippingAddress: string;
  trackingNumber: string | null;
  slipUrl: string | null;
  shippingSlipUrl: string | null;
  createdAt: string;
  orderItems: OrderItem[];
  user: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { language, t, tObj } = useLanguage();
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [qrDetails, setQrDetails] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchOrder = async () => {
    try {
      const data = await api.get(`/orders/${resolvedParams.id}`);
      setOrder(data);
      if (data.paymentMethod === 'QR_CODE') {
        const qrData = await api.get('/payments/qr-details');
        setQrDetails(qrData);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [resolvedParams.id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
      setUploadSuccess(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('slip', selectedFile);

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      await api.upload(`/orders/${resolvedParams.id}/upload-slip`, formData);
      setUploadSuccess(t('slipSuccess'));
      setSelectedFile(null);
      fetchOrder(); // reload order
    } catch (err: any) {
      try {
        const parsedErr = JSON.parse(err.message);
        setUploadError(language === 'TH' ? parsedErr.messageTh : language === 'LA' ? parsedErr.messageLa || parsedErr.messageEn : parsedErr.messageEn);
      } catch (e) {
        setUploadError(err.message || 'File upload failed. Only images and PDFs under 5MB.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="py-20 text-center text-sm font-semibold">Loading order data...</div>;
  }

  if (!order) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="text-sm font-semibold">Order not found.</p>
        <button onClick={() => router.push('/')} className="text-xs font-bold text-brand-pink-500 mt-2">
          Go Home
        </button>
      </div>
    );
  }

  // Parse shipping details
  const addrParts = order.shippingAddress.split(' | ');
  const shipName = addrParts[0] || '';
  const shipPhone = addrParts[1]?.replace('Tel: ', '') || '';
  const shipAddr = addrParts[2]?.replace('Address: ', '') || order.shippingAddress;

  // Status index for tracking stepper
  const statusSteps = ['PENDING_PAYMENT', 'AWAITING_VERIFICATION', 'PAID', 'PREPARING', 'SHIPPING', 'DELIVERED'];
  const statusLabels = {
    PENDING_PAYMENT: { EN: 'Ordered', TH: 'สั่งซื้อแล้ว', LA: 'ສັ່ງຊື້ແລ້ວ' },
    AWAITING_VERIFICATION: { EN: 'Verifying', TH: 'กำลังตรวจสอบ', LA: 'ກຳລັງຢືນຢັນ' },
    PAID: { EN: 'Paid', TH: 'ชำระเงินแล้ว', LA: 'ຊຳລະເງິນແລ້ວ' },
    PREPARING: { EN: 'Packing', TH: 'กำลังจัดเตรียม', LA: 'ກຳລັງກຽມສິນຄ້າ' },
    SHIPPING: { EN: 'Shipped', TH: 'จัดส่งแล้ว', LA: 'ຈັດສົ່ງແລ້ວ' },
    DELIVERED: { EN: 'Delivered', TH: 'ส่งสินค้าเรียบร้อย', LA: 'ຈັດສົ່ງສຳເລັດ' },
  };

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="flex flex-col gap-8 pb-16">
      
      {/* Printable Invoice Header (Hidden in Screen view, Visible in Print) */}
      <div className="hidden print:block w-full text-slate-800 p-8 border-b-2 border-slate-300">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">PATTIE PLAY SHOP CO., LTD.</h1>
            <p className="text-xs text-slate-500 mt-1">Thongpong, Sikhodtabong District, Vientiane, Laos</p>
            <p className="text-xs text-slate-500">Tel: +85620 97777279 | support@pattieplayshop.com</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold uppercase">Invoice / Receipt</h2>
            <p className="text-xs text-slate-500 mt-1">Order #: {order.orderNumber}</p>
            <p className="text-xs text-slate-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Screen layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Details</span>
          <h1 className="font-display font-black text-xl text-slate-800 dark:text-white flex items-center gap-2 mt-0.5">
            Order <span className="text-brand-pink-500">{order.orderNumber}</span>
            <button
              onClick={() => copyToClipboard(order.orderNumber)}
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-3 w-3 text-brand-mint-500" /> : <Copy className="h-3 w-3" />}
            </button>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 cursor-pointer rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all active:scale-95"
          >
            <Printer className="h-4 w-4" /> {t('printInvoice')}
          </button>
        </div>
      </div>

      {/* Stepper tracking progress bar (Print Hidden) */}
      {order.status !== 'CANCELLED' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm print:hidden">
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-6">
            {t('trackOrder')}
          </h3>

          <div className="relative flex items-center justify-between w-full">
            {/* Background line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 dark:bg-slate-700 z-0"></div>
            {/* Active progress line */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-pink-500 transition-all duration-500 z-0"
              style={{ width: `${(Math.max(0, currentStepIndex) / (statusSteps.length - 1)) * 100}%` }}
            ></div>

            {statusSteps.map((step, idx) => {
              const isActive = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step} className="flex flex-col items-center gap-2.5 z-10">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ring-4 ${
                      isCurrent
                        ? 'bg-brand-pink-500 text-white ring-brand-pink-100 dark:ring-brand-pink-900/50'
                        : isActive
                        ? 'bg-brand-pink-500 text-white ring-white dark:ring-slate-800'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500 ring-white dark:ring-slate-800'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`text-[10px] font-bold tracking-tight ${
                      isCurrent
                        ? 'text-brand-pink-500'
                        : isActive
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {statusLabels[step as keyof typeof statusLabels]?.[language as 'EN' | 'TH' | 'LA'] || statusLabels[step as keyof typeof statusLabels]?.EN}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Shipped tracking number details & courier shipping receipt */}
          {(order.status === 'SHIPPING' || order.status === 'DELIVERED') && (order.trackingNumber || order.shippingSlipUrl) && (
            <div className="mt-8 flex flex-col gap-4 animate-fadeIn">
              {order.trackingNumber && (
                <div className="p-4 rounded-2xl bg-brand-blue-50/50 dark:bg-brand-blue-950/20 border border-brand-blue-100/50 dark:border-brand-blue-900/20 text-xs flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-brand-blue-500" />
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {language === 'TH' ? 'คำสั่งซื้อของคุณจัดส่งแล้ว!' : language === 'LA' ? 'ຄຳສັ່ງຊື້ຂອງທ່ານໄດ້ຮັບການຈັດສົ່ງແລ້ວ!' : 'Your order has been shipped!'}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">Tracking Number: {order.trackingNumber}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(order.trackingNumber!)}
                    className="rounded-full bg-brand-blue-500 text-white px-4 py-1.5 font-bold hover:bg-brand-blue-600 transition-colors cursor-pointer text-[10px]"
                  >
                    Copy Tracking Number
                  </button>
                </div>
              )}

              {order.shippingSlipUrl && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-[var(--border-color)] text-xs flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-brand-purple-500" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {t('shippingSlip')}
                    </span>
                  </div>
                  
                  <div className="relative max-w-sm rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <img
                      src={getMediaUrl(order.shippingSlipUrl)}
                      alt="Courier Shipping Slip"
                      className="w-full h-auto object-contain max-h-[300px]"
                    />
                  </div>

                  <a
                    href={getMediaUrl(order.shippingSlipUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 transition-all w-fit"
                  >
                    {language === 'TH' ? 'ดูขนาดเต็ม' : language === 'LA' ? 'ເບິ່ງຂະໜາດເຕັມ' : 'View Full Image'}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Billing Address & Product listings) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Order Summary list */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-4">
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-1.5">
              <Package className="h-4.5 w-4.5 text-brand-blue-500" /> Items in Order
            </h3>

            <div className="flex flex-col gap-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-700/50 last:border-0 pb-3 last:pb-0">
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-slate-800 dark:text-white block truncate">
                      {tObj(item.product.nameEn, item.product.nameTh, item.product.nameLa)}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 block font-medium">
                      {item.price.toLocaleString()} LAK x {item.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-xs text-slate-800 dark:text-white shrink-0">
                    {(item.price * item.quantity).toLocaleString()} LAK
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2.5 text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span>{order.totalAmount.toLocaleString()} LAK</span>
              </div>
              <div className="flex justify-between items-center font-bold text-slate-800 dark:text-white">
                <span>{t('total')}</span>
                <span className="text-sm font-black">{order.totalAmount.toLocaleString()} LAK</span>
              </div>
            </div>
          </div>

          {/* Delivery & Shipping Info */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-4">
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-1.5">
              <MapPin className="h-4.5 w-4.5 text-brand-purple-500" /> Delivery Address
            </h3>

            <div className="flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block mb-0.5">Recipient Name</span>
                <span>{shipName || order.user.name}</span>
              </div>
              <div className="mt-1.5">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block mb-0.5">Phone Number</span>
                <span>{shipPhone || order.user.phone || 'N/A'}</span>
              </div>
              <div className="mt-1.5">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block mb-0.5">Address</span>
                <span>{shipAddr}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right column: Payment / Billing Status details */}
        <div className="flex flex-col gap-6">
          
          {/* Payment Terminal details */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-4">
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-1.5">
              <CreditCard className="h-4.5 w-4.5 text-brand-yellow-500" /> Payment & Billing
            </h3>

            <div className="flex flex-col gap-3 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Payment Method</span>
                <span className="font-semibold">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Payment Status</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold mt-1 ${order.paymentStatus === 'PAID' ? 'bg-brand-mint-100 text-brand-mint-500' : 'bg-brand-orange-100 text-brand-orange-500'}`}>
                  {order.paymentStatus === 'PAID' ? t('PAID') : 'PENDING'}
                </span>
              </div>
            </div>

            {/* QR Payment upload prompt */}
            {order.paymentMethod === 'QR_CODE' && order.paymentStatus !== 'PAID' && (
              <div className="mt-2 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-4 text-center items-center print:hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scan & Upload Slip</span>
                
                {/* Simulated QR Code Box */}
                <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl w-full border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="h-40 w-40 bg-white flex items-center justify-center border border-slate-200 p-1 rounded-xl overflow-hidden shadow-sm">
                    {qrDetails?.qrImageUrl ? (
                      <img 
                        src={getMediaUrl(qrDetails.qrImageUrl)} 
                        alt="BCEL One QR Code" 
                        className="h-full w-full object-contain" 
                      />
                    ) : (
                      <div className="text-[10px] text-slate-400 font-bold">No QR Code Image</div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 mt-2.5">
                    {qrDetails?.bankName || 'Banque Pour Le Commerce Exterieur Lao (BCEL)'}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-0.5">
                    Account: {qrDetails?.accountNumber || '160-12-00-0123456-001'} ({qrDetails?.accountName || 'PATTIE PLAY SHOP CO., LTD.'})
                  </span>
                </div>

                {/* Slip Upload Status */}
                {uploadError && (
                  <div className="text-[10px] text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-150 p-2 rounded-xl text-left w-full flex items-start gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                    <span>{uploadError}</span>
                  </div>
                )}
                {uploadSuccess && (
                  <div className="text-[10px] text-brand-mint-500 bg-brand-mint-50/50 p-2 rounded-xl text-left w-full flex items-start gap-1">
                    <ClipboardCheck className="h-3.5 w-3.5 shrink-0 text-brand-mint-500" />
                    <span>{uploadSuccess}</span>
                  </div>
                )}

                {/* Upload Button */}
                {order.slipUrl ? (
                  <div className="flex flex-col gap-2 w-full text-left">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Uploaded slip receipt:</span>
                    <a href={getMediaUrl(order.slipUrl)} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-blue-500 underline truncate">
                      {order.slipUrl}
                    </a>
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-3">
                    {selectedFile ? (
                      <div className="p-4 rounded-2xl border border-brand-pink-200 bg-brand-pink-50/5 dark:bg-brand-pink-950/5 text-xs flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2 text-slate-700 dark:text-slate-350">
                          <span className="font-semibold truncate max-w-[200px]">{selectedFile.name}</span>
                          <button
                            onClick={() => setSelectedFile(null)}
                            className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                        <button
                          onClick={handleUploadSubmit}
                          disabled={uploading}
                          className="w-full flex items-center justify-center gap-1.5 cursor-pointer rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold py-2 text-xs transition-colors active:scale-95 disabled:opacity-50"
                        >
                          <Upload className={`h-4 w-4 ${uploading ? 'animate-bounce' : ''}`} />
                          {uploading ? 'Uploading...' : language === 'TH' ? 'อัปโหลดและส่งสลิป' : language === 'LA' ? 'ອັບໂຫຼດ ແລະ ສົ່ງສະລິບ' : 'Upload and Submit Slip'}
                        </button>
                      </div>
                    ) : (
                      <label className="w-full flex flex-col items-center justify-center cursor-pointer border border-dashed border-brand-pink-200 hover:border-brand-pink-500 rounded-2xl bg-brand-pink-50/5 dark:bg-brand-pink-950/5 py-4 transition-all">
                        <Upload className="h-6 w-6 text-brand-pink-400" />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1">{t('uploadSlip')}</span>
                        <input
                          type="file"
                          disabled={uploading}
                          onChange={handleFileChange}
                          accept="image/*,application/pdf"
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Order Info */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] shadow-sm flex flex-col gap-3.5 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-purple-500" />
              <div>
                <span className="font-bold text-slate-400 uppercase text-[9px] block">Order Date</span>
                <span className="text-slate-800 dark:text-white font-medium">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-pink-500" />
              <div>
                <span className="font-bold text-slate-400 uppercase text-[9px] block">Shipment Status</span>
                <span className="font-semibold text-brand-pink-500">{t(order.status)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
