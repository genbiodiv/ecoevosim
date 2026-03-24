import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Organism, Language, Traits } from '../types';
import { getOrganismColor } from '../simulation/colors';
import { cn } from '../lib/utils';
import { Skull, SortAsc, Filter } from 'lucide-react';

interface PopulationViewProps {
  population: Organism[];
  onNodeClick: (id: string) => void;
  selectedNodeId: string | null;
  language: Language;
  viewedGeneration: number;
}

const PopulationView: React.FC<PopulationViewProps> = ({ 
  population, 
  onNodeClick, 
  selectedNodeId,
  language,
  viewedGeneration
}) => {
  const [sortBy, setSortBy] = useState<'count' | keyof Traits>('count');
  
  const isAliveAtViewedGen = (o: Organism) => {
    if (viewedGeneration === o.generation) return o.isAlive;
    return o.generation <= viewedGeneration && 
           (!o.extinctGeneration || o.extinctGeneration > viewedGeneration);
  };

  const alivePopulation = population.filter(isAliveAtViewedGen);
  const deadPopulation = population.filter(o => !isAliveAtViewedGen(o) && o.generation <= viewedGeneration).slice(-60);

  const t = (en: string, es: string) => language === Language.EN ? en : es;

  // Group by traits to show distinct organisms
  const distinctGroups = alivePopulation.reduce((acc, org) => {
    const key = (Object.values(org.traits) as number[]).map(v => v.toFixed(3)).join('|');
    if (!acc[key]) {
      acc[key] = { org, count: 0 };
    }
    acc[key].count++;
    return acc;
  }, {} as Record<string, { org: Organism, count: number }>);

  const distinctList = Object.values(distinctGroups) as { org: Organism, count: number }[];

  // Sorting logic
  const sortedList = [...distinctList].sort((a, b) => {
    if (sortBy === 'count') {
      return b.count - a.count;
    } else {
      return (b.org.traits[sortBy] as number) - (a.org.traits[sortBy] as number);
    }
  });

  const sortOptions: { key: 'count' | keyof Traits; labelEn: string; labelEs: string }[] = [
    { key: 'count', labelEn: 'Count', labelEs: 'Cantidad' },
    { key: 'size', labelEn: 'Size', labelEs: 'Tamaño' },
    { key: 'speed', labelEn: 'Speed', labelEs: 'Velocidad' },
    { key: 'metabolism', labelEn: 'Metabolism', labelEs: 'Metabolismo' },
    { key: 'defense', labelEn: 'Defense', labelEs: 'Defensa' },
    { key: 'tempTolerance', labelEn: 'Temp Tol.', labelEs: 'Tol. Temp' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar scroll-smooth bg-transparent text-black dark:text-white">
      <div className="max-w-7xl mx-auto space-y-12">
        <section className="relative">
          <div className="sticky top-0 z-20 bg-inherit py-4 mb-6 border-b-2 border-black dark:border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">
                {t('Distinct Species', 'Especies Distintas')} ({distinctList.length})
              </h3>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <div className="flex items-center gap-1.5 text-black dark:text-white mr-2">
                <SortAsc size={12} />
                <span className="text-[9px] font-bold uppercase tracking-wider">{t('Sort By', 'Ordenar por')}</span>
              </div>
              {sortOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={cn(
                    "px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all border-2 whitespace-nowrap",
                    sortBy === opt.key
                      ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                      : "bg-white text-black border-black dark:bg-zinc-900 dark:text-white dark:border-white/20 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                  )}
                >
                  {t(opt.labelEn, opt.labelEs)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-[repeat(15,1fr)] gap-2">
            <AnimatePresence mode="popLayout">
              {sortedList.map(({ org, count }) => (
                <motion.button
                  key={org.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => onNodeClick(org.id)}
                  className={cn(
                    "aspect-square flex flex-col items-center justify-center transition-all border-2 relative group",
                    selectedNodeId === org.id 
                      ? "bg-black border-black dark:bg-white dark:border-white scale-110 z-10" 
                      : "bg-white dark:bg-zinc-900 border-black dark:border-white/20 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                  )}
                >
                  <div 
                    className="w-1/2 h-1/2 rounded-full shadow-inner"
                    style={{ 
                      backgroundColor: getOrganismColor(org.traits),
                      transform: `scale(${0.5 + org.traits.size * 0.5})`
                    }}
                  />
                  <span className={cn(
                    "absolute -top-1 -right-1 px-1.5 py-0.5 text-[8px] font-black shadow-sm border-2",
                    selectedNodeId === org.id
                      ? "bg-white text-black border-black dark:bg-black dark:text-white dark:border-white"
                      : "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                  )}>
                    {count}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </section>

        <section className="opacity-40 relative">
          <div className="sticky top-0 z-20 bg-inherit py-2 mb-4 border-b-2 border-black dark:border-white/20">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white flex items-center gap-2">
              <Skull size={12} />
              {t('Recent Extinctions', 'Extinciones Recientes')}
            </h3>
          </div>
          <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-[repeat(20,1fr)] lg:grid-cols-[repeat(32,1fr)] xl:grid-cols-[repeat(40,1fr)] gap-1">
            {deadPopulation.map((org) => (
              <div
                key={org.id}
                className="aspect-square bg-white dark:bg-zinc-900 border-2 border-black dark:border-white/20 flex items-center justify-center text-black dark:text-white font-bold text-[6px]"
              >
                X
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PopulationView;
