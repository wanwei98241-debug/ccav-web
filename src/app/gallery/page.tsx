"use client";

import { useState, useEffect } from "react";

// ===== Mock 数据类型 =====
interface GalleryItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  avatarUrl: string;
  likes: number;
  comments: number;
  liked: boolean;
  tags: string[];
  courseName?: string;
  createdAt: string;
}

// ===== Mock 数据 =====
const MOCK_ITEMS: GalleryItem[] = [
  {
    id: 1,
    title: "水墨丹青 · 江南烟雨",
    description: "用可灵AI生成的江南水乡水墨动画，配合古筝BGM，效果惊艳！提示词：烟雨江南，水墨风格，小船流水，4K",
    imageUrl: "https://picsum.photos/seed/art1/600/800",
    author: "张三",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=张三&backgroundColor=c8b898&textColor=0d0d0d",
    likes: 42,
    comments: 8,
    liked: false,
    tags: ["可灵", "文生图", "水墨风"],
    courseName: "M3 · AI视频制作入门",
    createdAt: "2026-05-28",
  },
  {
    id: 2,
    title: "赛博朋克城市夜景",
    description: "用提示词优化的方式生成了霓虹城市夜景，色彩丰富，很有质感。",
    imageUrl: "https://picsum.photos/seed/art2/600/800",
    author: "李四",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=李四&backgroundColor=206683&textColor=ffffff",
    likes: 38,
    comments: 5,
    liked: false,
    tags: ["提示词", "赛博朋克"],
    courseName: "M2 · 提示词入门",
    createdAt: "2026-05-27",
  },
  {
    id: 3,
    title: "古风侍女 · 短视频",
    description: "可灵文生视频入门作品，古风侍女在庭院中漫步。提示词：古风、侍女、庭院、柳树、长裙飘逸",
    imageUrl: "https://picsum.photos/seed/art3/600/800",
    author: "王五",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=王五&backgroundColor=b93a32&textColor=ffffff",
    likes: 56,
    comments: 12,
    liked: false,
    tags: ["可灵", "文生视频", "古风"],
    courseName: "M1 · AI视频工具全景",
    createdAt: "2026-05-26",
  },
  {
    id: 4,
    title: "国潮字体设计",
    description: "用AI生成的国潮风格字体设计，结合了传统书法与现代设计。",
    imageUrl: "https://picsum.photos/seed/art4/600/800",
    author: "赵六",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=赵六&backgroundColor=4a90a8&textColor=ffffff",
    likes: 29,
    comments: 4,
    liked: false,
    tags: ["设计", "国潮", "字体"],
    createdAt: "2026-05-25",
  },
  {
    id: 5,
    title: "敦煌飞天 · AI重构",
    description: "用可灵生图+Runway运动笔刷，敦煌飞天的飘带动画效果。",
    imageUrl: "https://picsum.photos/seed/art5/600/800",
    author: "孙七",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=孙七&backgroundColor=c8b898&textColor=0d0d0d",
    likes: 71,
    comments: 15,
    liked: false,
    tags: ["可灵", "Runway", "敦煌"],
    courseName: "M3 · AI视频制作入门",
    createdAt: "2026-05-24",
  },
  {
    id: 6,
    title: "山水间 · 国风水墨MV",
    description: "完整AI音乐MV作品，水墨山水画配合古风音乐的视觉盛宴。",
    imageUrl: "https://picsum.photos/seed/art6/600/800",
    author: "周八",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=周八&backgroundColor=206683&textColor=ffffff",
    likes: 94,
    comments: 22,
    liked: true,
    tags: ["MV", "水墨", "音乐"],
    courseName: "M4 · 综合创作",
    createdAt: "2026-05-23",
  },
  {
    id: 7,
    title: "故宫雪景 · AI复原",
    description: "用AI给故宫老照片加上了雪景特效，既有历史感又有新意。",
    imageUrl: "https://picsum.photos/seed/art7/600/800",
    author: "吴九",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=吴九&backgroundColor=b93a32&textColor=ffffff",
    likes: 63,
    comments: 9,
    liked: false,
    tags: ["复原", "故宫", "雪景"],
    createdAt: "2026-05-22",
  },
  {
    id: 8,
    title: "AI短片 · 太空之旅",
    description: "用提示词一步步生成太空场景，Luma+可灵组合的科幻短片。",
    imageUrl: "https://picsum.photos/seed/art8/600/800",
    author: "郑十",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=郑十&backgroundColor=4a90a8&textColor=ffffff",
    likes: 48,
    comments: 11,
    liked: false,
    tags: ["科幻", "Luma", "短片"],
    courseName: "M5 · 进阶技巧",
    createdAt: "2026-05-21",
  },
];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    // TODO: 对接王万里的后端 API
    // fetch('/api/gallery').then(...)
    setTimeout(() => {
      setItems(MOCK_ITEMS);
      setLoading(false);
    }, 300);
  }, []);

  const filtered = activeTag
    ? items.filter((it) => it.tags.includes(activeTag))
    : items;

  const allTags = [...new Set(items.flatMap((it) => it.tags))];

  const toggleLike = (id: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, liked: !it.liked, likes: it.liked ? it.likes - 1 : it.likes + 1 } : it
      )
    );
    if (selectedItem?.id === id) {
      setSelectedItem((prev) =>
        prev ? { ...prev, liked: !prev.liked, likes: prev.liked ? prev.likes - 1 : prev.likes + 1 } : null
      );
    }
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    // TODO: 对接后端
    setCommentText("");
  };

  return (
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
        {/* 标签过滤 */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-3 py-1 text-xs rounded-full border transition ${
              !activeTag
                ? "bg-[#c8b898]/10 text-[#c8b898] border-[#c8b898]/30"
                : "text-white/40 border-white/10 hover:text-white/60"
            }`}
          >
            全部
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1 text-xs rounded-full border transition ${
                activeTag === tag
                  ? "bg-[#c8b898]/10 text-[#c8b898] border-[#c8b898]/30"
                  : "text-white/40 border-white/10 hover:text-white/60"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
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
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm text-white/80 font-medium truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-white/30">
                    <img src={item.avatarUrl} alt="" className="w-4 h-4 rounded-full" />
                    <span>{item.author}</span>
                    <span className="ml-auto flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={item.liked ? "#c8b898" : "none"} stroke="currentColor" strokeWidth="2" className="text-white/30">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {item.likes}
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
            <img
              src={selectedItem.imageUrl}
              alt={selectedItem.title}
              className="w-full max-h-[50vh] object-contain"
              style={{ background: "#0a0a0a" }}
            />
            <div className="p-6">
              {/* 标题 + 操作 */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white/90">{selectedItem.title}</h2>
                  <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                    <img src={selectedItem.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
                    <span>{selectedItem.author}</span>
                    {selectedItem.courseName && (
                      <>
                        <span>·</span>
                        <span className="text-[#c8b898]/60">{selectedItem.courseName}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>{selectedItem.createdAt}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleLike(selectedItem.id)}
                  className="flex items-center gap-1 text-sm px-3 py-1 rounded-full border transition"
                  style={{
                    borderColor: selectedItem.liked ? "rgba(200,184,152,0.3)" : "rgba(255,255,255,0.1)",
                    color: selectedItem.liked ? "#c8b898" : "rgba(255,255,255,0.4)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={selectedItem.liked ? "#c8b898" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {selectedItem.likes}
                </button>
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
                  评论 <span className="text-white/20">({selectedItem.comments})</span>
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

                {/* Mock 评论 */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <img src="https://api.dicebear.com/7.x/initials/svg?seed=助教&backgroundColor=206683&textColor=ffffff" alt="" className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-white/40">助教小王 <span className="text-white/20 ml-2">刚刚</span></p>
                      <p className="text-sm text-white/50 mt-1">不错哦！建议在提示词里加上"4K"和"慢动作"，效果会更出彩 👍</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <img src="https://api.dicebear.com/7.x/initials/svg?seed=张三&backgroundColor=c8b898&textColor=0d0d0d" alt="" className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-white/40">张三 <span className="text-white/20 ml-2">10分钟前</span></p>
                      <p className="text-sm text-white/50 mt-1">谢谢老师！我试一下加个慢动作 😊</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
