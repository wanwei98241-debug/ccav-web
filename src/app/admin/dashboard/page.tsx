"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  BarChart3, Users, TrendingUp, Calendar, Loader2, AlertCircle,
  RefreshCw, ArrowLeft, ChevronRight, BookOpen, DollarSign,
  Activity, PieChart, Target
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface DashboardStats {
  total_enrollments: number;
  today_enrollments: number;
  pending_enrollments: number;
  confirmed_enrollments: number;
  cancelled_enrollments: number;
  teacher_enrollments: number;
  partner_enrollments: number;
  [key: string]: any;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    fetchStats(token);
  }, []);

  async function fetchStats(token: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        if (res.status === 401) {
          localStorage.removeItem("admin_token");
          router.replace("/admin/login");
          return;
        }
        setError(d.error || `请求失败 (${res.status})`);
        return;
      }
      const data = await res.json();
      setStats(data.data || data);
    } catch (err: any) {
      setError(err.message || "网络错误");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 min-h-screen flex items-center justify-center" style={{ background: "#0d1117" }}>
          <Loader2 className="w-8 h-8 text-[#e53e3e] animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  const s = stats || {
    total_enrollments: 0, today_enrollments: 0, pending_enrollments: 0,
    confirmed_enrollments: 0, cancelled_enrollments: 0,
    teacher_enrollments: 0, partner_enrollments: 0,
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen pt-24 pb-16" style={{ background: "#0d1117" }}>
        <div className="max-w-5xl mx-auto px-4">
          {/* 顶部导航 */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/admin/account"
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">数据看板</h1>
              <p className="text-sm text-gray-500">报名统计与分析</p>
            </div>
            <button
              onClick={() => {
                const token = localStorage.getItem("admin_token");
                if (token) fetchStats(token);
              }}
              className="ml-auto p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              title="刷新"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* 核心指标 */}
          <h2 className="text-sm font-semibold text-gray-300 mb-3 px-1">核心指标</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="总报名数"
              value={s.total_enrollments}
              color="from-[#e53e3e] to-[#ff6b6b]"
            />
            <StatCard
              icon={<Activity className="w-5 h-5" />}
              label="今日新增"
              value={s.today_enrollments}
              color="from-blue-500 to-blue-400"
            />
            <StatCard
              icon={<Target className="w-5 h-5" />}
              label="待处理"
              value={s.pending_enrollments}
              color="from-yellow-500 to-orange-400"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="已确认"
              value={s.confirmed_enrollments}
              color="from-green-500 to-emerald-400"
            />
          </div>

          {/* 报名类型分布 */}
          <h2 className="text-sm font-semibold text-gray-300 mb-3 px-1">报名类型分布</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-xl bg-[#161b22] border border-white/10">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <BookOpen className="w-4 h-4" />
                教培师培训
              </div>
              <div className="text-2xl font-bold text-white">{s.teacher_enrollments}</div>
              <div className="text-xs text-gray-500 mt-1">
                {s.total_enrollments > 0
                  ? `${((s.teacher_enrollments / s.total_enrollments) * 100).toFixed(1)}%`
                  : "0%"}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#161b22] border border-white/10">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Target className="w-4 h-4" />
                城市合伙人
              </div>
              <div className="text-2xl font-bold text-white">{s.partner_enrollments}</div>
              <div className="text-xs text-gray-500 mt-1">
                {s.total_enrollments > 0
                  ? `${((s.partner_enrollments / s.total_enrollments) * 100).toFixed(1)}%`
                  : "0%"}
              </div>
            </div>
          </div>

          {/* 状态分布 */}
          <h2 className="text-sm font-semibold text-gray-300 mb-3 px-1">状态分布</h2>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatusCard label="待处理" value={s.pending_enrollments} color="text-yellow-400" bg="bg-yellow-500/10" />
            <StatusCard label="已确认" value={s.confirmed_enrollments} color="text-green-400" bg="bg-green-500/10" />
            <StatusCard label="已取消" value={s.cancelled_enrollments} color="text-gray-400" bg="bg-gray-500/10" />
          </div>

          {/* 快捷操作 */}
          <h2 className="text-sm font-semibold text-gray-300 mb-3 px-1">快捷操作</h2>
          <div className="flex gap-3">
            <Link
              href="/admin/enrollments"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e53e3e] text-white text-sm font-medium hover:bg-[#c53030] transition-colors"
            >
              <Users className="w-4 h-4" />
              查看报名列表
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="p-4 rounded-xl bg-[#161b22] border border-white/10">
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
    </div>
  );
}

function StatusCard({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div className={`p-4 rounded-xl ${bg} border border-white/10 text-center`}>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
