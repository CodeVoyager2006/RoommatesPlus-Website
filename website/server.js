const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const indexPath = path.join(__dirname, "index.html");
const errorPath = path.join(__dirname, "error.html");

// Files that should never be served to the public even though they live in __dirname.
const BLOCKED = new Set([
  "server.js",
  "package.json",
  "package-lock.json",
  "vercel.json",
  ".gitignore",
]);

// Basic security headers on every response.
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
});

// Block direct access to source / config files.
app.use((req, res, next) => {
  const name = path.basename(req.path);
  if (BLOCKED.has(name) || name.startsWith(".")) {
    res.status(404);
    res.type("html");
    res.send(fs.readFileSync(errorPath, "utf-8"));
    return;
  }
  next();
});

app.use(express.static(__dirname, { dotfiles: "ignore" }));

app.get("/", (_req, res) => {
  res.type("html");
  res.send(fs.readFileSync(indexPath, "utf-8"));
});

app.use((req, res) => {
  res.status(404);
  res.type("html");
  res.send(fs.readFileSync(errorPath, "utf-8"));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500);
  res.type("html");
  res.send(fs.readFileSync(errorPath, "utf-8"));
});

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`http://localhost:${port}`);
  });
}
