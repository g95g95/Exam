# Party Selection Form Feature

## Todo
- [ ] Add file upload input for JSON party templates (with base64 images)
- [ ] Create party selection modal for choosing which parties to load
- [ ] Reorganize layout - move Coalitions and Unassigned Pool to top-right
- [ ] Commit and push changes

## Plan

### 1. File Upload Input
- Add a file input button next to "Carica da JSON"
- Accept `.json` files with structure: `{ parties: [{ name, symbol }] }`

### 2. Party Selection Modal
- Create a modal that pops up after loading JSON
- Show checkboxes for each party with preview (name + image)
- "Conferma" button to load selected parties

### 3. Layout Reorganization
- Change layout to have 3 columns on top row
- Move Coalitions section to top-right area
- Make the groupboxes more compact
