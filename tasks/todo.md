# Task: Fix UI layout and add Territorial Bonus flag

## Obiettivo
1. Fix the "Seggi per Partito/Coalizione" display - text should be readable, not overlapping
2. Add "Bonus territoriale" checkbox to each party (+20% to majoritarian component when checked)

## Piano di implementazione

### 1. Fix bar chart readability
- [ ] Investigate why text overlaps in the bar chart labels
- [ ] Adjust bar-label width or move seat count outside the bar
- [ ] Ensure coalition names display properly on one line

### 2. Add "Bonus territoriale" flag to parties
- [ ] Add `territorialBonus` property to party state in app.js
- [ ] Add checkbox UI in party card rendering
- [ ] Include territorialBonus in API request data
- [ ] Modify backend (app.py) to apply +20% to majoritarian probability for flagged parties

## File da modificare
- `static/app.js` - state, renderParties, runSimulation
- `static/styles.css` - if needed for checkbox styling
- `app.py` - simulation logic to handle territorial bonus

## Review
(da compilare dopo l'implementazione)
