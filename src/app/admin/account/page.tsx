"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  User, Users, LogOut, ChevronRight, BookOpen, Award, Zap, History,
  Settings, Mail, Phone, Calendar, Shield, BarChart3, Loader2
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function AdminAccountPage() {
  const router = useRouter();
  const [adminInfo, setAdminInfo] = useState<{
    username: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    // 验证 token 并获取管理员信息
    fetch(`${API_BASE}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.code === 200) {
          setAdminInfo({
            username: data.data?.username || localStorage.getItem("admin_username") || "admin",
            role: data.data?.role || localStorage.getItem("admin_role") || "admin",
          });
        } else {
          // token 无效，跳回登录页
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_role");
          localStorage.removeItem("admin_username");
          router.replace("/admin/login");
        }
      })
      .catch(() => {
        // 网络错误时用本地缓存的用户名
        const saved = localStorage.getItem("admin_username");
        if (saved) {
          setAdminInfo({
            username: saved,
            role: localStorage.getItem("admin_role") || "admin",
          });
        } else {
          setError("无法验证身份，请重新登录");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_username");
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 min-h-screen flex items-center justify-center bg-[#0d1117]">
          <Loader2 className="w-8 h-8 text-[#e53e3e] animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  if (!adminInfo) {
    return null; // 已通过 router.replace 跳转
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 pb-16" style={{ background: "#0d1117" }}>
        <div className="max-w-3xl mx-auto px-4">
          {/* 管理员信息头部 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1c2333] to-[#161b22] border border-white/10 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e53e3e] to-[#ff6b6b] flex items-center justify-center flex-shrink-0">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white truncate">
                  {adminInfo.username}
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  管理员 · CCAV 报名管理系统
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    角色：{adminInfo.role}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    管理系统
                  </span>
                </div>
              </div>
            </div>

            {/* 快捷统计 */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-lg font-bold text-[#e53e3e]">--</div>
                <div className="text-xs text-gray-500 mt-0.5">今日报名</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-lg font-bold text-[#e53e3e]">--</div>
                <div className="text-xs text-gray-500 mt-0.5">总报名数</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-lg font-bold text-[#e53e3e]">--</div>
                <div className="text-xs text-gray-500 mt-0.5">待处理</div>
              </div>
            </div>
          </div>

          {/* 管理功能入口 */}
          <h2 className="text-sm font-semibold text-gray-300 mb-3 px-1">管理功能</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <QuickLink
              icon={<BookOpen className="w-5 h-5 text-white" />}
              title="报名管理"
              subtitle="查看和管理所有报名"
              color="from-[#e53e3e] to-[#ff6b6b]"
              href="/admin/enrollments"
            />
            <QuickLink
              icon={<BarChart3 className="w-5 h-5 text-white" />}
              title="数据看板"
              subtitle="报名统计与分析"
              color="from-[#e53e3e] to-[#ff6b6b]"
              href="/admin/dashboard"
            />
            <QuickLink
              icon={<Settings className="w-5 h-5 text-white" />}
              title="系统设置"
              subtitle="管理系统配置"
              color="from-[#e53e3e] to-[#ff6b6b]"
              href="#"
            />
            <QuickLink
              icon={<Users className="w-5 h-5 text-white" />}
              title="管理员管理"
              subtitle="添加或移除管理员"
              color="from-[#e53e3e] to-[#ff6b6b]"
              href="#"
            />
          </div>

          {/* 菜单列表 */}
          <div className="rounded-2xl border border-white/10 bg-[#1c2333] overflow-hidden divide-y divide-white/5">
            <MenuItem icon={<History className="w-4 h-4" />} title="操作日志" href="#" />
            <MenuItem icon={<Settings className="w-4 h-4" />} title="账号设置" href="#" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-5 py-3.5 text-sm text-[#f85149] hover:bg-[#f85149]/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4" />
                退出登录
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-[#f85149]/10 border border-[#f85149]/20 text-sm text-[#f85149]">
              {error}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function QuickLink({
  icon, title, subtitle, color, href,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="p-4 rounded-xl bg-[#161b22] border border-white/10 hover:border-[#e53e3e]/40 transition-all group"
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-200 group-hover:text-[#e53e3e] transition-colors">{title}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    </Link>
  );
}

function MenuItem({ icon, title, href }: { icon: React.ReactNode; title: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-5 py-3.5 text-sm text-gray-400 hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-500">{icon}</span>
        {title}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-500" />
    </Link>
  );
}
