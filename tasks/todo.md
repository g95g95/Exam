# Deploy su Render

## Todo
- [x] Aggiungere gunicorn ai requirements (server di produzione)
- [x] Creare render.yaml per configurazione servizio
- [x] Aggiornare app.py per porta dinamica ($PORT)
- [x] Commit e push delle modifiche

## Modifiche effettuate
1. **requirements.txt**: Aggiunto `gunicorn>=21.0.0`
2. **app.py**: Modificato per leggere porta da `$PORT` e bind su `0.0.0.0`
3. **render.yaml**: Nuovo file di configurazione per Render

## Istruzioni per il deploy
1. Vai su https://render.com e accedi
2. Clicca "New +" → "Web Service"
3. Collega il repository GitHub
4. Render rileverà automaticamente `render.yaml`
5. Clicca "Create Web Service"

L'app sarà disponibile su un URL tipo: `https://electoral-montecarlo.onrender.com`
