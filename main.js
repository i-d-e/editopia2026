/**
 * Editopia 2046 - Main JavaScript
 * Loads and parses content from call-for-papers.md
 */

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        markdownPath: 'data/call-for-papers.md',
        fadeOutDelay: 300,
        scrollThreshold: 200
    };

    // DOM Elements
    const elements = {
        loading: document.getElementById('loading'),
        errorModal: document.getElementById('error-modal'),
        errorMessage: document.getElementById('error-message'),
        nav: document.getElementById('nav'),
        introText: document.getElementById('intro-text'),
        quoteText: document.getElementById('quote-text'),
        themenContent: document.getElementById('themen-content'),
        factsContent: document.getElementById('facts-content')
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
     * Initialize navigation scroll behavior
     */
    function initNavigation() {
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > CONFIG.scrollThreshold) {
                elements.nav.classList.add('visible');
            } else {
                elements.nav.classList.remove('visible');
            }

            lastScrollY = currentScrollY;
        });

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
     * Parse markdown using marked.js tokens
     * @param {string} markdown - Raw markdown content
     * @returns {Object} Parsed sections
     */
    function parseMarkdownSections(markdown) {
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

        for (const token of tokens) {
            // Skip headings (h1, h2)
            if (token.type === 'heading') {
                continue;
            }

            // Detect section changes based on content
            if (token.type === 'paragraph') {
                const text = token.text;

                // Quote: starts with "Eine Grundsatzfrage"
                if (text.startsWith('Eine Grundsatzfrage')) {
                    // Extract the question part after the colon
                    const colonIndex = text.indexOf(':');
                    if (colonIndex > -1) {
                        sections.quote = text.substring(colonIndex + 1).trim();
                    }
                    continue;
                }

                // Themenfelder section starts
                if (text.startsWith('Wir laden zu Beiträgen ein')) {
                    currentSection = 'themenfelder';
                }

                // Hard facts section starts
                if (text.startsWith('Wir bitten um Einreichungen')) {
                    currentSection = 'hardFacts';
                }

                // End of content
                if (text.startsWith('Abstracts und Rückfragen')) {
                    break;
                }

                // Add to current section
                if (currentSection === 'intro' && !text.startsWith('*Was kommt')) {
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
     * @returns {string} HTML string
     */
    function generateFactsHTML(factsHtml) {
        // Parse the facts into structured data from HTML
        const facts = [];

        // Extract format (now looks for <strong> tags)
        const formatMatch = factsHtml.match(/<strong>Vorträge von ([^<]+)<\/strong>/);
        if (formatMatch) {
            facts.push({ label: 'Format', value: `Vorträge, ${formatMatch[1]}` });
        }

        // Extract abstract length
        const abstractMatch = factsHtml.match(/<strong>Abstracts sollten ([^<]+)<\/strong>/);
        if (abstractMatch) {
            facts.push({ label: 'Abstract', value: abstractMatch[1] });
        }

        // Extract deadline
        const deadlineMatch = factsHtml.match(/<strong>Einreichungsfrist ist der ([^<]+)<\/strong>/);
        if (deadlineMatch) {
            facts.push({ label: 'Deadline', value: deadlineMatch[1] });
        }

        // Extract languages
        const languageMatch = factsHtml.match(/Konferenzsprachen sind ([^.]+)\./);
        if (languageMatch) {
            facts.push({ label: 'Sprachen', value: languageMatch[1] });
        }

        // Extract participants limit
        const participantsMatch = factsHtml.match(/auf (\d+) Personen begrenzt/);
        if (participantsMatch) {
            facts.push({ label: 'Teilnehmer', value: `max. ${participantsMatch[1]} Personen` });
        }

        // Extract fee info
        if (factsHtml.includes('keine Tagungsgebühr')) {
            facts.push({ label: 'Gebühr', value: 'keine' });
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
     */
    function injectContent(sections) {
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
            elements.factsContent.innerHTML = generateFactsHTML(factsHtml);
        }
    }

    /**
     * Fetch and process markdown file
     */
    async function loadContent() {
        try {
            const response = await fetch(CONFIG.markdownPath);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Markdown-Datei konnte nicht geladen werden.`);
            }

            const markdown = await response.text();

            if (!markdown || markdown.trim().length === 0) {
                throw new Error('Die Markdown-Datei ist leer.');
            }

            // Parse sections
            const sections = parseMarkdownSections(markdown);

            // Validate parsed content
            if (sections.themenfelder.length === 0) {
                console.warn('Keine Themenfelder gefunden. Überprüfen Sie das Markdown-Format.');
            }

            // Inject content
            injectContent(sections);

            // Hide loading
            hideLoading();

        } catch (error) {
            console.error('Fehler beim Laden:', error);
            showError(error.message || 'Ein unbekannter Fehler ist aufgetreten.');
        }
    }

    /**
     * Initialize the application
     */
    function init() {
        // Check if marked.js is loaded (optional, for future use)
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: true,
                gfm: true
            });
        }

        // Initialize navigation
        initNavigation();

        // Load content
        loadContent();
    }

    // Start application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
