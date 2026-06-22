import { useState } from "react";
import { Search, Bell, HelpCircle, Menu } from "lucide-react";

import { SimulationParams, ViewType } from "./types";
import LandingPage from "./components/LandingPage";
import Sidebar from "./components/Sidebar";
import DashboardScreen from "./components/DashboardScreen";
import SimuladorScreen from "./components/SimuladorScreen";
import IndexadosScreen from "./components/IndexadosScreen";
import RemuneradasScreen from "./components/RemuneradasScreen";
import CarterasScreen from "./components/CarterasScreen";
import ComparadorScreen from "./components/ComparadorScreen";
import HistorialScreen from "./components/HistorialScreen";
import ConfiguracionScreen from "./components/ConfiguracionScreen";

export default function App() {
  // Navigation states: default to LandingPage for a smooth first experience
  const [isLanding, setIsLanding] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>("dashboard");

  // Global simulation inputs synced across all active widgets
  const [params, setParams] = useState<SimulationParams>({
    capitalInicial: 20000,
    aportacionMensual: 400,
    tiempoAnios: 25,
    interesAnual: 7.0,
    inflacionAnual: 2.0,
    volatilidadAnual: 11.5,
    perfilRiesgo: "moderado"
  });

  // Mobile navigation drawer toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Router to render the current selected screen
  const renderViewContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <DashboardScreen
            initialParams={params}
            onSetParams={setParams}
            onNavigate={(view) => setActiveView(view)}
          />
        );
      case "simulador":
        return <SimuladorScreen params={params} onSetParams={setParams} />;
      case "indexados":
        return <IndexadosScreen params={params} onSetParams={setParams} />;
      case "remuneradas":
        return <RemuneradasScreen params={params} onSetParams={setParams} />;
      case "carteras":
        return <CarterasScreen params={params} onSetParams={setParams} />;
      case "comparador":
        return <ComparadorScreen params={params} />;
      case "historial":
        return <HistorialScreen params={params} onLoadParams={setParams} />;
      case "configuracion":
        return <ConfiguracionScreen params={params} onSetParams={setParams} />;
      default:
        return (
          <DashboardScreen
            initialParams={params}
            onSetParams={setParams}
            onNavigate={(view) => setActiveView(view)}
          />
        );
    }
  };

  if (isLanding) {
    return <LandingPage onEnterSimulator={() => setIsLanding(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-[#dae2fd] flex font-sans">
      {/* Side Navigation panel */}
      <Sidebar
        currentView={activeView}
        onChangeView={(view) => {
          setActiveView(view);
          setMobileMenuOpen(false);
        }}
        onExit={() => setIsLanding(true)}
      />

      {/* Main Workspace Frame container */}
      <div className="flex-1 min-w-0 md:pl-64 flex flex-col min-h-screen relative">
        {/* Top Header Navbar */}
        <header className="sticky top-0 z-30 flex justify-between items-center h-16 px-6 bg-[#0b1326]/75 backdrop-blur-md border-b border-[#1e293b]/70 w-full">
          {/* Mobile hamburger menu button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-72 hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 cursor-pointer" />
              <input
                type="text"
                placeholder="Buscar fondos, activos o estrategias..."
                className="w-full bg-[#131b2e] border border-[#2d3449] rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-400 focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Action showcase element */}
            <span className="hidden leading-none xs:inline-flex bg-[#4edea3]/10 border border-[#4edea3]/20 py-1.5 px-3 rounded-lg text-[10px] font-mono tracking-wide font-semibold text-[#4edea3] uppercase">
              SEÑAL EN TIEMPO REAL
            </span>

            {/* Icons controls */}
            <div className="flex items-center gap-3.5 text-slate-400">
              <Bell className="w-4 h-5 hover:text-white transition-colors cursor-pointer" />
              <HelpCircle className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>
        </header>

        {/* Mobile menu view drawer overflow */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-[#020617] z-40 p-4 border-t border-[#1e293b]/80 flex flex-col gap-2">
            {(
              [
                { id: "dashboard", label: "Dashboard" },
                { id: "simulador", label: "Simulador" },
                { id: "indexados", label: "Fondos Indexados" },
                { id: "remuneradas", label: "Cuentas Remuneradas" },
                { id: "carteras", label: "Carteras" },
                { id: "comparador", label: "Comparar" },
                { id: "historial", label: "Historial" },
                { id: "configuracion", label: "Configuración" }
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left py-3 px-4 rounded-xl font-bold text-xs ${
                  activeView === item.id ? "bg-[#4edea3] text-black" : "bg-slate-900 text-[#bbcabf]"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => setIsLanding(true)}
              className="w-full text-center py-3 px-4 rounded-xl bg-red-500/10 text-red-300 font-bold text-xs mt-6"
            >
              Volver a la Landing Page
            </button>
          </div>
        )}

        {/* Active view workspace main render element */}
        <main className="flex-grow p-6 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto min-h-0">
            {renderViewContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
