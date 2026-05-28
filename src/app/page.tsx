"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const courseDetails = (idx: number) => {
    setSelectedCourse(idx);
  };

  const closeDetail = () => {
    setSelectedCourse(null);
  };

  return (
    <>
      {/* 导航 */}
      <nav className="flex items-center pl-8 pr-4 py-4 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-1">
          <span className="text-2xl font-bold text-[#c8b898] tracking-wide" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
            CCAV.COM
          </span>
          <span className="text-xs text-[#c8b898] hidden sm:inline">—— Creative Culture AI Video</span>
        </div>
        {/* 桌面端导航 */}
        <div className="hidden md:flex items-center gap-6 text-sm text-white/50 ml-auto">
          <a href="/" className="hover:text-[#c8b898] transition">首页</a>
          <a href="#courses" className="hover:text-[#c8b898] transition">课程体系</a>
          <a href="#training" className="hover:text-[#c8b898] transition">师资培训</a>
          <a href="/playground" className="hover:text-[#c8b898] transition">AI工坊</a>
          <a href="/tools" className="hover:text-[#c8b898] transition">AI工具矩阵</a>
          <a href="/board.html" className="hover:text-[#c8b898] transition">任务看板</a>
          <a href="#about" className="hover:text-[#c8b898] transition">关于我们</a>
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
        <div className="md:hidden border-t border-white/5 bg-[#0d0d0d]">
          <div className="flex flex-col px-8 py-4 gap-3 text-sm text-white/50">
            <a href="/" className="hover:text-[#c8b898] transition py-1" onClick={() => setMenuOpen(false)}>首页</a>
            <a href="#courses" className="hover:text-[#c8b898] transition py-1" onClick={() => setMenuOpen(false)}>课程体系</a>
            <a href="#training" className="hover:text-[#c8b898] transition py-1" onClick={() => setMenuOpen(false)}>师资培训</a>
            <a href="/playground" className="hover:text-[#c8b898] transition py-1" onClick={() => setMenuOpen(false)}>AI工坊</a>
            <a href="/tools" className="hover:text-[#c8b898] transition py-1" onClick={() => setMenuOpen(false)}>AI工具矩阵</a>
            <a href="/board.html" className="hover:text-[#c8b898] transition py-1" onClick={() => setMenuOpen(false)}>任务看板</a>
            <a href="#about" className="hover:text-[#c8b898] transition py-1" onClick={() => setMenuOpen(false)}>关于我们</a>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="text-center py-20 px-4 relative z-10">
        <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 text-xs text-white/40 mb-6">
          对标 T/CCPS 0041—2026 团体标准 · 6级98课时
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl serif font-bold mb-4 leading-tight">
          <span className="text-[#c8b898] inline-block mb-1">不写一行代码</span><br />
          <span className="text-[#c8b898]">把你的文字灵感变成高质感大片</span>
        </h1>
        <p className="text-white/40 max-w-2xl mx-auto mb-8 leading-relaxed">
          专为学习AI 视频创作者打造。从注册到成片，全流程在浏览器内完成。<br />
          无需高配电脑，用免费API即可开启AI视觉创作之路。
        </p>

        {/* 五步骤 */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <span className="inline-block border border-[rgba(32,102,131,0.15)] rounded-full px-[18px] py-2 text-sm text-[#c8c0b0] cursor-pointer transition hover:border-[rgba(32,102,131,0.35)] hover:text-[#e0d8c8] hover:bg-[rgba(32,102,131,0.06)]">
            <span className="text-[#206683]">1.</span> 接入免费API
          </span>
          <span className="text-[#206683] text-lg font-bold">▸</span>
          <span className="inline-block border border-[rgba(32,102,131,0.15)] rounded-full px-[18px] py-2 text-sm text-[#c8c0b0] cursor-pointer transition hover:border-[rgba(32,102,131,0.35)] hover:text-[#e0d8c8] hover:bg-[rgba(32,102,131,0.06)]">
            <span className="text-[#206683]">2.</span> 输入故事灵感
          </span>
          <span className="text-[#206683] text-lg font-bold">▸</span>
          <span className="inline-block border border-[rgba(32,102,131,0.15)] rounded-full px-[18px] py-2 text-sm text-[#c8c0b0] cursor-pointer transition hover:border-[rgba(32,102,131,0.35)] hover:text-[#e0d8c8] hover:bg-[rgba(32,102,131,0.06)]">
            <span className="text-[#206683]">3.</span> 一键分镜生图
          </span>
          <span className="text-[#206683] text-lg font-bold">▸</span>
          <span className="inline-block border border-[rgba(32,102,131,0.15)] rounded-full px-[18px] py-2 text-sm text-[#c8c0b0] cursor-pointer transition hover:border-[rgba(32,102,131,0.35)] hover:text-[#e0d8c8] hover:bg-[rgba(32,102,131,0.06)]">
            <span className="text-[#206683]">4.</span> 画面动态渲染
          </span>
          <span className="text-[#206683] text-lg font-bold">▸</span>
          <span className="inline-block border border-[rgba(32,102,131,0.15)] rounded-full px-[18px] py-2 text-sm text-[#c8c0b0] cursor-pointer transition hover:border-[rgba(32,102,131,0.35)] hover:text-[#e0d8c8] hover:bg-[rgba(32,102,131,0.06)]">
            <span className="text-[#206683]">5.</span> 智能配乐配音
          </span>
        </div>
        <p className="text-xs text-white/45">全程鼠标点选，无需任何代码基础</p>

        <div className="flex gap-4 justify-center mt-8">
          <a
            href="#courses"
            className="inline-block px-7 py-2.5 rounded-lg font-semibold text-white cursor-pointer transition duration-300"
            style={{
              background: "linear-gradient(135deg, #c0392b, #8b1a1a)",
              animation: "breathe 4s ease-in-out infinite",
            }}
          >
            探索课程
          </a>
          <a
            href="/playground"
            className="inline-block px-7 py-2.5 rounded-lg font-semibold cursor-pointer transition duration-300"
            style={{
              background: "rgba(0,200,220,0.10)",
              border: "1px solid rgba(0,210,230,0.5)",
              color: "#20d8e8",
            }}
          >
            AI 工坊
          </a>
        </div>
      </section>

      {/* 学生课程体系 */}
      <section id="courses" className="max-w-6xl mx-auto px-4 pb-16 relative z-10">
        <div className="text-center mb-12">
          <div className="text-lg text-[#c8b898]/60 -mt-4 mb-3">——✦——✦——✦——</div>
          <h2 className="text-2xl md:text-3xl serif font-bold text-white mt-2 mb-3">学生课程体系</h2>
          <p className="text-white/30 max-w-xl mx-auto text-sm">
            不讲废话，全部动手。从第一条提示词到完整AI视频作品，每一步都在浏览器里完成。
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course, idx) => (
            <Link
              key={idx}
              href={`/courses/${course.id}`}
              className="ink-card p-6 cursor-pointer block"
            >
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{course.title}</h3>
                  <span className="text-[10px] text-[#206683] bg-[#206683]/10 border border-[#206683]/20 px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-2">{course.hours}</span>
                </div>
                <p className="text-white/30 text-sm mt-1">{course.subtitle}</p>
              </div>
              <p className="text-white/20 text-xs leading-relaxed mb-4">{course.desc}</p>
              <div className="flex items-center justify-between">
                <span className="price-tag">{course.price}</span>
                <span className="text-xs text-white/20">{course.format}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <span className="text-[10px] text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded">{course.outcome}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AI工坊 */}
      <section id="playground" className="max-w-6xl mx-auto px-4 pb-16 relative z-10">
        <div className="text-center mb-10">
          <div className="text-2xl mb-2">🛠️</div>
          <h2 className="text-xl md:text-2xl serif font-bold text-white mb-2">AI工坊</h2>
          <p className="text-white/25 text-sm">零代码AI创作工具，输入文字即可生成图片、视频、音乐</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/playground?tab=image" className="teaser-card hover:border-[#c8b898]/30 transition">
            <span className="teaser-badge bg-[#c8b898]/20 text-[#c8b898]">可用</span>
            <div className="teaser-icon text-3xl">🎨</div>
            <div className="text-white/60 font-medium text-sm mb-1">AI文生图</div>
            <div className="text-white/20 text-xs">输入描述，AI生成高质量图片</div>
          </a>
          <a href="/playground?tab=video" className="teaser-card hover:border-[#c8b898]/30 transition">
            <span className="teaser-badge bg-[#c8b898]/20 text-[#c8b898]">可用</span>
            <div className="teaser-icon text-3xl">🎬</div>
            <div className="text-white/60 font-medium text-sm mb-1">AI图生视频</div>
            <div className="text-white/20 text-xs">上传图片或输入提示词，生成动态视频</div>
          </a>
          <a href="/tools?category=audio" className="teaser-card hover:border-[#c8b898]/30 transition">
            <span className="teaser-badge bg-[#c8b898]/20 text-[#c8b898]">可用</span>
            <div className="teaser-icon text-3xl">🎵</div>
            <div className="text-white/60 font-medium text-sm mb-1">AI配乐配音</div>
            <div className="text-white/20 text-xs">Suno AI作曲、ElevenLabs配音等音频工具</div>
          </a>
        </div>
      </section>

      {/* 师资培训 */}
      <section id="training" className="max-w-4xl mx-auto px-4 pb-16 relative z-10">
        <div className="ink-card p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex items-center justify-center" style={{ width: 64, height: 64, background: "rgba(180,160,80,0.12)", borderRadius: 12, fontSize: 44 }}>🎓</div>
            <div className="flex-1">
              <span className="text-xs text-white/20 bg-white/5 px-2 py-0.5 rounded">🎓 师训课程</span>
              <h2 className="text-xl font-bold text-white mt-2 mb-2">师资培训 · 从学员到认证讲师</h2>
              <p className="text-white/30 text-sm leading-relaxed mb-4">
                专为想成为AI视频讲师的学员设计。5天线下集训，全部实操使用免费API，零代码实现从文生图到完整教学视频的全流程。
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-white/25 mb-5">
                <span>📚 30课时</span>
                <span>📅 线下集训（5天）</span>
                <span>🏅 通过即获认证</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-[#c8b898] serif">¥3,999</span>
                <a
                  href="/training"
                  className="ink-btn text-sm"
                >
                  了解详情
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 底部背书 */}
      <section id="about" className="max-w-4xl mx-auto px-4 pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card text-center">
            <div className="h-9 flex items-center justify-center mb-3">
              <span className="text-lg font-bold tracking-widest text-[#c8b898]/60">T/CCPS</span>
            </div>
            <div className="text-2xl font-bold text-white serif mb-1">6大团标等级</div>
            <div className="text-xs text-white/25 leading-relaxed">
              严格对标 T/CCPS 0041<br />含金量十足的学习路径
            </div>
          </div>
          <div className="stat-card text-center">
            <div className="stat-icon mb-3">🎓</div>
            <div className="text-2xl font-bold text-white serif mb-1">5天师资跃升</div>
            <div className="text-xs text-white/25 leading-relaxed">
              专为教育者设计的实操课<br />通过考核解锁官方认证讲师
            </div>
          </div>
          <div className="stat-card text-center">
            <div className="stat-icon mb-3">⚡</div>
            <div className="text-2xl font-bold text-white serif mb-1">0硬件门槛</div>
            <div className="text-xs text-white/25 leading-relaxed">
              告别昂贵显卡与繁琐配置<br />有浏览器就能开启AI创作
            </div>
          </div>
        </div>
      </section>

      {/* 课程详情弹窗 */}
      {selectedCourse !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={closeDetail}
        >
          <div
            className="ink-card p-6 md:p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{courses[selectedCourse].title}</h3>
              <button
                onClick={closeDetail}
                className="text-white/30 hover:text-white/70 text-2xl leading-none px-2"
              >
                ✕
              </button>
            </div>
            <p className="text-white/30 text-sm mb-4">{courses[selectedCourse].subtitle}</p>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] text-[#206683] bg-[#206683]/10 border border-[#206683]/20 px-2 py-0.5 rounded-full font-medium">{courses[selectedCourse].hours}</span>
              <span className="price-tag">{courses[selectedCourse].price}</span>
              <span className="text-[10px] text-white/20">{courses[selectedCourse].format}</span>
            </div>
            <p className="text-white/35 text-sm leading-relaxed mb-4">{courses[selectedCourse].desc}</p>
            <div className="border-t border-white/5 pt-3">
              <p className="text-[10px] text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded inline-block">{courses[selectedCourse].outcome}</p>
            </div>
          </div>
        </div>
      )}

      {/* 页脚 */}
      <footer className="border-t border-white/5 py-8 text-center relative z-10">
        <p className="text-sm text-white/50 mb-2 serif">ccav.com — 用 AI，讲好中国故事</p>
        <p className="text-xs text-white/35">以 T/CCPS 0041—2026团体标准为核心的AI视频制作教学平台 · © 2026</p>
      </footer>
    </>
  );
}

const courses = [
  {
    id: "part1",
    title: "第一部 · 基础认知",
    hours: "16课时",
    subtitle: "零基础扫盲 · 建立AI视频全局认知",
    desc: "从零开始认识AIGC，掌握提示词基础写法，建立AI视频工具的全局视野。适合完全零基础的学员。",
    price: "¥199",
    format: "线上录播 + 社群答疑",
    outcome: "学习成果：静态AI海报+提示词作品集",
  },
  {
    id: "part2",
    title: "第二部 · 文本与图像",
    hours: "20课时",
    subtitle: "从文案到画面 · 核心创作技能",
    desc: "掌握AI剧本写作、分镜设计、文生图、图生视频等核心技能。打通从文字到画面的完整创作链路。",
    price: "¥399",
    format: "每周直播答疑",
    outcome: "学习成果：30秒意境短视频+分镜脚本",
  },
  {
    id: "part3",
    title: "第三部 · 视频实战",
    hours: "22课时",
    subtitle: "完整视频作品输出能力",
    desc: "从音频配音到AI剪辑到短剧制作，打通视频创作全链路。包含声音克隆、虚拟角色驱动等进阶技巧。",
    price: "¥599",
    format: "直播实操 + 作业批改",
    outcome: "学习成果：完整AI短片+声音克隆demo",
  },
  {
    id: "part4",
    title: "第四部 · 综合项目",
    hours: "16课时",
    subtitle: "端到端完成完整AI视频项目",
    desc: "通过两个大型实战项目，将前三部所学融会贯通。从选题策划到成片交付，模拟真实商业项目全流程。",
    price: "¥799",
    format: "线上辅导 + 项目实训",
    outcome: "学习成果：商业级项目作品+作品集",
  },
  {
    id: "part5",
    title: "第五部 · 行业应用",
    hours: "16课时",
    subtitle: "行业视野 · 商业落地 · 伦理合规",
    desc: "深入各行业AI视频应用场景，掌握从创作到变现的商业路径，了解版权法规与伦理规范。",
    price: "¥699",
    format: "案例分析 + 导师连线",
    outcome: "学习成果：商业变现方案+行业案例库",
  },
  {
    id: "part6",
    title: "第六部 · 教学认证",
    hours: "8课时",
    subtitle: "从会做到会教 · 认证考核",
    desc: "6+2模式：6课时辅导冲刺 + 2课时纯考核。通过机考与试讲演示即获平台认证。",
    price: "¥499",
    format: "6课时辅导 + 2课时考核",
    outcome: "学习成果：平台认证讲师资格+教学资质",
  },
];
