"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center pl-8 pr-4 py-4 border-b relative z-10"
        style={{ background: "#ffffff", borderColor: "rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="text-2xl font-bold tracking-wide no-underline"
            style={{ color: "#2563eb", fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            CCAV
          </Link>
          <span className="text-xs hidden sm:inline" style={{ color: "rgba(37,99,235,0.6)" }}>AI视频创作教育机构</span>
        </div>
        {/* 桌面端导航 */}
        <div className="hidden md:flex items-center gap-5 text-sm ml-auto" style={{ color: "rgba(0,0,0,0.55)" }}>
          <Link href="/" className="hover:text-[#2563eb] transition no-underline">首页</Link>
          <Link href="/teacher-training" className="hover:text-[#2563eb] transition no-underline">教师培训</Link>
          <Link href="/partner" className="hover:text-[#2563eb] transition no-underline">合作教学点</Link>
          <Link href="/courses" className="hover:text-[#2563eb] transition no-underline">课程体系</Link>
          <Link href="/textbooks" className="hover:text-[#2563eb] transition no-underline">标准教材</Link>
          <Link href="/certification" className="hover:text-[#2563eb] transition no-underline">能力认证</Link>
          <Link href="/gallery" className="hover:text-[#2563eb] transition no-underline">作品展示</Link>
          <Link href="/about" className="hover:text-[#2563eb] transition no-underline">关于CCAV</Link>
          <Link href="/contact" className="hover:text-[#2563eb] transition no-underline">联系我们</Link>
          <Link href="/auth/login" className="ink-btn text-xs px-4 py-1.5 no-underline" style={{ animation: "none" }}>用户登录/注册</Link>
          <Link
            href="/teacher-training"
            className="ink-btn text-xs px-4 py-1.5 no-underline"
            style={{ animation: "none" }}
          >
            教师培训报名
          </Link>
        </div>
        {/* 手机端：汉堡 + 报名按钮 */}
        <div className="md:hidden flex items-center gap-2 ml-auto">
          <Link
            href="/teacher-training"
            className="ink-btn text-xs px-3 py-1 no-underline"
            style={{ animation: "none", padding: "4px 10px", fontSize: "11px" }}
          >
            报名
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 transition"
            style={{ color: "rgba(0,0,0,0.4)" }}
            aria-label="菜单"
          >
            {menuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>
      {/* 汉堡菜单展开面板 */}
      {menuOpen && (
        <div className="md:hidden border-t z-10" style={{ background: "#ffffff", borderColor: "rgba(0,0,0,0.06)" }}>
          <div className="flex flex-col px-8 py-4 gap-3 text-sm" style={{ color: "rgba(0,0,0,0.55)" }}>
            <Link href="/" className="hover:text-[#2563eb] transition py-1 no-underline" onClick={() => setMenuOpen(false)}>首页</Link>
            <Link href="/teacher-training" className="hover:text-[#2563eb] transition py-1 no-underline" onClick={() => setMenuOpen(false)}>教师培训</Link>
            <Link href="/partner" className="hover:text-[#2563eb] transition py-1 no-underline" onClick={() => setMenuOpen(false)}>合作教学点</Link>
            <Link href="/courses" className="hover:text-[#2563eb] transition py-1 no-underline" onClick={() => setMenuOpen(false)}>课程体系</Link>
            <Link href="/textbooks" className="hover:text-[#2563eb] transition py-1 no-underline" onClick={() => setMenuOpen(false)}>标准教材</Link>
            <Link href="/certification" className="hover:text-[#2563eb] transition py-1 no-underline" onClick={() => setMenuOpen(false)}>能力认证</Link>
            <Link href="/gallery" className="hover:text-[#2563eb] transition py-1 no-underline" onClick={() => setMenuOpen(false)}>作品展示</Link>
            <Link href="/about" className="hover:text-[#2563eb] transition py-1 no-underline" onClick={() => setMenuOpen(false)}>关于CCAV</Link>
            <Link href="/contact" className="hover:text-[#2563eb] transition py-1 no-underline" onClick={() => setMenuOpen(false)}>联系我们</Link>
            <hr className="my-2 border-[rgba(0,0,0,0.06)]" />
            <Link href="/auth/login" className="ink-btn text-xs px-4 py-1.5 no-underline text-center" style={{ animation: "none", color:"#fff" }} onClick={() => setMenuOpen(false)}>用户登录/注册</Link>
          </div>
        </div>
      )}
    </>
  );
}
