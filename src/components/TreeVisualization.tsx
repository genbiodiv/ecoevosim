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

  // Handle population changes for auto-fitting
  useEffect(() => {
    if (population.length > 0 && !hasInitialized) {
      handleFit();
      setHasInitialized(true);
    } else if (population.length > 0) {
      // Auto-fit if requested or if tree is growing significantly
      // The user specifically asked for "after each generation center and adjust"
      handleFit();
    }
  }, [population.length]);

  const handleFit = () => {
    if (!svgRef.current || !zoomRef.current || !containerRef.current || population.length === 0) return;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const svg = d3.select(svgRef.current);

    // We need to calculate the bounds of the tree
    // Since we don't have the 'root' here easily without re-calculating, 
    // we can use the existing nodes in the SVG if they are already rendered,
    // but it's safer to just trigger a re-calculation or use a simplified estimate.
    
    // For now, let's use the logic from the main useEffect but exposed as a function
    // Actually, the main useEffect already has fitting logic. 
    // I'll just make sure it triggers correctly.
  };

  useEffect(() => {
    if (!svgRef.current || population.length === 0) return;
    // ... (rest of the existing useEffect)

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Use the full population provided, as pruning is now handled in App.tsx
    // This ensures the tree structure remains stable
    let displayPopulation = population;

    if (isMacroView) {
      // Macroevolution: only include organisms that are alive OR have at least one living descendant
      const aliveIds = new Set<string>(population.filter(o => o.isAlive).map(o => o.id));
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

      displayPopulation = population.filter(o => o.isAlive || hasLivingDescendant.has(o.id));
    } else if (hideExtinct) {
      // Microevolution with hideExtinct: only living organisms
      displayPopulation = population.filter(o => o.isAlive);
    }

    if (displayPopulation.length === 0) return;

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.01, 20]);

    zoomRef.current = zoom;
    svg.call(zoom);

      // Prepare data for D3 hierarchy
      // Sanitize: ensure every parentId exists in the displayPopulation
      const validIds = new Set(displayPopulation.map(d => d.id));
      const virtualRootId = "VIRTUAL_ROOT";
      
      // Check if we have multiple roots or missing parents
      const roots = displayPopulation.filter(d => !d.parentId || !validIds.has(d.parentId));
      
      if (roots.length === 0) return; // Should not happen with displayPopulation.length > 0 unless cycle

      let dataForStratify: any[] = displayPopulation;

      if (roots.length > 1) {
        // Multiple roots: connect them to a virtual root
        dataForStratify = [
          ...displayPopulation.map(d => {
            if (!d.parentId || !validIds.has(d.parentId)) {
              return { ...d, parentId: virtualRootId };
            }
            return d;
          }),
          { id: virtualRootId, parentId: null, generation: -1, isAlive: false, traits: {} } as any
        ];
      } else {
        // Single root, but might have missing parents in the middle
        dataForStratify = displayPopulation.map(d => {
          if (!d.parentId || !validIds.has(d.parentId)) {
            return { ...d, parentId: null };
          }
          return d;
        });
      }

      const stratify = d3.stratify<Organism>()
        .id(d => d.id)
        .parentId(d => d.parentId);

      try {
        const root = stratify(dataForStratify);
      
      // Tree layout with fixed node size for stability
      // This prevents the tree from squashing as it grows
      const treeLayout = d3.tree<Organism>().nodeSize([isHighRes ? 20 : 30, 120]);
      treeLayout(root);

      // Apply independent scaling to coordinates
      root.descendants().forEach(d => {
        d.x = d.x * vScale;
        d.y = d.y * hScale;
      });

      // Filter out virtual root from descendants and links for rendering
      const descendants = root.descendants().filter(d => d.data.id !== virtualRootId);
      const links = root.links().filter(l => l.source.data.id !== virtualRootId && l.target.data.id !== virtualRootId);

    // Links
    g.append('g')
      .attr('fill', 'none')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('class', 'tree-link')
      .attr('stroke', d => {
        const color = getOrganismColor(d.target.data.traits);
        return color;
      })
      .attr('stroke-opacity', 0.4) // Added alpha as requested
      .attr('stroke-width', isHighRes ? 2 : 3)
      .attr('d', d3.linkHorizontal<any, any>()
        .x(d => d.y)
        .y(d => d.x) as any
      );

    // Nodes
    const node = g.append('g')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 3)
      .selectAll('g')
      .data(descendants)
      .join('g')
      .attr('class', 'tree-node')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .on('click', (event, d) => {
        onNodeClick(d.data.id);
      })
      .style('cursor', 'pointer');

    const isAliveAtViewedGen = (d: any) => {
      // If we are viewing the current generation, use the real isAlive flag
      if (viewedGeneration === d.generation) return d.isAlive;
      // Otherwise, check if the organism was born at or before the viewed generation
      // and if it was still alive at that generation
      return d.generation <= viewedGeneration && 
             (!d.extinctGeneration || d.extinctGeneration > viewedGeneration);
    };

    // Anti-overplotting logic: Assign a stable random value to each node
    // We'll use this to filter nodes based on zoom level
    const getVisibility = (d: any, k: number) => {
      if (d.data.id === selectedNodeId) return true;
      if (isAliveAtViewedGen(d.data)) return true; // Always show alive ones? Or maybe filter them too?
      
      // Use a simple hash of the ID to get a stable random value between 0 and 1
      const hash = d.data.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const stableRandom = (hash % 100) / 100;
      
      // Threshold increases with zoom level k
      // At k=0.1 (zoomed out), show only 10% of dead nodes
      // At k=1 (normal), show all nodes
      const threshold = Math.min(1, k * 2); 
      return stableRandom < threshold;
    };

    node.each(function(d) {
      const g = d3.select(this);
      const color = getOrganismColor(d.data.traits);
      
      if (isAliveAtViewedGen(d.data)) {
        g.append('circle')
          .attr('fill', color)
          .attr('r', d.data.id === selectedNodeId ? 6 : (isHighRes ? 4 : 6))
          .attr('stroke', d.data.id === selectedNodeId ? (theme === 'dark' ? '#fff' : '#000') : 'none')
          .attr('stroke-width', 2);
      } else {
        // Draw an X for extinct organisms using their genetic color
        const size = d.data.id === selectedNodeId ? 5 : 3;
        g.append('line')
          .attr('x1', -size).attr('y1', -size)
          .attr('x2', size).attr('y2', size)
          .attr('stroke', color)
          .attr('stroke-width', 2.5);
        g.append('line')
          .attr('x1', size).attr('y1', -size)
          .attr('x2', -size).attr('y2', size)
          .attr('stroke', color)
          .attr('stroke-width', 2.5);
      }
    });

    // Initial visibility check
    const initialK = d3.zoomTransform(svgRef.current!).k;
    node.style('opacity', d => getVisibility(d, initialK) ? 1 : 0)
        .style('pointer-events', d => getVisibility(d, initialK) ? 'all' : 'none');
    g.selectAll('.tree-link').style('opacity', (d: any) => getVisibility(d.target, initialK) ? 1 : 0);

    // Update zoom behavior to include filtering
    zoom.on('zoom', (event) => {
      g.attr('transform', event.transform);
      const k = event.transform.k;
      
      // Filter nodes and links based on zoom level
      node.style('opacity', d => getVisibility(d, k) ? 1 : 0)
          .style('pointer-events', d => getVisibility(d, k) ? 'all' : 'none');
      
      g.selectAll('.tree-link')
        .style('opacity', (d: any) => getVisibility(d.target, k) ? 1 : 0);
    });

      // Labels for some nodes (e.g., roots or selected)
      node.append('text')
        .attr('dy', '0.31em')
        .attr('x', d => d.children ? -6 : 6)
        .attr('text-anchor', d => d.children ? 'end' : 'start')
        .text(d => d.data.id === selectedNodeId ? `Gen ${d.data.generation}` : '')
        .attr('fill', theme === 'dark' ? '#fff' : '#000')
        .style('font-size', '10px')
        .clone(true).lower()
        .attr('stroke', theme === 'dark' ? '#000' : '#fff');

      // Adaptive Viewport Fitting
      if (population.length > 0) {
        if (!hasInitialized) {
          // Initial setup: Calculate scale to fit the tree
          const treeWidth = root.height * 120;
          const treeHeight = (root.leaves().length || 1) * (isHighRes ? 20 : 30);
          
          const scaleX = (width - 100) / (treeWidth || 1);
          const scaleY = (height - 100) / (treeHeight || 1);
          const initialScale = Math.min(0.8, scaleX, scaleY);
          
          svg.call(zoom.transform, d3.zoomIdentity.translate(50, height / 2).scale(Math.max(0.01, initialScale)));
          setHasInitialized(true);
        } else {
          // Auto-adjust if the tree is growing or moving
          const currentTransform = d3.zoomTransform(svgRef.current!);
          
          let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
          descendants.forEach(d => {
            const screenX = currentTransform.k * d.y + currentTransform.x;
            const screenY = currentTransform.k * d.x + currentTransform.y;
            minX = Math.min(minX, screenX);
            maxX = Math.max(maxX, screenX);
            minY = Math.min(minY, screenY);
            maxY = Math.max(maxY, screenY);
          });

          // Center the tree vertically and keep the front (maxX) in view
          const targetY = height / 2 - (minY + maxY - 2 * currentTransform.y) / 2;
          const targetX = width - 150 - (maxX - currentTransform.x);

          svg.transition()
            .duration(800)
            .ease(d3.easeCubicOut)
            .call(zoom.transform, d3.zoomIdentity.translate(targetX, targetY).scale(currentTransform.k));
        }
      }

    } catch (e) {
      console.error("Tree stratification failed", e);
    }
  }, [population, selectedNodeId, theme, isHighRes, hScale, vScale]);

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
