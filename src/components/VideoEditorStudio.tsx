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
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold">
            <Edit3 className="w-4 h-4" />
            <span>محرر الفيديو والمونتاج الإعلاني</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            استوديو مونتاج وتحسين الفيديوهات (Video Studio Editor)
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            أضف الترجمات المصممة التلقائية (Subtitles)، والموسيقى التفاعلية، والشعار المائي، ونسّق الفيديو للإعلانات.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Controls */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          {/* Project Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">اختر الفيديو المراد تعديله ومونتاجه:</label>
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const found = videoProjects.find(p => p.id === e.target.value);
                if (found) setSelectedProject(found);
              }}
              className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-800 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-cyan-500"
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
            <label className="text-xs font-bold text-slate-300 block flex items-center gap-1.5">
              <Type className="w-4 h-4 text-cyan-400" />
              <span>نمط الخط والترجمة الحركية (Animated Captions):</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSubtitleStyle('yellow_bold')}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  subtitleStyle === 'yellow_bold'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                خط أصفر عريض (TikTok Style)
              </button>

              <button
                onClick={() => setSubtitleStyle('white_shadow')}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  subtitleStyle === 'white_shadow'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                أبيض مع ظلال سوداء
              </button>

              <button
                onClick={() => setSubtitleStyle('gradient_box')}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  subtitleStyle === 'gradient_box'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                صندوق تدرج ملون (Clean Box)
              </button>
            </div>
          </div>

          {/* Background Audio Track */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block flex items-center gap-1.5">
              <Music className="w-4 h-4 text-cyan-400" />
              <span>الموسيقى الخلفية الإعلانية:</span>
            </label>
            <select
              value={musicTrack}
              onChange={(e) => setMusicTrack(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-800 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="upbeat_commercial">حماسية تجارية (Upbeat Commercial)</option>
              <option value="cinematic_ambient">سينمائية هادئة (Cinematic Ambient)</option>
              <option value="luxury_lounge">فاخرة ومستقلة (Luxury Lounge)</option>
              <option value="none">بدون موسيقى (صوت المتحدث فقط)</option>
            </select>
          </div>

          {/* Watermark Logo */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">نص الشعار أو العلامة المائية:</label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="علامتك التجاري..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-cyan-600/30 transition flex items-center justify-center gap-2"
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
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl min-h-[480px]">
          <h3 className="text-sm font-bold text-slate-200">معاينة المحرر التفاعلية</h3>

          <div className="relative aspect-[9/16] max-h-[400px] mx-auto rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-2xl my-auto">
            <video src={videoUrl} controls className="w-full h-full object-cover" />

            {/* Live Subtitle Overlay Simulation */}
            <div className="absolute bottom-10 left-4 right-4 text-center pointer-events-none">
              <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-black tracking-wide shadow-xl ${
                subtitleStyle === 'yellow_bold' ? 'bg-amber-400 text-slate-950 uppercase' :
                subtitleStyle === 'white_shadow' ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]' :
                'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
              }`}>
                شاهد النتيجة الذهبية الآن 🚀
              </span>
            </div>

            {/* Live Watermark Overlay */}
            {watermarkText && (
              <div className="absolute top-4 right-4 bg-slate-950/70 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-200 border border-slate-700/50">
                {watermarkText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
