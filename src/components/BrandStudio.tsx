import React, { useState } from 'react';
import { Sparkles, Upload, Palette, CheckCircle2, Building, ShieldCheck, Plus, Trash2, Loader2 } from 'lucide-react';
import { User } from '../types';
import { processAndNormalizeImage } from '../utils/imageUtils';

interface BrandProfile {
  id: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  guidelines: string;
}

interface BrandStudioProps {
  user: User | null;
}

export const BrandStudio: React.FC<BrandStudioProps> = ({ user }) => {
  const [brands, setBrands] = useState<BrandProfile[]>([
    {
      id: 'brand_1',
      name: 'MOLAN Enterprise',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      primaryColor: '#f59e0b',
      accentColor: '#ea580c',
      fontFamily: 'Cairo',
      guidelines: 'هوية بصرية فاخرة للإعلانات التجارية بالذكاء الاصطناعي',
    },
  ]);

  const [brandName, setBrandName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#f59e0b');
  const [accentColor, setAccentColor] = useState('#ea580c');
  const [fontFamily, setFontFamily] = useState('Cairo');
  const [guidelines, setGuidelines] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingLogo(true);
      try {
        const normalizedBase64 = await processAndNormalizeImage(file, 1024);
        setLogoUrl(normalizedBase64);
      } catch (err: any) {
        alert(err.message || 'فشلت عملية رفع وتحويل الشعار');
      } finally {
        setIsProcessingLogo(false);
      }
    }
  };

  const handleSaveBrand = () => {
    if (!brandName.trim()) {
      alert('يرجى كتابة اسم العلامة التجارية');
      return;
    }

    const newBrand: BrandProfile = {
      id: 'brand_' + Date.now(),
      name: brandName,
      logoUrl: logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      primaryColor,
      accentColor,
      fontFamily,
      guidelines,
    };

    setBrands([...brands, newBrand]);
    setBrandName('');
    setGuidelines('');
    setLogoUrl(null);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleDeleteBrand = (id: string) => {
    setBrands(brands.filter(b => b.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200 text-neutral-800 px-3 py-1 rounded-full text-xs font-bold">
            <Building className="w-4 h-4 text-neutral-600" />
            <span>استوديو الهوية التجارية والبراندينج (Brand Kit Studio)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900">
            إدارة الهويات التجارية وشعارات الشركات
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            أنشئ هويتك التجارية برفع الشعار، وتحديد الألوان والخطوط، ليتم تطبيقها تلقائياً على أصول الإعلانات ومقاطع الفيديو المولدة.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* New Brand Form */}
        <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-3xl p-6 space-y-5 shadow-sm">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-neutral-700" />
            <span>إضافة هوية تجارية جديدة</span>
          </h3>

          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1.5">اسم العلامة التجارية / الشركة:</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="مثال: لافيرن، متجر الأناقة، MOLAN Enterprise..."
              className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1.5">اللون الرئيسي:</label>
              <div className="flex items-center gap-2 bg-neutral-50 p-2 rounded-xl border border-neutral-200">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs text-neutral-800 uppercase font-mono font-bold">{primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1.5">اللون الثانوي:</label>
              <div className="flex items-center gap-2 bg-neutral-50 p-2 rounded-xl border border-neutral-200">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs text-neutral-800 uppercase font-mono font-bold">{accentColor}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1.5">شعار العلامة التجارية (Logo):</label>
            <div className="border-2 border-dashed border-neutral-300 hover:border-neutral-500 rounded-2xl p-4 text-center cursor-pointer bg-neutral-50 relative">
              <input type="file" accept="image/*,.heic,.heif" onChange={handleLogoUpload} disabled={isProcessingLogo} className="absolute inset-0 opacity-0 cursor-pointer" />
              {isProcessingLogo ? (
                <div className="flex items-center justify-center gap-2 text-neutral-700 py-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-bold">جاري معالجة الشعار...</span>
                </div>
              ) : logoUrl ? (
                <div className="flex items-center justify-center gap-4">
                  <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded-lg border border-neutral-300" />
                  <span className="text-xs text-emerald-600 font-bold">تم رفع الشعار بنجاح ✓</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-6 h-6 text-neutral-500 mx-auto" />
                  <p className="text-xs font-bold text-neutral-700">اضغط لرفع الشعار (PNG, JPG, HEIC)</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1.5">إرشادات وأسلوب العلامة التجارية:</label>
            <textarea
              value={guidelines}
              onChange={(e) => setGuidelines(e.target.value)}
              rows={3}
              placeholder="اكتب الإرشادات البصرية الخاصة بالنصوص وألوان الخلفيات..."
              className="w-full bg-white border border-neutral-200 rounded-2xl p-4 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 resize-none"
            />
          </div>

          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>تم حفظ الهوية التجارية بنجاح وتطبيقها على الاستوديوهات!</span>
            </div>
          )}

          <button
            onClick={handleSaveBrand}
            disabled={isProcessingLogo}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3.5 rounded-2xl shadow-sm transition text-xs disabled:opacity-50"
          >
            حفظ الهوية التجارية 💾
          </button>
        </div>

        {/* Existing Brand Kits List */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-neutral-700" />
            <span>الهويات التجارية المحفوظة ({brands.length})</span>
          </h3>

          <div className="space-y-4">
            {brands.map((b) => (
              <div key={b.id} className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={b.logoUrl} alt={b.name} className="w-10 h-10 object-contain rounded-xl bg-neutral-50 border border-neutral-200 p-1" />
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">{b.name}</h4>
                      <p className="text-[10px] text-neutral-500">{b.guidelines || 'هوية تجارية مفعلة'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteBrand(b.id)}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 rounded-xl transition"
                    title="حذف الهوية"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-700">
                    <div className="w-4 h-4 rounded-full border border-neutral-300" style={{ backgroundColor: b.primaryColor }} />
                    <span>الرئيسي: {b.primaryColor}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-700">
                    <div className="w-4 h-4 rounded-full border border-neutral-300" style={{ backgroundColor: b.accentColor }} />
                    <span>الثانوي: {b.accentColor}</span>
                  </div>
                  <span className="text-[10px] bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-md font-bold ml-auto border border-neutral-200">
                    مطبقة تلقائياً ✓
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
