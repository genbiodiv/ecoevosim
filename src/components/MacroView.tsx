import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Skull, 
  Zap, 
  Shield, 
  Maximize, 
  Wind,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Organism, Language, GenerationMetrics } from '../types';
import { getOrganismStrategy, STRATEGIES } from '../simulation/strategies';

interface MacroViewProps {
  population: Organism[];
  history: GenerationMetrics[];
  generation: number;
  language: Language;
  theme: 'light' | 'dark';
}

const MacroView: React.FC<MacroViewProps> = ({ population, history, generation, language, theme }) => {
  const t = (en: string, es: string) => language === Language.EN ? en : es;

  const isAliveAtViewedGen = (o: Organism) => {
    if (generation === o.generation) return o.isAlive;
    return o.generation <= generation && 
           (!o.extinctGeneration || o.extinctGeneration > generation);
  };

  const { alivePopulation, extinctCount, taxonomicDiversity, phylogeneticDiversity, strategyData, mostCommonStrategy, traitAverages } = useMemo(() => {
    const alivePop = population.filter(isAliveAtViewedGen);
    const extinct = population.filter(o => !isAliveAtViewedGen(o) && o.generation <= generation).length;

    // Taxonomic Diversity
    const speciesSet = new Set<string>();
    alivePop.forEach(o => {
      const key = `${o.traits.size.toFixed(1)}|${o.traits.speed.toFixed(1)}|${o.traits.metabolism.toFixed(1)}|${o.traits.defense.toFixed(1)}|${o.traits.reproductionRate.toFixed(1)}|${o.traits.foodSpecialization.toFixed(1)}`;
      speciesSet.add(key);
    });

    // Phylogenetic Diversity
    const ancestorIds = new Set<string>();
    const popMap = new Map<string, Organism>(population.map(o => [o.id, o]));
    alivePop.forEach(node => {
      let current: Organism | undefined = node;
      while (current) {
        if (ancestorIds.has(current.id)) break;
        ancestorIds.add(current.id);
        if (!current.parentId) break;
        current = popMap.get(current.parentId);
      }
    });
    const pd = Array.from(ancestorIds).filter(id => {
      const node = popMap.get(id);
      return node && node.parentId !== null;
    }).length;

    // Strategy Analysis
    const strategies: Record<string, number> = {};
    alivePop.forEach(o => {
      const strategy = getOrganismStrategy(o.traits);
      strategies[strategy] = (strategies[strategy] || 0) + 1;
    });

    const sData = STRATEGIES.map(name => ({ name, value: strategies[name] || 0 }));
    const commonStrategy = sData.reduce((prev, current) => (prev.value > current.value) ? prev : current, sData[0]).name;

    const tAverages = [
      { name: t('Size', 'Tamaño'), value: alivePop.length > 0 ? alivePop.reduce((a, b) => a + b.traits.size, 0) / alivePop.length : 0 },
      { name: t('Speed', 'Velocidad'), value: alivePop.length > 0 ? alivePop.reduce((a, b) => a + b.traits.speed, 0) / alivePop.length : 0 },
      { name: t('Metabolism', 'Metabolismo'), value: alivePop.length > 0 ? alivePop.reduce((a, b) => a + b.traits.metabolism, 0) / alivePop.length : 0 },
      { name: t('Defense', 'Defensa'), value: alivePop.length > 0 ? alivePop.reduce((a, b) => a + b.traits.defense, 0) / alivePop.length : 0 },
      { name: t('Repro', 'Repro'), value: alivePop.length > 0 ? alivePop.reduce((a, b) => a + b.traits.reproductionRate, 0) / alivePop.length : 0 },
      { name: t('Clutch', 'Camada'), value: alivePop.length > 0 ? alivePop.reduce((a, b) => a + b.traits.clutchSize, 0) / alivePop.length : 0 },
    ];

    return {
      alivePopulation: alivePop,
      extinctCount: extinct,
      taxonomicDiversity: speciesSet.size,
      phylogeneticDiversity: pd,
      strategyData: sData,
      mostCommonStrategy: commonStrategy,
      traitAverages: tAverages
    };
  }, [population, generation, language]);

  const stats = [
    { 
      label: t('Total Population', 'Población Total'), 
      value: alivePopulation.length, 
      icon: <Users className="text-blue-500" />,
      desc: t('Currently living organisms.', 'Organismos vivos actualmente.')
    },
    { 
      label: t('Taxonomic Diversity', 'Diversidad Taxonómica'), 
      value: taxonomicDiversity, 
      icon: <Activity className="text-orange-500" />,
      desc: t('Number of distinct morphospecies.', 'Número de morfoespecies distintas.')
    },
    { 
      label: t('Phylogenetic Diversity', 'Diversidad Filogenética'), 
      value: phylogeneticDiversity, 
      icon: <TrendingUp className="text-emerald-500" />,
      desc: t('Total branch length of the living tree.', 'Longitud total de las ramas del árbol vivo.')
    },
    { 
      label: t('Extinct Branches', 'Ramas Extintas'), 
      value: extinctCount, 
      icon: <Skull className="text-red-500" />,
      desc: t('Organisms that failed to survive.', 'Organismos que no lograron sobrevivir.')
    },
  ];

  const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#f59e0b', '#06b6d4'];

  return (
    <div className="w-full h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-4 md:p-6 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-black dark:border-white/20 pb-4">
          <div>
            <h1 className="text-4xl font-mono font-black uppercase tracking-tighter leading-none">
              {t('Macro Analysis', 'Análisis Macro')}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-[9px] uppercase tracking-[0.4em] font-bold mt-2">
              {t('System-wide evolutionary metrics', 'Métricas evolutivas del sistema')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[8px] uppercase tracking-widest font-bold opacity-50">{t('Current Generation', 'Generación Actual')}</p>
            <p className="text-3xl font-mono font-black italic">GEN {generation}</p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-2 border-black dark:border-white/20">
          {stats.map((s, i) => (
            <div key={i} className="p-4 md:p-6 bg-white dark:bg-zinc-900 border border-black dark:border-white/10 group hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
              <div className="mb-3 scale-75 origin-left">{s.icon}</div>
              <p className="text-[8px] uppercase tracking-[0.3em] font-bold opacity-60 mb-1">{s.label}</p>
              <p className="text-3xl font-mono font-bold tracking-tighter mb-2">{s.value}</p>
              <p className="text-[8px] uppercase font-bold opacity-40 group-hover:opacity-80">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-12">
          {/* Diversity Indices (New) */}
          <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white/20 p-6 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
            <h3 className="text-xs font-bold uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
              <TrendingUp size={20} />
              {t('Diversity Indices', 'Índices de Diversidad')}
            </h3>
            <div className="h-[300px] w-full min-h-[300px]">
              {history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="0" stroke={theme === 'dark' ? '#222' : '#eee'} vertical={false} />
                    <XAxis dataKey="generation" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#18181b' : '#fff',
                        border: '2px solid black',
                        borderRadius: '0px',
                        fontFamily: 'monospace'
                      }} 
                    />
                    <Legend iconType="square" wrapperStyle={{ paddingTop: '20px', fontSize: '9px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="taxonomicDiversity" 
                      name={t('Taxonomic Diversity', 'Diversidad Taxonómica')} 
                      stroke="#f59e0b" 
                      strokeWidth={3} 
                      dot={false} 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="phylogeneticDiversity" 
                      name={t('Phylogenetic Diversity', 'Diversidad Filogenética')} 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                  <p className="text-[10px] font-mono uppercase opacity-40">{t('Insufficient data for trends', 'Datos insuficientes para tendencias')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Trait Distribution */}
          <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white/20 p-6 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
            <h3 className="text-xs font-bold uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
              <Activity size={20} />
              {t('Average Trait Distribution', 'Distribución de Rasgos Promedio')}
            </h3>
            <div className="h-[300px] w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={traitAverages} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#ddd'} horizontal={false} />
                  <XAxis type="number" domain={[0, 1]} hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke={theme === 'dark' ? '#fff' : '#000'} 
                    fontSize={11} 
                    width={120}
                    tick={{ fontWeight: 'bold' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#18181b' : '#fff',
                      border: '2px solid black',
                      borderRadius: '0px',
                      fontFamily: 'monospace'
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {traitAverages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strategy Bars */}
          <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white/20 p-6 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
            <h3 className="text-xs font-bold uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
              <Zap size={20} />
              {t('Dominant Strategies', 'Estrategias Dominantes')}
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-12 h-[300px]">
              <div className="w-full md:w-2/3 h-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strategyData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#ddd'} horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke={theme === 'dark' ? '#fff' : '#000'} 
                      fontSize={10} 
                      width={100}
                      tick={{ fontWeight: 'bold' }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#18181b' : '#fff',
                        border: '2px solid black',
                        borderRadius: '0px',
                        fontFamily: 'monospace'
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {strategyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/3 space-y-4">
                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 border-2 border-black dark:border-white/10">
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">{t('Most Common', 'Más Común')}</p>
                  <p className="text-2xl font-mono font-black uppercase text-blue-500">{mostCommonStrategy}</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {strategyData.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase">
                      <div className="w-2 h-2" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="truncate">{s.name}</span>
                      <span className="opacity-50 ml-auto">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Breakdown */}
        <div className="bg-black dark:bg-zinc-900 text-white p-6 md:p-8 border-4 border-black dark:border-white/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2 bg-white text-black border-2 border-white">
              <Info size={24} />
            </div>
            <div>
              <h2 className="text-xl font-mono font-black uppercase tracking-tighter">
                {t('Strategy Insights', 'Perspectivas de Estrategia')}
              </h2>
              <p className="text-zinc-400 text-[8px] uppercase tracking-[0.3em] font-bold mt-1">
                {t('How your population is adapting to the current environment', 'Cómo se adapta tu población al entorno actual')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Maximize size={16} />
                <h4 className="font-bold uppercase tracking-widest text-[10px]">{t('Physicality', 'Fisicalidad')}</h4>
              </div>
              <p className="text-[9px] leading-relaxed text-zinc-400">
                {t('High size and defense indicate toughness. Resists cold/predation but needs more food.', 'Tamaño y defensa altos indican resistencia. Resiste frío/depredación pero necesita más comida.')}
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400">
                <Wind size={16} />
                <h4 className="font-bold uppercase tracking-widest text-[10px]">{t('Agility', 'Agilidad')}</h4>
              </div>
              <p className="text-[9px] leading-relaxed text-zinc-400">
                {t('High speed/repro suggest r-selection. Focus on outrunning threats and many offspring.', 'Velocidad/repro sugieren selección r. Foco en superar amenazas y muchas crías.')}
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Zap size={16} />
                <h4 className="font-bold uppercase tracking-widest text-[10px]">{t('Efficiency', 'Eficiencia')}</h4>
              </div>
              <p className="text-[9px] leading-relaxed text-zinc-400">
                {t('Low metabolism/high temp tolerance indicate resilience. Survives in poor environments.', 'Metabolismo bajo/tolerancia temp indican resistencia. Sobrevive en entornos pobres.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroView;
