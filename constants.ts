import { FlowerTheme } from './types';

export const DEFAULT_SYSTEM_PROMPT = `
You are an expert information architect and visualization designer.
Your task is to transform a natural-language description of a process into a clean, well-structured, directed flowchart.

General requirements:
- You MUST strictly follow the output schema described below.
- Output MUST be valid JSON only (no markdown, no comments, no code fences).
- Node IDs must be unique, short, and safe for Graphviz (letters, digits, underscores only).
- Assume the rendering engine will handle colors, fonts, and layout; you only define structure and labels.
- Respect the requested language for ALL labels and the title (English or Chinese).

User will provide:
- A textual description of a process or workflow.
- A preferred language: "en" (English) or "zh" (Chinese).
- Optional hints like stages, phases, or key entities.

Your job:
1. Understand the process.
2. Break it into stages/phases (if applicable).
3. Define nodes and directed edges.
4. Choose reasonable shapes for nodes.
5. Produce a JSON object matching the SCHEMA below.

SCHEMA (JSON):
{
  "title": "string, human-friendly title for the flowchart in the requested language",
  "direction": "string, one of: 'TB' (top-bottom), 'BT', 'LR' (left-right), 'RL'",
  "nodes": [
    {
      "id": "short_unique_identifier",
      "label": "node label, in the requested language",
      "category": "one of: 'title', 'phase', 'step', 'decision', 'input', 'output', 'note', 'end'",
      "shape": "one of: 'box', 'ellipse', 'diamond', 'parallelogram', 'note', 'doubleoctagon'",
      "group": "optional logical grouping, e.g. 'Phase 1', can be empty string",
      "order": "integer indicating approximate vertical or horizontal ordering within its group"
    }
  ],
  "edges": [
    {
      "from": "source_node_id",
      "to": "target_node_id",
      "label": "optional edge label in the requested language (can be empty string)",
      "style": "one of: 'solid', 'dashed', 'dotted'",
      "priority": "integer; smaller means more important/central edges"
    }
  ]
}

Language Rules:
- If language is "en", all labels and title must be in English.
- If language is "zh", all labels and title must be in Traditional Chinese (繁體中文).
`;

export const FLOWER_STYLES: Record<string, FlowerTheme> = {
  "Sakura": {
    light: { bg_color: "#FFF7FB", title_fill: "#F78FB3", phase_fill: "#FADDE1", step_fill: "#FFFFFF", decision_fill: "#FFE4EE", end_fill: "#FFD1DC", font_color: "#333333", edge_color: "#F78FB3" },
    dark: { bg_color: "#2B1B2D", title_fill: "#F78FB3", phase_fill: "#5A2B4D", step_fill: "#3A223A", decision_fill: "#6A3058", end_fill: "#C65B7C", font_color: "#FCE4EC", edge_color: "#F78FB3" },
  },
  "Rose": {
    light: { bg_color: "#FFF5F7", title_fill: "#E63946", phase_fill: "#FFC8D8", step_fill: "#FFFFFF", decision_fill: "#FFB3C6", end_fill: "#FFE0E9", font_color: "#2B2626", edge_color: "#E63946" },
    dark: { bg_color: "#2B1B1D", title_fill: "#E63946", phase_fill: "#5B2227", step_fill: "#3C2224", decision_fill: "#7A2931", end_fill: "#F28482", font_color: "#FFECEC", edge_color: "#F1A7B3" },
  },
  "Lotus": {
    light: { bg_color: "#F6FFF7", title_fill: "#2A9D8F", phase_fill: "#C9F2E9", step_fill: "#FFFFFF", decision_fill: "#B5EAD7", end_fill: "#E8F8F5", font_color: "#1B2B2B", edge_color: "#2A9D8F" },
    dark: { bg_color: "#0B1C19", title_fill: "#2A9D8F", phase_fill: "#17453F", step_fill: "#102825", decision_fill: "#1E5C52", end_fill: "#3AAFA9", font_color: "#E0F7F4", edge_color: "#2A9D8F" },
  },
  "Sunflower": {
    light: { bg_color: "#FFFBEB", title_fill: "#F59E0B", phase_fill: "#FDE68A", step_fill: "#FFFFFF", decision_fill: "#FBBF24", end_fill: "#FEF3C7", font_color: "#3F2A1C", edge_color: "#D97706" },
    dark: { bg_color: "#1F170C", title_fill: "#F59E0B", phase_fill: "#78350F", step_fill: "#3B2F1C", decision_fill: "#C47F1A", end_fill: "#FBBF24", font_color: "#FEF9C3", edge_color: "#FBBF24" },
  },
  "Lavender": {
    light: { bg_color: "#F9F5FF", title_fill: "#7C3AED", phase_fill: "#DDD6FE", step_fill: "#FFFFFF", decision_fill: "#C4B5FD", end_fill: "#EDE9FE", font_color: "#312E81", edge_color: "#7C3AED" },
    dark: { bg_color: "#18122B", title_fill: "#7C3AED", phase_fill: "#44337A", step_fill: "#251C49", decision_fill: "#553C9A", end_fill: "#A78BFA", font_color: "#EDE9FE", edge_color: "#A78BFA" },
  },
  "Orchid": {
    light: { bg_color: "#FFF7FF", title_fill: "#C026D3", phase_fill: "#F5D0FE", step_fill: "#FFFFFF", decision_fill: "#E9D5FF", end_fill: "#FAE8FF", font_color: "#3B0764", edge_color: "#C026D3" },
    dark: { bg_color: "#24002F", title_fill: "#C026D3", phase_fill: "#581C87", step_fill: "#3B0764", decision_fill: "#6B21A8", end_fill: "#E879F9", font_color: "#FCE7F3", edge_color: "#E879F9" },
  },
  "Hydrangea": {
    light: { bg_color: "#F3F8FF", title_fill: "#2563EB", phase_fill: "#BFDBFE", step_fill: "#FFFFFF", decision_fill: "#93C5FD", end_fill: "#DBEAFE", font_color: "#1E293B", edge_color: "#2563EB" },
    dark: { bg_color: "#0B1220", title_fill: "#2563EB", phase_fill: "#1E3A8A", step_fill: "#111827", decision_fill: "#1D4ED8", end_fill: "#60A5FA", font_color: "#E5E7EB", edge_color: "#60A5FA" },
  },
  "Tulip": {
    light: { bg_color: "#FFF7ED", title_fill: "#EA580C", phase_fill: "#FED7AA", step_fill: "#FFFFFF", decision_fill: "#FDBA74", end_fill: "#FFEDD5", font_color: "#4B2E1A", edge_color: "#EA580C" },
    dark: { bg_color: "#26160C", title_fill: "#EA580C", phase_fill: "#7C2D12", step_fill: "#3F2010", decision_fill: "#9A3412", end_fill: "#FDBA74", font_color: "#FFE7D6", edge_color: "#FDBA74" },
  }
};

export const UI_TEXT = {
  en: {
    title: "Agentic AI Flowchart Architect",
    subtitle: "Transform ideas into organic structures.",
    inputLabel: "Process Description",
    inputPlaceholder: "Describe your process here (e.g., medical device approval workflow)...",
    generateBtn: "Generate Flowchart",
    generating: "Designing...",
    nodes: "Nodes",
    edges: "Edges",
    complexity: "Complexity",
    settings: "Configuration",
    prompt: "System Prompt",
    outputLanguage: "Output Language",
    langEn: "English",
    langZh: "Trad. Chinese",
  },
  zh: {
    title: "智能 AI 流程圖架構師",
    subtitle: "將想法轉化為有機結構。",
    inputLabel: "流程描述",
    inputPlaceholder: "請輸入流程描述（例如：醫療器材審批流程）...",
    generateBtn: "生成流程圖",
    generating: "設計中...",
    nodes: "節點",
    edges: "連線",
    complexity: "複雜度",
    settings: "設定",
    prompt: "系統提示詞",
    outputLanguage: "輸出語言",
    langEn: "英文",
    langZh: "繁體中文",
  }
};