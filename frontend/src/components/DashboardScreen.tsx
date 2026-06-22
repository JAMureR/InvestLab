import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import {
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  HelpCircle,
  HelpCircle as Bell,
  Search,
  CheckCircle,
  TrendingDown,
  ChevronRight,
  ArrowRight,
  TrendingUp as Rocket
} from "lucide-react";
import { SimulationParams, SimulationResults } from "../types";
import { ejecutarSimulacion, CATALOG_FUNDS } from "../utils/finance";

interface DashboardScreenProps {
  initialParams: SimulationParams;
  onSetParams: (params: SimulationParams) => void;
  onNavigate: (view: any) => void;
}

export default function DashboardScreen({ initialParams, onSetParams, onNavigate }: DashboardScreenProps) {
  // Local "What-If" state
  const [localCapital, setLocalCapital] = useState(initialParams.capitalInicial);
  const [localAporte, setLocalAporte] = useState(initialParams.aportacionMensual);

  // Compute simulation outcomes dynamically based on local what-if sliders
  const currentParams = useMemo<SimulationParams>(() => {
    return {
      ...initialParams,
      capitalInicial: localCapital,
      aportacionMensual: localAporte
    };
  }, [initialParams, localCapital, localAporte]);

  const results = useMemo<SimulationResults>(() => {
    return ejecutarSimulacion(currentParams);
  }, [currentParams]);

  // Formatted monetary figures in Spanish locale
  const formatEuro = (val: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const formattedFinalWealth = formatEuro(results.valorFinal);
  const formattedContributed = formatEuro(results.capitalAportado);
  const formattedNetProfit = formatEuro(results.beneficiosNetos);

  // Convert simulation series data to Recharts format
  const chartData = useMemo(() => {
    return results.serieEvolucion.map((item) => ({
      year: `Año ${item.year}`,
      AnioNumerico: item.year,
      Optimista: item.valorOptimista,
      Medio: item.valorMedio,
      Pesimista: item.valorPesimista,
      Aportado: item.capitalAportado
    }));
  }, [results]);

  const handleApplyWhatIf = () => {
    onSetParams({
      ...initialParams,
      capitalInicial: localCapital,
      aportacionMensual: localAporte
    });
  };

  // Preset recommended index funds to show
  const topFunds = CATALOG_FUNDS.slice(0, 3);

  // Custom Recharts tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#171f33] border border-[#2d3449] p-3 rounded-xl shadow-xl font-mono text-xs text-[#dae2fd]">
          <p className="font-bold mb-1.5 border-b border-[#2d3449] pb-1">{payload[0].payload.year}</p>
          <p className="text-[#4edea3]">Optimista: {formatEuro(payload[0].value)}</p>
          <p className="text-[#b4c5ff]">Esperado (Mediano): {formatEuro(payload[1].value)}</p>
          <p className="text-[#ffb4ab]">Pesimista: {formatEuro(payload[2].value)}</p>
          <p className="text-slate-400">Total Invertido: {formatEuro(payload[3].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Context Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-[#1e293b]/70">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Resumen de Inversión
          </h2>
          <p className="text-[#bbcabf] text-sm mt-1">
            Estrategia de análisis en curso:{" "}
            <span className="text-[#4edea3] font-semibold font-mono uppercase">
              {initialParams.perfilRiesgo === "agresivo"
                ? "Crecimiento Agresivo (90% Variable)"
                : initialParams.perfilRiesgo === "moderado"
                ? "Estrategia Equilibrada Moderada (60/40)"
                : "Conservador con Protección de Capital"}
            </span>{" "}
            a {initialParams.tiempoAnios} años
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate("simulador")}
            className="bg-[#171f33] hover:bg-slate-800 border border-[#1e293b] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            title="Ir a simulaciones estocásticas detalladas"
          >
            Ajustar Parámetros
          </button>
          <button
            onClick={() => onNavigate("indexados")}
            className="bg-[#4edea3] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-[#4edea3]/10 hover:scale-[1.02] cursor-pointer"
          >
            Ver Fondos Reales
          </button>
        </div>
      </div>

      {/* KPI Dashboard Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 - Estimated Wealth */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-[#4edea3]/30 transition-all">
          <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-15 transition-opacity">
            <TrendingUp className="w-12 h-12 text-[#4edea3]" />
          </div>
          <span className="text-xs font-semibold text-[#bbcabf] uppercase tracking-wider block mb-1">
            Patrimonio Estimado
          </span>
          <h3 className="text-2xl md:text-3xl font-bold text-[#4edea3] font-mono tracking-tight leading-none">
            {formattedFinalWealth}
          </h3>
          <p className="text-[#4edea3] text-xs font-medium mt-3 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Excelente efecto compuesto</span>
          </p>
        </div>

        {/* Card 2 - Contributed Capital */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <span className="text-xs font-semibold text-[#bbcabf] uppercase tracking-wider block mb-1">
            Capital Aportado
          </span>
          <h3 className="text-2xl md:text-3xl font-bold text-white font-mono tracking-tight leading-none">
            {formattedContributed}
          </h3>
          <p className="text-[#bbcabf] text-xs font-mono mt-3">
            {formatEuro(localAporte)} / mes x {initialParams.tiempoAnios * 12} meses
          </p>
        </div>

        {/* Card 3 - Net Profits after Taxes */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-[#b4c5ff]/30 transition-all">
          <span className="text-xs font-semibold text-[#bbcabf] uppercase tracking-wider block mb-1">
            Ganancia Neta (Estimada)
          </span>
          <h3 className="text-2xl md:text-3xl font-bold text-[#b4c5ff] font-mono tracking-tight leading-none">
            {formattedNetProfit}
          </h3>
          <p className="text-[#b4c5ff] text-xs font-medium mt-3">
            Retención IRPF (19% simplificado)
          </p>
        </div>

        {/* Card 4 - Success probability */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-[#10b981] relative overflow-hidden group hover:border-l-[#4edea3] transition-all">
          <span className="text-xs font-semibold text-[#bbcabf] uppercase tracking-wider block mb-1">
            Probabilidad de Éxito
          </span>
          <h3 className="text-2xl md:text-3xl font-bold text-white font-mono tracking-tight leading-none">
            {results.probabilidadExito}%
          </h3>
          <div className="w-full bg-[#2d3449] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#4edea3] h-full transition-all duration-1000"
              style={{ width: `${results.probabilidadExito}%` }}
            />
          </div>
          <p className="text-[#bbcabf] text-[10px] mt-1.5">
            Meta: Beat break-even e inflación
          </p>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-5 flex flex-col h-[480px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
            <div>
              <h4 className="font-bold text-lg text-white leading-tight">
                Evolución Histórica Proyectada
              </h4>
              <p className="text-[#bbcabf] text-xs mt-0.5">
                Bandas estocásticas percentiles basadas en los inputs cargados
              </p>
            </div>
            {/* Chart Legend */}
            <div className="flex flex-wrap gap-3 font-mono text-[10px] uppercase font-semibold">
              <span className="flex items-center gap-1 text-[#4edea3]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] block" />
                Optimista (95%)
              </span>
              <span className="flex items-center gap-1 text-[#b4c5ff]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#b4c5ff] block" />
                Medio (50%)
              </span>
              <span className="flex items-center gap-1 text-[#ffb4ab]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffb3af] block" />
                Pesimista (5%)
              </span>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorOptimista" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4edea3" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4edea3" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMedio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b4c5ff" stopOpacity={0.10} />
                    <stop offset="95%" stopColor="#b4c5ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2c354a" opacity={0.3} />
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
                  fill="url(#colorOptimista)"
                />
                <Area
                  type="monotone"
                  dataKey="Medio"
                  stroke="#b4c5ff"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMedio)"
                />
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
        </div>

        {/* Sidebar parameter test slider "What-If" */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="glass-panel rounded-2xl p-5 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1 px-1.5 bg-[#b4c5ff]/10 text-[#b4c5ff] rounded-lg">
                <Rocket className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-white text-base leading-tight">
                  ¿Qué pasaría si...?
                </h4>
                <p className="text-[#bbcabf] text-[11px]">Cambia variables en tiempo real en español</p>
              </div>
            </div>

            <div className="space-y-6 flex-1 flex flex-col justify-center">
              {/* Slider 1 - Capital Inicial */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#bbcabf] font-medium">Capital Inicial</span>
                  <span className="text-[#4edea3] font-bold font-mono bg-[#4edea3]/10 px-2 py-0.5 rounded">
                    {formatEuro(localCapital)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={250000}
                  step={5000}
                  value={localCapital}
                  onChange={(e) => setLocalCapital(Number(e.target.value))}
                  className="w-full accent-[#4edea3] h-1.5 bg-[#2d3449] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0 €</span>
                  <span>250k €</span>
                </div>
              </div>

              {/* Slider 2 - Monthly saving */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#bbcabf] font-medium">Aportación Mensual</span>
                  <span className="text-[#4edea3] font-bold font-mono bg-[#4edea3]/10 px-2 py-0.5 rounded">
                    {formatEuro(localAporte)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5000}
                  step={100}
                  value={localAporte}
                  onChange={(e) => setLocalAporte(Number(e.target.value))}
                  className="w-full accent-[#4edea3] h-1.5 bg-[#2d3449] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0 €</span>
                  <span>5.000 €</span>
                </div>
              </div>

              {/* Instant outcome showcase */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-[#2d3449] space-y-1.5 mt-2">
                <span className="text-slate-400 text-[10px] font-mono block">ESTIMACIÓN DIRECTA A 30 AÑOS</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#4edea3]">{formattedFinalWealth}</span>
                  <span className="text-[10px] text-[#bbcabf]">estimados</span>
                </div>
                <p className="text-[10px] text-[#bbcabf] leading-tight">
                  Alimentaría un dividendo mensual promedio pasivo de aprox.{" "}
                  <span className="text-white font-mono font-bold">
                    {formatEuro(results.gananciaMensualPromedio)}
                  </span>{" "}
                  en intereses brutos.
                </p>
              </div>
            </div>

            <button
              onClick={handleApplyWhatIf}
              className="w-full py-3 mt-6 bg-[#b4c5ff] text-[#00174b] font-bold text-sm rounded-xl hover:bg-[#9cb0fa] hover:text-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#b4c5ff]/15"
            >
              <span>Aplicar al Plan General</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Funds Catalog Short Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommended indices list */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-white text-base">Fondos Indexados Destacados</h4>
            <button
              onClick={() => onNavigate("indexados")}
              className="text-[#4edea3] text-xs font-bold hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>Catálogo Completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {topFunds.map((fund) => (
              <div
                key={fund.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/40 border border-[#1e293b] hover:border-[#4edea3]/20 transition-all cursor-pointer"
                onClick={() => onNavigate("indexados")}
              >
                <div className="min-w-0 flex-1 pr-3">
                  <p className="font-bold text-sm text-white truncate">{fund.name}</p>
                  <p className="text-slate-400 font-mono text-[11px] mt-0.5">
                    {fund.ticker} • TER {fund.ter * 100}% • {fund.region}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-mono text-xs font-bold text-[#4edea3]">+{fund.historicalReturn1Y}%</span>
                  <span className="text-[9px] text-[#bbcabf] font-mono block">Ret. 1Y</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analyst feedback note */}
        <div className="glass-panel p-5 rounded-2xl border-dashed border-[#3c4a42] flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-[#4edea3] uppercase tracking-wider block mb-2 font-mono">
              Nota Senior de Estructuración de Carteras
            </span>
            <p className="text-[#bbcabf] text-sm leading-relaxed italic">
              "El poder acumulativo del interés compuesto es el mayor aliado de la jubilación. Con un Sharpe
              ratio esperado moderado, una asignación del 70% en mercados de renta variable global cubre de manera
              probada la inflación histórica española (promedio 2.1% en las últimas dos décadas) con una probabilidad
              superior al 82% a largo plazo. Considere siempre balances de renta fija flexible si los horizontes
              son inferiores a 10 años para mitigar periodos estocásticos de alta volatilidad estacional."
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-[#1e293b]/70 flex justify-between items-center">
            <span className="text-xs text-slate-400 font-mono">Último informe: Hoy</span>
            <span className="text-xs text-[#4edea3] font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Plan Seguro
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
