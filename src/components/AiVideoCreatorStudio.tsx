import React, { useState, useEffect } from 'react';
import { Sparkles, Video, Download, Save, RefreshCw, Check, Upload, Film, Wand2, BookOpen, Compass, Clapperboard, Drama, Ghost, Tv, Palette, Music, Globe, Mic, Coins, X, Loader2, AlertCircle, CheckCircle2, Play, ChevronRight, Layers, ArrowLeft, Type } from 'lucide-react';
import { User } from '../types';
import { processAndNormalizeImage } from '../utils/imageUtils';

interface AiVideoCreatorStudioProps {
  user: User | null;
  token?: string | null;
  setUser?: (user: User) => void;
  onSaveProject: (title: string, type: 'creative_video', content: any, platform: string) => void;
}

export const AiVideoCreatorStudio: React.FC<AiVideoCreatorStudioProps> = ({
  user,
  token,
  setUser,
  onSaveProject,
}) => {
  // Categories
  const categories = [
    { id: 'fantasy', title: 'القصص الخيالية والمغامرات', desc: 'عوالم الفانتازيا، التنانين، السفر عبر الزمن والرحلات الفضائية', icon: Compass, badge: 'Fantasy & Adventure', color: 'from-purple-500 to-indigo-600', defaultStyle: 'فانتازيا وسايبربانك' },
    { id: 'comedy', title: 'الكوميديا والمواقف المضحكة', desc: 'مقاطع ساخرة، مواقف طريفة، وشخصيات كرتونية مضحكة', icon: Wand2, badge: 'Comedy & Shorts', color: 'from-amber-500 to-yellow-600', defaultStyle: 'كرتون ورسوم متحركة 2D' },
    { id: 'history', title: 'القصص التاريخية والحضارات', desc: 'الحضارة الفرعونية، الفرسان، الملوك والأحداث التاريخية الملحمية', icon: BookOpen, badge: 'History & Epic', color: 'from-amber-700 to-orange-800', defaultStyle: 'سينمائي فاخر 8K' },
    { id: 'drama', title: 'الأفلام القصيرة والدراما', desc: 'مشاهد سينمائية، صراعات درامية، وقصص إنسانية مؤلفة', icon: Drama, badge: 'Short Films & Drama', color: 'from-rose-600 to-red-700', defaultStyle: 'سينمائي فاخر 8K' },
    { id: 'mystery', title: 'الغموض والتشويق', desc: 'أفلام الرعب، الجرائم، الألغاز الغامضة والأجواء الموتورة', icon: Ghost, badge: 'Mystery & Thriller', color: 'from-neutral-800 to-neutral-900', defaultStyle: 'سينمائي فاخر 8K' },
    { id: 'educational', title: 'القصص التعليمية والوثائقية', desc: 'شرح العلوم، الطبيعة، الفضاء والمحتوى الوثائقي الإثرائي', icon: Tv, badge: 'Docu & Educational', color: 'from-emerald-600 to-teal-700', defaultStyle: 'واقعي عالي الدقة' },
    { id: 'anime', title: 'الرسوم المتحركة والأنمي', desc: 'أسلوب الجيبلي، الأنمي الياباني، والرسم ثلاثي الأبعاد المميز', icon: Palette, badge: 'Anime & Animation', color: 'from-pink-500 to-rose-600', defaultStyle: 'أنمي ياباني (Studio Ghibli Style)' },
  ];

  // Selected Category
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  // Creation Method ('text' | 'image' | 'idea')
  const [creationMethod, setCreationMethod] = useState<'text' | 'image' | 'idea'>('text');

  // Form Fields
  const [prompt, setPrompt] = useState('');
  const [rawIdea, setRawIdea] = useState('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [duration, setDuration] = useState('10 ثوانٍ');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('720p HD');
  const [style, setStyle] = useState('سينمائي فاخر 8K');
  const [language, setLanguage] = useState('العربية (الفصحى الحديثة)');
  const [voice, setVoice] = useState('تعليق درامي وقصصي عميق (Puck)');
  const [backgroundMusic, setBackgroundMusic] = useState('موسيقى سينمائية ملحمية (Epic Orchestral)');

  // AI Story Expansion State
  const [isExpandingIdea, setIsExpandingIdea] = useState(false);
  const [expandedStory, setExpandedStory] = useState<{
    title: string;
    summary: string;
    scenes: string[];
    narration: string;
    masterPrompt: string;
  } | null>(null);

  // Status & Results
  const [hasApiKey, setHasApiKey] = useState(true);
  const [jobStatus, setJobStatus] = useState<'idle' | 'generating' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('');
  const [videoResult, setVideoResult] = useState<{ videoUrl: string; title: string; details: any } | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Check health on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.hasApiKey === 'boolean') {
          setHasApiKey(data.hasApiKey);
        }
      })
      .catch(() => {});
  }, []);

  // Update style when category changes
  const handleSelectCategory = (cat: typeof categories[0]) => {
    setSelectedCategory(cat);
    if (cat.defaultStyle) {
      setStyle(cat.defaultStyle);
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      setError('');
      try {
        const normalized = await processAndNormalizeImage(file, 2048);
        setImageBase64(normalized);
      } catch (err: any) {
        setError(err.message || 'فشلت عملية فحص وتحويل الصورة');
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  // AI Idea Expander
  const handleExpandIdea = async () => {
    if (!rawIdea.trim() || rawIdea.trim().length < 3) {
      setError('يرجى إدخال فكرة بسيطة أولاً ليقوم الذكاء الاصطناعي بتوسيعها (3 حروف على الأقل)');
      return;
    }

    if (user && user.credits < 1) {
      setError('رصيد النقاط غير كافٍ لتوسيع القصة (تتطلب العملية نقطة واحدة)');
      return;
    }

    setIsExpandingIdea(true);
    setError('');
    try {
      const res = await fetch('/api/ai/expand-story-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'demo-guest-token'}`,
        },
        body: JSON.stringify({
          idea: rawIdea.trim(),
          category: selectedCategory.title,
          style,
        }),
      });

      const data = await res.json();
      if (data.success && data.expansion) {
        setExpandedStory(data.expansion);
        setPrompt(data.expansion.masterPrompt || data.expansion.summary);
        if (data.user && setUser) {
          setUser(data.user);
        }
      } else {
        setError(data.error || 'فشلت عملية تطوير القصة بالذكاء الاصطناعي');
      }
    } catch (err: any) {
      setError('خطأ في الاتصال بالخادم أثناء تطوير القصة');
    } finally {
      setIsExpandingIdea(false);
    }
  };

  // Video Generation Handler
  const handleGenerateCreativeVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    const activePrompt = prompt.trim() || (expandedStory ? expandedStory.masterPrompt : '');

    if (!activePrompt || activePrompt.length < 2) {
      setError('يرجى كتابة وصف المشهد أو القصة أولاً أو استخدام أداة تحويل الفكرة إلى قصة');
      return;
    }

    if (activePrompt.length > 3000) {
      setError('وصف الفيديو يجب ألا يتجاوز 3000 حرف');
      return;
    }

    if (user && user.credits < 10) {
      setError('رصيد النقاط غير كافٍ لتوليد الفيديو الإبداعي (تتطلب العملية 10 نقاط)');
      return;
    }

    setError('');
    setVideoResult(null);
    setSaved(false);
    setJobStatus('generating');
    setProgress(15);
    setProgressStep('تم التحقق من البيانات والرصيد، جارٍ إرسال السيناريو للخادم...');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProgress(40);
      setProgressStep('جاري تشغيل محرك Gemini Omni Flash لبناء كادرات الفيديو والمؤثرات البصرية...');

      const res = await fetch('/api/ai/creative-video-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'demo-guest-token'}`,
        },
        body: JSON.stringify({
          prompt: activePrompt,
          category: selectedCategory.title,
          creationMethod,
          image: imageBase64,
          aspectRatio,
          duration,
          resolution,
          style,
          voice,
          language,
          backgroundMusic,
          expandedScript: expandedStory,
        }),
      });

      const data = await res.json();
      if (data.success && data.project) {
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
        setError(data.error || 'فشلت عملية توليد الفيديو الإبداعي. تم إرجاع النقاط تلقائياً.');
      }
    } catch (err: any) {
      setJobStatus('failed');
      setError('حدث خطأ في الاتصال بالخادم أثناء توليد الفيديو. لم يتم خصم نقاط.');
    }
  };

  const handleSave = () => {
    if (!videoResult) return;
    onSaveProject(videoResult.title, 'creative_video', videoResult, aspectRatio);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      {/* API Key Missing Warning Banner */}
      {!hasApiKey && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800 text-xs sm:text-sm shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
          <span>
            <b>تنبيه مفتاح API:</b> مفتاح <code>GEMINI_API_KEY</code> غير مُضاف في بيئة الخادم. يرجى إضافة المفتاح في الأسرار لتشغيل نماذج Gemini Omni Flash المباشرة.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200 px-3.5 py-1.5 rounded-full text-neutral-800 text-xs font-bold mb-3 shadow-sm">
            <Clapperboard className="w-4 h-4 text-neutral-700" />
            <span>AI VIDEO CREATOR - استوديو الفيديوهات الإبداعية وقصص الذكاء الاصطناعي</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900">صانع الفيديوهات الإبداعية بالذكاء الاصطناعي</h1>
          <p className="text-neutral-600 text-sm mt-1">أنشئ قصصاً خيالية، أفلاماً قصيرة، أنمي، دراما وثائقية وفيديوهات إبداعية احترافية بثوانٍ</p>
        </div>

        {user && (
          <div className="flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2.5 rounded-2xl shadow-sm">
            <Coins className="w-5 h-5 text-neutral-700" />
            <div>
              <p className="text-[10px] text-neutral-500">رصيدك الحالي</p>
              <p className="text-sm font-bold text-neutral-900">{user.credits} نقطة (تكلفة الفيديو: 10 نقاط)</p>
            </div>
          </div>
        )}
      </div>

      {/* Section 1: Categories Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-neutral-700" />
            <span>اختر نوع ونمط الفيديو الإبداعي:</span>
          </h2>
          <span className="text-xs text-neutral-800 font-semibold bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-full">
            {selectedCategory.title}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory.id === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className={`flex flex-col justify-between p-3.5 rounded-2xl border text-right transition-all duration-200 group relative overflow-hidden ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm scale-[1.02]'
                    : 'bg-white border-neutral-200 hover:border-neutral-400 text-neutral-900'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-800'} shadow-sm`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <h3 className={`text-xs font-bold mb-1 transition ${isSelected ? 'text-white' : 'text-neutral-900 group-hover:text-black'}`}>{cat.title}</h3>
                  <p className={`text-[10px] line-clamp-2 leading-tight ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>{cat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Form Column + Preview Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Creation Method Tabs */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700">طريقة إنشاء وتطوير الفيديو:</label>
            <div className="grid grid-cols-3 gap-2 bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200">
              <button
                type="button"
                onClick={() => setCreationMethod('text')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  creationMethod === 'text'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>وصف نصي</span>
              </button>

              <button
                type="button"
                onClick={() => setCreationMethod('image')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  creationMethod === 'image'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>نص + صورة مرجعية</span>
              </button>

              <button
                type="button"
                onClick={() => setCreationMethod('idea')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  creationMethod === 'idea'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-700 hover:text-neutral-900'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-500" />
                <span>تطوير فكرة إلى قصة</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleGenerateCreativeVideo} className="space-y-6">
            {/* Method 1 & 2: Direct Text Prompt */}
            {(creationMethod === 'text' || creationMethod === 'image') && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-neutral-800">
                    وصف المشهد أو القصة الإبداعية *
                  </label>
                  <span className={`text-[11px] font-bold ${prompt.length > 3000 ? 'text-red-500' : 'text-neutral-500'}`}>
                    {prompt.length} / 3000 حرف
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={prompt}
                  maxLength={3000}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`اكتب وصفاً سينمائياً مفصلاً لمشهد ${selectedCategory.title}... مثال: سفينة فضائية هائلة تعبر ثقباً دودياً متلألئاً نحو كوكب مأهول بالغابات الكريستالية...`}
                  className="w-full bg-white border border-neutral-200 rounded-2xl p-4 text-neutral-900 text-sm focus:outline-none focus:border-neutral-400 transition resize-none"
                  required
                />
              </div>
            )}

            {/* Method 2: Image Reference */}
            {creationMethod === 'image' && (
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  رفع صورة مرجعية للشخصية أو المشهد (JPG, PNG, WEBP, HEIC)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 bg-neutral-50 border border-dashed border-neutral-300 hover:border-neutral-500 rounded-2xl p-4 cursor-pointer text-neutral-600 hover:text-neutral-900 transition">
                    {isProcessingImage ? (
                      <>
                        <Loader2 className="w-5 h-5 text-neutral-700 animate-spin" />
                        <span className="text-xs text-neutral-700">جاري تدقيق وتحويل الصورة...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-neutral-700" />
                        <span className="text-xs">{imageBase64 ? 'تم إرفاق الصورة المرجعية بنجاح' : 'اختر صورة من جهازك كمرجع بصرّي'}</span>
                      </>
                    )}
                    <input type="file" accept="image/*,.heic,.heif" onChange={handleImageUpload} disabled={isProcessingImage} className="hidden" />
                  </label>

                  {imageBase64 && (
                    <div className="relative group shrink-0">
                      <img src={imageBase64} alt="Reference Preview" className="w-14 h-14 rounded-xl object-cover border border-neutral-300" />
                      <button
                        type="button"
                        onClick={() => setImageBase64('')}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition"
                        title="إزالة الصورة"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Method 3: Idea to Script Expander */}
            {creationMethod === 'idea' && (
              <div className="space-y-4 bg-neutral-50 p-5 rounded-2xl border border-neutral-200">
                <div>
                  <label className="block text-sm font-bold text-neutral-800 mb-2 flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-amber-500" />
                    <span>اكتب فكرة بسيطة وسيقوم الذكاء الاصطناعي بتوليد السيناريو والمشاهد:</span>
                  </label>
                  <textarea
                    rows={3}
                    value={rawIdea}
                    onChange={(e) => setRawIdea(e.target.value)}
                    placeholder="مثال: رائد فضاء هبط على قمر مهجور ووجد زهرة ذهبية تتحدث بأسلوبه..."
                    className="w-full bg-white border border-neutral-200 rounded-xl p-3.5 text-neutral-900 text-xs focus:outline-none focus:border-neutral-400 transition resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExpandIdea}
                  disabled={isExpandingIdea || !rawIdea.trim()}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition text-xs disabled:opacity-50"
                >
                  {isExpandingIdea ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>جاري كتابة القصة والسيناريو والمشاهد بالمساعد الذكي...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-amber-400" />
                      <span>توليد السيناريو والقصة بالذكاء الاصطناعي (تكلفة 1 نقطة)</span>
                    </>
                  )}
                </button>

                {expandedStory && (
                  <div className="mt-4 p-4 bg-white border border-neutral-200 rounded-xl space-y-3 text-xs text-neutral-800 shadow-sm">
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                      <span className="font-bold text-neutral-900 text-sm">🎬 {expandedStory.title}</span>
                      <span className="text-[10px] bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-full font-semibold">سيناريو جاهز</span>
                    </div>

                    <p className="text-neutral-700 leading-relaxed font-medium">{expandedStory.summary}</p>

                    {expandedStory.scenes && expandedStory.scenes.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="font-bold text-neutral-700 text-[11px]">تسلسل المشاهد والكادرات:</p>
                        <ul className="space-y-1 text-[11px] text-neutral-600 list-disc list-inside">
                          {expandedStory.scenes.map((sc, i) => (
                            <li key={i}>{sc}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 text-[11px]">
                      <b className="text-neutral-900">الوصف الموجه للتوليد:</b> {expandedStory.masterPrompt}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Video Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Visual Style */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">الأسلوب البصري والفني</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-neutral-900 text-xs focus:outline-none focus:border-neutral-400 transition"
                >
                  <option value="سينمائي فاخر 8K">🎬 سينمائي فاخر (Cinematic 8K)</option>
                  <option value="أنمي ياباني (Studio Ghibli Style)">🎌 أنمي ياباني (Anime Style)</option>
                  <option value="ثلاثي الأبعاد 3D (Pixar Style)">🧊 ثلاثي الأبعاد 3D (Pixar Style)</option>
                  <option value="واقعي عالي الدقة">📸 واقعي عالي الدقة (Photorealistic)</option>
                  <option value="كرتون ورسوم متحركة 2D">🎨 كرتون ورسوم متحركة 2D</option>
                  <option value="فن كلاسيكي وزيتي">🖼️ فن كلاسيكي وزيتي (Classic Oil Art)</option>
                  <option value="فانتازيا وسايبربانك">🌌 فانتازيا وسايبربانك (Dark Fantasy)</option>
                </select>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">أبعاد ومقاس الفيديو</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '16:9', label: '16:9 (يوتيوب)' },
                    { id: '9:16', label: '9:16 (تيك توك)' },
                    { id: '1:1', label: '1:1 (مربع)' },
                  ].map((ar) => (
                    <button
                      key={ar.id}
                      type="button"
                      onClick={() => setAspectRatio(ar.id)}
                      className={`py-2 rounded-xl text-[11px] font-bold border transition ${
                        aspectRatio === ar.id
                          ? 'bg-neutral-900 border-neutral-900 text-white'
                          : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {ar.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Duration & Resolution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">مدة الفيديو</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-neutral-900 text-xs focus:outline-none focus:border-neutral-400 transition"
                >
                  <option value="5 ثوانٍ">5 ثوانٍ (5s)</option>
                  <option value="10 ثوانٍ">10 ثوانٍ (10s)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">جودة الفيديو</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-neutral-900 text-xs focus:outline-none focus:border-neutral-400 transition"
                >
                  <option value="720p HD">720p HD (عالية الدقة)</option>
                  <option value="1080p Ultra HD">1080p Ultra HD (فائقة الدقة)</option>
                </select>
              </div>
            </div>

            {/* Voice & Music */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">التعليق الصوتي والنبرة</label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-neutral-900 text-xs focus:outline-none focus:border-neutral-400 transition"
                >
                  <option value="تعليق درامي وقصصي عميق (Puck)">درامي وقصصي (Puck)</option>
                  <option value="صوت فخم ووثائقي (Kore)">فخم ووثائقي (Kore)</option>
                  <option value="حماسي ومغامرات (Charon)">حماسي ومغامرات (Charon)</option>
                  <option value="بدون تعليق صوتي">بدون تعليق صوتي</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">الموسيقى والمؤثرات</label>
                <select
                  value={backgroundMusic}
                  onChange={(e) => setBackgroundMusic(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-neutral-900 text-xs focus:outline-none focus:border-neutral-400 transition"
                >
                  <option value="موسيقى سينمائية ملحمية (Epic Orchestral)">ملحمية وسينمائية</option>
                  <option value="موسيقى درامية ومؤثرة">درامية ومؤثرة</option>
                  <option value="إيقاع مرح وكوميدي">مرح وكوميدي</option>
                  <option value="أجواء غامضة وتأملية">غامضة وتأملية</option>
                  <option value="بدون موسيقى">بدون موسيقى</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-xs font-bold bg-red-50 p-3.5 rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={jobStatus === 'generating' || isProcessingImage || isExpandingIdea}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-4 rounded-2xl shadow-sm flex items-center justify-center gap-3 transition disabled:opacity-50 text-sm"
            >
              {jobStatus === 'generating' ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{progressStep}</span>
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  <span>توليد الفيديو الإبداعي الحقيقي (تكلفة 10 نقاط)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Video Preview & Status Column */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          {jobStatus === 'idle' && !videoResult && (
            <div className="h-full min-h-[480px] bg-white border border-neutral-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-sm">
              <div className="w-20 h-20 rounded-3xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 shadow-inner">
                <Film className="w-10 h-10 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">استوديو صانع الفيديوهات الإبداعية</h3>
              <p className="text-neutral-500 text-sm max-w-md leading-relaxed">
                اختر نوع الفيديو، ادخل الوصف أو استخدم أداة "تطوير الفكرة لقصة"، ثم اضغط على زر التوليد لمشاهدة الفيديو الناتج بوضوح عالي.
              </p>
            </div>
          )}

          {jobStatus === 'generating' && (
            <div className="h-full min-h-[480px] bg-white border border-neutral-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-6 shadow-sm">
              <div className="w-20 h-20 rounded-3xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 animate-spin shadow-inner">
                <RefreshCw className="w-10 h-10" />
              </div>
              <div className="space-y-3 w-full max-w-md">
                <div className="flex justify-between items-center text-xs font-bold text-neutral-700">
                  <span className="capitalize text-neutral-900">جارٍ التوليد (Gemini Omni Flash)...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden border border-neutral-200">
                  <div className="bg-neutral-900 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-neutral-600 text-xs font-medium animate-pulse pt-2">{progressStep}</p>
              </div>
            </div>
          )}

          {jobStatus === 'completed' && videoResult && (
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm flex flex-col items-center">
              <div className="w-full flex items-center justify-between">
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>اكتمل توليد الفيديو الإبداعي بنجاح</span>
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={videoResult.videoUrl}
                    download="molan-creative-story.mp4"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
                  >
                    <Download className="w-4 h-4 text-neutral-600" />
                    <span>تحميل (MP4)</span>
                  </a>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition"
                  >
                    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    <span>{saved ? 'تم الحفظ!' : 'حفظ في مكتبتي'}</span>
                  </button>
                </div>
              </div>

              {/* Video Player */}
              <div
                className={`relative rounded-2xl overflow-hidden border border-neutral-200 shadow-md bg-black flex items-center justify-center ${
                  aspectRatio === '9:16'
                    ? 'max-h-[480px] aspect-[9/16]'
                    : aspectRatio === '1:1'
                    ? 'max-h-[420px] aspect-square'
                    : 'max-h-[360px] aspect-video w-full'
                }`}
              >
                <video src={videoResult.videoUrl} controls autoPlay loop playsInline className="w-full h-full object-cover" />
              </div>

              {/* Details box */}
              <div className="w-full bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-xs text-neutral-700 space-y-2">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                  <span className="font-bold text-neutral-900">عنوان القصة:</span>
                  <span className="text-neutral-900 font-semibold">{videoResult.title}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div><b>النوع:</b> {selectedCategory.title}</div>
                  <div><b>الأسلوب:</b> {style}</div>
                  <div><b>المقاس:</b> {aspectRatio}</div>
                  <div><b>المدة:</b> {duration}</div>
                </div>
              </div>
            </div>
          )}

          {jobStatus === 'failed' && (
            <div className="h-full min-h-[480px] bg-red-50 border border-red-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-sm">
              <div className="w-20 h-20 rounded-3xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shadow-inner">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">فشلت عملية توليد الفيديو الإبداعي</h3>
              <p className="text-red-700 text-sm max-w-md bg-white p-4 rounded-2xl border border-red-200 leading-relaxed">
                {error || 'حدث خطأ غير متوقع أثناء توليد الفيديو. تم استرجاع نقاطك تلقائياً دون خصم.'}
              </p>
              <button
                onClick={() => setJobStatus('idle')}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-sm"
              >
                محاولة مرة أخرى
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
