# Bundesliga Tracker Cards

Lovelace-Cards fuer die Bundesliga-Tracker-Integration auf Basis von OpenLigaDB.

Aktuelle Version:

- `0.1.2`

## Was ist enthalten?

- Tabellenkarte
- Spielplankarte

Die Karten nutzen die Daten der Home-Assistant-Integration `Bundesliga Tracker`.

## Installation ueber HACS

1. In HACS zu **Custom repositories** gehen.
2. Das Repository `hathor1411/bundesliga_tracker_cards` als Typ **Dashboard** hinzufuegen.
3. Das Repository installieren.
4. Home Assistant neu laden oder neu starten.

## Karten einbinden

Die Karten werden nach der HACS-Installation ueber `/hacsfiles/` geladen.

### Loader-Datei

Die Hauptdatei, die beide Karten registriert:

```text
/hacsfiles/bundesliga_tracker_cards/dist/bundesliga_tracker_cards.js
```

### Tabellenkarte

Beispiel:

```yaml
type: custom:openligadb-table-card
entity: sensor.bundesliga_2026_table
title: Bundesliga Tabelle
```

### Spielplankarte

Beispiel:

```yaml
type: custom:openligadb-schedule-card
entity: sensor.bundesliga_2026_schedule
title: Spielplan
past_limit: 3
upcoming_limit: 5
```

## Resource-URLs

Die Karten werden aus dem `dist/`-Ordner geladen:

- `/hacsfiles/bundesliga_tracker_cards/dist/openligadb-table-card.js`
- `/hacsfiles/bundesliga_tracker_cards/dist/openligadb-schedule-card.js`

Falls Home Assistant die Karten nicht sofort im Editor findet, lade die Dashboard-Seite einmal neu.

## Hinweise

- Die Karten sind fuer die Integration `Bundesliga Tracker` gedacht.
- Die Integration muss vorher installiert und konfiguriert sein.

