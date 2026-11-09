import React from 'react';
import {
  Menu,
  Sparkles,
  Zap,
  Coins,
  LogOut,
  Sun,
  Moon,
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
  isSidebarOpen,
  onToggleSidebar,
  user,
  onOpenLogin,
  onLogout,
  onOpenPricing,
  onOpenHelp,
  lang,
  setLang,
  theme,
  setTheme,
}) => {
  const isRtl = lang === 'ar';

  // Get active tab title and icon for header breadcrumb
  const getActiveTabDetails = () => {
    if (activeTab === 'video') {
      if (videoInputMode === 'url') {
        return {
          title: isRtl ? 'تحويل الرابط إلى إعلان (URL to Ad)' : 'URL to Ad Generator',
          icon: LinkIcon,
          color: 'text-blue-400',
        };
      }
      return {
        title: isRtl ? 'استوديو الفيديو الإعلاني' : 'Video Ad Studio',
        icon: Video,
        color: 'text-amber-400',
      };
    }

    switch (activeTab) {
      case 'dashboard':
        return { title: isRtl ? 'لوحة التحكم' : 'Dashboard', icon: LayoutDashboard, color: 'text-amber-400' };
      case 'video_creator':
        return { title: isRtl ? 'إنشاء الفيديوهات الإبداعية' : 'AI Video Creator', icon: Clapperboard, color: 'text-purple-400' };
      case 'image':
        return { title: isRtl ? 'استوديو الصور' : 'Image Studio', icon: ImageIcon, color: 'text-emerald-400' };
      case 'product_ads':
        return { title: isRtl ? 'إعلانات المنتجات' : 'Product Ads Studio', icon: ShoppingBag, color: 'text-orange-400' };
      case 'actors':
        return { title: isRtl ? 'الممثلون الافتراضيون' : 'AI Avatars Library', icon: Users, color: 'text-sky-400' };
      case 'copywriter':
        return { title: isRtl ? 'كاتب النصوص والسيناريو' : 'AI Copywriter', icon: Type, color: 'text-rose-400' };
      case 'editor':
        return { title: isRtl ? 'محرر ومصمم الفيديو' : 'Video Editor', icon: Edit3, color: 'text-cyan-400' };
      case 'brand':
        return { title: isRtl ? 'الهوية التجارية (Brand Kit)' : 'Brand Kit', icon: Building, color: 'text-yellow-400' };
      case 'translator':
        return { title: isRtl ? 'المترجم الإعلاني والدبلجة' : 'AI Video Dubbing', icon: Languages, color: 'text-indigo-400' };
      case 'assistant':
        return { title: isRtl ? 'المساعد التسويقي الذكي' : 'Marketing Assistant', icon: Bot, color: 'text-teal-400' };
      case 'workflow':
        return { title: isRtl ? 'أتمتة النسخ الإعلانية' : 'Batch Workflow', icon: Layers, color: 'text-violet-400' };
      case 'projects':
        return { title: isRtl ? 'المشاريع والفيديوهات المحفوظة' : 'Saved Projects & Videos', icon: FolderKanban, color: 'text-emerald-400' };
      case 'templates':
        return { title: isRtl ? 'القوالب الإعلانية' : 'Ad Templates', icon: Sparkles, color: 'text-amber-400' };
      case 'admin':
        return { title: isRtl ? 'الإعدادات ولوحة الادارة' : 'Admin & Settings', icon: ShieldCheck, color: 'text-red-400' };
      default:
        return { title: isRtl ? 'لوحة التحكم' : 'Dashboard', icon: LayoutDashboard, color: 'text-amber-400' };
    }
  };

  const activeDetails = getActiveTabDetails();
  const ActiveIcon = activeDetails.icon;

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left Side: Toggle Menu Button + Brand & Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 transition focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            title={isRtl ? 'فتح / إغلاق القائمة الجانبية' : 'Toggle Sidebar Menu'}
            aria-label="Toggle Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo & Current View Title */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent leading-tight">
                MOLAN AI
              </h1>
            </div>
          </div>

          {/* Active Page Indicator */}
          <div className="hidden md:flex items-center gap-2 pr-3 border-r border-slate-800 text-xs font-bold text-slate-300">
            <ActiveIcon className={`w-4 h-4 ${activeDetails.color}`} />
            <span>{activeDetails.title}</span>
          </div>
        </div>

        {/* Right Side Actions & User Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Credit Upgrade Button */}
          <button
            onClick={onOpenPricing}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="hidden sm:inline">{isRtl ? 'شحن الرصيد والاشتراكات' : 'Refill & Upgrade'}</span>
            <span className="sm:hidden">{isRtl ? 'شحن' : 'Refill'}</span>
          </button>

          {/* User Credits & Profile */}
          {user ? (
            <div className="flex items-center gap-2">
              <div
                onClick={onOpenPricing}
                className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl cursor-pointer hover:border-amber-500/40 transition"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  {user.credits} <span className="text-[10px] text-slate-400">{isRtl ? 'نقطة' : 'pts'}</span>
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover border border-amber-500/30"
                  title={user.name}
                />
                <button
                  onClick={onLogout}
                  title={isRtl ? 'تسجيل الخروج' : 'Log Out'}
                  className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl shadow transition text-xs whitespace-nowrap"
            >
              {isRtl ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 transition hidden md:block"
            title="تغيير اللغة"
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 p-1.5 rounded-xl text-slate-300 transition hidden md:block"
            title="تغيير المظهر"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 p-1.5 rounded-xl text-slate-300 transition hidden md:block"
            title="الدعم والتعليمات"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
