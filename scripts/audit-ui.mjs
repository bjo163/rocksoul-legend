import fs from "node:fs"
import path from "node:path"

const root=process.cwd()
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8")
const readJson=(p)=>JSON.parse(read(p))
const fail=(message)=>{ console.error("UI CONTRACT INVALID:",message); process.exitCode=1 }

const app=read("src/App.tsx")
const eventsSource=read("src/events.ts")
const styles=read("src/styles.css")
const pkg=readJson("package.json")

for(const component of ["DossierHeader","EvidenceMatrix","ProvenanceRail","ObservatorySectionNav","ThemeToggle","MoonWitnessRegistryAssetImage"]){
  if(!app.includes(component)) fail("missing canonical @rocksoul/ui component "+component)
}
if(/raw\.githubusercontent\.com\/bjo163\/rocksoul-assets\/main/.test(app+eventsSource)) fail("runtime asset URL tracks rocksoul-assets/main instead of the pinned registry")
if(/blob\/dev\/data\//.test(app+eventsSource)) fail("production provenance points to dev")
if(!String(pkg.dependencies["@rocksoul/ui"]).includes("#809edd1b79ff21aa7ddccd451e7889988be98380")) fail("@rocksoul/ui is not pinned to the reviewed commit")
if(!app.includes("aria-pressed")) fail("filter/selection state is not exposed semantically")
if(!app.includes("skip-link")) fail("skip link missing")
if(!styles.includes("min-height:44px")) fail("44px touch target contract missing")

const eventDir=path.join(root,"data/events")
for(const file of fs.readdirSync(eventDir).filter(x=>x.endsWith(".json"))){
  const event=readJson(path.join("data/events",file))
  if(!event.claims?.length) fail(event.id+" has no atomic claims")
  if(!event.evidence_refs?.length) fail(event.id+" has no evidence edges")
  if(!event.source_refs?.length) fail(event.id+" has no source provenance")
  if(!event.place_refs?.length) fail(event.id+" has no place context")
}
if(!eventsSource.includes("eventSearchText") || !eventsSource.includes("bundle.claims") || !eventsSource.includes("bundle.evidence") || !eventsSource.includes("bundle.sources")) fail("full-corpus search projection is incomplete")

if(!process.exitCode) console.log("LEGEND UI + accessibility contract audit OK")
