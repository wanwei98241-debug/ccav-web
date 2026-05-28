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

// ============ 作品墙 ============

/** GalleryItem 类型 — 前端统一使用 snake_case */
export interface GalleryItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  author: string;
  avatar_url: string;
  likes_count: number;
  liked: boolean;
  tags: string[];
  course_name?: string;
  created_at: string;
  comments_count?: number;
}

/**
 * 将后端 camelCase 数据映射为前端 snake_case
 * 后台 API 服务器 (3001) 返回 { imageUrl, avatarUrl, likes, comments, courseName, createdAt }
 */
function normalizeGalleryItem(raw: any): GalleryItem {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    image_url: raw.imageUrl ?? raw.image_url ?? '',
    author: raw.author ?? '匿名',
    avatar_url: raw.avatarUrl ?? raw.avatar_url ?? '',
    likes_count: raw.likes ?? raw.likes_count ?? 0,
    liked: raw.liked ?? false,
    tags: raw.tags ?? [],
    course_name: raw.courseName ?? raw.course_name ?? undefined,
    created_at: raw.createdAt ?? raw.created_at ?? '',
    comments_count: raw.comments ?? raw.comments_count ?? 0,
  };
}

// 降级用 Mock 数据
const MOCK_GALLERY: GalleryItem[] = [
  { id: 1, title: "水墨丹青 · 江南烟雨", description: "用可灵AI生成的江南水乡水墨动画，配合古筝BGM，效果惊艳！提示词：烟雨江南，水墨风格，小船流水，4K", image_url: "https://picsum.photos/seed/art1/600/800", author: "张三", avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=张三&backgroundColor=c8b898&textColor=0d0d0d", likes_count: 42, liked: false, tags: ["可灵","文生图","水墨风"], course_name: "M3 · AI视频制作入门", created_at: "2026-05-28", comments_count: 8 },
  { id: 2, title: "赛博朋克城市夜景", description: "用提示词优化的方式生成了霓虹城市夜景，色彩丰富，很有质感。", image_url: "https://picsum.photos/seed/art2/600/800", author: "李四", avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=李四&backgroundColor=206683&textColor=ffffff", likes_count: 38, liked: false, tags: ["提示词","赛博朋克"], course_name: "M2 · 提示词入门", created_at: "2026-05-27", comments_count: 5 },
  { id: 3, title: "古风侍女 · 短视频", description: "可灵文生视频入门作品，古风侍女在庭院中漫步。", image_url: "https://picsum.photos/seed/art3/600/800", author: "王五", avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=王五&backgroundColor=b93a32&textColor=ffffff", likes_count: 56, liked: false, tags: ["可灵","文生视频","古风"], course_name: "M1 · AI视频工具全景", created_at: "2026-05-26", comments_count: 12 },
  { id: 4, title: "国潮字体设计", description: "用AI生成的国潮风格字体设计，结合了传统书法与现代设计。", image_url: "https://picsum.photos/seed/art4/600/800", author: "赵六", avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=赵六&backgroundColor=4a90a8&textColor=ffffff", likes_count: 29, liked: false, tags: ["设计","国潮","字体"], created_at: "2026-05-25", comments_count: 4 },
  { id: 5, title: "敦煌飞天 · AI重构", description: "用可灵生图+Runway运动笔刷，敦煌飞天的飘带动画效果。", image_url: "https://picsum.photos/seed/art5/600/800", author: "孙七", avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=孙七&backgroundColor=c8b898&textColor=0d0d0d", likes_count: 71, liked: false, tags: ["可灵","Runway","敦煌"], course_name: "M3 · AI视频制作入门", created_at: "2026-05-24", comments_count: 15 },
  { id: 6, title: "山水间 · 国风水墨MV", description: "完整AI音乐MV作品，水墨山水画配合古风音乐的视觉盛宴。", image_url: "https://picsum.photos/seed/art6/600/800", author: "周八", avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=周八&backgroundColor=206683&textColor=ffffff", likes_count: 94, liked: true, tags: ["MV","水墨","音乐"], course_name: "M4 · 综合创作", created_at: "2026-05-23", comments_count: 22 },
  { id: 7, title: "故宫雪景 · AI复原", description: "用AI给故宫老照片加上了雪景特效，既有历史感又有新意。", image_url: "https://picsum.photos/seed/art7/600/800", author: "吴九", avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=吴九&backgroundColor=b93a32&textColor=ffffff", likes_count: 63, liked: false, tags: ["复原","故宫","雪景"], created_at: "2026-05-22", comments_count: 9 },
  { id: 8, title: "AI短片 · 太空之旅", description: "用提示词一步步生成太空场景，Luma+可灵组合的科幻短片。", image_url: "https://picsum.photos/seed/art8/600/800", author: "郑十", avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=郑十&backgroundColor=4a90a8&textColor=ffffff", likes_count: 48, liked: false, tags: ["科幻","Luma","短片"], course_name: "M5 · 进阶技巧", created_at: "2026-05-21", comments_count: 11 },
];

/** 获取作品列表（带降级到Mock） */
export async function getGalleryItems(tag?: string): Promise<GalleryItem[]> {
  // 优先请求后端 API
  const params = tag ? `?tag=${encodeURIComponent(tag)}` : '';
  try {
    const res = await fetch(`/api/gallery${params}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const body = await res.json();
      // 兼容 { code: 0, data: [...] } 和 { items: [...] } 两种返回格式
      const rawItems: any[] = body.data ?? body.items ?? [];
      if (rawItems.length > 0) {
        return rawItems.map(normalizeGalleryItem);
      }
    }
  } catch {
    // API 不可用时降级
  }
  // 降级到Mock
  return MOCK_GALLERY.map(it => ({ ...it }));
}

/** 点赞/取消点赞 */
export async function toggleLike(itemId: number): Promise<boolean> {
  try {
    const res = await fetch(`/api/gallery/${itemId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const body = await res.json();
      return body.liked ?? false;
    }
  } catch {
    // API 不可用时静默失败
  }
  return false;
}

/** 提交评论 */
export async function submitComment(itemId: number, content: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/gallery/${itemId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const body = await res.json();
      return body.success ?? false;
    }
  } catch {
    // API 不可用时静默失败
  }
  return false;
}
