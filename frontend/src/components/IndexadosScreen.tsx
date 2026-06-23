import { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  Globe,
  Plus,
  Compass,
  Download,
  AlertTriangle,
  Percent,
  FolderOpen,
  Play,
  Activity,
  Sliders,
  Award
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { IndexFund, SimulationParams, SimulationResults } from "../types";
import { CATALOG_FUNDS, ejecutarSimulacion } from "../utils/finance";
import { getFunds } from "../utils/api";
import SavedSimulationsPanel from "./SavedSimulationsPanel";

interface IndexadosScreenProps {
  params: SimulationParams;
  onSetParams: (params: SimulationParams) => void;
}

export default function IndexadosScreen({ params, onSetParams }: IndexadosScreenProps) {
  const [selectedRegion, setSelectedRegion] = useState("Todas las Regiones");
  const [fundsList, setFundsList] = useState<IndexFund[]>(CATALOG_FUNDS);
  const [selectedFund, setSelectedFund] = useState<IndexFund | null>(CATALOG_FUNDS[0]);

  // Local simulator inputs
  const [capInicial, setCapInicial] = useState(params.capitalInicial);
  const [aporteMensual, setAporteMensual] = useState(params.aportacionMensual);
  const [anios, setAnios] = useState(params.tiempoAnios);

  // Simulation state
  const [hasSimulated, setHasSimulated] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);

  // Fetch dynamic catalog
  useEffect(() => {
    getFunds()
      .then(data => {
        const mapped: IndexFund[] = data.map(f => ({
          id: f.id || "",
          name: f.name,
          ticker: f.ticker,
          isin: f.isin,
          historicalReturn1Y: f.historicalReturn1Y,
          historicalReturn5Y: f.historicalReturn5Y,
          riskRating: f.riskRating,
          ter: f.ter,
          region: f.region,
          category: f.category,
          volatility: f.volatility,
          beta: f.beta
        }));
        if (mapped.length > 0) {
          setFundsList(mapped);
          setSelectedFund(prev => {
            const found = mapped.find(x => x.id === prev?.id);
            return found || mapped[0];
          });
        }
      })
      .catch(() => {
        // Fallback is implicit
      });
  }, []);

  // Filter logic
  const filteredFunds = useMemo(() => {
    return fundsList.filter((fund) => {
      return selectedRegion === "Todas las Regiones" || fund.region.toLowerCase() === selectedRegion.toLowerCase();
    });
  }, [selectedRegion, fundsList]);

  const handleSelectFund = (fund: IndexFund) => {
    setSelectedFund(fund);
    setHasSimulated(false); // reset simulation when changing fund
  };

  // Build simulation params from selected fund + local inputs
  const computedParams = useMemo<SimulationParams>(() => {
    if (!selectedFund) return params;
    return {
      capitalInicial: capInicial,
      aportacionMensual: aporteMensual,
      tiempoAnios: anios,
      interesAnual: selectedFund.historicalReturn5Y,
      inflacionAnual: 2.0,
      volatilidadAnual: selectedFund.volatility,
      perfilRiesgo: selectedFund.riskRating >= 6 ? "agresivo" : selectedFund.riskRating >= 5 ? "moderado" : "conservador"
    };
  }, [selectedFund, capInicial, aporteMensual, anios, params]);

  const results = useMemo<SimulationResults | null>(() => {
    if (!hasSimulated || !selectedFund) return null;
    return ejecutarSimulacion(computedParams);
  }, [computedParams, hasSimulated, selectedFund]);

  const chartData = useMemo(() => {
    if (!results) return [];
    return results.serieEvolucion.map((item) => ({
      year: `${item.year}a`,
      Optimista: item.valorOptimista,
      Medio: item.valorMedio,
      Pesimista: item.valorPesimista,
      Aportado: item.capitalAportado
    }));
  }, [results]);

  const handleTriggerSimulation = () => {
    if (!selectedFund) return;
    setIsSimulating(true);
    setSimulationProgress(20);
    setTimeout(() => setSimulationProgress(60), 250);
    setTimeout(() => setSimulationProgress(90), 500);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationProgress(0);
      setHasSimulated(true);
      onSetParams(computedParams);
    }, 750);
  };

  const formatEuro = (val: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#171f33] border border-[#2d3449] p-3 rounded-xl shadow-xl font-mono text-xs text-[#dae2fd]">
          <p className="font-bold mb-1 border-b border-slate-700 pb-1">Año {payload[0].payload.year.replace("a", "")}</p>
          <p className="text-[#4edea3]">Optimista: {formatEuro(payload[0].value)}</p>
          <p className="text-[#b4c5ff]">Medio: {formatEuro(payload[1].value)}</p>
          <p className="text-[#ffb4ab]">Pesimista: {formatEuro(payload[2].value)}</p>
          <p className="text-slate-400">Aportado: {formatEuro(payload[3].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#1e293b]/70">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Simulador de Fondos Indexados
          </h2>
          <p className="text-[#bbcabf] text-sm mt-1">
            Selecciona un fondo, configura tu inversión y ejecuta la simulación Monte Carlo
          </p>
        </div>
        <div className="flex bg-[#131b2e] border border-[#2d3449] rounded-xl px-4 py-2.5 items-center gap-2">
          <Globe className="w-4 h-4 text-[#4edea3] flex-shrink-0 animate-pulse" />
          <span className="text-xs font-semibold text-[#bbcabf]">
            {fundsList.length} fondos disponibles
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* LEFT: Fund list + filters */}
        <div className="xl:col-span-4 space-y-4">
          {/* Filters */}
          <div className="glass-panel p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <FolderOpen className="w-4 h-4 text-[#4edea3]" />
              <span className="font-bold text-white text-sm">Catálogo de Fondos</span>
            </div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-slate-900 border border-[#2d3449] text-xs px-3 py-2 rounded-lg text-[#bbcabf] focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] outline-none cursor-pointer"
            >
              <option>Todas las Regiones</option>
              <option>EE.UU.</option>
              <option>Global</option>
              <option>Países Desarrollados</option>
              <option>Emergentes</option>
            </select>
          </div>

          {/* Fund list */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredFunds.map((fund) => {
              const isSelected = selectedFund?.id === fund.id;
              return (
                <div
                  key={fund.id}
                  className={`border rounded-xl p-3.5 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#171f33] border-[#4edea3] shadow-md shadow-[#4edea3]/5"
                      : "bg-slate-900/60 border-[#1e293b] hover:bg-slate-900 hover:border-slate-700"
                  }`}
                  onClick={() => handleSelectFund(fund)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-[#dae2fd] text-sm leading-snug truncate">{fund.name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                        <span>{fund.ticker}</span>
                        <span>•</span>
                        <span>TER {(fund.ter * 100).toFixed(2)}%</span>
                        <span>•</span>
                        <span>Riesgo {fund.riskRating}/7</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-mono text-sm font-bold text-[#4edea3]">+{fund.historicalReturn5Y}%</span>
                      <span className="text-[9px] text-slate-500 font-mono block">5A anualizado</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Saved Simulations Panel */}
          <SavedSimulationsPanel
            simulationType="indexados"
            currentParams={computedParams}
            onLoadSimulation={(loaded) => {
              setCapInicial(loaded.capitalInicial);
              setAporteMensual(loaded.aportacionMensual);
              setAnios(loaded.tiempoAnios);
              setHasSimulated(false);
              onSetParams(loaded);
            }}
            selectedFundId={selectedFund?.id}
          />
        </div>

        {/* CENTER+RIGHT: Simulator panel */}
        <div className="xl:col-span-8 space-y-6">

          {/* Selected Fund + Simulator Controls */}
          <div className="glass-panel p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center">
                <Sliders className="w-5 h-5 text-[#4edea3]" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">
                  {selectedFund ? selectedFund.name : "Selecciona un fondo"}
                </h3>
                <p className="text-[#bbcabf] text-[11px]">
                  {selectedFund
                    ? `${selectedFund.ticker} • Rentabilidad ${selectedFund.historicalReturn5Y}% • Volatilidad ${selectedFund.volatility}%`
                    : "Haz clic en un fondo de la lista para empezar"}
                </p>
              </div>
            </div>

            {/* Sliders grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              {/* Capital Inicial */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#bbcabf] font-medium">Capital Inicial</span>
                  <span className="text-[#4edea3] font-bold font-mono bg-[#4edea3]/10 px-2 py-0.5 rounded">{formatEuro(capInicial)}</span>
                </div>
                <input
                  type="range" min={0} max={500000} step={5000}
                  value={capInicial}
                  onChange={(e) => { setCapInicial(Number(e.target.value)); setHasSimulated(false); }}
                  className="w-full accent-[#4edea3] h-1.5 bg-[#2d3449] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 €</span><span>500k €</span>
                </div>
              </div>

              {/* Aportación Mensual */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#bbcabf] font-medium">Aportación Mensual</span>
                  <span className="text-[#4edea3] font-bold font-mono bg-[#4edea3]/10 px-2 py-0.5 rounded">{formatEuro(aporteMensual)}</span>
                </div>
                <input
                  type="range" min={0} max={5000} step={50}
                  value={aporteMensual}
                  onChange={(e) => { setAporteMensual(Number(e.target.value)); setHasSimulated(false); }}
                  className="w-full accent-[#4edea3] h-1.5 bg-[#2d3449] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 €</span><span>5.000 €</span>
                </div>
              </div>

              {/* Horizonte */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#bbcabf] font-medium">Horizonte (Años)</span>
                  <span className="text-[#4edea3] font-bold font-mono bg-[#4edea3]/10 px-2 py-0.5 rounded">{anios} años</span>
                </div>
                <input
                  type="range" min={1} max={50} step={1}
                  value={anios}
                  onChange={(e) => { setAnios(Number(e.target.value)); setHasSimulated(false); }}
                  className="w-full accent-[#4edea3] h-1.5 bg-[#2d3449] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 año</span><span>50 años</span>
                </div>
              </div>
            </div>

            {/* Simulate button */}
            <button
              onClick={handleTriggerSimulation}
              disabled={isSimulating || !selectedFund}
              className="w-full py-3.5 bg-[#4edea3] text-black font-extrabold text-xs tracking-wider uppercase rounded-xl hover:bg-[#3cd696] transition-all duration-300 shadow-lg shadow-[#4edea3]/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Simulando {simulationProgress}%...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Ejecutar Simulación con {selectedFund?.ticker || "Fondo"}</span>
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          {results ? (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-2xl">
                  <span className="text-[10px] font-semibold text-[#bbcabf] uppercase tracking-wider block mb-1">Patrimonio Final</span>
                  <h3 className="text-xl font-bold text-[#4edea3] font-mono">{formatEuro(results.valorFinal)}</h3>
                </div>
                <div className="glass-panel p-4 rounded-2xl">
                  <span className="text-[10px] font-semibold text-[#bbcabf] uppercase tracking-wider block mb-1">Capital Aportado</span>
                  <h3 className="text-xl font-bold text-white font-mono">{formatEuro(results.capitalAportado)}</h3>
                </div>
                <div className="glass-panel p-4 rounded-2xl">
                  <span className="text-[10px] font-semibold text-[#bbcabf] uppercase tracking-wider block mb-1">Ganancia Neta</span>
                  <h3 className="text-xl font-bold text-[#b4c5ff] font-mono">{formatEuro(results.beneficiosNetos)}</h3>
                </div>
                <div className="glass-panel p-4 rounded-2xl">
                  <span className="text-[10px] font-semibold text-[#bbcabf] uppercase tracking-wider block mb-1">Prob. Éxito</span>
                  <h3 className="text-xl font-bold text-white font-mono">{results.probabilidadExito}%</h3>
                  <div className="w-full bg-[#2d3449] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#4edea3] h-full transition-all duration-1000" style={{ width: `${results.probabilidadExito}%` }} />
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="glass-panel rounded-2xl p-5 h-[380px] flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white font-bold text-base">Proyección Monte Carlo</h3>
                    <p className="text-[#bbcabf] text-xs mt-0.5">
                      Basado en {selectedFund?.name} (+{selectedFund?.historicalReturn5Y}% anualizado)
                    </p>
                  </div>
                  <div className="flex gap-3 font-mono text-[10px] uppercase font-semibold">
                    <span className="flex items-center gap-1 text-[#4edea3]">
                      <span className="w-2 h-2 rounded-full bg-[#4edea3] block" /> Optimista
                    </span>
                    <span className="flex items-center gap-1 text-[#b4c5ff]">
                      <span className="w-2 h-2 rounded-full bg-[#b4c5ff] block" /> Medio
                    </span>
                    <span className="flex items-center gap-1 text-[#ffb3af]">
                      <span className="w-2 h-2 rounded-full bg-[#ffb3af] block" /> Pesimista
                    </span>
                  </div>
                </div>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="fund_opt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4edea3" stopOpacity={0.12} />
                          <stop offset="95%" stopColor="#4edea3" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2c354a" opacity={0.2} />
                      <XAxis dataKey="year" stroke="#bbcabf" fontSize={10} tickLine={false} />
                      <YAxis stroke="#bbcabf" fontSize={10} tickLine={false}
                        tickFormatter={(v) => {
                          if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M €`;
                          if (v >= 1000) return `${(v / 1000).toFixed(0)}k €`;
                          return `${v}€`;
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="Optimista" stroke="#4edea3" strokeWidth={2} fillOpacity={1} fill="url(#fund_opt)" />
                      <Area type="monotone" dataKey="Medio" stroke="#b4c5ff" strokeWidth={2} fill="none" />
                      <Area type="monotone" dataKey="Pesimista" stroke="#ffb3af" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
                      <Area type="monotone" dataKey="Aportado" stroke="#86948a" strokeWidth={1} fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel rounded-2xl p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#4edea3]/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-[#4edea3] opacity-60" />
              </div>
              <p className="text-white font-bold text-lg mb-2">Selecciona un fondo y ejecuta la simulación</p>
              <p className="text-[#bbcabf] text-sm max-w-md">
                Elige un fondo de la lista, ajusta tu capital inicial, aportación mensual y horizonte temporal. Después pulsa "Ejecutar Simulación" para ver los resultados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
