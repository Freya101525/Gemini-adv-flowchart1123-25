export type Direction = 'TB' | 'BT' | 'LR' | 'RL';
export type NodeCategory = 'title' | 'phase' | 'step' | 'decision' | 'input' | 'output' | 'note' | 'end';
export type NodeShape = 'box' | 'ellipse' | 'diamond' | 'parallelogram' | 'note' | 'doubleoctagon';
export type EdgeStyle = 'solid' | 'dashed' | 'dotted';

export interface FlowchartNode {
  id: string;
  label: string;
  category: NodeCategory;
  shape: NodeShape;
  group?: string;
  order?: number;
  x?: number; // For D3 simulation
  y?: number; // For D3 simulation
  fx?: number | null; // For D3 pinning
  fy?: number | null; // For D3 pinning
}

export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
  style: EdgeStyle;
  priority?: number;
}

export interface FlowchartSpec {
  title: string;
  direction: Direction;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

export interface ThemeColors {
  bg_color: string;
  title_fill: string;
  phase_fill: string;
  step_fill: string;
  decision_fill: string;
  end_fill: string;
  font_color: string;
  edge_color: string;
}

export interface FlowerTheme {
  light: ThemeColors;
  dark: ThemeColors;
}

export type Language = 'en' | 'zh';
export type ThemeMode = 'light' | 'dark';
export type ModelProvider = 'Gemini' | 'OpenAI' | 'Grok';