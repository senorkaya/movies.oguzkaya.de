const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const TEXT = {
  de: {
    title: "Oguz' Watchlist",
    h1: `Meine <span class="accent">Watchlist.</span>`,
    lead: "Filme, die ich als Nächstes gucken will.",
    back: "← Filmliste",
    footer: "Bilder: TMDB",
    empty: "Gerade steht nichts auf der Liste.",
    hours: (h, m) => (m ? `${h} Std. ${m} Min.` : `${h} Std.`),
    stream: "Im Abo",
    buy: "Leihen oder kaufen",
    noStream: "Gerade in keinem Abo",
    unknown: "Verfügbarkeit nicht bekannt",
    more: "Alle Angebote",
    asOf: "Stand der Streaming-Angaben: Oktober 2026 (Deutschland). Angebote wechseln, im Zweifel auf „Alle Angebote“ tippen.",
  },
  en: {
    title: "Oguz's Watchlist",
    h1: `My <span class="accent">watchlist.</span>`,
    lead: "Films I want to watch next.",
    back: "← Film list",
    footer: "Images: TMDB",
    empty: "Nothing on the list right now.",
    hours: (h, m) => (m ? `${h} h ${m} min` : `${h} h`),
    stream: "Streaming on",
    buy: "Rent or buy",
    noStream: "Not on any subscription right now",
    unknown: "Availability unknown",
    more: "All offers",
    asOf: "Streaming info as of October 2026 (Germany). Offers change, so tap “All offers” if in doubt.",
  },
};
const GENRES_EN = { Krimi: "Crime", Kriegsfilm: "War", Action: "Action", Biografie: "Biography", "Science-Fiction": "Science Fiction", Abenteuer: "Adventure", Komödie: "Comedy" };

// Gleiche Sprachwahl wie auf der Filmliste
function initialLang() {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (fromUrl === "de" || fromUrl === "en") {
    try { localStorage.setItem("lang", fromUrl); } catch {}
    return fromUrl;
  }
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "de" || saved === "en") return saved;
  } catch {}
  return (navigator.language || "de").toLowerCase().startsWith("de") ? "de" : "en";
}
let lang = initialLang();
let films = [];
const t = () => TEXT[lang];
const L = (m, f) => (lang === "en" && m.en && m.en[f] != null ? m.en[f] : m[f]);
const genre = g => (lang === "en" ? GENRES_EN[g] || g : g);

// Wo läuft der Film? (Deutschland)
function watchHtml(m) {
  const w = m.watch;
  if (!w) return "";
  const rows = [];
  if (w.flatrate?.length) {
    rows.push(`<div class="where"><span class="where-label">${t().stream}</span>${w.flatrate.map(s => `<span class="svc on">${esc(s)}</span>`).join("")}</div>`);
  } else if (!w.unverified) {
    rows.push(`<div class="where"><span class="where-label">${t().noStream}</span></div>`);
  }
  if (w.buy) {
    rows.push(`<div class="where"><span class="where-label">${t().buy}</span>${(w.buyFrom || []).map(s => `<span class="svc">${esc(s)}</span>`).join("")}</div>`);
  }
  if (w.unverified && !w.flatrate?.length && !w.buy) rows.push(`<div class="where"><span class="where-label">${t().unknown}</span></div>`);
  const link = w.justwatch || `https://www.justwatch.com/de/Suche?q=${encodeURIComponent(m.title)}`;
  rows.push(`<a class="more" href="${esc(link)}" target="_blank" rel="noopener">${t().more} →</a>`);
  return `<div class="watch">${rows.join("")}</div>`;
}

function render() {
  document.documentElement.lang = lang;
  document.title = t().title;
  $("h1").innerHTML = t().h1;
  $("lead").textContent = t().lead;
  $("back").textContent = t().back;
  $("footer").textContent = t().footer;
  document.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  $("list").innerHTML = films.map(m => `
    <article class="wl-card">
      <img src="${esc(m.poster)}" alt="" loading="lazy">
      <div class="wl-body">
        <h2>${esc(L(m, "title"))}</h2>
        <div class="meta">${esc(m.year)} · ${esc(m.director)} · ${t().hours(Math.floor(m.runtime / 60), m.runtime % 60)}</div>
        <div class="meta">${m.genres.map(g => esc(genre(g))).join(", ")}</div>
        <p>${esc(L(m, "logline"))}</p>
        ${watchHtml(m)}
      </div>
    </article>`).join("") || `<p class="empty">${t().empty}</p>`;
  $("asof").textContent = t().asOf;
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-lang]");
  if (!b || b.dataset.lang === lang) return;
  lang = b.dataset.lang;
  try { localStorage.setItem("lang", lang); } catch {}
  render();
});

render();
fetch("watchlist.json", { cache: "no-cache" })
  .then(r => r.json())
  .then(data => { films = data; render(); });
