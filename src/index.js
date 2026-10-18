import { createServer } from "node:http";
import { fileURLToPath } from "url";
import path from "path";
import { hostname } from "node:os";
import fetch from "node-fetch";

import { server as wisp, logging } from "@mercuryworkshop/wisp-js/server";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";

import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

/* -------------------- PATH FIX -------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, "../public");

/* -------------------- WISP CONFIG -------------------- */
logging.set_level(logging.NONE);

Object.assign(wisp.options, {
    allow_udp_streams: false,
    hostname_blacklist: [/example\.com/],
    dns_servers: ["1.1.1.3", "1.0.0.3"],
});

/* -------------------- FASTIFY SERVER -------------------- */
const fastify = Fastify({
    serverFactory: (handler) => {
        return createServer()
            .on("request", (req, res) => {
                res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
                handler(req, res);
            })
            .on("upgrade", (req, socket, head) => {
                if (req.url.endsWith("/wisp/")) {
                    wisp.routeRequest(req, socket, head);
                } else {
                    socket.end();
                }
            });
    },
});

/* ==========================================================================
   API ROUTES
   ========================================================================== */

// --- TMDB API ---
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'YOUR_TMDB_API_KEY_HERE';
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function fetchTMDB(endpoint) {
    if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY not configured');
    const url = `${TMDB_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('TMDB API error');
    return await res.json();
}

fastify.get("/api/tmdb/movie/popular", async (req, reply) => {
    try { reply.send(await fetchTMDB('/movie/popular?language=en-US&page=1')); } 
    catch (e) { reply.status(500).send({ error: e.message }); }
});

fastify.get("/api/tmdb/movie/trending", async (req, reply) => {
    try { reply.send(await fetchTMDB('/trending/movie/week')); } 
    catch (e) { reply.status(500).send({ error: e.message }); }
});

fastify.get("/api/tmdb/tv/popular", async (req, reply) => {
    try { reply.send(await fetchTMDB('/tv/popular?language=en-US&page=1')); } 
    catch (e) { reply.status(500).send({ error: e.message }); }
});

fastify.get("/api/tmdb/tv/trending", async (req, reply) => {
    try { reply.send(await fetchTMDB('/trending/tv/week')); } 
    catch (e) { reply.status(500).send({ error: e.message }); }
});

fastify.get("/api/tmdb/search", async (req, reply) => {
    const q = req.query.q;
    if (!q) return reply.status(400).send({ error: "Missing query" });
    try {
        const data = await fetchTMDB(`/search/multi?query=${encodeURIComponent(q)}&include_adult=false`);
        const results = (data.results || []).filter((r) => r.media_type === 'movie' || r.media_type === 'tv');
        reply.send({ ...data, results });
    } catch (e) { reply.status(500).send({ error: e.message }); }
});

// --- AI (Groq) API with Vision ---
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'gsk_YOUR_GROQ_API_KEY_HERE';
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

fastify.post("/api/ai/chat", async (req, reply) => {
    const { messages, image } = req.body;
    
    if (!messages) return reply.status(400).send({ error: "Missing messages" });

    let finalMessages = [...messages];
    
    // If an image is provided, structure it for the Vision model
    if (image) {
        const lastMsg = finalMessages.pop();
        finalMessages.push({
            role: "user",
            content: [
                { type: "text", text: lastMsg.content || "Analyze this image." },
                { type: "image_url", image_url: { url: image } }
            ]
        });
    }

    try {
        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${GROQ_API_KEY}` 
            },
            body: JSON.stringify({ 
                model: "qwen/qwen3.8-27b", // Multimodal Vision Model
                messages: finalMessages, 
                temperature: 0.7 
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        reply.send({ text: data.choices[0].message.content });
    } catch (error) { 
        reply.status(500).send({ error: error.message }); 
    }
});

// --- Music API ---
fastify.get("/api/music/browse", async (req, reply) => {
    reply.send({
        sections: [
            {
                id: "top", title: "Top Hits", icon: "flame",
                tracks: [
                    { id: "yt51zjlMhdSTE", title: "Espresso", artist: "Sabrina Carpenter", artwork: "https://i.ytimg.com/vi/51zjlMhdSTE/hqdefault.jpg" },
                    { id: "ytd5gf9dXbPi0", title: "BIRDS OF A FEATHER", artist: "Billie Eilish", artwork: "https://i.ytimg.com/vi/d5gf9dXbPi0/hqdefault.jpg" }
                ]
            }
        ]
    });
});

fastify.get("/api/music/search", async (req, reply) => {
    const q = req.query.q;
    if (!q) return reply.status(400).send({ error: "Missing query" });
    reply.send({
        tracks: [
            { id: "yt51zjlMhdSTE", title: "Espresso", artist: "Sabrina Carpenter", artwork: "https://i.ytimg.com/vi/51zjlMhdSTE/hqdefault.jpg" }
        ]
    });
});

fastify.get("/api/music/play/:id", async (req, reply) => {
    const id = req.params.id;
    if (id.startsWith("yt")) {
        reply.send({ provider: "youtube", videoId: id.slice(2) });
    } else {
        reply.send({ audioUrl: "https://example.com/audio.mp3" });
    }
});

/* -------------------- STATIC FILES -------------------- */

fastify.register(fastifyStatic, {
    root: publicPath,
    decorateReply: true,
    index: "index.html",
});

fastify.register(fastifyStatic, {
    root: scramjetPath,
    prefix: "/scram/",
    decorateReply: false,
});

fastify.register(fastifyStatic, {
    root: libcurlPath,
    prefix: "/libcurl/",
    decorateReply: false,
});

fastify.register(fastifyStatic, {
    root: baremuxPath,
    prefix: "/baremux/",
    decorateReply: false,
});

/* -------------------- ROOT ROUTE -------------------- */

fastify.get("/", async (req, reply) => {
    return reply.sendFile("index.html");
});

/* -------------------- HEALTH CHECK -------------------- */

fastify.get("/health", async () => {
    return { status: "ok" };
});

/* -------------------- 404 HANDLER -------------------- */

fastify.setNotFoundHandler((request, reply) => {
    return reply.code(404).type("text/html").sendFile("404.html");
});

/* -------------------- LOGGING -------------------- */

fastify.server.on("listening", () => {
    const address = fastify.server.address();
    console.log("Listening on:");
    console.log(`\thttp://localhost:${address.port}`);
    console.log(`\thttp://${hostname()}:${address.port}`);
    console.log(
        `\thttp://${address.family === "IPv6" ? `[${address.address}]` : address.address}:${address.port}`
    );
});

/* -------------------- SHUTDOWN -------------------- */

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
    console.log("Shutdown signal received");
    fastify.close(() => process.exit(0));
}

/* -------------------- START SERVER -------------------- */

let port = parseInt(process.env.PORT || "");
if (isNaN(port)) port = 8080;

try {
    await fastify.listen({
        port,
        host: "0.0.0.0",
    });
} catch (err) {
    console.error(err);
    process.exit(1);
}
