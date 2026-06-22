import React, { useState, useEffect } from "react";
import { History, Download, Trash2, Calendar, FileSpreadsheet, PlayCircle, Plus } from "lucide-react";
import { SimulationParams, SavedSimulation } from "../types";
import { ejecutarSimulacion } from "../utils/finance";

interface HistorialScreenProps {
  params: SimulationParams;
  onLoadParams: (params: SimulationParams) => void;
}

export default function HistorialScreen({ params, onLoadParams }: HistorialScreenProps) {
  const [savedSims, setSavedSims] = useState<SavedSimulation[]>([]);
  const [newSimName, setNewSimName] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load saved simulations from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem("portfoliolab_simulations");
    if (raw) {
      try {
        setSavedSims(JSON.parse(raw));
      } catch (e) {
        // Safe recover
      }
    } else {
      // Seed initial mock simulations for visual completeness
      const seedSims: SavedSimulation[] = [
        {
          id: "seed-jubilacion",
          nombre: "Plan Jubilación 2055",
          fecha: new Date(Date.now() - 7200000).toLocaleString("es-ES"),
          params: {
            capitalInicial: 10000,
            aportacionMensual: 500,
            tiempoAnios: 30,
            interesAnual: 7.0,
            inflacionAnual: 2.0,
            volatilidadAnual: 12.5,
            perfilRiesgo: "moderado"
          },
          resultados: {
            valorFinal: 642300,
            capitalAportado: 190000
          }
        },
        {
          id: "seed-vivienda",
          nombre: "Compra Vivienda 5 años",
          fecha: new Date(Date.now() - 86400000).toLocaleString("es-ES"),
          params: {
            capitalInicial: 25000,
            aportacionMensual: 1000,
            tiempoAnios: 5,
            interesAnual: 3.5,
            inflacionAnual: 1.8,
            volatilidadAnual: 4.5,
            perfilRiesgo: "conservador"
          },
          resultados: {
            valorFinal: 92400,
            capitalAportado: 85000
          }
        }
      ];
      setSavedSims(seedSims);
      localStorage.setItem("portfoliolab_simulations", JSON.stringify(seedSims));
    }
  }, []);

  const saveSimulationToLocalStorage = (list: SavedSimulation[]) => {
    setSavedSims(list);
    localStorage.setItem("portfoliolab_simulations", JSON.stringify(list));
  };

  const handleSaveCurrent = () => {
    if (!newSimName.trim()) return;
    
    // Calculate final outcome for saving to the table summary
    const simResults = ejecutarSimulacion(params);

    const newSim: SavedSimulation = {
      id: "sim-" + Date.now(),
      nombre: newSimName,
      fecha: new Date().toLocaleString("es-ES"),
      params: { ...params },
      resultados: {
        valorFinal: simResults.valorFinal,
        capitalAportado: simResults.capitalAportado
      }
    };

    const updated = [newSim, ...savedSims];
    saveSimulationToLocalStorage(updated);
    setNewSimName("");
    setSuccessMsg("¡Proyección guardada con éxito!");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedSims.filter((item) => item.id !== id);
    saveSimulationToLocalStorage(filtered);
  };

  const handleLoadItem = (itemParams: SimulationParams) => {
    onLoadParams(itemParams);
    setSuccessMsg("¡Parámetros cargados en el simulador general!");
    setTimeout(() => setSuccessMsg(""), 2200);
  };

  const formatEuro = (val: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Full detailed CSV download for active stochastics projection
  const handleExportFullStochasticsCSV = (item: SavedSimulation) => {
    const testResults = ejecutarSimulacion(item.params);
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Anio,Capital Invertido Neto,Escenario Optimista (95%),Escenario Esperado (50%),Escenario Pesimista (5%)\n";
    
    testResults.serieEvolucion.forEach((row) => {
      csvContent += `${row.year},${row.capitalAportado},${row.valorOptimista},${row.valorMedio},${row.valorPesimista}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${item.nombre.replace(/\s+/g, "_")}_proyeccion_completa.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#1e293b]/70">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Archivo de Simulaciones
          </h2>
          <p className="text-[#bbcabf] text-sm mt-1">
            Guarda tus borradores, recupera configuraciones anteriores y descarga desgloses para análisis
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-[#10b981]/15 border border-[#10b981]/30 p-3.5 rounded-xl text-xs text-[#4edea3] font-medium animate-pulse">
          {successMsg}
        </div>
      )}

      {/* Main Grid Content split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Save Current active scenario component */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl bg-gradient-to-tr from-[#131b2e] to-[#171f33]">
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#4edea3]" />
              <span>Guardar Configuración Activa</span>
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-[#bbcabf] leading-relaxed">
                Puedes registrar las variables del simulador general (Capital Inicial, Aporte Mensual, Riesgo e Intereses) en tu historial para cargarlas más tarde.
              </p>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">
                  Nombre descriptivo del escenario
                </label>
                <input
                  type="text"
                  placeholder="Ej. Plan Jubilación 35 años S&P"
                  value={newSimName}
                  onChange={(e) => setNewSimName(e.target.value)}
                  className="w-full bg-slate-900 border border-[#2d3449] p-3 text-xs rounded-xl focus:border-[#4edea3] text-white outline-none"
                />
              </div>

              {/* Specs snapshot preview block */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-1.5 font-mono">
                <p className="text-slate-400 font-sans font-bold">SNAPSHOT ACTIVO</p>
                <p>Capital Inicial: {formatEuro(params.capitalInicial)}</p>
                <p>Aporte Mensual: {formatEuro(params.aportacionMensual)}</p>
                <p>Horizonte: {params.tiempoAnios} años</p>
                <p>TAE Esperado: {params.interesAnual}%</p>
              </div>

              <button
                onClick={handleSaveCurrent}
                disabled={!newSimName.trim()}
                className="w-full py-3 bg-[#4edea3] text-black font-extrabold text-xs tracking-wider uppercase rounded-xl hover:bg-[#3cd696] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-[#4edea3]/10"
              >
                <Plus className="w-4 h-4" />
                <span>Guardar Escenario</span>
              </button>
            </div>
          </div>
        </div>

        {/* History records lists */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="glass-panel p-5 rounded-2xl flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-[#b4c5ff]" />
                <span>Historial de Escenarios Guardados</span>
              </h3>

              {savedSims.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-sans">
                  No hay proyecciones guardadas en el historial todavía.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
                  {savedSims.map((sim) => (
                    <div
                      key={sim.id}
                      onClick={() => handleLoadItem(sim.params)}
                      className="p-4 bg-slate-900/40 hover:bg-slate-900/90 border border-[#1e293b] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-slate-700 cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm md:text-base leading-snug">
                            {sim.nombre}
                          </h4>
                          <span className="text-[9px] bg-slate-800 text-stone-300 font-mono font-medium px-1.5 py-0.5 rounded leading-none">
                            {sim.params.tiempoAnios}A • {sim.params.interesAnual.toFixed(1)}% TAE
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">
                          Registrado el {sim.fecha}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-1 sm:mt-0 pt-2 sm:pt-0 border-t border-slate-800/80 sm:border-0 font-mono">
                        <div className="text-left sm:text-right">
                          <p className="text-sm md:text-base font-bold text-[#4edea3]">
                            {formatEuro(sim.resultados.valorFinal)}
                          </p>
                          <p className="text-[10px] text-slate-500">Valor Final Estimado</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Export CSV fully calculated details of this slot */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportFullStochasticsCSV(sim);
                            }}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-[#4edea3] rounded-lg transition-all cursor-pointer"
                            title="Exportar Proyección Detallada Excel"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={(e) => handleDeleteItem(sim.id, e)}
                            className="p-2 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 rounded-lg transition-all cursor-pointer"
                            title="Eliminar del Historial"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>Sincronización Total Local</span>
              <span>CSV compatible con MS Excel / Google Sheets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
