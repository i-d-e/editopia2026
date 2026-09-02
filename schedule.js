/**
 * Editopia 2026 - Programme / Schedule
 * Renders the conference programme from a single CSV (data/schedule.csv).
 * The CSV is the only source of truth: edit the Google Sheet, export as CSV,
 * replace data/schedule.csv — no code change needed.
 *
 * Classification is schema-driven (time-shape of col1 + emptiness of cols 2-5
 * + the "Sektion"/"Call-Feld" markers), never keyed on talk content or row index.
 */
(function (root) {
    'use strict';

    // ─── Configuration ───────────────────────────────────────────────
    const CONFIG = {
        csvPath: 'data/schedule.csv',
        weekdays: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
        months: {
            'Januar': 1, 'Februar': 2, 'März': 3, 'April': 4, 'Mai': 5, 'Juni': 6,
            'Juli': 7, 'August': 8, 'September': 9, 'Oktober': 10, 'November': 11, 'Dezember': 12
        },
        breakLabels: ['Coffee Break', 'Lunch', 'Pause', 'Break', 'Kaffeepause', 'Arrival', 'Ankommen'], // ci substring
        // Sponsor credit per band, matched by label substring. Lives here (not in the CSV)
        // so the sheet re-export stays untouched.
        presenters: [
            { match: 'Guided City Tour', name: 'DHCraft', url: 'https://dhcraft.org/', logo: 'assets/img/dhcraft-logo.png' }
        ]
    };

    // ─── Quote-aware CSV tokenizer (RFC-4180-ish, never throws) ───────
    // Handles quoted commas, doubled-quote "" -> ", CRLF / bare LF / lone CR,
    // UTF-8 BOM, quoted embedded newlines. Cells returned verbatim (trim later).
    function parseCsv(text) {
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
        const rows = [];
        let row = [], field = '', inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (inQuotes) {
                if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
                else field += c;
                continue;
            }
            if (c === '"') inQuotes = true;
            else if (c === ',') { row.push(field); field = ''; }
            else if (c === '\r') { if (text[i + 1] !== '\n') { row.push(field); field = ''; rows.push(row); row = []; } }
            else if (c === '\n') { row.push(field); field = ''; rows.push(row); row = []; }
            else field += c;
        }
        if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
        return rows;
    }

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

    // ─── Data-quality flags (surfaced to maintainer, never mutate content) ──
    const FLAG_RULES = [
        { reason: 'editorial-note', test: v => /\([A-ZÄÖÜ]{1,3}:\s/.test(v) },
        { reason: 'placeholder', test: v => /\bSchwebse\b/i.test(v) },
        { reason: 'tbd', test: v => /\b(TBD|TBA|t\.b\.a\.)\b/i.test(v) }
    ];
    function flagValue(model, line, value, day, field) {
        let first = null;
        for (const r of FLAG_RULES) {
            if (r.test(value)) {
                if (!first) first = r.reason;
                model.meta.flags.push({ line, field, reason: r.reason, value, day });
                console.warn('[schedule] ' + r.reason + ' at line ' + line + ' (' + field + '): "' + value + '"');
            }
        }
        return first;
    }

    // ─── Build model from parsed rows ─────────────────────────────────
    function buildModel(rows) {
        const model = {
            meta: { rowCount: rows.length, parsedAt: new Date().toISOString(), counts: {}, flags: [] },
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
                item.flag = flagValue(model, ln, c1, day.label, 'label');
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
                    const item = { kind: 'talk', time: t, isoTime: iso, order: c1, speaker: c2, title: c3, duration: c4 };
                    item.flag = flagValue(model, ln, c2, day.label, 'speaker');
                    day.items.push(item);
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

    // ─── Node export guard (lets the pure parser be unit-tested) ──────
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { parseCsv, timeKind, parseGermanDate, buildModel, CONFIG };
        return;
    }

    // ════════════════════════════════════════════════════════════════
    //  Browser-only below this line
    // ════════════════════════════════════════════════════════════════

    let currentLang = 'de';

    const ERR = {
        de: {
            http: 'Programm konnte nicht geladen werden (HTTP %s).',
            empty: 'Die Programmdatei ist leer.',
            noDays: 'Im Programm wurden keine Konferenztage gefunden. Bitte CSV-Struktur prüfen.',
            generic: 'Das Programm konnte nicht geladen werden.'
        },
        en: {
            http: 'The programme could not be loaded (HTTP %s).',
            empty: 'The programme file is empty.',
            noDays: 'No conference days found in the programme. Please check the CSV structure.',
            generic: 'The programme could not be loaded.'
        }
    };
    const fmt = (s, v) => s.replace('%s', v);

    const SCHEDULE_MSG = {
        de: { unknown: n => n + ' Zeile(n) konnten nicht zugeordnet werden – bitte CSV-Format prüfen.' },
        en: { unknown: n => n + ' row(s) could not be classified – please check the CSV format.' }
    };

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
            const ddSpk = el('dd', 'sched-speaker', item.speaker);
            if (item.flag) ddSpk.dataset.flag = item.flag;
            dl.appendChild(ddSpk);

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
        if (item.flag) h3.dataset.flag = item.flag;
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

        // On-page maintainer hint for partial corruption (re-export gone wrong) — console.warn alone is invisible to organisers
        const unknown = model.meta.counts.unknown;
        if (unknown) {
            const warn = el('p', 'schedule-warning', SCHEDULE_MSG[currentLang].unknown(unknown));
            warn.setAttribute('role', 'status');
            frag.appendChild(warn);
            console.warn('[schedule] ' + unknown + ' unclassified row(s) rendered as raw.');
        }

        model.days.forEach(d => frag.appendChild(renderDay(d)));
        mount.appendChild(frag);

        if (model.meta.flags.length) {
            console.warn('[schedule] ' + model.meta.flags.length +
                ' data-quality flag(s) — review before publishing:', model.meta.flags);
        }
        console.info('[schedule] counts', model.meta.counts);
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

    // ─── Loading / error (mirrors main.js) ────────────────────────────
    function hideLoading() {
        const loading = document.getElementById('loading');
        if (!loading) return;
        loading.classList.add('hidden');
        setTimeout(() => { loading.style.display = 'none'; }, 300);
    }
    function showError(message) {
        const sched = document.getElementById('schedule');
        if (sched) sched.textContent = ''; // clear the stale "loading…" placeholder behind the modal
        const modal = document.getElementById('error-modal');
        const msg = document.getElementById('error-message');
        if (msg) msg.textContent = message;
        if (modal) {
            modal.hidden = false;
            const retry = document.getElementById('retry-btn');
            if (retry) retry.focus();
        }
        hideLoading();
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

    // ─── Content loading ──────────────────────────────────────────────
    async function loadSchedule() {
        try {
            const res = await fetch(CONFIG.csvPath, { cache: 'no-cache' });
            if (!res.ok) throw new Error(fmt(ERR[currentLang].http, res.status));
            const text = await res.text();
            if (!text || !text.trim()) throw new Error(ERR[currentLang].empty);

            const model = buildModel(parseCsv(text));
            if (!model.days.length || !model.days.some(d => d.items.length)) {
                throw new Error(ERR[currentLang].noDays);
            }
            renderModel(model);
            applyLang(currentLang);
            hideLoading();
        } catch (err) {
            console.error('[schedule] load error:', err);
            showError(err.message || ERR[currentLang].generic);
        }
    }

    // ─── Init ─────────────────────────────────────────────────────────
    function init() {
        currentLang = initialLang();
        initNavigation();
        initLanguageSwitcher();
        initImpressum();
        const retry = document.getElementById('retry-btn');
        if (retry) retry.addEventListener('click', () => location.reload());
        const errModal = document.getElementById('error-modal');
        if (errModal) errModal.addEventListener('keydown', e => { if (e.key === 'Escape') location.reload(); });
        applyLang(currentLang); // localize chrome before data arrives
        loadSchedule();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(typeof globalThis !== 'undefined' ? globalThis : this);
