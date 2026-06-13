"use client";

import { motion } from "framer-motion";
import { Clock, Award, ArrowLeft, BookOpen, CheckCircle, Flame, Mail, MessageCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { studentCourses, trainingCourse } from "@/lib/courseData";

export default function CourseDetailClient({ id }: { id: string }) {
  const allCourses = [...studentCourses, trainingCourse];
  const course = allCourses.find((c) => c.id === id);

  if (!course) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-32 text-center">
          <h1 className="text-2xl text-gray-900">课程不存在</h1>
          <Link href="/courses/" className="text-indigo-600 mt-4 inline-block">
            返回课程列表
          </Link>
        </main>
        <Footer />
      </>
    );
  }

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
              <ArrowLeft className="w-4 h-4" />
              返回课程列表
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                {course.level}
              </span>
              {course.tags && course.tags.map((tag: string) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/15 text-white/90 text-xs">
                  <Flame className="w-3 h-3" />{tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {course.title}
            </h1>
            <p className="text-lg text-white/90 mb-6">{course.subtitle}</p>
            <div className="flex flex-wrap gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {course.duration}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" /> {course.modules}个模块
              </span>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div className="p-6 rounded-2xl bg-white border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">课程介绍</h2>
                  <p className="text-gray-700 leading-relaxed">{course.description}</p>
                </div>

                {/* Modules */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">课程大纲</h2>
                  {course.modules_list.map((module, index) => (
                    <Link
                      key={module.title}
                      href={`/courses/${course.id}/lessons/${index}`}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="group p-5 rounded-xl bg-white border border-gray-200 hover:border-indigo-400/50 hover:bg-gray-50 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{module.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{module.duration}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {module.content.slice(0, 3).map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              {item.startsWith("🔥") ? (
                                <Flame className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                              )}
                              {item}
                            </li>
                          ))}
                          {module.content.length > 3 && (
                            <li className="text-xs text-indigo-600 pl-6">+{module.content.length - 3} 节课 →</li>
                          )}
                        </ul>
                      </motion.div>
                    </Link>
                  ))}
                </div>

                {/* Outcomes */}
                <div className="p-6 rounded-2xl bg-white border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">学习成果</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.outcomes.map((outcome, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-700">
                        <Award className="w-5 h-5 text-indigo-600" />
                        {outcome}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white border border-gray-200 lg:sticky lg:top-24">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{course.price}</div>
                  <div className="text-sm text-gray-500 mb-6">含证书费用</div>
                  
                  <div className="space-y-3">
                    <a
                      href="mailto:contact@ccav.com"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#e53e3e] to-[#c53030] text-white font-semibold hover:shadow-lg hover:shadow-red-400/20 transition-all"
                    >
                      <Mail className="w-4 h-4" />
                      邮件咨询
                    </a>
                    <a
                      href="#"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-semibold hover:border-indigo-400/50 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      在线咨询（即将上线）
                    </a>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm">
                    <div className="flex justify-between text-gray-700">
                      <span className="text-gray-500">目标学员</span>
                      <span className="text-right ml-4">{course.targetAudience}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="text-gray-500">学习形式</span>
                      <span>{course.format}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="text-gray-500">认证证书</span>
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
