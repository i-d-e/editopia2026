# CLAUDE.md

Konferenzwebsite Editopia 2026 (IDE / Bergische Universität Wuppertal). Statisches HTML/CSS/JS ohne Build-Schritt, Deploy durch Push auf `main` via GitHub Pages (https://editopia2026.i-d-e.de).

## Invarianten

- Die Konferenz hat stattgefunden, die Seite ist ein Archiv. Anmeldung, Ladeanzeige und Fehlerdialog der Programmseite sind entfernt, nicht versehentlich wieder einführen.
- Das Programm steht als Tabelle `ROWS` am Kopf von `schedule.js`, Spalten: Zeit, Nummer oder Bezeichnung, Vortragende, Titel, Dauer oder Call-Feld-Notiz, Moderation. Die frühere CSV samt Google-Sheet-Export ist entfallen.
- `schedule.js` klassifiziert Zeilen strukturell (Zeitform von Spalte 1, Leere der Spalten 2–5, Marker `Sektion`/`Call-Feld`), nie nach Inhalt oder Zeilenindex.
- i18n: Chrome-Texte über `data-de`/`data-en`-Attribute, Umschaltung in `main.js`/`schedule.js`/`anreise.js` jeweils lokal. Inhalte der Startseite kommen aus `data/call-for-papers-{de,en}.md`, die englische CfP-Seite `en.html` ist statisch und wird von Hand gepflegt.
- Sponsor-Credits pro Programmbalken: `CONFIG.presenters` in `schedule.js` (Label-Substring → Name, URL, Logo).
- Markdown-Parser `marked` liegt fest unter `assets/js/marked.umd.js`, kein CDN.

## Prüfen

Klassifikations-Smoke-Test ohne Browser (`schedule.js` exportiert `ROWS` und die reinen Funktionen unter Node):

```bash
node -e "const s=require('./schedule.js'); console.log(s.buildModel(s.ROWS).meta.counts)"
```

`unknown` muss 0 sein. Die Programmseite braucht kein `fetch` mehr und läuft auch unter `file://`; die Startseite lädt weiter ihre Markdown-Texte und braucht HTTP (`python -m http.server`).
