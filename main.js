/**
 * Editopia 2046 - Main JavaScript
 * Loads and parses content from call-for-papers.md
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

    // DOM Elements
    const elements = {
        loading: document.getElementById('loading'),
        errorModal: document.getElementById('error-modal'),
        errorMessage: document.getElementById('error-message'),
        nav: document.getElementById('nav'),
        introText: document.getElementById('intro-text'),
        quoteText: document.getElementById('quote-text'),
        themenContent: document.getElementById('themen-content'),
        factsContent: document.getElementById('facts-content'),
        scrollHint: document.querySelector('.scroll-hint'),
        langButtons: document.querySelectorAll('.lang-btn')
    };

    /**
     * Show error modal with message
     * @param {string} message - Error message to display
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
        // Smooth scroll for navigation links
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
     * Static UI translations
     */
    const UI_TRANSLATIONS = {
        de: {
            heroTitle: 'Zukunft von Dokumentologie und Editorik im Postdigitalen',
            heroMeta: 'KONFERENZ DES IDE',
            heroBadge: 'CALL FOR PAPERS',
            sectionThemen: 'Themenfelder',
            sectionFacts: 'Einreichung',
            submitBtn: 'Abstract einreichen',
            quoteLabel: '[ FRAGESTELLUNG ]',
            factsLabels: {
                format: 'Format',
                abstract: 'Abstract',
                deadline: 'Deadline',
                languages: 'Sprachen',
                participants: 'Teilnehmer',
                fee: 'Gebühr',
                travel: 'Reisekosten'
            }
        },
        en: {
            heroTitle: 'The Future of Documentary Studies and Editing in the Postdigital',
            heroMeta: 'CONFERENCE OF THE IDE',
            heroBadge: 'CALL FOR PAPERS',
            sectionThemen: 'Topics',
            sectionFacts: 'Submission',
            submitBtn: 'Submit Abstract',
            quoteLabel: '[ KEY QUESTION ]',
            factsLabels: {
                format: 'Format',
                abstract: 'Abstract',
                deadline: 'Deadline',
                languages: 'Languages',
                participants: 'Participants',
                fee: 'Fee',
                travel: 'Travel costs'
            }
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
     * @param {string} lang - Language code ('de' or 'en')
     */
    function switchLanguage(lang) {
        currentLang = lang;

        // Update button states
        elements.langButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.textContent = link.dataset[lang];
        });

        // Update static UI elements
        const t = UI_TRANSLATIONS[lang];
        document.getElementById('hero-title').textContent = t.heroTitle;
        document.querySelector('.hero-meta span:first-child').textContent = t.heroMeta;
        document.querySelector('.hero-badge').textContent = t.heroBadge;
        document.querySelector('.section-themen .section-title').textContent = t.sectionThemen;
        document.querySelector('.facts-title').textContent = t.sectionFacts;
        document.getElementById('submit-btn').textContent = t.submitBtn;
        document.querySelector('.quote-label').textContent = t.quoteLabel;

        // Reload content from correct markdown file
        loadContent(lang);
    }

    /**
     * Parse markdown using marked.js tokens
     * @param {string} markdown - Raw markdown content
     * @param {string} lang - Language code
     * @returns {Object} Parsed sections
     */
    function parseMarkdownSections(markdown, lang = 'de') {
        // Clean up escaped dots from markdown
        const cleanedMarkdown = markdown.replace(/\\\./g, '.');

        // Use marked.js lexer to tokenize
        const tokens = marked.lexer(cleanedMarkdown);

        const sections = {
            intro: [],
            quote: '',
            themenfelder: [],
            hardFacts: []
        };

        let currentSection = 'intro';

        // Language-specific patterns
        const patterns = lang === 'de' ? {
            quote: 'Eine Grundsatzfrage',
            themen: 'Wir laden zu Beiträgen ein',
            facts: 'Wir bitten um Einreichungen',
            end: 'Abstracts und Rückfragen',
            skip: '*Was kommt'
        } : {
            quote: 'A fundamental question',
            themen: 'We invite contributions',
            facts: 'We invite submissions',
            end: 'Please send abstracts',
            skip: '*What comes after'
        };

        for (const token of tokens) {
            // Skip headings (h1, h2)
            if (token.type === 'heading') {
                continue;
            }

            // Detect section changes based on content
            if (token.type === 'paragraph') {
                const text = token.text;

                // Quote
                if (text.startsWith(patterns.quote)) {
                    const colonIndex = text.indexOf(':');
                    if (colonIndex > -1) {
                        sections.quote = text.substring(colonIndex + 1).trim();
                    }
                    continue;
                }

                // Themenfelder section starts
                if (text.startsWith(patterns.themen)) {
                    currentSection = 'themenfelder';
                }

                // Hard facts section starts
                if (text.startsWith(patterns.facts)) {
                    currentSection = 'hardFacts';
                }

                // End of content
                if (text.startsWith(patterns.end)) {
                    break;
                }

                // Add to current section
                if (currentSection === 'intro' && !text.startsWith(patterns.skip)) {
                    sections.intro.push(token);
                } else if (currentSection === 'themenfelder') {
                    sections.themenfelder.push(token);
                } else if (currentSection === 'hardFacts') {
                    sections.hardFacts.push(token);
                }
            }
        }

        return sections;
    }

    /**
     * Render tokens back to HTML using marked
     * @param {Array} tokens - Array of marked tokens
     * @returns {string} HTML string
     */
    function renderTokens(tokens) {
        if (!tokens || tokens.length === 0) return '';

        // Create a token list structure that marked.parser expects
        const tokenList = tokens.slice();
        tokenList.links = {};

        return marked.parser(tokenList);
    }

    /**
     * Generate HTML for hard facts section
     * @param {string} factsHtml - HTML from rendered markdown
     * @param {string} lang - Current language
     * @returns {string} HTML string
     */
    function generateFactsHTML(factsHtml, lang) {
        const labels = UI_TRANSLATIONS[lang].factsLabels;
        const facts = [];

        if (lang === 'de') {
            // German patterns
            const formatMatch = factsHtml.match(/<strong>Vorträge von ([^<]+)<\/strong>/);
            if (formatMatch) {
                facts.push({ label: labels.format, value: `Vorträge, ${formatMatch[1]}` });
            }

            const abstractMatch = factsHtml.match(/<strong>Abstracts sollten ([^<]+)<\/strong>/);
            if (abstractMatch) {
                facts.push({ label: labels.abstract, value: abstractMatch[1] });
            }

            const deadlineMatch = factsHtml.match(/<strong>Einreichungsfrist ist der ([^<]+)<\/strong>/);
            if (deadlineMatch) {
                facts.push({ label: labels.deadline, value: deadlineMatch[1] });
            }

            const languageMatch = factsHtml.match(/Konferenzsprachen sind ([^.]+)\./);
            if (languageMatch) {
                facts.push({ label: labels.languages, value: languageMatch[1] });
            }

            const participantsMatch = factsHtml.match(/auf (\d+) Personen begrenzt/);
            if (participantsMatch) {
                facts.push({ label: labels.participants, value: `max. ${participantsMatch[1]} Personen` });
            }

            if (factsHtml.includes('keine Tagungsgebühr')) {
                facts.push({ label: labels.fee, value: 'keine' });
            }

            if (factsHtml.includes('Reisekosten können leider nicht übernommen werden')) {
                facts.push({ label: labels.travel, value: 'können nicht übernommen werden' });
            }
        } else {
            // English patterns
            const formatMatch = factsHtml.match(/<strong>20-minute presentations<\/strong>/i);
            if (formatMatch) {
                facts.push({ label: labels.format, value: '20-minute presentations' });
            }

            const abstractMatch = factsHtml.match(/<strong>Abstracts should be ([^<]+)<\/strong>/i);
            if (abstractMatch) {
                facts.push({ label: labels.abstract, value: abstractMatch[1] });
            }

            const deadlineMatch = factsHtml.match(/<strong>Submission deadline[:\s]+([^<]+)<\/strong>/i);
            if (deadlineMatch) {
                facts.push({ label: labels.deadline, value: deadlineMatch[1] });
            }

            const languageMatch = factsHtml.match(/Conference languages[:\s]+([^.]+)\./i);
            if (languageMatch) {
                facts.push({ label: labels.languages, value: languageMatch[1] });
            }

            const participantsMatch = factsHtml.match(/limited to (\d+) participants/i);
            if (participantsMatch) {
                facts.push({ label: labels.participants, value: `max. ${participantsMatch[1]}` });
            }

            if (factsHtml.includes('no conference fee') || factsHtml.includes('No registration fee')) {
                facts.push({ label: labels.fee, value: 'none' });
            }

            if (factsHtml.includes('Travel costs cannot be covered') || factsHtml.includes('travel expenses cannot be reimbursed')) {
                facts.push({ label: labels.travel, value: 'cannot be covered' });
            }
        }

        if (facts.length > 0) {
            return `
                <ul class="facts-list">
                    ${facts.map(fact => `
                        <li>
                            <span class="facts-label">${fact.label}:</span>
                            <span class="facts-value">${fact.value}</span>
                        </li>
                    `).join('')}
                </ul>
            `;
        }

        // Fallback: return the HTML as-is
        return factsHtml;
    }

    /**
     * Inject parsed content into DOM
     * @param {Object} sections - Parsed sections object
     * @param {string} lang - Current language
     */
    function injectContent(sections, lang) {
        // Intro text - render tokens as HTML
        if (sections.intro.length > 0) {
            elements.introText.innerHTML = renderTokens(sections.intro);
        }

        // Quote
        if (sections.quote) {
            elements.quoteText.textContent = sections.quote;
        }

        // Themenfelder - render tokens as flowing HTML
        if (sections.themenfelder.length > 0) {
            elements.themenContent.innerHTML = renderTokens(sections.themenfelder);
        }

        // Hard facts - render tokens and extract structured data
        if (sections.hardFacts.length > 0) {
            const factsHtml = renderTokens(sections.hardFacts);
            elements.factsContent.innerHTML = generateFactsHTML(factsHtml, lang);
        }
    }

    /**
     * Fetch and process markdown file
     * @param {string} lang - Language code ('de' or 'en')
     */
    async function loadContent(lang = 'de') {
        try {
            const markdownPath = CONFIG.markdownPaths[lang];
            const response = await fetch(markdownPath);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Markdown file could not be loaded.`);
            }

            const markdown = await response.text();

            if (!markdown || markdown.trim().length === 0) {
                throw new Error('The markdown file is empty.');
            }

            // Parse sections (language-aware)
            const sections = parseMarkdownSections(markdown, lang);

            // Validate parsed content
            if (sections.themenfelder.length === 0) {
                console.warn('No topics found. Check the markdown format.');
            }

            // Inject content
            injectContent(sections, lang);

            // Hide loading
            hideLoading();

        } catch (error) {
            console.error('Error loading content:', error);
            showError(error.message || 'An unknown error occurred.');
        }
    }

    /**
     * Initialize the application
     */
    function init() {
        // Check if marked.js is loaded
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: true,
                gfm: true
            });
        }

        // Initialize navigation
        initNavigation();

        // Initialize scroll hint (hide on scroll)
        initScrollHint();

        // Initialize language switcher
        initLanguageSwitcher();

        // Load content in default language
        loadContent(currentLang);
    }

    // Start application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
