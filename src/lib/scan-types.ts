export type ScanCategory = 'Performance' | 'SEO' | 'Accessibility';
export type ScanSeverity = 'Low' | 'Medium' | 'High';

export type ScanResult = {
  id: string;
  type: ScanCategory;
  title: string;
  description: string;
  severity: ScanSeverity;
  isPremium: boolean;
};

export type ScanSummary = {
  overallScore: number;
  scores: Record<ScanCategory, number>;
  metrics: {
    scannedUrl: string;
    finalUrl: string;
    status: number;
    responseTimeMs: number;
    contentType: string | null;
    contentBytes: number;
  };
};

export type ScanResponse = {
  results: ScanResult[];
  summary: ScanSummary;
};

