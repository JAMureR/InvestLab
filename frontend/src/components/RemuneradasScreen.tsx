import { useState, useMemo } from "react";
import {
  Coins,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Info,
  Sliders,
  DollarSign,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Percent,
  Calculator
} from "lucide-react";
import { RemuneratedAccount, SimulationParams } from "../types";
import { CATALOG_ACCOUNTS } from "../utils/finance";

interface RemuneradasScreenProps {
  params: SimulationParams;
  onSetParams: (params: SimulationParams) => void;
}

export default function RemuneradasScreen({ params, onSetParams }: RemuneradasScreenProps) {
  const [selectedAcc, setSelectedAcc] = useState<RemuneratedAccount | null>(CATALOG_ACCOUNTS[0]);
  const [testCapital, setTestCapital] = useState(25000); // 25.000€ as default calculator value

  const handleSelectAccount = (account: RemuneratedAccount) => {
    setSelectedAcc(account);
    // Since high-yield interest accounts has close to zero volatility:
    onSetParams({
      ...params,
      interesAnual: account.percentageTAE,
      volatilidadAnual: 0.5, // minimal volatility
      perfilRiesgo: "conservador"
    });
  };

  const formatEuro = (val: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2
    }).format(val);
  };

  // Immediate yield calculator metrics
  const calculatorResults = useMemo(() => {
    if (!selectedAcc) return { anual: 0, mensual: 0, trimestral: 0, netoMensual: 0, netoAnual: 0 };
    const taeRate = selectedAcc.percentageTAE / 100;
    
    // Annual gross yield
    const anual = testCapital * taeRate;
    const mensual = anual / 12;
    const trimestral = anual / 4;

    // Spanish taxes on savings (Simplified flat 19% withholding tax for standard resident accounts)
    const netoAnual = anual * (1 - 0.19);
    const netoMensual = mensual * (1 - 0.19);

    return {
      anual,
      mensual,
      trimestral,
      netoMensual,
      netoAnual
    };
  }, [selectedAcc, testCapital]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#1e293b]/70">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Simulador de Cuentas Remuneradas
          </h2>
          <p className="text-[#bbcabf] text-sm mt-1">
            Compara TAEs, frecuencias de pago y liquidez de las principales cuentas de ahorro europeas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Saving Accounts list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="font-bold text-white text-base mb-5 flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#4edea3]" />
              <span>Cuentas de Ahorros Comparadas</span>
            </h3>

            <div className="space-y-3.5">
              {CATALOG_ACCOUNTS.map((acc) => {
                const isSelected = selectedAcc?.id === acc.id;
                return (
                  <div
                    key={acc.id}
                    className={`border rounded-xl p-4 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:border-[#4edea3]/30 ${
                      isSelected
                        ? "bg-[#171f33]/90 border-[#4edea3] shadow-md shadow-[#4edea3]/5"
                        : "bg-slate-900/60 border-[#1e293b] hover:bg-slate-900"
                    }`}
                    onClick={() => handleSelectAccount(acc)}
                  >
                    <div className="min-w-0 flex-1 flex gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex-shrink-0 flex items-center justify-center text-[#4edea3] font-bold">
                        {acc.percentageTAE.toFixed(2)}%
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#dae2fd] text-sm md:text-base leading-snug">
                            {acc.name}
                          </h4>
                        </div>
                        <p className="text-slate-400 text-xs mt-1 font-medium italic">
                          Liquidación de intereses:{" "}
                          <span className="text-[#b4c5ff] capitalize">{acc.payoutFrequency}</span> • Liquidez:{" "}
                          <span className="text-white">{acc.liquidity}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-800 sm:border-0">
                      <div>
                        <span className="font-mono text-base font-extrabold text-[#4edea3]">
                          {acc.percentageTAE.toFixed(2)}% TAE
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block">Rendimiento</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAccount(acc);
                        }}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#4edea3] text-black"
                            : "bg-[#4edea3]/10 text-[#4edea3] hover:bg-[#4edea3] hover:text-black"
                        }`}
                        title="Simular con este interés TAE de bajo riesgo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive immediate yield calculator */}
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="font-bold text-white text-base mb-5 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#4edea3]" />
              <span>Calculadora de Rédito Inmediato</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Sliders */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#bbcabf] font-medium">Efectivo depositado</span>
                    <span className="text-[#4edea3] font-bold font-mono">{formatEuro(testCapital)}</span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={100000}
                    step={1000}
                    value={testCapital}
                    onChange={(e) => setTestCapital(Number(e.target.value))}
                    className="w-full accent-[#4edea3] h-1.5 bg-[#2d3449] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1.000 €</span>
                    <span>100.000 €</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-[#bbcabf]">
                  <p className="font-medium text-white mb-1">Retención Fiscal Española (IRPF)</p>
                  Las ganancias de capital superiores a cero tributan de base al 19% en la base imponible del ahorro.
                  Calculamos los importes netos para ofrecerte un plan de flujo real.
                </div>
              </div>

              {/* Yield outcomes column */}
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-3 font-mono">
                {/* Monthly */}
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 text-xs">
                  <div>
                    <p className="text-white font-sans font-bold">Interés Bruto Mensual</p>
                    <p className="text-[10px] text-slate-500">Sin impuestos</p>
                  </div>
                  <span className="text-sm font-bold text-[#b4c5ff]">{formatEuro(calculatorResults.mensual)}</span>
                </div>

                {/* Monthly Net */}
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 text-xs">
                  <div>
                    <p className="text-[#4edea3] font-sans font-bold">Interés Neto Mensual</p>
                    <p className="text-[10px] text-slate-500">Con retención (19%)</p>
                  </div>
                  <span className="text-base font-extrabold text-[#4edea3]">{formatEuro(calculatorResults.netoMensual)}</span>
                </div>

                {/* Yearly Net */}
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <p className="text-white font-sans font-bold">Interés Neto Anual</p>
                    <p className="text-[10px] text-slate-500">Con retención (19%)</p>
                  </div>
                  <span className="text-sm font-bold">{formatEuro(calculatorResults.netoAnual)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Savings account details sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl flex flex-col h-full bg-gradient-to-tr from-[#131b2e] to-[#171f33]">
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1 px-1.5 bg-[#4edea3]/10 text-[#4edea3] rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h4 className="font-bold text-white text-base">Garantías de Protección</h4>
            </div>

            {selectedAcc ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <h5 className="font-mono text-xs text-[#4edea3] uppercase tracking-widest leading-none font-bold">
                    CUENTA ACTIVA
                  </h5>
                  <h3 className="text-lg font-bold text-white mt-1 border-b border-[#2d3449] pb-3 leading-snug">
                    {selectedAcc.name}
                  </h3>

                  <div className="space-y-3 mt-5">
                    <div className="flex justify-between text-xs pb-1.5">
                      <span className="text-[#bbcabf]">Tasa de Rendimiento</span>
                      <span className="text-[#4edea3] font-bold font-mono">{selectedAcc.percentageTAE.toFixed(2)}% TAE</span>
                    </div>

                    <div className="flex justify-between text-xs pb-1.5">
                      <span className="text-[#bbcabf]">Frecuencia</span>
                      <span className="text-white capitalize">{selectedAcc.payoutFrequency}</span>
                    </div>

                    <div className="flex justify-between text-xs pb-1.5">
                      <span className="text-[#bbcabf]/80">Disponibilidad de Fondos</span>
                      <span className="text-white font-bold">{selectedAcc.liquidity.split(" ")[0]}</span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-[#bbcabf]">Fondo Garantía Depósitos</span>
                      <span className="text-white font-bold">Hasta 100.000 €</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                      Condiciones Particulares
                    </span>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {selectedAcc.conditions}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-dashed border-[#3c4a42] bg-[#4edea3]/5 text-[11px] text-[#bbcabf] leading-relaxed italic mt-4">
                  "Sincronizado. Al simular sobre cuentas remuneradas, se calcula el interés acumulativo
                  mensual compuesto de bajo riesgo. El motor asume una volatilidad nula ({params.volatilidadAnual === 0.5 ? "0.5%" : `${params.volatilidadAnual}%`})
                  y estimación estable."
                </div>

                <button
                  onClick={() => handleSelectAccount(selectedAcc)}
                  className="w-full py-3.5 bg-[#4edea3] text-black font-extrabold text-xs tracking-wider uppercase rounded-xl hover:bg-[#3cd696] transition-all duration-300 mt-6 shadow-lg shadow-[#4edea3]/10"
                >
                  Sincronizar Simulador General
                </button>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                Por favor, elija una cuenta de efectivo del catálogo para inspeccionar.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
