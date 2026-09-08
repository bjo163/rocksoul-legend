import fs from "node:fs"
import path from "node:path"

const root=process.cwd()
const dist=path.join(root,"dist")
const base=fs.readFileSync(path.join(dist,"index.html"),"utf8")
const eventDir=path.join(root,"data/events")
const project=JSON.parse(fs.readFileSync(path.join(root,"data/project.json"),"utf8"))
const canonicalBase=project.production_origin.replace(/\/$/,"")

function esc(value){
  return String(value).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")
}

for(const file of fs.readdirSync(eventDir).filter(x=>x.endsWith(".json"))){
  const event=JSON.parse(fs.readFileSync(path.join(eventDir,file),"utf8"))
  const title=esc(event.title+" · LEGEND")
  const description=esc(event.summary)
  const url=canonicalBase+"/events/"+encodeURIComponent(event.id)
  let html=base
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${description}" />`)
    .replace("</head>", `  <link rel="canonical" href="${url}" />\n    <meta property="og:url" content="${url}" />\n  </head>`)
  const out=path.join(dist,"events",event.id,"index.html")
  fs.mkdirSync(path.dirname(out),{recursive:true})
  fs.writeFileSync(out,html)
}
console.log("LEGEND event permalink pages generated")
