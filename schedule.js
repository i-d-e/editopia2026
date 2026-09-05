/**
 * Editopia 2026 - Programme / Schedule
 * Renders the conference programme from the ROWS table below. The conference
 * has taken place, so the programme is final and lives in this file; there is
 * no longer an external data source.
 *
 * Classification is schema-driven (time-shape of col1 + emptiness of cols 2-5
 * + the "Sektion"/"Call-Feld" markers), never keyed on talk content or row index.
 */
(function (root) {
    'use strict';

    // ─── Configuration ───────────────────────────────────────────────
    const CONFIG = {
        weekdays: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
        months: {
            'Januar': 1, 'Februar': 2, 'März': 3, 'April': 4, 'Mai': 5, 'Juni': 6,
            'Juli': 7, 'August': 8, 'September': 9, 'Oktober': 10, 'November': 11, 'Dezember': 12
        },
        breakLabels: ['Coffee Break', 'Lunch', 'Pause', 'Break', 'Kaffeepause'], // ci substring
        // Sponsor credit per band, matched by label substring.
        presenters: [
            { match: 'Guided City Tour', name: 'DHCraft', url: 'https://dhcraft.org/', logo: 'assets/img/dhcraft-logo.png' }
        ]
    };

    // ─── Programme data ───────────────────────────────────────────────
    // Frozen after the conference. Columns mirror the former sheet export:
    // [time, label or talk order, speaker, title, duration or call-field note, chair].
    // A row is typed by the shape of its columns (see buildModel), never by its position.
    const ROWS = [
        ["Mittwoch · 02. September 2026"],
        ["12:00–13:00", "Arrival · Welcome & Opening Remarks · Start 12:30"],
        ["13:00–14:30", "Sektion 1", "", "", "Call-Feld 3", "Patrick Sahle"],
        ["13:00", "1", "Bastian Politycki", "Editionsagenten: Wie gestalten große Sprachmodelle digitale Editionen?", "30 min"],
        ["13:30", "2", "Christopher Pollin, Elias Keyenbühl", "Agentenbasierte Editionsworkflows und epistemische Infrastrukturen. Ein Experiment zur digitalen Edition der Schriften von Jeanne Hersch", "30 min"],
        ["14:00", "3", "Tim Westphal", "Posttextuelle Schnittstellen? KI-Agenten als dialogische Zugänge zu digitalen Editionen", "30 min"],
        ["14:30–15:00", "Coffee Break", "", "", "30 min"],
        ["15:00–16:00", "Sektion 2", "", "", "Call-Feld 9", "Christopher Pollin"],
        ["15:00", "1", "Gerrit Brüning", "Postdigitale Editionen und postanaloges Edieren", "30 min"],
        ["15:30", "2", "Alice Gydé, Elena Pierazzo, Serena Crespi, Victoire Muller", "The workflow of digital critical editions", "30 min"],
        ["17:30–18:30", "Social Event · Guided City Tour Wuppertal · Meeting Point: Bus Stop Friedhofskirche", "", "", "60 min"],
        ["ab 19:00", "Informal Dinner & Networking · Restaurant Alaturka"],

        ["Donnerstag · 03. September 2026"],
        ["9:00–10:30", "Sektion 3", "", "", "Call-Feld 2", "Torsten Roeder"],
        ["9:00", "1", "Johannes Kepper", "Who's got the makings? Fluide Transkriptionen als (musik)philologische Herausforderung", "30 min"],
        ["9:30", "2", "Christian Lück", "Fluidität und Stabilität im Alignment-Graph", "30 min"],
        ["10:00", "3", "Inmaculada Ureña", "Textual fluidity and data modelling in a multilingual digital scholarly edition of Utopia", "30 min"],
        ["10:30–11:00", "Coffee Break", "", "", "30 min"],
        ["11:00–12:30", "Sektion 4", "", "", "Call-Felder 4 + 8", "Erik Renz"],
        ["11:00", "1", "Patrizia Zihlmann", "Mehr als Usability und Interface: Human Centered Design als Leitprinzip. Überlegungen zur Zukunft digitaler Editionen", "30 min"],
        ["11:30", "2", "Elias Zimmermann, Levyn Bürki", "Diskriminierung (nicht) edieren. Diskriminierungssensible Editions-Richtlinien am Beispiel der digitalen Edition Annemarie Schwarzenbach", "30 min"],
        ["12:00", "3", "Johannes Ioannu, Ruth Sander, Fernanda Wolff", "Kratzen an der Oberfläche. Barrierefreiheit als Strategie eines nachhaltigen Zugangs für Mensch und Maschine", "30 min"],
        ["12:30–14:00", "Lunch", "", "", "90 min"],
        ["14:00–15:30", "Sektion 5", "", "", "Call-Feld 5", "Fernanda Wolff"],
        ["14:00", "1", "Andreas Kuczera", "Von der digitalen zur algorithmischen Edition: Applied Text as Graph (ATAG) als Modell postdigitaler Textmodellierung", "30 min"],
        ["14:30", "2", "Daniel Stökl, Benjamin Schnabel, Anamarija Vargovic, Hayim Lapin", "MaTraDSE: Manuscript Transmogrification for Digital Scholarly Editions", "30 min"],
        ["15:00", "3", "Laura Rehberger", "Der multimediale Werkkomplex The Girl and Her Trust als postdigitales Editionsprojekt", "30 min"],
        ["15:30–16:00", "Coffee Break", "", "", "30 min"],
        ["16:00–17:30", "Sektion 6", "", "", "Call-Feld 1", "Ulrike Henny-Krahmer"],
        ["16:00", "1", "Giuseppe Arena", "Processuality, Instability, and the Ecdotic Challenge of Born-Digital Electronic Poetry", "30 min"],
        ["16:30", "2", "Elena Barchielli, Simon Willemin, Elena Spadini", "Description, edition and analysis of born-digital literary sources: case studies from the Bit Philology project", "30 min"],
        ["17:00", "3", "Emmanuela Carbé", "From Text to Event: Rethinking Scholarly Editing in Hybrid and Contemporary Archives", "30 min"],
        ["17:30–18:30", "Special Format: Fishbowl discussion with introduction", "", "", "60 min", "Georg Vogeler"],
        ["17:30", "", "Performance: Joris J. van Zundert, Aengus Ward, Andreas Kuczera, Sebastian Enns, Elisa Cugliana, Tara L. Andrews\nResponse: Patrick Sahle", "Editopia 2049"],
        ["ab 19:00", "Informal Reception"],

        ["Freitag · 04. September 2026"],
        ["9:00–10:00", "Sektion 7", "", "", "Call-Feld 6", "Elisa Cugliana"],
        ["9:00", "1", "Stefan Dumont, Tobias Kraft, Gerald Neumann, Markus Schnöpf, Christian Thomas", "Testament, Patientenverfügung, Nachlassverwaltung. Eine Bucket List zum Abschluss Digitaler Editionen am Beispiel der Berliner edition humboldt", "30 min"],
        ["09:30", "2", "Elli Bleeker, Peter Boot, Fenia Menexi", "The Modular Edition: Tracing Editorial Concepts Across Digital Edition Projects", "30 min"],
        ["10:00–10:30", "Coffee Break", "", "", "30 min"],
        ["10:30–11:30", "Sektion 8", "", "", "Call-Feld 7", "Torsten Schaßan"],
        ["10:30", "1", "Martina Scholger, Ulrike Henny-Krahmer, Torsten Roeder, Elisa Beshero-Bondar, Syd Bauman, Helena Bermúdez Sabel, Elli Bleeker, Martin Holmes, Patricia O'Connor, Joey Takeda, Raffaele Viglianti", "Towards a TEI Editopia: Visions for a Post-Digital P6 Architecture", "30 min"],
        ["11:00", "2", "Roberto Rosselli Del Turco, Chiara Martignano", "The Interface as an Epistemic Requirement: Addressing Information Overcrowding and Accessibility in EVT 3", "30 min"],
        ["11:30–12:30", "Closing Discussion & Farewell", "", "", "60 min", "Fernanda Wolff, Erik Renz"],
    ];

    // ─── Helpers + time detection ─────────────────────────────────────
    const cell = (r, i) => (r[i] || '');
    const tc = (r, i) => cell(r, i).trim();
    const isBlankRow = r => r.every(c => c.trim() === '');

    const TIME = '\\d{1,2}:\\d{2}(?::\\d{2})?'; // HH:MM, optional :SS (Sheets sometimes serialises seconds)
    // dash class accepts figure-dash, en-dash, em-dash, minus sign and hyphen (hyphen last = literal)
    const RANGE_RE = new RegExp('^\\s*' + TIME + '\\s*[\\u2012\\u2013\\u2014\\u2212-]\\s*' + TIME + '\\s*$');
    const SINGLE_RE = new RegExp('^\\s*' + TIME + '\\s*$');
    const OPEN_RE = /^\s*ab\s+\d{1,2}:\d{2}(?::\d{2})?\s*$/i; // "ab 19:00"
    const hhmm = s => s.replace(/(\d{1,2}:\d{2}):\d{2}/g, '$1'); // drop seconds for display/iso
    function timeKind(s) {
        if (RANGE_RE.test(s)) return 'range';
        if (OPEN_RE.test(s)) return 'open';
        if (SINGLE_RE.test(s)) return 'single';
        return 'none';
    }

    function parseGermanDate(label) {
        const m = label.match(/(\d{1,2})\.\s*([A-Za-zÄÖÜäöü]+)\s*(\d{4})/);
        if (!m) return null;
        const mo = CONFIG.months[m[2]];
        if (!mo) return null;
        return m[3] + '-' + String(mo).padStart(2, '0') + '-' + String(+m[1]).padStart(2, '0');
    }

    // ─── Build model from the ROWS table ──────────────────────────────
    function buildModel(rows) {
        const model = {
            meta: { rowCount: rows.length, counts: {} },
            days: []
        };
        let day = null, seenFirstDay = false, dayOrd = 0;
        const bump = k => model.meta.counts[k] = (model.meta.counts[k] || 0) + 1;

        for (let r = 0; r < rows.length; r++) {
            const row = rows[r], ln = r + 1;
            if (isBlankRow(row)) { bump('blank'); continue; }

            const c0 = tc(row, 0), c1 = tc(row, 1), c2 = tc(row, 2), c3 = tc(row, 3), c4 = tc(row, 4);
            const c5 = tc(row, 5); // optional 6th column: chair / moderation (absent in older exports)
            const tk = timeKind(c0);

            // DAY header: weekday at start AND cols 2-6 empty
            if (CONFIG.weekdays.some(w => c0.startsWith(w)) && !c1 && !c2 && !c3 && !c4 && !c5) {
                const iso = parseGermanDate(c0);
                dayOrd++;
                const parts = c0.split('·');
                day = {
                    label: c0,
                    weekday: parts[0].trim(),
                    date: parts.slice(1).join('·').trim(),
                    isoDate: iso,
                    id: iso ? 'day-' + iso : 'day-' + dayOrd,
                    items: []
                };
                model.days.push(day);
                seenFirstDay = true;
                bump('day');
                continue;
            }

            // PREAMBLE: ignore everything before the first day header (title + subtitle rows)
            if (!seenFirstDay) { bump('preamble'); continue; }

            // SECTION header: range in col1 + "Sektion/Section N" in col2 (col5 = Call-Feld note → suppressed)
            if (tk === 'range' && /^(Sektion|Section)\b/i.test(c1)) {
                const n = (c1.match(/\d+/) || [])[0];
                day.items.push({
                    kind: 'section', range: hhmm(c0), label: c1, sectionNo: n ? +n : null,
                    note: c4, moderation: c5, id: day.id + '-sec-' + (n || day.items.length)
                });
                bump('section');
                continue;
            }

            // PLENARY / BREAK: range or open time, label in col2, cols 3-4 empty
            if ((tk === 'range' || tk === 'open') && c1 && !c2 && !c3) {
                const isBreak = CONFIG.breakLabels.some(b => c1.toLowerCase().includes(b.toLowerCase()));
                const slug = c1.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24);
                const item = isBreak
                    ? { kind: 'break', range: hhmm(c0), label: c1, duration: c4, moderation: c5, id: day.id + '-brk-' + slug + '-' + day.items.length }
                    : { kind: 'plenary', range: hhmm(c0), label: c1, duration: c4, moderation: c5, accent: true, open: tk === 'open', id: day.id + '-plen-' + slug + '-' + day.items.length };
                day.items.push(item);
                bump(isBreak ? 'break' : 'plenary');
                continue;
            }

            // TALK / TBA: single time in col1
            if (tk === 'single') {
                const t = hhmm(c0);
                const iso = day.isoDate ? day.isoDate + 'T' + (t.length === 4 ? '0' + t : t) : null;
                if (!c2 && !c3) {
                    day.items.push({ kind: 'tba', time: t, isoTime: iso, order: c1, duration: c4 });
                    bump('tba');
                } else {
                    day.items.push({ kind: 'talk', time: t, isoTime: iso, order: c1, speaker: c2, title: c3, duration: c4 });
                    bump('talk');
                }
                continue;
            }

            // UNKNOWN: keep visible (muted) rather than drop silently
            day.items.push({ kind: 'unknown', raw: row.slice() });
            bump('unknown');
            console.warn('[schedule] Unclassified row ' + ln + ':', row);
        }

        ['day', 'section', 'talk', 'tba', 'break', 'plenary', 'unknown', 'blank', 'preamble']
            .forEach(k => model.meta.counts[k] = model.meta.counts[k] || 0);
        return model;
    }

    // ─── Node export guard (lets the pure classifier be unit-tested) ──
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { ROWS, timeKind, parseGermanDate, buildModel, CONFIG };
        return;
    }

    // ════════════════════════════════════════════════════════════════
    //  Browser-only below this line
    // ════════════════════════════════════════════════════════════════

    let currentLang = 'de';

    // Footer credit line carries embedded links → localized via innerHTML (parity with main.js)
    const LOCAL_ORG_HTML = {
        de: 'Lokale Organisation Bergische Universität Wuppertal: Team Digital Humanities (<a href="https://geschichte.uni-wuppertal.de/de/lehrgebiete/digital-humanities/" target="_blank" rel="noopener">DH@BUW</a>), mit Unterstützung des Interdisziplinären Zentrums für Editions- und Dokumentwissenschaft (<a href="https://www.ized.uni-wuppertal.de/" target="_blank" rel="noopener">IZED</a>).',
        en: 'Local organization University of Wuppertal: Digital Humanities Team (<a href="https://geschichte.uni-wuppertal.de/de/lehrgebiete/digital-humanities/" target="_blank" rel="noopener">DH@BUW</a>), supported by the Interdisciplinary Center for Editing and Document Studies (<a href="https://www.ized.uni-wuppertal.de/" target="_blank" rel="noopener">IZED</a>).'
    };

    // ─── DOM helpers ──────────────────────────────────────────────────
    function el(tag, className, text) {
        const e = document.createElement(tag);
        if (className) e.className = className;
        if (text != null) e.textContent = text;
        return e;
    }
    // chrome node: localizable label (data-de/data-en), default to current lang
    function chrome(tag, className, de, en) {
        const e = el(tag, className);
        e.dataset.de = de;
        e.dataset.en = en;
        e.textContent = currentLang === 'en' ? en : de;
        return e;
    }

    // ─── Renderers (createElement + textContent → XSS-safe, verbatim) ──
    function renderDay(day) {
        const sec = el('section', 'schedule-day');
        sec.setAttribute('aria-labelledby', day.id);

        const h2 = el('h2', 'sched-day');
        h2.id = day.id;
        h2.appendChild(el('span', 'sched-day-weekday', day.weekday));
        if (day.date) {
            const sep = el('span', 'sched-day-sep', ' · ');
            sep.setAttribute('aria-hidden', 'true');
            h2.appendChild(sep);
            h2.appendChild(el('span', 'sched-day-date', day.date));
        }
        sec.appendChild(h2);

        let list = null; // active <ol> for consecutive talk/tba items
        const closeList = () => { list = null; };

        for (const item of day.items) {
            if (item.kind === 'talk' || item.kind === 'tba') {
                if (!list) { list = el('ol', 'talk-list'); sec.appendChild(list); }
                list.appendChild(renderRow(item));
            } else {
                closeList();
                if (item.kind === 'section') sec.appendChild(renderSection(item));
                else if (item.kind === 'unknown') sec.appendChild(renderUnknown(item));
                else sec.appendChild(renderBand(item)); // break | plenary
            }
        }
        return sec;
    }

    function renderSection(item) {
        // Plain bar (no <section> landmark): talks are siblings, so a named <section>
        // would expose an empty region. The <h3> + following <ol> carry the structure.
        const bar = el('div', 'sched-section');
        const time = el('span', 'sched-section-time', item.range);
        time.setAttribute('aria-hidden', 'true');
        bar.appendChild(time);

        const h3 = el('h3', 'sched-section-badge');
        h3.id = item.id;
        h3.setAttribute('aria-label', item.label); // verbatim accessible name "Sektion 1"
        const word = item.label.replace(/\s*\d+\s*$/, '').trim() || item.label;
        h3.appendChild(el('span', 'sched-section-label', word));
        if (item.sectionNo != null) {
            const pipe = el('span', 'pipe', '|');
            pipe.setAttribute('aria-hidden', 'true');
            h3.appendChild(pipe);
            h3.appendChild(el('span', 'sched-section-n', String(item.sectionNo)));
        }
        bar.appendChild(h3);
        if (item.moderation) bar.appendChild(renderModeration(item.moderation, 'sched-section-mod'));
        return bar;
    }

    // Chair / moderation line, fed by the optional 6th CSV column
    function renderModeration(name, className) {
        const wrap = el('p', className);
        wrap.appendChild(chrome('span', 'sched-mod-label', 'Moderation: ', 'Chair: '));
        wrap.appendChild(document.createTextNode(name));
        return wrap;
    }

    function renderRow(item) {
        const li = el('li', 'sched-row' + (item.kind === 'tba' ? ' sched-row--tba' : ''));
        const dl = el('dl', 'sched-dl');

        // Time
        dl.appendChild(chrome('dt', 'visually-hidden', 'Uhrzeit', 'Time'));
        const ddTime = el('dd', 'sched-time');
        const t = el('time', null, item.time);
        if (item.isoTime) t.setAttribute('datetime', item.isoTime);
        ddTime.appendChild(t);
        dl.appendChild(ddTime);

        // Position / order number
        dl.appendChild(chrome('dt', 'visually-hidden', 'Position', 'Position'));
        dl.appendChild(el('dd', 'sched-no', item.order || ''));

        if (item.kind === 'tba') {
            dl.appendChild(chrome('dt', 'visually-hidden', 'Status', 'Status'));
            dl.appendChild(chrome('dd', 'sched-tba', 'Noch offen', 'To be announced'));
        } else {
            dl.appendChild(chrome('dt', 'visually-hidden', 'Vortragende', 'Speakers'));
            dl.appendChild(el('dd', 'sched-speaker', item.speaker));

            dl.appendChild(chrome('dt', 'visually-hidden', 'Titel', 'Title'));
            dl.appendChild(el('dd', 'sched-title', item.title));
        }

        // Duration
        dl.appendChild(chrome('dt', 'visually-hidden', 'Dauer', 'Duration'));
        dl.appendChild(el('dd', 'sched-dur', item.duration || ''));

        li.appendChild(dl);
        return li;
    }

    function renderBand(item) {
        const isPlen = item.kind === 'plenary';
        const div = el('div', 'sched-band ' + (isPlen ? 'sched-band--plenary' : 'sched-band--break'));
        div.setAttribute('role', 'group');
        div.setAttribute('aria-labelledby', item.id);

        const h3 = el('h3', 'sched-band-heading');
        h3.id = item.id;
        h3.appendChild(chrome('span', 'sched-band-kind visually-hidden',
            isPlen ? 'Plenum: ' : 'Pause: ', isPlen ? 'Plenary: ' : 'Break: '));
        h3.appendChild(document.createTextNode(item.label));
        const pres = CONFIG.presenters.find(p => item.label.includes(p.match));
        if (pres) h3.appendChild(renderPresenter(pres));
        div.appendChild(h3);

        const meta = el('p', 'sched-band-meta');
        meta.appendChild(el('span', 'sched-band-time', item.range));
        if (item.duration) meta.appendChild(el('span', 'sched-band-dur', ' · ' + item.duration));
        div.appendChild(meta);
        if (item.moderation) div.appendChild(renderModeration(item.moderation, 'sched-band-mod'));
        return div;
    }

    function renderPresenter(pres) {
        const a = document.createElement('a');
        a.href = pres.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.className = 'sched-presenter';
        a.setAttribute('aria-label', 'sponsored by ' + pres.name);
        const img = document.createElement('img');
        img.src = pres.logo;
        img.alt = ''; // decorative, aria-label on the link carries the name
        img.className = 'sched-presenter-logo';
        img.loading = 'lazy';
        a.appendChild(document.createTextNode('sponsored by '));
        a.appendChild(img);
        a.appendChild(document.createTextNode(pres.name));
        return a;
    }

    function renderUnknown(item) {
        return el('div', 'sched-row--unknown', item.raw.filter(Boolean).join('  ·  '));
    }

    function renderModel(model) {
        const mount = document.getElementById('schedule');
        mount.textContent = '';
        const frag = document.createDocumentFragment();

        model.days.forEach(d => frag.appendChild(renderDay(d)));
        mount.appendChild(frag);
    }

    // ─── i18n (single pass over [data-de][data-en]) ───────────────────
    function applyLang(lang) {
        currentLang = lang;
        document.documentElement.lang = lang;

        document.querySelectorAll('.lang-btn').forEach(btn => {
            const on = btn.dataset.lang === lang;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', String(on));
        });

        document.querySelectorAll('[data-de][data-en]').forEach(node => {
            node.textContent = node.dataset[lang];
        });

        // Cross-page links resolve to the matching-language target (en.html uses different anchors)
        document.querySelectorAll('[data-href-de][data-href-en]').forEach(a => {
            a.href = a.dataset[lang === 'en' ? 'hrefEn' : 'hrefDe'];
        });

        const org = document.getElementById('footer-local-org');
        if (org) org.innerHTML = LOCAL_ORG_HTML[lang];
    }

    // ─── Impressum modal (copied from main.js) ────────────────────────
    function initImpressum() {
        const btn = document.getElementById('impressum-btn');
        const modal = document.getElementById('impressum-modal');
        const close = document.getElementById('impressum-close');
        const backdrop = document.getElementById('impressum-backdrop');
        if (!btn || !modal) return;
        const open = () => { modal.hidden = false; document.body.style.overflow = 'hidden'; close.focus(); };
        const shut = () => { modal.hidden = true; document.body.style.overflow = ''; btn.focus(); };
        btn.addEventListener('click', open);
        close.addEventListener('click', shut);
        backdrop.addEventListener('click', shut);
        modal.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });
    }

    // ─── Navigation (only hijack in-page hash links) ──────────────────
    function initNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', e => {
                const href = link.getAttribute('href');
                if (!href || !href.startsWith('#')) return; // real page nav → let browser handle
                e.preventDefault();
                const target = document.getElementById(href.slice(1));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    function initLanguageSwitcher() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.lang !== currentLang) applyLang(btn.dataset.lang);
            });
        });
    }

    function initialLang() {
        try {
            const p = new URLSearchParams(window.location.search).get('lang');
            if (p === 'en' || p === 'de') return p;
            if ((window.location.hash || '').toLowerCase() === '#en') return 'en';
        } catch (e) { /* noop */ }
        return 'de';
    }

    // ─── Init ─────────────────────────────────────────────────────────
    function init() {
        currentLang = initialLang();
        initNavigation();
        initLanguageSwitcher();
        initImpressum();
        renderModel(buildModel(ROWS));
        applyLang(currentLang);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(typeof globalThis !== 'undefined' ? globalThis : this);
