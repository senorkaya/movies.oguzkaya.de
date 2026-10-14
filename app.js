const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const enc = encodeURIComponent;

const trophy = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V18h3v3H8v-3h3v-3.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V5h3V3Zm0 4H6v1a2 2 0 0 0 1 1.7V7Zm10 0v2.7A2 2 0 0 0 18 8V7h-1Z"/></svg>`;

/* ---------- Sprache ---------- */
const TEXT = {
  de: {
    title: "Oguz' Filmliste",
    h1: `Oguz' <span class="accent">Filmliste.</span>`,
    lead: "Jeder Film, den ich gucke, mit Bewertung und meiner Meinung dazu.",
    favorites: "Meine aktuellen Filmempfehlungen",
    recent: "Zuletzt gesehen",
    all: "Alle Filme",
    allChip: "Alle",
    empty: "Keine Filme in dieser Kategorie.",
    footer: "Bilder: TMDB",
    signup: "Banger-Alarm",
    signupLead: "Bekomm eine Mail, sobald ein Film mit 4,2 oder mehr dazukommt. Keine Werbung, jederzeit abmeldbar.",
    signupBtn: "Eintragen",
    signupLabel: "E-Mail-Adresse",
    signupOk: "Du bist drin! Die nächste Banger-Mail kommt zu dir.",
    signupBad: "Bitte gib eine gültige E-Mail-Adresse ein.",
    signupErr: "Hat nicht geklappt. Bitte versuch es gleich nochmal.",
    imprint: "Impressum",
    close: "Schließen",
    myTake: "Meine Meinung",
    breakdown: "Bewertung im Detail",
    about: "Worum es geht",
    awards: "Auszeichnungen",
    nominated: "Nominiert",
    tip: "Mein Tipp: Keinen Trailer gucken. Einfach reinspringen.",
    stream: "Wo streamen?",
    trailer: "Trailer",
    counts: "zählt doppelt",
    notRated: "Bereiche mit „–“ habe ich bei diesem Film nicht gewertet.",
    cats: { story: "Story", unterhaltung: "Unterhaltung / Spannung", schauspiel: "Schauspiel", look: "Look & Sound" },
    verdicts: ["Pflichtfilm", "Empfehlung", "Kann man gucken", "Lieber skippen"],
    hours: (h, m) => (m ? `${h} Std. ${m} Min.` : `${h} Std.`),
    parts: (n, t) => `${n} Filme, zusammen ${t}`,
    locale: "de-DE",
  },
  en: {
    title: "Oguz's Film List",
    h1: `Oguz's <span class="accent">film list.</span>`,
    lead: "Every film I watch, with a rating and my take on it.",
    favorites: "My current recommendations",
    recent: "Recently watched",
    all: "All films",
    allChip: "All",
    empty: "No films in this category.",
    footer: "Images: TMDB",
    signup: "Banger alert",
    signupLead: "Get an email whenever a film rated 4.2 or higher gets added. No ads, unsubscribe anytime.",
    signupBtn: "Sign up",
    signupLabel: "Email address",
    signupOk: "You're in! The next banger email is coming your way.",
    signupBad: "Please enter a valid email address.",
    signupErr: "That didn't work. Please try again in a moment.",
    imprint: "Legal notice",
    close: "Close",
    myTake: "My take",
    breakdown: "Rating breakdown",
    about: "What it's about",
    awards: "Awards",
    nominated: "Nominated",
    tip: "My tip: Don't watch the trailer. Just dive in.",
    stream: "Where to stream?",
    trailer: "Trailer",
    counts: "counts double",
    notRated: "Categories marked “–” weren't rated for this film.",
    cats: { story: "Story", unterhaltung: "Entertainment / Suspense", schauspiel: "Acting", look: "Look & Sound" },
    verdicts: ["Must-watch", "Recommended", "Worth a watch", "Skip it"],
    hours: (h, m) => (m ? `${h} h ${m} min` : `${h} h`),
    parts: (n, t) => `${n} films, ${t} in total`,
    locale: "en-GB",
  },
};

// Stimmungen und Genres stehen auf Deutsch in movies.json und werden hier übersetzt
const WORDS_EN = {
  Action: "Action", Aluhut: "Tinfoil Hat", Augenschmaus: "Eye Candy", Doku: "Documentary", Drama: "Drama",
  Horror: "Horror", KI: "AI", Klassiker: "Classic", Komödie: "Comedy", Mindfuck: "Mindfuck",
  "Plot-Twist": "Plot Twist", "Sci-Fi": "Sci-Fi", Spannung: "Suspense",
  Abenteuer: "Adventure", Dokumentarfilm: "Documentary", Fantasy: "Fantasy", Krimi: "Crime",
  Mystery: "Mystery", Liebesfilm: "Romance", Biografie: "Biography", Kriegsfilm: "War", "Science-Fiction": "Science Fiction", Sport: "Sports", Thriller: "Thriller", Western: "Western",
};

function initialLang() {
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "de" || saved === "en") return saved;
  } catch {}
  return (navigator.language || "de").toLowerCase().startsWith("de") ? "de" : "en";
}

let lang = initialLang();
const t = () => TEXT[lang];
const word = w => (lang === "en" ? WORDS_EN[w] || w : w);
// Filmtext in der aktuellen Sprache, Deutsch als Rückfall
const L = (m, field) => (lang === "en" && m.en && m.en[field] != null ? m.en[field] : m[field]);

/* ---------- Bausteine ---------- */
let movies = [];
let mood = null; // null = alle

const fmt = n => Number(n).toLocaleString(t().locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const score = m => `<div class="score"><b>${fmt(m.rating)}</b><span>/5</span></div>`;

// Urteil aus der Gesamtnote (Skala 1–5)
function verdict(n) {
  const v = t().verdicts;
  if (n >= 4.5) return v[0];
  if (n >= 3.5) return v[1];
  if (n >= 2) return v[2];
  return v[3];
}
const verdictPill = m => `<span class="verdict ${m.rating >= 4.5 ? "top" : ""}">${verdict(m.rating)}</span>`;

const CATS = ["story", "unterhaltung", "schauspiel", "look"];
const bars = m => !m.scores ? "" : `
  <ul class="bars">
    ${CATS.map(k => `
      <li>
        <span class="bar-label">${t().cats[k]}${k === "story" ? ` <small>${t().counts}</small>` : ""}</span>
        <span class="bar"><i style="width:${((m.scores[k] ?? 0) / 5) * 100}%"></i></span>
        <span class="bar-val">${m.scores[k] == null ? "–" : fmt(m.scores[k])}</span>
      </li>`).join("")}
  </ul>
  ${CATS.some(k => m.scores[k] == null) ? `<p class="bars-note">${t().notRated}</p>` : ""}`;
const hours = min => t().hours(Math.floor(min / 60), min % 60);

const card = m => `
  <button class="card" data-open="${esc(m.slug)}">
    <div class="poster"><img src="${esc(m.poster)}" alt="" loading="lazy"></div>
    <div class="card-body">
      <h3>${esc(L(m, "title"))}</h3>
      <div class="meta">${esc(m.year)} · ${esc(word(m.genres[0]))}</div>
      <div class="rating">${score(m)}${verdictPill(m)}</div>
      ${L(m, "highlight") ? `<div class="award">${trophy}${esc(L(m, "highlight"))}</div>` : ""}
    </div>
  </button>`;

/* ---------- Seite zeichnen ---------- */
function renderStatic() {
  document.documentElement.lang = lang;
  document.title = t().title;
  $("h1").innerHTML = t().h1;
  $("lead").textContent = t().lead;
  $("h-favorites").textContent = t().favorites;
  $("h-recent").textContent = t().recent;
  $("h-all").textContent = t().all;
  $("footer").textContent = t().footer;
  $("h-signup").textContent = t().signup;
  $("signup-lead").textContent = t().signupLead;
  $("signup-btn").textContent = t().signupBtn;
  $("signup-label").textContent = t().signupLabel;
  $("imprint-link").textContent = t().imprint;
  document.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
}

function renderLists() {
  // Von Oguz handverlesen, Reihenfolge über "pick" (1 = zuerst)
  $("favorites").innerHTML = movies.filter(m => m.pick).sort((a, b) => a.pick - b.pick).map(card).join("");
  $("recent").innerHTML = movies.filter(m => m.lastWatched).sort((a, b) => a.lastWatched - b.lastWatched).slice(0, 4).map(card).join("");
  renderChips();
  renderGrid();
}

function renderChips() {
  const moods = [...new Set(movies.flatMap(m => m.moods))];
  $("chips").innerHTML =
    `<button class="chip ${mood === null ? "active" : ""}" data-mood="">${t().allChip}</button>` +
    moods.map(x => `<button class="chip ${x === mood ? "active" : ""}" data-mood="${esc(x)}">${esc(word(x))}</button>`).join("");
}

function renderGrid() {
  const list = movies.filter(m => mood === null || m.moods.includes(mood));
  $("grid").innerHTML = list.map(card).join("") || `<p class="empty">${t().empty}</p>`;
}

function renderSheet(m) {
  const title = L(m, "title");
  const trailer = `https://www.youtube.com/results?search_query=${enc(`${title} ${m.year} trailer${lang === "de" ? " deutsch" : ""}`)}`;
  const stream = lang === "de" ? `https://www.justwatch.com/de/Suche?q=${enc(title)}` : `https://www.justwatch.com/us/search?q=${enc(title)}`;
  const awards = L(m, "awards") || {};
  const won = awards.won || [];
  const nom = awards.nominated || [];
  $("sheet").innerHTML = `
    <button class="close" data-close aria-label="${t().close}">×</button>
    <div class="sheet-img" style="background-image:url('${esc(m.backdrop)}')"></div>
    <div class="sheet-body">
      <h2>${esc(title)}</h2>
      ${L(m, "aka") ? `<div class="aka">${esc(L(m, "aka"))}</div>` : ""}
      <div class="rating">${score(m)}${verdictPill(m)}</div>
      <div class="facts">${esc(m.year)} · ${esc(m.director)} · ${m.parts ? t().parts(m.parts, hours(m.runtime)) : hours(m.runtime)} · ${m.genres.map(g => esc(word(g))).join(", ")}</div>

      <h3>${t().myTake}</h3>
      <p class="review">${esc(L(m, "review"))}</p>

      <h3>${t().breakdown}</h3>
      ${bars(m)}

      <h3>${t().about}</h3>
      <p class="logline">${esc(L(m, "logline"))}</p>

      ${won.length || nom.length ? `
        <h3>${t().awards}</h3>
        <ul class="awards">
          ${won.map(a => `<li class="won">${esc(a)}</li>`).join("")}
          ${nom.map(a => `<li class="nom">${t().nominated} – ${esc(a)}</li>`).join("")}
        </ul>` : ""}

      ${m.noTrailer ? `<div class="tip">${t().tip}</div>` : ""}

      <div class="actions">
        <a class="btn primary" href="${stream}" target="_blank" rel="noopener">${t().stream}</a>
        <a class="btn" href="${trailer}" target="_blank" rel="noopener">${t().trailer}</a>
      </div>
    </div>`;
}

function setLang(next) {
  if (next === lang) return;
  lang = next;
  try { localStorage.setItem("lang", lang); } catch {}
  renderStatic();
  renderLists();
  const open = !$("overlay").hidden && movies.find(m => m.slug === location.hash.slice(1));
  if (open) { const y = $("sheet").scrollTop; renderSheet(open); $("sheet").scrollTop = y; }
}

/* ---------- Popup ---------- */
function openFilm(slug) {
  const m = movies.find(x => x.slug === slug);
  if (!m) return;
  renderSheet(m);
  $("sheet").scrollTop = 0;
  $("overlay").hidden = false;
  document.body.classList.add("locked");
  if (location.hash !== `#${slug}`) history.pushState(null, "", `#${slug}`);
}

function closeFilm() {
  $("overlay").hidden = true;
  document.body.classList.remove("locked");
  if (location.hash) history.pushState(null, "", location.pathname);
}

function openFromHash() {
  const slug = location.hash.slice(1);
  if (movies.some(m => m.slug === slug)) openFilm(slug);
  else if (!$("overlay").hidden) closeFilm();
}

/* ---------- Start ---------- */
renderStatic();

fetch("movies.json", { cache: "no-cache" })
  .then(r => r.json())
  .then(data => {
    // Beste Bewertung zuerst, bei Gleichstand die Reihenfolge aus movies.json
    movies = data.map((m, i) => ({ ...m, i })).sort((a, b) => b.rating - a.rating || a.i - b.i);
    renderLists();
    openFromHash();
  });

document.addEventListener("click", e => {
  const el = e.target.closest("[data-open],[data-close],[data-mood],[data-lang]");
  if (!el) return;
  if (el.dataset.lang) setLang(el.dataset.lang);
  else if (el.dataset.open) openFilm(el.dataset.open);
  else if ("mood" in el.dataset) { mood = el.dataset.mood || null; renderChips(); renderGrid(); }
  else closeFilm();
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("overlay").hidden) closeFilm(); });
window.addEventListener("popstate", openFromHash);

/* ---------- Banger-Alarm (Anmeldung läuft über Make) ---------- */
const SIGNUP_HOOK = "https://hook.eu1.make.com/59y07e1pq4yvmsqhpu79c6ovxavdaors";
$("signup-form").addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value.trim();
  const msg = $("signup-msg");
  msg.className = "signup-msg";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = t().signupBad; return; }
  $("signup-btn").disabled = true;
  try {
    await fetch(SIGNUP_HOOK, {
      method: "POST",
      mode: "no-cors",
      body: new URLSearchParams({ action: "subscribe", email, lang, website: form.website.value }),
    });
    msg.textContent = t().signupOk;
    msg.classList.add("ok");
    form.reset();
  } catch {
    msg.textContent = t().signupErr;
  } finally {
    $("signup-btn").disabled = false;
  }
});
