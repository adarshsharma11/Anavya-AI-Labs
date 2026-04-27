export type ScanState = "idle" | "scanning" | "results";

export type Issue = {
  id: string;
  title: string;
  severity: string;
  suggestion?: string;
  codeSnippet?: {
    html?: string;
    css?: string;
    js?: string;
  };
};
