import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Shield, Users, Leaf, ChevronRight, Network, Activity } from 'lucide-react';
import { Language, Challenge, SimulationSettings } from '../types';
import { cn } from '../lib/utils';

interface StrategyShiftModalProps {
  challenge: Challenge;
  language: Language;
  onSelect: (newSettings: SimulationSettings) => void;
  currentSettings: SimulationSettings;
  theme: 'light' | 'dark';
}

const StrategyShiftModal: React.FC<StrategyShiftModalProps> = ({
  challenge,
  language,
  onSelect,
  currentSettings,
  theme
}) => {
  const t = (en: string, es: string) => language === Language.EN ? en : es;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const strategies = [
    {
      id: 'adaptation',
      nameEn: 'Rapid Adaptation',
      nameEs: 'Adaptación Rápida',
      descEn: 'Higher mutation rate and effect, but increased base mortality.',
      descEs: 'Mayor tasa y efecto de mutación, pero mayor mortalidad base.',
      icon: <Zap className="text-yellow-500" />,
      apply: (s: SimulationSettings) => ({
        ...s,
        mutationRate: Math.min(0.5, s.mutationRate + 0.1),
        mutationEffect: Math.min(0.5, s.mutationEffect + 0.05),
        intrinsicMortality: Math.min(0.5, s.intrinsicMortality + 0.05)
      })
    },
    {
      id: 'conservative',
      nameEn: 'Conservative Survival',
      nameEs: 'Supervivencia Conservadora',
      descEn: 'Lower mutation rate for stability, reduced mortality.',
      descEs: 'Menor tasa de mutación para estabilidad, mortalidad reducida.',
      icon: <Shield className="text-blue-500" />,
      apply: (s: SimulationSettings) => ({
        ...s,
        mutationRate: Math.max(0.01, s.mutationRate - 0.02),
        intrinsicMortality: Math.max(0.05, s.intrinsicMortality - 0.05)
      })
    },
    {
      id: 'boom',
      nameEn: 'Population Boom',
      nameEs: 'Explosión Demográfica',
      descEn: 'Maximize potential, but significantly higher mortality.',
      descEs: 'Maximizar potencial, pero mortalidad significativamente mayor.',
      icon: <Users className="text-emerald-500" />,
      apply: (s: SimulationSettings) => ({
        ...s,
        intrinsicMortality: Math.min(0.5, s.intrinsicMortality + 0.1)
      })
    },
    {
      id: 'efficiency',
      nameEn: 'Resource Efficiency',
      nameEs: 'Eficiencia de Recursos',
      descEn: 'Focus on individual survival over quantity.',
      descEs: 'Enfocarse en la supervivencia individual sobre la cantidad.',
      icon: <Leaf className="text-indigo-500" />,
      apply: (s: SimulationSettings) => ({
        ...s,
        intrinsicMortality: Math.max(0.02, s.intrinsicMortality - 0.08)
      })
    },
    {
      id: 'specialist',
      nameEn: 'Specialist Path',
      nameEs: 'Camino Especialista',
      descEn: 'High mutation impact to find niche traits quickly.',
      descEs: 'Alto impacto de mutación para encontrar rasgos de nicho rápidamente.',
      icon: <Network className="text-orange-500" />,
      apply: (s: SimulationSettings) => ({
        ...s,
        mutationEffect: Math.min(0.8, s.mutationEffect + 0.15),
        mutationRate: Math.max(0.02, s.mutationRate - 0.02)
      })
    },
    {
      id: 'hardy',
      nameEn: 'Hardy Lineage',
      nameEs: 'Linaje Resistente',
      descEn: 'Extreme survival focus with minimal mutation.',
      descEs: 'Enfoque de supervivencia extrema con mutación mínima.',
      icon: <Shield className="text-slate-500" />,
      apply: (s: SimulationSettings) => ({
        ...s,
        intrinsicMortality: Math.max(0.01, s.intrinsicMortality - 0.12),
        mutationRate: Math.max(0.01, s.mutationRate - 0.02)
      })
    },
    {
      id: 'symbiotic',
      nameEn: 'Symbiotic Ecosystem',
      nameEs: 'Ecosistema Simbiótico',
      descEn: 'Enable functional synergy. Diverse populations support each other.',
      descEs: 'Activa la sinergia funcional. Las poblaciones diversas se apoyan.',
      icon: <Activity className="text-pink-500" />,
      apply: (s: SimulationSettings) => ({
        ...s,
        ecoSynergy: true,
        synergyStrength: Math.min(0.5, s.synergyStrength + 0.1),
        mutationRate: Math.min(0.5, s.mutationRate + 0.05)
      })
    }
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl max-h-[90vh] border-4 overflow-hidden flex flex-col bg-white dark:bg-zinc-950 border-black dark:border-white/20 text-black dark:text-white"
      >
        <div className="p-8 border-b-4 border-black dark:border-white/20 bg-black dark:bg-zinc-900 text-white shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-white dark:border-white/20">
              <Zap size={24} />
            </div>
            <h2 className="text-3xl font-mono font-bold uppercase tracking-tighter">
              {t('New Challenge: Strategy Shift', 'Nuevo Desafío: Cambio de Estrategia')}
            </h2>
          </div>
          <p className="text-sm uppercase tracking-widest font-bold opacity-70">
            {t('A new environmental pressure has emerged. How will your species respond?', 'Ha surgido una nueva presión ambiental. ¿Cómo responderá tu especie?')}
          </p>
        </div>

        <div className="p-8 space-y-8 bg-white dark:bg-zinc-950 overflow-y-auto custom-scrollbar flex-1">
          <div className="p-6 bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-white/20">
            <h3 className="font-bold text-black dark:text-white uppercase tracking-[0.2em] text-[10px] mb-2">
              {t('Current Challenge', 'Desafío Actual')}: {t(challenge.nameEn, challenge.nameEs)}
            </h3>
            <p className="text-xs font-mono leading-relaxed text-black dark:text-white">
              {t(challenge.descriptionEn, challenge.descriptionEs)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-2 border-black dark:border-white/20">
            {strategies.map((strat) => (
              <button
                key={strat.id}
                onClick={() => onSelect(strat.apply(currentSettings))}
                className={cn(
                  "p-8 border-2 border-black dark:border-white/20 text-left transition-all group relative",
                  "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                )}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 border-2 border-black dark:border-white group-hover:border-white dark:group-hover:border-black transition-colors">
                    {React.cloneElement(strat.icon as React.ReactElement, { className: 'text-current' })}
                  </div>
                  <span className="font-bold text-sm uppercase tracking-tight font-mono">{t(strat.nameEn, strat.nameEs)}</span>
                </div>
                <p className="text-[10px] leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity font-mono">
                  {t(strat.descEn, strat.descEs)}
                </p>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="px-8 py-6 bg-zinc-100 dark:bg-zinc-900 border-t-4 border-black dark:border-white/20 text-center shrink-0">
          <p className="text-[10px] text-black dark:text-white uppercase tracking-[0.4em] font-bold">
            {t('Choose wisely. This decision will shape the future of your lineage.', 'Elige sabiamente. Esta decisión dará forma al futuro de tu linaje.')}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StrategyShiftModal;
