/* ==========================================================================
   INTERNAL PAGES LOGIC (Games, Music, AI)
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
                window.areoyOpenUrl(game.url);
            });
            gamesGrid.appendChild(card);
        });
        if (count === 0) gamesGrid.innerHTML = '<div style="color:#888; grid-column: 1/-1;">No games found.</div>';
    }
    if (gamesSearch) gamesSearch.addEventListener("input", function() { renderGames(this.value); });

    window.areoyRenderGamesPage = function() {
        document.getElementById("areoy-music-page").hidden = true;
        document.getElementById("areoy-ai-page").hidden = true;
        document.getElementById("areoy-games-page").hidden = false;
        renderGames("");
    };

    // ----------------------------------------------------------------------
    // MUSIC LOGIC
    // ----------------------------------------------------------------------
    var musicContent = document.getElementById("music-content");
    var musicSearch = document.getElementById("music-search");

    async function fetchMusic(query) {
        if (!musicContent) return;
        musicContent.innerHTML = '<div style="color:#888; margin-top:20px;">Searching...</div>';
        try {
            var url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=24`;
            var res = await fetch(url);
            var data = await res.json();
            if (!data.results || data.results.length === 0) {
                musicContent.innerHTML = '<div style="color:#888; margin-top:20px;">No results found.</div>';
                return;
            }
            var html = `<div class="music-section-title-main">Search Results: "${query}"</div><div class="music-grid">`;
            data.results.forEach(function(track) {
                var artwork = track.artworkUrl100 ? track.artworkUrl100.replace("100x100bb", "500x500bb") : "";
                html += `<div class="music-card" onclick="window.open('${track.trackViewUrl}', '_blank')"><img src="${artwork}" class="music-card-img" alt="Album Art" loading="lazy"><div class="music-card-title">${track.trackName}</div><div class="music-card-artist">${track.artistName}</div></div>`;
            });
            html += `</div>`;
            musicContent.innerHTML = html;
        } catch (e) {
            musicContent.innerHTML = '<div style="color:#888; margin-top:20px;">Error loading music.</div>';
        }
    }

    if (musicSearch) {
        var searchTimeout;
        musicSearch.addEventListener("input", function() {
            clearTimeout(searchTimeout);
            var val = this.value.trim();
            if (val.length === 0) { fetchMusic("Top Hits"); return; }
            searchTimeout = setTimeout(function() { fetchMusic(val); }, 500);
        });
    }

    window.areoyRenderMusicPage = function() {
        document.getElementById("areoy-games-page").hidden = true;
        document.getElementById("areoy-ai-page").hidden = true;
        document.getElementById("areoy-music-page").hidden = false;
        fetchMusic("Top Hits");
    };

    // ----------------------------------------------------------------------
    // AI LOGIC
    // ----------------------------------------------------------------------
    var GROQ_API_KEY = "gsk_YOUR_GROQ_API_KEY_HERE"; 
    var GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    var aiInput = document.getElementById("ai-input");
    var aiSend = document.getElementById("ai-send-btn");
    var aiChatContainer = document.getElementById("ai-chat-container");
    var aiWelcome = document.getElementById("ai-welcome");
    var chatHistory = [{ role: "system", content: "You are Fern AI, a helpful assistant built into the Areoy browser. Be concise and helpful." }];

    function appendMessage(role, text) {
        var msgDiv = document.createElement("div");
        msgDiv.className = "ai-message " + role;
        msgDiv.innerHTML = `<div class="ai-avatar"></div><div class="ai-msg-content">${text.replace(/\n/g, '<br>')}</div>`;
        aiChatContainer.appendChild(msgDiv);
        aiChatContainer.scrollTop = aiChatContainer.scrollHeight;
    }

    async function sendMessage() {
        var text = aiInput.value.trim();
        if (!text) return;
        if (aiWelcome) aiWelcome.style.display = "none";
        appendMessage("user", text);
        chatHistory.push({ role: "user", content: text });
        aiInput.value = "";

        var loadingDiv = document.createElement("div");
        loadingDiv.className = "ai-message ai";
        loadingDiv.innerHTML = `<div class="ai-avatar"></div><div class="ai-msg-content" style="color: #888;">Thinking...</div>`;
        aiChatContainer.appendChild(loadingDiv);
        aiChatContainer.scrollTop = aiChatContainer.scrollHeight;

        try {
            var response = await fetch(GROQ_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                body: JSON.stringify({ model: "llama3-8b-8192", messages: chatHistory, temperature: 0.7 })
            });
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            var data = await response.json();
            var aiText = data.choices[0].message.content;
            if (loadingDiv.parentNode) loadingDiv.parentNode.removeChild(loadingDiv);
            appendMessage("ai", aiText);
            chatHistory.push({ role: "assistant", content: aiText });
        } catch (error) {
            if (loadingDiv.parentNode) loadingDiv.parentNode.removeChild(loadingDiv);
            appendMessage("ai", "Sorry, I encountered an error. Make sure your API key is valid and you are online.");
        }
    }

    if (aiSend && aiInput) {
        aiSend.addEventListener("click", sendMessage);
        aiInput.addEventListener("keydown", function(e) { if (e.key === "Enter") sendMessage(); });
        document.querySelectorAll(".ai-suggestion").forEach(function(btn) {
            btn.addEventListener("click", function() { aiInput.value = this.textContent.trim(); sendMessage(); });
        });
        var clearBtn = document.querySelector(".ai-clear-btn");
        if (clearBtn) {
            clearBtn.addEventListener("click", function() {
                chatHistory = [{ role: "system", content: "You are Fern AI, a helpful assistant built into the Areoy browser. Be concise and helpful." }];
                aiChatContainer.innerHTML = "";
                if (aiWelcome) aiWelcome.style.display = "block";
            });
        }
    }

    window.areoyRenderAIPage = function() {
        document.getElementById("areoy-games-page").hidden = true;
        document.getElementById("areoy-music-page").hidden = true;
        document.getElementById("areoy-ai-page").hidden = false;
    };

    // ----------------------------------------------------------------------
    // PAGE ROUTING HOOK (Intercept hash changes if needed)
    // ----------------------------------------------------------------------
    window.addEventListener("hashchange", function() {
        if (window.location.hash === "#areoy://music") window.areoyRenderMusicPage();
        if (window.location.hash === "#areoy://ai") window.areoyRenderAIPage();
        if (window.location.hash === "#areoy://games") window.areoyRenderGamesPage();
    });

})();
