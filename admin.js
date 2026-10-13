/* ==========================================================
   Admin dashboard (front-end demo only)
   Data lives in memory, seeded from the current fulltime.html and
   reserves.html tables. Reloading the page resets it. To go live,
   replace the functions in the "Data layer" section with real
   fetch() calls; the UI code below does not need to change.
   ========================================================== */

(function () {
    'use strict';

    var SESSION_KEY = 'f1-admin';

    /* ---------- Session guard ---------- */

    var session = null;
    try { session = JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch (e) { /* ignore */ }
    if (!session) {
        window.location.replace('login.html');
        return;
    }

    /* ==========================================================
       Reference data
       ========================================================== */

    // key doubles as the CSS class from style.css that colours the row
    var TEAMS = [
        { key: 'redbull',  name: 'Oracle Red Bull Racing',      engine: 'Honda RBPT' },
        { key: 'mclaren',  name: 'McLaren Formula 1 Team',      engine: 'Mercedes' },
        { key: 'ferrari',  name: 'Scuderia Ferrari HP',         engine: 'Ferrari' },
        { key: 'mercedes', name: 'Mercedes-AMG Petronas',       engine: 'Mercedes' },
        { key: 'williams', name: 'Atlassian Williams',          engine: 'Mercedes' },
        { key: 'alpine',   name: 'BWT Alpine F1 Team',          engine: 'Renault' },
        { key: 'rb',       name: 'Visa Cash App Racing Bulls',  engine: 'Honda RBPT' },
        { key: 'aston',    name: 'Aston Martin Aramco',         engine: 'Mercedes' },
        { key: 'apxgp',    name: 'Expensify APXGP Hispania',    engine: 'Mercedes' },
        { key: 'haas',     name: 'MoneyGram Haas F1 Team',      engine: 'Ferrari' },
        { key: 'manor',    name: 'Pertamina Manor Andretti',    engine: 'Renault' },
        { key: 'sauber',   name: 'Stake F1 Team Kick Sauber',   engine: 'Ferrari' },
        { key: 'caterham', name: 'AirAsia Caterham F1 Team',    engine: 'Renault' }
    ];

    var TEAM = {};
    TEAMS.forEach(function (t) { TEAM[t.key] = t; });

    var STATUSES = {
        ft: ['First', 'Second'],
        res: ['Reserve']
    };

    var KIND_LABEL = {
        ft: { singular: 'full-time driver', plural: 'full-time drivers', list: 'Full Time Entries' },
        res: { singular: 'reserve driver', plural: 'reserve drivers', list: 'Reserves Entries' }
    };

    // [kind, teamKey, number, name, flag code, nationality, status, wikipedia]
    var SEED = [
        ["ft", "redbull", "1", "Max Verstappen", "nl", "Netherlands", "First", "https://en.wikipedia.org/wiki/Max_Verstappen"],
        ["ft", "redbull", "11", "Sergio Perez", "fr", "France", "Second", "https://en.wikipedia.org/wiki/Sergio_P%C3%A9rez"],
        ["ft", "mclaren", "4", "Choi Sooyoung", "mc", "Monaco", "First", "https://en.wikipedia.org/wiki/Choi_Sooyoung"],
        ["ft", "mclaren", "81", "Im Yoona", "ye", "Yemen", "Second", "https://en.wikipedia.org/wiki/Im_Yoona"],
        ["ft", "ferrari", "16", "Charles Leclerc", "mc", "Monaco", "First", "https://en.wikipedia.org/wiki/Charles_Leclerc"],
        ["ft", "ferrari", "55", "Carlos Sainz Jr", "es", "Spain", "Second", "https://en.wikipedia.org/wiki/Carlos_Sainz_Jr."],
        ["ft", "mercedes", "44", "Ning Yizhuo (Ningning)", "cn", "China", "First", "https://en.wikipedia.org/wiki/Ningning"],
        ["ft", "mercedes", "63", "Kim Minjeong (Winter)", "kr", "South Korea", "Second", "https://en.wikipedia.org/wiki/Winter_(singer)"],
        ["ft", "williams", "23", "Alexander Albon", "th", "Thailand", "First", "https://en.wikipedia.org/wiki/Alexander_Albon"],
        ["ft", "williams", "2", "Logan Sargeant", "au", "Australia", "Second", "https://en.wikipedia.org/wiki/Logan_Sargeant"],
        ["ft", "alpine", "10", "Shin Ryu-jin", "kr", "South Korea", "First", "https://en.wikipedia.org/wiki/Shin_Ryu-jin"],
        ["ft", "alpine", "31", "Choi Ji-su (Lia)", "ca", "Canada", "Second", "https://en.wikipedia.org/wiki/Lia_(singer)"],
        ["ft", "rb", "3", "Daniel Ricciardo", "au", "Australia", "First", "https://en.wikipedia.org/wiki/Daniel_Ricciardo"],
        ["ft", "rb", "22", "Yuki Tsunoda", "jp", "Japan", "Second", "https://en.wikipedia.org/wiki/Yuki_Tsunoda"],
        ["ft", "aston", "14", "Fernando Alonso", "nz", "New Zealand", "First", "https://en.wikipedia.org/wiki/Fernando_Alonso"],
        ["ft", "aston", "18", "Lance Stroll", "id", "Indonesia", "Second", "https://en.wikipedia.org/wiki/Lance_Stroll"],
        ["ft", "apxgp", "7", "Kim So-jeong (Sowon)", "au", "Australia", "First", "https://en.wikipedia.org/wiki/Kim_So-jung_(singer)"],
        ["ft", "apxgp", "9", "Choi Yu-na (Yuju)", "id", "Indonesia", "Second", "https://en.wikipedia.org/wiki/Choi_Yu-na"],
        ["ft", "haas", "27", "Jang Wonyoung", "kr", "South Korea", "First", "https://en.wikipedia.org/wiki/Jang_Wonyoung"],
        ["ft", "haas", "20", "Huh Yunjin", "us", "USA", "Second", "https://en.wikipedia.org/wiki/Huh_Yunjin"],
        ["ft", "manor", "19", "Jung Eun-bi (Eunha)", "nz", "New Zealand", "First", "https://en.wikipedia.org/wiki/Eunha"],
        ["ft", "manor", "26", "Kim Ye-won (Umji)", "id", "Indonesia", "Second", "https://en.wikipedia.org/wiki/Umji"],
        ["ft", "sauber", "77", "Lee Soon-kyu (Sunny)", "kr", "South Korea", "First", "https://en.wikipedia.org/wiki/Sunny_(singer)"],
        ["ft", "sauber", "24", "Lee Jieun (IU)", "kr", "South Korea", "Second", "https://en.wikipedia.org/wiki/IU_(singer)"],
        ["ft", "caterham", "37", "Nico Hulkenberg", "de", "Germany", "First", "https://en.wikipedia.org/wiki/Nico_H%C3%BClkenberg"],
        ["ft", "caterham", "87", "Kevin Magnussen", "dk", "Denmark", "Second", "https://en.wikipedia.org/wiki/Kevin_Magnussen"],
        ["res", "ferrari", "38", "Oliver Bearman", "gb", "Great Britain", "Reserve", "https://en.wikipedia.org/wiki/Oliver_Bearman"],
        ["res", "ferrari", "39", "Arthur Leclerc", "mc", "Monaco", "Reserve", "https://en.wikipedia.org/wiki/Arthur_Leclerc"],
        ["res", "haas", "51", "Choi Yena", "kr", "South Korea", "Reserve", "https://en.wikipedia.org/wiki/Choi_Yena"],
        ["res", "haas", "50", "Jo Yuri", "kr", "South Korea", "Reserve", "https://en.wikipedia.org/wiki/Jo_Yuri"],
        ["res", "haas", "36", "Kim Hyeong-seo (BIBI)", "id", "Indonesia", "Reserve", "https://en.wikipedia.org/wiki/Bibi_(singer)"],
        ["res", "haas", "99", "Lee Youngji", "id", "Indonesia", "Reserve", "https://en.wikipedia.org/wiki/Lee_Young-ji"],
        ["res", "sauber", "98", "Han Sohee", "kr", "South Korea", "Reserve", "https://en.wikipedia.org/wiki/Han_So-hee"],
        ["res", "sauber", "97", "Jessica Jung", "kr", "South Korea", "Reserve", "https://en.wikipedia.org/wiki/Jessica_Jung"],
        ["res", "redbull", "3", "Daniel Ricciardo", "au", "Australia", "Reserve", "https://en.wikipedia.org/wiki/Daniel_Ricciardo"],
        ["res", "redbull", "22", "Yuki Tsunoda", "jp", "Japan", "Reserve", "https://en.wikipedia.org/wiki/Yuki_Tsunoda"],
        ["res", "redbull", "30", "Liam Lawson", "us", "USA", "Reserve", "https://en.wikipedia.org/wiki/Liam_Lawson"],
        ["res", "redbull", "91", "Nikola Tsolov", "bg", "Bulgaria", "Reserve", "https://en.wikipedia.org/wiki/Nikola_Tsolov"],
        ["res", "redbull", "15", "Oliver Goethe", "sa", "Saudi Arabia", "Reserve", "https://en.wikipedia.org/wiki/Oliver_Goethe"],
        ["res", "redbull", "6", "Isack Hadjar", "jp", "Japan", "Reserve", "https://en.wikipedia.org/wiki/Isack_Hadjar"],
        ["res", "redbull", "41", "Arvid Lindblad", "jp", "Japan", "Reserve", "https://en.wikipedia.org/wiki/Arvid_Lindblad"],
        ["res", "redbull", "5", "Franco Colapinto", "ar", "Argentina", "Reserve", "https://en.wikipedia.org/wiki/Franco_Colapinto"],
        ["res", "rb", "30", "Liam Lawson", "us", "USA", "Reserve", "https://en.wikipedia.org/wiki/Liam_Lawson"],
        ["res", "rb", "6", "Isack Hadjar", "jp", "Japan", "Reserve", "https://en.wikipedia.org/wiki/Isack_Hadjar"],
        ["res", "rb", "41", "Arvid Lindblad", "jp", "Japan", "Reserve", "https://en.wikipedia.org/wiki/Arvid_Lindblad"],
        ["res", "rb", "40", "Ayumu Iwasa", "id", "Indonesia", "Reserve", "https://en.wikipedia.org/wiki/Ayumu_Iwasa"],
        ["res", "rb", "91", "Nikola Tsolov", "id", "Indonesia", "Reserve", "https://en.wikipedia.org/wiki/Nikola_Tsolov"],
        ["res", "rb", "15", "Oliver Goethe", "sa", "Saudi Arabia", "Reserve", "https://en.wikipedia.org/wiki/Oliver_Goethe"],
        ["res", "rb", "21", "Pepe Martí", "pt", "Portugal", "Reserve", "https://en.wikipedia.org/wiki/Pepe_Mart%C3%AD"],
        ["res", "mercedes", "42", "Aeri Uchinaga (Giselle)", "la", "Laos", "Reserve", "https://en.wikipedia.org/wiki/Giselle_(singer)"],
        ["res", "mercedes", "70", "Naoi Rei", "jp", "Japan", "Reserve", "https://en.wikipedia.org/wiki/Rei_Naoi"],
        ["res", "mercedes", "72", "Kim Minju", "kr", "South Korea", "Reserve", "https://en.wikipedia.org/wiki/Kim_Min-ju"],
        ["res", "mercedes", "12", "Yoo Jimin (Karina)", "kr", "South Korea", "Reserve", "https://en.wikipedia.org/wiki/Karina_(singer)"],
        ["res", "mclaren", "28", "Seo Juhyun (Seohyun)", "nl", "Netherlands", "Reserve", "https://en.wikipedia.org/wiki/Seohyun"],
        ["res", "mclaren", "29", "Kwon Yuri", "ir", "IR Iran", "Reserve", "https://en.wikipedia.org/wiki/Kwon_Yuri"],
        ["res", "mclaren", "89", "Kim Gaeul", "kr", "South Korea", "Reserve", "https://en.wikipedia.org/wiki/Gaeul"],
        ["res", "mclaren", "92", "Lee Hyunseo (Leeseo)", "id", "Indonesia", "Reserve", "https://en.wikipedia.org/wiki/Leeseo"],
        ["res", "mclaren", "74", "Kim Jiwon (Liz)", "de", "Germany", "Reserve", "https://en.wikipedia.org/wiki/Liz_(South_Korean_singer)"],
        ["res", "mclaren", "47", "An Yujin", "kr", "South Korea", "Reserve", "https://en.wikipedia.org/wiki/An_Yujin"],
        ["res", "williams", "46", "Park Jimin", "id", "Indonesia", "Reserve", "https://en.wikipedia.org/wiki/Jimin"],
        ["res", "williams", "45", "Jack Aitken", "id", "Indonesia", "Reserve", "https://en.wikipedia.org/wiki/Jack_Aitken"],
        ["res", "williams", "43", "Kim Taehyung (V)", "id", "Indonesia", "Reserve", "https://en.wikipedia.org/wiki/V_(singer)"],
        ["res", "aston", "34", "Felipe Drugovich", "id", "Indonesia", "Reserve", "https://en.wikipedia.org/wiki/Felipe_Drugovich"],
        ["res", "aston", "35", "Roman Staněk", "au", "Australia", "Reserve", "https://en.wikipedia.org/wiki/Roman_Stan%C4%9Bk"],
        ["res", "apxgp", "70", "Kim Ji-won (actress)", "id", "Indonesia", "Reserve", "https://en.wikipedia.org/wiki/Kim_Ji-won_(actress)"],
        ["res", "apxgp", "80", "Bae Jin-young (Punch)", "id", "Indonesia", "Reserve", "https://en.wikipedia.org/wiki/Punch_(singer)"],
        ["res", "apxgp", "90", "Park Sojin (Girl's Day)", "id", "Indonesia", "Reserve", "https://en.wikipedia.org/wiki/Park_So-jin"],
        ["res", "apxgp", "8", "Hwang Eun-bi (SinB)", "au", "Australia", "Reserve", "https://en.wikipedia.org/wiki/SinB"],
        ["res", "alpine", "13", "Shin Yu-na", "kr", "South Korea", "Reserve", "https://en.wikipedia.org/wiki/Shin_Yu-na"],
        ["res", "alpine", "61", "Hwang Ye-ji", "kr", "South Korea", "Reserve", "https://en.wikipedia.org/wiki/Hwang_Ye-ji"],
        ["res", "alpine", "62", "Lee Chae-ryeong", "kr", "South Korea", "Reserve", "https://en.wikipedia.org/wiki/Lee_Chae-ryeong"],
        ["res", "manor", "94", "Simona De Silvestro", "id", "Indonesia", "Reserve", "https://en.wikipedia.org/wiki/Simona_de_Silvestro"],
        ["res", "manor", "53", "Jung Ye-rin (Yerin)", "au", "Australia", "Reserve", "https://en.wikipedia.org/wiki/Yerin_(singer)"],
        ["res", "caterham", "82", "Valtteri Bottas", "au", "Australia", "Reserve", "https://en.wikipedia.org/wiki/Valtteri_Bottas"],
        ["res", "caterham", "88", "Zhou Guanyu", "au", "Australia", "Reserve", "https://en.wikipedia.org/wiki/Zhou_Guanyu"]
    ];

    // Extra countries so new drivers have more than the ones already in use
    var EXTRA_COUNTRIES = [
        ['it', 'Italy'], ['br', 'Brazil'], ['mx', 'Mexico'], ['fi', 'Finland'], ['se', 'Sweden'],
        ['ch', 'Switzerland'], ['at', 'Austria'], ['be', 'Belgium'], ['pl', 'Poland'], ['cz', 'Czechia'],
        ['in', 'India'], ['my', 'Malaysia'], ['ph', 'Philippines'], ['sg', 'Singapore'], ['ae', 'UAE'],
        ['za', 'South Africa'], ['ie', 'Ireland'], ['ca', 'Canada'], ['fr', 'France'], ['de', 'Germany']
    ];

    /* ==========================================================
       Data layer (in-memory stand-in for a real API)
       ========================================================== */

    var nextId = 1;
    var drivers = SEED.map(function (row) {
        return {
            id: nextId++, kind: row[0], teamKey: row[1], no: row[2], name: row[3],
            flag: row[4], nat: row[5], status: row[6], wiki: row[7] || ''
        };
    });

    var countries = (function () {
        var map = {};
        drivers.forEach(function (d) { map[d.flag] = d.nat; });
        EXTRA_COUNTRIES.forEach(function (c) { if (!map[c[0]]) map[c[0]] = c[1]; });
        return Object.keys(map)
            .map(function (code) { return { code: code, name: map[code] }; })
            .sort(function (a, b) { return a.name.localeCompare(b.name); });
    })();

    function insertDriver(driver) {
        driver.id = nextId++;
        // Keep new drivers grouped with their team, like the public tables
        var at = -1;
        drivers.forEach(function (d, i) {
            if (d.kind === driver.kind && d.teamKey === driver.teamKey) at = i;
        });
        if (at === -1) drivers.push(driver); else drivers.splice(at + 1, 0, driver);
        return driver;
    }

    function updateDriver(id, changes) {
        var d = findDriver(id);
        if (d) Object.assign(d, changes);
        return d;
    }

    function removeDriver(id) {
        var index = drivers.findIndex(function (d) { return d.id === id; });
        if (index === -1) return null;
        return { driver: drivers.splice(index, 1)[0], index: index };
    }

    function restoreDriver(removed) {
        drivers.splice(Math.min(removed.index, drivers.length), 0, removed.driver);
    }

    function findDriver(id) {
        return drivers.find(function (d) { return d.id === id; });
    }

    /* ==========================================================
       Helpers and element refs
       ========================================================== */

    function $(id) { return document.getElementById(id); }

    function esc(value) {
        return String(value).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    var els = {
        tabs: Array.prototype.slice.call(document.querySelectorAll('.tab')),
        search: $('search'), teamFilter: $('teamFilter'), addBtn: $('addBtn'),
        thead: $('thead'), tbody: $('tbody'), tableScroll: $('tableScroll'),
        empty: $('empty'), emptyText: $('emptyText'), emptyAction: $('emptyAction'),
        resultCount: $('resultCount'),
        dialog: $('driverDialog'), form: $('driverForm'), dialogTitle: $('driverDialogTitle'),
        no: $('f-no'), name: $('f-name'), wiki: $('f-wiki'), nat: $('f-nat'), team: $('f-team'),
        engine: $('f-engine'), engineField: $('engineField'), status: $('f-status'),
        flagPreview: $('flagPreview'),
        delDialog: $('deleteDialog'), delText: $('deleteText'),
        toast: $('toast'), toastMsg: $('toastMsg'), toastAction: $('toastAction')
    };

    var state = {
        tab: 'ft',
        query: '',
        team: 'all',
        editingId: null,
        deletingId: null,
        flashId: null
    };

    /* ==========================================================
       Rendering
       ========================================================== */

    function matches(d) {
        if (d.kind !== state.tab) return false;
        if (state.team !== 'all' && d.teamKey !== state.team) return false;
        if (!state.query) return true;
        var haystack = [d.no, d.name, d.nat, TEAM[d.teamKey].name, d.status].join(' ').toLowerCase();
        return haystack.indexOf(state.query) !== -1;
    }

    function statusBadgeClass(status) {
        if (status === 'First') return 'first';
        if (status === 'Second') return 'second';
        return 'reserve-badge';
    }

    function renderHead() {
        var cols = ['No', 'Driver', 'Nationality', 'Team'];
        if (state.tab === 'ft') cols.push('Engine');
        cols.push('Status', 'Actions');
        els.thead.innerHTML = '<tr>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr>';
    }

    function rowHtml(d) {
        var team = TEAM[d.teamKey];
        var name = esc(d.name);
        return '<tr class="' + d.teamKey + '" data-id="' + d.id + '">' +
            '<td>' + esc(d.no) + '</td>' +
            '<td class="driver-name">' + name + '</td>' +
            '<td><span class="nat-cell"><img class="flag" src="https://flagcdn.com/w20/' + esc(d.flag) +
            '.png" alt="">' + esc(d.nat) + '</span></td>' +
            '<td>' + esc(team.name) + '</td>' +
            (state.tab === 'ft' ? '<td>' + esc(team.engine) + '</td>' : '') +
            '<td><span class="badge ' + statusBadgeClass(d.status) + '">' + esc(d.status) + '</span></td>' +
            '<td><div class="row-actions">' +
            '<button type="button" class="row-btn" data-action="edit" data-id="' + d.id +
            '" aria-label="Edit ' + name + '">Edit</button>' +
            '<button type="button" class="row-btn danger" data-action="delete" data-id="' + d.id +
            '" aria-label="Delete ' + name + '">Delete</button>' +
            '</div></td></tr>';
    }

    function render() {
        var kindLabel = KIND_LABEL[state.tab];
        var inTab = drivers.filter(function (d) { return d.kind === state.tab; });
        var visible = drivers.filter(matches);

        // Tab counts
        $('count-ft').textContent = drivers.filter(function (d) { return d.kind === 'ft'; }).length;
        $('count-res').textContent = drivers.filter(function (d) { return d.kind === 'res'; }).length;

        els.addBtn.textContent = 'Add ' + kindLabel.singular;
        renderHead();
        els.tbody.innerHTML = visible.map(rowHtml).join('');

        var filtered = state.query || state.team !== 'all';
        els.tableScroll.hidden = visible.length === 0;
        els.empty.hidden = visible.length !== 0;

        if (visible.length === 0) {
            if (filtered) {
                els.emptyText.textContent = 'No ' + kindLabel.plural + ' match your search or filter.';
                els.emptyAction.textContent = 'Clear search and filter';
                els.emptyAction.dataset.mode = 'clear';
            } else {
                els.emptyText.textContent = 'There are no ' + kindLabel.plural + ' yet.';
                els.emptyAction.textContent = 'Add ' + kindLabel.singular;
                els.emptyAction.dataset.mode = 'add';
            }
        }

        els.resultCount.textContent = filtered
            ? 'Showing ' + visible.length + ' of ' + inTab.length + ' ' + kindLabel.plural + '.'
            : inTab.length + ' ' + kindLabel.plural + ' in ' + kindLabel.list + '.';

        // One-off highlight for the row that was just added or edited
        if (state.flashId !== null) {
            var row = els.tbody.querySelector('tr[data-id="' + state.flashId + '"]');
            if (row) {
                row.classList.add('flash');
                row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
            state.flashId = null;
        }
    }

    function renderTabs() {
        els.tabs.forEach(function (tab) {
            var selected = tab.dataset.kind === state.tab;
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
        });
        $('panel').setAttribute('aria-labelledby', 'tab-' + state.tab);
    }

    /* ==========================================================
       Filters and tabs
       ========================================================== */

    els.teamFilter.innerHTML = '<option value="all">All teams</option>' +
        TEAMS.map(function (t) { return '<option value="' + t.key + '">' + esc(t.name) + '</option>'; }).join('');

    els.search.addEventListener('input', function () {
        state.query = els.search.value.toLowerCase().trim();
        render();
    });

    els.teamFilter.addEventListener('change', function () {
        state.team = els.teamFilter.value;
        render();
    });

    function selectTab(kind) {
        state.tab = kind;
        renderTabs();
        render();
    }

    els.tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { selectTab(tab.dataset.kind); });
        tab.addEventListener('keydown', function (e) {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            var next = els.tabs[(i + (e.key === 'ArrowRight' ? 1 : els.tabs.length - 1)) % els.tabs.length];
            selectTab(next.dataset.kind);
            next.focus();
        });
    });

    function clearFilters() {
        state.query = '';
        state.team = 'all';
        els.search.value = '';
        els.teamFilter.value = 'all';
    }

    els.emptyAction.addEventListener('click', function () {
        if (els.emptyAction.dataset.mode === 'add') {
            openForm(null);
        } else {
            clearFilters();
            render();
            els.search.focus();
        }
    });

    /* ==========================================================
       Add / edit form
       ========================================================== */

    els.nat.innerHTML = countries.map(function (c) {
        return '<option value="' + c.code + '">' + esc(c.name) + '</option>';
    }).join('');

    els.team.innerHTML = TEAMS.map(function (t) {
        return '<option value="' + t.key + '">' + esc(t.name) + '</option>';
    }).join('');

    function updateFlagPreview() {
        els.flagPreview.src = 'https://flagcdn.com/w40/' + els.nat.value + '.png';
    }

    function updateEngine() {
        els.engine.value = TEAM[els.team.value].engine;
    }

    els.nat.addEventListener('change', updateFlagPreview);
    els.team.addEventListener('change', updateEngine);

    var fieldMap = {
        no: { input: els.no, error: $('e-no') },
        name: { input: els.name, error: $('e-name') },
        wiki: { input: els.wiki, error: $('e-wiki') },
        status: { input: els.status, error: $('e-status') }
    };

    function clearErrors() {
        Object.keys(fieldMap).forEach(function (key) {
            fieldMap[key].error.textContent = '';
            fieldMap[key].input.removeAttribute('aria-invalid');
        });
    }

    function openForm(driver) {
        var kind = driver ? driver.kind : state.tab;
        state.editingId = driver ? driver.id : null;
        clearErrors();

        els.dialogTitle.textContent = driver
            ? 'Edit ' + driver.name
            : 'Add ' + KIND_LABEL[kind].singular;

        els.status.innerHTML = STATUSES[kind].map(function (s) {
            return '<option value="' + s + '">' + s + '</option>';
        }).join('');
        els.engineField.hidden = kind !== 'ft';

        els.no.value = driver ? driver.no : '';
        els.name.value = driver ? driver.name : '';
        els.wiki.value = driver ? driver.wiki : '';
        els.nat.value = driver ? driver.flag : countries[0].code;
        els.team.value = driver ? driver.teamKey : TEAMS[0].key;
        els.status.value = driver ? driver.status : STATUSES[kind][0];
        updateFlagPreview();
        updateEngine();

        els.dialog.dataset.kind = kind;
        els.dialog.showModal();
        els.name.focus();
    }

    function validateForm(kind) {
        var errors = {};
        var no = parseInt(els.no.value, 10);
        var name = els.name.value.trim();
        var wiki = els.wiki.value.trim();

        if (!els.no.value.trim() || isNaN(no) || no < 1 || no > 99) {
            errors.no = 'Enter a number from 1 to 99.';
        }
        if (!name) {
            errors.name = 'Enter the driver\'s name.';
        }
        if (wiki && !/^https?:\/\/\S+$/i.test(wiki)) {
            errors.wiki = 'Enter a full link that starts with http:// or https://.';
        }

        if (kind === 'ft') {
            // Race numbers are unique across the full-time grid
            var clash = drivers.find(function (d) {
                return d.kind === 'ft' && d.id !== state.editingId && parseInt(d.no, 10) === no;
            });
            if (!errors.no && clash) {
                errors.no = 'Number ' + no + ' already belongs to ' + clash.name + '.';
            }
        }
        return errors;
    }

    els.form.addEventListener('submit', function (event) {
        event.preventDefault();
        var kind = els.dialog.dataset.kind;
        var errors = validateForm(kind);
        clearErrors();

        var firstInvalid = null;
        ['no', 'status', 'name', 'wiki'].forEach(function (key) {
            if (errors[key]) {
                fieldMap[key].error.textContent = errors[key];
                fieldMap[key].input.setAttribute('aria-invalid', 'true');
                if (!firstInvalid) firstInvalid = fieldMap[key].input;
            }
        });
        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }

        var data = {
            kind: kind,
            teamKey: els.team.value,
            no: String(parseInt(els.no.value, 10)),
            name: els.name.value.trim(),
            wiki: els.wiki.value.trim(),
            flag: els.nat.value,
            nat: els.nat.options[els.nat.selectedIndex].text,
            status: els.status.value
        };

        var saved;
        var verb;
        if (state.editingId !== null) {
            saved = updateDriver(state.editingId, data);
            verb = 'saved';
        } else {
            saved = insertDriver(data);
            verb = 'added';
        }

        // Make sure the person can see the row they just changed
        state.tab = kind;
        clearFilters();
        state.flashId = saved.id;
        els.dialog.close();
        renderTabs();
        render();
        showToast(saved.name + ' ' + verb + '.');
    });

    els.addBtn.addEventListener('click', function () { openForm(null); });
    $('cancelBtn').addEventListener('click', function () { els.dialog.close(); });

    // Clicking the dimmed backdrop closes a dialog
    [els.dialog, els.delDialog].forEach(function (dlg) {
        dlg.addEventListener('click', function (e) {
            if (e.target === dlg) dlg.close();
        });
    });

    /* ==========================================================
       Row actions: edit and delete (with undo)
       ========================================================== */

    els.tbody.addEventListener('click', function (event) {
        var btn = event.target.closest('button[data-action]');
        if (!btn) return;
        var id = parseInt(btn.dataset.id, 10);
        var driver = findDriver(id);
        if (!driver) return;

        if (btn.dataset.action === 'edit') {
            openForm(driver);
        } else {
            state.deletingId = id;
            els.delText.textContent = 'This removes ' + driver.name + ' from ' +
                KIND_LABEL[driver.kind].list + '. You can undo it right after.';
            $('deleteTitle').textContent = 'Delete ' + driver.name + '?';
            els.delDialog.showModal();
            $('deleteCancel').focus();
        }
    });

    $('deleteCancel').addEventListener('click', function () { els.delDialog.close(); });

    $('deleteConfirm').addEventListener('click', function () {
        var removed = removeDriver(state.deletingId);
        els.delDialog.close();
        if (!removed) return;
        render();
        showToast(removed.driver.name + ' deleted.', {
            label: 'Undo',
            onClick: function () {
                restoreDriver(removed);
                state.flashId = removed.driver.id;
                state.tab = removed.driver.kind;
                renderTabs();
                render();
                showToast(removed.driver.name + ' restored.');
            }
        });
    });

    /* ==========================================================
       Toast
       ========================================================== */

    var toastTimer = null;
    var toastHandler = null;

    function showToast(message, action) {
        clearTimeout(toastTimer);
        els.toastMsg.textContent = message;
        toastHandler = action ? action.onClick : null;
        els.toastAction.hidden = !action;
        if (action) els.toastAction.textContent = action.label;
        els.toast.classList.add('show');
        toastTimer = setTimeout(hideToast, action ? 7000 : 3500);
    }

    function hideToast() {
        els.toast.classList.remove('show');
        toastHandler = null;
    }

    els.toastAction.addEventListener('click', function () {
        var handler = toastHandler;
        hideToast();
        if (handler) handler();
    });

    /* ==========================================================
       Session bar
       ========================================================== */

    $('navUser').textContent = 'Signed in as ' + session.user;

    $('logoutBtn').addEventListener('click', function () {
        try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
        window.location.href = 'login.html?out=1';
    });

    /* ---------- Go ---------- */

    renderTabs();
    render();
})();
