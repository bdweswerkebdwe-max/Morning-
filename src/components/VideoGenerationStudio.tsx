import React, { useState, useEffect } from 'react';
import { Sparkles, Video, Download, Save, RefreshCw, Check, Upload, Smartphone, Monitor, Square, AlertCircle, CheckCircle2, Coins, X, Loader2, Link, Search, ArrowRight, Edit3, Image as ImageIcon, ShoppingCart } from 'lucide-react';
import { User } from '../types';
import { processAndNormalizeImage } from '../utils/imageUtils';

interface VideoGenerationStudioProps {
  user: User | null;
  token?: string | null;
  setUser?: (user: User) => void;
  onSaveProject: (title: string, type: 'video', content: any, platform: string) => void;
  initialInputMode?: 'url' | 'manual';
}

export const VideoGenerationStudio: React.FC<VideoGenerationStudioProps> = ({ user, token, setUser, onSaveProject, initialInputMode }) => {
  const [inputMode, setInputMode] = useState<'url' | 'manual'>(initialInputMode || 'url');

  useEffect(() => {
    if (initialInputMode) {
      setInputMode(initialInputMode);
    }
  }, [initialInputMode]);

  const [targetUrl, setTargetUrl] = useState('');
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  const [urlAnalysis, setUrlAnalysis] = useState<{
    title: string;
    summary: string;
    fullAnalysis: string;
    price: string;
    images: string[];
    logo: string;
    masterPrompt: string;
  } | null>(null);

  const [product, setProduct] = useState('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [duration, setDuration] = useState('10 ثوانٍ');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [style, setStyle] = useState('إعلان تسويقي ديناميكي وعصري');
  const [language, setLanguage] = useState('العربية (الفصحى الحديثة)');
  const [voice, setVoice] = useState('تعليق صوتي حماسي ومحفز (Puck)');
  const [backgroundMusic, setBackgroundMusic] = useState('موسيقى تجارية حماسية (Upbeat Commercial)');

  const [hasApiKey, setHasApiKey] = useState(true);
  const [jobStatus, setJobStatus] = useState<'idle' | 'pending' | 'generating' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('');
  const [videoResult, setVideoResult] = useState<{ videoUrl: string; title: string; details: any } | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.success && typeof data.hasApiKey === 'boolean') {
          setHasApiKey(data.hasApiKey);
        }
      })
      .catch(() => {});
  }, []);

  const sampleProducts = [
    { name: 'ساعة يد ذكية فاخرة مقاومة للماء مع شاشة AMOLED', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80' },
    { name: 'عطر رويال عود الملكي الثابت لمدة 48 ساعة', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80' },
    { name: 'سماعات رأس لاسلكية بخاصية إلغاء الضوضاء النشطة', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
  ];

  const handleAnalyzeUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedUrl = targetUrl.trim();
    if (!trimmedUrl || (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://'))) {
      setError('يرجى إدخال رابط صحيح يبدأ بـ http:// أو https://');
      return;
    }

    if (user && user.credits < 1) {
      setError('رصيد النقاط غير كافٍ لتحليل الرابط (تتطلب العملية 1 نقطة)');
      return;
    }

    setIsAnalyzingUrl(true);
    setError('');
    setUrlAnalysis(null);

    try {
      const res = await fetch('/api/ai/analyze-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'demo-guest-token'}`,
        },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setUrlAnalysis(data.analysis);
        setProduct(data.analysis.fullAnalysis || data.analysis.summary);
        if (data.analysis.images && data.analysis.images.length > 0) {
          setImageBase64(data.analysis.images[0]);
        }
        if (data.user && setUser) {
          setUser(data.user);
        }
      } else {
        setError(data.error || 'تعذر جلب وتحليل الرابط. يمكنك الانتقال للخيارات اليدوية أدناه.');
      }
    } catch {
      setError('فشل الاتصال بالخادم أثناء فحص الرابط.');
    } finally {
      setIsAnalyzingUrl(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      setError('');
      try {
        const normalizedBase64 = await processAndNormalizeImage(file, 2048);
        setImageBase64(normalizedBase64);
      } catch (err: any) {
        setError(err.message || 'فشلت عملية فحص وتحويل الصورة');
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleSelectSample = (sample: { name: string; image: string }) => {
    setProduct(sample.name);
    setImageBase64(sample.image);
    setInputMode('manual');
  };

  const handleRemoveImage = () => {
    setImageBase64('');
  };

  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedProduct = product.trim();
    if (!trimmedProduct || trimmedProduct.length < 2) {
      setError('يرجى إدخال أو مراجعة وصف المنتج الإعلاني أولاً (حرفين على الأقل)');
      return;
    }

    if (trimmedProduct.length > 3000) {
      setError('وصف المنتج يجب ألا يتجاوز 3000 حرف');
      return;
    }

    if (user && user.credits < 10) {
      setError('رصيد النقاط غير كافٍ لتوليد الفيديو (تتطلب العملية 10 نقاط).');
      return;
    }

    setError('');
    setVideoResult(null);
    setSaved(false);
    setJobStatus('pending');
    setProgress(15);
    setProgressStep('تم التحقق من البيانات، جاري بدء التوليد...');

    try {
      await new Promise(r => setTimeout(r, 500));
      setJobStatus('generating');
      setProgress(40);
      setProgressStep('جاري الاتصال بـ Gemini Omni لتوليد الفيديو الحقيقي...');

      const res = await fetch('/api/ai/video-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'demo-guest-token'}`,
        },
        body: JSON.stringify({
          product: trimmedProduct,
          image: imageBase64,
          aspectRatio,
          duration,
          style,
          voice,
          language,
          backgroundMusic,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProgress(100);
        setJobStatus('completed');
        setVideoResult({
          videoUrl: data.project.content.videoUrl,
          title: data.project.title,
          details: data.project.content.details,
        });
        if (data.user && setUser) {
          setUser(data.user);
        }
      } else {
        setJobStatus('failed');
        setError(data.error || 'فشل توليد الفيديو الإعلاني. تم إرجاع النقاط تلقائياً.');
      }
    } catch {
      setJobStatus('failed');
      setError('فشل الاتصال بالخادم. تأكد من تشغيل الخادم.');
    }
  };

  const handleSave = () => {
    if (!videoResult) return;
    onSaveProject(videoResult.title, 'video', videoResult, aspectRatio);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-neutral-900" dir="rtl">
      {!hasApiKey && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-xl p-3.5 flex items-center gap-3 text-neutral-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-neutral-900" />
          <span><b>تنبيه:</b> مفتاح <code>GEMINI_API_KEY</code> غير مُضاف في أسرار الخادم. أضف المفتاح لتفعيل التوليد السحابي المباشر.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-md text-neutral-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
            <span>استوديو توليد الفيديوهات الإعلانية الحقيقية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">استوديو الفيديو الإعلاني (Video Ad Studio)</h1>
          <p className="text-neutral-500 text-xs mt-1">أنشئ فيديوهات إعلانية تجارية من روابط المتاجر والتطبيقات أو بالوصف اليدوي</p>
        </div>

        {user && (
          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-3.5 py-2 rounded-xl">
            <Coins className="w-4 h-4 text-neutral-800" />
            <div>
              <p className="text-[10px] text-neutral-500">رصيدك الحالي</p>
              <p className="text-xs font-bold text-neutral-900">{user.credits} نقطة (التكلفة: 10 نقاط)</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-xl p-6 space-y-5 shadow-2xs">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-700">طريقة إدخال بيانات الإعلان:</label>
            <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-1 rounded-lg border border-neutral-200">
              <button
                type="button"
                onClick={() => setInputMode('url')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-bold transition ${
                  inputMode === 'url' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>تحليل رابط موقع/متجر (URL)</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-bold transition ${
                  inputMode === 'manual' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>إدخال وصف يدوي وصورة</span>
              </button>
            </div>
          </div>

          {inputMode === 'url' && (
            <div className="space-y-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-neutral-900" />
                  <span>رابط المتجر أو صفحة المنتج:</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://salla.sa/store/product-123"
                    className="flex-1 bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 text-xs focus:outline-none focus:border-neutral-900 transition"
                  />
                  <button
                    type="button"
                    onClick={handleAnalyzeUrl}
                    disabled={isAnalyzingUrl || !targetUrl.trim()}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isAnalyzingUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>تحليل (1 نقطة)</span>
                  </button>
                </div>
              </div>

              {urlAnalysis && (
                <div className="bg-white p-3.5 rounded-lg border border-neutral-200 space-y-2.5 text-xs text-neutral-800">
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                      <ShoppingCart className="w-3.5 h-3.5 text-neutral-700" />
                      <span>{urlAnalysis.title}</span>
                    </div>
                    {urlAnalysis.price && (
                      <span className="bg-neutral-100 text-neutral-900 font-bold px-2 py-0.5 rounded text-[11px]">
                        {urlAnalysis.price}
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-600 leading-relaxed text-[11px]">{urlAnalysis.summary}</p>
                </div>
              )}
            </div>
          )}

          {inputMode === 'manual' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-500">عينات منتجات جاهزة للتجربة:</label>
              <div className="grid grid-cols-3 gap-2">
                {sampleProducts.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="flex flex-col items-center gap-1 p-2 bg-neutral-50 border border-neutral-200 hover:border-neutral-400 rounded-lg transition text-center group"
                  >
                    <img src={sample.image} alt="Sample" className="w-10 h-10 rounded object-cover" />
                    <span className="text-[10px] text-neutral-700 font-medium truncate w-full">{sample.name.slice(0, 15)}...</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleGenerateVideo} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-neutral-800">
                  {urlAnalysis ? 'السيناريو الإعلاني المعتمد *' : 'وصف المنتج أو الخدمة *'}
                </label>
                <span className={`text-[11px] font-bold ${product.length > 3000 ? 'text-red-600' : 'text-neutral-400'}`}>
                  {product.length} / 3000
                </span>
              </div>
              <textarea
                rows={4}
                value={product}
                maxLength={3000}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="مثال: ساعة يد ذكية فاخرة، تصميم عصري مقاوم للماء..."
                className="w-full bg-white border border-neutral-200 rounded-lg p-3 text-neutral-900 text-xs focus:outline-none focus:border-neutral-900 transition resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">صورة مرجعية للمنتج (اختياري)</label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 bg-neutral-50 border border-dashed border-neutral-300 hover:border-neutral-500 rounded-lg p-3 cursor-pointer text-neutral-600 transition">
                  {isProcessingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-800" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-neutral-800" />
                      <span className="text-xs">{imageBase64 ? 'تم إرفاق الصورة' : 'رفع صورة للمنتج'}</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isProcessingImage} className="hidden" />
                </label>

                {imageBase64 && (
                  <div className="relative shrink-0">
                    <img src={imageBase64} alt="Preview" className="w-12 h-12 rounded object-cover border border-neutral-300" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-1.5 -right-1.5 bg-neutral-900 text-white rounded-full p-0.5 shadow hover:bg-neutral-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">مقاس الفيديو</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '9:16', label: 'عمودي 9:16', icon: Smartphone },
                  { id: '1:1', label: 'مربع 1:1', icon: Square },
                  { id: '16:9', label: 'أفقي 16:9', icon: Monitor },
                ].map((ar) => {
                  const Icon = ar.icon;
                  const isSelected = aspectRatio === ar.id;
                  return (
                    <button
                      key={ar.id}
                      type="button"
                      onClick={() => setAspectRatio(ar.id)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs font-bold transition ${
                        isSelected ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{ar.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">المدة</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 text-xs focus:outline-none focus:border-neutral-900 transition"
                >
                  <option value="5 ثوانٍ">5 ثوانٍ</option>
                  <option value="10 ثوانٍ">10 ثوانٍ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">الأسلوب الإعلاني</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 text-xs focus:outline-none focus:border-neutral-900 transition"
                >
                  <option value="إعلان تسويقي ديناميكي وعصري">ديناميكي وعصري</option>
                  <option value="تصوير سينمائي فاخر">سينمائي فاخر</option>
                  <option value="حركة ثلاثية الأبعاد لمنتج">رسومات 3D للمنتج</option>
                  <option value="مرح وجذاب لجيل التيك توك">ترند تيك توك</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">التعليق الصوتي</label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 text-xs focus:outline-none focus:border-neutral-900 transition"
                >
                  <option value="تعليق صوتي حماسي ومحفز (Puck)">حماسي ومحفز (Puck)</option>
                  <option value="صوت فخم وهادئ (Kore)">فخم وهادئ (Kore)</option>
                  <option value="صوت تجاري احترافي (Charon)">تجاري احترافي (Charon)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">الموسيقى الخلفية</label>
                <select
                  value={backgroundMusic}
                  onChange={(e) => setBackgroundMusic(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 text-xs focus:outline-none focus:border-neutral-900 transition"
                >
                  <option value="موسيقى تجارية حماسية (Upbeat)">حماسية وإيقاعية</option>
                  <option value="موسيقى سينمائية هادئة ومؤثرة">سينمائية ومؤثرة</option>
                  <option value="إيقاع عصري لترندات تيك توك">ترند تيك توك</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={jobStatus === 'pending' || jobStatus === 'generating' || isProcessingImage || isAnalyzingUrl}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3.5 rounded-lg shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50 text-xs sm:text-sm"
            >
              {jobStatus === 'pending' || jobStatus === 'generating' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{progressStep}</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 text-white" />
                  <span>توليد الفيديو الإعلاني الحقيقي (10 نقاط)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Video Preview Column */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          {jobStatus === 'idle' && !videoResult && (
            <div className="h-full min-h-[450px] bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-900 shadow-2xs">
                <Video className="w-6 h-6 text-neutral-800" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">استوديو توليد الفيديوهات الإعلانية</h3>
              <p className="text-neutral-500 text-xs max-w-sm leading-relaxed">
                أدخل رابط متجرك أو الوصف اليدوي للمنتج، ثم اضغط على "توليد الفيديو الإعلاني" لبدء المعالجة.
              </p>
            </div>
          )}

          {(jobStatus === 'pending' || jobStatus === 'generating') && (
            <div className="h-full min-h-[450px] bg-white border border-neutral-200 rounded-xl flex flex-col items-center justify-center p-8 text-center space-y-5">
              <RefreshCw className="w-8 h-8 text-neutral-900 animate-spin" />
              <div className="space-y-2 w-full max-w-xs">
                <div className="flex justify-between items-center text-xs font-bold text-neutral-700">
                  <span>جاري التوليد...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-neutral-200">
                  <div className="bg-neutral-900 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-neutral-500 text-xs animate-pulse pt-1">{progressStep}</p>
              </div>
            </div>
          )}

          {jobStatus === 'completed' && videoResult && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5 shadow-2xs flex flex-col items-center">
              <div className="w-full flex items-center justify-between border-b border-neutral-100 pb-3">
                <span className="bg-neutral-100 text-neutral-900 px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-neutral-900" />
                  <span>اكتمل التوليد بنجاح</span>
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={videoResult.videoUrl}
                    download="moulin-commercial-ad.mp4"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-900 text-xs font-bold px-3 py-2 rounded-lg transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل (MP4)</span>
                  </a>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
                  >
                    {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{saved ? 'تم الحفظ!' : 'حفظ بالمكتبة'}</span>
                  </button>
                </div>
              </div>

              <div className={`relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900 flex items-center justify-center ${
                aspectRatio === '9:16' ? 'max-h-[480px] aspect-[9/16]' :
                aspectRatio === '1:1' ? 'max-h-[400px] aspect-square' :
                'max-h-[360px] aspect-video w-full'
              }`}>
                <video src={videoResult.videoUrl} controls autoPlay loop playsInline className="w-full h-full object-cover" />
              </div>

              <div className="w-full bg-neutral-50 p-3.5 rounded-lg border border-neutral-200 text-xs text-neutral-800 space-y-1">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-1.5">
                  <span className="font-bold text-neutral-900">عنوان الإعلان:</span>
                  <span className="font-semibold">{videoResult.title}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-neutral-600">
                  <div><b>المقاس:</b> {aspectRatio}</div>
                  <div><b>المدة:</b> {duration}</div>
                  <div><b>اللغة:</b> {language}</div>
                  <div><b>الصوت:</b> {voice}</div>
                </div>
              </div>
            </div>
          )}

          {jobStatus === 'failed' && (
            <div className="h-full min-h-[450px] bg-white border border-neutral-200 rounded-xl flex flex-col items-center justify-center p-8 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-neutral-800" />
              <h3 className="text-base font-bold text-neutral-900">فشلت عملية التوليد</h3>
              <p className="text-neutral-600 text-xs max-w-sm bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                {error || 'حدث خطأ أثناء التوليد. تم إرجاع النقاط تلقائياً.'}
              </p>
              <button
                onClick={() => setJobStatus('idle')}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-5 py-2 rounded-lg text-xs transition"
              >
                حاول مرة أخرى
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
