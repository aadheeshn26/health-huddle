
export interface KeyMetrics {
  dailyEntries?: Record<string, number>;
  glucoseReadings?: Array<{ date: string; value: number }>;
}

export interface AnalysisData {
  id?: string;
  user_id?: string;
  analysis_period?: number;
  claude_patterns?: any;
  vision_insights?: any;
  gpt_summary?: string;
  key_metrics?: any;
  created_at?: string;
  updated_at?: string;
}

export interface MetricsStats {
  activeDays: number;
  totalEntries: number;
  glucoseReadings: number;
}

export interface ChartDataPoint {
  date: string;
  entries: number;
  glucose: number | null;
}
