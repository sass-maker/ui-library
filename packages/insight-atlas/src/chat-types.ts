import type { SearchResult, SourceRef } from "./types";

export type MemoryChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export type MemoryChatEvidence = {
  id: string;
  reference: string;
  type: SearchResult["type"];
  title: string;
  excerpt: string;
  detail: string;
  similarity: number;
  source: SourceRef | null;
  topicId: string | null;
};

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type MemoryChatRuntime = {
  device: "wasm";
  dtype: "q8";
};

export type MemoryChatWorkerRequest =
  | { type: "load" }
  | { type: "generate"; messages: ChatMessage[] }
  | { type: "dispose" };

export type MemoryChatWorkerResponse =
  | {
      type: "progress";
      phase: "model" | "generate";
      label: string;
      current: number;
      total: number;
      runtime: MemoryChatRuntime;
    }
  | { type: "ready"; runtime: MemoryChatRuntime }
  | {
      type: "answer";
      answer: string;
      elapsedMs: number;
      runtime: MemoryChatRuntime;
    }
  | { type: "disposed" }
  | { type: "error"; message: string; runtime: MemoryChatRuntime };
