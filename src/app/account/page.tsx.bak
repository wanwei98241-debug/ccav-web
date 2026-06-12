"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  User, LogOut, ChevronRight, BookOpen, Award, Zap, History,
  Settings, Mail, Phone, Calendar, Shield, BarChart3,
} from "lucide-react";

export default function AccountPage() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // 加载中或未登录
  if (loading) return null;
  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          {/* 用户信息头部 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161b22] to-[#1c2333] border border-[#30363d] mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#58a6ff] to-[#bc8cff] flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">
                  {user?.display_name?.charAt(0) || "学"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-[#f0f6fc] truncate">
                  {user?.display_name || "学员"}
                </h1>
                <p className="text-sm text-[#8b949e] mt-0.5">
                  {user?.role === "instructor" ? "讲师" : "学员"} · ccav.com
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-[#484f58]">
                  {user?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {user.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    加入于 2026
                  </span>
                </div>
              </div>
            </div>

            {/* 积分与进度卡片 */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="p-3 rounded-xl bg-[#0d1117] border border-[#21262d] text-center">
                <div className="text-lg font-bold text-[#d29922]">{user?.credits ?? 0}</div>
                <div className="text-xs text-[#484f58] mt-0.5">积分</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-[#21262d] text-center">
                <div className="text-lg font-bold text-[#3fb950]">0</div>
                <div className="text-xs text-[#484f58] mt-0.5">已学课程</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-[#21262d] text-center">
                <div className="text-lg font-bold text-[#58a6ff]">0</div>
                <div className="text-xs text-[#484f58] mt-0.5">证书</div>
              </div>
            </div>
          </div>

          {/* 快捷入口 */}
          <h2 className="text-sm font-semibold text-[#f0f6fc] mb-3 px-1">快捷入口</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <QuickLink
              icon={<BookOpen className="w-5 h-5" />}
              title="我的课程"
              subtitle="继续学习"
              color="from-[#58a6ff] to-[#39d2c0]"
              href="/courses"
            />
            <QuickLink
              icon={<Award className="w-5 h-5" />}
              title="学习记录"
              subtitle="进度与成绩"
              color="from-[#bc8cff] to-[#f78166]"
              href="#"
            />
            <QuickLink
              icon={<Zap className="w-5 h-5" />}
              title="AI工具箱"
              subtitle="创作工具"
              color="from-[#d29922] to-[#e3b341]"
              href="/training"
            />
            <QuickLink
              icon={<BarChart3 className="w-5 h-5" />}
              title="学习统计"
              subtitle="数据分析"
              color="from-[#3fb950] to-[#56d364]"
              href="#"
            />
          </div>

          {/* 菜单列表 */}
          <div className="rounded-2xl border border-[#30363d] bg-[#161b22] overflow-hidden divide-y divide-[#21262d]">
            <MenuItem icon={<History className="w-4 h-4" />} title="浏览历史" href="#" />
            <MenuItem icon={<Settings className="w-4 h-4" />} title="账号设置" href="#" />
            <MenuItem icon={<Shield className="w-4 h-4" />} title="隐私与安全" href="#" />
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="w-full flex items-center justify-between px-5 py-3.5 text-sm text-[#f85149] hover:bg-[#f85149]/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4" />
                退出登录
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// 快捷入口卡片
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
      className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff]/40 transition-all group"
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-[#f0f6fc] group-hover:text-[#58a6ff] transition-colors">{title}</h3>
      <p className="text-xs text-[#484f58] mt-0.5">{subtitle}</p>
    </Link>
  );
}

// 菜单行
function MenuItem({ icon, title, href }: { icon: React.ReactNode; title: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-5 py-3.5 text-sm text-[#c9d1d9] hover:bg-[#1c2333] transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-[#484f58]">{icon}</span>
        {title}
      </div>
      <ChevronRight className="w-4 h-4 text-[#484f58]" />
    </Link>
  );
}
