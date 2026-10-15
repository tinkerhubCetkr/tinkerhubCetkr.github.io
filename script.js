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

    // Interactive Events calendar. Add real events to eventData using YYYY-MM-DD keys.
    const calendarRoot = document.querySelector('#calendar');
    if (calendarRoot) {
        const year = new Date().getFullYear();
        const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        // Keep empty until confirmed event dates and descriptions are supplied.
        const eventData = {};
        const yearView = document.querySelector('#calendar-year-view');
        const monthView = document.querySelector('#calendar-month-view');
        const monthTitle = document.querySelector('#calendar-month-title');
        const daysView = document.querySelector('#calendar-days');
        const detailsTitle = document.querySelector('#event-details-title');
        const detailsCopy = document.querySelector('#event-details-copy');
        const yearLabel = document.querySelector('#calendar-year');
        let activeMonth = new Date().getMonth();
        let selectedDate = '';
        yearLabel.textContent = year;

        monthNames.forEach((name, index) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'calendar-year-card';
            card.innerHTML = `<span class="calendar-month-number">MONTH ${(index + 1).toString().padStart(2, '0')}</span><span class="calendar-month-name">${name}</span><span class="calendar-month-meta">${new Date(year, index + 1, 0).getDate()} days · View calendar</span>`;
            card.addEventListener('click', () => openMonth(index));
            yearView.appendChild(card);
        });

        function openMonth(index) {
            activeMonth = (index + 12) % 12;
            yearView.hidden = true;
            monthView.hidden = false;
            renderMonth();
            monthView.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        }
        function renderMonth() {
            monthTitle.textContent = `${monthNames[activeMonth]} ${year}`;
            daysView.replaceChildren();
            const firstWeekday = new Date(year, activeMonth, 1).getDay();
            const daysInMonth = new Date(year, activeMonth + 1, 0).getDate();
            for (let i = 0; i < firstWeekday; i++) {
                const blank = document.createElement('span');
                blank.className = 'calendar-day-empty';
                blank.setAttribute('aria-hidden', 'true');
                daysView.appendChild(blank);
            }
            for (let day = 1; day <= daysInMonth; day++) {
                const key = `${year}-${String(activeMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'calendar-day';
                button.textContent = day;
                button.setAttribute('aria-label', `${monthNames[activeMonth]} ${day}, ${year}${eventData[key] ? ', event available' : ''}`);
                if (eventData[key]) button.classList.add('has-event');
                if (key === selectedDate) button.classList.add('is-selected');
                button.addEventListener('click', () => showDate(key, day));
                daysView.appendChild(button);
            }
            if (!selectedDate || !selectedDate.startsWith(`${year}-${String(activeMonth + 1).padStart(2, '0')}-`)) {
                detailsTitle.textContent = 'Choose a date';
                detailsCopy.textContent = 'Select any day in the calendar to see its events and memories.';
            } else {
                const day = Number(selectedDate.slice(-2));
                updateDetails(selectedDate, day);
            }
        }
        function showDate(key, day) {
            selectedDate = key;
            daysView.querySelectorAll('.calendar-day').forEach(button => {
                const isSelected = Number(button.textContent) === day;
                button.classList.toggle('is-selected', isSelected);
                button.setAttribute('aria-pressed', String(isSelected));
            });
            updateDetails(key, day);
        }
        function updateDetails(key, day) {
            detailsTitle.textContent = `${monthNames[activeMonth]} ${day}, ${year}`;
            const event = eventData[key];
            if (!event) {
                detailsCopy.textContent = 'No event has been added for this date yet. Add confirmed event details and photos to the calendar data when they are ready.';
                return;
            }
            detailsCopy.textContent = typeof event === 'string' ? event : `${event.title}${event.description ? ` — ${event.description}` : ''}`;
        }
        document.querySelector('#calendar-back').addEventListener('click', () => {
            monthView.hidden = true;
            yearView.hidden = false;
            yearView.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        });
        document.querySelector('#calendar-prev').addEventListener('click', () => openMonth(activeMonth - 1));
        document.querySelector('#calendar-next').addEventListener('click', () => openMonth(activeMonth + 1));
    }

})();
