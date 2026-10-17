/* ==========================================================================
   Areoy Proxy — Deploy Bundler Loader
   Registers the Service Worker that intercepts and rebundles all requests.
   ========================================================================== */

(function () {
    "use strict";

    var isLocalhost = window.location.hostname === "localhost" || 
                      window.location.hostname === "127.0.0.1" || 
                      window.location.protocol === "file:";

    if (isLocalhost) {
        console.log("[Bundler] Local environment detected. Using normal paths.");
        return; 
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/bundler-sw.js', { scope: '/' })
                .then(function(registration) {
                    console.log('[Bundler] Service Worker registered:', registration.scope);
                })
                .catch(function(error) {
                    console.error('[Bundler] Service Worker registration failed:', error);
                });
        });
    }

    function rewriteTags() {
        var links = document.querySelectorAll("link[rel='stylesheet']");
        links.forEach(function(link) {
            var href = link.getAttribute("href");
            if (href) link.setAttribute("href", getBundledPath(href));
        });

        var scripts = document.querySelectorAll("script[src]");
        scripts.forEach(function(script) {
            var src = script.getAttribute("src");
            if (src) {
                var newSrc = getBundledPath(src);
                if (newSrc !== src) {
                    var newScript = document.createElement("script");
                    newScript.src = newSrc;
                    if (script.defer) newScript.defer = true;
                    if (script.async) newScript.async = true;
                    script.parentNode.replaceChild(newScript, script);
                }
            }
        });
    }

    function getBundledPath(originalPath) {
        if (/^(https?:)?\/\//i.test(originalPath)) return originalPath;
        var cleanPath = originalPath.replace(/^(\.\/|\/)/, "");
        var ext = cleanPath.split(".").pop().toLowerCase();
        if (ext !== "css" && ext !== "js" && ext !== "wasm") return originalPath;
        
        var filename = cleanPath.split("/").pop().replace(/\.[^/.]+$/, "");
        var hash = btoa(filename).replace(/[^a-zA-Z0-9]/g, "").substring(0, 8);

        if (/scram/i.test(cleanPath)) {
            return "./sast/assets/bundel/index-" + hash + "." + ext;
        }
        if (/baremux/i.test(cleanPath)) {
            return "./serach/bundel/assets/index-" + hash + "." + ext;
        }
        return "./assets/bundle-" + hash + "." + ext;
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", rewriteTags);
    } else {
        rewriteTags();
    }

})();
