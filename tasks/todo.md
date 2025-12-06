# Task: Migliorare visualizzazione risultati simulazione

## Obiettivo
Rendere la sezione risultati più informativa e visivamente accattivante con istogrammi, grafici e statistiche aggiuntive.

## Piano di implementazione

### 1. Aggiungere istogramma a barre orizzontali
- [x] Creare barre orizzontali per ogni partito/coalizione
- [x] Colorare le barre con i colori dei partiti
- [x] Mostrare il numero di seggi alla fine di ogni barra
- [x] Animare le barre al caricamento

### 2. Aggiungere grafico a torta/ciambella
- [x] Visualizzare la distribuzione complessiva dei seggi
- [x] Usare i colori dei partiti
- [x] Mostrare percentuali

### 3. Aggiungere statistiche chiave
- [x] Soglia maggioranza (50%+1)
- [x] Chi ha vinto (chi ha la maggioranza o è primo)
- [x] Margine dalla maggioranza
- [x] Totale seggi assegnati

### 4. Migliorare layout risultati
- [x] Sezione statistiche in alto
- [x] Grafico a torta a sinistra
- [x] Istogramma a destra
- [x] Mantenere card dettagliate sotto

## File modificati
- `static/app.js` - funzione `displayResults()` + nuove funzioni `generateDonutChart()`, `generateBarChart()`, `getEntityColor()`
- `static/styles.css` - ~200 righe di nuovi stili per grafici e statistiche

## Review

### Modifiche effettuate

1. **Nuove funzioni in app.js:**
   - `getEntityColor(entity)` - estrae il colore di un partito/coalizione
   - `generateDonutChart(results, totalSeats)` - genera SVG per grafico a ciambella
   - `generateBarChart(results, totalSeats, majorityThreshold)` - genera HTML per istogramma

2. **Sezione statistiche:**
   - Box "Vincitore" con indicatore se ha maggioranza assoluta
   - Box "Soglia Maggioranza" con il numero di seggi necessari
   - Box "Margine" che mostra quanti seggi sopra/sotto la maggioranza

3. **Grafici:**
   - Grafico a ciambella SVG interattivo con tooltip al hover
   - Legenda con colori e percentuali
   - Istogramma a barre orizzontali con animazione
   - Linea verticale rossa che indica la soglia maggioranza
   - Badge "Maggioranza" per chi supera la soglia

4. **Stili CSS:**
   - Layout responsive per statistiche e grafici
   - Animazioni CSS per le barre (`@keyframes growBar`)
   - Hover effects sui grafici
   - Media queries per mobile

### Note tecniche
- Nessuna libreria esterna usata (solo CSS + SVG puro)
- Codice mantenuto semplice e leggibile
- Responsive design incluso
