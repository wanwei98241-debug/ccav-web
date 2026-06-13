"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Users, Search, ChevronDown, ChevronUp, Loader2, AlertCircle,
  FileText, Download, ExternalLink, ArrowLeft, RefreshCw,
  Phone, Mail, Calendar, BookOpen, User, MoreHorizontal, CheckCircle, XCircle, Clock
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface Enrollment {
  id: number;
  name: string;
  phone: string;
  email?: string;
  course_type: string;
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
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, cancelled: 0 });
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

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
      const [enrollRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/enrollment/list`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
      ]);

      if (!enrollRes.ok) {
        const d = await enrollRes.json().catch(() => ({}));
        if (enrollRes.status === 401) {
          localStorage.removeItem("admin_token");
          router.replace("/admin/login");
          return;
        }
        setError(d.error || `请求失败 (${enrollRes.status})`);
        return;
      }

      const enrollData = await enrollRes.json();
      const list = enrollData.data?.items || enrollData.data || enrollData.items || [];
      setEnrollments(list);

      const total = list.length;
      const pending = list.filter((e: Enrollment) => e.status === "pending" || e.status === "new").length;
      const confirmed = list.filter((e: Enrollment) => e.status === "confirmed" || e.status === "active").length;
      const cancelled = list.filter((e: Enrollment) => e.status === "cancelled" || e.status === "rejected").length;
      setStats({ total, pending, confirmed, cancelled });

      if (statsRes?.ok) {
        const sd = await statsRes.json();
        const s = sd.data || sd;
        setStats({
          total: s.total_enrollments ?? s.total ?? total,
          pending: s.pending_enrollments ?? s.pending ?? pending,
          confirmed: s.confirmed_enrollments ?? s.confirmed ?? confirmed,
          cancelled: s.cancelled_enrollments ?? s.cancelled ?? cancelled,
        });
      }
    } catch (err: any) {
      setError(err.message || "网络错误，请检查连接");
    } finally {
      setLoading(false);
    }
  }

  const filtered = enrollments
    .filter((e) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !e.name?.toLowerCase().includes(q) &&
          !e.phone?.includes(q) &&
          !e.email?.toLowerCase().includes(q)
        ) return false;
      }
      if (statusFilter && e.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortDir === "desc" ? db - da : da - db;
    });

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; class: string }> = {
      pending: { label: "待处理", class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
      new: { label: "新报名", class: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      confirmed: { label: "已确认", class: "bg-green-500/20 text-green-400 border-green-500/30" },
      active: { label: "进行中", class: "bg-green-500/20 text-green-400 border-green-500/30" },
      cancelled: { label: "已取消", class: "bg-red-500/20 text-red-400 border-red-500/30" },
      rejected: { label: "已拒绝", class: "bg-red-500/20 text-red-400 border-red-500/30" },
    };
    const m = map[status] || { label: status, class: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${m.class}`}>
        {status === "pending" || status === "new" ? <Clock className="w-3 h-3" /> :
         status === "confirmed" || status === "active" ? <CheckCircle className="w-3 h-3" /> :
         <XCircle className="w-3 h-3" />}
        {m.label}
      </span>
    );
  };

  const courseTypeLabel = (t: string) => {
    const map: Record<string, string> = {
      "teacher": "教培师培训",
      "partner": "城市合伙人",
      "student": "学员报名",
      "default": "普通报名",
    };
    return map[t] || t;
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
              <h1 className="text-xl font-bold text-white">报名管理</h1>
              <p className="text-sm text-gray-500">查看和管理所有学员报名</p>
            </div>
            <button
              onClick={fetchData}
              className="ml-auto p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              title="刷新"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "总报名数", value: stats.total, color: "text-[#e53e3e]" },
              { label: "待处理", value: stats.pending, color: "text-yellow-400" },
              { label: "已确认", value: stats.confirmed, color: "text-green-400" },
              { label: "已取消", value: stats.cancelled, color: "text-gray-500" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl bg-[#161b22] border border-white/10">
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* 搜索和筛选 */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="搜索姓名、手机号、邮箱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161b22] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e53e3e]/50"
              />
            </div>
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
              onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-[#161b22] border border-white/10 text-sm text-gray-400 hover:text-white transition-colors"
            >
              时间
              {sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* 加载中 */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#e53e3e] animate-spin" />
            </div>
          )}

          {/* 报名列表 */}
          {!loading && (
            <>
              <div className="text-xs text-gray-500 mb-2 px-1">
                共 {filtered.length} 条记录
              </div>

              {filtered.length === 0 ? (
                <div className="py-16 text-center">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">暂无报名记录</p>
                  {searchQuery && (
                    <p className="text-sm text-gray-600 mt-1">尝试修改搜索条件</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="p-4 rounded-xl bg-[#161b22] border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-white truncate">{enrollment.name}</h3>
                            {statusBadge(enrollment.status)}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {enrollment.phone}
                            </span>
                            {enrollment.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {enrollment.email}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {courseTypeLabel(enrollment.course_type)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(enrollment.created_at).toLocaleDateString("zh-CN")}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedEnrollment(
                            selectedEnrollment?.id === enrollment.id ? null : enrollment
                          )}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:border-[#e53e3e]/40 transition-all flex-shrink-0"
                        >
                          详情
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>

                      {/* 展开详情面板 */}
                      {selectedEnrollment?.id === enrollment.id && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-2.5 rounded-lg bg-white/5">
                              <div className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                                <Phone className="w-3 h-3" /> 手机号
                              </div>
                              <div className="text-gray-200">{enrollment.phone}</div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white/5">
                              <div className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> 邮箱
                              </div>
                              <div className="text-gray-200">{enrollment.email || "未填写"}</div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white/5">
                              <div className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" /> 报名类型
                              </div>
                              <div className="text-gray-200">{courseTypeLabel(enrollment.course_type)}</div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white/5">
                              <div className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> 报名时间
                              </div>
                              <div className="text-gray-200">{new Date(enrollment.created_at).toLocaleString("zh-CN")}</div>
                            </div>
                            {enrollment.notes && (
                              <div className="col-span-2 p-2.5 rounded-lg bg-white/5">
                                <div className="text-xs text-gray-500 mb-0.5">备注</div>
                                <div className="text-gray-300">{enrollment.notes}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
