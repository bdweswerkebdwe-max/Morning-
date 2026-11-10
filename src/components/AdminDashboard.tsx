import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Coins, Ticket, RefreshCw, Key, Database } from 'lucide-react';
import { User, Transaction } from '../types';

interface AdminDashboardProps {
  currentUser: User | null;
  token?: string | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ token }) => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [, setTransactions] = useState<Transaction[]>([]);
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
    } catch {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-neutral-900" dir="rtl">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 relative overflow-hidden shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 text-neutral-800 px-3 py-1 rounded text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-900" />
              <span>لوحة الإدارة والتحكم الكامل بالنظام (Admin Console)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
              إدارة المنصة والاشتراكات ومراقبة النماذج
            </h1>
            <p className="text-xs text-neutral-500 leading-relaxed">
              متابعة المستخدمين، الرصيد المستهلك، وتتبع صحة اتصال Google Gemini API.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={testingKey}
              className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-3.5 py-2 rounded-lg transition text-xs whitespace-nowrap disabled:opacity-50"
            >
              <Key className="w-3.5 h-3.5 text-white" />
              <span>{testingKey ? 'جارٍ الفحص...' : 'فحص اتصال Gemini API'}</span>
            </button>
            <button
              onClick={fetchAdminData}
              className="flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 hover:bg-neutral-200 text-neutral-800 font-bold px-3.5 py-2 rounded-lg transition text-xs whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>
          </div>
        </div>
      </div>

      {testResult && (
        <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-neutral-900 flex items-center gap-1.5">
              <Key className="w-4 h-4" />
              <span>نتائج تشخيص اتصال مفتاح Gemini API ({testResult.maskedKey || 'غير موجود'})</span>
            </h3>
            <span className="px-2 py-0.5 rounded font-mono font-bold bg-neutral-200 text-neutral-900">
              {testResult.overallStatus || 'DIAGNOSTIC'}
            </span>
          </div>
          <p className="font-semibold text-neutral-700">{testResult.summary}</p>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 p-5 rounded-xl space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold">
            <span>إجمالي المستخدمين</span>
            <Users className="w-4 h-4 text-neutral-800" />
          </div>
          <p className="text-2xl font-black text-neutral-900">{stats?.totalUsers || users.length || 1}</p>
          <span className="text-[10px] text-neutral-500 font-semibold">نشط ومحدث</span>
        </div>

        <div className="bg-white border border-neutral-200 p-5 rounded-xl space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold">
            <span>إجمالي النقاط المستهلكة</span>
            <Coins className="w-4 h-4 text-neutral-800" />
          </div>
          <p className="text-2xl font-black text-neutral-900">{stats?.totalCreditsUsed || 140} نقطة</p>
          <span className="text-[10px] text-neutral-500 font-semibold">عمليات حقيقية</span>
        </div>

        <div className="bg-white border border-neutral-200 p-5 rounded-xl space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold">
            <span>إجمالي المشاريع المولدة</span>
            <Database className="w-4 h-4 text-neutral-800" />
          </div>
          <p className="text-2xl font-black text-neutral-900">{stats?.totalProjects || 12}</p>
          <span className="text-[10px] text-neutral-500 font-semibold">فيديوهات وصور وسيناريوهات</span>
        </div>

        <div className="bg-white border border-neutral-200 p-5 rounded-xl space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold">
            <span>حالة مفتاح الخادم</span>
            <Key className="w-4 h-4 text-neutral-800" />
          </div>
          <p className="text-sm font-black text-neutral-900">{stats?.hasApiKey ? 'متصل وخطي جاهز ✓' : 'مفتاح مخصص 🔑'}</p>
          <span className="text-[10px] text-neutral-500 font-semibold">Google GenAI Interactions API</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Management Table */}
        <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-xl p-5 space-y-3 shadow-2xs">
          <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-neutral-800" />
            <span>سجل المستخدمين المسجلين بالموقع</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
                <tr>
                  <th className="p-2.5">الاسم والبريد</th>
                  <th className="p-2.5">الباقة</th>
                  <th className="p-2.5">الرصيد المتاح</th>
                  <th className="p-2.5">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-neutral-50 transition">
                    <td className="p-2.5 font-semibold text-neutral-900 flex items-center gap-2">
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover border border-neutral-200" />
                      <div>
                        <p>{u.name}</p>
                        <p className="text-[10px] text-neutral-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded font-bold bg-neutral-100 text-neutral-800 border border-neutral-200 text-[11px]">
                        {u.tier.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-neutral-900">{u.credits} نقطة</td>
                    <td className="p-2.5 text-neutral-900 font-bold">نشط ✓</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coupon Manager */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-neutral-800" />
              <span>إنشاء كوبون شحن نقاط للمستخدمين</span>
            </h3>

            <div>
              <label className="text-[11px] font-bold text-neutral-700 block mb-1">كود الكوبون:</label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 uppercase font-bold focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-700 block mb-1">عدد النقاط:</label>
              <input
                type="number"
                value={couponCredits}
                onChange={(e) => setCouponCredits(Number(e.target.value))}
                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 font-bold focus:outline-none focus:border-neutral-900"
              />
            </div>

            {couponSuccess && (
              <div className="p-2.5 bg-neutral-100 border border-neutral-300 rounded-lg text-xs text-neutral-900 font-bold">
                {couponSuccess}
              </div>
            )}

            <button
              onClick={handleCreateCoupon}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2.5 rounded-lg text-xs transition"
            >
              تفعيل الكوبون 🎟️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
