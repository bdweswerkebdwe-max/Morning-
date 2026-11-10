import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Wand2 } from 'lucide-react';
import { User } from '../types';

interface ImageStudioProps {
  user: User | null;
  token?: string | null;
  setUser?: (user: User) => void;
  onSaveProject: (title: string, type: any, content: any, platform: string) => void;
}

export const ImageStudio: React.FC<ImageStudioProps> = ({ token, setUser }) => {
  const [promptText, setPromptText] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16' | '16:9' | '4:3'>('1:1');
  const [stylePreset, setStylePreset] = useState('hyperrealistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const samplePrompts = [
    'بوستر إعلاني لعطر عربي فاخر في علبة مذهبة على خلفية من الكثبان الرملية الذهبية في وقت الغروب',
    'تصوير منتج احترافي لقهوة مختصة في كوب زجاجي أنيق مع حبات البن المحمصة وإضاءة جانبية خافتة',
    'إعلان مستحضر عناية بالبشرة على سطح رخامي أبيض ناصع محاط بأوراق الخيزران والماء العذب',
  ];

  const handleGenerate = async () => {
    if (!promptText.trim()) {
      setError('يرجى كتابة وصف الصورة أو الفكرة الإعلانية');
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/image-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          prompt: promptText,
          aspectRatio,
          stylePreset,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedImage(data.imageUrl);
        if (data.user && setUser) {
          setUser(data.user);
        }
      } else {
        throw new Error(data.error || 'فشلت عملية توليد الصورة');
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ أثناء توليد الصورة الإعلانية');
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
            <ImageIcon className="w-3.5 h-3.5 text-neutral-900" />
            <span>محرك التوليد الفني للصور</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
            استوديو الصور والبوسترات الإعلانية (Image Studio)
          </h1>
          <p className="text-xs text-neutral-500 max-w-2xl leading-relaxed">
            قم بتوليد تصاميم تسويقية وبوسترات وصور منتجات فائقة الجودة بدقة 4K تناسب حملاتك الإعلانية.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl p-6 space-y-5 shadow-2xs">
          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-1.5">وصف الصورة المطلوبة باللغة العربية أو الإنجليزية:</label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={4}
              placeholder="اكتب وصف التفاصيل البصرية: المنتجات، الإضاءة، الألوان، الخلفية..."
              className="w-full bg-white border border-neutral-200 rounded-lg p-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 leading-relaxed resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-neutral-500">أفكار مقترحة سريعة:</span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromptText(p)}
                  className="text-[10px] bg-neutral-50 border border-neutral-200 hover:border-neutral-400 text-neutral-800 px-2.5 py-1 rounded transition text-right"
                >
                  {p.slice(0, 35)}...
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 block">مقاس الصورة (Aspect Ratio):</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '1:1 مربع', val: '1:1' },
                { label: '9:16 ستوري', val: '9:16' },
                { label: '16:9 عريض', val: '16:9' },
                { label: '4:3 بوستر', val: '4:3' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setAspectRatio(item.val as any)}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition ${
                    aspectRatio === item.val
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 block">النمط البصري:</label>
            <select
              value={stylePreset}
              onChange={(e) => setStylePreset(e.target.value)}
              className="w-full bg-white text-neutral-900 text-xs border border-neutral-200 rounded-lg px-3.5 py-2.5 font-semibold focus:outline-none focus:border-neutral-900"
            >
              <option value="hyperrealistic">استوديو واقعي وفوتوغرافي (Hyper-realistic)</option>
              <option value="cinematic">سينمائي ذو إضاءة ذهبية (Cinematic)</option>
              <option value="minimalist">بسيط وفاخر (Minimalist Luxury)</option>
              <option value="3d_render">مجسم ثلاثي الأبعاد (3D Render)</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-bold">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 rounded-lg shadow-xs transition flex items-center justify-center gap-2 text-xs"
          >
            {isGenerating ? (
              <>
                <Wand2 className="w-4 h-4 animate-spin text-white" />
                <span>جاري توليد الصورة الإعلانية...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>توليد الصورة الآن (2 نقطة)</span>
              </>
            )}
          </button>
        </div>

        {/* Display Result */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-xl p-5 flex flex-col justify-between shadow-2xs min-h-[420px]">
          <h3 className="text-xs font-bold text-neutral-900">الصورة الناتجة</h3>

          {generatedImage ? (
            <div className="space-y-3 my-auto">
              <div className="max-h-[350px] rounded-lg overflow-hidden border border-neutral-200 relative bg-neutral-900">
                <img src={generatedImage} alt="Generated Ad" className="w-full h-full object-cover" />
              </div>
              <a
                href={generatedImage}
                download="ad-image.png"
                className="w-full block text-center bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2.5 rounded-lg text-xs transition"
              >
                تحميل الصورة بجودة عالية 📥
              </a>
            </div>
          ) : (
            <div className="my-auto text-center space-y-2 p-6 border border-dashed border-neutral-200 rounded-lg bg-neutral-50">
              <ImageIcon className="w-10 h-10 text-neutral-400 mx-auto" />
              <p className="text-xs text-neutral-500">ستظهر الصورة الإعلانية المولدة هنا جاهزة للتحميل</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
