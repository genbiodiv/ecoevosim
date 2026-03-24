import React from 'react';
import { motion } from 'motion/react';
import { X, Info, Activity, Zap, Shield, Wind, Thermometer, Utensils, AlertTriangle } from 'lucide-react';
import { Organism, Language } from '../types';
import { CHALLENGES } from '../simulation/challenges';
import { cn } from '../lib/utils';

interface InspectorProps {
  organism: Organism;
  onClose: () => void;
  language: Language;
}

const NodeInspector: React.FC<InspectorProps> = ({ organism, onClose, language }) => {
  const t = (en: string, es: string) => language === Language.EN ? en : es;

  const traitList = [
    { icon: <Activity size={16} />, label: t('Size', 'Tamaño'), value: organism.traits.size },
    { icon: <Zap size={16} />, label: t('Speed', 'Velocidad'), value: organism.traits.speed },
    { icon: <Wind size={16} />, label: t('Metabolism', 'Metabolismo'), value: organism.traits.metabolism },
    { icon: <Shield size={16} />, label: t('Defense', 'Defensa'), value: organism.traits.defense },
    { icon: <Zap size={16} />, label: t('Reproduction', 'Reproducción'), value: organism.traits.reproductionRate },
    { icon: <Thermometer size={16} />, label: t('Temp Tolerance', 'Tol. Temperatura'), value: organism.traits.tempTolerance },
    { icon: <Utensils size={16} />, label: t('Food Spec.', 'Espec. Alimento'), value: organism.traits.foodSpecialization },
  ];

  const challenge = organism.challengeId ? CHALLENGES.find(c => c.id === organism.challengeId) : null;
  const survivalReason = t(organism.survivalReasonEn || '', organism.survivalReasonEs || '');

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="absolute right-4 top-4 bottom-4 w-80 bg-white dark:bg-zinc-950 border-2 border-black dark:border-white/20 p-6 shadow-2xl z-50 overflow-y-auto custom-scrollbar text-black dark:text-white"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-mono font-bold uppercase tracking-tighter">
          {t('Organism Details', 'Detalles del Organismo')}
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-2 border-black dark:border-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white/10">
            <p className="text-zinc-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">{t('Generation', 'Generación')}</p>
            <p className="font-mono font-bold">{organism.generation}</p>
          </div>
          <div className="p-3 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white/10">
            <p className="text-zinc-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">{t('Status', 'Estado')}</p>
            <p className={cn("font-bold uppercase text-[10px]", organism.isAlive ? "text-emerald-600" : "text-rose-600")}>
              {organism.isAlive ? t('Alive', 'Vivo') : t('Extinct', 'Extinto')}
            </p>
          </div>
        </div>

        {/* Challenge & Survival Reason Section */}
        <div className="space-y-4">
          {challenge && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-900/50">
              <h4 className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2 font-bold">
                <AlertTriangle size={14} /> {t('Challenge Faced', 'Desafío Enfrentado')}
              </h4>
              <p className="text-xs font-bold uppercase mb-1">{t(challenge.nameEn, challenge.nameEs)}</p>
              <p className="text-[10px] opacity-70 leading-relaxed">{t(challenge.descriptionEn, challenge.descriptionEs)}</p>
            </div>
          )}

          {survivalReason && (
            <div className={cn(
              "p-4 border-2",
              organism.isAlive ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50" : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50"
            )}>
              <p className={cn(
                "text-[10px] uppercase tracking-wider mb-1 font-bold",
                organism.isAlive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}>
                {organism.isAlive ? t('Survival Insight', 'Información de Supervivencia') : t('Extinction Reason', 'Razón de Extinción')}
              </p>
              <p className={cn(
                "text-xs italic font-medium",
                organism.isAlive ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
              )}>
                "{survivalReason}"
              </p>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-4 flex items-center gap-2 font-bold">
            <Info size={14} /> {t('Traits', 'Rasgos')}
          </h4>
          <div className="space-y-3">
            {traitList.map((trait, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[10px] text-black dark:text-white font-bold uppercase">
                  <span className="flex items-center gap-2">{trait.icon} {trait.label}</span>
                  <span className="font-mono">{(trait.value * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-white dark:bg-zinc-800 border-2 border-black dark:border-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${trait.value * 100}%` }}
                    className="h-full bg-black dark:bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t-2 border-black dark:border-white/20">
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">
            {t('Ancestor ID', 'ID del Ancestro')}: <span className="font-mono text-black dark:text-white">{organism.parentId || 'None'}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default NodeInspector;
