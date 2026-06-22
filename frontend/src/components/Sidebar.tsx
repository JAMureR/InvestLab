import {
  LayoutDashboard,
  LineChart,
  TrendingUp,
  Wallet,
  Settings,
  Scale,
  History,
  Coins,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { ViewType } from "../types";

interface SidebarProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
  onExit: () => void;
}

export default function Sidebar({ currentView, onChangeView, onExit }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "simulador", label: "Simulador", icon: LineChart },
    { id: "indexados", label: "Fondos Indexados", icon: TrendingUp },
    { id: "remuneradas", label: "Cuentas Remuneradas", icon: Coins },
    { id: "carteras", label: "Carteras", icon: Wallet },
    { id: "comparador", label: "Comparar", icon: Scale },
    { id: "historial", label: "Historial", icon: History },
    { id: "configuracion", label: "Configuración", icon: Settings }
  ] as const;

  return (
    <aside
      className={`h-screen bg-[#171f33] border-r border-[#1e293b] flex flex-col pt-6 pb-4 transition-all duration-300 z-40 fixed left-0 top-0 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className="px-6 mb-8 flex justify-between items-center overflow-hidden">
        {!collapsed && (
          <div>
            <h1 className="font-extrabold text-xl text-white flex items-center gap-2">
              Portfolio<span className="text-[#4edea3]">Lab</span>
            </h1>
            <p className="text-[11px] text-[#bbcabf] font-mono leading-none tracking-widest uppercase">
              Analista Senior
            </p>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded bg-[#4edea3]/20 flex items-center justify-center text-[#4edea3] font-bold text-sm mx-auto">
            PL
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 px-1.5 rounded bg-slate-800 hover:bg-[#1e293b] text-slate-400 hover:text-white cursor-pointer absolute right-[-12px] top-7 border border-[#2d3449] rounded-full"
          title={collapsed ? "Expandir" : "Contraer"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? "text-[#4edea3] font-bold border-l-4 border-[#4edea3] bg-[#0053db]/10 bg-opacity-30"
                  : "text-[#bbcabf] hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[#4edea3]" : "text-[#bbcabf]"}`} />
              {!collapsed && <span className="text-sm font-medium tracking-wide">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer User Indicator */}
      <div className="px-4 mt-auto border-t border-[#1e293b]/70 pt-4">
        <div className="flex items-center gap-3 py-3 overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0 overflow-hidden border border-[#2d3449]">
            <img
              className="w-full h-full object-cover"
              alt="Avatar de Usuario Senior"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBe99IAz2AJj9q2Gdq26GHkCXj6B2HfhJnt3TQ-bSkRVqhBoa3l0s0wCjJ_20v7SkOWhwQ1rm-XF1F8wwWwvmLh-0I795_s3kvcFkCWvjb-7GuZ4TqYlhAL-mukXG86mk574FzjnLV4hO80paTaRS59Tf0r2Z-8BPb6z1fASm0RRPL3AP0wzGuj-bgvYs3gTwYe9IHsi8lxrFbHrd6XFjndKsm-BI9C0WZ3wARCa4V0aE6zNK2O_4rA4OgwrINdRLHu46FWTMK19ag_"
            />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">Usuario Premium</p>
              <p className="text-[10px] text-[#bbcabf] truncate uppercase font-mono">Plan Institucional</p>
            </div>
          )}
        </div>

        {/* Exit Button to return to landing page */}
        <button
          onClick={onExit}
          className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-300 text-[#bbcabf] text-xs font-medium cursor-pointer transition-colors"
          title="Salir del Simulador"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Volver a Inicio</span>}
        </button>
      </div>
    </aside>
  );
}
