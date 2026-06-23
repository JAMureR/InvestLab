export interface IndexFund {
  id: string;
  name: string;
  ticker: string;
  isin: string;
  historicalReturn1Y: number;
  historicalReturn5Y: number; // annualized
  riskRating: number; // 1-7 (SRRI scale)
  ter: number; // Total Expense Ratio as decimal (e.g., 0.0007 for 0.07%)
  region: string;
  category: string;
  volatility: number; // standard deviation as % (e.g., 14.2)
  beta: number; // relative to market (e.g., 1.00)
}

export interface RemuneratedAccount {
  id: string;
  name: string;
  percentageTAE: number; // e.g. 3.75 for 3.75%
  payoutFrequency: "mensual" | "trimestral" | "anual";
  liquidity: string; // e.g. "Inmediata"
  riskRating: number; // usually lower (1/7 or 2/7)
  logoUrl?: string;
  conditions: string;
}

export interface SimulationParams {
  capitalInicial: number;
  aportacionMensual: number;
  tiempoAnios: number;
  interesAnual: number; // %
  inflacionAnual: number; // %
  volatilidadAnual: number; // %
  perfilRiesgo: "conservador" | "moderado" | "agresivo";
  objetivoFinanciero?: number;
}

export interface SimulationResults {
  capitalAportado: number;
  beneficiosBrutos: number;
  beneficiosNetos: number; // after TER/tax (taxes can be conceptual or simplified in Spanish style: e.g., 19% on gains)
  valorFinal: number;
  valorRealAjustado: number;
  gananciaMensualPromedio: number;
  probabilidadExito: number; // percentage (e.g., 85)
  serieEvolucion: Array<{
    year: number;
    capitalAportado: number;
    valorOptimista: number;
    valorMedio: number;
    valorPesimista: number;
  }>;
}

export interface SavedSimulation {
  id: string;
  nombre: string;
  fecha: string;
  params: SimulationParams;
  resultados: {
    valorFinal: number;
    capitalAportado: number;
  };
}

export interface PortfolioAllocation {
  fundId: string;
  percentage: number; // 0 - 100
}

export type ViewType =
  | "simulador"
  | "indexados"
  | "remuneradas"
  | "admin";
