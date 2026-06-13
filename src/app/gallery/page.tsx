"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GalleryItem, getGalleryItems, galleryFetch, toggleLike as apiToggleLike, toggleDislike as apiToggleDislike, recordView as apiRecordView } from "@/lib/api";
import CommentsList from "@/components/gallery/CommentsList";
import Navbar from "@/components/layout/Navbar";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Footer from "@/components/layout/Footer";

export default function GalleryPage() {
  // ── 筛选维度定义 ──
  const DIMS = {
    tech: { label: '🔑 创作技术', tags: ['全部','文生图','文生视频','图生图','图生视频','AI音乐'] },
    scene: { label: '📂 应用场景', tags: ['全部','故事短片','AI电影','商业广告','品牌宣传','课程微课','创意混剪','实验艺术','🎤 词曲演唱','🎵 纯音乐/BGM'] },
    style: { label: '🎨 艺术风格', tags: ['全部','国风水墨','国潮复古','科幻赛博','极简现代','手绘插画','抽象概念'] },
    stage: { label: '🏆 课程学段', tags: ['全部','L1·基础工坊','L2·进阶工具','L3·超清精修','L4·综合实战','L5·商业交付'] },
  } as const;
  type Dim = keyof typeof DIMS;

  // ── 作品数据 ──
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);


  // ── 各维度选中状态（"全部"表示未选） ──
  const [activeFilters, setActiveFilters] = useState<Record<Dim, string>>({
    tech: '全部',
    scene: '全部',
    style: '全部',
    stage: '全部',
  });

  // ── 后端动态场景/风格选项（用于提交 API 请求的参数回填） ──
  const [sceneOptions, setSceneOptions] = useState<string[]>([]);
  const [styleOptions, setStyleOptions] = useState<string[]>([]);

  // ── 加载筛选选项 ──
  useEffect(() => {
    galleryFetch('/filters', {}).then((res: any) => {
      if (res?.scenes) setSceneOptions(res.scenes);
      if (res?.styles) setStyleOptions(res.styles);
    }).catch(() => {});
  }, []);

  // ── 标签点击处理器（单选 + 回退"全部"） ──
  const handleTagClick = (dim: Dim, tag: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [dim]: prev[dim] === tag ? '全部' : tag,
    }));
  };

  // ── 清除所有筛选 ──
  const clearFilters = () => {
    setActiveFilters({ tech: '全部', scene: '全部', style: '全部', stage: '全部' });
  };

  const hasActiveFilters = Object.values(activeFilters).some(v => v !== '全部');

  // ── 哑态灰化检测 ──
  const isTagDisabled = (dim: Dim, tag: string): boolean => {
    if (tag === '全部') return false;
    const current = activeFilters[dim];
    if (current === tag) return false;

    // 取当前作品在此维度的值
    const getVal = (it: GalleryItem): string | undefined => {
      switch (dim) {
        case 'tech': return mapTechValueToLabel(it.tech_type);
        case 'scene': return it.scene;
        case 'style': return it.style;
        case 'stage': return it.stage;
      }
    };

    // 看已选的其他维度过滤后，是否还有作品包含 tag
    const matchesDim = (it: GalleryItem, d: Dim): boolean => {
      const v = activeFilters[d];
      if (v === '全部') return true;
      switch (d) {
        case 'tech': return mapTechValueToLabel(it.tech_type) === v;
        case 'scene': return it.scene === v;
        case 'style': return it.style === v;
        case 'stage': return it.stage === v;
      }
    };

    const candidates = items.filter(it =>
      (['tech','scene','style','stage'] as Dim[])
        .filter(d => d !== dim)
        .every(d => matchesDim(it, d))
    );

    return !candidates.some(it => getVal(it) === tag);
  };

  // ── tech_type value → label 映射 ──
  const mapTechValueToLabel = (val: string | undefined): string | undefined => {
    const map: Record<string, string> = {
      'text-to-image': '文生图',
      'text-to-video': '文生视频',
      'image-to-image': '图生图',
      'image-to-video': '图生视频',
      'song-video': 'AI音乐',
    };
    return val ? map[val] ?? val : undefined;
  };

  // ── 纯前端四维交集筛选 ──
  const displayedWorks = items.filter(it => {
    const techLabel = mapTechValueToLabel(it.tech_type);
    if (activeFilters.tech !== '全部' && techLabel !== activeFilters.tech) return false;
    if (activeFilters.scene !== '全部' && it.scene !== activeFilters.scene) return false;
    if (activeFilters.style !== '全部' && it.style !== activeFilters.style) return false;
    if (activeFilters.stage !== '全部' && it.stage !== activeFilters.stage) return false;
    return true;
  });

  // ── 加载作品数据 ──
  useEffect(() => {
    // 映射后端需要的参数
    const techMap: Record<string, string> = {
      '文生图': 'text-to-image',
      '文生视频': 'text-to-video',
      '图生图': 'image-to-image',
      '图生视频': 'image-to-video',
      'AI音乐': 'song-video',
    };

    const params: any = {};
    if (activeFilters.tech !== '全部' && techMap[activeFilters.tech]) {
      params.tech_type = techMap[activeFilters.tech];
    }

    getGalleryItems(params).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [activeFilters.tech]); // 只在创作技术变化时重新请求

  // ── 浏览器回退处理：弹窗打开时 pushState，回退时关弹窗 ──
  const selectedRef = useRef<GalleryItem | null>(null);
  useEffect(() => { selectedRef.current = selectedItem; }, [selectedItem]);

  const closeDetail = useCallback(() => {
    setSelectedItem(null);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      if (selectedRef.current) {
        // 弹窗开着时回退 → 关弹窗，不回退到前页
        setSelectedItem(null);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // ── 记录浏览量 ──
  const openDetail = async (item: GalleryItem) => {
    // 先 pushState，保证回退时能正确关弹窗而不是跳到上一页
    if (!selectedItem) {
      window.history.pushState({ galleryModalOpen: true }, "");
    }
    setSelectedItem(item);
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


  // ── 渲染筛选按钮 ──
  const renderTagRow = (dim: Dim) => {
    const { label, tags } = DIMS[dim];
    const active = activeFilters[dim];
    const isPrimary = dim === 'tech';

    return (
      <div className={`${isPrimary ? 'mb-3' : 'mb-2 last:mb-0'}`}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`${isPrimary ? 'text-xs' : 'text-[11px]'} font-medium whitespace-nowrap`} style={{ color: "rgba(0,0,0,0.3)" }}>
            {label}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => {
            const isActive = active === tag;
            const disabled = dim !== 'tech' && !isActive && isTagDisabled(dim, tag);
            return (
              <button
                key={tag}
                disabled={disabled}
                onClick={() => handleTagClick(dim, tag)}
                className={[
                  'px-2.5 py-1 rounded-md border transition-all duration-150',
                  isPrimary ? 'text-sm' : 'text-xs',
                  isActive
                    ? 'bg-blue-600/10 text-blue-600 border-blue-500/30'
                    : disabled
                      ? 'text-zinc-300 border-zinc-200/30 cursor-not-allowed'
                      : 'text-zinc-400 border-zinc-300/30 hover:text-zinc-600 hover:border-zinc-400/50',
                ].join(' ')}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <Breadcrumbs items={[{ label: "作品展示" }]} />
      <div className="min-h-screen"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 20%, rgba(37,99,235,0.04) 0%, transparent 60%), " +
            "radial-gradient(ellipse 60% 50% at 85% 60%, rgba(14,165,233,0.03) 0%, transparent 60%), " +
            "#f8fafc",
        }}>
        {/* Hero */}
        <section className="relative pt-20 pb-16 px-4 text-center overflow-hidden">
          <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "#1e293b" }}>
            作品墙
          </h1>
          <p className="text-sm md:text-base max-w-xl mx-auto" style={{ color: "rgba(0,0,0,0.45)" }}>
            学员AI作品展示区 · 用AI创造文化之美
          </p>

          {/* ── 四维筛选面板（全部展开，视觉降权） ── */}
          <div className="max-w-2xl mx-auto mt-6 p-4 rounded-xl"
            style={{ background: "#ffffff", border: "1px solid rgba(37,99,235,0.08)" }}>
            {renderTagRow('tech')}
            {renderTagRow('scene')}
            {renderTagRow('style')}
            {renderTagRow('stage')}

            {/* 清除筛选按钮 */}
            {hasActiveFilters && (
              <div className="mt-3 pt-2 border-t border-white/5">
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 text-xs rounded-lg border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition"
                >
                  清除筛选
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 作品网格 */}
        <section className="max-w-7xl mx-auto px-4 pb-20">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-8 h-8 border-2 border-[#c8b898]/30 border-t-[#c8b898] rounded-full animate-spin" />
            </div>
          ) : displayedWorks.length === 0 ? (
            <div className="text-center py-32 text-white/20">
              <p className="text-lg">暂无作品</p>
              <p className="text-sm mt-2">点下方按钮显示全部作品</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {displayedWorks.map((item) => (
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
                    {item.media_type === 'video' && item.video_url && item.video_url !== '无' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm group-hover:bg-black/70 transition">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <polygon points="8,5 19,12 8,19" />
                          </svg>
                        </div>
                      </div>
                    )}
                    {item.media_type === 'video' && item.video_url && item.video_url !== '无' && item.duration_seconds && (
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
            onClick={closeDetail}
          >
            <div
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 relative"
              style={{ background: "#111" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {/* 关闭按钮 */}
                <button
                  onClick={closeDetail}
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white transition"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
                {selectedItem.media_type === 'video' && selectedItem.video_url && selectedItem.video_url !== '无' ? (
                  <video
                    src={selectedItem.video_url}
                    controls
                    autoPlay
                    muted
                    preload="metadata"
                    className="w-full max-h-[50vh] object-contain"
                    style={{ background: "#0a0a0a" }}
                    playsInline
                  >
                    您的浏览器不支持视频播放
                  </video>
                ) : (
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.title}
                    className="w-full max-h-[50vh] object-contain"
                    style={{ background: "#0a0a0a" }}
                  />
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {selectedItem.views_count?.toLocaleString() || 0}
                  </span>
                  <span className="flex items-center gap-1">❤️ {selectedItem.likes_count - selectedItem.dislikes_count}</span>
                  <span className="flex items-center gap-1">💩 {selectedItem.dislikes_count}</span>
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

                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedItem.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/30">
                      #{tag}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-sm text-white/50 leading-relaxed">{selectedItem.description}</p>

                <div className="my-4 border-t border-white/5" />

                <div>
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
