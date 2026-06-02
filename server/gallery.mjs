/**
 * ccav.com 作品墙 API 路由
 * GET   /api/gallery              — 获取作品列表（支持 ?tag= 过滤，?page&pageSize 分页）
 * GET   /api/gallery/:id          — 获取单个作品详情（同时增加浏览量）
 * POST  /api/gallery              — 发布作品（需登录）
 * POST  /api/gallery/:id/like    — 点赞/取消点赞（需登录，与鄙视互斥）
 * POST  /api/gallery/:id/dislike — 鄙视/取消鄙视（需登录，与点赞互斥）
 * POST  /api/gallery/:id/view    — 增加浏览量
 * POST  /api/gallery/:id/comments — 提交评论（需登录）
 * GET   /api/gallery/:id/comments — 获取评论列表
 */

import { Router } from 'express';
import db from './db.js';
import { authMiddleware } from './auth.js';

const router = Router();

// 辅助：统一格式化作品行（含用户的态度）
function formatGalleryItem(row, userId = null) {
  let liked = false;
  let disliked = false;

  if (userId) {
    const likeRow = db.prepare('SELECT id FROM gallery_likes WHERE gallery_id = ? AND user_id = ?').get(row.id, userId);
    if (likeRow) liked = true;
    const dislikeRow = db.prepare('SELECT id FROM gallery_dislikes WHERE gallery_id = ? AND user_id = ?').get(row.id, userId);
    if (dislikeRow) disliked = true;
  }

  // 取评论数
  const commentsRow = db.prepare('SELECT COUNT(*) as cnt FROM gallery_comments WHERE gallery_id = ?').get(row.id);

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    media_type: row.media_type || 'image',
    image_url: row.image_url,
    video_url: row.video_url || undefined,
    user_id: row.user_id || undefined,
    author: row.author,
    avatar_url: row.avatar_url,
    likes_count: row.likes_count ?? 0,
    dislikes_count: row.dislikes_count ?? 0,
    views_count: row.views_count ?? 0,
    liked,
    disliked,
    category: row.category || undefined,
    tags: JSON.parse(row.tags || '[]'),
    course_name: row.course_name || undefined,
    course_id: row.course_id || undefined,
    created_at: row.created_at,
    comments_count: commentsRow.cnt,
  };
}

// ============ GET /api/gallery — 获取作品列表（支持分类+标签交叉查询）============
router.get('/', (req, res) => {
  try {
    const { tag, category, page = 1, pageSize = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    const conditions = [];
    const params = [];

    if (tag) {
      conditions.push('tags LIKE ?');
      params.push(`%${tag}%`);
    }
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const items = db.prepare(`
      SELECT * FROM gallery
      ${where}
      ORDER BY sort_order ASC, id DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const total = db.prepare(
      `SELECT COUNT(*) as cnt FROM gallery ${where}`
    ).get(...params).cnt;

    const formatted = items.map(i => formatGalleryItem(i, null));

    res.json({ code: 0, data: formatted, total, page: Number(page) });
  } catch (err) {
    console.error('[GET /api/gallery Error]', err.message);
    res.status(500).json({ code: 1, error: err.message });
  }
});

// ============ GET /api/gallery/:id — 获取单个作品详情（不增加浏览量） ============
router.get('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ code: 1, error: '缺少作品 ID' });

    const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
    if (!item) return res.status(404).json({ code: 1, error: '作品不存在' });

    res.json({ code: 0, data: formatGalleryItem(item, null) });
  } catch (err) {
    console.error('[GET /api/gallery/:id Error]', err.message);
    res.status(500).json({ code: 1, error: err.message });
  }
});

// ============ POST /api/gallery/:id/view — 增加浏览量 ============
router.post('/:id/view', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ code: 1, error: '缺少作品 ID' });

    const item = db.prepare('SELECT id FROM gallery WHERE id = ?').get(id);
    if (!item) return res.status(404).json({ code: 1, error: '作品不存在' });

    db.prepare('UPDATE gallery SET views_count = views_count + 1 WHERE id = ?').run(id);

    const updated = db.prepare('SELECT views_count FROM gallery WHERE id = ?').get(id);
    res.json({ code: 0, data: { views_count: updated.views_count } });
  } catch (err) {
    console.error('[POST /api/gallery/view Error]', err.message);
    res.status(500).json({ code: 1, error: err.message });
  }
});

// ============ POST /api/gallery/:id/like — 点赞（与鄙视互斥） ============
router.post('/:id/like', authMiddleware, (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ code: 1, error: '缺少作品 ID' });

    const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
    if (!item) return res.status(404).json({ code: 1, error: '作品不存在' });

    const userId = req.user.id;

    // 查是否已点赞
    const liked = db.prepare('SELECT id FROM gallery_likes WHERE gallery_id = ? AND user_id = ?').get(id, userId);

    if (liked) {
      // 取消点赞
      db.prepare('DELETE FROM gallery_likes WHERE gallery_id = ? AND user_id = ?').run(id, userId);
      db.prepare('UPDATE gallery SET likes_count = MAX(0, likes_count - 1) WHERE id = ?').run(id);
    } else {
      // 先删除鄙视（互斥）
      const disliked = db.prepare('SELECT id FROM gallery_dislikes WHERE gallery_id = ? AND user_id = ?').get(id, userId);
      if (disliked) {
        db.prepare('DELETE FROM gallery_dislikes WHERE gallery_id = ? AND user_id = ?').run(id, userId);
        db.prepare('UPDATE gallery SET dislikes_count = MAX(0, dislikes_count - 1) WHERE id = ?').run(id);
      }
      // 点赞
      db.prepare('INSERT INTO gallery_likes (gallery_id, user_id) VALUES (?, ?)').run(id, userId);
      db.prepare('UPDATE gallery SET likes_count = likes_count + 1 WHERE id = ?').run(id);
    }

    const updated = db.prepare('SELECT likes_count, dislikes_count FROM gallery WHERE id = ?').get(id);

    // 查最终态度
    const finalLiked = !!db.prepare('SELECT id FROM gallery_likes WHERE gallery_id = ? AND user_id = ?').get(id, userId);
    const finalDisliked = !!db.prepare('SELECT id FROM gallery_dislikes WHERE gallery_id = ? AND user_id = ?').get(id, userId);

    res.json({
      code: 0,
      data: {
        liked: finalLiked,
        disliked: finalDisliked,
        likes_count: updated.likes_count,
        dislikes_count: updated.dislikes_count,
      },
    });
  } catch (err) {
    console.error('[POST /api/gallery/like Error]', err.message);
    res.status(500).json({ code: 1, error: err.message });
  }
});

// ============ POST /api/gallery/:id/dislike — 鄙视（与点赞互斥） ============
router.post('/:id/dislike', authMiddleware, (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ code: 1, error: '缺少作品 ID' });

    const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
    if (!item) return res.status(404).json({ code: 1, error: '作品不存在' });

    const userId = req.user.id;

    // 查是否已鄙视
    const disliked = db.prepare('SELECT id FROM gallery_dislikes WHERE gallery_id = ? AND user_id = ?').get(id, userId);

    if (disliked) {
      // 取消鄙视
      db.prepare('DELETE FROM gallery_dislikes WHERE gallery_id = ? AND user_id = ?').run(id, userId);
      db.prepare('UPDATE gallery SET dislikes_count = MAX(0, dislikes_count - 1) WHERE id = ?').run(id);
    } else {
      // 先删除点赞（互斥）
      const liked = db.prepare('SELECT id FROM gallery_likes WHERE gallery_id = ? AND user_id = ?').get(id, userId);
      if (liked) {
        db.prepare('DELETE FROM gallery_likes WHERE gallery_id = ? AND user_id = ?').run(id, userId);
        db.prepare('UPDATE gallery SET likes_count = MAX(0, likes_count - 1) WHERE id = ?').run(id);
      }
      // 鄙视
      db.prepare('INSERT INTO gallery_dislikes (gallery_id, user_id) VALUES (?, ?)').run(id, userId);
      db.prepare('UPDATE gallery SET dislikes_count = dislikes_count + 1 WHERE id = ?').run(id);
    }

    const updated = db.prepare('SELECT likes_count, dislikes_count FROM gallery WHERE id = ?').get(id);

    // 查最终态度
    const finalLiked = !!db.prepare('SELECT id FROM gallery_likes WHERE gallery_id = ? AND user_id = ?').get(id, userId);
    const finalDisliked = !!db.prepare('SELECT id FROM gallery_dislikes WHERE gallery_id = ? AND user_id = ?').get(id, userId);

    res.json({
      code: 0,
      data: {
        liked: finalLiked,
        disliked: finalDisliked,
        likes_count: updated.likes_count,
        dislikes_count: updated.dislikes_count,
      },
    });
  } catch (err) {
    console.error('[POST /api/gallery/dislike Error]', err.message);
    res.status(500).json({ code: 1, error: err.message });
  }
});

// ============ POST /api/gallery/:id/comments — 提交评论（需登录） ============
router.post('/:id/comments', authMiddleware, (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ code: 1, error: '缺少作品 ID' });

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ code: 1, error: '评论内容不能为空' });
    }

    const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
    if (!item) return res.status(404).json({ code: 1, error: '作品不存在' });

    const user = req.user;
    const userInfo = db.prepare('SELECT id, display_name, avatar_url FROM users WHERE id = ?').get(user.id);
    const authorName = userInfo?.display_name || `用户${user.phone?.slice(-4)}`;

    db.prepare(`
      INSERT INTO gallery_comments (gallery_id, user_id, author, author_avatar, content)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      id,
      user.id,
      authorName,
      userInfo?.avatar_url || null,
      content.trim(),
    );

    const commentsCount = db.prepare('SELECT COUNT(*) as cnt FROM gallery_comments WHERE gallery_id = ?').get(id);
    res.json({ code: 0, data: { success: true, comments_count: commentsCount.cnt } });
  } catch (err) {
    console.error('[POST /api/gallery/comments Error]', err.message);
    res.status(500).json({ code: 1, error: err.message });
  }
});

// ============ GET /api/gallery/:id/comments — 获取评论列表 ============
router.get('/:id/comments', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ code: 1, error: '缺少作品 ID' });

    const item = db.prepare('SELECT id FROM gallery WHERE id = ?').get(id);
    if (!item) return res.status(404).json({ code: 1, error: '作品不存在' });

    const { page = 1, pageSize = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    const comments = db.prepare(`
      SELECT * FROM gallery_comments
      WHERE gallery_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(id, limit, offset);

    const total = db.prepare(
      'SELECT COUNT(*) as cnt FROM gallery_comments WHERE gallery_id = ?'
    ).get(id).cnt;

    res.json({ code: 0, data: comments, total, page: Number(page) });
  } catch (err) {
    console.error('[GET /api/gallery/comments Error]', err.message);
    res.status(500).json({ code: 1, error: err.message });
  }
});

export default router;
