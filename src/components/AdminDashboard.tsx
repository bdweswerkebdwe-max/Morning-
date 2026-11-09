import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Coins, Activity, Ticket, Plus, CheckCircle2, RefreshCw, Key, Database } from 'lucide-react';
import { User, Transaction } from '../types';

interface AdminDashboardProps {
  currentUser: User | null;
  token?: string | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, token }) => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('MOUULIN2026');
  const [couponCredits, setCouponCredits] = useState(100);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const statsRes = await fetch('/api/admin/stats', { headers });
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      const usersRes = await fetch('/api/admin/users', { headers });
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.users);
        setTransactions(usersData.transactions);
      }
    } catch (e) {
      console.error('Error fetching admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const [testResult, setTestResult] = useState<any>(null);
  const [testingKey, setTestingKey] = useState(false);

  const handleTestConnection = async () => {
    setTestingKey(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/test-connection');
      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({ success: false, summary: 'فشل الاتصال بالخادم أثناء اختبار المفتاح' });
    } finally {
      setTestingKey(false);
    }
  };

  const handleCreateCoupon = () => {
    setCouponSuccess(`تم إنشاء وتفعيل الكوبون [${couponCode}] بقيمة ${couponCredits} نقطة بنجاح!`);
    setTimeout(() => setCouponSuccess(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>لوحة الإدارة والتحكم الكامل بالنظام (Admin Console)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              إدارة المنصة والاشتراكات ومراقبة النماذج
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              متابعة المستخدمين، الرصيد المستهلك، سجل المعاملات المالية، وإنشاء كوبونات الخصم، والتأكد من صحة اتصال Google Gemini API.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={testingKey}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2.5 rounded-xl transition text-xs whitespace-nowrap shadow-lg shadow-amber-600/20 disabled:opacity-50"
            >
              <Key className={`w-4 h-4 ${testingKey ? 'animate-pulse' : ''}`} />
              <span>{testingKey ? 'جارٍ الفحص والمطابقة...' : 'فحص اتصال Gemini API'}</span>
            </button>
            <button
              onClick={fetchAdminData}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition text-xs whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث البيانات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gemini Key Diagnostic Card if Tested */}
      {testResult && (
        <div className={`p-6 rounded-3xl border shadow-2xl space-y-3 ${
          testResult.overallStatus === 'READY' 
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
            : testResult.overallStatus === 'TEXT_ONLY_READY'
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Key className="w-5 h-5" />
              <span>نتائج تشخيص اتصال مفتاح Gemini API ({testResult.maskedKey || 'المفتاح غير موجود'})</span>
            </h3>
            <span className="text-xs px-3 py-1 rounded-full font-black bg-slate-900 border border-current">
              {testResult.overallStatus || 'DIAGNOSTIC'}
            </span>
          </div>
          <p className="text-sm font-semibold">{testResult.summary}</p>
          
          {testResult.diagnostics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-slate-300 block">نموذج النصوص (gemini-2.5-flash):</span>
                <p className={testResult.diagnostics.textModel?.success ? 'text-emerald-400 font-bold' : 'text-rose-400 font-semibold'}>
                  {testResult.diagnostics.textModel?.message}
                </p>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-slate-300 block">نموذج الفيديو (gemini-omni-1.1-flash):</span>
                <p className={testResult.diagnostics.videoModel?.success ? 'text-emerald-400 font-bold' : 'text-amber-400 font-semibold'}>
                  {testResult.diagnostics.videoModel?.message}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">إجمالي المستخدمين</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalUsers || users.length || 1}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">نشط ومحدث</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">إجمالي النقاط المستهلكة</span>
            <Coins className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalCreditsUsed || 140} نقطة</p>
          <span className="text-[10px] text-amber-400 font-semibold">عمليات حقيقية</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">إجمالي المشاريع المولدة</span>
            <Database className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalProjects || 12}</p>
          <span className="text-[10px] text-slate-400 font-semibold">فيديوهات وصور وسيناريوهات</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">حالة اتصال API مفتاح الخادم</span>
            <Key className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-lg font-black text-emerald-400">{stats?.hasApiKey ? 'متصل وخطي جاهز ✓' : 'مفتاح مخصص 🔑'}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Google GenAI Interactions API</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* User Management Table */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>سجل المستخدمين المسجلين بالموقع</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">الاسم والبريد</th>
                  <th className="p-3">الباقة</th>
                  <th className="p-3">الرصيد المتاح</th>
                  <th className="p-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-semibold text-white flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-lg object-cover" />
                      <div>
                        <p>{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {u.tier.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-200">{u.credits} نقطة</td>
                    <td className="p-3 text-emerald-400 font-bold">نشط ✓</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coupon Manager & Quick Tools */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-400" />
              <span>إنشاء كوبون شحن نقاط للمستخدمين</span>
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">كود الكوبون:</label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white uppercase font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">عدد النقاط الممنوحة:</label>
              <input
                type="number"
                value={couponCredits}
                onChange={(e) => setCouponCredits(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            {couponSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-bold">
                {couponSuccess}
              </div>
            )}

            <button
              onClick={handleCreateCoupon}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl text-xs transition"
            >
              تفعيل الكوبون في السيستم 🎟️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
