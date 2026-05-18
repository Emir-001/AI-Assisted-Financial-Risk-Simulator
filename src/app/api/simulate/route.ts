import { NextResponse } from "next/server";
import { runMultiAgentAnalysis } from "@/lib/agents";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { data, metrics } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      const projection = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const netCashFlow = data.monthlyIncome - data.monthlyExpenses - data.monthlyDebtPayment;
        const projectedSavings = data.totalSavings + netCashFlow * month;
        const projectedDebt = Math.max(0, data.totalDebt - data.monthlyDebtPayment * month);
        return Math.round(projectedSavings - projectedDebt);
      });
      return NextResponse.json({
        macro: {
          analysis: "API anahtarı tanımlanmadığı için makro analiz yapılamadı.",
          inflationImpact: "medium",
          exchangeRiskLevel: "medium",
          interestRateOutlook: "Değerlendirilemedi.",
          keyInsights: ["API anahtarı gerekli.", "Demo modunda çalışıyor.", "Gerçek analiz için anahtar ekleyin."],
        },
        credit: {
          analysis: "Kredi risk analizi için API anahtarı gereklidir.",
          dtiRating: "dikkat",
          emergencyFundRating: "sınırlı",
          debtSustainabilityMonths: 6,
          keyInsights: ["Demo veri kullanılıyor."],
        },
        sector: {
          analysis: "Sektörel risk analizi için API anahtarı gereklidir.",
          primaryRisks: [{ name: "Enflasyon Riski", severity: "yüksek", description: "Demo mod." }],
          opportunities: ["Demo fırsat"],
          keyInsights: ["Demo mod aktif."],
        },
        supervisor: {
          overallScore: 65,
          verdict: "Demo mod: Gerçek analiz için API anahtarı ekleyin.",
          topPriorities: [{ action: "API anahtarı ekleyin", urgency: "acil", expectedImpact: "Gerçek AI analizine erişim" }],
          summary: "Bu demo bir simülasyondur. Gerçek analiz için GEMINI_API_KEY ortam değişkeni tanımlanmalıdır.",
          recommendations: ["API anahtarı ekleyin.", "Verileri gerçek değerlerle doldurun.", "Yeniden çalıştırın."],
          projection,
        },
        confidenceScore: 42,
        ragUsed: false,
        ragSources: [],
        ragFetchedAt: new Date().toISOString(),
        generatedAt: new Date().toISOString(),
      });
    }

    const report = await runMultiAgentAnalysis(data, metrics);
    return NextResponse.json(report);
  } catch (error: any) {
    const message = error?.message ?? String(error);
    console.error("Multi-Agent API Error:", message);
    // Return the actual error message so the client can display it
    return NextResponse.json(
      { error: "Internal Server Error", detail: message },
      { status: 500 }
    );
  }
}
