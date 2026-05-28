/**
 * ccav.com Phase 2 — API 客户端
 * 前端调用后端API，回退到静态数据
 */
import { studentCourses, trainingCourse } from '@/lib/courseData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ============ 课程 ============

export async function getCourses() {
  const data = await fetchAPI<{ courses: any[] }>('/courses');
  if (data?.courses && data.courses.length > 0) {
    return data.courses.map(c => ({
      id: c.slug,
      title: c.title,
      subtitle: c.subtitle || '',
      description: c.description || '',
      slug: c.slug,
      category: c.category,
      level: c.level?.charAt(0).toUpperCase() || 'A',
      duration: c.lesson_count + '节课',
      modules: 0,
      format: '线上线下结合',
      price: c.price > 0 ? `¥${(c.price/100).toFixed(0)}` : '免费',
      tags: [],
      gradient: 'from-blue-400 to-purple-500',
      lessons: [],
    }));
  }

  // 回退到静态数据
  return studentCourses;
}

export async function getCourse(slug: string) {
  // 尝试从API获取
  const data = await fetchAPI<{ course: any }>(`/courses/${slug}`);
  if (data?.course) {
    const c = data.course;
    return {
      id: c.slug,
      title: c.title,
      subtitle: c.subtitle || '',
      description: c.description || '',
      slug: c.slug,
      duration: c.lesson_count + '节课',
      modules: (c.modules || []).length,
      format: '线上线下结合',
      price: c.price > 0 ? `¥${(c.price/100).toFixed(0)}` : '免费',
      level: c.level?.charAt(0).toUpperCase() || 'A',
      tags: [],
      gradient: 'from-blue-400 to-purple-500',
      lessons: [],
      modulesArr: (c.modules || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.description || '',
        sort_order: m.sort_order,
        lessons: (m.lessons || []).map((l: any) => ({
          title: l.title,
          duration: l.duration_minutes,
          completed: false,
        })),
      })),
    };
  }

  // 回退到静态数据
  return slug === 'training' ? trainingCourse : studentCourses.find(c => c.id === slug) || null;
}

// ============ 学习进度 ============

export async function getProgress(): Promise<any[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return [];

  const data = await fetchAPI<{ progress: any[] }>('/courses/progress', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data?.progress || [];
}

export async function updateProgress(courseId: number, lessonId: number, status?: string, progressPercent?: number) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return;

  await fetchAPI('/courses/progress/update', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ course_id: courseId, lesson_id: lessonId, status, progress_percent: progressPercent }),
  });
}

// ============ 测验 ============

/** 提交测验结果（前端已自判分，后端只存分） */
export async function submitQuizResult(courseId: string, lessonId: number, score: number, total: number) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return null;

  return fetchAPI<{ success: boolean; score: number; total: number; passed: boolean; previousBest: number | null }>('/courses/quiz/submit', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId, lessonId, score, total }),
  });
}

/** 获取用户所有测验历史 */
export async function getQuizResults() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return [];

  const data = await fetchAPI<{ results: any[] }>('/courses/quiz/results', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data?.results || [];
}
