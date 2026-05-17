"use client";

import { useState, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input } from "@/components/ui";
import { AlertTriangle, Activity, TrendingUp, ShieldCheck, Zap, ChevronDown, ChevronUp, Pencil, Check } from "lucide-react";

interface ChartData {
  name: string;
  bakiye: number;
  borc: number;
  net: number;
  senaryo: number | null;
}

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

interface StoryEvent {
  month: number;
  type: string;
  title: string;
  desc: string;
}

interface ExpenseCategoryData {
  housing: number;
  food: number;
  transport: number;
  entertainment: number;
  other: number;
}

interface DashboardChartsProps {
  chartData: ChartData[];
  pieData: PieDataItem[];
  storyEvents: StoryEvent[];
  simulationResult: { projection?: number[] } | null;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyDebtPayment: number;
  expenseCategories: ExpenseCategoryData;
  isExpensesExpanded: boolean;
  onToggleExpenses: () => void;
  onCategoryChange: (cat: string, val: string) => void;
  formatNumber: (n: number) => string;
}

const PIE_KEYS = [
  { key: "housing",       label: "Kira/Ev",  color: "#3b82f6", colorClass: "bg-blue-500" },
  { key: "food",          label: "Gıda",     color: "#10b981", colorClass: "bg-emerald-500" },
  { key: "transport",     label: "Ulaşım",   color: "#f59e0b", colorClass: "bg-amber-500" },
  { key: "entertainment", label: "Eğlence",  color: "#f43f5e", colorClass: "bg-rose-500" },
  { key: "other",         label: "Diğer",    color: "#8b5cf6", colorClass: "bg-purple-500" },
];

export function DashboardCharts({
  chartData,
  pieData,
  storyEvents,
  simulationResult,
  monthlyIncome,
  monthlyExpenses,
  monthlyDebtPayment,
  expenseCategories,
  isExpensesExpanded,
  onToggleExpenses,
  onCategoryChange,
  formatNumber,
}: DashboardChartsProps) {
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);
  const [editingSlice, setEditingSlice] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // When a pie slice is clicked → open inline editor
  const handlePieClick = useCallback((_: any, index: number) => {
    const item = PIE_KEYS[index];
    setEditingSlice(index);
    setEditValue(String(expenseCategories[item.key as keyof ExpenseCategoryData]));
    // Also expand the detail panel
    if (!isExpensesExpanded) onToggleExpenses();
  }, [expenseCategories, isExpensesExpanded, onToggleExpenses]);

  const commitEdit = useCallback((index: number) => {
    const key = PIE_KEYS[index].key;
    onCategoryChange(key, editValue);
    setEditingSlice(null);
  }, [editValue, onCategoryChange]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
      {/* Timeline Chart */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              Finansal Gelecek Zaman Çizelgesi (12 Ay)
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </CardTitle>
            {/* Legend */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="inline-block w-6 h-[3px] rounded-full bg-blue-500" />
                  <span className="inline-block w-1 h-1 rounded-full bg-blue-500" />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Hiçbir etki altında olmayan senaryo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <span className="inline-block w-2 h-[3px] rounded-full bg-amber-500" />
                  <span className="inline-block w-1 h-[3px] rounded-full bg-transparent" />
                  <span className="inline-block w-2 h-[3px] rounded-full bg-amber-500" />
                  <span className="inline-block w-1 h-[3px] rounded-full bg-transparent" />
                  <span className="inline-block w-2 h-[3px] rounded-full bg-amber-500" />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">AI ile yapılan risk analizi sonucu</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-1">Net değer projeksiyonunuz ve tespit edilen finansal kilometre taşları.</p>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  formatter={(val: any) => `${formatNumber(val)} TL`}
                />
                <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3}
                  dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6 }} name="Net Değer (Mevcut Durum)" />
                {simulationResult?.projection && (
                  <Line type="monotone" dataKey="senaryo" stroke="#f59e0b" strokeWidth={3}
                    strokeDasharray="5 5" dot={{ r: 4, fill: "#f59e0b" }} activeDot={{ r: 6 }} name="Net Değer (Senaryo)" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Story Events Timeline */}
          <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Finansal Gelecek Senaryonuz
            </h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent">
              {storyEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="page-fade-up relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10 transition-transform group-hover:scale-110",
                    event.type === "critical" ? "bg-red-500" :
                    event.type === "warning" ? "bg-amber-500" :
                    event.type === "success" ? "bg-emerald-500" : "bg-blue-500"
                  )}>
                    {event.type === "critical" && <AlertTriangle className="w-4 h-4 text-white" />}
                    {event.type === "warning" && <Activity className="w-4 h-4 text-white" />}
                    {event.type === "success" && <TrendingUp className="w-4 h-4 text-white" />}
                    {event.type === "info" && <ShieldCheck className="w-4 h-4 text-white" />}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-white dark:bg-slate-950 shadow-sm transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                      <div className={cn("font-bold text-sm md:text-base",
                        event.type === "critical" ? "text-red-500" :
                        event.type === "warning" ? "text-amber-500" :
                        event.type === "success" ? "text-emerald-500" : "text-blue-500"
                      )}>{event.title}</div>
                      <Badge variant="outline" className="w-fit">{event.month}. Ay</Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{event.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Charts Row */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Nakit Akışı Dağılımı
              <Activity className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Gelir", miktar: monthlyIncome, color: "#22c55e" },
                  { name: "Gider", miktar: monthlyExpenses, color: "#ef4444" },
                  { name: "Borç", miktar: monthlyDebtPayment, color: "#f59e0b" },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="miktar">
                    {[0, 1, 2].map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#22c55e" : index === 1 ? "#ef4444" : "#f59e0b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart — click slice to edit */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between cursor-pointer" onClick={onToggleExpenses}>
              <CardTitle className="text-lg flex items-center gap-2">
                Gider Dağılımı
                <Activity className="w-4 h-4 text-slate-400" />
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 hidden sm:block">Dilime tıkla → düzenle</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  {isExpensesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                    onMouseLeave={() => setActivePieIndex(null)}
                    onClick={handlePieClick}
                    style={{ cursor: "pointer" }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={activePieIndex === null || activePieIndex === index ? 1 : 0.45}
                        stroke={activePieIndex === index ? entry.color : "transparent"}
                        strokeWidth={activePieIndex === index ? 3 : 0}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${formatNumber(Number(value))} TL`} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Expandable category editor */}
            <AnimatePresence>
              {isExpensesExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-4 pt-4 border-t border-slate-200 dark:border-slate-800"
                >
                  <div className="space-y-2.5">
                    {PIE_KEYS.map((item, index) => {
                      const val = expenseCategories[item.key as keyof ExpenseCategoryData];
                      const isEditing = editingSlice === index;
                      return (
                        <div key={item.key} className={cn(
                          "flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors",
                          isEditing ? "bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-300 dark:ring-blue-800" : "hover:bg-slate-50 dark:hover:bg-slate-900"
                        )}>
                          <span className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                            <div className={`w-2.5 h-2.5 rounded-full ${item.colorClass}`} />
                            {item.label}
                          </span>
                          <div className="flex items-center gap-1">
                            {isEditing ? (
                              <>
                                <Input
                                  className="w-24 h-6 text-right text-xs font-bold p-1 border-blue-300 dark:border-blue-700"
                                  value={editValue}
                                  autoFocus
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter") commitEdit(index); if (e.key === "Escape") setEditingSlice(null); }}
                                />
                                <button onClick={() => commitEdit(index)} className="p-1 text-blue-500 hover:text-blue-700 transition-colors">
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-20 text-right">
                                  {formatNumber(val)} TL
                                </span>
                                <button
                                  onClick={() => { setEditingSlice(index); setEditValue(String(val)); }}
                                  className="p-1 text-slate-300 hover:text-blue-500 transition-colors"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 text-center mt-3">Pie dilimlerine veya kalem ikonuna tıklayarak düzenle</p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
