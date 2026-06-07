/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, ArrowRight, Check, X, Wand2, Copy } from "lucide-react";

interface AIPanelProps {
  onClose: () => void;
  onApplyText?: (text: string) => void;
  initialText?: string;
  contextType: "improve-text" | "optimize-prompt";
  fieldName?: string;
}

export default function AIPanel({
  onClose,
  onApplyText,
  initialText = "",
  contextType,
  fieldName = "Nội dung học tập"
}: AIPanelProps) {
  const [inputText, setInputText] = useState(initialText);
  const [contextInfo, setContextInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Results
  const [improvedText, setImprovedText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [mockOutput, setMockOutput] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleAIService = async () => {
    if (!inputText.trim()) {
      setError("Vui lòng nhập nội dung ban đầu.");
      return;
    }

    setLoading(true);
    setError(null);
    setImprovedText("");
    
    try {
      if (contextType === "improve-text") {
        const response = await fetch("/api/gemini/improve-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalText: inputText,
            fieldName,
            contextInfo
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setImprovedText(data.improvedText);
      } else {
        const response = await fetch("/api/gemini/optimize-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalPrompt: inputText,
            context: contextInfo
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setImprovedText(data.improvedPrompt || "");
        setExplanation(data.explanation || "");
        setMockOutput(data.mockAiOutput || "");
      }
    } catch (err: any) {
      console.error(err);
      setError("Không thể kết nối tới máy chủ Gemini. Hãy đảm bảo API Key đã được thêm.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div id="ai-panel-container" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div id="ai-panel" className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-teal-100 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-pulse text-yellow-300" />
            <h3 className="font-semibold text-lg">
              {contextType === "improve-text" ? "Trợ lý AI Tối ưu Ngôn từ" : "Sa bàn Kỹ thuật Prompt CO-STAR"}
            </h3>
          </div>
          <button 
            id="close-ai-panel"
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {contextType === "improve-text" ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nhập nội dung phác thảo hoặc bản nháp của bạn bên dưới. Trợ lý Gemini sẽ thiết kế lại đoạn văn với cấu trúc văn phong học thuật, thuyết phục và chặt chẽ nhất.
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Công cụ thực hành Prompt Engineering. Nhập câu lệnh gốc của bạn, Gemini sẽ tối ưu nó theo tiêu chuẩn cốt lõi CO-STAR giúp bạn đạt mức đánh giá tối đa cho Bài tập 3.
            </p>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {contextType === "improve-text" ? `Văn bản thô/Ý muốn diễn đạt (${fieldName})` : "Prompt ban đầu muốn cải tiến"}
              </label>
              <textarea
                id="ai-input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={contextType === "improve-text" ? "Ví dụ: 'em làm bài tập 1 chia các mục thư mục rất ngăn nắp để dễ tìm kiếm cứu tài liệu các môn học...'" : "Ví dụ: 'Hãy giải thích cho tôi thuật toán Quick Sort bằng lập trình C'"}
                className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100 min-h-[90px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {contextType === "improve-text" ? "Yêu cầu phong cách học thuật (Tùy chọn)" : "Bối cảnh học tập bổ sung (Tùy chọn)"}
              </label>
              <input
                id="ai-context-text"
                type="text"
                value={contextInfo}
                onChange={(e) => setContextInfo(e.target.value)}
                placeholder={contextType === "improve-text" ? "Ví dụ: 'văn phong nghiêm túc kịch tính', 'ngắn gọn súc tích', 'chuẩn bài nghiên cứu sinh viên'" : "Ví dụ: 'Tôi là sinh viên năm nhất CNTT chưa rành đệ quy'"}
                className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            <button
              id="ai-submit-btn"
              onClick={handleAIService}
              disabled={loading}
              className="w-full bg-slate-900 dark:bg-teal-600 text-white font-medium text-sm py-2 px-4 rounded-xl hover:bg-slate-800 dark:hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-teal-400" />
                  <span>Kích hoạt Gemini AI Tối ưu</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Results Display */}
          {improvedText && (
            <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-teal-500" />
                  Kết quả phân tích từ Gemini
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(improvedText)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 cursor-pointer"
                    title="Sao chép"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Text Improvement Result */}
              {contextType === "improve-text" ? (
                <div className="bg-teal-50/50 dark:bg-teal-950/10 border border-teal-100 dark:border-teal-900/30 rounded-xl p-4 text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
                  {improvedText}
                </div>
              ) : (
                /* Prompt Engineering Complex Display */
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">1. Prompt Tối ưu (Cấu trúc CO-STAR):</h4>
                    <pre className="bg-slate-900 text-slate-200 rounded-xl p-3 text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed border border-slate-800">
                      {improvedText}
                    </pre>
                  </div>

                  {explanation && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">2. Vì sao Prompt này hiệu quả hơn?</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-amber-500/5 border border-amber-500/25 p-3 rounded-xl">
                        {explanation}
                      </p>
                    </div>
                  )}

                  {mockOutput && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">3. Bản phát thảo phản hồi từ AI tương ứng:</h4>
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {mockOutput}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Apply/Close panel and write-back */}
              {onApplyText && (
                <button
                  id="apply-ai-text"
                  onClick={() => {
                    onApplyText(improvedText);
                    onClose();
                  }}
                  className="w-full bg-teal-600 dark:bg-amber-500 text-white font-medium text-sm py-2 px-4 rounded-xl hover:bg-teal-700 dark:hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Áp dụng vào Portfolio</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
