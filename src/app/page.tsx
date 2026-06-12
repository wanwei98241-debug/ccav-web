"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="text-center py-20 px-4"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 20%, rgba(37,99,235,0.04) 0%, transparent 60%), " +
            "radial-gradient(ellipse 60% 50% at 85% 60%, rgba(14,165,233,0.03) 0%, transparent 60%), " +
            "#f8fafc",
        }}
      >
        <div className="inline-block px-4 py-1.5 rounded-full border text-xs mb-4"
          style={{ borderColor: "rgba(37,99,235,0.15)", color: "#2563eb" }}>
          标准教材 · 线上平台 · 线下网点 · 教师培训 · 项目实训 · 能力认证
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl serif font-bold mb-6 leading-tight" style={{ color: "#1e293b" }}>
          CCAV
          <span className="block text-3xl md:text-4xl" style={{ color: "#2563eb" }}>AI 视频创作教育机构</span>
        </h1>
        <p className="max-w-3xl mx-auto mb-10 leading-relaxed" style={{ color: "rgba(0,0,0,0.5)" }}>
          以团体标准为依据，以标准教材为核心，以教师培训为启动点，以线下网点为落地渠道，<br />
          以项目实训形成作品能力，以能力认证完成学习闭环。
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/teacher-training/apply/" className="ink-btn inline-block">教师培训报名</Link>
          <Link href="/partner"
            className="inline-block px-7 py-2.5 rounded-lg font-semibold cursor-pointer transition duration-300"
            style={{
              background: "rgba(14,165,233,0.08)",
              border: "1px solid rgba(14,165,233,0.4)",
              color: "#0ea5e9",
            }}>
            申请合作教学点
          </Link>
          <Link href="/textbooks"
            className="inline-block px-7 py-2.5 rounded-lg font-semibold cursor-pointer transition duration-300"
            style={{
              border: "1px solid rgba(0,0,0,0.12)",
              color: "rgba(0,0,0,0.5)",
            }}>
            了解教材 →
          </Link>
        </div>
      </section>

      {/* 机构定位 */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl serif font-bold mb-3" style={{ color: "#1e293b" }}>我们不是单纯卖AI课程</h2>
          <p className="text-lg" style={{ color: "#2563eb" }}>而是建设AI视频创作教育标准体系</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "📜", title: "以团体标准为依据", desc: "《人工智能视频制作人员要求》T/CCPS 0041—2026" },
            { icon: "📚", title: "以标准教材为核心", desc: "学生用书、教师用书、考评手册一体化体系" },
            { icon: "🎓", title: "以教师培训为启动点", desc: "建立认证讲师体系，解决AI教育『没人会教』的问题" },
            { icon: "🏛️", title: "以线下网点为落地渠道", desc: "全国线下教学网点，让学习有教室、有老师、有氛围" },
            { icon: "🛠️", title: "以项目实训形成作品能力", desc: "10大项目库，从国风短片到企业宣传片的完整训练" },
            { icon: "🏅", title: "以能力认证完成学习闭环", desc: "初级→中级→高级三级认证，证书+作品集双轨制" },
          ].map((item, i) => (
            <div key={i} className="ink-card p-5 text-center">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-base font-bold mb-2" style={{ color: "#1e293b" }}>{item.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(0,0,0,0.45)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 六大业务板块 */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl serif font-bold mb-2" style={{ color: "#1e293b" }}>六大业务板块</h2>
          <p className="text-sm" style={{ color: "rgba(0,0,0,0.4)" }}>构建完整的AI视频创作教育服务体系</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: "📖", title: "标准教材", href: "/textbooks", desc: "学生用书、教师用书、考评手册，及配套课件PPT、作业模板、项目案例库、提示词模板" },
            { icon: "💻", title: "线上教学平台", href: "/courses", desc: "课程中心、提示词训练、项目实训、作品点评、教师后台、认证考试" },
            { icon: "🏫", title: "线下教学网点", href: "/partner", desc: "校园教学点、机构培训点、企业培训中心、城市运营中心" },
            { icon: "👩‍🏫", title: "教师培训", href: "/teacher-training", desc: "初级讲师→中级讲师→高级讲师的三级培训与认证体系" },
            { icon: "🎬", title: "项目实训", href: "/courses", desc: "国风短片、品牌宣传、电商视频、文旅推广等10大项目库" },
            { icon: "📜", title: "能力认证", href: "/certification", desc: "初级→中级→高级三级认证，企业招聘与职业能力评价依据" },
          ].map((item, i) => (
            <Link key={i} href={item.href} className="ink-card p-5 block">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="text-base font-bold mb-1" style={{ color: "#1e293b" }}>{item.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(0,0,0,0.45)" }}>{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 团体标准板块 */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="ink-card p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-xl"
              style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)" }}>
              <span className="text-2xl font-bold" style={{ color: "#2563eb" }}>标</span>
            </div>
            <div className="flex-1">
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.5)" }}>团体标准</span>
              <h2 className="text-xl font-bold mt-2 mb-2" style={{ color: "#1e293b" }}>《人工智能视频制作人员要求》T/CCPS 0041—2026</h2>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(0,0,0,0.5)" }}>
                本标准由CCAV教育机构牵头制定，适用于从事人工智能视觉内容创作、图像生成、视频合成、数字艺术设计等岗位人员。
                可用于企业招聘、人才培养、职业能力评价与职业发展规划。
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded" style={{ background: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.5)" }}>标准引领</span>
                <span className="px-3 py-1 rounded" style={{ background: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.5)" }}>能力本位</span>
                <span className="px-3 py-1 rounded" style={{ background: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.5)" }}>实践导向</span>
                <span className="px-3 py-1 rounded" style={{ background: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.5)" }}>人机协同</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 数据统计 */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: "1", label: "团体标准", sub: "T/CCPS 0041—2026" },
            { num: "3", label: "标准教材", sub: "学生/教师/考评" },
            { num: "3", label: "认证等级", sub: "初级→中级→高级" },
            { num: "10+", label: "项目案例", sub: "10大AI视频项目库" },
          ].map((item, i) => (
            <div key={i} className="stat-card text-center">
              <div className="text-3xl font-bold mb-1 serif" style={{ color: "#2563eb" }}>{item.num}</div>
              <div className="text-sm mb-1" style={{ color: "rgba(0,0,0,0.55)" }}>{item.label}</div>
              <div className="text-xs" style={{ color: "rgba(0,0,0,0.35)" }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="ink-card p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl serif font-bold mb-3" style={{ color: "#1e293b" }}>让AI视频创作教育可学习、可训练、可评价、可认证、可落地</h2>
          <p className="mb-8" style={{ color: "rgba(0,0,0,0.45)" }}>CCAV — 以团体标准为依据的AI视频创作教育体系</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/teacher-training" className="ink-btn inline-block">教师培训报名</a>
            <a href="/partner"
              className="inline-block px-7 py-2.5 rounded-lg font-semibold cursor-pointer transition duration-300"
              style={{
                background: "rgba(14,165,233,0.08)",
                border: "1px solid rgba(14,165,233,0.4)",
                color: "#0ea5e9",
              }}>
              申请合作教学点
            </a>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="border-t py-8 text-center" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <p className="text-sm mb-2 serif" style={{ color: "rgba(0,0,0,0.5)" }}>CCAV — AI视频创作教育机构</p>
        <p className="text-xs" style={{ color: "rgba(0,0,0,0.35)" }}>以 T/CCPS 0041—2026团体标准为核心的AI视频创作教育运营平台 · © 2026</p>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs" style={{ color: "rgba(0,0,0,0.3)" }}>
          <a href="/about" className="hover:transition" style={{ color: "inherit", textDecoration: "none" }}>关于CCAV</a>
          <a href="/contact" className="hover:transition" style={{ color: "inherit", textDecoration: "none" }}>联系我们</a>
          <a href="/partner" className="hover:transition" style={{ color: "inherit", textDecoration: "none" }}>合作教学点</a>
        </div>
      </footer>
    </>
  );
}
