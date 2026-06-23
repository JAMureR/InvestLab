import React, { useState, useEffect } from "react";
import { Edit, Trash2, Plus, X, Save, AlertTriangle } from "lucide-react";
import { 
  IndexFundDTO, 
  RemuneratedAccountDTO, 
  createFund, 
  updateFund, 
  deleteFund, 
  createAccount, 
  updateAccount, 
  deleteAccount 
} from "../utils/api";

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<"funds" | "accounts">("funds");
  
  // Data lists
  const [funds, setFunds] = useState<IndexFundDTO[]>([]);
  const [accounts, setAccounts] = useState<RemuneratedAccountDTO[]>([]);
  
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null means creating
  
  // Fund Form fields
  const [fundForm, setFundForm] = useState<IndexFundDTO>({
    id: "",
    name: "",
    ticker: "",
    isin: "",
    historicalReturn1Y: 0,
    historicalReturn5Y: 0,
    riskRating: 5,
    ter: 0.002,
    region: "",
    category: "",
    volatility: 0,
    beta: 1.0
  });

  // Account Form fields
  const [accountForm, setAccountForm] = useState<RemuneratedAccountDTO>({
    id: "",
    name: "",
    percentageTAE: 0,
    payoutFrequency: "mensual",
    liquidity: "Inmediata",
    riskRating: 1,
    conditions: ""
  });

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fundsRes = await fetch("http://localhost:8080/api/funds");
      const accountsRes = await fetch("http://localhost:8080/api/accounts");
      
      if (!fundsRes.ok || !accountsRes.ok) {
        throw new Error("No se pudo cargar el catálogo de productos");
      }
      
      setFunds(await fundsRes.json());
      setAccounts(await accountsRes.json());
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message: string, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(message);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Open modal for creating
  const handleOpenAdd = () => {
    setEditingId(null);
    setError(null);
    if (activeTab === "funds") {
      setFundForm({
        id: "",
        name: "",
        ticker: "",
        isin: "",
        historicalReturn1Y: 10,
        historicalReturn5Y: 10,
        riskRating: 5,
        ter: 0.002,
        region: "Global",
        category: "Renta Variable",
        volatility: 12,
        beta: 1.0
      });
    } else {
      setAccountForm({
        id: "",
        name: "",
        percentageTAE: 2.5,
        payoutFrequency: "mensual",
        liquidity: "Inmediata",
        riskRating: 1,
        conditions: "Sin comisiones de mantenimiento."
      });
    }
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (item: any) => {
    setError(null);
    if (activeTab === "funds") {
      const fund = item as IndexFundDTO;
      setEditingId(fund.id || null);
      setFundForm({ ...fund });
    } else {
      const acc = item as RemuneratedAccountDTO;
      setEditingId(acc.id || null);
      setAccountForm({ ...acc });
    }
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!window.confirm("¿Estás seguro de que quieres eliminar este producto del catálogo?")) return;
    
    setLoading(true);
    try {
      if (activeTab === "funds") {
        await deleteFund(id);
        setFunds(funds.filter(f => f.id !== id));
        showToast("Fondo indexado eliminado con éxito");
      } else {
        await deleteAccount(id);
        setAccounts(accounts.filter(a => a.id !== id));
        showToast("Cuenta remunerada eliminada con éxito");
      }
    } catch (err: any) {
      showToast(err.message || "Error al eliminar el producto", false);
    } finally {
      setLoading(false);
    }
  };

  // Handle Form submit (Save/Create)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (activeTab === "funds") {
        if (editingId) {
          // Update
          const updated = await updateFund(editingId, fundForm);
          setFunds(funds.map(f => f.id === editingId ? updated : f));
          showToast("Fondo indexado actualizado con éxito");
        } else {
          // Create
          const created = await createFund(fundForm);
          setFunds([...funds, created]);
          showToast("Fondo indexado creado con éxito");
        }
      } else {
        if (editingId) {
          // Update
          const updated = await updateAccount(editingId, accountForm);
          setAccounts(accounts.map(a => a.id === editingId ? updated : a));
          showToast("Cuenta remunerada actualizada con éxito");
        } else {
          // Create
          const created = await createAccount(accountForm);
          setAccounts([...accounts, created]);
          showToast("Cuenta remunerada creada con éxito");
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || "Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0b1326]/60 border border-[#1e293b]/70 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <h1 className="text-xl font-extrabold text-white">Panel de Administración</h1>
          <p className="text-xs text-[#a3b3cc] mt-1">
            Gestiona el catálogo global de fondos indexados y cuentas remuneradas que consumen los simuladores.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#4edea3] hover:bg-[#3ec48e] text-black font-bold text-xs rounded-xl shadow-lg shadow-[#4edea3]/10 hover:shadow-[#4edea3]/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Añadir Producto
        </button>
      </div>

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-[#4edea3] p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-ping" />
          {successMsg}
        </div>
      )}
      {error && !isModalOpen && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          {error}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-[#1e293b]/60">
        <button
          onClick={() => { setActiveTab("funds"); setError(null); }}
          className={`pb-3 px-6 text-xs font-bold transition-all relative ${
            activeTab === "funds" 
              ? "text-[#4edea3] border-b-2 border-[#4edea3]" 
              : "text-[#a3b3cc] hover:text-white"
          }`}
        >
          Fondos Indexados ({funds.length})
        </button>
        <button
          onClick={() => { setActiveTab("accounts"); setError(null); }}
          className={`pb-3 px-6 text-xs font-bold transition-all relative ${
            activeTab === "accounts" 
              ? "text-[#4edea3] border-b-2 border-[#4edea3]" 
              : "text-[#a3b3cc] hover:text-white"
          }`}
        >
          Cuentas Remuneradas ({accounts.length})
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-[#0b1326]/60 border border-[#1e293b]/70 rounded-2xl overflow-hidden backdrop-blur-md">
        {loading && funds.length === 0 && accounts.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#a3b3cc]">Cargando catálogo de productos...</div>
        ) : activeTab === "funds" ? (
          /* FUNDS TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#020617]/50 border-b border-[#1e293b]/50 text-[#a3b3cc] font-semibold">
                  <th className="p-4">ID / Nombre</th>
                  <th className="p-4">Ticker / ISIN</th>
                  <th className="p-4 text-center">Ret. 1 Año</th>
                  <th className="p-4 text-center">Ret. 5 Años</th>
                  <th className="p-4 text-center">Riesgo</th>
                  <th className="p-4 text-center">TER (Comisión)</th>
                  <th className="p-4">Región / Categoría</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/40">
                {funds.map((fund) => (
                  <tr key={fund.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 font-bold text-white max-w-[200px] truncate">
                      <div className="text-[10px] font-mono text-[#a3b3cc]">{fund.id}</div>
                      <div>{fund.name}</div>
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      <div>{fund.ticker}</div>
                      <div className="text-[10px] text-slate-500">{fund.isin}</div>
                    </td>
                    <td className="p-4 text-center font-bold text-emerald-400">+{fund.historicalReturn1Y}%</td>
                    <td className="p-4 text-center font-bold text-[#4edea3]">+{fund.historicalReturn5Y}%</td>
                    <td className="p-4 text-center">
                      <span className="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-bold">
                        {fund.riskRating}/7
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono text-slate-300">{(fund.ter * 100).toFixed(3)}%</td>
                    <td className="p-4 text-slate-300">
                      <div className="font-semibold">{fund.region}</div>
                      <div className="text-[10px] text-slate-500">{fund.category}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(fund)}
                          className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(fund.id)}
                          className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ACCOUNTS TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#020617]/50 border-b border-[#1e293b]/50 text-[#a3b3cc] font-semibold">
                  <th className="p-4">ID / Nombre</th>
                  <th className="p-4 text-center">TAE Remuneración</th>
                  <th className="p-4">Pago / Liquidez</th>
                  <th className="p-4 text-center">Riesgo</th>
                  <th className="p-4">Condiciones Clave</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/40">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 font-bold text-white max-w-[200px] truncate">
                      <div className="text-[10px] font-mono text-[#a3b3cc]">{acc.id}</div>
                      <div>{acc.name}</div>
                    </td>
                    <td className="p-4 text-center font-extrabold text-[#4edea3] text-sm">
                      {acc.percentageTAE.toFixed(2)}%
                    </td>
                    <td className="p-4 text-slate-300">
                      <div className="font-semibold capitalize">{acc.payoutFrequency}</div>
                      <div className="text-[10px] text-slate-500">{acc.liquidity}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-[#4edea3] px-2 py-0.5 rounded font-bold">
                        {acc.riskRating}/7
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 max-w-[300px] truncate" title={acc.conditions}>
                      {acc.conditions}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(acc)}
                          className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(acc.id)}
                          className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POPUP MODAL (Add / Edit Form) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0b1326] border border-[#1e293b]/80 max-w-xl w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Title */}
            <div className="flex justify-between items-center border-b border-[#1e293b]/60 pb-3">
              <h2 className="text-sm font-bold text-white">
                {editingId ? "Editar " : "Añadir "}
                {activeTab === "funds" ? "Fondo Indexado" : "Cuenta Remunerada"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#a3b3cc] hover:text-white hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-[11px] font-semibold">
                {error}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {activeTab === "funds" ? (
                /* FUND FORM FIELDS */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ID Field (Only editable when creating) */}
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">ID Único (URL-friendly)</label>
                    <input
                      type="text"
                      disabled={!!editingId}
                      required
                      placeholder="vanguard-sp500"
                      value={fundForm.id}
                      onChange={(e) => setFundForm({ ...fundForm, id: e.target.value })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-[#4edea3] disabled:opacity-50"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Nombre Comercial</label>
                    <input
                      type="text"
                      required
                      placeholder="Vanguard S&P 500 UCITS ETF"
                      value={fundForm.name}
                      onChange={(e) => setFundForm({ ...fundForm, name: e.target.value })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#4edea3]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Ticker</label>
                    <input
                      type="text"
                      required
                      placeholder="VUSA.L"
                      value={fundForm.ticker}
                      onChange={(e) => setFundForm({ ...fundForm, ticker: e.target.value })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#4edea3]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">ISIN</label>
                    <input
                      type="text"
                      required
                      placeholder="IE00B3XXRP09"
                      value={fundForm.isin}
                      onChange={(e) => setFundForm({ ...fundForm, isin: e.target.value })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#4edea3]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Ret. 1 Año (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={fundForm.historicalReturn1Y}
                      onChange={(e) => setFundForm({ ...fundForm, historicalReturn1Y: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#4edea3]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Ret. 5 Años (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={fundForm.historicalReturn5Y}
                      onChange={(e) => setFundForm({ ...fundForm, historicalReturn5Y: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#4edea3]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Riesgo (1-7)</label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      required
                      value={fundForm.riskRating}
                      onChange={(e) => setFundForm({ ...fundForm, riskRating: parseInt(e.target.value) || 5 })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#4edea3]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Comisión Anual (TER % decimal)</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      placeholder="0.0007"
                      value={fundForm.ter}
                      onChange={(e) => setFundForm({ ...fundForm, ter: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#4edea3] font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Ej: 0.07% de gastos = 0.0007</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Región Geográfica</label>
                    <input
                      type="text"
                      required
                      placeholder="EE.UU."
                      value={fundForm.region}
                      onChange={(e) => setFundForm({ ...fundForm, region: e.target.value })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#4edea3]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Categoría</label>
                    <input
                      type="text"
                      required
                      placeholder="Renta Variable Global"
                      value={fundForm.category}
                      onChange={(e) => setFundForm({ ...fundForm, category: e.target.value })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#4edea3]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Volatilidad (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={fundForm.volatilidadAnual || fundForm.volatility || 0}
                      onChange={(e) => setFundForm({ ...fundForm, volatility: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#4edea3]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Beta</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={fundForm.beta}
                      onChange={(e) => setFundForm({ ...fundForm, beta: parseFloat(e.target.value) || 1.0 })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#4edea3]"
                    />
                  </div>
                </div>
              ) : (
                /* ACCOUNT FORM FIELDS */
                <div className="space-y-4">
                  {/* ID Field (Only editable when creating) */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">ID Único (URL-friendly)</label>
                    <input
                      type="text"
                      disabled={!!editingId}
                      required
                      placeholder="trade-republic"
                      value={accountForm.id}
                      onChange={(e) => setAccountForm({ ...accountForm, id: e.target.value })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-[#4edea3] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Nombre Comercial</label>
                    <input
                      type="text"
                      required
                      placeholder="Trade Republic Cuenta de Efectivo"
                      value={accountForm.name}
                      onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#4edea3]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Remuneración (TAE %)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={accountForm.percentageTAE}
                        onChange={(e) => setAccountForm({ ...accountForm, percentageTAE: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#4edea3]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Frecuencia de Liquidación</label>
                      <input
                        type="text"
                        required
                        placeholder="mensual"
                        value={accountForm.payoutFrequency}
                        onChange={(e) => setAccountForm({ ...accountForm, payoutFrequency: e.target.value })}
                        className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#4edea3]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Disponibilidad / Liquidez</label>
                      <input
                        type="text"
                        required
                        placeholder="Inmediata"
                        value={accountForm.liquidity}
                        onChange={(e) => setAccountForm({ ...accountForm, liquidity: e.target.value })}
                        className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#4edea3]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Riesgo (1-7)</label>
                      <input
                        type="number"
                        min="1"
                        max="7"
                        required
                        value={accountForm.riskRating}
                        onChange={(e) => setAccountForm({ ...accountForm, riskRating: parseInt(e.target.value) || 1 })}
                        className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#4edea3]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Condiciones del Producto</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Intereses abonados mensualmente. Protegido hasta 100.000 € por FGD..."
                      value={accountForm.conditions}
                      onChange={(e) => setAccountForm({ ...accountForm, conditions: e.target.value })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#4edea3] resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Actions Buttons */}
              <div className="flex justify-end gap-3 border-t border-[#1e293b]/60 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 bg-[#4edea3] hover:bg-[#3ec48e] text-black font-bold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? "Guardando..." : "Guardar Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
