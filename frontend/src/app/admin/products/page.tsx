'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { api } from '../../../utils/api';
import AdminSidebar from '../../../components/AdminSidebar';
import { Package, Plus, Edit, Trash2, X, PlusCircle, Check } from 'lucide-react';

interface Category {
  id: string;
  nameEn: string;
  nameTh: string;
  nameLa: string;
  slug: string;
}

interface Product {
  id: string;
  nameEn: string;
  nameTh: string;
  nameLa: string;
  descriptionEn: string;
  descriptionTh: string;
  descriptionLa: string;
  price: number;
  stock: number;
  images: string[];
  isBestSeller: boolean;
  isNewArrival: boolean;
  categoryId: string;
  category?: Category;
}

export default function AdminProducts() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { t, tObj } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameEn, setNameEn] = useState('');
  const [nameTh, setNameTh] = useState('');
  const [nameLa, setNameLa] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descTh, setDescTh] = useState('');
  const [descLa, setDescLa] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imagesInput, setImagesInput] = useState(''); // Textarea with line breaks
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auth lock
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, authLoading, router]);

  const loadData = async () => {
    if (!user || !isAdmin) return;
    try {
      const prods = await api.get('/products');
      setProducts(prods);

      const cats = await api.get('/products/categories');
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, isAdmin]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setNameEn('');
    setNameTh('');
    setNameLa('');
    setDescEn('');
    setDescTh('');
    setDescLa('');
    setPrice('');
    setStock('');
    if (categories.length > 0) setCategoryId(categories[0].id);
    setImagesInput('');
    setIsBestSeller(false);
    setIsNewArrival(false);
    setError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingId(product.id);
    setNameEn(product.nameEn);
    setNameTh(product.nameTh);
    setNameLa(product.nameLa || '');
    setDescEn(product.descriptionEn || '');
    setDescTh(product.descriptionTh || '');
    setDescLa(product.descriptionLa || '');
    setPrice(String(product.price));
    setStock(String(product.stock));
    setCategoryId(product.categoryId);
    setImagesInput(product.images ? product.images.join('\n') : '');
    setIsBestSeller(product.isBestSeller);
    setIsNewArrival(product.isNewArrival);
    setError(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteProductConfirm'))) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Delete failed:', err);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameTh || !nameLa || !price || !stock || !categoryId) {
      setError('Please fill in all required fields.');
      return;
    }

    setError(null);
    setSubmitting(true);

    const imageUrls = imagesInput
      .split('\n')
      .map(url => url.trim())
      .filter(url => url !== '');

    const payload = {
      nameEn,
      nameTh,
      nameLa,
      descriptionEn: descEn,
      descriptionTh: descTh,
      descriptionLa: descLa,
      price: parseFloat(price),
      stock: parseInt(stock),
      categoryId,
      images: imageUrls,
      isBestSeller,
      isNewArrival,
    };

    try {
      if (editingId) {
        // Edit mode
        const updated = await api.put(`/products/${editingId}`, payload);
        setProducts(prev => prev.map(p => p.id === editingId ? updated : p));
      } else {
        // Create mode
        const created = await api.post('/products', payload);
        setProducts(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err: any) {
      try {
        const parsedErr = JSON.parse(err.message);
        setError(t('TH') === 'เข้าสู่ระบบ' ? parsedErr.messageTh : parsedErr.messageEn);
      } catch (e) {
        setError(err.message || 'Operation failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <div className="py-20 text-center text-sm font-semibold">Loading product database...</div>;
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      
      {/* Title */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2">
          <Package className="h-6 w-6 text-brand-purple-500" /> {t('adminProductsHeader')}
        </h1>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 cursor-pointer rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold px-4 py-2.5 text-xs shadow-md shadow-brand-pink-500/20 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" /> {t('addProductBtn')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <AdminSidebar />
        </div>

        {/* Product Table grid */}
        <div className="lg:col-span-3">
          <div className="w-full rounded-3xl bg-white dark:bg-slate-800/80 border border-[var(--border-color)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-400 dark:text-slate-400">
                    <th className="p-4 w-16">Image</th>
                    <th className="p-4">Toy Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4 w-24">Price (LAK)</th>
                    <th className="p-4 w-20 text-center">Stock</th>
                    <th className="p-4 w-28 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
                          <img
                            src={p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1531641098792-4f3951222129?w=50'}
                            alt="thumbnail"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-200">
                        <span className="block font-bold">{tObj(p.nameEn, p.nameTh, p.nameLa)}</span>
                        <div className="flex gap-1.5 mt-1">
                          {p.isBestSeller && <span className="text-[8px] bg-brand-pink-100 text-brand-pink-500 px-1 py-0.2 rounded font-bold">Best Seller</span>}
                          {p.isNewArrival && <span className="text-[8px] bg-brand-blue-100 text-brand-blue-500 px-1 py-0.2 rounded font-bold">New</span>}
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">
                        {p.category ? tObj(p.category.nameEn, p.category.nameTh, p.category.nameLa) : 'None'}
                      </td>
                      <td className="p-4 font-display font-extrabold text-slate-900 dark:text-white">
                        {p.price.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                          p.stock <= 5 ? 'bg-brand-orange-100 text-brand-orange-500' : 'bg-brand-mint-100 text-brand-mint-500'
                        }`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="p-4 flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-full hover:bg-brand-blue-50 dark:hover:bg-slate-700 text-brand-blue-500 transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-slate-700 text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* CRUD Modal dialog overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-fadeIn border border-slate-100 dark:border-slate-700">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-display font-black text-base text-slate-850 dark:text-white flex items-center gap-1.5">
                <PlusCircle className="h-5 w-5 text-brand-pink-500" />
                {editingId ? t('editProductBtn') : t('addProductBtn')}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-xl">{error}</div>}

            {/* Form Fields */}
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Name EN */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('productNameEn')} *</label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2 px-3 text-xs focus:outline-none focus:border-brand-pink-400"
                  />
                </div>

                {/* Name TH */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('productNameTh')} *</label>
                  <input
                    type="text"
                    required
                    value={nameTh}
                    onChange={(e) => setNameTh(e.target.value)}
                    className="w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2 px-3 text-xs focus:outline-none focus:border-brand-pink-400"
                  />
                </div>

                {/* Name LA */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('productNameLa')} *</label>
                  <input
                    type="text"
                    required
                    value={nameLa}
                    onChange={(e) => setNameLa(e.target.value)}
                    className="w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2 px-3 text-xs focus:outline-none focus:border-brand-pink-400"
                  />
                </div>

                {/* Description EN */}
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('descEn')}</label>
                  <textarea
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    rows={2}
                    className="w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2 px-3 text-xs focus:outline-none focus:border-brand-pink-400 resize-none"
                  />
                </div>

                {/* Description TH */}
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('descTh')}</label>
                  <textarea
                    value={descTh}
                    onChange={(e) => setDescTh(e.target.value)}
                    rows={2}
                    className="w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2 px-3 text-xs focus:outline-none focus:border-brand-pink-400 resize-none"
                  />
                </div>

                {/* Description LA */}
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('descLa')}</label>
                  <textarea
                    value={descLa}
                    onChange={(e) => setDescLa(e.target.value)}
                    rows={2}
                    className="w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2 px-3 text-xs focus:outline-none focus:border-brand-pink-400 resize-none"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('priceLabel')} *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2 px-3 text-xs focus:outline-none focus:border-brand-pink-400"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('stockLabel')} *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2 px-3 text-xs focus:outline-none focus:border-brand-pink-400"
                  />
                </div>

                {/* Category ID */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('selectCategory')} *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2 px-3 text-xs focus:outline-none focus:border-brand-pink-400"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {tObj(c.nameEn, c.nameTh, c.nameLa)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Promo check flags */}
                <div className="flex gap-6 items-center mt-3 ml-1 sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="rounded text-brand-pink-500 focus:ring-brand-pink-500"
                    />
                    <span>Best Seller 🔥</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={isNewArrival}
                      onChange={(e) => setIsNewArrival(e.target.checked)}
                      className="rounded text-brand-blue-500 focus:ring-brand-blue-500"
                    />
                    <span>New Arrival ✨</span>
                  </label>
                </div>

                {/* Images textarea */}
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('imagesLabel')}</label>
                  <textarea
                    value={imagesInput}
                    onChange={(e) => setImagesInput(e.target.value)}
                    rows={3}
                    placeholder="https://example.com/toy-pic-1.jpg&#10;https://example.com/toy-pic-2.jpg"
                    className="w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2 px-3 text-xs font-mono focus:outline-none focus:border-brand-pink-400"
                  />
                </div>

              </div>

              {/* CTAs */}
              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-slate-200 dark:border-slate-750 px-5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  {t('cancelBtn')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1 cursor-pointer rounded-full bg-brand-pink-500 hover:bg-brand-pink-600 text-white font-bold px-6 py-2 text-xs shadow-md shadow-brand-pink-500/25 active:scale-95 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" /> {submitting ? 'Submitting...' : t('saveBtn')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
