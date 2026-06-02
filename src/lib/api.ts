/**
 * ccav.com Phase 2 — API 客户端
 * 前端调用后端API，回退到静态数据
 */
import { studentCourses, trainingCourse } from '@/lib/courseData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Gallery API 直接指向后端服务器（静态导出下 API 代理不可用）
 * 生产部署时通过 nginx 反代到同域下的 /api/gallery
 * 开发/调试时直连 3001 端口
 */
const GALLERY_API_BASE = typeof window !== 'undefined'
  ? (window.__NEXT_DATA__?.props?.galleryApiBase ?? process.env.NEXT_PUBLIC_GALLERY_API_URL ?? 'http://100.119.92.94:3001')
  : (process.env.NEXT_PUBLIC_GALLERY_API_URL ?? 'http://100.119.92.94:3001');

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
  media_type?: 'image' | 'video';
  image_url: string;
  video_url?: string;
  author: string;
  avatar_url: string;
  category?: string;
  /** 技术形态：image/video/music/vtuber */
  tech_type?: string;
  /** 应用场景 */
  scene?: string;
  /** 艺术风格 */
  style?: string;
  likes_count: number;
  dislikes_count: number;
  views_count: number;
  liked: boolean;
  disliked: boolean;
  tags: string[];
  course_name?: string;
  course_id?: number;
  created_at: string;
  comments_count?: number;
}

/** GalleryComment 类型 */
export interface GalleryComment {
  id: number;
  gallery_id: number;
  user_id?: number;
  author: string;
  author_avatar?: string;
  content: string;
  created_at: string;
}

/**
 * 将后端 camelCase 数据映射为前端 snake_case
 * 后台 API 服务器 (3001) 返回 { imageUrl, avatarUrl, likes, comments, courseName, createdAt }
 */
export function normalizeGalleryItem(raw: any): GalleryItem {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    media_type: raw.media_type ?? raw.mediaType ?? 'image',
    scene: raw.scene ?? undefined,
    style: raw.style ?? undefined,
    tech_type: raw.tech_type ?? raw.techType ?? undefined,
    image_url: raw.imageUrl ?? raw.image_url ?? '',
    video_url: raw.videoUrl ?? raw.video_url ?? undefined,
    author: raw.author ?? '匿名',
    avatar_url: raw.avatarUrl ?? raw.avatar_url ?? '',
    category: raw.category ?? undefined,
    likes_count: raw.likes ?? raw.likes_count ?? 0,
    dislikes_count: raw.dislikes_count ?? 0,
    views_count: raw.views_count ?? 0,
    liked: raw.liked ?? false,
    disliked: raw.disliked ?? false,
    tags: raw.tags ?? [],
    course_name: raw.courseName ?? raw.course_name ?? undefined,
    course_id: raw.course_id ?? undefined,
    created_at: raw.createdAt ?? raw.created_at ?? '',
    comments_count: raw.comments ?? raw.comments_count ?? 0,
  };
}

// 降级用 Mock 数据
const MOCK_GALLERY: GalleryItem[] = [
  { id: 1, title: "水墨丹青 · 江南烟雨", description: "用AI生成的江南水乡水墨动画，配合古筝BGM，效果惊艳！提示词：烟雨江南，水墨风格，小船流水，4K", media_type: 'image', image_url: "https://picsum.photos/seed/art1/600/800", author: "张三", avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=张三&backgroundColor=c8b898&textColor=0d0d0d", likes_count: 42, dislikes_count: 3, views_count: 1256, liked: false, disliked: false, category: "文生图", tech_type: "image", scene: "故事短片", style: "水墨国潮", tags: ["水墨风","江南"], course_name: "M3 · AI视频制作入门", created_at: "2026-05-28", comments_count: 8 },
  { id: 2, title: "赛博朋克城市夜景", description: "用提示词优化的方式生成了霓虹城市夜景，色彩丰富，很有质感。", media_type: 'image', image_url: "https://picsum.photos/seed/art2/600/800", author: "李四", avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=李四&backgroundColor=206683&textColor=ffffff", likes_count: 38, dislikes_count: 1, views_count: 892, liked: false, disliked: false, category: "文生图", tech_type: "image", scene: "创意混剪", style: "赛博朋克", tags: ["赛博朋克","夜景"], course_name: "M2 · 提示词入门", created_at: "2026-05-27", comments_count: 5 },
  { id: 3, title: "古风侍女 · 短视频", description: "文生视频入门作品，古风侍女在庭院中漫步。", media_type: 'video', image_url: "https://picsum.photos/seed/art3/600/800", video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', author: "王五", avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=王五&backgroundColor=b93a32&textColor=ffffff", likes_count: 56, dislikes_count: 4, views_count: 2103, liked: false, disliked: false, category: "文生视频", tech_type: "video", scene: "故事短片", style: "日系二次元", tags: ["古风","侍女"], course_name: "M1 · AI视频工具全景", created_at: "2026-05-26", comments_count: 12 },
  { id: 4, title: "国潮字体设计", description: "用AI生成的国潮风格字体设计，结合了传统书法与现代设计。", media_type: 'image', image_url: "https://picsum.photos/seed/art4/600/800", author: "赵六", avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=赵六&backgroundColor=4a90a8&textColor=ffffff", likes_count: 29, dislikes_count: 5, views_count: 667, liked: false, disliked: false, category: "文生图", tech_type: "image", scene: "商业广告", style: "国潮", tags: ["国潮","字体"], created_at: "2026-05-25", comments_count: 4 },
  { id: 5, title: "敦煌飞天 · AI重构", description: "图生视频作品，敦煌飞天的飘带动画效果。", media_type: 'video', image_url: "https://picsum.photos/seed/art5/600/800", video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', author: "孙七", avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=孙七&backgroundColor=c8b898&textColor=0d0d0d", likes_count: 71, dislikes_count: 6, views_count: 3201, liked: false, disliked: false, category: "图生视频", tech_type: "video", scene: "MV", style: "水墨国潮", tags: ["敦煌","飘带"], course_name: "M3 · AI视频制作入门", created_at: "2026-05-24", comments_count: 15 },
  { id: 6, title: "山水间 · 国风水墨MV", description: "完整AI音乐MV作品，水墨山水画配合古风音乐的视觉盛宴。", media_type: 'video', image_url: "https://picsum.photos/seed/art6/600/800", video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', author: "周八", avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=周八&backgroundColor=206683&textColor=ffffff", likes_count: 94, dislikes_count: 8, views_count: 4500, liked: true, disliked: false, category: "歌曲短视频", tech_type: "music", scene: "MV", style: "水墨国潮", tags: ["水墨","音乐","MV"], course_name: "M4 · 综合创作", created_at: "2026-05-23", comments_count: 22 },
  { id: 7, title: "故宫雪景 · AI复原", description: "用AI给故宫老照片加上了雪景特效，既有历史感又有新意。", media_type: 'image', image_url: "https://picsum.photos/seed/art7/600/800", author: "吴九", avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=吴九&backgroundColor=b93a32&textColor=ffffff", likes_count: 63, dislikes_count: 2, views_count: 1845, liked: false, disliked: false, category: "图生图", tech_type: "image", scene: "故事短片", style: "写实", tags: ["复原","故宫","雪景"], created_at: "2026-05-22", comments_count: 9 },
  { id: 8, title: "AI短片 · 太空之旅", description: "用提示词一步步生成太空场景，科幻短片。", media_type: 'video', image_url: "https://picsum.photos/seed/art8/600/800", video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', author: "郑十", avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=郑十&backgroundColor=4a90a8&textColor=ffffff", likes_count: 48, dislikes_count: 2, views_count: 1567, liked: false, disliked: false, category: "文生视频", tech_type: "video", scene: "创意混剪", style: "赛博朋克", tags: ["科幻","太空"], course_name: "M5 · 进阶技巧", created_at: "2026-05-21", comments_count: 11 },
];

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/** 获取作品列表（先请求后端 API 再降级到 Mock，支持 tech_type/scene/style 三维交叉查询） */
export async function getGalleryItems(opts?: {
  tech_type?: string;
  scene?: string;
  style?: string;
  tag?: string;
  category?: string;
}): Promise<GalleryItem[]> {
  const { tech_type, scene, style, tag, category } = opts || {};
  // 优先请求后端 API (直连 3001)
  const params = new URLSearchParams();
  if (tech_type) params.set('techType', tech_type);
  if (scene) params.set('scene', scene);
  if (style) params.set('style', style);
  if (tag) params.set('tag', tag);
  if (category) params.set('category', category);
  const queryStr = params.toString();
  const url = `${GALLERY_API_BASE}/api/gallery${queryStr ? '?' + queryStr : ''}`;
  try {
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const body = await res.json();
      // 后端格式: { code: 0, data: [] }
      const rawItems: any[] = body.data ?? [];
      if (rawItems.length > 0) {
        return rawItems.map(normalizeGalleryItem);
      }
    }
  } catch (e) {
    console.warn('Gallery API unavailable, falling back to Mock', e);
  }
  // 降级到Mock — 前端模拟交叉查询
  let mock = MOCK_GALLERY.map(it => ({ ...it }));
  if (category) mock = mock.filter(it => it.category === category);
  if (tag) mock = mock.filter(it => it.tags.includes(tag));
  if (tech_type) mock = mock.filter(it => it.tech_type === tech_type);
  if (scene) mock = mock.filter(it => it.scene === scene);
  if (style) mock = mock.filter(it => it.style === style);
  return mock;
}

/** Gallery API 统一请求封装 */
export async function galleryFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  const base = GALLERY_API_BASE;
  const url = `${base}/api/gallery${path.startsWith('/') ? path : '/' + path}`;
  try {
    const merged = { ...options };
    merged.headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options?.headers as Record<string, string> ?? {}),
    };
    const res = await fetch(url, merged);
    if (res.ok) {
      const body = await res.json();
      return body.data ?? body ?? null;
    }
  } catch {
    // API 不可用时静默失败
  }
  return null;
}

/** 点赞/取消点赞（返回当前态度） */
export async function toggleLike(itemId: number): Promise<{ liked: boolean; disliked: boolean; likes_count: number; dislikes_count: number } | null> {
  return galleryFetch<{ liked: boolean; disliked: boolean; likes_count: number; dislikes_count: number }>(
    `${itemId}/like`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' } },
  );
}

/** 鄙视/取消鄙视（返回当前态度） */
export async function toggleDislike(itemId: number): Promise<{ liked: boolean; disliked: boolean; likes_count: number; dislikes_count: number } | null> {
  return galleryFetch<{ liked: boolean; disliked: boolean; likes_count: number; dislikes_count: number }>(
    `${itemId}/dislike`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' } },
  );
}

/** 记录浏览量 */
export async function recordView(itemId: number): Promise<number | null> {
  const result = await galleryFetch<{ views_count?: number }>(
    `${itemId}/view`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' } },
  );
  return result?.views_count ?? null;
}

/** 提交评论 */
export async function submitComment(itemId: number, content: string): Promise<boolean> {
  const result = await galleryFetch<{ success?: boolean }>(
    `${itemId}/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    },
  );
  return result?.success ?? false;
}

/** 获取作品评论列表 */
export async function getGalleryComments(galleryId: number): Promise<GalleryComment[]> {
  const result = await galleryFetch<GalleryComment[]>(`${galleryId}/comments`);
  return result ?? [];
}
