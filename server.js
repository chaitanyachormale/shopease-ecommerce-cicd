/**
 * Lightweight Zero-Dependency Static File Server
 * Used for local development and instant verification.
 * Automatically selects Port 3001 if Port 3000 is occupied.
 * Run with: npm start
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const FALLBACK_PORT = 3001;
const PUBLIC_DIR = path.resolve(__dirname);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  // Normalize URL path and remove query parameters
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(reqUrl.pathname);

  if (pathname === "/") {
    pathname = "/index.html";
  }

  // Prevent directory traversal attacks
  const safePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("403 Forbidden");
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache"
    });

    const stream = fs.createReadStream(safePath);
    stream.pipe(res);
  });
});

let currentPort = DEFAULT_PORT;

function listenOnPort(port) {
  server.listen(port, () => {
    console.log("\n=======================================================");
    console.log(`  ShopEase E-Commerce Application Running!`);
    console.log(`  URL: http://localhost:${port}`);
    console.log(`  Serving files from: ${PUBLIC_DIR}`);
    console.log(`  Press Ctrl + C to stop`);
    console.log("=======================================================\n");
  });
}

server.on("error", (err) => {
  if (err.code === "EADDRINUSE" && currentPort !== FALLBACK_PORT) {
    console.warn(`[Port ${currentPort} is currently in use. Switching to fallback port ${FALLBACK_PORT}...]`);
    currentPort = FALLBACK_PORT;
    listenOnPort(currentPort);
  } else {
    console.error("Server error:", err);
    process.exit(1);
  }
});

listenOnPort(currentPort);
