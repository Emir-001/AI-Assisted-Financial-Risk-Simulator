import { GoogleGenerativeAI } from "@google/generative-ai";
import { FinancialData, FinancialMetrics } from "./finance";
import { fetchMacroData } from "./macro";
import { fetchRagContext } from "./rag-fetcher";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Models ordered best → cheapest. On quota (429) or model-not-found (404) errors we try the next one.
// gemini-3.1-flash-lite is active and has full quota — put it first
const MODEL_CASCADE = [
  "gemini-3.1-flash-lite",          // En son model — ultra hızlı, hafif ve kota dostu
  "gemini-2.5-flash",               // Güncel ve kararlı 2.5
  "gemini-2.0-flash",               // 2.0 sürümü
  "gemini-flash-latest",            // Güvenilir genel yedek
  "gemini-flash-lite-latest",       // Hafif yedek
  "gemini-3-flash-preview",         // Deneysel 3.0
];

async function generateWithFallback(prompt: string): Promise<string> {
  let lastError: any;
  for (const modelName of MODEL_CASCADE) {
    try {
      const m = genAI.getGenerativeModel({ model: modelName });
      const result = await m.generateContent(prompt);
      return result.response.text();
    } catch (err: any) {
      lastError = err;
      const msg: string = err?.message ?? "";
      const shouldFallback =
        msg.includes("429") ||
        msg.includes("quota") ||
        msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("404") ||
        msg.includes("not found") ||
        msg.includes("is not supported");
      if (shouldFallback) {
        console.warn(`[Model Cascade] ${modelName} unavailable (${msg.slice(0, 80)}), trying next...`);
        continue;
      }
      throw err; // Non-recoverable error — propagate immediately
    }
  }
  throw lastError ?? new Error("Tüm Gemini model kotaları tükendi. Lütfen daha sonra tekrar deneyin.");
}

// ─── Shared Types ──────────────────────────────────────────────────────────────

export interface AgentResponse {
  analysis: string;
  recommendations: string[];
  riskAssessment: string;
  score: number;
}

export interface MultiAgentReport {
  macro: MacroAgentResult;
  credit: CreditAgentResult;
  sector: SectorAgentResult;
  supervisor: SupervisorResult;
  confidenceScore: number;
  ragUsed: boolean;
  ragSources: string[];       // e.g. ["TCMB Döviz Kurları", "World Bank"]
  ragFetchedAt: string;       // ISO timestamp of last RAG data fetch
  generatedAt: string;
}

export interface MacroAgentResult {
  analysis: string;
  inflationImpact: "low" | "medium" | "high";
  exchangeRiskLevel: "low" | "medium" | "high";
  interestRateOutlook: string;
  keyInsights: string[];
}

export interface CreditAgentResult {
  analysis: string;
  dtiRating: "iyi" | "dikkat" | "kritik";
  emergencyFundRating: "yetersiz" | "sınırlı" | "yeterli" | "güçlü";
  debtSustainabilityMonths: number;
  keyInsights: string[];
}

export interface SectorAgentResult {
  analysis: string;
  primaryRisks: { name: string; severity: "düşük" | "orta" | "yüksek"; description: string }[];
  opportunities: string[];
  keyInsights: string[];
}

export interface SupervisorResult {
  overallScore: number;
  verdict: string;
  topPriorities: { action: string; urgency: "acil" | "önemli" | "uzun_vadeli"; expectedImpact: string }[];
  summary: string;
  recommendations: string[];
  projection: number[];
}

// ─── In-Memory RAG Store (auto-fetched, not user-uploaded) ──────────────────
// RAG context is now automatically populated from official sources.
// See src/lib/rag-fetcher.ts for data sources (TCMB, World Bank, FRED, OECD).

export type { RagData } from "./rag-fetcher";

// ─── Helper: Safe JSON parse ───────────────────────────────────────────────────

function safeJson<T>(text: string, fallback: T): T {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    return JSON.parse(match[0]) as T;
  } catch {
    return fallback;
  }
}

// ─── Agent 1: Makroekonomik Ajan ──────────────────────────────────────────────

export async function macroEconomicAgent(
  data: FinancialData,
  rag: string | null
): Promise<MacroAgentResult> {
  const macro = await fetchMacroData();
  const ragSection = rag
    ? `\n\nGüncel Politika Belgesi / Rapor Özeti (RAG Kaynağı):\n${rag}`
    : "";

  const prompt = `Sen bir Kıdemli Makroekonomi Analistisin. Türkiye ekonomik koşullarını derin şekilde analiz et.

Kullanıcı Finansal Profili:
- Aylık Gelir: ${data.monthlyIncome} TL
- Aylık Gider: ${data.monthlyExpenses} TL
- Toplam Birikim: ${data.totalSavings} TL
- Toplam Borç: ${data.totalDebt} TL
- Enflasyon Varsayımı: ${data.inflationRate || "—"}%

Güncel Makroekonomik Veriler:
- Enflasyon: ${macro.inflationRate}%
- Politika Faizi: ${macro.policyInterestRate}%
- USD/TRY: ${macro.usdTryExchangeRate}
- Açıklama: ${macro.description}
${ragSection}

Bu verilere dayanarak şunu analiz et:
1. Enflasyonun bu kişinin birikimlerine gerçek etkisi
2. Kur riskinin borç yapısına etkisi
3. Faiz oranlarının yatırım ve borç ödemeleri üzerindeki etkisi
4. 3 adet özgün içgörü

Yanıtı YALNIZCA bu JSON formatında ver (başka metin ekleme):
{
  "analysis": "Türkçe detaylı analiz...",
  "inflationImpact": "low|medium|high",
  "exchangeRiskLevel": "low|medium|high",
  "interestRateOutlook": "Türkçe kısa görüş...",
  "keyInsights": ["içgörü1", "içgörü2", "içgörü3"]
}`;

  const text = await generateWithFallback(prompt);
  return safeJson<MacroAgentResult>(text, {
    analysis: "Makroekonomik analiz tamamlanamadı.",
    inflationImpact: "medium",
    exchangeRiskLevel: "medium",
    interestRateOutlook: "Değerlendirilemedi.",
    keyInsights: [],
  });
}

// ─── Agent 2: Kredi & Risk Ajanı ──────────────────────────────────────────────

export async function creditRiskAgent(
  data: FinancialData,
  metrics: FinancialMetrics,
  rag: string | null
): Promise<CreditAgentResult> {
  const ragSection = rag
    ? `\n\nReferans Belge Özeti:\n${rag}`
    : "";

  const prompt = `Sen bir Kıdemli Kredi Risk Analistisin. Aşağıdaki kişisel finansal verileri değerlendir.

Finansal Veriler:
- Borç/Gelir Oranı (DTI): ${metrics.debtToIncomeRatio.toFixed(1)}%
- Acil Durum Fonu: ${metrics.emergencyFundMonths.toFixed(1)} aylık gideri karşılıyor
- Aylık Borç Ödemesi: ${data.monthlyDebtPayment} TL
- Toplam Borç: ${data.totalDebt} TL
- Toplam Birikim: ${data.totalSavings} TL
- Aylık Net Nakit Akışı: ${data.monthlyIncome - data.monthlyExpenses - data.monthlyDebtPayment} TL
- Risk Skoru: ${metrics.riskScore.toFixed(0)}/100
${ragSection}

Analiz et:
1. DTI oranının ne anlama geldiğini ve hangi eşiklere göre değerlendirildiğini
2. Acil durum fonu yeterliliğini (uluslararası standart: 3-6 ay)
3. Borcun kaç ay daha sürdürülebilir olduğunu (nakit akışı sıfırlandığında)
4. 3 adet pratik içgörü

Yanıtı YALNIZCA bu JSON formatında ver:
{
  "analysis": "Türkçe detaylı kredi risk analizi...",
  "dtiRating": "iyi|dikkat|kritik",
  "emergencyFundRating": "yetersiz|sınırlı|yeterli|güçlü",
  "debtSustainabilityMonths": <sayı>,
  "keyInsights": ["içgörü1", "içgörü2", "içgörü3"]
}`;

  const text = await generateWithFallback(prompt);
  return safeJson<CreditAgentResult>(text, {
    analysis: "Kredi riski analizi tamamlanamadı.",
    dtiRating: "dikkat",
    emergencyFundRating: "sınırlı",
    debtSustainabilityMonths: 6,
    keyInsights: [],
  });
}

// ─── Agent 3: Sektörel Risk Ajanı ─────────────────────────────────────────────

export async function sectorRiskAgent(
  data: FinancialData,
  metrics: FinancialMetrics,
  rag: string | null
): Promise<SectorAgentResult> {
  const macro = await fetchMacroData();
  const ragSection = rag
    ? `\n\nSektörel Referans Belge:\n${rag}`
    : "";

  const prompt = `Sen bir Sektörel Finansal Risk Analistisin. Türkiye'deki mevcut ekonomik ortamda bireyin karşılaşabileceği sektörel riskleri ve fırsatları değerlendir.

Profil:
- Aylık Gelir: ${data.monthlyIncome} TL (birincil gelir kaynağı belirsiz)
- Yatırım Eğilimi: Birikim ${data.totalSavings} TL (nakitte mi, yatırımda mı?)
- Risk Toleransı: ${data.riskTolerance || 50}/100
- Piyasa Volatilitesi Beklentisi: ${data.marketVolatility || 50}/100

Türkiye Makro:
- Enflasyon: ${macro.inflationRate}%
- Faiz: ${macro.policyInterestRate}%
- USD/TRY: ${macro.usdTryExchangeRate}
${ragSection}

Analiz et:
1. Bu profilin maruz kaldığı 3 sektörel risk (gayrimenkul, döviz, emtia, iş gücü vb.)
2. Bu ortamda kaçırılmaması gereken 2-3 fırsat
3. 3 adet özgün sektörel içgörü

Yanıtı YALNIZCA bu JSON formatında ver:
{
  "analysis": "Türkçe sektörel risk analizi...",
  "primaryRisks": [
    { "name": "Risk Adı", "severity": "düşük|orta|yüksek", "description": "Açıklama..." }
  ],
  "opportunities": ["fırsat1", "fırsat2"],
  "keyInsights": ["içgörü1", "içgörü2", "içgörü3"]
}`;

  const text = await generateWithFallback(prompt);
  return safeJson<SectorAgentResult>(text, {
    analysis: "Sektörel risk analizi tamamlanamadı.",
    primaryRisks: [],
    opportunities: [],
    keyInsights: [],
  });
}

// ─── Supervisor Agent ──────────────────────────────────────────────────────────

export async function supervisorAgent(
  data: FinancialData,
  metrics: FinancialMetrics,
  macro: MacroAgentResult,
  credit: CreditAgentResult,
  sector: SectorAgentResult
): Promise<SupervisorResult> {
  const prompt = `Sen bir Baş Finansal Strateji Uzmanısın. Üç uzman ajanın analizlerini sentezleyerek kapsamlı bir eylem planı oluştur.

=== MAKRO AJAN RAPORU ===
${macro.analysis}
Enflasyon Etkisi: ${macro.inflationImpact}
Kur Riski: ${macro.exchangeRiskLevel}
İçgörüler: ${macro.keyInsights.join(" | ")}

=== KREDİ RİSK AJAN RAPORU ===
${credit.analysis}
DTI Değerlendirmesi: ${credit.dtiRating}
Acil Fon: ${credit.emergencyFundRating}
Borç Sürdürülebilirliği: ${credit.debtSustainabilityMonths} ay
İçgörüler: ${credit.keyInsights.join(" | ")}

=== SEKTÖREL RİSK AJAN RAPORU ===
${sector.analysis}
Başlıca Riskler: ${sector.primaryRisks.map(r => `${r.name} (${r.severity})`).join(", ")}
Fırsatlar: ${sector.opportunities.join(", ")}

Kullanıcı Verileri:
- Gelir: ${data.monthlyIncome} TL | Gider: ${data.monthlyExpenses} TL
- Birikim: ${data.totalSavings} TL | Borç: ${data.totalDebt} TL
- Risk Skoru: ${metrics.riskScore.toFixed(0)}/100

Görevin:
1. Tüm analizleri sentezle → 0-100 arası "Finansal Sağlık Skoru" üret
2. Net bir "karar" ver (yeşil/sarı/kırmızı değil, gerçek bir değerlendirme cümlesi)
3. Öncelikli 3 eylem adımı belirle (her biri için: eylem, aciliyet, beklenen etki)
4. 1 paragraf yönetici özeti
5. 3 adet somut öneri
6. 12 aylık birikim projeksiyonu (sayı dizisi)

Yanıtı YALNIZCA bu JSON formatında ver:
{
  "overallScore": <0-100 sayı>,
  "verdict": "Türkçe net karar cümlesi...",
  "topPriorities": [
    { "action": "Eylem", "urgency": "acil|önemli|uzun_vadeli", "expectedImpact": "Beklenen etki..." }
  ],
  "summary": "Türkçe yönetici özeti paragrafı...",
  "recommendations": ["öneri1", "öneri2", "öneri3"],
  "projection": [<12 sayı: aylık beklenen birikim miktarları>]
}`;

  const text = await generateWithFallback(prompt);
  const fallbackProjection = Array.from({ length: 12 }, (_, i) =>
    Math.max(0, data.totalSavings + (data.monthlyIncome - data.monthlyExpenses - data.monthlyDebtPayment) * (i + 1))
  );

  return safeJson<SupervisorResult>(text, {
    overallScore: 50,
    verdict: "Analiz tamamlanamadı.",
    topPriorities: [],
    summary: "Süpervizör analizi başarısız oldu.",
    recommendations: [],
    projection: fallbackProjection,
  });
}

// ─── Orchestrator: Tüm Ajanları Çalıştır ──────────────────────────────────────

export async function runMultiAgentAnalysis(
  data: FinancialData,
  metrics: FinancialMetrics
): Promise<MultiAgentReport> {
  // Fetch live economic data from official sources (TCMB, World Bank, FRED...)
  const ragData = await fetchRagContext();
  const rag = ragData.content;

  // Paralel çalıştır — 3 ajan aynı anda
  const [macro, credit, sector] = await Promise.all([
    macroEconomicAgent(data, rag),
    creditRiskAgent(data, metrics, rag),
    sectorRiskAgent(data, metrics, rag),
  ]);

  // Supervisor tüm çıktıları alır
  const supervisor = await supervisorAgent(data, metrics, macro, credit, sector);

  // Güven skoru: veri tamlığı + aktif RAG kaynak sayısı
  const categoriesFilled = Object.values(data.expenseCategories || {}).filter(v => v > 0).length;
  let confidenceScore = 85 + categoriesFilled * 1.5 + ragData.sources.length * 1.5;
  confidenceScore = Math.min(99, Math.round(confidenceScore));

  return {
    macro,
    credit,
    sector,
    supervisor,
    confidenceScore,
    ragUsed: true,  // always true — auto-fetched
    generatedAt: new Date().toISOString(),
    ragSources: ragData.sources,        // expose to UI
    ragFetchedAt: ragData.fetchedAt,    // expose to UI
  };
}

// ─── Legacy single-agent (geriye dönük uyumluluk) ─────────────────────────────

export async function financialAnalysisAgent(
  data: FinancialData,
  metrics: FinancialMetrics
): Promise<AgentResponse> {
  const report = await runMultiAgentAnalysis(data, metrics);
  return {
    analysis: report.supervisor.summary,
    recommendations: report.supervisor.recommendations,
    riskAssessment: report.supervisor.verdict,
    score: report.supervisor.overallScore,
  };
}

// ─── Scenario, Goal, Portfolio Agents (unchanged) ──────────────────────────────

export async function scenarioSimulationAgent(
  baseData: FinancialData,
  scenarioType: string,
  details: string
): Promise<any> {
  const macro = await fetchMacroData();
  const prompt = `Sen bir Finansal Senaryo Simülasyon Ajanısın.
Temel Veri: ${JSON.stringify(baseData)}
Senaryo: ${scenarioType} - ${details}

Türkiye Makro: Enflasyon ${macro.inflationRate}%, Faiz ${macro.policyInterestRate}%, USD/TRY ${macro.usdTryExchangeRate}

Bu senaryonun etkisini simüle et. İkincil etkileri de hesaba kat.

JSON formatında yanıt ver:
{
  "analysis": "Türkçe analiz",
  "projection": [6 aylık birikim miktarı dizisi],
  "risks": ["risk1", "risk2"],
  "mitigation": ["önlem1", "önlem2"]
}`;
  try {
    const text = await generateWithFallback(prompt);
    return safeJson<any>(text, {
      analysis: "Senaryo analizi tamamlanamadı.",
      projection: Array.from({ length: 6 }, (_, i) => baseData.totalSavings - i * 5000),
      risks: [],
      mitigation: [],
    });
  } catch {
    return {
      analysis: "API Hatası: Simülasyon yapılamadı.",
      projection: Array.from({ length: 6 }, (_, i) => baseData.totalSavings - i * 5000),
      risks: ["API Bağlantı Hatası"],
      mitigation: ["Geçerli bir Gemini API anahtarı ekleyin."],
    };
  }
}

export interface GoalPlanResponse {
  feasibility: string;
  roadmap: { month: number; action: string; savingsTarget: number }[];
  advice: string[];
}

export async function goalPlanningAgent(
  baseData: FinancialData,
  goalName: string,
  goalAmount: number,
  targetMonths: number
): Promise<GoalPlanResponse> {
  const macro = await fetchMacroData();
  const prompt = `Sen bir Finansal Hedef Planlama Ajanısın.
Kullanıcı: ${JSON.stringify(baseData)}
Hedef: ${goalName} — ${goalAmount} TL — ${targetMonths} ay
Makro: Enflasyon ${macro.inflationRate}%, Faiz ${macro.policyInterestRate}%

JSON:
{
  "feasibility": "Türkçe açıklama",
  "roadmap": [{"month":1,"action":"...","savingsTarget":0}],
  "advice": ["öneri1","öneri2","öneri3"]
}`;
  try {
    const text = await generateWithFallback(prompt);
    return safeJson<GoalPlanResponse>(text, {
      feasibility: "Hesaplanamadı.",
      roadmap: [],
      advice: [],
    });
  } catch {
    return { feasibility: "Sistem hatası.", roadmap: [], advice: [] };
  }
}

export interface PortfolioSimulationResponse {
  expectedReturnRate: number;
  projectedValue1Y: number;
  analysis: string;
  risks: string[];
}

export async function portfolioSimulationAgent(
  totalAmount: number,
  allocations: { stock: number; gold: number; fx: number; deposit: number }
): Promise<PortfolioSimulationResponse> {
  const macro = await fetchMacroData();
  const prompt = `Sen bir Yatırım Portföy Simülasyon Ajanısın.
Tutar: ${totalAmount} TL
Dağılım: BIST ${allocations.stock}%, Altın ${allocations.gold}%, Döviz ${allocations.fx}%, Mevduat ${allocations.deposit}%
Makro: Enflasyon ${macro.inflationRate}%, Faiz ${macro.policyInterestRate}%, USD/TRY ${macro.usdTryExchangeRate}

JSON:
{
  "expectedReturnRate": <sayı>,
  "projectedValue1Y": <sayı>,
  "analysis": "Türkçe analiz",
  "risks": ["risk1","risk2"]
}`;
  try {
    const text = await generateWithFallback(prompt);
    return safeJson<PortfolioSimulationResponse>(text, {
      expectedReturnRate: 0,
      projectedValue1Y: totalAmount,
      analysis: "Simülasyon hesaplanamadı.",
      risks: [],
    });
  } catch {
    return { expectedReturnRate: 0, projectedValue1Y: totalAmount, analysis: "API hatası.", risks: [] };
  }
}

