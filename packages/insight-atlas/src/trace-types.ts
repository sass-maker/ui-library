import type { AnalysisPhase } from "./types";

type MeasurementFailureClass =
  | "archive_read"
  | "model_prepare"
  | "semantic_mapping"
  | "report_assembly"
  | "worker_stopped"
  | "unknown_stage";

type MeasurementMilestone =
  | "import_started"
  | "import_completed"
  | "first_evidence_backed_insight"
  | "failure"
  | "recovery";
type MeasurementStage = AnalysisPhase | "worker";

export type MeasurementEvent = {
  milestone: MeasurementMilestone;
  attempt: number;
  elapsedMs: number;
  stage?: MeasurementStage;
  errorClass?: MeasurementFailureClass;
  recoveryDurationMs?: number;
  sourceBackedItems?: number;
};

export type MeasurementTraceExport = {
  schemaVersion: 1;
  privacy: "tab-local; no archive content, derived text, facts, queries, file names, or identifiers";
  durationScope: "maximum per phase across this tab's attempts; independent of the latest 16 events";
  events: MeasurementEvent[];
  maxObservedStageDurationsMs: Partial<Record<AnalysisPhase, number>>;
  bottleneck: {
    stage: MeasurementStage;
    reason:
      | "observed_failure_recovered"
      | "observed_failure_unresolved"
      | "longest_completed_stage";
    nextAction: string;
  } | null;
};
