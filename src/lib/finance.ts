export interface ExpenseCategories {
  housing: number;
  food: number;
  transport: number;
  entertainment: number;
  other: number;
}

export interface FinancialData {
  monthlyIncome: number;
  monthlyExpenses: number;
  expenseCategories?: ExpenseCategories;
  totalSavings: number;
  totalDebt: number;
  monthlyDebtPayment: number;
  
  // Macro & Simulation variables
  inflationRate?: number; 
  marketVolatility?: number;
  riskTolerance?: number; 
}

export interface FinancialMetrics {
  debtToIncomeRatio: number;
  emergencyFundMonths: number;
  monthlyBurnRate: number;
  financialStressScore: number;
  savingsSustainability: number;
  riskScore: number;
  riskCategory: "Düşük Riskli" | "Orta Riskli" | "Yüksek Riskli";
  riskReasons: string[];
  riskBreakdown?: { name: string; impact: number }[];
}

export function calculateMetrics(data: FinancialData): FinancialMetrics {
  const { 
    monthlyIncome, monthlyExpenses, totalSavings, totalDebt, monthlyDebtPayment,
    inflationRate = 0, marketVolatility = 0, riskTolerance = 50 
  } = data;

  const dti = monthlyIncome > 0 ? (monthlyDebtPayment / monthlyIncome) * 100 : 100;

  const totalMonthlyOutflow = monthlyExpenses + monthlyDebtPayment;
  const emergencyFundMonths = totalMonthlyOutflow > 0 ? totalSavings / totalMonthlyOutflow : totalSavings > 0 ? 99 : 0;

  const monthlyBurnRate = Math.max(0, totalMonthlyOutflow - monthlyIncome);

  const riskReasons: string[] = [];
  const riskBreakdown: { name: string; impact: number }[] = [];

  let stressScore = 0;
  if (dti > 40) {
    stressScore += 40;
    riskReasons.push("Yüksek borç/gelir oranı (DTI)");
    riskBreakdown.push({ name: "Yüksek Borç Oranı", impact: 24 }); // 40 * 0.6
  } else {
    const dtiScore = (dti / 40) * 40;
    stressScore += dtiScore;
    if (dtiScore > 0) riskBreakdown.push({ name: "Borç/Gelir Yükü", impact: Math.round(dtiScore * 0.6) });
  }

  if (emergencyFundMonths < 3) {
    stressScore += 40;
    riskReasons.push("Düşük acil durum nakit rezervi");
    riskBreakdown.push({ name: "Yetersiz Acil Fon", impact: 24 });
  } else {
    const efScore = Math.max(0, (6 - emergencyFundMonths) * 10);
    stressScore += efScore;
    if (efScore > 0) riskBreakdown.push({ name: "Sınırlı Nakit Tamponu", impact: Math.round(efScore * 0.6) });
    else riskBreakdown.push({ name: "Güçlü Acil Fonu", impact: -15 }); // Reward
  }

  const debtToSavings = totalSavings > 0 ? totalDebt / totalSavings : totalDebt > 0 ? 10 : 0;
  const debtSavingsScore = Math.min(40, debtToSavings * 4);
  
  if (debtSavingsScore > 0) {
    riskBreakdown.push({ name: "Borç/Birikim Dengesi", impact: Math.round(debtSavingsScore) });
  }

  let riskScore = (stressScore * 0.6) + debtSavingsScore;
  
  if (debtToSavings > 2) {
    riskReasons.push("Birikimlere oranla yüksek toplam borç yükü");
  }

  if (inflationRate > 20) {
    riskScore += 10;
    riskReasons.push("Yüksek enflasyon nakit değerini aşındırıyor");
    riskBreakdown.push({ name: "Yüksek Enflasyon Riski", impact: 10 });
  }
  
  if (marketVolatility > 50) {
    riskScore += 10;
    riskBreakdown.push({ name: "Piyasa Volatilitesi", impact: 10 });
    if (riskTolerance < 40) {
       riskReasons.push("Piyasa volatilitesi, risk toleransınızla çelişiyor");
    } else {
       riskReasons.push("Yüksek piyasa volatilitesi portföy riskini artırıyor");
    }
  }

  if (monthlyBurnRate > 0) {
    riskReasons.push("Negatif aylık nakit akışı (Nakit Yakım Oranı yüksek)");
    riskScore += 15;
    riskBreakdown.push({ name: "Aylık Nakit Açığı", impact: 15 });
  } else if (monthlyBurnRate === 0 && dti < 30) {
    riskScore -= 10;
    riskBreakdown.push({ name: "Pozitif Nakit Akışı", impact: -10 });
  }

  riskScore = Math.min(100, Math.max(0, Math.round(riskScore)));

  let riskCategory: "Düşük Riskli" | "Orta Riskli" | "Yüksek Riskli" = "Orta Riskli";
  if (riskScore < 35) riskCategory = "Düşük Riskli";
  else if (riskScore > 65) riskCategory = "Yüksek Riskli";

  const effectiveBurnRate = monthlyBurnRate * (1 + (inflationRate / 100));
  const savingsSustainability = effectiveBurnRate > 0 ? totalSavings / effectiveBurnRate : 999;

  return {
    debtToIncomeRatio: dti,
    emergencyFundMonths,
    monthlyBurnRate,
    financialStressScore: Math.round(stressScore),
    savingsSustainability,
    riskScore,
    riskCategory,
    riskReasons,
    riskBreakdown
  };
}

export function simulateScenario(baseData: FinancialData, scenarioChanges: Partial<FinancialData>): FinancialMetrics {
  const simulatedData = { ...baseData, ...scenarioChanges };
  return calculateMetrics(simulatedData);
}

export interface TimelineEvent {
  month: number;
  type: 'critical' | 'warning' | 'success' | 'info';
  title: string;
  description: string;
}

export interface TimelineData {
  month: number;
  savings: number;
  debt: number;
  netWorth: number;
}

export interface FutureProjection {
  data: TimelineData[];
  events: TimelineEvent[];
}

export function calculateFutureProjection(data: FinancialData): FutureProjection {
  const {
    monthlyIncome, monthlyExpenses, totalSavings, totalDebt, monthlyDebtPayment,
    inflationRate = 0
  } = data;

  const projectionData: TimelineData[] = [];
  const events: TimelineEvent[] = [];

  let currentSavings = totalSavings;
  let currentDebt = totalDebt;
  
  // Aylık enflasyon tahmini
  const monthlyInflation = (inflationRate / 100) / 12;
  
  // Mevduat faizi tahmini (Enflasyonun biraz altında bir ortalama getiri varsayımı)
  const annualDepositRate = Math.max(0, inflationRate - 10);
  const monthlyDepositYield = (annualDepositRate / 100) / 12;

  let zeroSavingsTriggered = false;
  let zeroDebtTriggered = false;
  let salaryAdjusted = false;

  let currentIncome = monthlyIncome;

  for (let month = 1; month <= 12; month++) {
    // 6. Ayın sonunda (7. Ayda) Maaş Zammı (6 aylık birikimli enflasyon kadar zam)
    if (month === 7 && !salaryAdjusted) {
       const sixMonthInflation = Math.pow(1 + monthlyInflation, 6) - 1;
       currentIncome = currentIncome * (1 + sixMonthInflation);
       salaryAdjusted = true;
       events.push({ 
         month, 
         type: 'info', 
         title: 'Maaş Zammı (Enflasyon Farkı)', 
         description: `6 aylık birikmiş enflasyon (%${(sixMonthInflation*100).toFixed(1)}) oranında gelirinize zam yansıtıldı.` 
       });
    }

    // Birikimlerin faiz getirisi (Ay başı bakiyesi üzerinden)
    if (currentSavings > 0) {
       const interestEarned = currentSavings * monthlyDepositYield;
       currentSavings += interestEarned;
    }

    // Giderler enflasyon oranında artar
    const inflatedExpenses = monthlyExpenses * Math.pow(1 + monthlyInflation, month);
    
    // Aylık net nakit akışı
    const netCashFlow = currentIncome - inflatedExpenses - monthlyDebtPayment;
    
    currentSavings += netCashFlow;
    
    // Sabit borç ödemesi ile toplam borç azalıyor
    if (currentDebt > 0) {
      currentDebt = Math.max(0, currentDebt - monthlyDebtPayment);
    }
    
    // Birikim sıfırın altına düşerse, açık borca yazılır
    if (currentSavings < 0) {
      currentDebt += Math.abs(currentSavings);
      currentSavings = 0;
    }

    projectionData.push({
      month,
      savings: Math.round(currentSavings),
      debt: Math.round(currentDebt),
      netWorth: Math.round(currentSavings - currentDebt)
    });

    // Olay (Milestone) Tespiti
    if (month === 3 && netCashFlow < 0 && currentSavings > 0) {
       events.push({ month, type: 'warning', title: 'Nakit Akışı Negatif', description: `Gider artışları sebebiyle 3. ayda aylık net akışınız eksiye düşüyor. Birikimden yemeye başladınız.` });
    }
    
    if (currentSavings === 0 && !zeroSavingsTriggered) {
      events.push({ month, type: 'critical', title: 'Nakit Rezervleri Tükendi', description: `${month}. ayda likit birikimleriniz sıfırlanıyor ve zorunlu borçlanma sarmalı başlıyor.` });
      zeroSavingsTriggered = true;
    }

    if (currentDebt === 0 && !zeroDebtTriggered && totalDebt > 0) {
      events.push({ month, type: 'success', title: 'Borç Özgürlüğü!', description: `${month}. ayda tüm mevcut borçlarınızı tamamen kapatıyorsunuz.` });
      zeroDebtTriggered = true;
    }
  }

  // 12 aylık süreçte hiç kritik uyarı yoksa
  if (!events.some(e => e.type === 'critical')) {
     events.push({ month: 12, type: 'success', title: 'Dirençli Büyüme', description: '1 yıl boyunca maaş zamları ve mevduat getirileri sayesinde enflasyona yenilmeden büyümeyi başardınız.' });
  }

  return { data: projectionData, events };
}
