/**
 * Editopia 2026 - Impressum modal
 * Standalone driver for pages that carry no other script (en.html).
 * index.html, programm.html and anreise.html still initialise the same
 * markup from their own bundles.
 */
(function () {
    'use strict';

    function init() {
        const btn = document.getElementById('impressum-btn');
        const modal = document.getElementById('impressum-modal');
        const close = document.getElementById('impressum-close');
        const backdrop = document.getElementById('impressum-backdrop');
        if (!btn || !modal || !close || !backdrop) return;

        const open = () => {
            modal.hidden = false;
            document.body.style.overflow = 'hidden';
            close.focus();
        };
        const shut = () => {
            modal.hidden = true;
            document.body.style.overflow = '';
            btn.focus();
        };

        btn.addEventListener('click', open);
        close.addEventListener('click', shut);
        backdrop.addEventListener('click', shut);
        modal.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
