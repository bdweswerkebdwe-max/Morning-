import React from 'react';
import {
  Menu,
  Sparkles,
  Zap,
  Coins,
  LogOut,
  HelpCircle,
  LayoutDashboard,
  Video,
  Clapperboard,
  Link as LinkIcon,
  Image as ImageIcon,
  ShoppingBag,
  Users,
  Type,
  Edit3,
  Building,
  Languages,
  Bot,
  Layers,
  FolderKanban,
  ShieldCheck,
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  videoInputMode?: 'url' | 'manual';
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  user: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenPricing: () => void;
  onOpenHelp: () => void;
  lang: 'ar' | 'en';
  setLang: (l: 'ar' | 'en') => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  videoInputMode = 'manual',
  onToggleSidebar,
  user,
  onOpenLogin,
  onLogout,
  onOpenPricing,
  onOpenHelp,
  lang,
  setLang,
}) => {
  const isRtl = lang === 'ar';

  const getActiveTabDetails = () => {
    if (activeTab === 'video') {
      if (videoInputMode === 'url') {
        return {
          title: isRtl ? 'تحويل الرابط إلى إعلان (URL to Ad)' : 'URL to Ad Generator',
          icon: LinkIcon,
        };
      }
      return {
        title: isRtl ? 'استوديو الفيديو الإعلاني' : 'Video Ad Studio',
        icon: Video,
      };
    }

    switch (activeTab) {
      case 'dashboard':
        return { title: isRtl ? 'لوحة التحكم' : 'Dashboard', icon: LayoutDashboard };
      case 'video_creator':
        return { title: isRtl ? 'إنشاء الفيديوهات الإبداعية' : 'AI Video Creator', icon: Clapperboard };
      case 'image':
        return { title: isRtl ? 'استوديو الصور' : 'Image Studio', icon: ImageIcon };
      case 'product_ads':
        return { title: isRtl ? 'إعلانات المنتجات' : 'Product Ads Studio', icon: ShoppingBag };
      case 'actors':
        return { title: isRtl ? 'الممثلون الافتراضيون' : 'AI Avatars Library', icon: Users };
      case 'copywriter':
        return { title: isRtl ? 'كاتب النصوص والسيناريو' : 'AI Copywriter', icon: Type };
      case 'editor':
        return { title: isRtl ? 'محرر ومصمم الفيديو' : 'Video Editor', icon: Edit3 };
      case 'brand':
        return { title: isRtl ? 'الهوية التجارية (Brand Kit)' : 'Brand Kit', icon: Building };
      case 'translator':
        return { title: isRtl ? 'المترجم الإعلاني والدبلجة' : 'AI Video Dubbing', icon: Languages };
      case 'assistant':
        return { title: isRtl ? 'المساعد التسويقي الذكي' : 'Marketing Assistant', icon: Bot };
      case 'workflow':
        return { title: isRtl ? 'أتمتة النسخ الإعلانية' : 'Batch Workflow', icon: Layers };
      case 'projects':
        return { title: isRtl ? 'المشاريع والفيديوهات المحفوظة' : 'Saved Projects & Videos', icon: FolderKanban };
      case 'templates':
        return { title: isRtl ? 'القوالب الإعلانية' : 'Ad Templates', icon: Sparkles };
      case 'admin':
        return { title: isRtl ? 'الإعدادات ولوحة الإدارة' : 'Admin & Settings', icon: ShieldCheck };
      default:
        return { title: isRtl ? 'لوحة التحكم' : 'Dashboard', icon: LayoutDashboard };
    }
  };

  const activeDetails = getActiveTabDetails();
  const ActiveIcon = activeDetails.icon;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition focus:outline-none"
            title={isRtl ? 'القائمة الجانبية' : 'Toggle Sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-black text-neutral-900 tracking-tight leading-none">
                MOLAN AI
              </h1>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 pr-3 border-r border-neutral-200 text-xs font-bold text-neutral-600">
            <ActiveIcon className="w-4 h-4 text-neutral-900" />
            <span>{activeDetails.title}</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenPricing}
            className="flex items-center gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">{isRtl ? 'شحن الرصيد والاشتراكات' : 'Refill & Upgrade'}</span>
            <span className="sm:hidden">{isRtl ? 'شحن' : 'Refill'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <div
                onClick={onOpenPricing}
                className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 px-2.5 py-1.5 rounded-lg cursor-pointer hover:border-neutral-400 transition"
              >
                <Coins className="w-4 h-4 text-neutral-800" />
                <span className="text-xs font-bold text-neutral-900">
                  {user.credits} <span className="text-[10px] text-neutral-500">{isRtl ? 'نقطة' : 'pts'}</span>
                </span>
              </div>

              <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 p-1 rounded-lg">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-neutral-300"
                  title={user.name}
                />
                <button
                  onClick={onLogout}
                  title={isRtl ? 'تسجيل الخروج' : 'Log Out'}
                  className="p-1 text-neutral-500 hover:text-red-600 hover:bg-neutral-200 rounded transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-3 py-1.5 rounded-lg transition text-xs"
            >
              {isRtl ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          )}

          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="bg-neutral-100 border border-neutral-200 hover:bg-neutral-200 px-2.5 py-1.5 rounded-lg text-xs font-bold text-neutral-700 transition hidden md:block"
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>

          <button
            onClick={onOpenHelp}
            className="bg-neutral-100 border border-neutral-200 hover:bg-neutral-200 p-1.5 rounded-lg text-neutral-700 transition hidden md:block"
            title="الدعم والتعليمات"
          >
            <HelpCircle className="w-4 h-4 text-neutral-800" />
          </button>
        </div>
      </div>
    </header>
  );
};
