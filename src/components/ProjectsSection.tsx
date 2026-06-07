/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, Target, AlertCircle, FileText, CheckCircle, 
  Layers, Link, Plus, Trash, Folder, Terminal, 
  Search, BarChart2, MessageSquare, Play, Users, 
  ShieldCheck, ArrowRight, Eye, Edit, Upload
} from "lucide-react";
import { ProjectItem, PortfolioConfig, TableRow } from "../types";
import AIPanel from "./AIPanel";

interface ProjectsSectionProps {
  portfolio: PortfolioConfig;
  onChange: (updated: PortfolioConfig) => void;
  isPreview: boolean;
}

export default function ProjectsSection({ portfolio, onChange, isPreview }: ProjectsSectionProps) {
  const [activeProjIndex, setActiveProjIndex] = useState(0);
  const activeProject = portfolio.projects[activeProjIndex] || portfolio.projects[0];
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // AI assist overlay
  const [aiAssistState, setAiAssistState] = useState<{
    field: "objective" | "processSummary" | "result" | "aiComparisonInsight" | "academicEthicsStatement" | "ethicsSolutions";
    label: string;
    text: string;
  } | null>(null);

  // Helper selectors
  const getThemeAccentClass = () => {
    switch (portfolio.theme) {
      case "indigo": return "text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/20 dark:border-indigo-900";
      case "serif": return "text-amber-800 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/40";
      case "minimal": return "text-zinc-800 bg-zinc-100 border-zinc-200 dark:text-zinc-200 dark:bg-zinc-800 dark:border-zinc-700";
      default: return "text-teal-600 bg-teal-50 border-teal-100 dark:text-teal-400 dark:bg-teal-950/20 dark:border-slate-800";
    }
  };

  const getThemeBtnClass = (active: boolean) => {
    if (active) {
      switch (portfolio.theme) {
        case "indigo": return "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs";
        case "serif": return "bg-amber-800 hover:bg-amber-950 text-white shadow-xs";
        case "minimal": return "bg-zinc-900 dark:bg-zinc-100 hover:opacity-90 text-white dark:text-zinc-900 shadow-xs";
        default: return "bg-teal-600 hover:bg-teal-700 text-white shadow-xs";
      }
    } else {
      return "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50";
    }
  };

  // Update current project fields
  const handleUpdateProjField = (key: keyof ProjectItem, value: any) => {
    const updatedProjects = [...portfolio.projects];
    updatedProjects[activeProjIndex] = {
      ...activeProject,
      [key]: value
    };
    onChange({
      ...portfolio,
      projects: updatedProjects
    });
  };

  const handleUpdateProjCustomData = (key: string, value: any) => {
    const updatedProjects = [...portfolio.projects];
    const customData = activeProject.customData || {};
    updatedProjects[activeProjIndex] = {
      ...activeProject,
      customData: {
        ...customData,
        [key]: value
      }
    };
    onChange({
      ...portfolio,
      projects: updatedProjects
    });
  };

  // Helper handlers for table adding/deleting rows
  const addTableRow = () => {
    if (!activeProject.customData?.evaluationTableRows) return;
    const newRow: TableRow = {};
    activeProject.customData.evaluationTableHeaders?.forEach(header => {
      newRow[header] = "Dữ liệu trống";
    });
    const updatedRows = [...activeProject.customData.evaluationTableRows, newRow];
    handleUpdateProjCustomData("evaluationTableRows", updatedRows);
  };

  const removeTableRow = (index: number) => {
    if (!activeProject.customData?.evaluationTableRows) return;
    const updatedRows = activeProject.customData.evaluationTableRows.filter((_, i) => i !== index);
    handleUpdateProjCustomData("evaluationTableRows", updatedRows);
  };

  const handleTableValueChange = (rowIndex: number, colHeader: string, value: string) => {
    if (!activeProject.customData?.evaluationTableRows) return;
    const updatedRows = [...activeProject.customData.evaluationTableRows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [colHeader]: value
    };
    handleUpdateProjCustomData("evaluationTableRows", updatedRows);
  };

  // Attachment additions
  const addAttachment = () => {
    const newAttach = {
      name: "Tệp đính kèm học tập liên kết mới.pdf",
      url: "#",
      type: "pdf" as const
    };
    const updatedAttach = [...(activeProject.attachments || []), newAttach];
    handleUpdateProjField("attachments", updatedAttach);
  };

  const removeAttachment = (index: number) => {
    const updatedAttach = (activeProject.attachments || []).filter((_, i) => i !== index);
    handleUpdateProjField("attachments", updatedAttach);
  };

  const handleUpdateAttach = (index: number, key: string, value: string) => {
    const updatedAttach = [...(activeProject.attachments || [])];
    updatedAttach[index] = {
      ...updatedAttach[index],
      [key]: value
    };
    handleUpdateProjField("attachments", updatedAttach);
  };

  const processFile = (file: File, index: number) => {
    if (file.size > 3 * 1024 * 1024) {
      alert("Kích thước tệp lớn hơn 3MB! Để đảm bảo trang web hoạt động mượt mà và không gặp lỗi máy chủ khi xuất bản trực tuyến, vui lòng chọn file nhẹ hơn hoặc tải tệp đó lên Google Drive / OneDrive rồi dán đường dẫn link chia sẻ trực tiếp nhé!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const fileName = file.name;
      const fileExt = fileName.split(".").pop()?.toLowerCase();
      let fileType: "pdf" | "link" | "video" = "link";
      if (fileExt === "pdf") {
        fileType = "pdf";
      } else if (["mp4", "mov", "avi", "webm", "mkv"].includes(fileExt || "")) {
        fileType = "video";
      }

      const updatedAttach = [...(activeProject.attachments || [])];
      updatedAttach[index] = {
        name: fileName,
        url: dataUrl,
        type: fileType
      };
      handleUpdateProjField("attachments", updatedAttach);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, index);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIdx(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIdx(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIdx(null);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, index);
    }
  };

  const handleOpenOrDownload = (attach: any, e: React.MouseEvent) => {
    if (attach.url === "#") {
      e.preventDefault();
      alert(`Đang tải mẫu tệp: ${attach.name}`);
    } else if (attach.url.startsWith("data:")) {
      e.preventDefault();
      try {
        // Convert base64 data URI to Blob URL to bypass browser security sandbox restrictions on Vercel/mobile
        const parts = attach.url.split(',');
        const mimeString = parts[0].split(':')[1].split(';')[0];
        const byteString = atob(parts[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = blobUrl;
        
        if (attach.type === "pdf") {
          // Open PDF in a new tab so it is modern and viewable on mobile/Vercel
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        } else {
          // For other documents/files, download them cleanly
          link.download = attach.name;
        }
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Revoke the object URL after a delay to free up memory
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 12000);
      } catch (err) {
        console.error("Lỗi khi mở file base64:", err);
        // Resubmission fallback
        const link = document.createElement("a");
        link.href = attach.url;
        link.download = attach.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      // For standard URLs, make sure it opens in a new tab so they don't leave the portfolio app
      e.preventDefault();
      const link = document.createElement("a");
      link.href = attach.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div id="projects-section-container" className="space-y-6 animate-fade-in pb-16">
      
      {/* 6 Lesson horizontal selection menu */}
      <div className="flex flex-col space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chọn Bài Tập Nghiên Cứu</label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {portfolio.projects.map((proj, idx) => {
            const active = idx === activeProjIndex;
            return (
              <button
                key={proj.id}
                id={`btn-select-task-${idx}`}
                onClick={() => setActiveProjIndex(idx)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  active 
                    ? "border-teal-500 bg-teal-500/5 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold" 
                    : "border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="text-[10px] uppercase font-mono tracking-wider opacity-75">Bài tập {idx + 1}</span>
                <span className="text-[11px] mt-1 font-semibold truncate max-w-full">Bài {proj.id.split("-")[1]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Core Layout: Content Column & Sidebar Panel */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Major details column */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* Card: Header of current lesson */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-xs relative overflow-hidden">

            <div className="space-y-3">
              {isPreview ? (
                <h3 className="text-[15px] sm:text-base md:text-lg font-bold text-teal-600 dark:text-teal-400 uppercase tracking-normal block">
                  {activeProject.lessonName}
                </h3>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-semibold">Tên bài học / chương trình:</label>
                  <input
                    type="text"
                    value={activeProject.lessonName}
                    onChange={(e) => handleUpdateProjField("lessonName", e.target.value)}
                    className="w-full text-base font-bold text-teal-600 dark:text-teal-400 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 border border-slate-150 dark:border-slate-800 rounded-xl uppercase focus:border-teal-500 focus:outline-hidden"
                    placeholder="Gõ tên bài hiển thị..."
                  />
                </div>
              )}
              
              {isPreview ? (
                <h2 id="project-main-title" className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {activeProject.exerciseTitle}
                </h2>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-semibold">Tiêu đề bài làm / hoạt động:</label>
                  <input
                    id="project-title-input"
                    type="text"
                    value={activeProject.exerciseTitle}
                    onChange={(e) => handleUpdateProjField("exerciseTitle", e.target.value)}
                    className="w-full text-base font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 border border-slate-150 dark:border-slate-800 rounded-xl focus:border-teal-500 focus:outline-hidden"
                    placeholder="Gõ tiêu đề bài tập..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Card: Objective & Process Summary */}
          <div className="flex flex-col gap-6">
            
            {/* Objective */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-105 dark:border-slate-800 pb-3">
                  <h4 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-500" />
                    <span>Mục tiêu bài tập</span>
                  </h4>
                  {!isPreview && (
                    <button
                      onClick={() => setAiAssistState({
                        field: "objective",
                        label: "Mục tiêu bài tập học phần",
                        text: activeProject.objective
                      })}
                      className="bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 px-1.5 py-0.5 rounded-lg flex items-center gap-1 hover:bg-teal-100/60 text-[10px] font-bold cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
                      <span>AI Sửa</span>
                    </button>
                  )}
                </div>

                {isPreview ? (
                  <p id="project-objective-text" className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line">
                    {activeProject.objective}
                  </p>
                ) : (
                  <textarea
                    value={activeProject.objective}
                    onChange={(e) => handleUpdateProjField("objective", e.target.value)}
                    className="w-full text-sm md:text-base text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-800 rounded-xl leading-relaxed resize-none min-h-[140px]"
                    placeholder="ví dụ: mục tiêu rèn luyện tư duy phân hoạch sắp xếp..."
                  />
                )}
              </div>
            </div>

            {/* Process summary */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-105 dark:border-slate-800 pb-3">
                  <h4 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    <span>Tóm tắt quá trình thực hiện</span>
                  </h4>
                  {!isPreview && (
                    <button
                      onClick={() => setAiAssistState({
                        field: "processSummary",
                        label: "Tóm tắt quy trình thực hiện",
                        text: activeProject.processSummary
                      })}
                      className="bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 px-1.5 py-0.5 rounded-lg flex items-center gap-1 hover:bg-teal-100/60 text-[10px] font-bold cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
                      <span>AI Sửa</span>
                    </button>
                  )}
                </div>

                {isPreview ? (
                  <p id="project-process-text" className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line">
                    {activeProject.processSummary}
                  </p>
                ) : (
                  <textarea
                    value={activeProject.processSummary}
                    onChange={(e) => handleUpdateProjField("processSummary", e.target.value)}
                    className="w-full text-sm md:text-base text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-955 p-4 border border-slate-150 dark:border-slate-800 rounded-xl leading-relaxed resize-none min-h-[140px]"
                    placeholder="ví dụ: tiến hành đọc tài liệu, nạp code, phân tích và xuất PDF báo cáo..."
                  />
                )}
              </div>
            </div>

            {/* Results card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-105 dark:border-slate-800 pb-3">
                  <h4 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span>Kết quả đạt được</span>
                  </h4>
                  {!isPreview && (
                    <button
                      onClick={() => setAiAssistState({
                        field: "result",
                        label: "Kết quả đạt được",
                        text: activeProject.result || ""
                      })}
                      className="bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 px-1.5 py-0.5 rounded-lg flex items-center gap-1 hover:bg-teal-100/60 text-[10px] font-bold cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
                      <span>AI Sửa</span>
                    </button>
                  )}
                </div>

                {isPreview ? (
                  <p id="project-result-text" className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line">
                    {activeProject.result || "Chưa ghi nhận báo cáo kết quả."}
                  </p>
                ) : (
                  <textarea
                    value={activeProject.result || ""}
                    onChange={(e) => handleUpdateProjField("result", e.target.value)}
                    className="w-full text-sm md:text-base text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-955 p-4 border border-slate-150 dark:border-slate-800 rounded-xl leading-relaxed resize-none min-h-[140px]"
                    placeholder="ví dụ: đạt 100% mục tiêu, nắm vững kỹ năng thực thi..."
                  />
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Sidebar Panel of currently active Project (For files, PDFs, links, screenshots) */}
        <div className="w-full lg:w-72 space-y-6">

          {/* Attachments / Downloads links panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Tệp & Liên Kết Đính Kèm</span>
              {!isPreview && (
                <button
                  onClick={addAttachment}
                  className="text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/20 p-1.5 rounded-lg border border-teal-100 dark:border-slate-800 transition-colors cursor-pointer"
                  title="Thêm tệp mới"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {(activeProject.attachments || []).map((attach, aIdx) => (
                <div key={aIdx} className="bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 p-3 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      {isPreview ? (
                        <span id={`attach-name-${aIdx}`} className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">{attach.name}</span>
                      ) : (
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Tên tệp tin hiển thị:</label>
                          <input
                            type="text"
                            value={attach.name}
                            onChange={(e) => handleUpdateAttach(aIdx, "name", e.target.value)}
                            className="w-full text-xs font-bold bg-transparent border-b border-slate-200 dark:border-slate-800 focus:border-teal-500 py-0.5 focus:outline-hidden"
                            placeholder="Tên tệp tin..."
                          />
                        </div>
                      )}
                    </div>
                    {!isPreview && (
                      <button
                        onClick={() => removeAttachment(aIdx)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1 rounded-md shrink-0 cursor-pointer"
                        title="Xóa đính kèm"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[10px]">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-400 uppercase block font-semibold">Loại:</span>
                      {isPreview ? (
                        <span className="bg-slate-200 dark:bg-slate-800 text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md">{attach.type}</span>
                      ) : (
                        <select
                          value={attach.type}
                          onChange={(e) => handleUpdateAttach(aIdx, "type", e.target.value as any)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-0.5 text-[9px] uppercase font-bold text-slate-700 dark:text-slate-300"
                        >
                          <option value="pdf">pdf</option>
                          <option value="link">link</option>
                          <option value="video">video</option>
                        </select>
                      )}
                    </div>

                    {isPreview && (
                      <a
                        href={attach.url}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg shrink-0 pointer-events-auto cursor-pointer"
                        onClick={(e) => handleOpenOrDownload(attach, e)}
                      >
                        <Link className="w-3 h-3" />
                        <span>Mở file</span>
                      </a>
                    )}
                  </div>

                  {!isPreview && (
                    <div className="space-y-1.5 pt-1.5 border-t border-slate-200/50 dark:border-slate-800">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Đường dẫn URL liên kết:</label>
                      <input
                        type="text"
                        value={attach.url}
                        onChange={(e) => handleUpdateAttach(aIdx, "url", e.target.value)}
                        className="w-full text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 truncate text-slate-700 dark:text-slate-300"
                        placeholder="Liên kết URL..."
                      />

                      {/* File Upload drag-and-drop dropzone */}
                      <div
                        onDragOver={(e) => handleDragOver(e, aIdx)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, aIdx)}
                        onClick={() => document.getElementById(`file-select-input-${aIdx}`)?.click()}
                        className={`p-2.5 border-2 border-dashed rounded-xl text-center text-[10px] cursor-pointer transition-all ${
                          dragOverIdx === aIdx
                            ? "border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400 font-medium scale-[1.01]"
                            : attach.url.startsWith("data:")
                            ? "border-emerald-300 dark:border-emerald-850 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 hover:border-emerald-400"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-100/30 dark:bg-slate-900/30 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        <input
                          type="file"
                          id={`file-select-input-${aIdx}`}
                          className="hidden"
                          onChange={(e) => handleFileChange(e, aIdx)}
                        />
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Upload className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          {attach.url.startsWith("data:") ? (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              ✓ Đã đắp file tùy chọn của bạn
                            </span>
                          ) : (
                            <span className="text-[9px]">Kéo thả file tùy ý hoặc Click để tải lên</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Real-time AI processing modal panel overlay */}
      {aiAssistState && (
        <AIPanel
          contextType={aiAssistState.field === "improvedPrompt" ? "optimize-prompt" : "improve-text"}
          onClose={() => setAiAssistState(null)}
          fieldName={aiAssistState.label}
          initialText={aiAssistState.text}
          onApplyText={(improvedText) => {
            if (aiAssistState.field === "improvedPrompt") {
              // Custom prompt engineering updates
              handleUpdateProjCustomData("improvedPrompt", improvedText);
            } else if (aiAssistState.field === "aiComparisonInsight" || aiAssistState.field === "academicEthicsStatement" || aiAssistState.field === "ethicsSolutions") {
              handleUpdateProjCustomData(aiAssistState.field, improvedText);
            } else {
              handleUpdateProjField(aiAssistState.field, improvedText);
            }
          }}
        />
      )}

    </div>
  );
}
