/* ==========================================================
   Login page (front-end demo only)
   There is no server check: any non-empty username and password
   signs you in. The "session" is a flag in sessionStorage that
   admin.html looks for. Replace validate/sign-in with a real
   request when a back end exists.
   ========================================================== */

(function () {
    'use strict';

    var SESSION_KEY = 'f1-admin';
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var form = document.getElementById('loginForm');
    var userInput = document.getElementById('username');
    var passInput = document.getElementById('password');
    var userError = document.getElementById('username-error');
    var passError = document.getElementById('password-error');
    var toggle = document.getElementById('pwToggle');
    var submitBtn = document.getElementById('submitBtn');
    var banner = document.getElementById('banner');
    var lights = Array.prototype.slice.call(document.querySelectorAll('.light'));
    var timers = [];

    /* ---------- Already signed in? Skip straight to the dashboard ---------- */

    var existing = null;
    try { existing = sessionStorage.getItem(SESSION_KEY); } catch (e) { /* storage blocked */ }
    if (existing) {
        window.location.replace('admin.html');
        return;
    }

    /* ---------- "You've been signed out" notice ---------- */

    if (new URLSearchParams(window.location.search).get('out') === '1') {
        banner.textContent = 'You have been signed out.';
        banner.hidden = false;
    }

    /* ---------- Start lights: light up one by one on load ---------- */

    function lightsOn() {
        if (reduceMotion) {
            lights.forEach(function (l) { l.classList.add('on'); });
            return;
        }
        lights.forEach(function (light, i) {
            timers.push(setTimeout(function () { light.classList.add('on'); }, 350 + i * 400));
        });
    }

    function lightsOut() {
        timers.forEach(clearTimeout);
        lights.forEach(function (l) { l.classList.remove('on'); });
    }

    lightsOn();

    /* ---------- Show / hide password ---------- */

    toggle.addEventListener('click', function () {
        var show = passInput.type === 'password';
        passInput.type = show ? 'text' : 'password';
        toggle.textContent = show ? 'Hide' : 'Show';
        toggle.setAttribute('aria-pressed', String(show));
    });

    /* ---------- Validation ---------- */

    function setError(input, errorEl, message) {
        errorEl.textContent = message;
        if (message) {
            input.setAttribute('aria-invalid', 'true');
        } else {
            input.removeAttribute('aria-invalid');
        }
    }

    function validate() {
        var user = userInput.value.trim();
        var pass = passInput.value;

        setError(userInput, userError, user ? '' : 'Enter your username.');
        setError(passInput, passError, pass ? '' : 'Enter your password.');

        if (!user) { userInput.focus(); return false; }
        if (!pass) { passInput.focus(); return false; }
        return true;
    }

    userInput.addEventListener('input', function () { setError(userInput, userError, ''); });
    passInput.addEventListener('input', function () { setError(passInput, passError, ''); });

    /* ---------- Submit ---------- */

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!validate()) return;

        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({
                user: userInput.value.trim(),
                at: Date.now()
            }));
        } catch (e) {
            banner.textContent = 'Your browser is blocking storage, so the demo session could not start.';
            banner.hidden = false;
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in…';

        // Lights out, and away we go.
        lightsOut();
        setTimeout(function () {
            window.location.href = 'admin.html';
        }, reduceMotion ? 0 : 700);
    });
})();
