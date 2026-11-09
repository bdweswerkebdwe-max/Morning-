import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Download, Wand2, Ratio, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface ImageStudioProps {
  user: User | null;
  token?: string | null;
  setUser?: (user: User) => void;
  onSaveProject: (title: string, type: any, content: any, platform: string) => void;
}

export const ImageStudio: React.FC<ImageStudioProps> = ({ user, token, setUser, onSaveProject }) => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-3 py-1 rounded-full text-xs font-bold">
            <ImageIcon className="w-4 h-4" />
            <span>محرك التوليد الفني للصور</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            استوديو الصور والبوسترات الإعلانية (Image Studio)
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            قم بتوليد تصاميم تسويقية وبوسترات وصور منتجات فائقة الجودة بدقة 4K تناسب حملاتك الإعلانية على إنستغرام وسناب شات وتيك توك.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">وصف الصورة المطلوبة باللغة العربية أو الإنجليزية:</label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={4}
              placeholder="اكتب وصف التفاصيل البصرية: المنتجات، الإضاءة، الألوان، الخلفية..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
            />
          </div>

          {/* Prompt Inspirations */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400">أفكار مقترحة سريعة:</span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromptText(p)}
                  className="text-[10px] bg-slate-950 border border-slate-800 hover:border-purple-500 text-slate-300 px-3 py-1.5 rounded-xl transition text-right"
                >
                  {p.slice(0, 35)}...
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">مقاس الصورة (Aspect Ratio):</label>
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
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                    aspectRatio === item.val
                      ? 'bg-purple-950/60 border-purple-500 text-white shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style Preset */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">النمط البصري:</label>
            <select
              value={stylePreset}
              onChange={(e) => setStylePreset(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-800 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-purple-500"
            >
              <option value="hyperrealistic">استوديو واقعي وفوتوغرافي (Hyper-realistic)</option>
              <option value="cinematic">سينمائي ذو إضاءة ذهبية (Cinematic Lighting)</option>
              <option value="minimalist">بسيط وفاخر (Minimalist Luxury)</option>
              <option value="3d_render">مجسم ثلاثي الأبعاد (3D Commercial Render)</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-bold">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Wand2 className="w-5 h-5 animate-spin" />
                <span>جاري رسم وتوليد الصورة الإعلانية...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>توليد الصورة الآن (نقطتان)</span>
              </>
            )}
          </button>
        </div>

        {/* Display Result */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl min-h-[450px]">
          <h3 className="text-sm font-bold text-slate-200">الصورة الناتجة</h3>

          {generatedImage ? (
            <div className="space-y-4 my-auto">
              <div className="max-h-[380px] rounded-2xl overflow-hidden border border-purple-500/40 shadow-2xl relative">
                <img src={generatedImage} alt="Generated Ad" className="w-full h-full object-cover" />
              </div>
              <a
                href={generatedImage}
                download="ad-image.png"
                className="w-full block text-center bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl text-xs transition"
              >
                تحميل الصورة بجودة عالية 📥
              </a>
            </div>
          ) : (
            <div className="my-auto text-center space-y-3 p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
              <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">ستظهر الصورة الإعلانية المولدة هنا جاهزة للتحميل والاستخدام</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
