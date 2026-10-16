/* ==========================================================================
   Areoy Proxy — browser-chrome.js
   Renders proxied pages inside #browser-chrome.

   Responsibilities:
     1. Open a "tab" in the chrome shell when something navigates to a URL.
     2. Manage per-tab history (back / forward / reload).
     3. Keep the URL pill, favicon, title, and loading bar in sync.
     4. Wire the ⋮ menu, new-tab button, tab close, and status bar.
     5. Close the chrome and return to the landing page via the Home button.

   Public API:
     window.areoyOpenUrl(url, opts)   — open url in a new (or current) tab
     window.areoyCloseChrome()        — close chrome, show landing page

   The chrome is driven purely by CSS classes (see browser-chrome.css):
     #browser-chrome.is-open           — chrome visible
     body.chrome-open                  — landing hidden, scroll locked
     #browser-chrome.is-loading        — loading bar visible
     .chrome-progress-fill.is-indeterminate — looping bar
     .chrome-btn:disabled              — greyed nav buttons
     .chrome-btn.is-loading            — spinning reload icon
     .chrome-tab.is-active             — highlighted tab
     .chrome-frame.is-ready            — iframe faded in
     .chrome-error.is-visible          — error card shown
     .chrome-statusbar.is-visible      — status text visible
   ========================================================================== */

(function () {
    "use strict";

    // ----------------------------------------------------------------------
    // DOM
    // ----------------------------------------------------------------------
    var chrome       = document.getElementById("browser-chrome");
    if (!chrome) return;

    var backBtn      = document.getElementById("chrome-back");
    var fwdBtn       = document.getElementById("chrome-forward");
    var reloadBtn    = document.getElementById("chrome-reload");
    var homeBtn      = document.getElementById("chrome-home");
    var urlInput     = document.getElementById("chrome-url");
    var urlIcon      = document.getElementById("chrome-url-icon");
    var urlAction    = document.getElementById("chrome-url-action");
    var menuBtn      = document.getElementById("chrome-menu-btn");
    var menu         = document.getElementById("chrome-menu");
    var progressFill = chrome.querySelector(".chrome-progress-fill");
    var tabsEl       = document.getElementById("chrome-tabs");
    var viewport     = chrome.querySelector(".chrome-viewport");
    var emptyEl      = document.getElementById("chrome-empty");
    var errorEl      = document.getElementById("chrome-error");
    var errorDetail  = document.getElementById("chrome-error-detail");
    var errorRetry   = document.getElementById("chrome-error-retry");
    var statusbar    = document.getElementById("chrome-statusbar");

    // ----------------------------------------------------------------------
    // Icons (inline SVG strings so we don't need an icon font)
    // ----------------------------------------------------------------------
    var ICONS = {
        back:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>',
        forward:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>',
        reload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
        home:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        menu:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>',
        lock:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
        warn:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        globe:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        x:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        plus:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
    };

    // Inject icons into the fixed nav buttons
    backBtn.innerHTML   = ICONS.back;
    fwdBtn.innerHTML    = ICONS.forward;
    reloadBtn.innerHTML = ICONS.reload;
    homeBtn.innerHTML   = ICONS.home;
    menuBtn.innerHTML   = ICONS.menu;
    urlAction.innerHTML = ICONS.x;

    // ----------------------------------------------------------------------
    // Tab store
    // ----------------------------------------------------------------------
    var tabs = [];          // [{ id, url, title, history:[], index, iframe, ready, loading }]
    var activeId = null;
    var nextId = 1;

    function activeTab() {
        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].id === activeId) return tabs[i];
        }
        return null;
    }

    // ----------------------------------------------------------------------
    // URL helpers
    // ----------------------------------------------------------------------
    function isHttpUrl(value) {
        return /^https?:\/\//i.test(String(value || "").trim());
    }

    function looksLikeUrl(value) {
        var v = String(value || "").trim();
        if (!v) return false;
        if (isHttpUrl(v)) return true;
        if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(v)) return true;
        if (/^localhost(:\d+)?(\/\S*)?$/i.test(v)) return true;
        return false;
    }

    function normalizeUrl(value) {
        var v = String(value || "").trim();
        if (!v) return "";
        if (!isHttpUrl(v)) v = "https://" + v;
        try { return new URL(v).href; } catch (_) { return ""; }
    }

    function hostnameOf(url) {
        try { return new URL(url).hostname; } catch (_) { return ""; }
    }

    function faviconFor(url) {
        var h = hostnameOf(url);
        if (!h) return "";
        return "https://www.google.com/s2/favicons?domain=" +
            encodeURIComponent(h) + "&sz=32";
    }

    // The search template used by the landing page (kept in sync with it).
    function searchTemplate() {
        var el = document.getElementById("sj-search-engine");
        return (el && el.value) || "https://duckduckgo.com/?q=%s";
    }

    // ----------------------------------------------------------------------
    // Chrome visibility
    // ----------------------------------------------------------------------
    function openChrome() {
        chrome.classList.add("is-open");
        document.body.classList.add("chrome-open");
    }

    function closeChrome() {
        chrome.classList.remove("is-open");
        document.body.classList.remove("chrome-open");
    }
    window.areoyCloseChrome = closeChrome;

    // ----------------------------------------------------------------------
    // Loading bar
    // ----------------------------------------------------------------------
    function setLoading(on, indeterminate) {
        if (!progressFill) return;
        if (on) {
            chrome.classList.add("is-loading");
            progressFill.classList.toggle("is-indeterminate", !!indeterminate);
            if (!indeterminate) progressFill.style.width = "30%";
        } else {
            progressFill.style.width = "100%";
            progressFill.classList.remove("is-indeterminate");
            // Let the width transition finish, then hide.
            setTimeout(function () {
                chrome.classList.remove("is-loading");
                progressFill.style.width = "0%";
            }, 220);
        }
    }

    // ----------------------------------------------------------------------
    // URL icon (lock vs warning vs globe)
    // ----------------------------------------------------------------------
    function updateUrlIcon(url) {
        if (!urlIcon) return;
        urlIcon.classList.remove("is-secure", "is-insecure");
        if (!url) { urlIcon.innerHTML = ICONS.globe; return; }
        if (/^https:\/\//i.test(url)) {
            urlIcon.innerHTML = ICONS.lock;
            urlIcon.classList.add("is-secure");
        } else if (/^http:\/\//i.test(url)) {
            urlIcon.innerHTML = ICONS.warn;
            urlIcon.classList.add("is-insecure");
        } else {
            urlIcon.innerHTML = ICONS.globe;
        }
    }

    // ----------------------------------------------------------------------
    // Error card
    // ----------------------------------------------------------------------
    function showError(message, detail) {
        if (!errorEl) return;
        errorEl.classList.add("is-visible");
        if (message) {
            var t = errorEl.querySelector(".chrome-error-title");
            if (t) t.textContent = message;
        }
        if (errorDetail) errorDetail.textContent = detail || "";
    }

    function hideError() {
        if (errorEl) errorEl.classList.remove("is-visible");
    }

    // ----------------------------------------------------------------------
    // Status bar (bottom-left hint)
    // ----------------------------------------------------------------------
    function setStatus(text) {
        if (!statusbar) return;
        if (text) {
            statusbar.textContent = text;
            statusbar.classList.add("is-visible");
        } else {
            statusbar.classList.remove("is-visible");
        }
    }

    // ----------------------------------------------------------------------
    // Tab bar rendering
    // ----------------------------------------------------------------------
    function renderTabs() {
        if (!tabsEl) return;
        tabsEl.innerHTML = "";

        tabs.forEach(function (tab) {
            var el = document.createElement("button");
            el.type = "button";
            el.className = "chrome-tab" + (tab.id === activeId ? " is-active" : "");
            el.setAttribute("role", "tab");
            el.setAttribute("aria-selected", tab.id === activeId ? "true" : "false");

            var fav = document.createElement("img");
            fav.className = "chrome-tab-favicon";
            fav.alt = "";
            fav.src = faviconFor(tab.url);

            var title = document.createElement("span");
            title.className = "chrome-tab-title";
            title.textContent = tab.title || hostnameOf(tab.url) || "New tab";

            var close = document.createElement("button");
            close.type = "button";
            close.className = "chrome-tab-close";
            close.setAttribute("aria-label", "Close tab");
            close.innerHTML = ICONS.x;
            close.addEventListener("click", function (e) {
                e.stopPropagation();
                closeTab(tab.id);
            });

            el.appendChild(fav);
            el.appendChild(title);
            el.appendChild(close);
            el.addEventListener("click", function () { switchTab(tab.id); });

            tabsEl.appendChild(el);
        });

        // New-tab button
        var add = document.createElement("button");
        add.type = "button";
        add.className = "chrome-newtab";
        add.setAttribute("aria-label", "New tab");
        add.innerHTML = ICONS.plus;
        add.addEventListener("click", function () { openUrl("about:newtab"); });
        tabsEl.appendChild(add);
    }

    // ----------------------------------------------------------------------
    // Frame creation
    // ----------------------------------------------------------------------
    function createFrame(tab) {
        var frame = document.createElement("iframe");
        frame.className = "chrome-frame";
        frame.setAttribute("allow", "clipboard-read; clipboard-write; fullscreen");
        frame.setAttribute("sandbox",
            "allow-forms allow-modals allow-orientation-lock allow-pointer-lock " +
            "allow-popups allow-popups-to-escape-sandbox allow-presentation " +
            "allow-same-origin allow-scripts allow-top-navigation-by-user-activation");
        frame.setAttribute("referrerpolicy", "no-referrer");
        tab.iframe = frame;

        frame.addEventListener("load", function () {
            tab.ready = true;
            tab.loading = false;
            frame.classList.add("is-ready");
            hideError();
            setLoading(false);

            // Try to read the iframe's title / URL. Cross-origin will throw,
            // which is fine — we fall back to the URL we navigated to.
            try {
                var doc = frame.contentDocument;
                if (doc && doc.title) tab.title = doc.title;
            } catch (_) { /* cross-origin — ignore */ }
            renderTabs();
        });

        viewport.appendChild(frame);
    }

    // ----------------------------------------------------------------------
    // Navigation
    // ----------------------------------------------------------------------
    function navigateTo(tab, url, push) {
        if (!tab) return;
        if (push !== false) {
            // Truncate forward history, then append.
            tab.history = tab.history.slice(0, tab.index + 1);
            tab.history.push(url);
            tab.index = tab.history.length - 1;
        }
        tab.url = url;
        tab.loading = true;
        tab.ready = false;
        if (tab.iframe) tab.iframe.classList.remove("is-ready");

        updateUrlIcon(url);
        if (urlInput && tab.id === activeId) urlInput.value = url;

        if (url === "about:newtab") {
            if (tab.iframe) tab.iframe.remove(), tab.iframe = null;
            if (emptyEl) emptyEl.style.display = "";
            if (tab.id === activeId) {
                if (urlInput) urlInput.value = "";
                updateUrlIcon("");
                updateNavButtons();
            }
            renderTabs();
            return;
        }

        if (emptyEl) emptyEl.style.display = "none";
        hideError();
        setLoading(true, true);

        if (!tab.iframe) createFrame(tab);

        // Use the proxied navigate helper if index.js provides one;
        // otherwise set src directly.
        if (typeof window.__areoyNavigate === "function") {
            try {
                window.__areoyNavigate(url, tab.iframe);
            } catch (err) {
                tab.iframe.src = url;
            }
        } else {
            tab.iframe.src = url;
        }

        renderTabs();
        if (tab.id === activeId) updateNavButtons();
    }

    function updateNavButtons() {
        var tab = activeTab();
        var canBack = tab && tab.index > 0;
        var canFwd  = tab && tab.index < tab.history.length - 1;
        if (backBtn) backBtn.disabled = !canBack;
        if (fwdBtn)  fwdBtn.disabled  = !canFwd;
        if (reloadBtn) reloadBtn.classList.toggle("is-loading", !!(tab && tab.loading));
    }

    // ----------------------------------------------------------------------
    // Tab actions
    // ----------------------------------------------------------------------
    function openUrl(url, opts) {
        opts = opts || {};
        url = normalizeUrl(url) || url;

        openChrome();

        var tab;
        if (opts.newTab || !activeTab()) {
            tab = {
                id: nextId++,
                url: "",
                title: "",
                history: [],
                index: -1,
                iframe: null,
                ready: false,
                loading: false
            };
            tabs.push(tab);
            activeId = tab.id;
        } else {
            tab = activeTab();
        }

        navigateTo(tab, url, true);
    }
    window.areoyOpenUrl = openUrl;

    function switchTab(id) {
        if (id === activeId) return;
        activeId = id;
        var tab = activeTab();
        if (!tab) return;

        // Toggle iframe visibility
        tabs.forEach(function (t) {
            if (t.iframe) t.iframe.hidden = (t.id !== id);
        });

        if (emptyEl) emptyEl.style.display = tab.url === "about:newtab" ? "" : "none";
        if (urlInput) urlInput.value = tab.url === "about:newtab" ? "" : tab.url;
        updateUrlIcon(tab.url === "about:newtab" ? "" : tab.url);
        updateNavButtons();
        renderTabs();
    }

    function closeTab(id) {
        var i = tabs.findIndex(function (t) { return t.id === id; });
        if (i < 0) return;
        var tab = tabs[i];
        if (tab.iframe && tab.iframe.parentNode) tab.iframe.parentNode.removeChild(tab.iframe);
        tabs.splice(i, 1);

        if (tabs.length === 0) {
            closeChrome();
            return;
        }
        if (activeId === id) {
            var next = tabs[Math.max(0, i - 1)];
            activeId = next.id;
            switchTab(next.id);
        } else {
            renderTabs();
        }
    }

    // ----------------------------------------------------------------------
    // Nav button handlers
    // ----------------------------------------------------------------------
    backBtn.addEventListener("click", function () {
        var tab = activeTab();
        if (!tab || tab.index <= 0) return;
        tab.index -= 1;
        navigateTo(tab, tab.history[tab.index], false);
    });

    fwdBtn.addEventListener("click", function () {
        var tab = activeTab();
        if (!tab || tab.index >= tab.history.length - 1) return;
        tab.index += 1;
        navigateTo(tab, tab.history[tab.index], false);
    });

    reloadBtn.addEventListener("click", function () {
        var tab = activeTab();
        if (!tab) return;
        if (tab.url && tab.url !== "about:newtab" && tab.iframe) {
            tab.loading = true;
            updateNavButtons();
            setLoading(true, true);
            // Force a reload
            tab.iframe.src = tab.iframe.src;
        }
    });

    homeBtn.addEventListener("click", function () {
        closeChrome();
    });

    // ----------------------------------------------------------------------
    // URL input
    // ----------------------------------------------------------------------
    urlInput.addEventListener("focus", function () {
        urlInput.select();
    });

    urlInput.addEventListener("input", function () {
        if (urlAction) urlAction.hidden = urlInput.value.length === 0;
    });

    urlInput.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        e.preventDefault();
        var raw = urlInput.value.trim();
        if (!raw) return;

        var target;
        if (looksLikeUrl(raw)) {
            target = normalizeUrl(raw);
        } else {
            target = searchTemplate().replace("%s", encodeURIComponent(raw));
        }
        openUrl(target);
    });

    urlAction.addEventListener("click", function () {
        urlInput.value = "";
        urlAction.hidden = true;
        urlInput.focus();
    });

    // ----------------------------------------------------------------------
    // Menu
    // ----------------------------------------------------------------------
    menuBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (menu) menu.hidden = !menu.hidden;
    });

    document.addEventListener("click", function (e) {
        if (!menu || menu.hidden) return;
        if (menu.contains(e.target) || menuBtn.contains(e.target)) return;
        menu.hidden = true;
    });

    if (menu) {
        menu.addEventListener("click", function (e) {
            var btn = e.target.closest(".chrome-menu-item");
            if (!btn) return;
            var action = btn.getAttribute("data-action");
            menu.hidden = true;

            if (action === "newtab") openUrl("about:newtab");
            else if (action === "reload") reloadBtn.click();
            else if (action === "home") closeChrome();
            else if (action === "close") closeChrome();
        });
    }

    // ----------------------------------------------------------------------
    // Error retry
    // ----------------------------------------------------------------------
    if (errorRetry) {
        errorRetry.addEventListener("click", function () {
            hideError();
            var tab = activeTab();
            if (tab) navigateTo(tab, tab.url, false);
        });
    }

    // ----------------------------------------------------------------------
    // Keyboard shortcuts (Ctrl/Cmd+T, Ctrl/Cmd+W, Ctrl/Cmd+L, Alt+Left/Right)
    // ----------------------------------------------------------------------
    document.addEventListener("keydown", function (e) {
        if (!chrome.classList.contains("is-open")) return;
        var mod = e.ctrlKey || e.metaKey;

        if (mod && e.key.toLowerCase() === "t") {
            e.preventDefault();
            openUrl("about:newtab");
        } else if (mod && e.key.toLowerCase() === "w") {
            e.preventDefault();
            if (activeId != null) closeTab(activeId);
        } else if (mod && e.key.toLowerCase() === "l") {
            e.preventDefault();
            urlInput.focus();
        } else if (e.altKey && e.key === "ArrowLeft") {
            e.preventDefault();
            backBtn.click();
        } else if (e.altKey && e.key === "ArrowRight") {
            e.preventDefault();
            fwdBtn.click();
        }
    });

    // ----------------------------------------------------------------------
    // Escape closes menu
    // ----------------------------------------------------------------------
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && menu && !menu.hidden) menu.hidden = true;
    });

    // ----------------------------------------------------------------------
    // Status bar on link hover inside the iframe
    // ----------------------------------------------------------------------
    // The landing search form and quick-apps tiles call areoyOpenUrl directly.
    // The proxied iframe's internal link hovers are handled by the service
    // worker and postMessage (see postMessage listener below).
    window.addEventListener("message", function (e) {
        var data = e.data;
        if (!data || typeof data !== "object") return;

        if (data.type === "areoy:status") {
            setStatus(data.text || "");
        } else if (data.type === "areoy:title") {
            var tab = activeTab();
            if (tab) { tab.title = data.text || tab.title; renderTabs(); }
        } else if (data.type === "areoy:navigate") {
            var t = activeTab();
            if (t) navigateTo(t, data.url, true);
        }
    });

    // ----------------------------------------------------------------------
    // Wire the landing-page search form to open in the chrome instead of
    // navigating the whole tab.
    // ----------------------------------------------------------------------
    var landingForm = document.getElementById("sj-form");
    if (landingForm) {
        landingForm.addEventListener("submit", function (e) {
            e.preventDefault();
            var input = document.getElementById("sj-address");
            var engine = document.getElementById("sj-search-engine");
            var v = input && input.value.trim();
            if (!v) return;

            var target;
            if (looksLikeUrl(v)) {
                target = normalizeUrl(v);
            } else {
                var tmpl = (engine && engine.value) || "https://duckduckgo.com/?q=%s";
                target = tmpl.replace("%s", encodeURIComponent(v));
            }
            openUrl(target);
        }, true); // capture phase so it runs before the other submit handler
    }

    // Same for quick-app tiles — intercept clicks so they open in the chrome.
    var appsGrid = document.getElementById("apps-grid");
    if (appsGrid) {
        appsGrid.addEventListener("click", function (e) {
            var tile = e.target.closest(".app-tile");
            if (!tile) return;
            if (appsGrid.classList.contains("is-editing")) return;
            var href = tile.getAttribute("href");
            if (!href) return;
            e.preventDefault();
            e.stopPropagation();
            openUrl(href);
        }, true);
    }

    // ----------------------------------------------------------------------
    // Initial state — chrome is hidden until something calls areoyOpenUrl()
    // ----------------------------------------------------------------------
    closeChrome();
    renderTabs();
    updateNavButtons();

})();
