import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Organism, Language } from '../types';
import { getOrganismColor } from '../simulation/colors';
import { motion } from 'motion/react';
import { Plus, Minus, Maximize, Target, Settings2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface TreeProps {
  population: Organism[];
  onNodeClick: (id: string) => void;
  selectedNodeId: string | null;
  theme: 'light' | 'dark';
  isHighRes: boolean;
  resetTrigger?: number;
  hideExtinct: boolean;
  isMacroView: boolean;
  onToggleHideExtinct: () => void;
  onToggleMacroView: () => void;
  language: Language;
  viewedGeneration: number;
}

const TreeVisualization: React.FC<TreeProps> = ({ 
  population, 
  onNodeClick, 
  selectedNodeId, 
  theme, 
  isHighRes, 
  resetTrigger,
  hideExtinct,
  isMacroView,
  onToggleHideExtinct,
  onToggleMacroView,
  language,
  viewedGeneration
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const t = (en: string, es: string) => language === Language.EN ? en : es;
  const [hScale, setHScale] = useState(0.2);
  const [vScale, setVScale] = useState(0.1);
  const [showControls, setShowControls] = useState(false);

  // Memoize the processed population and hierarchy data
  const { descendants, links, virtualRootId } = React.useMemo(() => {
    if (population.length === 0) return { descendants: [] as d3.HierarchyPointNode<Organism>[], links: [] as d3.HierarchyPointLink<Organism>[], virtualRootId: "VIRTUAL_ROOT" };

    let displayPopulation = population;

    const isAliveAtViewedGen = (o: Organism) => {
      if (viewedGeneration === o.generation) return o.isAlive;
      return o.generation <= viewedGeneration && 
             (!o.extinctGeneration || o.extinctGeneration > viewedGeneration);
    };

    if (isMacroView) {
      const aliveIds = new Set<string>(population.filter(isAliveAtViewedGen).map(o => o.id));
      const hasLivingDescendant = new Set<string>();
      const idToParent = new Map<string, string | null>();
      population.forEach(o => idToParent.set(o.id, o.parentId));

      aliveIds.forEach((id: string) => {
        let current: string | null = id;
        while (current) {
          if (hasLivingDescendant.has(current)) break;
          hasLivingDescendant.add(current);
          const parentId: string | null | undefined = idToParent.get(current);
          current = parentId || null;
        }
      });
      displayPopulation = population.filter(o => isAliveAtViewedGen(o) || hasLivingDescendant.has(o.id));
    } else if (hideExtinct) {
      displayPopulation = population.filter(isAliveAtViewedGen);
    }

    if (displayPopulation.length === 0) return { descendants: [] as d3.HierarchyPointNode<Organism>[], links: [] as d3.HierarchyPointLink<Organism>[], virtualRootId: "VIRTUAL_ROOT" };

    const validIds = new Set(displayPopulation.map(d => d.id));
    const vRootId = "VIRTUAL_ROOT";
    const roots = displayPopulation.filter(d => !d.parentId || !validIds.has(d.parentId));
    
    if (roots.length === 0) return { descendants: [] as d3.HierarchyPointNode<Organism>[], links: [] as d3.HierarchyPointLink<Organism>[], virtualRootId: vRootId };

    let dataForStratify: any[] = displayPopulation;
    if (roots.length > 1) {
      dataForStratify = [
        ...displayPopulation.map(d => {
          if (!d.parentId || !validIds.has(d.parentId)) {
            return { ...d, parentId: vRootId };
          }
          return d;
        }),
        { id: vRootId, parentId: null, generation: -1, isAlive: false, traits: {} } as any
      ];
    } else {
      dataForStratify = displayPopulation.map(d => {
        if (!d.parentId || !validIds.has(d.parentId)) {
          return { ...d, parentId: null };
        }
        return d;
      });
    }

    const stratify = d3.stratify<Organism>().id(d => d.id).parentId(d => d.parentId);
    try {
      const root = stratify(dataForStratify);
      const treeLayout = d3.tree<Organism>().nodeSize([isHighRes ? 20 : 30, 120]);
      treeLayout(root);

      root.descendants().forEach(d => {
        d.x = d.x * vScale;
        d.y = d.y * hScale;
      });

      return {
        descendants: root.descendants().filter(d => d.data.id !== vRootId),
        links: root.links().filter(l => l.source.data.id !== vRootId && l.target.data.id !== vRootId),
        virtualRootId: vRootId
      };
    } catch (e) {
      console.error("Tree stratification failed", e);
      return { descendants: [] as d3.HierarchyPointNode<Organism>[], links: [] as d3.HierarchyPointLink<Organism>[], virtualRootId: vRootId };
    }
  }, [population, isMacroView, hideExtinct, isHighRes, hScale, vScale, viewedGeneration]);

  // Handle population changes for auto-fitting
  useEffect(() => {
    if (population.length > 0 && !hasInitialized) {
      handleFit();
      setHasInitialized(true);
    } else if (population.length > 0) {
      handleFit();
    }
  }, [population.length]);

  const handleFit = () => {
    if (!svgRef.current || !zoomRef.current || !containerRef.current || population.length === 0) return;
    // Fit logic is handled inside the main effect
  };

  useEffect(() => {
    if (!svgRef.current || descendants.length === 0) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.01, 20]);

    zoomRef.current = zoom;
    svg.call(zoom);

    // Links
    g.append('g')
      .attr('fill', 'none')
      .selectAll('path')
      .data(links as d3.HierarchyPointLink<Organism>[])
      .join('path')
      .attr('class', 'tree-link')
      .attr('stroke', (d: d3.HierarchyPointLink<Organism>) => getOrganismColor(d.target.data.traits))
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', isHighRes ? 2 : 3)
      .attr('d', d3.linkHorizontal<any, any>()
        .x((d: any) => d.y)
        .y((d: any) => d.x) as any
      );

    // Nodes
    const node = g.append('g')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 3)
      .selectAll('g')
      .data(descendants as d3.HierarchyPointNode<Organism>[])
      .join('g')
      .attr('class', 'tree-node')
      .attr('transform', (d: d3.HierarchyPointNode<Organism>) => `translate(${d.y},${d.x})`)
      .on('click', (event, d: d3.HierarchyPointNode<Organism>) => {
        onNodeClick(d.data.id);
      })
      .style('cursor', 'pointer');

    const isAliveAtViewedGen = (d: any) => {
      if (viewedGeneration === d.generation) return d.isAlive;
      return d.generation <= viewedGeneration && 
             (!d.extinctGeneration || d.extinctGeneration > viewedGeneration);
    };

    const getVisibility = (d: d3.HierarchyPointNode<Organism>, k: number) => {
      if (d.data.id === selectedNodeId) return true;
      if (isAliveAtViewedGen(d.data)) return true;
      const hash = d.data.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const stableRandom = (hash % 100) / 100;
      const threshold = Math.min(1, k * 2); 
      return stableRandom < threshold;
    };

    node.each(function(d: d3.HierarchyPointNode<Organism>) {
      const g = d3.select(this);
      const color = getOrganismColor(d.data.traits);
      
      if (isAliveAtViewedGen(d.data)) {
        g.append('circle')
          .attr('fill', color)
          .attr('r', d.data.id === selectedNodeId ? 6 : (isHighRes ? 4 : 6))
          .attr('stroke', d.data.id === selectedNodeId ? (theme === 'dark' ? '#fff' : '#000') : 'none')
          .attr('stroke-width', 2);
      } else {
        const size = d.data.id === selectedNodeId ? 5 : 3;
        g.append('line').attr('x1', -size).attr('y1', -size).attr('x2', size).attr('y2', size).attr('stroke', color).attr('stroke-width', 2.5);
        g.append('line').attr('x1', size).attr('y1', -size).attr('x2', -size).attr('y2', size).attr('stroke', color).attr('stroke-width', 2.5);
      }
    });

    const initialK = d3.zoomTransform(svgRef.current!).k;
    node.style('opacity', (d: d3.HierarchyPointNode<Organism>) => getVisibility(d, initialK) ? 1 : 0)
        .style('pointer-events', (d: d3.HierarchyPointNode<Organism>) => getVisibility(d, initialK) ? 'all' : 'none');
    g.selectAll('.tree-link').style('opacity', (d: any) => getVisibility(d.target, initialK) ? 1 : 0);

    zoom.on('zoom', (event) => {
      g.attr('transform', event.transform);
      const k = event.transform.k;
      node.style('opacity', (d: d3.HierarchyPointNode<Organism>) => getVisibility(d, k) ? 1 : 0)
          .style('pointer-events', (d: d3.HierarchyPointNode<Organism>) => getVisibility(d, k) ? 'all' : 'none');
      g.selectAll('.tree-link').style('opacity', (d: any) => getVisibility(d.target, k) ? 1 : 0);
    });

    node.append('text')
      .attr('dy', '0.31em')
      .attr('x', (d: d3.HierarchyPointNode<Organism>) => d.children ? -6 : 6)
      .attr('text-anchor', (d: d3.HierarchyPointNode<Organism>) => d.children ? 'end' : 'start')
      .text((d: d3.HierarchyPointNode<Organism>) => d.data.id === selectedNodeId ? `Gen ${d.data.generation}` : '')
      .attr('fill', theme === 'dark' ? '#fff' : '#000')
      .style('font-size', '10px')
      .clone(true).lower()
      .attr('stroke', theme === 'dark' ? '#000' : '#fff');

    if (descendants.length > 0) {
      if (!hasInitialized) {
        svg.call(zoom.transform, d3.zoomIdentity.translate(50, height / 2).scale(0.5));
        setHasInitialized(true);
      } else {
        const currentTransform = d3.zoomTransform(svgRef.current!);
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        descendants.forEach(d => {
          const screenX = currentTransform.k * d.y + currentTransform.x;
          const screenY = currentTransform.k * d.x + currentTransform.y;
          minX = Math.min(minX, screenX); maxX = Math.max(maxX, screenX);
          minY = Math.min(minY, screenY); maxY = Math.max(maxY, screenY);
        });
        const targetY = height / 2 - (minY + maxY - 2 * currentTransform.y) / 2;
        const targetX = width - 150 - (maxX - currentTransform.x);
        
        // Use direct call instead of transition during simulation to prevent scheduling errors
        svg.call(zoom.transform, d3.zoomIdentity.translate(targetX, targetY).scale(currentTransform.k));
      }
    }
  }, [descendants, links, selectedNodeId, theme, isHighRes, viewedGeneration]);

  const handleZoom = (factor: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, factor);
  };

  const handleReset = () => {
    if (!svgRef.current || !zoomRef.current || !containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(500).call(
      zoomRef.current.transform, 
      d3.zoomIdentity.translate(100, height / 2).scale(0.5)
    );
  };

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-transparent border-2 border-black dark:border-white/20">
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* Macro/Micro Toggle - Always Visible */}
      <div className="absolute top-4 left-4 z-20">
        <button 
          onClick={onToggleMacroView}
          className={cn(
            "w-10 h-10 flex items-center justify-center font-mono font-bold text-lg border-2 border-black dark:border-white/20 transition-all shadow-lg",
            isMacroView 
              ? "bg-black text-white dark:bg-white dark:text-black" 
              : "bg-white text-black dark:bg-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
          title={isMacroView ? t('Macroevolution View', 'Vista Macroevolutiva') : t('Microevolution View', 'Vista Microevolutiva')}
        >
          {isMacroView ? 'M' : 'm'}
        </button>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-2 right-2 flex flex-col items-end gap-2 z-20">
        <button
          onClick={() => setShowControls(!showControls)}
          className={cn(
            "p-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white/20 shadow-lg text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center gap-2 font-bold text-[9px] uppercase tracking-widest",
            showControls && "bg-black text-white dark:bg-white dark:text-black"
          )}
        >
          <Settings2 size={14} />
          <span className="hidden sm:inline">{showControls ? 'Hide' : 'Zoom'}</span>
        </button>

        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2 items-end"
          >
            {/* Independent Axis Zoom */}
            <div className="flex flex-col gap-2 p-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white/20 shadow-lg">
              <div className="space-y-1">
                <div className="flex justify-between text-[7px] uppercase tracking-widest text-black dark:text-white font-bold">
                  <span>H-Zoom</span>
                  <span>{hScale.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.1" max="10" step="0.1" 
                  value={hScale} 
                  onChange={(e) => setHScale(parseFloat(e.target.value))}
                  className="w-24 accent-black dark:accent-white h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[7px] uppercase tracking-widest text-black dark:text-white font-bold">
                  <span>V-Zoom</span>
                  <span>{vScale.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.1" max="10" step="0.1" 
                  value={vScale} 
                  onChange={(e) => setVScale(parseFloat(e.target.value))}
                  className="w-24 accent-black dark:accent-white h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-row bg-white dark:bg-zinc-900 border-2 border-black dark:border-white/20 shadow-lg overflow-hidden">
              <button 
                onClick={() => handleZoom(1.5)}
                className="p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all border-r-2 border-black dark:border-white/20 text-black dark:text-white"
              >
                <Plus size={14} />
              </button>
              <button 
                onClick={() => handleZoom(0.6)}
                className="p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all border-r-2 border-black dark:border-white/20 text-black dark:text-white"
              >
                <Minus size={14} />
              </button>
              <button 
                onClick={handleReset}
                className="p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all text-black dark:text-white"
              >
                <Target size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TreeVisualization;
