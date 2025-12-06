# Task: Migliorare visualizzazione risultati simulazione

## Obiettivo
Rendere la sezione risultati più informativa e visivamente accattivante con istogrammi, grafici e statistiche aggiuntive.

## Piano di implementazione

### 1. Aggiungere istogramma a barre orizzontali
- [ ] Creare barre orizzontali per ogni partito/coalizione
- [ ] Colorare le barre con i colori dei partiti
- [ ] Mostrare il numero di seggi alla fine di ogni barra
- [ ] Animare le barre al caricamento

### 2. Aggiungere grafico a torta/ciambella
- [ ] Visualizzare la distribuzione complessiva dei seggi
- [ ] Usare i colori dei partiti
- [ ] Mostrare percentuali

### 3. Aggiungere statistiche chiave
- [ ] Soglia maggioranza (50%+1)
- [ ] Chi ha vinto (chi ha la maggioranza o è primo)
- [ ] Margine dalla maggioranza
- [ ] Totale seggi assegnati

### 4. Migliorare layout risultati
- [ ] Sezione statistiche in alto
- [ ] Grafico a torta a sinistra
- [ ] Istogramma a destra
- [ ] Mantenere card dettagliate sotto

## File da modificare
- `static/app.js` - funzione `displayResults()`
- `static/styles.css` - stili per grafici e statistiche

## Note
- Non uso librerie esterne (Chart.js, D3) per semplicità
- Uso CSS puro per le barre e SVG per la torta
- Manteniamo il design coerente con il resto dell'app
