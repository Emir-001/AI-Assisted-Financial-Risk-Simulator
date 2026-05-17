import type { MultiAgentReport } from "./agents";
import type { FinancialData, FinancialMetrics } from "./finance";

export async function generatePDFReport(
  report: MultiAgentReport,
  data: FinancialData,
  metrics: FinancialMetrics
): Promise<void> {
  // Dynamically import jspdf to avoid SSR issues
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = W - margin * 2;
  let y = 0;

  const newPage = () => {
    doc.addPage();
    y = margin;
    // Page border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(8, 8, W - 16, H - 16);
  };

  const checkPage = (needed: number) => {
    if (y + needed > H - margin) newPage();
  };

  const scoreColor = (s: number): [number, number, number] => {
    if (s >= 70) return [16, 185, 129];
    if (s >= 40) return [245, 158, 11];
    return [239, 68, 68];
  };

  // ── COVER PAGE ───────────────────────────────────────────────────────────────

  // Dark header bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 60, "F");

  // Logo area
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(margin, 14, 12, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("AI", margin + 2.5, 22);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Finansal Risk Analiz Raporu", margin + 16, 22);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Multi-Agent AI Finansal Simülasyon Motoru", margin + 16, 29);

  // Score badge
  const [sr, sg, sb] = scoreColor(report.supervisor.overallScore);
  doc.setFillColor(sr, sg, sb);
  doc.roundedRect(W - margin - 28, 14, 28, 28, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(String(report.supervisor.overallScore), W - margin - 14, 28, { align: "center" });
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text("SAĞLIK SKORU", W - margin - 14, 35, { align: "center" });

  y = 70;

  // Verdict box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentW, 18, 3, 3, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const verdictLines = doc.splitTextToSize(report.supervisor.verdict, contentW - 8);
  doc.text(verdictLines, margin + 4, y + 7);
  y += 26;

  // Meta info row
  const metaItems = [
    { label: "Güven Skoru", value: `%${report.confidenceScore}` },
    { label: "RAG Kaynağı", value: report.ragUsed ? "Aktif" : "Pasif" },
    { label: "Oluşturulma", value: new Date(report.generatedAt).toLocaleDateString("tr-TR") },
    { label: "Ajan Sayısı", value: "4 AI Ajan" },
  ];
  const cellW = contentW / metaItems.length;
  metaItems.forEach((item, i) => {
    const cx = margin + i * cellW;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, y, cellW - 2, 14, 2, 2, "FD");
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text(item.label, cx + cellW / 2 - 1, y + 5, { align: "center" });
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(item.value, cx + cellW / 2 - 1, y + 11, { align: "center" });
  });
  y += 22;

  // ── SECTION: KULLANICI FİNANSAL PROFİLİ ─────────────────────────────────────
  const drawSectionHeader = (title: string, color: [number, number, number]) => {
    checkPage(14);
    doc.setFillColor(...color);
    doc.rect(margin, y, 3, 10, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 6, y + 7);
    y += 14;
  };

  const drawKeyValue = (key: string, value: string, highlight = false) => {
    checkPage(8);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(key, margin + 2, y);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    if (highlight) {
      const [r, g, b] = scoreColor(report.supervisor.overallScore);
      doc.setTextColor(r, g, b);
    }
    doc.text(value, W - margin - 2, y, { align: "right" });
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 2, W - margin, y + 2);
    y += 8;
  };

  drawSectionHeader("Finansal Profil", [37, 99, 235]);
  drawKeyValue("Aylık Gelir", `${data.monthlyIncome.toLocaleString("tr-TR")} TL`);
  drawKeyValue("Aylık Gider", `${data.monthlyExpenses.toLocaleString("tr-TR")} TL`);
  drawKeyValue("Aylık Borç Ödemesi", `${data.monthlyDebtPayment.toLocaleString("tr-TR")} TL`);
  drawKeyValue("Toplam Birikim", `${data.totalSavings.toLocaleString("tr-TR")} TL`);
  drawKeyValue("Toplam Borç", `${data.totalDebt.toLocaleString("tr-TR")} TL`);
  drawKeyValue("Borç/Gelir Oranı", `%${metrics.debtToIncomeRatio.toFixed(1)}`);
  drawKeyValue("Acil Durum Fonu", `${metrics.emergencyFundMonths.toFixed(1)} ay`);
  drawKeyValue("Risk Skoru", `${metrics.riskScore.toFixed(0)}/100`, true);
  y += 4;

  // ── SECTION: YÖNETİCİ ÖZETİ ─────────────────────────────────────────────────
  drawSectionHeader("Yönetici Özeti", [16, 185, 129]);
  checkPage(40);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, contentW, 30, 3, 3, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(report.supervisor.summary, contentW - 8);
  doc.text(summaryLines.slice(0, 5), margin + 4, y + 7);
  y += 36;

  // ── SECTION: ÖNCELİKLİ EYLEM PLANI ─────────────────────────────────────────
  drawSectionHeader("Öncelikli Eylem Planı", [245, 158, 11]);
  report.supervisor.topPriorities.forEach((p, i) => {
    checkPage(22);
    const urgencyColors: Record<string, [number, number, number]> = {
      acil: [254, 226, 226],
      önemli: [254, 243, 199],
      uzun_vadeli: [219, 234, 254],
    };
    const bgColor = urgencyColors[p.urgency] || [241, 245, 249];
    doc.setFillColor(...bgColor);
    doc.roundedRect(margin, y, contentW, 18, 2, 2, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}. ${p.action}`, margin + 4, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7.5);
    const impactLines = doc.splitTextToSize(p.expectedImpact, contentW - 12);
    doc.text(impactLines[0], margin + 4, y + 13);
    // Urgency badge
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text(p.urgency.toUpperCase(), W - margin - 4, y + 7, { align: "right" });
    y += 22;
  });
  y += 4;

  // ── SECTION: AJAN ANALİZLERİ ─────────────────────────────────────────────────

  // Macro
  checkPage(50);
  drawSectionHeader("Makroekonomik Ajan Analizi", [124, 58, 237]);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentW, 28, 2, 2, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const macroLines = doc.splitTextToSize(report.macro.analysis, contentW - 8);
  doc.text(macroLines.slice(0, 4), margin + 4, y + 7);
  y += 34;

  // Credit
  checkPage(50);
  drawSectionHeader("Kredi Risk Ajan Analizi", [219, 39, 119]);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentW, 28, 2, 2, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const creditLines = doc.splitTextToSize(report.credit.analysis, contentW - 8);
  doc.text(creditLines.slice(0, 4), margin + 4, y + 7);
  y += 34;

  // Sector
  checkPage(60);
  drawSectionHeader("Sektörel Risk Ajan Analizi", [5, 150, 105]);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentW, 28, 2, 2, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const sectorLines = doc.splitTextToSize(report.sector.analysis, contentW - 8);
  doc.text(sectorLines.slice(0, 4), margin + 4, y + 7);
  y += 34;

  // Primary Risks table
  if (report.sector.primaryRisks.length > 0) {
    checkPage(10 + report.sector.primaryRisks.length * 10);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("BAŞLICA RİSKLER", margin, y);
    y += 6;
    report.sector.primaryRisks.forEach((risk) => {
      checkPage(10);
      const rColors: Record<string, [number, number, number]> = {
        yüksek: [254, 226, 226],
        orta: [254, 243, 199],
        düşük: [209, 250, 229],
      };
      doc.setFillColor(...(rColors[risk.severity] || [241, 245, 249]));
      doc.roundedRect(margin, y, contentW, 8, 1, 1, "F");
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text(risk.name, margin + 3, y + 5.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      const descText = doc.splitTextToSize(risk.description, contentW - 50);
      doc.text(descText[0], margin + 35, y + 5.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text(risk.severity.toUpperCase(), W - margin - 3, y + 5.5, { align: "right" });
      y += 10;
    });
    y += 4;
  }

  // ── SECTION: ÖNERİLER ───────────────────────────────────────────────────────
  checkPage(40);
  drawSectionHeader("AI Önerileri", [37, 99, 235]);
  report.supervisor.recommendations.forEach((rec, i) => {
    checkPage(10);
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin, y, contentW, 8, 1, 1, "F");
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}.`, margin + 3, y + 5.5);
    doc.setFont("helvetica", "normal");
    const recLines = doc.splitTextToSize(rec, contentW - 12);
    doc.text(recLines[0], margin + 9, y + 5.5);
    y += 10;
  });

  // ── FOOTER ───────────────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    doc.text(
      `AI Finansal Risk Simülatörü | Sayfa ${p}/${totalPages} | ${new Date().toLocaleDateString("tr-TR")}`,
      W / 2,
      H - 6,
      { align: "center" }
    );
    doc.text("Bu rapor yapay zeka tarafından oluşturulmuştur. Yatırım tavsiyesi değildir.", W / 2, H - 3, { align: "center" });
  }

  doc.save(`finansal-risk-raporu-${new Date().toISOString().slice(0, 10)}.pdf`);
}
