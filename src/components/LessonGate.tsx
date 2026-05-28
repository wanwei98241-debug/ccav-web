"use client";

import { Lock, ArrowLeft, LogIn } from "lucide-react";
import Link from "next/link";
import { useProgress } from "@/lib/useProgress";
import { useAuth } from "@/lib/auth";

type Props = {
  courseId: string;
  moduleIndex: number;
  lessonIndex: number;
  requireAuth?: boolean;  // 学生课程需要登录
  children: React.ReactNode;
};

export default function LessonGate({ courseId, moduleIndex, lessonIndex, requireAuth = false, children }: Props) {
  const { isLessonUnlocked } = useProgress(courseId, moduleIndex, lessonIndex);
  const { isAuthenticated } = useAuth();
  const unlocked = isLessonUnlocked(courseId, moduleIndex, lessonIndex);

  // ===== 未登录阻止 =====
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0d1117]/98 backdrop-blur-sm flex items-center justify-center pt-16">
        <div className="text-center px-6 max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#161b22] border-2 border-[#30363d] flex items-center justify-center">
            <LogIn className="w-10 h-10 text-[#8b949e]" />
          </div>

          <h1 className="text-2xl font-bold text-[#f0f6fc] mb-3">🔒 请先登录</h1>
          <p className="text-[#8b949e] mb-2">学习课程需要登录账号</p>
          <p className="text-sm text-[#484f58] mb-8">登录后自动记录学习进度和考试结果</p>

          <div className="flex flex-col gap-3 items-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#58a6ff] to-[#bc8cff] text-white font-semibold hover:shadow-lg transition-all"
            >
              <LogIn className="w-4 h-4" />
              登录 / 注册
            </Link>
            <Link
              href={`/courses/${courseId}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#21262d] border border-[#30363d] text-[#c9d1d9] hover:border-[#58a6ff]/50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              返回课程目录
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===== 进度锁定 =====
  if (!unlocked) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0d1117]/98 backdrop-blur-sm flex items-center justify-center pt-16">
        <div className="text-center px-6 max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#161b22] border-2 border-[#30363d] flex items-center justify-center">
            <Lock className="w-10 h-10 text-[#8b949e]" />
          </div>

          <h1 className="text-2xl font-bold text-[#f0f6fc] mb-3">🔒 课程已锁定</h1>
          <p className="text-[#8b949e] mb-2">请按顺序完成前面课程并通过考核</p>
          <p className="text-sm text-[#484f58] mb-8">每节课答对 Quiz 后自动解锁下一课</p>

          <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] mb-6 text-left">
            <div className="text-xs text-[#484f58] uppercase mb-1">最近解锁可学</div>
            <Link
              href={findLastUnlockedUrl(courseId, moduleIndex, lessonIndex)}
              className="text-[#58a6ff] hover:underline text-sm font-medium"
            >
              返回最近可学课程 →
            </Link>
          </div>

          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#21262d] border border-[#30363d] text-[#c9d1d9] hover:border-[#58a6ff]/50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            返回课程目录
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function findLastUnlockedUrl(courseId: string, mIdx: number, lIdx: number): string {
  let cm = mIdx;
  let cl = lIdx - 1;
  if (cl < 0) {
    cm = mIdx - 1;
    if (cm < 0) {
      return `/courses/${courseId}/lessons/0/0`;
    }
    cl = 5;
  }

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("ccav-progress-v1");
      if (raw) {
        const data = JSON.parse(raw);
        for (let m = mIdx; m >= 0; m--) {
          const lastL = m === mIdx ? lIdx - 1 : 20;
          for (let l = lastL; l >= 0; l--) {
            const key = `${courseId}:${m}:${l}`;
            if (key === `${courseId}:${mIdx}:${lIdx}`) continue;
            const status = data[key];
            if (status === "passed" || status === "unlocked") {
              return `/courses/${courseId}/lessons/${m}/${l}`;
            }
            if (m === 0 && l === 0) {
              return `/courses/${courseId}/lessons/0/0`;
            }
          }
        }
      }
    } catch { /* ignore */ }
  }

  return `/courses/${courseId}/lessons/0/0`;
}
