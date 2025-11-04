# -*- coding: utf-8 -*-
"""
Created on Fri Nov 15 23:30:13 2019
@author: Giulio
"""

from pathlib import Path

from Electoral_Montecarlo import MontecarloElectoral


# Initializing an object of the class
m = MontecarloElectoral()

# Filling the parameters of the class
m.import_as_txt()

# Interpreting correctly the parameter of the class
m.check_import()

# I can roughly see what happens at the end of the simulation in the stoutput
CS = m.complete_simulation()

output_path = Path('Results') / f"{m.data.name}.txt"
output_path.parent.mkdir(parents=True, exist_ok=True)
with output_path.open('w', encoding='utf-8') as f:
    print('Simulated Seats of ' + m.data.name, file=f)

    for party, seats in sorted(CS.items(), key=lambda item: item[1], reverse=True):
        # Saving the results on the txt file, ordered by seat count.
        print((party + '\t' + str(seats)), file=f)

# This is the graphic part.
try:
    m.graphic(CS)
except RuntimeError as exc:
    print(f"Skipping graphics: {exc}")


