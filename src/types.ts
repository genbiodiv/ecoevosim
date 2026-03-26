export enum Language {
  EN = 'EN',
  ES = 'ES'
}

export interface Traits {
  size: number;
  speed: number;
  metabolism: number;
  defense: number;
  reproductionRate: number;
  clutchSize: number; // 0 to 1 (maps to number of offspring)
  tempTolerance: number;
  foodSpecialization: number; // 0 to 1 (e.g., 0 = plants, 1 = meat)
}

export interface Organism {
  id: string;
  parentId: string | null;
  generation: number;
  traits: Traits;
  isAlive: boolean;
  extinctGeneration?: number;
  survivalReasonEn?: string;
  survivalReasonEs?: string;
  challengeId?: string;
  depth: number;
  children: string[];
}

export interface Environment {
  temperature: number; // -1 to 1
  foodAvailability: number; // 0 to 1
  predationPressure: number; // 0 to 1
  instability: number; // 0 to 1
  currentChallenge?: Challenge;
  isBottleneck?: boolean;
}

export interface Challenge {
  id: string;
  nameEn: string;
  nameEs: string;
  descriptionEn: string;
  descriptionEs: string;
  effect: (traits: Traits, env: Environment) => { fitness: number; reasonEn: string; reasonEs: string };
}

export enum SimulationView {
  TREE = 'TREE',
  POPULATION = 'POPULATION',
  MACRO = 'MACRO'
}

export interface SimulationSettings {
  mutationRate: number;
  mutationEffect: number;
  intrinsicMortality: number;
  predationPressure: number;
  foodAvailability: number;
  instability: number;
  catastropheFrequency: number;
  carryingCapacity: number;
  isInfinite: boolean;
  bottleneckSurvivalRate: number;
  challengeDuration: number;
  ecoSynergy: boolean;
  synergyStrength: number;
  baseOffspring: number;
}

export interface GenerationMetrics {
  generation: number;
  aliveCount: number;
  avgSize: number;
  avgSpeed: number;
  avgMetabolism: number;
  strategies: Record<string, number>;
  taxonomicDiversity: number;
  phylogeneticDiversity: number;
}

export enum StrategyType {
  BALANCED = 'BALANCED',
  AGGRESSIVE = 'AGGRESSIVE',
  DEFENSIVE = 'DEFENSIVE',
  EFFICIENT = 'EFFICIENT'
}

export interface SimulationState {
  generation: number;
  population: Organism[];
  history: GenerationMetrics[];
  settings: SimulationSettings;
  environment: Environment;
  selectedNodeId: string | null;
  isPaused: boolean;
  isGameOver: boolean;
  isSimulationComplete: boolean;
  stopReason: 'EXTINCTION' | 'COMPLETION' | 'MANUAL' | null;
  pendingStrategyShift: boolean;
  lastShiftGen: number;
  language: Language;
  theme: 'light' | 'dark';
  view: SimulationView;
  hideExtinct: boolean;
  isMacroView: boolean;
  showManualStrategy: boolean;
  isExtinctionAlertDismissed: boolean;
  viewedGeneration: number;
}
