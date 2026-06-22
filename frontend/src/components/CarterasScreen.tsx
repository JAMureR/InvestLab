import { useState, useMemo, useEffect } from "react";
import {
  Wallet,
  CheckCircle,
  AlertOctagon,
  Percent,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Plus
} from "lucide-react";
import { SimulationParams, PortfolioAllocation } from "../types";
import { CATALOG_FUNDS } from "../utils/finance";

interface CarterasScreenProps {
  params: SimulationParams;
  onSetParams: (params: SimulationParams) => void;
}

export default function CarterasScreen({ params, onSetParams }: CarterasScreenProps) {
  // Preset default allocations (70/20/10 layout in Spanish indices)
  const [allocations, setAllocations] = useState<PortfolioAllocation[]>([
    { fundId: "vanguard-allworld", percentage: 70 },
    { fundId: "ishares-msciworld", percentage: 20 },
    { fundId: "amundi-emerging", percentage: 10 }
  ]);
  const [successAnimation, setSuccessAnimation] = useState(false);

  // Read fund details helper
  const getFundDetail = (fundId: string) => {
    return CATALOG_FUNDS.find((f) => f.id === fundId);
  };

  const totalSum = useMemo(() => {
    return allocations.reduce((acc, curr) => acc + curr.percentage, 0);
  }, [allocations]);

  const isBalanced = totalSum === 100;

  // Calculte weighted portfolio characteristics
  const portfolioStats = useMemo(() => {
    let weightedReturn = 0;
    let weightedRisk = 0;
    let weightedVolatility = 0;
    let weightedTer = 0;

    allocations.forEach((item) => {
      const fund = getFundDetail(item.fundId);
      if (fund) {
        const fraction = item.percentage / 100;
        weightedReturn += fund.historicalReturn5Y * fraction;
        weightedRisk += fund.riskRating * fraction;
        weightedVolatility += fund.volatility * fraction;
        weightedTer += fund.ter * fraction;
      }
    });

    return {
      expectedReturn: weightedReturn,
      riskLevel: parseFloat(weightedRisk.toFixed(1)),
      volatility: parseFloat(weightedVolatility.toFixed(1)),
      weightedTer: parseFloat((weightedTer * 100).toFixed(3))
    };
  }, [allocations]);

  // Adjust percentage slider
  const handleSliderChange = (fundId: string, value: number) => {
    setAllocations((prev) =>
      prev.map((item) => (item.fundId === fundId ? { ...item, percentage: value } : item))
    );
  };

  // Add a new fund if NOT in the portfolio allocations list
  const handleAddFund = (fundId: string) => {
    if (allocations.some((item) => item.fundId === fundId)) return;
    setAllocations((prev) => [...prev, { fundId, percentage: 0 }]);
  };

  // Remove a fund from allocations
  const handleRemoveFund = (fundId: string) => {
    setAllocations((prev) => prev.filter((item) => item.fundId !== fundId));
  };

  // Preset quick allocation buttons
  const handlePresetSelect = (preset: "moderado" | "agresivo" | "equilibrado") => {
    if (preset === "moderado") {
      setAllocations([
        { fundId: "vanguard-allworld", percentage: 50 },
        { fundId: "ishares-msciworld", percentage: 30 },
        { fundId: "amundi-emerging", percentage: 20 }
      ]);
    } else if (preset === "agresivo") {
      setAllocations([
        { fundId: "vanguard-sp500", percentage: 80 },
        { fundId: "amundi-emerging", percentage: 20 }
      ]);
    } else {
      setAllocations([
        { fundId: "vanguard-allworld", percentage: 70 },
        { fundId: "ishares-msciworld", percentage: 20 },
        { fundId: "amundi-emerging", percentage: 10 }
      ]);
    }
  };

  const handleApplyPortfolio = () => {
    if (!isBalanced) return;
    onSetParams({
      ...params,
      interesAnual: portfolioStats.expectedReturn,
      volatilidadAnual: portfolioStats.volatility,
      perfilRiesgo: portfolioStats.riskLevel >= 5.8 ? "agresivo" : portfolioStats.riskLevel >= 4.5 ? "moderado" : "conservador"
    });
    setSuccessAnimation(true);
    setTimeout(() => setSuccessAnimation(false), 2000);
  };

  const formatPercent = (val: number) => {
    return `${val.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#1e293b]/70">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Diseñador de Carteras Personalizadas
          </h2>
          <p className="text-[#bbcabf] text-sm mt-1">
            Combina múltiples índices, distribuye ponderaciones y estimas el riesgo agregado de tu inversión
          </p>
        </div>
        
        {/* Quick layout buttons presets */}
        <div className="flex bg-slate-900 border border-[#2d3449] rounded-xl p-1 gap-1">
          <button
            onClick={() => handlePresetSelect("equilibrado")}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-slate-800 text-[#bbcabf] cursor-pointer"
          >
            Equilibrado (70/20/10)
          </button>
          <button
            onClick={() => handlePresetSelect("moderado")}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-slate-800 text-[#bbcabf] cursor-pointer"
          >
            Mixto Moderado
          </button>
          <button
            onClick={() => handlePresetSelect("agresivo")}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-slate-800 text-[#bbcabf] cursor-pointer"
          >
            S&P + Emerging
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Portfolio build list */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="font-bold text-white text-base mb-5 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#4edea3]" />
              <span>Distribución de la Cartera</span>
            </h3>

            <div className="space-y-6">
              {allocations.map((alloc) => {
                const fund = getFundDetail(alloc.fundId);
                if (!fund) return null;
                return (
                  <div
                    key={alloc.fundId}
                    className="p-4 bg-slate-900/40 border border-[#1e293b] rounded-xl space-y-3 hover:border-slate-800/80 transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-white text-sm md:text-base leading-tight">
                          {fund.name}
                        </h4>
                        <span className="font-mono text-[9px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded leading-none mt-1 inline-block">
                          {fund.ticker} • TER {fund.ter * 100}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-base font-extrabold text-[#4edea3]">
                          {alloc.percentage}%
                        </span>
                        <button
                          onClick={() => handleRemoveFund(alloc.fundId)}
                          className="text-[10px] text-red-400 hover:text-red-300 hover:underline font-bold cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={alloc.percentage}
                        onChange={(e) => handleSliderChange(alloc.fundId, Number(e.target.value))}
                        className="flex-1 accent-[#4edea3] h-1 bg-[#2d3449] rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sum validation indicator */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              {isBalanced ? (
                <div className="bg-[#10b981]/10 border border-[#10b981]/20 p-4 rounded-xl flex items-center gap-3.5 text-xs text-[#dae2fd]">
                  <CheckCircle className="w-5 h-5 text-[#4edea3] flex-shrink-0" />
                  <div>
                    <p className="font-bold text-white">Distribución Correcta</p>
                    <p className="text-[#bbcabf] mt-0.5">La asignación actual suma exactamente el 100%, óptima para simular.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-3.5 text-xs text-[#dae2fd]">
                  <AlertOctagon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-amber-400 leading-snug">Distribución Incompleta</p>
                    <p className="text-[#bbcabf] mt-0.5">
                      La ponderación total actual es de{" "}
                      <span className="font-bold text-white font-mono">{totalSum}%</span>. Ajuste el total para que sume
                      exactamente <span className="font-bold text-[#4edea3]">100%</span>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick options to add catalog index funds */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col">
            <h4 className="font-bold text-white text-sm mb-3">Agregar fondos indexados al simulador</h4>
            <div className="flex flex-wrap gap-2.5">
              {CATALOG_FUNDS.filter((f) => !allocations.some((a) => a.fundId === f.id)).map((fund) => (
                <button
                  key={fund.id}
                  onClick={() => handleAddFund(fund.id)}
                  className="bg-slate-900 border border-[#2d3449] hover:border-[#4edea3] py-2 px-3 rounded-lg text-xs font-semibold text-[#bbcabf] hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{fund.name.split(" ")[0]} {fund.ticker}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Portfolio stats summary card sidebar */}
        <div className="lg:col-span-4">
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-full bg-gradient-to-tr from-[#131b2e] to-[#171f33]">
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-[#2d3449] pb-3">
                <Wallet className="w-5 h-5 text-[#4edea3]" />
                <h4 className="font-bold text-white text-base">Ficha de Cartera</h4>
              </div>

              <div className="space-y-4">
                {/* Total returns stats */}
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">
                    Rentabilidad Ponderada Anual (5A)
                  </span>
                  <span className="text-2xl font-mono font-extrabold text-[#4edea3] leading-none mt-1.5 block">
                    +{portfolioStats.expectedReturn.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-[#bbcabf] font-mono block mt-1">Proyección ponderada</span>
                </div>

                {/* Risk Level */}
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">
                    Nivel de Riesgo Agregado
                  </span>
                  <span className="text-2xl font-mono font-extrabold text-[#b4c5ff] leading-none mt-1.5 block">
                    {portfolioStats.riskLevel} / 7
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">
                    {portfolioStats.riskLevel >= 5.8
                      ? "Agresivo"
                      : portfolioStats.riskLevel >= 4.5
                      ? "Moderado"
                      : "Conservador Directo"}
                  </span>
                </div>

                {/* Weighted expense ratio commissions */}
                <div className="space-y-2 text-xs pt-2">
                  <div className="flex justify-between">
                    <span className="text-[#bbcabf]">Comisiones Ponderadas (TER)</span>
                    <span className="text-white font-mono font-bold">{portfolioStats.weightedTer}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#bbcabf]">Volatilidad Consolidada</span>
                    <span className="text-white font-mono font-bold">{portfolioStats.volatility}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl leading-relaxed text-[11px] text-[#bbcabf] italic flex items-start gap-2">
                <Info className="w-4 h-4 text-[#4edea3] flex-shrink-0 mt-0.5" />
                <span>
                  Sincronizable. Al presionar "Aplicar Cartera", se pre-setearán estos costes de gestión,
                  comisiones y volatilidad estocástica ponderada de manera inmediata.
                </span>
              </div>

              <button
                onClick={handleApplyPortfolio}
                disabled={!isBalanced || successAnimation}
                className={`w-full py-3.5 font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all duration-300 shadow-md ${
                  !isBalanced
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-55 border border-slate-700"
                    : successAnimation
                    ? "bg-emerald-500 text-black border border-emerald-400"
                    : "bg-[#4edea3] text-black hover:bg-[#3cd696] cursor-pointer"
                }`}
              >
                {successAnimation ? "¡Cartera Sincronizada!" : "Sincronizar Simulador General"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
