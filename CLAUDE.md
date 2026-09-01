# CLAUDE.md

Konferenzwebsite Editopia 2026 (IDE / Bergische Universität Wuppertal). Statisches HTML/CSS/JS ohne Build-Schritt, Deploy durch Push auf `main` via GitHub Pages (https://editopia2026.i-d-e.de).

## Invarianten

- `data/schedule.csv` ist die einzige Quelle des Programms. `schedule.js` klassifiziert Zeilen strukturell (Zeitform von Spalte 1, Leere der Spalten 2–5, Marker `Sektion`/`Call-Feld`), nie nach Inhalt oder Zeilenindex. Vertrag: `data/README.md`.
- Master der CSV ist ein Google Sheet. Direkte CSV-Edits gehen beim nächsten Export verloren, den Nutzer immer darauf hinweisen, die Änderung im Sheet nachzuziehen.
- Die rohe CSV ist öffentlich abrufbar. Keine internen Notizen hineinschreiben.
- i18n: Chrome-Texte über `data-de`/`data-en`-Attribute, Umschaltung in `main.js`/`schedule.js`/`anreise.js` jeweils lokal. Inhalte der Startseite kommen aus `data/call-for-papers-{de,en}.md`, die englische CfP-Seite `en.html` ist statisch und wird von Hand gepflegt.
- Sponsor-Credits pro Programmbalken: `CONFIG.presenters` in `schedule.js` (Label-Substring → Name, URL, Logo), bewusst im Code statt in der CSV.
- Markdown-Parser `marked` liegt fest unter `assets/js/marked.umd.js`, kein CDN.

## Prüfen

Parser-Smoke-Test ohne Browser (`schedule.js` exportiert die reinen Funktionen unter Node):

```bash
node -e "const s=require('./schedule.js'); const fs=require('fs'); console.log(s.buildModel(s.parseCsv(fs.readFileSync('data/schedule.csv','utf8'))).meta.counts)"
```

`unknown` muss 0 sein. Im Browser meldet die Konsole `[schedule]`-Warnungen für Datenqualität. Lokal ansehen nur über HTTP (`python -m http.server`), `fetch` scheitert unter `file://`.
