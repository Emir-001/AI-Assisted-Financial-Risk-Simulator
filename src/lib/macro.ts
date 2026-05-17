/**
 * Macro data provider — fetches live data from TCMB XML and falls back to
 * curated static values if the API is unreachable.
 */

export interface MacroData {
  inflationRate: number;
  policyInterestRate: number;
  usdTryExchangeRate: number;
  eurTryExchangeRate: number;
  description: string;
}

// Cache for 30 minutes
let _cache: { data: MacroData; expiresAt: number } | null = null;

const FALLBACK: MacroData = {
  inflationRate: 65.0,
  policyInterestRate: 46.0,
  usdTryExchangeRate: 38.6,
  eurTryExchangeRate: 41.8,
  description:
    "Yüksek enflasyon ve sıkı para politikası (yüksek faiz) dönemi. TCMB enflasyonla mücadele kapsamında politika faizini yüksek tutmaktadır.",
};

async function fetchTcmbXml(): Promise<Partial<MacroData> | null> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml", {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(id);
    if (!res.ok) return null;

    const xml = await res.text();

    const extract = (code: string, field: string): number | null => {
      const m = xml.match(
        new RegExp(`CurrencyCode="${code}"[\\s\\S]*?<${field}>([\\d.]+)<\\/${field}>`)
      );
      return m ? parseFloat(m[1]) : null;
    };

    const usd = extract("USD", "ForexBuying");
    const eur = extract("EUR", "ForexBuying");

    if (!usd) return null;

    return {
      usdTryExchangeRate: usd,
      eurTryExchangeRate: eur ?? FALLBACK.eurTryExchangeRate,
    };
  } catch {
    return null;
  }
}

export async function fetchMacroData(): Promise<MacroData> {
  if (_cache && Date.now() < _cache.expiresAt) {
    return _cache.data;
  }

  const live = await fetchTcmbXml();

  const data: MacroData = {
    ...FALLBACK,
    ...(live ?? {}),
    description: live
      ? `TCMB resmi kuru: 1 USD = ${live.usdTryExchangeRate?.toFixed(2)} TL. Yüksek enflasyon ve sıkı para politikası dönemi devam ediyor.`
      : FALLBACK.description,
  };

  _cache = { data, expiresAt: Date.now() + 30 * 60 * 1000 };
  return data;
}
