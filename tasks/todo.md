# Task: Fix UI layout and add Territorial Bonus flag

## Obiettivo
1. Fix the "Seggi per Partito/Coalizione" display - text should be readable, not overlapping
2. Add "Bonus territoriale" checkbox to each party (+20% to majoritarian component when checked)

## Piano di implementazione

### 1. Fix bar chart readability
- [x] Investigate why text overlaps in the bar chart labels
- [x] Adjust bar-label width and remove text truncation
- [x] Fix undefined cardsSection error in displayResults

### 2. Add "Bonus territoriale" flag to parties
- [x] Add `territorialBonus` property to party state in app.js
- [x] Add `updatePartyTerritorialBonus` function
- [x] Add checkbox UI in party card rendering
- [x] Add CSS styling for the checkbox
- [x] Include territorialBonus in API request data
- [x] Modify backend (app.py) to calculate majoritarian weights with +20% bonus
- [x] Modify Electoral_Montecarlo.py to support separate majoritarian_shares

## File modificati
- `static/app.js` - addParty, renderParties, runSimulation, updatePartyTerritorialBonus
- `static/styles.css` - bar-label width, party-bonus-group styles
- `app.py` - simulation logic to handle territorial bonus
- `Electoral_Montecarlo.py` - ElectionData, _set_data, _allocate_majoritarian_seats

## Review

### Modifiche effettuate

1. **Bar chart fix:**
   - Increased `.bar-label` width from 140px to 160px
   - Removed text truncation (nowrap, overflow, text-overflow)
   - Fixed bug with undefined `cardsSection` variable in displayResults

2. **Territorial Bonus - Frontend (app.js):**
   - Added `territorialBonus` property to party objects (default: false)
   - Added `updatePartyTerritorialBonus(id, checked)` function
   - Added checkbox in each party card: "Bonus territoriale (+20% magg.)"
   - Included `territorialBonus` in API request for each party

3. **Territorial Bonus - Styling (styles.css):**
   - Added `.party-bonus-group` with border separator
   - Added `.bonus-checkbox-label` styling

4. **Territorial Bonus - Backend (app.py):**
   - Calculate `majoritarian_shares` with +20% multiplier for flagged parties
   - Pass `majoritarian_shares` to simulator

5. **Territorial Bonus - Simulation (Electoral_Montecarlo.py):**
   - Added `majoritarian_shares` optional field to `ElectionData`
   - Modified `_set_data` to accept `majoritarian_shares`
   - Modified `_allocate_majoritarian_seats` to use `majoritarian_shares` when available

### Note tecniche
- The +20% bonus only affects majoritarian seat allocation (not proportional)
- If party A has 30% share with bonus, their majoritarian weight is 36%
- Works correctly with coalitions: bonus is applied per-party before coalition aggregation
