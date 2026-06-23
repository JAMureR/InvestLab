import React, { useState } from "react";
import { X, LogIn, UserPlus, Eye, EyeOff, Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { username: string; email: string; role: string }) => void;
}

import { login, register } from "../utils/api";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setError("");
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const data = await login(username, password);
        onAuthSuccess({ username: data.username, email: data.email, role: data.role });
      } else {
        const data = await register(username, email, password);
        onAuthSuccess({ username: data.username, email: data.email, role: data.role });
      }
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || "Ha ocurrido un error");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* Header gradient accent */}
        <div className="h-1 bg-gradient-to-r from-[#4edea3] via-[#3B82F6] to-[#b4c5ff]" />

        <div className="p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#10b981] to-[#4edea3] flex items-center justify-center font-bold text-black text-2xl shadow-lg shadow-[#4edea3]/20 mx-auto mb-4">
              I
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </h2>
            <p className="text-sm text-[#bbcabf] mt-1">
              {mode === "login"
                ? "Accede a tu historial de simulaciones"
                : "Regístrate para guardar tus simulaciones"}
            </p>
          </div>

          {/* Demo Credentials Info Card */}
          {mode === "login" && (
            <div className="mb-6 p-4 bg-slate-900/60 border border-[#2d3449]/60 rounded-2xl space-y-2">
              <p className="text-[10px] font-bold text-[#4edea3] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
                Acceso Rápido para Pruebas:
              </p>
              <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed">
                <div className="bg-[#1e293b]/40 p-2.5 rounded-xl border border-[#2d3449]/50">
                  <p className="font-semibold text-red-400 text-[10px] uppercase">Administrador</p>
                  <p className="text-slate-400 font-mono mt-1 text-[10px]">usuario: <span className="text-white font-bold select-all">admin</span></p>
                  <p className="text-slate-400 font-mono text-[10px]">pass: <span className="text-white font-bold select-all">admin123</span></p>
                </div>
                <div className="bg-[#1e293b]/40 p-2.5 rounded-xl border border-[#2d3449]/50">
                  <p className="font-semibold text-blue-400 text-[10px] uppercase">Usuario Estándar</p>
                  <p className="text-slate-400 font-mono mt-1 text-[10px]">usuario: <span className="text-white font-bold select-all">usuario</span></p>
                  <p className="text-slate-400 font-mono text-[10px]">pass: <span className="text-white font-bold select-all">usuario123</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#bbcabf] uppercase tracking-wider">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="tu_usuario"
                required
                minLength={3}
                className="w-full bg-[#1e293b]/60 border border-[#2d3449] rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] outline-none transition-colors"
              />
            </div>

            {/* Email (solo registro) */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#bbcabf] uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full bg-[#1e293b]/60 border border-[#2d3449] rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] outline-none transition-colors"
                />
              </div>
            )}

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#bbcabf] uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-[#1e293b]/60 border border-[#2d3449] rounded-xl px-4 py-3 pr-12 text-white placeholder:text-slate-500 text-sm focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#4edea3] text-black font-extrabold text-sm uppercase tracking-wider rounded-xl hover:bg-[#3cd696] transition-all shadow-lg shadow-[#4edea3]/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : mode === "login" ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Crear Cuenta</span>
                </>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              className="text-sm text-[#bbcabf] hover:text-[#4edea3] transition-colors cursor-pointer"
            >
              {mode === "login"
                ? "¿No tienes cuenta? Regístrate"
                : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
