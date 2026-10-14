"""Baut die Banger-Mail für einen Film aus movies.json.

Aufruf:  python3 email/build_banger.py <slug>
Ergebnis: email/out/<slug>.de.html und email/out/<slug>.en.html,
die Betreffzeilen stehen auf der Konsole.

Die Platzhalter %%EMAIL%% und %%TOKEN%% im Abmelde-Link ersetzt das
Make-Szenario "Movies: Banger-Mail an alle Abonnenten" pro Empfänger.
Nur Werkzeug für Claude/Oguz, nicht Teil der Website.
"""
import html
import json
import sys
from pathlib import Path

SITE = "https://movies.oguzkaya.de"
UNSUB = "https://hook.eu1.make.com/59y07e1pq4yvmsqhpu79c6ovxavdaors?action=unsubscribe&email=%%EMAIL%%&token=%%TOKEN%%"
FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"


TEXT = {
    "de": {
        "verdicts": ["Pflichtfilm", "Empfehlung", "Kann man gucken", "Lieber skippen"],
        "hours": lambda h, m: f"{h} Std. {m} Min." if m else f"{h} Std.",
        "parts": lambda n: f"{n} Filme",
        "take": "Meine Meinung",
        "more": "Mehr zum Film",
        "stream": "Wo streamen?",
        "stream_url": "https://www.justwatch.com/de/Suche?q=",
        "footer": "Du bekommst diese Mail, weil du dich auf {site} eingetragen hast.<br>Es kommen nur Filme ab 4,2/5.",
        "unsub": "Abmelden",
        "subject": "Banger-Alarm: {title} ({score}/5)",
        "comma": True,
    },
    "en": {
        "verdicts": ["Must-watch", "Recommended", "Worth a watch", "Skip it"],
        "hours": lambda h, m: f"{h} h {m} min" if m else f"{h} h",
        "parts": lambda n: f"{n} films",
        "take": "My take",
        "more": "More about the film",
        "stream": "Where to stream?",
        "stream_url": "https://www.justwatch.com/us/search?q=",
        "footer": "You're getting this email because you signed up on {site}.<br>Only films rated 4.2/5 or higher.",
        "unsub": "Unsubscribe",
        "subject": "Banger alert: {title} ({score}/5)",
        "comma": False,
    },
}


def verdict(n, t):
    v = t["verdicts"]
    if n >= 4.5:
        return v[0]
    if n >= 3.5:
        return v[1]
    if n >= 2:
        return v[2]
    return v[3]


def fmt(n, t):
    s = f"{n:.1f}"
    return s.replace(".", ",") if t["comma"] else s


def pick(m, field, lang):
    """Englischer Text, wenn vorhanden – sonst Deutsch."""
    if lang == "en" and m.get("en", {}).get(field) is not None:
        return m["en"][field]
    return m.get(field)


def build(m, lang="de"):
    e = html.escape
    t = TEXT[lang]
    slug = m["slug"]
    title = pick(m, "title", lang)
    review = pick(m, "review", lang)
    highlight = pick(m, "highlight", lang)
    score = fmt(m["rating"], t)
    v = verdict(m["rating"], t)
    pill_bg, pill_fg = ("#f5c542", "#000000") if m["rating"] >= 4.5 else ("#1c1c1f", "#f5f5f7")
    h, mins = divmod(int(m["runtime"]), 60)
    runtime = t["parts"](m["parts"]) if m.get("parts") else t["hours"](h, mins)
    facts = f'{m["year"]} · {m["director"]} · {runtime}'
    film_url = f"{SITE}/?lang={lang}#{slug}"
    stream_url = t["stream_url"] + title.replace(" ", "+")
    award = (
        f'''<tr><td class="pad" style="padding:22px 32px 0; font-family:{FONT}; font-size:17px; font-weight:700; color:#f5c542;">🏆 {e(highlight)}</td></tr>'''
        if highlight else ""
    )
    preheader = f'{score}/5 – {v}. {review}'

    return f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>{e(t["subject"].format(title=title, score=score))}</title>
<style>
  :root {{ color-scheme: dark; supported-color-schemes: dark; }}
  @media (max-width: 600px) {{
    .pad {{ padding-left: 22px !important; padding-right: 22px !important; }}
    .title {{ font-size: 34px !important; }}
    .score {{ font-size: 46px !important; }}
    .btns, .btns tbody, .btns tr {{ display: block !important; width: 100% !important; }}
    .btn {{ display: block !important; width: 100% !important; }}
    .btn a {{ display: block !important; }}
    .btn-gap {{ display: block !important; height: 10px !important; width: auto !important; }}
  }}
</style>
</head>
<body style="margin:0; padding:0; background-color:#000000; background-image:linear-gradient(#000000,#000000);">
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; line-height:1px; color:#000000;">{e(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000; background-image:linear-gradient(#000000,#000000);">
    <tr>
      <td align="center" style="padding:24px 12px 48px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="background-color:#111113; background-image:linear-gradient(#111113,#111113); border-radius:24px; overflow:hidden;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:24px 24px 0 0; overflow:hidden; line-height:0;">
                    <a href="{film_url}"><img src="{SITE}/{m["backdrop"]}" width="560" alt="" style="display:block; width:100%; max-width:560px; height:auto; border:0; border-radius:24px 24px 0 0;"></a>
                  </td>
                </tr>
                <tr>
                  <td class="pad" style="padding:28px 32px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="104" valign="top" style="padding-right:20px;">
                          <img src="{SITE}/{m["poster"]}" width="104" alt="Cover: {e(title)}" style="display:block; width:104px; height:auto; border:0; border-radius:12px;">
                        </td>
                        <td valign="top" style="font-family:{FONT};">
                          <div class="title" style="font-size:40px; line-height:1.05; font-weight:700; letter-spacing:-1.2px; color:#f5f5f7;">{e(title)}</div>
                          <div style="padding-top:8px; font-size:16px; line-height:1.4; color:#8e8e93;">{e(facts)}</div>
                          <div style="padding-top:14px;">
                            <span class="score" style="font-size:52px; line-height:1; font-weight:700; letter-spacing:-1.5px; color:#f5c542;">{score}</span><span style="font-size:24px; font-weight:600; color:#8e8e93;">/5</span>
                          </div>
                          <div style="padding-top:10px;">
                            <span style="display:inline-block; padding:6px 14px; border-radius:999px; background-color:{pill_bg}; color:{pill_fg}; font-size:15px; font-weight:700;">{v}</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="pad" style="padding:32px 32px 0; font-family:{FONT};">
                    <div style="font-size:20px; font-weight:700; color:#f5f5f7; padding-bottom:8px;">{t["take"]}</div>
                    <div style="font-size:21px; line-height:1.5; color:#f5f5f7;">{e(review)}</div>
                  </td>
                </tr>
                {award}
                <tr>
                  <td class="pad" style="padding:32px 32px 36px;">
                    <table role="presentation" class="btns" cellpadding="0" cellspacing="0">
                      <tr>
                        <td class="btn" style="background-color:#f5c542; border-radius:999px;">
                          <a href="{film_url}" style="display:inline-block; padding:16px 28px; font-family:{FONT}; font-size:17px; font-weight:700; color:#000000; text-decoration:none; text-align:center;">{t["more"]}</a>
                        </td>
                        <td class="btn-gap" width="12" style="width:12px;"></td>
                        <td class="btn" style="background-color:#1c1c1f; border-radius:999px;">
                          <a href="{stream_url}" style="display:inline-block; padding:16px 28px; font-family:{FONT}; font-size:17px; font-weight:700; color:#f5f5f7; text-decoration:none; text-align:center;">{t["stream"]}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 8px 0; font-family:{FONT}; font-size:14px; line-height:1.6; color:#8e8e93; text-align:center;">
              {t["footer"].format(site=f'<a href="{SITE}/?lang={lang}" style="color:#8e8e93;">movies.oguzkaya.de</a>')} <a href="{UNSUB}" style="color:#f5f5f7;">{t["unsub"]}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
'''


def main():
    slug = sys.argv[1]
    root = Path(__file__).resolve().parent.parent
    movies = json.loads((root / "movies.json").read_text(encoding="utf-8"))
    m = next(x for x in movies if x["slug"] == slug)
    out = root / "email" / "out"
    out.mkdir(exist_ok=True)
    for lang in ("de", "en"):
        t = TEXT[lang]
        (out / f"{slug}.{lang}.html").write_text(build(m, lang), encoding="utf-8")
        print(f'subject_{lang}:', t["subject"].format(title=pick(m, "title", lang), score=fmt(m["rating"], t)))


if __name__ == "__main__":
    main()
