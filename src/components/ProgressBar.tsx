"use client";

import { Lock, CheckCircle, Circle } from "lucide-react";
import { useProgress } from "@/lib/useProgress";

type Props = {
  courseId: string;
  moduleIndex: number;
  lessonIndex: number;
};

export default function ProgressBar({ courseId, moduleIndex, lessonIndex }: Props) {
  const { status, getCompletionPercent } = useProgress(courseId, moduleIndex, lessonIndex);

  // Map course IDs to lesson counts
  const courseTotals: Record<string, number> = {
    part1: 16, part2: 20, part3: 22, part4: 16, part5: 16, part6: 8,
    training: 30,
  };
  const total = courseTotals[courseId] || 98;
  const percent = getCompletionPercent(courseId, total);

  return (
    <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[#f0f6fc] flex items-center gap-2">
          {status === "passed" ? (
            <CheckCircle className="w-4 h-4 text-[#3fb950]" />
          ) : status === "unlocked" ? (
            <Circle className="w-4 h-4 text-[#58a6ff]" />
          ) : (
            <Lock className="w-4 h-4 text-[#484f58]" />
          )}
          学习进度
        </span>
        <span className="text-xs text-[#8b949e]">{percent}%</span>
      </div>
      <div className="w-full h-2 bg-[#0d1117] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#3fb950] to-[#39d2c0] rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
