import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";

const root=process.cwd();
const readJson=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const ajv=new Ajv({allErrors:true,strict:false});

const eventValidator=ajv.compile(readJson("schemas/event.schema.json"));
const schemas={
  events:eventValidator,
  candidates:eventValidator,
  sources:ajv.compile(readJson("schemas/source.schema.json")),
  claims:ajv.compile(readJson("schemas/claim.schema.json")),
  evidence:ajv.compile(readJson("schemas/evidence.schema.json")),
  relationships:ajv.compile(readJson("schemas/relationship.schema.json")),
  places:ajv.compile(readJson("schemas/place.schema.json")),
  artifacts:ajv.compile(readJson("schemas/artifact.schema.json"))
};

const taxonomy=readJson("taxonomy/event-types.json");
const allowedEventTypes=new Set(taxonomy.types.map((x)=>x.id));

function jsonFiles(dir){
  const abs=path.join(root,dir);
  if(!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs)
    .filter((n)=>n.endsWith(".json")&&n!=="index.json")
    .map((n)=>path.join(abs,n));
}

function loadRegistry(kind){
  const items=new Map();
  for(const file of jsonFiles(`data/${kind}`)){
    const data=JSON.parse(fs.readFileSync(file,"utf8"));
    items.set(data.id,{data,file});
  }
  return items;
}

let failures=0;
const fail=(message)=>{
  failures++;
  console.error(`GRAPH INVALID: ${message}`);
};

for(const [kind,validate] of Object.entries(schemas)){
  for(const file of jsonFiles(`data/${kind}`)){
    const data=JSON.parse(fs.readFileSync(file,"utf8"));
    if(!validate(data)){
      failures++;
      console.error(`INVALID ${path.relative(root,file)}`);
      console.error(validate.errors);
      continue;
    }
    if((kind==="events"||kind==="candidates")&&!allowedEventTypes.has(data.event_type)){
      failures++;
      console.error(`INVALID EVENT TYPE ${path.relative(root,file)}: ${data.event_type}`);
    }
  }
}

const codes=taxonomy.types.map((x)=>x.code);
const ids=taxonomy.types.map((x)=>x.id);
if(new Set(codes).size!==codes.length||new Set(ids).size!==ids.length){
  failures++;
  console.error("taxonomy/event-types.json contains duplicate codes or ids");
}

const registries={
  events:loadRegistry("events"),
  candidates:loadRegistry("candidates"),
  sources:loadRegistry("sources"),
  claims:loadRegistry("claims"),
  evidence:loadRegistry("evidence"),
  relationships:loadRegistry("relationships"),
  places:loadRegistry("places"),
  artifacts:loadRegistry("artifacts")
};

const localById=new Map();
for(const [kind,registry] of Object.entries(registries)){
  for(const [id,entry] of registry){
    if(localById.has(id)){
      fail(`duplicate local id ${id} in ${kind} and ${localById.get(id).kind}`);
    }else{
      localById.set(id,{kind,...entry});
    }
  }
}

const localPrefixes=new Set(["EVT","SRC","CLM","EVD","REL","PLC","ART"]);
const externalPrefixes=new Set(["MYTH","NAR","CAND","PER"]);

function prefixOf(id){
  return typeof id==="string" ? id.split("-")[0] : "";
}

function requireSource(ref,context){
  if(!registries.sources.has(ref)) fail(`${context} references missing source ${ref}`);
}

function requireLocalIfOwned(ref,context){
  const prefix=prefixOf(ref);
  if(localPrefixes.has(prefix)&&!localById.has(ref)){
    fail(`${context} references missing local object ${ref}`);
  }else if(!localPrefixes.has(prefix)&&!externalPrefixes.has(prefix)){
    fail(`${context} uses unknown reference namespace ${ref}`);
  }
}

for(const [id,{data}] of registries.events){
  for(const ref of data.source_refs) requireSource(ref,`event ${id}`);
  for(const ref of data.place_refs){
    if(!registries.places.has(ref)) fail(`event ${id} references missing place ${ref}`);
  }
  for(const ref of data.artifact_refs){
    if(!registries.artifacts.has(ref)) fail(`event ${id} references missing artifact ${ref}`);
  }
  for(const ref of data.claims){
    const claim=registries.claims.get(ref)?.data;
    if(!claim) fail(`event ${id} references missing claim ${ref}`);
    else if(claim.subject_id!==id) fail(`event ${id} includes claim ${ref} whose subject_id is ${claim.subject_id}`);
  }
  for(const ref of data.evidence_refs){
    const edge=registries.evidence.get(ref)?.data;
    if(!edge) fail(`event ${id} references missing evidence ${ref}`);
    else if(!data.claims.includes(edge.claim_id)) fail(`event ${id} evidence ${ref} points to claim ${edge.claim_id} not owned by the event`);
  }
  for(const link of data.narrative_links){
    for(const ref of link.source_refs??[]) requireSource(ref,`event ${id} narrative link`);
    requireLocalIfOwned(link.narrative_id,`event ${id} narrative link`);
  }
}

for(const [id,{data}] of registries.candidates){
  for(const ref of data.source_refs) requireSource(ref,`candidate ${id}`);
  for(const ref of data.place_refs){
    if(!registries.places.has(ref)) fail(`candidate ${id} references missing place ${ref}`);
  }
  for(const ref of data.artifact_refs){
    if(!registries.artifacts.has(ref)) fail(`candidate ${id} references missing artifact ${ref}`);
  }
  for(const ref of data.claims){
    if(!registries.claims.has(ref)) fail(`candidate ${id} references missing claim ${ref}`);
  }
  for(const ref of data.evidence_refs){
    if(!registries.evidence.has(ref)) fail(`candidate ${id} references missing evidence ${ref}`);
  }
}

for(const [id,{data}] of registries.claims){
  requireLocalIfOwned(data.subject_id,`claim ${id}`);
  for(const ref of data.source_refs) requireSource(ref,`claim ${id}`);
}

for(const [id,{data}] of registries.evidence){
  if(!registries.claims.has(data.claim_id)) fail(`evidence ${id} references missing claim ${data.claim_id}`);
  for(const ref of data.source_refs) requireSource(ref,`evidence ${id}`);
}

for(const [id,{data}] of registries.places){
  for(const ref of data.source_refs) requireSource(ref,`place ${id}`);
}

for(const [id,{data}] of registries.artifacts){
  for(const ref of data.source_refs) requireSource(ref,`artifact ${id}`);
  if(data.discovery.place_id&&!registries.places.has(data.discovery.place_id)){
    fail(`artifact ${id} references missing discovery place ${data.discovery.place_id}`);
  }
}

for(const [id,{data}] of registries.relationships){
  requireLocalIfOwned(data.subject_id,`relationship ${id} subject`);
  requireLocalIfOwned(data.object_id,`relationship ${id} object`);
  for(const ref of data.source_refs) requireSource(ref,`relationship ${id}`);
}

if(failures){
  console.error(`Validation failed with ${failures} problem(s).`);
  process.exit(1);
}

console.log("LEGEND schema + graph validation OK");
