# Editopia 2026 — Konferenzwebsite

Website der Konferenz **Editopia** des Instituts für Dokumentologie und Editorik (IDE),
Bergische Universität Wuppertal, 2.–4. September 2026.
Statische Seite ohne Build-Schritt (reines HTML/CSS/JS), gehostet über GitHub Pages
unter **<https://editopia2026.i-d-e.de>**.

## Inhalte aktualisieren — welche Datei wofür?

| Was du ändern willst | Datei | Wirkt auf |
|---|---|---|
| **Programm / Zeitplan** (inkl. Moderationen) | [`data/schedule.csv`](data/schedule.csv), Anleitung und Spaltenschema in [`data/README.md`](data/README.md) | `/programm.html` |
| **Anmeldetext** (Rahmenprogramm, Fristen) | Abschnitt `## registration` in [`data/call-for-papers-de.md`](data/call-for-papers-de.md) / [`-en.md`](data/call-for-papers-en.md) **und** von Hand in [`en.html`](en.html) | `/` und `/en.html` |
| Startseiten-Text **deutsch** (Intro, Themenfelder, Einreichung, Fristen) | [`data/call-for-papers-de.md`](data/call-for-papers-de.md) | `/` (Ansicht DE) |
| Startseiten-Text **englisch** | [`data/call-for-papers-en.md`](data/call-for-papers-en.md) | `/` (Ansicht EN) |
| Eigenständige **englische CfP-Seite** | [`en.html`](en.html) | `/en.html` (statisch, von Hand) |
| Sponsor-Hinweis an einem Programmbalken | `presenters` in [`schedule.js`](schedule.js) | `/programm.html` |
| Impressum / Datenschutz | `index.html`, `programm.html` (Block `impressum-modal`) | alle Seiten |

Nach jeder Änderung: **committen und auf `main` pushen** — GitHub Pages veröffentlicht
automatisch (ein bis zwei Minuten).

Das Programm wird vollständig aus `data/schedule.csv` erzeugt, es muss kein Code
angefasst werden. Der komplette Ablauf (Google Sheet → CSV-Export → ersetzen →
push), das Spaltenschema und die Formatregeln stehen in
**[`data/README.md`](data/README.md)** — dort auch der Hinweis, dass die rohe CSV
öffentlich abrufbar ist.

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

## Veröffentlichen

Push auf den Branch `main` → GitHub Pages baut und veröffentlicht automatisch.
Die Domain `editopia2026.i-d-e.de` ist über die Datei [`CNAME`](CNAME) gesetzt.

## Projektstruktur (Kurzüberblick)

```
index.html              Startseite (DE/EN-Umschalter, Text aus data/*.md)
en.html                 Statische englische CfP-Seite
programm.html           Programmseite (rendert data/schedule.csv)
anreise.html            Anreise & Unterkunft (statisch, DE/EN-Blöcke)
main.js                 Lädt/parst die CfP-Markdown für index.html
schedule.js             Liest/parst schedule.csv und rendert das Programm
anreise.js              Sprachumschalter/Modal für anreise.html
styles.css              Gesamtes Design (monochrom, "Post-Digital Minimalism")
data/
  schedule.csv          Programm-Daten (einzige Quelle)
  README.md             CSV-Vertrag & Aktualisierungsregeln
  call-for-papers-*.md  Startseiten-Text DE/EN
assets/img/             Logos und Grafiken
assets/js/marked.umd.js Markdown-Parser (fest eingebunden, kein CDN)
sitemap.xml, robots.txt SEO
```

## Markdown-Parser

Die Bibliothek **marked** liegt fest im Repo unter `assets/js/marked.umd.js`
(v18.0.7, MIT) und wird bewusst nicht von einem CDN geladen, weil versionslose
CDN-Pfade in der Vergangenheit gebrochen sind. Beim Aktualisieren die Datei
ersetzen und die Startseite einmal im Browser prüfen.
