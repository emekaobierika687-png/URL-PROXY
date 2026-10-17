/* ==========================================================================
   INTERNAL PAGES LOGIC (Games, Launcher, Music, AI)
   ========================================================================== */

(function() {
    "use strict";

    // ----------------------------------------------------------------------
    // GAMES LOGIC
    // ----------------------------------------------------------------------
    var gamesGrid = document.getElementById("games-grid");
    var gamesSearch = document.getElementById("games-search");
    
    var GAMES_DATA = [
        { title: "Ice Dodo", img: "https://images.crazygames.com/games/ice-dodo/cover-1609926198607.png?auto=format,compress&q=75&cs=strip", url: "https://ubg77.github.io/edit/ice-dodo/" },
        { title: "Pac Man World", img: "https://images.crazygames.com/games/pacman/cover-1591272774093.png?auto=format,compress&q=75&cs=strip", url: "https://www.google.com/logos/2010/pacman10-i.html" },
        { title: "Riddle School", img: "https://images.crazygames.com/games/riddle-school/cover-1589355087242.png?auto=format,compress&q=75&cs=strip", url: "https://www.newgrounds.com/portal/view/339772" },
        { title: "Riddle School 2", img: "https://images.crazygames.com/games/riddle-school-2/cover-1589355118036.png?auto=format,compress&q=75&cs=strip", url: "https://www.newgrounds.com/portal/view/345890" },
        { title: "Riddle School 3", img: "https://images.crazygames.com/games/riddle-school-3/cover-1589355149868.png?auto=format,compress&q=75&cs=strip", url: "https://www.newgrounds.com/portal/view/364703" },
        { title: "Riddle School 4", img: "https://images.crazygames.com/games/riddle-school-4/cover-1589355172363.png?auto=format,compress&q=75&cs=strip", url: "https://www.newgrounds.com/portal/view/392095" },
        { title: "Riddle School 5", img: "https://images.crazygames.com/games/riddle-school-5/cover-1589355199659.png?auto=format,compress&q=75&cs=strip", url: "https://www.newgrounds.com/portal/view/507228" },
        { title: "Riddle Transfer", img: "https://images.crazygames.com/games/riddle-transfer/cover-1589355234326.png?auto=format,compress&q=75&cs=strip", url: "https://www.newgrounds.com/portal/view/582858" },
        { title: "Riddle Transfer 2", img: "https://images.crazygames.com/games/riddle-transfer-2/cover-1589355261317.png?auto=format,compress&q=75&cs=strip", url: "https://www.newgrounds.com/portal/view/619050" },
        { title: "Riddle School 6", img: "https://images.crazygames.com/games/riddle-school-6/cover-1589355285916.png?auto=format,compress&q=75&cs=strip", url: "https://www.newgrounds.com/portal/view/650705" },
        { title: "Bowman", img: "https://images.crazygames.com/games/bowman/cover-1589355323511.png?auto=format,compress&q=75&cs=strip", url: "https://www.newgrounds.com/portal/view/140133" }
    ];

    function renderGames(query) {
        if (!gamesGrid) return;
        gamesGrid.innerHTML = "";
        query = (query || "").toLowerCase().trim();
        var count = 0;

        GAMES_DATA.forEach(function(game) {
            if (query && game.title.toLowerCase().indexOf(query) === -1) return;
            count++;
            var card = document.createElement("div");
            card.className = "game-card";
            card.innerHTML = `
                <div class="game-img-wrap">
                    <img src="${game.img}" alt="${game.title}" loading="lazy">
                    <button class="game-fav-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></button>
                </div>
                <div class="game-title">${game.title}</div>
            `;
            card.addEventListener("click", function(e) {
                if (e.target.closest('.game-fav-btn')) return;
                // Route to launcher!
                var launcherUrl = `areoy://launcher?game=${encodeURIComponent(game.url)}&name=${encodeURIComponent(game.title)}`;
                window.areoyOpenUrl(launcherUrl);
            });
            gamesGrid.appendChild(card);
        });
        if (count === 0) gamesGrid.innerHTML = '<div style="color:#888; grid-column: 1/-1;">No games found.</div>';
    }
    if (gamesSearch) gamesSearch.addEventListener("input", function() { renderGames(this.value); });

    window.areoyRenderGamesPage = function() {
        hideAllInternalPages();
        document.getElementById("areoy-games-page").hidden = false;
        renderGames("");
    };

    // ----------------------------------------------------------------------
    // GAME LAUNCHER LOGIC
    // ----------------------------------------------------------------------
    var launcherFrame = document.getElementById("launcher-frame");
    var launcherTitle = document.getElementById("launcher-game-title");
    var launcherBackBtn = document.getElementById("launcher-back-btn");
    var launcherReloadBtn = document.getElementById("launcher-reload-btn");
    var launcherFavBtn = document.getElementById("launcher-fav-btn");
    var launcherFullscreenBtn = document.getElementById("launcher-fullscreen-btn");

    window.areoyRenderLauncherPage = function(url) {
        var queryString = url.split("?")[1];
        if (!queryString) return;

        var params = new URLSearchParams(queryString);
        var gameUrl = params.get("game");
        var gameName = params.get("name") || "Game";

        if (launcherTitle) launcherTitle.textContent = gameName;

        hideAllInternalPages();
        document.getElementById("areoy-launcher-page").hidden = false;

        if (launcherFrame && gameUrl) {
            if (typeof window.__areoyNavigate === "function") {
                try { window.__areoyNavigate(gameUrl, launcherFrame); }
                catch(e) { launcherFrame.src = gameUrl; }
            } else {
                launcherFrame.src = gameUrl;
            }
        }
    };

    if (launcherBackBtn) launcherBackBtn.addEventListener("click", function() { window.areoyRenderGamesPage(); });
    if (launcherReloadBtn) launcherReloadBtn.addEventListener("click", function() { if (launcherFrame && launcherFrame.src) launcherFrame.src = launcherFrame.src; });
    if (launcherFullscreenBtn) launcherFullscreenBtn.addEventListener("click", function() { if (launcherFrame.requestFullscreen) launcherFrame.requestFullscreen(); });
    if (launcherFavBtn) launcherFavBtn.addEventListener("click", function() { this.style.color = this.style.color === 'var(--
