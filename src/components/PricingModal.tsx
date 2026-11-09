import React, { useState } from 'react';
import { Sparkles, Check, X, Zap, Crown, Shield } from 'lucide-react';
import { User } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  token?: string | null;
  setUser?: (user: User) => void;
  onUpdateSubscription: (tier: 'free' | 'pro' | 'enterprise') => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, user, token, setUser, onUpdateSubscription }) => {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectTier = async (tier: 'free' | 'pro' | 'enterprise') => {
    setLoadingTier(tier);
    try {
      const res = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.user && setUser) {
          setUser(data.user);
        }
        onUpdateSubscription(tier);
        onClose();
      }
    } catch (e) {
      console.error('Subscription error:', e);
    } finally {
      setLoadingTier(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'الباقة المجانية',
      price: '0$',
      credits: '50 نقطة',
      features: ['توليد حتى 5 فيديوهات شهرياً', 'دقة 720p مقبولة', 'مقاس 9:16 و 1:1', 'دعم فني عبر البريد'],
      color: 'border-slate-800 bg-slate-950',
      btnText: 'باقتك الحالية',
    },
    {
      id: 'pro',
      name: 'باقة المحترفين (Pro)',
      price: '29$',
      credits: '500 نقطة',
      features: ['توليد حتى 50 فيديو شهرياً', 'دقة عالية HD و 4K', 'جميع المقاسات (9:16, 1:1, 16:9)', 'تعليق صوتي وموسيقى متقدمة', 'أولوية قصوى في خوادم التوليد'],
      color: 'border-amber-500/50 bg-slate-900 shadow-xl shadow-amber-500/10',
      btnText: 'ترقية إلى محترف',
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'باقة الشركات (Enterprise)',
      price: '99$',
      credits: '2000 نقطة',
      features: ['فيديوهات غير محدودة التقريب', 'دعم نماذج Omni المتقدمة', 'أدوات مخصصة للعلامة التجارية', 'مدير حساب خاص وتدريب فردي'],
      color: 'border-purple-500/50 bg-slate-950',
      btnText: 'اشتراك الشركات',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-8 space-y-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />

        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>ترقية الباقة ورصيد النقاط</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">اختر الباقة المناسبة لأعمالك</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = user?.tier === plan.id;
            return (
              <div key={plan.id} className={`border rounded-3xl p-6 flex flex-col justify-between relative ${plan.color}`}>
                {plan.popular && (
                  <span className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                    الأكثر طلباً ⭐
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-black text-white">{plan.price}</span>
                      <span className="text-xs text-slate-400">/ شهرياً</span>
                    </div>
                    <p className="text-xs text-amber-400 font-bold mt-1">{plan.credits}</p>
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800">
                  <button
                    disabled={isCurrent || loadingTier === plan.id}
                    onClick={() => handleSelectTier(plan.id as any)}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition ${
                      isCurrent
                        ? 'bg-slate-800 text-slate-400 cursor-default'
                        : plan.popular
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {isCurrent ? 'باقتك الحالية' : loadingTier === plan.id ? 'جاري التفعيل...' : plan.btnText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coupon Code Redeem Section */}
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>هل لديك كود كوبون أو رمز ترويجي؟</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">جرب إدخال كود التجربة الترحيبي <code className="text-amber-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded">MOUULIN2026</code> وشحن رصيدك فوراً!</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              id="couponInput"
              placeholder="كود الكوبون..."
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white uppercase font-bold focus:outline-none focus:border-amber-500 w-full sm:w-44"
            />
            <button
              onClick={async () => {
                const input = (document.getElementById('couponInput') as HTMLInputElement)?.value;
                if (!input) return;
                try {
                  const res = await fetch('/api/coupons/redeem', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ code: input }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert(data.message);
                    if (data.user && setUser) {
                      setUser(data.user);
                    }
                    onUpdateSubscription(user?.tier || 'free');
                  } else {
                    alert(data.error);
                  }
                } catch (e: any) {
                  alert('فشل تفعيل الكوبون');
                }
              }}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs whitespace-nowrap shadow transition"
            >
              شحن الكوبون 🎟️
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs">
          بوابات الدفع الإلكترونية آمنة ومشفرة بالكامل. يمكنك إلغاء الاشتراك في أي وقت.
        </p>
      </div>
    </div>
  );
};

