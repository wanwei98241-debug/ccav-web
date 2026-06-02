"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center pl-8 pr-4 py-4 border-b border-white/5 relative z-10"
        style={{ background: "#0d0d0d" }}
      >
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="text-2xl font-bold text-[#c8b898] tracking-wide no-underline"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            CCAV.COM
          </Link>
          <span className="text-xs text-[#c8b898] hidden sm:inline">—— Creative Culture AI Video</span>
        </div>
        {/* 桌面端导航 */}
        <div className="hidden md:flex items-center gap-6 text-sm text-white/50 ml-auto">
          <Link href="/" className="hover:text-[#c8b898] transition no-underline">首页</Link>
          <Link href="/training" className="hover:text-[#c8b898] transition no-underline">师资培训</Link>
          <Link href="/courses" className="hover:text-[#c8b898] transition no-underline">课程体系</Link>
          <Link href="/playground" className="hover:text-[#c8b898] transition no-underline">AI工坊</Link>
          <Link href="/tools" className="hover:text-[#c8b898] transition no-underline">AI工具矩阵</Link>
          <Link href="/gallery" className="hover:text-[#c8b898] transition no-underline">作品墙</Link>
          <Link href="/board.html" className="hover:text-[#c8b898] transition no-underline">任务看板</Link>
          <Link href="/about" className="hover:text-[#c8b898] transition no-underline">关于我们</Link>
          <Link href="#" className="border border-white/20 text-white/60 px-3 py-1 rounded text-xs no-underline hover:border-[#c8b898]/50 hover:text-[#c8b898] transition">登录</Link>
        </div>
        {/* 手机端汉堡菜单 */}
        <div className="md:hidden flex items-center gap-2 ml-auto">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white/60 hover:text-white p-2 transition"
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
        <div className="md:hidden border-t border-white/5 bg-[#0d0d0d] z-10">
          <div className="flex flex-col px-8 py-4 gap-3 text-sm text-white/50">
            <Link href="/" className="hover:text-[#c8b898] transition py-1 no-underline" onClick={() => setMenuOpen(false)}>首页</Link>
            <Link href="/training" className="hover:text-[#c8b898] transition py-1 no-underline" onClick={() => setMenuOpen(false)}>师资培训</Link>
            <Link href="/courses" className="hover:text-[#c8b898] transition py-1 no-underline" onClick={() => setMenuOpen(false)}>课程体系</Link>
            <Link href="/playground" className="hover:text-[#c8b898] transition py-1 no-underline" onClick={() => setMenuOpen(false)}>AI工坊</Link>
            <Link href="/tools" className="hover:text-[#c8b898] transition py-1 no-underline" onClick={() => setMenuOpen(false)}>AI工具矩阵</Link>
            <Link href="/gallery" className="hover:text-[#c8b898] transition py-1 no-underline" onClick={() => setMenuOpen(false)}>作品墙</Link>
            <Link href="/board.html" className="hover:text-[#c8b898] transition py-1 no-underline" onClick={() => setMenuOpen(false)}>任务看板</Link>
            <Link href="/about" className="hover:text-[#c8b898] transition py-1 no-underline" onClick={() => setMenuOpen(false)}>关于我们</Link>
            <Link href="#" className="border border-white/20 text-white/60 text-center px-3 py-2 rounded text-xs no-underline hover:border-[#c8b898]/50 hover:text-[#c8b898] transition" onClick={() => setMenuOpen(false)}>登录</Link>
          </div>
        </div>
      )}
    </>
  );
}
