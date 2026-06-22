# Editopia 2026 — Konferenzwebsite

Website der Konferenz **Editopia** des Instituts für Dokumentologie und Editorik (IDE),
Bergische Universität Wuppertal, 2.–4. September 2026.
Statische Seite ohne Build-Schritt (reines HTML/CSS/JS), gehostet über GitHub Pages
unter **<https://editopia2026.i-d-e.de>**.

---

## Inhalte aktualisieren — welche Datei wofür?

| Was du ändern willst | Datei | Wirkt auf |
|---|---|---|
| **Programm / Zeitplan** | [`data/schedule.csv`](data/schedule.csv) | `/programm.html` |
| Startseiten-Text **deutsch** (Intro, Themenfelder, Einreichung, Fristen) | [`data/call-for-papers-de.md`](data/call-for-papers-de.md) | `/` (Ansicht DE) |
| Startseiten-Text **englisch** | [`data/call-for-papers-en.md`](data/call-for-papers-en.md) | `/` (Ansicht EN) |
| Eigenständige **englische CfP-Seite** | [`en.html`](en.html) | `/en.html` (statisch, von Hand) |
| Impressum / Datenschutz | `index.html`, `programm.html` (Block `impressum-modal`) | alle Seiten |

> **Achtung:** Die Datei `Call-for-Paper.md` im Hauptverzeichnis ist eine **alte
> Kopie und wird von der Website nicht verwendet.** Der angezeigte Text kommt aus den
> beiden Dateien unter `data/`. Nicht die falsche Datei bearbeiten.

Nach jeder Änderung: **committen und auf `main` pushen** — GitHub Pages veröffentlicht
automatisch (ein bis zwei Minuten).

---

## Das Programm aktualisieren

Das Programm wird vollständig aus **einer** Datei erzeugt: `data/schedule.csv`.
Es muss **kein Code** angefasst werden.

1. Das Google Sheet bearbeiten.
2. **Datei → Herunterladen → Kommagetrennte Werte (.csv)**.
3. Die heruntergeladene Datei nach `data/schedule.csv` kopieren (alte ersetzen).
4. Committen und pushen.

Das genaue Spaltenschema, die Formatregeln (vor allem: **Zeitspalte als Text
formatieren**) und die Hinweise zu nicht zuordenbaren Zeilen stehen in
**[`data/README.md`](data/README.md)**.

> Die rohe `schedule.csv` ist öffentlich abrufbar. Keine internen Notizen
> hineinschreiben (Details in `data/README.md`).

---

## Lokal ansehen

Die Seiten laden ihre Inhalte per `fetch` — das funktioniert **nur über HTTP**, nicht
durch Doppelklick auf die Datei (`file://`). Einen kleinen Webserver im Projektordner
starten:

```bash
python -m http.server 5501
```

Dann **<http://127.0.0.1:5501/programm.html>** im Browser öffnen.
Alternativ in VS Code die Erweiterung **Live Server** verwenden (Port 5501 ist
voreingestellt).

---

## Veröffentlichen

Push auf den Branch `main` → GitHub Pages baut und veröffentlicht automatisch.
Die Domain `editopia2026.i-d-e.de` ist über die Datei [`CNAME`](CNAME) gesetzt.

---

## Projektstruktur (Kurzüberblick)

```
index.html              Startseite (DE/EN-Umschalter, Text aus data/*.md)
en.html                 Statische englische CfP-Seite
programm.html           Programmseite (rendert data/schedule.csv)
main.js                 Lädt/parst die CfP-Markdown für index.html
schedule.js             Liest/parst schedule.csv und rendert das Programm
styles.css              Gesamtes Design (monochrom, "Post-Digital Minimalism")
data/
  schedule.csv          Programm-Daten (einzige Quelle)
  README.md             CSV-Vertrag & Aktualisierungsregeln
  call-for-papers-*.md  Startseiten-Text DE/EN
assets/img/             Logos und Grafiken
sitemap.xml, robots.txt SEO
```
