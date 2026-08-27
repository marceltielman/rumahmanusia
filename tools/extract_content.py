"""One-off: lift the content out of the design canvas into content/*.json.

Kept in the repo as a record of where the content came from. The JSON files are
the source of truth from here on; this does not need to run again.
"""
import json, os, sys

sys.path.insert(0, sys.argv[1])
from gen_data import *  # noqa: F403 — the extracted canvas data

OUT = "content"

# Icons live in the build as named shapes so an editor picks a name instead of
# pasting SVG path data. Keep these keys in sync with src/_data/icons.js.
ICON_BY_LABEL = {
    "Perception": "eye",
    "Language & communication": "chat",
    "Attention": "target",
    "Human intelligence": "brain",
    "Thinking & problem solving": "layers",
    "Memory & imagination": "clock",
    "Neuroscience (brain science)": "activity",
    "Neuro linguistics programming": "network",
    "Knowledge management & education": "book",
    "Human excellence": "award",
    "Cognitive psychology": "brain",
    "Social science": "users",
}
SERVICE_ICONS = ["presentation", "chat", "users", "heart", "clipboard-check"]
ADVANTAGE_ICONS = ["award", "sliders", "brain", "trending-up"]

# The canvas carried display labels only ("Jan", "Jan 2027"). Store real months
# so the page can know what "now" is and derive the label itself.
MONTHS = ([f"2026-{m:02d}" for m in range(1, 13)] + ["2027-01", "2027-02"])


def write(name, data):
    path = os.path.join(OUT, name + ".json")
    with open(path, "w") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    print(f"  {path}")


write("site", {
    "title": "Rumah Manusia — We Understand Human",
    "description": ("Since 2014 Rumah Manusia has helped organizations across Indonesia "
                    "through training, coaching, consulting, counselling and assessment "
                    "grounded in cognitive psychology and cognitive science."),
    "wordmark": "rumah manusia",
    "tagline": "We understand human.",
    "cta": "Request a program",
    "themeColor": "#00aeef",
    "email": "layanan@rumahmanusia.com",
    "whatsapp": WA_NUMBER,
    "programColumns": 3,
    "collapsedPrograms": 15,
    "autoplayMs": 2200,
    "quickAsks": QUICK_ASKS,
    "contacts": [{"label": l, "value": v} for l, v in CONTACTS],
    "offices": [
        {"city": "Jakarta",
         "address": ["Wisma Bumiputera Lantai 7 Suite 706",
                     "Jl. Jend. Sudirman kav. 75 Setiabudi, Jakarta Selatan, 12910"]},
        {"city": "Bekasi",
         "address": ["Kemang Pratama Blok K/6",
                     "Bojong Rawalumbu, Kota Bekasi, 17116"]},
    ],
    "footer": {
        "services": ["Training", "Coaching", "Consulting", "Counselling", "Assessment"],
        "explore": [{"label": "Programs", "href": "#programs"},
                    {"label": "Schedule", "href": "#schedule"},
                    {"label": "Online learning", "href": "#online"},
                    {"label": "Clients", "href": "#clients"},
                    {"label": "Team", "href": "#team"}],
        "follow": ["rumahmanusia.com", "@rumahmanusia", "rumah manusia training", "@rumah_manusia"],
        "legal": "© 2026 Rumah Manusia · Jakarta · Bekasi · layanan@rumahmanusia.com",
    },
    "nav": [{"label": "What we do", "href": "#what"},
            {"label": "Approach", "href": "#strategies"},
            {"label": "Programs", "href": "#programs"},
            {"label": "Schedule", "href": "#schedule"},
            {"label": "Clients", "href": "#clients"},
            {"label": "Team", "href": "#team"}],
})

write("hero", {
    "eyebrow": "Training · Coaching · Consulting · Counselling · Assessment",
    "heading": "Human skills, taught the way the mind actually works.",
    "lead": ("Since 2014 we have been helping clients and people through training "
             "programs designed to develop personal and professional skills."),
    "secondaryCta": {"label": "Browse 69 programs", "href": "#programs"},
    "tags": ["Cognitive psychology", "Cognitive science", "In-house · online · public"],
    "stats": [
        {"from": 1990, "to": 2014, "suffix": "", "label": "Practising since"},
        {"from": 0, "to": 69, "suffix": "", "label": "Training programs"},
        {"from": 0, "to": 60, "suffix": "+", "label": "Client organizations"},
        {"from": 0, "to": 28, "suffix": "", "label": "Trainers & coaches"},
    ],
})

write("services", [
    {"num": num, "name": name, "icon": icon, "body": body}
    for (num, name, _path, body), icon in zip(SERVICES, SERVICE_ICONS)
])

write("strategies", [
    {"name": name,
     "items": [{"name": it, "icon": ICON_BY_LABEL.get(it, "award")} for it in items]}
    for name, items in STRATEGIES
])

write("audiences", [
    {"name": name, "items": [{"num": n, "title": t, "body": b} for n, t, b in items]}
    for name, items in AUDIENCES
])

write("programs", {
    "tracks": [{"name": name, "programs": list(items)} for name, items in TRACKS]
})

write("schedule", [
    {"month": iso, "topics": list(topics)}
    for iso, (_label, topics) in zip(MONTHS, SCHEDULE)
])

write("testimonials", [{"quote": q, "source": s, "lang": "id"} for q, s in QUOTES])

write("clients", {
    "featured": [{"name": n, "domain": d} for n, d in FEATURED],
    "all": list(CLIENTS),
})

write("advantages", [
    {"num": num, "title": title, "icon": icon, "body": body}
    for (num, title, _path, body), icon in zip(ADVANTAGES, ADVANTAGE_ICONS)
])

write("team", {
    "founder": {"name": "Dr. Andi E. Ginting, MM", "role": "Founder and CEO",
                "photo": "team/founder.png"},
    "note": ("A bench of 28 trainers, coaches and consultants with backgrounds across "
             "banking, government, manufacturing, healthcare and education."),
    "members": [{"photo": f"team/t{i:02d}.png", "name": None} for i in range(1, 28)],
})

write("online", {
    "modules": list(MODULES),
    "webinars": list(WEBINARS),
})
