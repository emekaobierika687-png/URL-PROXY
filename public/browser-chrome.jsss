"use strict";
/**
 * browser-chrome.js
 * Bottom-slide browser toolbar that appears when a proxy iframe is active.
 * Pull-tab at bottom center → click → toolbar slides up from bottom.
 * No dev console. Hooks into existing scramjet index.js flow.
 */
(function () {

	// ── Inject CSS ────────────────────────────────────────────────────────────
	const styleLink = document.createElement("link");
	styleLink.rel = "stylesheet";
	styleLink.href = "browser-chrome.css";
	document.head.appendChild(styleLink);

	// ── Build DOM ─────────────────────────────────────────────────────────────
	// Pull tab
	const pullTab = document.createElement("div");
	pullTab.id = "bc-pull-tab";
	pullTab.setAttribute("role", "button");
	pullTab.setAttribute("tabindex", "0");
	pullTab.setAttribute("aria-label", "Open browser controls");
	pullTab.innerHTML = `
		<div id="bc-pull-inner">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="m18 15-6-6-6 6"/>
			</svg>
			<span>Browser Controls</span>
		</div>
	`;
	document.body.appendChild(pullTab);

	// Toolbar
	const toolbar = document.createElement("div");
	toolbar.id = "bc-toolbar";
	toolbar.setAttribute("aria-label", "Browser controls");
	toolbar.innerHTML = `
		<div id="bc-progress"></div>

		<!-- Back -->
		<button class="bc-btn" id="bc-back" title="Back (Alt+←)" disabled>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
				<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
			</svg>
		</button>

		<!-- Forward -->
		<button class="bc-btn" id="bc-forward" title="Forward (Alt+→)" disabled>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
			</svg>
		</button>

		<!-- Address bar -->
		<div id="bc-addr-wrap">
			<div id="bc-addr-glow"></div>
			<span id="bc-addr-lock">
				<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
				</svg>
			</span>
			<input id="bc-address" type="text" placeholder="Search or enter URL…" autocomplete="off" spellcheck="false"/>
			<button id="bc-reload-inner" title="Reload (Ctrl+R)">
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
				</svg>
			</button>
		</div>

		<div class="bc-divider"></div>

		<!-- History -->
		<button class="bc-icon-btn" id="bc-history-btn" title="History">
			<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/>
			</svg>
		</button>

		<!-- Bookmarks -->
		<button class="bc-icon-btn" id="bc-bm-btn" title="Bookmarks">
			<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
			</svg>
		</button>

		<!-- Save bookmark -->
		<button class="bc-icon-btn" id="bc-save-bm" title="Bookmark this page">
			<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M12 5v14M5 12l7 7 7-7"/>
			</svg>
		</button>

		<div class="bc-divider"></div>

		<!-- Home -->
		<button class="bc-btn" id="bc-home" title="Home">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
				<path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
			</svg>
		</button>

		<!-- Close (collapse toolbar) -->
		<button id="bc-close-tab" title="Hide controls">
			<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="m18 9-6 6-6-6"/>
			</svg>
		</button>
	`;
	document.body.appendChild(toolbar);

	// Bookmarks bar
	const bmBar = document.createElement("div");
	bmBar.id = "bc-bookmarks-bar";
	document.body.appendChild(bmBar);

	// ── Refs ──────────────────────────────────────────────────────────────────
	const addrInput   = toolbar.querySelector("#bc-address");
	const btnBack     = toolbar.querySelector("#bc-back");
	const btnForward  = toolbar.querySelector("#bc-forward");
	const reloadBtn   = toolbar.querySelector("#bc-reload-inner");
	const homeBtn     = toolbar.querySelector("#bc-home");
	const closeBtn    = toolbar.querySelector("#bc-close-tab");
	const historyBtn  = toolbar.querySelector("#bc-history-btn");
	const bmBtn       = toolbar.querySelector("#bc-bm-btn");
	const saveBmBtn   = toolbar.querySelector("#bc-save-bm");
	const progress    = toolbar.querySelector("#bc-progress");

	// ── State ─────────────────────────────────────────────────────────────────
	let activeFrame = null;   // the current <iframe> element
	let navHistory  = [];
	let histIdx     = -1;
	let bookmarks   = JSON.parse(localStorage.getItem("bc_bookmarks") || "[]");
	let browseHistory = JSON.parse(localStorage.getItem("bc_history") || "[]");
	let toolbarOpen = false;
	let bmBarOpen   = false;
	let histDropOpen = false;

	// ── Toolbar open/close ────────────────────────────────────────────────────
	function openToolbar() {
		toolbarOpen = true;
		toolbar.classList.add("open");
		document.body.classList.add("bc-open");
		pullTab.querySelector("svg").style.transform = "rotate(180deg)";
		pullTab.querySelector("span").textContent = "Hide Controls";
	}

	function closeToolbar() {
		toolbarOpen = false;
		toolbar.classList.remove("open");
		document.body.classList.remove("bc-open");
		pullTab.querySelector("svg").style.transform = "";
		pullTab.querySelector("span").textContent = "Browser Controls";
		bmBar.classList.remove("visible");
		bmBarOpen = false;
	}

	function toggleToolbar() {
		toolbarOpen ? closeToolbar() : openToolbar();
	}

	// ── Progress ──────────────────────────────────────────────────────────────
	function startProgress() {
		progress.className = "loading";
		reloadBtn.classList.add("spinning");
	}

	function doneProgress() {
		progress.className = "done";
		reloadBtn.classList.remove("spinning");
		setTimeout(() => { if (progress.className === "done") progress.className = ""; }, 500);
	}

	// ── Navigation state ──────────────────────────────────────────────────────
	function updateNavBtns() {
		btnBack.disabled    = histIdx <= 0;
		btnForward.disabled = histIdx >= navHistory.length - 1;
	}

	function pushHistory(url) {
		navHistory = navHistory.slice(0, histIdx + 1);
		navHistory.push(url);
		histIdx = navHistory.length - 1;
		updateNavBtns();
		// Save to browse history
		browseHistory.unshift({ url, title: url, time: Date.now() });
		if (browseHistory.length > 50) browseHistory.pop();
		try { localStorage.setItem("bc_history", JSON.stringify(browseHistory)); } catch {}
	}

	// ── Load URL in frame ─────────────────────────────────────────────────────
	function navigateTo(url, addToHistory = true) {
		if (!activeFrame) return;
		if (addToHistory) pushHistory(url);
		addrInput.value = url;
		startProgress();

		activeFrame.src = url;
		activeFrame.onload = onFrameLoad;
	}

	function onFrameLoad() {
		doneProgress();
		try {
			const raw = activeFrame.contentWindow?.location?.href;
			if (raw && raw !== "about:blank") {
				addrInput.value = decodeProxyUrl(raw);
			}
		} catch { /* cross-origin */ }
	}

	function goBack() {
		if (histIdx <= 0) return;
		histIdx--;
		navigateTo(navHistory[histIdx], false);
		updateNavBtns();
	}

	function goForward() {
		if (histIdx >= navHistory.length - 1) return;
		histIdx++;
		navigateTo(navHistory[histIdx], false);
		updateNavBtns();
	}

	function reload() {
		if (!activeFrame) return;
		startProgress();
		activeFrame.contentWindow?.location.reload();
		setTimeout(doneProgress, 800);
	}

	// ── Proxy URL decoder ─────────────────────────────────────────────────────
	function decodeProxyUrl(raw) {
		if (!raw) return raw;
		try {
			const u = new URL(raw, location.origin);
			// /?route=... full proxy link
			if (u.pathname === "/" && u.searchParams.has("route")) {
				const route = decodeURIComponent(u.searchParams.get("route"));
				const rp = new URLSearchParams(route.split("?")[1] || "");
				const q = rp.get("query");
				if (q) return atob(decodeURIComponent(q));
			}
			// /search?query=<b64>
			if (u.pathname === "/search" && u.searchParams.has("query")) {
				const q = u.searchParams.get("query");
				return atob(decodeURIComponent(q));
			}
			// /scramjet/https%3A%2F%2F... or similar scramjet prefix paths
			const scramPrefixes = ["/scramjet/", "/scram/", "/proxy/"];
			for (const prefix of scramPrefixes) {
				if (u.pathname.startsWith(prefix)) {
					const decoded = decodeURIComponent(u.pathname.slice(prefix.length));
					if (/^https?:\/\//i.test(decoded)) return decoded;
				}
			}
		} catch { /* ignore */ }
		return raw;
	}

	// ── URL resolver ──────────────────────────────────────────────────────────
	function resolveUrl(input) {
		const trimmed = input.trim();
		try { return new URL(trimmed).href; } catch {}
		try {
			const u = new URL("http://" + trimmed);
			if (u.hostname.includes(".")) return u.href;
		} catch {}
		const engine = document.getElementById("sj-search-engine")?.value || "https://duckduckgo.com/?q=%s";
		return engine.replace("%s", encodeURIComponent(trimmed));
	}

	// ── Bookmarks ─────────────────────────────────────────────────────────────
	function saveBookmarks() {
		try { localStorage.setItem("bc_bookmarks", JSON.stringify(bookmarks)); } catch {}
	}

	function renderBookmarks() {
		bmBar.innerHTML = "";
		if (bookmarks.length === 0) {
			const empty = document.createElement("span");
			empty.style.cssText = "font-family:'DM Sans',sans-serif;font-size:11px;color:rgba(200,185,255,0.25);";
			empty.textContent = "No bookmarks yet — click ↓ to save this page";
			bmBar.appendChild(empty);
			return;
		}
		bookmarks.forEach((bm, i) => {
			const el = document.createElement("div");
			el.className = "bc-bookmark";
			el.textContent = bm.title || bm.url;
			el.title = bm.url;
			el.addEventListener("click", () => {
				navigateTo(bm.url);
				bmBar.classList.remove("visible");
				bmBarOpen = false;
			});
			// Long-press or right-click to remove
			el.addEventListener("contextmenu", e => {
				e.preventDefault();
				bookmarks.splice(i, 1);
				saveBookmarks();
				renderBookmarks();
			});
			bmBar.appendChild(el);
		});
	}

	// ── History dropdown ──────────────────────────────────────────────────────
	function showHistoryDropdown() {
		// Simple overlay list above toolbar
		const existing = document.getElementById("bc-hist-dropdown");
		if (existing) { existing.remove(); histDropOpen = false; return; }

		const drop = document.createElement("div");
		drop.id = "bc-hist-dropdown";
		drop.style.cssText = `
			position:fixed; bottom:56px; left:50%; transform:translateX(-50%);
			width:320px; max-height:260px; overflow-y:auto;
			background:rgba(6,2,20,0.97); border:1px solid rgba(124,58,237,0.25);
			border-radius:10px 10px 0 0; z-index:9999;
			backdrop-filter:blur(16px); box-shadow:0 -8px 30px rgba(0,0,0,0.6);
			scrollbar-width:thin; scrollbar-color:rgba(124,58,237,0.3) transparent;
		`;

		if (browseHistory.length === 0) {
			drop.innerHTML = `<div style="padding:20px;text-align:center;font-family:'DM Sans',sans-serif;font-size:12px;color:rgba(200,185,255,0.3);">No history yet</div>`;
		} else {
			const header = document.createElement("div");
			header.style.cssText = "padding:10px 14px 6px;font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(200,185,255,0.3);border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center;";
			header.innerHTML = `<span>Recent History</span><button style="background:none;border:none;color:rgba(200,185,255,0.3);font-size:10px;cursor:pointer;font-family:'DM Sans',sans-serif;" id="bc-clear-hist">Clear</button>`;
			drop.appendChild(header);

			browseHistory.slice(0, 20).forEach(item => {
				const row = document.createElement("div");
				row.style.cssText = "padding:8px 14px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:background 0.1s;border-bottom:1px solid rgba(255,255,255,0.03);";
				row.innerHTML = `
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(200,185,255,0.3)" stroke-width="2"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>
					<span style="flex:1;font-family:'DM Sans',sans-serif;font-size:12px;color:rgba(200,185,255,0.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(item.url)}</span>
				`;
				row.addEventListener("mouseenter", () => row.style.background = "rgba(124,58,237,0.08)");
				row.addEventListener("mouseleave", () => row.style.background = "");
				row.addEventListener("click", () => {
					navigateTo(item.url);
					drop.remove();
					histDropOpen = false;
				});
				drop.appendChild(row);
			});
		}

		document.body.appendChild(drop);
		histDropOpen = true;

		drop.querySelector("#bc-clear-hist")?.addEventListener("click", () => {
			browseHistory = [];
			try { localStorage.removeItem("bc_history"); } catch {}
			drop.remove();
			histDropOpen = false;
		});

		// Close on outside click
		setTimeout(() => {
			document.addEventListener("click", function closer(e) {
				if (!drop.contains(e.target) && e.target !== historyBtn) {
					drop.remove();
					histDropOpen = false;
					document.removeEventListener("click", closer);
				}
			});
		}, 10);
	}

	// ── Button events ─────────────────────────────────────────────────────────
	pullTab.addEventListener("click", toggleToolbar);
	pullTab.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") toggleToolbar(); });

	closeBtn.addEventListener("click", closeToolbar);
	btnBack.addEventListener("click", goBack);
	btnForward.addEventListener("click", goForward);
	homeBtn.addEventListener("click", () => {
		// Remove frame, show home page
		if (activeFrame) {
			activeFrame.remove();
			activeFrame = null;
		}
		document.body.classList.remove("bc-active", "bc-open");
		closeToolbar();
		const mainWrapper = document.querySelector(".main-wrapper");
		if (mainWrapper) mainWrapper.style.display = "";
	});

	reloadBtn.addEventListener("click", reload);

	bmBtn.addEventListener("click", () => {
		bmBarOpen = !bmBarOpen;
		bmBar.classList.toggle("visible", bmBarOpen);
		bmBtn.classList.toggle("active", bmBarOpen);
		if (bmBarOpen) renderBookmarks();
	});

	saveBmBtn.addEventListener("click", () => {
		const url = addrInput.value.trim();
		if (!url) return;
		const title = url.replace(/^https?:\/\//, "").split("/")[0];
		if (!bookmarks.find(b => b.url === url)) {
			bookmarks.unshift({ url, title });
			saveBookmarks();
		}
		// Flash the button
		saveBmBtn.style.color = "#a78bfa";
		setTimeout(() => { saveBmBtn.style.color = ""; }, 800);
	});

	historyBtn.addEventListener("click", showHistoryDropdown);

	// Address bar submit
	addrInput.addEventListener("keydown", e => {
		if (e.key === "Enter") {
			const url = resolveUrl(addrInput.value);
			navigateTo(url);
			addrInput.blur();
		}
		if (e.key === "Escape") addrInput.blur();
	});
	addrInput.addEventListener("focus", () => addrInput.select());

	// ── Keyboard shortcuts ─────────────────────────────────────────────────────
	document.addEventListener("keydown", e => {
		if (!document.body.classList.contains("bc-active")) return;
		if (e.ctrlKey && e.key === "r") { e.preventDefault(); reload(); }
		if (e.ctrlKey && e.key === "l") { e.preventDefault(); addrInput.focus(); }
		if (e.altKey && e.key === "ArrowLeft")  { e.preventDefault(); goBack(); }
		if (e.altKey && e.key === "ArrowRight") { e.preventDefault(); goForward(); }
		if (e.key === "Escape" && toolbarOpen)   closeToolbar();
	});

	// ── Hook into existing scramjet flow ──────────────────────────────────────
	// index.js does: document.body.appendChild(frame.frame) where frame.frame.id = "sj-frame"
	const _origAppend = document.body.appendChild.bind(document.body);
	document.body.appendChild = function (el) {
		if (el && el.tagName === "IFRAME" && el.id === "sj-frame") {
			// Let it append normally first
			const result = _origAppend(el);

			activeFrame = el;
			navHistory = [];
			histIdx = -1;

			// Hide home page, show browser chrome
			const mainWrapper = document.querySelector(".main-wrapper");
			if (mainWrapper) mainWrapper.style.display = "none";

			document.body.classList.add("bc-active");

			// When the frame loads, grab and decode the URL
			el.addEventListener("load", () => {
				doneProgress();
				// Prefer the real URL stored by index.js on the element
				const stored = el.dataset?.realUrl;
				if (stored) {
					addrInput.value = stored;
					if (navHistory.length === 0) pushHistory(stored);
					updateNavBtns();
					return;
				}
				try {
					const raw = el.contentWindow?.location?.href;
					if (raw && raw !== "about:blank") {
						const real = decodeProxyUrl(raw);
						addrInput.value = real;
						if (navHistory.length === 0) pushHistory(real);
					}
				} catch { /* cross-origin */ }
				updateNavBtns();
			});

			// Grab the initial URL — prefer data-real-url set by index.js
			const initialUrl = el.dataset?.realUrl || decodeProxyUrl(el.src) || addrInput.value || "";
			if (initialUrl) {
				addrInput.value = initialUrl;
				pushHistory(initialUrl);
			}

			// Auto-open toolbar
			setTimeout(openToolbar, 150);

			return result;
		}
		return _origAppend(el);
	};

	// ── Also intercept frame.go() calls from scramjet ─────────────────────────
	// ScramjetController.createFrame returns an object with a .go() method.
	// We patch it after the frame is created to sync our address bar.
	const _origCreateFrame = window.ScramjetController?.prototype?.createFrame;
	if (_origCreateFrame) {
		window.ScramjetController.prototype.createFrame = function (...args) {
			const frameObj = _origCreateFrame.apply(this, args);
			const _origGo = frameObj.go.bind(frameObj);
			frameObj.go = function (url) {
				if (url) {
					const real = decodeProxyUrl(url);
					addrInput.value = real;
					pushHistory(real);
					startProgress();
					updateNavBtns();
				}
				return _origGo(url);
			};
			return frameObj;
		};
	}

	// ── Expose globally ───────────────────────────────────────────────────────
	window.__browserChrome = { navigateTo, goBack, goForward, reload, openToolbar, closeToolbar };

	function escHtml(s) {
		return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
	}

})();
