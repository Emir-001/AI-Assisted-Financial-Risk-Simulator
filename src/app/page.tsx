"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTheme } from "@wrksz/themes/client";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Lazy-load heavy libraries so they don't block first paint
const CountUp = dynamic(() => import("react-countup"), { ssr: false, loading: () => <span>—</span> });
const DiaTextReveal = dynamic(
  () => import("@/components/magicui/dia-text-reveal").then(m => ({ default: m.DiaTextReveal })),
  { ssr: false, loading: () => <span className="text-transparent">Yapay Zeka İle Görün</span> }
);
const DashboardCharts = dynamic(
  () => import("@/components/dashboard-charts").then(m => ({ default: m.DashboardCharts })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] rounded-xl bg-slate-100/50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Grafikler yükleniyor...</p>
        </div>
      </div>
    ),
  }
);
const AIReportPanel = dynamic(
  () => import("@/components/ai-report-panel").then(m => ({ default: m.AIReportPanel })),
  { ssr: false }
);
import {
  AlertTriangle,
  TrendingUp,
  Wallet,
  CreditCard,
  Activity,
  ShieldCheck,
  ChevronRight,
  FileText
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Slider, Badge } from "@/components/ui";
import { Zap, RefreshCcw, ArrowDownRight, ArrowUpRight, Info, Loader2, Home, Target, Moon, Sun, Download, PlayCircle, ChevronDown, ChevronUp, Sparkles, BarChart2, Clock, Layers, Fingerprint } from "lucide-react";

const GeminiLogo = ({ className }: { className?: string }) => (
  <img src="/Google-Gemini-Logo-Transparent.png" alt="Gemini" className={cn("object-contain", className)} />
);

import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";
import { calculateMetrics, calculateFutureProjection, FinancialData, FinancialMetrics, ExpenseCategories } from "@/lib/finance";
import { cn } from "@/lib/utils";
import type { MultiAgentReport } from "@/lib/agents";
import { StockBackground } from "@/components/stock-background";

interface SimulationResultType {
  type: string;
  impact: string;
  projection?: number[];
  risks?: string[];
  mitigation?: string[];
}

interface GoalPlanResponse {
  feasibility: string;
  roadmap: { month: number; action: string; savingsTarget: number }[];
  advice: string[];
}

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const [data, setData] = useState<FinancialData>({
    monthlyIncome: 45000,
    monthlyExpenses: 18000,
    expenseCategories: { housing: 8000, food: 4000, transport: 2000, entertainment: 2000, other: 2000 },
    totalSavings: 50000,
    totalDebt: 120000,
    monthlyDebtPayment: 12000,
  });

  const [multiAgentReport, setMultiAgentReport] = useState<MultiAgentReport | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scenarioMode, setScenarioMode] = useState(false);
  const [showAdvancedStressTest, setShowAdvancedStressTest] = useState(false);

  const [liveInsight, setLiveInsight] = useState<string>("Finansal verileriniz analiz ediliyor...");
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  // PDF States
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isExportingReport, setIsExportingReport] = useState(false);

  // Dinamik Senaryo State'leri
  const [carPrice, setCarPrice] = useState(500000);
  const [carInstallment, setCarInstallment] = useState(15000);
  const [housePrice, setHousePrice] = useState(3000000);
  const [houseInstallment, setHouseInstallment] = useState(45000);
  const [customScenarioText, setCustomScenarioText] = useState("");
  const [scenarioLoading, setScenarioLoading] = useState(false);

  // Goal Tracking States
  const [goalMode, setGoalMode] = useState(false);
  const [goalName, setGoalName] = useState("Yeni Araba Peşinatı");
  const [goalAmount, setGoalAmount] = useState(300000);
  const [targetMonths, setTargetMonths] = useState(12);
  const [goalLoading, setGoalLoading] = useState(false);
  const [goalResult, setGoalResult] = useState<GoalPlanResponse | null>(null);

  // Portfolio Simulator States
  const [portfolioMode, setPortfolioMode] = useState(false);
  const [allocations, setAllocations] = useState({ stock: 40, gold: 30, fx: 10, deposit: 20 });
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioResult, setPortfolioResult] = useState<any>(null);

  // UI States
  const [isExpensesExpanded, setIsExpensesExpanded] = useState(false);
  const [aiProcessingStep, setAiProcessingStep] = useState(0);

  const formatNumber = (num: number) => num.toLocaleString('tr-TR');

  const [marketData, setMarketData] = useState({
    usd: 45.39,
    usdDir: 1,
    eur: 53.41,
    eurDir: 1,
    btc: 80648,
    btcDir: -1,
    bist: 10240,
    bistDir: 1,
    enf: 68.5,
  });

  useEffect(() => {
    // İlk yüklemede gerçek verileri API'den çek (Gerçekçi ve Güncel)
    const fetchRealData = async () => {
      try {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await res.json();
        const tryRate = data.rates.TRY;
        const eurRate = data.rates.TRY / data.rates.EUR;
        setMarketData(prev => ({ ...prev, usd: tryRate, eur: eurRate }));
      } catch (e) {
        console.warn("Exchange rate fetch error, using defaults", e);
      }

      try {
        const resBtc = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
        const dataBtc = await resBtc.json();
        setMarketData(prev => ({ ...prev, btc: dataBtc.bitcoin.usd }));
      } catch (e) {
        console.warn("BTC fetch error, using defaults", e);
      }
    };

    fetchRealData();

    // Ardından her 4 saniyede bir ufak dalgalanmalar simüle et (Hackathon Demo Efekti)
    const interval = setInterval(() => {
      setMarketData(prev => {
        const usdChange = (Math.random() * 0.04) - 0.02;
        const eurChange = (Math.random() * 0.06) - 0.03;
        const btcChange = Math.floor(Math.random() * 100) - 50;
        const bistChange = Math.floor(Math.random() * 20) - 10;
        return {
          ...prev,
          usd: prev.usd + usdChange,
          usdDir: usdChange >= 0 ? 1 : -1,
          eur: prev.eur + eurChange,
          eurDir: eurChange >= 0 ? 1 : -1,
          btc: prev.btc + btcChange,
          btcDir: btcChange >= 0 ? 1 : -1,
          bist: prev.bist + bistChange,
          bistDir: bistChange >= 0 ? 1 : -1,
        };
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const metrics = useMemo(() => calculateMetrics(data), [data]);
  const futureProjection = useMemo(() => calculateFutureProjection(data), [data]);

  useEffect(() => {
    setIsInsightLoading(true);
    const timer = setTimeout(() => {
      let insight = "";
      if (metrics.riskCategory === "Yüksek Riskli") {
        insight = `Kritik Uyarı: %${data.inflationRate || 0} enflasyon ve yüksek piyasa volatilitesi portföyünüz üzerinde şiddetli bir baskı yaratıyor. Mevcut birikim/borç yapınız şoklara karşı oldukça savunmasız.`;
      } else if (metrics.riskCategory === "Orta Riskli") {
        insight = `Mevcut enflasyon seviyesi nakit birikimlerinizi eritiyor. Piyasada artan volatilite riskine karşı portföy çeşitlendirmesi ve acil durum fonunun güçlendirilmesi önerilir.`;
      } else {
        insight = `Finansal dayanıklılığınız güçlü. Ancak %${data.inflationRate || 0} enflasyon ortamında sabit getirili varlıklarınızın reel değerini korumak için yatırımlarınızı tekrar gözden geçirmelisiniz.`;
      }
      setLiveInsight(insight);
      setIsInsightLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [data, metrics]);

  const handleInputChange = (field: keyof FinancialData, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    const numValue = parseFloat(cleanValue) || 0;
    if (field === 'monthlyExpenses') {
      // Scale categories proportionally when total expenses change
      setData(prev => scaleExpenseCategories(prev, numValue));
    } else {
      setData(prev => ({ ...prev, [field]: numValue }));
    }
  };

  /** Scale all expense categories proportionally to match new total */
  const scaleExpenseCategories = (prev: FinancialData, newTotal: number): FinancialData => {
    const cats = prev.expenseCategories;
    if (!cats) return { ...prev, monthlyExpenses: newTotal };
    const oldTotal = Object.values(cats).reduce((a, b) => a + b, 0);
    if (oldTotal === 0 || newTotal === 0) return { ...prev, monthlyExpenses: newTotal };
    const ratio = newTotal / oldTotal;
    return {
      ...prev,
      monthlyExpenses: newTotal,
      expenseCategories: {
        housing: Math.round(cats.housing * ratio),
        food: Math.round(cats.food * ratio),
        transport: Math.round(cats.transport * ratio),
        entertainment: Math.round(cats.entertainment * ratio),
        other: Math.round(cats.other * ratio),
      },
    };
  };

  const handleCategoryChange = (category: keyof ExpenseCategories, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    const numValue = parseFloat(cleanValue) || 0;
    setData(prev => {
      const newCategories = { ...(prev.expenseCategories as ExpenseCategories), [category]: numValue };
      const newTotal = Object.values(newCategories).reduce((a: any, b: any) => a + b, 0) as number;
      return { ...prev, expenseCategories: newCategories, monthlyExpenses: newTotal };
    });
  };

  const setStandardMacroValues = () => {
    setData(prev => ({
      ...prev,
      inflationRate: 68,          // TUİK Yıllık TÜFE Enflasyonu: %68
      marketVolatility: 60,       // Standart Piyasa Volatilitesi: %60
      riskTolerance: 50,          // Standart Risk Toleransı: %50
    }));
  };

  const runCustomScenario = async (type: string, details: string) => {
    setScenarioLoading(true);
    try {
      const res = await fetch("/api/scenario", {
        method: "POST",
        body: JSON.stringify({ baseData: data, scenarioType: type, details }),
      });
      if (!res.ok) throw new Error("Senaryo hatası");
      const result = await res.json();

      setSimulationResult({
        type: type,
        impact: result.analysis || result.impact || "Senaryo analizi tamamlandı. AI yanıtını inceleyin.",
        projection: result.projection,
        risks: result.risks,
        mitigation: result.mitigation,
      });
      setScenarioMode(false);
    } catch (err) {
      console.error(err);
      setSimulationResult({ type: "Hata", impact: "Simülasyon çalıştırılamadı." });
    } finally {
      setScenarioLoading(false);
    }
  };

  const runGoalPlanning = async () => {
    setGoalLoading(true);
    try {
      const res = await fetch("/api/goal", {
        method: "POST",
        body: JSON.stringify({ baseData: data, goalName, goalAmount, targetMonths }),
      });
      if (!res.ok) throw new Error("Hedef planlama hatası");
      const result = await res.json();
      setGoalResult(result);
    } catch (err) {
      console.error(err);
      setGoalResult({
        feasibility: "Hata",
        roadmap: [],
        advice: ["Sunucuya bağlanılamadı."]
      });
    } finally {
      setGoalLoading(false);
    }
  };

  const runPortfolioSimulation = async () => {
    setPortfolioLoading(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        body: JSON.stringify({ totalAmount: data.totalSavings, allocations }),
      });
      if (!res.ok) throw new Error("Portföy hatası");
      const result = await res.json();
      setPortfolioResult(result);
    } catch (err) {
      console.error(err);
      setPortfolioResult({
        expectedReturnRate: 0,
        projectedValue1Y: data.totalSavings,
        analysis: "Simülasyon yüklenemedi. Sunucu hatası.",
        risks: []
      });
    } finally {
      setPortfolioLoading(false);
    }
  };

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    setMultiAgentReport(null);
    setAiProcessingStep(1);

    // Progressive steps (visual feedback while 3 agents run in parallel)
    const stepLabels = [
      "Makro Ajan: Ekonomik göstergeler analiz ediliyor...",
      "Kredi Ajanı: Borç/gelir profili değlerlendiriliyor...",
      "Sektör Ajanı: Piyasa riskleri taranıyor...",
      "Süpervizör: Ajanlar sentezleniyor...",
      "Rapor: Yapılandırılıyor...",
    ];
    for (let i = 0; i < stepLabels.length; i++) {
      setAiProcessingStep(i + 1);
      await new Promise(r => setTimeout(r, 700));
    }

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, metrics }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const detail: string = errBody?.detail ?? errBody?.error ?? "Bilinmeyen sunucu hatası.";
        throw new Error(detail);
      }
      const report: MultiAgentReport = await res.json();
      setAiProcessingStep(0);
      setMultiAgentReport(report);

      // If supervisor has projection data, also update simulationResult for chart
      if (report.supervisor.projection?.length) {
        setSimulationResult({
          type: "Çoklu Ajan",
          impact: report.supervisor.verdict,
          projection: report.supervisor.projection,
        });
      }
    } catch (err: any) {
      console.error(err);
      // Show meaningful error — includes model cascade failures, network issues, etc.
      const msg: string = err?.message ?? "Bağlantı hatası.";
      if (msg.includes("quota") || msg.includes("429")) {
        setError("Tüm AI model kotaları tükendi. Lütfen birkaç dakika bekleyip tekrar deneyin.");
      } else if (msg.includes("API key") || msg.includes("403")) {
        setError("Geçersiz API anahtarı. Lütfen .env.local dosyasındaki GEMINI_API_KEY değerini kontrol edin.");
      } else {
        setError(`Sunucu hatası: ${msg.slice(0, 120)}`);
      }
      setAiProcessingStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = useCallback(async () => {
    if (!multiAgentReport) return;
    setIsPdfLoading(true);
    setIsExportingReport(true);
    try {
      // Bekleme: React'in isExportingReport state'ini DOM'a yansıtması için
      await new Promise(r => setTimeout(r, 200));

      const { jsPDF } = await import("jspdf");
      const htmlToImage = await import("html-to-image");
      const element = document.getElementById("ai-report-content");
      if (!element) return;

      const isDark = document.documentElement.classList.contains("dark");
      const bgColor = isDark ? "#020817" : "#ffffff";

      // Mobilde taşma/daralma olmaması için sabit min-width verebiliriz (isteğe bağlı)
      const imgData = await htmlToImage.toPng(element, {
        pixelRatio: 2,
        backgroundColor: bgColor,
        style: { background: bgColor, width: element.scrollWidth + 'px' }
      });

      const dummyPdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = dummyPdf.internal.pageSize.getWidth();
      const imgProps = dummyPdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Tek, tam boyutta bir sayfa oluşturarak alttaki beyaz boşluğu yok ediyoruz
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Finansal_Risk_Raporu_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error("PDF oluşturma hatası:", e);
    } finally {
      setIsExportingReport(false);
      setIsPdfLoading(false);
    }
  }, [multiAgentReport]);

  const exportPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const htmlToImage = await import("html-to-image");
      const element = document.getElementById("pdf-content");
      if (!element) return;
      const isDark = document.documentElement.classList.contains("dark");
      const bgColor = isDark ? "#020817" : "#ffffff";
      const imgData = await htmlToImage.toPng(element, {
        pixelRatio: 2,
        backgroundColor: bgColor,
        style: { background: bgColor }
      });
      const dummyPdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = dummyPdf.internal.pageSize.getWidth();
      const imgProps = dummyPdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Tek, kesintisiz PDF sayfası oluştur
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Finansal_Analiz.pdf");
    } catch (e) {
      console.error("PDF oluşturma hatası:", e);
    }
  };


  const startDemo = async () => {
    const demoData = {
      monthlyIncome: 85000,
      monthlyExpenses: 42000,
      expenseCategories: { housing: 18000, food: 12000, transport: 5000, entertainment: 4000, other: 3000 },
      totalSavings: 150000,
      totalDebt: 300000,
      monthlyDebtPayment: 18000,
      inflationRate: 65,
      marketVolatility: 75,
      riskTolerance: 60,
    };

    // Smooth transition
    setData(demoData);
    setLoading(true);
    setTimeout(() => {
      runSimulation();
    }, 1500);
  };

  const chartData = useMemo(() => {
    if (!futureProjection.data?.length) return [];

    // Get the actual baseline starting net worth
    const actualStart = futureProjection.data[0].netWorth;

    // Get the simulated starting net worth if available
    const simulatedStart = simulationResult?.projection?.[0];

    // Calculate alignment offset if there is a simulated projection
    const offset = (simulatedStart !== undefined && simulatedStart !== null)
      ? actualStart - simulatedStart
      : 0;

    return futureProjection.data.map((item, idx) => {
      let senaryoVal = null;
      if (simulationResult?.projection && idx < simulationResult.projection.length) {
        const val = simulationResult.projection[idx];
        if (val !== null && val !== undefined) {
          senaryoVal = Math.round(val + offset);
        }
      }
      return {
        name: `${item.month}. Ay`,
        bakiye: item.savings,
        borc: item.debt,
        net: item.netWorth,
        senaryo: senaryoVal
      };
    });
  }, [futureProjection, simulationResult]);

  const storyEvents = useMemo(() => {
    // 1. Matematik motorumuzdan gelen gerçek simülasyon olaylarını al ve 'desc' formatına eşle
    const events = futureProjection.events.map(ev => ({
      month: ev.month,
      type: ev.type,
      title: ev.title,
      desc: ev.description
    }));

    // 2. Eğer AI simülasyon sonucu varsa, Yapay Zekanın tespit ettiği ilk riski ve aksiyon önerisini yerleştir
    if (simulationResult?.risks?.length) {
      events.push({
        month: 3,
        type: 'warning',
        title: 'AI Tespit Edilen Risk',
        desc: simulationResult.risks[0]
      });
    }
    if (simulationResult?.mitigation?.length) {
      events.push({
        month: 8,
        type: 'info',
        title: 'AI Aksiyon Önerisi',
        desc: simulationResult.mitigation[0]
      });
    }

    // 3. Eğer aktif bir senaryo (turuncu kesik çizgi) varsa, 12. ayda baz durumla farkını karşılaştır
    if (simulationResult?.projection?.length) {
      const lastMonthIdx = chartData.length - 1;
      const current = chartData[lastMonthIdx];
      if (current && current.senaryo !== null) {
        const diff = current.senaryo - current.net;
        if (diff > 0) {
          events.push({
            month: 12,
            type: 'success',
            title: `Senaryo Etkisi: ${simulationResult.type}`,
            desc: `Simüle edilen karar sonucunda 12. ayın sonunda net değeriniz baz senaryoya göre ${formatNumber(Math.round(diff))} TL artış gösterdi. Finansal gücünüzü artıran bir hamle.`
          });
        } else if (diff < 0) {
          events.push({
            month: 12,
            type: 'critical',
            title: `Senaryo Riski: ${simulationResult.type}`,
            desc: `Simüle edilen karar sonucunda 12. ayın sonunda net değeriniz baz senaryoya kıyasla ${formatNumber(Math.round(Math.abs(diff)))} TL azaldı. Nakit dengenizi korumak için önlem almalısınız.`
          });
        }
      }
    }

    // Aylara göre sırala
    return events.sort((a, b) => a.month - b.month);
  }, [futureProjection, simulationResult, chartData]);

  const pieData = useMemo(() => [
    { name: 'Kira/Ev', value: data.expenseCategories?.housing || 0, color: '#3b82f6' },
    { name: 'Gıda', value: data.expenseCategories?.food || 0, color: '#10b981' },
    { name: 'Ulaşım', value: data.expenseCategories?.transport || 0, color: '#f59e0b' },
    { name: 'Eğlence', value: data.expenseCategories?.entertainment || 0, color: '#f43f5e' },
    { name: 'Diğer', value: data.expenseCategories?.other || 0, color: '#8b5cf6' },
  ], [data.expenseCategories]);

  const getScoreColor = (score: number) => {
    if (score < 30) return "text-green-500";
    if (score < 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score < 30) return "bg-green-500/10";
    if (score < 60) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  return (
    <>
      {/* Live Market Ticker */}
      <div className="w-full bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs py-2 border-b border-slate-200 dark:border-slate-800 flex justify-center items-center gap-6 font-mono overflow-x-auto whitespace-nowrap px-4">
        <span className="flex items-center gap-1.5"><span className="text-slate-500">USD/TRY</span> <span className={marketData.usdDir > 0 ? "text-emerald-500 font-bold" : "text-red-500 font-bold"}>{marketData.usd.toFixed(2)}</span> {marketData.usdDir > 0 ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}</span>
        <span className="flex items-center gap-1.5"><span className="text-slate-500">EUR/TRY</span> <span className={marketData.eurDir > 0 ? "text-emerald-500 font-bold" : "text-red-500 font-bold"}>{marketData.eur.toFixed(2)}</span> {marketData.eurDir > 0 ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}</span>
        <span className="flex items-center gap-1.5"><span className="text-slate-500">BTC/USD</span> <span className={marketData.btcDir > 0 ? "text-emerald-500 font-bold" : "text-red-500 font-bold"}>{formatNumber(marketData.btc)}</span> {marketData.btcDir > 0 ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}</span>
        <span className="flex items-center gap-1.5"><span className="text-slate-500">BIST 100</span> <span className={marketData.bistDir > 0 ? "text-emerald-500 font-bold" : "text-red-500 font-bold"}>{formatNumber(marketData.bist)}</span> {marketData.bistDir > 0 ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}</span>
        <span className="flex items-center gap-1.5"><span className="text-slate-500">TR ENF (Yıllık)</span> <span className="text-amber-500 font-bold">% {marketData.enf}</span></span>
      </div>
      <div id="pdf-content" className="min-h-screen bg-background p-4 md:p-8 space-y-8">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative min-h-[60vh] justify-center text-center xl:text-left">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl opacity-50 dark:opacity-20 transform-gpu translate-z-0"></div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl opacity-50 dark:opacity-20 transform-gpu translate-z-0"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl opacity-50 dark:opacity-20 transform-gpu translate-z-0"></div>
            {/* Live animated stock market line background */}
            <StockBackground />
          </div>

          <div className="page-fade-up relative z-10 flex-1 max-w-4xl mx-auto xl:mx-0 flex flex-col items-center xl:items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-slate-700 dark:text-slate-300">Yeni Nesil Finansal Simülasyon Motoru</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1]">
              <span className="block pb-1">
                <DiaTextReveal
                  text="Geleceğinizi"
                  colors={["#2563eb", "#10b981", "#9333ea"]}
                  textColor="hsl(var(--foreground))"
                  duration={1.2}
                  delay={0.1}
                />
              </span>
              <span className="block pb-2">
                <DiaTextReveal
                  text="Yapay Zeka İle Görün"
                  colors={["#2563eb", "#10b981", "#9333ea"]}
                  textColor="hsl(var(--foreground))"
                  duration={1.5}
                  delay={0.6}
                />
              </span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed mb-8 text-center xl:text-left">
              Finansal kararlarınızın yıllar sonraki etkisini anında simüle edin. Riskleri önceden görün, yatırımlarınızı optimize edin.
            </p>

            {/* Glowing CTA Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Button
                onClick={startDemo}
                className="relative group w-full sm:w-auto overflow-hidden rounded-full px-8 py-6 text-lg font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-70 transition duration-300 group-hover:duration-200"></div>
                <span className="relative flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  AI Stres Testi ve Risk Analizini Başlat (Demo Modu)
                </span>
              </Button>
              <Button variant="outline" className="w-full sm:w-auto rounded-full px-8 py-6 text-lg gap-2" onClick={runSimulation} disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GeminiLogo className="w-5 h-5" />}
                Kendi Verinle Test Et
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-10 text-sm font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-emerald-500" /> Çoklu Senaryo</div>
              <div className="flex items-center gap-2"><Fingerprint className="w-4 h-4 text-blue-500" /> Tam Kişiselleştirme</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-purple-500" /> Anlık Projeksiyon</div>
            </div>
          </div>

          <div className="page-fade-right flex flex-col gap-4 items-end z-10 absolute top-0 right-0">
            {mounted && (
              <AnimatedThemeToggler
                variant="circle"
                className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-500 dark:text-amber-500 transition-colors shadow-sm"
                onChange={(isDark) => setTheme(isDark ? 'dark' : 'light')}
              />
            )}
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" className="gap-2 justify-start shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-md" onClick={() => { setGoalMode(true); setScenarioMode(false); setPortfolioMode(false); }}>
                <Target className="w-4 h-4 text-emerald-500" />
                Hedef Planlama
              </Button>
              <Button variant="outline" size="sm" className="gap-2 justify-start shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-md" onClick={() => { setScenarioMode(!scenarioMode); setGoalMode(false); setPortfolioMode(false); }}>
                <Zap className="w-4 h-4 text-amber-500" />
                Özel Senaryolar
              </Button>
              <Button variant="outline" size="sm" className="gap-2 justify-start shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-md" onClick={() => { setPortfolioMode(true); setScenarioMode(false); setGoalMode(false); }}>
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Portföy Simülatörü
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 justify-start text-xs text-slate-400" onClick={exportPDF}>
                <Download className="w-3 h-3" /> PDF Rapor
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 justify-start text-xs text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" onClick={() => window.location.reload()}>
                <RefreshCcw className="w-3 h-3" /> Tümünü Sıfırla
              </Button>
            </div>
          </div>
        </header>

        {/* AI Finansal Zeka Motoru — Ana İçeriğin En Üstünde */}
        <div className="space-y-4" id="ai-engine-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <GeminiLogo className="w-7 h-7" />
              AI Finansal Zeka Motoru
              <Badge variant="outline" className="text-[10px] font-normal border-blue-300 text-blue-600 dark:text-blue-400 ml-1">
                Powered by Gemini AI
              </Badge>
            </h2>
            {/* RAG source badges */}
            {multiAgentReport && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Kaynaklar:</span>
                {multiAgentReport.ragSources?.map((src, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-blue-500 inline-block" />
                    {src}
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <Card className="bg-slate-900 text-white border-0 overflow-hidden shadow-2xl relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <CardContent className="py-12 flex flex-col items-center justify-center text-center relative z-10">
                <div className="flex gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className={cn("h-1 w-12 rounded-full transition-all duration-500", aiProcessingStep >= step ? "bg-blue-500" : "bg-slate-700")} />
                  ))}
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="mb-6 relative"
                >
                  <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 rounded-full"></div>
                  <GeminiLogo className="w-16 h-16 relative z-10" />
                </motion.div>
                <p className="text-xl font-bold text-white mb-2 font-mono h-8 flex items-center">
                  <span className="text-blue-400 mr-2">&gt;</span>
                  {aiProcessingStep === 1 && "TCMB & World Bank verileri çekiliyor..."}
                  {aiProcessingStep === 2 && "Kredi Ajanı: Borç/gelir profili değerlendiriliyor..."}
                  {aiProcessingStep === 3 && "Sektör Ajanı: Piyasa riskleri taranıyor..."}
                  {aiProcessingStep === 4 && "Süpervizör Ajan: Raporlar sentezleniyor..."}
                  {aiProcessingStep === 5 && "Yapılandırılmış rapor oluşturuluyor..."}
                  <span className="animate-pulse ml-1">_</span>
                </p>
                <p className="text-sm text-slate-400 font-mono">Çoklu Ajan Risk Motoru v2.0 • TCMB & World Bank verileri yükleniyor...</p>
              </CardContent>
            </Card>
          ) : multiAgentReport ? (
            <AIReportPanel
              report={multiAgentReport}
              onDownloadPDF={handleDownloadPDF}
              isPdfLoading={isPdfLoading}
              isExporting={isExportingReport}
            />
          ) : (
            <Card className="bg-slate-50 dark:bg-slate-900/30 border-dashed border-2 border-slate-200 dark:border-slate-800">
              <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <BarChart2 className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium text-lg mb-2">Simülasyon Bekleniyor</p>
                <p className="text-sm text-slate-500 max-w-sm mb-4">"AI Stres Testi ve Risk Analizini Başlat veya Kendi Verinle Test Et" butonlarına tıklayarak 4 AI ajanın paralel analizini başlatın.</p>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-400">
                  <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">🌍 Makro Ajan</span>
                  <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">💳 Kredi Ajanı</span>
                  <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">📊 Sektör Ajanı</span>
                  <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">🧠 Süpervizör</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Input Sidebar */}
          {/* Simulation Engine Parameters Sidebar */}
          <Card className="lg:col-span-1 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Simülasyon Motoru
              </CardTitle>
              <p className="text-xs text-slate-500">Değişkenleri kaydırarak anlık etkileri görün.</p>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 border-b pb-2">Kişisel Finans</h3>
                <div className="space-y-3">
                  <label className="text-sm font-medium flex justify-between items-center">
                    <span>Aylık Gelir</span>
                    <div className="flex items-center gap-1">
                      <Input
                        className="w-24 h-7 text-right font-bold px-1 py-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        value={data.monthlyIncome ? formatNumber(data.monthlyIncome) : ""}
                        onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                      />
                      <span className="text-xs font-bold">TL</span>
                    </div>
                  </label>
                  <Slider value={[data.monthlyIncome]} onValueChange={val => setData({ ...data, monthlyIncome: val[0] })} max={200000} step={1000} />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium flex justify-between items-center">
                    <span>Aylık Gider</span>
                    <div className="flex items-center gap-1">
                      <Input
                        className="w-24 h-7 text-right font-bold text-red-500 px-1 py-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        value={data.monthlyExpenses ? formatNumber(data.monthlyExpenses) : ""}
                        onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)}
                      />
                      <span className="text-xs font-bold text-red-500">TL</span>
                    </div>
                  </label>
                  <Slider value={[data.monthlyExpenses]} onValueChange={val => setData(prev => scaleExpenseCategories(prev, val[0]))} max={100000} step={500} />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium flex justify-between items-center">
                    <span>Toplam Birikim</span>
                    <div className="flex items-center gap-1">
                      <Input
                        className="w-28 h-7 text-right font-bold text-emerald-500 px-1 py-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        value={data.totalSavings ? formatNumber(data.totalSavings) : ""}
                        onChange={(e) => handleInputChange('totalSavings', e.target.value)}
                      />
                      <span className="text-xs font-bold text-emerald-500">TL</span>
                    </div>
                  </label>
                  <Slider value={[data.totalSavings]} onValueChange={val => setData({ ...data, totalSavings: val[0] })} max={1000000} step={5000} />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium flex justify-between items-center">
                    <span>Toplam Borç</span>
                    <div className="flex items-center gap-1">
                      <Input
                        className="w-28 h-7 text-right font-bold text-red-500 px-1 py-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        value={data.totalDebt ? formatNumber(data.totalDebt) : ""}
                        onChange={(e) => handleInputChange('totalDebt', e.target.value)}
                      />
                      <span className="text-xs font-bold text-red-500">TL</span>
                    </div>
                  </label>
                  <Slider value={[data.totalDebt]} onValueChange={val => setData({ ...data, totalDebt: val[0] })} max={1000000} step={5000} />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 border-b pb-2">Makro Ekonomi & Risk</h3>
                <div className="space-y-3">
                  <label className="text-sm font-medium flex justify-between items-center">
                    <span>Beklenen Enflasyon</span>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500 font-bold text-xs">%</span>
                      <Input
                        className="w-16 h-7 text-right font-bold text-amber-500 px-1 py-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        value={data.inflationRate || ""}
                        onChange={(e) => handleInputChange('inflationRate', e.target.value)}
                      />
                    </div>
                  </label>
                  <Slider value={[data.inflationRate || 0]} onValueChange={val => setData({ ...data, inflationRate: val[0] })} max={150} step={1} />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium flex justify-between items-center">
                    <span>Piyasa Volatilitesi</span>
                    <div className="flex items-center gap-1">
                      <Input
                        className="w-16 h-7 text-right font-bold text-purple-500 px-1 py-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        value={data.marketVolatility || ""}
                        onChange={(e) => handleInputChange('marketVolatility', e.target.value)}
                      />
                      <span className="text-purple-500 font-bold text-xs">/ 100</span>
                    </div>
                  </label>
                  <Slider value={[data.marketVolatility || 0]} onValueChange={val => setData({ ...data, marketVolatility: val[0] })} max={100} step={1} />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium flex justify-between items-center">
                    <span>Risk Toleransı</span>
                    <div className="flex items-center gap-1">
                      <Input
                        className="w-16 h-7 text-right font-bold text-blue-500 px-1 py-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        value={data.riskTolerance || ""}
                        onChange={(e) => handleInputChange('riskTolerance', e.target.value)}
                      />
                      <span className="text-blue-500 font-bold text-xs">/ 100</span>
                    </div>
                  </label>
                  <Slider value={[data.riskTolerance || 0]} onValueChange={val => setData({ ...data, riskTolerance: val[0] })} max={100} step={1} />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={setStandardMacroValues}
                  className="w-full mt-2 text-[11px] font-bold gap-1.5 border-dashed border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                >
                  <RefreshCcw className="w-3.5 h-3.5 animate-spin-hover" />
                  Makro Değerleri Standart Yap (TCMB & TÜİK)
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* Main Dashboard Content */}
          <div className="lg:col-span-3 space-y-6">

            {/* AI Live Insight Panel */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-white border-0 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <CardContent className="p-5 flex items-start gap-4">
                <div className="shrink-0 mt-1">
                  {isInsightLoading ? (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping"></div>
                      <GeminiLogo className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <GeminiLogo className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-primary mb-1 flex items-center gap-2">
                    Yapay Zeka Analiz Motoru
                    {isInsightLoading && <span className="text-xs text-slate-500 dark:text-slate-400 font-normal animate-pulse">Analiz ediliyor...</span>}
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed transition-opacity duration-300">
                    {liveInsight}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={cn("border-l-4 relative overflow-hidden", metrics.riskScore < 40 ? "border-l-green-500" : "border-l-red-500")}>
                <CardContent className="pt-6 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="group relative">
                      <p className="text-sm font-medium text-slate-500">Risk Profili</p>
                      <h3 className={cn("text-2xl font-bold mt-1", getScoreColor(metrics.riskScore))}>
                        {metrics.riskCategory}
                      </h3>
                    </div>
                    <ShieldCheck className={cn("w-8 h-8", getScoreColor(metrics.riskScore))} />
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div
                      className={cn("h-full transition-all", metrics.riskScore < 30 ? "bg-green-500" : metrics.riskScore < 60 ? "bg-yellow-500" : "bg-red-500")}
                      style={{ width: `${metrics.riskScore}%` }}
                    />
                  </div>

                  {metrics.riskBreakdown && metrics.riskBreakdown.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg mt-4 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><GeminiLogo className="w-3 h-3" /> AI Skor Dağılımı</p>
                      <ul className="space-y-2">
                        {metrics.riskBreakdown.map((item, i) => (
                          <li key={i} className="text-xs flex justify-between items-center group">
                            <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">{item.name}</span>
                            <span className={cn("font-bold px-1.5 py-0.5 rounded text-[10px]", item.impact > 0 ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400")}>
                              {item.impact > 0 ? "+" : ""}{item.impact}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="group relative">
                      <div className="flex items-center gap-1 cursor-help">
                        <p className="text-sm font-medium text-slate-500">Acil Durum Fonu</p>
                        <Info className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="absolute left-0 top-6 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                        Hiç geliriniz olmasa bile, mevcut birikimlerinizle aylık zorunlu giderlerinizi ve borçlarınızı kaç ay boyunca ödeyebileceğinizi gösterir. Uzmanlar en az 3-6 ay olmasını önerir.
                      </div>
                      <h3 className="text-2xl font-bold text-blue-600 mt-1">
                        <CountUp end={metrics.emergencyFundMonths} decimals={1} duration={1.5} preserveValue /> Ay
                      </h3>
                    </div>
                    <Wallet className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Mevcut harcama hızıyla dayanma süresi</p>
                </CardContent>
              </Card>

              <Card className={cn("border-l-4", metrics.debtToIncomeRatio < 36 ? "border-l-green-500" : "border-l-red-500")}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Borç/Gelir Oranı</p>
                      <h3 className={cn("text-2xl font-bold", metrics.debtToIncomeRatio < 36 ? "text-green-600" : "text-red-600")}>
                        %<CountUp end={metrics.debtToIncomeRatio} decimals={1} duration={1.5} preserveValue />
                      </h3>
                    </div>
                    <CreditCard className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">İdeal oran: %36 altı</p>
                </CardContent>
              </Card>
            </div>

            {simulationResult && (
              <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 animate-in fade-in slide-in-from-top-4 duration-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-500 p-2 rounded-full mt-1">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-amber-900 dark:text-amber-400 text-lg">Senaryo Analizi: {simulationResult.type}</h4>
                        <Button variant="ghost" size="sm" onClick={() => setSimulationResult(null)}>Kapat</Button>
                      </div>
                      <p className="text-sm text-amber-800 dark:text-amber-200/80 mb-4">{simulationResult.impact}</p>

                      {(simulationResult.risks || simulationResult.mitigation) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {simulationResult.risks && simulationResult.risks.length > 0 && (
                            <div className="bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                              <h5 className="font-semibold text-amber-900 dark:text-amber-400 mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Riskler
                              </h5>
                              <ul className="space-y-1">
                                {simulationResult.risks.map((r, i) => (
                                  <li key={i} className="text-sm text-amber-800 dark:text-amber-200/80 flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {simulationResult.mitigation && simulationResult.mitigation.length > 0 && (
                            <div className="bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                              <h5 className="font-semibold text-amber-900 dark:text-amber-400 mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Çözüm Önerileri
                              </h5>
                              <ul className="space-y-1">
                                {simulationResult.mitigation.map((m, i) => (
                                  <li key={i} className="text-sm text-amber-800 dark:text-amber-200/80 flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                    {m}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Charts Row — dynamically loaded to prevent blocking first paint */}
            <DashboardCharts
              chartData={chartData}
              pieData={pieData}
              storyEvents={storyEvents}
              simulationResult={simulationResult}
              monthlyIncome={data.monthlyIncome}
              monthlyExpenses={data.monthlyExpenses}
              monthlyDebtPayment={data.monthlyDebtPayment}
              expenseCategories={data.expenseCategories as any}
              isExpensesExpanded={isExpensesExpanded}
              onToggleExpenses={() => setIsExpensesExpanded(!isExpensesExpanded)}
              onCategoryChange={(cat, val) => handleCategoryChange(cat as any, val)}
              formatNumber={formatNumber}
            />

          </div>  {/* end lg:col-span-3 inner content */}
        </div>  {/* end grid grid-cols-1 lg:grid-cols-4 */}

        {/* Scenario Comparison Matrix */}
        <div className="space-y-4 pt-4">
          <div
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setShowAdvancedStressTest(!showAdvancedStressTest)}
          >
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500" />
              Makro Senaryo Şok Testi
              <Badge variant="outline" className="text-[10px] font-normal ml-2 border-amber-200 text-amber-600 dark:border-amber-900/50 dark:text-amber-500">Gelişmiş Analiz</Badge>
            </h2>
            <Button variant="ghost" size="sm" className="p-0 h-8 w-8 text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors pointer-events-none">
              {showAdvancedStressTest ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
          {showAdvancedStressTest && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 fade-in duration-300">
              <Card className="bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-500">Mevcut Durum</CardTitle>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Baz Senaryo</p>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1"><span>Enflasyon</span><span className="font-medium">%{data.inflationRate || 0}</span></div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1"><span>Risk Skoru</span><span className="font-medium text-amber-500">{metrics.riskScore}</span></div>
                  <div className="flex justify-between"><span>Aylık Bakiye</span><span className="font-medium text-emerald-500">+{formatNumber(data.monthlyIncome - data.monthlyExpenses - data.monthlyDebtPayment)} TL</span></div>
                </CardContent>
              </Card>

              <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-red-500">Şok Senaryosu</CardTitle>
                  <p className="text-lg font-bold text-red-800 dark:text-red-400">Hiperenflasyon</p>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between border-b border-red-200/50 dark:border-red-900/50 pb-1"><span>Enflasyon</span><span className="font-medium text-red-500">%120</span></div>
                  <div className="flex justify-between border-b border-red-200/50 dark:border-red-900/50 pb-1"><span>Risk Skoru</span><span className="font-medium text-red-500">{Math.min(100, metrics.riskScore + 35)}</span></div>
                  <div className="flex justify-between"><span>Reel Alım Gücü</span><span className="font-medium text-red-500">-%30</span></div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-500">Stres Senaryosu</CardTitle>
                  <div className="flex items-center gap-1.5 mt-1">
                    <p className="text-lg font-bold text-blue-800 dark:text-blue-400">Resesyon</p>
                    <div className="group relative inline-block">
                      <div className="cursor-help flex items-center justify-center">
                        <Info className="w-3.5 h-3.5 text-blue-400 hover:text-blue-500 transition-colors" />
                      </div>
                      <div className="absolute left-0 top-5 w-64 p-3 bg-slate-800 text-white text-xs font-normal rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 normal-case leading-relaxed">
                        Ekonomik faaliyetlerin geçici olarak daralması, üretimin azalması ve işsizliğin artması durumudur. Simülasyonda gelirlerinizin %20 azaldığı ve nakit akışınızın baskılandığı bir stres testi uygulanır.
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between border-b border-blue-200/50 dark:border-blue-900/50 pb-1"><span>Gelir Kaybı</span><span className="font-medium text-blue-500">-%20</span></div>
                  <div className="flex justify-between border-b border-blue-200/50 dark:border-blue-900/50 pb-1"><span>Risk Skoru</span><span className="font-medium text-blue-500">{Math.min(100, metrics.riskScore + 25)}</span></div>
                  <div className="flex justify-between"><span>Nakit Ömrü</span><span className="font-medium text-blue-500">{Math.max(0, metrics.emergencyFundMonths - 2).toFixed(1)} Ay</span></div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Simülasyon Motoru + Grafikler */}
        {/* Floating Simulation Panel (Simplified for Demo) */}
        {scenarioMode && (
          <div className="relative z-50">
            {/* Arka plan blur div'i (Scroll edilmeyen sabit kısım) */}
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />

            {/* İçerik ve Scroll container'ı */}
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Card className="w-full max-w-5xl shadow-2xl relative">
                  <CardHeader className="sticky top-0 bg-background z-10 border-b rounded-t-xl pb-4">
                    <CardTitle className="flex justify-between items-center">
                      <span className="flex items-center gap-2"><Zap className="text-amber-500 w-5 h-5" /> AI Senaryo Simülatörü</span>
                      <Button variant="ghost" onClick={() => setScenarioMode(false)}>Kapat</Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                      {/* Araç Kredisi Formu */}
                      <div className="p-5 border rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border-slate-200 dark:border-slate-800 flex flex-col">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-amber-500" />
                          Araç Kredisi
                        </h4>
                        <div className="space-y-4 flex-1">
                          <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex justify-between items-center">
                              <span>Araç Fiyatı (TL)</span>
                              <Input className="w-32 h-8 text-right font-bold" type="text" value={formatNumber(carPrice)} onChange={(e) => setCarPrice(parseFloat(e.target.value.replace(/[^0-9]/g, '')) || 0)} />
                            </label>
                          </div>
                          <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex justify-between items-center">
                              <span>Aylık Taksit (TL)</span>
                              <Input className="w-32 h-8 text-right font-bold" type="text" value={formatNumber(carInstallment)} onChange={(e) => setCarInstallment(parseFloat(e.target.value.replace(/[^0-9]/g, '')) || 0)} />
                            </label>
                          </div>
                        </div>
                        <Button
                          className="w-full mt-6 gap-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
                          onClick={() => runCustomScenario("Araç Kredisi", `${carPrice} TL değerinde araç alınacak. Aylık taksiti ${carInstallment} TL olacak.`)}
                          disabled={scenarioLoading}
                        >
                          {scenarioLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GeminiLogo className="w-4 h-4" />}
                          {scenarioLoading ? "Bekleyin..." : "Simüle Et"}
                        </Button>
                      </div>

                      {/* Konut Kredisi Formu */}
                      <div className="p-5 border rounded-xl bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors border-blue-200 dark:border-blue-900 flex flex-col">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                          <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          Konut Kredisi
                        </h4>
                        <div className="space-y-4 flex-1">
                          <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex justify-between items-center">
                              <span>Konut Fiyatı (TL)</span>
                              <Input className="w-32 h-8 text-right font-bold" type="text" value={formatNumber(housePrice)} onChange={(e) => setHousePrice(parseFloat(e.target.value.replace(/[^0-9]/g, '')) || 0)} />
                            </label>
                          </div>
                          <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex justify-between items-center">
                              <span>Aylık Taksit (TL)</span>
                              <Input className="w-32 h-8 text-right font-bold" type="text" value={formatNumber(houseInstallment)} onChange={(e) => setHouseInstallment(parseFloat(e.target.value.replace(/[^0-9]/g, '')) || 0)} />
                            </label>
                          </div>
                        </div>
                        <Button
                          className="w-full mt-6 gap-2 bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => runCustomScenario("Konut Kredisi", `${housePrice} TL değerinde konut alınacak. Aylık taksiti ${houseInstallment} TL olacak.`)}
                          disabled={scenarioLoading}
                        >
                          {scenarioLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GeminiLogo className="w-4 h-4" />}
                          {scenarioLoading ? "Bekleyin..." : "Simüle Et"}
                        </Button>
                      </div>

                      {/* Özel Senaryo Formu */}
                      <div className="p-5 border rounded-xl bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-colors border-purple-100 dark:border-purple-900 flex flex-col">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                          <GeminiLogo className="w-5 h-5" />
                          Özel Senaryo
                        </h4>
                        <div className="space-y-2 flex-1">
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Senaryo Detayı</label>
                          <textarea
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[108px] resize-none"
                            placeholder="Örn: Maaşıma %20 zam alırsam ve kiram 15.000 TL artarsa..."
                            value={customScenarioText}
                            onChange={(e) => setCustomScenarioText(e.target.value)}
                          />
                        </div>
                        <Button
                          className="w-full mt-6 gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => runCustomScenario("Özel Senaryo", customScenarioText)}
                          disabled={scenarioLoading || !customScenarioText}
                        >
                          {scenarioLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                          Özel Senaryoyu Simüle Et
                        </Button>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Simulator Panel */}
        {portfolioMode && (
          <div className="relative z-50">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Card className="w-full max-w-4xl shadow-2xl relative my-8">
                  <CardHeader className="sticky top-0 bg-background z-10 border-b rounded-t-xl pb-4">
                    <CardTitle className="flex justify-between items-center">
                      <span className="flex items-center gap-2"><TrendingUp className="text-purple-500 w-5 h-5" /> AI Portföy Simülatörü</span>
                      <Button variant="ghost" onClick={() => { setPortfolioMode(false); setPortfolioResult(null); }}>Kapat</Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {!portfolioResult ? (
                      <div className="space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Birikim Dağılımı (Toplam %100 Olmalı)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex justify-between items-center">
                                <span>Hisse Senedi (BIST) %</span>
                                <Input className="w-20 h-8 text-right font-bold text-primary" type="number" value={allocations.stock} onChange={e => setAllocations({ ...allocations, stock: parseInt(e.target.value) || 0 })} />
                              </label>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex justify-between items-center">
                                <span>Altın %</span>
                                <Input className="w-20 h-8 text-right font-bold text-primary" type="number" value={allocations.gold} onChange={e => setAllocations({ ...allocations, gold: parseInt(e.target.value) || 0 })} />
                              </label>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex justify-between items-center">
                                <span>Döviz (USD/EUR) %</span>
                                <Input className="w-20 h-8 text-right font-bold text-primary" type="number" value={allocations.fx} onChange={e => setAllocations({ ...allocations, fx: parseInt(e.target.value) || 0 })} />
                              </label>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex justify-between items-center">
                                <span>Vadeli Mevduat %</span>
                                <Input className="w-20 h-8 text-right font-bold text-primary" type="number" value={allocations.deposit} onChange={e => setAllocations({ ...allocations, deposit: parseInt(e.target.value) || 0 })} />
                              </label>
                            </div>
                          </div>
                          <div className="mt-4 text-sm font-medium text-slate-500">
                            Toplam: <span className={cn("font-bold", (allocations.stock + allocations.gold + allocations.fx + allocations.deposit) === 100 ? "text-green-500" : "text-red-500")}>
                              %{allocations.stock + allocations.gold + allocations.fx + allocations.deposit}
                            </span>
                          </div>
                        </div>
                        <Button
                          className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white border-0"
                          onClick={runPortfolioSimulation}
                          disabled={portfolioLoading || (allocations.stock + allocations.gold + allocations.fx + allocations.deposit) !== 100}
                        >
                          {portfolioLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GeminiLogo className="w-4 h-4" />}
                          {portfolioLoading ? "1 Yıllık Simülasyon Hesaplanıyor..." : "Portföyü Simüle Et"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl">
                            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">Beklenen 1 Yıllık Getiri</p>
                            <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">% {portfolioResult.expectedReturnRate}</h3>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4 rounded-xl">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-400">1 Yıl Sonra Tahmini Bakiye</p>
                            <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-500">{formatNumber(portfolioResult.projectedValue1Y)} TL</h3>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border p-4 rounded-xl">
                          <h4 className="font-bold mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary" />
                            Yapay Zeka Analizi
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{portfolioResult.analysis}</p>
                        </div>

                        {portfolioResult.risks && portfolioResult.risks.length > 0 && (
                          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4 rounded-xl">
                            <h4 className="font-bold text-red-900 dark:text-red-400 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" /> Dikkat Edilmesi Gereken Riskler
                            </h4>
                            <ul className="space-y-2">
                              {portfolioResult.risks.map((risk: string, i: number) => (
                                <li key={i} className="text-sm text-red-800 dark:text-red-200 flex items-start gap-2">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                  {risk}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <Button variant="outline" className="w-full mt-4" onClick={() => setPortfolioResult(null)}>Dağılımı Değiştir</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Goal Planning Panel */}
        {goalMode && (
          <div className="relative z-50">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Card className="w-full max-w-3xl shadow-2xl relative my-8">
                  <CardHeader className="sticky top-0 bg-white dark:bg-slate-950 z-10 border-b rounded-t-xl">
                    <CardTitle className="flex justify-between items-center">
                      <span className="flex items-center gap-2"><Target className="text-emerald-500 w-5 h-5" /> Hedef Planlama (AI)</span>
                      <Button variant="ghost" onClick={() => { setGoalMode(false); setGoalResult(null); }}>Kapat</Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {!goalResult ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Hedef Adı</label>
                            <Input className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="Örn: Ev Peşinatı" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Hedef Tutarı (TL)</label>
                            <Input className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" value={formatNumber(goalAmount)} onChange={e => setGoalAmount(parseFloat(e.target.value.replace(/[^0-9]/g, '')) || 0)} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Vade (Ay)</label>
                            <Input className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" type="number" value={targetMonths} onChange={e => setTargetMonths(parseInt(e.target.value) || 1)} />
                          </div>
                        </div>
                        <Button
                          className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                          onClick={runGoalPlanning}
                          disabled={goalLoading}
                        >
                          {goalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GeminiLogo className="w-4 h-4" />}
                          {goalLoading ? "Yol Haritası Çıkarılıyor..." : "Yol Haritası Oluştur"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl">
                          <h4 className="font-bold text-emerald-900 dark:text-emerald-400 mb-2">Fizibilite Analizi</h4>
                          <p className="text-sm text-emerald-800 dark:text-emerald-200">{goalResult.feasibility}</p>
                        </div>

                        <div>
                          <h4 className="font-bold mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            Aylık Yol Haritası
                          </h4>
                          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                            {goalResult.roadmap.map((step, idx) => (
                              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-emerald-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10">
                                  <span className="text-xs font-bold text-white">{step.month}.</span>
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
                                  <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Birikim Hedefi: {formatNumber(step.savingsTarget)} TL</div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">{step.action}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {goalResult.advice && goalResult.advice.length > 0 && (
                          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4 rounded-xl">
                            <h4 className="font-bold text-blue-900 dark:text-blue-400 mb-2">Tavsiyeler</h4>
                            <ul className="space-y-2">
                              {goalResult.advice.map((adv, i) => (
                                <li key={i} className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                  {adv}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <Button variant="outline" className="w-full mt-4" onClick={() => setGoalResult(null)}>Yeni Hedef Belirle</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Yasal Uyarı Footer */}
        <footer className="mt-12 py-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mx-auto flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              <strong>Yasal Uyarı:</strong> Bu platform yapay zeka destekli bir simülasyon aracıdır. Sunulan analizler, projeksiyonlar ve tavsiyeler tamamen matematiksel verilere ve varsayımsal makroekonomik şartlara dayanmaktadır; kesinlikle <strong>yatırım tavsiyesi kapsamında değerlendirilemez.</strong>
            </span>
          </p>
        </footer>
      </div>
    </>
  );
}
