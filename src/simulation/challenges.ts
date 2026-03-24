import { Challenge, Traits, Environment } from '../types';

export const CHALLENGES: Challenge[] = [
  {
    id: 'ice_age',
    nameEn: 'Ice Age',
    nameEs: 'Edad de Hielo',
    descriptionEn: 'Temperatures plummet. Only those with high tolerance or small size survive.',
    descriptionEs: 'Las temperaturas caen en picado. Solo sobreviven aquellos con alta tolerancia o tamaño pequeño.',
    effect: (t, env) => {
      const fitness = (t.tempTolerance * 0.6) + (1 - t.size * 0.4);
      return {
        fitness,
        reasonEn: fitness > 0.5 ? 'Survived the cold with thermal resilience.' : 'Succumbed to freezing temperatures.',
        reasonEs: fitness > 0.5 ? 'Sobrevivió al frío con resiliencia térmica.' : 'Sucumbió a las temperaturas gélidas.'
      };
    }
  },
  {
    id: 'famine',
    nameEn: 'Great Famine',
    nameEs: 'Gran Hambruna',
    descriptionEn: 'Food is scarce. Low metabolism is key to survival.',
    descriptionEs: 'La comida escasea. El metabolismo bajo es clave para la supervivencia.',
    effect: (t, env) => {
      const fitness = (1 - t.metabolism * 0.8);
      return {
        fitness,
        reasonEn: fitness > 0.5 ? 'Efficient energy use saved this lineage.' : 'Starved due to high energy demands.',
        reasonEs: fitness > 0.5 ? 'El uso eficiente de energía salvó este linaje.' : 'Murió de hambre debido a las altas demandas de energía.'
      };
    }
  },
  {
    id: 'predator_boom',
    nameEn: 'Predator Explosion',
    nameEs: 'Explosión de Depredadores',
    descriptionEn: 'Predators are everywhere. Speed and defense are vital.',
    descriptionEs: 'Los depredadores están en todas partes. La velocidad y la defensa son vitales.',
    effect: (t, env) => {
      const fitness = (t.speed * 0.5 + t.defense * 0.5);
      return {
        fitness,
        reasonEn: fitness > 0.5 ? 'Evaded or defended against predators.' : 'Caught by superior predators.',
        reasonEs: fitness > 0.5 ? 'Evadió o se defendió de los depredadores.' : 'Atrapado por depredadores superiores.'
      };
    }
  },
  {
    id: 'volcanic_winter',
    nameEn: 'Volcanic Winter',
    nameEs: 'Invierno Volcánico',
    descriptionEn: 'Ash blocks the sun. Plants die. Generalists have the edge.',
    descriptionEs: 'La ceniza bloquea el sol. Las plantas mueren. Los generalistas tienen la ventaja.',
    effect: (t, env) => {
      const fitness = (1 - Math.abs(t.foodSpecialization - 0.5) * 2);
      return {
        fitness,
        reasonEn: fitness > 0.5 ? 'Adapted to varied food sources.' : 'Specialized diet led to extinction.',
        reasonEs: fitness > 0.5 ? 'Adaptado a variadas fuentes de alimento.' : 'La dieta especializada llevó a la extinción.'
      };
    }
  },
  {
    id: 'oxygen_spike',
    nameEn: 'Oxygen Spike',
    nameEs: 'Pico de Oxígeno',
    descriptionEn: 'High oxygen allows for massive growth. Large size is favored.',
    descriptionEs: 'El alto nivel de oxígeno permite un crecimiento masivo. Se favorece el tamaño grande.',
    effect: (t, env) => {
      const fitness = t.size;
      return {
        fitness,
        reasonEn: fitness > 0.5 ? 'Dominated the landscape with massive size.' : 'Outcompeted by larger organisms.',
        reasonEs: fitness > 0.5 ? 'Dominó el paisaje con un tamaño masivo.' : 'Superado por organismos más grandes.'
      };
    }
  },
  // Adding more to reach 20
  {
    id: 'desertification',
    nameEn: 'Desertification',
    nameEs: 'Desertificación',
    descriptionEn: 'Water is gone. Small size and low metabolism survive.',
    descriptionEs: 'El agua ha desaparecido. El tamaño pequeño y el metabolismo bajo sobreviven.',
    effect: (t) => ({
      fitness: (1 - t.size * 0.5) * (1 - t.metabolism * 0.5),
      reasonEn: 'Conserved water efficiently.',
      reasonEs: 'Conservó agua eficientemente.'
    })
  },
  {
    id: 'viral_outbreak',
    nameEn: 'Viral Outbreak',
    nameEs: 'Brote Viral',
    descriptionEn: 'A plague spreads. High defense (immune system) is needed.',
    descriptionEs: 'Una plaga se extiende. Se necesita una defensa alta (sistema inmunológico).',
    effect: (t) => ({
      fitness: t.defense,
      reasonEn: 'Immune system resisted the pathogen.',
      reasonEs: 'El sistema inmunológico resistió al patógeno.'
    })
  },
  {
    id: 'island_isolation',
    nameEn: 'Island Isolation',
    nameEs: 'Aislamiento en Isla',
    descriptionEn: 'Resources are limited. Smaller bodies are more efficient.',
    descriptionEs: 'Los recursos son limitados. Los cuerpos más pequeños son más eficientes.',
    effect: (t) => ({
      fitness: 1 - t.size,
      reasonEn: 'Small stature required fewer resources.',
      reasonEs: 'La estatura pequeña requirió menos recursos.'
    })
  },
  {
    id: 'rapid_warming',
    nameEn: 'Rapid Warming',
    nameEs: 'Calentamiento Rápido',
    descriptionEn: 'Heat waves strike. High temperature tolerance is a must.',
    descriptionEs: 'Oleadas de calor golpean. La tolerancia a altas temperaturas es imprescindible.',
    effect: (t) => ({
      fitness: t.tempTolerance,
      reasonEn: 'Withstood the extreme heat.',
      reasonEs: 'Soportó el calor extremo.'
    })
  },
  {
    id: 'competition_surge',
    nameEn: 'Competition Surge',
    nameEs: 'Auge de Competencia',
    descriptionEn: 'Too many species. Reproduction rate and speed win.',
    descriptionEs: 'Demasiadas especies. La tasa de reproducción y la velocidad ganan.',
    effect: (t) => ({
      fitness: (t.reproductionRate + t.speed) / 2,
      reasonEn: 'Outpaced competitors in resource gathering.',
      reasonEs: 'Superó a los competidores en la recolección de recursos.'
    })
  },
  {
    id: 'toxic_bloom',
    nameEn: 'Toxic Bloom',
    nameEs: 'Floración Tóxica',
    descriptionEn: 'Algae release toxins. High metabolism helps filter them out.',
    descriptionEs: 'Las algas liberan toxinas. El metabolismo alto ayuda a filtrarlas.',
    effect: (t) => ({
      fitness: t.metabolism,
      reasonEn: 'Metabolized toxins before they could kill.',
      reasonEs: 'Metabolizó las toxinas antes de que pudieran matar.'
    })
  },
  {
    id: 'asteroid_impact',
    nameEn: 'Asteroid Impact',
    nameEs: 'Impacto de Asteroide',
    descriptionEn: 'Catastrophic event. Pure luck and small size.',
    descriptionEs: 'Evento catastrófico. Pura suerte y tamaño pequeño.',
    effect: (t) => ({
      fitness: (1 - t.size) * 0.7 + Math.random() * 0.3,
      reasonEn: 'Survived the blast in a small niche.',
      reasonEs: 'Sobrevivió a la explosión en un pequeño nicho.'
    })
  },
  {
    id: 'flooding',
    nameEn: 'Global Flooding',
    nameEs: 'Inundación Global',
    descriptionEn: 'Land is disappearing. Speed (swimming) is useful.',
    descriptionEs: 'La tierra está desapareciendo. La velocidad (nadar) es útil.',
    effect: (t) => ({
      fitness: t.speed,
      reasonEn: 'Adapted to aquatic movement.',
      reasonEs: 'Adaptado al movimiento acuático.'
    })
  },
  {
    id: 'magnetic_shift',
    nameEn: 'Magnetic Shift',
    nameEs: 'Cambio Magnético',
    descriptionEn: 'Navigation is disrupted. Generalists survive.',
    descriptionEs: 'La navegación se interrumpe. Los generalistas sobreviven.',
    effect: (t) => ({
      fitness: 1 - Math.abs(t.foodSpecialization - 0.5),
      reasonEn: 'Found food despite disorientation.',
      reasonEs: 'Encontró comida a pesar de la desorientación.'
    })
  },
  {
    id: 'radiation_leak',
    nameEn: 'Radiation Leak',
    nameEs: 'Fuga de Radiación',
    descriptionEn: 'Mutations skyrocket. Defense is needed to survive DNA damage.',
    descriptionEs: 'Las mutaciones se disparan. Se necesita defensa para sobrevivir al daño del ADN.',
    effect: (t) => ({
      fitness: t.defense,
      reasonEn: 'DNA repair mechanisms were robust.',
      reasonEs: 'Los mecanismos de reparación del ADN eran robustos.'
    })
  },
  {
    id: 'forest_fire',
    nameEn: 'Massive Forest Fire',
    nameEs: 'Incendio Forestal Masivo',
    descriptionEn: 'Fire sweeps the land. Speed is the only way out.',
    descriptionEs: 'El fuego barre la tierra. La velocidad es la única salida.',
    effect: (t) => ({
      fitness: t.speed,
      reasonEn: 'Outran the flames.',
      reasonEs: 'Corrió más que las llamas.'
    })
  },
  {
    id: 'salinity_change',
    nameEn: 'Salinity Change',
    nameEs: 'Cambio de Salinidad',
    descriptionEn: 'Water chemistry shifts. Metabolism helps maintain balance.',
    descriptionEs: 'La química del agua cambia. El metabolismo ayuda a mantener el equilibrio.',
    effect: (t) => ({
      fitness: t.metabolism,
      reasonEn: 'Maintained internal osmotic balance.',
      reasonEs: 'Mantuvo el equilibrio osmótico interno.'
    })
  },
  {
    id: 'tectonic_uplift',
    nameEn: 'Tectonic Uplift',
    nameEs: 'Levantamiento Tectónico',
    descriptionEn: 'Mountains rise. Temperature tolerance is tested.',
    descriptionEs: 'Las montañas se elevan. Se pone a prueba la tolerancia a la temperatura.',
    effect: (t) => ({
      fitness: t.tempTolerance,
      reasonEn: 'Adapted to high-altitude cold.',
      reasonEs: 'Adaptado al frío de gran altitud.'
    })
  },
  {
    id: 'pesticide_drift',
    nameEn: 'Chemical Shift',
    nameEs: 'Cambio Químico',
    descriptionEn: 'Environment becomes toxic. Defense is key.',
    descriptionEs: 'El ambiente se vuelve tóxico. La defensa es clave.',
    effect: (t) => ({
      fitness: t.defense,
      reasonEn: 'Resisted environmental toxins.',
      reasonEs: 'Resistió las toxinas ambientales.'
    })
  },
  {
    id: 'super_predator',
    nameEn: 'Super Predator',
    nameEs: 'Súper Depredador',
    descriptionEn: 'A new apex predator arrives. Defense and speed are critical.',
    descriptionEs: 'Llega un nuevo depredador alfa. La defensa y la velocidad son críticas.',
    effect: (t) => ({
      fitness: (t.defense + t.speed) / 2,
      reasonEn: 'Avoided the ultimate hunter.',
      reasonEs: 'Evitó al cazador definitivo.'
    })
  }
];
