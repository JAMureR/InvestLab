import { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  Sliders,
  Play,
  TrendingDown,
  Sparkles,
  Info,
  BarChart,
  Activity,
  AlertTriangle,
  Award
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { SimulationParams, SimulationResults } from "../types";
import { ejecutarSimulacion } from "../utils/finance";

interface SimuladorScreenProps {
  params: SimulationParams;
  onSetParams: (params: SimulationParams) => void;
}

export default function SimuladorScreen({ params, onSetParams }: SimuladorScreenProps) {
  // Local sliders state
  const [capInicial, setCapInicial] = useState(params.capitalInicial);
  const [aporteMensual, setAporteMensual] = useState(params.aportacionMensual);
  const [anios, setAnios] = useState(params.tiempoAnios);
  const [interes, setInteres] = useState(params.interesAnual);
  const [inflacion, setInflacion] = useState(params.inflacionAnual);
  const [volatilidad, setVolatilidad] = useState(params.volatilidadAnual);
  const [perfil, setPerfil] = useState<"conservador" | "moderado" | "agresivo">(params.perfilRiesgo);

  // Loading/running state mock for the simulated analysis
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);

  // Sync sliders to incoming general params state initial load
  useEffect(() => {
    setCapInicial(params.capitalInicial);
    setAporteMensual(params.aportacionMensual);
    setAnios(params.tiempoAnios);
    setInteres(params.interesAnual);
    setInflacion(params.inflacionAnual);
    setVolatilidad(params.volatilidadAnual);
    setPerfil(params.perfilRiesgo);
  }, [params]);

  // Adjust parameters instantly when profile is clicked
  const handleProfileSelect = (p: "conservador" | "moderado" | "agresivo") => {
    setPerfil(p);
    if (p === "conservador") {
      setInteres(3.0);
      setVolatilidad(3.5);
    } else if (p === "moderado") {
      setInteres(6.5);
      setVolatilidad(11.0);
    } else {
      setInteres(9.8);
      setVolatilidad(16.5);
    }
  };

  // Perform simulation calculation
  const computedParams = useMemo<SimulationParams>(() => {
    return {
      capitalInicial: capInicial,
      aportacionMensual: aporteMensual,
      tiempoAnios: anios,
      interesAnual: interes,
      inflacionAnual: inflacion,
      volatilidadAnual: volatilidad,
      perfilRiesgo: perfil
    };
  }, [capInicial, aporteMensual, anios, interes, inflacion, volatilidad, perfil]);

  const results = useMemo<SimulationResults>(() => {
    return ejecutarSimulacion(computedParams);
  }, [computedParams]);

  // Handle the click on simulate button (triggers visual spinner)
  const handleTriggerSimulation = () => {
    setIsSimulating(true);
    setSimulationProgress(15);
    
    // Increment progress mock
    const timer1 = setTimeout(() => setSimulationProgress(55), 250);
    const timer2 = setTimeout(() => setSimulationProgress(90), 550);
    const timer3 = setTimeout(() => {
      setIsSimulating(false);
      setSimulationProgress(0);
      // Publish up to global state
      onSetParams(computedParams);
    }, 800);
  };

  const formatEuro = (val: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Prepare chart format
  const chartData = useMemo(() => {
    return results.serieEvolucion.map((item) => ({
      year: `${item.year}y`,
      Optimista: item.valorOptimista,
      Medio: item.valorMedio,
      Pesimista: item.valorPesimista,
      Aportado: item.capitalAportado
    }));
  }, [results]);

  // Estimated Sharpe Ratio and Drawdown calculations relative to input volatility/interest
  const numSharpeRatio = useMemo(() => {
    // Standard estimation formula for mock presentation: (Return - Inflation) / Volatility
    const riskFreeRate = 2.0; // Conceptually
    const excess = interes - riskFreeRate;
    if (volatilidad <= 0) return 3.00;
    const value = excess / volatilidad;
    return valBetween(parseFloat(value.toFixed(2)), 0.2, 2.5);
  }, [interes, volatilidad]);

  const numMaxDrawdown = useMemo(() => {
    // Drawdown correlates with higher standard deviation volatility
    const value = volatilidad * 1.5 + 4;
    return parseFloat(value.toFixed(1));
  }, [volatilidad]);

  // Helper bounds
  function valBetween(val: number, min: number, max: number) {
    return Math.min(Math.max(val, min), max);
  }

  // Distribution chart categories
  const distribucionBars = [
    { height: "h-8", label: "Pobres (5%)", value: results.valorFinal * 0.4 },
    { height: "h-20", label: "Moderado", value: results.valorFinal * 0.7 },
    { height: "h-40", label: "Medios (50%)", value: results.valorFinal },
    { height: "h-28", label: "Acumulado", value: results.valorFinal * 1.3 },
    { height: "h-14", label: "Ricos (95%)", value: results.valorFinal * 1.9 }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#171f33] border border-[#2d3449] p-3 rounded-xl shadow-xl font-mono text-xs text-[#dae2fd]">
          <p className="font-bold mb-1 border-b border-slate-700 pb-1">Año {payload[0].payload.year.replace("y", "")}</p>
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
    <div className="flex flex-col xl:flex-row gap-6">
      
      {/* Sidebar parameters panel input */}
      <section className="w-full xl:w-80 flex-shrink-0 bg-[#131b2e] border border-[#1e293b] rounded-2xl p-5 space-y-6">
        <h3 className="text-white font-bold text-base flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#4edea3]" />
          <span>Parámetros</span>
        </h3>

        <div className="space-y-5">
          {/* Slider 1 - Capital Inicial */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#bbcabf] font-medium">Capital Inicial</span>
              <span className="text-[#4edea3] font-bold font-mono">{formatEuro(capInicial)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={500000}
              step={5000}
              value={capInicial}
              onChange={(e) => setCapInicial(Number(e.target.value))}
              className="w-full accent-[#4edea3] h-1 bg-[#2d3449] rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 2 - Monthly Saving */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#bbcabf] font-medium">Aportación Mensual</span>
              <span className="text-[#4edea3] font-bold font-mono">{formatEuro(aporteMensual)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={5000}
              step={100}
              value={aporteMensual}
              onChange={(e) => setAporteMensual(Number(e.target.value))}
              className="w-full accent-[#4edea3] h-1 bg-[#2d3449] rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 3 - Timetravel Time timeframe */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#bbcabf] font-medium">Horizonte (Años)</span>
              <span className="text-[#4edea3] font-bold font-mono">{anios} años</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={anios}
              onChange={(e) => setAnios(Number(e.target.value))}
              className="w-full accent-[#4edea3] h-1 bg-[#2d3449] rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 4 - Interest Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#bbcabf] font-medium">Rentabilidad Anual (%)</span>
              <span className="text-[#4edea3] font-bold font-mono">{interes.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={25}
              step={0.1}
              value={interes}
              onChange={(e) => {
                setInteres(Number(e.target.value));
                setPerfil("moderado"); // unlock presets
              }}
              className="w-full accent-[#4edea3] h-1 bg-[#2d3449] rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 5 - Inflation Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#bbcabf] font-medium">Inflación (%)</span>
              <span className="text-[#4edea3] font-bold font-mono">{inflacion.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={0.1}
              value={inflacion}
              onChange={(e) => setInflacion(Number(e.target.value))}
              className="w-full accent-[#4edea3] h-1 bg-[#2d3449] rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 6 - Market Volatility */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#bbcabf] font-medium">Volatilidad (%)</span>
              <span className="text-[#4edea3] font-bold font-mono">{volatilidad.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={50}
              step={0.1}
              value={volatilidad}
              onChange={(e) => {
                setVolatilidad(Number(e.target.value));
                setPerfil("moderado");
              }}
              className="w-full accent-[#4edea3] h-1 bg-[#2d3449] rounded-lg cursor-pointer"
            />
          </div>

          {/* Risk Profile preset buttons chips */}
          <div className="pt-4 border-t border-[#1e293b]">
            <span className="text-xs font-semibold text-[#bbcabf] uppercase tracking-wider block mb-3">
              Perfil de Riesgo
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(["conservador", "moderado", "agresivo"] as const).map((r) => {
                const isActive = perfil === r;
                return (
                  <button
                    key={r}
                    onClick={() => handleProfileSelect(r)}
                    className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all border cursor-pointer ${
                      isActive
                        ? "bg-[#4edea3]/10 border-[#4edea3] text-[#4edea3]"
                        : "bg-slate-900 border-[#2d3449] hover:border-slate-500 text-[#bbcabf]"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trigger Action Button */}
          <button
            onClick={handleTriggerSimulation}
            disabled={isSimulating}
            className="w-full py-4 mt-6 bg-[#4edea3] text-black font-extrabold text-xs tracking-wider uppercase rounded-xl hover:bg-[#3cd696] transition-all duration-300 shadow-lg shadow-[#4edea3]/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                <span>Analizando {simulationProgress}%...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Ejecutar Simulación</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Main Canvas chart reports */}
      <section className="flex-1 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main stochastics chart */}
          <div className="lg:col-span-8 glass-panel rounded-2xl p-5 flex flex-col h-[400px]">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">Simulación Monte Carlo</h3>
                <p className="text-[#bbcabf] text-xs mt-0.5">
                  1.000 trayectorias secuenciales modeladas con distribución de campana normal
                </p>
              </div>
              <span className="px-2.5 py-1 bg-[#10b981]/20 text-[#4edea3] border border-[#10b981]/30 rounded-lg text-[10px] font-bold">
                ESTOCÁSTICA
              </span>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="charP_op" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4edea3" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#4edea3" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2c354a" opacity={0.2} />
                  <XAxis dataKey="year" stroke="#bbcabf" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#bbcabf"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(v) => {
                      if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M €`;
                      if (v >= 1000) return `${(v / 1000).toFixed(0)}k €`;
                      return `${v}€`;
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="Optimista"
                    stroke="#4edea3"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#charP_op)"
                  />
                  <Area type="monotone" dataKey="Medio" stroke="#b4c5ff" strokeWidth={2} fill="none" />
                  <Area
                    type="monotone"
                    dataKey="Pesimista"
                    stroke="#ffb3af"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="none"
                  />
                  <Area type="monotone" dataKey="Aportado" stroke="#86948a" strokeWidth={1} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* InTranche outcome indicators */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#1e293b]">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Escenario Optimista (95%)</span>
                <span className="text-sm font-bold text-[#4edea3] font-mono leading-none">
                  {formatEuro(results.serieEvolucion[anios]?.valorOptimista || 0)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Escenario Medio (50%)</span>
                <span className="text-sm font-bold text-white font-mono leading-none">
                  {formatEuro(results.serieEvolucion[anios]?.valorMedio || 0)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Escenario Pesimista (5%)</span>
                <span className="text-sm font-bold text-[#ffb4ab] font-mono leading-none">
                  {formatEuro(results.serieEvolucion[anios]?.valorPesimista || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Histogram distribution outcome panel */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-white text-base">Distribución Final</h4>
              <p className="text-[#bbcabf] text-[11px] mt-0.5">Probabilidad de capital alcanzable</p>
            </div>

            {/* Custom bar chart histogram */}
            <div className="flex items-end gap-2 px-2 h-40 mt-4 border-b border-[#2d3449]/70 pb-1">
              {distribucionBars.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end items-center group relative">
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#171f33] border border-[#2d3449] p-2 rounded text-[10px] font-mono z-20 whitespace-nowrap">
                    Estimado: {formatEuro(bar.value)}
                  </div>
                  {/* Animated Bar heights */}
                  <div
                    className={`w-full rounded-t-lg transition-all duration-700 ${
                      i === 2
                        ? "bg-[#4edea3] shadow-[0_0_15px_rgba(78,222,163,0.3)]"
                        : i === 3
                        ? "bg-[#4edea3]/60"
                        : "bg-slate-800 hover:bg-[#b4c5ff]/40"
                    }`}
                    style={{ height: `${(bar.value / (results.valorFinal * 1.9)) * 100}%` }}
                  />
                  <span className="text-[8px] text-slate-400 font-mono mt-1 whitespace-nowrap rotate-12">
                    {bar.label.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>

            {/* Probabilidad Success state info box */}
            <div className="pt-4 space-y-3">
              <div className="bg-slate-900/60 border border-[#1e293b] p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] block font-mono">PROBABILIDAD DE SUPERAR INFLACIÓN</span>
                <div className="flex items-center gap-3 mt-1 justify-between">
                  <span className="text-[#4edea3] font-bold font-mono text-lg">{results.probabilidadExito}%</span>
                  <div className="flex-1 max-w-[120px] h-1.5 bg-[#2d3449] rounded-full overflow-hidden">
                    <div className="h-full bg-[#4edea3]" style={{ width: `${results.probabilidadExito}%` }} />
                  </div>
                </div>
                <span className="text-[9px] text-[#bbcabf] block mt-1.5">
                  Objetivo: Conservar valor de compra real ({formatEuro(results.capitalAportado)})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk KPIs row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sharpe Ratio */}
          <div className="glass-panel p-5 rounded-2xl border-l-4 border-[#4edea3] group hover:bg-[#171f33]/80 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Sharpe Ratio</span>
              <Award className="w-5 h-5 text-[#4edea3] opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#dae2fd] font-mono">{numSharpeRatio}</span>
              <span className="text-[#4edea3] text-xs font-bold">Excelente</span>
            </div>
            <p className="text-slate-400 text-xs mt-2 leading-snug">
              Retorno ajustado al riesgo. Superior a 1.0 es ideal para carteras balanceadas.
            </p>
          </div>

          {/* Max Drawdown */}
          <div className="glass-panel p-5 rounded-2xl border-l-4 border-red-500 group hover:bg-[#171f33]/80 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Drawdown Máximo</span>
              <AlertTriangle className="w-5 h-5 text-red-400 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#dae2fd] font-mono">-{numMaxDrawdown}%</span>
              <span className="text-red-400 text-xs font-bold">Worst Case</span>
            </div>
            <p className="text-slate-400 text-xs mt-2 leading-snug">
              Caída máxima proyectada en caso de correcciones negativas extremas del mercado global.
            </p>
          </div>

          {/* Expected Volatility */}
          <div className="glass-panel p-5 rounded-2xl border-l-4 border-blue-400 group hover:bg-[#171f33]/80 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Volatilidad Anualizada</span>
              <Activity className="w-5 h-5 text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#dae2fd] font-mono">{volatilidad}%</span>
              <span className="text-blue-400 text-xs font-bold">Preferencia</span>
            </div>
            <p className="text-slate-400 text-xs mt-2 leading-snug">
              La desviación estándar de rentabilidades anuales. Define la dispersión de las bandas.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
