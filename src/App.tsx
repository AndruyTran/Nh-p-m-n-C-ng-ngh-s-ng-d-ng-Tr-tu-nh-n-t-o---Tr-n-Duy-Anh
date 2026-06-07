/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  User, Layers, Award, Sparkles, BookOpen, 
  HelpCircle, Copy, Check, Eye, Edit2, Grid, RotateCcw,
  Globe, Cloud, AlertCircle, X, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PortfolioConfig } from "./types";
import { DEFAULT_PORTFOLIO } from "./data/defaultPortfolio";
import PORTFOLIO_DATA_JSON from "../portfolio-data.json";
import SidebarEditor from "./components/SidebarEditor";
import AboutSection from "./components/AboutSection";
import ProjectsSection from "./components/ProjectsSection";
import ReflectionSection from "./components/ReflectionSection";

const STORAGE_KEY = "googlesites_portfolio_data_v1";

const isValidPortfolio = (data: any): data is PortfolioConfig => {
  return (
    data &&
    typeof data === "object" &&
    data.personalInfo &&
    typeof data.personalInfo === "object" &&
    data.personalInfo.fullName !== undefined &&
    Array.isArray(data.projects) &&
    data.reflection &&
    typeof data.reflection === "object"
  );
};

// Helper to determine initial portfolio data, prioritizing any customized JSON from AI Studio saved on disk
const GET_INITIAL_PORTFOLIO = (): PortfolioConfig => {
  if (PORTFOLIO_DATA_JSON && isValidPortfolio(PORTFOLIO_DATA_JSON)) {
    return PORTFOLIO_DATA_JSON as PortfolioConfig;
  }
  return DEFAULT_PORTFOLIO;
};

export default function App() {
  const [portfolio, setPortfolio] = useState<PortfolioConfig>(GET_INITIAL_PORTFOLIO());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing" | "success" | "error">("idle");
  const [publishUrl, setPublishUrl] = useState<string>("");
  const [draftConfig, setDraftConfig] = useState<PortfolioConfig | null>(null);

  // Check if running on Vercel deployment hostname
  const isVercel = typeof window !== "undefined" && (
    window.location.hostname.includes("vercel.app") ||
    window.location.hostname.includes("now.sh") ||
    window.location.hostname.includes("vercel")
  );

  // Users can explicitly set '?view=true' to share a pristine read-only view of their portfolio, or force view-only on Vercel
  const isViewOnly = typeof window !== "undefined" 
    ? (new URLSearchParams(window.location.search).get("view") === "true" || isVercel)
    : false;

  const [activeTab, setActiveTab] = useState<"about" | "projects" | "reflection">("about");
  // Default to Preview mode on Vercel or when viewOnly is active so the visitor gets a polished initial experience
  const [isPreview, setIsPreview] = useState<boolean>(isViewOnly || isVercel);
  const [isCopied, setIsCopied] = useState(false);
  const [isUrlCopied, setIsUrlCopied] = useState(false);

  // Load published data from server on mount
  useEffect(() => {
    if (isVercel) {
      setPortfolio(GET_INITIAL_PORTFOLIO());
      setIsLoading(false);
      setIsPreview(true);
      return;
    }
    const fetchPublishedPortfolio = async () => {
      // Set a 2.5 second abort timeout in case the server connection is slow on mobile networks
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 2500);

      try {
        const response = await fetch("/api/portfolio", { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server response was not JSON template");
        }

        const data = await response.json();
        
        // Get the localStorage draft if it exists safely
        let saved = null;
        try {
          saved = localStorage.getItem(STORAGE_KEY);
        } catch (storageErr) {
          console.warn("Storage access denied:", storageErr);
        }
        let savedData = null;
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (isValidPortfolio(parsed)) {
              savedData = parsed;
            }
          } catch (e) {}
        }

        const validDataReceived = (data && !(data as any).default && isValidPortfolio(data)) ? data : null;

        if (isViewOnly) {
          // In view only mode, we must always show the published server data if available
          if (validDataReceived) {
            setPortfolio(validDataReceived);
            setPublishUrl(`${window.location.origin}?view=true`);
          } else if (savedData) {
            setPortfolio(savedData);
          } else {
            setPortfolio(GET_INITIAL_PORTFOLIO());
          }
          setIsPreview(true);
        } else {
          // In edit mode: we prioritize the server-persisted master copy so your latest saved work is loaded first!
          if (validDataReceived) {
            setPortfolio(validDataReceived);
            setPublishUrl(`${window.location.origin}?view=true`);
            // If local browser draft exists and is different from the server master class, offer to load the draft
            if (savedData && JSON.stringify(savedData) !== JSON.stringify(validDataReceived)) {
              setDraftConfig(savedData);
            }
          } else if (savedData) {
            setPortfolio(savedData);
          } else {
            setPortfolio(GET_INITIAL_PORTFOLIO());
          }
          setIsPreview(false);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu từ máy chủ:", err);
        let saved = null;
        try {
          saved = localStorage.getItem(STORAGE_KEY);
        } catch (e) {}
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (isValidPortfolio(parsed)) {
              setPortfolio(parsed);
            } else {
              setPortfolio(GET_INITIAL_PORTFOLIO());
            }
          } catch (e) {
            setPortfolio(GET_INITIAL_PORTFOLIO());
          }
        } else {
          setPortfolio(GET_INITIAL_PORTFOLIO());
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchPublishedPortfolio();
  }, []);

  // Auto-persist changes in local storage during session editing safely
  useEffect(() => {
    if (!isLoading && isValidPortfolio(portfolio)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
      } catch (e) {
        console.warn("Unable to persist draft changes to localStorage:", e);
      }
    }
  }, [portfolio, isLoading]);

  const handleReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn cài đặt lại toàn bộ dữ liệu mẫu mặc định?")) {
      setPortfolio(DEFAULT_PORTFOLIO);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.warn("Unable to clear draft from localStorage:", e);
      }
    }
  };

  const handleCopyCode = () => {
    const stringified = JSON.stringify(portfolio, null, 2);
    navigator.clipboard.writeText(stringified);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePublish = async () => {
    setPublishStatus("publishing");
    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(portfolio)
      });
      if (response.ok) {
        setPublishStatus("success");
        // Get clean browser origin as the URL pointing to this live deployed service
        setPublishUrl(`${window.location.origin}?view=true`);
      } else {
        setPublishStatus("error");
      }
    } catch (err) {
      console.error("Lỗi xuất bản:", err);
      setPublishStatus("error");
    }
  };

  const currentTheme = portfolio.theme || "slate";

  // Class helper mapping based on active theme choice
  const getThemeVars = () => {
    switch (currentTheme) {
      case "indigo":
        return {
          bg: "bg-slate-900/10 text-slate-900 dark:bg-slate-950 dark:text-slate-100",
          font: "font-sans",
          accentColor: "indigo"
        };
      case "serif":
        return {
          bg: "bg-amber-50/30 text-stone-900 dark:bg-stone-950 dark:text-stone-100",
          font: "font-serif",
          accentColor: "amber"
        };
      case "minimal":
        return {
          bg: "bg-[#F8F9FA] text-[#202124] dark:bg-zinc-950 dark:text-zinc-100",
          font: "font-sans",
          accentColor: "zinc"
        };
      default: // slate
        return {
          bg: "bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100",
          font: "font-sans",
          accentColor: "teal"
        };
    }
  };

  const themeVars = getThemeVars();

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row ${themeVars.bg} ${themeVars.font} transition-colors duration-300`}>
      
      {/* 1. Controller Sidebar - Left column (Collapsible or hidden in pure preview if they choose, so they can see full width) */}
      <div className={`shrink-0 z-30 transition-all duration-300 ${isPreview ? "w-0 lg:w-0 overflow-hidden border-none" : "w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800"}`}>
        <SidebarEditor
          portfolio={portfolio}
          onChange={setPortfolio}
          onReset={handleReset}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isPreview={isPreview}
          setIsPreview={setIsPreview}
        />
      </div>

      {/* 2. Main Content Canvas Frame */}
      <div className="flex-1 flex flex-col overflow-y-auto max-h-screen">
        
        {/* Navigation Toolbar (Displays in all modes, looks like Google Sites publisher) */}
        <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs select-none">
          
          {/* Logo brand & Name of the user's Sites */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
              P
            </div>
            <div>
              <h3 id="portfolio-brand-title" className="font-bold text-xs bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-1">
                <span>Portfolio</span>
                <span className="text-[10px] text-teal-600 font-mono">({portfolio.personalInfo.studentId || "Student"})</span>
              </h3>
              <p className="text-[10px] text-slate-400">Nhập môn Công nghệ số & Ứng dụng Trí tuệ nhân tạo</p>
            </div>
          </div>

          {/* Quick interactive navbar tabs for Preview Mode */}
          <div className="flex items-center gap-1 md:gap-2">
            
            {/* Direct pages selector inside header */}
            <div className="hidden md:flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 text-xs font-semibold mr-4">
              {[
                { id: "about", label: "Giới thiệu", icon: User },
                { id: "projects", label: "Dự án (Bài 1-6)", icon: Layers },
                { id: "reflection", label: "Tổng kết", icon: Award }
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      active 
                        ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs" 
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* In-header edit modal toggle */}
            {!isViewOnly && (
              <button
                id="header-toggle-preview"
                onClick={() => setIsPreview(!isPreview)}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-850 dark:hover:bg-slate-800 text-white text-xs font-semibold py-1.5 px-3 rounded-xl cursor-pointer shadow-xs"
                title={isPreview ? "Chuyển sang chế độ chỉnh sửa" : "Xem sản phẩm dạng hiển thị thực tế"}
              >
                {isPreview ? <Edit2 className="w-3.5 h-3.5 text-teal-400" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
                <span className="hidden sm:inline">{isPreview ? "Vào Chỉnh sửa" : "Xem Preview"}</span>
              </button>
            )}

            {/* Real online publisher button! */}
            {!isViewOnly && (
              <button
                id="btn-publish-site"
                onClick={handlePublish}
                disabled={publishStatus === "publishing"}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3.5 rounded-xl cursor-pointer shadow-xs transition-colors duration-150 disabled:opacity-50 font-sans"
                title="Xuất bản Portfolio này trực tuyến cho mọi người cùng truy cập"
              >
                <Cloud className={`w-3.5 h-3.5 ${publishStatus === "publishing" ? "animate-spin" : ""}`} />
                <span>{publishStatus === "publishing" ? "Đang xuất bản..." : "Xuất bản"}</span>
              </button>
            )}

            {/* Persistent Copy Deployed Link (Displays once user has published successfully) */}
            {!isViewOnly && publishUrl && (
              <button
                id="btn-copy-published-link"
                onClick={() => {
                  navigator.clipboard.writeText(publishUrl);
                  setIsUrlCopied(true);
                  setTimeout(() => setIsUrlCopied(false), 2000);
                }}
                className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 text-xs font-bold py-1.5 px-3 rounded-xl cursor-pointer shadow-2xs transition font-sans animate-fade-in"
                title="Sao chép nhanh đường dẫn xem trang thực tế đã xuất bản của bạn để gửi thầy cô"
              >
                {isUrlCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-450" /> : <Globe className="w-3.5 h-3.5" />}
                <span>{isUrlCopied ? "Đã chép link!" : "Lấy link xem"}</span>
              </button>
            )}

            {/* Share / Copy JSON config payload (extremely convenient for graders!) */}
            {!isViewOnly && (
              <button
                id="btn-copy-config"
                onClick={handleCopyCode}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
                title="Sao chép toàn bộ mã cấu hình học phần JSON gửi thầy cô chấm"
              >
                {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>

        </header>

        {/* Dynamic Nav on top for mobile screens */}
        <section className="md:hidden bg-slate-100 dark:bg-slate-900 px-6 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-around text-xs font-bold font-mono">
          {[
            { id: "about", label: "Giới thiệu" },
            { id: "projects", label: "Dự án (1-6)" },
            { id: "reflection", label: "Tổng kết" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-1 px-3.5 rounded-lg ${activeTab === tab.id ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs" : "text-slate-500"}`}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {/* Content Canvas */}
        <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
          
          {/* Draft Restoration Banner */}
          {!isPreview && draftConfig && (
            <div id="draft-recovery-banner" className="mb-6 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-3xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs animate-fade-in">
              <div className="flex gap-3">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-100 block">Phát hiện bản nháp chưa xuất bản</span>
                  <p className="text-slate-600 dark:text-slate-300">
                    Hệ thống nhận thấy có dữ liệu chỉnh sửa chưa lưu từ phiên làm việc trước trong trình duyệt này. Bạn có muốn phục hồi các thay đổi đó không?
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 self-end md:self-auto">
                <button
                  onClick={() => {
                    setPortfolio(draftConfig);
                    setDraftConfig(null);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-bold py-1.5 px-3 rounded-xl cursor-pointer transition whitespace-nowrap"
                >
                  Phục hồi bản nháp
                </button>
                <button
                  onClick={() => setDraftConfig(null)}
                  className="bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer transition"
                >
                  Bỏ qua
                </button>
              </div>
            </div>
          )}

          {/* Header Banner info (Displays only in Editor Mode for helper alerts) */}
          {!isPreview && (
            <div id="editor-instructions-banner" className="mb-6 bg-teal-50/80 dark:bg-teal-950/20 border border-teal-100/50 dark:border-slate-800 rounded-3xl p-4 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
              <Sparkles className="w-5 h-5 text-teal-600 dark:text-yellow-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-100 block">Chế độ Biên soạn (Trình tạo Google Sites)</span>
                <p className="leading-relaxed">
                  Bạn có thể click trực tiếp và gõ thay đổi các mục tiêu hoặc số liệu học thuật. Các nút <strong className="text-teal-600 dark:text-teal-400 flex inline-flex items-center gap-0.5"><Sparkles className="w-3 h-3 text-yellow-500" /> AI Cải Tiến</strong> giúp bạn nạp nội dung thô và nhận lại đoạn phân tích học thuật xuất sắc đạt <strong>điểm tối đa</strong> từ Gemini. Sau đó bấm <strong>Preview Sites</strong> để ngắm nhìn thành phẩm sạch hoàn thiện!
                </p>
              </div>
            </div>
          )}

          {/* Navigated tab views */}
          <div id="section-view-frame">
            {activeTab === "projects" ? (
              <ProjectsSection
                portfolio={portfolio}
                onChange={setPortfolio}
                isPreview={isPreview}
              />
            ) : activeTab === "reflection" ? (
              <ReflectionSection
                portfolio={portfolio}
                onChange={setPortfolio}
                isPreview={isPreview}
              />
            ) : (
              <AboutSection
                portfolio={portfolio}
                onChange={setPortfolio}
                isPreview={isPreview}
              />
            )}
          </div>

        </main>

        {/* Elegant Footer conforming strictly to Anti-tech larping / clean look */}
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950/40 py-6 text-center text-xs text-slate-400 select-none">
          <p className="font-medium">Portfolio của {portfolio.personalInfo.fullName || "Sinh viên"} • Mã lớp {portfolio.personalInfo.class || "SE..."}</p>
        </footer>

      </div>

      {/* Dynamic Modal for Successful Web Publication */}
      <AnimatePresence>
        {publishStatus === "success" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setPublishStatus("idle")}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                  <Globe className="w-8 h-8 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                    Website của bạn đã được xuất bản!
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Trang Portfolio học tập đã được đóng gói và cập nhật trực tuyến lên hệ thống máy chủ. Giờ đây bất cứ lúc nào bất kỳ ai mở đường dẫn này đều sẽ nhìn thấy trang web thực tế của bạn!
                  </p>
                </div>

                {/* Published URL Display box */}
                <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 font-mono text-xs text-left">
                  <span className="text-teal-600 dark:text-teal-400 truncate select-all font-semibold">
                    {publishUrl}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(publishUrl);
                      setIsUrlCopied(true);
                      setTimeout(() => setIsUrlCopied(false), 2000);
                    }}
                    className="flex shrink-0 items-center gap-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-1 px-3 rounded-lg text-xs cursor-pointer"
                  >
                    {isUrlCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isUrlCopied ? "Đã chép!" : "Sao chép"}</span>
                  </button>
                </div>

                {/* Instructions info */}
                <div className="w-full text-left bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border-l-4 border-blue-500 space-y-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-blue-500" /> Hướng dẫn chia sẻ link:
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Hãy sao chép đường dẫn trên gửi cho thầy cô chấm hoặc bạn bè. Người khác khi truy cập trang web sẽ tự động nhìn thấy <strong>Chế độ Xem thực tế (Preview)</strong> siêu tối giản, không bị thanh biên tập che chắn cực kỳ chuyên nghiệp!
                  </p>
                </div>

                <div className="w-full flex gap-3 pt-2">
                  <button
                    onClick={() => setPublishStatus("idle")}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl text-sm cursor-pointer"
                  >
                    Đóng lại
                  </button>
                  <a
                    href={publishUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-1.5 cursor-pointer decoration-none"
                  >
                    <span>Mở xem thử</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Modal for Publication Error */}
      <AnimatePresence>
        {publishStatus === "error" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setPublishStatus("idle")}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-8 h-8 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-normal">
                    Không thể kết nối máy chủ!
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Đã xảy ra lỗi trong quá trình xuất bản dữ liệu lên máy chủ. Việc này có thể do gián đoạn kết nối mạng tạm thời hoặc máy chủ đang khởi động lại.
                  </p>
                </div>

                <div className="w-full text-left bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border-l-4 border-rose-500 space-y-1">
                  <span className="text-xs font-bold text-slate-705 dark:text-slate-300 flex items-center gap-1.5">
                    Lời khuyên khắc phục:
                  </span>
                  <ul className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed list-disc list-inside space-y-1">
                    <li>Kiểm tra lại kết nối internet của bạn.</li>
                    <li>Đợi khoảng 10-15 giây rồi nhấn nút "Thử lại ngay".</li>
                    <li>Nếu trường hợp gặp gián đoạn kéo dài, hãy sao chép mã cấu hình JSON (nút copy bên cạnh nút xuất bản) để tải lên lại sau nhé.</li>
                  </ul>
                </div>

                <div className="w-full flex gap-3 pt-2">
                  <button
                    onClick={() => setPublishStatus("idle")}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl text-sm cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handlePublish}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm cursor-pointer"
                  >
                    Thử lại ngay
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Modal if fetching initially */}
      <AnimatePresence>
        {isLoading && (
          <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 animate-pulse">
              Đang đồng bộ Portfolio trực tuyến từ máy chủ...
            </p>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
