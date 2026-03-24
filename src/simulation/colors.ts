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

export const getTraitLegend = () => [
  { label: 'Red: Size & Defense', color: 'rgb(255, 0, 0)' },
  { label: 'Green: Speed & Reproduction', color: 'rgb(0, 255, 0)' },
  { label: 'Blue: Metabolism & Resilience', color: 'rgb(0, 0, 255)' },
  { label: 'Yellow: Size + Speed (Agile Giants)', color: 'rgb(255, 255, 0)' },
  { label: 'Cyan: Speed + Metabolism (Fast Burners)', color: 'rgb(0, 255, 255)' },
  { label: 'Magenta: Size + Metabolism (Tough Tanks)', color: 'rgb(255, 0, 255)' },
  { label: 'White: Balanced Generalist', color: 'rgb(255, 255, 255)' },
  { label: 'Mixed: Evolutionary Strategy', color: 'linear-gradient(to right, red, green, blue)' },
];
