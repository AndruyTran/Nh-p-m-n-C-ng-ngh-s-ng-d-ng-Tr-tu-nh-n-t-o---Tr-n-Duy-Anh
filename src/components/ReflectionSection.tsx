/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, Award, Star, ListChecks, HelpCircle, 
  Settings, PenSquare, ChevronRight, Check, Trash, Plus
} from "lucide-react";
import { PortfolioConfig, ReflectionData } from "../types";
import AIPanel from "./AIPanel";

interface ReflectionSectionProps {
  portfolio: PortfolioConfig;
  onChange: (updated: PortfolioConfig) => void;
  isPreview: boolean;
}

export default function ReflectionSection({ portfolio, onChange, isPreview }: ReflectionSectionProps) {
  const { reflection } = portfolio;
  const [aiActiveField, setAiActiveField] = useState<{
    field: "overallReflection" | "favoriteFeature" | "futureApplications";
    label: string;
    text: string;
  } | null>(null);

  // Helper selectors
  const getThemeAccentClass = () => {
    switch (portfolio.theme) {
      case "indigo": return "text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/20";
      case "serif": return "text-amber-800 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/20";
      case "minimal": return "text-zinc-800 bg-zinc-100 border-zinc-200 dark:text-zinc-200 dark:bg-zinc-800";
      default: return "text-teal-600 bg-teal-50 border-teal-100 dark:text-teal-400 dark:bg-teal-950/20";
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

  // Updaters
  const handleUpdateReflectionField = (key: keyof ReflectionData, value: any) => {
    onChange({
      ...portfolio,
      reflection: {
        ...portfolio.reflection,
        [key]: value
      }
    });
  };

  // Challenges edits
  const addChallengeItem = () => {
    const updatedChallenges = [
      ...(reflection.challengesFaced || []),
      {
        challenge: "Thách thức học tập mới phát sinh.",
        solution: "Cách thức ứng dụng công nghệ để giải quyết thỏa đáng."
      }
    ];
    handleUpdateReflectionField("challengesFaced", updatedChallenges);
  };

  const removeChallengeItem = (index: number) => {
    const updatedChallenges = (reflection.challengesFaced || []).filter((_, i) => i !== index);
    handleUpdateReflectionField("challengesFaced", updatedChallenges);
  };

  const handleChallengeChange = (index: number, key: "challenge" | "solution", value: string) => {
    const updatedChallenges = [...(reflection.challengesFaced || [])];
    updatedChallenges[index] = {
      ...updatedChallenges[index],
      [key]: value
    };
    handleUpdateReflectionField("challengesFaced", updatedChallenges);
  };

  return (
    <div id="reflection-section-container" className="space-y-8 animate-fade-in pb-16">
      
      {/* 1. Overall Reflection and review */}
      <div className={`bg-white dark:bg-slate-900 border ${getThemeBorderClass()} rounded-3xl p-6 shadow-xs space-y-4`}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${getThemeAccentClass()}`}>
              <Award className="w-4 h-4" />
            </span>
            <span>Tổng kết Trải nghiệm & Cảm nhận cá nhân</span>
          </h2>
          {!isPreview && (
            <button
              onClick={() => setAiActiveField({
                field: "overallReflection",
                label: "Tổng kết trải nghiệm cá nhân",
                text: reflection.overallReflection
              })}
              className="bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 px-2 py-1 rounded-xl flex items-center gap-1 hover:bg-teal-100/60 text-[11px] font-bold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
              <span>AI Cải Tiến</span>
            </button>
          )}
        </div>

        {isPreview ? (
          <p id="reflection-overall-text" className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
            {reflection.overallReflection}
          </p>
        ) : (
          <textarea
            value={reflection.overallReflection}
            onChange={(e) => handleUpdateReflectionField("overallReflection", e.target.value)}
            className="w-full text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed min-h-[120px]"
            placeholder="Chia sẻ kinh nghiệm rèn luyện trong suốt cả học kỳ..."
          />
        )}
      </div>

      {/* Grid: Skills list and Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Skills listed */}
        <div className={`bg-white dark:bg-slate-900 border ${getThemeBorderClass()} rounded-3xl p-6 shadow-xs space-y-4`}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <ListChecks className="w-4 h-4 text-emerald-500" />
            <span>Kỹ năng quan trọng đã đúc kết</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(reflection.keySkillsLearned || []).map((skill, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                {isPreview ? (
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{skill}</span>
                ) : (
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => {
                      const updated = [...(reflection.keySkillsLearned || [])];
                      updated[idx] = e.target.value;
                      handleUpdateReflectionField("keySkillsLearned", updated);
                    }}
                    className="text-xs font-semibold bg-transparent border-b border-transparent focus:border-teal-500 text-slate-700 dark:text-slate-300 focus:outline-hidden w-full py-0"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Favorite insights section */}
        <div className={`bg-white dark:bg-slate-900 border ${getThemeBorderClass()} rounded-3xl p-6 shadow-xs flex flex-col justify-between`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500" />
                <span>Nội dung hoặc Bài tập đắc ý nhất</span>
              </h3>
              {!isPreview && (
                <button
                  onClick={() => setAiActiveField({
                    field: "favoriteFeature",
                    label: "Nội dung đắc ý nhất học kỳ",
                    text: reflection.favoriteFeature
                  })}
                  className="bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 px-1.5 py-0.5 rounded-lg flex items-center gap-1 hover:bg-teal-100/60 text-[10px] font-bold cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
                  <span>AI Sửa</span>
                </button>
              )}
            </div>

            {isPreview ? (
              <p id="reflection-favorite-text" className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                {reflection.favoriteFeature}
              </p>
            ) : (
              <textarea
                value={reflection.favoriteFeature}
                onChange={(e) => handleUpdateReflectionField("favoriteFeature", e.target.value)}
                className="w-full text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed min-h-[100px] resize-none"
              />
            )}
          </div>
        </div>

      </div>

      {/* Challenges & Solutions Custom Table */}
      <div className={`bg-white dark:bg-slate-900 border ${getThemeBorderClass()} rounded-3xl p-6 shadow-xs space-y-4`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-red-500" />
            <span>Thách thức trong học phần & Giải pháp vượt khó</span>
          </h3>
          {!isPreview && (
            <button
              onClick={addChallengeItem}
              className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm thách thức
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(reflection.challengesFaced || []).map((item, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl relative space-y-2.5">
              {!isPreview && (
                <button
                  onClick={() => removeChallengeItem(idx)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-1 bg-white dark:bg-slate-900 rounded-md shadow-xs cursor-pointer"
                  title="Xóa thách thức này"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Challenge label */}
              <div>
                <span className="text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-950/20 px-2 py-0.5 rounded-full uppercase tracking-wider block w-max mb-1">Khó khăn {idx + 1}</span>
                {isPreview ? (
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.challenge}</p>
                ) : (
                  <input
                    type="text"
                    value={item.challenge}
                    onChange={(e) => handleChallengeChange(idx, "challenge", e.target.value)}
                    className="w-full text-xs font-semibold bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-hidden"
                  />
                )}
              </div>

              {/* Solution laber */}
              <div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full uppercase tracking-wider block w-max mb-1">Giải pháp áp dụng</span>
                {isPreview ? (
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">{item.solution}</p>
                ) : (
                  <textarea
                    value={item.solution}
                    onChange={(e) => handleChallengeChange(idx, "solution", e.target.value)}
                    className="w-full text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg leading-relaxed resize-none min-h-[50px] focus:outline-hidden"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Future direction and applications */}
      <div className={`bg-white dark:bg-slate-900 border ${getThemeBorderClass()} rounded-3xl p-6 shadow-xs space-y-4`}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${getThemeAccentClass()}`}>
              <ChevronRight className="w-4 h-4" />
            </span>
            <span>Định hướng ứng dụng kĩ năng số vào tương lai</span>
          </h2>
          {!isPreview && (
            <button
              onClick={() => setAiActiveField({
                field: "futureApplications",
                label: "Ứng dụng kỹ năng số vào tương lai",
                text: reflection.futureApplications
              })}
              className="bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 px-2 py-1 rounded-xl flex items-center gap-1 hover:bg-teal-100/60 text-[11px] font-bold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
              <span>AI Đề Xuất</span>
            </button>
          )}
        </div>

        {isPreview ? (
          <p id="reflection-future-text" className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
            {reflection.futureApplications}
          </p>
        ) : (
          <textarea
            value={reflection.futureApplications}
            onChange={(e) => handleUpdateReflectionField("futureApplications", e.target.value)}
            className="w-full text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed min-h-[100px]"
          />
        )}
      </div>

      {/* AI Assistant Modal panel overlay */}
      {aiActiveField && (
        <AIPanel
          contextType="improve-text"
          onClose={() => setAiActiveField(null)}
          fieldName={aiActiveField.label}
          initialText={aiActiveField.text}
          onApplyText={(text) => handleUpdateReflectionField(aiActiveField.field, text)}
        />
      )}

    </div>
  );
}
