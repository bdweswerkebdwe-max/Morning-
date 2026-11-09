import React, { useState } from 'react';
import { FolderKanban, Trash2, Eye, FileText, Image as ImageIcon, Video, Search, Download, Copy, CheckCircle2, Globe, Layers, Bot, ShoppingBag } from 'lucide-react';
import { Project, User } from '../types';

interface SavedProjectsViewProps {
  user: User | null;
  projects: Project[];
  onDeleteProject: (id: string) => void;
  onOpenLogin: () => void;
}

export const SavedProjectsView: React.FC<SavedProjectsViewProps> = ({ user, projects, onDeleteProject, onOpenLogin }) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter((p) => {
    if (filter !== 'all' && p.type !== filter) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-amber-300 text-xs font-bold mb-3">
            <FolderKanban className="w-4 h-4" />
            <span>مكتبة الأصول الإعلانية (My Library)</span>
          </div>
          <h1 className="text-3xl font-black text-white">مكتبتي المحفوظة</h1>
          <p className="text-slate-400 text-sm mt-1">جميع الفيديوهات، الصور، السيناريوهات، وخطط التسويق المترجمة المحفوظة بحسابك</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'video', label: 'الفيديوهات' },
            { id: 'product_ad', label: 'المنتجات' },
            { id: 'image', label: 'الصور' },
            { id: 'copy', label: 'النصوص' },
            { id: 'marketing_plan', label: 'الخطط' },
            { id: 'translation', label: 'الترجمات' },
            { id: 'workflow', label: 'الأتمتة' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === tab.id
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في مشاريعك وأصولك الإعلانية..."
          className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pr-12 pl-4 py-3.5 text-white text-sm focus:outline-none focus:border-amber-500 transition"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
          <FolderKanban className="w-16 h-16 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">لا توجد أصول إعلانية بهذه التصنيفات</h3>
          <p className="text-slate-400 text-xs">قم بتوليد إعلانك الأول من الاستوديوهات ليتم حفظه هنا تلقائياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between group hover:border-amber-500/50 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-800/50 capitalize">
                    {project.type}
                  </span>
                  <span className="text-xs text-slate-500">{new Date(project.createdAt).toLocaleDateString('ar-SA')}</span>
                </div>

                <h3 className="font-bold text-white text-base line-clamp-1">{project.title}</h3>

                {project.content?.videoUrl && (
                  <div className="relative rounded-2xl overflow-hidden h-40 bg-black border border-slate-800">
                    <video src={project.content.videoUrl} className="w-full h-full object-cover" />
                  </div>
                )}

                {project.content?.imageUrl && !project.content?.videoUrl && (
                  <div className="relative rounded-2xl overflow-hidden h-40 bg-black border border-slate-800">
                    <img src={project.content.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {project.content?.generatedText && (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 line-clamp-3">
                    {project.content.generatedText}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-xs font-bold"
                >
                  <Eye className="w-4 h-4" />
                  <span>معاينة وتحميل</span>
                </button>
                <button
                  onClick={() => onDeleteProject(project.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-xl transition"
                  title="حذف الأثر الإعلاني"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-black text-white">{selectedProject.title}</h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-white font-bold text-sm bg-slate-800 px-3 py-1.5 rounded-xl"
              >
                إغلاق ✕
              </button>
            </div>

            {selectedProject.content?.videoUrl && (
              <div className="space-y-4">
                <div className="aspect-[9/16] max-h-[360px] mx-auto rounded-2xl overflow-hidden border border-slate-800 bg-black">
                  <video src={selectedProject.content.videoUrl} controls autoPlay className="w-full h-full object-cover" />
                </div>
                <a
                  href={selectedProject.content.videoUrl}
                  download="moulin-ad-video.mp4"
                  className="w-full block text-center bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl text-xs"
                >
                  تحميل فيديو الإعلان MP4 📥
                </a>
              </div>
            )}

            {selectedProject.content?.imageUrl && !selectedProject.content?.videoUrl && (
              <div className="space-y-4">
                <img src={selectedProject.content.imageUrl} alt={selectedProject.title} className="max-h-[350px] mx-auto rounded-2xl border border-slate-800" />
                <a
                  href={selectedProject.content.imageUrl}
                  download="moulin-ad-image.png"
                  className="w-full block text-center bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl text-xs"
                >
                  تحميل الصورة عالية الدقة 📥
                </a>
              </div>
            )}

            {selectedProject.content?.generatedText && (
              <div className="space-y-3">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedProject.content.generatedText}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedProject.content.generatedText);
                    alert('تم نسخ النص إلى الحافظة!');
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs"
                >
                  نسخ النص 📋
                </button>
              </div>
            )}

            {selectedProject.content?.planText && (
              <div className="space-y-3">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedProject.content.planText}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

