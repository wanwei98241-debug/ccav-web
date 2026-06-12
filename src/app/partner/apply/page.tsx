"use client";

import Navbar from "@/components/layout/Navbar";
import { useState } from "react";

export default function PartnerApplyPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 表单数据收集
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    console.log(Object.fromEntries(data));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-24 text-center relative z-10">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl serif font-bold text-[#1e293b] mb-3">申请已提交</h1>
          <p className="text-[rgba(0,0,0,0.55)] mb-6">
            感谢您的申请！我们的渠道经理将在3个工作日内与您联系。
          </p>
          <a href="/partner" className="text-sm text-[#2563eb] hover:underline">
            返回合作介绍页
          </a>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1.5 rounded-full border border-[rgba(37,99,235,0.15)] text-xs text-[#2563eb] mb-3">
            合作教学点申请
          </div>
          <h1 className="text-2xl md:text-3xl serif font-bold text-[#1e293b] mb-2">
            申请成为合作教学点
          </h1>
          <p className="text-sm text-[rgba(0,0,0,0.5)]">
            填写合作意向表，我们的渠道经理将在3个工作日内与您联系。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="ink-card p-6 space-y-5">
          {/* 机构/联系人姓名 */}
          <div>
            <label className="block text-xs font-medium text-[rgba(0,0,0,0.5)] mb-1.5">
              机构/联系人姓名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-3 py-2 border border-[rgba(0,0,0,0.12)] rounded-lg text-sm text-[#1e293b] bg-white focus:outline-none focus:border-[#2563eb] transition"
              placeholder="请输入您的姓名或机构名称"
            />
          </div>

          {/* 手机号码 */}
          <div>
            <label className="block text-xs font-medium text-[rgba(0,0,0,0.5)] mb-1.5">
              手机号码 <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              required
              pattern="[0-9]{11}"
              className="w-full px-3 py-2 border border-[rgba(0,0,0,0.12)] rounded-lg text-sm text-[#1e293b] bg-white focus:outline-none focus:border-[#2563eb] transition"
              placeholder="请输入11位手机号"
            />
          </div>

          {/* 邮箱 */}
          <div>
            <label className="block text-xs font-medium text-[rgba(0,0,0,0.5)] mb-1.5">
              电子邮箱
            </label>
            <input
              type="email"
              name="email"
              className="w-full px-3 py-2 border border-[rgba(0,0,0,0.12)] rounded-lg text-sm text-[#1e293b] bg-white focus:outline-none focus:border-[#2563eb] transition"
              placeholder="选填"
            />
          </div>

          {/* 所在城市 */}
          <div>
            <label className="block text-xs font-medium text-[rgba(0,0,0,0.5)] mb-1.5">
              所在城市 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="city"
              required
              className="w-full px-3 py-2 border border-[rgba(0,0,0,0.12)] rounded-lg text-sm text-[#1e293b] bg-white focus:outline-none focus:border-[#2563eb] transition"
              placeholder="如：上海市浦东新区"
            />
          </div>

          {/* 意向合作级别 */}
          <div>
            <label className="block text-xs font-medium text-[rgba(0,0,0,0.5)] mb-1.5">
              意向合作级别 <span className="text-red-400">*</span>
            </label>
            <select
              name="partnerLevel"
              required
              className="w-full px-3 py-2 border border-[rgba(0,0,0,0.12)] rounded-lg text-sm text-[#1e293b] bg-white focus:outline-none focus:border-[#2563eb] transition"
            >
              <option value="">请选择</option>
              <option value="授权教学点">授权教学点（¥5-10万/年）</option>
              <option value="标准教学中心">标准教学中心（¥15-25万/年）</option>
              <option value="城市运营中心">城市运营中心（区域协商）</option>
            </select>
          </div>

          {/* 机构简介 */}
          <div>
            <label className="block text-xs font-medium text-[rgba(0,0,0,0.5)] mb-1.5">
              机构简介
            </label>
            <textarea
              name="intro"
              rows={3}
              className="w-full px-3 py-2 border border-[rgba(0,0,0,0.12)] rounded-lg text-sm text-[#1e293b] bg-white focus:outline-none focus:border-[#2563eb] transition resize-none"
              placeholder="简要介绍您的机构情况（如有办学资质请说明）"
            />
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-xs font-medium text-[rgba(0,0,0,0.5)] mb-1.5">备注</label>
            <textarea
              name="notes"
              rows={2}
              className="w-full px-3 py-2 border border-[rgba(0,0,0,0.12)] rounded-lg text-sm text-[#1e293b] bg-white focus:outline-none focus:border-[#2563eb] transition resize-none"
              placeholder="其他需要说明的情况（选填）"
            />
          </div>

          <button type="submit" className="ink-btn w-full">
            提交合作申请
          </button>
        </form>
      </main>

      <footer className="border-t border-[rgba(37,99,235,0.08)] py-8 text-center relative z-10">
        <p className="text-sm text-[rgba(0,0,0,0.5)] mb-2 serif">CCAV — AI视频创作教育机构</p>
        <p className="text-xs text-[rgba(0,0,0,0.45)]">以 T/CCPS 0041—2026 团体标准为核心的AI视频创作教育体系 · © 2026</p>
      </footer>
    </>
  );
}
