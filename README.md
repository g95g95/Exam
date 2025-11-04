# Monte Carlo Electoral Simulator

This repository models mixed electoral systems—where a fraction of the
legislature is chosen proportionally and the remainder by plurality contests—by
means of a Monte Carlo procedure.  The simulator was originally designed around
the Italian 2018 general election but is now generic enough to accommodate any
scenario that can be expressed through the provided input files.

## Mathematical framework

Let $p \in [0,1]^K$ denote the national vote shares of $K$ parties such that
$\sum_{i=1}^K p_i \leq 1$ and let $N$ be the total number of seats in the
chamber.  The electoral law is parameterised by two coefficients:

* proportional component $\alpha \in [0,1]$;
* majoritarian component $\beta \in [0,1]$;

with the requirement $\alpha + \beta \leq 1$.  The simulator mirrors this
structure by splitting the seat allocation into two independent steps:

### Proportional tier

We allocate $N_\text{prop} = \lfloor \alpha N \rceil$ seats according to the
largest-remainder (Hare) method.  Defining the quotas

![equazione](https://latex.codecogs.com/svg.image?q_i%20=%20p_i%20\cdot%20N_\text{prop})

the integer part $\lfloor q_i \rfloor$ is first assigned to each party.  The
remaining seats are then distributed following the ordering induced by the
fractional parts $q_i - \lfloor q_i \rfloor$.  This produces a near-exact
discrete approximation of the continuous allocation $p_i \alpha N$ while
respecting the total number of seats.

### Majoritarian tier

For the remaining $N_\text{maj} = \lfloor \beta N \rceil$ seats we model a
sequence of Bernoulli trials whose success probabilities are proportional to the
national vote shares.  Each seat draw therefore amounts to sampling from the
multinomial distribution

\[
Y \sim \text{Multinomial}\bigl(N_\text{maj},\; (p_1, \ldots, p_K) / \sum_j p_j\bigr),
\]

which captures the intuition that stronger national performances translate into
larger odds of prevailing in single member districts.  The combined seat vector
$X = (X_1, \ldots, X_K)$ therefore arises from the sum of a deterministic
allocation (proportional tier) and a multinomially distributed random variable
(majoritarian tier).  The Monte Carlo routine repeatedly draws samples of $X$ to
approximate its expectation and empirical distribution.

## Repository layout

```
Exam/
├── Electoral_Montecarlo.py   # MontecarloElectoral class and numerical core
├── Main_Electoral.py         # Simple script wiring the workflow together
├── Elections/                # Input data (TXT/XLS) and real-election benchmarks
├── Graphic/                  # Generated histograms
├── Results/                  # Simulation summaries (written as TXT files)
├── Test/                     # Synthetic fixtures used by tests
└── testing_election.py       # Pytest suite
```

Key abstractions are implemented in `Electoral_Montecarlo.py`:

* `MontecarloElectoral.import_as_txt` / `import_as_excel` load election
  parameters.
* `check_import` validates the configuration (normalised probabilities,
  coefficients within bounds, unique party labels, etc.).
* `complete_simulation(iterations, seed)` performs repeated Monte Carlo draws,
  caches the full history in `allResults` and returns the expected seats.
* `graphic` produces comparison histograms leveraging the cached draws and, if
  available, historical seat allocations.

## Usage

1. **Prepare the inputs.** Edit `Elections/Election.txt` (or the XLS
   counterpart) with party names, proportional vote shares and coefficients. If
   you wish to compare the simulation against historical results, populate
   `Elections/Real_Election_for_Confrontation.txt` with the same ordering of
   parties.
2. **Run the driver script.** Execute `python Main_Electoral.py`.  The simulator
   itself only depends on the Python standard library; install `pandas` if you
   plan to import Excel spreadsheets and `matplotlib` to generate the optional
   histograms.  The script imports the election, runs a complete simulation with
   $N=1000$ iterations by default and exports the aggregated seats to `Results/`.
3. **Inspect artefacts.** Histograms summarising the sampling distribution and
   the real/simulated comparison are saved under `Graphic/`.

Advanced users can directly instantiate `MontecarloElectoral` to tweak the
number of iterations, plug in a custom random number generator for reproducible
experiments or post-process the raw draw history stored in
`MontecarloElectoral.allResults`.

## Reproducibility and extension points

* Passing an explicit `random.Random` instance to `MontecarloElectoral` or a
  `seed` to `complete_simulation` guarantees deterministic behaviour, making the
  simulator suitable for unit testing and scenario comparisons.
* The modular design allows the majoritarian kernel to be replaced with a more
  sophisticated district-level model (e.g. correlated Gumbel draws, covariate
  adjustments) while keeping the high-level API intact.

## Publishing the `chatGPT_Test` branch

The execution environment used to prepare these changes cannot reach your Git
remote, so the branch must be pushed from a machine that has access to the
repository.  To publish the local history under the name `chatGPT_Test`, run:

```bash
git checkout chatGPT_Test
git push origin chatGPT_Test
```

If the branch does not yet exist on the remote, the push will create it
automatically.  You can then open a pull request from `chatGPT_Test` to your
mainline branch as usual.

## License

The contents of this repository are released under the terms specified in the
original project.

