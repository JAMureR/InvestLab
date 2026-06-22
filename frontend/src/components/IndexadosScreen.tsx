import { useState, useMemo } from "react";
import {
  TrendingUp,
  Globe,
  Plus,
  Compass,
  Download,
  Info,
  CheckCircle,
  HelpCircle,
  Percent,
  AlertTriangle,
  FolderOpen
} from "lucide-react";
import { IndexFund, SimulationParams } from "../types";
import { CATALOG_FUNDS } from "../utils/finance";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

interface IndexadosScreenProps {
  params: SimulationParams;
  onSetParams: (params: SimulationParams) => void;
}

export default function IndexadosScreen({ params, onSetParams }: IndexadosScreenProps) {
  const [selectedRegion, setSelectedRegion] = useState("Todas las Regiones");
  const [selectedAsset, setSelectedAsset] = useState("Todos");
  const [selectedFund, setSelectedFund] = useState<IndexFund | null>(CATALOG_FUNDS[0]);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Filter logic
  const filteredFunds = useMemo(() => {
    return CATALOG_FUNDS.filter((fund) => {
      const regionMatch =
        selectedRegion === "Todas las Regiones" || fund.region.toLowerCase() === selectedRegion.toLowerCase();
      const assetMatch =
        selectedAsset === "Todos" ||
        (selectedAsset === "Renta Variable" && fund.category.includes("Renta Variable"));
      return regionMatch && assetMatch;
    });
  }, [selectedRegion, selectedAsset]);

  // Click on fund dynamically updates global simulation variables matching actual fund performance
  const handleSelectFund = (fund: IndexFund) => {
    setSelectedFund(fund);
    onSetParams({
      ...params,
      interesAnual: fund.historicalReturn5Y, // use historical 5Y annualized returns as target rate
      volatilidadAnual: fund.volatility, // use standard deviation volatility
      perfilRiesgo: fund.riskRating >= 6 ? "agresivo" : fund.riskRating >= 5 ? "moderado" : "conservador"
    });
  };

  const formatPercent = (val: number) => {
    return `${(val * 100).toFixed(2)}%`;
  };

  const formatEuro = (val: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(val);
  };

  // Mock comparison chart historical Base 100 values
  const relativeChartData = [
    { year: "2019", "S&P 500": 100, "All-World": 100, "MSCI World": 100 },
    { year: "2020", "S&P 500": 118, "All-World": 112, "MSCI World": 114 },
    { year: "2021", "S&P 500": 142, "All-World": 128, "MSCI World": 131 },
    { year: "2022", "S&P 500": 116, "All-World": 109, "MSCI World": 111 },
    { year: "2023", "S&P 500": 146, "All-World": 131, "MSCI World": 134 },
    { year: "HOY", "S&P 500": 188, "All-World": 162, "MSCI World": 165 }
  ];

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Fondo,Ticker,ISIN,Rentabilidad 1A,Rentabilidad 5A Anualizada,TER,Volatilidad,Beta,SRRI\n";
    filteredFunds.forEach((fund) => {
      csvContent += `"${fund.name}",${fund.ticker},${fund.isin},${fund.historicalReturn1Y}%,${fund.historicalReturn5Y}%,${fund.ter * 100}%,${fund.volatility}%,${fund.beta},${fund.riskRating}/7\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "catalogo_fondos_portfoliolab.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#1e293b]/70">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Simulador de Fondos Indexados
          </h2>
          <p className="text-[#bbcabf] text-sm mt-1">
            Proyecta tu patrimonio ideal invirtiendo en los fondos y ETFs globales de mayor capitalización
          </p>
        </div>
        <div className="flex bg-[#131b2e] border border-[#2d3449] rounded-xl px-4 py-2.5 items-center gap-2">
          <Globe className="w-4 h-4 text-[#4edea3] flex-shrink-0 animate-pulse" />
          <span className="text-xs font-semibold text-[#bbcabf]">
            Estado de los Mercados: <span className="text-[#4edea3]">ABIERTOS</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Funds List Catalog section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[#4edea3]" />
                <span>Catálogo de Fondos</span>
              </h3>
              
              {/* Filter controls */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="bg-slate-900 border border-[#2d3449] text-xs px-3 py-1.5 rounded-lg text-[#bbcabf] focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] outline-none cursor-pointer"
                >
                  <option>Todas las Regiones</option>
                  <option>EE.UU.</option>
                  <option>Global</option>
                  <option>Países Desarrollados</option>
                  <option>Emergentes</option>
                </select>

                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="bg-slate-900 border border-[#2d3449] text-xs px-3 py-1.5 rounded-lg text-[#bbcabf] focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] outline-none cursor-pointer"
                >
                  <option value="Todos">Todos los Activos</option>
                  <option value="Renta Variable">Renta Variable (Acciones)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3.5">
              {filteredFunds.map((fund) => {
                const isSelected = selectedFund?.id === fund.id;
                return (
                  <div
                    key={fund.id}
                    className={`border rounded-xl p-4 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:border-[#4edea3]/40 ${
                      isSelected
                        ? "bg-[#171f33]/90 border-[#4edea3] shadow-md shadow-[#4edea3]/5"
                        : "bg-slate-900/60 border-[#1e293b] hover:bg-slate-900"
                    }`}
                    onClick={() => handleSelectFund(fund)}
                  >
                    <div className="min-w-0 flex-1 flex gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex-shrink-0 flex items-center justify-center text-slate-400">
                        <TrendingUp className="w-5 h-5 text-slate-300" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#dae2fd] text-sm md:text-base leading-snug truncate">
                            {fund.name}
                          </h4>
                          <span className="font-mono text-[9px] bg-slate-800 text-[#4edea3] font-bold px-1.5 py-0.5 rounded leading-none">
                            {fund.ticker}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[11px] text-slate-400 font-medium">
                          <span className="font-mono">ISIN: {fund.isin}</span>
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-[#ffb3af]" /> Riesgo: {fund.riskRating}/7
                          </span>
                          <span className="flex items-center gap-1">
                            <Percent className="w-3.5 h-3.5" /> Comisión TER: {(fund.ter * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-800 sm:border-0">
                      <div className="text-left sm:text-right">
                        <p className="font-mono text-sm md:text-base font-bold text-[#4edea3]">
                          +{fund.historicalReturn1Y}%
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">Retorno 1 Año</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectFund(fund);
                        }}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#4edea3] text-black"
                            : "bg-[#4edea3]/10 text-[#4edea3] hover:bg-[#4edea3] hover:text-black"
                        }`}
                        title="Simular con este fondo indexado líder"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical line comparison chart BASE 100 */}
          <div className="glass-panel p-5 rounded-2xl h-[360px] flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-base leading-tight">Comparativa Histórica</h3>
              <p className="text-xs text-[#bbcabf] mt-0.5">Rentabilidad acumulativa relativa base 100 (Estilo Morningstar 5 años)</p>
            </div>

            <div className="flex-1 w-full min-h-0 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={relativeChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2c354a" opacity={0.2} />
                  <XAxis dataKey="year" stroke="#bbcabf" fontSize={10} tickLine={false} />
                  <YAxis stroke="#bbcabf" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#171f33", borderColor: "#2d3449", color: "#dae2fd", fontSize: 11 }} />
                  <Line type="monotone" dataKey="S&P 500" stroke="#4edea3" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="All-World" stroke="#b4c5ff" strokeWidth={2} />
                  <Line type="monotone" dataKey="MSCI World" stroke="#ffb3af" strokeWidth={1.5} strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-2 uppercase border-t border-slate-800 pt-3">
              <span>Rendimiento Base 100</span>
              <span>Análisis Geográfico de Diversificación</span>
            </div>
          </div>
        </div>

        {/* Selected fund analytics sidebar detail */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl flex flex-col h-full bg-gradient-to-tr from-[#131b2e] to-[#171f33]">
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1 px-1.5 bg-[#4edea3]/10 text-[#4edea3] rounded-lg">
                <Compass className="w-5 h-5" />
              </span>
              <h4 className="font-bold text-white text-base">Fondo de Interés</h4>
            </div>

            {selectedFund ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <h5 className="font-mono text-xs text-[#4edea3] uppercase tracking-widest leading-none font-bold">
                    {selectedFund.ticker}
                  </h5>
                  <h3 className="text-lg font-bold text-white mt-1 border-b border-[#2d3449] pb-3 leading-snug">
                    {selectedFund.name}
                  </h3>

                  <div className="space-y-3.5 mt-5">
                    {/* Return metric 5Y */}
                    <div className="flex justify-between text-xs pb-2 border-b border-slate-800">
                      <span className="text-[#bbcabf]">ISIN Internacional</span>
                      <span className="text-white font-mono font-bold">{selectedFund.isin}</span>
                    </div>

                    <div className="flex justify-between text-xs pb-2 border-b border-slate-800">
                      <span className="text-[#bbcabf]">Comisión de Gestión (TER)</span>
                      <span className="text-[#4edea3] font-bold font-mono">
                        {(selectedFund.ter * 100).toFixed(2)}% anual
                      </span>
                    </div>

                    <div className="flex justify-between text-xs pb-2 border-b border-slate-800">
                      <span className="text-[#bbcabf]">Retorno de Largo Plazo (5A)</span>
                      <span className="text-[#4edea3] font-bold font-mono">
                        +{selectedFund.historicalReturn5Y}% / año
                      </span>
                    </div>

                    <div className="flex justify-between text-xs pb-2 border-b border-slate-800">
                      <span className="text-[#bbcabf]">Volatilidad Estimada</span>
                      <span className="text-white font-mono font-bold">
                        {selectedFund.volatility}% (Std Dev)
                      </span>
                    </div>

                    <div className="flex justify-between text-xs pb-2 border-b border-slate-800">
                      <span className="text-[#bbcabf]">Beta de Mercado</span>
                      <span className="text-white font-mono font-bold">{selectedFund.beta.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-[#bbcabf]">Área Geográfica</span>
                      <span className="text-white font-bold">{selectedFund.region}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-dashed border-[#3c4a42] bg-[#4edea3]/5 text-[11px] text-[#bbcabf] leading-relaxed italic mt-4">
                  "Sincronizado con el plan principal. Al seleccionar este fondo, se configuran las matemáticas
                  de la simulación con la rentabilidad histórica anualizada (+{selectedFund.historicalReturn5Y}%)
                  y la desviación estándar de volatilidad de esta clase de activo."
                </div>

                <button
                  onClick={() => handleSelectFund(selectedFund)}
                  className="w-full py-3.5 bg-[#4edea3] text-black font-extrabold text-xs tracking-wider uppercase rounded-xl hover:bg-[#3cd696] transition-all duration-300 mt-6 shadow-lg shadow-[#4edea3]/10"
                >
                  Sincronizar Simulador General
                </button>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                Por favor, elija un fondo del catálogo para inspeccionar.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed information table */}
      <div className="glass-panel rounded-2xl overflow-hidden mt-6">
        <div className="p-5 border-b border-[#1e293b] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-white text-base">Ficha Técnica de Activos Disponibles</h3>
            <p className="text-xs text-[#bbcabf] mt-0.5">Métricas de control registradas para integraciones</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="text-xs bg-[#171f33] hover:bg-slate-800 border border-[#1e293b] py-2.5 px-4 rounded-xl font-bold flex items-center gap-2 cursor-pointer text-[#4edea3]"
          >
            <Download className="w-4 h-4" />
            <span>{copiedSuccess ? "¡Descargado CSV!" : "Exportar Datos como CSV"}</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-[#171f33]/65 text-slate-400 border-b border-[#1e293b] uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Fondo / ISIN</th>
                <th className="px-6 py-4">Símbolo</th>
                <th className="px-6 py-4">Rentabilidad Anual 5A</th>
                <th className="px-6 py-4">Escala de Riesgo</th>
                <th className="px-6 py-4">Comisión Gestión (TER)</th>
                <th className="px-6 py-4">Volatilidad</th>
                <th className="px-6 py-4">Beta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {CATALOG_FUNDS.map((fund) => (
                <tr key={fund.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4.5 font-bold text-white">
                    <div>{fund.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono font-medium mt-0.5">{fund.isin}</div>
                  </td>
                  <td className="px-6 py-4.5 font-mono text-slate-300">{fund.ticker}</td>
                  <td className="px-6 py-4.5 text-[#4edea3] font-bold font-mono">+{fund.historicalReturn5Y}%</td>
                  <td className="px-6 py-4.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-white font-mono">
                      SRRI {fund.riskRating}/7
                    </span>
                  </td>
                  <td className="px-6 py-4.5 font-mono">{(fund.ter * 100).toFixed(2)}%</td>
                  <td className="px-6 py-4.5 font-mono">{fund.volatility}%</td>
                  <td className="px-6 py-4.5 font-mono">{fund.beta.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
