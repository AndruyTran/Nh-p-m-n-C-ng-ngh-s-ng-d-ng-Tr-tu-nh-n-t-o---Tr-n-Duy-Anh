/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Mail, Github, BookOpen, User, Briefcase, Compass, Edit3, Heart } from "lucide-react";
import { PortfolioConfig } from "../types";
import AIPanel from "./AIPanel";

interface AboutSectionProps {
  portfolio: PortfolioConfig;
  onChange: (updated: PortfolioConfig) => void;
  isPreview: boolean;
}

export default function AboutSection({ portfolio, onChange, isPreview }: AboutSectionProps) {
  const { personalInfo } = portfolio;
  
  // AI overlay state
  const [aiActive, setAiActive] = useState<"personalGoals" | "portfolioObjective" | null>(null);

  const handleUpdate = (key: keyof typeof personalInfo, value: string) => {
    onChange({
      ...portfolio,
      personalInfo: {
        ...portfolio.personalInfo,
        [key]: value
      }
    });
  };

  const getThemeAccentClass = () => {
    switch (portfolio.theme) {
      case "indigo": return "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20";
      case "serif": return "text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20";
      case "minimal": return "text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800";
      default: return "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20";
    }
  };

  const getThemeBorderClass = () => {
    switch (portfolio.theme) {
      case "indigo": return "border-indigo-100 dark:border-indigo-900";
      case "serif": return "border-amber-100 dark:border-amber-900";
      case "minimal": return "border-zinc-200 dark:border-zinc-800";
      default: return "border-teal-100 dark:border-slate-800";
    }
  };

  const getThemeTextClass = () => {
    switch (portfolio.theme) {
      case "indigo": return "from-indigo-600 to-violet-600";
      case "serif": return "from-amber-800 to-rose-900";
      case "minimal": return "from-slate-900 to-zinc-950 dark:from-white dark:to-zinc-300";
      default: return "from-teal-600 to-cyan-600";
    }
  };

  return (
    <div id="about-section" className="space-y-8 animate-fade-in pb-16">
      
      {/* Editorial Profile Header */}
      <div className={`relative bg-gradient-to-br ${getThemeTextClass()} text-white p-8 md:p-12 rounded-3xl overflow-hidden shadow-lg`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-10">
          {/* Avatar frame */}
          <div className="relative flex-shrink-0 group">
            <div className="absolute inset-x-0 -bottom-2 mx-auto w-24 h-4 bg-black/20 blur-md rounded-full" />
            <img
              id="avatar-image"
              src={personalInfo.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400"}
              alt={personalInfo.fullName}
              className="w-40 h-40 md:w-48 md:h-48 rounded-2xl object-cover border-4 border-white/30 dark:border-slate-700/50 shadow-xl relative z-10 transition-transform group-hover:scale-[1.02]"
              onError={(e) => {
                // Return default fallback placeholder on broken image
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200";
              }}
            />
          </div>

          {/* Student Info Metadata */}
          <div className="text-center md:text-left space-y-3 flex-1">
            <div className="space-y-1">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
                {personalInfo.studentId || "MSSV: N/A"} • Lớp {personalInfo.class || "SE..."}
              </span>
              <h1 id="author-fullname" className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5 drop-shadow-xs">
                {personalInfo.fullName || "Tên học viên"}
              </h1>
            </div>

            <div className="text-sm text-teal-50/95 space-y-1 font-medium">
              <p className="flex items-center justify-center md:justify-start gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-300" />
                <span>{personalInfo.major || "Công nghệ kỹ thuật Điện tử - Viễn Thông"}</span>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-1.5">
                <Compass className="w-4 h-4 text-emerald-300" />
                <span>{personalInfo.school || "Cơ sở Đại học"}</span>
              </p>
              {isPreview ? (
                <p className="flex items-center justify-center md:justify-start gap-1.5">
                  <Heart className="w-4 h-4 text-emerald-300" />
                  <span>Sở thích: {personalInfo.interests && personalInfo.interests.length > 0 ? (Array.isArray(personalInfo.interests) ? personalInfo.interests.join(", ") : personalInfo.interests) : "Chưa điền sở thích"}</span>
                </p>
              ) : (
                <div className="flex items-center justify-center md:justify-start gap-1.5 bg-white/10 rounded-lg px-2 py-0.5 max-w-md border border-white/10 mt-1">
                  <Heart className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-emerald-100 flex-shrink-0">Sở thích:</span>
                  <input
                    type="text"
                    value={personalInfo.interests && personalInfo.interests.length > 0 ? (Array.isArray(personalInfo.interests) ? personalInfo.interests.join(", ") : personalInfo.interests) : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const items = val.split(",").map(i => i.trim()).filter(Boolean);
                      onChange({
                        ...portfolio,
                        personalInfo: {
                          ...portfolio.personalInfo,
                          interests: items
                        }
                      });
                    }}
                    placeholder="Gõ sở thích, cách nhau bằng dấu phẩy"
                    className="bg-transparent border-none text-white text-[11px] focus:ring-0 focus:outline-hidden w-full placeholder-teal-100/50 p-0 outline-hidden font-normal ml-1"
                    id="interests-inline-input"
                  />
                </div>
              )}
            </div>

            {/* Quick social connect */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs">
              <a
                id="contact-email-link"
                href={`mailto:${personalInfo.email}`}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-all rounded-lg px-3 py-1.5 text-white"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{personalInfo.email}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Narrative grid (Objective & Goals) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* 1. Portfolio Goal */}
        <div className={`bg-white dark:bg-slate-900 border ${getThemeBorderClass()} rounded-3xl p-8 md:p-10 shadow-xs flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                <span className={`p-2 rounded-xl ${getThemeAccentClass()}`}>
                  <BookOpen className="w-5 h-5" />
                </span>
                <span>Mục tiêu thành lập Portfolio</span>
              </h2>
            </div>

            {isPreview ? (
              <p id="portfolio-objective-text" className="text-sm md:text-base text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                {personalInfo.portfolioObjective || "Chưa nhập mục tiêu thành lập của Portfolio này."}
              </p>
            ) : (
              <textarea
                value={personalInfo.portfolioObjective}
                onChange={(e) => handleUpdate("portfolioObjective", e.target.value)}
                className="w-full text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-teal-500 min-h-[180px] leading-relaxed resize-none"
                placeholder="Ví dụ: Portfolio này được viết để tóm tắt các sản phẩm học thuật và rèn luyện kỹ năng..."
              />
            )}
          </div>
        </div>

        {/* 2. Personal goals and orientation */}
        <div className={`bg-white dark:bg-slate-900 border ${getThemeBorderClass()} rounded-3xl p-8 md:p-10 shadow-xs flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                <span className={`p-2 rounded-xl ${getThemeAccentClass()}`}>
                  <User className="w-5 h-5" />
                </span>
                <span>Mục tiêu học tập & Định hướng nghề nghiệp</span>
              </h2>
            </div>

            {isPreview ? (
              <p id="personal-goals-text" className="text-sm md:text-base text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                {personalInfo.personalGoals || "Chưa thiết lập định hướng định vị bản thân."}
              </p>
            ) : (
              <textarea
                value={personalInfo.personalGoals}
                onChange={(e) => handleUpdate("personalGoals", e.target.value)}
                className="w-full text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-teal-500 min-h-[180px] leading-relaxed resize-none"
                placeholder="Ví dụ: Mục tiêu trở thành Fullstack Developer làm chủ prompt engineering..."
              />
            )}
          </div>
        </div>

      </div>



      {/* AI Assistant modal overlay */}
      {aiActive && (
        <AIPanel
          contextType="improve-text"
          onClose={() => setAiActive(null)}
          fieldName={aiActive === "personalGoals" ? "Mục tiêu học tập định hướng cá nhân" : "Mục tiêu Portfolio cá nhân"}
          initialText={personalInfo[aiActive]}
          onApplyText={(text) => handleUpdate(aiActive, text)}
        />
      )}

    </div>
  );
}
