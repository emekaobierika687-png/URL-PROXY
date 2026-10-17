/* ==========================================================================
   Areoy Proxy — settings.js
   Full settings overlay with API-based local storage (localStorage + cookies).
   ========================================================================== */

(function () {
    "use strict";

    // ----------------------------------------------------------------------
    // API Storage Layer (Simulating a Backend)
    // ----------------------------------------------------------------------
    var API = {
        // Caches data to localStorage
        cache: {
            set: function (key, value) {
                try {
                    localStorage.setItem("areoy_settings_" + key, JSON.stringify(value));
                } catch (e) {
                    console.error("Cache write failed", e);
                }
            },
            get: function (key, fallback) {
                try {
                    var raw = localStorage.getItem("areoy_settings_" + key);
                    return raw ? JSON.parse(raw) : fallback;
                } catch (e) {
                    return fallback;
                }
            }
        },
        // Persists critical identity data to Cookies
        cookies: {
            set: function (name, value, days) {
                var expires = "";
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    expires = "; expires=" + date.toUTCString();
                }
                document.cookie = "areoy_" + name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
            },
            get: function (name) {
                var nameEQ = "areoy_" + name + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
                }
                return null;
            }
        },
        // Mock API Call to get all settings
        getSettings: function () {
            var defaults = {
                theme: "dark",
                accentColor: "#ff6b4a",
                searchEngine: "https://search.brave.com/search?q=%s",
                userAgent: "default"
            };
            
            var stored = API.cache.get("all", null);
            if (stored) return Object.assign({}, defaults, stored);
            
            // Fallback: try to rebuild from individual cookies if cache is cleared
            var theme = API.cookies.get("theme") || defaults.theme;
            var accent = API.cookies.get("accent") || defaults.accentColor;
            
            return Object.assign({}, defaults, { theme: theme, accentColor: accent });
        },
        // Mock API Call to save a setting
        saveSetting: function (key, value) {
            // 1. Save to primary Cache
            var current = API.cache.get("all", {});
            current[key] = value;
            API.cache.set("all", current);

            // 2. Save to Cookies for redundancy (like a server-side session)
            if (key === "theme" || key === "accentColor" || key === "userAgent") {
                API.cookies.set(key, value, 30); // 30 day expiry
            }
        }
    };


    // ----------------------------------------------------------------------
    // DOM Elements
    // ----------------------------------------------------------------------
    var panel   = document.getElementById("settings-panel");
    var nav     = document.getElementById("settings-nav-list");
    var content = document.getElementById("settings-content");
    var closeX  = document.getElementById("settings-close");

    if (!panel || !nav || !content) return;

    // ----------------------------------------------------------------------
    // State Management
    // ----------------------------------------------------------------------
    var settings = API.getSettings();

    function saveSetting(key, value) {
        settings[key] = value;
        API.saveSetting(key, value);
        applySettings();
    }

    function applySettings() {
        // 1. Theme
        if (settings.theme === "system") {
            var isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
        } else {
            document.documentElement.setAttribute("data-theme", settings.theme);
        }
        
        // 2. Accent Color
        document.documentElement.style.setProperty('--accent-color', settings.accentColor);
        document.documentElement.style.setProperty('--accent-glow', settings.accentColor + '26');

        // 3. Search Engine
        var searchInput = document.getElementById("sj-search-engine");
        if (searchInput) searchInput.value = settings.searchEngine;

        // 4. User Agent
        window.__areoyUserAgent = settings.userAgent;
    }

    // Apply immediately on load
    applySettings();

    // ----------------------------------------------------------------------
    // SVG Icons
    // ----------------------------------------------------------------------
    var ICONS = {
        search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        appearance: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>',
        chat: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        music: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>',
        proxy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
        cloaking: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle><line x1="3" y1="3" x2="21" y2="21"></line></svg>',
        data: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>',
        dev: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg>',
        legal: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
        about: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
        credits: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>'
    };

    // ----------------------------------------------------------------------
    // Tabs Configuration
    // ----------------------------------------------------------------------
    var TABS = [
        { id: "appearance", label: "Appearance", icon: ICONS.appearance },
        { id: "search",     label: "Search",     icon: ICONS.search },
        { id: "chat",       label: "Chat",       icon: ICONS.chat },
        { id: "music",      label: "Music",      icon: ICONS.music },
        { id: "proxy",      label: "Proxy",      icon: ICONS.proxy },
        { id: "cloaking",   label: "Cloaking",   icon: ICONS.cloaking },
        { id: "data",       label: "Data",       icon: ICONS.data },
        { id: "dev",        label: "Dev",        icon: ICONS.dev },
        { id: "legal",      label: "Legal",      icon: ICONS.legal },
        { id: "about",      label: "About",      icon: ICONS.about },
        { id: "credits",    label: "Credits",    icon: ICONS.credits }
    ];

    // ----------------------------------------------------------------------
    // Utilities
    // ----------------------------------------------------------------------
    function escapeHtml(s) {
        return String(s == null ? "" : s)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    // ----------------------------------------------------------------------
    // Navigation & Routing
    // ----------------------------------------------------------------------
    function renderNav(activeId) {
        nav.innerHTML = "";
        TABS.forEach(function (t) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "settings-nav-item" + (t.id === activeId ? " is-active" : "");
            b.innerHTML = '<span class="settings-nav-icon">' + t.icon + '</span><span>' + t.label + '</span>';
            b.addEventListener("click", function () { showPanel(t.id); });
            nav.appendChild(b);
        });
    }

    function showPanel(id) {
        renderNav(id);
        content.innerHTML = "";

        if (id === "appearance") return renderAppearance();
        if (id === "search")     return renderSearch();
        if (id === "proxy")      return renderProxy();
        if (id === "credits")    return renderCredits();
        
        // Placeholder
        var h = document.createElement("h2");
        h.className = "settings-h2";
        h.textContent = id.charAt(0).toUpperCase() + id.slice(1);
        var p = document.createElement("p");
        p.className = "settings-sub";
        p.textContent = "This section is under construction.";
        content.appendChild(h);
        content.appendChild(p);
    }

    // ----------------------------------------------------------------------
    // Panel: Appearance
    // ----------------------------------------------------------------------
    function renderAppearance() {
        var header = document.createElement("div");
        header.innerHTML = 
            '<h2 class="settings-h2">Appearance</h2>' +
            '<p class="settings-sub">Customize how Areoy looks.</p>';
        content.appendChild(header);

        // Accent Colors
        var accentGroup = document.createElement("div");
        accentGroup.className = "settings-card";
        accentGroup.innerHTML = 
            '<h3 class="settings-card-title">Accent</h3>' +
            '<p class="settings-card-desc">The color of buttons, highlights and the tab you are on.</p>' +
            '<div class="settings-color-grid" id="accent-grid"></div>';
        content.appendChild(accentGroup);

        var accentColors = [
            { name: "Cloud", hex: "#cbd5e1" }, { name: "Strawberry", hex: "#fca5a5" },
            { name: "Tangerine", hex: "#fdba74" }, { name: "Banana", hex: "#fde047" },
            { name: "Lime", hex: "#bef264" }, { name: "Mint", hex: "#a7f3d0" },
            { name: "Blueberry", hex: "#93c5fd" }, { name: "Grape", hex: "#c4b5fd" },
            { name: "Plum", hex: "#d8b4fe" }, { name: "Bubblegum", hex: "#f9a8d4" },
            { name: "Raspberry", hex: "#fda4af" }, { name: "Slate", hex: "#94a3b8" }
        ];

        var accentHtml = "";
        accentColors.forEach(c => {
            var activeClass = settings.accentColor === c.hex ? " is-active" : "";
            accentHtml += `<button class="settings-color-btn${activeClass}" data-color="${c.hex}" style="background-color: ${c.hex};">${c.name}</button>`;
        });
        document.getElementById("accent-grid").innerHTML = accentHtml;

        // Theme Grid
        var themeGroup = document.createElement("div");
        themeGroup.className = "settings-card";
        themeGroup.innerHTML = 
            '<h3 class="settings-card-title">Theme</h3>' +
            '<div class="settings-theme-grid" id="theme-grid"></div>';
        content.appendChild(themeGroup);

        var themes = [
            { name: "Fern", color: "#a7f3d0", type: "dark" }, { name: "Cherri", color: "#fca5a5", type: "dark" },
            { name: "Midnight", color: "#93c5fd", type: "dark" }, { name: "Darker", color: "#f9a8d4", type: "dark" },
            { name: "Forest", color: "#34d399", type: "dark" }, { name: "Sunset", color: "#fdba74", type: "dark" },
            { name: "Nord", color: "#7dd3fc", type: "dark" }, { name: "Mono", color: "#e2e8f0", type: "dark" },
            { name: "Light", color: "#f0abfc", type: "light" }, { name: "Abyss", color: "#818cf8", type: "dark" },
            { name: "Matcha", color: "#6ee7b7", type: "dark" }, { name: "Ember", color: "#fb923c", type: "dark" },
            { name: "Glacier", color: "#67e8f9", type: "dark" }, { name: "Void", color: "#a78bfa", type: "dark" },
            { name: "Peach", color: "#fda4af", type: "dark" }, { name: "Synthwave", color: "#e879f9", type: "dark" },
            { name: "Fall", color: "#ff6b4a", type: "dark" }, { name: "Custom", color: "#a7f3d0", type: "custom" }
        ];

        var themeHtml = "";
        themes.forEach(t => {
            var isActive = (t.name === "Fall" && settings.theme === "dark") ? " is-active" : ""; 
            themeHtml += `<button class="settings-theme-btn${isActive}" data-theme="${t.type}">
                <span class="theme-circle" style="background-color: ${t.color};"></span>
                <span class="theme-name">${t.name}</span>
            </button>`;
        });
        document.getElementById("theme-grid").innerHTML = themeHtml;

        // Bind Events
        document.querySelectorAll(".settings-color-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                document.querySelectorAll(".settings-color-btn").forEach(b => b.classList.remove("is-active"));
                this.classList.add("is-active");
                saveSetting("accentColor", this.getAttribute("data-color"));
            });
        });

        document.querySelectorAll(".settings-theme-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                document.querySelectorAll(".settings-theme-btn").forEach(b => b.classList.remove("is-active"));
                this.classList.add("is-active");
                saveSetting("theme", this.getAttribute("data-theme") === "light" ? "light" : "dark");
            });
        });
    }

    // ----------------------------------------------------------------------
    // Panel: Search
    // ----------------------------------------------------------------------
    function renderSearch() {
        var header = document.createElement("div");
        header.innerHTML = '<h2 class="settings-h2">Search</h2>';
        content.appendChild(header);

        var group = document.createElement("div");
        group.className = "settings-card";
        group.innerHTML = `
            <h3 class="settings-card-title">Search engine</h3>
            <p class="settings-card-desc">Used for anything typed in the address bar that isn't a URL.</p>
            <div class="settings-search-grid" id="search-grid"></div>
        `;
        content.appendChild(group);

        var engines = [
            { label: "Brave", desc: "Independent index", url: "https://search.brave.com/search?q=%s" },
            { label: "DuckDuckGo", desc: "Private, Bing-backed", url: "https://duckduckgo.com/?q=%s" },
            { label: "Google", desc: "Most results", url: "https://www.google.com/search?q=%s" },
            { label: "Bing", desc: "Microsoft", url: "https://www.bing.com/search?q=%s" },
            { label: "Startpage", desc: "Google results, no tracking", url: "https://www.startpage.com/sp/search?query=%s" },
            { label: "Ecosia", desc: "Plants trees", url: "https://www.ecosia.org/search?q=%s" },
            { label: "Wikipedia", desc: "Encyclopedia only", url: "https://en.wikipedia.org/wiki/Special:Search?search=%s" },
            { label: "Custom", desc: "Your own URL with %s", url: "custom" }
        ];

        var searchHtml = "";
        engines.forEach(e => {
            var isActive = settings.searchEngine === e.url ? " is-active" : "";
            var check = isActive ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '';
            searchHtml += `
                <button class="settings-search-btn${isActive}" data-url="${e.url}">
                    <div class="search-btn-content">
                        <div class="search-btn-title">${e.label}</div>
                        <div class="search-btn-desc">${e.desc}</div>
                    </div>
                    <div class="search-btn-check">${check}</div>
                </button>
            `;
        });
        document.getElementById("search-grid").innerHTML = searchHtml;

        var preview = document.createElement("div");
        preview.className = "settings-card";
        preview.innerHTML = `
            <h3 class="settings-card-title">Preview</h3>
            <input type="text" class="settings-input full-width" id="search-preview" readonly value="${settings.searchEngine.replace('%s', 'hello%20world')}">
        `;
        content.appendChild(preview);

        document.querySelectorAll(".settings-search-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                document.querySelectorAll(".settings-search-btn").forEach(b => b.classList.remove("is-active"));
                this.classList.add("is-active");
                
                var url = this.getAttribute("data-url");
                if (url !== "custom") {
                    saveSetting("searchEngine", url);
                    document.getElementById("search-preview").value = url.replace('%s', 'hello%20world');
                    
                    document.querySelectorAll(".search-btn-check").forEach(c => c.innerHTML = '');
                    this.querySelector(".search-btn-check").innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                } else {
                    document.getElementById("search-preview").value = "";
                    document.getElementById("search-preview").removeAttribute("readonly");
                    document.getElementById("search-preview").focus();
                }
            });
        });
    }

    // ----------------------------------------------------------------------
    // Panel: Proxy
    // ----------------------------------------------------------------------
    function renderProxy() {
        var header = document.createElement("div");
        header.innerHTML = '<h2 class="settings-h2">User agent</h2>';
        content.appendChild(header);

        var container = document.createElement("div");
        container.className = "settings-card";
        container.innerHTML = `
            <p class="settings-card-desc" style="margin-top: 0;">Sent with every proxied request and reported to pages through navigator.userAgent. Presets bring matching client hints along; a hand-written one is sent as-is. Sites often serve a lighter page to TVs and consoles.</p>
            
            <div class="settings-group" style="background: transparent; padding: 0; margin-bottom: 30px;">
                <button class="settings-useragent-default ${settings.userAgent === 'default' ? 'is-active' : ''}" data-id="default">
                    <span class="settings-row-title">Default</span>
                    <span class="settings-row-desc">follow the browser identity setting above</span>
                </button>
            </div>
            
            <h4 class="settings-h4">Desktop</h4>
            <div class="settings-pill-grid" id="ua-desktop"></div>
            
            <h4 class="settings-h4">Mobile</h4>
            <div class="settings-pill-grid" id="ua-mobile"></div>
            
            <h4 class="settings-h4">TV</h4>
            <div class="settings-pill-grid" id="ua-tv"></div>
        `;
        content.appendChild(container);

        var uas = [
            { id: "win-chrome", label: "Chrome · Windows", group: "desktop" },
            { id: "mac-chrome", label: "Chrome · macOS", group: "desktop" },
            { id: "mac-safari", label: "Safari · macOS", group: "desktop" },
            { id: "win-firefox", label: "Firefox · Windows", group: "desktop" },
            { id: "win-edge", label: "Edge · Windows", group: "desktop" },
            { id: "iphone", label: "Safari · iPhone", group: "mobile" },
            { id: "ipad", label: "Safari · iPad", group: "mobile" },
            { id: "android", label: "Chrome · Android", group: "mobile" },
            { id: "tv-google", label: "Google TV / Chromecast", group: "tv" },
            { id: "tv-youtube", label: "YouTube TV (Cobalt)", group: "tv" },
            { id: "tv-samsung", label: "Samsung TV (Tizen)", group: "tv" },
            { id: "tv-lg", label: "LG TV (webOS)", group: "tv" }
        ];

        function renderUAs() {
            ['desktop', 'mobile', 'tv'].forEach(group => {
                var grid = document.getElementById(`ua-${group}`);
                if (!grid) return;
                var html = "";
                uas.filter(u => u.group === group).forEach(u => {
                    var activeClass = settings.userAgent === u.id ? " is-active" : "";
                    html += `<button class="settings-pill${activeClass}" data-id="${u.id}">${u.label}</button>`;
                });
                grid.innerHTML = html;
            });

            document.querySelectorAll("[data-id]").forEach(btn => {
                btn.addEventListener("click", function() {
                    document.querySelectorAll("[data-id]").forEach(b => b.classList.remove("is-active"));
                    this.classList.add("is-active");
                    saveSetting("userAgent", this.getAttribute("data-id"));
                });
            });
        }
        renderUAs();
    }

    // ----------------------------------------------------------------------
    // Panel: Credits
    // ----------------------------------------------------------------------
    function renderCredits() {
        var header = document.createElement("div");
        header.innerHTML = 
            '<h2 class="settings-h2">Credits</h2>' +
            '<p class="settings-sub">Special thanks to the projects and people powering this app.</p>';
        content.appendChild(header);

        var credits = [
            { name: "x8rr", role: "Owner" },
            { name: "a", role: "UI Help" },
            { name: "ascent", role: "UI Help & Inspiration" },
            { name: "Proxy engine", role: "Proxy" },
            { name: "OpenRouter", role: "AI Provider" },
            { name: "api.navy", role: "AI Provider (Alt)" },
            { name: "Games", role: "(gh) x8rr/games" },
            { name: "GN Math", role: "Game Source 1" },
            { name: "Truffled", role: "Game Source 2" },
            { name: "UGS", role: "Game Source 3" },
            { name: "CKV", role: "Game Source 4" },
            { name: "Seraph", role: "Game Source 5" },
            { name: "GMShelf", role: "Game Source 6" },
            { name: "Discord", role: "Shop Assets" },
            { name: "Extensions", role: "(gh) x8rr/sapphire" }
        ];

        var group = document.createElement("div");
        group.className = "settings-card credits-group";
        
        credits.forEach(function(c) {
            var row = document.createElement("div");
            row.className = "credits-row";
            row.innerHTML = '<span class="credit-name">' + escapeHtml(c.name) + '</span>' +
                            '<span class="credit-role">' + escapeHtml(c.role) + '</span>';
            group.appendChild(row);
        });
        
        content.appendChild(group);
    }

    // ----------------------------------------------------------------------
    // Open / Close
    // ----------------------------------------------------------------------
    function openSettings() {
        panel.hidden = false;
        showPanel("appearance"); 
    }

    function closeSettings() {
        panel.hidden = true;
    }

    window.areoyOpenSettings  = openSettings;
    window.areoyCloseSettings = closeSettings;

    if (closeX) closeX.addEventListener("click", closeSettings);

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !panel.hidden) closeSettings();
    });

    var chromeMenu = document.getElementById("chrome-menu");
    if (chromeMenu) {
        chromeMenu.addEventListener("click", function (e) {
            var item = e.target.closest("[data-action]");
            if (!item) return;
            if (item.getAttribute("data-action") === "settings") {
                e.preventDefault();
                openSettings();
            }
        });
    }

})();
