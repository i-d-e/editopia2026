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
        quoteText: document.getElementById('quote-text'),
        themenContent: document.getElementById('themen-content'),
        factsContent: document.getElementById('facts-content'),
        scrollHint: document.getElementById('scroll-hint'),
        skipLink: document.getElementById('skip-link'),
        langButtons: document.querySelectorAll('.lang-btn')
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
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                const target = document.getElementById(targetId);
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
            heroMeta: 'KONFERENZ DES IDE',
            heroBadge: 'CALL FOR PAPERS',
            sectionThemen: 'Themenfelder',
            sectionFacts: 'Einreichung',
            submitBtn: 'Abstract einreichen',
            quoteLabel: '[ FRAGESTELLUNG ]',
            skipLink: 'Zum Inhalt springen',
            scrollHint: 'Zum Inhalt scrollen',
            loadingText: 'Laden...',
            loadingLabel: 'Seite wird geladen',
            errorTitle: 'Fehler',
            errorRetry: 'Erneut versuchen'
        },
        en: {
            heroTitle: 'On the Future of Documentology and Scholarly Editing in the Post-Digital Age',
            heroMeta: 'CONFERENCE OF THE IDE',
            heroBadge: 'CALL FOR PAPERS',
            sectionThemen: 'Topics',
            sectionFacts: 'Submission',
            submitBtn: 'Submit Abstract',
            quoteLabel: '[ KEY QUESTION ]',
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
        document.getElementById('hero-title').textContent = t.heroTitle;
        document.querySelector('.hero-meta span:first-child').textContent = t.heroMeta;
        document.querySelector('.hero-badge').textContent = t.heroBadge;
        document.querySelector('.section-themen .section-title').textContent = t.sectionThemen;
        document.querySelector('.facts-title').textContent = t.sectionFacts;
        document.getElementById('submit-btn').textContent = t.submitBtn;
        document.querySelector('.quote-label').textContent = t.quoteLabel;

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
