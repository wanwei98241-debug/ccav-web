"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  User, KeyRound, LogIn, Loader2, Eye, EyeOff, DoorOpen, ChevronRight, Shield
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 已登录则跳转
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      router.replace("/admin/account");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.code === 200 && data.data?.token) {
        localStorage.setItem("admin_token", data.data.token);
        localStorage.setItem("admin_role", data.data.role || "admin");
        localStorage.setItem("admin_username", data.data.username || username);
        router.push("/admin/account");
      } else {
        setError(data.msg || data.error || "用户名或密码错误");
      }
    } catch (err) {
      setError("网络错误，请检查连接");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main
        className="flex-1 min-h-screen flex items-center justify-center px-4"
        style={{
          background:
            "radial-gradient(ellipse at 50% -20%, rgba(229,62,62,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 40%, rgba(88,166,255,0.08) 0%, transparent 50%), #0d1117",
        }}
      >
        <div className="w-full max-w-md">
          {/* 毛玻璃卡片 */}
          <div className="relative">
            <div className="absolute -top-20 -right-16 w-40 h-40 rounded-full bg-[#e53e3e]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-16 w-36 h-36 rounded-full bg-[#2563eb]/15 blur-3xl pointer-events-none" />

            <div
              className="relative p-8 rounded-3xl border border-white/[0.15] shadow-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(30,40,55,0.9) 0%, rgba(20,28,40,0.85) 100%)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            >
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              {/* 标题 */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#e53e3e] to-[#ff6b6b] flex items-center justify-center shadow-lg shadow-[#e53e3e]/30">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  CCAV 报名管理系统
                </h1>
                <p className="text-sm text-gray-400 mt-1.5">管理员登录</p>
              </div>

              {/* 表单 */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 用户名 */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                    用户名
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#e53e3e] transition-colors z-10">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="请输入管理员用户名"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-[#e53e3e] focus:ring-1 focus:ring-[#e53e3e]/30 focus:outline-none transition-all"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* 密码 */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                    密码
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#e53e3e] transition-colors z-10">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请输入密码"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-[#e53e3e] focus:ring-1 focus:ring-[#e53e3e]/30 focus:outline-none transition-all"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 错误提示 */}
                {error && (
                  <div className="p-3 rounded-xl bg-[#f85149]/10 border border-[#f85149]/20 text-sm text-[#f85149]">
                    {error}
                  </div>
                )}

                {/* 登录按钮 */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-[#e53e3e] text-white hover:bg-[#c53030] active:bg-[#9b2c2c] shadow-lg shadow-[#e53e3e]/25 hover:shadow-xl hover:shadow-[#e53e3e]/30"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      登 录
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 提示信息 */}
              <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-400 text-center">
                  请联系管理员获取账号信息
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
