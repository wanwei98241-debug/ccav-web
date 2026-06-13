"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, LogOut, Loader2, Shield, ChevronRight, Users, Calendar,
  BarChart3, BookOpen, Award, Zap, Download, Eye, EyeOff
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

// ---------- Types ----------
interface Enrollment {
  id: number;
  name: string;
  phone: string;
  email?: string;
  course_type: string;
  course_name?: string;
  status: string;
  created_at: string;
  source?: string;
  notes?: string;
}

interface DashboardData {
  total_enrollments: number;
  pending_enrollments: number;
  confirmed_enrollments: number;
  cancelled_enrollments: number;
  today_enrollments: number;
  total_courses: number;
  total_partners: number;
  enrollment_by_type?: Record<string, number>;
  enrollment_by_status?: Record<string, number>;
  recent_enrollments?: Array<Enrollment>;
}

// ---------- Helpers ----------
function statusLabel(status: string): string {
  const m: Record<string, string> = {
    pending: "待处理", new: "新报名", confirmed: "已确认",
    active: "进行中", cancelled: "已取消", rejected: "已拒绝",
  };
  return m[status] || status;
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    pending:   "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    new:       "bg-blue-500/20 text-blue-400 border-blue-500/30",
    confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
    active:    "bg-green-500/20 text-green-400 border-green-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    rejected:  "bg-red-500/20 text-red-400 border-red-500/30",
  };
  const c = colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${c}`}>
      {statusLabel(status)}
    </span>
  );
}

function courseTypeLabel(t: string): string {
  const m: Record<string, string> = { teacher: "教培师", partner: "合伙人", student: "学员" };
  return m[t] || t;
}

// ---------- Main Page ----------
export default function AdminAccountPage() {
  const router = useRouter();

  // Auth
  const [adminInfo, setAdminInfo] = useState<{ username: string; role: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Data
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Expand detail
  const [detailId, setDetailId] = useState<number | null>(null);

  // Init
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    const username = localStorage.getItem("admin_username") || "admin";
    const role = localStorage.getItem("admin_role") || "admin";
    setAdminInfo({ username, role });
    setAuthLoading(false);
    fetchAllData();
  }, []);

  async function fetchAllData() {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      // Fetch dashboard stats
      const statsRes = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (statsRes.status === 401) {
        localStorage.removeItem("admin_token");
        router.replace("/admin/login");
        return;
      }

      const statsData = statsRes.ok ? await statsRes.json() : null;
      const s = statsData?.data || statsData || {};

      // Fetch enrollment list
      const listRes = await fetch(`${API_BASE}/enrollment/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (listRes.status === 401) {
        localStorage.removeItem("admin_token");
        router.replace("/admin/login");
        return;
      }

      let list: Enrollment[] = [];
      if (listRes.ok) {
        const ld = await listRes.json();
        list = ld.data?.items || ld.data || ld.items || [];
      }

      setEnrollments(list);
      setDashboard({
        total_enrollments:   s.total_enrollments ?? s.total ?? list.length,
        pending_enrollments: s.pending_enrollments ?? s.pending ?? list.filter((e: Enrollment) => e.status === "pending" || e.status === "new").length,
        confirmed_enrollments: s.confirmed_enrollments ?? s.confirmed ?? list.filter((e: Enrollment) => e.status === "confirmed" || e.status === "active").length,
        cancelled_enrollments: s.cancelled_enrollments ?? s.cancelled ?? list.filter((e: Enrollment) => e.status === "cancelled" || e.status === "rejected").length,
        today_enrollments:   s.today_enrollments ?? s.today ?? 0,
        total_courses:       s.total_courses ?? 0,
        total_partners:      s.total_partners ?? 0,
        enrollment_by_type:  s.enrollment_by_type,
        enrollment_by_status: s.enrollment_by_status,
        recent_enrollments:  list.slice(0, 5),
      });
    } catch (err: any) {
      setError(err.message || "网络错误");
    } finally {
      setLoading(false);
    }
  }

  // Export CSV
  function exportCSV() {
    const headers = ["姓名", "手机号", "邮箱", "报名类型", "状态", "来源", "备注", "报名时间"];
    const rows = filtered.map((e) => [
      e.name, e.phone, e.email || "",
      courseTypeLabel(e.course_type), statusLabel(e.status),
      e.source || "", e.notes || "",
      new Date(e.created_at).toLocaleString("zh-CN"),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `报名数据_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Computed
  const filtered = enrollments
    .filter((e) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!e.name?.toLowerCase().includes(q) && !e.phone?.includes(q)) return false;
      }
      if (statusFilter && e.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const selected = detailId ? enrollments.find((e) => e.id === detailId) : null;

  // Auth loading
  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[#f8fafc]" style={{ background: "#f8fafc" }}>
      {/* ========= Admin Header ========= */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">CCAV 报名管理</h1>
              <p className="text-xs text-gray-400">{adminInfo?.username} · {adminInfo?.role}</p>
            </div>
          </div>
          <button
            onClick={() => { localStorage.removeItem("admin_token"); router.replace("/admin/login"); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ========= Stats Row ========= */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "总报名", value: dashboard.total_enrollments, cls: "text-blue-600", bg: "bg-blue-50" },
              { label: "待处理", value: dashboard.pending_enrollments, cls: "text-yellow-600", bg: "bg-yellow-50" },
              { label: "今日新增", value: dashboard.today_enrollments, cls: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "已确认", value: dashboard.confirmed_enrollments, cls: "text-green-600", bg: "bg-green-50" },
            ].map((s) => (
              <div key={s.label} className={`p-4 rounded-xl ${s.bg} border border-gray-200`}>
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className={`text-2xl font-bold mt-1 ${s.cls}`}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* ========= Search + Filter + Export ========= */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              placeholder="搜索姓名、手机号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 focus:outline-none focus:border-blue-400"
          >
            <option value="">全部状态</option>
            <option value="new">新报名</option>
            <option value="pending">待处理</option>
            <option value="confirmed">已确认</option>
            <option value="cancelled">已取消</option>
          </select>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            导出CSV
          </button>
          <button
            onClick={fetchAllData}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            刷新
          </button>
        </div>

        {/* ========= Error ========= */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ========= Loading ========= */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {/* ========= Enrollment List ========= */}
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">暂无报名记录</div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-gray-400 mb-2 px-1">共 {filtered.length} 条记录</div>
            {filtered.map((e) => (
              <div key={e.id} className="rounded-xl bg-white border border-gray-200 shadow-sm">
                {/* Row header — click to toggle expand */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setDetailId(detailId === e.id ? null : e.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                      {e.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{e.name}</span>
                        {statusBadge(e.status)}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {e.phone} | {courseTypeLabel(e.course_type)} | {new Date(e.created_at).toLocaleDateString("zh-CN")}
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm">{detailId === e.id ? "▲" : "▼"}</span>
                </div>

                {/* Detail expand */}
                {detailId === e.id && selected && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2.5 rounded-lg bg-gray-50">
                        <div className="text-xs text-gray-400 mb-0.5">手机号</div>
                        <div className="text-gray-700">{selected.phone}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-gray-50">
                        <div className="text-xs text-gray-400 mb-0.5">邮箱</div>
                        <div className="text-gray-700">{selected.email || "未填写"}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-gray-50">
                        <div className="text-xs text-gray-400 mb-0.5">报名类型</div>
                        <div className="text-gray-700">{courseTypeLabel(selected.course_type)}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-gray-50">
                        <div className="text-xs text-gray-400 mb-0.5">报名时间</div>
                        <div className="text-gray-700">
                          {new Date(selected.created_at).toLocaleString("zh-CN")}
                        </div>
                      </div>
                      {selected.source && (
                        <div className="p-2.5 rounded-lg bg-gray-50">
                          <div className="text-xs text-gray-400 mb-0.5">来源</div>
                          <div className="text-gray-700">{selected.source}</div>
                        </div>
                      )}
                      {selected.notes && (
                        <div className={selected.source ? "p-2.5 rounded-lg bg-gray-50" : "col-span-2 p-2.5 rounded-lg bg-gray-50"}>
                          <div className="text-xs text-gray-400 mb-0.5">备注</div>
                          <div className="text-gray-700">{selected.notes}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ========= Quick Stats (bottom row) ========= */}
        {dashboard && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {/* Status distribution */}
            <div className="p-5 rounded-xl bg-white border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
               报名状态分布
              </h3>
              {dashboard.enrollment_by_status && Object.keys(dashboard.enrollment_by_status).length > 0 ? (
                <div className="space-y-2.5">
                  {Object.entries(dashboard.enrollment_by_status).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-16">{statusLabel(k)}</span>
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${Math.min(100, (v / (dashboard.total_enrollments || 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-6 text-right">{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-400 py-4 text-center">
                  暂无统计
                </div>
              )}
            </div>

            {/* Type distribution */}
            <div className="p-5 rounded-xl bg-white border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
               报名类型分布
              </h3>
              {dashboard.enrollment_by_type && Object.keys(dashboard.enrollment_by_type).length > 0 ? (
                <div className="space-y-2.5">
                  {Object.entries(dashboard.enrollment_by_type).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-16">{courseTypeLabel(k)}</span>
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${Math.min(100, (v / (dashboard.total_enrollments || 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-6 text-right">{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-400 py-4 text-center">
                  暂无统计
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
