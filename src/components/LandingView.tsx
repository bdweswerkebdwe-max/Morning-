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
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Play,
  Check,
  HelpCircle,
  Zap,
  Coins,
  ChevronDown,
  Globe,
  Users,
  Building,
  Download,
  Share2,
  ExternalLink,
  FolderKanban,
  FileText,
  Sliders,
  Sparkle,
  Sparkles as SparklesIcon,
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
  projects,
  setActiveTab,
  onOpenLogin,
  onOpenPricing,
  onOpenHelp,
  lang = 'ar',
}) => {
  const isRtl = lang === 'ar';

  // State for Showcase Category Filter
  const [showcaseCategory, setShowcaseCategory] = useState<'all' | 'video_ad' | 'creative' | 'image' | 'url_to_ad'>('all');

  // State for FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // State for Demo Video Player Simulation
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // Showcase items with realistic metadata
  const showcaseItems = [
    {
      id: 'showcase_1',
      category: 'url_to_ad',
      title: isRtl ? 'إعلان عطر فاخر - تحويل رابط منتج' : 'Luxury Perfume - URL to Ad',
      desc: isRtl ? 'تم تحليله تلقائيًا من رابط متجر إلكتروني وصياغة سيناريو 10 ثوانٍ' : 'Analyzed directly from product URL with 10s video prompt',
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
      title: isRtl ? 'قصة مغامرة في مدينة المستقبل - أنمي' : 'Sci-Fi Adventure Story - Anime',
      desc: isRtl ? 'سيناريو سينمائي وتوليد مشاهد خيالية متسلسلة أوتوماتيكيًا' : 'Cinematic sci-fi script & multi-scene AI video generation',
      thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
      badge: isRtl ? 'أنمي خيالي' : 'Anime Story',
      aspectRatio: '16:9',
      views: '88.9K',
      script: isRtl ? 'في أعماق عام 2099، تبدأ الرحلة الشجاعة للبحث عن النجم الضائع...' : 'In 2099, the heroic journey begins to locate the lost star...',
      targetTab: 'video_creator',
    },
    {
      id: 'showcase_3',
      category: 'video_ad',
      title: isRtl ? 'إعلان تطبيق توصيل وسري للشركات' : 'Delivery App Commercial Ad',
      desc: isRtl ? 'خطاف إعلاني قوي وممثل افتراضي خليجي بزي رسمي' : 'High-converting hook with licensed Saudi AI avatar',
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

  // FAQ Accordion Data
  const faqs = [
    {
      q: isRtl ? 'كيف تقوم منصة MOLAN AI بتوليد الفيديوهات والصور الإعلانية؟' : 'How does MOLAN AI generate video & visual ads?',
      a: isRtl
        ? 'تعتمد المنصة على أحدث محركات الذكاء الاصطناعي وخوادم Google Gemini API المتقدمة لإنشاء الفيديوهات، صياغة السيناريوهات الإعلانية، وتصوير المنتجات، مع ضبط المقاسات والأصوات التلقائية في ثوانٍ.'
        : 'MOLAN AI uses Google Gemini API and advanced video interaction models to turn text prompts or product URLs into cinematic video ads, studio renders, and marketing scripts.',
    },
    {
      q: isRtl ? 'كيف تعمل ميزة تحويل الرابط إلى إعلان (URL to Ad)؟' : 'How does the URL to Ad feature work?',
      a: isRtl
        ? 'تقوم المنصة بمسح وتنسيق محتوى رابط أي متجر إلكتروني أو صفحة منتج أو تطبيق آمنًا عبر السيرفر، واستخراج العنوان والمميزات والصور والسعر، ثم تحويلها إلى سيناريو وفيديو إعلاني جاهز.'
        : 'The server safely scrapes public metadata (title, product features, price, logo, images) from any product or app store URL, and Gemini AI converts it into an optimized ad script & video.',
    },
    {
      q: isRtl ? 'هل الفيديوهات والصور المولدة مرخصة للاستخدام التجاري؟' : 'Are generated videos & photos licensed for commercial use?',
      a: isRtl
        ? 'نعم، جميع الفيديوهات، الصور، الممثلين الافتراضيين، والتعليقات الصوتية الناتجة ملك لك بالكامل ومتاحة للاستخدام التجاري على جميع منصات التواصل والحملات الإعلانية المدفوعة.'
        : 'Yes, all outputs, video clips, generated posters, scripts, and licensed AI avatars are 100% royalty-free and clear for commercial advertising.',
    },
    {
      q: isRtl ? 'ما هو نظام النقاط وكيف يتم خصمها؟' : 'How does the credit system work?',
      a: isRtl
        ? 'تمنح المنصة 50 نقطة مجانية فور التسجيل. يتطلب تحليل الروابط أو توسيع الأفكار 1 نقطة فقط، بينما يتطلب توليد الفيديو الاحترافي 10 نقاط. ولا يتم خصم أي نقطة إلا بعد نجاح التوليد.'
        : 'New users get 50 free credits. URL analysis costs 1 credit, while full video generation uses 10 credits. Credits are strictly deducted only upon successful generation.',
    },
    {
      q: isRtl ? 'هل يمكنني تعديل السيناريو والصور قبل بدء التوليد؟' : 'Can I review and edit the script before video generation?',
      a: isRtl
        ? 'بالتأكيد! تعرض لك المنصة بطاقة مراجعة تفاعلية تتضمن الخطاف الإعلاني، نص التوليد، والصور المستخرجة، وتتيح لك تعديل أي نص أو اختيار صورة مرجعية بضغطة زر.'
        : 'Absolutely! You get a comprehensive interactive review card showing extracted titles, product highlights, and master prompt so you can edit anything before rendering.',
    },
    {
      q: isRtl ? 'كيف يمكنني ترقية الباقة وتوفير نقاط إضافية؟' : 'How can I upgrade my subscription and refill credits?',
      a: isRtl
        ? 'يمكنك ترقية باقتك إلى Pro (500 نقطة) أو Enterprise (2000 نقطة) بضغطة زر من داخل المنصة مع خيارات الدفع الفوري الآمن وكوبونات الخصم المتاحة.'
        : 'You can easily upgrade to Pro (500 credits/mo) or Enterprise (2000 credits/mo) with instant refilling and coupon code redemption directly in the platform.',
    },
  ];

  return (
    <div className="space-y-24 pt-4 pb-16 overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. HERO SECTION */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Glowing Background Mesh Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-amber-500/15 via-orange-600/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Top Brand Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-xl">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{isRtl ? 'منصة معلن MOLAN AI · الاستوديو الإنتاجي المتكامل للذكاء الاصطناعي' : 'MOLAN AI · Enterprise AI Commercial Video Studio'}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
            {isRtl ? (
              <>
                اصنع <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">فيديوهات وإعلانات تجارية</span> بالذكاء الاصطناعي في ثوانٍ
              </>
            ) : (
              <>
                Create High-Converting <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">AI Video Ads & Visuals</span> in Seconds
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
            {isRtl
              ? 'صمّم فيديوهات تسويقية، قصصاً خيالية، صور منتجات بدقة 4K، وسيناريوهات إعلانية عالية التحويل، أو حوّل أي رابط منتج إلى فيديو إعلاني احترافي عبر طاقة Google Gemini.'
              : 'Generate commercial video ads, creative story films, 4K product renders, or convert any product URL into a high-converting video ad powered by Google Gemini.'}
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                if (user) {
                  setActiveTab('video', 'url');
                } else {
                  onOpenLogin();
                }
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base shadow-2xl shadow-amber-500/25 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
            >
              <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
              <span>{isRtl ? 'ابدأ التوليد مجانًا (50 نقطة)' : 'Start Free (50 Credits)'}</span>
              <ArrowLeft className={`w-5 h-5 ${isRtl ? '' : 'rotate-180'}`} />
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
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-base transition flex items-center justify-center gap-2"
            >
              <Clapperboard className="w-5 h-5 text-amber-400" />
              <span>{isRtl ? 'استكشف الاستوديوهات والأدوات' : 'Explore AI Studios'}</span>
            </button>
          </div>
        </div>

        {/* Visual Hero Interactive Showcase Card */}
        <div className="mt-12 max-w-5xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600" />

          {/* Interactive Player Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              <span className="text-slate-400 font-mono font-bold mr-2">MOLAN AI Omni Engine v1.1</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>{isRtl ? 'معاينة التوليد المباشر' : 'Live Interactive Demo'}</span>
            </div>
          </div>

          {/* Hero Split Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-center">
            {/* Mockup Screen / Video Visual */}
            <div className="lg:col-span-7 relative rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-slate-800 group/video">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"
                alt="MOLAN AI Generated Commercial Video Preview"
                className="w-full h-full object-cover group-hover/video:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

              {/* Play Button Overlay */}
              <button
                onClick={() => setIsPlayingDemo(!isPlayingDemo)}
                className="absolute inset-0 flex items-center justify-center group/btn focus:outline-none"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-500/90 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl transition transform group-hover/btn:scale-110">
                  <Play className="w-8 h-8 fill-slate-950 mr-0.5" />
                </div>
              </button>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
                <span className="bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-lg font-bold">
                  {isPlayingDemo ? '▶ جاري العرض السينمائي (HD)' : 'معاينة إعلان تجاري 9:16'}
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg font-mono font-bold">
                  Gemini Omni 1.1
                </span>
              </div>
            </div>

            {/* Generated Script & Parameters Box */}
            <div className="lg:col-span-5 space-y-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-slate-300">{isRtl ? 'السيناريو التسويقي المولد:' : 'Synthesized Ad Script:'}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  {isRtl ? 'جاهز للتوليد' : 'Ready'}
                </span>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-amber-400">1. الخطاف الإعلاني (Hook):</p>
                <p className="text-slate-200 leading-relaxed bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  {isRtl ? '"هل تعاني من ضياع ميزانيتك في التصوير والإنتاج؟"' : '"Tired of burning budget on video production?"'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-amber-400">2. المشهد والنص الإعلاني (Body):</p>
                <p className="text-slate-300 leading-relaxed bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
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
                className="w-full py-2.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold rounded-xl border border-amber-500/40 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isRtl ? 'جرب إنشاء فيديو مماثل الآن' : 'Try Generating Similar Ad'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION (Bento Grid) */}
      <section id="molan-features" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs font-bold text-amber-400 tracking-wider uppercase">
            {isRtl ? 'قدرات وإمكانيات المنصة' : 'Core Capabilities'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            {isRtl ? 'استوديوهات ذكاء اصطناعي متكاملة في مكان واحد' : 'All-in-One AI Production Studios'}
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            {isRtl
              ? 'كل ما تحتاجه لتصوير المنتجات، تحويل الروابط إلى إعلانات، صياغة السيناريوهات، وتوليد الفيديوهات الاحترافية.'
              : 'Everything you need for video generation, scriptwriting, avatar narration, and URL-to-Ad automation.'}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: Video Ad Studio */}
          <div
            onClick={() => setActiveTab('video', 'manual')}
            className="group cursor-pointer rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 p-6 space-y-4 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition">
                {isRtl ? 'استوديو الفيديو الإعلاني' : 'Video Ad Studio'}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {isRtl
                  ? 'توليد فيديوهات إعلانية تجارية عالية الدقة مع سيناريو تسويقي كامل، تعليق صوتي طبيعي، وتصدير مقاسات 9:16 و16:9.'
                  : 'Generate commercial video ads with custom audio voiceovers, high-resolution visual prompts, and multi-ratio export.'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-amber-400 text-xs font-bold group-hover:translate-x-1 transition">
              <span>{isRtl ? 'افتح الاستوديو' : 'Launch Studio'}</span>
              <ArrowLeft className={`w-4 h-4 ${isRtl ? '' : 'rotate-180'}`} />
            </div>
          </div>

          {/* Feature 2: AI Video Creator */}
          <div
            onClick={() => setActiveTab('video_creator')}
            className="group cursor-pointer rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 p-6 space-y-4 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clapperboard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition">
                {isRtl ? 'إنشاء الفيديوهات الإبداعية' : 'AI Creative Video Creator'}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {isRtl
                  ? 'صناعة قصص خيالية، أفلام قصيرة، كوميديا، أنمي، ووثائقيات مع ميزة توسيع الأفكار البسيطة إلى قصة وسيناريو ومشاهد متسلسلة.'
                  : 'Craft sci-fi adventures, short films, anime, documentaries, and expand simple ideas into multi-scene videos.'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-purple-400 text-xs font-bold group-hover:translate-x-1 transition">
              <span>{isRtl ? 'استكشف القصص' : 'Create Story'}</span>
              <ArrowLeft className={`w-4 h-4 ${isRtl ? '' : 'rotate-180'}`} />
            </div>
          </div>

          {/* Feature 3: URL to Ad */}
          <div
            onClick={() => setActiveTab('video', 'url')}
            className="group cursor-pointer rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 p-6 space-y-4 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LinkIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition">
                {isRtl ? 'تحويل الرابط إلى إعلان (URL to Ad)' : 'URL to Ad Generator'}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {isRtl
                  ? 'أدخل رابط أي متجر أو منتج أو تطبيق لتوليد إعلان فيديو احترافي تلقائيًا مع جلب الاسم والوصف والسعر والصور المتاحة.'
                  : 'Input any e-commerce, product, or app store URL to automatically extract details and generate a high-converting video ad.'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-blue-400 text-xs font-bold group-hover:translate-x-1 transition">
              <span>{isRtl ? 'جرب تحويل رابط' : 'Analyze URL'}</span>
              <ArrowLeft className={`w-4 h-4 ${isRtl ? '' : 'rotate-180'}`} />
            </div>
          </div>

          {/* Feature 4: Image Studio */}
          <div
            onClick={() => setActiveTab('image')}
            className="group cursor-pointer rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 p-6 space-y-4 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition">
                {isRtl ? 'استوديو الصور والإعلانات' : 'Image Studio'}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {isRtl
                  ? 'تصميم صور وبوسترات إعلانية بدقة 4K مع ألوان متناسقة، تصوير منتجات، وضبط الإضاءة والخلفيات الإبداعية.'
                  : 'Design high-resolution 4K ad banners, product photography renders, and social visual creatives.'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-emerald-400 text-xs font-bold group-hover:translate-x-1 transition">
              <span>{isRtl ? 'صمّم صورك' : 'Create Image'}</span>
              <ArrowLeft className={`w-4 h-4 ${isRtl ? '' : 'rotate-180'}`} />
            </div>
          </div>

          {/* Feature 5: AI Copywriter & Voiceovers */}
          <div
            onClick={() => setActiveTab('copywriter')}
            className="group cursor-pointer rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 p-6 space-y-4 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Type className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-rose-300 transition">
                {isRtl ? 'صياغة السيناريو والتعليق الصوتي' : 'AI Copywriter & Voiceover'}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {isRtl
                  ? 'صياغة 3 خطافات إعلانية حاسمة، سيناريو إعلاني بأسلوب تسويقي جذاب، وتوليد تعليق صوتي طبيعي بـ 15+ لهجة عربيّة ودوليّة.'
                  : 'Formulate high-converting hooks, persuasive video scripts, and natural voiceovers across 15+ dialects.'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-rose-400 text-xs font-bold group-hover:translate-x-1 transition">
              <span>{isRtl ? 'اكتب السيناريو' : 'Generate Copy'}</span>
              <ArrowLeft className={`w-4 h-4 ${isRtl ? '' : 'rotate-180'}`} />
            </div>
          </div>

          {/* Feature 6: Multi-Format & Style Freedom */}
          <div
            onClick={() => setActiveTab('product_ads')}
            className="group cursor-pointer rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 p-6 space-y-4 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition">
                {isRtl ? 'إعلانات المنتجات واستوديو العرض' : 'Product Ads & Unboxing'}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {isRtl
                  ? 'استوديو متكامل لاستعراض المنتجات، فتح الصناديق (Unboxing)، وإنشاء مقاطع تيك توك وريلز بأبعاد 9:16 و16:9.'
                  : 'Showcase product unboxing, e-commerce highlights, and short-form TikTok/Reels commercials.'}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-amber-400 text-xs font-bold group-hover:translate-x-1 transition">
              <span>{isRtl ? 'عرض المنتجات' : 'Product Studio'}</span>
              <ArrowLeft className={`w-4 h-4 ${isRtl ? '' : 'rotate-180'}`} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 bg-slate-900/50 border border-slate-800/80 p-8 sm:p-12 rounded-3xl relative overflow-hidden">
        <div className="text-center space-y-3">
          <p className="text-xs font-bold text-amber-400 tracking-wider uppercase">
            {isRtl ? 'سهولة وسرعة التوليد' : 'Simple 3-Step Process'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            {isRtl ? 'كيف تعمل منصة MOLAN AI؟' : 'How MOLAN AI Works'}
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            {isRtl ? 'ثلاث خطوات بسيطة تحوّل فكرتك أو رابط منتجك إلى إعلان فيديو جاهز للنشر.' : 'Three effortless steps to transform your idea or product URL into a high-converting video ad.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="space-y-4 bg-slate-950/80 border border-slate-800 p-6 rounded-2xl relative group hover:border-amber-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center">
              1
            </div>
            <h3 className="text-lg font-bold text-white">{isRtl ? 'أدخل فكرتك أو رابط المنتج' : 'Input Idea or Product URL'}</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              {isRtl
                ? 'اكتب وصفًا مختصرًا أو ضع رابط متجرك الإلكتروني ليقوم الخادم بتحليله واستخراج مميزات المنتج.'
                : 'Enter a text description or paste your product link for instant AI page extraction.'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-4 bg-slate-950/80 border border-slate-800 p-6 rounded-2xl relative group hover:border-amber-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-slate-950 font-black text-lg flex items-center justify-center">
              2
            </div>
            <h3 className="text-lg font-bold text-white">{isRtl ? 'اختر المقاس والأسلوب والصوت' : 'Select Style & Voiceover'}</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              {isRtl
                ? 'حدد أبعاد الفيديو (9:16 أو 16:9)، الأسلوب البصري (سينمائي، واقعي، كرتوني)، ونوع التعليق الصوتي والموسيقى.'
                : 'Choose your aspect ratio (9:16, 16:9), visual aesthetic (cinematic, realistic, anime), and voice persona.'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-4 bg-slate-950/80 border border-slate-800 p-6 rounded-2xl relative group hover:border-amber-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-500 text-slate-950 font-black text-lg flex items-center justify-center">
              3
            </div>
            <h3 className="text-lg font-bold text-white">{isRtl ? 'استلم إعلانك الجاهز للنشر' : 'Generate & Download HD Ad'}</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              {isRtl
                ? 'عاين الفيديو، قم بحفظه في مكتبتك أو تنزيله فورًا لإطلاق حملاتك الإعلانية وزيادة مبيعاتك.'
                : 'Preview the synthesized video ad, save it to your library, and export directly for your campaigns.'}
            </p>
          </div>
        </div>
      </section>

      {/* 4. SHOWCASE GALLERY SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <p className="text-xs font-bold text-amber-400 tracking-wider uppercase">
            {isRtl ? 'معرض الأعمال التفاعلي' : 'Live Showcase Gallery'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            {isRtl ? 'نماذج حقيقية من إعلانات وفيديوهات المنصة' : 'Real Outputs Generated by MOLAN AI'}
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            {isRtl ? 'استعرض بعض النماذج المولدة بالذكاء الاصطناعي وجرب التوليد المماثل بضغطة زر.' : 'Browse actual AI generated commercial outputs and clone prompts directly.'}
          </p>

          {/* Filter Categories */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {[
              { id: 'all', label: isRtl ? 'جميع الأعمال' : 'All Showcase' },
              { id: 'video_ad', label: isRtl ? 'إعلانات تجارية' : 'Video Ads' },
              { id: 'creative', label: isRtl ? 'قصص وأفلام إبداعية' : 'Creative Stories' },
              { id: 'url_to_ad', label: isRtl ? 'تحويل رابط' : 'URL to Ad' },
              { id: 'image', label: isRtl ? 'صور وبوسترات' : 'Product Images' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setShowcaseCategory(cat.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  showcaseCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredShowcase.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden space-y-3 p-3 group hover:border-amber-500/50 transition duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-950">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                  <span className="absolute top-2.5 right-2.5 bg-slate-900/90 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {item.badge}
                  </span>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-slate-200">
                    <span className="bg-slate-950/80 px-2 py-0.5 rounded font-mono">{item.aspectRatio}</span>
                    <span className="bg-slate-950/80 px-2 py-0.5 rounded font-bold">{item.views} {isRtl ? 'مشاهدة' : 'views'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{item.desc}</p>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 italic line-clamp-2">
                  "{item.script}"
                </div>
              </div>

              <button
                onClick={() => setActiveTab(item.targetTab, item.subMode)}
                className="w-full py-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRtl ? 'جرب إنشاء مماثل' : 'Try Similar Ad'}</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. USE CASES SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs font-bold text-amber-400 tracking-wider uppercase">
            {isRtl ? 'حلول مخصصة للجميع' : 'Tailored Use Cases'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            {isRtl ? 'من يستفيد من منصة MOLAN AI؟' : 'Who Uses MOLAN AI?'}
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            {isRtl ? 'حلول ذكية مصممة لزيادة المبيعات وتوفير ميزانيات الإنتاج والتسويق.' : 'Custom AI video & copy workflows built for modern businesses & creators.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-amber-500/40 transition">
            <ShoppingBag className="w-8 h-8 text-amber-400" />
            <h3 className="text-lg font-bold text-white">{isRtl ? 'المتاجر الإلكترونية' : 'E-Commerce Brands'}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isRtl ? 'تحويل روابط المنتجات مباشرة إلى إعلانات فيديو تيك توك وريلز لزيادة مبيعات السلة وتقليل تكلفة الاستحواذ.' : 'Turn product links directly into high-converting video ads for TikTok, Instagram & Snapchat.'}
            </p>
          </div>

          <div className="div p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-purple-500/40 transition">
            <Clapperboard className="w-8 h-8 text-purple-400" />
            <h3 className="text-lg font-bold text-white">{isRtl ? 'صنّاع المحتوى والأفلام' : 'Content Creators & Filmmakers'}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isRtl ? 'إنشاء قصص أنمي وسيناريوهات خيالية متسلسلة وتوسيع الأفكار البسيطة لإنتاج محتوى جذاب بسرعة فائقة.' : 'Create anime stories, sci-fi short films, and sequential video scenes without filming gear.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-emerald-500/40 transition">
            <Bot className="w-8 h-8 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">{isRtl ? 'الوكالات والمسوقون' : 'Marketing Agencies'}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isRtl ? 'أتمتة اختبارات A/B وتوليد حزم الإعلانات متعددة النسخ في دقائق معدودة مع إحصائيات دقيقة.' : 'Automate A/B test variants, generate script hooks, and dub commercials across 15+ languages.'}
            </p>
          </div>
        </div>
      </section>

      {/* 6. PRICING & CREDITS SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs font-bold text-amber-400 tracking-wider uppercase">
            {isRtl ? 'الأسعار والباقات الحقيقية' : 'Pricing & Subscription Tiers'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            {isRtl ? 'اختر الباقة المناسبة لاحتياجاتك' : 'Transparent Plans for Growth'}
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            {isRtl ? 'نقاط فورية للاستخدام في جميع استوديوهات الذكاء الاصطناعي دون تكاليف خفية.' : 'Instant credit allocation for all AI video, photo, and text generation studios.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 flex flex-col justify-between relative hover:border-amber-500/40 transition">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                {isRtl ? 'التجربة المجانية' : 'Free Tier'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-xs text-slate-400">/ {isRtl ? 'للأبد' : 'forever'}</span>
              </div>
              <p className="text-xs text-amber-400 font-bold flex items-center gap-1">
                <Coins className="w-4 h-4" />
                <span>50 {isRtl ? 'نقطة مجانية فور التسجيل' : 'Free Credits on Sign up'}</span>
              </p>
              <ul className="space-y-3 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> <span>{isRtl ? 'توليد حتى 5 فيديوهات إعلانية' : 'Up to 5 AI Video Generations'}</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> <span>{isRtl ? 'تحويل الروابط إلى إعلانات' : 'URL to Ad Analysis'}</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> <span>{isRtl ? 'جميع استوديوهات الصور والكتّاب' : 'Access to Image & Copy Studios'}</span></li>
              </ul>
            </div>
            <button
              onClick={() => {
                if (!user) onOpenLogin();
                else setActiveTab('video');
              }}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
            >
              {isRtl ? 'ابدأ الآن مجانًا' : 'Get Started Free'}
            </button>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-amber-950/60 to-slate-900 border-2 border-amber-500 space-y-6 flex flex-col justify-between relative shadow-2xl shadow-amber-500/20">
            <div className="absolute -top-3.5 right-1/2 translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[11px] font-black px-4 py-1 rounded-full shadow-lg">
              {isRtl ? 'الأكثر طلباً واختياراً' : 'MOST POPULAR'}
            </div>
            <div className="space-y-4 pt-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                {isRtl ? 'الباقة الاحترافية Pro' : 'Pro Tier'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$29</span>
                <span className="text-xs text-slate-400">/ {isRtl ? 'شهرياً' : 'month'}</span>
              </div>
              <p className="text-xs text-amber-300 font-bold flex items-center gap-1">
                <Coins className="w-4 h-4" />
                <span>500 {isRtl ? 'نقطة شهرية متجددة' : 'Monthly Credits'}</span>
              </p>
              <ul className="space-y-3 text-xs text-slate-200 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> <span>{isRtl ? 'توليد 50+ فيديو إعلاني بدقة 720p' : '50+ HD Commercial Video Ads'}</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> <span>{isRtl ? 'دعم الأولوية في المعالجة والتوليد' : 'Priority Fast-Track Queue'}</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> <span>{isRtl ? 'جميع الممثلين والتعليقات الصوتية' : 'All Avatars & Voiceovers'}</span></li>
              </ul>
            </div>
            <button
              onClick={onOpenPricing}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition"
            >
              {isRtl ? 'اشترك في الباقة الاحترافية' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 flex flex-col justify-between relative hover:border-purple-500/40 transition">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-purple-950 text-purple-300 text-xs font-bold">
                {isRtl ? 'باقة المؤسسات' : 'Enterprise Tier'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$99</span>
                <span className="text-xs text-slate-400">/ {isRtl ? 'شهرياً' : 'month'}</span>
              </div>
              <p className="text-xs text-purple-300 font-bold flex items-center gap-1">
                <Coins className="w-4 h-4" />
                <span>2000 {isRtl ? 'نقطة شهرية مع دعم خاص' : 'Monthly Credits'}</span>
              </p>
              <ul className="space-y-3 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> <span>{isRtl ? 'توليد 200+ فيديو وإعلانات غير محدودة' : '200+ HD Commercial Video Ads'}</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> <span>{isRtl ? 'أتمتة حزم اختبارات A/B' : 'Batch Workflow Automation'}</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> <span>{isRtl ? 'دعم فني خاص وإرشادات تسويقية' : 'Dedicated Account Manager'}</span></li>
              </ul>
            </div>
            <button
              onClick={onOpenPricing}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
            >
              {isRtl ? 'اشترك في باقة المؤسسات' : 'Get Enterprise'}
            </button>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <p className="text-xs font-bold text-amber-400 tracking-wider uppercase">
            {isRtl ? 'إجابات الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </p>
          <h2 className="text-3xl font-black text-white">
            {isRtl ? 'كل ما تود معرفته عن منصة MOLAN AI' : 'Everything You Need to Know'}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-sm text-slate-100 hover:text-amber-300 transition"
                >
                  <span className="text-right">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-amber-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. FINAL CTA SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-amber-950/80 via-orange-950/60 to-slate-950 border border-amber-500/40 p-8 sm:p-14 text-center space-y-6 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black text-white max-w-2xl mx-auto leading-tight">
            {isRtl ? 'جاهز لإنتاج أحدث الفيديوهات والإعلانات بالذكاء الاصطناعي؟' : 'Ready to Create Next-Gen AI Video Ads?'}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            {isRtl ? 'احصل على 50 نقطة مجانية فور التسجيل وابدأ توليد الفيديوهات والصور فورًا.' : 'Claim 50 free credits instantly and launch your first AI commercial video today.'}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                if (!user) onOpenLogin();
                else setActiveTab('video', 'url');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base shadow-2xl transition"
            >
              {isRtl ? 'ابدأ الآن مجانًا' : 'Start Free Now'}
            </button>

            <button
              onClick={onOpenPricing}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-base transition"
            >
              {isRtl ? 'استعراض الباقات والأسعار' : 'View Pricing Plans'}
            </button>
          </div>
        </div>
      </section>

      {/* 9. PRO FOOTER (4 Columns) */}
      <footer className="border-t border-slate-800/80 bg-slate-950 pt-16 pb-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
                  MOLAN AI
                </h3>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                {isRtl
                  ? 'منصة معلن (MOLAN AI) - الاستوديو الإنتاجي المتكامل للذكاء الاصطناعي لتوليد الفيديوهات، الصور، الإعلانات التجارية، وصياغة السيناريوهات.'
                  : 'MOLAN AI - Enterprise studio for commercial AI video generation, product photoshoots, scriptwriting, and URL-to-Ad automation.'}
              </p>
            </div>

            {/* Column 2: المنصة */}
            <div className="space-y-3">
              <p className="font-bold text-white text-sm">{isRtl ? 'المنصة' : 'Platform'}</p>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => setActiveTab('dashboard')} className="hover:text-amber-400 transition">{isRtl ? 'الرئيسية' : 'Dashboard'}</button></li>
                <li><button onClick={() => setActiveTab('video', 'manual')} className="hover:text-amber-400 transition">{isRtl ? 'استوديو الإعلانات' : 'Video Ad Studio'}</button></li>
                <li><button onClick={() => setActiveTab('video_creator')} className="hover:text-amber-400 transition">{isRtl ? 'الفيديوهات الإبداعية' : 'AI Video Creator'}</button></li>
                <li><button onClick={() => setActiveTab('video', 'url')} className="hover:text-amber-400 transition">{isRtl ? 'تحويل الرابط إلى إعلان' : 'URL to Ad'}</button></li>
                <li><button onClick={() => setActiveTab('image')} className="hover:text-amber-400 transition">{isRtl ? 'استوديو الصور' : 'Image Studio'}</button></li>
              </ul>
            </div>

            {/* Column 3: الشركة والروابط */}
            <div className="space-y-3">
              <p className="font-bold text-white text-sm">{isRtl ? 'الشركة' : 'Company'}</p>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={onOpenHelp} className="hover:text-amber-400 transition">{isRtl ? 'من نحن' : 'About Us'}</button></li>
                <li><button onClick={onOpenHelp} className="hover:text-amber-400 transition">{isRtl ? 'تواصل معنا' : 'Contact Us'}</button></li>
                <li><button onClick={onOpenHelp} className="hover:text-amber-400 transition">{isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}</button></li>
                <li><button onClick={onOpenHelp} className="hover:text-amber-400 transition">{isRtl ? 'شروط الاستخدام' : 'Terms of Service'}</button></li>
              </ul>
            </div>

            {/* Column 4: الحساب والدعم */}
            <div className="space-y-3">
              <p className="font-bold text-white text-sm">{isRtl ? 'الحساب والمساعدة' : 'Account & Help'}</p>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={onOpenLogin} className="hover:text-amber-400 transition">{isRtl ? 'تسجيل الدخول' : 'Sign In'}</button></li>
                <li><button onClick={onOpenLogin} className="hover:text-amber-400 transition">{isRtl ? 'إنشاء حساب جديد' : 'Register'}</button></li>
                <li><button onClick={onOpenPricing} className="hover:text-amber-400 transition">{isRtl ? 'الباقات والأسعار' : 'Pricing Plans'}</button></li>
                <li><button onClick={onOpenHelp} className="hover:text-amber-400 transition">{isRtl ? 'مركز المساعدة' : 'Help Center'}</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <p>© {new Date().getFullYear()} MOLAN AI. {isRtl ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span>{isRtl ? 'تم التطوير بذكاء اصطناعي فائق' : 'Powered by Google Gemini AI'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
