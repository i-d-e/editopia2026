# Editopia 2026 — Konferenzwebsite

Website der Konferenz **Editopia** des Instituts für Dokumentologie und Editorik (IDE),
Bergische Universität Wuppertal, 2.–4. September 2026.
Statische Seite ohne Build-Schritt (reines HTML/CSS/JS), gehostet über GitHub Pages
unter **<https://editopia2026.i-d-e.de>**.

## Inhalte aktualisieren — welche Datei wofür?

| Was du ändern willst | Datei | Wirkt auf |
|---|---|---|
| **Programm / Zeitplan** (inkl. Moderationen) | Tabelle `ROWS` in [`schedule.js`](schedule.js) | `/programm.html` |
| Startseiten-Text **deutsch** (Intro, Themenfelder, Einreichung, Fristen) | [`data/call-for-papers-de.md`](data/call-for-papers-de.md) | `/` (Ansicht DE) |
| Startseiten-Text **englisch** | [`data/call-for-papers-en.md`](data/call-for-papers-en.md) | `/` (Ansicht EN) |
| Eigenständige **englische CfP-Seite** | [`en.html`](en.html) | `/en.html` (statisch, von Hand) |
| Sponsor-Hinweis an einem Programmbalken | `presenters` in [`schedule.js`](schedule.js) | `/programm.html` |
| Impressum / Datenschutz | `index.html`, `programm.html` (Block `impressum-modal`) | alle Seiten |

Nach jeder Änderung: **committen und auf `main` pushen** — GitHub Pages veröffentlicht
automatisch (ein bis zwei Minuten).

Die Konferenz hat stattgefunden. Das Programm ist abgeschlossen und steht als
Tabelle `ROWS` am Kopf von [`schedule.js`](schedule.js); die frühere CSV und ihr
Google-Sheet-Export sind entfallen. Eine Zeile hat die Spalten Zeit, Nummer oder
Bezeichnung, Vortragende, Titel, Dauer und Moderation, und wird strukturell
klassifiziert, also über die Zeitform der ersten Spalte und die Belegung der
übrigen, nicht über ihre Position. Ergänzt du eine Zeile, prüfe den Smoke-Test
aus [`CLAUDE.md`](CLAUDE.md).

## Lokal ansehen

Die Startseite lädt ihren Text per `fetch` aus `data/call-for-papers-*.md` — das
funktioniert **nur über HTTP**, nicht durch Doppelklick auf die Datei (`file://`).
Einen kleinen Webserver im Projektordner starten:

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
programm.html           Programmseite
anreise.html            Anreise & Unterkunft (statisch, DE/EN-Blöcke)
main.js                 Lädt/parst die CfP-Markdown für index.html
schedule.js             Programmdaten (ROWS) und Rendering der Programmseite
anreise.js              Sprachumschalter/Modal für anreise.html
styles.css              Gesamtes Design (monochrom, "Post-Digital Minimalism")
data/
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
