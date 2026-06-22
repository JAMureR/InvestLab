import { IndexFund, RemuneratedAccount, SimulationParams, SimulationResults } from "../types";

// Box-Muller transform to generate standard normal random variables
export function randomNormal(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdDev + mean;
}

export const CATALOG_FUNDS: IndexFund[] = [
  {
    id: "vanguard-sp500",
    name: "Vanguard S&P 500 UCITS ETF",
    ticker: "VUSA.L",
    isin: "IE00B3XXRP09",
    historicalReturn1Y: 12.4,
    historicalReturn5Y: 11.8,
    riskRating: 6,
    ter: 0.0007, // 0.07%
    region: "EE.UU.",
    category: "Renta Variable Global Larga Cap",
    volatility: 14.2,
    beta: 1.00
  },
  {
    id: "vanguard-allworld",
    name: "Vanguard FTSE All-World UCITS ETF",
    ticker: "VWRL.L",
    isin: "IE00B3RBWM25",
    historicalReturn1Y: 9.8,
    historicalReturn5Y: 8.9,
    riskRating: 5,
    ter: 0.0022, // 0.22%
    region: "Global",
    category: "Renta Variable Global Mixta",
    volatility: 12.8,
    beta: 0.94
  },
  {
    id: "ishares-msciworld",
    name: "iShares Core MSCI World UCITS ETF",
    ticker: "IWDA.L",
    isin: "IE00B4L5Y983",
    historicalReturn1Y: 10.2,
    historicalReturn5Y: 9.2,
    riskRating: 5,
    ter: 0.0020, // 0.20%
    region: "Países Desarrollados",
    category: "Renta Variable Global Desarrollada",
    volatility: 13.1,
    beta: 0.96
  },
  {
    id: "amundi-msciworld",
    name: "Amundi MSCI World UCITS ETF",
    ticker: "CW8.PAR",
    isin: "LU1681043599",
    historicalReturn1Y: 10.1,
    historicalReturn5Y: 9.1,
    riskRating: 5,
    ter: 0.0038, // 0.38%
    region: "Global",
    category: "Renta Variable Global",
    volatility: 13.2,
    beta: 0.97
  },
  {
    id: "fidelity-msciworld",
    name: "Fidelity MSCI World Index Fund",
    ticker: "PMEH.F",
    isin: "IE00BYXVG742",
    historicalReturn1Y: 10.3,
    historicalReturn5Y: 9.3,
    riskRating: 5,
    ter: 0.0012, // 0.12%
    region: "Países Desarrollados",
    category: "Fondo de Inversión Indexado",
    volatility: 13.0,
    beta: 0.96
  },
  {
    id: "amundi-emerging",
    name: "Amundi MSCI Emerging Markets ETF",
    ticker: "AEEM.PA",
    isin: "LU1681045370",
    historicalReturn1Y: 6.8,
    historicalReturn5Y: 5.2,
    riskRating: 6,
    ter: 0.0020, // 0.20%
    region: "Emergentes",
    category: "Renta Variable Emergente",
    volatility: 16.5,
    beta: 1.12
  }
];

export const CATALOG_ACCOUNTS: RemuneratedAccount[] = [
  {
    id: "trade-republic",
    name: "Trade Republic Cuenta de Efectivo",
    percentageTAE: 3.75,
    payoutFrequency: "mensual",
    liquidity: "Inmediata (Sin penalización)",
    riskRating: 1,
    conditions: "Intereses pagados mensualmente sobre saldos de hasta 50.000 €; protegido por FGD de hasta 100.000 €."
  },
  {
    id: "revolut-flexible",
    name: "Revolut Cuenta Flexible (Pro)",
    percentageTAE: 3.10,
    payoutFrequency: "mensual",
    liquidity: "Inmediata",
    riskRating: 2,
    conditions: "Sujeto a retención. Variación según el plan suscrito (el interés se calcula diariamente y se liquida mensualmente)."
  },
  {
    id: "n26-ahorro",
    name: "N26 Cuenta de Ahorro",
    percentageTAE: 3.00,
    payoutFrequency: "mensual",
    liquidity: "Inmediata",
    riskRating: 1,
    conditions: "Sin cantidad mínima ni máxima. Cobertura del Fondo de Garantía de Depósitos alemán regulado por el Bundesbank."
  },
  {
    id: "norwegian-savings",
    name: "Bank Norwegian Ahorro Plus",
    percentageTAE: 3.30,
    payoutFrequency: "anual",
    liquidity: "Inmediata (Limitado a 6 retiros gratis al año)",
    riskRating: 1,
    conditions: "Banco noruego. Interés calculado diariamente y pagado anualmente. Retenciones deben declararse en el IRPF."
  },
  {
    id: "renault-bank",
    name: "Renault Bank Cuenta Contigo",
    percentageTAE: 2.89,
    payoutFrequency: "mensual",
    liquidity: "Inmediata",
    riskRating: 1,
    conditions: "Liquidación mensual de intereses. Contratación 100% digital, sin gastos de comisión por administración o mantenimiento."
  }
];

/**
 * Executes a simulated trajectory using Box-Muller normal distribution for Monte Carlo.
 * Runs 1,000 paths over the temporal range inside a client thread safely.
 */
export function ejecutarSimulacion(params: SimulationParams): SimulationResults {
  const {
    capitalInicial,
    aportacionMensual,
    tiempoAnios,
    interesAnual,
    inflacionAnual,
    volatilidadAnual
  } = params;

  const mu = interesAnual / 100;
  const sigma = volatilidadAnual / 100;
  const inflacion = inflacionAnual / 100;

  const numSImulations = 1000;
  const yearlySimulations: number[][] = []; 
  // Initial fill
  for (let s = 0; s < numSImulations; s++) {
    yearlySimulations.push([capitalInicial]);
  }

  // Iterate year by year to simulate Monte Carlo
  for (let year = 1; year <= tiempoAnios; year++) {
    for (let s = 0; s < numSImulations; s++) {
      // Return rate for this year following a normal distribution
      const r = randomNormal(mu, sigma);
      const preCapital = yearlySimulations[s][year - 1];
      
      // Multiplied by compound rate + annual accumulation of monthly savings added monthly
      // To simulate added contributions throughout the year:
      // An approximation is adding contributions progressively with partial returns:
      const contAnual = aportacionMensual * 12;
      // We assume on average contributions receive half of the year's return
      const postCapital = preCapital * (1 + r) + contAnual * (1 + r / 2);
      
      // Floor at zero (cannot lose more than 100% of capital)
      yearlySimulations[s].push(Math.max(0, postCapital));
    }
  }

  // Extract percentiles for each year of evolution
  const serieEvolucion = [];
  
  for (let year = 0; year <= tiempoAnios; year++) {
    // Collect all runs for this year and sort them
    const valuesThisYear = yearlySimulations.map(sim => sim[year]);
    valuesThisYear.sort((a, b) => a - b);

    // Percentiles:
    // Pesimista: 5th percentile (index 50 out of 1000)
    // Medio: 50th percentile / median (index 500 out of 1000)
    // Optimista: 95th percentile (index 950 out of 1000)
    const pesimistaIndex = Math.floor(numSImulations * 0.05);
    const medioIndex = Math.floor(numSImulations * 0.50);
    const optimistaIndex = Math.floor(numSImulations * 0.95);

    const valorPesimista = valuesThisYear[pesimistaIndex];
    const valorMedio = valuesThisYear[medioIndex];
    const valorOptimista = valuesThisYear[optimistaIndex];

    const totalInvertido = capitalInicial + (aportacionMensual * 12 * year);

    serieEvolucion.push({
      year,
      capitalAportado: totalInvertido,
      valorPesimista: Math.round(valorPesimista),
      valorMedio: Math.round(valorMedio),
      valorOptimista: Math.round(valorOptimista)
    });
  }

  // Final values
  const finalMedio = serieEvolucion[tiempoAnios].valorMedio;
  const capitalAportado = capitalInicial + (aportacionMensual * 12 * tiempoAnios);
  const beneficiosBrutos = Math.max(0, finalMedio - capitalAportado);
  
  // Spanish compound gains are taxed in tranches (19% for first 6000€, 21% up to 50000€ etc.)
  // Let's implement a simplified flat tax of 19% on financial gains for a professional touch!
  const retencionImpuestos = beneficiosBrutos * 0.19;
  const beneficiosNetos = Math.max(0, beneficiosBrutos - retencionImpuestos);

  // Inflation adjusted real future value:
  const valorRealAjustado = Math.round(finalMedio / Math.pow(1 + inflacion, tiempoAnios));

  // Average monthly gain over the period (pure interest gain divide by total months)
  const totalMonths = tiempoAnios * 12;
  const gananciaMensualPromedio = totalMonths > 0 ? beneficiosBrutos / totalMonths : 0;

  // Let's find out how many runs succeeded in reaching target or keeping real purchasing power
  const targetToReach = params.objetivoFinanciero && params.objetivoFinanciero > 0
    ? params.objetivoFinanciero
    : capitalAportado; // default target: beat nominal capital (break even)

  const successfulRuns = yearlySimulations.filter(sim => sim[tiempoAnios] >= targetToReach).length;
  const probabilidadExito = Math.round((successfulRuns / numSImulations) * 100);

  return {
    capitalAportado,
    beneficiosBrutos,
    beneficiosNetos,
    valorFinal: Math.round(finalMedio),
    valorRealAjustado,
    gananciaMensualPromedio: Math.round(gananciaMensualPromedio),
    probabilidadExito,
    serieEvolucion
  };
}
