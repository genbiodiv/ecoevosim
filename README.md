# ECO EVO SIM: Evolutionary Dynamics Simulator

A high-fidelity biological evolution simulator that models natural selection, genetic mutation, and phylogenetic branching in real-time.

## 🧬 Core Concepts

### 1. Biological Traits
Every organism in ECO EVO SIM is defined by a set of quantitative traits (0.0 to 1.0) that determine its fitness:
- **Size**: Influences food requirements and predation risk. Larger organisms need more food but are harder to prey upon and resist cold better.
- **Speed**: Affects the ability to escape predators and find food. Higher speed increases survival but consumes more energy.
- **Metabolism**: Determines how efficiently an organism uses energy. High metabolism allows for faster movement and reproduction but requires constant food.
- **Defense**: Physical or behavioral protections against predation (e.g., shells, camouflage).
- **Reproduction Rate**: The probability of producing offspring in a given generation.
- **Clutch Size**: The potential number of offspring (1-8) per reproduction event.
- **Temp Tolerance**: Ability to survive extreme heat or cold.
- **Food Specialization**: Generalists (0.0) can eat anything but are less efficient; Specialists (1.0) are highly efficient but restricted to specific food types.

### 2. Environmental Pressures
The environment is dynamic and exerts constant pressure:
- **Predation**: High predation favors organisms with high Speed or Defense.
- **Food Availability**: Scarcity favors low Metabolism or small Size.
- **Temperature**: Extreme temperatures favor specialized "Hardy" traits. Cold favors large size; Heat favors small size.
- **Instability**: The rate at which environmental conditions change. High instability favors generalists.
- **Carrying Capacity**: Limits the total population size, leading to intense competition and bottlenecks.

### 3. Evolutionary Strategies
Lineages can pivot their focus through periodic "Strategy Shifts":
- **Symbiosis**: Increases survival through cooperation. Works best in diverse populations (Eco-Dynamics).
- **Hardiness**: Boosts resistance to environmental extremes and food scarcity.
- **Evasion**: Maximizes Speed and camouflage to avoid predation.
- **Generalist**: A balanced approach that avoids extreme specialization, providing resilience to unpredictable changes.

### 4. Eco-Dynamics & Functional Synergy
When **Eco-Dynamics** is enabled, the simulation models ecosystem health:
- **Functional Synergy**: A diverse population (filling multiple niches) provides a survival boost to specialized organisms. This represents a stable, co-evolved food web where different species support each other's existence.

## 🚀 Key Facilities

### 1. Multi-Scale Visualization
- **Phylogeny View (The Tree):** A real-time branching tree showing the full history of life. 
  - **Macroevolution Mode:** Shows only the lineages that have surviving descendants.
  - **Microevolution Mode:** Shows every single individual that ever lived.
- **Population View:** A spatial representation of the current living generation, showing individual traits and interactions.
- **Macro View:** High-level metrics, diversity indices, and strategy distribution across the entire history.

### 2. Analytical Tools
- **Node Inspector:** Click any node in the tree to see its exact traits, its parents, and why it survived or went extinct.
- **Diversity Indices:** Track **Taxonomic Diversity** (number of distinct groups) and **Phylogenetic Diversity** (total branch length of the tree) in real-time.
- **Time Travel:** Use the history scrubber in the Evaluation Panel to revisit any point in your evolutionary timeline and see the state of the world at that moment.

### 3. Data Export & Interoperability
ECO EVO SIM is designed for research and education:
- **High-Res Images:** Export the current tree or population view as a PNG.
- **CSV Data:** Download raw population metrics for external analysis in Excel or R.
- **Newick Tree Files:** Export the phylogeny in the standard Newick format used by professional bioinformatics tools.
- **PDF Reports:** Generate a comprehensive summary of your simulation, including charts, top strategies, and evolutionary milestones.

## ⚙️ Simulation Settings

### 1. Simulation Mode
- **Standard Mode:** A curated sequence of environmental challenges (e.g., "The Great Cooling", "Predator Explosion") that tests your lineage's adaptability.
- **Infinite Mode:** Procedurally generated challenges that continue indefinitely, allowing for long-term evolutionary experiments.

### 2. Visual Quality & Performance
- **High Res:** Supports up to 3000 nodes in the phylogeny view. Provides the most detailed visual representation but requires a modern GPU/CPU.
- **Low Res:** Optimized for performance, limiting the tree to 1000 nodes. Ideal for long-running simulations or older hardware.

### 3. Population Dynamics
- **Bottleneck Survival:** Controls the severity of population crashes when carrying capacity is exceeded. A 10% survival rate creates intense selection pressure, while 50% allows for more genetic drift.
- **Min/Max Offspring:** Defines the range of potential descendants per reproduction event. High values lead to rapid population growth and increased mutation potential.

## 📊 Dashboard Metrics

- **Population:** The current count of living organisms vs. the environment's maximum capacity.
- **Extinction Rate:** The cumulative percentage of all organisms born that have failed to survive.
- **Generations:** The total number of evolutionary cycles (birth, selection, mutation) completed.
- **Diversity Index:** A measure of how varied the current population's traits are. High diversity increases ecosystem resilience.

## 🎮 How to Play
1. **Begin:** Start a new simulation from the Splash Page.
2. **Observe:** Watch the tree grow from left to right. Circles are living; X marks are extinct.
3. **Interact:** Adjust mutation rates and environmental pressures in the Controls panel.
4. **Pivot:** When prompted, choose a new Evolutionary Strategy to guide your lineage.
5. **Analyze:** Use the Evaluation Panel to review the full history of your world.

---
*Evolution is a journey of a billion small steps. Start yours today.*

