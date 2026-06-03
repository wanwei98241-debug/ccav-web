"use client";

import { useState, useEffect } from "react";
import { GalleryItem, getGalleryItems, galleryFetch, toggleLike as apiToggleLike, toggleDislike as apiToggleDislike, recordView as apiRecordView, submitComment as apiSubmitComment } from "@/lib/api";
import CommentsList from "@/components/gallery/CommentsList";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function GalleryPage() {
  // 固定分类选项：value（后端英文值）用于筛选请求，label 用于展示
  // value=后端英文值(用于API请求)，label=中文显示名(用于页面展示)
  const CATEGORIES: { value: string; label: string }[] = [
    { value: 'text-to-image', label: '文生图' },
    { value: 'text-to-video', label: '文生视频' },
    { value: 'image-to-image', label: '图生图' },
    { value: 'image-to-video', label: '图生视频' },
    { value: 'song-video', label: '歌曲短视频' },
  ];

  // 技术形态大分类（上方按钮）
  const TECH_TYPES = [
    { value: '', label: '全部' },
    { value: 'image', label: '图片' },
    { value: 'video', label: '视频' },
    { value: 'music', label: '音乐' },
    { value: 'vtuber', label: '虚拟主播' },
  ];

  // 场景 + 风格 选项（从后端API获取，动态刷新）
  const [sceneOptions, setSceneOptions] = useState<string[]>([]);
  const [styleOptions, setStyleOptions] = useState<string[]>([]);

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  // 三维筛选状态
  const [activeTechType, setActiveTechType] = useState<string>('');
  const [activeScene, setActiveScene] = useState<string>('');
  const [activeStyle, setActiveStyle] = useState<string>('');
  const [showFilterPanel, setShowFilterPanel] = useState(true);

  // 加载时同步获取筛选选项
  useEffect(() => {
    galleryFetch('/api/gallery/filters', {}).then((res: any) => {
      if (res?.data?.scenes) setSceneOptions(res.data.scenes);
      if (res?.data?.styles) setStyleOptions(res.data.styles);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    getGalleryItems({
      category: activeCategory || undefined,
      tag: activeTag || undefined,
      tech_type: activeTechType || undefined,
      scene: activeScene || undefined,
      style: activeStyle || undefined,
    }).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [activeCategory, activeTag, activeTechType, activeScene, activeStyle]);

  // 交叉查询：分类 + 标签 + 三维叠加
  const filtered = items.filter((it) => {
    // activeCategory 与 it.category 都是英文值，直接比较
    if (activeCategory && it.category !== activeCategory) return false;
    if (activeTag && !it.tags.includes(activeTag)) return false;
    return true;
  });

  const allTags = [...new Set(items.flatMap((it) => it.tags))];

  // 清除所有筛选
  const clearFilters = () => {
    setActiveCategory(null);
    setActiveTag(null);
    setActiveTechType('');
    setActiveScene('');
    setActiveStyle('');
    setShowFilterPanel(false);
  };

  const hasActiveFilters = activeCategory || activeTag || activeTechType || activeScene || activeStyle;

  // 场景/风格单选切换
  const toggleScene = (s: string) => {
    setActiveScene(activeScene === s ? '' : s);
  };
  const toggleStyle = (s: string) => {
    setActiveStyle(activeStyle === s ? '' : s);
  };

  // 记录浏览量 — 打开弹窗时调用
  const openDetail = async (item: GalleryItem) => {
    setSelectedItem(item);
    // 异步记录浏览量
    apiRecordView(item.id).then((count) => {
      if (count !== null) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, views_count: count } : it
          )
        );
        setSelectedItem((prev) =>
          prev && prev.id === item.id ? { ...prev, views_count: count } : prev
        );
      }
    });
  };

  const toggleLike = async (id: number) => {
    const result = await apiToggleLike(id);
    if (!result) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, ...result } : it
      )
    );
    setSelectedItem((prev) =>
      prev?.id === id ? { ...prev, ...result } : prev
    );
  };

  const toggleDislike = async (id: number) => {
    const result = await apiToggleDislike(id);
    if (!result) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, ...result } : it
      )
    );
    setSelectedItem((prev) =>
      prev?.id === id ? { ...prev, ...result } : prev
    );
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await apiSubmitComment(selectedItem?.id ?? 0, commentText);
    setCommentText("");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ background: "#0d0d0d" }}>
      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            background: "radial-gradient(circle at 50% 0%, #c8b898 0%, transparent 70%)",
          }}
        />
        <h1 className="text-3xl md:text-5xl font-bold text-[#c8b898] mb-4 serif tracking-wide">
          作品墙
        </h1>
        <p className="text-white/40 text-sm md:text-base max-w-xl mx-auto">
          学员AI作品展示区 · 用AI创造文化之美
        </p>
        {/* 技术形态大分类（上方按钮组） */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {TECH_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveTechType(activeTechType === t.value ? '' : t.value)}
              className={`px-4 py-1.5 text-sm rounded-full border transition ${
                activeTechType === t.value
                  ? "bg-[#4ac0d8]/20 text-[#4ac0d8] border-[#4ac0d8]/50 shadow-sm shadow-[#4ac0d8]/10"
                  : "text-white/40 border-white/10 hover:text-white/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 展开筛选面板按钮 */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-lg border transition ${
              showFilterPanel || activeScene || activeStyle
                ? "bg-[#c8b898]/10 text-[#c8b898] border-[#c8b898]/30"
                : "text-white/30 border-white/10 hover:text-white/50"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 21V14M4 10V3M12 21V12M12 8V3M20 21V16M20 12V3M1 14h6M9 8h6M17 16h6" />
            </svg>
            展开筛选
            {activeScene || activeStyle ? (
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8b898]" />
            ) : null}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-xs rounded-lg border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition"
            >
              清除筛选
            </button>
          )}
        </div>

        {/* 场景 + 风格 折叠面板 */}
        {showFilterPanel && (
          <div className="max-w-lg mx-auto mt-4 p-4 rounded-xl border border-white/10" style={{background: "rgba(255,255,255,0.03)"}}>
            {/* 应用场景 */}
            <div className="mb-3">
              <p className="text-xs text-white/30 mb-2 text-left">应用场景</p>
              <div className="flex flex-wrap gap-2">
                {sceneOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleScene(s)}
                    className={`px-3 py-1 text-xs rounded-full border transition ${
                      activeScene === s
                        ? "bg-[#c8b898]/15 text-[#c8b898] border-[#c8b898]/40"
                        : "text-white/30 border-white/10 hover:text-white/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {/* 艺术风格 */}
            <div>
              <p className="text-xs text-white/30 mb-2 text-left">艺术风格</p>
              <div className="flex flex-wrap gap-2">
                {styleOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStyle(s)}
                    className={`px-3 py-1 text-xs rounded-full border transition ${
                      activeStyle === s
                        ? "bg-[#c8b898]/15 text-[#c8b898] border-[#c8b898]/40"
                        : "text-white/30 border-white/10 hover:text-white/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 旧分类过滤（保留兼容） */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1 text-xs rounded-full border transition ${
              !activeCategory
                ? "bg-[#4ac0d8]/15 text-[#4ac0d8] border-[#4ac0d8]/40"
                : "text-white/40 border-white/10 hover:text-white/60"
            }`}
          >
            全部分类
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(activeCategory === cat.value ? null : cat.value)}
              className={`px-3 py-1 text-xs rounded-full border transition ${
                activeCategory === cat.value
                  ? "bg-[#4ac0d8]/15 text-[#4ac0d8] border-[#4ac0d8]/40"
                  : "text-white/40 border-white/10 hover:text-white/60"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {/* 标签过滤（风格/内容 — 保留兼容） */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1 text-xs rounded-full border transition ${
                !activeTag
                  ? "bg-[#c8b898]/10 text-[#c8b898] border-[#c8b898]/30"
                  : "text-white/30 border-white/10 hover:text-white/50"
              }`}
            >
              全部
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1 text-xs rounded-full border transition ${
                  activeTag === tag
                    ? "bg-[#c8b898]/10 text-[#c8b898] border-[#c8b898]/30"
                    : "text-white/30 border-white/10 hover:text-white/50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 作品网格 */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-[#c8b898]/30 border-t-[#c8b898] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 text-white/20">
            <p className="text-lg">暂无作品</p>
            <p className="text-sm mt-2">去 AI工坊 创作你的第一个作品吧</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="break-inside-avoid cursor-pointer group rounded-lg overflow-hidden border border-white/5 hover:border-[#c8b898]/20 transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.02)" }}
                onClick={() => openDetail(item)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {item.tech_type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm group-hover:bg-black/70 transition">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <polygon points="8,5 19,12 8,19" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {item.tech_type === 'music' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm group-hover:bg-black/70 transition">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M9 18V5l12-2v13" />
                          <circle cx="6" cy="18" r="3" />
                          <circle cx="18" cy="16" r="3" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {/* 视频时长角标 */}
                  {item.tech_type === 'video' && item.duration_seconds && (
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{ background: "rgba(0,0,0,0.65)", color: "rgba(255,255,255,0.85)" }}>
                      {String(Math.floor(item.duration_seconds / 60)).padStart(2,'0')}:{String(item.duration_seconds % 60).padStart(2,'0')}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm text-white/80 font-medium truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-white/30">
                    <img src={item.avatar_url} alt="" className="w-4 h-4 rounded-full" />
                    <span>{item.author}</span>
                    <span className="ml-auto flex items-center gap-2">
                      <span className="flex items-center gap-0.5 text-white/30">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        {item.views_count}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={item.liked ? "#c8b898" : "none"} stroke="currentColor" strokeWidth="2" className="text-white/30">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {item.likes_count - item.dislikes_count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 详情弹窗 */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl border border-white/10"
            style={{ background: "#111" }}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.tech_type === 'video' && selectedItem.video_url ? (
              <video
                src={selectedItem.video_url}
                controls
                autoPlay
                className="w-full max-h-[50vh] object-contain"
                style={{ background: "#0a0a0a" }}
              />
            ) : (
              <img
                src={selectedItem.image_url}
                alt={selectedItem.title}
                className="w-full max-h-[50vh] object-contain"
                style={{ background: "#0a0a0a" }}
              />
            )}
            <div className="p-6">
              {/* 标题 + 操作 */}
              {/* 统计数据 */}
              <div className="flex items-center gap-4 mb-4 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {selectedItem.views_count?.toLocaleString() || 0}
                </span>
                <span className="flex items-center gap-1">
                  ❤️ {selectedItem.likes_count - selectedItem.dislikes_count}
                </span>
                <span className="flex items-center gap-1">
                  💩 {selectedItem.dislikes_count}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white/90">{selectedItem.title}</h2>
                  <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                    <img src={selectedItem.avatar_url} alt="" className="w-5 h-5 rounded-full" />
                    <span>{selectedItem.author}</span>
                    {selectedItem.course_name && (
                      <>
                        <span>·</span>
                        <span className="text-[#c8b898]/60">{selectedItem.course_name}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>{selectedItem.created_at}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* 点赞按钮 */}
                  <button
                    onClick={() => toggleLike(selectedItem.id)}
                    className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full border transition ${
                      selectedItem.liked ? 'bg-[#c8b898]/10' : ''
                    }`}
                    style={{
                      borderColor: selectedItem.liked ? "rgba(200,184,152,0.3)" : "rgba(255,255,255,0.1)",
                      color: selectedItem.liked ? "#c8b898" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={selectedItem.liked ? "#c8b898" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {selectedItem.likes_count - selectedItem.dislikes_count}
                  </button>
                  {/* 鄙视按钮 */}
                  <button
                    onClick={() => toggleDislike(selectedItem.id)}
                    className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full border transition ${
                      selectedItem.disliked ? 'bg-red-900/20' : ''
                    }`}
                    style={{
                      borderColor: selectedItem.disliked ? "rgba(255,80,80,0.3)" : "rgba(255,255,255,0.1)",
                      color: selectedItem.disliked ? "#ff6666" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={selectedItem.disliked ? "#ff6666" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M17 14V2M9 18.12l-4-6.3V4h11.2l1.2 5.46a2 2 0 0 1-.24 1.73L12 20" />
                    </svg>
                    {selectedItem.dislikes_count}
                  </button>
                </div>
              </div>

              {/* 标签 */}
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedItem.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/30">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* 描述 */}
              <p className="mt-4 text-sm text-white/50 leading-relaxed">{selectedItem.description}</p>

              {/* 分隔 */}
              <div className="my-4 border-t border-white/5" />

              {/* 评论区 */}
              <div>
                <h3 className="text-sm text-white/40 mb-3">
                  评论 <span className="text-white/20">({selectedItem.comments_count})</span>
                </h3>

                {/* 评论输入 */}
                <form onSubmit={handleComment} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="说点什么..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg border text-white/60 placeholder-white/20 outline-none transition"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(200,184,152,0.3)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs rounded-lg transition text-white/60 border border-white/10 hover:border-[#c8b898]/30 hover:text-[#c8b898]"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    发送
                  </button>
                </form>

                {/* 真实评论 — 从API获取 */}
                <CommentsList galleryId={selectedItem.id} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
      <Footer />
    </>
  );
}
