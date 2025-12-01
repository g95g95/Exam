# Electoral Monte Carlo Simulator - Web Application

Applicazione web React/Node.js che replica la logica del simulatore Monte Carlo Python per sistemi elettorali misti (proporzionale + maggioritario).

## Architettura

```
webapp/
├── client/                 # Frontend React + Tailwind CSS
│   ├── src/
│   │   ├── components/     # Componenti React
│   │   ├── api.ts          # Client API
│   │   ├── types.ts        # TypeScript types
│   │   └── App.tsx         # Componente principale
│   └── ...
├── server/                 # Backend Express + TypeScript
│   ├── src/
│   │   ├── simulation/     # Logica Monte Carlo
│   │   ├── data/           # File JSON configurazioni
│   │   └── index.ts        # Server Express
│   └── ...
└── package.json            # Root workspace
```

## Installazione

```bash
cd webapp

# Installa tutte le dipendenze
npm run install:all

# Oppure manualmente:
npm install
cd client && npm install
cd ../server && npm install
```

## Avvio

### Sviluppo

```bash
# Avvia sia client che server in parallelo
npm run dev

# Oppure separatamente:
npm run dev:client  # http://localhost:5173
npm run dev:server  # http://localhost:3001
```

### Produzione

```bash
npm run build
npm start
```

## API Endpoints

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/elections` | Lista configurazioni elettorali disponibili |
| GET | `/api/elections/:id` | Dettaglio singola configurazione |
| POST | `/api/simulate` | Esegue simulazione Monte Carlo completa |
| POST | `/api/simulate/single` | Esegue singola estrazione |
| POST | `/api/elections/upload` | Valida configurazione custom |
| GET | `/api/health` | Health check |

## Configurazione JSON

Schieramenti e coalizioni vengono caricati da file JSON in `server/src/data/elections/`.

### Struttura file JSON

```json
{
  "election": {
    "name": "Nome Elezione",
    "seats": 630,
    "proportionalCoefficient": 0.61,
    "majoritarianCoefficient": 0.37,
    "description": "Descrizione opzionale"
  },
  "coalitions": [
    {
      "id": "cdx",
      "name": "Centrodestra",
      "shortName": "Cdx",
      "color": "#0066cc",
      "parties": ["lega", "fi", "fdi"]
    }
  ],
  "parties": [
    {
      "id": "lega",
      "name": "Lega",
      "shortName": "Lega",
      "color": "#008c45"
    }
  ],
  "defaultVoteShares": {
    "cdx": 0.375
  },
  "realResults": {
    "cdx": 263
  }
}
```

## Funzionalità

- **Simulazione Monte Carlo**: Stesso algoritmo del Python originale
  - Metodo Hare (largest-remainder) per quota proporzionale
  - Campionamento multinomiale per quota maggioritaria
- **Interfaccia interattiva**: Slider per modificare quote di voto
- **Visualizzazioni**: Grafici a barre, distribuzioni, confronti
- **Upload JSON**: Carica configurazioni personalizzate
- **Seed riproducibile**: Per risultati deterministici

## Tecnologie

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Recharts (grafici)
- Vite

### Backend
- Node.js
- Express
- TypeScript
- tsx (development)

## Licenza

Stessa licenza del progetto originale.
