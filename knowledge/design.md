# Designspezifikation: Editopia 2046
**Konferenz-Webseite (One-Pager)**

## 1. Design-Philosophie
**"Post-Digitaler Minimalismus"**
Das Design übersetzt klassische Ordnungssysteme (Archiv, Zettelkasten) in eine digitale Ästhetik. Es ist streng funktional, monochrom und typografie-zentriert.
* **Keywords:** Struktur, Code, Dokument, Archiv, Nüchternheit.
* **Visuelle Metapher:** Das "Container"-Prinzip (abgerundete Quadrate) und Syntax-Elemente (Pipes `|`).

---

## 2. Farbpalette
Das Farbschema ist strikt monochrom, um den Fokus auf den Inhalt zu legen.

| Farbe | Hex-Code | Verwendung |
| :--- | :--- | :--- |
| **Ink Black** | `#000000` | Haupttext, Rahmen, Logos, aktive Elemente. |
| **Paper White** | `#FFFFFF` | Hintergrund (Main), Text auf invertierten Buttons. |
| **Off-White** | `#F4F4F4` | Hintergrund (Alternativ für Sektionen), Hover-Zustände. |
| **Dim Grey** | `#888888` | Sekundärinformationen, inaktive Elemente. |

---

## 3. Typografie
Zwei Schriftarten (Fonts) bilden den Kontrast zwischen "Lesen" und "Datenverarbeitung".

### A. Primärschrift (Sans-Serif)
* **Font:** Inter, Helvetica Neue oder Roboto.
* **Einsatz:** Fließtext, Hauptüberschriften.
* **Stil:** Nüchtern, grotesk, gut lesbar.

### B. Sekundärschrift (Monospace)
* **Font:** Roboto Mono, Fira Code oder Courier Prime.
* **Einsatz:** Metadaten (Datum, Ort), Untertitel, Menüpunkte, "Code"-Elemente.
* **Stil:** Technisch, referenziert Schreibmaschinen und Quellcode.

---

## 4. UI-Komponenten (Library)

### 4.1. Der Container (The Box)
Das zentrale Gestaltungselement, abgeleitet vom Logo.
* **Form:** Quadratisch oder rechteckig mit abgerundeten Ecken.
* **CSS:** `border: 2px solid black; border-radius: 8px;` (Strichstärke variiert: 1px für fein, 3px für Bold).
* **Usage:** Umrahmt Logos, Buttons und wichtige Daten (Deadlines).

### 4.2. Der Trenner (The Pipe)
Statt Linien oder Punkten wird das Pipe-Symbol verwendet.
* **Symbol:** `|`
* **Usage:** In der Navigation (`Home | Call | Kontakt`) und im Logo (`i|d|e`).

### 4.3. Buttons
* **Default:** Transparenter Hintergrund, schwarzer Rahmen (Outline), schwarzer Text.
* **Hover:** Schwarzer Hintergrund, weißer Text (Invertierung).
* **Form:** Pill-Shape oder Rounded Box.

---

## 5. Layout-Struktur (Wireframe)

### Sektion 1: Hero (Header)
* **Zentriert:** Das modulare Logo `[e|d|i] [topia] [2046]` (Boxen nebeneinander).
* **Titel:** Groß, Sans-Serif "Zukunft von Dokumentologie..."
* **Meta:** Monospace, kleiner. "Wuppertal | 2.-4. Sept 2026".

### Sektion 2: Navigation (Sticky)
* Eine einfache Leiste am oberen Rand (beim Scrollen).
* **Items:** `[Intro]` `[Themen]` `[Deadline]` `[Kontakt]` (getrennt durch Pipes).

### Sektion 3: Content (Call for Papers)
* **Intro:** Einspaltiger Text, zentriert, max-width 700px.
* **Quote:** Die Kernfrage ("Was kommt nach...") in einem feinen Rahmen (Wireframe-Box).
* **Themenliste:**
    * Grid-Layout (2 Spalten auf Desktop).
    * Jedes Thema erhält eine "Kopfzeile" im Button-Look: `[ 01 | Das postdigitale Dokument ]`.
    * Darunter der Beschreibungstext.

### Sektion 4: Hard Facts (Call to Action)
* Visueller Bruch durch Invertierung (Schwarzer Block) oder sehr fetten Rahmen.
* **Inhalt:** Deadline, Formate, Sprachen in Monospace-Liste.
* **Button:** Groß: `[ Abstract einreichen ]` (mailto link).

### Sektion 5: Footer
* Minimalistisch.
* Logo: `i|d|e` (Wireframe-Variante).
* Copyright in Monospace.

---

## 6. Assets & Export
* **Logos:** SVG verwenden für scharfe Linien.
* **Icons:** Keine externen Icons; grafische Elemente werden durch Typografie und Rahmen erzeugt (CSS).