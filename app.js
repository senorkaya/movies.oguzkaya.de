const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const enc = encodeURIComponent;

const trophy = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V18h3v3H8v-3h3v-3.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V5h3V3Zm0 4H6v1a2 2 0 0 0 1 1.7V7Zm10 0v2.7A2 2 0 0 0 18 8V7h-1Z"/></svg>`;

let movies = [];
let mood = "Alle";

const score = m => `<div class="score"><b>${esc(m.rating)}</b><span>/10</span></div>`;
const hours = min => `${Math.floor(min / 60)} Std. ${min % 60} Min.`;

fetch("movies.json")
  .then(r => r.json())
  .then(data => {
    // Beste Bewertung zuerst, bei Gleichstand die Reihenfolge aus movies.json
    movies = data.map((m, i) => ({ ...m, i })).sort((a, b) => b.rating - a.rating || a.i - b.i);
    $("favorites").innerHTML = movies.filter(m => m.favorite).map(card).join("");
    $("recent").innerHTML = movies.filter(m => m.lastWatched).sort((a, b) => a.lastWatched - b.lastWatched).map(card).join("");
    renderChips();
    renderGrid();
    openFromHash();
  });

function renderChips() {
  const moods = ["Alle", ...new Set(movies.flatMap(m => m.moods))];
  $("chips").innerHTML = moods
    .map(x => `<button class="chip ${x === mood ? "active" : ""}" data-mood="${esc(x)}">${esc(x)}</button>`)
    .join("");
}

const card = m => `
  <button class="card" data-open="${esc(m.slug)}">
    <div class="poster"><img src="${esc(m.poster)}" alt="" loading="lazy"></div>
    <div class="card-body">
      <h3>${esc(m.title)}</h3>
      <div class="meta">${esc(m.year)} · ${esc(m.genres[0])}</div>
      ${score(m)}
      ${m.highlight ? `<div class="award">${trophy}${esc(m.highlight)}</div>` : ""}
    </div>
  </button>`;

function renderGrid() {
  const list = movies.filter(m => mood === "Alle" || m.moods.includes(mood));
  $("grid").innerHTML = list.map(card).join("") || `<p class="empty">Keine Filme in dieser Kategorie.</p>`;
}

function renderSheet(m) {
  const trailer = `https://www.youtube.com/results?search_query=${enc(`${m.title} ${m.year} trailer deutsch`)}`;
  const stream = `https://www.justwatch.com/de/Suche?q=${enc(m.title)}`;
  const won = m.awards?.won || [];
  const nom = m.awards?.nominated || [];
  $("sheet").innerHTML = `
    <button class="close" data-close aria-label="Schließen">×</button>
    <div class="sheet-img" style="background-image:url('${esc(m.backdrop)}')"></div>
    <div class="sheet-body">
      <h2>${esc(m.title)}</h2>
      ${m.aka ? `<div class="aka">${esc(m.aka)}</div>` : ""}
      ${score(m)}
      <div class="facts">${esc(m.year)} · ${esc(m.director)} · ${hours(m.runtime)} · ${m.genres.map(esc).join(", ")}</div>

      <h3>Meine Meinung</h3>
      <p class="review">${esc(m.review)}</p>

      <h3>Worum es geht</h3>
      <p class="logline">${esc(m.logline)}</p>

      ${won.length || nom.length ? `
        <h3>Auszeichnungen</h3>
        <ul class="awards">
          ${won.map(a => `<li class="won">${esc(a)}</li>`).join("")}
          ${nom.map(a => `<li class="nom">Nominiert – ${esc(a)}</li>`).join("")}
        </ul>` : ""}

      ${m.noTrailer ? `<div class="tip">Mein Tipp: Keinen Trailer gucken. Einfach reinspringen.</div>` : ""}

      <div class="actions">
        <a class="btn primary" href="${stream}" target="_blank" rel="noopener">Wo streamen?</a>
        <a class="btn" href="${trailer}" target="_blank" rel="noopener">Trailer</a>
      </div>
    </div>`;
  $("sheet").scrollTop = 0;
}

function openFilm(slug) {
  const m = movies.find(x => x.slug === slug);
  if (!m) return;
  renderSheet(m);
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

document.addEventListener("click", e => {
  const t = e.target.closest("[data-open],[data-close],[data-mood]");
  if (!t) return;
  if (t.dataset.open) openFilm(t.dataset.open);
  else if (t.dataset.mood) { mood = t.dataset.mood; renderChips(); renderGrid(); }
  else closeFilm();
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("overlay").hidden) closeFilm(); });
window.addEventListener("popstate", openFromHash);
