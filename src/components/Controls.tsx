import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Languages, Moon, Sun, HelpCircle, Monitor, MonitorOff, Info, Target, LogOut, Activity, Network } from 'lucide-react';
import { Language, SimulationSettings } from '../types';
import { cn } from '../lib/utils';

interface ControlsProps {
  settings: SimulationSettings;
  onSettingsChange: (settings: SimulationSettings) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onReset: () => void;
  onEndSimulation: () => void;
  language: Language;
  onToggleLanguage: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onShowHelp: () => void;
  isHighRes: boolean;
  onToggleRes: () => void;
  onCenterView: () => void;
  onRestoreDefaults: () => void;
  isBottleneck: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  settings,
  onSettingsChange,
  isPaused,
  onTogglePause,
  onReset,
  onEndSimulation,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  onShowHelp,
  isHighRes,
  onToggleRes,
  onCenterView,
  onRestoreDefaults,
  isBottleneck
}) => {
  const t = (en: string, es: string) => language === Language.EN ? en : es;
  const [activeDef, setActiveDef] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const sliders = [
    { 
      key: 'mutationRate', 
      label: t('Mutation Rate', 'Tasa de Mutación'), 
      min: 0, max: 0.5, step: 0.01,
      def: t('Frequency of genetic changes during reproduction.', 'Frecuencia de cambios genéticos durante la reproducción.')
    },
    { 
      key: 'mutationEffect', 
      label: t('Mutation Effect', 'Efecto de Mutación'), 
      min: 0, max: 0.5, step: 0.01,
      def: t('Magnitude of trait changes when a mutation occurs.', 'Magnitud de los cambios en los rasgos cuando ocurre una mutación.')
    },
    { 
      key: 'intrinsicMortality', 
      label: t('Intrinsic Mortality', 'Mortalidad Intrínseca'), 
      min: 0, max: 0.5, step: 0.01,
      def: t('Base probability of death regardless of environment.', 'Probabilidad base de muerte independientemente del entorno.')
    },
    { 
      key: 'predationPressure', 
      label: t('Predation Pressure', 'Presión de Depredación'), 
      min: 0, max: 1, step: 0.05,
      def: t('Intensity of external threats from predators.', 'Intensidad de las amenazas externas de los depredadores.')
    },
    { 
      key: 'foodAvailability', 
      label: t('Food Availability', 'Alimento'), 
      min: 0, max: 1, step: 0.05,
      def: t('Amount of resources available for survival.', 'Cantidad de recursos disponibles para la supervivencia.')
    },
    { 
      key: 'instability', 
      label: t('Env. Instability', 'Inestabilidad'), 
      min: 0, max: 1, step: 0.05,
      def: t('Rate at which environmental conditions change.', 'Ritmo al que cambian las condiciones ambientales.')
    },
    { 
      key: 'catastropheFrequency', 
      label: t('Catastrophe Freq.', 'Catástrofes'), 
      min: 0, max: 0.2, step: 0.005,
      def: t('Likelihood of sudden mass extinction events.', 'Probabilidad de eventos repentinos de extinción masiva.')
    },
    { 
      key: 'carryingCapacity', 
      label: t('Capacity', 'Capacidad'), 
      min: 10, max: 1000, step: 10,
      def: t('Maximum population size the environment can support.', 'Tamaño máximo de población que el entorno puede soportar.')
    },
    { 
      key: 'synergyStrength', 
      label: t('Synergy', 'Sinergia'), 
      min: 0, max: 0.5, step: 0.01,
      def: t('Strength of functional support between diverse groups.', 'Fuerza del apoyo funcional entre grupos diversos.')
    },
    { 
      key: 'minOffspring', 
      label: t('Min Offspring', 'Descendencia Mín.'), 
      min: 1, max: 10, step: 1,
      def: t('Minimum potential number of offspring per generation.', 'Número potencial mínimo de descendientes por generación.')
    },
    { 
      key: 'maxOffspring', 
      label: t('Max Offspring', 'Descendencia Máx.'), 
      min: 1, max: 30, step: 1,
      def: t('Maximum potential number of offspring per generation.', 'Número potencial máximo de descendientes por generación.')
    },
    { 
      key: 'sizeBias', 
      label: t('Size Bias', 'Sesgo Tamaño'), 
      min: -1, max: 1, step: 0.1,
      def: t('Manually favor larger (>0) or smaller (<0) organisms.', 'Favorecer manualmente organismos más grandes (>0) o pequeños (<0).')
    },
    { 
      key: 'speedBias', 
      label: t('Speed Bias', 'Sesgo Velocidad'), 
      min: -1, max: 1, step: 0.1,
      def: t('Manually favor faster (>0) or slower (<0) organisms.', 'Favorecer manualmente organismos más rápidos (>0) o lentos (<0).')
    },
    { 
      key: 'metabolismBias', 
      label: t('Metabolism Bias', 'Sesgo Metab.'), 
      min: -1, max: 1, step: 0.1,
      def: t('Manually favor efficient (>0) or active (<0) organisms.', 'Favorecer manualmente organismos eficientes (>0) o activos (<0).')
    },
    { 
      key: 'defenseBias', 
      label: t('Defense Bias', 'Sesgo Defensa'), 
      min: -1, max: 1, step: 0.1,
      def: t('Manually favor protected (>0) or vulnerable (<0) organisms.', 'Favorecer manualmente organismos protegidos (>0) o vulnerables (<0).')
    },
    { 
      key: 'reproductionBias', 
      label: t('Reproduction Bias', 'Sesgo Reprod.'), 
      min: -1, max: 1, step: 0.1,
      def: t('Manually favor high (>0) or low (<0) reproduction rates.', 'Favorecer manualmente tasas de reproducción altas (>0) o bajas (<0).')
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border-b-2 border-black dark:border-white/20 flex flex-col z-50 transition-colors">
      {/* Top Bar - Always Visible */}
      <div className="px-4 sm:px-6 py-2 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={onEndSimulation}
            className="text-sm sm:text-base font-mono font-bold text-black dark:text-white whitespace-nowrap hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black px-2 py-1 transition-colors border-2 border-transparent hover:border-black dark:hover:border-white"
          >
            ECO EVO SIM
          </button>
          <div className="h-5 w-px bg-black dark:bg-white/20 hidden md:block" />
          <div className="flex gap-0 border-2 border-black dark:border-white/20">
            <button 
              onClick={onTogglePause} 
              className={cn(
                "p-2 transition-all", 
                isPaused 
                  ? "bg-black text-white dark:bg-white dark:text-black" 
                  : "bg-white text-black dark:bg-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
            </button>
            <button 
              onClick={onReset} 
              title={t('Reset Simulation', 'Reiniciar')} 
              className="p-2 bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border-l-2 border-black dark:border-white/20"
            >
              <RotateCcw size={14} />
            </button>
            <button 
              onClick={onCenterView} 
              title={t('Center View', 'Centrar')} 
              className="p-2 bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border-l-2 border-black dark:border-white/20"
            >
              <Target size={14} />
            </button>
            <button 
              onClick={onEndSimulation} 
              title={t('End Simulation', 'Finalizar')} 
              className="p-2 bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-red-500 hover:text-white border-l-2 border-black dark:border-white/20"
            >
              <LogOut size={14} />
            </button>
          </div>

          <AnimatePresence>
            {isBottleneck && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest animate-pulse"
              >
                <Activity size={12} />
                {t('Bottleneck Active', 'Cuello de Botella Activo')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={cn(
              "px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-2 border-black dark:border-white/20",
              isSettingsOpen 
                ? "bg-black text-white dark:bg-white dark:text-black" 
                : "bg-white text-black dark:bg-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            <Monitor size={12} />
            <span className="hidden xs:inline">{t('Settings', 'Ajustes')}</span>
          </button>
          
          <div className="h-5 w-px bg-black dark:bg-white/20 mx-1 hidden sm:block" />
          
          <div className="flex items-center gap-0 border-2 border-black dark:border-white/20">
            <button onClick={onToggleLanguage} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-black dark:text-white" title={t('Language', 'Idioma')}>
              <Languages size={14} />
            </button>
            <button onClick={onToggleTheme} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-black dark:text-white border-l-2 border-black dark:border-white/20" title={t('Theme', 'Tema')}>
              {theme === 'light' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button onClick={onShowHelp} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-black dark:text-white border-l-2 border-black dark:border-white/20" title={t('Gameplay Instructions', 'Instrucciones')}>
              <HelpCircle size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Settings Panel */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t-2 border-black dark:border-white/20"
          >
            <div className="px-4 py-3 bg-white dark:bg-zinc-900 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-x-3 gap-y-2">
                {sliders.map((s) => (
                  <div key={s.key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setActiveDef(activeDef === s.key ? null : s.key)}
                        className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-black dark:text-white/70 hover:underline transition-all"
                      >
                        {s.label} <Info size={10} />
                      </button>
                      <span className="font-mono text-[9px] text-black dark:text-white font-bold">
                        {settings[s.key as keyof SimulationSettings]}
                      </span>
                    </div>
                    
                    <div className="px-2 py-1 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white/10">
                      <input 
                        type="range"
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={settings[s.key as keyof SimulationSettings]}
                        onChange={(e) => onSettingsChange({ ...settings, [s.key]: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-black dark:bg-white/20 appearance-none cursor-pointer accent-black dark:accent-white"
                      />
                      <div className="flex justify-between mt-0.5 px-0.5">
                        <span className="text-[7px] text-black/50 dark:text-white/30 font-mono">{s.min}</span>
                        <span className="text-[7px] text-black/50 dark:text-white/30 font-mono">{s.max}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Infinite Mode Toggle */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-black dark:text-white/70">
                    {t('Simulation Mode', 'Modo de Simulación')}
                  </span>
                  <button 
                    onClick={() => onSettingsChange({ ...settings, isInfinite: !settings.isInfinite })}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-2 text-[9px] font-bold uppercase transition-all border-2 border-black dark:border-white/20",
                      settings.isInfinite 
                        ? "bg-black text-white dark:bg-white dark:text-black" 
                        : "bg-white text-black dark:bg-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                  >
                    <RotateCcw size={12} className={cn(settings.isInfinite && "animate-spin-slow")} />
                    {settings.isInfinite ? t('Infinite', 'Infinito') : t('Standard', 'Estándar')}
                  </button>
                </div>

                {/* Resolution Toggle in Settings */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-black dark:text-white/70">
                    {t('Visual Quality', 'Calidad Visual')}
                  </span>
                  <button 
                    onClick={onToggleRes}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-2 text-[9px] font-bold uppercase transition-all border-2 border-black dark:border-white/20",
                      isHighRes 
                        ? "bg-black text-white dark:bg-white dark:text-black" 
                        : "bg-white text-black dark:bg-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                  >
                    {isHighRes ? <Monitor size={12} /> : <MonitorOff size={12} />}
                    {isHighRes ? t('High Res', 'Alta Res.') : t('Low Res', 'Baja Res.')}
                  </button>
                </div>

                {/* Bottleneck Survival Rate Control */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-black dark:text-white/70">
                    {t('Bottleneck Survival', 'Supervivencia Cuello Botella')}
                  </span>
                  <div className="flex gap-0 border-2 border-black dark:border-white/20">
                    {[0.001, 0.01, 0.05, 0.1, 0.2, 0.5].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => onSettingsChange({ ...settings, bottleneckSurvivalRate: rate })}
                        className={cn(
                          "flex-1 py-2 text-[9px] font-bold transition-all",
                          settings.bottleneckSurvivalRate === rate
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-white text-black dark:bg-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border-r-2 border-black dark:border-white/20 last:border-r-0"
                        )}
                      >
                        {(rate * 100).toFixed(rate === 0.001 ? 1 : 0)}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Eco-Dynamics Toggle */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-black dark:text-white/70">
                    {t('Eco-Dynamics', 'Dinámica Eco')}
                  </span>
                  <button 
                    onClick={() => onSettingsChange({ ...settings, ecoSynergy: !settings.ecoSynergy })}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-2 text-[9px] font-bold uppercase transition-all border-2 border-black dark:border-white/20",
                      settings.ecoSynergy 
                        ? "bg-pink-500 text-white dark:bg-pink-600" 
                        : "bg-white text-black dark:bg-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                  >
                    <Network size={12} />
                    {settings.ecoSynergy ? t('Active', 'Activa') : t('Disabled', 'Desactivada')}
                  </button>
                </div>

                {/* Restore Defaults Button */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-black dark:text-white/70">
                    {t('Reset Settings', 'Reiniciar Ajustes')}
                  </span>
                  <button 
                    onClick={onRestoreDefaults}
                    className="w-full flex items-center justify-center gap-2 py-2 text-[9px] font-bold uppercase transition-all border-2 border-black dark:border-white/20 bg-white text-black dark:bg-zinc-900 dark:text-white hover:bg-red-500 hover:text-white dark:hover:bg-red-600"
                  >
                    <RotateCcw size={12} />
                    {t('Defaults', 'Por Defecto')}
                  </button>
                </div>
              </div>

              {/* Definition Tooltip */}
              <AnimatePresence mode="wait">
                {activeDef && (
                  <motion.div
                    key={activeDef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-2 bg-zinc-100 dark:bg-zinc-800 border-2 border-black dark:border-white/20 text-[10px] text-black dark:text-white font-mono"
                  >
                    {sliders.find(s => s.key === activeDef)?.def}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Controls;
