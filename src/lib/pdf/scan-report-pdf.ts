import type { ScanReport } from "@/lib/api/scan";
import type { ScanRecord } from "@/types/api";

type ScanData = ScanRecord;

function previewFields(preview: ScanRecord["preview"]) {
  if (!preview) {
    return {
      overall: 0,
      verdict: "—",
      totalIssuesFound: 0,
      categories: { performance: 0, seo: 0, accessibility: 0, security: 0 },
      topIssues: [] as { title: string; severity: string }[],
      quickWins: [] as string[],
    };
  }
  const categories = preview.categories as Record<string, number | null>;
  return {
    overall: preview.overall,
    verdict: preview.verdict,
    totalIssuesFound: "totalIssuesFound" in preview ? preview.totalIssuesFound ?? 0 : 0,
    categories: {
      performance: categories.performance ?? categories.speed ?? 0,
      seo: categories.seo ?? categories.aeo ?? 0,
      accessibility: categories.accessibility ?? categories.content ?? 0,
      security: categories.security ?? categories.technical ?? 0,
    },
    topIssues: "topIssues" in preview ? [...(preview.topIssues ?? [])] : [],
    quickWins: "quickWins" in preview ? [...(preview.quickWins ?? [])] : [],
  };
}

function asLines(values: readonly string[] | string[] | undefined) {
  return (values ?? []).filter(Boolean);
}

export async function generateScanReportPdf(scan: ScanData) {
  const { jsPDF } = await import("jspdf");

  const report: ScanReport | null = scan.fullReport;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 42;
  const right = pageWidth - 42;
  let y = 42;

  const ensureSpace = (needed = 40) => {
    if (y + needed <= pageHeight - 48) return;
    doc.addPage();
    y = 42;
  };

  const writeParagraph = (text: string, size = 10, color = 70) => {
    if (!text) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, right - left);
    ensureSpace(lines.length * (size + 3) + 8);
    doc.text(lines, left, y);
    y += lines.length * (size + 3) + 8;
  };

  const writeSectionTitle = (title: string, rgb: [number, number, number]) => {
    ensureSpace(36);
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.roundedRect(left, y, right - left, 26, 6, 6, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title, left + 10, y + 17);
    y += 36;
  };

  const writeList = (items: string[]) => {
    if (!items.length) {
      writeParagraph("No additional insights available.");
      return;
    }
    items.forEach((item, index) => {
      writeParagraph(`${index + 1}. ${item}`);
    });
  };

  doc.setFillColor(25, 103, 210);
  doc.rect(0, 0, pageWidth, 112, "F");
  doc.setFillColor(0, 172, 193);
  doc.rect(0, 112, pageWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Anavya AI Labs", left, 54);
  doc.setFontSize(14);
  doc.text("Website Audit Report", left, 78);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`URL: ${scan.url}`, left, 98);

  y = 142;

  const preview = previewFields(scan.preview);
  writeSectionTitle("Report Summary", [16, 185, 129]);
  writeParagraph(`Overall Score: ${preview.overall}/100`);
  writeParagraph(`Verdict: ${preview.verdict}`);
  writeParagraph(`Total Issues Found: ${preview.totalIssuesFound}`);
  writeParagraph(
    `Category Scores - Performance: ${preview.categories.performance}, SEO: ${preview.categories.seo}, Accessibility: ${preview.categories.accessibility}, Security: ${preview.categories.security}`
  );

  writeSectionTitle("Top Issues", [244, 114, 22]);
  if (preview.topIssues.length) {
    preview.topIssues.forEach((issue, index) => {
      writeParagraph(`${index + 1}. ${issue.title} (${issue.severity})`);
    });
  } else {
    writeParagraph("No major issues detected in preview.");
  }

  writeSectionTitle("Quick Wins", [124, 58, 237]);
  writeList(preview.quickWins);

  if (report) {
    writeSectionTitle("Executive Summary", [2, 132, 199]);
    writeParagraph(report.executiveSummary ?? report.summary ?? "");

    writeSectionTitle("Technical Analysis", [8, 145, 178]);
    writeParagraph(report.technicalAnalysis ?? "");

    writeSectionTitle("SEO Improvements", [22, 163, 74]);
    writeList(asLines(report.seoImprovements));

    writeSectionTitle("Performance Improvements", [5, 150, 105]);
    writeList(asLines(report.performanceImprovements));

    writeSectionTitle("Business Growth Suggestions", [217, 119, 6]);
    writeList(asLines(report.businessGrowthSuggestions));

    writeSectionTitle("AI Suggestions", [147, 51, 234]);
    writeList(asLines(report.suggestions));

    if (report.estimatedTrafficImpact) {
      writeSectionTitle("Estimated Traffic Impact", [30, 64, 175]);
      writeParagraph(report.estimatedTrafficImpact);
    }
  }

  const fileName = `audit-report-${scan.id}.pdf`;
  doc.save(fileName);
}

export async function generateCompetitorReportPdf(scan: ScanData) {
  const { jsPDF } = await import("jspdf");

  const competitor = scan.competitorPreview;
  const analysis = scan.competitorAnalysis;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 42;
  const right = pageWidth - 42;
  let y = 42;

  const ensureSpace = (needed = 40) => {
    if (y + needed <= pageHeight - 48) return;
    doc.addPage();
    y = 42;
  };

  const writeParagraph = (text: string, size = 10, color = 70) => {
    if (!text) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, right - left);
    ensureSpace(lines.length * (size + 3) + 8);
    doc.text(lines, left, y);
    y += lines.length * (size + 3) + 8;
  };

  const writeSectionTitle = (title: string, rgb: [number, number, number]) => {
    ensureSpace(36);
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.roundedRect(left, y, right - left, 26, 6, 6, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title, left + 10, y + 17);
    y += 36;
  };

  const writeList = (items: readonly string[] | undefined) => {
    const safeItems = (items ?? []).filter(Boolean);
    if (!safeItems.length) {
      writeParagraph("No additional insights available.");
      return;
    }
    safeItems.forEach((item, index) => {
      writeParagraph(`${index + 1}. ${item}`);
    });
  };

  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, pageWidth, 112, "F");
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 112, pageWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Anavya AI Labs", left, 54);
  doc.setFontSize(14);
  doc.text("Competitor Benchmark Report", left, 78);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Primary URL: ${scan.url}`, left, 98);

  y = 142;

  const preview = previewFields(scan.preview);
  writeSectionTitle("Primary Website Score", [16, 185, 129]);
  writeParagraph(`Overall: ${preview.overall}/100`);
  writeParagraph(`Verdict: ${preview.verdict}`);
  writeParagraph(
    `Performance: ${preview.categories.performance}, SEO: ${preview.categories.seo}, Accessibility: ${preview.categories.accessibility}, Security: ${preview.categories.security}`
  );

  const competitorFields = previewFields(competitor);
  if (competitor) {
    writeSectionTitle("Competitor Score", [245, 158, 11]);
    writeParagraph(`Overall: ${competitorFields.overall}/100`);
    writeParagraph(`Verdict: ${competitorFields.verdict}`);
    writeParagraph(
      `Performance: ${competitorFields.categories.performance}, SEO: ${competitorFields.categories.seo}, Accessibility: ${competitorFields.categories.accessibility}, Security: ${competitorFields.categories.security}`
    );
  }

  writeSectionTitle("Your Quick Wins", [2, 132, 199]);
  writeList(preview.quickWins);

  writeSectionTitle("Competitor Quick Wins", [217, 119, 6]);
  writeList(competitorFields.quickWins);

  if (analysis) {
    writeSectionTitle("AI Comparison Summary", [147, 51, 234]);
    writeParagraph(analysis.summary);
    writeParagraph(`Score Gap: ${analysis.scoreGap}`);

    writeSectionTitle("Priority Action Items", [30, 64, 175]);
    writeList(analysis.actionItems);
  }

  const fileName = `competitor-report-${scan.id}.pdf`;
  doc.save(fileName);
}
