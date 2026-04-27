import type { ScanReport, ScanResultResponse } from "@/lib/api/scan";

type ScanData = ScanResultResponse["data"];

function asLines(values: string[] | undefined) {
  return (values ?? []).filter(Boolean);
}

export async function generateScanReportPdf(scan: ScanData) {
  const { jsPDF } = await import("jspdf");

  const report: ScanReport | null =
    scan.fullReport ?? scan.aiReport ?? scan.report ?? null;
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

  writeSectionTitle("Report Summary", [16, 185, 129]);
  writeParagraph(`Overall Score: ${scan.preview.overall}/100`);
  writeParagraph(`Verdict: ${scan.preview.verdict}`);
  writeParagraph(`Total Issues Found: ${scan.preview.totalIssuesFound}`);
  writeParagraph(
    `Category Scores - Performance: ${scan.preview.categories.performance}, SEO: ${scan.preview.categories.seo}, Accessibility: ${scan.preview.categories.accessibility}, Security: ${scan.preview.categories.security}`
  );

  writeSectionTitle("Top Issues", [244, 114, 22]);
  if (scan.preview.topIssues.length) {
    scan.preview.topIssues.forEach((issue, index) => {
      writeParagraph(`${index + 1}. ${issue.title} (${issue.severity})`);
    });
  } else {
    writeParagraph("No major issues detected in preview.");
  }

  writeSectionTitle("Quick Wins", [124, 58, 237]);
  writeList(scan.preview.quickWins);

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

  const writeList = (items: string[] | undefined) => {
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

  writeSectionTitle("Primary Website Score", [16, 185, 129]);
  writeParagraph(`Overall: ${scan.preview.overall}/100`);
  writeParagraph(`Verdict: ${scan.preview.verdict}`);
  writeParagraph(
    `Performance: ${scan.preview.categories.performance}, SEO: ${scan.preview.categories.seo}, Accessibility: ${scan.preview.categories.accessibility}, Security: ${scan.preview.categories.security}`
  );

  if (competitor) {
    writeSectionTitle("Competitor Score", [245, 158, 11]);
    writeParagraph(`Overall: ${competitor.overall}/100`);
    writeParagraph(`Verdict: ${competitor.verdict}`);
    writeParagraph(
      `Performance: ${competitor.categories.performance}, SEO: ${competitor.categories.seo}, Accessibility: ${competitor.categories.accessibility}, Security: ${competitor.categories.security}`
    );
  }

  writeSectionTitle("Your Quick Wins", [2, 132, 199]);
  writeList(scan.preview.quickWins);

  writeSectionTitle("Competitor Quick Wins", [217, 119, 6]);
  writeList(competitor?.quickWins);

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
