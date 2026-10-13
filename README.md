# movies.oguzkaya.de

Meine Filmempfehlungen für Freunde. Statische Seite, gehostet über Netlify (Projekt `movies-oguzkaya`), auto-deploy bei jedem Push auf `main`.

## Film hinzufügen

1. Poster (`posters/<slug>.jpg`, ~500×750) und Filmbild (`backdrops/<slug>.jpg`, ~1280×720) ablegen — z. B. von TMDB.
2. Eintrag in `movies.json` ergänzen:
   - `slug`, `title`, optional `aka` (deutscher Titel), `year`, `director`, `runtime` (Minuten), `genres`
   - `moods` — Stimmungs-Filter auf der Seite (z. B. „Mindfuck“, „Plot-Twist“)
   - `rating` (0–10), `review` (dein Text), `logline` (1 Satz worum's geht), `watchIf` (ähnliche Filme)
   - `featured: true` → großer Startbereich oben (nur ein Film)
   - `top: 1–4` → Platz in „Oguz' Top 4“
3. Committen und pushen.

## Teilen

Jeder Film hat einen eigenen Link: `movies.oguzkaya.de/film/<slug>`. `build.js` erzeugt dafür beim Deploy eigene Seiten mit Titel, Bewertung und Bild als Link-Vorschau (WhatsApp & Co.).

## Domain

`movies.oguzkaya.de` als Custom Domain in Netlify. DNS bei Hover: CNAME `movies` → `movies-oguzkaya.netlify.app`.
