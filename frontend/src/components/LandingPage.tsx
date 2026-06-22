import { Play, TrendingUp, Cpu, BarChart3, LineChart, ShieldCheck, Zap } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onEnterSimulator: () => void;
}

export default function LandingPage({ onEnterSimulator }: LandingPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-[#dae2fd] overflow-hidden flex flex-col font-sans relative">
      {/* Decorative Lights */}
      <div className="absolute top-[-10%] left-[-15%] w-[50%] h-[50%] rounded-full bg-[#4edea3]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[50%] h-[50%] rounded-full bg-[#3B82F6]/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-[#1E293B] bg-[#0b1326]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#10b981] to-[#4edea3] flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-[#4edea3]/20">
              P
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-white font-sans">
                Portfolio<span className="text-[#4edea3]">Lab</span>
              </span>
              <p className="text-[10px] text-[#bbcabf] font-mono leading-none tracking-widest uppercase">FINTECH SIMULATOR</p>
            </div>
          </div>
          <button
            onClick={onEnterSimulator}
            className="flex items-center gap-2 bg-[#4edea3] text-[#002113] hover:bg-[#3cd696] font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-[#4edea3]/15 hover:scale-[1.02] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>ACCESO AL SIMULADOR</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 pt-16 pb-24 flex flex-col justify-center items-center relative z-10">
        <motion.div
          className="text-center max-w-4xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Tag */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-[#1e293b]/60 border border-[#2d3449] rounded-full py-1.5 px-4 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            <span className="text-xs font-mono tracking-wider font-semibold text-[#4edea3] uppercase">
              PLANTILLA FINANCIERA PARA INVERSORES SENIOR
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]"
          >
            Visualiza, Proyecta y Simula tu{" "}
            <span className="bg-gradient-to-r from-[#4edea3] via-[#a8f9d6] to-[#b4c5ff] bg-clip-text text-transparent">
              Futuro Financiero
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-[#bbcabf] text-lg md:text-xl font-normal mt-6 max-w-2xl mx-auto leading-relaxed"
          >
            Toma decisiones de inversión respaldadas por la ciencia de datos. Simula intereses, comisiones y
            riesgos mediante algoritmos profesionales antes de comprometer tu capital.
          </motion.p>

          {/* Call To Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={onEnterSimulator}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#4edea3] text-black font-extrabold py-4 px-10 rounded-2xl text-lg hover:bg-[#3cd696] transition-all shadow-xl shadow-[#4edea3]/20 hover:scale-[1.03] cursor-pointer"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Ejecutar Simulador Profesional</span>
            </button>
            <button
              onClick={onEnterSimulator}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#171f33] border border-[#1E293B] text-white hover:text-[#4edea3] font-semibold py-4 px-8 rounded-2xl text-base hover:bg-[#222a3d] transition-all cursor-pointer"
            >
              <span>Ver Catálogo de Fondos</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Feature Highlights Grid */}
        <div id="funciones" className="mt-28 w-full">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-white">
              Herramientas Profesionales sin Limitaciones
            </h2>
            <p className="text-[#bbcabf] mt-2 text-sm md:text-base">
              Todos los algoritmos de simulación y proyecciones desbloqueados de forma local e ilimitada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="glass-panel p-8 rounded-2xl hover:border-[#4edea3]/40 transition-all duration-300 relative group">
              <div className="w-12 h-12 rounded-xl bg-[#4edea3]/10 flex items-center justify-center text-[#4edea3] mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#4edea3] transition-colors">
                Motor Monte Carlo Estocástico
              </h3>
              <p className="text-[#bbcabf] text-sm leading-relaxed">
                Calcula automáticamente 1.000 trayectorias posibles usando la distribución normal estándar de
                Box-Muller. Descubre los límites superiores (95%) e inferiores (5%) de riesgo en tiempo real.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-panel p-8 rounded-2xl hover:border-[#4edea3]/40 transition-all duration-300 relative group">
              <div className="w-12 h-12 rounded-xl bg-[#b4c5ff]/10 flex items-center justify-center text-[#b4c5ff] mb-6">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#b4c5ff] transition-colors">
                Fondos Indexados Reales
              </h3>
              <p className="text-[#bbcabf] text-sm leading-relaxed">
                Acceso interactivo a un catálogo de ETF y fondos líderes (Vanguard S&P 500, MSCI World, etc.)
                con indicadores de riesgo SRRI, costes TER reales e históricos listos para comparaciones estables.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-panel p-8 rounded-2xl hover:border-[#4edea3]/40 transition-all duration-300 relative group">
              <div className="w-12 h-12 rounded-xl bg-[#ffb3af]/10 flex items-center justify-center text-[#ffb3af] mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#ffb3af] transition-colors">
                Cuentas de Efectivo Remuneradas
              </h3>
              <p className="text-[#bbcabf] text-sm leading-relaxed">
                Compara intereses de liquidez inmediata ofertados por Trade Republic, Revolut o N26. Simula
                payouts mensuales, efectos del IRS, y el impacto definitivo de la inflación en tu poder de compra.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Details section showing screenshots concept */}
        <div className="mt-20 w-full glass-panel p-8 md:p-12 rounded-3xl border-[#1e293b]/60 relative overflow-hidden bg-gradient-to-b from-[#131b2e] to-[#060e20]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 bg-[#4edea3]/10 border border-[#4edea3]/20 rounded-lg py-1 px-3 text-[11px] font-mono font-medium text-[#4edea3]">
                <Zap className="w-3.5 h-3.5" /> ESTADÍSTICA EXHAUSTIVA
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                Analiza de forma interactiva con Herramientas "¿Qué pasaría si...?"
              </h3>
              <p className="text-[#bbcabf] text-base leading-relaxed">
                Nuestra suite interactiva te permite modelar cambios súbitos en tus aportaciones periódicas, el horizonte temporal en años, y el impacto de la inflación de forma instantánea. No te limites a proyecciones simples lineales. Modela el riesgo estocástico para estar preparado para cualquier ciclo de mercado.
              </p>
              <ul className="space-y-3 font-medium text-sm text-[#dae2fd]">
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
                  Ajustes automáticos de Inflación (Poder de compra conservado)
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
                  Estimación de Sharpe Ratio para medir rentabilidad/riesgo
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
                  Simulación de costes TER de fondos integrados en cartera
                </li>
              </ul>
              <div className="pt-4">
                <button
                  onClick={onEnterSimulator}
                  className="bg-transparent hover:bg-white/5 border border-[#1E293B] text-white hover:text-[#4edea3] font-bold py-3 px-6 rounded-xl transition-all cursor-pointer"
                >
                  Entrar a la Aplicación Gratuita
                </button>
              </div>
            </div>

            {/* Visual preview mimicry of Monte Carlo */}
            <div className="bg-[#020617] border border-[#1e293b] p-6 rounded-2xl flex flex-col justify-between h-[360px] relative">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-[#bbcabf] uppercase tracking-wider block">PREVISIÓN DE INVERSIÓN</span>
                  <span className="text-base font-bold text-white">Modo Monte Carlo (1000 trayectorias)</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="px-2 py-0.5 bg-[#4edea3]/20 text-[#4edea3] rounded text-[9px] font-mono">ESTADÍSTICO</span>
                  <span className="px-2 py-0.5 bg-neutral-800 text-[#bbcabf] rounded text-[9px] font-mono">100% LIBRA</span>
                </div>
              </div>

              {/* Vector representation of charts */}
              <div className="flex-1 relative flex items-end w-full h-full pb-4">
                <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                  {/* Confidence bands */}
                  <path d="M 0,180 Q 100,160 200,120 T 400,30 L 400,130 T 200,160 Q 100,175 0,180 Z" fill="#4edea3" fillOpacity="0.06" />
                  {/* Paths */}
                  <path d="M 0,180 Q 100,160 200,120 T 400,30" fill="none" stroke="#4edea3" strokeWidth="2" strokeDasharray="3 3" />
                  <path d="M 0,180 Q 110,165 220,135 T 400,90" fill="none" stroke="#3B82F6" strokeWidth="2" />
                  <path d="M 0,180 Q 120,172 240,162 T 400,150" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="2 2" />
                </svg>
                <div className="absolute top-2 right-2 flex flex-col gap-1 text-[10px] font-mono p-2 bg-slate-900/90 rounded border border-slate-800">
                  <span className="text-[#4edea3]">Optimista (95%): +142.000 €</span>
                  <span className="text-[#3B82F6]">Esperado (50%): +84.500 €</span>
                  <span className="text-[#EF4444]">Pesimista (5%): +18.000 €</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#1e293b]/70 text-[10px] text-[#bbcabf] font-mono">
                <span>0 Años (Inicio)</span>
                <span>15 Años</span>
                <span>30 Años (Objetivo)</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] bg-[#060e20] text-[#bbcabf] text-xs py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">PortfolioLab</span>
            <span className="text-[#3c4a42]">|</span>
            <span>Planificador de inversiones libre de costes en español.</span>
          </div>
          <div className="flex gap-4">
            <a href="#funciones" className="hover:text-white transition-colors">Funciones</a>
            <span className="text-slate-800">•</span>
            <span className="text-[#4edea3]">SaaS Prototipo Educativo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
