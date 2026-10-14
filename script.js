/* TinkerHub CETKR — adaptive theme metadata, expressive reveals, accessible navigation. */
(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const darkPreference = window.matchMedia('(prefers-color-scheme: dark)');
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const root = document.documentElement;
    const themeButtons = document.querySelectorAll('.theme-toggle');
    const savedTheme = (() => {
        try { return localStorage.getItem('th-cetkr-theme'); }
        catch (_) { return null; }
    })();

    const currentTheme = () => root.dataset.theme || (darkPreference.matches ? 'dark' : 'light');
    const syncThemeControls = () => {
        const dark = currentTheme() === 'dark';
        if (themeMeta) themeMeta.setAttribute('content', dark ? '#11130e' : '#f7f5ef');
        themeButtons.forEach(button => {
            const icon = button.querySelector('.theme-toggle-icon');
            const label = button.querySelector('.theme-toggle-label');
            button.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
            button.setAttribute('title', `Switch to ${dark ? 'light' : 'dark'} mode`);
            if (icon) icon.textContent = dark ? '☀' : '☾';
            if (label) label.textContent = dark ? 'Light' : 'Dark';
        });
    };
    if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;
    syncThemeControls();
    themeButtons.forEach(button => button.addEventListener('click', () => {
        root.dataset.theme = currentTheme() === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem('th-cetkr-theme', root.dataset.theme); }
        catch (_) { /* Theme still works for this page when storage is unavailable. */ }
        syncThemeControls();
    }));
    if (darkPreference.addEventListener) darkPreference.addEventListener('change', () => {
        if (!root.dataset.theme) syncThemeControls();
    });
    else if (darkPreference.addListener) darkPreference.addListener(() => {
        if (!root.dataset.theme) syncThemeControls();
    });

    const revealItems = document.querySelectorAll('.reveal');
    if (reducedMotion || !('IntersectionObserver' in window)) {
        revealItems.forEach(item => item.classList.add('is-visible'));
    } else {
        const observer = new IntersectionObserver((entries, currentObserver) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                currentObserver.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -28px 0px' });
        revealItems.forEach((item, index) => {
            item.style.transitionDelay = `${Math.min(index * 75, 300)}ms`;
            observer.observe(item);
        });
    }

    document.querySelectorAll('.more-menu').forEach(menu => {
        const button = menu.querySelector('.more-button');
        const links = menu.querySelector('.more-links');
        if (!button || !links) return;
        button.setAttribute('aria-haspopup', 'true');
        button.setAttribute('aria-expanded', 'false');
        const setOpen = open => {
            menu.classList.toggle('is-open', open);
            button.setAttribute('aria-expanded', String(open));
        };
        button.addEventListener('click', event => {
            event.stopPropagation();
            setOpen(!menu.classList.contains('is-open'));
        });
        links.addEventListener('click', event => {
            if (event.target.closest('a')) setOpen(false);
        });
        document.addEventListener('click', event => {
            if (!menu.contains(event.target)) setOpen(false);
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                setOpen(false);
                button.focus();
            }
        });
    });
})();
