/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

const PORTFOLIO_FILE = path.join(process.cwd(), "portfolio-data.json");

// API to load published portfolio
app.get("/api/portfolio", (req: any, res: any) => {
  if (fs.existsSync(PORTFOLIO_FILE)) {
    try {
      const data = fs.readFileSync(PORTFOLIO_FILE, "utf-8");
      return res.json(JSON.parse(data));
    } catch (e) {
      console.error("Error reading portfolio file:", e);
    }
  }
  res.json({ default: true });
});

// API to publish/save portfolio data persistently on server
app.post("/api/portfolio", (req: any, res: any) => {
  try {
    const portfolio = req.body;
    fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(portfolio, null, 2), "utf-8");
    res.json({ success: true, message: "Đã xuất bản website thành công trên máy chủ!" });
  } catch (e: any) {
    console.error("Error writing portfolio file:", e);
    res.status(500).json({ error: "Không thể ghi dữ liệu xuất bản: " + e.message });
  }
});

// Initialize server-side Gemini client securely
// Using User-Agent header 'aistudio-build' for telemetry
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Cảnh báo: GEMINI_API_KEY chưa được thiết lập trong .env");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

const ai = getGeminiClient();

// API endpoint: Optimize prompts using CO-STAR framework (Prompt Engineering)
app.post("/api/gemini/optimize-prompt", async (req: any, res: any) => {
  try {
    const { originalPrompt, context } = req.body;
    if (!originalPrompt) {
      return res.status(400).json({ error: "Vui lòng nhập prompt gốc." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        improvedPrompt: `[Context]: Bối cảnh học tập về ${context || "ngành số"}\n[Objective]: ${originalPrompt}\n[Style]: Sư phạm, khoa học\n[Tone]: Nghiêm túc, hướng dẫn kỹ lưỡng\n[Audience]: Sinh viên đại học\n[Response Format]: Định dạng bài bản mẫu mực`,
        explanation: "Hệ thống đang hoạt động ở chế độ Offline (chưa cấu hình API Key). Dưới đây là cấu tạo mẫu Prompt CO-STAR cơ bản.",
        mockAiOutput: "Bổ sung mã khóa GEMINI_API_KEY trong biểu tượng Settings > Secrets ở góc trên AI Studio để trải nghiệm phản hồi AI thời gian thực trực tiếp."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Bạn là chuyên gia hàng đầu về Prompt Engineering trên hệ thống Google AI Studio.
Nhiệm vụ của bạn là tối ưu hóa prompt lập trình/học tập của sinh viên thành một prompt mẫu mực, áp dụng kỹ thuật CO-STAR (Context - Objective - Style - Tone - Audience - Response format) bằng tiếng Việt.

Prompt gốc của sinh viên: "${originalPrompt}"
Bối cảnh bổ sung từ người dùng: "${context || "Lưu trữ sản phẩm và giải thích học thuật trong danh mục Portfolio học tập"}"

Đầu ra của bạn PHẢI là một chuỗi JSON hợp lệ và đúng định dạng cấu trúc sau để hệ thống parse hiển thị trực quan:
{
  "improvedPrompt": "Toàn văn nội dung Prompt đã cải tiến chuyên sâu, phân tách chi tiết rõ ràng qua các nhãn [Context], [Objective], [Style], [Tone], [Audience], [Response format] bằng tiếng Việt",
  "explanation": "Đánh giá phân tích khoảng 2 câu lý giải tại sao prompt cải tiến này tối ưu hóa độ hiểu và phản hồi chuyên nghiệp của AI, giúp sinh viên đạt điểm cực cao",
  "mockAiOutput": "Mẫu phản hồi lý tưởng (2-3 đoạn ngắn) từ AI khi nhận được prompt cải tiến đã định hình cấu trúc hoàn hảo ở trên"
}

LƯU Ý: Chỉ trả ra chuỗi JSON thô, không bọc khối mã markdown (như \`\`\`json ... \`\`\`), không có thêm ký tự nào khác để hệ điều hành parse an toàn.`
    });

    const text = response.text || "{}";
    try {
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      res.json(parsed);
    } catch (parseError) {
      res.json({
        improvedPrompt: text,
        explanation: "Đã tối ưu hóa prompt xuất sắc thông qua Gemini AI.",
        mockAiOutput: "Hãy sao chép Prompt này để chạy tại AI Studio hoặc ứng dụng của riêng bạn!"
      });
    }
  } catch (error: any) {
    console.error("Lỗi Gemini API:", error);
    res.status(500).json({ error: error.message || "Hệ thống gặp sự cố kết nối Gemini" });
  }
});

// API endpoint: Auto-improve text descriptions for users who want to polish their content
app.post("/api/gemini/improve-text", async (req: any, res: any) => {
  try {
    const { originalText, fieldName, contextInfo } = req.body;
    if (!originalText) {
      return res.status(400).json({ error: "Vui lòng nhập nội dung cần tối ưu." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        improvedText: `${originalText} (Chế độ mô phỏng chuyên nghiệp: Vui lòng kết nối GEMINI_API_KEY để trợ lý học thuật tự động sửa đổi cấu từ chuẩn quốc tế đạt mức đánh giá tối đa).`
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Bạn là một cố vấn học thuật đẳng cấp thế giới chấm điểm dự án sinh viên theo thang điểm nghiên cứu xuất sắc.
Hãy viết lại nội dung sau đây cho sinh viên bằng tiếng Việt cực kỳ chuyên nghiệp, lưu loát, giàu tính học thuật kỹ thuật số và tư duy sắc sảo chiều sâu, tuyệt đối tránh sáo rỗng hay lặp từ.

Phần nội dung (Trang/Mục): ${fieldName}
Dữ liệu viết nháp của sinh viên: "${originalText}"
Yêu cầu chuyên sâu bổ sung: ${contextInfo || "Tối ưu hóa khả năng trình bày, thể hiện được sự tìm tòi chủ động và tuân thủ các quy chuẩn số khoa học."}

Hãy trả ra trực tiếp và CHỈ DUY NHẤT văn bản thô đã được cải tiến tinh tế (khoảng 1-3 đoạn văn rõ ràng). Không thêm tiêu đề phụ, không giải thích ngoài lề, không đặt trong dấu ngoặc kép.`
    });

    res.json({ improvedText: (response.text || "").trim() });
  } catch (error: any) {
    console.error("Lỗi Gemini API:", error);
    res.status(500).json({ error: error.message || "Gặp sự cố khi tối ưu hóa ngôn từ" });
  }
});

async function main() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode with Vite reload
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULL-STACK] Server running on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Sự cố khởi động server:", err);
});
