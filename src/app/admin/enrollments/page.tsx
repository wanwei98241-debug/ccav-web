"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

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

export default function AdminEnrollmentsPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    fetchData();
  }, []);

    function exportCSV() {
    const headers = ["姓名","手机号","邮箱","报名类型","状态","来源","备注","报名时间"];
    const rows = filtered.map((e) => [
      e.name,
      e.phone,
      e.email || "",
      courseTypeLabel(e.course_type),
      statusLabel(e.status),
      e.source || "",
      e.notes || "",
      new Date(e.created_at).toLocaleString("zh-CN"),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `报名数据_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function statusLabel(status: string) {
    const m: Record<string, string> = { pending: "待处理", new: "新报名", confirmed: "已确认", active: "进行中", cancelled: "已取消", rejected: "已拒绝" };
    return m[status] || status;
  }

async function fetchData() {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/enrollment/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("admin_token");
          router.replace("/admin/login");
          return;
        }
        const d = await res.json().catch(() => ({}));
        setError(d.detail || d.error || `请求失败 (${res.status})`);
        return;
      }

      const data = await res.json();
      const list = data.data?.items || data.data || data.items || [];
      setEnrollments(list);
    } catch (err: any) {
      setError(err.message || "网络错误");
    } finally {
      setLoading(false);
    }
  }

  const stats = (() => {
    const total = enrollments.length;
    const pending = enrollments.filter((e) => e.status === "pending" || e.status === "new").length;
    const confirmed = enrollments.filter((e) => e.status === "confirmed" || e.status === "active").length;
    const cancelled = enrollments.filter((e) => e.status === "cancelled" || e.status === "rejected").length;
    return { total, pending, confirmed, cancelled };
  })();

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

  const statusBadge = (status: string) => {
    const m: Record<string, { label: string; cls: string }> = {
      pending:   { label: "待处理", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
      new:       { label: "新报名", cls: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      confirmed: { label: "已确认", cls: "bg-green-500/20 text-green-400 border-green-500/30" },
      active:    { label: "进行中", cls: "bg-green-500/20 text-green-400 border-green-500/30" },
      cancelled: { label: "已取消", cls: "bg-red-500/20 text-red-400 border-red-500/30" },
      rejected:  { label: "已拒绝", cls: "bg-red-500/20 text-red-400 border-red-500/30" },
    };
    const s = m[status] || { label: status, cls: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${s.cls}`}>
        {s.label}
      </span>
    );
  };

  const courseTypeLabel = (t: string) => {
    const m: Record<string, string> = { teacher: "教培师", partner: "合伙人", student: "学员" };
    return m[t] || t;
  };

  const selected = detailId ? enrollments.find((e) => e.id === detailId) : null;

  return (
    <main className="min-h-screen" style={{ background: "#0d1117" }}>
      {/* Admin header */}
      <header className="border-b border-white/10 bg-[#161b22] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/admin/account" className="text-sm text-gray-400 hover:text-white transition-colors">
            &larr; 返回后台
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-lg font-bold text-white">报名管理</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: "总报名", value: stats.total, cls: "text-[#e53e3e]" },
            { label: "待处理", value: stats.pending, cls: "text-yellow-400" },
            { label: "已确认", value: stats.confirmed, cls: "text-green-400" },
            { label: "已取消", value: stats.cancelled, cls: "text-gray-500" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-[#161b22] border border-white/10">
              <div className="text-xs text-gray-500">{s.label}</div>
              <div className="text-2xl font-bold mt-1 {s.cls}">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Search + filter bar */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="搜索姓名、手机号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#161b22] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e53e3e]/50"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#161b22] border border-white/10 text-sm text-gray-400 focus:outline-none focus:border-[#e53e3e]/50"
          >
            <option value="">全部状态</option>
            <option value="new">新报名</option>
            <option value="pending">待处理</option>
            <option value="confirmed">已确认</option>
            <option value="cancelled">已取消</option>
          </select>
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl bg-[#e53e3e] text-white text-sm font-medium hover:bg-[#c53030] transition-colors flex-shrink-0"
          >
            📥 导出CSV
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#e53e3e] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* List */}
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-gray-500">暂无报名记录</div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-gray-500 mb-2 px-1">共 {filtered.length} 条记录</div>
            {filtered.map((e) => (
              <div key={e.id} className="rounded-xl bg-[#161b22] border border-white/10">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setDetailId(detailId === e.id ? null : e.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#e53e3e]/20 flex items-center justify-center text-xs font-bold text-[#e53e3e] flex-shrink-0">
                      {e.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{e.name}</span>
                        {statusBadge(e.status)}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {e.phone} | {courseTypeLabel(e.course_type)} | {new Date(e.created_at).toLocaleDateString("zh-CN")}
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-600 text-sm">{detailId === e.id ? "▲" : "▼"}</span>
                </div>

                {/* Detail expand */}
                {detailId === e.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2.5 rounded-lg bg-white/5">
                        <div className="text-xs text-gray-500 mb-0.5">手机号</div>
                        <div className="text-gray-200">{e.phone}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5">
                        <div className="text-xs text-gray-500 mb-0.5">邮箱</div>
                        <div className="text-gray-200">{e.email || "未填写"}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5">
                        <div className="text-xs text-gray-500 mb-0.5">报名类型</div>
                        <div className="text-gray-200">{courseTypeLabel(e.course_type)}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5">
                        <div className="text-xs text-gray-500 mb-0.5">报名时间</div>
                        <div className="text-gray-200">{new Date(e.created_at).toLocaleString("zh-CN")}</div>
                      </div>
                      {e.notes && (
                        <div className="col-span-2 p-2.5 rounded-lg bg-white/5">
                          <div className="text-xs text-gray-500 mb-0.5">备注</div>
                          <div className="text-gray-300">{e.notes}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
