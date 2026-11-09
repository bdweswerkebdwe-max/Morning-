import React, { useState } from 'react';
import {
  Sparkles,
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
  Zap,
  ShieldCheck,
  HelpCircle,
  X,
  Search,
  LogOut,
  Sun,
  Moon,
  Coins,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  CreditCard,
  Settings,
  Film
} from 'lucide-react';
import { User } from '../types';

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  color: string;
  tabId?: string;
  subMode?: 'url' | 'manual';
  badge?: string;
  isAction?: boolean;
  action?: () => void;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  videoInputMode?: 'url' | 'manual';
  setVideoInputMode?: (mode: 'url' | 'manual') => void;
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

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  videoInputMode = 'manual',
  setVideoInputMode,
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
  const [searchQuery, setSearchQuery] = useState('');

  // Handle click on nav items
  const handleItemClick = (tabId: string, subMode?: 'url' | 'manual') => {
    setActiveTab(tabId);
    if (tabId === 'video' && subMode && setVideoInputMode) {
      setVideoInputMode(subMode);
    }
    // Auto-close sidebar on mobile/smaller screens
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const isRtl = lang === 'ar';

  // Navigation Items Grouping
  const navGroups: NavGroup[] = [
    {
      title: isRtl ? 'الأقسام الرئيسية' : 'Main Hub',
      items: [
        {
          id: 'dashboard',
          label: isRtl ? 'لوحة التحكم' : 'Dashboard',
          icon: LayoutDashboard,
          color: 'text-amber-400',
        },
        {
          id: 'video_creator',
          label: isRtl ? 'إنشاء الفيديوهات الإبداعية' : 'AI Video Creator',
          icon: Clapperboard,
          color: 'text-purple-400',
          badge: isRtl ? 'جديد' : 'NEW',
        },
        {
          id: 'video_ad',
          tabId: 'video',
          subMode: 'manual' as const,
          label: isRtl ? 'استوديو الفيديو الإعلاني' : 'Video Ad Studio',
          icon: Video,
          color: 'text-amber-400',
        },
        {
          id: 'url_to_ad',
          tabId: 'video',
          subMode: 'url' as const,
          label: isRtl ? 'تحويل الرابط إلى إعلان (URL to Ad)' : 'URL to Ad Generator',
          icon: LinkIcon,
          color: 'text-blue-400',
          badge: isRtl ? 'ذكي' : 'AI',
        },
      ],
    },
    {
      title: isRtl ? 'استوديوهات الذكاء الاصطناعي' : 'AI Creative Studios',
      items: [
        {
          id: 'image',
          label: isRtl ? 'استوديو الصور' : 'Image Studio',
          icon: ImageIcon,
          color: 'text-emerald-400',
        },
        {
          id: 'product_ads',
          label: isRtl ? 'إعلانات المنتجات' : 'Product Ads Studio',
          icon: ShoppingBag,
          color: 'text-orange-400',
        },
        {
          id: 'actors',
          label: isRtl ? 'الممثلون الافتراضيون' : 'AI Avatars Library',
          icon: Users,
          color: 'text-sky-400',
        },
        {
          id: 'copywriter',
          label: isRtl ? 'كاتب النصوص والسيناريو' : 'AI Copywriter',
          icon: Type,
          color: 'text-rose-400',
        },
        {
          id: 'editor',
          label: isRtl ? 'محرر ومصمم الفيديو' : 'Video Editor',
          icon: Edit3,
          color: 'text-cyan-400',
        },
        {
          id: 'brand',
          label: isRtl ? 'الهوية التجارية (Brand Kit)' : 'Brand Kit',
          icon: Building,
          color: 'text-yellow-400',
        },
        {
          id: 'translator',
          label: isRtl ? 'المترجم الإعلاني والدبلجة' : 'AI Video Dubbing',
          icon: Languages,
          color: 'text-indigo-400',
        },
        {
          id: 'assistant',
          label: isRtl ? 'المساعد التسويقي الذكي' : 'Marketing Assistant',
          icon: Bot,
          color: 'text-teal-400',
        },
        {
          id: 'workflow',
          label: isRtl ? 'أتمتة النسخ الإعلانية' : 'Batch Workflow',
          icon: Layers,
          color: 'text-violet-400',
        },
      ],
    },
    {
      title: isRtl ? 'المشاريع والمكتبة' : 'Projects & Library',
      items: [
        {
          id: 'projects',
          label: isRtl ? 'المشاريع والفيديوهات المحفوظة' : 'Saved Projects & Videos',
          icon: FolderKanban,
          color: 'text-emerald-400',
        },
        {
          id: 'templates',
          label: isRtl ? 'القوالب الإعلانية' : 'Ad Templates',
          icon: Sparkles,
          color: 'text-amber-400',
        },
      ],
    },
    {
      title: isRtl ? 'الإعدادات والاشتراكات' : 'Settings & Account',
      items: [
        {
          id: 'pricing_modal',
          isAction: true,
          action: onOpenPricing,
          label: isRtl ? 'النقاط والاشتراكات' : 'Credits & Subscription',
          icon: Zap,
          color: 'text-amber-400',
          badge: isRtl ? 'شحن' : 'Refill',
        },
        {
          id: 'admin',
          label: isRtl ? 'الإعدادات ولوحة الادارة' : 'Admin & Settings',
          icon: ShieldCheck,
          color: 'text-red-400',
        },
        {
          id: 'help_modal',
          isAction: true,
          action: onOpenHelp,
          label: isRtl ? 'الدعم والتعليمات' : 'Help & Support',
          icon: HelpCircle,
          color: 'text-slate-400',
        },
      ],
    },
  ];

  // Filter items based on search query
  const filteredGroups = navGroups.map(group => {
    const filteredItems = group.items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...group, items: filteredItems };
  }).filter(group => group.items.length > 0);

  // Determine active item matching
  const isItemActive = (item: any) => {
    if (item.id === 'url_to_ad') {
      return activeTab === 'video' && videoInputMode === 'url';
    }
    if (item.id === 'video_ad') {
      return activeTab === 'video' && videoInputMode === 'manual';
    }
    return activeTab === (item.tabId || item.id);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 ${isRtl ? 'right-0' : 'left-0'} z-50 w-72 bg-slate-950 dark:bg-slate-950 border-${
          isRtl ? 'l' : 'r'
        } border-slate-800/80 text-slate-200 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl shadow-amber-500/10' : isRtl ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Brand Lockup */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-950/90">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleItemClick('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
                MOLAN AI
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Enterprise AI Video Studio</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition lg:hidden"
            title={isRtl ? 'إغلاق القائمة' : 'Close Sidebar'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search Bar */}
        <div className="p-3 border-b border-slate-800/50 bg-slate-950/50">
          <div className="relative">
            <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'البحث في القائمة...' : 'Search menu...'}
              className={`w-full bg-slate-900/90 border border-slate-800 text-slate-200 text-xs rounded-xl ${
                isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
              } py-2 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition placeholder:text-slate-500`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-2.5' : 'right-2.5'} text-slate-400 hover:text-white`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              {isRtl ? 'لم يتم العثور على نتائج للبحث' : 'No sections match your search'}
            </div>
          ) : (
            filteredGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item);

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.isAction && item.action) {
                            item.action();
                            if (window.innerWidth < 1024) onClose();
                          } else {
                            handleItemClick(item.tabId || item.id, item.subMode);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                          active
                            ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                            : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div
                            className={`p-1.5 rounded-lg transition-colors ${
                              active
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-900 text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-800'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              active
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-800 text-slate-300 group-hover:bg-amber-500/20 group-hover:text-amber-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* User Card & Settings Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/95 space-y-2 shrink-0">
          {user ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-xl object-cover border border-amber-500/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-100 truncate">{user.name}</p>

                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-bold">
                      <Coins className="w-3.5 h-3.5" />
                      <span>{user.credits} {isRtl ? 'نقطة' : 'pts'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onOpenPricing}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-[11px] font-black shadow transition shrink-0"
                  title={isRtl ? 'شحن الرصيد' : 'Refill credits'}
                >
                  {isRtl ? 'شحن' : 'Refill'}
                </button>
              </div>

              {/* Quick Preferences Bar */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-slate-400 text-xs">
                <button
                  onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                  className="px-2 py-1 rounded-lg hover:bg-slate-800 hover:text-white transition font-bold text-[11px]"
                  title="تغيير اللغة"
                >
                  {lang === 'ar' ? 'English' : 'عربي'}
                </button>

                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                  title="تغيير المظهر"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
                </button>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition"
                  title={isRtl ? 'تسجيل الخروج' : 'Log out'}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition text-xs flex items-center justify-center gap-2"
            >
              <UserIcon className="w-4 h-4" />
              <span>{isRtl ? 'تسجيل الدخول / حساب جديد' : 'Sign In / Register'}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
