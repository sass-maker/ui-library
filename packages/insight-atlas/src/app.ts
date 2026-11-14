import { createUiSurface } from "@saas-maker/ui/lib/dom-surfaces";
import { atlasElement } from "./ui-elements";
import { createAtlasMotion } from "./motion";
import { bindAtlasTabs } from "./tabs";
import type { MemoryAtlasServices, DemoProgress } from "./services";
import type {
  MemoryChatEvidence,
  MemoryChatRuntime,
  MemoryChatTurn,
  MemoryChatWorkerRequest,
  MemoryChatWorkerResponse,
} from "./chat-types";
import { activityMonthWindow } from "./period";
import {
  FORMATION_ROUTES,
  formationPoint,
  formationRoute,
  formationRouteIds,
} from "./graph-formation";
import type {
  AnalysisPerformance,
  AnalysisPhase,
  AnalysisProgressTiming,
  AnalysisRuntime,
  AnalysisSettings,
  EfficiencyReport,
  EmotionBucket,
  FactGroup,
  FullReport,
  GraphFormationConversation,
  MemorySnapshot,
  ModelProfile,
  QuestionLens,
  SearchResult,
  SourceRef,
  ThreadSegmentation,
  TopicNode,
  TrendState,
  WorkerRequest,
  WorkerResponse,
} from "./types";
import { createStoryController } from "./story";
import { renderVisualAtlas } from "./visual-atlas";

export function mountMemoryAtlas(services: MemoryAtlasServices) {
  const {
    forgetSnapshot,
    loadSnapshot,
    saveSnapshot,
    buildThreadStrands,
    classifyTrend,
    confidencePreset,
    confidenceThreshold,
    normalizeSettings,
    formatDuration,
    buildMemoryChatEvidence,
    buildMemoryChatMessages,
    buildMemoryChatFallback,
    MEMORY_CHAT_MODEL,
    planMemoryChatResults,
    validateMemoryChatCitations,
  } = services;
  const $ = <T extends Element = HTMLElement>(selector: string): T => {
    const element = document.querySelector<T>(selector);
    if (!element) throw new Error(`Missing element: ${selector}`);
    return element;
  };

  const svgElement = <K extends keyof SVGElementTagNameMap>(tag: K) =>
    document.createElementNS("http://www.w3.org/2000/svg", tag);

  const importView = $("#import-view");
  const demoProgressView = $("#demo-progress");
  const demoProgressBar = $<HTMLProgressElement>("#demo-progress-bar");
  const demoProgressStatus = $("#demo-progress-status");
  const demoProgressBytes = $("#demo-progress-bytes");
  let demoLoad: AbortController | null = null;
  let sessionVersion = 0;
  const progressView = $("#progress-view");
  const errorView = $("#error-view");
  const reportView = $("#report-view");
  const reportNav = $("#report-nav");
  const motion = createAtlasMotion(document);
  const unbindTabs = [...document.querySelectorAll<HTMLElement>('[role="tablist"]')]
    .map(bindAtlasTabs);
  const archiveInput = $<HTMLInputElement>("#archive-input");
  const dropZone = $("#drop-zone");
  const progressStatus = $("#progress-status");
  const progressPhase = $("#progress-phase");
  const progressFill = $<HTMLElement>("#progress-line-fill");
  const progressElapsed = $("#progress-elapsed");
  const progressRemaining = $("#progress-remaining");
  const progressRuntime = $("#progress-runtime");
  const analysisDetails = $<HTMLDetailsElement>("#analysis-details");
  const analysisDetailsSummary = $("#analysis-details-summary");
  const analysisTimingBoard = $("#analysis-timing-board");
  const localTraceSection = $("#local-trace-section");
  const localTraceSummary = $("#local-trace-summary");
  const exportLocalTraceButton = $<HTMLButtonElement>("#export-local-trace");
  const errorMessage = $("#error-message");
  const appStatus = $("#app-status");
  const graph = $<SVGSVGElement>("#topic-graph");
  const evidencePanel = $("#evidence-panel");
  const evidenceContent = $("#evidence-content");
  const appShell = $<HTMLElement>(".app-shell");
  const searchResults = $("#search-results");
  const searchInput = $<HTMLInputElement>("#search-query");
  const saveButton = $<HTMLButtonElement>("#save-memory");
  const forgetButton = $<HTMLButtonElement>("#forget-memory");
  const confidenceInput = $<HTMLInputElement>("#confidence-input");
  const confidenceOutput = $<HTMLOutputElement>("#confidence-output");
  const reportConfidenceInput = $<HTMLInputElement>("#report-confidence-input");
  const reportConfidenceOutput = $<HTMLOutputElement>("#report-confidence-output");
  const atlasPeriod = $<HTMLSelectElement>("#atlas-period");
  const rhythmRoute = $<HTMLSelectElement>("#rhythm-route");
  const storyButton = $<HTMLButtonElement>("#open-story");
  const enableMemoryChatButton = $<HTMLButtonElement>("#enable-memory-chat");
  const unloadMemoryChatButton = $<HTMLButtonElement>("#unload-memory-chat");
  const memoryChatModelStatus = $("#memory-chat-model-status");
  const memoryChatModelProgress = $<HTMLProgressElement>("#memory-chat-model-progress");
  const memoryChatSession = $("#memory-chat-session");
  const memoryChatTranscript = $("#memory-chat-transcript");
  const memoryChatForm = $<HTMLFormElement>("#memory-chat-form");
  const memoryChatQuery = $<HTMLTextAreaElement>("#memory-chat-query");
  const memoryChatEvidence = $("#memory-chat-evidence");
  const graphLoading = $("#graph-loading");
  const graphFormationProgressSlot = $("#graph-formation-progress-slot");
  const graphFormation = $("#graph-formation");
  const graphFormationCanvas = $<HTMLCanvasElement>("#graph-formation-canvas");
  const graphFormationCount = $<HTMLOutputElement>("#graph-formation-count");
  const graphFormationLatest = $("#graph-formation-latest");
  const graphFormationRoutes = $("#graph-formation-routes");

  const { analysisLease, measurementTrace } = services;

  let worker = createWorker();
  let memoryChatWorker: Worker | null = null;
  let memoryChatReady = false;
  let pendingMemoryQuestion: string | null = null;
  let pendingMemoryEvidence: MemoryChatEvidence[] = [];
  let memoryChatHistory: MemoryChatTurn[] = [];
  let currentReport: FullReport | null = null;
  let semanticFailure: string | null = null;
  let currentSnapshot: MemorySnapshot | null = null;
  let currentSnapshotSaved = false;
  let ledgerStatus: FactGroup["status"] = "current";
  let activeConfidence = 65;
  let evolutionKind: "topics" | "domains" | "language" = "topics";
  let activePeriodMonths: number | null = 12;
  let activeRhythmMeasure: "conversations" | "words" = "conversations";
  let activeRhythmRouteId: "all" | QuestionLens["id"] = "all";
  let analysisDetailsAutoSettled = false;
  let evidenceReturnFocus: HTMLElement | SVGElement | null = null;
  let timingInterval: number | null = null;
  let latestTiming: {
    phase: AnalysisPhase;
    label: string;
    current: number;
    total: number;
    timing: AnalysisProgressTiming;
    receivedAt: number;
  } | null = null;
  let graphFormationQueue: GraphFormationConversation[] = [];
  let graphFormationCursor = 0;
  let graphFormationRendered: GraphFormationConversation[] = [];
  let graphFormationProcessed = 0;
  let graphFormationFrame: number | null = null;
  const reduceGraphFormationMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const storyController = createStoryController({ showEvidence });

  function createWorker() {
    const nextWorker = services.createAnalysisWorker();
    nextWorker.addEventListener("message", onWorkerMessage);
    nextWorker.addEventListener("error", () => {
      measurementTrace.failed(performance.now(), null);
      renderLocalMeasurementTrace();
      showError("The analysis worker stopped unexpectedly. Choose the archive again.");
    });
    return nextWorker;
  }

  function createMemoryChatWorker() {
    const nextWorker = services.createMemoryChatWorker();
    nextWorker.addEventListener("message", onMemoryChatWorkerMessage);
    nextWorker.addEventListener("error", () => {
      memoryChatModelStatus.textContent =
        "The local chat worker stopped. The retrieved evidence remains available.";
      unloadMemoryChatModel(false);
    });
    return nextWorker;
  }

  function send(request: WorkerRequest) {
    worker.postMessage(request);
  }

  function sendMemoryChat(request: MemoryChatWorkerRequest) {
    memoryChatWorker?.postMessage(request);
  }

  function showOnly(view: HTMLElement) {
    const changed = view.hidden;
    for (const candidate of [importView, demoProgressView, progressView, errorView, reportView]) {
      candidate.hidden = candidate !== view;
    }
    reportNav.hidden = view !== reportView;
    if (!changed) return;
    motion.cancelAll();
    window.scrollTo({ top: 0, behavior: "instant" });
    motion.enter(view, { offset: 0 });
    if (view === reportView) {
      document.querySelectorAll("#overview-stats > div").forEach((card, index) =>
        motion.enter(card, { delay: index * 30 })
      );
    }
  }

  const reportRouteLinks = [...reportNav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const reportRouteSections = reportRouteLinks
    .map((link) => {
      const target = document.querySelector<HTMLElement>(link.hash);
      return target ? { link, target } : null;
    })
    .filter((entry): entry is { link: HTMLAnchorElement; target: HTMLElement } => Boolean(entry));

  function setCurrentReportRoute(id: string | null) {
    for (const { link, target } of reportRouteSections) {
      if (id === target.id) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }

  const reportRouteObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (left, right) =>
            Math.abs(left.boundingClientRect.top) - Math.abs(right.boundingClientRect.top)
        )[0];
      if (visible?.target instanceof HTMLElement) setCurrentReportRoute(visible.target.id);
    },
    { rootMargin: "-18% 0px -68% 0px", threshold: 0 }
  );
  for (const { link, target } of reportRouteSections) {
    reportRouteObserver.observe(target);
    link.addEventListener("click", () => setCurrentReportRoute(target.id));
  }

  function formatNumber(value: number): string {
    return new Intl.NumberFormat().format(value);
  }

  function formatDate(timestamp: number): string {
    if (!timestamp) return "Unknown date";
    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: currentReport?.demo ? "UTC" : undefined,
    }).format(new Date(timestamp * 1_000));
  }

  function formatMonth(month: string): string {
    const [year, monthIndex] = month.split("-").map(Number);
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, monthIndex - 1, 1)));
  }

  function formatPercent(value: number): string {
    return new Intl.NumberFormat(undefined, {
      style: "percent",
      maximumFractionDigits: 1,
    }).format(value);
  }

  function runtimeLabel(runtime?: AnalysisRuntime): string {
    if (!runtime) return "Selecting…";
    const route = runtime.device === "webgpu" ? "Accelerated GPU" : "Compatibility mode";
    return `${route} · ${runtime.dtype} · batch ${runtime.batchSize}`;
  }

  function stageDuration(
    stages: AnalysisProgressTiming["completedStages"],
    phase: AnalysisPhase
  ): number {
    return stages
      .filter((stage) => stage.phase === phase)
      .reduce((total, stage) => total + stage.elapsedMs, 0);
  }

  function renderStageTimings(
    completedStages: AnalysisProgressTiming["completedStages"],
    currentPhase: AnalysisPhase | null,
    currentElapsedMs: number
  ) {
    for (const list of [
      $<HTMLOListElement>("#progress-stage-list"),
      $<HTMLOListElement>("#report-stage-list"),
    ]) {
      for (const item of list.querySelectorAll<HTMLLIElement>("[data-timing-stage]")) {
        const phase = item.dataset.timingStage as AnalysisPhase;
        const complete = completedStages.find((stage) => stage.phase === phase);
        const active = phase === currentPhase;
        item.classList.toggle("is-complete", Boolean(complete));
        item.classList.toggle("is-active", active);
        const time = item.querySelector("time");
        if (time) {
          time.textContent = complete
            ? formatDuration(complete.elapsedMs)
            : active
              ? formatDuration(currentElapsedMs)
              : "Waiting";
        }
      }
    }
  }

  function renderLiveTiming(
    phase: AnalysisPhase,
    label: string,
    current: number,
    total: number,
    timing: AnalysisProgressTiming
  ) {
    const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
    progressElapsed.textContent = formatDuration(timing.totalElapsedMs);
    progressRemaining.textContent =
      timing.estimatedRemainingMs === null
        ? "Estimating…"
        : `About ${formatDuration(timing.estimatedRemainingMs)}`;
    progressRuntime.textContent = runtimeLabel(timing.runtime);
    renderStageTimings(timing.completedStages, phase, timing.stageElapsedMs);

    if (currentReport) {
      analysisDetails.open = true;
      analysisDetailsAutoSettled = false;
      analysisTimingBoard.hidden = false;
      $("#report-timing-initial").textContent = formatDuration(
        currentReport.performance?.initialInsightsMs ?? timing.totalElapsedMs
      );
      $("#report-timing-total").textContent =
        timing.estimatedRemainingMs === null
          ? `${formatDuration(timing.totalElapsedMs)} elapsed`
          : `${formatDuration(timing.totalElapsedMs)} elapsed · about ${formatDuration(
              timing.estimatedRemainingMs
            )} left`;
      const modelMs =
        stageDuration(timing.completedStages, "model") +
        (phase === "model" ? timing.stageElapsedMs : 0);
      const semanticMs =
        stageDuration(timing.completedStages, "embed") +
        stageDuration(timing.completedStages, "cluster") +
        (phase === "embed" || phase === "cluster" ? timing.stageElapsedMs : 0);
      $("#report-timing-model").textContent = modelMs > 0 ? formatDuration(modelMs) : "Waiting";
      $("#report-timing-semantic").textContent =
        semanticMs > 0 ? formatDuration(semanticMs) : "Waiting";
      $("#report-timing-runtime").textContent = runtimeLabel(timing.runtime);
      $("#report-timing-coverage").textContent =
        phase === "embed" && total > 0
          ? `${formatNumber(current)} of ${formatNumber(total)} vectors`
          : "Preparing selected candidates";
      $("#report-timing-status").textContent = `${label}${total > 0 ? ` · ${percent}%` : ""}${
        timing.estimatedRemainingMs === null
          ? ""
          : ` · about ${formatDuration(timing.estimatedRemainingMs)} left`
      }`;
      analysisDetailsSummary.textContent = `${label}${total > 0 ? ` · ${percent}%` : ""} · ${confidencePreset(activeConfidence)} evidence`;
    }
  }

  function renderPerformanceSummary(
    performance: AnalysisPerformance | undefined,
    restored = false
  ) {
    if (!performance) {
      analysisTimingBoard.hidden = true;
      analysisDetailsSummary.textContent = `Model and confidence · ${confidencePreset(activeConfidence)} evidence`;
      return;
    }
    analysisTimingBoard.hidden = false;
    $("#report-timing-initial").textContent = formatDuration(performance.initialInsightsMs);
    $("#report-timing-total").textContent =
      performance.totalMs === null
        ? "Running…"
        : `Complete in ${formatDuration(performance.totalMs)}`;
    $("#report-timing-model").textContent =
      performance.modelMs > 0 ? formatDuration(performance.modelMs) : "Waiting";
    $("#report-timing-semantic").textContent =
      performance.semanticMs > 0 ? formatDuration(performance.semanticMs) : "Waiting";
    $("#report-timing-runtime").textContent = runtimeLabel(performance.runtime);
    $("#report-timing-coverage").textContent = performance.semanticCandidateCount
      ? `${formatNumber(performance.semanticCandidateCount)} vectors · selected set preserved`
      : "Preparing selected candidates";
    $("#report-timing-status").textContent =
      performance.status === "complete"
        ? `${restored ? "Original analysis run" : "Complete map ready"}. Total includes archive parsing, model preparation, embedding, and report assembly.`
        : "Initial insights are ready. Semantic analysis is continuing.";
    renderStageTimings(performance.stages, null, 0);
    if (performance.status === "complete") {
      analysisDetailsSummary.textContent = `${performance.totalMs === null ? "Complete" : `Complete in ${formatDuration(performance.totalMs)}`} · ${confidencePreset(activeConfidence)} evidence`;
      if (!analysisDetailsAutoSettled) {
        analysisDetails.open = false;
        analysisDetailsAutoSettled = true;
      }
    } else {
      analysisDetails.open = true;
      analysisDetailsAutoSettled = false;
      analysisDetailsSummary.textContent = `Semantic work is running · ${confidencePreset(activeConfidence)} evidence`;
    }
  }

  function stopTimingTicker() {
    if (timingInterval !== null) window.clearInterval(timingInterval);
    timingInterval = null;
  }

  function startTimingTicker() {
    stopTimingTicker();
    timingInterval = window.setInterval(() => {
      if (!latestTiming) return;
      const delta = performance.now() - latestTiming.receivedAt;
      renderLiveTiming(
        latestTiming.phase,
        latestTiming.label,
        latestTiming.current,
        latestTiming.total,
        {
          ...latestTiming.timing,
          stageElapsedMs: latestTiming.timing.stageElapsedMs + delta,
          totalElapsedMs: latestTiming.timing.totalElapsedMs + delta,
          estimatedRemainingMs:
            latestTiming.timing.estimatedRemainingMs === null
              ? null
              : Math.max(0, latestTiming.timing.estimatedRemainingMs - delta),
        }
      );
    }, 1_000);
  }

  function truncate(value: string, length: number): string {
    const singleLine = value.replace(/\s+/g, " ").trim();
    return singleLine.length > length
      ? `${singleLine.slice(0, length - 1).trimEnd()}…`
      : singleLine;
  }

  function text(tag: keyof HTMLElementTagNameMap, value: string, className?: string) {
    return atlasElement(tag, value, className);
  }

  function readAnalysisSettings(): AnalysisSettings {
    const profile =
      document.querySelector<HTMLInputElement>('input[name="model-profile"]:checked')?.value ??
      "auto";
    return normalizeSettings({
      modelProfile: profile as ModelProfile,
      confidence: Number(confidenceInput.value),
    });
  }

  function setConfidence(value: number, rerender = true) {
    activeConfidence = normalizeSettings({ confidence: value }).confidence;
    const display = `${activeConfidence}%`;
    confidenceInput.value = String(activeConfidence);
    reportConfidenceInput.value = String(activeConfidence);
    confidenceOutput.value = display;
    confidenceOutput.textContent = display;
    reportConfidenceOutput.value = display;
    reportConfidenceOutput.textContent = display;
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-confidence]")) {
      button.setAttribute(
        "aria-pressed",
        String(Number(button.dataset.confidence) === activeConfidence)
      );
    }
    const performance = currentReport?.performance;
    analysisDetailsSummary.textContent =
      performance?.status === "complete"
        ? `${performance.totalMs === null ? "Complete" : `Complete in ${formatDuration(performance.totalMs)}`} · ${confidencePreset(activeConfidence)} evidence`
        : performance
          ? `Semantic work is running · ${confidencePreset(activeConfidence)} evidence`
          : `Model and confidence · ${confidencePreset(activeConfidence)} evidence`;
    if (rerender && currentReport) {
      renderReport(currentReport);
      appStatus.textContent = `Showing ${confidencePreset(activeConfidence)} evidence at ${display} confidence.`;
    }
  }

  function clearsConfidence(score: number): boolean {
    return score >= confidenceThreshold(activeConfidence);
  }

  function resetWorker() {
    worker.terminate();
    worker = createWorker();
  }

  function drawGraphFormation() {
    const context = graphFormationCanvas.getContext("2d");
    if (!context) return;
    const cssWidth = Math.max(300, graphFormationCanvas.clientWidth || 900);
    const cssHeight = Math.max(
      280,
      graphFormationCanvas.clientHeight || Math.min(420, cssWidth * 0.45)
    );
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(cssWidth * pixelRatio);
    const height = Math.round(cssHeight * pixelRatio);
    if (graphFormationCanvas.width !== width || graphFormationCanvas.height !== height) {
      graphFormationCanvas.width = width;
      graphFormationCanvas.height = height;
    }
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, cssWidth, cssHeight);
    context.fillStyle = "#f3f5f2";
    context.fillRect(0, 0, cssWidth, cssHeight);

    context.strokeStyle = "#dce1df";
    context.lineWidth = 1;
    for (let x = 0; x <= cssWidth; x += 54) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, cssHeight);
      context.stroke();
    }
    for (let y = 0; y <= cssHeight; y += 54) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(cssWidth, y);
      context.stroke();
    }

    const routeCounts = new Map(FORMATION_ROUTES.map((route) => [route.id, 0]));
    graphFormationRendered.forEach((conversation, index) => {
      const point = formationPoint(conversation, index);
      const routeIds = formationRouteIds(conversation);
      for (const routeId of routeIds) {
        routeCounts.set(routeId, (routeCounts.get(routeId) ?? 0) + 1);
        const route = formationRoute(routeId);
        context.beginPath();
        context.moveTo(point.x * cssWidth, point.y * cssHeight);
        context.lineTo(route.x * cssWidth, route.y * cssHeight);
        context.strokeStyle = `${route.color}20`;
        context.lineWidth = 0.7;
        context.stroke();
      }
      const primary = formationRoute(routeIds[0]);
      context.beginPath();
      context.arc(point.x * cssWidth, point.y * cssHeight, 1.8, 0, Math.PI * 2);
      context.fillStyle = `${primary.color}a6`;
      context.fill();
    });

    const latest = graphFormationRendered.at(-1);
    if (latest) {
      const point = formationPoint(latest, graphFormationRendered.length - 1);
      const primary = formationRoute(formationRouteIds(latest)[0]);
      context.beginPath();
      context.arc(point.x * cssWidth, point.y * cssHeight, 5.5, 0, Math.PI * 2);
      context.strokeStyle = primary.color;
      context.lineWidth = 2.5;
      context.stroke();
    }

    const canvasStyle = getComputedStyle(graphFormationCanvas);
    const canvasFont = canvasStyle.getPropertyValue("--font-sans").trim();
    const canvasMono = canvasStyle.getPropertyValue("--font-mono").trim();
    context.textAlign = "center";
    context.textBaseline = "middle";
    for (const route of FORMATION_ROUTES) {
      const count = routeCounts.get(route.id) ?? 0;
      const radius = Math.min(25, 9 + Math.sqrt(count) * 0.5);
      context.beginPath();
      context.arc(route.x * cssWidth, route.y * cssHeight, radius, 0, Math.PI * 2);
      context.fillStyle = "#ffffff";
      context.fill();
      context.strokeStyle = route.color;
      context.lineWidth = count > 0 ? 3 : 1.5;
      context.stroke();
      context.fillStyle = "#101b24";
      context.font = `700 11px ${canvasFont}`;
      context.fillText(route.label, route.x * cssWidth, route.y * cssHeight - radius - 10);
      context.fillStyle = "#5d6970";
      context.font = `10px ${canvasMono}`;
      context.fillText(String(count), route.x * cssWidth, route.y * cssHeight);
    }
  }

  function updateGraphFormationText() {
    const count = graphFormationRendered.length;
    graphFormationCount.textContent =
      count === 0
        ? "Waiting for the first conversation…"
        : count < graphFormationProcessed
          ? `${formatNumber(count)} of ${formatNumber(graphFormationProcessed)} stops drawn`
          : `${formatNumber(count)} conversations routed`;
    graphFormationLatest.textContent =
      graphFormationRendered.at(-1)?.title || "Opening the archive";
    const activeRoutes = new Set(
      graphFormationRendered.flatMap((conversation) => formationRouteIds(conversation))
    ).size;
    graphFormationRoutes.textContent = `${activeRoutes} of ${FORMATION_ROUTES.length}`;
  }

  function renderGraphFormationFrame() {
    graphFormationFrame = null;
    const remaining = graphFormationQueue.length - graphFormationCursor;
    if (remaining <= 0) return;
    const perFrame = reduceGraphFormationMotion.matches
      ? remaining
      : Math.max(1, Math.ceil(Math.max(graphFormationProcessed, remaining) / 240));
    const end = Math.min(graphFormationQueue.length, graphFormationCursor + perFrame);
    while (graphFormationCursor < end) {
      graphFormationRendered.push(graphFormationQueue[graphFormationCursor]);
      graphFormationCursor += 1;
    }
    updateGraphFormationText();
    drawGraphFormation();
    if (graphFormationCursor < graphFormationQueue.length) {
      graphFormationFrame = window.requestAnimationFrame(renderGraphFormationFrame);
    }
  }

  function queueGraphFormation(conversations: GraphFormationConversation[], processed: number) {
    graphFormationQueue.push(...conversations);
    graphFormationProcessed = Math.max(graphFormationProcessed, processed);
    if (reduceGraphFormationMotion.matches) {
      renderGraphFormationFrame();
      return;
    }
    if (graphFormationFrame === null) {
      graphFormationFrame = window.requestAnimationFrame(renderGraphFormationFrame);
    }
  }

  function finishGraphFormation() {
    if (graphFormationFrame !== null) window.cancelAnimationFrame(graphFormationFrame);
    graphFormationFrame = null;
    while (graphFormationCursor < graphFormationQueue.length) {
      graphFormationRendered.push(graphFormationQueue[graphFormationCursor]);
      graphFormationCursor += 1;
    }
    updateGraphFormationText();
    drawGraphFormation();
  }

  function mountGraphFormationInReport() {
    graphLoading.classList.add("has-formation");
    graphLoading.replaceChildren(graphFormation);
  }

  function resetGraphFormation() {
    if (graphFormationFrame !== null) window.cancelAnimationFrame(graphFormationFrame);
    graphFormationFrame = null;
    graphFormationQueue = [];
    graphFormationCursor = 0;
    graphFormationRendered = [];
    graphFormationProcessed = 0;
    graphLoading.classList.remove("has-formation");
    graphFormationProgressSlot.append(graphFormation);
    updateGraphFormationText();
    drawGraphFormation();
  }

  const graphFormationResizeObserver = new ResizeObserver(() => drawGraphFormation());
  graphFormationResizeObserver.observe(graphFormationCanvas);
  drawGraphFormation();

  function resetApp() {
    sessionVersion += 1;
    demoLoad?.abort();
    demoLoad = null;
    $("#retry-demo").hidden = true;
    storyController.close();
    unloadMemoryChatModel();
    clearGraphTraversal();
    resetWorker();
    void analysisLease.release();
    stopTimingTicker();
    latestTiming = null;
    analysisDetails.open = true;
    analysisDetailsAutoSettled = false;
    analysisDetailsSummary.textContent = "Semantic work is running · balanced evidence";
    resetGraphFormation();
    currentReport = null;
    semanticFailure = null;
    currentSnapshot = null;
    currentSnapshotSaved = false;
    saveButton.textContent = "Keep on this device";
    archiveInput.value = "";
    searchResults.hidden = true;
    setEvidenceVisible(false);
    document.body.classList.remove("has-evidence");
    appShell.inert = false;
    evidenceReturnFocus = null;
    showOnly(importView);
  }

  function openEvidencePanel() {
    evidenceReturnFocus =
      document.activeElement instanceof HTMLElement || document.activeElement instanceof SVGElement
        ? document.activeElement
        : null;
    setEvidenceVisible(true);
    document.body.classList.add("has-evidence");
    appShell.inert = true;
    $<HTMLButtonElement>("#close-evidence").focus();
  }

  function closeEvidencePanel(restoreFocus = true) {
    if (evidencePanel.hidden) return;
    setEvidenceVisible(false);
    document.body.classList.remove("has-evidence");
    appShell.inert = false;
    if (restoreFocus && storyController.resumeFromEvidence()) {
      evidenceReturnFocus = null;
      return;
    }
    if (restoreFocus && evidenceReturnFocus?.isConnected) evidenceReturnFocus.focus();
    evidenceReturnFocus = null;
  }

  function setEvidenceVisible(visible: boolean) {
    evidencePanel.hidden = !visible;
    evidencePanel.inert = !visible;
    evidencePanel.setAttribute("aria-hidden", String(!visible));
  }

  async function analyzeFile(file: File) {
    evolutionKind = "topics";
    $("#retry-demo").hidden = true;
    sessionVersion += 1;
    const session = sessionVersion;
    demoLoad?.abort();
    demoLoad = null;
    if (!file.name.toLocaleLowerCase().endsWith(".zip")) {
      showError("Choose the original .zip file from your ChatGPT data export.");
      return;
    }
    if (!(await analysisLease.acquire())) {
      archiveInput.value = "";
      showError(
        "Memory Map is already analyzing or retaining a searchable model in another tab. Close or reset that tab, then try again."
      );
      return;
    }
    if (session !== sessionVersion) return;
    measurementTrace.startAttempt(performance.now());
    renderLocalMeasurementTrace();
    currentReport = null;
    semanticFailure = null;
    currentSnapshot = null;
    currentSnapshotSaved = false;
    analysisDetails.open = true;
    analysisDetailsAutoSettled = false;
    latestTiming = null;
    resetGraphFormation();
    progressFill.style.transform = "scaleX(0.02)";
    progressPhase.textContent = "Reading archive";
    progressStatus.textContent = `Opening ${file.name}…`;
    progressElapsed.textContent = "Under 1 sec";
    progressRemaining.textContent = "Estimating…";
    progressRuntime.textContent = "Selecting…";
    renderStageTimings([], "discover", 0);
    analysisTimingBoard.hidden = true;
    startTimingTicker();
    showOnly(progressView);
    send({ type: "analyze", file, settings: readAnalysisSettings() });
  }

  function showError(message: string, keepReport = false) {
    stopTimingTicker();
    errorMessage.textContent = message;
    appStatus.textContent = message;
    if (!keepReport) showOnly(errorView);
    else errorView.hidden = false;
  }

  function renderDemoProgress(progress: DemoProgress) {
    if (progress.phase === "prepare") {
      demoProgressStatus.textContent = "Drawing the activity and question routes…";
      demoProgressBar.removeAttribute("value");
    } else {
      demoProgressStatus.textContent = "Downloading the privacy-safe demo…";
      if (progress.total && progress.total > 0) {
        demoProgressBar.max = progress.total;
        demoProgressBar.value = progress.loaded;
      } else {
        demoProgressBar.removeAttribute("value");
      }
    }
    const kilobytes = (bytes: number) => `${formatNumber(Math.round(bytes / 1024))} KB`;
    demoProgressBytes.textContent = progress.total
      ? `${kilobytes(progress.loaded)} of ${kilobytes(progress.total)}`
      : `${kilobytes(progress.loaded)} received`;
  }

  async function openDemo() {
    if (!services.loadDemo) return;
    resetApp();
    const session = sessionVersion;
    const controller = new AbortController();
    demoLoad = controller;
    demoProgressBar.removeAttribute("value");
    demoProgressStatus.textContent = "Connecting to the public demo…";
    demoProgressBytes.textContent = "Waiting for the download";
    showOnly(demoProgressView);
    try {
      const report = await services.loadDemo({
        signal: controller.signal,
        onProgress: (progress) => {
          if (session === sessionVersion && !controller.signal.aborted)
            renderDemoProgress(progress);
        },
      });
      if (session !== sessionVersion || controller.signal.aborted) return;
      if (report.demo?.privacy !== "aggregate-only" || report.semantic !== null) {
        throw new Error("The demo could not be opened safely. Please try again.");
      }
      currentReport = report;
      currentSnapshot = null;
      currentSnapshotSaved = false;
      evolutionKind = "domains";
      renderReport(report);
      showOnly(reportView);
      appStatus.textContent =
        "The privacy-safe demo is ready. Your own archive has not been changed.";
    } catch (error) {
      if (session !== sessionVersion || controller.signal.aborted) return;
      showError(
        error instanceof Error ? error.message : "The demo could not load. Please try again."
      );
      $("#retry-demo").hidden = false;
    } finally {
      if (demoLoad === controller) demoLoad = null;
    }
  }

  function sourceBackedInsightCount(report: FullReport): number {
    const semantic = report.semantic;
    if (!semantic) return 0;
    return (
      semantic.topics.filter((topic) => topic.sources.length > 0).length +
      semantic.facts.filter((fact) => fact.sources.length > 0).length +
      semantic.repeats.filter((repeat) => repeat.sources.length > 0).length
    );
  }

  function renderLocalMeasurementTrace() {
    const trace = measurementTrace.export();
    localTraceSection.hidden = !measurementTrace.hasEvents();
    const failure = [...trace.events].reverse().find((event) => event.milestone === "failure");
    const recovered = trace.events.some(
      (event) => event.milestone === "recovery" && event.attempt > (failure?.attempt ?? Infinity)
    );
    const stageDurations = Object.entries(trace.maxObservedStageDurationsMs)
      .map(([stage, duration]) => `${stage}: ${duration} ms`)
      .join(" · ");
    const failureStatus = failure
      ? ` · ${failure.stage?.replaceAll("_", " ") ?? "worker"} failure ${recovered ? "recovered" : "needs recovery"}`
      : "";
    localTraceSummary.textContent = `This tab only · ${trace.events.length} milestones${failureStatus}${stageDurations ? ` · max observed stage duration: ${stageDurations}` : ""}. Archive contents and derived text stay out of this trace.`;
  }

  function downloadLocalMeasurementTrace() {
    const content = JSON.stringify(measurementTrace.export(), null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "memory-map-local-measurement-trace.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function onWorkerMessage(event: MessageEvent<WorkerResponse>) {
    const message = event.data;
    if (message.type === "progress") {
      const percent =
        message.total > 0 ? Math.min(100, (message.current / message.total) * 100) : 4;
      const phaseLabels: Record<AnalysisPhase, string> = {
        discover: "Opening archive",
        parse: "Reading conversations",
        statistics: "Building initial insights",
        model: "Preparing the model",
        embed: "Mapping semantic memory",
        cluster: "Assembling your report",
      };
      progressPhase.textContent = phaseLabels[message.phase];
      progressStatus.textContent = message.label;
      progressFill.style.transform = `scaleX(${Math.max(4, percent) / 100})`;
      appStatus.textContent = `${message.label} ${Math.round(percent)}%`;
      if (message.timing) {
        measurementTrace.observeStages(message.timing.completedStages);
        latestTiming = {
          phase: message.phase,
          label: message.label,
          current: message.current,
          total: message.total,
          timing: message.timing,
          receivedAt: performance.now(),
        };
        renderLiveTiming(
          message.phase,
          message.label,
          message.current,
          message.total,
          message.timing
        );
      }
      if (
        currentReport &&
        !currentReport.semantic &&
        ["model", "embed", "cluster"].includes(message.phase)
      ) {
        const timingNote = message.timing
          ? ` · ${formatDuration(message.timing.totalElapsedMs)} elapsed${
              message.timing.estimatedRemainingMs === null
                ? ""
                : ` · about ${formatDuration(message.timing.estimatedRemainingMs)} left`
            }`
          : "";
        $("#sampling-note").textContent =
          `${message.label} · ${Math.round(percent)}%${timingNote}. Deterministic insights remain available while this finishes.`;
      }
      return;
    }
    if (message.type === "graph-formation") {
      queueGraphFormation(message.conversations, message.processed);
      return;
    }
    if (message.type === "deterministic") {
      measurementTrace.importCompleted(performance.now());
      renderLocalMeasurementTrace();
      currentReport = message.report;
      setConfidence(message.report.analysis.confidence, false);
      renderReport(message.report);
      showOnly(reportView);
      if (latestTiming) {
        renderLiveTiming(
          latestTiming.phase,
          latestTiming.label,
          latestTiming.current,
          latestTiming.total,
          latestTiming.timing
        );
      }
      appStatus.textContent = "Initial statistics are ready. Semantic analysis is still running.";
      return;
    }
    if (message.type === "complete") {
      measurementTrace.importCompleted(performance.now());
      measurementTrace.observeStages(message.report.performance?.stages ?? []);
      measurementTrace.firstEvidenceBackedInsight(
        performance.now(),
        sourceBackedInsightCount(message.report)
      );
      renderLocalMeasurementTrace();
      finishGraphFormation();
      currentReport = message.report;
      currentSnapshot = message.snapshot;
      currentSnapshotSaved = false;
      setConfidence(message.report.analysis.confidence, false);
      renderReport(message.report);
      stopTimingTicker();
      latestTiming = null;
      appStatus.textContent = "Your semantic memory map is ready.";
      return;
    }
    if (message.type === "restored") {
      currentSnapshotSaved = true;
      resetGraphFormation();
      currentReport = message.report;
      setConfidence(message.report.analysis.confidence, false);
      renderReport(message.report);
      renderPerformanceSummary(message.report.performance, true);
      stopTimingTicker();
      latestTiming = null;
      forgetButton.hidden = false;
      saveButton.textContent = "Saved on this device";
      saveButton.disabled = true;
      showOnly(reportView);
      return;
    }
    if (message.type === "search-results") {
      if (pendingMemoryQuestion && message.query === pendingMemoryQuestion) {
        handleMemoryChatSearch(message.results);
        return;
      }
      renderSearchResults(message.results);
      return;
    }
    const failedPhase = latestTiming?.phase ?? null;
    resetWorker();
    void analysisLease.release();
    measurementTrace.failed(performance.now(), failedPhase);
    renderLocalMeasurementTrace();
    if (graphFormationFrame !== null) window.cancelAnimationFrame(graphFormationFrame);
    graphFormationFrame = null;
    if (message.recoverable && currentReport && !currentReport.semantic) {
      semanticFailure = message.message;
      latestTiming = null;
      renderReport(currentReport);
    }
    showError(message.message, message.recoverable && Boolean(currentReport));
  }

  function renderReport(report: FullReport) {
    const deterministic = report.deterministic;
    const demo = Boolean(report.demo);
    appShell.classList.toggle("is-demo", demo);
    $("#memory-search").hidden = demo;
    const graphHeading = $("#topic-map .section-heading");
    graphHeading.querySelector(".map-key")!.textContent = demo
      ? "Question routes, connected"
      : "Things connected by meaning";
    graphHeading.querySelector(":scope > p")!.textContent = demo
      ? "Station size shows matching conversations. Routes show the strongest domain overlaps."
      : "Station size shows conversation count. Routes show semantic proximity.";
    graph.setAttribute(
      "aria-label",
      demo ? "Interactive question-domain co-occurrence map" : "Interactive semantic topic map"
    );
    $("#demo-notice").hidden = !demo;
    analysisDetails.hidden = demo;
    saveButton.hidden = demo;
    forgetButton.hidden = demo || !currentSnapshotSaved;
    storyButton.hidden = demo;
    for (const id of [
      "memory-chat",
      "memory-ledger",
      "repeated-questions",
      "reflection-questions",
    ]) {
      $("#" + id).hidden = demo;
      const link = reportNav.querySelector<HTMLAnchorElement>(`a[href="#${id}"]`);
      if (link) link.hidden = demo;
    }
    for (const selector of [
      ".repeat-landscape-figure",
      ".atlas-key-semantic",
      ".atlas-key-action",
    ]) {
      const mark = document.querySelector<HTMLElement>(selector);
      if (mark) (mark.closest("figure") ?? mark.parentElement ?? mark).hidden = demo;
    }
    $("#question-lenses .lens-detail-grid").hidden = demo;
    $(".memory-change-board").hidden = demo;
    $("#question-lenses .section-heading > p").textContent = demo
      ? "Queries may appear in more than one domain. Open a result for aggregate counts and the matching method."
      : "Queries may appear in more than one domain. Open any result to inspect its supporting conversations.";
    $("#visual-atlas .atlas-heading .map-key").textContent = demo
      ? "Six views of the public atlas"
      : "Seven ways to see the archive";
    let viewNumber = 0;
    for (const figure of document.querySelectorAll<HTMLElement>(
      ".visual-atlas-grid > .atlas-figure"
    )) {
      if (figure.hidden) continue;
      viewNumber += 1;
      const number = figure.querySelector("figcaption b");
      if (number) number.textContent = String(viewNumber).padStart(2, "0");
    }
    $("#local-methodology").hidden = demo;
    $("#demo-methodology").hidden = !demo;
    searchInput.disabled = !report.semantic;
    $("#memory-search").querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled =
      !report.semantic;
    const model = report.semantic?.model;
    if (!memoryChatReady) {
      enableMemoryChatButton.disabled = !report.semantic;
      enableMemoryChatButton.textContent = report.semantic
        ? `Load local chat · ≈${MEMORY_CHAT_MODEL.approximateDownloadMb} MB`
        : "Available when the map is complete";
    }
    $("#model-profile-note").textContent = model
      ? `${report.analysis.modelProfile === "auto" ? "Automatic" : "Selected"} → ${model.resolvedProfile}. ${model.id}@${model.revision.slice(0, 8)} · ≈${model.approximateDownloadMb} MB. ${model.profileReason}`
      : `${report.analysis.modelProfile === "auto" ? `Automatic → ${report.analysis.resolvedModelProfile}.` : `${report.analysis.modelProfile} profile selected.`} ${report.analysis.profileReason}`;
    $("#report-meta").textContent =
      `${report.fileName} · ${formatDate(deterministic.dateRange.start)} to ${formatDate(
        deterministic.dateRange.end
      )} · analyzed ${new Date(report.generatedAt).toLocaleString()}`;
    renderPerformanceSummary(report.performance);

    const stats = [
      ["Conversations", deterministic.totals.conversations],
      ["Messages", deterministic.totals.messages],
      ["Your prompts", deterministic.totals.userPrompts],
      ["Approx. words", deterministic.totals.words],
      ["Active days", deterministic.totals.activeDays],
      ["Longest streak", deterministic.totals.longestStreak],
    ] as const;
    const statsList = $("#overview-stats");
    statsList.replaceChildren(
      ...stats.map(([label, value]) => {
        const wrapper = createUiSurface("div", "gap-2 p-4");
        wrapper.append(text("dt", label), text("dd", formatNumber(value)));
        return wrapper;
      })
    );

    const visibleMonths = activityMonthWindow(deterministic, activePeriodMonths);
    $("#date-range").textContent =
      activePeriodMonths === null
        ? `All history · ${formatDate(deterministic.dateRange.start)} — ${formatDate(
            deterministic.dateRange.end
          )}`
        : `${formatNumber(activePeriodMonths)} months · ${formatMonth(
            visibleMonths[0]
          )} — ${formatMonth(visibleMonths.at(-1) ?? visibleMonths[0])}`;
    const periodLabel =
      activePeriodMonths === null
        ? "All available history."
        : `Recent ${activePeriodMonths} months.`;
    $("#tone-method").textContent = `${deterministic.tone.method} ${periodLabel}`;
    $("#emotion-method").textContent = `${deterministic.emotions.method} ${periodLabel}`;
    if (!deterministic.activityRhythms?.length) {
      activeRhythmMeasure = "conversations";
      activeRhythmRouteId = "all";
    }
    renderTone(report);
    renderEfficiency(report);
    renderReflections(report);
    renderVisualAtlas(report, {
      clearsConfidence,
      showEvidence,
      periodMonths: activePeriodMonths,
      rhythmMeasure: activeRhythmMeasure,
      rhythmRouteId: activeRhythmRouteId,
    });
    renderRepeats(report);
    renderQuestionLenses(report);
    renderEvolution(report);
    renderConfidenceImpact(report);

    if (report.semantic) {
      saveButton.disabled = currentSnapshotSaved;
      saveButton.textContent = currentSnapshotSaved
        ? "Saved on this device"
        : "Keep on this device";
      const model = report.semantic.model;
      $("#sampling-note").textContent =
        `Embedded ${formatNumber(model.embeddedConversations)} of ${formatNumber(
          model.totalConversations
        )} conversations, ${formatNumber(model.embeddedQuestions)} of ${formatNumber(
          model.totalQuestions
        )} prompts, and ${formatNumber(model.embeddedFacts)} of ${formatNumber(
          model.totalFacts
        )} fact candidates, and ${formatNumber(model.embeddedThreadPrompts)} of ${formatNumber(
          model.totalThreadPrompts
        )} candidate thread prompts.`;
      renderGraph(report.semantic.topics, report.semantic.edges);
      renderLedger(report);
    } else if (report.demo) {
      saveButton.disabled = true;
      $("#sampling-note").textContent =
        "Real aggregate activity. Private text and source evidence are omitted from this public demo.";
      renderGraph(report.demo.topics, report.demo.edges);
    } else {
      saveButton.disabled = true;
      $("#sampling-note").textContent = semanticFailure
        ? "Semantic analysis stopped. Initial statistics remain available; search, saved memory, and local chat require a completed map. Choose another ZIP to retry."
        : "Full totals are ready. Embeddings are still being built.";
      if (semanticFailure) {
        analysisTimingBoard.hidden = true;
        analysisDetailsSummary.textContent = "Initial statistics only · semantic analysis stopped";
      }
      graphLoading.hidden = Boolean(semanticFailure);
      mountGraphFormationInReport();
      graph.classList.add("is-hidden");
    }
    for (const surface of document.querySelectorAll(".atlas-figure, #rhythm-chart")) {
      motion.enter(surface, { offset: 0, feedback: true });
    }
  }

  function renderGraph(
    topics: NonNullable<FullReport["semantic"]>["topics"],
    edges: NonNullable<FullReport["semantic"]>["edges"]
  ) {
    graphLoading.hidden = true;
    graph.classList.remove("is-hidden");
    graph.setAttribute("viewBox", "0 0 1000 680");
    graph.replaceChildren();

    const definitions = svgElement("defs");
    const pattern = svgElement("pattern");
    pattern.id = "atlas-map-grid";
    pattern.setAttribute("width", "24");
    pattern.setAttribute("height", "24");
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    const gridPoint = svgElement("circle");
    gridPoint.setAttribute("cx", "1");
    gridPoint.setAttribute("cy", "1");
    gridPoint.setAttribute("r", "0.8");
    gridPoint.setAttribute("fill", "#cbd2d0");
    pattern.append(gridPoint);
    definitions.append(pattern);
    const field = svgElement("rect");
    field.setAttribute("width", "1000");
    field.setAttribute("height", "680");
    field.setAttribute("fill", "url(#atlas-map-grid)");
    field.setAttribute("aria-hidden", "true");
    graph.append(definitions, field);

    const orderedTopics = [...topics].sort((left, right) => right.count - left.count);
    const displayPositions = new Map<string, { x: number; y: number }>();
    orderedTopics.forEach((topic, index) => {
      if (index === 0) {
        displayPositions.set(topic.id, { x: 0.5, y: 0.48 });
        return;
      }
      const outerCount = Math.max(1, orderedTopics.length - 1);
      const angle = -Math.PI / 2 + ((index - 1) * Math.PI * 2) / outerCount;
      displayPositions.set(topic.id, {
        x: 0.5 + Math.cos(angle) * 0.36,
        y: 0.52 + Math.sin(angle) * 0.36,
      });
    });
    const displayTopics = topics.map((topic) => ({
      ...topic,
      ...(displayPositions.get(topic.id) ?? { x: topic.x, y: topic.y }),
    }));
    const topicMap = new Map(displayTopics.map((topic) => [topic.id, topic]));
    const strongestEdges = [...edges].sort((a, b) => b.similarity - a.similarity);
    const visibleEdges = new Set(strongestEdges.slice(0, Math.max(topics.length * 2, 12)));
    for (const topic of topics) {
      const strongest = strongestEdges.find(
        (edge) => edge.source === topic.id || edge.target === topic.id
      );
      if (strongest) visibleEdges.add(strongest);
    }
    for (const edge of visibleEdges) {
      const source = topicMap.get(edge.source);
      const target = topicMap.get(edge.target);
      if (!source || !target) continue;
      const path = svgElement("path");
      const sourceX = source.x * 1_000;
      const sourceY = source.y * 620;
      const targetX = target.x * 1_000;
      const targetY = target.y * 620;
      const bendX = (sourceX + targetX) / 2;
      const bendY = (sourceY + targetY) / 2 - Math.min(45, Math.abs(targetX - sourceX) * 0.08);
      path.setAttribute("d", `M ${sourceX} ${sourceY} Q ${bendX} ${bendY} ${targetX} ${targetY}`);
      path.setAttribute("class", "graph-edge");
      path.setAttribute("data-source", edge.source);
      path.setAttribute("data-target", edge.target);
      path.style.stroke = source.color;
      path.dataset.baseWidth = String(1.5 + edge.similarity * 3);
      path.style.strokeWidth = path.dataset.baseWidth;
      path.dataset.opacity = String(Math.max(0.2, Math.min(0.7, edge.similarity)));
      path.style.opacity = path.dataset.opacity;
      const edgeTitle = svgElement("title");
      edgeTitle.textContent = `${source.label} ↔ ${target.label} · ${formatPercent(edge.similarity)} ${currentReport?.demo ? "overlap strength" : "semantic similarity"}`;
      path.append(edgeTitle);
      graph.append(path);
    }

    const peakTopicCount = Math.max(1, ...displayTopics.map((topic) => topic.count));
    for (const topic of displayTopics) {
      const visibleLabel = truncate(topic.label.split(" · ")[0], 22);
      const formattedCount = formatNumber(topic.count);
      const group = svgElement("g");
      group.setAttribute("class", "graph-node");
      group.setAttribute("data-id", topic.id);
      group.setAttribute("data-x", String(topic.x * 1_000));
      group.setAttribute("data-y", String(topic.y * 620));
      group.setAttribute("tabindex", "0");
      group.setAttribute("role", "button");
      group.setAttribute(
        "aria-label",
        `${visibleLabel} ${formattedCount} conversations. ${topic.label !== visibleLabel ? `${topic.label}. ` : ""}${currentReport?.demo ? "Show aggregate details." : "Show supporting conversations."}`
      );
      group.setAttribute("aria-description", topic.label);
      group.setAttribute("transform", `translate(${topic.x * 1_000} ${topic.y * 620})`);

      const radius = 30 + 34 * Math.sqrt(topic.count / peakTopicCount);
      const halo = svgElement("circle");
      halo.setAttribute("r", String(radius + 8));
      halo.setAttribute("class", "graph-node-halo");
      halo.style.stroke = topic.color;
      const circle = svgElement("circle");
      circle.setAttribute("r", String(radius));
      circle.style.stroke = topic.color;

      const label = svgElement("text");
      const name = svgElement("tspan");
      name.setAttribute("x", "0");
      name.setAttribute("y", String(-radius - 16));
      name.textContent = visibleLabel;

      const count = svgElement("tspan");
      count.setAttribute("class", "graph-count");
      count.setAttribute("x", "0");
      count.setAttribute("y", "6");
      count.textContent = formattedCount;
      label.append(name, document.createTextNode(" "), count);
      group.append(halo, circle, label);
      const activate = () => selectTopic(topic);
      group.addEventListener("click", activate);
      group.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      });
      graph.append(group);
    }

    const topicList = $("#topic-list");
    topicList.replaceChildren(
      ...displayTopics
        .slice()
        .sort((left, right) => right.count - left.count)
        .map((topic) => {
          const button = atlasElement(
            "button",
            undefined,
            "flex min-h-12 items-center justify-between gap-4"
          );
          button.type = "button";
          const marker = document.createElement("i");
          marker.style.color = topic.color;
          button.append(
            marker,
            text("span", topic.label),
            text("small", formatNumber(topic.count))
          );
          button.addEventListener("click", () => selectTopic(topic));
          return button;
        })
    );
  }

  function selectTopic(topic: TopicNode) {
    for (const node of graph.querySelectorAll(".graph-node")) {
      node.classList.toggle("is-selected", node.getAttribute("data-id") === topic.id);
    }
    for (const edge of graph.querySelectorAll<SVGPathElement>(".graph-edge")) {
      const connected =
        edge.getAttribute("data-source") === topic.id ||
        edge.getAttribute("data-target") === topic.id;
      edge.style.opacity = connected ? "1" : "0.16";
      const baseWidth = Number(edge.dataset.baseWidth ?? "2");
      edge.style.strokeWidth = String(connected ? baseWidth + 2 : baseWidth);
    }
    showEvidence(topic.label, topic.sources, [
      `${formatNumber(topic.count)} conversations`,
      topic.terms.length ? `Distinctive terms: ${topic.terms.join(", ")}` : "",
    ]);
  }

  const MEMORY_CHAT_STAGES = ["query", "search", "topics", "evidence", "answer"] as const;

  function setMemoryChatStage(active: (typeof MEMORY_CHAT_STAGES)[number] | null) {
    const activeIndex =
      active === null ? MEMORY_CHAT_STAGES.length : MEMORY_CHAT_STAGES.indexOf(active);
    for (const item of document.querySelectorAll<HTMLElement>("[data-chat-stage]")) {
      const index = MEMORY_CHAT_STAGES.indexOf(
        item.dataset.chatStage as (typeof MEMORY_CHAT_STAGES)[number]
      );
      item.classList.toggle("is-complete", index < activeIndex);
      item.classList.toggle("is-active", index === activeIndex);
    }
  }

  function clearGraphTraversal() {
    graph.querySelector(".graph-query-route")?.remove();
    for (const node of graph.querySelectorAll(".graph-node")) {
      node.classList.remove("is-traversed");
    }
    for (const edge of graph.querySelectorAll<SVGPathElement>(".graph-edge")) {
      edge.style.opacity = edge.dataset.opacity ?? "";
      edge.style.strokeWidth = edge.dataset.baseWidth ?? "2";
    }
  }

  function renderGraphTraversal(question: string, evidence: MemoryChatEvidence[]) {
    clearGraphTraversal();
    const topicIds = [
      ...new Set(evidence.map((item) => item.topicId).filter((id): id is string => Boolean(id))),
    ].slice(0, 4);
    if (topicIds.length === 0) return;

    const route = svgElement("g");
    route.setAttribute("class", "graph-query-route");
    route.setAttribute("aria-hidden", "true");
    for (const [index, topicId] of topicIds.entries()) {
      const node = graph.querySelector<SVGGElement>(
        `.graph-node[data-id="${CSS.escape(topicId)}"]`
      );
      if (!node) continue;
      node.classList.add("is-traversed");
      node.style.animationDelay = `${index * 120}ms`;
      const x = Number(node.dataset.x);
      const y = Number(node.dataset.y);
      const path = svgElement("path");
      const bendX = 500 + (x - 500) * 0.35;
      const bendY = Math.max(74, y * 0.48);
      path.setAttribute("d", `M 500 50 Q ${bendX} ${bendY} ${x} ${y}`);
      path.style.animationDelay = `${index * 120}ms`;
      route.append(path);
    }
    const queryCircle = svgElement("circle");
    queryCircle.setAttribute("cx", "500");
    queryCircle.setAttribute("cy", "28");
    queryCircle.setAttribute("r", "32");
    const queryLabel = svgElement("text");
    queryLabel.setAttribute("x", "500");
    queryLabel.setAttribute("y", "33");
    queryLabel.textContent = "QUERY";
    const title = svgElement("title");
    title.textContent = `Traversal for: ${question}`;
    route.append(queryCircle, queryLabel, title);
    const firstNode = graph.querySelector(".graph-node");
    graph.insertBefore(route, firstNode);

    const traversed = new Set(topicIds);
    for (const edge of graph.querySelectorAll<SVGPathElement>(".graph-edge")) {
      const connected =
        traversed.has(edge.dataset.source ?? "") || traversed.has(edge.dataset.target ?? "");
      edge.style.opacity = connected ? "0.9" : "0.1";
      const baseWidth = Number(edge.dataset.baseWidth ?? "2");
      edge.style.strokeWidth = String(connected ? baseWidth + 2 : baseWidth);
    }
  }

  function appendMemoryChatMessage(
    role: "user" | "assistant",
    content: string,
    detail?: string,
    assistantLabel = "Local model draft · unverified"
  ) {
    const message = document.createElement("article");
    message.className = `memory-chat-message ${role}`;
    message.append(text("span", role === "user" ? "You" : assistantLabel), text("p", content));
    if (detail) message.append(text("small", detail));
    memoryChatTranscript.append(message);
    memoryChatTranscript.scrollTop = memoryChatTranscript.scrollHeight;
  }

  function renderMemoryChatEvidence(evidence: MemoryChatEvidence[]) {
    if (evidence.length === 0) {
      memoryChatEvidence.replaceChildren(
        text("p", "No mapped evidence cleared the search floor.", "empty-note")
      );
      return;
    }
    memoryChatEvidence.replaceChildren(
      ...evidence.map((item) => {
        const button = atlasElement("button");
        button.type = "button";
        button.append(
          text("b", item.reference),
          text("span", item.title),
          text("small", `${Math.round(item.similarity * 100)}%`)
        );
        button.addEventListener("click", () =>
          showEvidence(item.title, item.source ? [item.source] : [], [
            item.excerpt,
            `${item.type} match · ${Math.round(item.similarity * 100)}% combined similarity`,
            item.topicId ? `Traversed through ${item.topicId}.` : "Evidence-only stop.",
          ])
        );
        return button;
      })
    );
  }

  function handleMemoryChatSearch(results: SearchResult[]) {
    if (!pendingMemoryQuestion || !memoryChatReady) return;
    const plannedResults = currentReport
      ? planMemoryChatResults(
          pendingMemoryQuestion,
          results,
          currentReport,
          currentSnapshot?.searchIndex
        )
      : results;
    pendingMemoryEvidence = buildMemoryChatEvidence(plannedResults);
    renderGraphTraversal(pendingMemoryQuestion, pendingMemoryEvidence);
    renderMemoryChatEvidence(pendingMemoryEvidence);
    const topicCount = new Set(pendingMemoryEvidence.map((item) => item.topicId).filter(Boolean))
      .size;
    const topicStage = $<HTMLElement>('[data-chat-stage="topics"] span');
    const graphTopicCount = Math.min(4, topicCount);
    topicStage.textContent =
      topicCount > 0
        ? topicCount > graphTopicCount
          ? `Traversed ${graphTopicCount} of ${topicCount} matched topic routes`
          : `Traversed ${graphTopicCount} topic route${graphTopicCount === 1 ? "" : "s"}`
        : "Evidence-only route";
    const evidenceStage = $<HTMLElement>('[data-chat-stage="evidence"] span');
    evidenceStage.textContent = `Packed ${pendingMemoryEvidence.length} cited evidence stop${
      pendingMemoryEvidence.length === 1 ? "" : "s"
    }`;
    setMemoryChatStage("answer");
    const historyBeforeQuestion = memoryChatHistory.slice(0, -1);
    sendMemoryChat({
      type: "generate",
      messages: buildMemoryChatMessages(
        pendingMemoryQuestion,
        pendingMemoryEvidence,
        historyBeforeQuestion
      ),
    });
  }

  function onMemoryChatWorkerMessage(event: MessageEvent<MemoryChatWorkerResponse>) {
    const message = event.data;
    if (message.type === "progress") {
      const percent =
        message.total > 0 ? Math.max(0, Math.min(100, (message.current / message.total) * 100)) : 0;
      if (message.phase === "model") {
        memoryChatModelProgress.hidden = false;
        memoryChatModelProgress.value = percent;
        memoryChatModelStatus.textContent = `${message.label} · ${Math.round(percent)}%`;
      } else {
        memoryChatModelStatus.textContent = message.label;
      }
      return;
    }
    if (message.type === "ready") {
      memoryChatReady = true;
      enableMemoryChatButton.hidden = true;
      unloadMemoryChatButton.hidden = false;
      memoryChatModelProgress.hidden = true;
      memoryChatSession.hidden = false;
      memoryChatModelStatus.textContent = `Ready · ${memoryChatRuntimeLabel(message.runtime)} · model stays local`;
      memoryChatQuery.disabled = false;
      memoryChatForm.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled = false;
      memoryChatQuery.focus();
      return;
    }
    if (message.type === "answer") {
      const validation = validateMemoryChatCitations(message.answer, pendingMemoryEvidence);
      const displayedAnswer = validation.valid
        ? message.answer
        : buildMemoryChatFallback(pendingMemoryEvidence);
      appendMemoryChatMessage(
        "assistant",
        displayedAnswer,
        validation.valid
          ? `${memoryChatRuntimeLabel(message.runtime)} · ${formatDuration(message.elapsedMs)} · ${validation.citations.join(", ")} linked · answer accuracy has not been checked`
          : `${memoryChatRuntimeLabel(message.runtime)} · ${formatDuration(message.elapsedMs)} · ${validation.reason}`,
        validation.valid ? "Local model draft · unverified" : "Retrieved evidence"
      );
      memoryChatHistory.push({ role: "assistant", content: displayedAnswer });
      pendingMemoryQuestion = null;
      setMemoryChatStage(null);
      memoryChatModelStatus.textContent = `${validation.valid ? "Draft" : "Evidence"} ready in ${formatDuration(message.elapsedMs)}. The model remains loaded until you unload or reset it.`;
      memoryChatQuery.disabled = false;
      memoryChatForm.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled = false;
      memoryChatQuery.focus();
      return;
    }
    if (message.type === "disposed") {
      unloadMemoryChatModel();
      return;
    }
    memoryChatModelStatus.textContent = `Local synthesis failed: ${message.message}. The retrieved evidence is still available.`;
    if (!memoryChatSession.hidden || pendingMemoryQuestion) {
      appendMemoryChatMessage(
        "assistant",
        "I could not synthesize an answer locally. Review the retrieved evidence stops below.",
        undefined,
        "Local model status"
      );
    }
    pendingMemoryQuestion = null;
    unloadMemoryChatModel(false);
  }

  function memoryChatRuntimeLabel(runtime: MemoryChatRuntime): string {
    return `local WASM · ${runtime.dtype}`;
  }

  function unloadMemoryChatModel(clearSession = true) {
    memoryChatWorker?.terminate();
    memoryChatWorker = null;
    memoryChatReady = false;
    pendingMemoryQuestion = null;
    pendingMemoryEvidence = [];
    unloadMemoryChatButton.hidden = true;
    enableMemoryChatButton.hidden = false;
    enableMemoryChatButton.disabled = !currentReport?.semantic;
    enableMemoryChatButton.textContent = currentReport?.semantic
      ? `Load local chat · ≈${MEMORY_CHAT_MODEL.approximateDownloadMb} MB`
      : "Available when the map is complete";
    memoryChatModelProgress.hidden = true;
    memoryChatModelProgress.value = 0;
    memoryChatQuery.disabled = true;
    memoryChatForm.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled = true;
    if (clearSession) {
      memoryChatSession.hidden = true;
      memoryChatHistory = [];
      memoryChatEvidence.replaceChildren();
      clearGraphTraversal();
      memoryChatModelStatus.textContent = "The chat model has not been loaded.";
    }
  }

  function showEvidence(title: string, sources: SourceRef[], notes: string[] = []) {
    if (currentReport?.demo) {
      notes = [
        ...notes,
        "This public demo contains aggregate counts only. Conversation text, titles, personal facts and source links were removed before publication.",
      ];
      sources = [];
    }
    $("#evidence-heading").textContent = title;
    const fragments: HTMLElement[] = [];
    const visibleNotes = notes.filter(Boolean);
    if (visibleNotes.length > 0) {
      const summary = document.createElement("div");
      summary.className = "evidence-summary";
      summary.append(...visibleNotes.map((note) => text("p", note, "evidence-note")));
      fragments.push(summary);
    }
    const sourceList = document.createElement("ol");
    sourceList.className = "evidence-source-list";
    for (const source of sources) {
      const item = document.createElement("li");
      item.className = "evidence-source";
      item.append(text("strong", source.title), text("small", formatDate(source.date)));
      sourceList.append(item);
    }
    if (sourceList.childElementCount > 0) fragments.push(sourceList);
    evidenceContent.replaceChildren(...fragments);
    openEvidencePanel();
  }

  function renderLedger(report: FullReport) {
    const facts = report.semantic?.facts ?? [];
    const visibleFacts = facts.filter(
      (fact) => fact.status === "current" || clearsConfidence(fact.confidence)
    );
    for (const tab of document.querySelectorAll<HTMLButtonElement>("#ledger-tabs button")) {
      const status = tab.dataset.status as FactGroup["status"];
      tab.querySelector("span")!.textContent = formatNumber(
        visibleFacts.filter((fact) => fact.status === status).length
      );
      tab.setAttribute("aria-selected", String(status === ledgerStatus));
      tab.tabIndex = status === ledgerStatus ? 0 : -1;
    }

    const visible = visibleFacts.filter((fact) => fact.status === ledgerStatus);
    const list = $("#ledger-list");
    if (visible.length === 0) {
      list.replaceChildren(
        text(
          "p",
          `No ${ledgerStatus} fact candidates were detected in the semantic sample.`,
          "empty-note"
        )
      );
      return;
    }
    list.replaceChildren(
      ...visible.map((fact) => {
        const button = atlasElement("button");
        button.type = "button";
        button.classList.add(..."ledger-item".split(/\s+/).filter(Boolean));
        const label = text("span", fact.status, `status-label ${fact.status}`);
        const meta = document.createElement("span");
        meta.className = "ledger-meta";
        meta.append(
          label,
          text("span", formatDate(fact.lastSeen)),
          text("span", `${fact.history.length} source${fact.history.length === 1 ? "" : "s"}`)
        );
        button.append(
          text("strong", truncate(fact.statement, 320)),
          meta,
          fact.status === "current"
            ? document.createDocumentFragment()
            : text("small", `${formatPercent(fact.confidence)} evidence confidence`)
        );
        button.addEventListener("click", () => showFactEvidence(fact));
        return button;
      })
    );
  }

  function showFactEvidence(fact: FactGroup) {
    $("#evidence-heading").textContent = fact.statement;
    const history = document.createElement("div");
    history.className = "fact-history";
    history.append(
      text("p", fact.reason, "evidence-note"),
      text(
        "p",
        `${formatPercent(fact.confidence)} evidence confidence · ${formatPercent(
          fact.similarity
        )} semantic similarity · ${formatPercent(fact.lexicalSimilarity)} lexical overlap`,
        "evidence-note"
      )
    );
    for (const item of fact.history) {
      const paragraph = document.createElement("p");
      paragraph.append(
        text("strong", `${formatDate(item.date)} · ${item.cue}`),
        document.createElement("br"),
        document.createTextNode(item.text)
      );
      history.append(paragraph);
    }
    const sources = fact.sources.map((source) => {
      const item = document.createElement("li");
      item.className = "evidence-source";
      item.append(text("strong", source.title), text("small", formatDate(source.date)));
      return item;
    });
    const sourceList = document.createElement("ol");
    sourceList.className = "evidence-source-list";
    sourceList.append(...sources);
    evidenceContent.replaceChildren(history, sourceList);
    openEvidencePanel();
  }

  function renderRepeats(report: FullReport) {
    const exact = report.deterministic.exactRepeats;
    const semantic = (report.semantic?.repeats ?? []).filter((repeat) =>
      clearsConfidence(repeat.confidence)
    );
    const summary = $("#repeat-summary");
    summary.replaceChildren(
      text("span", `${formatNumber(exact.length)} exact groups`),
      text("span", `${formatNumber(semantic.length)} semantic groups`)
    );

    const rows = [
      ...exact.map((repeat) => ({
        id: repeat.id,
        question: repeat.representative,
        count: repeat.count,
        kind: "Exact wording",
        date: repeat.lastAsked,
        sources: repeat.sources,
        notes: [`First asked ${formatDate(repeat.firstAsked)}`, `Asked ${repeat.count} times`],
      })),
      ...semantic.map((repeat) => ({
        id: repeat.id,
        question: repeat.representative,
        count: repeat.count,
        kind: `Semantic · ${formatPercent(repeat.similarity)}`,
        date: Math.max(...repeat.sources.map((source) => source.date)),
        sources: repeat.sources,
        notes: [
          `${formatPercent(repeat.confidence)} evidence confidence`,
          ...repeat.questions.slice(0, 5),
        ],
      })),
    ]
      .sort((left, right) => right.count - left.count)
      .slice(0, 80);

    const list = $("#repeat-list");
    if (rows.length === 0) {
      list.replaceChildren(text("p", "No repeated question groups were detected.", "empty-note"));
      return;
    }
    list.replaceChildren(
      ...rows.map((row) => {
        const button = atlasElement("button");
        button.type = "button";
        button.classList.add(..."repeat-item".split(/\s+/).filter(Boolean));
        button.append(
          text("span", String(row.count), "interchange"),
          text("strong", truncate(row.question, 320), "repeat-question"),
          text("span", row.kind, "repeat-kind"),
          text("span", formatDate(row.date), "repeat-date")
        );
        button.addEventListener("click", () => showEvidence(row.question, row.sources, row.notes));
        return button;
      })
    );
  }

  function showThreadEvidence(
    segmentation: ThreadSegmentation,
    strands: ReturnType<typeof buildThreadStrands>
  ) {
    $("#evidence-heading").textContent = segmentation.title;
    const summary = text(
      "p",
      `${segmentation.analyzedPrompts} of ${segmentation.promptCount} prompts analyzed · ${strands.length} visible strands at ${activeConfidence}% confidence.`,
      "evidence-note"
    );
    const timeline = document.createElement("ol");
    timeline.className = "strand-timeline";
    for (const strand of strands) {
      const item = document.createElement("li");
      item.append(
        text("strong", strand.label),
        text("small", `${strand.promptCount} prompt${strand.promptCount === 1 ? "" : "s"}`),
        ...strand.snippets.map((snippet) => text("p", truncate(snippet, 220)))
      );
      timeline.append(item);
    }
    const boundaryNotes = segmentation.boundaries
      .filter((boundary) => clearsConfidence(boundary.confidence))
      .map(
        (boundary) =>
          `${formatPercent(boundary.confidence)} boundary confidence · ${formatPercent(
            boundary.semanticSimilarity
          )} semantic continuity`
      );
    evidenceContent.replaceChildren(
      summary,
      timeline,
      ...boundaryNotes.map((note) => text("p", note, "evidence-note"))
    );
    openEvidencePanel();
  }

  function renderQuestionLenses(report: FullReport) {
    const lenses = report.deterministic.lenses;
    $("#domain-lenses").replaceChildren(
      ...lenses.categories.map((lens) => {
        const button = atlasElement("button");
        button.type = "button";
        const header = document.createElement("span");
        header.append(text("strong", lens.label), text("output", formatNumber(lens.queryCount)));
        button.append(
          header,
          text("small", lens.description),
          text(
            "span",
            `${formatNumber(lens.conversationCount)} conversation${lens.conversationCount === 1 ? "" : "s"}`,
            "lens-conversation-count"
          )
        );
        button.addEventListener("click", () =>
          showEvidence(lens.label, lens.sources, [
            lens.description,
            `${formatNumber(lens.queryCount)} matching queries across ${formatNumber(lens.conversationCount)} conversations.`,
            "A query can match more than one lens.",
          ])
        );
        return button;
      })
    );

    const typo = lenses.typos;
    $("#typo-total").textContent = formatNumber(typo.totalSignals);
    $("#typo-method").textContent = typo.method;
    const typoList = $("#typo-list");
    if (typo.signals.length === 0) {
      typoList.replaceChildren(
        text("p", "No high-confidence typo signals matched the small local list.", "empty-note")
      );
    } else {
      typoList.replaceChildren(
        ...typo.signals.map((signal) => {
          const button = atlasElement("button");
          button.type = "button";
          button.append(
            text("strong", signal.token),
            text("span", `→ ${signal.suggestion}`),
            text("output", formatNumber(signal.count))
          );
          button.addEventListener("click", () =>
            showEvidence(`Likely typo: ${signal.token}`, signal.sources, [
              `Possible correction: ${signal.suggestion}`,
              `${formatNumber(signal.count)} matching quer${signal.count === 1 ? "y" : "ies"}.`,
              "This is a conservative spelling signal, not a writing-quality score.",
            ])
          );
          return button;
        })
      );
    }

    const threads = lenses.threads;
    const semanticThreads = (report.semantic?.threads ?? [])
      .map((segmentation) => ({
        segmentation,
        strands: buildThreadStrands(
          segmentation.prompts,
          segmentation.boundaries,
          confidenceThreshold(activeConfidence)
        ),
      }))
      .filter(({ strands }) => strands.length > 1);
    $("#thread-total").textContent = report.semantic
      ? `${formatNumber(semanticThreads.length)} / ${formatNumber(threads.eligibleConversations)}`
      : `${formatNumber(threads.likelyMultiThreaded)} / ${formatNumber(threads.eligibleConversations)}`;
    $("#thread-method").textContent = report.semantic
      ? "Likely candidates are refined with bounded adjacent-prompt embeddings. Raise confidence to merge weaker boundaries; short follow-ups stay with their surrounding strand."
      : threads.method;
    const threadList = $("#thread-list");
    if (report.semantic && semanticThreads.length > 0) {
      threadList.replaceChildren(
        ...semanticThreads.slice(0, 16).map(({ segmentation, strands }) => {
          const button = atlasElement("button");
          button.type = "button";
          button.append(
            text("strong", truncate(segmentation.title, 90)),
            text(
              "span",
              `${segmentation.promptCount} prompts · ${strands.length} visible strands · ${formatPercent(segmentation.confidence)} strongest boundary`
            )
          );
          button.addEventListener("click", () => showThreadEvidence(segmentation, strands));
          return button;
        })
      );
    } else if (report.semantic) {
      threadList.replaceChildren(
        text(
          "p",
          "No semantic strand boundaries clear the active confidence threshold.",
          "empty-note"
        )
      );
    } else if (threads.candidates.length === 0) {
      threadList.replaceChildren(
        text("p", "No conversations crossed the likely multi-thread threshold.", "empty-note")
      );
    } else {
      threadList.replaceChildren(
        ...threads.candidates.slice(0, 16).map((candidate) => {
          const button = atlasElement("button");
          button.type = "button";
          button.append(
            text("strong", truncate(candidate.title, 90)),
            text(
              "span",
              `${candidate.promptCount} prompts · ${candidate.shiftCount} likely changes · ≈${candidate.estimatedThreads} threads`
            )
          );
          button.addEventListener("click", () =>
            showEvidence(candidate.title, candidate.sources, [
              `${candidate.promptCount} prompts contained ${candidate.shiftCount} low-overlap adjacent changes.`,
              `Roughly ${candidate.estimatedThreads} threads by this heuristic.`,
              "Short follow-ups were ignored. A subject change is not necessarily a derailment.",
            ])
          );
          return button;
        })
      );
    }
  }

  const TREND_LABELS: Record<TrendState, string> = {
    emerging: "Emerging",
    fading: "Fading",
    resurfacing: "Resurfacing",
    steady: "Steady",
    insufficient: "Not enough history",
  };

  const EMOTION_LABELS: Record<EmotionBucket, string> = {
    curiosity: "Curiosity",
    frustration: "Frustration",
    urgency: "Urgency",
    uncertainty: "Uncertainty",
    excitement: "Excitement",
    appreciation: "Appreciation",
    neutral: "Neutral / direct",
  };

  type EvolutionRow = {
    id: string;
    label: string;
    trend: TrendState;
    momentum: number;
    periods: Array<{ label: string; value: number }>;
    sources: SourceRef[];
    note: string;
  };

  function evolutionRows(report: FullReport): EvolutionRow[] {
    const monthlyQueryTotals = new Map(
      report.deterministic.emotions.byMonth.map(({ month, counts }) => [
        month,
        Object.values(counts).reduce((sum, value) => sum + value, 0),
      ])
    );
    if (evolutionKind === "topics") {
      return (report.demo?.topics ?? report.semantic?.topics ?? []).map((topic) => ({
        id: topic.id,
        label: topic.label,
        trend: topic.trend,
        momentum: topic.momentum,
        periods: topic.activityByMonth,
        sources: topic.sources,
        note: report.demo
          ? `${topic.count} conversations match this question domain. Domains can overlap.`
          : `${topic.count} sampled conversations assigned to this topic.`,
      }));
    }
    if (evolutionKind === "domains") {
      return report.deterministic.lenses.categories.map((lens) => {
        const trend = classifyTrend(lens.byMonth, monthlyQueryTotals);
        return {
          id: lens.id,
          label: lens.label,
          trend: trend.trend,
          momentum: trend.momentum,
          periods: lens.byMonth,
          sources: lens.sources,
          note: `${lens.queryCount} matching queries; categories can overlap.`,
        };
      });
    }
    const emotions = report.deterministic.emotions;
    return (Object.keys(emotions.counts) as EmotionBucket[]).map((bucket) => {
      const periods = emotions.byMonth.map(({ month, counts }) => ({
        label: month,
        value: counts[bucket],
      }));
      const trend = classifyTrend(periods, monthlyQueryTotals);
      return {
        id: bucket,
        label: EMOTION_LABELS[bucket],
        trend: trend.trend,
        momentum: trend.momentum,
        periods,
        sources: emotions.sources[bucket],
        note: `${emotions.counts[bucket]} queries matched this dominant vocabulary signal.`,
      };
    });
  }

  function renderEvolution(report: FullReport) {
    for (const tab of document.querySelectorAll<HTMLButtonElement>("[data-evolution]")) {
      tab.setAttribute("aria-selected", String(tab.dataset.evolution === evolutionKind));
      tab.tabIndex = tab.dataset.evolution === evolutionKind ? 0 : -1;
    }
    const ordered = evolutionRows(report)
      .filter((row) => row.periods.some((period) => period.value > 0))
      .sort((left, right) => {
        const trendOrder: Record<TrendState, number> = {
          resurfacing: 0,
          emerging: 1,
          fading: 2,
          steady: 3,
          insufficient: 4,
        };
        return (
          trendOrder[left.trend] - trendOrder[right.trend] ||
          Math.abs(right.momentum) - Math.abs(left.momentum) ||
          right.periods.reduce((sum, period) => sum + period.value, 0) -
            left.periods.reduce((sum, period) => sum + period.value, 0)
        );
      })
      .slice(0, 12);
    const list = $("#evolution-list");
    if (ordered.length === 0) {
      list.replaceChildren(
        text(
          "p",
          evolutionKind === "topics"
            ? "Topic evolution appears after semantic analysis."
            : "Not enough chronological evidence was found.",
          "empty-note"
        )
      );
    } else {
      list.replaceChildren(
        ...ordered.map((row) => {
          const button = atlasElement("button");
          button.type = "button";
          button.classList.add(...`evolution-item ${row.trend}`.split(/\s+/).filter(Boolean));
          const heading = document.createElement("span");
          heading.append(
            text("strong", row.label),
            text("span", TREND_LABELS[row.trend], "trend-label")
          );
          const route = document.createElement("span");
          route.className = "evolution-route";
          const max = Math.max(1, ...row.periods.map((period) => period.value));
          for (const period of row.periods) {
            const stop = document.createElement("i");
            stop.style.setProperty("--level", String(period.value / max));
            stop.title = `${period.label}: ${period.value}`;
            route.append(stop);
          }
          button.append(
            heading,
            route,
            text(
              "small",
              `${row.periods[0]?.label ?? "Unknown"} → ${row.periods.at(-1)?.label ?? "Unknown"} · ${row.note}`
            )
          );
          button.addEventListener("click", () =>
            showEvidence(row.label, row.sources, [
              `${TREND_LABELS[row.trend]} by the disclosed local time-series rule.`,
              row.note,
              ...row.periods
                .filter((period) => period.value > 0)
                .slice(-8)
                .map((period) => `${period.label}: ${period.value}`),
            ])
          );
          return button;
        })
      );
    }

    const changes = (report.semantic?.facts ?? [])
      .filter((fact) => fact.status !== "current" && clearsConfidence(fact.confidence))
      .sort((left, right) => right.lastSeen - left.lastSeen);
    $("#memory-change-total").textContent = formatNumber(changes.length);
    const changeList = $("#memory-change-list");
    if (changes.length === 0) {
      changeList.replaceChildren(
        text("p", "No memory changes clear the active confidence threshold.", "empty-note")
      );
    } else {
      changeList.replaceChildren(
        ...changes.slice(0, 12).map((fact) => {
          const button = atlasElement("button");
          button.type = "button";
          button.classList.add(...`memory-change-item ${fact.status}`.split(/\s+/).filter(Boolean));
          button.append(
            text("span", fact.status === "contradicted" ? "possible contradiction" : fact.status),
            text("strong", truncate(fact.statement, 150)),
            text(
              "small",
              `${formatDate(fact.firstSeen)} → ${formatDate(fact.lastSeen)} · ${formatPercent(fact.confidence)} confidence`
            )
          );
          button.addEventListener("click", () => showFactEvidence(fact));
          return button;
        })
      );
    }
  }

  function renderConfidenceImpact(report: FullReport) {
    const semantic = report.semantic;
    if (!semantic) {
      $("#confidence-impact").textContent =
        "Deterministic totals are unchanged. Semantic candidates will appear as the model finishes.";
      return;
    }
    const repeats = semantic.repeats.filter((repeat) => clearsConfidence(repeat.confidence)).length;
    const changes = semantic.facts.filter(
      (fact) => fact.status !== "current" && clearsConfidence(fact.confidence)
    ).length;
    const boundaries = semantic.threads.reduce(
      (sum, thread) =>
        sum + thread.boundaries.filter((boundary) => clearsConfidence(boundary.confidence)).length,
      0
    );
    $("#confidence-impact").textContent =
      `${activeConfidence}% shows ${repeats} semantic repeat groups, ${changes} memory changes, and ${boundaries} strand boundaries. Deterministic totals do not change.`;
  }

  function formatTokens(value: number): string {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1000) return `${Math.round(value / 1000)}k`;
    return formatNumber(value);
  }

  function efficiencyStats(totals: EfficiencyReport["totals"]): Array<[string, string]> {
    return [
      ["Context re-read", formatTokens(totals.contextRead)],
      ["Model output", formatTokens(totals.output)],
      ["Turns", formatNumber(totals.turns)],
      ["Tool calls", formatNumber(totals.toolCalls)],
      ["Repeated calls", formatNumber(totals.repeatedCalls)],
      ["Failed calls", formatNumber(totals.failedCalls)],
    ];
  }

  function findingItem(found: EfficiencyReport["findings"][number]): HTMLLIElement {
    const item = document.createElement("li");
    item.className = `efficiency-finding severity-${found.severity}`;
    const head = document.createElement("div");
    head.className = "finding-head";
    head.append(text("span", found.severity, "finding-severity"), text("h4", found.issue));
    item.append(
      head,
      text("p", found.cause, "finding-cause"),
      text("p", found.action, "finding-action"),
      text("small", found.evidence, "finding-evidence")
    );
    return item;
  }

  function scalingBar(bucket: EfficiencyReport["scaling"][number], peak: number): HTMLDivElement {
    const row = document.createElement("div");
    row.className = "efficiency-bar";
    const share = peak === 0 ? 0 : Math.max(2, Math.round((bucket.tokensPerTurn / peak) * 100));
    const fill = document.createElement("i");
    fill.style.width = `${share}%`;
    const track = document.createElement("span");
    track.className = "efficiency-track";
    track.append(fill);
    row.append(
      text("strong", bucket.label),
      track,
      text("span", `${formatTokens(bucket.tokensPerTurn)} / turn`, "efficiency-value"),
      text("small", `${formatNumber(bucket.sessions)} sessions`)
    );
    return row;
  }

  function renderEfficiency(report: FullReport) {
    const efficiency = report.efficiency;
    const section = $("#efficiency");
    const route = $("#efficiency-route");
    if (!efficiency) {
      section.hidden = true;
      route.hidden = true;
      return;
    }
    section.hidden = false;
    route.hidden = false;

    const { totals } = efficiency;
    $("#efficiency-method").textContent =
      `Measured from the token and tool records your archive carries, across ${formatNumber(totals.sessions)} sessions. Context re-read is the volume of earlier turns each new turn pays to read again.`;

    $("#efficiency-stats").replaceChildren(
      ...efficiencyStats(totals).map(([label, value]) => {
        const wrapper = createUiSurface("div", "gap-2 p-4");
        wrapper.append(text("dt", label), text("dd", value));
        return wrapper;
      })
    );

    const findings = $("#efficiency-findings");
    if (efficiency.findings.length === 0) {
      findings.replaceChildren(
        text("p", "Nothing in this archive crossed a reporting threshold.", "empty-note")
      );
    } else {
      findings.replaceChildren(...efficiency.findings.map(findingItem));
    }

    const peak = Math.max(...efficiency.scaling.map((bucket) => bucket.tokensPerTurn), 0);
    $("#efficiency-scaling").replaceChildren(
      ...efficiency.scaling.map((bucket) => scalingBar(bucket, peak))
    );

    $("#efficiency-costliest").replaceChildren(
      ...efficiency.costliest.map((session) => {
        const item = document.createElement("li");
        item.append(
          text("strong", `${formatNumber(session.turns)} turns`),
          text("span", `${formatTokens(session.contextRead)} re-read`, "efficiency-value"),
          text("small", session.source)
        );
        return item;
      })
    );
  }

  function renderTone(report: FullReport) {
    const visibleMonths = new Set(activityMonthWindow(report.deterministic, activePeriodMonths));
    const counts =
      activePeriodMonths === null
        ? report.deterministic.tone.counts
        : report.deterministic.tone.byMonth
            .filter((datum) => visibleMonths.has(datum.month))
            .reduce(
              (totals, datum) => ({
                positive: totals.positive + datum.positive,
                neutral: totals.neutral + datum.neutral,
                negative: totals.negative + datum.negative,
              }),
              { positive: 0, neutral: 0, negative: 0 }
            );
    const total = counts.positive + counts.neutral + counts.negative;
    const labels = [
      ["positive", "Positive wording"],
      ["neutral", "Neutral / direct"],
      ["negative", "Negative wording"],
    ] as const;
    $("#tone-bars").replaceChildren(
      ...labels.map(([bucket, label]) => {
        const row = document.createElement("div");
        row.className = `tone-row ${bucket}`;
        const track = document.createElement("span");
        track.className = "tone-track";
        const fill = document.createElement("i");
        const proportion = total ? counts[bucket] / total : 0;
        fill.style.width = `${proportion * 100}%`;
        track.append(fill);
        const output = document.createElement("output");
        output.textContent = `${formatNumber(counts[bucket])} · ${formatPercent(proportion)}`;
        row.append(text("strong", label), track, output);
        return row;
      })
    );

    const emotionCounts =
      activePeriodMonths === null
        ? report.deterministic.emotions.counts
        : report.deterministic.emotions.byMonth
            .filter((datum) => visibleMonths.has(datum.month))
            .reduce(
              (totals, datum) => {
                for (const bucket of Object.keys(totals) as EmotionBucket[]) {
                  totals[bucket] += datum.counts[bucket];
                }
                return totals;
              },
              {
                curiosity: 0,
                frustration: 0,
                urgency: 0,
                uncertainty: 0,
                excitement: 0,
                appreciation: 0,
                neutral: 0,
              }
            );
    const emotionTotal = Object.values(emotionCounts).reduce((sum, value) => sum + value, 0);
    const emotionLabels = [
      ["curiosity", "Curiosity", "Questions seeking explanation, understanding, or discovery"],
      [
        "frustration",
        "Frustration",
        "Wording about errors, being stuck, failure, or something not working",
      ],
      ["urgency", "Urgency", "Time-pressure wording such as urgent, immediately, or deadline"],
      ["uncertainty", "Uncertainty", "Tentative wording such as unsure, maybe, or not sure"],
      ["excitement", "Excitement", "Enthusiastic wording such as excited, amazing, or can’t wait"],
      ["appreciation", "Appreciation", "Thanks, gratitude, and explicit appreciation"],
      ["neutral", "Neutral / direct", "No vocabulary cue from the disclosed groups"],
    ] as const;
    $("#emotion-bars").replaceChildren(
      ...emotionLabels.map(([bucket, label, description]) => {
        const button = atlasElement("button");
        button.type = "button";
        button.classList.add(...`emotion-row ${bucket}`.split(/\s+/).filter(Boolean));
        const marker = document.createElement("i");
        marker.setAttribute("aria-hidden", "true");
        const copy = document.createElement("span");
        copy.append(text("strong", label), text("small", description));
        const proportion = emotionTotal ? emotionCounts[bucket] / emotionTotal : 0;
        button.append(
          marker,
          copy,
          text("output", `${formatNumber(emotionCounts[bucket])} · ${formatPercent(proportion)}`)
        );
        button.addEventListener("click", () => {
          const sources = report.deterministic.emotions.sources[bucket].filter(
            (source) =>
              activePeriodMonths === null ||
              visibleMonths.has(new Date(source.date * 1_000).toISOString().slice(0, 7))
          );
          showEvidence(`${label} wording`, sources, [
            description,
            `${formatNumber(emotionCounts[bucket])} queries matched this dominant language signal in the selected period.`,
            "This is a vocabulary cue, not an inference about how you felt.",
          ]);
        });
        return button;
      })
    );
  }

  function renderReflections(report: FullReport) {
    const list = $("#reflection-list");
    const visibleReflections = report.reflections.filter((reflection) =>
      clearsConfidence(reflection.confidence)
    );
    if (visibleReflections.length === 0) {
      list.replaceChildren(
        text(
          "p",
          report.semantic
            ? "No evidence-backed reflection prompts crossed the current thresholds."
            : "Reflection prompts will appear as repeat and memory patterns become available.",
          "empty-note"
        )
      );
      return;
    }
    list.replaceChildren(
      ...visibleReflections.map((reflection, index) => {
        const button = atlasElement("button");
        button.type = "button";
        button.classList.add(...`reflection-card ${reflection.kind}`.split(/\s+/).filter(Boolean));
        button.append(
          text("span", String(index + 1).padStart(2, "0"), "reflection-index"),
          text("span", reflection.eyebrow, "reflection-eyebrow"),
          text("strong", reflection.question),
          text(
            "small",
            `${formatPercent(reflection.confidence)} confidence · ${reflection.reason} · Open ${reflection.sources.length} source${reflection.sources.length === 1 ? "" : "s"}`
          )
        );
        button.addEventListener("click", () =>
          showEvidence(reflection.eyebrow, reflection.sources, [
            reflection.question,
            reflection.reason,
          ])
        );
        return button;
      })
    );
  }

  function renderSearchResults(results: SearchResult[]) {
    searchResults.hidden = false;
    if (results.length === 0) {
      searchResults.replaceChildren(
        text("p", "No semantic results yet. Wait for the topic map to finish.", "empty-note")
      );
      return;
    }
    searchResults.replaceChildren(
      ...results.map((result) => {
        const button = atlasElement("button");
        button.type = "button";
        button.classList.add(..."search-result".split(/\s+/).filter(Boolean));
        const body = document.createElement("span");
        body.append(
          text("strong", truncate(result.title, 240)),
          text(
            "small",
            truncate(
              (result.repetitionCount ?? 1) > 1
                ? `${result.repetitionCount} matching entries · ${result.detail}`
                : result.detail,
              140
            )
          )
        );
        button.append(
          text("span", result.type, "search-result-type"),
          body,
          text("span", formatPercent(result.similarity), "search-result-score")
        );
        button.addEventListener("click", () => {
          searchResults.hidden = true;
          if ((result.repetitionCount ?? 1) > 1 && result.sources?.length) {
            showEvidence(result.title, result.sources, [
              `${result.repetitionCount} matching entries. Each source is retained below.`,
              result.detail,
            ]);
          } else if (result.topicId && currentReport?.semantic) {
            const topic = currentReport.semantic.topics.find(
              (candidate) => candidate.id === result.topicId
            );
            if (topic) selectTopic(topic);
          } else if (result.source) {
            showEvidence(result.title, [result.source], [result.detail]);
          }
        });
        return button;
      })
    );
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-confidence]")) {
    button.addEventListener("click", () => {
      setConfidence(Number(button.dataset.confidence));
    });
  }

  confidenceInput.addEventListener("input", () => setConfidence(Number(confidenceInput.value)));
  reportConfidenceInput.addEventListener("input", () =>
    setConfidence(Number(reportConfidenceInput.value))
  );
  atlasPeriod.addEventListener("change", () => {
    activePeriodMonths = atlasPeriod.value === "all" ? null : Number(atlasPeriod.value);
    if (!currentReport) return;
    renderReport(currentReport);
    appStatus.textContent =
      activePeriodMonths === null
        ? "Showing all available history in period-aware views."
        : `Showing the recent ${activePeriodMonths} months in period-aware views.`;
  });
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-rhythm-measure]")) {
    button.addEventListener("click", () => {
      activeRhythmMeasure = button.dataset.rhythmMeasure as typeof activeRhythmMeasure;
      if (currentReport) renderReport(currentReport);
      appStatus.textContent = `Rhythms now show ${activeRhythmMeasure === "words" ? "approximate words" : "conversation count"}.`;
    });
  }
  rhythmRoute.addEventListener("change", () => {
    activeRhythmRouteId = rhythmRoute.value as typeof activeRhythmRouteId;
    if (currentReport) renderReport(currentReport);
    appStatus.textContent = `Rhythms filtered to ${rhythmRoute.selectedOptions[0]?.textContent ?? "all conversations"}.`;
  });
  storyButton.addEventListener("click", () => {
    if (!currentReport) return;
    storyController.open(currentReport, {
      periodMonths: activePeriodMonths,
      clearsConfidence,
      launcher: storyButton,
    });
  });

  for (const tab of document.querySelectorAll<HTMLButtonElement>("[data-evolution]")) {
    tab.addEventListener("click", () => {
      evolutionKind = tab.dataset.evolution as typeof evolutionKind;
      if (currentReport) renderEvolution(currentReport);
      motion.enter($("#evolution-list"), { offset: 0, feedback: true });
    });
  }

  for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="model-profile"]')) {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      appStatus.textContent =
        radio.value === "multilingual"
          ? "Multilingual model selected. Its larger download begins only after you choose a ZIP."
          : radio.value === "compact"
            ? "Compact English model selected."
            : "Automatic model selection enabled.";
    });
  }

  setConfidence(65, false);

  archiveInput.addEventListener("change", () => {
    const file = archiveInput.files?.[0];
    if (file) void analyzeFile(file);
  });

  document.querySelector("#load-demo")?.addEventListener("click", () => void openDemo());
  $("#retry-demo").addEventListener("click", () => void openDemo());
  $("#cancel-demo").addEventListener("click", resetApp);

  for (const eventName of ["dragenter", "dragover"]) {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add("is-dragging");
    });
  }

  for (const eventName of ["dragleave", "drop"]) {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove("is-dragging");
    });
  }

  dropZone.addEventListener("drop", (event) => {
    const file = (event as DragEvent).dataTransfer?.files[0];
    if (file) void analyzeFile(file);
  });

  $("#cancel-analysis").addEventListener("click", resetApp);
  $("#error-reset").addEventListener("click", resetApp);
  $("#reset-report").addEventListener("click", resetApp);
  $("#close-evidence").addEventListener("click", () => closeEvidencePanel());

  $("#memory-search").addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (!query || !currentReport?.semantic) return;
    searchResults.hidden = false;
    searchResults.replaceChildren(text("p", "Searching the semantic index…", "empty-note"));
    send({ type: "search", query });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeEvidencePanel();
      searchResults.hidden = true;
    }
    if (event.key === "Tab" && !evidencePanel.hidden) {
      event.preventDefault();
      $<HTMLButtonElement>("#close-evidence").focus();
    }
    if (
      (event.metaKey || event.ctrlKey) &&
      event.key.toLocaleLowerCase() === "k" &&
      !reportView.hidden &&
      !searchInput.disabled &&
      searchInput.getClientRects().length > 0
    ) {
      event.preventDefault();
      searchInput.focus();
    }
  });

  for (const tab of document.querySelectorAll<HTMLButtonElement>("#ledger-tabs button")) {
    tab.addEventListener("click", () => {
      ledgerStatus = tab.dataset.status as FactGroup["status"];
      if (currentReport) renderLedger(currentReport);
      motion.enter($("#ledger-list"), { offset: 0, feedback: true });
    });
  }

  saveButton.addEventListener("click", async () => {
    if (!currentSnapshot) {
      appStatus.textContent = "Wait for semantic analysis to finish before saving.";
      return;
    }
    const session = sessionVersion;
    await saveSnapshot(currentSnapshot);
    if (session !== sessionVersion) return;
    currentSnapshotSaved = true;
    saveButton.textContent = "Saved on this device";
    saveButton.disabled = true;
    forgetButton.hidden = false;
    appStatus.textContent = "Derived memory saved in this browser.";
  });

  forgetButton.addEventListener("click", async () => {
    if (!currentSnapshotSaved) return;
    if (!window.confirm("Forget the saved memory map on this device?")) return;
    const session = sessionVersion;
    await forgetSnapshot();
    if (session !== sessionVersion) return;
    currentSnapshotSaved = false;
    forgetButton.hidden = true;
    saveButton.hidden = false;
    saveButton.disabled = false;
    saveButton.textContent = "Keep on this device";
    appStatus.textContent = "Saved memory forgotten.";
  });

  exportLocalTraceButton.addEventListener("click", downloadLocalMeasurementTrace);

  enableMemoryChatButton.addEventListener("click", () => {
    if (!currentReport?.semantic || memoryChatWorker) return;
    memoryChatWorker = createMemoryChatWorker();
    enableMemoryChatButton.disabled = true;
    enableMemoryChatButton.textContent = "Loading local model…";
    memoryChatModelProgress.hidden = false;
    memoryChatModelProgress.value = 0;
    memoryChatModelStatus.textContent =
      "Starting the opt-in local q8 model. This may download about 105 MB once.";
    sendMemoryChat({ type: "load" });
  });

  unloadMemoryChatButton.addEventListener("click", () => {
    unloadMemoryChatModel();
    appStatus.textContent = "The local chat model and its inference buffers were unloaded.";
  });

  memoryChatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = memoryChatQuery.value.trim();
    if (!question || !memoryChatReady || pendingMemoryQuestion) return;
    pendingMemoryQuestion = question;
    memoryChatHistory.push({ role: "user", content: question });
    appendMemoryChatMessage("user", question);
    memoryChatQuery.value = "";
    memoryChatQuery.disabled = true;
    memoryChatForm.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled = true;
    memoryChatEvidence.replaceChildren();
    clearGraphTraversal();
    setMemoryChatStage("search");
    memoryChatModelStatus.textContent = "Searching the derived semantic memory first…";
    send({ type: "search", query: question });
  });

  const initialSession = sessionVersion;
  void loadSnapshot()
    .then(async (snapshot) => {
      if (initialSession !== sessionVersion) return;
      if (!snapshot) return;
      if ((snapshot as { version: number }).version !== 3) {
        await forgetSnapshot();
        showError(
          "An older saved memory was removed. Import the ZIP again to build evolution, confidence, and strand evidence."
        );
        return;
      }
      currentSnapshot = snapshot;
      send({ type: "restore", snapshot });
    })
    .catch(() => {
      appStatus.textContent = "A saved memory could not be opened. Import the ZIP again.";
    });

  if (services.developmentSampleUrl) {
    const developmentSampleUrl = services.developmentSampleUrl;
    if (developmentSampleUrl) {
      void fetch(developmentSampleUrl)
        .then(async (response) => {
          if (!response.ok) throw new Error(`Sample server returned ${response.status}.`);
          const blob = await response.blob();
          await analyzeFile(
            new File([blob], "development-sample.zip", {
              type: "application/zip",
            })
          );
        })
        .catch((error) => {
          showError(
            error instanceof Error ? error.message : "The development sample could not load."
          );
        });
    }
  }

  motion.enter(document.querySelector(".import-copy"));
  motion.enter(document.querySelector(".demo-entry"), { delay: 50 });

  window.addEventListener("pagehide", (event) => {
    if (event.persisted) {
      motion.cancelAll();
    } else {
      motion.destroy();
      for (const unbind of unbindTabs) unbind();
    }
    demoLoad?.abort();
    stopTimingTicker();
    if (graphFormationFrame !== null) window.cancelAnimationFrame(graphFormationFrame);
    graphFormationFrame = null;
    graphFormationResizeObserver.disconnect();
    reportRouteObserver.disconnect();
    memoryChatWorker?.terminate();
    memoryChatWorker = null;
    worker.terminate();
    void analysisLease.release();
  });
}
