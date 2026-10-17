/* ==========================================================================
   Areoy Proxy — apps.js
   Quick Apps data layer, rendering, and editing logic.
   Uses official SVG icons.
   ========================================================================== */

(function () {
    "use strict";

    var STORAGE_KEY = "areoy_quick_apps";

    // Default apps with their custom SVG icons
    var DEFAULTS = [
        { id: 1,  name: "YouTube",    url: "https://youtube.com",           icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="#FF0000"><path d="M21.593 7.203a2.506 2.506 0 0 0-1.762-1.766C18.265 5.007 12 5 12 5s-6.264-.007-7.831.404a2.56 2.56 0 0 0-1.766 1.778c-.413 1.566-.417 4.814-.417 4.814s-.004 3.264.406 4.814c.23.857.905 1.534 1.763 1.765 1.582.43 7.83.437 7.83.437s6.265.007 7.831-.403a2.515 2.515 0 0 0 1.767-1.763c.414-1.565.417-4.812.417-4.812s.02-3.265-.407-4.831zM9.996 15.005l.005-6 5.207 3.005-5.212 2.995z"/></svg>` },
        { id: 2,  name: "GitHub",     url: "https://github.com",            icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>` },
        { id: 3,  name: "Discord",    url: "https://discord.com",           icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="#7289da"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>` },
        { id: 4,  name: "TikTok",     url: "https://tiktok.com",            icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/></svg>` },
        { id: 5,  name: "Google",     url: "https://google.com",            icon: `<svg width="22" height="22" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>` },
        { id: 6,  name: "Twitter/X",  url: "https://twitter.com",           icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>` },
        { id: 7,  name: "Games",      url: "areoy://games",                 icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4m-2-2v4m8-2h.01M18 10h.01"></path></svg>` },
        { id: 8,  name: "Music",      url: "areoy://music",                 icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1DB954" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/></svg>` },
        { id: 9,  name: "AI",         url: "areoy://ai",                    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z"/></svg>` }
    ];

    // DOM Elements
    var grid       = document.getElementById("apps-grid");
    var editToggle = document.getElementById("edit-toggle");
    var addForm    = document.getElementById("add-form");
    var addName    = document.getElementById("add-name");
    var addUrl     = document.getElementById("add-url");
    var addSave    = document.getElementById("add-save");
    var addCancel  = document.getElementById("add-cancel");

    if (!grid || !editToggle) return;

    var editing = false;
    var apps = loadApps();

    // ----------------------------------------------------------------------
    // Data Layer
    // ----------------------------------------------------------------------
    function loadApps() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return DEFAULTS.slice();
            var parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return DEFAULTS.slice();
            return parsed.filter(function (a) {
                return a && typeof a.name === "string" && typeof a.url === "string";
            });
        } catch (_) {
            return DEFAULTS.slice();
        }
    }

    function saveApps() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
        } catch (_) {}
    }

    // ----------------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------------
    function getInitials(name) {
        return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    }

    function getColorFromName(name) {
        const colors = ["#6366f1","#8b5cf6","#ec4899","#f43f5e","#f97316","#eab308","#22c55e","#14b8a6","#06b6d4","#3b82f6"];
        let hash = 0;
        for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    }

    function normalizeUrl(input) {
        var v = String(input || "").trim();
        if (!v) return "";
        if (!/^https?:\/\//i.test(v) && !v.startsWith("areoy://")) {
            v = "https://" + v;
        }
        try {
            return new URL(v).href;
        } catch (_) {
            return v; 
        }
    }

    // ----------------------------------------------------------------------
    // Rendering
    // ----------------------------------------------------------------------
    function render() {
        grid.innerHTML = "";
        
        // Update Toggle State
        grid.classList.toggle("is-editing", editing);
        editToggle.classList.toggle("is-active", editing);
        editToggle.setAttribute("aria-pressed", editing ? "true" : "false");
        editToggle.textContent = editing ? "Done" : "Edit";

        // Render Each App
        apps.forEach(function (app, index) {
            var tile = document.createElement("a");
            tile.className = "app-tile";
            tile.href = app.url;
            tile.target = "_self";
            tile.rel = "noopener";
            tile.setAttribute("aria-label", app.name);

            // Icon / Fallback generation
            var icon = document.createElement("span");
            icon.className = "app-tile-icon";
            
            if (app.icon) {
                // If the app has a custom SVG icon saved
                icon.innerHTML = app.icon;
            } else {
                // If it's a user-added app without an icon, generate a nice text fallback
                icon.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22"><rect width="24" height="24" rx="5" fill="${getColorFromName(app.name)}"/><text x="12" y="17" text-anchor="middle" font-size="10" font-family="Inter,sans-serif" fill="white">${getInitials(app.name)}</text></svg>`;
            }

            // Label
            var name = document.createElement("span");
            name.className = "app-tile-name";
            name.textContent = app.name;

            tile.appendChild(icon);
            tile.appendChild(name);

            // Edit Mode Controls
            if (editing) {
                var remove = document.createElement("button");
                remove.type = "button";
                remove.className = "app-tile-remove";
                remove.setAttribute("aria-label", "Remove " + app.name);
                remove.title = "Remove";
                remove.textContent = "×";
                
                remove.addEventListener("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    apps.splice(index, 1);
                    saveApps();
                    render();
                });
                
                tile.appendChild(remove);
                tile.addEventListener("click", function (e) { e.preventDefault(); });
            } else {
                // Normal Click Handler (Intercept to open in proxy)
                tile.addEventListener("click", function(e) {
                    e.preventDefault();
                    if (window.areoyOpenUrl) {
                        window.areoyOpenUrl(app.url);
                    } else {
                        window.location.href = app.url;
                    }
                });
            }

            grid.appendChild(tile);
        });
    }

    // ----------------------------------------------------------------------
    // Event Listeners
    // ----------------------------------------------------------------------
    
    // Toggle Edit Mode
    editToggle.addEventListener("click", function () {
        editing = !editing;
        if (editing) {
            addForm.style.display = "flex";
        } else {
            addForm.style.display = "none";
            addName.value = "";
            addUrl.value = "";
        }
        render();
    });

    // Save New App
    addSave.addEventListener("click", function () {
        var name = addName.value.trim();
        var url = normalizeUrl(addUrl.value);
        
        if (!name || !url) {
            if (!name) addName.focus();
            else addUrl.focus();
            return;
        }
        
        apps.push({ 
            id: Date.now(), 
            name: name, 
            url: url, 
            icon: null 
        });
        
        saveApps();
        
        addName.value = "";
        addUrl.value = "";
        addName.focus();
        render();
    });

    // Cancel Add
    addCancel.addEventListener("click", function () {
        addName.value = "";
        addUrl.value = "";
        editing = false;
        addForm.style.display = "none";
        render();
    });

    // Keyboard Support for Add Form
    addUrl.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); addSave.click(); }
    });
    addName.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); addUrl.focus(); }
    });

    // Initial Render
    render();

})();
