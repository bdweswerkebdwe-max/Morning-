import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  onOpenLogin?: () => void;
  fallbackView?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  onOpenLogin,
  fallbackView,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 text-xs gap-3">
        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span>جاري التحقق من صلاحيات الدخول...</span>
      </div>
    );
  }

  if (!user) {
    if (fallbackView) {
      return <>{fallbackView}</>;
    }

    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          🔒
        </div>
        <h3 className="text-xl font-black text-white">يتطلب تسجيل الدخول</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          يرجى تسجيل الدخول أو إنشاء حساب جديد للوصول إلى أدوات واستوديوهات الذكاء الاصطناعي ومتابعة رصيدك.
        </p>
        <button
          onClick={onOpenLogin}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition"
        >
          تسجيل الدخول / حساب جديد
        </button>
      </div>
    );
  }

  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-red-500/40 text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
          🚫
        </div>
        <h3 className="text-xl font-black text-white">غير مصرح بالوصول</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          هذه الصفحة مخصصة لمدراء المنصة فقط. ليس لديك صلاحيات إدارية للوصول إلى هذه اللوحة.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
