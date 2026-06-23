import {
  LineChart,
  TrendingUp,
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
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  currentView,
  onChangeView,
  onExit,
  collapsed,
  setCollapsed
}: SidebarProps) {
  const menuItems = [
    { id: "simulador", label: "Simulador Inversiones", icon: LineChart },
    { id: "indexados", label: "Fondos Indexados", icon: TrendingUp },
    { id: "remuneradas", label: "Cuentas Remuneradas", icon: Coins }
  ] as const;

  return (
    <aside
      className={`hidden md:flex h-screen bg-[#171f33] border-r border-[#1e293b] flex-col pt-6 pb-4 transition-all duration-300 z-40 fixed left-0 top-0 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className="px-6 mb-8 flex justify-between items-center overflow-hidden">
        {!collapsed && (
          <div>
            <h1 className="font-extrabold text-xl text-white flex items-center gap-2">
              Invest<span className="text-[#4edea3]">Lab</span>
            </h1>
            <p className="text-[11px] text-[#bbcabf] font-mono leading-none tracking-widest uppercase">
              Simulador Financiero
            </p>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded bg-[#4edea3]/20 flex items-center justify-center text-[#4edea3] font-bold text-sm mx-auto">
            IL
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

      {/* Sidebar Footer */}
      <div className="px-4 mt-auto border-t border-[#1e293b]/70 pt-4">
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
