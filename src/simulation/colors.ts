import { Traits } from '../types';

/**
 * Maps organism traits to a consistent color representing its evolutionary strategy.
 * 
 * Strategy Mapping:
 * - Red Component: Physicality (Size + Defense)
 * - Green Component: Agility & Proliferation (Speed + Reproduction Rate)
 * - Blue Component: Resilience & Efficiency (Metabolism + Temp Tolerance)
 * - Food Specialization: Shifts the overall brightness/saturation
 */
export const getOrganismColor = (traits: Traits): string => {
  const r = Math.round((traits.size * 0.7 + traits.defense * 0.3) * 255);
  const g = Math.round((traits.speed * 0.7 + traits.reproductionRate * 0.3) * 255);
  const b = Math.round((traits.metabolism * 0.5 + traits.tempTolerance * 0.5) * 255);
  
  // Adjust based on food specialization (0 = plants, 1 = meat)
  // Meat eaters (1) are more saturated/vibrant, plant eaters (0) are more earthy/muted
  const saturation = 0.5 + traits.foodSpecialization * 0.5;
  
  return `rgb(${r}, ${g}, ${b})`;
};

export const getTraitLegend = (language: 'EN' | 'ES' = 'EN') => {
  const t = (en: string, es: string) => language === 'EN' ? en : es;
  return [
    { label: t('Red: Size & Defense', 'Rojo: Tamaño y Defensa'), color: 'rgb(255, 0, 0)' },
    { label: t('Green: Speed & Reproduction', 'Verde: Velocidad y Reproducción'), color: 'rgb(0, 255, 0)' },
    { label: t('Blue: Metabolism & Resilience', 'Azul: Metabolismo y Resiliencia'), color: 'rgb(0, 0, 255)' },
    { label: t('Yellow: Size + Speed (Agile Giants)', 'Amarillo: Tamaño + Velocidad (Gigantes Ágiles)'), color: 'rgb(255, 255, 0)' },
    { label: t('Cyan: Speed + Metabolism (Fast Burners)', 'Cian: Velocidad + Metabolismo (Quemadores Rápidos)'), color: 'rgb(0, 255, 255)' },
    { label: t('Magenta: Size + Metabolism (Tough Tanks)', 'Magenta: Tamaño + Metabolismo (Tanques Resistentes)'), color: 'rgb(255, 0, 255)' },
    { label: t('White: Balanced Generalist', 'Blanco: Generalista Equilibrado'), color: 'rgb(255, 255, 255)' },
    { label: t('Mixed: Evolutionary Strategy', 'Mezclado: Estrategia Evolutiva'), color: 'linear-gradient(to right, red, green, blue)' },
  ];
};
