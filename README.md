# Bundesliga Tracker Cards

OpenLigaDB-basierte Lovelace-Cards fuer die Bundesliga-Tracker-Integration.

Aktuelle Version:

- `0.1.0`

## Was ist enthalten?

- Tabellenkarte
- Spielplankarte

## Installation ueber HACS

1. HACS oeffnen.
2. **Custom repositories** waehlen.
3. Das Repository `hathor1411/bundesliga_tracker_cards` als Typ **Dashboard** hinzufuegen.
4. Das Repository installieren.
5. Home Assistant neu laden oder neu starten.

## Karten einbinden

### Tabellenkarte

Resource-URL:

- `/local/community/openligadb-table-card/openligadb-table-card.js`

Beispiel:

```yaml
type: custom:openligadb-table-card
entity: sensor.bundesliga_2026_table
title: Bundesliga Tabelle
```

### Spielplankarte

Resource-URL:

- `/local/community/openligadb-schedule-card/openligadb-schedule-card.js`

Beispiel:

```yaml
type: custom:openligadb-schedule-card
entity: sensor.bundesliga_2026_schedule
title: Spielplan
past_limit: 3
upcoming_limit: 5
```

## Hinweise

- Die Karten nutzen die Sensoren der OpenLigaDB-Integration.
- Die Dateien liegen im `www/community/`-Bereich von Home Assistant nach dem Download.

