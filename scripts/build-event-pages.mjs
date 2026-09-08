import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const dist = path.join(root, "dist")
const base = fs.readFileSync(path.join(dist, "index.html"), "utf8")
const eventDir = path.join(root, "data/events")
const project = JSON.parse(fs.readFileSync(path.join(root, "data/project.json"), "utf8"))
const canonicalBase = project.production_origin.replace(/\/$/, "")

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

const events = fs.readdirSync(eventDir)
  .filter((name) => name.endsWith(".json"))
  .map((name) => JSON.parse(fs.readFileSync(path.join(eventDir, name), "utf8")))
  .sort((a, b) => a.id.localeCompare(b.id))

for (const event of events) {
  const title = esc(event.title + " · LEGEND")
  const description = esc(event.summary)
  const url = canonicalBase + "/events/" + encodeURIComponent(event.id) + "/"
  let html = base
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${description}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${description}" />`)

  const out = path.join(dist, "events", event.id, "index.html")
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, html)
}

const sitemapUrls = [
  canonicalBase + "/",
  ...events.map((event) => canonicalBase + "/events/" + encodeURIComponent(event.id) + "/"),
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((url) => `  <url><loc>${esc(url)}</loc></url>`).join("\n")}
</urlset>
`
fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap)
fs.writeFileSync(path.join(dist, "robots.txt"), `User-agent: *
Allow: /
Sitemap: ${canonicalBase}/sitemap.xml
`)

console.log(`LEGEND generated ${events.length} event permalinks + sitemap + robots`)
