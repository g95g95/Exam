# -*- coding: utf-8 -*-
"""Utilities for running Monte Carlo simulations of electoral systems.

The module keeps the original spirit of the project – simulate the allocation of
parliamentary seats by combining proportional and majoritarian tiers – while
favouring a lightweight, dependency free implementation.  Only the optional
Excel import and plotting helpers rely on third party libraries; the simulation
core itself now uses the Python standard library which makes the code easier to
run in constrained environments.
"""

from __future__ import annotations

import math
import random
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Iterable, List, Mapping, Optional, Sequence


@dataclass
class ElectionData:
    """Container for the deterministic parameters of an election scenario."""

    name: str
    parties: List[str] = field(default_factory=list)
    proportional_shares: List[float] = field(default_factory=list)
    proportional_coefficient: float = 0.61
    majoritarian_coefficient: float = 0.37
    seats: int = 630
    majoritarian_shares: Optional[List[float]] = None

    def __post_init__(self) -> None:  # pragma: no cover - simple coercion
        self.parties = list(self.parties)
        self.proportional_shares = [float(value) for value in self.proportional_shares]
        self.proportional_coefficient = float(self.proportional_coefficient)
        self.majoritarian_coefficient = float(self.majoritarian_coefficient)
        self.seats = int(self.seats)
        if self.majoritarian_shares is not None:
            self.majoritarian_shares = [float(value) for value in self.majoritarian_shares]
        self._validate()

    # ------------------------------------------------------------------
    # Validation helpers
    # ------------------------------------------------------------------
    def validate(self) -> None:
        """Expose validation to external callers."""

        self._validate()

    def _validate(self) -> None:
        if not self.parties:
            raise ValueError("At least one party must be provided")

        if len(self.parties) != len(self.proportional_shares):
            raise ValueError("Each party must have a corresponding share value")

        if len(set(self.parties)) != len(self.parties):
            raise ValueError("Each party must have a unique name")

        if any(share < 0.0 for share in self.proportional_shares):
            raise ValueError("Vote shares cannot contain negative values")

        if not 0.0 <= self.proportional_coefficient <= 1.0:
            raise ValueError("The proportional coefficient must lie in [0, 1]")

        if not 0.0 <= self.majoritarian_coefficient <= 1.0:
            raise ValueError("The majoritarian coefficient must lie in [0, 1]")

        if self.proportional_coefficient + self.majoritarian_coefficient > 1.0:
            raise ValueError(
                "The sum of proportional and majoritarian coefficients cannot exceed one"
            )

        if self.seats <= 0:
            raise ValueError("The total number of seats must be strictly positive")


class MontecarloElectoral:
    """High level façade for simulating elections.

    Parameters
    ----------
    election:
        Human readable identifier used when plotting and reporting.
    rng:
        External pseudo random number generator.  Supplying one makes the
        simulation deterministic and eases testing.  When omitted a fresh
        :class:`random.Random` instance is created.
    """

    def __init__(
        self,
        election: str = "Italian_2018_General_Election",
        rng: Optional[random.Random] = None,
    ) -> None:
        self.data = ElectionData(
            name=election,
            parties=["Party"],
            proportional_shares=[1.0],
            proportional_coefficient=0.61,
            majoritarian_coefficient=0.37,
            seats=630,
        )
        self.results: Dict[str, float] = {"Party": 1.0}
        self.allResults: Dict[str, List[int]] = {}
        self._rng: random.Random = rng or random.Random()

    # ------------------------------------------------------------------
    # Import helpers
    # ------------------------------------------------------------------
    def import_as_excel(self, filename: str = "Elections/Election.xls") -> None:
        """Populate the internal state by parsing an Excel spreadsheet."""

        try:
            import pandas as pd  # type: ignore
        except Exception as exc:  # pragma: no cover - optional dependency
            raise RuntimeError(
                "Reading Excel files requires the optional 'pandas' dependency"
            ) from exc

        frame = pd.read_excel(filename)
        parties = list(frame.columns)
        proportional_shares = [float(frame[party].iloc[0]) for party in parties]
        proportional_coefficient = float(frame[parties[1]].iloc[1])
        majoritarian_coefficient = float(frame[parties[1]].iloc[2])
        seats = int(frame[parties[1]].iloc[3])
        election_name = str(frame[parties[1]].iloc[4])

        self._set_data(
            name=election_name,
            parties=parties,
            proportional_shares=proportional_shares,
            proportional_coefficient=proportional_coefficient,
            majoritarian_coefficient=majoritarian_coefficient,
            seats=seats,
        )

    def import_as_txt(self, filename: str = "Elections/Election.txt") -> None:
        """Populate the internal state by parsing a tab separated text file."""

        lines = [line.strip() for line in Path(filename).read_text().splitlines()]
        if len(lines) < 6:
            raise ValueError("The provided file does not contain all required entries")

        name = lines[0]
        parties = lines[1].split("\t")
        proportional_shares = [float(value) for value in lines[2].split("\t")]
        proportional_coefficient = float(lines[3].split("\t")[1])
        majoritarian_coefficient = float(lines[4].split("\t")[1])
        seats = int(float(lines[5].split("\t")[1]))

        self._set_data(
            name=name,
            parties=parties,
            proportional_shares=proportional_shares,
            proportional_coefficient=proportional_coefficient,
            majoritarian_coefficient=majoritarian_coefficient,
            seats=seats,
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def check_import(self) -> bool:
        """Return ``True`` if the current election data is self-consistent."""

        self.data.validate()

        total_share = sum(self.data.proportional_shares)
        if total_share > 1.0 + 1e-9:
            raise ValueError(
                "The sum of proportional results exceeds one; the inputs are not normalised"
            )

        self.results = dict(zip(self.data.parties, self.data.proportional_shares))
        return True

    def fill_seats(
        self,
        seed: Optional[int] = None,
        rng: Optional[random.Random] = None,
    ) -> Dict[str, int]:
        """Run a single Monte Carlo draw returning the simulated seat allocation."""

        self._ensure_loaded()
        generator = self._resolve_rng(seed=seed, rng=rng)
        seat_vector = self._simulate_single_draw(generator)
        return {
            party: seat_vector[index]
            for index, party in enumerate(self.data.parties)
        }

    def complete_simulation(
        self,
        iterations: int = 1_000,
        seed: Optional[int] = None,
    ) -> Dict[str, int]:
        """Compute the expected seat distribution by averaging many draws."""

        if iterations <= 0:
            raise ValueError("The number of iterations must be strictly positive")

        self._ensure_loaded()
        generator = self._resolve_rng(seed=seed)

        totals = [0] * len(self.data.parties)
        history = [[] for _ in self.data.parties]

        for _ in range(iterations):
            draw = self._simulate_single_draw(generator)
            for index, value in enumerate(draw):
                totals[index] += value
                history[index].append(value)

        self.allResults = {
            party: list(history[index])
            for index, party in enumerate(self.data.parties)
        }

        averaged = [int(round(total / iterations)) for total in totals]
        return {
            party: averaged[index]
            for index, party in enumerate(self.data.parties)
        }

    def graphic(
        self,
        final: Mapping[str, int],
        real_results_path: str = "Elections/Real_Election_for_Confrontation.txt",
    ) -> None:
        """Persist histograms comparing simulated and historical outcomes."""

        try:
            import matplotlib.pylab as plt  # pragma: no cover - plotting side effect
        except Exception as exc:  # pragma: no cover - optional dependency
            raise RuntimeError(
                "Generating graphics requires the optional 'matplotlib' dependency"
            ) from exc

        self._ensure_loaded()

        bin_count = max(10, min(self.data.seats, self.data.seats // 2 or 1))
        real_results = self._load_real_results(Path(real_results_path))
        final_seats = dict(final)
        avg_label_used = False
        real_label_used = False

        for party in self.data.parties:
            simulated_history = self.allResults.get(party, [])
            if not simulated_history:
                continue
            plt.hist(simulated_history, bins=bin_count, alpha=0.5, label=f"{party} (sim)")
            if final_seats:
                plt.axvline(
                    final_seats.get(party, 0),
                    color="black",
                    linewidth=1.5,
                    label=f"{party} (avg)" if not avg_label_used else None,
                )
                avg_label_used = True
            if real_results:
                plt.axvline(
                    real_results.get(party, 0),
                    linestyle="--",
                    label=f"{party} (real)" if not real_label_used else None,
                )
                real_label_used = True

        plt.xlabel("Seats")
        plt.legend(loc="upper right")
        plt.title(self.data.name)
        plt.savefig(f"Graphic/Histogram-Confrontation_for_{self.data.name}.png")
        plt.close()

        for party in self.data.parties:
            share = self.results.get(party, 0.0)
            if share < 0.05:
                continue
            simulated_history = self.allResults.get(party, [])
            if not simulated_history:
                continue
            plt.hist(simulated_history, bins=bin_count, alpha=0.5, label=party)
            if final_seats:
                plt.axvline(
                    final_seats.get(party, 0),
                    color="black",
                    linewidth=1.5,
                    label="Expected seats" if party == self.data.parties[0] else None,
                )

        plt.xlabel("Seats")
        plt.legend(loc="upper right")
        plt.savefig(f"Graphic/Numbers of possible results_for_{self.data.name}.png")
        plt.close()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _set_data(
        self,
        *,
        name: str,
        parties: Iterable[str],
        proportional_shares: Iterable[float],
        proportional_coefficient: float,
        majoritarian_coefficient: float,
        seats: int,
        majoritarian_shares: Optional[Iterable[float]] = None,
    ) -> None:
        self.data = ElectionData(
            name=name,
            parties=list(parties),
            proportional_shares=list(proportional_shares),
            proportional_coefficient=proportional_coefficient,
            majoritarian_coefficient=majoritarian_coefficient,
            seats=seats,
            majoritarian_shares=list(majoritarian_shares) if majoritarian_shares else None,
        )
        self.results = dict(zip(self.data.parties, self.data.proportional_shares))

    def _ensure_loaded(self) -> None:
        if not self.data.parties:
            raise RuntimeError("No election data loaded. Import data before simulating.")

    def _resolve_rng(
        self,
        *,
        seed: Optional[int] = None,
        rng: Optional[random.Random] = None,
    ) -> random.Random:
        if seed is not None:
            return random.Random(seed)
        if rng is not None:
            return rng
        return self._rng

    def _simulate_single_draw(self, rng: random.Random) -> List[int]:
        proportional = self._allocate_proportional_seats()
        majoritarian = self._allocate_majoritarian_seats(rng)
        return [p + m for p, m in zip(proportional, majoritarian)]

    def _allocate_proportional_seats(self) -> List[int]:
        proportional_total = int(round(self.data.seats * self.data.proportional_coefficient))
        raw_quotas = [share * proportional_total for share in self.data.proportional_shares]

        base = [int(math.floor(quota)) for quota in raw_quotas]
        assigned = sum(base)
        remainder = proportional_total - assigned

        if remainder > 0:
            fractional = [quota - floor for quota, floor in zip(raw_quotas, base)]
            order = sorted(
                range(len(self.data.parties)),
                key=lambda index: (
                    -fractional[index],
                    -self.data.proportional_shares[index],
                    index,
                ),
            )
            for index in order[:remainder]:
                base[index] += 1

        return base

    def _allocate_majoritarian_seats(self, rng: random.Random) -> List[int]:
        majoritarian_total = int(round(self.data.seats * self.data.majoritarian_coefficient))
        if majoritarian_total <= 0:
            return [0] * len(self.data.parties)

        # Use majoritarian_shares if provided, otherwise fall back to proportional_shares
        weights = self.data.majoritarian_shares if self.data.majoritarian_shares else self.data.proportional_shares

        result = [0] * len(self.data.parties)
        for _ in range(majoritarian_total):
            winner = self._weighted_choice(rng, weights)
            result[winner] += 1
        return result

    def _weighted_choice(self, rng: random.Random, weights: Sequence[float]) -> int:
        total = sum(weights)
        if total <= 0.0:
            raise ValueError("Weights must sum to a positive value")

        threshold = rng.random() * total
        cumulative = 0.0
        for index, weight in enumerate(weights):
            cumulative += weight
            if threshold <= cumulative:
                return index
        return len(weights) - 1  # pragma: no cover - guard against rounding issues

    def _load_real_results(self, path: Path) -> Dict[str, float]:
        if not path.exists():
            return {}

        lines = [line.strip() for line in path.read_text().splitlines() if line.strip()]
        if len(lines) < 2:
            return {}

        parties = lines[0].split("\t")
        seats = [float(value) for value in lines[1].split("\t")]
        return dict(zip(parties, seats))


__all__ = ["MontecarloElectoral"]
