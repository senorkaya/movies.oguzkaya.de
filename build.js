// Generates /film/<slug>/index.html for every movie, so shared links
// get their own title, description and poster preview (WhatsApp, iMessage, …).
const fs = require("fs");
const path = require("path");

const SITE = "https://movies.oguzkaya.de";
const root = __dirname;
const template = fs.readFileSync(path.join(root, "index.html"), "utf8");
const movies = JSON.parse(fs.readFileSync(path.join(root, "movies.json"), "utf8"));

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

fs.rmSync(path.join(root, "film"), { recursive: true, force: true });

for (const m of movies) {
  const title = `${m.title} – ${m.rating}/10 · Oguz' Filmempfehlungen`;
  const desc = m.review || m.logline;
  const meta = `<!--meta:start-->
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${SITE}${esc(m.backdrop || m.poster)}">
  <meta property="og:url" content="${SITE}/film/${esc(m.slug)}">
  <!--meta:end-->`;
  const html = template.replace(/<!--meta:start-->[\s\S]*?<!--meta:end-->/, meta);
  const dir = path.join(root, "film", m.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

console.log(`Built ${movies.length} film pages.`);
