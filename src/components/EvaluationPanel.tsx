import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Download, 
  RotateCcw, 
  TrendingUp, 
  Users, 
  Activity, 
  FileText, 
  Image as ImageIcon,
  Share2,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Organism, Language, GenerationMetrics, Challenge } from '../types';
import { toPng } from 'html-to-image';
import { cn } from '../lib/utils';
import { getChallengeForGeneration } from '../simulation/engine';
import { CHALLENGES } from '../simulation/challenges';
import { getOrganismStrategy, STRATEGIES } from '../simulation/strategies';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface EvaluationPanelProps {
  population: Organism[];
  history: GenerationMetrics[];
  generation: number;
  language: Language;
  onRestart: () => void;
  onClose: () => void;
  theme: 'light' | 'dark';
  isInfinite: boolean;
  stopReason: 'EXTINCTION' | 'COMPLETION' | 'MANUAL' | null;
  challengeDuration: number;
}

const EvaluationPanel: React.FC<EvaluationPanelProps> = ({
  population: fullPopulation,
  history: fullHistory,
  generation: maxGeneration,
  language,
  onRestart,
  onClose,
  theme,
  isInfinite,
  stopReason,
  challengeDuration
}) => {
  const [targetGeneration, setTargetGeneration] = React.useState(maxGeneration);
  const panelRef = useRef<HTMLDivElement>(null);
  const t = (en: string, es: string) => language === Language.EN ? en : es;

  const population = fullPopulation.filter(o => o.generation <= targetGeneration);
  const history = fullHistory.filter(h => h.generation <= targetGeneration);
  const generation = targetGeneration;

  const isExtinction = stopReason === 'EXTINCTION' && targetGeneration === maxGeneration;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetGeneration(parseInt(e.target.value));
  };

  const downloadCSV = () => {
    const headers = [
      'ID', 
      'ParentID', 
      'Generation', 
      'Size', 
      'Speed', 
      'Metabolism', 
      'Defense', 
      'Reproduction', 
      'TempTolerance', 
      'FoodSpec', 
      'IsAlive',
      'ChallengeID',
      t('ChallengeNameEn', 'NombreDesafioEs'),
      t('ChallengeDescEn', 'DescripDesafioEs'),
      t('SurvivalReasonEn', 'RazonSupervivenciaEn'),
      t('SurvivalReasonEs', 'RazonSupervivenciaEs')
    ];
    const rows = population.map(o => {
      const currentChallenge = getChallengeForGeneration(o.generation, isInfinite, challengeDuration);
      return [
        o.id,
        o.parentId || 'None',
        o.generation,
        o.traits.size.toFixed(3),
        o.traits.speed.toFixed(3),
        o.traits.metabolism.toFixed(3),
        o.traits.defense.toFixed(3),
        o.traits.reproductionRate.toFixed(3),
        o.traits.tempTolerance.toFixed(3),
        o.traits.foodSpecialization.toFixed(3),
        o.isAlive,
        currentChallenge ? currentChallenge.id : 'None',
        currentChallenge ? t(currentChallenge.nameEn, currentChallenge.nameEs) : 'N/A',
        currentChallenge ? t(currentChallenge.descriptionEn, currentChallenge.descriptionEs) : 'N/A',
        o.survivalReasonEn || 'N/A',
        o.survivalReasonEs || 'N/A'
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `evolution_data_gen_${generation}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadReport = () => {
    const lastChallenge = getChallengeForGeneration(generation, isInfinite, challengeDuration);
    const stopReasonText = {
      EXTINCTION: t('Population Extinction', 'Extinción de la Población'),
      COMPLETION: t('All Challenges Completed', 'Todos los Desafíos Completados'),
      MANUAL: t('Manual Termination', 'Terminación Manual'),
    }[stopReason || 'MANUAL'];

    const report = `
# ${t('EVOLUTIONARY REPORT', 'INFORME EVOLUTIVO')} (${isExtinction ? t('POST-MORTEM', 'POST-MORTEM') : t('SUMMARY', 'RESUMEN')})
${t('Generated at', 'Generado el')}: ${new Date().toLocaleString()}
${t('Target Generation', 'Generación Objetivo')}: ${targetGeneration} / ${maxGeneration}
${t('Total Lineages Evaluated', 'Linajes Totales Evaluados')}: ${population.length}
${t('Peak Population', 'Población Máxima')}: ${Math.max(...history.map(h => h.aliveCount), 0)}
${t('Stop Reason', 'Razón de Parada')}: ${stopReasonText}

${t('## DATA DICTIONARY', '## DICCIONARIO DE DATOS')}
### ${t('Traits', 'Rasgos')} (0.0 - 1.0)
- ${t('Size: Physical scale. Larger organisms resist cold but need more food.', 'Tamaño: Escala física. Los organismos grandes resisten el frío pero necesitan más comida.')}
- ${t('Speed: Movement velocity. Essential for escaping predators and reaching food.', 'Velocidad: Velocidad de movimiento. Esencial para escapar de depredadores y alcanzar comida.')}
- ${t('Metabolism: Energy consumption rate. High metabolism allows activity but risks starvation.', 'Metabolismo: Tasa de consumo de energía. El metabolismo alto permite actividad pero arriesga inanición.')}
- ${t('Defense: Protective features. Reduces mortality from predation and outbreaks.', 'Defensa: Características protectoras. Reduce la mortalidad por depredación y brotes.')}
- ${t('Reproduction Rate: Likelihood of producing offspring. High rates lead to population booms.', 'Tasa de Reproducción: Probabilidad de producir crías. Las tasas altas llevan a explosiones demográficas.')}
- ${t('Temp Tolerance: Ability to survive extreme heat or cold.', 'Tolerancia Temp: Capacidad de sobrevivir a calor o frío extremos.')}
- ${t('Food Specialization: 0.0 (Generalist) to 1.0 (Specialist).', 'Especialización Alimentaria: 0.0 (Generalista) a 1.0 (Especialista).')}

${t('## CHALLENGE LOG', '## REGISTRO DE DESAFÍOS')}
${(() => {
  const cycleLength = challengeDuration + 5;
  const numCycles = Math.ceil((generation - 5) / cycleLength);
  return Array.from({ length: Math.max(0, numCycles) }).map((_, i) => {
    const startGen = 5 + i * cycleLength;
    const challenge = getChallengeForGeneration(startGen, isInfinite, challengeDuration);
    if (!challenge) return '';
    return `Gen ${startGen}-${startGen + challengeDuration - 1}: ${t(challenge.nameEn, challenge.nameEs)} - ${t(challenge.descriptionEn, challenge.descriptionEs)}`;
  }).filter(Boolean).join('\n');
})()}

${t('## LAST CHALLENGE', '## ÚLTIMO DESAFÍO')}
${lastChallenge ? `${t(lastChallenge.nameEn, lastChallenge.nameEs)}: ${t(lastChallenge.descriptionEn, lastChallenge.descriptionEs)}` : t('None', 'Ninguno')}

${t('## FINAL METRICS', '## MÉTRICAS FINALES')}
- ${t('Average Size', 'Tamaño Promedio')}: ${history[history.length - 1]?.avgSize.toFixed(3) || 'N/A'}
- ${t('Average Speed', 'Velocidad Promedio')}: ${history[history.length - 1]?.avgSpeed.toFixed(3) || 'N/A'}
- ${t('Average Metabolism', 'Metabolismo Promedio')}: ${history[history.length - 1]?.avgMetabolism.toFixed(3) || 'N/A'}

---
${t('End of Report', 'Fin del Informe')}
    `;
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `evolution_report_gen_${generation}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadImage = async () => {
    if (panelRef.current === null) return;
    
    try {
      const dataUrl = await toPng(panelRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `evolution_summary_gen_${generation}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
    }
  };

  const STRATEGY_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#f59e0b', '#06b6d4', '#ec4899'];

  const downloadNewick = () => {
    const toNewick = (nodes: Organism[]): string => {
      const nodeMap = new Map<string, Organism>();
      nodes.forEach(n => nodeMap.set(n.id, n));
      
      const childrenMap = new Map<string, string[]>();
      nodes.forEach(n => {
        if (n.parentId) {
          const children = childrenMap.get(n.parentId) || [];
          children.push(n.id);
          childrenMap.set(n.parentId, children);
        }
      });

      const roots = nodes.filter(n => !n.parentId || !nodeMap.has(n.parentId));

      const buildNewick = (id: string): string => {
        const node = nodeMap.get(id)!;
        const children = childrenMap.get(id) || [];
        const name = `${node.id.slice(0,4)}_${getOrganismStrategy(node.traits)}`;
        const branchLength = 1;
        
        if (children.length === 0) {
          return `${name}:${branchLength}`;
        }
        
        return `(${children.map(buildNewick).join(',')})${name}:${branchLength}`;
      };

      if (roots.length === 0) return ";";
      if (roots.length === 1) return buildNewick(roots[0].id) + ";";
      
      return `(${roots.map(r => buildNewick(r.id)).join(',')})Life;`;
    };

    const newick = toNewick(population);
    const blob = new Blob([newick], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `evolution_tree_gen_${generation}.nwk`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Title
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text(t('EVOLUTIONARY ANALYSIS', 'ANÁLISIS EVOLUTIVO'), 20, 20);
    
    doc.setFontSize(10);
    doc.text(`${t('Generated at', 'Generado el')}: ${new Date().toLocaleString()}`, 20, 30);
    doc.text(`${t('Target Generation', 'Generación Objetivo')}: ${targetGeneration} / ${maxGeneration}`, 20, 35);
    doc.text(`${t('Total Population', 'Población Total')}: ${population.length}`, 20, 40);

    // Challenges Section
    doc.setFontSize(14);
    doc.text(t('CHALLENGE TIMELINE', 'LÍNEA DE TIEMPO DE DESAFÍOS'), 20, 55);
    
    let y = 65;
    const cycleLength = challengeDuration + 5;
    const numCycles = Math.ceil((generation - 5) / cycleLength);
    Array.from({ length: Math.max(0, numCycles) }).forEach((_, i) => {
      const startGen = 5 + i * cycleLength;
      const challenge = getChallengeForGeneration(startGen, isInfinite, challengeDuration);
      if (challenge && y < pageHeight - 30) {
        doc.setFontSize(8);
        doc.text(`Gen ${startGen}: ${t(challenge.nameEn, challenge.nameEs)}`, 25, y);
        doc.setDrawColor(200, 200, 200);
        doc.line(20, y + 2, pageWidth - 20, y + 2);
        y += 8;
      }
    });

    // Strategy Progression (Survivors Only)
    doc.addPage();
    doc.setFontSize(14);
    doc.text(t('STRATEGY PROGRESSION (SURVIVORS)', 'PROGRESIÓN DE ESTRATEGIAS (SOBREVIVIENTES)'), 20, 20);
    
    const survivors = population.filter(o => o.isAlive);
    const strategyCounts = survivors.reduce((acc, o) => {
      const strategy = getOrganismStrategy(o.traits);
      acc[strategy] = (acc[strategy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let barY = 40;
    (Object.entries(strategyCounts) as [string, number][]).forEach(([strategy, count], i) => {
      const width = (count / (survivors.length || 1)) * (pageWidth - 80);
      doc.setFillColor(STRATEGY_COLORS[i % STRATEGY_COLORS.length]);
      doc.rect(50, barY, width, 10, 'F');
      doc.setFontSize(8);
      doc.text(`${strategy}: ${count}`, 20, barY + 7);
      barY += 15;
    });

    // Full Tree Schematic (Simplified)
    doc.addPage();
    doc.setFontSize(14);
    doc.text(t('LINEAGE SCHEMATIC (FULL HISTORY)', 'ESQUEMA DE LINAJES (HISTORIA COMPLETA)'), 20, 20);
    doc.setFontSize(8);
    doc.text(t('Visual representation of lineage depth and branching.', 'Representación visual de la profundidad y ramificación de los linajes.'), 20, 30);

    // Draw a simplified tree structure
    const roots = population.filter(o => !o.parentId);
    const nodeMap = new Map<string, Organism>();
    population.forEach(n => nodeMap.set(n.id, n));

    const drawNode = (node: Organism, x: number, y: number, depth: number, spacing: number) => {
      if (depth > 6) return; // Limit depth for PDF
      const children = population.filter(o => o.parentId === node.id).slice(0, 2);
      children.forEach((child, i) => {
        const childX = x + 15;
        const childY = y + (i - (children.length - 1) / 2) * spacing;
        doc.setDrawColor(180, 180, 180);
        doc.line(x, y, childX, childY);
        
        // Color based on strategy
        const strategy = getOrganismStrategy(child.traits);
        const colorIdx = STRATEGIES.indexOf(strategy);
        doc.setFillColor(STRATEGY_COLORS[colorIdx % STRATEGY_COLORS.length]);
        doc.circle(childX, childY, 1, 'F');
        
        drawNode(child, childX, childY, depth + 1, spacing * 0.6);
      });
    };

    roots.slice(0, 8).forEach((root, i) => {
      const rootX = 30;
      const rootY = 50 + i * 25;
      doc.setFillColor(0, 0, 0);
      doc.circle(rootX, rootY, 1.5, 'F');
      drawNode(root, rootX, rootY, 0, 20);
    });

    doc.save(`evolution_analysis_gen_${generation}.pdf`);
  };

  const stats = [
    { label: t('Total Lineages', 'Linajes Totales'), value: population.length, icon: <Activity size={20} /> },
    { label: t('Final Generation', 'Generación Final'), value: generation, icon: <TrendingUp size={20} /> },
    { label: t('Peak Population', 'Población Máxima'), value: Math.max(...history.map(h => h.aliveCount), 0), icon: <Users size={20} /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 bg-black/50 backdrop-blur-sm"
    >
        <motion.div 
          ref={panelRef}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto flex flex-col border-4 bg-white dark:bg-zinc-950 border-black dark:border-white/20 text-black dark:text-white custom-scrollbar"
        >
        {/* Header */}
        <div className="p-8 border-b-4 border-black dark:border-white/20 flex items-center justify-between sticky top-0 bg-inherit z-10">
          <div>
            <h2 className="text-3xl font-mono font-bold uppercase tracking-tighter">
              {isExtinction 
                ? t('Evolutionary Post-Mortem', 'Análisis Evolutivo')
                : t('Evolutionary Summary', 'Resumen Evolutivo')
              }
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-widest mt-2 font-bold">
              {isExtinction
                ? t('The journey of life has reached its conclusion.', 'El viaje de la vida ha llegado a su fin.')
                : t('The lineage has successfully navigated all challenges.', 'El linaje ha navegado con éxito todos los desafíos.')
              }
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-2 border-black dark:border-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Time Travel Slider */}
        <div className="p-8 bg-zinc-100 dark:bg-zinc-900 border-b-4 border-black dark:border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-black dark:bg-white text-white dark:text-black">
                <RotateCcw size={20} className="animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-black uppercase tracking-tighter">
                  {t('Historical Analysis', 'Análisis Histórico')}
                </h3>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                  {t('View simulation state at any generation', 'Ver estado de la simulación en cualquier generación')}
                </p>
              </div>
            </div>
            <div className="flex-1 w-full max-w-xl">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-mono font-bold opacity-40 uppercase">GEN 0</span>
                <span className="text-xl font-mono font-black">GEN {targetGeneration}</span>
                <span className="text-[10px] font-mono font-bold opacity-40 uppercase">GEN {maxGeneration}</span>
              </div>
              <input 
                type="range"
                min={0}
                max={maxGeneration}
                step={1}
                value={targetGeneration}
                onChange={handleSliderChange}
                className="w-full h-2 bg-zinc-300 dark:bg-zinc-800 appearance-none cursor-pointer accent-black dark:accent-white border-2 border-black dark:border-white/20"
              />
            </div>
            <button 
              onClick={() => setTargetGeneration(maxGeneration)}
              disabled={targetGeneration === maxGeneration}
              className={cn(
                "px-6 py-3 border-2 border-black dark:border-white font-mono font-bold text-xs uppercase transition-all",
                targetGeneration === maxGeneration
                  ? "opacity-30 grayscale cursor-not-allowed"
                  : "bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
              )}
            >
              {t('Final State', 'Estado Final')}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-8 space-y-12 bg-white dark:bg-zinc-950">
          <div className="p-8 bg-black dark:bg-zinc-900 text-white border-2 border-black dark:border-white/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center border-2 border-white dark:border-white/20">
                <Info size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-70">
                  {t('Simulation Status', 'Estado de la Simulación')}
                </p>
                <h3 className="text-2xl font-bold uppercase tracking-tight font-mono">
                  {stopReason === 'EXTINCTION' && t('Population Extinct', 'Población Extinta')}
                  {stopReason === 'COMPLETION' && t('All Challenges Survived', 'Todos los Desafíos Superados')}
                  {stopReason === 'MANUAL' && t('Simulation Terminated', 'Simulación Terminada')}
                </h3>
              </div>
            </div>
            <div className="md:text-right">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-70">
                {t('Last Challenge', 'Último Desafío')}
              </p>
              <p className="text-lg font-bold uppercase font-mono">
                {(() => {
                  const last = getChallengeForGeneration(generation, isInfinite, challengeDuration);
                  return last ? t(last.nameEn, last.nameEs) : t('None', 'Ninguno');
                })()}
              </p>
            </div>
          </div>

          {/* Time Travel Slider */}
          <div className="p-8 bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-white/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-3">
                <RotateCcw size={16} />
                {t('Time Travel Explorer', 'Explorador de Viaje en el Tiempo')}
              </h3>
              <span className="text-sm font-mono font-bold bg-black text-white px-3 py-1">
                GEN {targetGeneration} / {maxGeneration}
              </span>
            </div>
            <input 
              type="range"
              min={0}
              max={maxGeneration}
              value={targetGeneration}
              onChange={(e) => setTargetGeneration(parseInt(e.target.value))}
              className="w-full h-4 bg-zinc-300 dark:bg-zinc-700 rounded-none appearance-none cursor-pointer accent-black dark:accent-white"
            />
            <p className="text-[10px] uppercase font-bold opacity-60">
              {t('Scrub through history to view and export data from any point in the simulation.', 'Desplázate por la historia para ver y exportar datos de cualquier punto de la simulación.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-black dark:border-white/20">
            {stats.map((s, i) => (
              <div key={i} className="p-8 bg-white dark:bg-zinc-900 border border-black dark:border-white/20">
                <div className="text-black dark:text-white mb-6">{s.icon}</div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 dark:text-zinc-400 font-bold mb-2">{s.label}</p>
                <p className="text-5xl font-mono font-bold tracking-tighter">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-black dark:border-white/20">
            <div className="p-8 bg-white dark:bg-zinc-900 border border-black dark:border-white/20 h-[450px] min-h-0 min-w-0">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <Users size={16} />
                {t('Population Dynamics', 'Dinámica de Población')}
              </h3>
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="0" stroke={theme === 'dark' ? '#333' : '#ddd'} vertical={false} />
                  <XAxis dataKey="generation" stroke={theme === 'dark' ? '#888' : '#666'} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke={theme === 'dark' ? '#888' : '#666'} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#18181b' : '#fff',
                      border: theme === 'dark' ? '2px solid #3f3f46' : '2px solid #888',
                      borderRadius: '0px',
                      padding: '12px',
                      fontFamily: 'monospace',
                      color: theme === 'dark' ? '#fff' : '#000'
                    }} 
                  />
                  <Line type="stepAfter" dataKey="aliveCount" stroke={theme === 'dark' ? '#fff' : '#000'} strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-8 bg-white dark:bg-zinc-900 border border-black dark:border-white/20 h-[450px] min-h-0 min-w-0">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <Activity size={16} />
                {t('Strategy Evolution', 'Evolución de Estrategias')}
              </h3>
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="0" stroke={theme === 'dark' ? '#222' : '#eee'} vertical={false} />
                  <XAxis dataKey="generation" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#18181b' : '#fff',
                      border: theme === 'dark' ? '2px solid #3f3f46' : '2px solid #888',
                      borderRadius: '0px',
                      padding: '12px',
                      fontFamily: 'monospace',
                      color: theme === 'dark' ? '#fff' : '#000'
                    }} 
                  />
                  <Legend iconType="square" wrapperStyle={{ paddingTop: '20px', fontSize: '9px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                  {STRATEGIES.map((strategy, index) => (
                    <Line 
                      key={strategy}
                      type="monotone" 
                      dataKey={`strategies.${strategy}`} 
                      name={strategy} 
                      stroke={STRATEGY_COLORS[index % STRATEGY_COLORS.length]} 
                      strokeWidth={2} 
                      dot={false} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trait Strategy Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="p-8 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white/20">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <FileText size={16} />
                {t('Trait Strategy Guide', 'Guía de Estrategias de Rasgos')}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] uppercase font-bold">
                  <thead>
                    <tr className="border-b-2 border-black dark:border-white/20">
                      <th className="pb-4">{t('Color', 'Color')}</th>
                      <th className="pb-4">{t('Traits', 'Rasgos')}</th>
                      <th className="pb-4">{t('Strategy', 'Estrategia')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {[
                      { color: 'bg-red-500', label: t('Red', 'Rojo'), traits: t('Size, Defense', 'Tamaño, Defensa'), strategy: t('Toughness', 'Resistencia') },
                      { color: 'bg-green-500', label: t('Green', 'Verde'), traits: t('Speed, Repro', 'Velocidad, Repro'), strategy: t('Evasion', 'Evasión') },
                      { color: 'bg-blue-500', label: t('Blue', 'Azul'), traits: t('Metabolism', 'Metabolismo'), strategy: t('Efficiency', 'Eficiencia') },
                      { color: 'bg-yellow-400', label: t('Yellow', 'Amarillo'), traits: t('Size + Speed', 'Tamaño + Velocidad'), strategy: t('Agile Giants', 'Gigantes Ágiles') },
                      { color: 'bg-cyan-400', label: t('Cyan', 'Cian'), traits: t('Speed + Metabolism', 'Velocidad + Metab.'), strategy: t('Fast Burners', 'Quemadores Rápidos') },
                      { color: 'bg-fuchsia-500', label: t('Magenta', 'Magenta'), traits: t('Size + Metabolism', 'Tamaño + Metab.'), strategy: t('Tough Tanks', 'Tanques Resistentes') },
                      { color: 'bg-white border border-black dark:border-white/20', label: t('White', 'Blanco'), traits: t('Balanced', 'Equilibrado'), strategy: t('Generalists', 'Generalistas') },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td className="py-4 flex items-center gap-3">
                          <div className={cn("w-3 h-3", row.color)} />
                          {row.label}
                        </td>
                        <td className="py-4">{row.traits}</td>
                        <td className="py-4 opacity-60">{row.strategy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-8 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white/20">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <Activity size={16} />
                {t('Challenge History', 'Historial de Desafíos')}
              </h3>
              <div className="space-y-6 max-h-[350px] overflow-y-auto custom-scrollbar pr-4">
                {Array.from({ length: Math.ceil(generation / challengeDuration) }).map((_, i) => {
                  const gen = i * challengeDuration;
                  const challenge = getChallengeForGeneration(gen, isInfinite, challengeDuration);
                  if (!challenge) return null;
                  return (
                    <div key={i} className="flex gap-6 items-start pb-6 border-b border-zinc-200 dark:border-zinc-800 last:border-0">
                      <div className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-mono font-bold uppercase tracking-tighter">
                        GEN {gen}
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-tight">{t(challenge.nameEn, challenge.nameEs)}</p>
                        <p className="text-[10px] opacity-60 mt-1 leading-relaxed">{t(challenge.descriptionEn, challenge.descriptionEs)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Data Dictionary Section */}
          <div className="p-10 bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-white/20">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
              <Info size={16} />
              {t('Data Dictionary', 'Diccionario de Datos')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[
                { label: t('Size', 'Tamaño'), desc: t('Physical scale. Affects food needs and thermal resistance.', 'Escala física. Afecta necesidades de comida y resistencia térmica.') },
                { label: t('Speed', 'Velocidad'), desc: t('Movement velocity. Vital for evasion and foraging.', 'Velocidad de movimiento. Vital para evasión y búsqueda de alimento.') },
                { label: t('Metabolism', 'Metabolismo'), desc: t('Energy consumption. Low metabolism survives famines.', 'Consumo de energía. El metabolismo bajo sobrevive a hambrunas.') },
                { label: t('Defense', 'Defensa'), desc: t('Protection against predators and diseases.', 'Protección contra depredadores y enfermedades.') },
                { label: t('Reproduction', 'Reproducción'), desc: t('Likelihood of offspring. Drives population growth.', 'Probabilidad de crías. Impulsa el crecimiento poblacional.') },
                { label: t('Temp Tolerance', 'Tolerancia Temp'), desc: t('Survival in extreme climate shifts.', 'Supervivencia en cambios climáticos extremos.') },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{item.label}</p>
                  <p className="text-[10px] leading-relaxed opacity-60">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 pt-12 border-t-4 border-black dark:border-white/20">
            <button 
              onClick={onRestart}
              className="px-10 py-5 bg-black dark:bg-white text-white dark:text-black font-bold flex items-center gap-4 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all uppercase text-xs tracking-widest"
            >
              <RotateCcw size={20} />
              {t('Start New Simulation', 'Nueva Simulación')}
            </button>
            <button 
              onClick={downloadCSV}
              className="px-10 py-5 bg-white dark:bg-zinc-900 text-black dark:text-white border-2 border-black dark:border-white/20 font-bold flex items-center gap-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase text-xs tracking-widest"
            >
              <FileText size={20} />
              {t('Download CSV', 'Descargar CSV')}
            </button>
            <button 
              onClick={downloadReport}
              className="px-10 py-5 bg-white dark:bg-zinc-900 text-black dark:text-white border-2 border-black dark:border-white/20 font-bold flex items-center gap-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase text-xs tracking-widest"
            >
              <Download size={20} />
              {t('Download Report', 'Descargar Informe')}
            </button>
            <button 
              onClick={downloadImage}
              className="px-10 py-5 bg-white dark:bg-zinc-900 text-black dark:text-white border-2 border-black dark:border-white/20 font-bold flex items-center gap-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase text-xs tracking-widest"
            >
              <ImageIcon size={20} />
              {t('Save as Image', 'Guardar Imagen')}
            </button>
            <button 
              onClick={downloadNewick}
              className="px-10 py-5 bg-white dark:bg-zinc-900 text-black dark:text-white border-2 border-black dark:border-white/20 font-bold flex items-center gap-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase text-xs tracking-widest"
            >
              <Share2 size={20} />
              {t('Export Newick', 'Exportar Newick')}
            </button>
            <button 
              onClick={downloadPDF}
              className="px-10 py-5 bg-white dark:bg-zinc-900 text-black dark:text-white border-2 border-black dark:border-white/20 font-bold flex items-center gap-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase text-xs tracking-widest"
            >
              <FileText size={20} />
              {t('Download PDF Analysis', 'Descargar Análisis PDF')}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EvaluationPanel;
