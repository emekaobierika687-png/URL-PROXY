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
    if (launcherFavBtn) launcherFavBtn.addEventListener("click", function() { this.style.color = this.style.color === 'var(--accent-color)' ? '#ddd' : 'var(--accent-color)'; });

    // ----------------------------------------------------------------------
    // MUSIC LOGIC
    // ----------------------------------------------------------------------
    var musicContent = document.getElementById("music-content");
    var musicSearch = document.getElementById("music-search");

    // Create the Audio Player element
    var audioPlayer = document.createElement("div");
    audioPlayer.className = "music-player";
    audioPlayer.innerHTML = `
        <div class="music-player-info">
            <img id="mp-cover" src="" alt="Cover" class="music-player-cover">
            <div class="music-player-text">
                <div id="mp-title" class="music-player-title">Song Title</div>
                <div id="mp-artist" class="music-player-artist">Artist Name</div>
            </div>
        </div>
        <div class="music-player-controls">
            <button class="mp-btn" id="mp-prev-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
            <button class="mp-btn" id="mp-play-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>
            <button class="mp-btn" id="mp-next-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
        </div>
        <div class="music-player-progress">
            <span id="mp-current">0:00</span>
            <input type="range" id="mp-seek" value="0" min="0" max="100" step="0.1">
            <span id="mp-duration">0:00</span>
        </div>
        <audio id="mp-audio"></audio>
    `;
    document.body.appendChild(audioPlayer);
    audioPlayer.style.display = "none";

    var mpAudio = document.getElementById("mp-audio");
    var mpPlayBtn = document.getElementById("mp-play-btn");
    var mpPrevBtn = document.getElementById("mp-prev-btn");
    var mpNextBtn = document.getElementById("mp-next-btn");
    var mpSeek = document.getElementById("mp-seek");
    var mpCurrent = document.getElementById("mp-current");
    var mpDuration = document.getElementById("mp-duration");
    var mpCover = document.getElementById("mp-cover");
    var mpTitle = document.getElementById("mp-title");
    var mpArtist = document.getElementById("mp-artist");

    var currentQueue = [];
    var currentIndex = -1;
    var browseSections = [];
    var ytPlayer = null;

    // Hidden container for YouTube Player
    var ytHost = document.createElement("div");
    ytHost.id = "yt-hidden-player";
    ytHost.style.display = "none";
    document.body.appendChild(ytHost);

    function loadYouTubeAPI() {
        return new Promise((resolve) => {
            if (window.YT && window.YT.Player) return resolve(window.YT);
            window.onYouTubeIframeAPIReady = () => resolve(window.YT);
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
        });
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        var m = Math.floor(seconds / 60);
        var s = Math.floor(seconds % 60);
        return m + ":" + (s < 10 ? "0" : "") + s;
    }

    async function playTrack(track) {
        mpTitle.textContent = "Loading...";
        mpArtist.textContent = track.artist;
        mpCover.src = track.artwork || "";
        audioPlayer.style.display = "flex";

        try {
            var res = await fetch(`/api/music/play/${track.id}?t=${encodeURIComponent(track.title)}&a=${encodeURIComponent(track.artist)}`);
            var data = await res.json();
            
            if (!res.ok) throw new Error(data.error || "Playback failed");

            // If it's a direct audio URL (iTunes preview or SoundCloud progressive)
            if (data.audioUrl) {
                if (ytPlayer) { try { ytPlayer.pauseVideo(); } catch(e){} }
                mpAudio.src = data.audioUrl;
                mpAudio.play().catch(e => console.log("Autoplay blocked:", e));
                mpPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
                mpTitle.textContent = track.title;
            } 
            // If it's a YouTube embed
            else if (data.provider === "youtube" && data.videoId) {
                mpAudio.pause();
                mpAudio.removeAttribute("src"); // Clear audio
                
                const YT = await loadYouTubeAPI();
                if (ytPlayer) {
                    ytPlayer.loadVideoById(data.videoId);
                } else {
                    ytPlayer = new YT.Player(ytHost, {
                        height: '1', width: '1', videoId: data.videoId,
                        playerVars: { autoplay: 1, controls: 0 },
                        events: {
                            'onReady': (e) => e.target.playVideo(),
                            'onStateChange': (e) => {
                                if (e.data === YT.PlayerState.PLAYING) {
                                    mpPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
                                } else if (e.data === YT.PlayerState.PAUSED) {
                                    mpPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
                                } else if (e.data === YT.PlayerState.ENDED) {
                                    playNext();
                                }
                            }
                        }
                    });
                }
                mpTitle.textContent = track.title;
            }
        } catch (error) {
            console.error("Play error:", error);
            mpTitle.textContent = "Error playing track";
        }
    }

    function togglePlay() {
        if (ytPlayer && ytPlayer.getPlayerState) {
            var state = ytPlayer.getPlayerState();
            if (state === 1) { ytPlayer.pauseVideo(); }
            else { ytPlayer.playVideo(); }
            return;
        }
        if (mpAudio.paused) {
            mpAudio.play();
            mpPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        } else {
            mpAudio.pause();
            mpPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
        }
    }

    function playNext() {
        if (currentIndex < currentQueue.length - 1) {
            currentIndex++;
            playTrack(currentQueue[currentIndex]);
        }
    }

    function playPrev() {
        if (mpAudio.currentTime > 3 || (ytPlayer && ytPlayer.getCurrentTime && ytPlayer.getCurrentTime() > 3)) {
            if (ytPlayer) ytPlayer.seekTo(0);
            else mpAudio.currentTime = 0;
        } else if (currentIndex > 0) {
            currentIndex--;
            playTrack(currentQueue[currentIndex]);
        }
    }

    mpPlayBtn.addEventListener("click", togglePlay);
    mpNextBtn.addEventListener("click", playNext);
    mpPrevBtn.addEventListener("click", playPrev);

    mpAudio.addEventListener("timeupdate", function() {
        if (!isNaN(this.duration)) {
            mpSeek.value = (this.currentTime / this.duration) * 100;
            mpCurrent.textContent = formatTime(this.currentTime);
            mpDuration.textContent = formatTime(this.duration);
        }
    });

    mpAudio.addEventListener("ended", playNext);

    mpSeek.addEventListener("input", function() {
        if (!isNaN(mpAudio.duration)) {
            mpAudio.currentTime = (this.value / 100) * mpAudio.duration;
        }
    });

    async function fetchMusicPage() {
        if (!musicContent) return;
        musicContent.innerHTML = '<div style="color:var(--text-muted); margin-top:20px; padding: 0 40px;">Loading music...</div>';
        
        try {
            var res = await fetch('/api/music/browse');
            var data = await res.json();
            var sections = data.sections || [];
            browseSections = sections;
            
            currentQueue = [];
            sections.forEach(s => {
                if (s.tracks) currentQueue.push(...s.tracks);
            });

            var html = `
                <div class="music-main-header">
                    <h1>Browse</h1>
                    <button class="music-profile-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>
                </div>
            `;

            sections.forEach(section => {
                var sectionIcon = '';
                if (section.icon === 'flame') sectionIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>';
                if (section.icon === 'sparkles') sectionIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18m9-9H3m14.5-6.5l-11 11m0-11l11 11"></path></svg>';
                if (section.icon === 'zap') sectionIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>';
                
                html += `
                    <div class="music-row-header" style="margin-top: 30px;">
                        <div class="music-row-title">
                            ${sectionIcon}
                            ${section.title}
                        </div>
                    </div>
                    <div class="music-carousel">
                `;

                if (section.tracks && section.tracks.length > 0) {
                    section.tracks.forEach((track, i) => {
                        var globalIdx = currentQueue.findIndex(t => t.id === track.id);
                        html += `
                            <div class="music-card" data-index="${globalIdx}">
                                <div class="music-card-img-wrap">
                                    <img src="${track.artwork || ''}" alt="${track.title}" loading="lazy">
                                    <button class="music-play-overlay">
                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                    </button>
                                </div>
                                <div class="music-card-title">${track.title}</div>
                                <div class="music-card-artist">${track.artist}</div>
                            </div>
                        `;
                    });
                } else {
                    html += `<div style="color:#888; padding: 10px;">No tracks available in this section.</div>`;
                }
                html += `</div>`;
            });

            musicContent.innerHTML = html;

            document.querySelectorAll(".music-card").forEach((card) => {
                card.addEventListener("click", function() {
                    var idx = parseInt(this.getAttribute("data-index"));
                    if (idx >= 0 && idx < currentQueue.length) {
                        currentIndex = idx;
                        playTrack(currentQueue[idx]);
                    }
                });
            });

        } catch (e) {
            console.error(e);
            musicContent.innerHTML = '<div style="color:#888; margin-top:20px; padding: 0 40px;">Error loading music catalog.</div>';
        }
    }

    async function searchMusic(query) {
        if (!musicContent) return;
        musicContent.innerHTML = '<div style="color:var(--text-muted); margin-top:20px; padding: 0 40px;">Searching...</div>';
        try {
            var url = `/api/music/search?q=${encodeURIComponent(query)}&limit=24`;
            var res = await fetch(url);
            var data = await res.json();
            
            if (!data.tracks || data.tracks.length === 0) {
                musicContent.innerHTML = '<div style="color:var(--text-muted); margin-top:20px; padding: 0 40px;">No results found.</div>';
                return;
            }
            
            currentQueue = data.tracks;

            var html = `<div class="music-main-header"><h1>Search: "${query}"</h1></div><div class="music-grid" style="padding: 0 40px;">`;
            data.tracks.forEach(function(track, i) {
                html += `
                    <div class="music-card" data-index="${i}">
                        <div class="music-card-img-wrap">
                            <img src="${track.artwork || ''}" alt="${track.title}" loading="lazy">
                            <button class="music-play-overlay">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            </button>
                        </div>
                        <div class="music-card-title">${track.title}</div>
                        <div class="music-card-artist">${track.artist}</div>
                    </div>
                `;
            });
            html += `</div>`;
            musicContent.innerHTML = html;

            document.querySelectorAll(".music-card").forEach((card) => {
                card.addEventListener("click", function() {
                    var idx = parseInt(this.getAttribute("data-index"));
                    currentIndex = idx;
                    playTrack(data.tracks[idx]);
                });
            });

        } catch (e) {
            musicContent.innerHTML = '<div style="color:var(--text-muted); margin-top:20px; padding: 0 40px;">Error loading music.</div>';
        }
    }

    if (musicSearch) {
        var searchTimeout;
        musicSearch.addEventListener("input", function() {
            clearTimeout(searchTimeout);
            var val = this.value.trim();
            if (val.length === 0) { fetchMusicPage(); return; }
            searchTimeout = setTimeout(() => searchMusic(val), 500);
        });
    }

    window.areoyRenderMusicPage = function() {
        hideAllInternalPages();
        document.getElementById("areoy-music-page").hidden = false;
        fetchMusicPage();
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
        hideAllInternalPages();
        document.getElementById("areoy-ai-page").hidden = false;
    };

    // ----------------------------------------------------------------------
    // ROUTING HELPERS
    // ----------------------------------------------------------------------
    function hideAllInternalPages() {
        var pages = ["areoy-games-page", "areoy-launcher-page", "areoy-music-page", "areoy-ai-page"];
        pages.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.hidden = true;
        });
    }

    window.addEventListener("hashchange", function() {
        if (window.location.hash === "#areoy://music") window.areoyRenderMusicPage();
        if (window.location.hash === "#areoy://ai") window.areoyRenderAIPage();
        if (window.location.hash === "#areoy://games") window.areoyRenderGamesPage();
    });

})();
