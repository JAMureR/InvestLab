import { useState, useEffect } from "react";
import { History, Trash2, Download, Clock, Loader2, Save, AlertCircle } from "lucide-react";
import { getSimulations, deleteSimulation, saveSimulation, SavedSimulationDTO, SaveSimulationPayload, isAuthenticated } from "../utils/api";
import { SimulationParams } from "../types";

interface SavedSimulationsPanelProps {
  /** Current simulation type filter: "simulador", "indexados", "remuneradas" */
  simulationType: string;
  /** Current params to save */
  currentParams: SimulationParams;
  /** Callback when user loads a saved simulation */
  onLoadSimulation: (params: SimulationParams) => void;
  /** Optional selected fund/account ID */
  selectedFundId?: string;
  selectedAccountId?: string;
}

export default function SavedSimulationsPanel({
  simulationType,
  currentParams,
  onLoadSimulation,
  selectedFundId,
  selectedAccountId,
}: SavedSimulationsPanelProps) {
  const [simulations, setSimulations] = useState<SavedSimulationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const authenticated = isAuthenticated();

  const fetchSimulations = async () => {
    if (!authenticated) return;
    setLoading(true);
    try {
      const all = await getSimulations();
      // Filter by simulation type
      setSimulations(all.filter(s => s.simulationType === simulationType));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulations();
  }, [authenticated, simulationType]);

  const handleSave = async () => {
    if (!saveName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const payload: SaveSimulationPayload = {
        name: saveName.trim(),
        simulationType,
        capitalInicial: currentParams.capitalInicial,
        aportacionMensual: currentParams.aportacionMensual,
        tiempoAnios: currentParams.tiempoAnios,
        interesAnual: currentParams.interesAnual,
        inflacionAnual: currentParams.inflacionAnual,
        volatilidadAnual: currentParams.volatilidadAnual,
        perfilRiesgo: currentParams.perfilRiesgo,
        selectedFundId,
        selectedAccountId,
      };
      await saveSimulation(payload);
      setSaveName("");
      setShowSaveInput(false);
      setSuccessMsg("Simulación guardada correctamente");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchSimulations();
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSimulation(id);
      setSimulations(prev => prev.filter(s => s.id !== id));
    } catch {
      // silently fail
    }
  };

  const handleLoad = (sim: SavedSimulationDTO) => {
    onLoadSimulation({
      capitalInicial: sim.capitalInicial,
      aportacionMensual: sim.aportacionMensual,
      tiempoAnios: sim.tiempoAnios,
      interesAnual: sim.interesAnual,
      inflacionAnual: sim.inflacionAnual,
      volatilidadAnual: sim.volatilidadAnual,
      perfilRiesgo: (sim.perfilRiesgo || "moderado") as "conservador" | "moderado" | "agresivo",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatEuro = (val: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);

  if (!authenticated) {
    return (
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-[#4edea3]" />
          <span className="font-bold text-white text-sm">Mis Simulaciones</span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#1e293b]/40 border border-[#2d3449]">
          <AlertCircle className="w-4 h-4 text-[#bbcabf] flex-shrink-0" />
          <p className="text-xs text-[#bbcabf]">
            Inicia sesión para guardar y cargar tus simulaciones
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#4edea3]" />
          <span className="font-bold text-white text-sm">Mis Simulaciones</span>
          {simulations.length > 0 && (
            <span className="text-[10px] font-mono bg-[#4edea3]/10 text-[#4edea3] px-2 py-0.5 rounded-full">
              {simulations.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowSaveInput(!showSaveInput)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#4edea3] hover:text-[#3cd696] transition-colors cursor-pointer bg-[#4edea3]/10 px-3 py-1.5 rounded-lg"
        >
          <Save className="w-3.5 h-3.5" />
          Guardar actual
        </button>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="mb-3 p-2.5 rounded-xl bg-[#4edea3]/10 border border-[#4edea3]/20 text-[#4edea3] text-xs font-medium">
          ✓ {successMsg}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Save input */}
      {showSaveInput && (
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Nombre de la simulación..."
            className="flex-1 bg-[#1e293b]/60 border border-[#2d3449] rounded-lg px-3 py-2 text-white placeholder:text-slate-500 text-xs focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button
            onClick={handleSave}
            disabled={saving || !saveName.trim()}
            className="px-4 py-2 bg-[#4edea3] text-black font-bold text-xs rounded-lg hover:bg-[#3cd696] transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Guardar"}
          </button>
        </div>
      )}

      {/* Simulations list */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-[#4edea3] animate-spin" />
        </div>
      ) : simulations.length === 0 ? (
        <p className="text-xs text-[#bbcabf] text-center py-4">
          No tienes simulaciones guardadas en esta sección
        </p>
      ) : (
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {simulations.map((sim) => (
            <div
              key={sim.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#1e293b]/40 border border-[#2d3449] hover:border-slate-600 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-[#dae2fd] text-xs truncate">{sim.name}</h4>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                  <span>{formatEuro(sim.capitalInicial)}</span>
                  <span>•</span>
                  <span>{sim.tiempoAnios}a</span>
                  <span>•</span>
                  <span>{sim.interesAnual}%</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(sim.updatedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleLoad(sim)}
                  className="p-2 rounded-lg text-[#4edea3] hover:bg-[#4edea3]/10 transition-colors cursor-pointer"
                  title="Cargar simulación"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(sim.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Eliminar simulación"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
