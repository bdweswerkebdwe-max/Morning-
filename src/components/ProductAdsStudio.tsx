import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Upload, Layers, CheckCircle2, Video, ArrowRight, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { User } from '../types';
import { processAndNormalizeImage } from '../utils/imageUtils';

interface ProductAdsStudioProps {
  user: User | null;
  token?: string | null;
  setUser?: (user: User) => void;
  onSaveProject: (title: string, type: any, content: any, platform: string) => void;
  onNavigateToVideoStudio?: () => void;
}

export const ProductAdsStudio: React.FC<ProductAdsStudioProps> = ({ user, token, setUser, onSaveProject, onNavigateToVideoStudio }) => {
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('perfumes');
  const [mode, setMode] = useState<'photoshoot' | 'unboxing' | 'actor_hold' | 'callout'>('photoshoot');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      setError(null);
      try {
        const normalizedBase64 = await processAndNormalizeImage(file, 2048);
        setProductImage(normalizedBase64);
      } catch (err: any) {
        setError(err.message || 'فشلت عملية فحص وتحويل صورة المنتج');
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleGenerateProductAd = async () => {
    if (!productName.trim()) {
      setError('يرجى كتابة اسم أو وصف المنتج');
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      await new Promise(r => setTimeout(r, 2500));
      const mockResult = productImage || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80';
      setResultImage(mockResult);

      onSaveProject(
        `إعلان منتج: ${productName}`,
        'product_ad',
        { productName, productCategory, mode, imageUrl: mockResult },
        '9:16'
      );
    } catch (e: any) {
      setError(e.message || 'حدث خطأ أثناء معالجة صورة المنتج');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
            <ShoppingBag className="w-4 h-4" />
            <span>استوديو تصوير المنتجات التجاري</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            استوديو إعلانات المنتجات الاحترافي (Product Ads)
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            تحويل صورة منتجك البسيطة إلى جلسة تصوير فاخرة، أو فيديو فتح الصندوق (Unboxing)، أو إعلان سينمائي يظهر فيه الممثل وهو يستعرض منتجك.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">نمط الإعلان المطلوب:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('photoshoot')}
                className={`p-3.5 rounded-2xl border text-right transition ${
                  mode === 'photoshoot'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ImageIcon className="w-5 h-5 text-emerald-400 mb-2" />
                <p className="text-xs font-bold">جلسة تصوير استوديو</p>
                <p className="text-[10px] text-slate-400">توليد خلفية سينمائية للمنتج</p>
              </button>

              <button
                onClick={() => setMode('actor_hold')}
                className={`p-3.5 rounded-2xl border text-right transition ${
                  mode === 'actor_hold'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Sparkles className="w-5 h-5 text-amber-400 mb-2" />
                <p className="text-xs font-bold">ممثل يحمل المنتج</p>
                <p className="text-[10px] text-slate-400">عرض المنتج بين يدي الممثل</p>
              </button>

              <button
                onClick={() => setMode('unboxing')}
                className={`p-3.5 rounded-2xl border text-right transition ${
                  mode === 'unboxing'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Video className="w-5 h-5 text-blue-400 mb-2" />
                <p className="text-xs font-bold">فيديو Unboxing</p>
                <p className="text-[10px] text-slate-400">تجربة فتح العلبة واستعراض التفاصيل</p>
              </button>

              <button
                onClick={() => setMode('callout')}
                className={`p-3.5 rounded-2xl border text-right transition ${
                  mode === 'callout'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Layers className="w-5 h-5 text-purple-400 mb-2" />
                <p className="text-xs font-bold">إبرز الميزات التوضيحية</p>
                <p className="text-[10px] text-slate-400">إضافة نصوص تفاعلية حول المنتج</p>
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">اسم أو وصف المنتج التجاري:</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="مثال: عطور لافيرن المبتكرة، ساعة فاخرة مقاومة للماء..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">تصنيف المنتج:</label>
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="perfumes">عطور ومستحضرات تجميل</option>
                <option value="fashion">أزياء وملابس واكسسوارات</option>
                <option value="electronics">إلكترونيات وأجهزة ذكية</option>
                <option value="food">أغذية ومشروبات ومقاهي</option>
                <option value="fitness">مكملات ورياضة</option>
              </select>
            </div>

            {/* Upload Area */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">صورة المنتج الأصلي (تدعم JPG, PNG, WEBP, GIF, HEIC):</label>
              <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-950 relative">
                <input
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={handleImageUpload}
                  disabled={isProcessingImage}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {isProcessingImage ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-400 py-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-xs font-bold">جاري تدقيق وتحويل صيغة الصورة...</span>
                  </div>
                ) : productImage ? (
                  <div className="flex items-center justify-center gap-4">
                    <img src={productImage} alt="Product" className="w-16 h-16 object-cover rounded-xl border border-emerald-500" />
                    <span className="text-xs text-emerald-400 font-bold">تم إرفاق وتدقيق صورة المنتج بنجاح ✓</span>
                    <button
                      type="button"
                      onClick={() => setProductImage(null)}
                      className="p-1 text-slate-400 hover:text-red-400 transition"
                      title="حذف الصورة"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-6 h-6 text-emerald-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-300">اضغط لرفع صورة المنتج الأصلي (JPG, PNG, HEIC)</p>
                    <p className="text-[10px] text-slate-400">سيتم عزل الخلفية وتطبيق الإضاءة الاحترافية تلقائياً</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-bold">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerateProductAd}
            disabled={isGenerating || isProcessingImage}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>جاري تصوير وتوليد مشهد المنتج الاحترافي...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>توليد إعلان المنتج الآن (2 نقطة)</span>
              </>
            )}
          </button>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl min-h-[450px]">
          <h3 className="text-sm font-bold text-slate-200">معاينة استوديو المنتج الناتج</h3>

          {resultImage ? (
            <div className="space-y-4 my-auto">
              <div className="aspect-[9/16] max-h-[380px] mx-auto rounded-2xl overflow-hidden border border-emerald-500/40 relative shadow-2xl">
                <img src={resultImage} alt="Rendered Ad" className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur border border-slate-800 p-3 rounded-xl text-xs text-slate-200">
                  <p className="font-bold text-emerald-400">{productName}</p>
                  <p className="text-[10px] text-slate-400">نمط: {mode}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={resultImage}
                  download="product-ad.png"
                  className="flex-1 text-center bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  تحميل الصورة عالية الدقة 📥
                </a>
                {onNavigateToVideoStudio && (
                  <button
                    onClick={onNavigateToVideoStudio}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1"
                  >
                    <span>تحويل لفيديو</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="my-auto text-center space-y-3 p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">قم بتعبئة بيانات المنتج واضغط توليد لرؤية النتيجة السحرية هنا</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
