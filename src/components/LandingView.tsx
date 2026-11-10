import React, { useState } from 'react';
import {
  Sparkles,
  Video,
  Clapperboard,
  Image as ImageIcon,
  ShoppingBag,
  Link as LinkIcon,
  Type,
  Edit3,
  Languages,
  Bot,
  Layers,
  ArrowLeft,
  Play,
  Check,
  Zap,
  Coins,
  ChevronDown,
} from 'lucide-react';
import { User, Project } from '../types';

interface LandingViewProps {
  user: User | null;
  projects: Project[];
  setActiveTab: (tab: string, subMode?: 'url' | 'manual') => void;
  onOpenLogin: () => void;
  onOpenPricing: () => void;
  onOpenHelp: () => void;
  lang?: 'ar' | 'en';
}

export const LandingView: React.FC<LandingViewProps> = ({
  user,
  setActiveTab,
  onOpenLogin,
  onOpenPricing,
  lang = 'ar',
}) => {
  const isRtl = lang === 'ar';

  const [showcaseCategory, setShowcaseCategory] = useState<'all' | 'video_ad' | 'creative' | 'image' | 'url_to_ad'>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  const showcaseItems = [
    {
      id: 'showcase_1',
      category: 'url_to_ad',
      title: isRtl ? 'إعلان عطر فاخر - تحويل رابط منتج' : 'Luxury Perfume - URL to Ad',
      desc: isRtl ? 'تم تحليله تلقائيًا من رابط متجر إلكتروني وصياغة سيناريو إعلاني' : 'Analyzed directly from product URL with 10s video prompt',
      thumbnail: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
      badge: isRtl ? 'تحويل رابط' : 'URL to Ad',
      aspectRatio: '9:16',
      views: '45.2K',
      script: isRtl ? 'اكتشف عبير العود الملكي مع خصم حصري 20% لفترة محدودة. اطلب الآن!' : 'Discover Royal Oud fragrance with 20% discount. Order now!',
      targetTab: 'video',
      subMode: 'url' as const,
    },
    {
      id: 'showcase_2',
      category: 'creative',
      title: isRtl ? 'قصة مغامرة خيالية - أنمي' : 'Sci-Fi Adventure Story - Anime',
      desc: isRtl ? 'سيناريو سينمائي وتوليد مشاهد خيالية متسلسلة أوتوماتيكيًا' : 'Cinematic sci-fi script & multi-scene AI video generation',
      thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
      badge: isRtl ? 'قصة إبداعية' : 'Story Film',
      aspectRatio: '16:9',
      views: '88.9K',
      script: isRtl ? 'في أعماق عام 2099، تبدأ الرحلة الشجاعة للبحث عن النجم الضائع...' : 'In 2099, the heroic journey begins to locate the lost star...',
      targetTab: 'video_creator',
    },
    {
      id: 'showcase_3',
      category: 'video_ad',
      title: isRtl ? 'إعلان تطبيق توصيل وتجارة' : 'Delivery App Commercial Ad',
      desc: isRtl ? 'خطاف إعلاني قوي وممثل افتراضي خليجي بزي رسمي' : 'High-converting hook with licensed AI avatar',
      thumbnail: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80',
      badge: isRtl ? 'إعلان تجاري' : 'Video Ad',
      aspectRatio: '9:16',
      views: '120.4K',
      script: isRtl ? 'تعبت من تأخير الطلبات؟ تطبيق السريع يوصل شحنتك خلال 30 دقيقة!' : 'Tired of delivery delays? Express App delivers in 30 minutes!',
      targetTab: 'video',
      subMode: 'manual' as const,
    },
    {
      id: 'showcase_4',
      category: 'image',
      title: isRtl ? 'بوستر إعلاني لساعة ذكية 4K' : 'Smartwatch 4K Poster Render',
      desc: isRtl ? 'تصوير منتج ثلاثي الأبعاد وإضاءة استوديو احترافية' : '3D product photoshoot with commercial studio lighting',
      thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      badge: isRtl ? 'استوديو الصور' : '4K Visual',
      aspectRatio: '1:1',
      views: '34.1K',
      script: isRtl ? 'تصميم بصرية فائقة الدقة لشبكات التواصل الاجتماعي' : 'Ultra-high resolution social media ad creative',
      targetTab: 'image',
    },
  ];

  const filteredShowcase = showcaseCategory === 'all'
    ? showcaseItems
    : showcaseItems.filter(item => item.category === showcaseCategory);

  const faqs = [
    {
      q: isRtl ? 'كيف تقوم منصة MOLAN AI بتوليد الفيديوهات والصور الإعلانية؟' : 'How does MOLAN AI generate video & visual ads?',
      a: isRtl
        ? 'تعتمد المنصة على محركات الذكاء الاصطناعي وخوادم Google Gemini المتقدمة لإنشاء الفيديوهات، صياغة السيناريوهات الإعلانية، وتصوير المنتجات بدقة في ثوانٍ.'
        : 'MOLAN AI uses Google Gemini API and advanced video interaction models to turn text prompts or product URLs into video ads, studio renders, and marketing scripts.',
    },
    {
      q: isRtl ? 'كيف تعمل ميزة تحويل الرابط إلى إعلان (URL to Ad)؟' : 'How does the URL to Ad feature work?',
      a: isRtl
        ? 'تقوم المنصة بمسح وتنسيق محتوى رابط أي متجر إلكتروني أو صفحة منتج، واستخراج البيانات، ثم تحويلها إلى سيناريو وفيديو إعلاني جاهز للنشر.'
        : 'The server safely scrapes public metadata from any product URL, and Gemini AI converts it into an optimized ad script & video.',
    },
    {
      q: isRtl ? 'هل الفيديوهات والصور المولدة مرخصة للاستخدام التجاري؟' : 'Are generated videos & photos licensed for commercial use?',
      a: isRtl
        ? 'نعم، جميع الفيديوهات والصور والسيناريوهات الناتجة ملك لك بالكامل ومتاحة للاستخدام التجاري على كافة المنصات للحملات الإعلانية.'
        : 'Yes, all outputs, video clips, and generated scripts are 100% royalty-free for commercial advertising.',
    },
    {
      q: isRtl ? 'كيف يعمل نظام النقاط؟' : 'How does the credit system work?',
      a: isRtl
        ? 'تمنح المنصة 50 نقطة مجانية فور التسجيل. تحليل الروابط يتطلب 1 نقطة، بينما يتطلب توليد الفيديو الاحترافي 10 نقاط. والخصم الذري يتم عند نجاح التوليد فقط.'
        : 'New users get 50 free credits. URL analysis costs 1 credit, while video generation uses 10 credits. Credits are deducted atomically upon successful generation.',
    },
  ];

  return (
    <div className="space-y-20 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white text-neutral-900" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. HERO SECTION */}
      <section className="text-center space-y-6 pt-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
          <span>{isRtl ? 'منصة معلن MOLAN AI · استوديو توليد الفيديوهات الإعلانية بالذكاء الاصطناعي' : 'MOLAN AI · Minimalist Commercial AI Video Studio'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-neutral-900 tracking-tight leading-[1.15]">
          {isRtl ? (
            <>اصنع <span className="underline decoration-neutral-300 underline-offset-8">فيديوهات وإعلانات تجارية</span> بالذكاء الاصطناعي بدقائق</>
          ) : (
            <>Create High-Converting <span className="underline decoration-neutral-300 underline-offset-8">AI Video Ads</span> in Seconds</>
          )}
        </h1>

        <p className="text-base sm:text-lg text-neutral-500 font-medium max-w-2xl mx-auto leading-relaxed">
          {isRtl
            ? 'صمّم فيديوهات تسويقية، قصصاً إبداعية، صور منتجات 4K، وسيناريوهات إعلانية عالية التحويل، أو حوّل أي رابط منتج إلى فيديو إعلاني احترافي بضغطة زر.'
            : 'Generate commercial video ads, creative story films, 4K product renders, or convert any product URL into a high-converting video ad.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              if (user) {
                setActiveTab('video', 'url');
              } else {
                onOpenLogin();
              }
            }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-xs"
          >
            <Zap className="w-4 h-4 text-white fill-white" />
            <span>{isRtl ? 'ابدأ التوليد مجانًا (50 نقطة)' : 'Start Free (50 Credits)'}</span>
            <ArrowLeft className={`w-4 h-4 ${isRtl ? '' : 'rotate-180'}`} />
          </button>

          <button
            onClick={() => {
              const featuresElem = document.getElementById('molan-features');
              if (featuresElem) {
                featuresElem.scrollIntoView({ behavior: 'smooth' });
              } else {
                setActiveTab('video');
              }
            }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <Clapperboard className="w-4 h-4 text-neutral-800" />
            <span>{isRtl ? 'استكشف الخدمات والاستوديوهات' : 'Explore AI Studios'}</span>
          </button>
        </div>

        {/* Hero Interactive Showcase Card */}
        <div className="mt-10 max-w-5xl mx-auto rounded-2xl bg-white border border-neutral-200 p-4 sm:p-6 shadow-xs relative text-right">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 inline-block" />
              <span className="font-mono text-neutral-600 font-bold mr-2">MOLAN AI Video Engine</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>{isRtl ? 'معاينة فيديو إعلاني حقيقي' : 'Live Interactive Demo'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
            <div className="lg:col-span-7 relative rounded-xl overflow-hidden aspect-video bg-neutral-100 border border-neutral-200 group">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"
                alt="MOLAN AI Commercial Video Preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setIsPlayingDemo(!isPlayingDemo)}
                className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition"
              >
                <div className="w-14 h-14 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 fill-white mr-0.5" />
                </div>
              </button>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-neutral-800">
                <span className="bg-white/90 backdrop-blur-xs px-3 py-1 rounded-md font-bold text-[11px]">
                  {isPlayingDemo ? '▶ جاري العرض (HD)' : 'معاينة إعلان تجاري 9:16'}
                </span>
                <span className="bg-neutral-900 text-white px-2.5 py-1 rounded-md font-mono font-bold text-[10px]">
                  Gemini Omni
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3.5 bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs text-neutral-800">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <span className="font-bold text-neutral-900">{isRtl ? 'السيناريو الإعلاني المعتمد:' : 'Synthesized Ad Script:'}</span>
                <span className="text-[10px] text-neutral-700 bg-neutral-200 px-2 py-0.5 rounded font-bold">
                  {isRtl ? 'جاهز للتوليد' : 'Ready'}
                </span>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-neutral-900">1. الخطاف الإعلاني (Hook):</p>
                <p className="text-neutral-700 bg-white p-2.5 rounded-lg border border-neutral-200 leading-relaxed">
                  {isRtl ? '"هل تبحث عن أفضل طريقة لتسويق منتجك بدون تكاليف إنتاج عالية؟"' : '"Tired of burning budget on video production?"'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-neutral-900">2. المشهد والنص الإعلاني (Body):</p>
                <p className="text-neutral-600 bg-white p-2.5 rounded-lg border border-neutral-200 leading-relaxed">
                  {isRtl ? 'عرض سينمائي ديناميكي مع تعليق صوتي حماسي واستعراض سريع لمزايا المنتج.' : 'Dynamic cinematic sequence with vibrant Puck voiceover.'}
                </p>
              </div>

              <button
                onClick={() => {
                  if (user) {
                    setActiveTab('video', 'url');
                  } else {
                    onOpenLogin();
                  }
                }}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>{isRtl ? 'جرب إنشاء فيديو مماثل الآن' : 'Try Generating Similar Ad'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="molan-features" className="space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            {isRtl ? 'خدمات المنصة' : 'Core Capabilities'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900">
            {isRtl ? 'استوديوهات إنتاجية متكاملة' : 'All-in-One AI Production Studios'}
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm max-w-xl mx-auto">
            {isRtl
              ? 'كل ما تحتاجه لتصوير المنتجات، تحويل الروابط، صياغة السيناريوهات، وتوليد الفيديوهات.'
              : 'Everything you need for video generation, scriptwriting, avatar narration, and URL-to-Ad automation.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div
            onClick={() => setActiveTab('video', 'manual')}
            className="group cursor-pointer rounded-xl bg-white border border-neutral-200 p-6 space-y-4 hover:border-neutral-400 transition shadow-2xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">
                {isRtl ? 'استوديو الفيديو الإعلاني' : 'Video Ad Studio'}
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                {isRtl
                  ? 'توليد فيديوهات إعلانية تجارية مع سيناريو تسويقي كامل، تعليق صوتي طبيعي، وتصدير أبعاد 9:16 و16:9.'
                  : 'Generate commercial video ads with custom audio voiceovers, high-resolution visual prompts, and multi-ratio export.'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-neutral-900 text-xs font-bold">
              <span>{isRtl ? 'افتح الاستوديو' : 'Launch Studio'}</span>
              <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? '' : 'rotate-180'}`} />
            </div>
          </div>

          {/* Feature 2 */}
          <div
            onClick={() => setActiveTab('video_creator')}
            className="group cursor-pointer rounded-xl bg-white border border-neutral-200 p-6 space-y-4 hover:border-neutral-400 transition shadow-2xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold">
                <Clapperboard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">
                {isRtl ? 'إنشاء الفيديوهات الإبداعية' : 'AI Creative Video Creator'}
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                {isRtl
                  ? 'صناعة قصص خيالية، أفلام قصيرة، أنمي، ووثائقيات مع ميزة توسيع الأفكار البسيطة إلى سيناريو ومشاهد.'
                  : 'Craft sci-fi adventures, short films, anime, documentaries, and expand simple ideas into multi-scene videos.'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-neutral-900 text-xs font-bold">
              <span>{isRtl ? 'استكشف القصص' : 'Create Story'}</span>
              <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? '' : 'rotate-180'}`} />
            </div>
          </div>

          {/* Feature 3 */}
          <div
            onClick={() => setActiveTab('video', 'url')}
            className="group cursor-pointer rounded-xl bg-white border border-neutral-200 p-6 space-y-4 hover:border-neutral-400 transition shadow-2xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold">
                <LinkIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">
                {isRtl ? 'تحويل الرابط إلى إعلان (URL to Ad)' : 'URL to Ad Generator'}
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                {isRtl
                  ? 'أدخل رابط أي متجر أو منتج لتوليد إعلان فيديو احترافي تلقائيًا مع جلب الاسم والوصف والصور المتاحة.'
                  : 'Input any e-commerce or product URL to automatically extract details and generate a video ad.'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-neutral-900 text-xs font-bold">
              <span>{isRtl ? 'تحويل رابط' : 'Analyze URL'}</span>
              <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? '' : 'rotate-180'}`} />
            </div>
          </div>

          {/* Feature 4 */}
          <div
            onClick={() => setActiveTab('image')}
            className="group cursor-pointer rounded-xl bg-white border border-neutral-200 p-6 space-y-4 hover:border-neutral-400 transition shadow-2xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">
                {isRtl ? 'استوديو الصور' : 'Image Studio'}
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                {isRtl
                  ? 'تصميم صور وبوسترات إعلانية بدقة 4K مع ألوان متناسقة وتصوير منتجات وإضاءة استوديو.'
                  : 'Design high-resolution 4K ad banners, product photography renders, and social visual creatives.'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-neutral-900 text-xs font-bold">
              <span>{isRtl ? 'صمّم صورك' : 'Create Image'}</span>
              <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? '' : 'rotate-180'}`} />
            </div>
          </div>

          {/* Feature 5 */}
          <div
            onClick={() => setActiveTab('copywriter')}
            className="group cursor-pointer rounded-xl bg-white border border-neutral-200 p-6 space-y-4 hover:border-neutral-400 transition shadow-2xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold">
                <Type className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">
                {isRtl ? 'كاتب النصوص والسيناريو' : 'AI Copywriter & Voiceover'}
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                {isRtl
                  ? 'صياغة 3 خطافات إعلانية حاسمة، سيناريو إعلاني بأسلوب تسويقي جذاب، وتوليد تعليق صوتي طبيعي.'
                  : 'Formulate high-converting hooks, persuasive video scripts, and natural voiceovers.'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-neutral-900 text-xs font-bold">
              <span>{isRtl ? 'اكتب السيناريو' : 'Generate Copy'}</span>
              <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? '' : 'rotate-180'}`} />
            </div>
          </div>

          {/* Feature 6 */}
          <div
            onClick={() => setActiveTab('product_ads')}
            className="group cursor-pointer rounded-xl bg-white border border-neutral-200 p-6 space-y-4 hover:border-neutral-400 transition shadow-2xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">
                {isRtl ? 'إعلانات المنتجات واستوديو العرض' : 'Product Ads & Unboxing'}
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                {isRtl
                  ? 'استوديو متكامل لاستعراض المنتجات، فتح الصناديق (Unboxing)، وإنشاء مقاطع تيك توك وريلز.'
                  : 'Showcase product unboxing, e-commerce highlights, and short-form TikTok/Reels commercials.'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-neutral-900 text-xs font-bold">
              <span>{isRtl ? 'عرض المنتجات' : 'Product Studio'}</span>
              <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? '' : 'rotate-180'}`} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOWCASE GALLERY SECTION */}
      <section className="space-y-8 pt-4">
        <div className="text-center space-y-2">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            {isRtl ? 'معرض الأعمال' : 'Showcase Gallery'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900">
            {isRtl ? 'نماذج حقيقية من إعلانات وفيديوهات المنصة' : 'Real Outputs Generated by MOLAN AI'}
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {[
              { id: 'all', label: isRtl ? 'جميع الأعمال' : 'All Showcase' },
              { id: 'video_ad', label: isRtl ? 'إعلانات تجارية' : 'Video Ads' },
              { id: 'creative', label: isRtl ? 'قصص إبداعية' : 'Creative Stories' },
              { id: 'url_to_ad', label: isRtl ? 'تحويل رابط' : 'URL to Ad' },
              { id: 'image', label: isRtl ? 'صور المنتجات' : 'Product Images' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setShowcaseCategory(cat.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  showcaseCategory === cat.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 border border-neutral-200 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredShowcase.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-white border border-neutral-200 overflow-hidden space-y-3 p-3 flex flex-col justify-between hover:border-neutral-400 transition shadow-2xs"
            >
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden aspect-square bg-neutral-100">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 right-2 bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">{item.desc}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab(item.targetTab, item.subMode)}
                className="w-full py-2 bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-900 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRtl ? 'جرب إنشاء مماثل' : 'Try Similar Ad'}</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="space-y-6 pt-4 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            {isRtl ? 'الأسئلة الشائعة' : 'FAQ'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900">
            {isRtl ? 'إجابات عن معظم الاستفسارات' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-neutral-200 bg-white overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-4 text-right flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-neutral-900 hover:bg-neutral-50 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaqIndex === idx && (
                <div className="p-4 pt-0 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 bg-neutral-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
