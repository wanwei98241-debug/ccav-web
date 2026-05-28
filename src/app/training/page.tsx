"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Flame, Mail, MessageCircle, Lightbulb } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState, useEffect, useRef } from "react";
import { getCourse } from "@/lib/api";
import { trainingCourse as staticTrainingCourse } from "@/lib/courseData";
import type { Course, LessonDetail } from "@/lib/courseData";

// 防止 hydrate mismatch：确保 SSR 和首次客户端渲染完全一致
// 仅在客户端真正 mount 后才用 API 数据覆盖
function useSafeClientState<T>(staticValue: T, loader?: () => Promise<T>): [T, boolean] {
  const [state, setState] = useState(staticValue);
  const [loaded, setLoaded] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    if (loader) {
      loader().then((data) => {
        if (data && mounted.current) {
          setState(data);
          setLoaded(true);
        }
      }).catch(() => {
        setLoaded(true); // 加载失败也不影响
      });
    } else {
      setLoaded(true);
    }
    return () => { mounted.current = false; };
  }, [loader]);

  return [state, loaded];
}

export default function TrainingPage() {
  // SSR 时使用静态数据保证 hydrate 一致
  // 客户端 mount 后尝试获取 API 数据覆盖（但只更新可用字段，保留静态数据兜底）
  const [apiCourse, setApiCourse] = useState<Partial<Course> | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    getCourse("training").then((data) => {
      if (data) {
        setApiCourse(data as Partial<Course>);
      }
    });
  }, []);

  // 合并静态数据和 API 数据：API 字段优先，缺失字段回退到静态数据
  const course = apiCourse
    ? { ...staticTrainingCourse, ...apiCourse }
    : staticTrainingCourse;

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className={`py-16 bg-gradient-to-br ${course.gradient}`}>
          <div className="max-w-4xl mx-auto px-5">
            <Link
              href="/courses/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              返回课程列表
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                {course.level}
              </span>
              {course.tags?.map((tag: string) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/15 text-white/90 text-xs">
                  <Flame className="w-3 h-3" />{tag}
                </span>
              ))}
            </div>
            <div className="mb-4 flex items-center gap-4">
              <span className="text-5xl leading-none">🎓</span>
              <h1 className="text-3xl md:text-4xl font-bold text-white flex-1">
                {course.title}
              </h1>
            </div>
            <p className="text-lg text-white/90 mb-6">{course.subtitle}</p>
            <div className="flex flex-wrap gap-4 text-white/80 text-sm">
              <span>5天高强度集训</span>
              <span>30课时</span>
              <span>{course.format}</span>
            </div>

          </div>
        </section>

        {/* Content */}
        <section className="py-12 bg-[#0d1117]">
          <div className="max-w-4xl mx-auto px-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161b22] to-[#1a1f2e] border border-[#30363d] shadow-md">
                  <h2 className="text-xl font-semibold text-[#f0f6fc] mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#58a6ff] to-[#bc8cff]" />
                    培训介绍
                  </h2>
                  <p className="text-[#c9d1d9] leading-relaxed">{course.description}</p>
                </div>

                {/* Day by Day — 30课时详细课程列表 */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-[#f0f6fc] flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#d2991d] to-[#e53e3e]" />
                    5天 · 30课时详细课程
                  </h2>
                  {course.modules_list?.length > 0 && course.modules_list.map((mod: any, mi: number) => (
                    <div key={mi} className="space-y-3">
                      {/* 模块标题 */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[#f0f6fc] text-lg">
                          <span className="text-[#8b949e]">Day {mi + 1}</span> · {mod.title.replace(/^Day \d+[：: ]?/, '')}
                        </h3>
                        <span className="text-sm text-[#8b949e]">{mod.duration} · {mod.lessons?.length || mod.content?.length || 0}课时</span>
                      </div>
                      
                      {/* 课时列表 */}
                      <div className="grid grid-cols-1 gap-2">
                        {(mod.lessons?.length > 0 ? mod.lessons : (mod.content || []).map((c: string) => ({
                          title: c.replace(/^🔥 /, ''),
                          isPractical: c.startsWith('🔥'),
                          summary: '',
                          keyConcept: { title: '', description: '' },
                          homework: ''
                        }))).map((lesson: any, li: number) => (
                          <Link
                            key={li}
                            href={`/courses/training/lessons/${mi}/${li}`}
                            className="block group"
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: li * 0.05 }}
                              className="relative p-4 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff]/40 hover:bg-gradient-to-r hover:from-[#161b22] hover:to-[#1c2434] transition-all duration-300 cursor-pointer"
                            >
                              <div className="flex items-start gap-3">
                                {/* 序号 */}
                                <div className="w-7 h-7 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-center text-xs font-bold text-[#8b949e] group-hover:text-[#58a6ff] group-hover:border-[#58a6ff]/30 shrink-0 transition-colors">
                                  {li + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-medium text-[#f0f6fc] group-hover:text-[#58a6ff] transition-colors truncate">
                                      {lesson.title}
                                    </h4>
                                    {lesson.isPractical && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#d2991d]/15 text-[#d2991d] text-xs shrink-0">
                                        <Flame className="w-3 h-3" />实操
                                      </span>
                                    )}
                                  </div>
                                  {lesson.summary && (
                                    <p className="text-xs text-[#8b949e] leading-relaxed line-clamp-2">
                                      {lesson.summary}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 mt-1.5">
                                    {lesson.keyConcept?.icon && (
                                      <span className="flex items-center gap-1 text-xs text-[#484f58]">
                                        <Lightbulb className="w-3 h-3" />
                                        {lesson.keyConcept.icon} {lesson.keyConcept.title?.slice(0, 15)}…
                                      </span>
                                    )}
                                    {lesson.selfTest && lesson.selfTest.length > 0 && (
                                      <span className="text-xs text-[#484f58]">
                                        {lesson.selfTest.length}题·自测
                                      </span>
                                    )}
                                    <span className="ml-auto text-[#58a6ff] opacity-0 group-hover:opacity-100 text-xs transition-opacity">
                                      查看详情 →
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Outcomes */}
                <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d]">
                  <h2 className="text-xl font-semibold text-[#f0f6fc] mb-4">培训成果</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(course.outcomes || []).map((outcome: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-[#c9d1d9]">
                        <CheckCircle className="w-5 h-5 text-[#58a6ff]" />
                        {outcome}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161b22] to-[#1a1f2e] border border-[#30363d] lg:sticky lg:top-24 shadow-lg shadow-black/20">
                  <div className="text-3xl font-bold text-[#f0f6fc] mb-2 bg-gradient-to-r from-[#f0f6fc] to-[#e0e6f0] bg-clip-text">{course.price}</div>
                  <div className="text-sm text-[#8b949e] mb-6">含证书费用</div>
                  
                  <div className="space-y-3">
                    <a
                      href="mailto:contact@ccav.com?subject=师资培训报名咨询"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#e53e3e] to-[#c53030] text-white font-semibold hover:from-[#f56565] hover:to-[#e53e3e] hover:shadow-xl hover:shadow-[#e53e3e]/25 transition-all duration-300 active:scale-[0.98]"
                    >
                      <Mail className="w-4 h-4" />
                      邮件咨询报名
                    </a>
                    <a
                      href="#"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] font-semibold hover:border-[#58a6ff]/50 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      在线咨询（即将上线）
                    </a>
                  </div>

                  <div className="mt-6 pt-6 border-t border-[#30363d] space-y-3 text-sm">
                    <div className="flex justify-between text-[#c9d1d9]">
                      <span className="text-[#8b949e]">目标学员</span>
                      <span className="text-right ml-4">{course.targetAudience}</span>
                    </div>
                    <div className="flex justify-between text-[#c9d1d9]">
                      <span className="text-[#8b949e]">学习形式</span>
                      <span>{course.format}</span>
                    </div>
                    <div className="flex justify-between text-[#c9d1d9]">
                      <span className="text-[#8b949e]">认证证书</span>
                      <span>{course.certification}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
