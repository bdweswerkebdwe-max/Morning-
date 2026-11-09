import React, { useState, useEffect } from 'react';
import { Sparkles, Video, Download, Save, RefreshCw, Check, Upload, Play, Film, Globe, Mic, Layers, Smartphone, Monitor, Square, AlertCircle, Clock, CheckCircle2, Coins, X, Loader2, Link, Search, ArrowRight, Edit3, Image as ImageIcon, ExternalLink, ShoppingCart, Tag } from 'lucide-react';
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
  // Input Mode: 'url' (URL TO AD) | 'manual' (وصف يدوي)
  const [inputMode, setInputMode] = useState<'url' | 'manual'>(initialInputMode || 'url');

  useEffect(() => {
    if (initialInputMode) {
      setInputMode(initialInputMode);
    }
  }, [initialInputMode]);

  // URL TO AD state
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

  // General Form state
  const [product, setProduct] = useState('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [duration, setDuration] = useState('10 ثوانٍ');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [style, setStyle] = useState('إعلان تسويقي ديناميكي وعصري');
  const [language, setLanguage] = useState('العربية (الفصحى الحديثة)');
  const [voice, setVoice] = useState('تعليق صوتي حماسي ومحفز (Puck)');
  const [backgroundMusic, setBackgroundMusic] = useState('موسيقى تجارية حماسية (Upbeat Commercial)');

  // Job & Results state
  const [hasApiKey, setHasApiKey] = useState(true);
  const [jobStatus, setJobStatus] = useState<'idle' | 'pending' | 'generating' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('');
  const [videoResult, setVideoResult] = useState<{ videoUrl: string; title: string; details: any } | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Check server API key status on mount
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

  // URL Analysis Handler
  const handleAnalyzeUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedUrl = targetUrl.trim();
    if (!trimmedUrl || (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://'))) {
      setError('يرجى إدخال رابط صحيح يبدأ بـ http:// أو https:// (مثال: متجر إلكتروني، صفحة منتج، أو تطبيق)');
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
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setUrlAnalysis(data.analysis);
        // Pre-fill the product text area with AI synthesized commercial prompt
        setProduct(data.analysis.fullAnalysis || data.analysis.summary);
        if (data.analysis.images && data.analysis.images.length > 0) {
          setImageBase64(data.analysis.images[0]);
        }
        if (data.user && setUser) {
          setUser(data.user);
        }
      } else {
        setError(data.error || 'تعذر جلب وتحليل الرابط. يمكنك الانتقال إلى الخيار اليدوي أدناه لإدخال بيانات المنتج والصورة مباشرة.');
      }
    } catch (err: any) {
      setError('فشل الاتصال بالخادم أثناء فحص الرابط. يمكنك استخدام الخيار اليدوي لإدخال الوصف والصورة.');
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
      setError('رصيد النقاط غير كافي لتوليد الفيديو (تتطلب العملية 10 نقاط). يرجى ترقية باقتك.');
      return;
    }

    setError('');
    setVideoResult(null);
    setSaved(false);
    setJobStatus('pending');
    setProgress(15);
    setProgressStep('تم التحقق من الرصيد والبيانات، جارٍ إرسال الصورة والطلب للخادم...');

    try {
      await new Promise(r => setTimeout(r, 600));
      setJobStatus('generating');
      setProgress(40);
      setProgressStep('جاري الاتصال بخدمة Gemini Omni Flash لتوليد الفيديو الحقيقي...');

      const res = await fetch('/api/ai/video-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    } catch (err: any) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8" dir="rtl">
      {/* API Key missing warning banner */}
      {!hasApiKey && (
        <div className="bg-amber-950/60 border border-amber-500/40 rounded-2xl p-4 flex items-center gap-3 text-amber-300 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
          <span>
            <b>تنبيه مفتاح API:</b> مفتاح <code>GEMINI_API_KEY</code> غير مُضاف في بيئة الخادم. أضف المفتاح لتوليد فيديوهات حقيقية عبر السحاب.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 px-3.5 py-1.5 rounded-full text-amber-300 text-xs font-bold mb-3 shadow-lg shadow-amber-500/10">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>استوديو توليد الفيديوهات الإعلانية الحقيقية + ميزة URL TO AD</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">منصة معلن الاحترافية (Video Ad Studio)</h1>
          <p className="text-slate-400 text-sm mt-1">أنشئ فيديوهات إعلانية تجارية من روابط المتاجر والتطبيقات أو بالوصف اليدوي بدقائق</p>
        </div>

        {user && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-lg">
            <Coins className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-[10px] text-slate-400">رصيدك الحالي</p>
              <p className="text-sm font-bold text-white">{user.credits} نقطة (تكلفة الفيديو: 10 نقاط)</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Input Mode Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">اختر طريقة إدخال بيانات الإعلان:</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setInputMode('url')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition ${
                  inputMode === 'url'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Link className="w-4 h-4 text-amber-400" />
                <span>تحليل رابط موقع/متجر (URL TO AD)</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition ${
                  inputMode === 'manual'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-4 h-4 text-orange-400" />
                <span>إدخال وصف يدوي وصورة</span>
              </button>
            </div>
          </div>

          {/* Mode 1: URL TO AD */}
          {inputMode === 'url' && (
            <div className="space-y-5 bg-slate-950/80 p-5 rounded-2xl border border-amber-500/30 shadow-xl">
              <div>
                <label className="block text-sm font-bold text-amber-300 mb-2 flex items-center gap-2">
                  <Link className="w-4 h-4 text-amber-400" />
                  <span>أدخل رابط المتجر الإلكتروني أو صفحة المنتج أو التطبيق:</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://salla.sa/store/product-123 أو https://amazon.sa/dp/..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-500 transition"
                  />
                  <button
                    type="button"
                    onClick={handleAnalyzeUrl}
                    disabled={isAnalyzingUrl || !targetUrl.trim()}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-amber-600/30 transition text-xs shrink-0 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isAnalyzingUrl ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري التحليل...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>تحليل بالذكاء الاصطناعي (1 نقطة)</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  يدعم: سلة، زد، أمازون، نون، متجر الآب ستور وجوجل بلاي، المواقع الإلكترونية والشركات والخدمات.
                </p>
              </div>

              {/* URL Analysis Insights Card */}
              {urlAnalysis && (
                <div className="bg-slate-900 p-4 rounded-xl border border-amber-500/40 space-y-3 text-xs text-slate-200">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-white text-sm">{urlAnalysis.title}</span>
                    </div>
                    {urlAnalysis.price && (
                      <span className="bg-emerald-950 text-emerald-300 font-bold px-2.5 py-1 rounded-lg border border-emerald-800 text-[11px]">
                        {urlAnalysis.price}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-300 leading-relaxed font-medium">{urlAnalysis.summary}</p>

                  {/* Image Selector from Extracted Images */}
                  {urlAnalysis.images && urlAnalysis.images.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="font-bold text-slate-400 text-[11px] flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>اختر الصورة المستخرجة من الصفحة لاستخدامها كمرجع للإعلان:</span>
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {urlAnalysis.images.map((imgUrl, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setImageBase64(imgUrl)}
                            className={`relative rounded-lg overflow-hidden border shrink-0 transition ${
                              imageBase64 === imgUrl ? 'border-amber-500 ring-2 ring-amber-500/50' : 'border-slate-800 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={imgUrl} alt={`Extracted ${i}`} className="w-14 h-14 object-cover" />
                            {imageBase64 === imgUrl && (
                              <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white drop-shadow" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
                    <b className="text-amber-400">السيناريو الإعلاني المقترح:</b>
                    <p className="text-slate-300 mt-1 whitespace-pre-line">{urlAnalysis.fullAnalysis}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Manual Input & Sample Quick Select */}
          {inputMode === 'manual' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400">اختر عينة منتج جاهزة للتجربة السريعة:</label>
              <div className="grid grid-cols-3 gap-2">
                {sampleProducts.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="flex flex-col items-center gap-1.5 p-2 bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 rounded-xl transition text-center group"
                  >
                    <img src={sample.image} alt="Sample" className="w-12 h-12 rounded-lg object-cover group-hover:scale-105 transition" />
                    <span className="text-[10px] text-slate-300 font-medium truncate w-full">{sample.name.slice(0, 15)}...</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form for Video Generation */}
          <form onSubmit={handleGenerateVideo} className="space-y-6">
            {/* Product description / Script Review Area */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-200">
                  {urlAnalysis ? 'تعديل أو مراجعة السيناريو الإعلاني المعتمد *' : 'وصف المنتج أو الخدمة الإعلانية *'}
                </label>
                <span className={`text-[11px] font-bold ${product.length > 3000 ? 'text-red-400' : 'text-slate-500'}`}>
                  {product.length} / 3000 حرف
                </span>
              </div>
              <textarea
                rows={4}
                value={product}
                maxLength={3000}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="مثال: ساعة يد ذكية فاخرة، تصميم عصري مقاوم للماء، إشعار بالرسائل والمكالمات..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-amber-500 transition resize-none"
                required
              />
            </div>

            {/* Image upload with Smart Canvas & HEIC/JPG Normalization */}
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2">
                صورة المنتج الإعلاني (يدعم JPG, PNG, WEBP, GIF, HEIC من الجوال)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 flex items-center justify-center gap-2 bg-slate-950 border border-dashed border-slate-700 hover:border-amber-500 rounded-2xl p-4 cursor-pointer text-slate-400 hover:text-white transition">
                  {isProcessingImage ? (
                    <>
                      <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                      <span className="text-xs text-amber-400">جاري تدقيق وتحويل صيغة الصورة...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-amber-400" />
                      <span className="text-xs">{imageBase64 ? 'تم إرفاق وتدقيق الصورة بنجاح' : 'اختر صورة المنتج أو استخرجها من الرابط'}</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={handleImageUpload}
                    disabled={isProcessingImage}
                    className="hidden"
                  />
                </label>

                {imageBase64 && (
                  <div className="relative group shrink-0">
                    <img src={imageBase64} alt="Product preview" className="w-14 h-14 rounded-xl object-cover border border-amber-500/40" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition"
                      title="إزالة الصورة"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2">مقاس وأبعاد الفيديو</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: '9:16', label: 'عمودي 9:16 (TikTok)', icon: Smartphone },
                  { id: '1:1', label: 'مربع 1:1 (Instagram)', icon: Square },
                  { id: '16:9', label: 'أفقي 16:9 (YouTube)', icon: Monitor },
                ].map((ar) => {
                  const Icon = ar.icon;
                  const isSelected = aspectRatio === ar.id;
                  return (
                    <button
                      key={ar.id}
                      type="button"
                      onClick={() => setAspectRatio(ar.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-xs font-bold transition ${
                        isSelected
                          ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-md shadow-amber-600/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{ar.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration & Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-200 mb-2">مدة الفيديو المدعومة</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition"
                >
                  <option value="5 ثوانٍ">5 ثوانٍ (5s)</option>
                  <option value="10 ثوانٍ">10 ثوانٍ (10s)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-200 mb-2">الأسلوب الإعلاني</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition"
                >
                  <option value="إعلان تسويقي ديناميكي وعصري">ديناميكي وعصري</option>
                  <option value="تصوير سينمائي فاخر">سينمائي فاخر (Cinematic)</option>
                  <option value="حركة ثلاثية الأبعاد لمنتج">رسومات 3D للمنتج</option>
                  <option value="مرح وجذاب لجيل التيك توك">تيك توك ترند</option>
                </select>
              </div>
            </div>

            {/* Voice & Music */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-200 mb-2">التعليق الصوتي</label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition"
                >
                  <option value="تعليق صوتي حماسي ومحفز (Puck)">حماسي ومحفز (Puck)</option>
                  <option value="صوت فخم وهادئ (Kore)">فخم وهادئ (Kore)</option>
                  <option value="صوت تجاري احترافي (Charon)">تجاري احترافي (Charon)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-200 mb-2">الموسيقى الخلفية</label>
                <select
                  value={backgroundMusic}
                  onChange={(e) => setBackgroundMusic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition"
                >
                  <option value="موسيقى تجارية حماسية (Upbeat)">حماسية وإيقاعية</option>
                  <option value="موسيقى سينمائية هادئة ومؤثرة">سينمائية ومؤثرة</option>
                  <option value="إيقاع عصري لترندات تيك توك">ترند تيك توك العصري</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="space-y-2">
                <p className="text-red-400 text-xs font-bold bg-red-950/40 p-3.5 rounded-xl border border-red-900/50 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </p>
                {/* 1-Click Fallback Button if URL analysis failed */}
                {inputMode === 'url' && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('manual');
                      setError('');
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                    <span>الانتقال لإدخال البيانات وصورة المنتج يدوياً بدلاً من الرابط</span>
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={jobStatus === 'pending' || jobStatus === 'generating' || isProcessingImage || isAnalyzingUrl}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-amber-600/30 flex items-center justify-center gap-3 transition disabled:opacity-50"
            >
              {jobStatus === 'pending' || jobStatus === 'generating' ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{progressStep}</span>
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  <span>توليد الفيديو الإعلاني الحقيقي (تكلفة 10 نقاط)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Video Preview & Job Status Column */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          {jobStatus === 'idle' && !videoResult && (
            <div className="h-full min-h-[500px] bg-slate-900/40 border border-slate-800/80 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Film className="w-10 h-10 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-white">استوديو توليد الفيديوهات الإعلانية</h3>
              <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                أدخل رابط متجرك أو اكتب وصف المنتج يدوياً واضغط على "توليد الفيديو الإعلاني" لبدء العمل واستعراض الفيديو الناتج بوضوح عالي.
              </p>
            </div>
          )}

          {(jobStatus === 'pending' || jobStatus === 'generating') && (
            <div className="h-full min-h-[500px] bg-slate-900/80 border border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 animate-spin shadow-2xl">
                <RefreshCw className="w-10 h-10" />
              </div>
              <div className="space-y-3 w-full max-w-md">
                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span className="capitalize text-amber-400">حالة المهمة: {jobStatus === 'pending' ? 'قيد الانتظار (Pending)' : 'جارٍ التوليد (Generating)...'}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-slate-300 text-xs font-medium animate-pulse pt-2">{progressStep}</p>
              </div>
            </div>
          )}

          {jobStatus === 'completed' && videoResult && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between">
                <span className="bg-emerald-950/80 border border-emerald-800/50 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>اكتمل التوليد بنجاح (Completed)</span>
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={videoResult.videoUrl}
                    download="moulin-commercial-ad.mp4"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow"
                  >
                    <Download className="w-4 h-4 text-slate-300" />
                    <span>تحميل الفيديو (MP4)</span>
                  </a>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-600/30 transition"
                  >
                    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    <span>{saved ? 'تم الحفظ!' : 'حفظ في مكتبتي'}</span>
                  </button>
                </div>
              </div>

              {/* Video Player */}
              <div className={`relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 flex items-center justify-center ${
                aspectRatio === '9:16' ? 'max-h-[500px] aspect-[9/16]' :
                aspectRatio === '1:1' ? 'max-h-[420px] aspect-square' :
                'max-h-[380px] aspect-video w-full'
              }`}>
                <video
                  src={videoResult.videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details box */}
              <div className="w-full bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-300 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-amber-400">عنوان الإعلان:</span>
                  <span className="text-white font-semibold">{videoResult.title}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div><b>المقاس:</b> {aspectRatio}</div>
                  <div><b>المدة:</b> {duration}</div>
                  <div><b>اللغة:</b> {language}</div>
                  <div><b>الصوت:</b> {voice}</div>
                </div>
              </div>
            </div>
          )}

          {jobStatus === 'failed' && (
            <div className="h-full min-h-[500px] bg-red-950/20 border border-red-900/40 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-inner">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white">فشلت عملية توليد الفيديو</h3>
              <p className="text-red-300 text-sm max-w-md bg-red-950/60 p-4 rounded-2xl border border-red-900/50">
                {error || 'حدث خطأ غير متوقع أثناء الاتصال بخدمة توليد الفيديو. تم استرجاع نقاطك تلقائياً.'}
              </p>
              <button
                onClick={() => setJobStatus('idle')}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition"
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
