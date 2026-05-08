export interface VizHighlight {
  index: number;
  color: string;
  label?: string;
}

export interface VizArray {
  type: 'array';
  label: string;
  values: (string | number | null)[];
  highlights: VizHighlight[];
}

export interface VizHashMap {
  type: 'hashmap';
  label: string;
  entries: { key: string; value: string; highlight?: boolean }[];
}

export interface VizVariable {
  type: 'variable';
  name: string;
  value: string | number;
}

export type VizStructure = VizArray | VizHashMap | VizVariable;

export interface VizStep {
  step: number;
  description: string;
  structures: VizStructure[];
}

export interface VizResponse {
  title: string;
  steps: VizStep[];
}
