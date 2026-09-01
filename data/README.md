# Programmdaten — `schedule.csv`

`schedule.csv` ist die **einzige Quelle** für die Programmseite (`/programm.html`).
`schedule.js` liest sie clientseitig und rendert daraus das Programm. Es gibt keinen
Build-Schritt: Datei ersetzen genügt.

## Aktualisieren

1. Google Sheet bearbeiten.
2. **Datei → Herunterladen → Kommagetrennte Werte (.csv)**.
3. Heruntergeladene Datei nach `data/schedule.csv` kopieren (alte ersetzen).
4. Committen und pushen. GitHub Pages baut automatisch neu.

## ⚠️ Diese Datei ist öffentlich

Die rohe CSV ist über GitHub Pages frei abrufbar (und im `<noscript>` der Seite
direkt verlinkt). **Keine internen Notizen hineinschreiben.** Die „Call-Feld"-
Hinweise in Spalte 5 der Sektionszeilen und Klammernotizen wie `(CP: …)` werden
auf der Seite zwar *nicht angezeigt*, stehen aber trotzdem im öffentlichen Dateitext.
Solche Vermerke nur im privaten Sheet halten, nicht in der exportierten Fassung.

## Spaltenschema (feste Reihenfolge, 6 Spalten)

| Spalte | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Bedeutung | Zeit | Nr. / Label | Vortragende | Titel | Dauer | Moderation |

**Spalte 6 (Moderation)** ist optional und wirkt nur auf Sektions-, Plenums- und
Pausenzeilen: Steht dort ein Name, erscheint er auf dem jeweiligen Balken als
„Moderation:" bzw. „Chair:" in der englischen Ansicht. Bleibt die Spalte leer oder
fehlt sie ganz (ältere Exporte mit nur 5 Spalten), ändert sich nichts.

> **Wichtig:** Die Spalte muss **im Google Sheet** angelegt werden. Wird sie nur hier
> in der CSV ergänzt, ist sie beim nächsten Export wieder verschwunden.

Zeilentypen werden **strukturell** erkannt (nicht nach Inhalt):

- **Titelzeilen** (ganz oben, vor dem ersten Tag): werden ignoriert.
- **Leerzeilen**: werden übersprungen.
- **Tag** — Wochentag + Datum in Spalte 1, Spalten 2–5 leer.
  Beispiel: `Mittwoch · 02. September 2026`. Deutscher Wochentag
  (Montag … Sonntag) und `TT. Monat JJJJ` (deutscher Monatsname) liefern das
  maschinenlesbare Datum für `<time>`.
- **Sektion** — Zeitbereich in Spalte 1 + `Sektion N` in Spalte 2.
  Spalte 5 (`Call-Feld …`) wird unterdrückt. (`Section N` wird auch erkannt.)
- **Plenum / Pause** — Zeitbereich (oder `ab HH:MM`) in Spalte 1, Bezeichnung in
  Spalte 2, Spalten 3–4 leer, Spalte 5 = Dauer. **Pause**, wenn die Bezeichnung
  `Coffee Break`, `Lunch`, `Pause`, `Break` oder `Kaffeepause` enthält — sonst Plenum.
- **Vortrag** — einzelne Uhrzeit in Spalte 1, Nummer in Spalte 2, Vortragende in 3,
  Titel in 4, Dauer in 5.
- **Vortrag ohne Vortragende und Titel** → wird als „Noch offen / To be announced"
  angezeigt.

Zusätze wie ein Treffpunkt gehören einfach in die Bezeichnung der Zeile
(z. B. `Social Event · Guided City Tour · Meeting Point: …`). Sponsor-Hinweise an
Balken kommen dagegen **nicht** aus der CSV, sondern aus `presenters` in
`schedule.js`.

## Format-Regeln (die fehleranfälligen Stellen)

- **Uhrzeiten als Text `HH:MM`** (z. B. `13:00`). In Google Sheets die Zeitspalte
  auf **Format → Zahl → Nur Text** stellen, sonst macht Sheets daraus `13:00:00`
  oder eine Datums-Serie. `HH:MM:SS` wird toleriert (Sekunden werden entfernt),
  echte Datums-Serien **nicht** — solche Zeilen erscheinen dann als graue
  „nicht zugeordnet"-Zeilen.
- **Zeitbereiche** mit Bindestrich `-` oder Halbgeviertstrich `–` (beide erlaubt).
- **Tageszeilen**: Wochentag und `·`-Trenner beibehalten.
- **`Sektion N`** wörtlich lassen (englisch `Section N` wird ebenfalls erkannt).
- Mehrere Vortragende/Kommata im Feld: in Anführungszeichen setzen
  (`"Vorname Nachname, Vorname Nachname"`) — macht der Sheets-Export automatisch.

## Wenn etwas nicht passt

Nicht zuordenbare Zeilen werden als graue Zeilen mit einem Hinweisbanner angezeigt;
eine leere CSV zeigt ein Fehler-Dialog. Vor dem Veröffentlichen die Browser-Konsole
auf `[schedule]`-Warnungen prüfen (Datenqualität, nicht zugeordnete Zeilen).
