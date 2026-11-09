# منصة معلن لتوليد الفيديوهات الإعلانية (Moulin AI Video Ads Platform)

منصة عربية متخصصة في توليد الفيديوهات الإعلانية التجارية الحقيقية بصيغة MP4 باستخدام نماذج الذكاء الاصطناعي المتقدمة (Gemini Omni Flash عبر Interactions API)، مع دعم كامل لإعلانات TikTok، Instagram Reels، وYouTube Shorts.

---

## 📂 شجرة ملفات المشروع (Project File Tree)

```text
├── /.env.example                 # متغيرات البيئة (GEMINI_API_KEY, PORT)
├── /.gitignore                   # الملفات المستبعدة من Git
├── /index.html                   # صفحة HTML الرئيسية (تدعم RTL وخط Cairo)
├── /metadata.json                # بيانات تعريف التطبيق والقدرات الخادمة
├── /package.json                 # التبعيات والسكربتات (Express, Vite, React, @google/genai)
├── /tsconfig.json                # إعدادات TypeScript
├── /vite.config.ts               # إعدادات مسارات وVite
├── /server.ts                    # الخادم الخلفي (Express) ومسار توليد الفيديوهات /api/ai/video-generate
├── /README.md                    # دليل التثبيت والتشغيل الشامل
└── /src
    ├── /App.tsx                  # المكون الرئيسي وتنسيق التنقل والتبويبات
    ├── /main.tsx                 # نقطة بداية تشغيل React
    ├── /index.css                # إعدادات Tailwind CSS والتصميم والتمرير
    ├── /types.ts                 # تعريف الأنواع والواجهات (TypeScript Interfaces)
    ├── /data
    │   └── /templates.ts         # قوالب الإعلانات الجاهزة للاستخدام
    └── /components
        ├── /Navbar.tsx           # شريط التنقل العلوي المخصص لاستوديو الفيديو
        ├── /DashboardView.tsx    # لوحة التحكم الرئيسية وإحصائيات الفيديوهات
        ├── /VideoGenerationStudio.tsx # الاستوديو المتكامل لتوليد الفيديوهات الإعلانية (MP4)
        ├── /TemplatesView.tsx    # مكتبة القوالب التسويقية الجاهزة
        ├── /SavedProjectsView.tsx # إدارة واستعراض وتحميل الفيديوهات المحفوظة
        └── /AuthModal.tsx        # نافذة تسجيل الدخول للمستخدمين
```

---

## 🚀 تعليمات التثبيت والتشغيل المحلي (Installation & Running)

1. **تثبيت الحزم والتبعيات:**
   ```bash
   npm install
   ```

2. **إعداد مفتاح الذكاء الاصطناعي:**
   أضف مفتاح Gemini API في ملف `.env`:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   PORT=3000
   ```

3. **تشغيل المشروع في وضع التطوير المحلي (Development):**
   ```bash
   npm run dev
   ```
   سيتم تشغيل الخادم والواجهة على الرابط: `http://localhost:3000`

4. **بناء المشروع للإنتاج (Production Build):**
   ```bash
   npm run build
   npm start
   ```
