import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type AuditReport,
  type CategoryId,
  type CheckResult,
} from "@/types/audit";
import { hostFromUrl } from "@/components/report/score-utils";

const NAVY: [number, number, number] = [15, 23, 42];
const EMERALD: [number, number, number] = [16, 185, 129];
const AMBER: [number, number, number] = [245, 158, 11];
const ROSE: [number, number, number] = [244, 63, 94];
const SLATE: [number, number, number] = [71, 85, 105];

function scoreRgb(value: number | null): [number, number, number] {
  if (value === null) return [148, 163, 184];
  if (value >= 70) return EMERALD;
  if (value >= 50) return AMBER;
  return ROSE;
}

function verdictWord(value: number | null): string {
  if (value === null) return "Not measured";
  if (value >= 85) return "Excellent";
  if (value >= 70) return "Good";
  if (value >= 50) return "Needs Work";
  return "Poor";
}

async function loadLogoPng(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const response = await fetch("/logo.svg");
    if (!response.ok) return null;
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const dataUrl = await new Promise<string | null>((resolve) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 160;
        canvas.height = 160;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(image, 0, 0, 160, 160);
        resolve(canvas.toDataURL("image/png"));
      };
      image.onerror = () => resolve(null);
      image.src = objectUrl;
    });
    URL.revokeObjectURL(objectUrl);
    return dataUrl;
  } catch {
    return null;
  }
}

export async function generateAeoGeoReportPdf(report: AuditReport) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 42;
  const right = pageWidth - 42;
  const width = right - left;
  let y = 0;

  const ensureSpace = (needed: number) => {
    if (y + needed <= pageHeight - 56) return;
    doc.addPage();
    y = 48;
  };

  const generated = report.generatedAt
    ? new Date(report.generatedAt)
    : new Date();
  const generatedLabel = generated.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const logo = await loadLogoPng();
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 92, "F");
  doc.setFillColor(...EMERALD);
  doc.rect(0, 92, pageWidth, 5, "F");

  if (logo) {
    doc.addImage(logo, "PNG", left, 18, 52, 52);
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Anavya AI Labs", logo ? left + 64 : left, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("AEO & GEO Checker for AI Search", logo ? left + 64 : left, 60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("AEO & GEO Readiness Report", right, 40, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(report.url, right, 58, { align: "right" });
  doc.text(`Generated ${generatedLabel}`, right, 72, { align: "right" });

  y = 126;
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(String(report.overall), left, y);
  doc.setFontSize(11);
  doc.setTextColor(...SLATE);
  doc.text("/ 100", left + 52, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...scoreRgb(report.overall));
  doc.text(`Overall AI Readiness — ${report.verdict}`, left + 110, y);

  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...SLATE);
  const summaryLines = doc.splitTextToSize(report.summary, width);
  doc.text(summaryLines, left, y);
  y += summaryLines.length * 13 + 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...NAVY);
  doc.text("Category Scores", left, y);
  y += 14;

  const cardW = (width - 16) / 3;
  const cardH = 62;
  CATEGORY_ORDER.forEach((id, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = left + col * (cardW + 8);
    const cy = y + row * (cardH + 10);
    const value = report.categories[id as CategoryId];
    const rgb = scoreRgb(value);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, cy, cardW, cardH, 6, 6, "F");
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, cy, cardW, cardH, 6, 6, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...SLATE);
    doc.text(CATEGORY_LABELS[id].toUpperCase(), x + 10, cy + 16);
    doc.setFontSize(16);
    doc.setTextColor(...rgb);
    doc.text(value === null ? "—" : `${value}/100`, x + 10, cy + 36);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(verdictWord(value), x + 10, cy + 50);
  });
  y += cardH * 2 + 28;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(
    `AI Crawler Access: ${report.crawlerAccess.allowed} of ${report.crawlerAccess.total} key AI crawlers can access your site`,
    left,
    y
  );
  y += 24;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Top Recommendations", left, y);
  y += 16;

  report.recommendations.slice(0, 10).forEach((item) => {
    const body = `${item.fix}${item.why ? `\nWhy AI cares: ${item.why}` : ""}`;
    const lines = doc.splitTextToSize(body, width - 8);
    ensureSpace(38 + lines.length * 12);
    const badge =
      item.priority === "critical"
        ? "CRITICAL"
        : item.priority === "important"
          ? "IMPORTANT"
          : "MINOR";
    const badgeRgb =
      item.priority === "critical"
        ? ROSE
        : item.priority === "important"
          ? AMBER
          : EMERALD;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...badgeRgb);
    doc.text(badge, left, y);
    doc.setTextColor(...NAVY);
    doc.setFontSize(11);
    doc.text(item.label, left + 68, y);
    doc.setTextColor(...EMERALD);
    doc.text(`+${item.gain} pts`, right, y, { align: "right" });
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE);
    doc.text(lines, left, y);
    y += lines.length * 12 + 10;
  });

  y += 8;
  ensureSpace(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...NAVY);
  doc.text("Detailed Check Results", left, y);
  y += 18;

  const homepage = report.pages.find((page) => page.isHomepage) ?? report.pages[0];
  const checksByCategory = new Map<CategoryId, CheckResult[]>();
  for (const id of CATEGORY_ORDER) checksByCategory.set(id, []);
  for (const check of [...report.siteChecks, ...(homepage?.checks ?? [])]) {
    checksByCategory.get(check.category)?.push(check);
  }

  for (const id of CATEGORY_ORDER) {
    const checks = (checksByCategory.get(id) ?? []).filter((check) => check.status !== "na");
    if (checks.length === 0) continue;
    const score = report.categories[id];
    ensureSpace(28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    doc.text(
      `${CATEGORY_LABELS[id]}  ${score === null ? "—" : score} · ${verdictWord(score)}`,
      left,
      y
    );
    y += 16;
    for (const check of checks) {
      const mark =
        check.status === "pass" ? "✓" : check.status === "partial" ? "!" : "×";
      const markRgb =
        check.status === "pass"
          ? EMERALD
          : check.status === "partial"
            ? AMBER
            : ROSE;
      const line = `${check.label}    ${check.points}/${check.maxPoints} pts`;
      const evidence = doc.splitTextToSize(check.evidence, width - 18);
      ensureSpace(16 + evidence.length * 11);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...markRgb);
      doc.text(mark, left, y);
      doc.setTextColor(...NAVY);
      doc.text(line, left + 14, y);
      y += 12;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...SLATE);
      doc.text(evidence, left + 14, y);
      y += evidence.length * 11 + 6;
    }
    y += 6;
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFillColor(248, 250, 252);
    doc.rect(0, pageHeight - 36, pageWidth, 36, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...SLATE);
    doc.text(
      "Report by anavyaailabs.com — free AEO/GEO checker · Re-run any time for a fresh report.",
      left,
      pageHeight - 16
    );
    doc.text(`${page} of ${pageCount}`, right, pageHeight - 16, { align: "right" });
  }

  doc.save(`aeo-geo-report-${hostFromUrl(report.url)}.pdf`);
}
