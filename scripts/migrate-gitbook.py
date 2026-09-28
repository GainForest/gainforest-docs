#!/usr/bin/env python3
"""One-shot GitBook -> MDX migration.

Usage: python3 scripts/migrate-gitbook.py <path-to-gainforest-gitbook-checkout>

Reads SUMMARY.md for the published pages only, converts GitBook's liquid
blocks into the MDX components in src/components/mdx, rewrites .md links to
the new clean URLs, copies referenced assets into public/assets, and writes
content/docs (pages + meta.json) and src/lib/redirects.json (old live URL ->
new URL). Idempotent: content/docs and public/assets are rebuilt each run.
"""
import json, os, re, shutil, sys, posixpath, unicodedata

SRC = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "content/docs")
ASSETS = os.path.join(ROOT, "public/assets")

# source file -> (new slug path, old live URL path)
PAGES = [
    ("README.md", "index", ""),
    ("---About GainForest---", None, None),
    ("about/about-gainforest.md", "about-gainforest", "about-gainforest/about-gainforest"),
    ("solutions/conservation-data-income.md", "conservation-data-income", "about-gainforest/conservation-data-income"),
    ("---GainForest.app and Bumicerts---", None, None),
    ("bumicerts-and-projects/what-is-bumicerts.md", "bumicerts/what-is-bumicerts", "gainforest.app-and-bumicerts/what-is-bumicerts"),
    ("bumicerts-and-projects/what-is-a-project.md", "bumicerts/what-is-a-project", "gainforest.app-and-bumicerts/what-is-a-project"),
    ("bumicerts-and-projects/globe.md", "bumicerts/globe", "gainforest.app-and-bumicerts/globe"),
    ("---For nature stewards---", None, None),
    ("the-gainforest-app/types-of-users/for-organizations/README.md", "organizations/index", "for-nature-stewards/for-organizations"),
    ("the-gainforest-app/types-of-users/for-organizations/creating-your-organization.md", "organizations/creating-your-organization", "for-nature-stewards/for-organizations/creating-your-organization"),
    ("the-gainforest-app/types-of-users/for-organizations/user-permissions.md", "organizations/user-permissions", "for-nature-stewards/for-organizations/user-permissions"),
    ("community/gainforest-data-council.md", "organizations/data-council", "for-nature-stewards/for-organizations/gainforest-data-council"),
    ("uploading-data/overview.md", "evidence/index", "for-nature-stewards/overview"),
    ("uploading-data/biodiversity-observations.md", "evidence/biodiversity-observations", "for-nature-stewards/overview/biodiversity-observations"),
    ("uploading-data/taina-for-observations.md", "evidence/taina-for-observations", "for-nature-stewards/overview/taina-for-observations"),
    ("uploading-data/batch-uploads.md", "evidence/batch-uploads", "for-nature-stewards/overview/batch-uploads"),
    ("uploading-data/audiomoth.md", "evidence/bioacoustic-sensors", "for-nature-stewards/overview/audiomoth"),
    ("uploading-data/linking-evidence-to-projects.md", "evidence/linking-evidence-to-projects", "for-nature-stewards/overview/linking-evidence-to-projects"),
    ("tools-and-learning/taina.md", "taina", "for-nature-stewards/taina"),
    ("opportunities/overview.md", "opportunities/index", "for-nature-stewards/overview-1"),
    ("opportunities/weekly-bioblitz-challenge.md", "opportunities/weekly-bioblitz-challenge", "for-nature-stewards/overview-1/weekly-bioblitz-challenge"),
    ("opportunities/rewilding-the-web-grant.md", "opportunities/rewilding-the-web-grant/index", "for-nature-stewards/overview-1/rewilding-the-web-grant"),
    ("opportunities/rewilding-project-page-guide.md", "opportunities/rewilding-the-web-grant/project-page-guide", "for-nature-stewards/overview-1/rewilding-the-web-grant/rewilding-project-page-guide"),
    ("opportunities/rewilding-grant-conditions.md", "opportunities/rewilding-the-web-grant/grant-conditions", "for-nature-stewards/overview-1/rewilding-the-web-grant/rewilding-grant-conditions"),
    ("partners/ma-earth.md", "ma-earth", "for-nature-stewards/ma-earth"),
    ("---For funders and supporters---", None, None),
    ("donate/supporting-bumicerts-projects.md", "funders/supporting-bumicerts-projects", "for-funders-and-supporters/supporting-bumicerts-projects"),
    ("donate/reviewing-project-evidence.md", "funders/reviewing-project-evidence", "for-funders-and-supporters/reviewing-project-evidence"),
    ("---Support GainForest---", None, None),
    ("donate/support-gainforest.md", "support/index", "support-gainforest/support-gainforest"),
    ("donate/giveth.md", "support/giveth", "support-gainforest/support-gainforest/giveth"),
    ("donate/donorbox.md", "support/donorbox", "support-gainforest/support-gainforest/donorbox"),
    ("---Community and impact---", None, None),
    ("community/monthly-community-calls.md", "community/monthly-community-calls", "community-and-impact/monthly-community-calls"),
    ("impact/annual-impact-reports.md", "community/annual-impact-reports", "community-and-impact/annual-impact-reports"),
    ("impact/press-and-recognition.md", "community/press-and-recognition", "community-and-impact/press-and-recognition"),
    ("---Connect---", None, None),
    ("connect/blogs-and-stories.md", "connect/blogs-and-stories", "connect/blogs-and-stories"),
    ("connect/social-media.md", "connect/social-media", "connect/social-media"),
    ("connect/repository.md", "connect/repository", "connect/repository"),
    ("connect/network.md", "connect/network", "connect/network"),
]

# The label SUMMARY.md gave each page. GitBook's sidebar showed this, not the
# page's H1, and the two often differ on purpose (a short nav label).
NAV_LABELS = dict(
    (m.group(2), m.group(1))
    for m in re.finditer(r"\[([^\]]+)\]\(([^)]+\.md)\)", open(os.path.join(SRC, "SUMMARY.md"), encoding="utf-8").read())
)

def url_of(slug):
    s = re.sub(r"(^|/)index$", "", slug)
    return "/" + s

SRC_TO_URL = {src: url_of(slug) for src, slug, _ in PAGES if slug}

def slugify_asset(name):
    base, ext = os.path.splitext(name)
    base = unicodedata.normalize("NFKD", base).encode("ascii", "ignore").decode()
    base = re.sub(r"[^a-zA-Z0-9]+", "-", base).strip("-").lower()
    return base + ext.lower()

used_assets = {}

def asset(src_file, ref):
    ref = ref.split("#")[0]
    path = posixpath.normpath(posixpath.join(posixpath.dirname(src_file), ref.replace("%20", " ")))
    full = os.path.join(SRC, path)
    if not os.path.isfile(full):
        return ref
    name = slugify_asset(os.path.basename(path))
    used_assets[full] = name
    return "/assets/" + name

def link(src_file, href):
    if re.match(r"^(https?:|mailto:|#)", href) or not href.split("#")[0].endswith(".md"):
        if ".gitbook/assets" in href:
            return asset(src_file, href)
        return href
    target, _, frag = href.partition("#")
    path = posixpath.normpath(posixpath.join(posixpath.dirname(src_file), target.replace("%20", " ")))
    url = SRC_TO_URL.get(path)
    if url is None:
        return href  # unpublished target; flagged by the build's link check
    return url + ("#" + frag if frag else "")

def attr(s):
    return s.replace('"', "&quot;")

def jsx_str(s):
    return json.dumps(s.strip(), ensure_ascii=False)

def cards_table(src_file, html):
    rows = re.findall(r"<tr>(.*?)</tr>", html.split("<tbody>", 1)[-1], re.S)
    out = ["<Cards>"]
    for row in rows:
        cells = re.findall(r"<td>(.*?)</td>", row, re.S)
        icon = href = title = image = None
        desc = []
        for c in cells:
            m = re.search(r'class="fa-([a-z0-9-]+)"', c)
            if m: icon = m.group(1); continue
            m = re.fullmatch(r'\s*<a href="([^"]+)">.*?</a>\s*', c, re.S)
            if m and href is None: href = link(src_file, m.group(1)); continue
            m = re.search(r'<a href="([^"]+\.(?:png|jpe?g|webp|gif))"', c)
            if m: image = link(src_file, m.group(1)); continue
            m = re.fullmatch(r"\s*<strong>(.*?)</strong>\s*", c, re.S)
            if m and title is None: title = m.group(1); continue
            txt = re.sub(r"<[^>]+>", "", c).strip()
            if txt: desc.append(txt)
        props = [f"title={jsx_str(title or '')}"]
        if href: props.append(f'href="{href}"')
        if icon: props.append(f'icon="{icon}"')
        if image: props.append(f'image="{image}"')
        out.append(f"  <Card {' '.join(props)}>{' '.join(desc)}</Card>")
    out.append("</Cards>")
    return "\n".join(out)

folder_titles = {}

def convert(src_file, text, slug=""):
    fm = {}
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if m:
        block = m.group(1)
        text = text[m.end():]
        im = re.search(r"^icon:\s*(.+)$", block, re.M)
        if im: fm["icon"] = im.group(1).strip()
        dm = re.search(r"^description:\s*(>-\n(?:\s+.+\n?)+|.+)$", block, re.M)
        if dm:
            d = dm.group(1)
            fm["description"] = " ".join(l.strip() for l in d.splitlines()[1:]) if d.startswith(">-") else d.strip().strip("'\"")
    tm = re.search(r"^# (.+)$", text, re.M)
    fm["title"] = tm.group(1).strip() if tm else os.path.basename(src_file)
    if tm: text = text[:tm.start()] + text[tm.end():]

    text = re.sub(r"<table data-view=\"cards\">.*?</table>", lambda m: cards_table(src_file, m.group(0)), text, flags=re.S)
    text = re.sub(r'\{% hint style="(\w+)"(?: icon="([a-z0-9-]+)")? %\}', lambda m: f'<Callout type="{m.group(1)}"' + (f' icon="{m.group(2)}"' if m.group(2) else "") + ">", text)
    text = text.replace("{% endhint %}", "</Callout>")
    text = re.sub(r'\{% content-ref url="([^"]+)" %\}.*?\{% endcontent-ref %\}',
                  lambda m: f'<PageLink href="{link(src_file, m.group(1))}" />', text, flags=re.S)
    text = re.sub(r'\{% embed url="([^"]+)" %\}((?:(?!\{% embed).)*?)\{% endembed %\}',
                  lambda m: f'<Embed url="{m.group(1)}">\n\n{m.group(2).strip()}\n\n</Embed>' if m.group(2).strip() else f'<Embed url="{m.group(1)}" />',
                  text, flags=re.S)
    text = re.sub(r'\{% embed url="([^"]+)" %\}', r'<Embed url="\1" />', text)
    for a, b in [("stepper", "Steps"), ("step", "Step"), ("tabs", "Tabs"), ("columns", "Columns"), ("column", "Column")]:
        text = re.sub(r"\{% " + a + r"( [^%]*)? %\}", lambda m: f"<{b}>" if not m.group(1) else f"<{b}{m.group(1).replace('title=', ' title=')}>", text)
        text = text.replace("{% end" + a + " %}", f"</{b}>")
    text = re.sub(r'\{% tab title="([^"]+)" %\}', r'<Tab title="\1">', text)
    text = text.replace("{% endtab %}", "</Tab>")

    def figure(m):
        body = m.group(1)
        src = re.search(r'src="([^"]+)"', body)
        alt = re.search(r'alt="([^"]*)"', body)
        cap = re.search(r"<figcaption>(.*?)</figcaption>", body, re.S)
        caption = re.sub(r"</?p>", "", cap.group(1)).strip() if cap else ""
        props = [f'src="{link(src_file, src.group(1)) if src else ""}"', f"alt={jsx_str(alt.group(1) if alt else '')}"]
        if caption: props.append(f"caption={jsx_str(re.sub(r'<[^>]+>', '', caption))}")
        return f"<Figure {' '.join(props)} />"
    text = re.sub(r"<figure>(.*?)</figure>", figure, text, flags=re.S)

    text = re.sub(r'<a href="([^"]+)" class="button (\w+)"[^>]*>(.*?)</a>',
                  lambda m: f'<ButtonLink href="{link(src_file, m.group(1))}" variant="{m.group(2)}">{m.group(3)}</ButtonLink>', text)
    text = re.sub(r'<a href="([^"]+)"><button>(.*?)</button></a>', lambda m: f'<ButtonLink href="{m.group(1)}" variant="primary">{m.group(2)}</ButtonLink>', text)
    text = re.sub(r'<i class="fa-([a-z0-9-]+)"></i>', r'<Icon name="\1" />', text)
    text = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)(?: \"[^\"]*\")?\)", lambda m: f"![{m.group(1)}]({link(src_file, m.group(2))})", text)
    text = re.sub(r"(?<!!)\[([^\]]+)\]\(<?([^)>\s]+)>?(?: \"[^\"]*\")?\)", lambda m: f"[{m.group(1)}]({link(src_file, m.group(2))})", text)
    text = re.sub(r"<br>", "<br />", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip() + "\n"

    label = NAV_LABELS.get(src_file)
    head = ["---", f"title: {jsx_str(fm['title'])}"]
    if label and label != fm["title"]:
        if slug.endswith("/index"):
            folder_titles[slug.rsplit("/", 1)[0]] = label
        else:
            head.append(f"sidebarTitle: {jsx_str(label)}")
    if fm.get("description"): head.append(f"description: {jsx_str(fm['description'])}")
    if fm.get("icon"): head.append(f"icon: {fm['icon']}")
    head.append("---")
    return "\n".join(head) + "\n\n" + text

shutil.rmtree(OUT, ignore_errors=True)
shutil.rmtree(ASSETS, ignore_errors=True)
os.makedirs(ASSETS)

metas = {}  # dir -> list of entries
redirects = []
for src, slug, old in PAGES:
    if slug is None:
        metas.setdefault("", []).append(src)
        continue
    text = open(os.path.join(SRC, src), encoding="utf-8").read()
    dest = os.path.join(OUT, slug + ".mdx")
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    open(dest, "w", encoding="utf-8").write(convert(src, text, slug))
    parts = slug.split("/")
    for i in range(len(parts)):
        d = "/".join(parts[:i])
        name = parts[i]
        entry = f"{name}" if i == len(parts) - 1 else name
        lst = metas.setdefault(d, [])
        if entry not in lst and not (i == len(parts) - 1 and name == "index" and d):
            lst.append(entry)
    if old and url_of(slug) != "/" + old:
        redirects.append({"source": "/" + old, "destination": url_of(slug), "permanent": True})

# Folders that are a whole sidebar group: inline their pages under the
# separator instead of nesting a folder inside the group.
GROUP_FOLDERS = {"bumicerts", "funders", "community", "connect"}
metas[""] = ["..." + e if e in GROUP_FOLDERS else e for e in metas[""]]

for d, pages in metas.items():
    meta = {"pages": pages}
    if d in folder_titles:
        meta = {"title": folder_titles[d], **meta}
    with open(os.path.join(OUT, d, "meta.json"), "w") as f:
        json.dump(meta, f, indent=2)

for full, name in used_assets.items():
    shutil.copyfile(full, os.path.join(ASSETS, name))

with open(os.path.join(ROOT, "src/lib/redirects.json"), "w") as f:
    json.dump(redirects, f, indent=2)

print(f"{sum(1 for p in PAGES if p[1])} pages, {len(used_assets)} assets, {len(redirects)} redirects")
