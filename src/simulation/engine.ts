import { Organism, Traits, SimulationSettings, Environment, Challenge } from '../types';
import { CHALLENGES } from './challenges';

export const createInitialOrganism = (): Organism => ({
  id: Math.random().toString(36).substr(2, 9),
  parentId: null,
  generation: 0,
  traits: {
    size: 0.5,
    speed: 0.5,
    metabolism: 0.5,
    defense: 0.5,
    reproductionRate: 0.6,
    clutchSize: 0.4,
    tempTolerance: 0.5,
    foodSpecialization: 0.5,
  },
  isAlive: true,
  depth: 0,
  children: [],
});

export const mutateTraits = (parentTraits: Traits, settings: SimulationSettings): Traits => {
  const mutate = (val: number) => {
    if (Math.random() > settings.mutationRate) return val;
    const change = (Math.random() - 0.5) * 2 * settings.mutationEffect;
    return Math.max(0, Math.min(1, val + change));
  };

  return {
    size: mutate(parentTraits.size),
    speed: mutate(parentTraits.speed),
    metabolism: mutate(parentTraits.metabolism),
    defense: mutate(parentTraits.defense),
    reproductionRate: mutate(parentTraits.reproductionRate),
    clutchSize: mutate(parentTraits.clutchSize),
    tempTolerance: mutate(parentTraits.tempTolerance),
    foodSpecialization: mutate(parentTraits.foodSpecialization),
  };
};

export const calculateFitness = (
  organism: Organism,
  env: Environment,
  settings: SimulationSettings,
  populationMetrics?: { nicheDiversity: number; ecosystemHealth: number }
): { fitness: number; reasonEn: string; reasonEs: string } => {
  let fitness = 0.8; // Increased from 0.7 to ensure initial survival
  let reasonEn = 'Standard survival.';
  let reasonEs = 'Supervivencia estándar.';

  // Base environmental factors
  fitness -= settings.intrinsicMortality * 0.15; // Reduced impact
  fitness -= env.predationPressure * (1 - organism.traits.defense) * 0.25; // Reduced impact
  fitness += env.foodAvailability * (1 - organism.traits.metabolism) * 0.25; // Increased impact

  // Eco-Dynamics: Functional Synergy
  if (settings.ecoSynergy && populationMetrics) {
    // Specialized organisms (far from 0.5) benefit more from a healthy ecosystem
    const specialization = Math.abs(organism.traits.foodSpecialization - 0.5) * 2;
    const synergyBoost = populationMetrics.ecosystemHealth * settings.synergyStrength * (0.5 + specialization * 0.5);
    fitness += synergyBoost;
    
    if (synergyBoost > 0.05) {
      reasonEn = 'Thriving in a diverse ecosystem.';
      reasonEs = 'Prosperando en un ecosistema diverso.';
    }
  }

  // Challenge impact
  if (env.currentChallenge) {
    const challengeResult = env.currentChallenge.effect(organism.traits, env);
    fitness = (fitness + challengeResult.fitness) / 2;
    reasonEn = challengeResult.reasonEn;
    reasonEs = challengeResult.reasonEs;
  }

  // Random catastrophe
  if (Math.random() < settings.catastropheFrequency * 0.05) {
    fitness *= 0.1;
    reasonEn = 'Caught in a sudden catastrophe.';
    reasonEs = 'Atrapado en una catástrofe repentina.';
  }

  return { fitness, reasonEn, reasonEs };
};

export const runGeneration = (
  population: Organism[],
  settings: SimulationSettings,
  generation: number,
  environment: Environment
): Organism[] => {
  // 1. Survival Phase
  const aliveCount = population.filter(o => o.isAlive).length;
  const overcrowdingFactor = Math.max(0, (aliveCount - settings.carryingCapacity) / settings.carryingCapacity);

  // Calculate population metrics for eco-dynamics
  let populationMetrics = undefined;
  if (settings.ecoSynergy && aliveCount > 1) {
    const aliveOrgs = population.filter(o => o.isAlive);
    const avgFoodSpec = aliveOrgs.reduce((acc, o) => acc + o.traits.foodSpecialization, 0) / aliveCount;
    const variance = aliveOrgs.reduce((acc, o) => acc + Math.pow(o.traits.foodSpecialization - avgFoodSpec, 2), 0) / aliveCount;
    const nicheDiversity = Math.sqrt(variance);
    
    // Ecosystem health is high when there is high diversity (filling multiple niches)
    // We normalize nicheDiversity (max possible is 0.5 for two groups at 0 and 1)
    const ecosystemHealth = Math.min(1, nicheDiversity * 2);
    populationMetrics = { nicheDiversity, ecosystemHealth };
  }

  const updatedPopulation = population.map(org => {
    if (!org.isAlive) return org;

    const { fitness, reasonEn, reasonEs } = calculateFitness(org, environment, settings, populationMetrics);
    
    // Initial generations have a survival boost that slowly decays to ensure the lineage takes root
    const survivalBoost = Math.max(0, 0.4 * (1 - generation / 25));
    
    // Use a more graceful overcrowding penalty to prevent sudden crashes
    // As population exceeds carrying capacity, survival probability scales down
    let survivalProb = Math.max(0.05, Math.min(1, (fitness + survivalBoost) / (1 + overcrowdingFactor * 1.5)));
    
    // Strong bottleneck: decimate survival probability if bottleneck is active
    if (environment.isBottleneck) {
      survivalProb = settings.bottleneckSurvivalRate;
    }

    const currentChallengeId = environment.currentChallenge?.id;

    // Probabilistic mortality: check against survival probability
    if (Math.random() > survivalProb) {
      return {
        ...org,
        isAlive: false,
        extinctGeneration: generation,
        challengeId: currentChallengeId,
        survivalReasonEn: environment.isBottleneck ? 'Decimated by population bottleneck.' : (environment.currentChallenge ? reasonEn : (overcrowdingFactor > 0.1 ? 'Died due to overcrowding.' : 'Failed to adapt to environment.')),
        survivalReasonEs: environment.isBottleneck ? 'Diezmado por un cuello de botella poblacional.' : (environment.currentChallenge ? reasonEs : (overcrowdingFactor > 0.1 ? 'Murió debido al hacinamiento.' : 'No logró adaptarse al entorno.'))
      };
    }
    
    // If survives, store the reason and challenge ID
    return {
      ...org,
      challengeId: currentChallengeId,
      survivalReasonEn: environment.currentChallenge ? reasonEn : 'Survived the generation.',
      survivalReasonEs: environment.currentChallenge ? reasonEs : 'Sobrevivió a la generación.'
    };
  });

  // 2. Reproduction Phase
  const offspring: Organism[] = [];
  
  const finalPopulation = updatedPopulation.map(org => {
    if (!org.isAlive || org.generation !== generation) return org;
    
    // Probabilistic reproduction: reproductionRate defines the probability per trial
    // clutchSize defines the number of trials (potential offspring)
    // Reproduction is throttled by overcrowding to help stabilize population size
    let numOffspring = 0;
    const maxTrials = Math.floor(1 + org.traits.clutchSize * 7); // 1 to 8 potential offspring
    const reproductionThrottle = 1 / (1 + overcrowdingFactor * 2);
    const p = org.traits.reproductionRate * reproductionThrottle;
    
    for (let i = 0; i < maxTrials; i++) {
      if (Math.random() < p) {
        numOffspring++;
      }
    }

    // Special case for the very first organism to ensure the simulation starts
    if (generation === 0 && numOffspring === 0) {
      numOffspring = 1;
    }

    const childIds: string[] = [];

    for (let i = 0; i < numOffspring; i++) {
      const child: Organism = {
        id: Math.random().toString(36).substr(2, 9),
        parentId: org.id,
        generation: generation + 1,
        traits: mutateTraits(org.traits, settings),
        isAlive: true,
        depth: org.depth + 1,
        children: [],
      };
      childIds.push(child.id);
      offspring.push(child);
    }

    return {
      ...org,
      isAlive: false,
      children: [...org.children, ...childIds]
    };
  });

  return [...finalPopulation, ...offspring];
};

export const getChallengeForGeneration = (gen: number, isInfinite: boolean, challengeDuration: number = 10): Challenge | null => {
  if (gen < 5) return null;
  
  const cycleLength = challengeDuration + 5;
  const relativeGen = gen - 5;
  const cycleIndex = Math.floor(relativeGen / cycleLength);
  const genInCycle = relativeGen % cycleLength;
  
  if (genInCycle >= challengeDuration) {
    return null; // 5 generation gap
  }
  
  if (!isInfinite && cycleIndex >= CHALLENGES.length) {
    return null;
  }
  
  return CHALLENGES[cycleIndex % CHALLENGES.length];
};
