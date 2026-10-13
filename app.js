const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const enc = encodeURIComponent;

const state = { movies: [], mood: "Alle", sort: "rating" };

const filmUrl = m => `${location.origin}/film/${m.slug}/`;
const runtime = min => `${Math.floor(min / 60)} Std. ${min % 60} Min.`;
const stamp = m => `<span class="stamp"><b>${esc(m.rating)}</b><small>/10</small></span>`;

fetch("/movies.json")
  .then(r => r.json())
  .then(movies => {
    state.movies = movies;
    renderStats();
    renderHero();
    renderTop4();
    renderChips();
    renderGrid();
    openFromUrl();
  });

function renderStats() {
  const ms = state.movies;
  const avg = ms.reduce((s, m) => s + m.rating, 0) / ms.length;
  $("stats").textContent = `${ms.length} Filme · Ø ${avg.toLocaleString("de-DE", { maximumFractionDigits: 1 })}/10`;
}

function renderHero() {
  const ms = state.movies;
  const m = ms.find(x => x.featured) || [...ms].sort((a, b) => b.rating - a.rating)[0];
  $("hero").innerHTML = `
    <div class="hero-bg" style="background-image:url('${esc(m.backdrop)}')"></div>
    <div class="hero-inner">
      <span class="eyebrow">Aktuelle Empfehlung</span>
      <h1>${esc(m.title)}</h1>
      <div class="hero-meta">
        ${stamp(m)}
        <span>${esc(m.year)}</span><span>${esc(m.director)}</span><span>${runtime(m.runtime)}</span>
      </div>
      <p class="hero-logline">${esc(m.logline)}</p>
      <div class="actions">
        <button class="btn primary" data-open="${esc(m.slug)}">Mehr erfahren</button>
        <button class="btn" data-share="${esc(m.slug)}">Link teilen</button>
      </div>
    </div>`;
}

function renderTop4() {
  const top = state.movies.filter(m => m.top).sort((a, b) => a.top - b.top).slice(0, 4);
  const slots = top.map((m, i) => `
    <button class="top-item" data-open="${esc(m.slug)}" aria-label="${esc(m.title)}">
      <span class="rank">${i + 1}</span>
      <div class="frame"><img src="${esc(m.poster)}" alt="" loading="lazy"></div>
    </button>`);
  while (slots.length < 4) slots.push(`<div class="top-empty">Platz ${slots.length + 1} ist noch frei …</div>`);
  $("top4").innerHTML = slots.join("");
}

function renderChips() {
  const moods = ["Alle", ...new Set(state.movies.flatMap(m => m.moods))];
  $("chips").innerHTML = moods.map(mood => {
    const n = mood === "Alle" ? state.movies.length : state.movies.filter(m => m.moods.includes(mood)).length;
    return `<button class="chip ${mood === state.mood ? "active" : ""}" data-mood="${esc(mood)}">${esc(mood)} <span>${n}</span></button>`;
  }).join("");
}

function renderGrid() {
  const sorters = {
    rating: (a, b) => b.rating - a.rating || a.title.localeCompare(b.title),
    added: (a, b) => b.added.localeCompare(a.added),
    title: (a, b) => a.title.localeCompare(b.title, "de"),
  };
  const list = state.movies
    .filter(m => state.mood === "Alle" || m.moods.includes(state.mood))
    .sort(sorters[state.sort]);

  $("grid").innerHTML = list.map((m, i) => `
    <button class="card" data-open="${esc(m.slug)}" style="animation-delay:${i * 60}ms">
      <div class="frame">
        <span class="poster-stamp">${esc(m.rating)}</span>
        <img src="${esc(m.poster)}" alt="Poster: ${esc(m.title)}" loading="lazy">
        <div class="peek">${esc(m.logline)}</div>
      </div>
      <h3>${esc(m.title)}</h3>
      <div class="meta">${esc(m.year)} · ${esc(m.director)}</div>
      <div class="tags">${m.moods.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>
    </button>`).join("") || `<p class="empty">Keine Filme in dieser Kategorie.</p>`;
}

function renderSheet(m) {
  const trailer = `https://www.youtube.com/results?search_query=${enc(`${m.title} ${m.year} trailer`)}`;
  const stream = `https://www.justwatch.com/de/Suche?q=${enc(m.title)}`;
  $("sheet").innerHTML = `
    <button class="close" data-close aria-label="Schließen">×</button>
    <div class="sheet-hero" style="background-image:url('${esc(m.backdrop)}')"></div>
    <div class="sheet-body">
      <div class="sheet-poster">
        <span class="poster-stamp">${esc(m.rating)}</span>
        <img src="${esc(m.poster)}" alt="Poster: ${esc(m.title)}">
      </div>
      <div>
        <h2>${esc(m.title)}</h2>
        ${m.aka ? `<div class="aka">${esc(m.aka)}</div>` : ""}
        <div class="tags">${m.moods.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        <dl class="facts">
          <div><dt>Bewertung</dt><dd>${stamp(m)}</dd></div>
          <div><dt>Regie</dt><dd>${esc(m.director)}</dd></div>
          <div><dt>Jahr</dt><dd>${esc(m.year)}</dd></div>
          <div><dt>Laufzeit</dt><dd>${runtime(m.runtime)}</dd></div>
          <div><dt>Genre</dt><dd>${m.genres.map(esc).join(", ")}</dd></div>
        </dl>
        <div class="block-title">Worum geht's</div>
        <p>${esc(m.logline)}</p>
        <div class="block-title">Oguz sagt</div>
        <p class="review ${m.review ? "" : "empty"}">${m.review ? `„${esc(m.review)}“` : "Review folgt …"}</p>
        ${m.watchIf?.length ? `
          <div class="block-title">Schau ihn, wenn du … magst</div>
          <p>${m.watchIf.map(esc).join(" · ")}</p>` : ""}
        <div class="actions">
          <a class="btn primary" href="${trailer}" target="_blank" rel="noopener">▶ Trailer</a>
          <a class="btn" href="${stream}" target="_blank" rel="noopener">Wo streamen?</a>
          <button class="btn" data-share="${esc(m.slug)}">Link teilen</button>
        </div>
      </div>
    </div>`;
  $("sheet").scrollTop = 0;
}

function openFilm(slug, push = true) {
  const m = state.movies.find(x => x.slug === slug);
  if (!m) return;
  renderSheet(m);
  $("overlay").hidden = false;
  document.body.classList.add("locked");
  document.title = `${m.title} – Oguz' Filmempfehlungen`;
  if (push && location.pathname !== `/film/${slug}/`) history.pushState({ slug }, "", `/film/${slug}/`);
}

function closeFilm(push = true) {
  $("overlay").hidden = true;
  document.body.classList.remove("locked");
  document.title = "Oguz' Filmempfehlungen";
  if (push && location.pathname !== "/") history.pushState({}, "", "/");
}

function openFromUrl() {
  const slug = location.pathname.match(/^\/film\/([^/]+)/)?.[1] || location.hash.slice(1);
  if (slug && state.movies.some(m => m.slug === slug)) openFilm(slug, false);
  else closeFilm(false);
}

async function share(slug) {
  const m = state.movies.find(x => x.slug === slug);
  const url = filmUrl(m);
  const text = `${m.title} – ${m.rating}/10 von Oguz`;
  if (navigator.share && matchMedia("(pointer: coarse)").matches) {
    try { await navigator.share({ title: m.title, text, url }); return; } catch { return; }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast("Link kopiert – ab in den Chat damit");
  } catch {
    prompt("Link kopieren:", url);
  }
}

let toastTimer;
function toast(msg) {
  $("toast").textContent = msg;
  $("toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($("toast").hidden = true), 2200);
}

document.addEventListener("click", e => {
  const t = e.target.closest("[data-open],[data-share],[data-close],[data-mood]");
  if (!t) return;
  if (t.dataset.share) share(t.dataset.share);
  else if (t.dataset.open) openFilm(t.dataset.open);
  else if (t.dataset.mood) { state.mood = t.dataset.mood; renderChips(); renderGrid(); }
  else if ("close" in t.dataset) closeFilm();
});
$("sort").addEventListener("change", e => { state.sort = e.target.value; renderGrid(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("overlay").hidden) closeFilm(); });
window.addEventListener("popstate", openFromUrl);
