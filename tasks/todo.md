# Party Selection Form Feature

## Todo
- [x] Add file upload input for JSON party templates (with base64 images)
- [x] Create party selection modal for choosing which parties to load
- [x] Reorganize layout - move Coalitions and Unassigned Pool to top-right
- [x] Commit and push changes

## Review

### Changes Made

1. **File Upload (index.html)**
   - Added hidden file input for `.json` files
   - Added "Carica File JSON" button

2. **Party Selection Modal (index.html + styles.css + app.js)**
   - Modal with checkboxes for each party
   - Shows party name + image/color preview
   - "Seleziona Tutti" toggle
   - Confirm/Cancel buttons

3. **Layout Reorganization (index.html + styles.css)**
   - Changed to 3-column grid layout on top row
   - Left: Configuration panel
   - Center: Summary panel
   - Right: Coalitions + Unassigned Pool (compact)
   - Removed old coalitions section from below
   - Responsive breakpoints for smaller screens

### Files Modified
- `static/index.html` - UI structure
- `static/styles.css` - Modal and layout styles
- `static/app.js` - File upload and modal logic
