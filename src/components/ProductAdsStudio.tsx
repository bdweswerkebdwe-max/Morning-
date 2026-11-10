import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Upload, Layers, Video, ArrowRight, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { User } from '../types';
import { processAndNormalizeImage } from '../utils/imageUtils';

interface ProductAdsStudioProps {
  user: User | null;
  token?: string | null;
  setUser?: (user: User) => void;
  onSaveProject: (title: string, type: any, content: any, platform: string) => void;
  onNavigateToVideoStudio?: () => void;
}

export const ProductAdsStudio: React.FC<ProductAdsStudioProps> = ({ user: _user, token, setUser, onSaveProject, onNavigateToVideoStudio }) => {
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
      await new Promise(r => setTimeout(r, 2000));
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-neutral-900" dir="rtl">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 relative overflow-hidden shadow-2xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 text-neutral-800 px-3 py-1 rounded text-xs font-bold">
            <ShoppingBag className="w-3.5 h-3.5 text-neutral-900" />
            <span>استوديو تصوير المنتجات التجاري</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
            استوديو إعلانات المنتجات (Product Ads)
          </h1>
          <p className="text-xs text-neutral-500 max-w-2xl leading-relaxed">
            تحويل صورة منتجك البسيطة إلى جلسة تصوير فاخرة، أو فيديو فتح الصندوق (Unboxing)، أو إعلان سينمائي.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl p-6 space-y-5 shadow-2xs">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800">نمط الإعلان المطلوب:</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setMode('photoshoot')}
                className={`p-3 rounded-lg border text-right transition ${
                  mode === 'photoshoot'
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <ImageIcon className="w-4 h-4 mb-1.5" />
                <p className="text-xs font-bold">جلسة تصوير استوديو</p>
                <p className={`text-[10px] ${mode === 'photoshoot' ? 'text-neutral-300' : 'text-neutral-500'}`}>توليد خلفية سينمائية للمنتج</p>
              </button>

              <button
                onClick={() => setMode('actor_hold')}
                className={`p-3 rounded-lg border text-right transition ${
                  mode === 'actor_hold'
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Sparkles className="w-4 h-4 mb-1.5" />
                <p className="text-xs font-bold">ممثل يحمل المنتج</p>
                <p className={`text-[10px] ${mode === 'actor_hold' ? 'text-neutral-300' : 'text-neutral-500'}`}>عرض المنتج بين يدي الممثل</p>
              </button>

              <button
                onClick={() => setMode('unboxing')}
                className={`p-3 rounded-lg border text-right transition ${
                  mode === 'unboxing'
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Video className="w-4 h-4 mb-1.5" />
                <p className="text-xs font-bold">فيديو Unboxing</p>
                <p className={`text-[10px] ${mode === 'unboxing' ? 'text-neutral-300' : 'text-neutral-500'}`}>تجربة فتح العلبة واستعراض التفاصيل</p>
              </button>

              <button
                onClick={() => setMode('callout')}
                className={`p-3 rounded-lg border text-right transition ${
                  mode === 'callout'
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Layers className="w-4 h-4 mb-1.5" />
                <p className="text-xs font-bold">إبرز الميزات التوضيحية</p>
                <p className={`text-[10px] ${mode === 'callout' ? 'text-neutral-300' : 'text-neutral-500'}`}>إضافة نصوص تفاعلية حول المنتج</p>
              </button>
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">اسم أو وصف المنتج التجاري:</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="مثال: عطور مبتكرة، ساعة فاخرة..."
                className="w-full bg-white border border-neutral-200 rounded-lg px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">تصنيف المنتج:</label>
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-lg px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 font-semibold"
              >
                <option value="perfumes">عطور ومستحضرات تجميل</option>
                <option value="fashion">أزياء وملابس واكسسوارات</option>
                <option value="electronics">إلكترونيات وأجهزة ذكية</option>
                <option value="food">أغذية ومشروبات ومقاهي</option>
                <option value="fitness">مكملات ورياضة</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-800 block mb-1">صورة المنتج الأصلي:</label>
              <div className="border border-dashed border-neutral-300 hover:border-neutral-500 rounded-lg p-3.5 text-center cursor-pointer bg-neutral-50 relative">
                <input
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={handleImageUpload}
                  disabled={isProcessingImage}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {isProcessingImage ? (
                  <div className="flex items-center justify-center gap-2 text-neutral-800 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs font-bold">جاري المعالجة...</span>
                  </div>
                ) : productImage ? (
                  <div className="flex items-center justify-center gap-3">
                    <img src={productImage} alt="Product" className="w-12 h-12 object-cover rounded border border-neutral-300" />
                    <span className="text-xs text-neutral-900 font-bold">تم إرفاق الصورة ✓</span>
                    <button
                      type="button"
                      onClick={() => setProductImage(null)}
                      className="p-1 text-neutral-400 hover:text-red-600 transition"
                      title="حذف الصورة"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-5 h-5 text-neutral-800 mx-auto" />
                    <p className="text-xs font-bold text-neutral-800">اضغط لرفع صورة المنتج (JPG, PNG, HEIC)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-bold">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerateProductAd}
            disabled={isGenerating || isProcessingImage}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 rounded-lg shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>جاري معالجة المنتج...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>توليد إعلان المنتج الآن (2 نقطة)</span>
              </>
            )}
          </button>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-xl p-5 flex flex-col justify-between shadow-2xs min-h-[420px]">
          <h3 className="text-xs font-bold text-neutral-900">معاينة الناتج</h3>

          {resultImage ? (
            <div className="space-y-3 my-auto">
              <div className="aspect-[9/16] max-h-[350px] mx-auto rounded-lg overflow-hidden border border-neutral-200 relative shadow-2xs bg-neutral-900">
                <img src={resultImage} alt="Rendered Ad" className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur border border-neutral-200 p-2.5 rounded-lg text-xs text-neutral-900">
                  <p className="font-bold">{productName}</p>
                  <p className="text-[10px] text-neutral-500">نمط: {mode}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={resultImage}
                  download="product-ad.png"
                  className="flex-1 text-center bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold py-2 rounded-lg text-xs"
                >
                  تحميل الصورة 📥
                </a>
                {onNavigateToVideoStudio && (
                  <button
                    onClick={onNavigateToVideoStudio}
                    className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1"
                  >
                    <span>تحويل لفيديو</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="my-auto text-center space-y-2 p-6 border border-dashed border-neutral-200 rounded-lg bg-neutral-50">
              <ShoppingBag className="w-10 h-10 text-neutral-400 mx-auto" />
              <p className="text-xs text-neutral-500">قم بتعبئة البيانات واضغط على توليد لرؤية النتيجة هنا</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
