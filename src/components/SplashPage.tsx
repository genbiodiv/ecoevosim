import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Globe, Brain, CheckCircle2, Moon, Sun, Info, Monitor, HelpCircle, RotateCcw, Target, LogOut, Activity, Network, Eye, LayoutDashboard, Zap, Layers } from 'lucide-react';
import { Language } from '../types';
import { getTraitLegend } from '../simulation/colors';
import { cn } from '../lib/utils';

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
  const legend = getTraitLegend(language);

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

          {/* Start Action - Moved before Evolutionary Mechanics */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center space-y-8"
          >
            <div className="w-full max-w-md space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-center">
                  {t('Era Duration', 'Duración de las Eras')}
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
            </div>

            <button
              onClick={() => onStart()}
              className="w-full py-8 bg-black dark:bg-white text-white dark:text-black text-2xl font-bold border-4 border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white transition-all uppercase tracking-tighter font-mono"
            >
              {t('Begin Simulation', 'Comenzar Simulación')}
            </button>
            <p className="mt-4 text-black dark:text-white text-[10px] font-bold uppercase tracking-[0.5em] opacity-80">
              {t('Evolution is waiting', 'La evolución está esperando')}
            </p>
          </motion.div>

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
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold uppercase tracking-tighter font-mono flex items-center gap-2">
                          <CheckCircle2 size={20} className="text-green-500" />
                          {t('Core Simulation & Traits', 'Simulación Central y Rasgos')}
                        </h3>
                        <div className="space-y-4 text-sm font-mono leading-relaxed opacity-80">
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Size (0.0 - 1.0):', 'Tamaño (0.0 - 1.0):')}</span>
                            {" "}{t('Physical scale. Larger organisms resist cold better but require significantly more food to survive each generation.', 'Escala física. Los organismos grandes resisten mejor el frío pero requieren significativamente más comida.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Speed (0.0 - 1.0):', 'Velocidad (0.0 - 1.0):')}</span>
                            {" "}{t('Movement velocity. Essential for escaping predators and reaching food sources before competitors.', 'Velocidad de movimiento. Esencial para escapar de depredadores y alcanzar comida antes que los competidores.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Metabolism (0.0 - 1.0):', 'Metabolismo (0.0 - 1.0):')}</span>
                            {" "}{t('Energy consumption rate. High metabolism allows for more activity but increases the risk of starvation during food shortages.', 'Tasa de consumo de energía. El metabolismo alto permite más actividad pero aumenta el riesgo de inanición.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Defense (0.0 - 1.0):', 'Defensa (0.0 - 1.0):')}</span>
                            {" "}{t('Protective features like shells or camouflage. Reduces mortality from predation and environmental outbreaks.', 'Características protectoras como caparazones o camuflaje. Reduce la mortalidad por depredación.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Reproduction Rate (0.0 - 1.0):', 'Tasa de Reproducción (0.0 - 1.0):')}</span>
                            {" "}{t('Likelihood of producing offspring. High rates lead to population booms but can cause rapid resource depletion.', 'Probabilidad de producir crías. Las tasas altas llevan a explosiones demográficas.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Clutch Size (1 - 8):', 'Tamaño de Camada (1 - 8):')}</span>
                            {" "}{t('The number of offspring per reproduction event. Essential for recovering from mass extinction events.', 'El número de crías por evento reproductivo. Esencial para recuperarse de extinciones masivas.')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-bold uppercase tracking-tighter font-mono flex items-center gap-2">
                          <Globe size={20} className="text-purple-500" />
                          {t('Environmental Pressures', 'Presiones Ambientales')}
                        </h3>
                        <div className="space-y-4 text-sm font-mono leading-relaxed opacity-80">
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Temperature:', 'Temperatura:')}</span>
                            {" "}{t('Fluctuates over time. Extreme heat or cold requires high Temp Tolerance. Large size helps in cold; small size in heat.', 'Fluctúa con el tiempo. El calor o frío extremos requieren alta Tolerancia Temp.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Food Availability:', 'Disponibilidad de Comida:')}</span>
                            {" "}{t('Determines the carrying capacity of the ecosystem. Low food favors small, low-metabolism organisms.', 'Determina la capacidad de carga del ecosistema. Poca comida favorece organismos pequeños.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Predation Pressure:', 'Presión de Depredación:')}</span>
                            {" "}{t('High pressure forces the evolution of Speed and Defense. Slow, unprotected lineages quickly go extinct.', 'La alta presión fuerza la evolución de Velocidad y Defensa.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Instability:', 'Inestabilidad:')}</span>
                            {" "}{t('The rate of environmental change. High instability favors generalists who can adapt to rapid shifts.', 'La tasa de cambio ambiental. La alta inestabilidad favorece a los generalistas.')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold uppercase tracking-tighter font-mono flex items-center gap-2">
                          <Zap size={20} className="text-yellow-500" />
                          {t('Evolutionary Strategies', 'Estrategias Evolutivas')}
                        </h3>
                        <div className="space-y-4 text-sm font-mono leading-relaxed opacity-80">
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Symbiosis:', 'Simbiosis:')}</span>
                            {" "}{t('Focuses on cooperation and ecological niche sharing. Highly effective when Eco-Dynamics are active and population diversity is high.', 'Se enfoca en la cooperación y el intercambio de nichos. Muy efectivo con alta diversidad.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Hardiness:', 'Resistencia:')}</span>
                            {" "}{t('Maximizes survival in harsh environments with low food and extreme temperatures. Prioritizes metabolic efficiency.', 'Maximiza la supervivencia en entornos hostiles. Prioriza la eficiencia metabólica.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Evasion:', 'Evasión:')}</span>
                            {" "}{t('Prioritizes speed and camouflage to minimize losses from predation. Ideal for high-pressure environments.', 'Prioriza la velocidad y el camuflaje para minimizar pérdidas por depredación.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Generalist:', 'Generalista:')}</span>
                            {" "}{t('A balanced approach that avoids extreme specialization, allowing the lineage to survive diverse challenges.', 'Un enfoque equilibrado que evita la especialización extrema.')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-bold uppercase tracking-tighter font-mono flex items-center gap-2">
                          <Brain size={20} className="text-blue-500" />
                          {t('Advanced Facilities', 'Facilidades Avanzadas')}
                        </h3>
                        <div className="space-y-4 text-sm font-mono leading-relaxed opacity-80">
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Eco-Dynamics:', 'Dinámica Ecológica:')}</span>
                            {" "}{t('Models ecosystem synergy. Diverse populations provide a "Functional Synergy" bonus, helping specialized organisms survive.', 'Modela la sinergia del ecosistema. Poblaciones diversas dan un bono de supervivencia.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Time Travel:', 'Viaje en el Tiempo:')}</span>
                            {" "}{t('Use the history scrubber in the Evaluation Panel to revisit any previous generation. The tree and metrics will update to reflect that specific moment.', 'Usa el desplazador de historia para revisar cualquier generación previa.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Newick Export:', 'Exportación Newick:')}</span>
                            {" "}{t('Export your tree in standard format. Choose between Micro (all individuals) or Macro (only surviving lineages) modes.', 'Exporta tu árbol en formato estándar. Elige entre modo Micro o Macro.')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-bold uppercase tracking-tighter font-mono flex items-center gap-2">
                          <Monitor size={20} className="text-emerald-500" />
                          {t('Simulation Settings', 'Ajustes de Simulación')}
                        </h3>
                        <div className="space-y-4 text-sm font-mono leading-relaxed opacity-80">
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Simulation Mode:', 'Modo de Simulación:')}</span>
                            {" "}{t('Standard mode follows a fixed set of challenges. Infinite mode generates randomized challenges for endless evolution.', 'El modo Estándar sigue desafíos fijos. El modo Infinito genera desafíos aleatorios.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Visual Quality:', 'Calidad Visual:')}</span>
                            {" "}{t('High Res allows for more detailed trees (up to 3000 nodes) but requires more processing power. Low Res is optimized for performance.', 'Alta Res permite árboles más detallados. Baja Res está optimizada para el rendimiento.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Bottleneck Survival:', 'Supervivencia Cuello Botella:')}</span>
                            {" "}{t('The percentage of organisms that survive when the population exceeds the carrying capacity. Lower values create stronger selection pressure.', 'El porcentaje de organismos que sobreviven al exceder la capacidad de carga.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Eco-Dynamics Toggle:', 'Activar Dinámica Eco:')}</span>
                            {" "}{t('Enables or disables the synergy bonus. When active, a diverse population helps its members survive environmental challenges.', 'Activa o desactiva el bono de sinergia. Ayuda a sobrevivir desafíos ambientales.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Reset Settings:', 'Reiniciar Ajustes:')}</span>
                            {" "}{t('Instantly restores all mutation, mortality, and environmental parameters to their original balanced values.', 'Restaura instantáneamente todos los parámetros a sus valores equilibrados originales.')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-bold uppercase tracking-tighter font-mono flex items-center gap-2">
                          <Brain size={20} className="text-purple-500" />
                          {t('Trait Selection (God Mode)', 'Selección de Rasgos (Modo Dios)')}
                        </h3>
                        <div className="space-y-4 text-sm font-mono leading-relaxed opacity-80">
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Trait Biases:', 'Sesgos de Rasgos:')}</span>
                            {" "}{t('Manually influence natural selection by favoring specific biological traits. Positive values favor higher traits (e.g., larger size), while negative values favor lower ones.', 'Influye manualmente en la selección natural favoreciendo rasgos específicos.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Size/Speed/Defense:', 'Tamaño/Velocidad/Defensa:')}</span>
                            {" "}{t('Adjust these to force the population to evolve towards specific physical characteristics regardless of environmental pressures.', 'Ajusta estos para forzar a la población a evolucionar hacia características físicas específicas.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Metabolism:', 'Metabolismo:')}</span>
                            {" "}{t('Positive bias favors efficiency (lower metabolism), while negative bias favors high-energy activity.', 'El sesgo positivo favorece la eficiencia (menor metabolismo).')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Reproduction:', 'Reproducción:')}</span>
                            {" "}{t('Favor organisms with higher reproduction rates to accelerate population growth and genetic variation.', 'Favorece organismos con mayores tasas de reproducción.')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-bold uppercase tracking-tighter font-mono flex items-center gap-2">
                          <CheckCircle2 size={20} className="text-orange-500" />
                          {t('Dashboard & Navigation', 'Panel y Navegación')}
                        </h3>
                        <div className="space-y-4 text-sm font-mono leading-relaxed opacity-80">
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Population:', 'Población:')}</span>
                            {" "}{t('Displays the current number of living organisms and the environment\'s carrying capacity.', 'Muestra el número actual de organismos vivos y la capacidad de carga.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Extinction Rate:', 'Tasa de Extinción:')}</span>
                            {" "}{t('The percentage of all organisms ever born that have died. A high rate indicates intense natural selection.', 'El porcentaje de todos los organismos nacidos que han muerto.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Generations:', 'Generaciones:')}</span>
                            {" "}{t('The total number of evolutionary cycles completed since the simulation began.', 'El número total de ciclos evolutivos completados.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Phylogeny View:', 'Vista de Filogenia:')}</span>
                            {" "}{t('A branching tree showing the direct relationships between ancestors and descendants.', 'Un árbol ramificado que muestra las relaciones entre ancestros y descendientes.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Population View:', 'Vista de Población:')}</span>
                            {" "}{t('A grid view of all living individuals, allowing for direct comparison of their biological traits.', 'Una vista de cuadrícula de todos los individuos vivos para comparar sus rasgos.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Macro View:', 'Vista Macro:')}</span>
                            {" "}{t('A high-level dashboard showing population trends, trait averages, and diversity metrics over time.', 'Un panel de alto nivel que muestra tendencias poblacionales y métricas de diversidad.')}
                          </p>
                          <p>
                            <span className="font-bold text-black dark:text-white">{t('Time Travel:', 'Viaje en el Tiempo:')}</span>
                            {" "}{t('Use the history slider in the Macro View or select specific nodes in the Phylogeny tree to explore the state of the simulation at any previous generation.', 'Usa el deslizador de historia en la Vista Macro o selecciona nodos en el árbol para explorar generaciones previas.')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 md:col-span-2">
                        <h3 className="text-xl font-bold uppercase tracking-tighter font-mono flex items-center gap-2">
                          <Info size={20} className="text-zinc-500" />
                          {t('Icon Reference', 'Referencia de Iconos')}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-mono uppercase font-bold">
                          <div className="flex items-center gap-2"><div className="p-1 bg-black text-white dark:bg-white dark:text-black"><Zap size={12}/></div> {t('Play/Pause', 'Play/Pausa')}</div>
                          <div className="flex items-center gap-2"><div className="p-1 bg-black text-white dark:bg-white dark:text-black"><RotateCcw size={12}/></div> {t('Reset/Return', 'Reiniciar/Volver')}</div>
                          <div className="flex items-center gap-2"><div className="p-1 bg-black text-white dark:bg-white dark:text-black"><Target size={12}/></div> {t('Center View', 'Centrar Vista')}</div>
                          <div className="flex items-center gap-2"><div className="p-1 bg-black text-white dark:bg-white dark:text-black"><LogOut size={12}/></div> {t('End Simulation', 'Finalizar')}</div>
                          <div className="flex items-center gap-2"><div className="p-1 bg-black text-white dark:bg-white dark:text-black"><Monitor size={12}/></div> {t('Settings', 'Ajustes')}</div>
                          <div className="flex items-center gap-2"><div className="p-1 bg-black text-white dark:bg-white dark:text-black"><Globe size={12}/></div> {t('Language', 'Idioma')}</div>
                          <div className="flex items-center gap-2"><div className="p-1 bg-black text-white dark:bg-white dark:text-black"><Moon size={12}/></div> {t('Theme', 'Tema')}</div>
                          <div className="flex items-center gap-2"><div className="p-1 bg-black text-white dark:bg-white dark:text-black"><HelpCircle size={12}/></div> {t('Manual', 'Manual')}</div>
                          <div className="flex items-center gap-2"><div className="p-1 bg-black text-white dark:bg-white dark:text-black"><Activity size={12}/></div> {t('Status/History', 'Estado/Historia')}</div>
                          <div className="flex items-center gap-2"><div className="p-1 bg-black text-white dark:bg-white dark:text-black"><Layers size={12}/></div> {t('Strategies', 'Estrategias')}</div>
                          <div className="flex items-center gap-2"><div className="p-1 bg-black text-white dark:bg-white dark:text-black"><Network size={12}/></div> {t('Phylogeny', 'Filogenia')}</div>
                          <div className="flex items-center gap-2"><div className="p-1 bg-black text-white dark:bg-white dark:text-black"><Eye size={12}/></div> {t('Population', 'Población')}</div>
                          <div className="flex items-center gap-2"><div className="p-1 bg-black text-white dark:bg-white dark:text-black"><LayoutDashboard size={12}/></div> {t('Macro', 'Macro')}</div>
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
          <div className="grid grid-cols-1 gap-12 md:gap-20">
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
              
              <div className="grid md:grid-cols-3 gap-8">
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
              transition={{ delay: 0.6 }}
              className="space-y-8 pb-20"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-500 flex items-center justify-center text-white">
                  <Zap size={20} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white uppercase tracking-tight font-mono">
                  {t('Learning Challenges', 'Desafíos de Aprendizaje')}
                </h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: t('The Specialist', 'El Especialista'),
                    en: 'Can you create an environment where only very large, slow organisms survive? Try adjusting food availability and predation pressure.',
                    es: '¿Puedes crear un entorno donde solo sobrevivan organismos muy grandes y lentos? Intenta ajustar el alimento y la presión de depredación.'
                  },
                  {
                    title: t('Mass Extinction', 'Extinción Masiva'),
                    en: 'Trigger a catastrophe and observe the "Bottleneck Effect". Which traits help organisms survive sudden environmental shifts?',
                    es: 'Provoca una catástrofe y observa el "Efecto de Cuello de Botella". ¿Qué rasgos ayudan a sobrevivir a cambios ambientales repentinos?'
                  },
                  {
                    title: t('Eco-Synergy', 'Eco-Sinergia'),
                    en: 'Enable Eco-Dynamics and observe how diversity affects stability. Does a more diverse ecosystem resist extinction better?',
                    es: 'Activa la Dinámica Eco y observa cómo la diversidad afecta la estabilidad. ¿Un ecosistema más diverso resiste mejor la extinción?'
                  }
                ].map((item, i) => (
                  <div key={i} className="p-6 border-2 border-black dark:border-white/20 bg-zinc-50 dark:bg-zinc-900/50 space-y-4">
                    <h4 className="font-bold text-black dark:text-white uppercase text-sm tracking-widest border-b-2 border-black dark:border-white/20 pb-2">{item.title}</h4>
                    <p className="text-xs leading-relaxed text-black/80 dark:text-white/60 font-mono">{t(item.en, item.es)}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SplashPage;
