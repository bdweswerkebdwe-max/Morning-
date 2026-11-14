import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { VideoGenerationStudio } from './components/VideoGenerationStudio';
import { AiVideoCreatorStudio } from './components/AiVideoCreatorStudio';
import { AiActorsStudio } from './components/AiActorsStudio';
import { ProductAdsStudio } from './components/ProductAdsStudio';
import { ImageStudio } from './components/ImageStudio';
import { CopywriterStudio } from './components/CopywriterStudio';
import { VideoEditorStudio } from './components/VideoEditorStudio';
import { TranslatorStudio } from './components/TranslatorStudio';
import { MarketingAssistantStudio } from './components/MarketingAssistantStudio';
import { WorkflowStudio } from './components/WorkflowStudio';
import { BrandStudio } from './components/BrandStudio';
import { AdminDashboard } from './components/AdminDashboard';
import { TemplatesView } from './components/TemplatesView';
import { SavedProjectsView } from './components/SavedProjectsView';
import { AuthModal } from './components/AuthModal';
import { PricingModal } from './components/PricingModal';
import { CollaborationModal } from './components/CollaborationModal';
import { HelpAndSupportModal } from './components/HelpAndSupportModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { User, Project, ProjectType } from './types';

function MainApp() {
  const { user, logout, setUser, getIdToken } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [videoInputMode, setVideoInputMode] = useState<'url' | 'manual'>('url');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCollabOpen, setIsCollabOpen] = useState(false);
  const [selectedCollabProject, setSelectedCollabProject] = useState<Project | null>(null);

  // i18n & Theme state
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Sync theme with documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load projects whenever user logs in or updates
  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setProjects([]);
    }
  }, [user]);

  const loadProjects = async () => {
    const liveToken = user?.token || (await getIdToken());
    if (!liveToken) return;
    try {
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${liveToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (e) {
      console.error('Error loading projects:', e);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('molan_token');
    setProjects([]);
    await logout();
    setIsLoginOpen(true);
  };

  const handleUpdateSubscription = (tier: 'free' | 'pro' | 'enterprise') => {
    if (user) {
      setUser({
        ...user,
        tier,
        credits: user.credits + (tier === 'pro' ? 500 : tier === 'enterprise' ? 2000 : 50),
      });
    }
  };

  const handleSaveProject = async (title: string, type: ProjectType, content: any, platform: string) => {
    const liveToken = user?.token || (await getIdToken());
    if (!liveToken) return;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${liveToken}`,
        },
        body: JSON.stringify({
          title,
          type,
          platform,
          status: 'completed',
          progress: 100,
          content,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProjects([data.project, ...projects]);
      }
    } catch (e) {
      console.error('Error saving project:', e);
    }
  };

  const handleDeleteProject = async (id: string) => {
    const liveToken = user?.token || (await getIdToken());
    if (!liveToken) return;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${liveToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setProjects(projects.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error('Error deleting project:', e);
    }
  };

  // Convert AuthUser to User type expected by child components
  const legacyUser: User | null = user
    ? {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'مستخدم معلن',
        email: user.email || '',
        credits: user.credits,
        tier: user.tier || 'free',
        role: user.role,
        avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isAdmin: user.role === 'admin',
        token: user.token,
      }
    : null;

  return (
    <div
      className={`min-h-screen flex font-['Cairo'] selection:bg-amber-600 selection:text-white ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-900'
      }`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        videoInputMode={videoInputMode}
        setVideoInputMode={setVideoInputMode}
        user={legacyUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ${
          isSidebarOpen ? (lang === 'ar' ? 'lg:mr-72' : 'lg:ml-72') : ''
        }`}
      >
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          videoInputMode={videoInputMode}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          user={legacyUser}
          onOpenLogin={() => setIsLoginOpen(true)}
          onLogout={handleLogout}
          onOpenPricing={() => setIsPricingOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
        />

        <main className="flex-grow pb-12">
          {activeTab === 'dashboard' && (
            <DashboardView
              user={legacyUser}
              projects={projects}
              setActiveTab={(tab: string, subMode?: 'url' | 'manual') => {
                setActiveTab(tab);
                if (subMode) {
                  setVideoInputMode(subMode);
                }
              }}
              onOpenLogin={() => setIsLoginOpen(true)}
              onOpenPricing={() => setIsPricingOpen(true)}
              onOpenHelp={() => setIsHelpOpen(true)}
              lang={lang}
            />
          )}

           {activeTab === 'video_creator' && (
            <AiVideoCreatorStudio
              user={legacyUser}
              token={user?.token || 'demo-guest-token'}
              setUser={(u: any) => setUser(u)}
              onSaveProject={handleSaveProject}
            />
          )}

          {activeTab === 'video' && (
            <VideoGenerationStudio
              user={legacyUser}
              token={user?.token || 'demo-guest-token'}
              setUser={(u: any) => setUser(u)}
              onSaveProject={handleSaveProject}
              initialInputMode={videoInputMode}
            />
          )}

          {activeTab === 'actors' && (
            <AiActorsStudio
              onNavigateToVideoStudio={() => {
                setVideoInputMode('manual');
                setActiveTab('video');
              }}
            />
          )}

          {activeTab === 'brand' && (
            <BrandStudio
              user={legacyUser}
            />
          )}

          {activeTab === 'product_ads' && (
            <ProductAdsStudio
              user={legacyUser}
              token={user?.token || 'demo-guest-token'}
              setUser={(u: any) => setUser(u)}
              onSaveProject={handleSaveProject}
              onNavigateToVideoStudio={() => {
                setVideoInputMode('manual');
                setActiveTab('video');
              }}
            />
          )}

          {activeTab === 'image' && (
            <ImageStudio
              user={legacyUser}
              token={user?.token || 'demo-guest-token'}
              setUser={(u: any) => setUser(u)}
              onSaveProject={handleSaveProject}
            />
          )}

          {activeTab === 'copywriter' && (
            <CopywriterStudio
              user={legacyUser}
              token={user?.token || 'demo-guest-token'}
              setUser={(u: any) => setUser(u)}
              onSaveProject={handleSaveProject}
              onSendScriptToVideoStudio={() => {
                setVideoInputMode('manual');
                setActiveTab('video');
              }}
            />
          )}

          {activeTab === 'editor' && (
            <VideoEditorStudio
              user={legacyUser}
              projects={projects}
              onSaveProject={handleSaveProject}
            />
          )}

          {activeTab === 'translator' && (
            <TranslatorStudio
              user={legacyUser}
              token={user?.token || 'demo-guest-token'}
              setUser={(u: any) => setUser(u)}
              onSaveProject={handleSaveProject}
            />
          )}

          {activeTab === 'assistant' && (
            <MarketingAssistantStudio
              user={legacyUser}
              token={user?.token || 'demo-guest-token'}
              setUser={(u: any) => setUser(u)}
              onSaveProject={handleSaveProject}
            />
          )}

          {activeTab === 'workflow' && (
            <WorkflowStudio
              user={legacyUser}
              onSaveProject={handleSaveProject}
            />
          )}

          {activeTab === 'admin' && (
            <ProtectedRoute requireAdmin={true} onOpenLogin={() => setIsLoginOpen(true)}>
              <AdminDashboard
                currentUser={legacyUser}
                token={user?.token || 'demo-guest-token'}
              />
            </ProtectedRoute>
          )}

          {activeTab === 'templates' && (
            <TemplatesView
              onSelectTemplate={() => {
                setVideoInputMode('manual');
                setActiveTab('video');
              }}
            />
          )}

          {activeTab === 'projects' && (
            <SavedProjectsView
              user={legacyUser}
              projects={projects}
              onDeleteProject={handleDeleteProject}
              onOpenLogin={() => setIsLoginOpen(true)}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 py-8 text-center text-slate-500 text-xs">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="font-bold text-slate-400">
              {lang === 'ar'
                ? 'منصة معلن (MOLAN AI) - الاستوديو الإنتاجي المتكامل للإعلانات التجارية بالذكاء الاصطناعي'
                : 'MOLAN AI - Enterprise AI Video & Image Ad Production Studio'}
            </p>
            <div className="flex justify-center gap-4 text-slate-500 pt-1">
              <button onClick={() => setIsHelpOpen(true)} className="hover:text-amber-400">
                {lang === 'ar' ? 'التعليمات والدعم' : 'Help & Support'}
              </button>
              <span>·</span>
              <button onClick={() => setIsHelpOpen(true)} className="hover:text-amber-400">
                {lang === 'ar' ? 'سياسة الخصوصية والشروط' : 'Privacy & Terms'}
              </button>
            </div>
            <p>© {new Date().getFullYear()} MOLAN AI. All rights reserved.</p>
          </div>
        </footer>
      </div>

      <AuthModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        lang={lang}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        user={legacyUser}
        token={user?.token || null}
        onUpdateSubscription={handleUpdateSubscription}
        setUser={(u: any) => setUser(u)}
      />

      <CollaborationModal
        isOpen={isCollabOpen}
        onClose={() => setIsCollabOpen(false)}
        project={selectedCollabProject}
        currentUser={legacyUser}
      />

      <HelpAndSupportModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
