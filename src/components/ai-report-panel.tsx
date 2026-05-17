"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from "@/components/ui";
import {
  ShieldCheck, AlertTriangle, TrendingUp, Globe, CreditCard,
  BarChart2, FileText, Upload, X, Download,
  CheckCircle2, ChevronRight, Zap, Clock, Flame
} from "lucide-react";
import type { MultiAgentReport } from "@/lib/agents";

interface AIReportPanelProps {
  report: MultiAgentReport;
  onDownloadPDF: () => void;
  isPdfLoading: boolean;
}

const severityColor = (s: string) => {
  if (s === "yüksek" || s === "high" || s === "kritik") return "text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900";
  if (s === "orta" || s === "medium" || s === "dikkat") return "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900";
  return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900";
};

const urgencyIcon = (u: string) => {
  if (u === "acil") return <Flame className="w-4 h-4 text-red-500" />;
  if (u === "önemli") return <Zap className="w-4 h-4 text-amber-500" />;
  return <Clock className="w-4 h-4 text-blue-500" />;
};

const scoreGradient = (score: number) => {
  if (score >= 70) return "from-emerald-500 to-green-400";
  if (score >= 40) return "from-amber-500 to-yellow-400";
  return "from-red-500 to-rose-400";
};

const GeminiLogo = ({ className }: { className?: string }) => (
  <img src="/Google-Gemini-Logo-Transparent.png" alt="Gemini" className={cn("object-contain", className)} />
);

export function AIReportPanel({ report, onDownloadPDF, isPdfLoading }: AIReportPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "macro" | "credit" | "sector">("overview");

  const tabs = [
    { id: "overview" as const, label: "Genel Bakış", icon: GeminiLogo },
    { id: "macro" as const, label: "Makro", icon: Globe },
    { id: "credit" as const, label: "Kredi", icon: CreditCard },
    { id: "sector" as const, label: "Sektör", icon: BarChart2 },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg bg-gradient-to-br",
            scoreGradient(report.supervisor.overallScore)
          )}>
            {report.supervisor.overallScore}
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Finansal Sağlık Skoru</p>
            <p className="font-bold text-slate-900 dark:text-white max-w-xs text-sm leading-snug">{report.supervisor.verdict}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Live data sources */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {report.ragSources?.map((src, i) => (
              <Badge key={i} variant="outline" className="gap-1 text-[10px] border-blue-200 text-blue-600 dark:text-blue-400 dark:border-blue-800">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                {src}
              </Badge>
            ))}
          </div>
          <Badge variant="outline" className="gap-1 text-xs border-emerald-300 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3 h-3" /> %{report.confidenceScore} Güven
          </Badge>
          <Button
            size="sm"
            onClick={onDownloadPDF}
            disabled={isPdfLoading}
            className="gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white text-xs"
          >
            {isPdfLoading ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3 h-3" />
            )}
            Raporu İndir
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200",
              activeTab === tab.id
                ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Supervisor Summary */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="pt-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{report.supervisor.summary}</p>
            </CardContent>
          </Card>

          {/* Top Priorities */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Öncelikli Eylem Planı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.supervisor.topPriorities.map((p, i) => (
                <div key={i} className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border",
                  p.urgency === "acil" ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900" :
                  p.urgency === "önemli" ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900" :
                  "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                )}>
                  <div className="mt-0.5">{urgencyIcon(p.urgency)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{p.action}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{p.expectedImpact}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0 capitalize">
                    {p.urgency.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Yapay Zeka Önerileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.supervisor.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <ChevronRight className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Agent Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className={cn("p-3 rounded-xl border text-center", severityColor(report.macro.inflationImpact))}>
              <Globe className="w-5 h-5 mx-auto mb-1 opacity-70" />
              <p className="text-[10px] uppercase tracking-wider font-medium opacity-70">Enflasyon</p>
              <p className="text-xs font-bold capitalize">{report.macro.inflationImpact === "high" ? "Yüksek" : report.macro.inflationImpact === "medium" ? "Orta" : "Düşük"}</p>
            </div>
            <div className={cn("p-3 rounded-xl border text-center", severityColor(report.credit.dtiRating))}>
              <CreditCard className="w-5 h-5 mx-auto mb-1 opacity-70" />
              <p className="text-[10px] uppercase tracking-wider font-medium opacity-70">DTI Riski</p>
              <p className="text-xs font-bold capitalize">{report.credit.dtiRating}</p>
            </div>
            <div className={cn("p-3 rounded-xl border text-center", severityColor(report.sector.primaryRisks[0]?.severity || "low"))}>
              <BarChart2 className="w-5 h-5 mx-auto mb-1 opacity-70" />
              <p className="text-[10px] uppercase tracking-wider font-medium opacity-70">Sektör Riski</p>
              <p className="text-xs font-bold capitalize">{report.sector.primaryRisks[0]?.severity || "Düşük"}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── MACRO TAB ── */}
      {activeTab === "macro" && (
        <div className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                Makroekonomik Analiz
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{report.macro.analysis}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className={cn("p-3 rounded-lg border text-center", severityColor(report.macro.inflationImpact))}>
                  <p className="text-[10px] uppercase tracking-wider opacity-70">Enflasyon Etkisi</p>
                  <p className="font-bold text-sm capitalize mt-0.5">
                    {report.macro.inflationImpact === "high" ? "Yüksek" : report.macro.inflationImpact === "medium" ? "Orta" : "Düşük"}
                  </p>
                </div>
                <div className={cn("p-3 rounded-lg border text-center", severityColor(report.macro.exchangeRiskLevel))}>
                  <p className="text-[10px] uppercase tracking-wider opacity-70">Kur Riski</p>
                  <p className="font-bold text-sm capitalize mt-0.5">
                    {report.macro.exchangeRiskLevel === "high" ? "Yüksek" : report.macro.exchangeRiskLevel === "medium" ? "Orta" : "Düşük"}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Faiz Görünümü</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{report.macro.interestRateOutlook}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Makro Ajan İçgörüleri</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.macro.keyInsights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</div>
                    {insight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── CREDIT TAB ── */}
      {activeTab === "credit" && (
        <div className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-500" />
                Kredi & Borç Risk Analizi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{report.credit.analysis}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className={cn("p-3 rounded-lg border text-center", severityColor(report.credit.dtiRating))}>
                  <p className="text-[10px] uppercase tracking-wider opacity-70">DTI Oranı</p>
                  <p className="font-bold text-sm capitalize mt-0.5">{report.credit.dtiRating}</p>
                </div>
                <div className={cn("p-3 rounded-lg border text-center",
                  report.credit.emergencyFundRating === "güçlü" || report.credit.emergencyFundRating === "yeterli"
                    ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200"
                    : report.credit.emergencyFundRating === "sınırlı"
                    ? "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200"
                    : "text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200"
                )}>
                  <p className="text-[10px] uppercase tracking-wider opacity-70">Acil Fon</p>
                  <p className="font-bold text-sm capitalize mt-0.5">{report.credit.emergencyFundRating}</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-900">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 opacity-70">Sürdürülebilirlik</p>
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{report.credit.debtSustainabilityMonths} ay</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Kredi Ajan İçgörüleri</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.credit.keyInsights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</div>
                    {insight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── SECTOR TAB ── */}
      {activeTab === "sector" && (
        <div className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-500" />
                Sektörel Risk Analizi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{report.sector.analysis}</p>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Başlıca Riskler</p>
                {report.sector.primaryRisks.map((risk, i) => (
                  <div key={i} className={cn("p-3 rounded-lg border flex items-start gap-3", severityColor(risk.severity))}>
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm">{risk.name}</p>
                        <Badge variant="outline" className="text-[10px] capitalize border-current">{risk.severity}</Badge>
                      </div>
                      <p className="text-xs opacity-80">{risk.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fırsatlar</p>
                {report.sector.opportunities.map((opp, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">{opp}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Sektör Ajan İçgörüleri</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.sector.keyInsights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</div>
                    {insight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
