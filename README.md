# movies.oguzkaya.de

Meine Filmempfehlungen für Freunde. Statische Seite, gehostet über Netlify (Projekt `movies-oguzkaya`).

## Film hinzufügen

1. Poster in `posters/` ablegen.
2. Eintrag in `movies.json` ergänzen (`title`, `year`, `director`, `poster`, `rating` von 0–10, `review` als Freitext).
3. Committen und pushen — Netlify deployed automatisch.

## Domain

`movies.oguzkaya.de` als Custom Domain in Netlify. DNS bei Hover: CNAME `movies` → `movies-oguzkaya.netlify.app`.
