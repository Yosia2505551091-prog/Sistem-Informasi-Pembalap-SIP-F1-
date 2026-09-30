document.addEventListener('DOMContentLoaded', () => {

    highlightActiveNav();

    if (document.querySelector('.hero')) {
        animateStats();
    }

    if (document.querySelector('.team-grid')) {
        animateTeamCards();
    }

    if (document.querySelector('.tracks-table')) {
        initTracksSearch();
        initTracksSort();
    }

    if (document.querySelector('.reserve-table')) {
        initReservesSearch();
    }

    initBackToTop();
    initExternalLinks();

});

function highlightActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        link.classList.remove('active');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
}

function animateStats() {
    const statCards = document.querySelectorAll('.stat-card h3');

    statCards.forEach(card => {
        const finalValue = parseInt(card.textContent, 10);
        if (isNaN(finalValue)) return;

        let currentValue = 0;
        const duration = 1200;
        const stepTime = Math.max(Math.floor(duration / finalValue), 20);

        card.textContent = '0';

        const timer = setInterval(() => {
            currentValue += 1;
            card.textContent = currentValue;
            if (currentValue >= finalValue) {
                clearInterval(timer);
                card.textContent = finalValue;
            }
        }, stepTime);
    });
}

function animateTeamCards() {
    const cards = document.querySelectorAll('.team-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 60);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}

function initTracksSearch() {
    const tables = document.querySelectorAll('.tracks-table');

    tables.forEach((table, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'search-wrapper';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'search-input';
        input.placeholder = '🔍 Search tracks or circuits...';
        input.setAttribute('aria-label', 'Search tracks');

        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(input);
        wrapper.appendChild(table);

        input.addEventListener('input', () => {
            const query = input.value.toLowerCase().trim();
            const rows = table.querySelectorAll('tbody tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    });
}

function initTracksSort() {
    const tables = document.querySelectorAll('.tracks-table');

    tables.forEach(table => {
        const headers = table.querySelectorAll('thead th');

        headers.forEach((header, colIndex) => {
            if (colIndex === headers.length - 1) return;

            header.style.cursor = 'pointer';
            header.title = 'Click to sort';

            let ascending = true;

            header.addEventListener('click', () => {
                const tbody = table.querySelector('tbody');
                const rows = Array.from(tbody.querySelectorAll('tr'));

                rows.sort((a, b) => {
                    const aText = a.children[colIndex].textContent.trim();
                    const bText = b.children[colIndex].textContent.trim();

                    const aNum = parseFloat(aText);
                    const bNum = parseFloat(bText);

                    if (!isNaN(aNum) && !isNaN(bNum)) {
                        return ascending ? aNum - bNum : bNum - aNum;
                    }

                    return ascending
                        ? aText.localeCompare(bText)
                        : bText.localeCompare(aText);
                });

                rows.forEach(row => tbody.appendChild(row));

                headers.forEach(h => h.classList.remove('sorted-asc', 'sorted-desc'));
                header.classList.add(ascending ? 'sorted-asc' : 'sorted-desc');

                ascending = !ascending;
            });
        });
    });
}

function initReservesSearch() {
    const table = document.querySelector('.reserve-table');
    if (!table) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'search-wrapper';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'search-input';
    input.placeholder = '🔍 Search reserves by team, driver, or nationality...';
    input.setAttribute('aria-label', 'Search reserves');

    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(input);
    wrapper.appendChild(table);

    input.addEventListener('input', () => {
        const query = input.value.toLowerCase().trim();
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });
}

function initBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Back to top');
    btn.title = 'Back to top';
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initExternalLinks() {
    const links = document.querySelectorAll('a[target="_blank"]');
    links.forEach(link => {
        link.setAttribute('rel', 'noopener noreferrer');
    });
}