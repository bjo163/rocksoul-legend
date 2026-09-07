import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";

const root=process.cwd();
const readJson=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const ajv=new Ajv({allErrors:true,strict:false});

const schemas={
  events:ajv.compile(readJson("schemas/event.schema.json")),
  candidates:ajv.compile(readJson("schemas/event.schema.json")),
  sources:ajv.compile(readJson("schemas/source.schema.json")),
  claims:ajv.compile(readJson("schemas/claim.schema.json")),
  evidence:ajv.compile(readJson("schemas/evidence.schema.json")),
  relationships:ajv.compile(readJson("schemas/relationship.schema.json"))
};

const taxonomy=readJson("taxonomy/event-types.json");
const allowedEventTypes=new Set(taxonomy.types.map((x)=>x.id));

function jsonFiles(dir){
  const abs=path.join(root,dir);
  if(!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs).filter((n)=>n.endsWith(".json")&&n!=="index.json").map((n)=>path.join(abs,n));
}

let failures=0;
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

if(failures){
  console.error(`Validation failed with ${failures} problem(s).`);
  process.exit(1);
}
console.log("LEGEND validation OK");
