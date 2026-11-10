import React, { useState } from 'react';
import { Sparkles, Check, X, Zap } from 'lucide-react';
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
      features: ['توليد حتى 5 فيديوهات شهرياً', 'دقة 720p', 'مقاس 9:16 و 1:1', 'دعم فني عبر البريد'],
      btnText: 'باقتك الحالية',
    },
    {
      id: 'pro',
      name: 'باقة المحترفين (Pro)',
      price: '29$',
      credits: '500 نقطة',
      features: ['توليد حتى 50 فيديو شهرياً', 'دقة عالية HD و 4K', 'جميع المقاسات (9:16, 1:1, 16:9)', 'تعليق صوتي وموسيقى متقدمة', 'أولوية قصوى في خوادم التوليد'],
      btnText: 'ترقية إلى محترف',
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'باقة الشركات (Enterprise)',
      price: '99$',
      credits: '2000 نقطة',
      features: ['فيديوهات غير محدودة', 'دعم نماذج Omni المتقدمة', 'أدوات مخصصة للعلامة التجارية', 'مدير حساب خاص وتدريب فردي'],
      btnText: 'اشتراك الشركات',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-200 rounded-xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-xl relative max-h-[90vh] overflow-y-auto text-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 px-3 py-1 rounded text-neutral-800 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
              <span>ترقية الباقة ورصيد النقاط</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900">اختر الباقة المناسبة لأعمالك</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 bg-neutral-100 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const isCurrent = user?.tier === plan.id;
            return (
              <div key={plan.id} className={`border rounded-xl p-5 flex flex-col justify-between relative bg-white ${
                plan.popular ? 'border-neutral-900 shadow-xs' : 'border-neutral-200'
              }`}>
                {plan.popular && (
                  <span className="absolute -top-3 right-4 bg-neutral-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-xs">
                    الأكثر طلباً
                  </span>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-neutral-900">{plan.price}</span>
                      <span className="text-xs text-neutral-500">/ شهرياً</span>
                    </div>
                    <p className="text-xs text-neutral-700 font-bold mt-0.5">{plan.credits}</p>
                  </div>

                  <ul className="space-y-2 pt-3 border-t border-neutral-100 text-xs text-neutral-600">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-100">
                  <button
                    disabled={isCurrent || loadingTier === plan.id}
                    onClick={() => handleSelectTier(plan.id as any)}
                    className={`w-full py-2.5 rounded-lg font-bold text-xs transition ${
                      isCurrent
                        ? 'bg-neutral-100 text-neutral-400 cursor-default'
                        : plan.popular
                        ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900'
                    }`}
                  >
                    {isCurrent ? 'باقتك الحالية' : loadingTier === plan.id ? 'جاري التفعيل...' : plan.btnText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coupon Code Section */}
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-neutral-800" />
              <span>هل لديك كود كوبون أو رمز ترويجي؟</span>
            </h4>
            <p className="text-[11px] text-neutral-500 mt-0.5">جرب إدخال كود التجربة الترحيبي <code className="text-neutral-900 font-bold bg-neutral-200 px-1 py-0.5 rounded">MOUULIN2026</code> وشحن رصيدك فوراً!</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              id="couponInput"
              placeholder="كود الكوبون..."
              className="bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 uppercase font-bold focus:outline-none focus:border-neutral-900 w-full sm:w-36"
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
                } catch {
                  alert('فشل تفعيل الكوبون');
                }
              }}
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-4 py-2 rounded-lg text-xs whitespace-nowrap transition"
            >
              تفعيل الكوبون
            </button>
          </div>
        </div>

        <p className="text-center text-neutral-400 text-[11px]">
          بوابات الدفع الإلكترونية آمنة ومشفرة بالكامل. يمكنك إلغاء الاشتراك في أي وقت.
        </p>
      </div>
    </div>
  );
};
