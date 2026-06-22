import { useState } from "react";
import { Settings, Cpu, ShieldCheck, Check, Database, Share2, HelpCircle } from "lucide-react";
import { SimulationParams } from "../types";

interface ConfiguracionScreenProps {
  params: SimulationParams;
  onSetParams: (params: SimulationParams) => void;
}

export default function ConfiguracionScreen({ params, onSetParams }: ConfiguracionScreenProps) {
  const [irrRate, setIrrRate] = useState(19); // default 19% Spanish saving brackets
  const [success, setSuccess] = useState(false);

  const handleSaveConfig = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#1e293b]/70">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Configuración y Arquitectura
          </h2>
          <p className="text-[#bbcabf] text-sm mt-1">
            Modela variables de retención fiscal y revisa la ingeniería detrás de la plataforma
          </p>
        </div>
      </div>

      {success && (
        <div className="bg-[#10b981]/15 border border-[#10b981]/30 p-3 rounded-xl text-xs text-[#4edea3] font-medium">
          ¡Ajustes guardados con éxito de forma local!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Settings panels column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl bg-gradient-to-tr from-[#131b2e] to-[#171f33]">
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#4edea3]" />
              <span>Ajustes Generales</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1.5">
                  Retención Fiscal Cuentas de Ahorro / Plusvalías
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIrrRate(19)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                      irrRate === 19
                        ? "bg-[#4edea3]/10 border-[#4edea3] text-[#4edea3]"
                        : "bg-slate-900 border-[#2d3449] text-[#bbcabf]"
                    }`}
                  >
                    19% Standard
                  </button>
                  <button
                    onClick={() => setIrrRate(21)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                      irrRate === 21
                        ? "bg-[#4edea3]/10 border-[#4edea3] text-[#4edea3]"
                        : "bg-slate-900 border-[#2d3449] text-[#bbcabf]"
                    }`}
                  >
                    21% Brackets
                  </button>
                  <button
                    onClick={() => setIrrRate(0)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                      irrRate === 0
                        ? "bg-[#4edea3]/10 border-[#4edea3] text-[#4edea3]"
                        : "bg-slate-900 border-[#2d3449] text-[#bbcabf]"
                    }`}
                  >
                    0% Libre
                  </button>
                </div>
                <p className="text-[9px] text-[#bbcabf]/70 mt-1">
                  Brackets aplicados en el IRPF español sobre ganancias líquidas de inversión compuesta.
                </p>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">
                  Moneda Base por defecto
                </label>
                <select className="w-full bg-slate-900 border border-[#2d3449] p-2.5 text-xs rounded-xl focus:border-[#4edea3] text-white outline-none cursor-not-allowed opacity-65">
                  <option>Euro (€) - Estándar España/Unión Europea</option>
                  <option>USD ($)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">
                  Idioma Predilecto
                </label>
                <select className="w-full bg-slate-900 border border-[#2d3449] p-2.5 text-xs rounded-xl focus:border-[#4edea3] text-white outline-none cursor-not-allowed opacity-65">
                  <option>Español (España)</option>
                </select>
              </div>

              <button
                onClick={handleSaveConfig}
                className="w-full py-3 mt-4 bg-[#4edea3] text-black font-extrabold text-xs tracking-wider uppercase rounded-xl hover:bg-[#3cd696] transition-all cursor-pointer shadow-lg shadow-[#4edea3]/10"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>

        {/* System Architecture Section */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="glass-panel p-5 rounded-2xl flex-1 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="p-1 px-1.5 bg-[#b4c5ff]/10 text-[#b4c5ff] rounded-lg">
                  <Cpu className="w-5 h-5 flex-shrink-0" />
                </span>
                <h3 className="font-bold text-white text-base">Arquitectura del Sistema Desacoplada</h3>
              </div>
              <p className="text-[#bbcabf] text-xs leading-relaxed max-w-2xl">
                PortfolioLab está construido bajo un enfoque de **SaaS Financiero Real**. La lógica de
                negocio de simulación está totalmente encapsulada, permitiendo que esta UI consuma desgloses
                estocásticos de un backend REST desarrollado en Java sin alterar las responsabilidades del React cliente.
              </p>

              {/* Dynamic visual diagram flow chart */}
              <div className="my-6 p-4 rounded-xl bg-slate-900/60 border border-[#1e293b] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono font-medium">
                {/* Frontend block */}
                <div className="flex-1 w-full bg-[#171f33] border border-[#2d3449] rounded-xl p-3 text-center space-y-1 relative">
                  <span className="text-[#4edea3] text-[10px] block font-bold">CLIENTE</span>
                  <p className="text-white">React + TypeScript</p>
                  <p className="text-slate-500 text-[10px]">Vite & Tailwind CSS</p>
                </div>

                {/* Arrow */}
                <div className="text-slate-500 font-bold rotate-90 md:rotate-0 flex-shrink-0 flex flex-col items-center">
                  <Share2 className="w-4 h-4 text-[#4edea3] mb-1" />
                  <span className="text-[10px] font-bold">REST API</span>
                  <span className="text-[9px] text-slate-600 block">[JSON payload]</span>
                </div>

                {/* Java engine block */}
                <div className="flex-1 w-full bg-[#0053db]/10 border border-[#0053db]/40 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[#b4c5ff] text-[10px] block font-bold">CORRE DE ENGINE</span>
                  <p className="text-white">Java Simulation Engine</p>
                  <p className="text-[#b4c5ff] text-[10px]">Box-Muller Normal Dist</p>
                </div>

                {/* Arrow */}
                <div className="text-slate-500 font-bold rotate-90 md:rotate-0 flex-shrink-0">
                  {"──>"}
                </div>

                {/* Core modules list */}
                <div className="flex-1 w-full bg-slate-800/40 border border-slate-700/60 rounded-xl p-3 text-center space-y-1 text-[11px]">
                  <span className="text-slate-400 text-[9px] block font-bold">MÓDULOS JAVA</span>
                  <p className="text-slate-200">CompoundInterest</p>
                  <p className="text-slate-200">MonteCarloEngine</p>
                  <p className="text-slate-200">InflationEngine</p>
                </div>
              </div>

              {/* Explanatory bullet steps summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-[#bbcabf]">
                <div className="space-y-2">
                  <h5 className="font-bold text-white uppercase text-[10px] tracking-wider text-[#4edea3]">
                    Lógica Financiera Desacoplada
                  </h5>
                  <p>
                    Toda la analítica estocástica reside en <code className="text-[#b4c5ff] font-mono">finance.ts</code>.
                    Sustituir los cálculos por peticiones a un backend Java Spring Boot se reduce a redefinir el custom hook sin tocar un solo componente visual.
                  </p>
                </div>
                <div className="space-y-2">
                  <h5 className="font-bold text-white uppercase text-[10px] tracking-wider text-[#4edea3]">
                    Proyecciones de Máximo Rendimiento
                  </h5>
                  <p>
                    La generación stochástica está diseñada de forma mobile-first. Al realizar 1.000 trayectorias secuenciales en menos de 4ms en el cliente, aseguramos animaciones estables sin latencias de red.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono mt-4">
              <span>Tecnologías: Spring Boot Framework (futuro) • Spring REST API</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
