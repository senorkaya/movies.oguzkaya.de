"""Baut die Banger-Mail für einen Film aus movies.json.

Aufruf:  python3 email/build_banger.py <slug>
Ergebnis: email/out/<slug>.html und der Betreff auf der Konsole.

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


def verdict(n):
    if n >= 4.5:
        return "Pflichtfilm"
    if n >= 3.5:
        return "Empfehlung"
    if n >= 2:
        return "Kann man gucken"
    return "Lieber skippen"


def hours(minutes):
    h, m = divmod(int(minutes), 60)
    return f"{h} Std. {m} Min." if m else f"{h} Std."


def fmt(n):
    return f"{n:.1f}".replace(".", ",")


def build(m):
    e = html.escape
    slug = m["slug"]
    score = fmt(m["rating"])
    v = verdict(m["rating"])
    pill_bg, pill_fg = ("#f5c542", "#000000") if m["rating"] >= 4.5 else ("#1c1c1f", "#f5f5f7")
    runtime = f'{m["parts"]} Filme' if m.get("parts") else hours(m["runtime"])
    facts = f'{m["year"]} · {m["director"]} · {runtime}'
    film_url = f"{SITE}/#{slug}"
    stream_url = f"https://www.justwatch.com/de/Suche?q={m['title'].replace(' ', '+')}"
    award = (
        f'''<tr><td class="pad" style="padding:22px 32px 0; font-family:{FONT}; font-size:17px; font-weight:700; color:#f5c542;">🏆 {e(m["highlight"])}</td></tr>'''
        if m.get("highlight") else ""
    )
    preheader = f'{score}/5 – {v}. {m["review"]}'

    return f'''<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>Banger-Alarm: {e(m["title"])}</title>
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
                          <img src="{SITE}/{m["poster"]}" width="104" alt="Cover: {e(m["title"])}" style="display:block; width:104px; height:auto; border:0; border-radius:12px;">
                        </td>
                        <td valign="top" style="font-family:{FONT};">
                          <div class="title" style="font-size:40px; line-height:1.05; font-weight:700; letter-spacing:-1.2px; color:#f5f5f7;">{e(m["title"])}</div>
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
                    <div style="font-size:20px; font-weight:700; color:#f5f5f7; padding-bottom:8px;">Meine Meinung</div>
                    <div style="font-size:21px; line-height:1.5; color:#f5f5f7;">{e(m["review"])}</div>
                  </td>
                </tr>
                {award}
                <tr>
                  <td class="pad" style="padding:32px 32px 36px;">
                    <table role="presentation" class="btns" cellpadding="0" cellspacing="0">
                      <tr>
                        <td class="btn" style="background-color:#f5c542; border-radius:999px;">
                          <a href="{film_url}" style="display:inline-block; padding:16px 28px; font-family:{FONT}; font-size:17px; font-weight:700; color:#000000; text-decoration:none; text-align:center;">Mehr zum Film</a>
                        </td>
                        <td class="btn-gap" width="12" style="width:12px;"></td>
                        <td class="btn" style="background-color:#1c1c1f; border-radius:999px;">
                          <a href="{stream_url}" style="display:inline-block; padding:16px 28px; font-family:{FONT}; font-size:17px; font-weight:700; color:#f5f5f7; text-decoration:none; text-align:center;">Wo streamen?</a>
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
              Du bekommst diese Mail, weil du dich auf <a href="{SITE}" style="color:#8e8e93;">movies.oguzkaya.de</a> eingetragen hast.<br>
              Es kommen nur Filme ab 4,2/5. <a href="{UNSUB}" style="color:#f5f5f7;">Abmelden</a>
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
    (out / f"{slug}.html").write_text(build(m), encoding="utf-8")
    print(f'Banger-Alarm: {m["title"]} ({fmt(m["rating"])}/5)')


if __name__ == "__main__":
    main()
