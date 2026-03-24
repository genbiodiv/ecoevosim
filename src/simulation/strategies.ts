import { Traits } from '../types';

export const getOrganismStrategy = (traits: Traits): string => {
  const { size, speed, metabolism, defense, reproductionRate, foodSpecialization } = traits;
  
  if (size > 0.6 && defense > 0.6) return 'Tank';
  if (speed > 0.6 && reproductionRate > 0.6) return 'Sprinter';
  if (metabolism > 0.6) return 'Active';
  if (size > 0.6) return 'Giant';
  if (defense > 0.6) return 'Shield';
  if (speed > 0.6) return 'Swift';
  if (foodSpecialization > 0.8) return 'Specialist';
  if (foodSpecialization < 0.2) return 'Generalist';
  if (reproductionRate > 0.8) return 'Breeder';
  if (defense > 0.7 && metabolism < 0.4) return 'Survivor';
  if (speed > 0.7 && size < 0.3) return 'Nomad';
  
  return 'Balanced';
};

export const STRATEGIES = ['Balanced', 'Tank', 'Sprinter', 'Active', 'Giant', 'Shield', 'Swift', 'Specialist', 'Generalist', 'Breeder', 'Survivor', 'Nomad'];
