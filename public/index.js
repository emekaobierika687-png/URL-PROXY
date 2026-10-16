"use strict";

/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("sj-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("sj-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("sj-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("sj-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("sj-error-code");

const { ScramjetController } = $scramjetLoadController();
const scramjet = new ScramjetController({
	files: {
		wasm: "/scram/scramjet.wasm.wasm",
		all: "/scram/scramjet.all.js",
		sync: "/scram/scramjet.sync.js",
	},
});
scramjet.init();

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

// ---------------------------------------------------------------------------
// Base64 route encoding — DISABLED.
// The chrome (browser-chrome.js) now handles navigation in-page, so we no
// longer reload the whole document with ?route=... . Keeping these functions
// around in case you want to re-enable the redirect behaviour later.
// ---------------------------------------------------------------------------
/*
function encodeRoute(realUrl) {
	const b64 = btoa(realUrl);
	return `/search?query=${encodeURIComponent(b64)}&v="1"`;
}

function buildProxyHref(realUrl) {
	const route = encodeRoute(realUrl);
	return `${location.origin}/?route=${encodeURIComponent(route)}`;
}

function goToSite(realUrl) {
	if (!realUrl) return;
	location.href = buildProxyHref(realUrl);
}
*/

// ---------------------------------------------------------------------------
// Expose the proxy frame factory so browser-chrome.js can drive it.
//   window.__areoyNavigate(url, iframe)
// ---------------------------------------------------------------------------
window.__areoyCreateFrame = function () {
	return scramjet.createFrame();
};

window.__areoyNavigate = async function (url, iframe) {
	await registerSW();

	let wispUrl =
		(location.protocol === "https:" ? "wss" : "ws") +
		"://" +
		location.host +
		"/wisp/";

	await connection.setTransport("/libcurl/index.mjs", [{ websocket: wispUrl }]);

	let attempts = 0;
	while ((await connection.getTransport()) !== "/libcurl/index.mjs") {
		if (attempts++ > 20) {
			throw new Error("Transport failed to initialize.");
		}
		await new Promise((r) => setTimeout(r, 200));
	}

	// If the chrome handed us its iframe, adopt it into a Scramjet frame.
	if (iframe) {
		const frame = scramjet.createFrame();
		frame.frame = iframe;
		frame.go(url);
		return frame;
	}

	// Otherwise create our own and append to body (legacy fallback).
	const frame = scramjet.createFrame();
	frame.frame.id = "sj-frame";
	frame.frame.dataset.realUrl = url;
	document.body.appendChild(frame.frame);
	frame.go(url);
	return frame;
};

// ---------------------------------------------------------------------------
// Landing form submit — DISABLED redirect.
// browser-chrome.js intercepts #sj-form in the capture phase and calls
// window.areoyOpenUrl(target) itself, so we do nothing here.
// ---------------------------------------------------------------------------
/*
form.addEventListener("submit", (event) => {
	event.preventDefault();
	const input = address.value.trim();
	if (!input) return;
	const b64 = btoa(unescape(encodeURIComponent(input)));
	location.href = `${location.origin}/?route=${encodeURIComponent(`/search?query=${encodeURIComponent(b64)}&v="1"`)}`;
});
*/

// ---------------------------------------------------------------------------
// Auto-navigate on ?route= — DISABLED.
// The chrome no longer produces ?route= URLs, so there is nothing to decode.
// ---------------------------------------------------------------------------
/*
window.addEventListener("load", async () => {
	const params = new URLSearchParams(location.search);
	const route = params.get("route");
	if (!route) return;

	const routeParams = new URLSearchParams(route.split("?")[1]);
	const query = routeParams.get("query");
	if (!query) return;

	let rawInput;
	try {
		rawInput = decodeURIComponent(escape(atob(decodeURIComponent(query))));
	} catch {
		return;
	}

	try {
		await registerSW();
	} catch (err) {
		error.textContent = "Failed to register service worker.";
		errorCode.textContent = err.toString();
		return;
	}

	const url = search(rawInput, searchEngine.value);

	let wispUrl =
		(location.protocol === "https:" ? "wss" : "ws") +
		"://" +
		location.host +
		"/wisp/";

	await connection.setTransport("/libcurl/index.mjs", [{ websocket: wispUrl }]);

	let attempts = 0;
	while ((await connection.getTransport()) !== "/libcurl/index.mjs") {
		if (attempts++ > 20) {
			error.textContent = "Transport failed to initialize.";
			return;
		}
		await new Promise((r) => setTimeout(r, 200));
	}

	const frame = scramjet.createFrame();
	frame.frame.id = "sj-frame";
	frame.frame.dataset.realUrl = url;

	document.body.appendChild(frame.frame);
	frame.go(url);
});
*/
