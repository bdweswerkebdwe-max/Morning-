import React, { useState } from 'react';
import { FolderKanban, Trash2, Eye, Search } from 'lucide-react';
import { Project, User } from '../types';

interface SavedProjectsViewProps {
  user: User | null;
  projects: Project[];
  onDeleteProject: (id: string) => void;
  onOpenLogin: () => void;
}

export const SavedProjectsView: React.FC<SavedProjectsViewProps> = ({ projects, onDeleteProject }) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter((p) => {
    if (filter !== 'all' && p.type !== filter) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-neutral-900" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-md text-neutral-800 text-xs font-bold mb-2">
            <FolderKanban className="w-3.5 h-3.5 text-neutral-900" />
            <span>مكتبة الأصول الإعلانية (My Library)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">مكتبتي المحفوظة</h1>
          <p className="text-neutral-500 text-xs mt-1">جميع الفيديوهات، الصور، والسيناريوهات المحفوظة بحسابك</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5">
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === tab.id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في مشاريعك وأصولك الإعلانية..."
          className="w-full bg-white border border-neutral-200 rounded-xl pr-10 pl-4 py-2.5 text-neutral-900 text-xs focus:outline-none focus:border-neutral-900 transition"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
          <FolderKanban className="w-12 h-12 text-neutral-400 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-900">لا توجد أصول إعلانية بهذه التصنيفات</h3>
          <p className="text-neutral-500 text-xs">قم بتوليد إعلانك الأول ليتم حفظه هنا تلقائياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3 flex flex-col justify-between hover:border-neutral-400 transition shadow-2xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded bg-neutral-100 text-neutral-800 font-bold border border-neutral-200 capitalize">
                    {project.type}
                  </span>
                  <span className="text-[11px] text-neutral-400">{new Date(project.createdAt).toLocaleDateString('ar-SA')}</span>
                </div>

                <h3 className="font-bold text-neutral-900 text-sm line-clamp-1">{project.title}</h3>

                {project.content?.videoUrl && (
                  <div className="relative rounded-lg overflow-hidden h-36 bg-neutral-900 border border-neutral-200">
                    <video src={project.content.videoUrl} className="w-full h-full object-cover" />
                  </div>
                )}

                {project.content?.imageUrl && !project.content?.videoUrl && (
                  <div className="relative rounded-lg overflow-hidden h-36 bg-neutral-100 border border-neutral-200">
                    <img src={project.content.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {project.content?.generatedText && (
                  <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-xs text-neutral-700 line-clamp-3">
                    {project.content.generatedText}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="flex items-center gap-1 text-neutral-900 hover:text-neutral-700 font-bold"
                >
                  <Eye className="w-4 h-4" />
                  <span>معاينة وتحميل</span>
                </button>
                <button
                  onClick={() => onDeleteProject(project.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 rounded transition"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-xl text-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h2 className="text-base font-bold text-neutral-900">{selectedProject.title}</h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-neutral-500 hover:text-neutral-900 font-bold text-xs bg-neutral-100 px-2.5 py-1 rounded"
              >
                إغلاق ✕
              </button>
            </div>

            {selectedProject.content?.videoUrl && (
              <div className="space-y-3">
                <div className="aspect-[9/16] max-h-[350px] mx-auto rounded-lg overflow-hidden border border-neutral-200 bg-black">
                  <video src={selectedProject.content.videoUrl} controls autoPlay className="w-full h-full object-cover" />
                </div>
                <a
                  href={selectedProject.content.videoUrl}
                  download="moulin-ad-video.mp4"
                  className="w-full block text-center bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2.5 rounded-lg text-xs"
                >
                  تحميل فيديو الإعلان MP4 📥
                </a>
              </div>
            )}

            {selectedProject.content?.imageUrl && !selectedProject.content?.videoUrl && (
              <div className="space-y-3">
                <img src={selectedProject.content.imageUrl} alt={selectedProject.title} className="max-h-[320px] mx-auto rounded-lg border border-neutral-200" />
                <a
                  href={selectedProject.content.imageUrl}
                  download="moulin-ad-image.png"
                  className="w-full block text-center bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2.5 rounded-lg text-xs"
                >
                  تحميل الصورة عالية الدقة 📥
                </a>
              </div>
            )}

            {selectedProject.content?.generatedText && (
              <div className="space-y-2">
                <div className="bg-neutral-50 p-3.5 rounded-lg border border-neutral-200 text-xs text-neutral-800 whitespace-pre-wrap leading-relaxed">
                  {selectedProject.content.generatedText}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedProject.content.generatedText);
                    alert('تم نسخ النص إلى الحافظة!');
                  }}
                  className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold py-2.5 rounded-lg text-xs"
                >
                  نسخ النص 📋
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
