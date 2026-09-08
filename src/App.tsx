import { useEffect, useMemo, useState } from "react"
import {
  Badge,
  Button,
  DossierHeader,
  EvidenceMatrix,
  MoonWitnessMark,
  MoonWitnessRegistryAssetImage,
  ObservatorySectionNav,
  ProvenanceRail,
  ThemeToggle,
  TimelineEntry,
  type EvidenceMatrixRow,
  type ProvenanceRailNode,
} from "@rocksoul/ui"
import {
  counts,
  eventSearchText,
  eventTypeLabel,
  events,
  formatEventWindow,
  getEventBundle,
  recordUrl,
  type EventRecord,
  type EvidenceRecord,
} from "./events"

function typeLabel(type: string) {
  return eventTypeLabel[type] ?? type.replaceAll("_", " ")
}
function pct(value: number) { return Math.round(value * 100) + "%" }
function human(value: string) { return value.replaceAll("_", " ") }

function eventIdFromPath() {
  const match = window.location.pathname.match(/^\/events\/([^/]+)\/?$/)
  return match ? decodeURIComponent(match[1]) : null
}
function eventPath(id: string) { return "/events/" + encodeURIComponent(id) }

function statusVariant(status: string): "supported" | "partial" | "unresolved" | "disputed" {
  if (status.includes("strong") || status === "attested" || status === "supported") return "supported"
  if (status.includes("disputed") || status === "contradicted") return "disputed"
  if (status === "indeterminate" || status === "unverified") return "unresolved"
  return "partial"
}

function relationStance(relation: EvidenceRecord["relation"]) {
  if (relation === "supports") return "support" as const
  if (relation === "contradicts") return "counter" as const
  if (relation === "contextualizes") return "context" as const
  return "alternative" as const
}

function Header() {
  return <header className="legend-header">
    <a className="legend-brand" href="#top" aria-label="LEGEND home">
      <MoonWitnessMark className="legend-mark" />
      <span><strong>LEGEND</strong><small>MOONWITNESS / EVENT INTELLIGENCE</small></span>
    </a>
    <nav className="legend-nav" aria-label="Primary navigation">
      <a href="#events">EVENTS</a><a href="#method">METHOD</a><a href="#trail">TRAIL</a>
    </nav>
    <div className="header-actions">
      <span className="corpus-state">CANONICAL SNAPSHOT · {counts.canonical_events} EVENTS</span>
      <ThemeToggle />
    </div>
  </header>
}

function Hero() {
  return <section id="top" className="legend-hero">
    <div className="hero-copy">
      <p className="eyebrow">LEGEND / CANONICAL EVENT ARCHIVE</p>
      <h1>REALITY <span>LEAVES RECEIPTS.</span></h1>
      <p>Trace the event. Inspect the source chain. Keep uncertainty visible. LEGEND reconstructs what happened without turning resemblance into causation or later interpretation into historical fact.</p>
      <div className="hero-actions"><a href="#events">ENTER EVENT ARCHIVE →</a><span>EVENT ≠ INTERPRETATION</span></div>
    </div>
    <figure className="hero-visual">
      <MoonWitnessRegistryAssetImage pack="cinematic-hero" assetId="evidence-desk" alt="MoonWitness evidence desk" loading="eager" fetchPriority="high" />
      <figcaption>ROCKSOUL-ASSETS / PINNED REGISTRY · PROVENANCE FIRST</figcaption>
    </figure>
    <div className="hero-metrics">
      <div><span>EVENTS</span><strong>{counts.canonical_events}</strong></div>
      <div><span>SOURCES</span><strong>{counts.sources}</strong></div>
      <div><span>CLAIMS</span><strong>{counts.claims}</strong></div>
      <div><span>EVIDENCE</span><strong>{counts.evidence_edges}</strong></div>
    </div>
  </section>
}

function EventButton({event, active, onSelect}:{event:EventRecord;active:boolean;onSelect:()=>void}) {
  return <button className={"event-item "+(active?"active":"")} aria-pressed={active} onClick={onSelect}>
    <span className="meta">{event.id}</span><strong>{event.title}</strong>
    <small>{typeLabel(event.event_type)} · {formatEventWindow(event)}</small><b>{pct(event.historicity.confidence)}</b>
  </button>
}

function Dossier({event}:{event:EventRecord}) {
  const bundle=getEventBundle(event)
  const rows:EvidenceMatrixRow[]=bundle.claims.map(claim=>{
    const edges=bundle.evidence.filter(edge=>edge.claim_id===claim.id)
    const values={support:0,counter:0,context:0,alternative:0}
    edges.forEach(edge=>{ values[relationStance(edge.relation)] += 1 })
    return {id:claim.id,label:claim.statement,context:human(claim.claim_type),epistemic:human(claim.epistemic_status),sourceCount:claim.source_refs.length,values}
  })
  const nodes:ProvenanceRailNode[]=[
    {id:event.id,kind:"event",label:event.title,detail:formatEventWindow(event),active:true},
    ...bundle.places.map(p=>({id:p.id,kind:"location" as const,label:p.name,detail:p.region})),
    ...bundle.artifacts.map(a=>({id:a.id,kind:"evidence" as const,label:a.title,detail:a.artifact_type})),
    ...bundle.sources.map(s=>({id:s.id,kind:"source" as const,label:s.title,detail:s.quality,external:true})),
  ]
  return <article id="dossier" className="dossier">
    <DossierHeader eyebrow="CANONICAL EVENT DOSSIER" title={event.title} summary={event.summary} recordId={event.id}
      variant="compact" status={{label:human(event.historicity.status),variant:statusVariant(event.historicity.status)}}
      metadata={[
        {label:"Time",value:formatEventWindow(event)},
        {label:"Confidence",value:pct(event.historicity.confidence)},
        {label:"Claims",value:String(bundle.claims.length)},
        {label:"Evidence",value:String(bundle.evidence.length)},
      ]}
      actions={<a className="record-anchor" href={recordUrl("events",event.id)} target="_blank" rel="noreferrer">OPEN CANONICAL JSON ↗</a>}
    />

    <section className="dossier-grid">
      <div className="panel"><span className="section-label">TEMPORAL RECORD</span><TimelineEntry timestamp={formatEventWindow(event)} title={event.title} description={event.time.note} source={event.review.reviewed_by} status={event.review.status} variant="event" /></div>
      <div className="panel"><span className="section-label">HISTORICITY BOUNDARY</span><h3>{pct(event.historicity.confidence)} confidence in the stated assessment.</h3><p>{event.historicity.note}</p><small>{event.review.note}</small></div>
    </section>

    <section className="panel"><span className="section-label">PROVENANCE RAIL</span><ProvenanceRail nodes={nodes} description={"Event → "+bundle.places.map(x=>x.name).join(", ")+" → "+bundle.sources.map(x=>x.title).join(" → ")} /></section>

    <section className="panel"><div className="section-head"><span className="section-label">CLAIM × EVIDENCE MATRIX</span><strong>{rows.length} CLAIMS / {bundle.evidence.length} EDGES</strong></div><EvidenceMatrix rows={rows} caption={"Evidence matrix for "+event.title} /></section>

    <section className="records-section">
      <div className="section-head"><span className="section-label">ATOMIC CLAIMS</span><strong>{bundle.claims.length}</strong></div>
      <div className="card-grid">{bundle.claims.map(claim=><article className="record-card" key={claim.id}>
        <header><Badge variant={statusVariant(claim.epistemic_status)}>{human(claim.epistemic_status)}</Badge><a href={recordUrl("claims",claim.id)} target="_blank" rel="noreferrer">{claim.id} ↗</a></header>
        <h3>{claim.statement}</h3><p>{human(claim.claim_type)}</p>
      </article>)}</div>
    </section>

    <section className="records-section">
      <div className="section-head"><span className="section-label">EVIDENCE / COUNTEREVIDENCE</span><strong>{bundle.evidence.length}</strong></div>
      <div className="card-grid">{bundle.evidence.map(edge=><article className="record-card" key={edge.id}>
        <header><Badge variant={edge.relation==="supports"?"supported":edge.relation==="contradicts"?"disputed":"partial"}>{human(edge.relation)}</Badge><a href={recordUrl("evidence",edge.id)} target="_blank" rel="noreferrer">{pct(edge.confidence)} ↗</a></header>
        <h3>{edge.summary}</h3><p>{human(edge.evidence_type)} · claim {edge.claim_id}</p>
        {(edge.limitations??[]).map(x=><small key={x}>LIMITATION · {x}</small>)}
      </article>)}</div>
    </section>

    <section className="records-section">
      <div className="section-head"><span className="section-label">SOURCES</span><strong>{bundle.sources.length}</strong></div>
      <div className="card-grid">{bundle.sources.map(source=><article className="record-card source-card" key={source.id}>
        <header><Badge variant="verified">{source.quality}</Badge><a href={recordUrl("sources",source.id)} target="_blank" rel="noreferrer">{source.id} ↗</a></header>
        <h3>{source.title}</h3><p>{source.creator??"Unknown creator"} · {source.date??"undated"} · {human(source.source_type)}</p>
        <small>{source.provenance}</small>
        <a className="locator" href={source.locator} target="_blank" rel="noreferrer">OPEN SOURCE LOCATOR ↗</a>
      </article>)}</div>
    </section>

    <section className="dossier-grid">
      <div className="panel"><span className="section-label">WHERE</span>{bundle.places.map(place=><article className="compact-record" key={place.id}><h3>{place.name}</h3><p>{place.region} · {place.country}</p><small>{place.summary}</small><a href={recordUrl("places",place.id)} target="_blank" rel="noreferrer">{place.id} ↗</a></article>)}</div>
      <div className="panel"><span className="section-label">MATERIAL RECORD</span>{bundle.artifacts.length?bundle.artifacts.map(a=><article className="compact-record" key={a.id}><h3>{a.title}</h3><p>{human(a.artifact_type)} · {a.date.label??"undated"}</p><small>{a.summary}</small><a href={recordUrl("artifacts",a.id)} target="_blank" rel="noreferrer">{a.id} ↗</a></article>):<p>No canonical artifact reference asserted for this event.</p>}</div>
    </section>

    <section className="dossier-grid">
      <div className="panel uncertainty"><span className="section-label">UNCERTAINTY IS DATA</span><ol>{event.uncertainty.map((x,i)=><li key={x}><b>{String(i+1).padStart(2,"0")}</b><span>{x}</span></li>)}</ol></div>
      <div className="panel"><span className="section-label">ALTERNATIVE INTERPRETATIONS</span><ol>{event.alternative_interpretations.map((x,i)=><li key={x}><b>{String(i+1).padStart(2,"0")}</b><span>{x}</span></li>)}</ol></div>
    </section>

    <section className="panel">
      <div className="section-head"><span className="section-label">RELATIONSHIPS / CROSS-DOMAIN</span><strong>{bundle.relationships.length}</strong></div>
      {bundle.relationships.length?<div className="relationship-list">{bundle.relationships.map(rel=><article key={rel.id}>
        <div><Badge variant={statusVariant(rel.status)}>{rel.status}</Badge><strong>{pct(rel.confidence)}</strong></div>
        <code>{rel.subject_id} → {human(rel.relation)} → {rel.object_id}</code>
        {rel.note?<p>{rel.note}</p>:null}<a href={recordUrl("relationships",rel.id)} target="_blank" rel="noreferrer">{rel.id} ↗</a>
      </article>)}</div>:<p>No cross-domain relationship asserted in the canonical graph.</p>}
    </section>

    {event.narrative_links.map(link=><section className="narrative-panel" key={link.narrative_id}>
      <span className="section-label">NARRATIVE CONNECTION</span><h3>{link.narrative_id}</h3>
      <p><strong>CORRELATION ≠ ORIGIN.</strong> {human(link.relation)} · {pct(link.confidence)} · {link.status}</p>
      {link.counterpoints.map(x=><small key={x}>{x}</small>)}
    </section>)}
  </article>
}

export function App() {
  const initial=eventIdFromPath()
  const [query,setQuery]=useState("")
  const [type,setType]=useState("all")
  const [selectedId,setSelectedId]=useState(events.some(e=>e.id===initial)?initial!:events[0].id)
  const types=useMemo(()=>Array.from(new Set(events.map(e=>e.event_type))),[])
  const filtered=useMemo(()=>{
    const needle=query.trim().toLowerCase()
    return events.filter(e=>(type==="all"||e.event_type===type)&&(!needle||eventSearchText(e).includes(needle)))
  },[query,type])
  const selected=events.find(e=>e.id===selectedId)??events[0]

  useEffect(()=>{
    const onPop=()=>{const id=eventIdFromPath(); if(id&&events.some(e=>e.id===id)) setSelectedId(id)}
    window.addEventListener("popstate",onPop); return()=>window.removeEventListener("popstate",onPop)
  },[])
  useEffect(()=>{
    document.title=selected.title+" · LEGEND"
    const meta=document.querySelector('meta[name="description"]')
    meta?.setAttribute("content",selected.summary)
  },[selected])
  useEffect(()=>{
    if(filtered.length&&!filtered.some(e=>e.id===selectedId)) setSelectedId(filtered[0].id)
  },[filtered,selectedId])

  const select=(id:string)=>{
    setSelectedId(id)
    window.history.pushState({event:id},"",eventPath(id))
    requestAnimationFrame(()=>document.getElementById("dossier")?.scrollIntoView({behavior:"smooth",block:"start"}))
  }

  return <div className="legend-app">
    <a className="skip-link" href="#events">Skip to event archive</a>
    <Header />
    <ObservatorySectionNav items={[{id:"events",label:"EVENTS"},{id:"method",label:"METHOD"},{id:"trail",label:"TRAIL"}]} label="LEGEND /" offset={120} />
    <main><Hero />
      <section id="events" className="archive-section">
        <header className="archive-heading"><div><p className="eyebrow">01 / CANONICAL EVENT ARCHIVE</p><h2>TRACE THE EVENT.<br/>NOT THE VIBE.</h2></div><p>Search across event metadata, claims, evidence summaries, sources, places, artifacts, and relationships. Every dossier keeps uncertainty and provenance visible.</p></header>
        <div className="archive-controls">
          <label><span className="sr-only">Search the LEGEND corpus</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search events, claims, evidence, sources…" /></label>
          <div className="type-filters" aria-label="Filter by event type"><button aria-pressed={type==="all"} className={type==="all"?"active":""} onClick={()=>setType("all")}>ALL</button>{types.map(t=><button key={t} aria-pressed={type===t} className={type===t?"active":""} onClick={()=>setType(t)}>{typeLabel(t)}</button>)}</div>
          {(query||type!=="all")?<Button variant="secondary" size="sm" onClick={()=>{setQuery("");setType("all")}}>RESET</Button>:null}
        </div>
        <div className="archive-workbench">
          <aside className="event-index" aria-label="Canonical events"><div className="index-head"><span>CANONICAL RECORDS</span><strong>{filtered.length}</strong></div>{filtered.map(e=><EventButton key={e.id} event={e} active={e.id===selectedId} onSelect={()=>select(e.id)} />)}{!filtered.length?<p className="empty-state">No match. Try another event, claim, evidence phrase, source, or event type.</p>:null}</aside>
          <div className="dossier-stage"><Dossier event={selected}/></div>
        </div>
      </section>
      <section id="method" className="split-section"><div><p className="eyebrow">02 / METHOD</p><h2>EVIDENCE BEFORE<br/>INTERPRETATION.</h2><p>LEGEND owns EVENT semantics. Sources attest. Evidence supports, contextualizes, contradicts, or leaves uncertainty unresolved. Later narrative connections never overwrite the event record.</p><div className="rule-box">EVENT → CLAIM → SOURCE → EVIDENCE / COUNTEREVIDENCE → HISTORICITY → UNCERTAINTY</div></div><div className="asset-stack"><MoonWitnessRegistryAssetImage pack="data-viz" assetId="evidence-timeline" alt="Evidence timeline" loading="lazy" decoding="async"/><MoonWitnessRegistryAssetImage pack="data-viz" assetId="evidence-matrix" alt="Evidence matrix" loading="lazy" decoding="async"/></div></section>
      <section id="trail" className="split-section trail"><div className="asset-stack"><MoonWitnessRegistryAssetImage pack="data-viz" assetId="graph-nodes" alt="Graph node semantics" loading="lazy" decoding="async"/></div><div><p className="eyebrow">03 / EVENT INTELLIGENCE GRAPH</p><h2>THE TRAIL SHOULD<br/>STAY INSPECTABLE.</h2><p>Strong event evidence does not erase uncertainty around motive, identity, chronology, or narrative origin.</p><div className="principles"><span>SIMILARITY ≠ TRANSMISSION</span><span>LATER SOURCE ≠ CONTEMPORARY EVIDENCE</span><span>TRADITION = EVIDENCE OF TRADITION</span><span>UNCERTAINTY = DATA</span></div></div></section>
    </main>
    <footer className="legend-footer"><div><MoonWitnessMark/><strong>MOONWITNESS / LEGEND</strong></div><p>Reality first. Interpretation second. Provenance always.</p><span>WHERE REALITY BECOMES STORY.</span></footer>
  </div>
}
