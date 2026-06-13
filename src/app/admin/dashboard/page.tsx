"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

interface DashboardData {
  total_enrollments?: number;
  pending_enrollments?: number;
  confirmed_enrollments?: number;
  cancelled_enrollments?: number;
  today_enrollments?: number;
  total_courses?: number;
  total_partners?: number;
  enrollment_by_type?: Record<string, number>;
  enrollment_by_status?: Record<string, number>;
  recent_enrollments?: Array<{
    id: number;
    name: string;
    phone: string;
    course_type: string;
    status: string;
    created_at: string;
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const [statsRes, listRes] = await Promise.allSettled([
        fetch(`${API_BASE}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/enrollment/list?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const result: DashboardData = {};

      if (statsRes.status === "fulfilled" && statsRes.value.ok) {
        const sd = await statsRes.value.json();
        const s = sd.data || sd;
        result.total_enrollments = s.total_enrollments ?? s.total;
        result.pending_enrollments = s.pending_enrollments ?? s.pending;
        result.confirmed_enrollments = s.confirmed_enrollments ?? s.confirmed;
        result.cancelled_enrollments = s.cancelled_enrollments ?? s.cancelled;
        result.today_enrollments = s.today_enrollments ?? s.today;
        result.total_courses = s.total_courses;
        result.total_partners = s.total_partners;
        result.enrollment_by_type = s.enrollment_by_type;
        result.enrollment_by_status = s.enrollment_by_status;
      }

      if (listRes.status === "fulfilled" && listRes.value.ok) {
        const ld = await listRes.value.json();
        const items = ld.data?.items || ld.data || ld.items || [];
        result.recent_enrollments = items.slice(0, 5);
        if (result.total_enrollments === undefined) {
          result.total_enrollments = items.length;
          result.pending_enrollments = items.filter((e: any) => e.status === "pending" || e.status === "new").length;
          result.confirmed_enrollments = items.filter((e: any) => e.status === "confirmed" || e.status === "active").length;
        }
      }

      if (result.total_enrollments === undefined) {
        result.total_enrollments = 0;
        result.pending_enrollments = 0;
        result.confirmed_enrollments = 0;
        result.cancelled_enrollments = 0;
      }

      setData(result);
    } catch (err: any) {
      setError(err.message || "网络错误");
    } finally {
      setLoading(false);
    }
  }

  const statusBadge = (status: string) => {
    const m: Record<string, { label: string; cls: string }> = {
      pending:   { label: "待处理", cls: "bg-yellow-500/20 text-yellow-400" },
      new:       { label: "新报名", cls: "bg-blue-500/20 text-blue-400" },
      confirmed: { label: "已确认", cls: "bg-green-500/20 text-green-400" },
      active:    { label: "进行中", cls: "bg-green-500/20 text-green-400" },
      cancelled: { label: "已取消", cls: "bg-red-500/20 text-red-400" },
      rejected:  { label: "已拒绝", cls: "bg-red-500/20 text-red-400" },
    };
    const s = m[status] || { label: status, cls: "bg-gray-500/20 text-gray-400" };
    return <span className={`px-2 py-0.5 rounded-full text-xs ${s.cls}`}>{s.label}</span>;
  };

  const courseTypeLabel = (t: string) => {
    const m: Record<string, string> = { teacher: "教培师", partner: "合伙人", student: "学员" };
    return m[t] || t;
  };

  return (
    <main className="min-h-screen" style={{ background: "#0d1117" }}>
      {/* Admin header */}
      <header className="border-b border-white/10 bg-[#161b22] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/admin/account" className="text-sm text-gray-400 hover:text-white transition-colors">
            &larr; 返回后台
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-lg font-bold text-white">数据看板</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#e53e3e] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && data && (
          <>
            {/* Core metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "总报名数", value: data.total_enrollments ?? "-", cls: "text-[#e53e3e]" },
                { label: "待处理", value: data.pending_enrollments ?? "-", cls: "text-yellow-400" },
                { label: "今日新增", value: data.today_enrollments ?? "-", cls: "text-blue-400" },
                { label: "已确认", value: data.confirmed_enrollments ?? "-", cls: "text-green-400" },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-xl bg-[#161b22] border border-white/10">
                  <div className="text-xs text-gray-500">{s.label}</div>
                  <div className="text-2xl font-bold mt-1 {s.cls}">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Status distribution */}
              <div className="p-4 rounded-xl bg-[#161b22] border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-3">报名状态分布</h3>
                {data.enrollment_by_status ? (
                  <div className="space-y-2">
                    {Object.entries(data.enrollment_by_status).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-16">{k}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#e53e3e]"
                            style={{ width: `${Math.min(100, (v / (data.total_enrollments ?? 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-6 text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 py-4 text-center">
                    {data.total_enrollments && data.total_enrollments > 0
                      ? `全部 ${data.total_enrollments} 条记录，状态分布待后端完善`
                      : "暂无数据"}
                  </div>
                )}
              </div>

              {/* Type distribution */}
              <div className="p-4 rounded-xl bg-[#161b22] border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-3">报名类型分布</h3>
                {data.enrollment_by_type ? (
                  <div className="space-y-2">
                    {Object.entries(data.enrollment_by_type).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-16">{courseTypeLabel(k)}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${Math.min(100, (v / (data.total_enrollments ?? 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-6 text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 py-4 text-center">
                    类型分布待后端完善
                  </div>
                )}
              </div>
            </div>

            {/* Recent enrollments */}
            <div className="p-4 rounded-xl bg-[#161b22] border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">最新报名</h3>
                <Link
                  href="/admin/enrollments"
                  className="text-xs text-[#e53e3e] hover:underline"
                >
                  查看全部 &rarr;
                </Link>
              </div>
              {data.recent_enrollments && data.recent_enrollments.length > 0 ? (
                <div className="space-y-2">
                  {data.recent_enrollments.map((e) => (
                    <div key={e.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">{e.name}</span>
                        <span className="text-xs text-gray-500">{e.phone}</span>
                        <span className="text-xs text-gray-500">{courseTypeLabel(e.course_type)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(e.status)}
                        <span className="text-xs text-gray-600">{new Date(e.created_at).toLocaleDateString("zh-CN")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500 py-4 text-center">暂无最新报名</div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
