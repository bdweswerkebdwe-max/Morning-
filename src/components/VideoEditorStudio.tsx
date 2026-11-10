import React, { useState } from 'react';
import { Edit3, Play, Download, Music, Type, Layers, Volume2, Sparkles, CheckCircle2, Film } from 'lucide-react';
import { User, Project } from '../types';

interface VideoEditorStudioProps {
  user: User | null;
  projects: Project[];
  onSaveProject: (title: string, type: any, content: any, platform: string) => void;
}

export const VideoEditorStudio: React.FC<VideoEditorStudioProps> = ({ user, projects, onSaveProject }) => {
  const videoProjects = projects.filter(p => p.type === 'video' || p.type === 'product_ad' || p.type === 'actor_video');
  const [selectedProject, setSelectedProject] = useState<Project | null>(videoProjects[0] || null);

  // Editor states
  const [subtitleStyle, setSubtitleStyle] = useState<'yellow_bold' | 'white_shadow' | 'gradient_box'>('yellow_bold');
  const [musicTrack, setMusicTrack] = useState('upbeat_commercial');
  const [watermarkText, setWatermarkText] = useState('MOLAN AI');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const videoUrl = selectedProject?.content?.videoUrl || 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('تم تصدير الفيديو المحرر بنجاح بحفظ الإعدادات والنصوص!');
      onSaveProject(
        `فيديو محرر: ${selectedProject?.title || 'مشروع معدل'}`,
        'video',
        { ...selectedProject?.content, subtitleStyle, musicTrack, watermarkText },
        '9:16'
      );
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200 text-neutral-800 px-3 py-1 rounded-full text-xs font-bold">
            <Edit3 className="w-4 h-4 text-neutral-600" />
            <span>محرر الفيديو والمونتاج الإعلاني</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900">
            استوديو مونتاج وتحسين الفيديوهات (Video Studio Editor)
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            أضف الترجمات المصممة التلقائية (Subtitles)، والموسيقى التفاعلية، والشعار المائي، ونسّق الفيديو للإعلانات.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Controls */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-3xl p-6 space-y-6 shadow-sm">
          {/* Project Selector */}
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-2">اختر الفيديو المراد تعديله ومونتاجه:</label>
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const found = videoProjects.find(p => p.id === e.target.value);
                if (found) setSelectedProject(found);
              }}
              className="w-full bg-white text-neutral-900 text-xs border border-neutral-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-neutral-400"
            >
              {videoProjects.length === 0 ? (
                <option value="">لا توجد فيديوهات سابقة، تم إدراج فيديو عينة للاختبار</option>
              ) : (
                videoProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.title} ({p.platform || '9:16'})</option>
                ))
              )}
            </select>
          </div>

          {/* Subtitle Style Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-700 block flex items-center gap-1.5">
              <Type className="w-4 h-4 text-neutral-600" />
              <span>نمط الخط والترجمة الحركية (Animated Captions):</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSubtitleStyle('yellow_bold')}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  subtitleStyle === 'yellow_bold'
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                خط أصفر عريض (TikTok Style)
              </button>

              <button
                onClick={() => setSubtitleStyle('white_shadow')}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  subtitleStyle === 'white_shadow'
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                أبيض مع ظلال سوداء
              </button>

              <button
                onClick={() => setSubtitleStyle('gradient_box')}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  subtitleStyle === 'gradient_box'
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                صندوق تدرج ملون (Clean Box)
              </button>
            </div>
          </div>

          {/* Background Audio Track */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-700 block flex items-center gap-1.5">
              <Music className="w-4 h-4 text-neutral-600" />
              <span>الموسيقى الخلفية الإعلانية:</span>
            </label>
            <select
              value={musicTrack}
              onChange={(e) => setMusicTrack(e.target.value)}
              className="w-full bg-white text-neutral-900 text-xs border border-neutral-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-neutral-400"
            >
              <option value="upbeat_commercial">حماسية تجارية (Upbeat Commercial)</option>
              <option value="cinematic_ambient">سينمائية هادئة (Cinematic Ambient)</option>
              <option value="luxury_lounge">فاخرة ومستقلة (Luxury Lounge)</option>
              <option value="none">بدون موسيقى (صوت المتحدث فقط)</option>
            </select>
          </div>

          {/* Watermark Logo */}
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1.5">نص الشعار أو العلامة المائية:</label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="علامتك التجاري..."
              className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400"
            />
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-4 rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>جاري معالجة وتصدير الفيديو المحرر...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>تصدير الفيديو النهائي المكتمل</span>
              </>
            )}
          </button>
        </div>

        {/* Video Canvas Preview */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm min-h-[480px]">
          <h3 className="text-sm font-bold text-neutral-900">معاينة المحرر التفاعلية</h3>

          <div className="relative aspect-[9/16] max-h-[400px] mx-auto rounded-2xl overflow-hidden border border-neutral-200 bg-black shadow-lg my-auto">
            <video src={videoUrl} controls className="w-full h-full object-cover" />

            {/* Live Subtitle Overlay Simulation */}
            <div className="absolute bottom-10 left-4 right-4 text-center pointer-events-none">
              <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-black tracking-wide shadow-md ${
                subtitleStyle === 'yellow_bold' ? 'bg-amber-400 text-neutral-900 uppercase' :
                subtitleStyle === 'white_shadow' ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]' :
                'bg-neutral-900 text-white shadow-lg'
              }`}>
                شاهد النتيجة الذهبية الآن 🚀
              </span>
            </div>

            {/* Live Watermark Overlay */}
            {watermarkText && (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold text-neutral-800 border border-neutral-200">
                {watermarkText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
