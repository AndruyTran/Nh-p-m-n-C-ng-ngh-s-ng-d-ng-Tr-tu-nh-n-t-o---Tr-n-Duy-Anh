/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from "react";
import { 
  User, Settings, Award, Layers, Sparkles, Download, 
  Upload, RotateCcw, Palette, Mail, BookOpen, Link, 
  Github, ChevronRight, Eye, Edit2, Check
} from "lucide-react";
import { PortfolioConfig } from "../types";

interface SidebarEditorProps {
  portfolio: PortfolioConfig;
  onChange: (updated: PortfolioConfig) => void;
  onReset: () => void;
  activeTab: "about" | "projects" | "reflection";
  setActiveTab: (tab: "about" | "projects" | "reflection") => void;
  isPreview: boolean;
  setIsPreview: (prev: boolean) => void;
}

export default function SidebarEditor({
  portfolio,
  onChange,
  onReset,
  activeTab,
  setActiveTab,
  isPreview,
  setIsPreview,
}: SidebarEditorProps) {
  const [interestInput, setInterestInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const handleUpdateInfo = (key: string, value: string) => {
    onChange({
      ...portfolio,
      personalInfo: {
        ...portfolio.personalInfo,
        [key]: value
      }
    });
  };

  const addInterest = () => {
    const currentInterests = portfolio.personalInfo.interests || [];
    if (interestInput.trim() && !currentInterests.includes(interestInput.trim())) {
      const updatedInterests = [...currentInterests, interestInput.trim()];
      onChange({
        ...portfolio,
        personalInfo: {
          ...portfolio.personalInfo,
          interests: updatedInterests
        }
      });
      setInterestInput("");
    }
  };

  const removeInterest = (item: string) => {
    const currentInterests = portfolio.personalInfo.interests || [];
    const updatedInterests = currentInterests.filter(i => i !== item);
    onChange({
      ...portfolio,
      personalInfo: {
        ...portfolio.personalInfo,
        interests: updatedInterests
      }
    });
  };

  // Export JSON file
  const exportPortfolioJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolio, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `portfolio_${portfolio.personalInfo.studentId || "sites"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.personalInfo && parsed.projects && parsed.reflection) {
          onChange(parsed);
          setIsSavedAlert(true);
          setTimeout(() => setIsSavedAlert(false), 3000);
        } else {
          alert("Lỗi cấu trúc tệp JSON không hợp lệ cho Portfolio.");
        }
      } catch (err) {
        alert("Không thể giải mã tệp cấu trúc JSON.");
      }
    };
    reader.readAsText(file);
  };

  const triggerImportFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="sidebar-editor-container" className="w-full lg:w-80 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden select-none">
      
      {/* Visual Identity Title */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase">Cấu hình Google Sites</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Trình lắp ráp & Thiết kế bản nháp điểm 10</p>
      </div>

      {/* Mode Switches */}
      <div className="p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex bg-slate-200 dark:bg-slate-950 p-1 rounded-xl">
          <button
            id="toggle-edit-mode"
            onClick={() => setIsPreview(false)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              !isPreview 
                ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs" 
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Chỉnh sửa</span>
          </button>
          <button
            id="toggle-preview-mode"
            onClick={() => setIsPreview(true)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              isPreview 
                ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs" 
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Sites</span>
          </button>
        </div>

        {/* Theme select option */}
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5" />
            Giao diện (Theme)
          </span>
          <select
            id="theme-select"
            value={portfolio.theme}
            onChange={(e) => onChange({ ...portfolio, theme: e.target.value as any })}
            className="text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-teal-500"
          >
            <option value="slate">Khói Đa Sắc (Slate/Teal)</option>
            <option value="indigo">Kỹ Thuật Số (Indigo/Violet)</option>
            <option value="serif">Học Thuật Cổ Điển (Serif)</option>
            <option value="minimal">Tối giản sắc nét (Clean Minimalism)</option>
          </select>
        </div>
      </div>

      {/* Pages/Tabs Quick Navigator */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Tiểu mục Portfolio</h3>
        <div className="space-y-1">
          {[
            { id: "about", label: "1. Trang Giới thiệu", icon: User },
            { id: "projects", label: "2. Trang Dự án (Bài 1-6)", icon: Layers },
            { id: "reflection", label: "3. Trang Tổng kết", icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  // Auto focus out preview during navigation if clicking edit
                }}
                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  active 
                    ? "bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 font-bold" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-50 transition-transform ${active ? "rotate-90 text-teal-500" : ""}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Metadata Form Editor (Visible in Editor mode) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Thông tin Cá Nhân</h3>
          <span className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-400 px-1.5 py-0.5 rounded-full font-mono uppercase">Nháp học cụ</span>
        </div>

        {/* Input items */}
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Họ tên sinh viên</label>
            <input
              id="student-name-input"
              type="text"
              value={portfolio.personalInfo.fullName || ""}
              onChange={(e) => handleUpdateInfo("fullName", e.target.value)}
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100"
              placeholder="ví dụ: Nguyễn Văn A"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Mã số sinh viên (MSSV)</label>
              <input
                id="student-id-input"
                type="text"
                value={portfolio.personalInfo.studentId || ""}
                onChange={(e) => handleUpdateInfo("studentId", e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100"
                placeholder="HE170020"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Lớp học</label>
              <input
                id="student-class-input"
                type="text"
                value={portfolio.personalInfo.class || ""}
                onChange={(e) => handleUpdateInfo("class", e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100"
                placeholder="SE1703"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Trường đại học</label>
            <input
              id="student-school-input"
              type="text"
              value={portfolio.personalInfo.school || ""}
              onChange={(e) => handleUpdateInfo("school", e.target.value)}
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Ngành chuyên học</label>
            <input
              id="student-major-input"
              type="text"
              value={portfolio.personalInfo.major || ""}
              onChange={(e) => handleUpdateInfo("major", e.target.value)}
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Email liên lạc</label>
            <input
              id="student-email-input"
              type="email"
              value={portfolio.personalInfo.email || ""}
              onChange={(e) => handleUpdateInfo("email", e.target.value)}
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100"
              placeholder="duyanhdemon@gmail.com"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Ảnh đại diện sinh viên</label>
            <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              
              {/* Preview with Upload options */}
              <div className="flex items-center gap-3">
                <img
                  id="editor-avatar-preview"
                  src={portfolio.personalInfo.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150"}
                  alt="Xem thử"
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150";
                  }}
                />
                
                <div className="flex-1">
                  <label className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[11px] font-bold py-1.5 px-3 rounded-lg border border-blue-200 dark:border-blue-900/50 cursor-pointer transition-colors duration-150">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải ảnh từ máy lên</span>
                    <input
                      id="avatar-file-uploader"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 3 * 1024 * 1024) {
                            alert("Kích thước ảnh lớn hơn 3MB! Vui lòng chọn ảnh nhẹ hơn để tải lên nhanh hơn.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              handleUpdateInfo("avatarUrl", event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <p className="text-[9px] text-slate-400 mt-1">Dạng .jpg, .png (Khuyên dùng)</p>
                </div>
              </div>

              {/* Online Image Link */}
              <div className="space-y-1 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50">
                <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400">Hoặc dán địa chỉ ảnh trực tuyến:</span>
                <input
                  id="student-avatar-input"
                  type="text"
                  value={portfolio.personalInfo.avatarUrl}
                  onChange={(e) => handleUpdateInfo("avatarUrl", e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-mono text-[10px]"
                />
              </div>

              {/* FB Warn Guide */}
              <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 p-2.5 rounded-lg text-[10px] leading-relaxed border border-amber-200/50 dark:border-amber-900/30">
                ⚠️ <strong>Lưu ý về link ảnh Facebook:</strong> Link từ Facebook (ví dụ: facebook.com/photo...) hay bị hết hạn hoặc lỗi chặn (do Facebook không cho nhúng ra ngoài). 
                <div className="mt-1 font-semibold text-slate-800 dark:text-slate-300">
                  Mẹo: Hãy tải ảnh từ Facebook về máy tính hoặc điện thoại của bạn, sau đó nhấn nút <u>"Tải ảnh từ máy lên"</u> ở trên để ảnh hoạt động ổn định vĩnh viễn!
                </div>
              </div>

            </div>
          </div>

          {/* Interests tags editor */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Sở thích cá nhân</label>
            <div className="flex gap-1.5 mb-2">
              <input
                id="interest-tag-input"
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addInterest()}
                placeholder="Gõ & nhấn Enter"
                className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100"
              />
              <button
                id="add-interest-btn"
                onClick={addInterest}
                className="bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-2 text-xs font-semibold cursor-pointer"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {(portfolio.personalInfo.interests || []).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => removeInterest(tag)}
                    className="hover:text-red-500 font-bold focus:outline-hidden"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions (Export, Import, Reset) */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {isSavedAlert && (
          <div className="text-[10px] bg-green-500/10 text-green-500 p-1.5 rounded-lg text-center font-medium flex items-center justify-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>Nạp cấu hình thành công!</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            id="export-portfolio-btn"
            onClick={exportPortfolioJSON}
            className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs py-2 px-3 rounded-xl font-medium cursor-pointer"
            title="Tải cấu hình JSON lưu tiến trình nghiên cứu"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải JSON</span>
          </button>
          
          <button
            id="import-portfolio-btn"
            onClick={triggerImportFile}
            className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs py-2 px-3 rounded-xl font-medium cursor-pointer"
            title="Đẩy file JSON đã làm nháp lưu trước đó để chấm hoặc làm tiếp"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Mở JSON</span>
          </button>
          
          <input
            id="hidden-import-file"
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />
        </div>

        <button
          id="reset-template-btn"
          onClick={() => {
            if (confirm("Bạn có chắc chắn muốn RESET toàn bộ nội dung mẫu gốc của Bài học? Điểm chỉnh sửa tự tay sẽ bị xóa hoàn toàn.")) {
              onReset();
            }
          }}
          className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 text-xs py-2 px-3 rounded-xl font-medium cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset bài mẫu gốc ban đầu</span>
        </button>
      </div>

    </div>
  );
}
