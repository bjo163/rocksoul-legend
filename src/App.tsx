import { useEffect, useMemo, useState } from "react"
import {
  Badge,
  Button,
  ConfidenceMeter,
  DossierHeader,
  EvidenceMatrix,
  EventTopologyGraph,
  HistoricityBand,
  MoonWitnessMark,
  MoonWitnessRegistryAssetImage,
  ObservatorySectionNav,
  ProvenanceRail,
  RecordFieldGrid,
  ThemeToggle,
  TimelineEntry,
  semanticStatusVariant,
  type EvidenceMatrixRow,
  type ProvenanceRailNode,
} from "@rocksoul/ui"
import {
  corpusConfidenceRange,
  corpusEventTypeCounts,
  counts,
  eventSearchText,
  eventTypeLabel,
  events,
  formatEventWindow,
  getEventBundle,
  getEventTopology,
  project,
  recordUrl,
  type EventRecord,
  type EvidenceRecord,
} from "./events"

function typeLabel(type: string) {
  return eventTypeLabel[type] ?? type.replaceAll("_", " ")
}
function pct(value: number) { return Math.round(value * 100) + "%" }
function human(value: string) { return value.replaceAll("_", " ") }
function recordObject<T extends object>(record: T) { return { ...record } as Record<string, unknown> }

function eventIdFromPath() {
  const match = window.location.pathname.match(/^\/events\/([^/]+)\/?$/)
  return match ? decodeURIComponent(match[1]) : null
}
function eventPath(id: string) { return "/events/" + encodeURIComponent(id) }

function relationStance(relation: EvidenceRecord["relation"]) {
  if (relation === "supports") return "support" as const
  if (relation === "contradicts") return "counter" as const
  if (relation === "contextualizes") return "context" as const
  return "alternative" as const
}

function RecordDetails({ label, record }: { label: string; record: Record<string, unknown> }) {
  return <details className="record-details">
    <summary>INSPECT {label} FIELDS</summary>
    <RecordFieldGrid record={record} className="record-field-grid" />
  </details>
}

function Header() {
  return <header className="legend-header">
    <a className="legend-brand" href="#top" aria-label={project.ui.product_name + " home"}>
      <MoonWitnessMark className="legend-mark" />
      <span><strong>{project.ui.product_name}</strong><small>{project.ui.product_descriptor}</small></span>
    </a>
    <nav className="legend-nav" aria-label="Primary navigation">
      {project.ui.navigation.map((item) => <a key={item.id} href={"#" + item.id}>{item.label}</a>)}
    </nav>
    <div className="header-actions">
      <span className="corpus-state">CANONICAL SNAPSHOT · {counts.canonical_events} EVENTS</span>
      <ThemeToggle />
    </div>
  </header>
}

function Hero() {
  const hero = project.ui.hero
  return <section id="top" className="legend-hero">
    <div className="hero-copy">
      <p className="eyebrow">{hero.eyebrow}</p>
      <h1>{hero.headline} <span>{hero.accent}</span></h1>
      <p>{hero.body}</p>
      <div className="hero-actions"><a href="#events">{hero.cta} →</a><span>{hero.guardrail}</span></div>
    </div>
    <figure className="hero-visual">
      <MoonWitnessRegistryAssetImage pack={project.visual_assets.hero.pack} assetId={project.visual_assets.hero.asset_id} alt="MoonWitness evidence desk" loading="eager" fetchPriority="high" />
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

function CorpusOverview() {
  const typeCounts = corpusEventTypeCounts()
  const confidence = corpusConfidenceRange()
  const maxTypeCount = Math.max(1, ...typeCounts.map((item) => item.count))
  const chronology = [...events].sort((a, b) => String(a.time.start ?? "9999").localeCompare(String(b.time.start ?? "9999")))

  return <section className="corpus-overview" aria-labelledby="corpus-overview-title">
    <header className="archive-heading">
      <div><p className="eyebrow">00 / CORPUS OBSERVATORY</p><h2 id="corpus-overview-title">SEE THE WHOLE<br/>EVIDENCE FIELD.</h2></div>
      <p>Every number is derived from canonical JSON at build time. The overview exposes distribution, confidence range, chronology, and graph inventory before any single dossier is opened.</p>
    </header>
    <div className="corpus-metric-grid">
      {[
        ["EVENTS", counts.canonical_events],
        ["SOURCES", counts.sources],
        ["CLAIMS", counts.claims],
        ["EVIDENCE", counts.evidence_edges],
        ["RELATIONSHIPS", counts.relationships],
        ["PLACES", counts.places],
        ["ARTIFACTS", counts.artifacts],
        ["AVG CONFIDENCE", pct(confidence.average)],
      ].map(([label, value]) => <article key={String(label)}><span>{label}</span><strong>{value}</strong></article>)}
    </div>
    <div className="corpus-overview-grid">
      <section className="panel">
        <div className="section-head"><span className="section-label">EVENT TYPE DISTRIBUTION</span><strong>{typeCounts.length}</strong></div>
        <div className="distribution-list">{typeCounts.map((item) => <div key={item.id}>
          <header><span>{item.label}</span><strong>{item.count}</strong></header>
          <div className="distribution-track" aria-hidden="true"><span style={{ width: ((item.count / maxTypeCount) * 100) + "%" }} /></div>
        </div>)}</div>
      </section>
      <section className="panel">
        <div className="section-head"><span className="section-label">HISTORICITY RANGE</span><strong>{pct(confidence.min)} → {pct(confidence.max)}</strong></div>
        <div className="confidence-list">{chronology.map((event) => <div key={event.id}>
          <div className="confidence-row-head"><span>{event.title}</span><small>{formatEventWindow(event)}</small></div>
          <ConfidenceMeter value={event.historicity.confidence} label={typeLabel(event.event_type)} detail={human(event.historicity.status)} />
        </div>)}</div>
      </section>
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
  const bundle = getEventBundle(event)
  const topology = getEventTopology(event)
  const rows: EvidenceMatrixRow[] = bundle.claims.map((claim) => {
    const claimEdges = bundle.evidence.filter((edge) => edge.claim_id === claim.id)
    const values = { support: 0, counter: 0, context: 0, alternative: 0 }
    claimEdges.forEach((edge) => { values[relationStance(edge.relation)] += 1 })
    return {
      id: claim.id,
      label: claim.statement,
      context: human(claim.claim_type),
      epistemic: human(claim.epistemic_status),
      sourceCount: claim.source_refs.length,
      values,
    }
  })
  const nodes: ProvenanceRailNode[] = [
    {id:event.id,kind:"event",label:event.title,detail:formatEventWindow(event),active:true},
    ...bundle.places.map((place) => ({id:place.id,kind:"location" as const,label:place.name,detail:place.region})),
    ...bundle.artifacts.map((artifact) => ({id:artifact.id,kind:"evidence" as const,label:artifact.title,detail:artifact.artifact_type})),
    ...bundle.sources.map((source) => ({id:source.id,kind:"source" as const,label:source.title,detail:source.quality,external:true})),
  ]

  return <article id="dossier" className="dossier">
    <DossierHeader
      eyebrow="CANONICAL EVENT DOSSIER"
      title={event.title}
      summary={event.summary}
      recordId={event.id}
      variant="compact"
      status={{label:human(event.historicity.status),variant:semanticStatusVariant(event.historicity.status)}}
      metadata={[
        {label:"Time",value:formatEventWindow(event)},
        {label:"Type",value:typeLabel(event.event_type)},
        {label:"Confidence",value:pct(event.historicity.confidence)},
        {label:"Claims",value:String(bundle.claims.length)},
        {label:"Evidence",value:String(bundle.evidence.length)},
        {label:"Sources",value:String(bundle.sources.length)},
      ]}
      actions={<a className="record-anchor" href={recordUrl("events",event.id)} target="_blank" rel="noreferrer">OPEN CANONICAL JSON ↗</a>}
    />

    <section className="dossier-grid">
      <div className="panel">
        <span className="section-label">TEMPORAL RECORD</span>
        <TimelineEntry timestamp={formatEventWindow(event)} title={event.title} description={event.time.note} source={event.review.reviewed_by} status={event.review.status} variant="event" />
      </div>
      <HistoricityBand
        confidence={event.historicity.confidence}
        status={event.historicity.status}
        scope={event.historicity.note}
        uncertainty={event.uncertainty}
        alternatives={event.alternative_interpretations}
      />
    </section>

    <section className="records-section topology-section">
      <div className="section-head"><span className="section-label">LIVE EVENT INTELLIGENCE TOPOLOGY</span><strong>{topology.nodes.length} NODES / {topology.edges.length} EDGES</strong></div>
      <EventTopologyGraph
        nodes={topology.nodes}
        edges={topology.edges}
        title={"Topology for " + event.title}
        description="Every local claim, evidence record, source, place, artifact, uncertainty, alternative interpretation, and relevant cross-domain relationship projected from canonical LEGEND JSON."
      />
    </section>

    <section className="panel">
      <span className="section-label">PROVENANCE RAIL</span>
      <ProvenanceRail nodes={nodes} description={"Event → "+bundle.places.map((item) => item.name).join(", ")+" → "+bundle.sources.map((item) => item.title).join(" → ")} />
    </section>

    <section className="panel">
      <div className="section-head"><span className="section-label">CLAIM × EVIDENCE MATRIX</span><strong>{rows.length} CLAIMS / {bundle.evidence.length} EDGES</strong></div>
      <EvidenceMatrix rows={rows} caption={"Evidence matrix for "+event.title} />
    </section>

    <section className="records-section">
      <div className="section-head"><span className="section-label">ATOMIC CLAIMS</span><strong>{bundle.claims.length}</strong></div>
      <div className="card-grid">{bundle.claims.map((claim) => <article className="record-card" key={claim.id}>
        <header><Badge variant={semanticStatusVariant(claim.epistemic_status)}>{human(claim.epistemic_status)}</Badge><a href={recordUrl("claims",claim.id)} target="_blank" rel="noreferrer">{claim.id} ↗</a></header>
        <h3>{claim.statement}</h3><p>{human(claim.claim_type)}</p>
        <RecordDetails label="CLAIM" record={recordObject(claim)} />
      </article>)}</div>
    </section>

    <section className="records-section">
      <div className="section-head"><span className="section-label">EVIDENCE / COUNTEREVIDENCE</span><strong>{bundle.evidence.length}</strong></div>
      <div className="card-grid">{bundle.evidence.map((edge) => <article className="record-card" key={edge.id}>
        <header><Badge variant={semanticStatusVariant(edge.relation)}>{human(edge.relation)}</Badge><a href={recordUrl("evidence",edge.id)} target="_blank" rel="noreferrer">{edge.id} ↗</a></header>
        <h3>{edge.summary}</h3><p>{human(edge.evidence_type)} · claim {edge.claim_id}</p>
        <ConfidenceMeter value={edge.confidence} label="Evidence confidence" detail={human(edge.relation)} />
        {(edge.limitations??[]).map((item) => <small key={item}>LIMITATION · {item}</small>)}
        <RecordDetails label="EVIDENCE" record={recordObject(edge)} />
      </article>)}</div>
    </section>

    <section className="records-section">
      <div className="section-head"><span className="section-label">SOURCES</span><strong>{bundle.sources.length}</strong></div>
      <div className="card-grid">{bundle.sources.map((source) => <article className="record-card source-card" key={source.id}>
        <header><Badge variant={semanticStatusVariant(source.quality)}>{source.quality}</Badge><a href={recordUrl("sources",source.id)} target="_blank" rel="noreferrer">{source.id} ↗</a></header>
        <h3>{source.title}</h3><p>{source.creator??"Unknown creator"} · {source.date??"undated"} · {human(source.source_type)}</p>
        <small>{source.provenance}</small>
        <a className="locator" href={source.locator} target="_blank" rel="noreferrer">OPEN SOURCE LOCATOR ↗</a>
        <RecordDetails label="SOURCE" record={recordObject(source)} />
      </article>)}</div>
    </section>

    <section className="dossier-grid">
      <div className="panel"><span className="section-label">WHERE</span>{bundle.places.map((place) => <article className="compact-record" key={place.id}>
        <h3>{place.name}</h3><p>{place.region} · {place.country} · {human(place.place_type)}</p><small>{place.summary}</small>
        {place.coordinates ? <small>COORDINATES · {place.coordinates.lat}, {place.coordinates.lon} · {human(place.coordinates.precision)}</small> : <small>COORDINATES · NOT ASSERTED</small>}
        <a href={recordUrl("places",place.id)} target="_blank" rel="noreferrer">{place.id} ↗</a>
        <RecordDetails label="PLACE" record={recordObject(place)} />
      </article>)}</div>
      <div className="panel"><span className="section-label">MATERIAL RECORD</span>{bundle.artifacts.length ? bundle.artifacts.map((artifact) => <article className="compact-record" key={artifact.id}>
        <h3>{artifact.title}</h3><p>{human(artifact.artifact_type)} · {artifact.date.label??"undated"}</p><small>{artifact.summary}</small>
        <a href={recordUrl("artifacts",artifact.id)} target="_blank" rel="noreferrer">{artifact.id} ↗</a>
        <RecordDetails label="ARTIFACT" record={recordObject(artifact)} />
      </article>) : <p>No canonical artifact reference asserted for this event.</p>}</div>
    </section>

    <section className="dossier-grid">
      <div className="panel uncertainty"><span className="section-label">UNCERTAINTY IS DATA</span><ol>{event.uncertainty.map((item,index) => <li key={item}><b>{String(index+1).padStart(2,"0")}</b><span>{item}</span></li>)}</ol></div>
      <div className="panel"><span className="section-label">ALTERNATIVE INTERPRETATIONS</span><ol>{event.alternative_interpretations.map((item,index) => <li key={item}><b>{String(index+1).padStart(2,"0")}</b><span>{item}</span></li>)}</ol></div>
    </section>

    <section className="panel">
      <div className="section-head"><span className="section-label">RELATIONSHIPS / CROSS-DOMAIN</span><strong>{bundle.relationships.length}</strong></div>
      {bundle.relationships.length ? <div className="relationship-list">{bundle.relationships.map((relationship) => <article key={relationship.id}>
        <div><Badge variant={semanticStatusVariant(relationship.status)}>{human(relationship.status)}</Badge><strong>{pct(relationship.confidence)}</strong></div>
        <code>{relationship.subject_id} → {human(relationship.relation)} → {relationship.object_id}</code>
        <ConfidenceMeter value={relationship.confidence} label="Relationship confidence" detail="Qualified association; not causal origin by default." />
        {relationship.note ? <p>{relationship.note}</p> : null}
        <a href={recordUrl("relationships",relationship.id)} target="_blank" rel="noreferrer">{relationship.id} ↗</a>
        <RecordDetails label="RELATIONSHIP" record={recordObject(relationship)} />
      </article>)}</div> : <p>No cross-domain relationship asserted in the canonical graph.</p>}
    </section>

    {event.narrative_links.map((link) => <section className="narrative-panel" key={link.narrative_id}>
      <span className="section-label">NARRATIVE CONNECTION</span><h3>{link.narrative_id}</h3>
      <p><strong>CORRELATION ≠ ORIGIN.</strong> {human(link.relation)} · {pct(link.confidence)} · {human(link.status)}</p>
      <ConfidenceMeter value={link.confidence} label="Association confidence" detail={human(link.relation)} />
      <div className="narrative-grid">
        <div><span className="section-label">BASIS</span>{link.basis.map((item) => <small key={item}>{item}</small>)}</div>
        <div><span className="section-label">COUNTERPOINTS</span>{link.counterpoints.map((item) => <small key={item}>{item}</small>)}</div>
      </div>
      <RecordDetails label="NARRATIVE LINK" record={recordObject(link)} />
    </section>)}

    <section className="records-section">
      <div className="section-head"><span className="section-label">CANONICAL EVENT FIELD INSPECTOR</span><strong>NO HIDDEN EVENT FIELDS</strong></div>
      <RecordFieldGrid record={recordObject(event)} exclude={["title","summary"]} />
    </section>
  </article>
}

function VisualGrammar() {
  const assets = Object.entries(project.visual_assets)
  return <section id="visuals" className="visual-grammar-section">
    <header className="archive-heading">
      <div><p className="eyebrow">03 / ROCKSOUL VISUAL GRAMMAR</p><h2>ONE SOURCE.<br/>MANY READABLE VIEWS.</h2></div>
      <p>These canonical vector references come from the pinned Rocksoul asset registry. The dossier above uses live data-driven components; this gallery exposes the visual source grammar that those components inherit.</p>
    </header>
    <div className="visual-gallery">{assets.map(([key, asset]) => <figure key={key}>
      <MoonWitnessRegistryAssetImage pack={asset.pack} assetId={asset.asset_id} alt={human(asset.asset_id)} loading="lazy" decoding="async" />
      <figcaption><strong>{human(key)}</strong><span>{asset.pack} / {asset.asset_id}</span></figcaption>
    </figure>)}</div>
  </section>
}

export function App() {
  const initial = eventIdFromPath()
  const [query,setQuery] = useState("")
  const [type,setType] = useState("all")
  const [selectedId,setSelectedId] = useState(events.some((event) => event.id === initial) ? initial! : events[0].id)
  const types = useMemo(() => Array.from(new Set(events.map((event) => event.event_type))),[])
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return events.filter((event) => (type === "all" || event.event_type === type) && (!needle || eventSearchText(event).includes(needle)))
  },[query,type])
  const selected = events.find((event) => event.id === selectedId) ?? events[0]

  useEffect(() => {
    const onPop = () => {
      const id = eventIdFromPath()
      if (id && events.some((event) => event.id === id)) setSelectedId(id)
    }
    window.addEventListener("popstate",onPop)
    return () => window.removeEventListener("popstate",onPop)
  },[])

  useEffect(() => {
    const title = selected.title + " · LEGEND"
    const url = project.production_origin.replace(/\/$/,"") + eventPath(selected.id)
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute("content",selected.summary)
    document.querySelector('meta[property="og:title"]')?.setAttribute("content",title)
    document.querySelector('meta[property="og:description"]')?.setAttribute("content",selected.summary)
    document.querySelector('meta[property="og:url"]')?.setAttribute("content",url)
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement("link")
      canonical.rel = "canonical"
      document.head.appendChild(canonical)
    }
    canonical.href = url
  },[selected])

  useEffect(() => {
    if (filtered.length && !filtered.some((event) => event.id === selectedId)) {
      const next = filtered[0]
      setSelectedId(next.id)
      window.history.replaceState({event:next.id},"",eventPath(next.id))
    }
  },[filtered,selectedId])

  const select = (id:string) => {
    setSelectedId(id)
    window.history.pushState({event:id},"",eventPath(id))
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    requestAnimationFrame(() => document.getElementById("dossier")?.scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"}))
  }

  return <div className="legend-app">
    <a className="skip-link" href="#events">Skip to event archive</a>
    <Header />
    <ObservatorySectionNav items={project.ui.navigation} label={project.ui.product_name + " /"} offset={120} />
    <main>
      <Hero />
      <CorpusOverview />
      <section id="events" className="archive-section">
        <header className="archive-heading"><div><p className="eyebrow">01 / CANONICAL EVENT ARCHIVE</p><h2>TRACE THE EVENT.<br/>NOT THE VIBE.</h2></div><p>Search across event metadata, claims, evidence summaries, sources, places, artifacts, uncertainty, alternatives, and relationships. Every dossier keeps provenance inspectable.</p></header>
        <div className="archive-controls">
          <label><span className="sr-only">Search the LEGEND corpus</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events, claims, evidence, sources…" /></label>
          <div className="type-filters" aria-label="Filter by event type"><button aria-pressed={type==="all"} className={type==="all"?"active":""} onClick={() => setType("all")}>ALL</button>{types.map((eventType) => <button key={eventType} aria-pressed={type===eventType} className={type===eventType?"active":""} onClick={() => setType(eventType)}>{typeLabel(eventType)}</button>)}</div>
          {(query||type!=="all") ? <Button variant="secondary" size="sm" onClick={() => {setQuery("");setType("all")}}>RESET</Button> : null}
        </div>
        <div className="archive-workbench">
          <aside className="event-index" aria-label="Canonical events"><div className="index-head"><span>CANONICAL RECORDS</span><strong>{filtered.length}</strong></div>{filtered.map((event) => <EventButton key={event.id} event={event} active={event.id===selectedId} onSelect={() => select(event.id)} />)}{!filtered.length ? <p className="empty-state">No match. Try another event, claim, evidence phrase, source, uncertainty, relationship, or event type.</p> : null}</aside>
          <div className="dossier-stage"><Dossier event={selected}/></div>
        </div>
      </section>

      <section id="method" className="split-section">
        <div><p className="eyebrow">02 / METHOD</p><h2>EVIDENCE BEFORE<br/>INTERPRETATION.</h2><p>LEGEND owns EVENT semantics. Sources attest. Evidence supports, contextualizes, contradicts, or leaves uncertainty unresolved. Later narrative connections never overwrite the event record.</p><div className="rule-box">{project.ui.method_chain.join(" → ")}</div></div>
        <div className="asset-stack"><MoonWitnessRegistryAssetImage pack={project.visual_assets.method_timeline.pack} assetId={project.visual_assets.method_timeline.asset_id} alt="Evidence timeline" loading="lazy" decoding="async"/><MoonWitnessRegistryAssetImage pack={project.visual_assets.method_matrix.pack} assetId={project.visual_assets.method_matrix.asset_id} alt="Evidence matrix" loading="lazy" decoding="async"/></div>
      </section>

      <VisualGrammar />

      <section id="trail" className="split-section trail">
        <div className="asset-stack"><MoonWitnessRegistryAssetImage pack={project.visual_assets.cross_domain.pack} assetId={project.visual_assets.cross_domain.asset_id} alt="Qualified cross-domain relationship reference" loading="lazy" decoding="async"/></div>
        <div><p className="eyebrow">04 / EVENT INTELLIGENCE GRAPH</p><h2>THE TRAIL SHOULD<br/>STAY INSPECTABLE.</h2><p>Strong event evidence does not erase uncertainty around motive, identity, chronology, or narrative origin.</p><div className="principles">{project.ui.principles.map((item) => <span key={item}>{item}</span>)}</div></div>
      </section>
    </main>
    <footer className="legend-footer"><div><MoonWitnessMark/><strong>MOONWITNESS / {project.ui.product_name}</strong></div><p>{project.ui.footer.statement}</p><span>{project.ui.footer.boundary}</span></footer>
  </div>
}
