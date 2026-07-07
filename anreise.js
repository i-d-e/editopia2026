/**
 * Editopia 2026 - Travel & Accommodation (unlisted preview page)
 * Static content, no data fetching. Handles only the shared chrome:
 * language toggle (DE/EN content blocks + [data-de]/[data-en] labels),
 * impressum modal, in-page nav. Mirrors the chrome logic of schedule.js.
 */
(function () {
    'use strict';

    let currentLang = 'de';

    // Footer credit carries embedded links → set via innerHTML (parity with main.js/schedule.js)
    const LOCAL_ORG_HTML = {
        de: 'Lokale Organisation Bergische Universität Wuppertal: Team Digital Humanities (<a href="https://geschichte.uni-wuppertal.de/de/lehrgebiete/digital-humanities/" target="_blank" rel="noopener">DH@BUW</a>), mit Unterstützung des Interdisziplinären Zentrums für Editions- und Dokumentwissenschaft (<a href="https://www.ized.uni-wuppertal.de/" target="_blank" rel="noopener">IZED</a>).',
        en: 'Local organization University of Wuppertal: Digital Humanities Team (<a href="https://geschichte.uni-wuppertal.de/de/lehrgebiete/digital-humanities/" target="_blank" rel="noopener">DH@BUW</a>), supported by the Interdisciplinary Center for Editing and Document Studies (<a href="https://www.ized.uni-wuppertal.de/" target="_blank" rel="noopener">IZED</a>).'
    };

    function applyLang(lang) {
        currentLang = lang;
        document.documentElement.lang = lang;

        document.querySelectorAll('.lang-btn').forEach(btn => {
            const on = btn.dataset.lang === lang;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', String(on));
        });

        // Localizable chrome labels (nav, footer button, skip link, banner)
        document.querySelectorAll('[data-de][data-en]').forEach(node => {
            node.textContent = node.dataset[lang];
        });

        // Cross-page links resolve to the matching-language target
        document.querySelectorAll('[data-href-de][data-href-en]').forEach(a => {
            a.href = a.dataset[lang === 'en' ? 'hrefEn' : 'hrefDe'];
        });

        // Whole content blocks: show the active language, hide the other
        document.querySelectorAll('.lang-block').forEach(block => {
            block.hidden = block.dataset.lang !== lang;
        });

        const org = document.getElementById('footer-local-org');
        if (org) org.innerHTML = LOCAL_ORG_HTML[lang];
    }

    function initLanguageSwitcher() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.lang !== currentLang) applyLang(btn.dataset.lang);
            });
        });
    }

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

    function initialLang() {
        try {
            const p = new URLSearchParams(window.location.search).get('lang');
            if (p === 'en' || p === 'de') return p;
            if ((window.location.hash || '').toLowerCase() === '#en') return 'en';
        } catch (e) { /* noop */ }
        return 'de';
    }

    function init() {
        initLanguageSwitcher();
        initImpressum();
        initNavigation();
        applyLang(initialLang());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
