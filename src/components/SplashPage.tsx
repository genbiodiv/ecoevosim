import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Globe, Brain, CheckCircle2, Moon, Sun, Info, Monitor } from 'lucide-react';
import { Language } from '../types';
import { getTraitLegend } from '../simulation/colors';
import { cn } from '../lib/utils';
import { Zap } from 'lucide-react';

interface SplashProps {
  onStart: () => void;
  language: Language;
  onToggleLanguage: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isHighRes: boolean;
  onToggleRes: () => void;
  challengeDuration: number;
  onSetChallengeDuration: (duration: number) => void;
}

const SplashPage: React.FC<SplashProps> = ({ 
  onStart, 
  language, 
  onToggleLanguage, 
  theme, 
  onToggleTheme,
  isHighRes,
  onToggleRes,
  challengeDuration,
  onSetChallengeDuration
}) => {
  const t = (en: string, es: string) => language === Language.EN ? en : es;
  const challengesRef = useRef<HTMLDivElement>(null);
  const legend = getTraitLegend();

  const scrollToChallenges = () => {
    challengesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const [showDetailedInstructions, setShowDetailedInstructions] = React.useState(false);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden bg-white dark:bg-zinc-950 text-black dark:text-white transition-colors duration-300 custom-scrollbar">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-screen flex flex-col items-center py-12 px-6 md:py-24"
      >
        <div className="max-w-4xl w-full space-y-16 md:space-y-24">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row justify-between items-start gap-8">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="grid grid-cols-3 gap-2 p-4 bg-black dark:bg-white text-white dark:text-black font-mono font-black text-4xl md:text-6xl leading-none uppercase tracking-tighter">
                  <div className="flex items-center justify-center w-16 h-16 md:w-24 md:h-24 border-2 border-white dark:border-black">E</div>
                  <div className="flex items-center justify-center w-16 h-16 md:w-24 md:h-24 border-2 border-white dark:border-black">C</div>
                  <div className="flex items-center justify-center w-16 h-16 md:w-24 md:h-24 border-2 border-white dark:border-black">O</div>
                  <div className="flex items-center justify-center w-16 h-16 md:w-24 md:h-24 border-2 border-white dark:border-black">E</div>
                  <div className="flex items-center justify-center w-16 h-16 md:w-24 md:h-24 border-2 border-white dark:border-black">V</div>
                  <div className="flex items-center justify-center w-16 h-16 md:w-24 md:h-24 border-2 border-white dark:border-black">O</div>
                  <div className="flex items-center justify-center w-16 h-16 md:w-24 md:h-24 border-2 border-white dark:border-black">S</div>
                  <div className="flex items-center justify-center w-16 h-16 md:w-24 md:h-24 border-2 border-white dark:border-black">I</div>
                  <div className="flex items-center justify-center w-16 h-16 md:w-24 md:h-24 border-2 border-white dark:border-black">M</div>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-5xl font-mono font-bold text-black dark:text-white leading-tight mb-4 uppercase tracking-tighter">
                    ECO EVO SIM
                  </h1>
                  <p className="text-lg md:text-xl text-black dark:text-white max-w-xl leading-relaxed font-mono">
                    {t('Explore biological evolution through natural selection and branching lineages.', 'Explora la evolución biológica a través de la selección natural y los linajes ramificados.')}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-0 border-2 border-black dark:border-white/20"
            >
              <button
                onClick={onToggleLanguage}
                className="px-6 py-3 border-r-2 border-black dark:border-white/20 flex items-center gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all text-black dark:text-white font-bold text-xs uppercase"
              >
                <Globe size={16} />
                {language === Language.EN ? 'ES' : 'EN'}
              </button>
              <button
                onClick={onToggleTheme}
                className="p-3 border-r-2 border-black dark:border-white/20 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all text-black dark:text-white"
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <button
                onClick={onToggleRes}
                className={cn(
                  "px-6 py-3 flex items-center gap-2 transition-all font-bold text-xs uppercase",
                  isHighRes 
                    ? "bg-black text-white dark:bg-white dark:text-black" 
                    : "text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                <Monitor size={16} />
                {isHighRes ? 'High Res' : 'Low Res'}
              </button>
            </motion.div>
          </header>

          {/* Game Explanation Section */}
          <motion.section 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white/20 space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
                  <Info size={20} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white uppercase tracking-tight font-mono">
                  {t('Evolutionary Mechanics', 'Mecánicas Evolutivas')}
                </h2>
              </div>
              <button 
                onClick={() => setShowDetailedInstructions(!showDetailedInstructions)}
                className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center gap-2"
              >
                <BookOpen size={16} />
                {showDetailedInstructions ? t('Hide Manual', 'Ocultar Manual') : t('Gameplay Manual', 'Manual de Juego')}
              </button>
            </div>

            <AnimatePresence>
              {showDetailedInstructions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid md:grid-cols-2 gap-12 py-8 border-t-2 border-black dark:border-white/20 mt-8">
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold uppercase tracking-tighter font-mono">{t('Understanding the Tree', 'Entendiendo el Árbol')}</h3>
                      <div className="space-y-4 text-sm font-mono leading-relaxed opacity-80">
                        <p>{t('The tree grows from left to right. Each node represents an organism.', 'El árbol crece de izquierda a derecha. Cada nodo representa un organismo.')}</p>
                        <p>{t('Lines connect parents to offspring. The color of the line and node represents the genetic traits of that individual.', 'Las líneas conectan a los padres con sus crías. El color representa los rasgos genéticos.')}</p>
                        <p>{t('Circles indicate living organisms, while X marks represent extinct lineages.', 'Los círculos indican organismos vivos, mientras que las X representan linajes extintos.')}</p>
                        <p>{t('Use the MACRO/MICRO toggle (M/m) to switch between the full history and the surviving lineages.', 'Usa el toggle MACRO/MICRO (M/m) para cambiar entre la historia completa y los linajes sobrevivientes.')}</p>
                        <p>{t('Time Travel: Use the history scrubber in the Evaluation Panel to revisit any point in your evolutionary timeline.', 'Viaje en el Tiempo: Usa el desplazador de historia en el Panel de Evaluación para revisar cualquier punto de tu línea temporal.')}</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold uppercase tracking-tighter font-mono">{t('Advanced Dynamics', 'Dinámicas Avanzadas')}</h3>
                      <div className="space-y-4 text-sm font-mono leading-relaxed opacity-80">
                        <p>{t('Strategy Shifts: Periodically, you can pivot your lineage\'s focus (e.g., Symbiosis, Hardiness, or Evasion).', 'Cambios de Estrategia: Periódicamente, puedes pivotar el enfoque de tu linaje (ej. Simbiosis, Resistencia o Evasión).')}</p>
                        <p>{t('Eco-Dynamics: When enabled, diverse populations create functional synergies. Specialized organisms support each other, increasing overall survival.', 'Dinámica Ecológica: Cuando está activa, las poblaciones diversas crean sinergias funcionales. Los organismos especializados se apoyan, aumentando la supervivencia general.')}</p>
                        <p>{t('Data Export: Save your progress as high-resolution images, CSV data, Newick tree files, or detailed PDF reports.', 'Exportación de Datos: Guarda tu progreso como imágenes de alta resolución, datos CSV, archivos de árbol Newick o informes PDF detallados.')}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-black dark:text-white text-lg leading-relaxed space-y-8 font-mono">
              <p className="border-l-4 border-black dark:border-white pl-6">
                {t(
                  'This simulator models the fundamental processes of evolution. Every organism in the population has a unique set of traits that determine its fitness in a changing environment.',
                  'Este simulador modela los procesos fundamentales de la evolución. Cada organismo en la población tiene un conjunto único de rasgos que determinan su aptitud en un entorno cambiante.'
                )}
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <h4 className="font-bold text-black dark:text-white uppercase text-sm tracking-widest">{t('Selection', 'Selección')}</h4>
                  <p className="text-xs leading-relaxed text-black/80 dark:text-white/60">{t('Environment filters organisms based on their traits. Only the fittest survive to reproduce.', 'El entorno filtra a los organismos según sus rasgos. Solo los más aptos sobreviven para reproducirse.')}</p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-black dark:text-white uppercase text-sm tracking-widest">{t('Mutation', 'Mutación')}</h4>
                  <p className="text-xs leading-relaxed text-black/80 dark:text-white/60">{t('Offspring inherit traits with small random variations, introducing new genetic diversity.', 'Los descendientes heredan rasgos con pequeñas variaciones aleatorias, introduciendo nueva diversidad genética.')}</p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-black dark:text-white uppercase text-sm tracking-widest">{t('Speciation', 'Especiación')}</h4>
                  <p className="text-xs leading-relaxed text-black/80 dark:text-white/60">{t('Over time, lineages diverge, creating a branching tree of distinct biological groups.', 'Con el tiempo, los linajes divergen, creando un árbol ramificado de distintos grupos biológicos.')}</p>
                </div>
              </div>

              {/* Trait Color Guide in Splash */}
              <div className="pt-8 border-t-2 border-black dark:border-white/20">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black dark:text-white mb-6 flex items-center gap-2">
                  {t('Trait Color Guide', 'Guía de Colores de Rasgos')}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-2 border-black dark:border-white/20">
                  {legend.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 border border-black dark:border-white/20">
                      <div className="w-3 h-3 shrink-0" style={{ background: item.color }} />
                      <span className="text-[10px] font-bold text-black dark:text-white leading-tight uppercase">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
            {/* How to Play */}
            <motion.section 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
                  <BookOpen size={20} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white uppercase tracking-tight font-mono">
                  {t('How to Play', 'Cómo Jugar')}
                </h2>
              </div>
              
              <div className="space-y-8">
                {[
                  {
                    num: '01',
                    en: 'Observe the microevolution of organisms as they reproduce and mutate each generation.',
                    es: 'Observa la microevolución de los organismos mientras se reproducen y mutan en cada generación.'
                  },
                  {
                    num: '02',
                    en: 'Adjust environmental parameters to see how selection pressures shape biological traits.',
                    es: 'Ajusta los parámetros ambientales para ver cómo las presiones de selección moldean los rasgos biológicos.'
                  },
                  {
                    num: '03',
                    en: 'Navigate the phylogenetic tree to inspect ancestors, survival reasons, and extinction events.',
                    es: 'Navega por el árbol filogenético para inspeccionar ancestros, razones de supervivencia y eventos de extinción.'
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <span className="text-black dark:text-white font-mono font-bold text-2xl opacity-40 group-hover:opacity-100 transition-opacity">
                      {item.num}
                    </span>
                    <p className="text-black dark:text-white leading-relaxed pt-1 font-mono text-sm">
                      {t(item.en, item.es)}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Learning Challenges */}
            <motion.section 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
                  <Brain size={20} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white uppercase tracking-tight font-mono">
                  {t('Mastery Challenges', 'Desafíos de Maestría')}
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                    {t('Challenge Duration (Generations)', 'Duración del Desafío (Generaciones)')}
                  </label>
                  <div className="flex gap-2">
                    {[5, 10, 20, 50].map((d) => (
                      <button
                        key={d}
                        onClick={() => onSetChallengeDuration(d)}
                        className={cn(
                          "flex-1 py-3 border-2 border-black dark:border-white/20 font-mono font-bold text-sm transition-all",
                          challengeDuration === d 
                            ? "bg-black text-white dark:bg-white dark:text-black" 
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-0 border-2 border-black dark:border-white/20">
                {[
                  {
                    en: 'The Red Queen\'s Race: Maintain a stable population while Predation Pressure is > 0.8 for 20 generations.',
                    es: 'La Carrera de la Reina Roja: Mantén una población estable con Presión de Depredación > 0.8 durante 20 generaciones.'
                  },
                  {
                    en: 'Adaptive Radiation: Branch the tree into 3 distinct lineages (different colors) that survive a Bottleneck.',
                    es: 'Radiación Adaptativa: Ramifica el árbol en 3 linajes distintos (diferentes colores) que sobrevivan a un Cuello de Botella.'
                  },
                  {
                    en: 'Metabolic Efficiency: Evolve a population with Metabolism < 0.3 but Speed > 0.6 in a low-food environment.',
                    es: 'Eficiencia Metabólica: Evoluciona una población con Metabolismo < 0.3 pero Velocidad > 0.6 en un entorno con poco alimento.'
                  },
                  {
                    en: 'Specialist Niche: Evolve a population with Food Specialization > 0.8 that survives a resource shift.',
                    es: 'Nicho Especialista: Evoluciona una población con Especialización Alimentaria > 0.8 que sobreviva a un cambio de recursos.'
                  },
                  {
                    en: 'Survivor Strategy: Maintain a lineage with high Defense (>0.7) and low Metabolism (<0.4) through multiple catastrophes.',
                    es: 'Estrategia de Sobreviviente: Mantén un linaje con alta Defensa (>0.7) y bajo Metabolismo (<0.4) a través de múltiples catástrofes.'
                  },
                  {
                    en: 'Functional Synergy: Enable Eco-Dynamics and maintain a population with Food Specialization diversity > 0.3 for 30 generations.',
                    es: 'Sinergia Funcional: Activa la Dinámica Ecológica y mantén una diversidad de Especialización Alimentaria > 0.3 durante 30 generaciones.'
                  },
                  {
                    en: 'Time Architect: Reach generation 100 and use Time Travel to export a report from exactly generation 50.',
                    es: 'Arquitecto del Tiempo: Llega a la generación 100 y usa el Viaje en el Tiempo para exportar un informe de la generación 50.'
                  },
                  {
                    en: 'Symbiotic Master: Maintain a population with Eco-Dynamics active and Synergy Strength > 0.3 for 50 generations.',
                    es: 'Maestro Simbiótico: Mantén una población con Dinámica Eco activa y Fuerza de Sinergia > 0.3 durante 50 generaciones.'
                  },
                  {
                    en: 'Macro Vision: Evolve a tree where at least 5 distinct lineages (Macro view) survive a major catastrophe.',
                    es: 'Visión Macro: Evoluciona un árbol donde al menos 5 linajes distintos (vista Macro) sobrevivan a una catástrofe.'
                  }
                ].map((challenge, i) => (
                  <div 
                    key={i} 
                    className="flex gap-4 p-6 bg-white dark:bg-zinc-900 border border-black dark:border-white/10 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <Zap className="text-black dark:text-white shrink-0 mt-1" size={18} />
                    <p className="text-xs md:text-sm text-black dark:text-white font-mono leading-relaxed">
                      {t(challenge.en, challenge.es)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
          </div>

          {/* Footer Action */}
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-12 pb-24 flex flex-col items-center"
          >
            <button
              onClick={() => onStart()}
              className="w-full md:w-auto md:px-32 py-8 bg-black dark:bg-white text-white dark:text-black text-2xl font-bold border-4 border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white transition-all uppercase tracking-tighter font-mono"
            >
              {t('Begin Simulation', 'Comenzar Simulación')}
            </button>
            <p className="mt-8 text-black dark:text-white text-[10px] font-bold uppercase tracking-[0.5em] opacity-80">
              {t('Evolution is waiting', 'La evolución está esperando')}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SplashPage;
