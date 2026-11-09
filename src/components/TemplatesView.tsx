import React from 'react';
import { Layers, Sparkles, ArrowLeft, ShoppingBag, Home, Utensils, Cpu, Dumbbell } from 'lucide-react';
import { POPULAR_TEMPLATES } from '../data/templates';
import { Template } from '../types';

interface TemplatesViewProps {
  onSelectTemplate: (template: Template) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onSelectTemplate }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag': return ShoppingBag;
      case 'Home': return Home;
      case 'Utensils': return Utensils;
      case 'Cpu': return Cpu;
      case 'Dumbbell': return Dumbbell;
      default: return Layers;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-indigo-300 text-xs font-bold mb-3">
            <Sparkles className="w-4 h-4" />
            <span>مكتبة القوالب التسويقية الجاهزة</span>
          </div>
          <h1 className="text-3xl font-black text-white">قوالب الإعلانات الاحترافية</h1>
          <p className="text-slate-400 text-sm mt-1">اختر قالباً جاهزاً ومصمماً بعناية لاختصار وقتك وبدء حملتك الإعلانية فوراً</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {POPULAR_TEMPLATES.map((tpl) => {
          const IconComponent = getIcon(tpl.icon);
          return (
            <div
              key={tpl.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
                    {tpl.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{tpl.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{tpl.description}</p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500">منصة: {tpl.platform}</span>
                <button
                  onClick={() => onSelectTemplate(tpl)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
                >
                  <span>استخدام القالب</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
