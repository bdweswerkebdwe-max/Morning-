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
      <div className="flex items-center justify-center p-12 text-neutral-500 text-xs gap-3">
        <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
        <span>جاري التحقق من صلاحيات الدخول...</span>
      </div>
    );
  }

  if (!user) {
    if (fallbackView) {
      return <>{fallbackView}</>;
    }

    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-neutral-200 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-800 flex items-center justify-center mx-auto text-xl">
          🔒
        </div>
        <h3 className="text-xl font-black text-neutral-900">يتطلب تسجيل الدخول</h3>
        <p className="text-xs text-neutral-600 leading-relaxed">
          يرجى تسجيل الدخول أو إنشاء حساب جديد للوصول إلى أدوات واستوديوهات الذكاء الاصطناعي ومتابعة رصيدك.
        </p>
        <button
          onClick={onOpenLogin}
          className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs shadow-sm transition"
        >
          تسجيل الدخول / حساب جديد
        </button>
      </div>
    );
  }

  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-red-200 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto text-xl">
          🚫
        </div>
        <h3 className="text-xl font-black text-neutral-900">غير مصرح بالوصول</h3>
        <p className="text-xs text-neutral-600 leading-relaxed">
          هذه الصفحة مخصصة لمدراء المنصة فقط. ليس لديك صلاحيات إدارية للوصول إلى هذه اللوحة.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
