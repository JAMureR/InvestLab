import { useState, useMemo } from "react";
import {
  Coins,
  ShieldCheck,
  ChevronRight,
  Sliders,
  Calculator,
  Play,
  Activity
} from "lucide-react";
import { RemuneratedAccount, SimulationParams } from "../types";
import { CATALOG_ACCOUNTS } from "../utils/finance";

interface RemuneradasScreenProps {
  params: SimulationParams;
  onSetParams: (params: SimulationParams) => void;
}

export default function RemuneradasScreen({ params, onSetParams }: RemuneradasScreenProps) {
  const [selectedAcc, setSelectedAcc] = useState<RemuneratedAccount | null>(CATALOG_ACCOUNTS[0]);

  // Local simulator inputs
  const [capInicial, setCapInicial] = useState(params.capitalInicial);
  const [aporteMensual, setAporteMensual] = useState(params.aportacionMensual);
  const [anios, setAnios] = useState(params.tiempoAnios);

  // Simulation state
  const [hasSimulated, setHasSimulated] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);

  const handleSelectAccount = (account: RemuneratedAccount) => {
    setSelectedAcc(account);
    setHasSimulated(false);
  };

  const formatEuro = (val: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(val);

  const formatEuroInt = (val: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);

  // Simulate compound interest with monthly contributions for remunerated accounts
  const results = useMemo(() => {
    if (!hasSimulated || !selectedAcc) return null;

    const tae = selectedAcc.percentageTAE / 100;
    const monthlyRate = Math.pow(1 + tae, 1 / 12) - 1;
    const totalMonths = anios * 12;

    // Build monthly evolution
    let balance = capInicial;
    const evolution: Array<{
      year: number;
      saldoBruto: number;
      capitalAportado: number;
      interesesAcumulados: number;
    }> = [];

    let totalAportado = capInicial;

    // Year 0
    evolution.push({
      year: 0,
      saldoBruto: capInicial,
      capitalAportado: capInicial,
      interesesAcumulados: 0
    });

    for (let month = 1; month <= totalMonths; month++) {
      // Apply monthly interest
      const interest = balance * monthlyRate;
      balance += interest;
      // Add monthly contribution
      balance += aporteMensual;
      totalAportado += aporteMensual;

      // Record yearly snapshots
      if (month % 12 === 0) {
        const yearNum = month / 12;
        evolution.push({
          year: yearNum,
          saldoBruto: balance,
          capitalAportado: totalAportado,
          interesesAcumulados: balance - totalAportado
        });
      }
    }

    const saldoFinal = balance;
    const interesesTotales = saldoFinal - totalAportado;
    const impuestos = interesesTotales * 0.19;
    const interesesNetos = interesesTotales - impuestos;
    const saldoNeto = totalAportado + interesesNetos;

    // Monthly yield metrics (on final balance)
    const mensualBruto = saldoFinal * monthlyRate;
    const mensualNeto = mensualBruto * (1 - 0.19);
    const anualBruto = saldoFinal * tae;
    const anualNeto = anualBruto * (1 - 0.19);

    return {
      saldoFinal,
      totalAportado,
      interesesTotales,
      impuestos,
      interesesNetos,
      saldoNeto,
      mensualBruto,
      mensualNeto,
      anualBruto,
      anualNeto,
      evolution,
      tae: selectedAcc.percentageTAE
    };
  }, [hasSimulated, selectedAcc, capInicial, aporteMensual, anios]);

  const handleTriggerSimulation = () => {
    if (!selectedAcc) return;
    setIsSimulating(true);
    setSimulationProgress(25);
    setTimeout(() => setSimulationProgress(65), 200);
    setTimeout(() => setSimulationProgress(95), 450);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationProgress(0);
      setHasSimulated(true);
      onSetParams({
        ...params,
        capitalInicial: capInicial,
        aportacionMensual: aporteMensual,
        tiempoAnios: anios,
        interesAnual: selectedAcc.percentageTAE,
        volatilidadAnual: 0.5,
        perfilRiesgo: "conservador"
      });
    }, 650);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#1e293b]/70">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Simulador de Cuentas Remuneradas
          </h2>
          <p className="text-[#bbcabf] text-sm mt-1">
            Selecciona una cuenta, configura tu capital y simula el rendimiento con interés compuesto
          </p>
        </div>
        <div className="flex bg-[#131b2e] border border-[#2d3449] rounded-xl px-4 py-2.5 items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#ffb3af] flex-shrink-0" />
          <span className="text-xs font-semibold text-[#bbcabf]">
            {CATALOG_ACCOUNTS.length} cuentas disponibles
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* LEFT: Account list */}
        <div className="xl:col-span-4 space-y-4">
          <div className="glass-panel p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Coins className="w-4 h-4 text-[#ffb3af]" />
              <span className="font-bold text-white text-sm">Cuentas de Ahorro</span>
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {CATALOG_ACCOUNTS.map((acc) => {
              const isSelected = selectedAcc?.id === acc.id;
              return (
                <div
                  key={acc.id}
                  className={`border rounded-xl p-3.5 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#171f33] border-[#ffb3af] shadow-md shadow-[#ffb3af]/5"
                      : "bg-slate-900/60 border-[#1e293b] hover:bg-slate-900 hover:border-slate-700"
                  }`}
                  onClick={() => handleSelectAccount(acc)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-[#dae2fd] text-sm leading-snug">{acc.name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span className="capitalize">{acc.payoutFrequency}</span>
                        <span>•</span>
                        <span>{acc.liquidity.split(" ")[0]}</span>
                        <span>•</span>
                        <span>Riesgo {acc.riskRating}/7</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-mono text-base font-extrabold text-[#ffb3af]">{acc.percentageTAE.toFixed(2)}%</span>
                      <span className="text-[9px] text-slate-500 font-mono block">TAE</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Account details */}
          {selectedAcc && (
            <div className="glass-panel p-4 rounded-2xl bg-gradient-to-tr from-[#131b2e] to-[#171f33]">
              <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#ffb3af]" />
                Detalles de la Cuenta
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#bbcabf]">Frecuencia de pago</span>
                  <span className="text-white capitalize font-medium">{selectedAcc.payoutFrequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#bbcabf]">Liquidez</span>
                  <span className="text-white font-medium">{selectedAcc.liquidity.split("(")[0].trim()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#bbcabf]">Garantía de Depósitos</span>
                  <span className="text-white font-bold">Hasta 100.000 €</span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">Condiciones:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{selectedAcc.conditions}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Simulator panel */}
        <div className="xl:col-span-8 space-y-6">

          {/* Simulator Controls */}
          <div className="glass-panel p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#ffb3af]/10 border border-[#ffb3af]/20 flex items-center justify-center">
                <Sliders className="w-5 h-5 text-[#ffb3af]" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">
                  {selectedAcc ? selectedAcc.name : "Selecciona una cuenta"}
                </h3>
                <p className="text-[#bbcabf] text-[11px]">
                  {selectedAcc
                    ? `${selectedAcc.percentageTAE.toFixed(2)}% TAE • Pago ${selectedAcc.payoutFrequency} • Volatilidad ~0%`
                    : "Haz clic en una cuenta de la lista para empezar"}
                </p>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#bbcabf] font-medium">Capital Inicial</span>
                  <span className="text-[#ffb3af] font-bold font-mono bg-[#ffb3af]/10 px-2 py-0.5 rounded">{formatEuroInt(capInicial)}</span>
                </div>
                <input
                  type="range" min={1000} max={200000} step={1000}
                  value={capInicial}
                  onChange={(e) => { setCapInicial(Number(e.target.value)); setHasSimulated(false); }}
                  className="w-full accent-[#ffb3af] h-1.5 bg-[#2d3449] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1.000 €</span><span>200.000 €</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#bbcabf] font-medium">Aportación Mensual</span>
                  <span className="text-[#ffb3af] font-bold font-mono bg-[#ffb3af]/10 px-2 py-0.5 rounded">{formatEuroInt(aporteMensual)}</span>
                </div>
                <input
                  type="range" min={0} max={5000} step={50}
                  value={aporteMensual}
                  onChange={(e) => { setAporteMensual(Number(e.target.value)); setHasSimulated(false); }}
                  className="w-full accent-[#ffb3af] h-1.5 bg-[#2d3449] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 €</span><span>5.000 €</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#bbcabf] font-medium">Horizonte (Años)</span>
                  <span className="text-[#ffb3af] font-bold font-mono bg-[#ffb3af]/10 px-2 py-0.5 rounded">{anios} años</span>
                </div>
                <input
                  type="range" min={1} max={30} step={1}
                  value={anios}
                  onChange={(e) => { setAnios(Number(e.target.value)); setHasSimulated(false); }}
                  className="w-full accent-[#ffb3af] h-1.5 bg-[#2d3449] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 año</span><span>30 años</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleTriggerSimulation}
              disabled={isSimulating || !selectedAcc}
              className="w-full py-3.5 bg-[#ffb3af] text-[#3b0800] font-extrabold text-xs tracking-wider uppercase rounded-xl hover:bg-[#ff9e99] transition-all duration-300 shadow-lg shadow-[#ffb3af]/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Calculando {simulationProgress}%...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Simular con {selectedAcc?.name || "Cuenta"}</span>
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {results ? (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-2xl">
                  <span className="text-[10px] font-semibold text-[#bbcabf] uppercase tracking-wider block mb-1">Saldo Final Bruto</span>
                  <h3 className="text-xl font-bold text-[#ffb3af] font-mono">{formatEuro(results.saldoFinal)}</h3>
                </div>
                <div className="glass-panel p-4 rounded-2xl">
                  <span className="text-[10px] font-semibold text-[#bbcabf] uppercase tracking-wider block mb-1">Capital Aportado</span>
                  <h3 className="text-xl font-bold text-white font-mono">{formatEuroInt(results.totalAportado)}</h3>
                </div>
                <div className="glass-panel p-4 rounded-2xl">
                  <span className="text-[10px] font-semibold text-[#bbcabf] uppercase tracking-wider block mb-1">Intereses Netos</span>
                  <h3 className="text-xl font-bold text-[#4edea3] font-mono">{formatEuro(results.interesesNetos)}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">(tras 19% IRPF)</span>
                </div>
                <div className="glass-panel p-4 rounded-2xl">
                  <span className="text-[10px] font-semibold text-[#bbcabf] uppercase tracking-wider block mb-1">Saldo Neto Final</span>
                  <h3 className="text-xl font-bold text-[#4edea3] font-mono">{formatEuro(results.saldoNeto)}</h3>
                </div>
              </div>

              {/* Yield Detail Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monthly/Annual yields */}
                <div className="glass-panel p-5 rounded-2xl">
                  <h4 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-[#ffb3af]" />
                    <span>Rendimiento sobre Saldo Final</span>
                  </h4>
                  <div className="space-y-3 font-mono">
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 text-xs">
                      <div>
                        <p className="text-white font-sans font-bold">Interés Bruto Mensual</p>
                        <p className="text-[10px] text-slate-500">Sin impuestos</p>
                      </div>
                      <span className="text-sm font-bold text-[#b4c5ff]">{formatEuro(results.mensualBruto)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 text-xs">
                      <div>
                        <p className="text-[#4edea3] font-sans font-bold">Interés Neto Mensual</p>
                        <p className="text-[10px] text-slate-500">Con retención (19%)</p>
                      </div>
                      <span className="text-base font-extrabold text-[#4edea3]">{formatEuro(results.mensualNeto)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <p className="text-white font-sans font-bold">Interés Neto Anual</p>
                        <p className="text-[10px] text-slate-500">Con retención (19%)</p>
                      </div>
                      <span className="text-sm font-bold">{formatEuro(results.anualNeto)}</span>
                    </div>
                  </div>
                </div>

                {/* Evolution table */}
                <div className="glass-panel p-5 rounded-2xl">
                  <h4 className="font-bold text-white text-base mb-4">Evolución Anual</h4>
                  <div className="max-h-[250px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                          <th className="text-left py-2">Año</th>
                          <th className="text-right py-2">Aportado</th>
                          <th className="text-right py-2">Saldo</th>
                          <th className="text-right py-2">Intereses</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.evolution.map((row) => (
                          <tr key={row.year} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                            <td className="py-2 font-mono text-white font-bold">{row.year}</td>
                            <td className="py-2 text-right font-mono text-slate-300">{formatEuroInt(row.capitalAportado)}</td>
                            <td className="py-2 text-right font-mono text-[#ffb3af] font-bold">{formatEuro(row.saldoBruto)}</td>
                            <td className="py-2 text-right font-mono text-[#4edea3]">{formatEuro(row.interesesAcumulados)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Info note */}
              <div className="glass-panel p-4 rounded-2xl border-dashed border-[#3c4a42] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#4edea3] flex-shrink-0 mt-0.5" />
                <p className="text-[#bbcabf] text-xs leading-relaxed">
                  <span className="text-white font-bold">Cálculo determinista.</span> Las cuentas remuneradas garantizan un tipo fijo ({results.tae}% TAE), por lo que no existe volatilidad.
                  Los intereses están sujetos a una retención del 19% en la base imponible del ahorro (IRPF español simplificado).
                  Los depósitos están protegidos hasta 100.000 € por el Fondo de Garantía de Depósitos.
                </p>
              </div>
            </>
          ) : (
            <div className="glass-panel rounded-2xl p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#ffb3af]/10 flex items-center justify-center mb-4">
                <Coins className="w-8 h-8 text-[#ffb3af] opacity-60" />
              </div>
              <p className="text-white font-bold text-lg mb-2">Selecciona una cuenta y ejecuta la simulación</p>
              <p className="text-[#bbcabf] text-sm max-w-md">
                Elige una cuenta remunerada de la lista, ajusta tu capital y aportación mensual. Después pulsa "Simular" para ver el rendimiento con interés compuesto.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
