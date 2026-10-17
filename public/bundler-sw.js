/* ==========================================================================
   Areoy Proxy — Bundler Service Worker
   Intercepts network requests and dynamically rebundles scram/baremux files.
   ========================================================================== */

const bundleCache = {};

function generateHash(input) {
    try {
        return btoa(input).replace(/[^a-zA-Z0-9]/g, "").substring(0, 8);
    } catch (e) {
        return "fallback";
    }
}

function getBundledPath(url) {
    try {
        const urlObj = new URL(url, self.location.origin);
        let path = urlObj.pathname.replace(/^\//, "");
        const ext = path.split(".").pop().toLowerCase();
        
        if (ext !== "css" && ext !== "js" && ext !== "wasm") return null;

        const filename = path.split("/").pop().replace(/\.[^/.]+$/, "");
        const hash = generateHash(filename);

        if (/scram/i.test(path)) {
            return `/sast/assets/bundel/index-${hash}.${ext}`;
        }
        if (/baremux/i.test(path)) {
            return `/serach/bundel/assets/index-${hash}.${ext}`;
        }
        return `/assets/bundle-${hash}.${ext}`;
    } catch(e) {
        return null;
    }
}

self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    const urlObj = new URL(url, self.location.origin);

    if (urlObj.pathname.startsWith('/sast/assets/bundel/') || 
        urlObj.pathname.startsWith('/serach/bundel/assets/') || 
        urlObj.pathname.startsWith('/assets/bundle-')) {
        
        event.respondWith(handleBundleRequest(event.request, urlObj.pathname));
        return;
    }

    if (/scram|baremux/i.test(urlObj.pathname)) {
        const bundledPath = getBundledPath(url);
        if (bundledPath) {
            const redirectUrl = new URL(bundledPath, self.location.origin).href;
            event.respondWith(fetch(redirectUrl));
        }
    }
});

async function handleBundleRequest(request, fakePath) {
    try {
        if (bundleCache[fakePath]) {
            const cached = bundleCache[fakePath];
            return new Response(cached.content, {
                headers: { 
                    'Content-Type': cached.type,
                    'Cache-Control': 'no-cache'
                }
            });
        }

        let originalUrl = "";
        let mimeType = "application/javascript";

        if (fakePath.startsWith('/sast/assets/bundel/')) {
            originalUrl = '/scram/scramjet.all.js'; 
            if (fakePath.endsWith('.wasm')) originalUrl = '/scram/scramjet.wasm';
        } else if (fakePath.startsWith('/serach/bundel/assets/')) {
            originalUrl = '/baremux/index.js';
            if (fakePath.endsWith('.wasm')) originalUrl = '/baremux/baremux.wasm';
        } else {
            originalUrl = request.url; 
        }

        const response = await fetch(originalUrl);
        if (!response.ok) throw new Error('Original fetch failed');

        let content;
        
        if (fakePath.endsWith('.wasm')) {
            content = await response.arrayBuffer();
            mimeType = "application/wasm";
        } else {
            let text = await response.text();

            if (fakePath.endsWith('.js')) {
                text = text.replace(/(["'])(.*?(?:scram|baremux).*?)\1/gi, (match, quote, p1) => {
                    if (/^(https?:)?\/\//i.test(p1)) return match;
                    
                    const newPath = getBundledPath(p1);
                    if (newPath) {
                        return `${quote}${newPath}${quote}`;
                    }
                    return match;
                });
            }
            content = text;
        }

        bundleCache[fakePath] = { content: content, type: mimeType };

        return new Response(content, {
            headers: { 
                'Content-Type': mimeType,
                'Cache-Control': 'no-cache'
            }
        });

    } catch (error) {
        console.error('[Bundler SW] Error:', error);
        return fetch(request);
    }
}
