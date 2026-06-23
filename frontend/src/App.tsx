import { useState, useEffect } from "react";
import { Menu } from "lucide-react";

import { SimulationParams, ViewType } from "./types";
import { getStoredUser, logout, isAuthenticated } from "./utils/api";
import LandingPage from "./components/LandingPage";
import Sidebar from "./components/Sidebar";
import SimuladorScreen from "./components/SimuladorScreen";
import IndexadosScreen from "./components/IndexadosScreen";
import RemuneradasScreen from "./components/RemuneradasScreen";
import AuthModal from "./components/AuthModal";

export default function App() {
  const [isLanding, setIsLanding] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>("simulador");

  // Auth state
  const [user, setUser] = useState<{ username: string; email: string } | null>(getStoredUser());
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Listen for auth expiration events (from api.ts)
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
    };
    window.addEventListener("auth_expired", handleExpired);
    return () => window.removeEventListener("auth_expired", handleExpired);
  }, []);

  // Global simulation params (shared across screens if needed)
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const handleAuthSuccess = (userData: { username: string; email: string }) => {
    setUser(userData);
  };

  const renderViewContent = () => {
    switch (activeView) {
      case "simulador":
        return <SimuladorScreen params={params} onSetParams={setParams} />;
      case "indexados":
        return <IndexadosScreen params={params} onSetParams={setParams} />;
      case "remuneradas":
        return <RemuneradasScreen params={params} onSetParams={setParams} />;
      default:
        return <SimuladorScreen params={params} onSetParams={setParams} />;
    }
  };

  if (isLanding) {
    return (
      <>
        <LandingPage
          onEnterSimulator={(view) => {
            setIsLanding(false);
            if (view) setActiveView(view);
          }}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-[#dae2fd] flex font-sans">
      <Sidebar
        currentView={activeView}
        onChangeView={(view) => {
          setActiveView(view);
          setMobileMenuOpen(false);
        }}
        onExit={() => setIsLanding(true)}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        user={user}
        onLoginClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      <div className={`flex-1 min-w-0 flex flex-col min-h-screen relative transition-all duration-300 ${
        sidebarCollapsed ? "md:pl-20" : "md:pl-64"
      }`}>
        <header className="sticky top-0 z-30 flex justify-between items-center h-16 px-6 bg-[#0b1326]/75 backdrop-blur-md border-b border-[#1e293b]/70 w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-white hidden sm:block">
              {activeView === "simulador" && "Simulador de Inversiones"}
              {activeView === "indexados" && "Simulador de Fondos Indexados"}
              {activeView === "remuneradas" && "Simulador de Cuentas Remuneradas"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <span className="text-xs font-mono text-[#bbcabf]">
                <span className="text-[#4edea3] font-bold">{user.username}</span>
              </span>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-xs font-semibold text-[#bbcabf] hover:text-[#4edea3] transition-colors cursor-pointer"
              >
                Iniciar Sesión
              </button>
            )}
            <span className="inline-flex bg-[#4edea3]/10 border border-[#4edea3]/20 py-1.5 px-3 rounded-lg text-[10px] font-mono tracking-wide font-semibold text-[#4edea3] uppercase">
              INVESTLAB
            </span>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-[#020617] z-40 p-4 border-t border-[#1e293b]/80 flex flex-col gap-2">
            {([
              { id: "simulador", label: "Simulador de Inversiones" },
              { id: "indexados", label: "Simulador de Fondos" },
              { id: "remuneradas", label: "Simulador de Cuentas" }
            ] as const).map((item) => (
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
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-center py-3 px-4 rounded-xl bg-red-500/10 text-red-300 font-bold text-xs mt-2"
              >
                Cerrar Sesión ({user.username})
              </button>
            ) : (
              <button
                onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }}
                className="w-full text-center py-3 px-4 rounded-xl bg-[#4edea3]/10 text-[#4edea3] font-bold text-xs mt-2"
              >
                Iniciar Sesión
              </button>
            )}
            <button
              onClick={() => setIsLanding(true)}
              className="w-full text-center py-3 px-4 rounded-xl bg-red-500/10 text-red-300 font-bold text-xs mt-6"
            >
              Volver a la Landing Page
            </button>
          </div>
        )}

        <main className="flex-grow p-6 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto min-h-0">
            {renderViewContent()}
          </div>
        </main>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
