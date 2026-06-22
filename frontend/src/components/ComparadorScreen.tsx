import { useState, useMemo } from "react";
import { Scale, HelpCircle, Check, ArrowRight, ArrowUpRight, Percent, Info } from "lucide-react";
import { CATALOG_FUNDS, CATALOG_ACCOUNTS, ejecutarSimulacion } from "../utils/finance";
import { SimulationParams } from "../types";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

interface ComparadorScreenProps {
  params: SimulationParams;
}

export default function ComparadorScreen({ params }: ComparadorScreenProps) {
  // Option catalogs list
  const options = useMemo(() => {
    const list: Array<{ id: string; name: string; rate: number; vol: number; type: string }> = [];
    
    CATALOG_FUNDS.forEach((f) => {
      list.push({ id: f.id, name: `Fondo: ${f.name}`, rate: f.historicalReturn5Y, vol: f.volatility, type: "fondo" });
    });
    
    CATALOG_ACCOUNTS.forEach((a) => {
      list.push({ id: a.id, name: `Cuenta: ${a.name}`, rate: a.percentageTAE, vol: 0.5, type: "cuenta" });
    });

    return list;
  }, []);

  const [optA, setOptA] = useState(options[0].id);
  const [optB, setOptB] = useState(options[options.length - 1].id); // choose savings account as default optB

  const [testCapital, setTestCapital] = useState(20000);
  const [testAporte, setTestAporte] = useState(300);
  const [testAnios, setTestAnios] = useState(25);

  const detailA = useMemo(() => options.find((o) => o.id === optA) || options[0], [optA, options]);
  const detailB = useMemo(() => options.find((o) => o.id === optB) || options[1], [optB, options]);

  // Execute both simulation structures based on inputs
  const resultsA = useMemo(() => {
    const simulationParams: SimulationParams = {
      capitalInicial: testCapital,
      aportacionMensual: testAporte,
      tiempoAnios: testAnios,
      interesAnual: detailA.rate,
      inflacionAnual: params.inflacionAnual,
      volatilidadAnual: detailA.vol,
      perfilRiesgo: "moderado"
    };
    return ejecutarSimulacion(simulationParams);
  }, [detailA, testCapital, testAporte, testAnios, params.inflacionAnual]);

  const resultsB = useMemo(() => {
    const simulationParams: SimulationParams = {
      capitalInicial: testCapital,
      aportacionMensual: testAporte,
      tiempoAnios: testAnios,
      interesAnual: detailB.rate,
      inflacionAnual: params.inflacionAnual,
      volatilidadAnual: detailB.vol,
      perfilRiesgo: "moderado"
    };
    return ejecutarSimulacion(simulationParams);
  }, [detailB, testCapital, testAporte, testAnios, params.inflacionAnual]);

  // Difference calculator
  const difference = resultsA.valorFinal - resultsB.valorFinal;
  const isAPreferred = difference > 0;

  const formatEuro = (val: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Convert comparative results to Recharts line chart data
  const chartData = useMemo(() => {
    const series: any[] = [];
    for (let i = 0; i <= testAnios; i++) {
      const valA = resultsA.serieEvolucion[i]?.valorMedio || 0;
      const valB = resultsB.serieEvolucion[i]?.valorMedio || 0;
      series.push({
        year: `Año ${i}`,
        [detailA.name.split(":")[0] + " " + detailA.name.split(" ")[1]]: valA,
        [detailB.name.split(":")[0] + " " + detailB.name.split(" ")[1]]: valB
      });
    }
    return series;
  }, [resultsA, resultsB, detailA, detailB, testAnios]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#1e293b]/70">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Comparador de Alternativas
          </h2>
          <p className="text-[#bbcabf] text-sm mt-1">
            Compara rendimientos históricos acumulados entre fondos indexados, ETFs y cuentas remuneradas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Comparator selections dashboard */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#4edea3]" />
              <span>Configuración del Duelo Financiero</span>
            </h3>

            {/* Inputs sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-5 border-b border-slate-800/80">
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Capital Inicial</span>
                <span className="text-white text-sm font-bold block">{formatEuro(testCapital)}</span>
                <input
                  type="range"
                  min={1000}
                  max={200000}
                  step={5000}
                  value={testCapital}
                  onChange={(e) => setTestCapital(Number(e.target.value))}
                  className="w-full h-1 accent-[#4edea3] bg-slate-800 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Aporte Mensual</span>
                <span className="text-white text-sm font-bold block">{formatEuro(testAporte)}</span>
                <input
                  type="range"
                  min={0}
                  max={3000}
                  step={100}
                  value={testAporte}
                  onChange={(e) => setTestAporte(Number(e.target.value))}
                  className="w-full h-1 accent-[#4edea3] bg-slate-800 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Horizonte Temporal</span>
                <span className="text-white text-sm font-bold block">{testAnios} años</span>
                <input
                  type="range"
                  min={5}
                  max={45}
                  step={1}
                  value={testAnios}
                  onChange={(e) => setTestAnios(Number(e.target.value))}
                  className="w-full h-1 accent-[#4edea3] bg-slate-800 cursor-pointer"
                />
              </div>
            </div>

            {/* Select Options Option A vs Option B dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-bold block uppercase">Alternativa A (Objetivo)</label>
                <select
                  value={optA}
                  onChange={(e) => setOptA(e.target.value)}
                  className="w-full bg-slate-900 border border-[#2d3449] p-3 text-xs rounded-xl focus:border-[#4edea3] text-white outline-none cursor-pointer"
                >
                  {options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} ({opt.rate.toFixed(1)}% TAE / Retorno)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 font-medium">
                  Riesgo: <span className="text-white font-mono">{detailA.vol > 1 ? `${detailA.vol}% Volatilidad` : "Sin volatilidad"}</span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-bold block uppercase">Alternativa B (Comparación)</label>
                <select
                  value={optB}
                  onChange={(e) => setOptB(e.target.value)}
                  className="w-full bg-slate-900 border border-[#2d3449] p-3 text-xs rounded-xl focus:border-[#4edea3] text-white outline-none cursor-pointer"
                >
                  {options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} ({opt.rate.toFixed(1)}% TAE / Retorno)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 font-medium">
                  Riesgo: <span className="text-white font-mono">{detailB.vol > 1 ? `${detailB.vol}% Volatilidad` : "Sin volatilidad"}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Line growth comparison chart */}
          <div className="glass-panel p-5 rounded-2xl h-[330px] flex flex-col justify-between">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider block mb-3">Evolución Comparada del Patrimonio</h4>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
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
                  <Tooltip contentStyle={{ backgroundColor: "#171f33", borderColor: "#2d3449", color: "#dae2fd", fontSize: 11 }} />
                  {/* Option A Line */}
                  <Line
                    type="monotone"
                    dataKey={detailA.name.split(":")[0] + " " + detailA.name.split(" ")[1]}
                    stroke="#4edea3"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  {/* Option B Line */}
                  <Line
                    type="monotone"
                    dataKey={detailB.name.split(":")[0] + " " + detailB.name.split(" ")[1]}
                    stroke="#b4c5ff"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Comparison outcome side bar details */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div className="glass-panel p-5 rounded-2xl bg-gradient-to-tr from-[#131b2e] to-[#171f33] h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-[#2d3449] pb-3">
                <Scale className="w-5 h-5 text-[#4edea3]" />
                <h4 className="font-bold text-white text-base">Veredicto Monetario</h4>
              </div>

              <div className="space-y-5">
                {/* Differential final value card */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Diferencia de Patrimonio Final
                  </span>
                  <span className="text-2xl font-mono font-extrabold text-[#4edea3] leading-none mt-1.5 block">
                    {formatEuro(Math.abs(difference))}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 leading-tight">
                    Extra acumulado a favor de{" "}
                    <span className="text-white font-sans font-bold">
                      {isAPreferred ? detailA.name.split(" ")[1] : detailB.name.split(" ")[1]}
                    </span>
                  </p>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Alternative A values */}
                  <div className="flex justify-between pb-2 border-b border-slate-800/60">
                    <span className="text-[#bbcabf] font-sans font-medium">Final Alternativa A</span>
                    <span className="text-white font-mono font-bold">{formatEuro(resultsA.valorFinal)}</span>
                  </div>

                  {/* Alternative B values */}
                  <div className="flex justify-between pb-2 border-b border-slate-800/60">
                    <span className="text-[#bbcabf] font-sans font-medium">Final Alternativa B</span>
                    <span className="text-slate-300 font-mono font-bold">{formatEuro(resultsB.valorFinal)}</span>
                  </div>

                  {/* Total contributed */}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Capital Aportado</span>
                    <span className="text-slate-300 font-mono">{formatEuro(resultsA.capitalAportado)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl leading-relaxed text-[11px] text-[#bbcabf] italic flex items-start gap-2">
                <Info className="w-4 h-4 text-[#4edea3] flex-shrink-0 mt-0.5" />
                <span>
                  {isAPreferred ? (
                    `Invertir en ${detailA.name.split(" ")[1]} proporciona una rentabilidad compuesta del ${detailA.rate}% frente al ${detailB.rate}% de la alternativa B, asegurándote ${formatEuro(Math.abs(difference))} de colchón financiero adicional.`
                  ) : (
                    `Invertir en ${detailB.name.split(" ")[1]} proporciona una rentabilidad compuesta superior frente al ${detailA.rate}% de la alternativa A.`
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
