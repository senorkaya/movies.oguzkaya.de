# movies.oguzkaya.de

Meine Filmempfehlungen für Freunde. Nur HTML, CSS und JavaScript, keine Dependencies, kein Build-Schritt. Netlify veröffentlicht jeden Push auf `main` automatisch.

## Film hinzufügen

1. Poster (`posters/<slug>.jpg`, ca. 500×750) und Filmbild (`backdrops/<slug>.jpg`, ca. 1280×720) ablegen, z. B. von TMDB.
2. Eintrag in `movies.json` ergänzen:
   - `slug`, `title`, optional `aka` (Originaltitel), `year`, `director`, `runtime` (Minuten), `genres`
   - `moods`: Filter auf der Seite (z. B. „Mindfuck“, „Plot-Twist“)
   - `scores`: `story`, `unterhaltung`, `schauspiel`, `look` (je 1–5, halbe Punkte erlaubt)
   - `rating`: Gesamtnote 1–5 = (Story × 2 + Unterhaltung + Schauspiel + Look) ÷ 5, eine Nachkommastelle. Darf von Hand angepasst werden.
     Das Urteil-Wort ergibt sich daraus: ab 4,5 Pflichtfilm, ab 3,5 Empfehlung, ab 2,5 Kann man gucken, sonst Lieber skippen.
   - `review`: meine Meinung
   - `logline`: ein Satz, worum es geht. Immer ohne Spoiler.
   - `noTrailer: true` blendet den Tipp „Keinen Trailer gucken“ ein
   - `highlight`: kurzer Preis-Hinweis auf der Karte (z. B. „4 Oscars“)
   - `awards`: `won` und `nominated` als Listen
   - „Meine Lieblingsfilme“ zeigt automatisch die 4 bestbewerteten Filme
   - `lastWatched`: 1 = zuletzt gesehen, 2 = davor, … (erscheint unter „Zuletzt gesehen“)
   - `en`: englische Fassung von `title`, `aka`, `logline`, `review`, `highlight` und `awards`. Fehlt ein Feld, zeigt die englische Seite den deutschen Text.
3. Committen und pushen.

## Sprache

Oben links schaltet „DE | EN“ die Sprache um. Die Wahl merkt sich der Browser; beim ersten Besuch entscheidet die Browsersprache. Stimmungen und Genres werden in `app.js` (`WORDS_EN`) übersetzt, alle Oberflächentexte stehen dort in `TEXT`.

Ein Film lässt sich direkt verlinken: `movies.oguzkaya.de/#<slug>`.

## Domain

`movies.oguzkaya.de` ist als Custom Domain in Netlify eingetragen (Projekt `movies-oguzkaya`). DNS bei Hover: CNAME `movies` → `movies-oguzkaya.netlify.app`.
