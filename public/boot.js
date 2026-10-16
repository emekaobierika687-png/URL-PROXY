/* ==========================================================================
   Areoy Proxy — boot.js
   Drives the #boot-screen shown in index.html.

   Responsibilities:
     1. Update #boot-status text as each boot stage completes.
     2. Wait for window.load + the service worker registration (if any).
     3. Fade #boot-screen out by adding .is-hidden.
     4. Expose window.bootDone() so other scripts can force-close it early.
     5. Safety timeout so the screen never gets stuck forever.
   ========================================================================== */

(function () {
    "use strict";

    var screen = document.getElementById("boot-screen");
    var status = document.getElementById("boot-status");

    // If the markup isn't there, do nothing.
    if (!screen) return;

    // ----------------------------------------------------------------------
    // State
    // ----------------------------------------------------------------------
    var STAGES = [
        { key: "connect",  label: "Connecting…" },
        { key: "runtime",  label: "Loading runtime…" },
        { key: "sw",       label: "Registering service worker…" },
        { key: "ready",    label: "Ready." }
    ];
    var stageIndex = 0;
    var finished = false;

    // Hard safety net: if nothing else closes the screen, close it anyway.
    var HARD_TIMEOUT_MS = 8000;
    var hardTimer = setTimeout(function () {
        // eslint-disable-next-line no-console
        console.warn("[boot] hard timeout reached — closing boot screen");
        finish("Ready.");
    }, HARD_TIMEOUT_MS);

    // ----------------------------------------------------------------------
    // Public API
    // ----------------------------------------------------------------------

    /**
     * Update the status text.
     * @param {string} text
     */
    function setStatus(text) {
        if (status && typeof text === "string") {
            status.textContent = text;
        }
    }
    window.bootSetStatus = setStatus;

    /**
     * Advance to the next predefined stage. No-op if we're past the end.
     */
    function nextStage() {
        if (stageIndex < STAGES.length - 1) {
            stageIndex += 1;
            setStatus(STAGES[stageIndex].label);
        }
    }
    window.bootNextStage = nextStage;

    /**
     * Close the boot screen. Idempotent — safe to call multiple times.
     * @param {string} [finalStatus] optional final status line
     */
    function finish(finalStatus) {
        if (finished) return;
        finished = true;

        clearTimeout(hardTimer);
        if (typeof finalStatus === "string") setStatus(finalStatus);

        // Give the browser one frame to paint the final status text
        // before we start the fade-out.
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                screen.classList.add("is-hidden");
                // Remove from the accessibility tree once faded.
                screen.setAttribute("aria-hidden", "true");
                // Fully detach after the CSS transition finishes (450ms in index.css).
                setTimeout(function () {
                    if (screen && screen.parentNode) {
                        screen.parentNode.removeChild(screen);
                    }
                }, 600);
            });
        });
    }
    window.bootDone = finish;

    // ----------------------------------------------------------------------
    // Stage 1 — first paint
    // ----------------------------------------------------------------------
    setStatus(STAGES[0].label);

    // ----------------------------------------------------------------------
    // Stage 2 — wait for the Scramjet / BareMux runtime to be present.
    //   scramjet.all.js and baremux/index.js are loaded synchronously in
    //   <head>, so by the time boot.js runs they should already be defined.
    //   If not, poll briefly.
    // ----------------------------------------------------------------------
    function waitForRuntime(maxMs) {
        var start = Date.now();
        return new Promise(function (resolve) {
            (function check() {
                var hasScram =
                    typeof window.$scramjet !== "undefined" ||
                    typeof window.Scramjet  !== "undefined";
                var hasBare =
                    typeof window.BareMux !== "undefined" ||
                    typeof window.$baremux !== "undefined";

                if (hasScram && hasBare) return resolve(true);
                if (Date.now() - start > maxMs) return resolve(false);
                setTimeout(check, 100);
            })();
        });
    }

    // ----------------------------------------------------------------------
    // Stage 3 — wait for the service worker registration (if register-sw.js
    //   exists and register-sw.js calls navigator.serviceWorker.register()).
    //   We don't own that file, so we just observe the container's state.
    // ----------------------------------------------------------------------
    function waitForServiceWorker(maxMs) {
        if (!("serviceWorker" in navigator)) return Promise.resolve(false);
        var start = Date.now();
        return new Promise(function (resolve) {
            (function check() {
                if (navigator.serviceWorker.controller) return resolve(true);
                navigator.serviceWorker.getRegistration()
                    .then(function (reg) {
                        if (reg && (reg.active || reg.installing || reg.waiting)) {
                            return resolve(true);
                        }
                        if (Date.now() - start > maxMs) return resolve(false);
                        setTimeout(check, 150);
                    })
                    .catch(function () {
                        if (Date.now() - start > maxMs) return resolve(false);
                        setTimeout(check, 150);
                    });
            })();
        });
    }

    // ----------------------------------------------------------------------
    // Main boot sequence
    // ----------------------------------------------------------------------
    function boot() {
        setStatus(STAGES[1].label);

        waitForRuntime(2500).then(function () {
            setStatus(STAGES[2].label);
            return waitForServiceWorker(2500);
        }).then(function () {
            finish(STAGES[3].label);
        }).catch(function (err) {
            // Never let an error leave the user staring at the boot screen.
            // eslint-disable-next-line no-console
            console.error("[boot] error during boot sequence:", err);
            finish("Ready.");
        });
    }

    // Kick off once the document is parsed (defer already guarantees this,
    // but window.load gives us a cleaner "everything painted" moment).
    if (document.readyState === "complete") {
        boot();
    } else {
        window.addEventListener("load", boot, { once: true });
    }
})();
