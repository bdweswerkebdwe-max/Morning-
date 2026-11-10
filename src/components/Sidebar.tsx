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
  User as UserIcon,
} from 'lucide-react';
import { User } from '../types';

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  color?: string;
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

  const handleItemClick = (tabId: string, subMode?: 'url' | 'manual') => {
    setActiveTab(tabId);
    if (tabId === 'video' && subMode && setVideoInputMode) {
      setVideoInputMode(subMode);
    }
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const isRtl = lang === 'ar';

  const navGroups: NavGroup[] = [
    {
      title: isRtl ? 'الأقسام الرئيسية' : 'Main Hub',
      items: [
        {
          id: 'dashboard',
          label: isRtl ? 'لوحة التحكم' : 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'video_creator',
          label: isRtl ? 'إنشاء الفيديوهات الإبداعية' : 'AI Video Creator',
          icon: Clapperboard,
          badge: isRtl ? 'جديد' : 'NEW',
        },
        {
          id: 'video_ad',
          tabId: 'video',
          subMode: 'manual' as const,
          label: isRtl ? 'استوديو الفيديو الإعلاني' : 'Video Ad Studio',
          icon: Video,
        },
        {
          id: 'url_to_ad',
          tabId: 'video',
          subMode: 'url' as const,
          label: isRtl ? 'تحويل الرابط إلى إعلان (URL to Ad)' : 'URL to Ad Generator',
          icon: LinkIcon,
          badge: isRtl ? 'ذكاء' : 'AI',
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
        },
        {
          id: 'product_ads',
          label: isRtl ? 'إعلانات المنتجات' : 'Product Ads Studio',
          icon: ShoppingBag,
        },
        {
          id: 'actors',
          label: isRtl ? 'الممثلون الافتراضيون' : 'AI Avatars Library',
          icon: Users,
        },
        {
          id: 'copywriter',
          label: isRtl ? 'كاتب النصوص والسيناريو' : 'AI Copywriter',
          icon: Type,
        },
        {
          id: 'editor',
          label: isRtl ? 'محرر ومصمم الفيديو' : 'Video Editor',
          icon: Edit3,
        },
        {
          id: 'brand',
          label: isRtl ? 'الهوية التجارية (Brand Kit)' : 'Brand Kit',
          icon: Building,
        },
        {
          id: 'translator',
          label: isRtl ? 'المترجم الإعلاني والدبلجة' : 'AI Video Dubbing',
          icon: Languages,
        },
        {
          id: 'assistant',
          label: isRtl ? 'المساعد التسويقي الذكي' : 'Marketing Assistant',
          icon: Bot,
        },
        {
          id: 'workflow',
          label: isRtl ? 'أتمتة النسخ الإعلانية' : 'Batch Workflow',
          icon: Layers,
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
        },
        {
          id: 'templates',
          label: isRtl ? 'القوالب الإعلانية' : 'Ad Templates',
          icon: Sparkles,
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
          badge: isRtl ? 'شحن' : 'Refill',
        },
        {
          id: 'admin',
          label: isRtl ? 'الإعدادات ولوحة الإدارة' : 'Admin & Settings',
          icon: ShieldCheck,
        },
        {
          id: 'help_modal',
          isAction: true,
          action: onOpenHelp,
          label: isRtl ? 'الدعم والتعليمات' : 'Help & Support',
          icon: HelpCircle,
        },
      ],
    },
  ];

  const filteredGroups = navGroups.map(group => {
    const filteredItems = group.items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...group, items: filteredItems };
  }).filter(group => group.items.length > 0);

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
      {isOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} z-50 w-72 bg-white border-neutral-200 text-neutral-900 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-xl' : isRtl ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Brand Lockup */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between shrink-0 bg-white">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleItemClick('dashboard')}
          >
            <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-neutral-900 tracking-tight">
                MOLAN AI
              </h2>
              <p className="text-[10px] text-neutral-500 font-medium">منصة معلن الإعلانية</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition lg:hidden"
            title={isRtl ? 'إغلاق القائمة' : 'Close Sidebar'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-neutral-100 bg-neutral-50/50">
          <div className="relative">
            <Search className={`w-4 h-4 text-neutral-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'البحث في الخدمات...' : 'Search menu...'}
              className={`w-full bg-white border border-neutral-200 text-neutral-900 text-xs rounded-lg ${
                isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
              } py-2 focus:outline-none focus:border-neutral-900 transition placeholder:text-neutral-400`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-2.5' : 'right-2.5'} text-neutral-400 hover:text-neutral-900`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-400">
              {isRtl ? 'لم يتم العثور على نتائج للبحث' : 'No sections match your search'}
            </div>
          ) : (
            filteredGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <p className="px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
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
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                          active
                            ? 'bg-neutral-900 text-white font-bold'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-neutral-500'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              active
                                ? 'bg-white text-neutral-900'
                                : 'bg-neutral-100 text-neutral-600'
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
        <div className="p-3 border-t border-neutral-200 bg-white space-y-2 shrink-0">
          {user ? (
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-neutral-300 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900 truncate">{user.name}</p>

                    <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-semibold">
                      <Coins className="w-3.5 h-3.5 text-neutral-800" />
                      <span>{user.credits} {isRtl ? 'نقطة' : 'pts'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onOpenPricing}
                  className="px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold transition shrink-0"
                  title={isRtl ? 'شحن الرصيد' : 'Refill credits'}
                >
                  {isRtl ? 'شحن' : 'Refill'}
                </button>
              </div>

              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-neutral-500 text-xs">
                <button
                  onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                  className="px-2 py-1 rounded hover:bg-neutral-200 text-neutral-700 font-bold text-[11px] transition"
                >
                  {lang === 'ar' ? 'English' : 'عربي'}
                </button>

                <button
                  onClick={onLogout}
                  className="p-1 rounded hover:bg-red-50 hover:text-red-600 transition"
                  title={isRtl ? 'تسجيل الخروج' : 'Log out'}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-2"
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
