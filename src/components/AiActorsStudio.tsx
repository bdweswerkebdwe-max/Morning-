import React, { useState } from 'react';
import { Users, Sparkles, Play, CheckCircle2, Volume2, Plus, ShieldCheck, Filter, Upload } from 'lucide-react';
import { AIActor } from '../types';

interface AiActorsStudioProps {
  onSelectActor?: (actor: AIActor) => void;
  onNavigateToVideoStudio?: (actorId: string) => void;
}

export const AI_ACTORS_DATA: AIActor[] = [
  {
    id: 'actor_saudi_m1',
    name: 'Faisal Al-Otaibi',
    nameAr: 'فيصل العتيبي',
    gender: 'male',
    age: '28 سنة',
    dialect: 'saudi',
    dialectNameAr: 'لهجة سعودية (الرياض)',
    style: 'ugc',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    videoPreviewUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'actor_saudi_f1',
    name: 'Nouf Al-Zahrani',
    nameAr: 'نوف الزهراني',
    gender: 'female',
    age: '25 سنة',
    dialect: 'saudi',
    dialectNameAr: 'لهجة سعودية (جدة)',
    style: 'ugc',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    videoPreviewUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    id: 'actor_egy_m1',
    name: 'Kareem El-Sayed',
    nameAr: 'كريم السيد',
    gender: 'male',
    age: '32 سنة',
    dialect: 'egyptian',
    dialectNameAr: 'لهجة مصرية حماسية',
    style: 'casual',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    videoPreviewUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  },
  {
    id: 'actor_egy_f1',
    name: 'Mariam Hassan',
    nameAr: 'مريم حسن',
    gender: 'female',
    age: '27 سنة',
    dialect: 'egyptian',
    dialectNameAr: 'لهجة مصرية تسويقية',
    style: 'corporate',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'actor_uae_m1',
    name: 'Sultan Al-Shamsi',
    nameAr: 'سلطان الشامسي',
    gender: 'male',
    age: '35 سنة',
    dialect: 'emirati',
    dialectNameAr: 'لهجة إماراتية فاخرة',
    style: 'corporate',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'actor_lev_f1',
    name: 'Lina Al-Khoury',
    nameAr: 'لينا الخوري',
    gender: 'female',
    age: '24 سنة',
    dialect: 'levantine',
    dialectNameAr: 'لهجة شامية (لبنان/سورية)',
    style: 'ugc',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'actor_msa_m1',
    name: 'Tariq Mansour',
    nameAr: 'طارق منصور',
    gender: 'male',
    age: '38 سنة',
    dialect: 'msa',
    dialectNameAr: 'فصحى إخبارية ورسمية',
    style: 'traditional',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'actor_eng_f1',
    name: 'Sophia Vance',
    nameAr: 'سوفيا فانس',
    gender: 'female',
    age: '29 سنة',
    dialect: 'english',
    dialectNameAr: 'إنجليزية أمريكية بروفيسيونال',
    style: 'corporate',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
  },
];

export const AiActorsStudio: React.FC<AiActorsStudioProps> = ({ onSelectActor, onNavigateToVideoStudio }) => {
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');
  const [selectedDialect, setSelectedDialect] = useState<string>('all');
  const [previewActor, setPreviewActor] = useState<AIActor | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);

  const filteredActors = AI_ACTORS_DATA.filter(actor => {
    if (selectedGender !== 'all' && actor.gender !== selectedGender) return false;
    if (selectedDialect !== 'all' && actor.dialect !== selectedDialect) return false;
    return true;
  });

  const handleVoiceTest = (actorId: string) => {
    setIsPlayingAudio(actorId);
    setTimeout(() => {
      setIsPlayingAudio(null);
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200 text-neutral-800 px-3 py-1 rounded-full text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-neutral-600" />
              <span>مكتبة ممثلين مرخصة 100% تجارياً</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-neutral-900">
              استوديو الممثلين الافتراضيين (AI Avatars)
            </h1>
            <p className="text-sm text-neutral-600 leading-relaxed">
              اختر الممثل الإعلاني المناسب لمنتجك بعصابة رأس سعودية، لهجة مصرية، إماراتية، أو فصحى رسمية مع نبرة صوت حماسية ومطابقة للحقوق التجارية.
            </p>
          </div>
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-6 py-3.5 rounded-2xl shadow-sm transition text-sm whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>إنشاء ممثل مخصص بحقوقك</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-neutral-200 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
          <Filter className="w-4 h-4 text-neutral-600" />
          <span>تصفية الممثلين:</span>
        </div>

        {/* Gender Filter */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs">
          <button
            onClick={() => setSelectedGender('all')}
            className={`px-3 py-1.5 rounded-lg transition font-semibold ${selectedGender === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            الكل ({AI_ACTORS_DATA.length})
          </button>
          <button
            onClick={() => setSelectedGender('male')}
            className={`px-3 py-1.5 rounded-lg transition font-semibold ${selectedGender === 'male' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            ذكور
          </button>
          <button
            onClick={() => setSelectedGender('female')}
            className={`px-3 py-1.5 rounded-lg transition font-semibold ${selectedGender === 'female' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            إناث
          </button>
        </div>

        {/* Dialect Filter */}
        <select
          value={selectedDialect}
          onChange={(e) => setSelectedDialect(e.target.value)}
          className="bg-white text-neutral-800 text-xs border border-neutral-200 rounded-xl px-4 py-2 font-semibold focus:outline-none focus:border-neutral-400"
        >
          <option value="all">جميع اللهجات العربية والأجنبية</option>
          <option value="saudi">سعودي (الرياض وجدة)</option>
          <option value="egyptian">مصري تسويقي وحماسي</option>
          <option value="emirati">إماراتي وخليجي فاخر</option>
          <option value="levantine">شامي (لبنان / سوريا)</option>
          <option value="msa">فصحى إخبارية رسمية</option>
          <option value="english">إنجليزي عالمي</option>
        </select>
      </div>

      {/* Actors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredActors.map((actor) => (
          <div
            key={actor.id}
            className="group bg-white border border-neutral-200 hover:border-neutral-400 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm flex flex-col justify-between"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
              <img
                src={actor.avatarUrl}
                alt={actor.nameAr}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-transparent" />
              
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur border border-neutral-200 px-2.5 py-1 rounded-lg text-[10px] font-bold text-neutral-800">
                {actor.age}
              </div>

              {actor.videoPreviewUrl && (
                <button
                  onClick={() => setPreviewActor(actor)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-1" />
                  </div>
                </button>
              )}
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 group-hover:text-black transition">
                  {actor.nameAr}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">{actor.dialectNameAr}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                <button
                  onClick={() => handleVoiceTest(actor.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    isPlayingAudio === actor.id
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio === actor.id ? 'animate-bounce text-neutral-200' : ''}`} />
                  <span>{isPlayingAudio === actor.id ? 'جاري الاستماع...' : 'معاينة الصوت'}</span>
                </button>

                <button
                  onClick={() => {
                    if (onSelectActor) onSelectActor(actor);
                    if (onNavigateToVideoStudio) onNavigateToVideoStudio(actor.id);
                  }}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white p-2 rounded-xl transition shadow-sm"
                  title="استخدام الممثل في فيديو إعلاني"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Preview Modal */}
      {previewActor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-900">معاينة فيديو الممثل: {previewActor.nameAr}</h3>
              <button onClick={() => setPreviewActor(null)} className="text-neutral-500 hover:text-neutral-900 text-sm font-semibold">إغلاق ✕</button>
            </div>
            <div className="aspect-[9/16] bg-black rounded-2xl overflow-hidden max-h-[60vh] mx-auto">
              <video src={previewActor.videoPreviewUrl} controls autoPlay className="w-full h-full object-cover" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  if (onNavigateToVideoStudio) onNavigateToVideoStudio(previewActor.id);
                  setPreviewActor(null);
                }}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 rounded-xl transition shadow-sm"
              >
                اختيار الممثل لبدء التوليد الإعلاني 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Custom Actor Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-neutral-700" />
                <span>إنشاء ممثل افتراضي مخصص</span>
              </h3>
              <button onClick={() => setIsCustomModalOpen(false)} className="text-neutral-500 hover:text-neutral-900 font-bold">✕</button>
            </div>
            <p className="text-xs text-neutral-600">
              قم برفع صورة الشخصية وإقرار موافقة المالك، وسيقوم استوديو معلن بتدريب النموذج لإنشاء شخصية افتراضية خاصة بشركتك.
            </p>
            <div className="border-2 border-dashed border-neutral-300 hover:border-neutral-500 rounded-2xl p-6 text-center space-y-2 cursor-pointer bg-neutral-50">
              <Upload className="w-8 h-8 text-neutral-500 mx-auto" />
              <p className="text-xs font-bold text-neutral-800">اختر صورة الممثل أو اسحبها هنا</p>
              <p className="text-[10px] text-neutral-500">يدعم PNG / JPG بحجم أقصى 10MB</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>يتطلب موافقة خطية صريحة من صاحب الوجه لحماية حقوق الملكية والأمن السيبراني.</span>
            </div>
            <button
              onClick={() => {
                alert('تم إرسال طلب إنشاء الممثل المخصص بنجاح إلى فريق التدريب!');
                setIsCustomModalOpen(false);
              }}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 rounded-xl shadow-sm"
            >
              إرسال طلب التدريب 📤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
