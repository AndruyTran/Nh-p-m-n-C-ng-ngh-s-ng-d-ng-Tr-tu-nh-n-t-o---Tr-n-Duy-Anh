/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PersonalInfo {
  fullName: string;
  avatarUrl: string;
  studentId: string;
  major: string;
  school: string;
  class: string;
  email: string;
  githubUrl: string;
  facebookUrl: string;
  personalGoals: string;
  interests: string[];
  portfolioObjective: string;
}

export interface Attachment {
  name: string;
  url: string;
  type: "link" | "pdf" | "image" | "video";
}

export interface TableRow {
  [key: string]: string;
}

export interface ProjectItem {
  id: string;
  lessonName: string; // E.g., "Bài 1.4: Thao tác cơ bản với tệp tin và thư mục"
  exerciseTitle: string; // E.g., "Sắp xếp & Quản lý dữ liệu khoa học"
  objective: string;
  processSummary: string;
  result?: string;
  imageUrls: string[]; // screenshots or decorative images
  attachments: Attachment[];
  
  // Custom interactive details for the specific Level 4 deliverables
  customData?: {
    // Lesson 1: Folder structure & Naming
    folderStructureCode?: string; // markdown representation of folder tree
    namingRules?: string[]; // rules used for naming files

    // Lesson 2: Academic Search Operators & Evaluation
    searchQueriesUsed?: Array<{ query: string; operatorExplanation: string }>;
    evaluationTableHeaders?: string[];
    evaluationTableRows?: TableRow[];

    // Lesson 3: Prompt Engineering
    originalPrompt?: string;
    improvedPrompt?: string;
    aiComparisonInsight?: string;
    aiOutputOriginal?: string;
    aiOutputImproved?: string;

    // Lesson 4: Collaboration Evidence
    collabToolsUsed?: string[];
    collabWorkflowDescription?: string;
    collabEvidenceLink?: string;

    // Lesson 5: GenAI output
    genAiToolsUsed?: string[];
    genAiProducts?: Array<{ title: string; desc: string; previewUrl: string; productType: string }>;

    // Lesson 6: Ethical & Responsible AI
    responsibleAiRules?: string[];
    academicEthicsStatement?: string;
    ethicsSolutions?: string; // Proposed actions for ethical risks
  };
}

export interface ReflectionData {
  overallReflection: string;
  keySkillsLearned: string[];
  favoriteFeature: string;
  challengesFaced: Array<{ challenge: string; solution: string }>;
  futureApplications: string;
}

export interface PortfolioConfig {
  theme: "slate" | "indigo" | "serif" | "minimal";
  personalInfo: PersonalInfo;
  projects: ProjectItem[];
  reflection: ReflectionData;
}
