import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Organism,
  SimulationState, 
  Language, 
  SimulationSettings, 
  Environment,
  SimulationView
} from './types';
import { 
  createInitialOrganism, 
  runGeneration, 
  getChallengeForGeneration 
} from './simulation/engine';
import { getOrganismStrategy } from './simulation/strategies';
import Controls from './components/Controls';
import TreeVisualization from './components/TreeVisualization';
import NodeInspector from './components/NodeInspector';
import SplashPage from './components/SplashPage';
import PopulationView from './components/PopulationView';
import MacroView from './components/MacroView';
import EvaluationPanel from './components/EvaluationPanel';
import StrategyShiftModal from './components/StrategyShiftModal';
import { getTraitLegend } from './simulation/colors';
import { Layers, Activity, TreePine, Skull, Users, Eye, Network, Info, LayoutDashboard, X, RotateCcw } from 'lucide-react';
import { cn } from './lib/utils';

const INITIAL_SETTINGS: SimulationSettings = {
  mutationRate: 0.05,
  mutationEffect: 0.1,
  intrinsicMortality: 0.15,
  predationPressure: 0.3,
  foodAvailability: 0.5,
  instability: 0.2,
  catastropheFrequency: 0.05,
  carryingCapacity: 250,
  isInfinite: true,
  bottleneckSurvivalRate: 0.01,
  challengeDuration: 10,
  ecoSynergy: true,
  synergyStrength: 0.15,
  minOffspring: 1,
  maxOffspring: 8,
  sizeBias: 0.0,
  speedBias: 0.0,
  metabolismBias: 0.0,
  defenseBias: 0.0,
  reproductionBias: 0.0,
};

export default function App() {
  const [state, setState] = useState<SimulationState>({
    generation: 0,
    population: [createInitialOrganism()],
    history: [],
    settings: INITIAL_SETTINGS,
    environment: {
      temperature: 0,
      foodAvailability: 0.5,
      predationPressure: 0.3,
      instability: 0.2,
    },
    selectedNodeId: null,
    isPaused: true,
    isGameOver: false,
    isSimulationComplete: false,
    stopReason: null,
    pendingStrategyShift: false,
    lastShiftGen: -1,
    language: Language.ES,
    theme: 'light',
    view: SimulationView.TREE,
    hideExtinct: false,
    isMacroView: true,
    isLargeTreeWarningDismissed: false,
    showManualStrategy: false,
    isExtinctionAlertDismissed: false,
    viewedGeneration: 0,
  });

  const [showSplash, setShowSplash] = useState(true);
  const [isHighRes, setIsHighRes] = useState(false);
  const [resetViewTrigger, setResetViewTrigger] = useState(0);

  // Simulation Loop
  useEffect(() => {
    if (state.isPaused || showSplash || state.isGameOver) return;

    let isActive = true;
    let timeoutId: NodeJS.Timeout;

    const tick = () => {
      if (!isActive) return;

      setState(prev => {
        if (!isActive || prev.isPaused || prev.isGameOver) return prev;

        const nextGen = prev.generation + 1;
        const challenge = getChallengeForGeneration(nextGen, prev.settings.isInfinite, prev.settings.challengeDuration);
        
        // Strategy Shift Detection: When a new challenge starts
        const cycleLength = prev.settings.challengeDuration + 5;
        const relativeGen = nextGen - 5;
        const genInCycle = relativeGen % cycleLength;
        const isNewChallenge = nextGen >= 5 && genInCycle === 0;
        
        if (isNewChallenge && prev.lastShiftGen !== nextGen && !prev.settings.isInfinite) {
          return {
            ...prev,
            isPaused: true,
            pendingStrategyShift: true,
            lastShiftGen: nextGen,
          };
        }

        // Check if simulation is complete (all challenges done in non-infinite mode)
        if (!prev.settings.isInfinite && nextGen > 5 && challenge === null && !prev.isSimulationComplete) {
          return {
            ...prev,
            isSimulationComplete: true,
            stopReason: 'COMPLETION',
            lastShiftGen: isNewChallenge ? nextGen : prev.lastShiftGen,
          };
        }

        const currentAliveCount = prev.population.filter(o => o.isAlive).length;
        const isBottleneck = currentAliveCount >= prev.settings.carryingCapacity;

        const nextEnv: Environment = {
          ...prev.environment,
          currentChallenge: challenge || undefined,
          foodAvailability: prev.settings.foodAvailability,
          predationPressure: prev.settings.predationPressure,
          isBottleneck,
        };

        const nextPopulation = runGeneration(
          prev.population,
          prev.settings,
          prev.generation,
          nextEnv
        );

        // Pruning logic
        let prunedPopulation = nextPopulation;
        const PRUNE_LIMIT = isHighRes ? 3000 : 1500;
        
        if (nextPopulation.length > PRUNE_LIMIT) {
          const keptIds = new Set<string>();
          const popMap = new Map(nextPopulation.map(o => [o.id, o]));
          
          const aliveNodes = nextPopulation.filter(o => o.isAlive);
          aliveNodes.forEach(node => {
            let current: any = node;
            while (current) {
              if (keptIds.has(current.id)) break;
              keptIds.add(current.id);
              if (!current.parentId) break;
              current = popMap.get(current.parentId);
            }
          });

          nextPopulation.filter(o => o.generation > prev.generation - 30).forEach(o => keptIds.add(o.id));

          if (keptIds.size < PRUNE_LIMIT) {
            const remainingSpace = PRUNE_LIMIT - keptIds.size;
            const deadNodes = nextPopulation.filter(o => !o.isAlive && !keptIds.has(o.id));
            deadNodes.sort((a, b) => b.generation - a.generation);
            deadNodes.slice(0, remainingSpace).forEach(o => keptIds.add(o.id));
          }

          prunedPopulation = nextPopulation.filter(o => keptIds.has(o.id));
        }

        const aliveCount = prunedPopulation.filter(o => o.isAlive).length;
        const aliveNodes = prunedPopulation.filter(o => o.isAlive);
        
        const strategyCounts: Record<string, number> = {};
        aliveNodes.forEach(o => {
          const strategy = getOrganismStrategy(o.traits);
          strategyCounts[strategy] = (strategyCounts[strategy] || 0) + 1;
        });

        // Calculate Taxonomic Diversity (Morphospecies based on trait clustering)
        const species = new Set<string>();
        aliveNodes.forEach(o => {
          const key = Object.values(o.traits).map(v => (v as number).toFixed(1)).join('|');
          species.add(key);
        });
        const taxonomicDiversity = species.size;

        // Calculate Phylogenetic Diversity (Total branch length of living tree)
        const ancestorIds = new Set<string>();
        const popMap = new Map<string, Organism>(prunedPopulation.map(o => [o.id, o]));
        aliveNodes.forEach(node => {
          let current: Organism | undefined = node;
          while (current) {
            if (ancestorIds.has(current.id)) break;
            ancestorIds.add(current.id);
            if (!current.parentId) break;
            current = popMap.get(current.parentId);
          }
        });
        const phylogeneticDiversity = Array.from(ancestorIds).filter(id => {
          const node = popMap.get(id);
          return node && node.parentId !== null;
        }).length;

        const newMetrics = {
          generation: nextGen,
          aliveCount,
          avgSize: aliveNodes.reduce((acc, o) => acc + o.traits.size, 0) / Math.max(1, aliveCount),
          avgSpeed: aliveNodes.reduce((acc, o) => acc + o.traits.speed, 0) / Math.max(1, aliveCount),
          avgMetabolism: aliveNodes.reduce((acc, o) => acc + o.traits.metabolism, 0) / Math.max(1, aliveCount),
          strategies: strategyCounts,
          taxonomicDiversity,
          phylogeneticDiversity,
        };

        if (aliveCount === 0 && nextPopulation.length > 0) {
          return { 
            ...prev, 
            generation: nextGen,
            viewedGeneration: nextGen,
            population: prunedPopulation,
            isPaused: true, 
            isGameOver: false,
            stopReason: 'EXTINCTION',
            hideExtinct: false, // Force show extinct lineages so the tree isn't blank
            history: [...prev.history, newMetrics],
            environment: nextEnv,
            lastShiftGen: isNewChallenge ? nextGen : prev.lastShiftGen,
          };
        }

        return {
          ...prev,
          generation: nextGen,
          viewedGeneration: nextGen,
          population: prunedPopulation,
          history: [...prev.history, newMetrics],
          environment: nextEnv,
          lastShiftGen: isNewChallenge ? nextGen : prev.lastShiftGen,
        };
      });

      if (isActive) {
        timeoutId = setTimeout(tick, 1000);
      }
    };

    timeoutId = setTimeout(tick, 1000);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [state.isPaused, showSplash, state.isGameOver, isHighRes]);

  const t = (en: string, es: string) => state.language === Language.EN ? en : es;

  const metrics = [
    { icon: <Users size={16} />, label: t('Population', 'Población'), value: state.population.filter(o => o.isAlive).length, sub: `Max: ${state.settings.carryingCapacity}` },
    { icon: <Skull size={16} />, label: t('Extinction Rate', 'Tasa de Extinción'), value: `${((state.population.filter(o => !o.isAlive).length / Math.max(1, state.population.length)) * 100).toFixed(1)}%`, sub: t('Total deaths', 'Muertes totales') },
    { icon: <TreePine size={16} />, label: t('Generations', 'Generaciones'), value: state.generation, sub: t('Time elapsed', 'Tiempo transcurrido') },
  ];

  const handleRestart = () => {
    setState({
      ...state,
      generation: 0,
      population: [createInitialOrganism()],
      history: [],
      isPaused: true,
      isGameOver: false,
      isSimulationComplete: false,
      stopReason: null,
      pendingStrategyShift: false,
      lastShiftGen: -1,
      selectedNodeId: null,
      isExtinctionAlertDismissed: false,
    });
  };

  const handleEndSimulation = () => {
    setShowSplash(true);
    setState(prev => ({
      ...prev,
      generation: 0,
      population: [createInitialOrganism()],
      history: [],
      isPaused: true,
      isGameOver: false,
      isSimulationComplete: false,
      stopReason: 'MANUAL',
      pendingStrategyShift: false,
      lastShiftGen: -1,
      selectedNodeId: null,
      isExtinctionAlertDismissed: false,
    }));
  };

  const selectedOrganism = state.population.find(o => o.id === state.selectedNodeId);

  const viewedPopulation = useMemo(() => {
    if (state.viewedGeneration === state.generation) return state.population;
    return state.population.filter(o => o.generation <= state.viewedGeneration);
  }, [state.population, state.viewedGeneration, state.generation]);

  const viewedHistory = useMemo(() => {
    if (state.viewedGeneration === state.generation) return state.history;
    return state.history.filter(h => h.generation <= state.viewedGeneration);
  }, [state.history, state.viewedGeneration, state.generation]);

  const legend = getTraitLegend(state.language);

  // Sync theme with document element for Tailwind dark mode
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-transparent transition-colors duration-300">
      <AnimatePresence>
        {showSplash && (
          <SplashPage
            onStart={() => {
              setShowSplash(false);
              setState(s => ({ ...s, isPaused: true }));
            }}
            language={state.language}
            onToggleLanguage={() => setState(s => ({ ...s, language: s.language === Language.EN ? Language.ES : Language.EN }))}
            theme={state.theme}
            onToggleTheme={() => setState(s => ({ ...s, theme: s.theme === 'light' ? 'dark' : 'light' }))}
            isHighRes={isHighRes}
            onToggleRes={() => setIsHighRes(!isHighRes)}
            challengeDuration={state.settings.challengeDuration}
            onSetChallengeDuration={(d) => setState(s => ({ ...s, settings: { ...s.settings, challengeDuration: d } }))}
          />
        )}
      </AnimatePresence>

      <Controls
        settings={state.settings}
        onSettingsChange={(settings) => setState(s => ({ ...s, settings }))}
        isPaused={state.isPaused}
        onTogglePause={() => {
          if (state.stopReason) return;
          setState(s => ({ ...s, isPaused: !s.isPaused }));
        }}
        onReset={handleRestart}
        onEndSimulation={handleEndSimulation}
        language={state.language}
        onToggleLanguage={() => setState(s => ({ ...s, language: s.language === Language.EN ? Language.ES : Language.EN }))}
        theme={state.theme}
        onToggleTheme={() => setState(s => ({ ...s, theme: s.theme === 'light' ? 'dark' : 'light' }))}
        onShowHelp={() => setShowSplash(true)}
        isHighRes={isHighRes}
        onToggleRes={() => setIsHighRes(!isHighRes)}
        onCenterView={() => setResetViewTrigger(prev => prev + 1)}
        onRestoreDefaults={() => setState(s => ({ ...s, settings: INITIAL_SETTINGS }))}
        isBottleneck={state.environment.isBottleneck || false}
      />

      <main className="flex-1 relative flex flex-col overflow-hidden">
        {/* Top Dashboard - Minimalist & High Contrast */}
        <div className="px-2 py-1 z-10">
            <div className="bg-white dark:bg-zinc-900 text-black dark:text-white flex flex-wrap items-center justify-around md:justify-between px-2 md:px-4 py-1 border-2 border-black dark:border-white/20 gap-2 md:gap-4">
              {metrics.map((m, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-2">
                    <div className="text-black dark:text-white shrink-0 scale-75 md:scale-100">
                      {m.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7px] uppercase tracking-wider opacity-80 font-bold leading-none mb-0.5">{m.label}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-mono font-bold leading-none">{m.value}</span>
                        {m.sub && <span className="text-[7px] opacity-50 font-medium hidden lg:inline truncate max-w-[80px]">{m.sub}</span>}
                      </div>
                    </div>
                  </div>
                  {i < metrics.length - 1 && (
                    <div className="hidden md:block h-4 w-px bg-black/20 dark:bg-white/20" />
                  )}
                </React.Fragment>
              ))}
              <div className="hidden md:block h-4 w-px bg-black/20 dark:bg-white/20" />
              <button 
                onClick={() => setState(s => ({ ...s, showManualStrategy: true, isPaused: true }))}
                className="flex items-center gap-2 px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
              >
                <Layers size={12} />
                {t('Strategies', 'Estrategias')}
              </button>
              <div className="hidden md:block h-4 w-px bg-black/20 dark:bg-white/20" />
              <button 
                onClick={() => setState(s => ({ ...s, isGameOver: true, isPaused: true }))}
                className="flex items-center gap-2 px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
              >
                <Activity size={12} />
                {t('Time Travel', 'Viaje en el Tiempo')}
              </button>
            </div>
        </div>

        {/* View Toggle */}
        <div className="px-6 flex justify-center mb-4 z-10">
          <div className="bg-white dark:bg-zinc-900 p-1 border-2 border-black dark:border-white/20 flex gap-0">
            <button
              onClick={() => setState(s => ({ ...s, view: SimulationView.TREE }))}
              className={cn(
                "px-6 py-2 flex items-center gap-2 text-xs font-bold transition-all",
                state.view === SimulationView.TREE 
                  ? "bg-black text-white dark:bg-white dark:text-black" 
                  : "text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <Network size={14} />
              {t('Phylogeny', 'Filogenia')}
            </button>
            <button
              onClick={() => setState(s => ({ ...s, view: SimulationView.POPULATION }))}
              className={cn(
                "px-6 py-2 flex items-center gap-2 text-xs font-bold transition-all border-l-2 border-black dark:border-white/20",
                state.view === SimulationView.POPULATION 
                  ? "bg-black text-white dark:bg-white dark:text-black" 
                  : "text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <Eye size={14} />
              {t('Population', 'Población')}
            </button>
            <button
              onClick={() => setState(s => ({ ...s, view: SimulationView.MACRO }))}
              className={cn(
                "px-6 py-2 flex items-center gap-2 text-xs font-bold transition-all border-l-2 border-black dark:border-white/20",
                state.view === SimulationView.MACRO 
                  ? "bg-black text-white dark:bg-white dark:text-black" 
                  : "text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <LayoutDashboard size={14} />
              {t('Macro', 'Macro')}
            </button>
          </div>
        </div>

        {/* Current Challenge Banner & End Game Banners */}
        <AnimatePresence mode="wait">
          {state.isSimulationComplete && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="mx-6 mb-4 p-6 bg-white dark:bg-zinc-900 text-black dark:text-white border-4 border-black dark:border-white/40 flex items-center justify-between z-20"
            >
              <div className="flex items-center gap-6">
                <div className="p-3 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white">
                  <Activity size={24} />
                </div>
                <div>
                  <h4 className="font-mono font-bold text-lg uppercase tracking-tighter">
                    {t('Simulation Complete', 'Simulación Completada')}
                  </h4>
                  <p className="text-xs uppercase tracking-widest font-bold opacity-70">
                    {t('All challenges finished. You can now explore the tree or view the final report.', 'Todos los desafíos terminados. Ahora puedes explorar el árbol o ver el informe final.')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setState(s => ({ ...s, isGameOver: true }))}
                className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white font-bold uppercase text-xs tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                {t('View Post-Mortem', 'Ver Post-Mortem')}
              </button>
            </motion.div>
          )}

          {state.stopReason === 'EXTINCTION' && !state.isGameOver && !state.isExtinctionAlertDismissed && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="mx-6 mb-4 p-6 bg-red-500 text-white border-4 border-black flex items-center justify-between z-20 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex items-center gap-6">
                <div className="p-3 bg-white text-red-500 border-2 border-black">
                  <Skull size={24} />
                </div>
                <div>
                  <h4 className="font-mono font-bold text-lg uppercase tracking-tighter">
                    {t('Population Extinct', 'Población Extinta')}
                  </h4>
                  <p className="text-xs uppercase tracking-widest font-bold opacity-90">
                    {t('The lineage has ended at generation', 'El linaje ha terminado en la generación')} {state.generation}. {t('Explore the tree or view the final analysis.', 'Explora el árbol o mira el análisis final.')}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setState(s => ({ ...s, isExtinctionAlertDismissed: true }))}
                  className="px-6 py-3 bg-zinc-800 text-white border-2 border-white font-bold uppercase text-xs tracking-widest hover:bg-zinc-700 transition-colors"
                >
                  {t('View Last Gen', 'Ver Última Gen')}
                </button>
                <button 
                  onClick={() => setState(s => ({ ...s, isGameOver: true }))}
                  className="px-6 py-3 bg-black text-white border-2 border-white font-bold uppercase text-xs tracking-widest hover:bg-zinc-800 transition-colors"
                >
                  {t('View Analysis', 'Ver Análisis')}
                </button>
                <button 
                  onClick={handleRestart}
                  className="px-6 py-3 bg-white text-black border-2 border-black font-bold uppercase text-xs tracking-widest hover:bg-zinc-100 transition-colors"
                >
                  {t('Restart', 'Reiniciar')}
                </button>
              </div>
            </motion.div>
          )}

          {state.environment.currentChallenge && !state.isSimulationComplete && (
            <motion.div
              key={state.environment.currentChallenge.id}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="mx-6 mb-4 p-4 bg-white dark:bg-zinc-900 text-black dark:text-white border-2 border-black dark:border-white/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white">
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="font-mono font-bold text-sm uppercase tracking-tighter">
                    {t('Current Challenge', 'Desafío Actual')}: {t(state.environment.currentChallenge.nameEn, state.environment.currentChallenge.nameEs)}
                  </h4>
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">
                    {t(state.environment.currentChallenge.descriptionEn, state.environment.currentChallenge.descriptionEs)}
                  </p>
                </div>
              </div>
              <div className="text-[10px] font-mono font-bold bg-black dark:bg-white text-white dark:text-black px-3 py-1 border border-black dark:border-white">
                GEN {state.generation}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Strategy Shift Modal */}
        <AnimatePresence>
          {(state.pendingStrategyShift || state.showManualStrategy) && (
            <StrategyShiftModal
              challenge={state.environment.currentChallenge || {
                id: 'manual',
                nameEn: 'Manual Strategy Adjustment',
                nameEs: 'Ajuste de Estrategia Manual',
                descriptionEn: 'Optimize your population parameters manually to adapt to current conditions.',
                descriptionEs: 'Optimiza los parámetros de tu población manualmente para adaptarte a las condiciones actuales.',
                effect: () => ({ fitness: 0, reasonEn: '', reasonEs: '' })
              }}
              language={state.language}
              currentSettings={state.settings}
              theme={state.theme}
              onSelect={(newSettings) => {
                setState(s => ({
                  ...s,
                  settings: newSettings,
                  pendingStrategyShift: false,
                  showManualStrategy: false,
                  isPaused: false
                }));
              }}
            />
          )}
        </AnimatePresence>

        {/* Large Tree Warning */}
        <AnimatePresence>
          {state.population.length > 2000 && state.view === SimulationView.TREE && !state.isLargeTreeWarningDismissed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0"
            >
              <button
                onClick={() => setState(s => ({ ...s, view: SimulationView.MACRO }))}
                className="px-6 py-3 bg-yellow-400 text-black border-4 border-black font-bold uppercase text-xs flex items-center gap-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                <LayoutDashboard size={16} />
                {t('Tree is large. Switch to Macro view?', 'El árbol es grande. ¿Cambiar a vista Macro?')}
              </button>
              <button 
                onClick={() => setState(s => ({ ...s, isLargeTreeWarningDismissed: true }))}
                className="p-3 bg-black text-white border-4 border-l-0 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main View */}
        <div className="flex-1 relative overflow-hidden">
          {state.view === SimulationView.TREE ? (
            <TreeVisualization
              population={viewedPopulation}
              onNodeClick={(id) => setState(s => ({ ...s, selectedNodeId: id }))}
              selectedNodeId={state.selectedNodeId}
              theme={state.theme}
              isHighRes={isHighRes}
              resetTrigger={resetViewTrigger}
              hideExtinct={state.hideExtinct}
              isMacroView={state.isMacroView}
              onToggleHideExtinct={() => setState(s => ({ ...s, hideExtinct: !s.hideExtinct }))}
              onToggleMacroView={() => setState(s => ({ ...s, isMacroView: !s.isMacroView }))}
              language={state.language}
              viewedGeneration={state.viewedGeneration}
            />
          ) : state.view === SimulationView.POPULATION ? (
            <PopulationView
              population={viewedPopulation}
              onNodeClick={(id) => setState(s => ({ ...s, selectedNodeId: id }))}
              selectedNodeId={state.selectedNodeId}
              language={state.language}
              viewedGeneration={state.viewedGeneration}
            />
          ) : (
            <MacroView
              population={viewedPopulation}
              generation={state.viewedGeneration}
              language={state.language}
              theme={state.theme}
            />
          )}
        </div>

        {/* Inspector */}
        <AnimatePresence>
          {selectedOrganism && (
            <NodeInspector
              organism={selectedOrganism}
              onClose={() => setState(s => ({ ...s, selectedNodeId: null }))}
              language={state.language}
            />
          )}
        </AnimatePresence>

        {/* Evaluation Panel */}
        <AnimatePresence>
          {state.isGameOver && (
            <EvaluationPanel
              population={state.population}
              history={state.history}
              generation={state.generation}
              language={state.language}
              onRestart={handleRestart}
              onClose={() => setState(s => ({ ...s, isGameOver: false }))}
              theme={state.theme}
              isInfinite={state.settings.isInfinite}
              stopReason={state.stopReason}
              challengeDuration={state.settings.challengeDuration}
            />
          )}
        </AnimatePresence>

        {/* Generation Counter Overlay */}
        <div className="absolute bottom-8 right-8 pointer-events-none select-none z-10 flex flex-col items-end">
          <h2 className="text-8xl font-serif italic font-black opacity-20 dark:text-white">
            GEN {state.viewedGeneration}
          </h2>
          {state.viewedGeneration !== state.generation && (
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-500 opacity-80 animate-pulse">
              {t('Time Travel Active', 'Viaje Temporal Activo')}
            </span>
          )}
        </div>

        {/* Time Travel Slider Overlay */}
        <AnimatePresence>
          {(state.isPaused || state.isGameOver || state.isSimulationComplete) && state.generation > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-6"
            >
              <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black dark:bg-white text-white dark:text-black">
                      <RotateCcw size={16} className="animate-spin-slow" />
                    </div>
                    <h3 className="text-sm font-mono font-black uppercase tracking-tighter">
                      {t('Time Travel Explorer', 'Explorador de Viaje Temporal')}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[8px] uppercase font-bold opacity-50">{t('Viewing', 'Viendo')}</p>
                      <p className="text-xl font-mono font-black">GEN {state.viewedGeneration}</p>
                    </div>
                    <button 
                      onClick={() => setState(s => ({ ...s, viewedGeneration: s.generation }))}
                      disabled={state.viewedGeneration === state.generation}
                      className={cn(
                        "px-4 py-2 border-2 border-black dark:border-white font-mono font-bold text-[10px] uppercase transition-all",
                        state.viewedGeneration === state.generation
                          ? "opacity-30 grayscale cursor-not-allowed"
                          : "bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
                      )}
                    >
                      {t('Return to Present', 'Volver al Presente')}
                    </button>
                  </div>
                </div>
                
                <div className="relative h-12 flex items-center">
                  <input 
                    type="range"
                    min={0}
                    max={state.generation}
                    step={1}
                    value={state.viewedGeneration}
                    onChange={(e) => setState(s => ({ ...s, viewedGeneration: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 appearance-none cursor-pointer accent-black dark:accent-white border-2 border-black dark:border-white/20"
                  />
                  <div className="absolute -bottom-2 left-0 right-0 flex justify-between px-1">
                    <span className="text-[8px] font-mono font-bold opacity-40">GEN 0</span>
                    <span className="text-[8px] font-mono font-bold opacity-40">GEN {state.generation}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
