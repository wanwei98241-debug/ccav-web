"use client";

import Link from "next/link";

export default function Navbar() {
  return (
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
      <div className="flex items-center gap-6 text-sm text-white/50 ml-auto">
        <Link href="/" className="hover:text-[#c8b898] transition no-underline">首页</Link>
        <Link href="#courses" className="hover:text-[#c8b898] transition no-underline">课程体系</Link>
        <Link href="#training" className="hover:text-[#c8b898] transition no-underline">师资培训</Link>
        <Link href="#playground" className="hover:text-[#c8b898] transition no-underline">AI工坊</Link>
        <Link href="#about" className="hover:text-[#c8b898] transition no-underline">关于我们</Link>
        <Link href="/tools" className="hover:text-[#c8b898] transition no-underline">AI工具矩阵</Link>
        <Link href="/board.html" className="hover:text-[#c8b898] transition no-underline">任务看板</Link>
        <span className="text-white/15 text-xs">更多 ▾</span>
        <Link href="#" className="border border-white/20 text-white/60 px-3 py-1 rounded text-xs no-underline hover:border-[#c8b898]/50 hover:text-[#c8b898] transition">登录</Link>
      </div>
    </nav>
  );
}
