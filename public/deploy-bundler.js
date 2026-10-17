/* ==========================================================================
   Areoy Proxy — Build Script (Obfuscator)
   Wraps index.html in SVG, randomizes paths, and generates deploy-index.html.
   Run: node build.js
   ========================================================================== */

const fs = require('fs');
const path = require('path');

// Helper: Generate a random hash string
function randomHash(len = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < len; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

// Helper: Generate random directory/file path
function randomPath() {
    return `${randomHash(5)}/${randomHash(6)}.js`;
}

// 1. Read the original index.html
const sourceHtml = fs.readFileSync('index.html', 'utf8');

// 2. Generate random paths for the obfuscated assets
const scramPath = `./${randomPath()}`;
const baremuxPath = `./${randomPath()}`;
const bundlePath = `./assets/bundle-${randomHash()}.js`;
const cssPath = `./assets/index-${randomHash()}.css`;

// 3. Generate the encrypted payload for Scramjet/BareMux decryption
// This mimics the "0zI2ZYc91Ls=..." logic from the screenshot
const payloadUrls = [scramPath, baremuxPath, 'https://cdn.jsdelivr.net/npm/scramjet@latest/scramjet.all.js'];
const payloadJson = JSON.stringify(payloadUrls);
const key = randomHash();
let encryptedPayload = '';
for (let i = 0; i < payloadJson.length; i++) {
    encryptedPayload += String.fromCharCode(payloadJson.charCodeAt(i) ^ key.charCodeAt(i % key.length));
}
const base64Key = Buffer.from(key).toString('base64');
const base64Encrypted = Buffer.from(encryptedPayload).toString('base64');
const payloadString = `${base64Key}.${base64Encrypted}`;

// 4. Extract the body content from the original HTML
// We use regex to grab everything inside <body>...</body>
const bodyMatch = sourceHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
const bodyContent = bodyMatch ? bodyMatch[1] : sourceHtml;

// 5. Build the final SVG-wrapped HTML
const finalHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <foreignObject width="100%" height="100%">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <!-- 1. Service Worker Hijack -->
        <script>/*<![CDATA[*/(function(){var s=navigator.serviceWorker;if(!s)return;var r=s.register.bind(s);s.register=function(u,o){return r(u,o).catch(function(e){return s.getRegistration().then(function(g){if(g&&g.active)return g;throw e})})}})();/*]]>*/</script>
        
        <!-- 2. DOM Override (Makes foreignObject act as real DOM) -->
        <script>/*<![CDATA[*/
        (function(){
          var XHTML_NS="http://www.w3.org/1999/xhtml";
          var root=document.querySelector("foreignObject").firstElementChild;
          var origCE=document.createElement.bind(document);
          var origCENS=document.createElementNS.bind(document);
          Object.defineProperty(document,"head",{get:function(){return root.querySelector("head")},configurable:true});
          Object.defineProperty(document,"body",{get:function(){return root.querySelector("body")},configurable:true});
          Object.defineProperty(document,"documentElement",{get:function(){return root},configurable:true});
          document.createElement=function(t,o){return typeof t==="string"?origCENS(XHTML_NS,t,o):origCE(t,o)};
          document.createElementNS=function(ns,n,o){return (ns==null||ns===XHTML_NS)?origCENS(XHTML_NS,n,o):origCENS(ns,n,o)};
          Object.defineProperty(document,"getElementById",{value:function(id){return root.querySelector('[id="'+String(id).replace(/["\\\\]/g,'\\\\$&')+'"]')},configurable:true,writable:true});
          document.getElementsByTagName=function(t){return root.getElementsByTagNameNS(XHTML_NS,t)};
          document.getElementsByTagNameNS=function(ns,t){return root.getElementsByTagNameNS(ns,t)};
          document.getElementsByClassName=function(c){return root.getElementsByClassName(c)};
          var origQS=document.querySelector.bind(document);
          var origQSA=document.querySelectorAll.bind(document);
          document.querySelector=function(s){try{return root.querySelector(s)||origQS(s)}catch(e){return origQS(s)}};
          document.querySelectorAll=function(s){try{var a=root.querySelectorAll(s);return a.length?a:origQSA(s)}catch(e){return origQSA(s)}};
        })();
        /*]]>*/</script>
        
        <style><![CDATA[html,body{margin:0;width:100%;height:100%;overflow:hidden}foreignObject{overflow:visible}]]></style>
        
        <!-- 3. SEO & Meta -->
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no" />
        <title>Areoy Proxy</title>
        <link rel="icon" type="image/webp" href="favicon.webp" />
        <meta name="theme-color" content="#050a08" />
        <meta name="cherri-hs" content="__cherriHs" />
        <meta name="description" content="Areoy Proxy - Fast, secure, and unblocked web proxy.">
        
        <!-- 4. Obfuscated Loader -->
        <script>
/*<![CDATA[*/
window.__SW_FILE__="v7m.js",window.__swRegistration=navigator.serviceWorker?(function(){var o=(window.__SW_FILE__||"").split("/").pop(),i=function(r){try{return new URL(r,location.href).pathname.split("/").pop()}catch{return String(r)}},a=new URL(".",new URL(window.__SW_FILE__,location.href)).href;return navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(e){var n=e.active||e.waiting||e.installing;e.scope!==a&&n&&i(n.scriptURL)!==o&&e.unregister()})}).catch(function(){}),navigator.serviceWorker.register(window.__SW_FILE__,{updateViaCache:"all"}).then(function(r){function e(){var n=navigator.serviceWorker.controller;return!!n&&i(n.scriptURL)===o}return e()?(sessionStorage.removeItem("__sw_reload"),r):(sessionStorage.getItem("__sw_reload")||navigator.serviceWorker.ready.then(function(){if(!e()){var n=!1,t=function(){e()&&(n=!0,navigator.serviceWorker.removeEventListener("controllerchange",t))};navigator.serviceWorker.addEventListener("controllerchange",t),setTimeout(function(){navigator.serviceWorker.removeEventListener("controllerchange",t),!n&&!e()&&(sessionStorage.setItem("__sw_reload","1"),location.reload())},1200)}}),r)}).catch(function(r){return console.error("[sw] registration failed:",r),null})})():Promise.resolve(null);
/*]]>*/
</script>
        
        <!-- 5. Deploy Bundler (Handles path rewriting) -->
        <script src="deploy-bundler.js"></script>
        
        <!-- 6. Stylesheets (Handled by bundler) -->
        <link rel="stylesheet" crossorigin="crossorigin" href="${cssPath}" />
        
        <!-- 7. Your App Scripts -->
        <script src="${bundlePath}"></script>
      </head>
      <body>
        <!-- Boot Screen -->
        <main id="_3xbhir0">
            <img src="./favicon.svg" alt="" width="64" height="64" style="position:fixed;inset:0;margin:auto;transform:translateY(-30px);animation:boot-in .45s cubic-bezier(.2,0,0,1) both" />
            <div style="position:fixed;left:0;right:0;top:calc(50% + 26px);display:flex;flex-direction:column;align-items:center;gap:12px;font:500 12px system-ui,sans-serif;letter-spacing:.01em;color:var(--text-muted,#888)">
                <style>/*<![CDATA[*/
                @keyframes boot-in{from{opacity:0;transform:translateY(-22px) scale(.9)}}@keyframes boot-run{from{transform:translateX(-110%)}to{transform:translateX(310%)}}@media (prefers-reduced-motion:reduce){main>img,main>div>div>div{animation:none!important}}
                /*]]>*/</style>
                <div style="width:112px;height:3px;border-radius:3px;overflow:hidden;background:var(--border-2,#8883)">
                    <div style="width:40%;height:100%;border-radius:3px;background:var(--accent,#888);animation:boot-run 1.1s cubic-bezier(.45,0,.25,1) infinite"></div>
                </div>
                <span>Loading…</span>
            </div>
        </main>

        <!-- ==================================================================
             YOUR MAIN APP UI (From original index.html)
             ================================================================== -->
        ${bodyContent}

        <!-- 8. Decryption & Execution Payload -->
        <script>
/*<![CDATA[*/
(function(){var w="10602038",u=8e3;try{let i=function(e,n){var t=new AbortController,r=setTimeout(function(){t.abort()},u);fetch(e,{signal:t.signal}).then(function(o){if(clearTimeout(r),!o.ok)throw 0;return o.arrayBuffer()}).then(n,function(){n(null)})},v=function(e){return new Promise(function(n){if(!a)return i(e,n);var t=!1,r=setTimeout(function(){t||(t=!0,a=null,i(e,n))},u+1e3);a.onmessage=function(o){t||(t=!0,clearTimeout(r),n(o.data))},a.postMessage(e)})};for(var p=i,T=v,f="${payloadString}".split("."),l=atob(f[0]),s=atob(f[1]),h="",c=0;c<s.length;c++)h+=String.fromCharCode(s.charCodeAt(c)^l.charCodeAt(c%l.length));var d=JSON.parse(h),m=0,b="onconnect=function(e){var q=e.ports[0];q.onmessage=function(m){var c=new AbortController(),t=setTimeout(function(){c.abort()},"+u+");fetch(m.data,{signal:c.signal}).then(function(r){clearTimeout(t);if(!r.ok)throw 0;return r.arrayBuffer()}).then(function(b){q.postMessage(b,[b])},function(){q.postMessage(null)})}}",a=null;try{if(window.SharedWorker){var g=URL.createObjectURL(new Blob([b],{type:"text/javascript"}));a=new SharedWorker(g,"sync").port,a.start()}}catch{a=null}(function e(){m>=d.length||v(d[m++]).then(function(n){if(!n)return e();var t=URL.createObjectURL(new Blob([n],{type:"text/javascript"})),r=document.createElement("script");r.onload=r.onerror=function(){if(URL.revokeObjectURL(t),r.remove(),!window.aclib||typeof window.aclib.runPop!="function")return e();try{window.aclib.runPop({zoneId:w})}catch{}},r.src=t,document.head.appendChild(r)})})()}catch{}})();
/*]]>*/
</script>
      </body>
    </html>
  </foreignObject>
</svg>`;

// 6. Write the final output
fs.writeFileSync('deploy-index.html', finalHtml);
console.log('✅ Generated deploy-index.html successfully!');
console.log(`   CSS: ${cssPath}`);
console.log(`   Bundle: ${bundlePath}`);
console.log(`   Scramjet Payload: generated.`);
