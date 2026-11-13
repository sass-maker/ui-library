import type {
  AnalysisPhase,
  AnalysisSettings,
  AnalysisStageTiming,
  ConfidencePreset,
  CountDatum,
  FullReport,
  MemorySnapshot,
  SearchEntry,
  SearchResult,
  ThreadBoundary,
  ThreadPrompt,
  ThreadStrand,
  TrendState,
} from "./types";
import type { ChatMessage, MemoryChatEvidence, MemoryChatTurn } from "./chat-types";
import type { MeasurementTraceExport } from "./trace-types";

export type DemoProgress = {
  phase: "download" | "prepare";
  loaded: number;
  total: number | null;
};

export interface MemoryAtlasServices {
  createAnalysisWorker(): Worker;
  createMemoryChatWorker(): Worker;
  analysisLease: { acquire(): Promise<boolean>; release(): Promise<void> };
  measurementTrace: {
    startAttempt(now: number): void;
    observeStages(stages: AnalysisStageTiming[]): void;
    importCompleted(now: number): void;
    firstEvidenceBackedInsight(now: number, sourceBackedItems: number): void;
    failed(now: number, stage: AnalysisPhase | null): void;
    hasEvents(): boolean;
    export(): MeasurementTraceExport;
  };
  forgetSnapshot(): Promise<void>;
  loadSnapshot(): Promise<MemorySnapshot | null>;
  saveSnapshot(snapshot: MemorySnapshot): Promise<void>;
  buildThreadStrands(
    prompts: ThreadPrompt[],
    boundaries: ThreadBoundary[],
    threshold: number,
  ): ThreadStrand[];
  classifyTrend(
    series: CountDatum[],
    totals?: Map<string, number> | null,
  ): { trend: TrendState; momentum: number };
  confidencePreset(value: number): ConfidencePreset;
  confidenceThreshold(value: number): number;
  normalizeSettings(input?: Partial<AnalysisSettings>): AnalysisSettings;
  formatDuration(milliseconds: number | null): string;
  buildMemoryChatEvidence(results: SearchResult[]): MemoryChatEvidence[];
  buildMemoryChatMessages(
    question: string,
    evidence: MemoryChatEvidence[],
    history: MemoryChatTurn[],
  ): ChatMessage[];
  buildMemoryChatFallback(evidence: MemoryChatEvidence[]): string;
  MEMORY_CHAT_MODEL: { approximateDownloadMb: number };
  planMemoryChatResults(
    question: string,
    rankedResults: SearchResult[],
    report: FullReport,
    index?: SearchEntry[],
  ): SearchResult[];
  validateMemoryChatCitations(
    answer: string,
    evidence: MemoryChatEvidence[],
  ): { valid: boolean; citations: string[]; reason: string | null };
  loadDemo?(options: {
    signal: AbortSignal;
    onProgress: (progress: DemoProgress) => void;
  }): Promise<FullReport>;
  developmentSampleUrl?: string | null;
}
