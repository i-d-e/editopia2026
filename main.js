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
        themenIntro: document.getElementById('themen-intro'),
        themenGrid: document.getElementById('themen-grid'),
        themenOutro: document.getElementById('themen-outro'),
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
     * Parse markdown content and extract sections
     * @param {string} markdown - Raw markdown content
     * @returns {Object} Parsed sections
     */
    function parseMarkdownSections(markdown) {
        const sections = {
            intro: '',
            quote: '',
            themenIntro: '',
            themenfelder: [],
            themenOutro: '',
            hardFacts: ''
        };

        // Split into lines for processing
        const lines = markdown.split('\n');
        let currentSection = null;
        let currentThema = null;
        let buffer = [];

        // Find the intro paragraph (after ## heading, before the quote)
        const introMatch = markdown.match(/\*Was kommt nach der digitalen Edition\?\*\s*\n\n([\s\S]*?)(?=\n\nEine Grundsatzfrage)/);
        if (introMatch) {
            sections.intro = introMatch[1].trim();
        }

        // Extract the central question (quote)
        const quoteMatch = markdown.match(/Eine Grundsatzfrage durchzieht alle anderen:\s*(.*?\?)/);
        if (quoteMatch) {
            sections.quote = quoteMatch[1].trim();
        }

        // Extract "Wir laden zu Beiträgen ein" intro
        const themenIntroMatch = markdown.match(/Wir laden zu Beiträgen ein,[^.]*\./);
        if (themenIntroMatch) {
            sections.themenIntro = themenIntroMatch[0];
        }

        // Extract themenfelder (bold headers followed by content)
        const themenRegex = /\*\*([^.]+)\.\*\*\s*([^*]+?)(?=\*\*|Diese Themenfelder|Wir bitten)/g;
        let match;
        let themaIndex = 1;

        while ((match = themenRegex.exec(markdown)) !== null) {
            sections.themenfelder.push({
                number: String(themaIndex).padStart(2, '0'),
                title: match[1].trim(),
                content: match[2].trim()
            });
            themaIndex++;
        }

        // Extract themen outro
        const outroMatch = markdown.match(/Diese Themenfelder verstehen sich als Orientierung\.[^.]*\./);
        if (outroMatch) {
            sections.themenOutro = outroMatch[0];
        }

        // Extract hard facts (submission info)
        const factsMatch = markdown.match(/Wir bitten um Einreichungen[\s\S]*?(?=Abstracts und Rückfragen)/);
        if (factsMatch) {
            sections.hardFacts = factsMatch[0].trim();
        }

        return sections;
    }

    /**
     * Generate HTML for themenfelder
     * @param {Array} themenfelder - Array of theme objects
     * @returns {string} HTML string
     */
    function generateThemenHTML(themenfelder) {
        return themenfelder.map(thema => `
            <article class="thema-card">
                <header class="thema-header">
                    <span class="thema-number">${thema.number}</span>
                    <span class="thema-pipe">|</span>
                    <span class="thema-title">${thema.title}</span>
                </header>
                <div class="thema-body">
                    <p>${thema.content}</p>
                </div>
            </article>
        `).join('');
    }

    /**
     * Generate HTML for hard facts section
     * @param {string} factsText - Raw facts text
     * @returns {string} HTML string
     */
    function generateFactsHTML(factsText) {
        // Parse the facts into structured data
        const facts = [];

        // Extract format
        const formatMatch = factsText.match(/\*\*Vorträge von ([^*]+)\*\*/);
        if (formatMatch) {
            facts.push({ label: 'Format', value: `Vorträge, ${formatMatch[1]}` });
        }

        // Extract abstract length
        const abstractMatch = factsText.match(/\*\*Abstracts sollten ([^*]+)\*\*/);
        if (abstractMatch) {
            facts.push({ label: 'Abstract', value: abstractMatch[1] });
        }

        // Extract deadline
        const deadlineMatch = factsText.match(/\*\*Einreichungsfrist ist der ([^*]+)\*\*/);
        if (deadlineMatch) {
            facts.push({ label: 'Deadline', value: deadlineMatch[1] });
        }

        // Extract languages
        const languageMatch = factsText.match(/Konferenzsprachen sind ([^.]+)/);
        if (languageMatch) {
            facts.push({ label: 'Sprachen', value: languageMatch[1] });
        }

        // Extract participants limit
        const participantsMatch = factsText.match(/auf (\d+) Personen begrenzt/);
        if (participantsMatch) {
            facts.push({ label: 'Teilnehmer', value: `max. ${participantsMatch[1]} Personen` });
        }

        // Extract fee info
        if (factsText.includes('keine Tagungsgebühr')) {
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

        // Fallback: render as paragraphs
        return `<p>${factsText.replace(/\*\*/g, '')}</p>`;
    }

    /**
     * Inject parsed content into DOM
     * @param {Object} sections - Parsed sections object
     */
    function injectContent(sections) {
        // Intro text
        if (sections.intro) {
            elements.introText.innerHTML = `<p>${sections.intro}</p>`;
        }

        // Quote
        if (sections.quote) {
            elements.quoteText.textContent = sections.quote;
        }

        // Themen intro
        if (sections.themenIntro) {
            elements.themenIntro.textContent = sections.themenIntro;
        }

        // Themenfelder grid
        if (sections.themenfelder.length > 0) {
            elements.themenGrid.innerHTML = generateThemenHTML(sections.themenfelder);
        }

        // Themen outro
        if (sections.themenOutro) {
            elements.themenOutro.textContent = sections.themenOutro;
        }

        // Hard facts
        if (sections.hardFacts) {
            elements.factsContent.innerHTML = generateFactsHTML(sections.hardFacts);
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
