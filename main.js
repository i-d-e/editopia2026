/**
 * Editopia 2026 - Main JavaScript
 * Loads and parses content from call-for-papers markdown files.
 * Sections are identified by ## headings, not by content matching.
 */

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        markdownPaths: {
            de: 'data/call-for-papers-de.md',
            en: 'data/call-for-papers-en.md'
        },
        fadeOutDelay: 300,
        scrollThreshold: 100
    };

    // Current language
    let currentLang = 'de';

    // Cache for parsed markdown sections (avoids refetching on language switch)
    const contentCache = {};

    // DOM Elements
    const elements = {
        loading: document.getElementById('loading'),
        loadingText: document.getElementById('loading-text'),
        errorModal: document.getElementById('error-modal'),
        errorMessage: document.getElementById('error-message'),
        errorTitle: document.getElementById('error-title'),
        nav: document.getElementById('nav'),
        introText: document.getElementById('intro-text'),
        registrationContent: document.getElementById('registration-content'),
        quoteText: document.getElementById('quote-text'),
        themenContent: document.getElementById('themen-content'),
        factsContent: document.getElementById('facts-content'),
        scrollHint: document.getElementById('scroll-hint'),
        skipLink: document.getElementById('skip-link'),
        langButtons: document.querySelectorAll('.lang-btn'),
        impressumBtn: document.getElementById('impressum-btn'),
        impressumModal: document.getElementById('impressum-modal'),
        impressumClose: document.getElementById('impressum-close'),
        impressumBackdrop: document.getElementById('impressum-backdrop')
    };

    /**
     * Show error modal with message
     */
    function showError(message) {
        elements.errorMessage.textContent = message;
        elements.errorModal.hidden = false;
        hideLoading();
    }

    /**
     * Hide loading indicator
     */
    function hideLoading() {
        elements.loading.classList.add('hidden');
        setTimeout(() => {
            elements.loading.style.display = 'none';
        }, CONFIG.fadeOutDelay);
    }

    /**
     * Initialize navigation smooth scroll
     */
    function initNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || !href.startsWith('#')) return; // real page nav → let the browser handle it
                e.preventDefault();
                const target = document.getElementById(href.slice(1));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    /**
     * Initialize scroll hint (hide on scroll)
     */
    function initScrollHint() {
        if (!elements.scrollHint) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > CONFIG.scrollThreshold) {
                elements.scrollHint.classList.add('hidden');
            } else {
                elements.scrollHint.classList.remove('hidden');
            }
        });
    }

    /**
     * Initialize navigation scroll behavior
     * Hides nav on scroll down, shows on scroll up (mobile only)
     */
    function initNavScroll() {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateNav = () => {
            const currentScrollY = window.scrollY;
            const nav = elements.nav;
            const isMobile = window.innerWidth < 768;

            if (isMobile) {
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    nav.classList.add('nav-hidden');
                } else if (currentScrollY < lastScrollY) {
                    nav.classList.remove('nav-hidden');
                }
            } else {
                nav.classList.remove('nav-hidden');
            }

            if (currentScrollY > 10) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }

            lastScrollY = currentScrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNav);
                ticking = true;
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                elements.nav.classList.remove('nav-hidden');
            }
        });
    }

    /**
     * Static UI translations (labels not derived from markdown)
     */
    const UI_TRANSLATIONS = {
        de: {
            heroTitle: 'Zur Zukunft von Dokumentologie und Editorik im Postdigitalen',
            heroMeta: 'KONFERENZ DES',
            heroBadge: 'ANMELDUNG OFFEN',
            sectionThemen: 'Themenfelder',
            sectionRegistration: 'Anmeldung',
            registerBtn: 'Jetzt anmelden',
            sectionFacts: 'Einreichung',
            quoteLabel: '[ FRAGESTELLUNG ]',
            heroOrgLabel: 'Lokale Organisation',
            heroOrgText: 'Bergische Universität Wuppertal: Team Digital Humanities <a href="https://geschichte.uni-wuppertal.de/de/lehrgebiete/digital-humanities/" target="_blank" rel="noopener"><img src="assets/img/dhbuw-logo-grey.png" alt="DH@BUW" class="hero-org-logo"></a>, mit Unterstützung des Interdisziplinären Zentrums für Editions- und Dokumentwissenschaft <a href="https://www.ized.uni-wuppertal.de/" target="_blank" rel="noopener"><img src="assets/img/ized-logo-grey.png" alt="IZED" class="hero-org-logo hero-org-logo-ized"></a>.',
            localOrg: 'Lokale Organisation Bergische Universität Wuppertal: Team Digital Humanities (<a href="https://geschichte.uni-wuppertal.de/de/lehrgebiete/digital-humanities/" target="_blank" rel="noopener">DH@BUW</a>), mit Unterstützung des Interdisziplinären Zentrums für Editions- und Dokumentwissenschaft (<a href="https://www.ized.uni-wuppertal.de/" target="_blank" rel="noopener">IZED</a>).',
            skipLink: 'Zum Inhalt springen',
            scrollHint: 'Zum Inhalt scrollen',
            loadingText: 'Laden...',
            loadingLabel: 'Seite wird geladen',
            errorTitle: 'Fehler',
            errorRetry: 'Erneut versuchen'
        },
        en: {
            heroTitle: 'On the Future of Documentology and Scholarly Editing in the Post-Digital Age',
            heroMeta: 'CONFERENCE OF THE',
            heroBadge: 'REGISTRATION OPEN',
            sectionThemen: 'Topics',
            sectionRegistration: 'Registration',
            registerBtn: 'Register now',
            sectionFacts: 'Submission',
            quoteLabel: '[ KEY QUESTION ]',
            heroOrgLabel: 'Local Organization',
            heroOrgText: 'University of Wuppertal: Digital Humanities Team <a href="https://geschichte.uni-wuppertal.de/de/lehrgebiete/digital-humanities/" target="_blank" rel="noopener"><img src="assets/img/dhbuw-logo-grey.png" alt="DH@BUW" class="hero-org-logo"></a>, supported by the Interdisciplinary Center for Editing and Document Studies <a href="https://www.ized.uni-wuppertal.de/" target="_blank" rel="noopener"><img src="assets/img/ized-logo-grey.png" alt="IZED" class="hero-org-logo hero-org-logo-ized"></a>.',
            localOrg: 'Local organization University of Wuppertal: Digital Humanities Team (<a href="https://geschichte.uni-wuppertal.de/de/lehrgebiete/digital-humanities/" target="_blank" rel="noopener">DH@BUW</a>), supported by the Interdisciplinary Center for Editing and Document Studies (<a href="https://www.ized.uni-wuppertal.de/" target="_blank" rel="noopener">IZED</a>).',
            skipLink: 'Skip to content',
            scrollHint: 'Scroll to content',
            loadingText: 'Loading...',
            loadingLabel: 'Page is loading',
            errorTitle: 'Error',
            errorRetry: 'Try again'
        }
    };

    /**
     * Initialize language switcher
     */
    function initLanguageSwitcher() {
        elements.langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                if (lang !== currentLang) {
                    switchLanguage(lang);
                }
            });
        });
    }

    /**
     * Switch language
     */
    function switchLanguage(lang) {
        currentLang = lang;

        document.documentElement.lang = lang;

        elements.langButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
            btn.setAttribute('aria-pressed', btn.dataset.lang === lang);
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.textContent = link.dataset[lang];
        });

        const t = UI_TRANSLATIONS[lang];
        document.getElementById('hero-title-sub').textContent = t.heroTitle;
        document.querySelector('.hero-meta-ide span').textContent = t.heroMeta;
        document.querySelector('.hero-badge').textContent = t.heroBadge;
        document.querySelector('.section-themen .section-title').textContent = t.sectionThemen;
        document.querySelector('.facts-title').textContent = t.sectionFacts;

        const regTitle = document.getElementById('registration-title');
        if (regTitle) {
            regTitle.textContent = t.sectionRegistration;
        }
        const regBtn = document.getElementById('register-btn');
        if (regBtn) {
            regBtn.textContent = t.registerBtn;
        }

        document.querySelector('.quote-label').textContent = t.quoteLabel;

        const heroOrgLabel = document.getElementById('hero-org-label');
        if (heroOrgLabel) {
            heroOrgLabel.textContent = t.heroOrgLabel;
        }
        const heroOrgText = document.getElementById('hero-org-text');
        if (heroOrgText) {
            heroOrgText.innerHTML = t.heroOrgText;
        }

        const localOrgEl = document.getElementById('footer-local-org');
        if (localOrgEl) {
            localOrgEl.innerHTML = t.localOrg;
        }

        if (elements.skipLink) {
            elements.skipLink.textContent = t.skipLink;
        }
        if (elements.scrollHint) {
            elements.scrollHint.setAttribute('aria-label', t.scrollHint);
        }
        if (elements.loading) {
            elements.loading.setAttribute('aria-label', t.loadingLabel);
        }
        if (elements.loadingText) {
            elements.loadingText.textContent = t.loadingText;
        }
        if (elements.errorTitle) {
            elements.errorTitle.textContent = t.errorTitle;
        }
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.textContent = t.errorRetry;
        }
        if (elements.impressumBtn) {
            elements.impressumBtn.textContent = elements.impressumBtn.dataset[lang];
        }

        loadContent(lang);
    }

    // ─── Markdown Parsing ────────────────────────────────────────────

    /**
     * Parse markdown into sections based on ## headings.
     * Section names are derived from heading text (lowercased).
     * No language-specific logic required.
     */
    function parseMarkdown(markdown) {
        const cleaned = markdown.replace(/\\\./g, '.');
        const tokens = marked.lexer(cleaned);

        const sections = {};
        let currentSection = null;
        let currentTokens = [];

        for (const token of tokens) {
            if (token.type === 'heading' && token.depth === 2) {
                // Save previous section
                if (currentSection !== null) {
                    sections[currentSection] = currentTokens;
                }
                currentSection = token.text.trim().toLowerCase();
                currentTokens = [];
            } else if (token.type === 'heading' && token.depth === 1) {
                continue;
            } else if (currentSection !== null) {
                currentTokens.push(token);
            }
        }

        // Save last section
        if (currentSection !== null) {
            sections[currentSection] = currentTokens;
        }

        return sections;
    }

    /**
     * Parse key-value facts from tokens.
     * Expects lines in "Label: Value" format.
     */
    function parseFacts(tokens) {
        const facts = [];

        for (const token of tokens) {
            if (token.type !== 'paragraph') continue;

            const lines = token.text.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                const colonIndex = trimmed.indexOf(': ');
                if (colonIndex > -1) {
                    facts.push({
                        label: trimmed.substring(0, colonIndex).trim(),
                        value: trimmed.substring(colonIndex + 2).trim()
                    });
                }
            }
        }

        return facts;
    }

    /**
     * Generate HTML for the facts list.
     */
    function renderFacts(facts) {
        if (!facts || facts.length === 0) return '';

        const items = facts.map(fact =>
            `<li>
                <span class="facts-label">${fact.label}:</span>
                <span class="facts-value">${fact.value}</span>
            </li>`
        );

        return `<ul class="facts-list">${items.join('')}</ul>`;
    }

    /**
     * Render tokens back to HTML using marked.
     */
    function renderTokens(tokens) {
        if (!tokens || tokens.length === 0) return '';

        const tokenList = tokens.slice();
        tokenList.links = {};

        return marked.parser(tokenList);
    }

    /**
     * Inject parsed content into DOM.
     */
    function injectContent(sections) {
        // Intro
        if (sections.intro && sections.intro.length > 0) {
            elements.introText.innerHTML = renderTokens(sections.intro);
        }

        // Registration
        if (elements.registrationContent && sections.registration && sections.registration.length > 0) {
            elements.registrationContent.innerHTML = renderTokens(sections.registration);
        }

        // Quote — render to HTML, then extract plain text
        if (sections.quote && sections.quote.length > 0) {
            const quoteHtml = renderTokens(sections.quote);
            const temp = document.createElement('div');
            temp.innerHTML = quoteHtml;
            elements.quoteText.textContent = temp.textContent.trim();
        }

        // Topics
        if (sections.topics && sections.topics.length > 0) {
            elements.themenContent.innerHTML = renderTokens(sections.topics);
        }

        // Submission prose + structured facts overview
        let factsHtml = '';
        if (sections.submission && sections.submission.length > 0) {
            factsHtml += renderTokens(sections.submission);
        }
        if (sections.facts && sections.facts.length > 0) {
            factsHtml += renderFacts(parseFacts(sections.facts));
        }
        if (factsHtml) {
            elements.factsContent.innerHTML = factsHtml;
        }
    }

    // ─── Content Loading ─────────────────────────────────────────────

    /**
     * Fetch and process markdown file. Uses cache on subsequent calls.
     */
    async function loadContent(lang = 'de') {
        try {
            // Return cached content if available
            if (contentCache[lang]) {
                injectContent(contentCache[lang]);
                hideLoading();
                return;
            }

            if (typeof marked === 'undefined') {
                throw new Error('Der Markdown-Parser (assets/js/marked.umd.js) konnte nicht geladen werden.');
            }

            const response = await fetch(CONFIG.markdownPaths[lang]);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Markdown file could not be loaded.`);
            }

            const markdown = await response.text();

            if (!markdown || markdown.trim().length === 0) {
                throw new Error('The markdown file is empty.');
            }

            const sections = parseMarkdown(markdown);

            if (!sections.topics || sections.topics.length === 0) {
                console.warn('No topics found. Check the markdown structure (## topics heading).');
            }

            // Cache parsed sections
            contentCache[lang] = sections;

            injectContent(sections);
            hideLoading();

        } catch (error) {
            console.error('Error loading content:', error);
            showError(error.message || 'An unknown error occurred.');
        }
    }

    // ─── Impressum Modal ────────────────────────────────────────────

    function initImpressum() {
        const { impressumBtn, impressumModal, impressumClose, impressumBackdrop } = elements;
        if (!impressumBtn || !impressumModal) return;

        const openModal = () => {
            impressumModal.hidden = false;
            document.body.style.overflow = 'hidden';
            impressumClose.focus();
        };

        const closeModal = () => {
            impressumModal.hidden = true;
            document.body.style.overflow = '';
            impressumBtn.focus();
        };

        impressumBtn.addEventListener('click', openModal);
        impressumClose.addEventListener('click', closeModal);
        impressumBackdrop.addEventListener('click', closeModal);

        impressumModal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }

    // ─── Initialization ──────────────────────────────────────────────

    function init() {
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: true,
                gfm: true
            });
        }

        initNavigation();
        initNavScroll();
        initScrollHint();
        initLanguageSwitcher();
        initImpressum();

        // Retry button (replaces inline onclick)
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => location.reload());
        }

        loadContent(currentLang);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
