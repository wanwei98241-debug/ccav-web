"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { useProgress } from "@/lib/useProgress";

type Props = {
  courseId: string;
  moduleIndex: number;
  lessonIndex: number;
  lessonUrl: string;
  children: React.ReactNode;
};

export default function LessonCardLock({ courseId, moduleIndex, lessonIndex, lessonUrl, children }: Props) {
  const { isLessonUnlocked } = useProgress(courseId, moduleIndex, lessonIndex);
  const unlocked = isLessonUnlocked(courseId, moduleIndex, lessonIndex);

  if (!unlocked) {
    return (
      <div className="block opacity-50 pointer-events-none">
        <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#21262d] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-[#484f58]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#484f58] mb-1">🔒 待解锁</h3>
              <p className="text-xs text-[#484f58]">完成前面课程后自动解锁</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={lessonUrl} className="block group">
      {children}
    </Link>
  );
}
