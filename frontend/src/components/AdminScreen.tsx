import React, { useState, useEffect } from "react";
import { Edit, Trash2, Plus, X, Save, AlertTriangle, Shield, User as UserIcon } from "lucide-react";
import { 
  IndexFundDTO, 
  RemuneratedAccountDTO, 
  UserDTO,
  createFund, 
  updateFund, 
  deleteFund, 
  createAccount, 
  updateAccount, 
  deleteAccount,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getStoredUser,
  getFunds,
  getAccounts
} from "../utils/api";

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<"funds" | "accounts" | "users">("funds");
  
  // Data lists
  const [funds, setFunds] = useState<IndexFundDTO[]>([]);
  const [accounts, setAccounts] = useState<RemuneratedAccountDTO[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);
  
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null means creating
  
  // Custom Delete Confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<any>(null);
  const [targetDeleteName, setTargetDeleteName] = useState<string>("");
  
  // Current logged in user info
  const currentUser = getStoredUser();

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

  // User Form fields
  const [userForm, setUserForm] = useState<UserDTO>({
    username: "",
    email: "",
    role: "ROLE_USER",
    password: ""
  });

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fundsData = await getFunds();
      const accountsData = await getAccounts();
      
      setFunds(fundsData);
      setAccounts(accountsData);
      
      // Fetch users list
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor o cargar usuarios");
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
      setError(null);
      setTimeout(() => setSuccessMsg(null), 4500);
    } else {
      setError(message);
      setSuccessMsg(null);
      setTimeout(() => setError(null), 5500);
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
    } else if (activeTab === "accounts") {
      setAccountForm({
        id: "",
        name: "",
        percentageTAE: 2.5,
        payoutFrequency: "mensual",
        liquidity: "Inmediata",
        riskRating: 1,
        conditions: "Sin comisiones de mantenimiento."
      });
    } else {
      setUserForm({
        username: "",
        email: "",
        role: "ROLE_USER",
        password: ""
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
    } else if (activeTab === "accounts") {
      const acc = item as RemuneratedAccountDTO;
      setEditingId(acc.id || null);
      setAccountForm({ ...acc });
    } else {
      const u = item as UserDTO;
      setEditingId(u.id ? String(u.id) : null);
      setUserForm({ 
        username: u.username,
        email: u.email,
        role: u.role,
        password: "" // Empty by default on edit
      });
    }
    setIsModalOpen(true);
  };

  // Prompt delete confirmation modal
  const promptDelete = (id: any, name: string) => {
    if (!id) return;
    
    if (activeTab === "users") {
      const u = users.find(x => x.id === id);
      if (currentUser && u && currentUser.username === u.username) {
        showToast("No puedes eliminar tu propia cuenta de administrador activa.", false);
        return;
      }
    }
    setTargetDeleteId(id);
    setTargetDeleteName(name);
    setDeleteConfirmOpen(true);
  };

  // Perform actual deletion
  const confirmDelete = async () => {
    if (!targetDeleteId) return;
    
    setLoading(true);
    try {
      if (activeTab === "funds") {
        await deleteFund(targetDeleteId);
        setFunds(funds.filter(f => f.id !== targetDeleteId));
        showToast("Fondo indexado eliminado con éxito");
      } else if (activeTab === "accounts") {
        await deleteAccount(targetDeleteId);
        setAccounts(accounts.filter(a => a.id !== targetDeleteId));
        showToast("Cuenta remunerada eliminada con éxito");
      } else {
        await deleteUser(Number(targetDeleteId));
        setUsers(users.filter(u => u.id !== Number(targetDeleteId)));
        showToast("Usuario eliminado con éxito");
      }
      setDeleteConfirmOpen(false);
      setTargetDeleteId(null);
      setTargetDeleteName("");
    } catch (err: any) {
      showToast(err.message || "Error al eliminar el producto/usuario", false);
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
          const updated = await updateFund(editingId, fundForm);
          setFunds(funds.map(f => f.id === editingId ? updated : f));
          showToast("Fondo indexado actualizado con éxito");
        } else {
          const created = await createFund(fundForm);
          setFunds([...funds, created]);
          showToast("Fondo indexado creado con éxito");
        }
      } else if (activeTab === "accounts") {
        if (editingId) {
          const updated = await updateAccount(editingId, accountForm);
          setAccounts(accounts.map(a => a.id === editingId ? updated : a));
          showToast("Cuenta remunerada actualizada con éxito");
        } else {
          const created = await createAccount(accountForm);
          setAccounts([...accounts, created]);
          showToast("Cuenta remunerada creado con éxito");
        }
      } else {
        // Users
        if (editingId) {
          // El propio usuario administrador no puede quitarse su rol admin
          const u = users.find(x => x.id === Number(editingId));
          if (currentUser && u && currentUser.username === u.username && userForm.role !== "ROLE_ADMIN") {
            throw new Error("No puedes quitarte el rol ADMIN a ti mismo para evitar bloqueos.");
          }

          const updated = await updateUser(Number(editingId), userForm);
          setUsers(users.map(u => u.id === Number(editingId) ? updated : u));
          showToast("Usuario actualizado con éxito");
        } else {
          if (!userForm.password || userForm.password.trim() === "") {
            throw new Error("La contraseña es obligatoria para nuevos usuarios.");
          }
          const created = await createUser(userForm);
          setUsers([...users, created]);
          showToast("Usuario creado con éxito");
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
            Gestiona el catálogo global de productos de inversión y los perfiles de usuarios registrados.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#4edea3] hover:bg-[#3ec48e] text-black font-bold text-xs rounded-xl shadow-lg shadow-[#4edea3]/10 hover:shadow-[#4edea3]/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Añadir {activeTab === "users" ? "Usuario" : "Producto"}
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
        <button
          onClick={() => { setActiveTab("users"); setError(null); }}
          className={`pb-3 px-6 text-xs font-bold transition-all relative ${
            activeTab === "users" 
              ? "text-[#4edea3] border-b-2 border-[#4edea3]" 
              : "text-[#a3b3cc] hover:text-white"
          }`}
        >
          Gestión de Usuarios ({users.length})
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-[#0b1326]/60 border border-[#1e293b]/70 rounded-2xl overflow-hidden backdrop-blur-md">
        {loading && funds.length === 0 && accounts.length === 0 && users.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#a3b3cc]">Cargando catálogo...</div>
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
                          onClick={() => promptDelete(fund.id, fund.name)}
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
        ) : activeTab === "accounts" ? (
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
                          onClick={() => promptDelete(acc.id, acc.name)}
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
          /* USERS TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#020617]/50 border-b border-[#1e293b]/50 text-[#a3b3cc] font-semibold">
                  <th className="p-4">ID / Nombre de Usuario</th>
                  <th className="p-4">Correo Electrónico</th>
                  <th className="p-4 text-center">Rol de Acceso</th>
                  <th className="p-4">Fecha Registro</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/40">
                {users.map((u) => {
                  const isSelf = currentUser?.username === u.username;
                  return (
                    <tr key={u.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-4 font-bold text-white max-w-[200px] truncate flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-[#a3b3cc]">ID: {u.id}</div>
                          <div className="flex items-center gap-1.5">
                            {u.username}
                            {isSelf && (
                              <span className="text-[8px] bg-[#4edea3]/10 border border-[#4edea3]/20 text-[#4edea3] px-1 rounded uppercase tracking-wider font-bold">
                                Tú
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-300">{u.email}</td>
                      <td className="p-4 text-center">
                        {u.role === "ROLE_ADMIN" ? (
                          <span className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px]">
                            <Shield className="w-2.5 h-2.5" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px]">
                            Usuario
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 font-mono">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : "-"}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => promptDelete(u.id, u.username)}
                            disabled={isSelf}
                            className={`p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 transition-colors ${
                              isSelf 
                                ? "opacity-30 cursor-not-allowed" 
                                : "hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
                            }`}
                            title={isSelf ? "No puedes eliminarte a ti mismo" : "Eliminar"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                {activeTab === "users" ? "Usuario" : activeTab === "funds" ? "Fondo Indexado" : "Cuenta Remunerada"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#a3b3cc] hover:text-white hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-[11px] font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {activeTab === "funds" ? (
                /* FUND FORM FIELDS */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      value={fundForm.volatility}
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
              ) : activeTab === "accounts" ? (
                /* ACCOUNT FORM FIELDS */
                <div className="space-y-4">
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
              ) : (
                /* USER FORM FIELDS */
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Nombre de Usuario</label>
                    <input
                      type="text"
                      required
                      placeholder="nombre_usuario"
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#4edea3]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      placeholder="usuario@email.com"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#4edea3]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">
                      Contraseña {editingId && "(Opcional)"}
                    </label>
                    <input
                      type="password"
                      required={!editingId}
                      placeholder={editingId ? "Dejar en blanco para no modificarla" : "•••••• (mínimo 6 caracteres)"}
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      className="w-full bg-[#020617]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#4edea3]"
                    />
                    {editingId && (
                      <p className="text-[10px] text-slate-500 mt-1">
                        Si deseas cambiar la contraseña del usuario, escribe la nueva. De lo contrario, déjalo vacío.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#a3b3cc] mb-1.5 uppercase">Rol de Acceso</label>
                    {currentUser?.username === userForm.username ? (
                      <div className="w-full bg-[#1e293b]/30 border border-[#1e293b] text-red-400 font-bold rounded-xl px-4 py-2.5">
                        ROLE_ADMIN (No puedes modificar tu propio rol)
                      </div>
                    ) : (
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                        className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#4edea3]"
                      >
                        <option value="ROLE_USER">Usuario Estándar (ROLE_USER)</option>
                        <option value="ROLE_ADMIN">Administrador General (ROLE_ADMIN)</option>
                      </select>
                    )}
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
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL (Custom Delete Confirmation) */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0b1326] border border-[#1e293b]/80 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Confirmar Eliminación</h2>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeTab === "users" ? (
                <span>¿Estás seguro de que quieres eliminar al usuario <strong className="text-white">'{targetDeleteName}'</strong>? Esta acción es irreversible y borrará todas sus simulaciones guardadas.</span>
              ) : (
                <span>¿Estás seguro de que quieres eliminar el producto <strong className="text-white">'{targetDeleteName}'</strong> del catálogo global?</span>
              )}
            </p>
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                id="cancel-delete-btn"
                onClick={() => { setDeleteConfirmOpen(false); setTargetDeleteId(null); setTargetDeleteName(""); }}
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold rounded-xl cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="confirm-delete-btn"
                onClick={confirmDelete}
                disabled={loading}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl cursor-pointer text-xs disabled:opacity-50"
              >
                {loading ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
