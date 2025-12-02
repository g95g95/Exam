# CLAUDE.md - Electoral Monte Carlo Simulator

## Project Overview
This is a Monte Carlo Electoral Simulator that models mixed electoral systems (proportional + majoritarian). It includes:
- **Backend**: Python/Flask API (`app.py`)
- **Core Logic**: `Electoral_Montecarlo.py` (MontecarloElectoral class)
- **Web Interface**: `static/` directory (HTML/JS/CSS)
- **Tests**: `testing_election.py` and `Test/` directory

## Best Practices

1. First think through the problem, read the codebase for relevant files, and write a plan to `tasks/todo.md`.
2. The plan should have a list of todo items that you can check off as you complete them.
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made.
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the `tasks/todo.md` file with a summary of the changes you made and any other relevant information.
8. DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY.
9. MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY.

## Key Files

| File | Purpose |
|------|---------|
| `Electoral_Montecarlo.py` | Core simulation engine with MontecarloElectoral class |
| `app.py` | Flask API backend with `/api/simulate` and `/api/validate` endpoints |
| `Main_Electoral.py` | CLI driver script for running simulations |
| `testing_election.py` | Pytest test suite |
| `static/index.html` | Web interface entry point |
| `static/app.js` | Frontend JavaScript logic |

## Commands

```bash
# Run tests
python -m pytest testing_election.py -v

# Start Flask server
python app.py

# Run CLI simulation
python Main_Electoral.py
```

## Architecture Notes

- The simulator uses a two-tier approach: deterministic proportional allocation + multinomial majoritarian sampling
- `MontecarloElectoral.complete_simulation(iterations, seed)` is the main simulation method
- Results are cached in `allResults` for post-processing
- The web API accepts JSON config with parties, coalitions, and electoral parameters
