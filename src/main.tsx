import { StrictMode, useEffect, useMemo, useState } from "react"
import { createRoot } from "react-dom/client"
import { Badge, Button, MoonWitnessMark, TimelineEntry } from "@rocksoul/ui"
import "@rocksoul/ui/styles.css"
import "./styles.css"
import {
  claimRecordUrl,
  counts,
  eventTypeLabel,
  events,
  evidenceRecordUrl,
  formatEventWindow,
  sourceRecordUrl,
  type EventRecord,
} from "./events"

const ASSET_BASE = "https://raw.githubusercontent.com/bjo163/rocksoul-assets/main/moonwitness"
const asset = (path: string) => ASSET_BASE + "/" + path

const evidenceDesk = asset("cinematic-hero-pack/svg/evidence-desk.svg")
const evidenceMatrix = asset("data-viz/charts/evidence-matrix.svg")
const graphNodes = asset("data-viz/charts/graph-nodes.svg")
const evidenceTimeline = asset("graph-pack/svg/evidence-timeline.svg")

function typeLabel(type: string) {
  return eventTypeLabel[type] ?? type.replaceAll("_", " ")
}

function confidenceLabel(value: number) {
  return String(Math.round(value * 100)) + "%"
}

function Header({
  theme,
  onToggleTheme,
}: {
  theme: "dark" | "light"
  onToggleTheme: () => void
}) {
  return (
    <header className="legend-header">
      <a className="legend-brand" href="#top" aria-label="LEGEND home">
        <MoonWitnessMark className="legend-mark" />
        <span>
          <strong>LEGEND</strong>
          <small>MOONWITNESS / EVENT INTELLIGENCE</small>
        </span>
      </a>
      <nav className="legend-nav" aria-label="Legend navigation">
        <a href="#events">EVENTS</a>
        <a href="#method">METHOD</a>
        <a href="#trail">TRAIL</a>
      </nav>
      <div className="header-actions">
        <span className="corpus-live"><i aria-hidden="true" /> CORPUS LIVE</span>
        <Button variant="ghost" size="sm" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? "LIGHT" : "DARK"}
        </Button>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="legend-hero">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-copy">
        <p className="hero-kicker">LEGEND / CANONICAL EVENT ARCHIVE</p>
        <h1>
          REALITY
          <span>LEAVES RECEIPTS.</span>
        </h1>
        <p className="hero-lede">
          Trace the event. Inspect the source chain. Keep uncertainty visible.
          LEGEND reconstructs what happened without turning resemblance into causation
          or later interpretation into historical fact.
        </p>
        <div className="hero-actions">
          <a className="hero-cta" href="#events">ENTER EVENT ARCHIVE <span aria-hidden="true">→</span></a>
          <span>EVENT ≠ INTERPRETATION</span>
        </div>
      </div>

      <figure className="hero-visual">
        <img src={evidenceDesk} alt="MoonWitness evidence desk visual from rocksoul-assets" />
        <figcaption>
          <span>ROCKSOUL-ASSETS / EVIDENCE DESK</span>
          <strong>PROVENANCE FIRST</strong>
        </figcaption>
      </figure>

      <div className="hero-metrics" aria-label="LEGEND corpus metrics">
        <div><span>CANONICAL EVENTS</span><strong>{counts.canonical_events.toString().padStart(2, "0")}</strong></div>
        <div><span>SOURCES</span><strong>{counts.sources.toString().padStart(2, "0")}</strong></div>
        <div><span>EVIDENCE EDGES</span><strong>{counts.evidence_edges.toString().padStart(2, "0")}</strong></div>
        <div><span>EVENT TYPES</span><strong>{counts.event_types.toString().padStart(2, "0")}</strong></div>
      </div>
    </section>
  )
}

function EventListItem({
  event,
  active,
  onSelect,
}: {
  event: EventRecord
  active: boolean
  onSelect: () => void
}) {
  return (
    <button className={active ? "event-list-item active" : "event-list-item"} onClick={onSelect}>
      <span className="event-list-index">{event.id.split("-").slice(1, 3).join(" / ")}</span>
      <strong>{event.title}</strong>
      <small>{typeLabel(event.event_type)} · {formatEventWindow(event)}</small>
      <span className="event-list-confidence">{confidenceLabel(event.historicity.confidence)}</span>
    </button>
  )
}

function RecordLinks({
  title,
  items,
  hrefFor,
}: {
  title: string
  items: string[]
  hrefFor: (id: string) => string
}) {
  return (
    <section className="record-links">
      <div className="record-links-heading">
        <span>{title}</span>
        <strong>{items.length.toString().padStart(2, "0")}</strong>
      </div>
      {items.length ? (
        <div className="record-link-list">
          {items.map((id) => (
            <a key={id} href={hrefFor(id)} target="_blank" rel="noreferrer">
              <code>{id}</code>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      ) : (
        <p className="empty-copy">No local records linked in this canonical object.</p>
      )}
    </section>
  )
}

function Dossier({ event }: { event: EventRecord }) {
  const narrative = event.narrative_links[0]
  const confidence = Math.max(0, Math.min(1, event.historicity.confidence))

  return (
    <article className="event-dossier">
      <header className="dossier-header">
        <div>
          <p className="dossier-id">{event.id}</p>
          <h2>{event.title}</h2>
          <div className="dossier-badges">
            <Badge variant="supported">strongly supported</Badge>
            <Badge variant="neutral">{typeLabel(event.event_type)}</Badge>
            <Badge variant="verified">canonical</Badge>
          </div>
        </div>
        <div className="confidence-dial" aria-label={"Historicity confidence " + confidenceLabel(confidence)}>
          <div
            className="confidence-ring"
            style={{ background: "conic-gradient(var(--mw-brand-crimson) " + String(confidence * 360) + "deg, var(--mw-border-default) 0deg)" }}
          >
            <span>{confidenceLabel(confidence)}</span>
          </div>
          <small>HISTORICITY<br />CONFIDENCE</small>
        </div>
      </header>

      <p className="dossier-summary">{event.summary}</p>

      <div className="dossier-stat-grid">
        <div><span>TIME WINDOW</span><strong>{formatEventWindow(event)}</strong><small>{event.time.precision.replaceAll("_", " ")}</small></div>
        <div><span>SOURCES</span><strong>{event.source_refs.length.toString().padStart(2, "0")}</strong><small>local provenance refs</small></div>
        <div><span>EVIDENCE</span><strong>{event.evidence_refs.length.toString().padStart(2, "0")}</strong><small>support / counterevidence edges</small></div>
        <div><span>CLAIMS</span><strong>{event.claims.length.toString().padStart(2, "0")}</strong><small>inspectable propositions</small></div>
      </div>

      <section className="temporal-panel">
        <div className="section-label">TEMPORAL RECORD</div>
        <TimelineEntry
          timestamp={formatEventWindow(event)}
          title={event.title}
          description={event.time.note}
          source={event.review.reviewed_by}
          status={event.review.status}
          variant="event"
        />
      </section>

      <div className="truth-grid">
        <section className="truth-panel">
          <div className="section-label">WHAT IS SUPPORTED</div>
          <h3>The event claim stays narrower than the story around it.</h3>
          <p>{event.historicity.note}</p>
          <div className="review-note">
            <span>REVIEW NOTE</span>
            <p>{event.review.note}</p>
          </div>
        </section>

        <section className="truth-panel uncertainty">
          <div className="section-label">UNCERTAINTY IS DATA</div>
          <h3>What the record still cannot close.</h3>
          <ol>
            {event.uncertainty.map((item, index) => (
              <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>
            ))}
          </ol>
        </section>
      </div>

      <section className="alternative-panel">
        <div className="section-label">ALTERNATIVE INTERPRETATIONS</div>
        <div className="alternative-grid">
          {event.alternative_interpretations.map((item, index) => (
            <article key={item}>
              <span>ALT / {String(index + 1).padStart(2, "0")}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="record-grid">
        <RecordLinks title="SOURCE REFS" items={event.source_refs} hrefFor={sourceRecordUrl} />
        <RecordLinks title="EVIDENCE REFS" items={event.evidence_refs} hrefFor={evidenceRecordUrl} />
        <RecordLinks title="CLAIM REFS" items={event.claims} hrefFor={claimRecordUrl} />
      </div>

      <section className={narrative ? "narrative-panel linked" : "narrative-panel"}>
        <div>
          <span className="section-label">NARRATIVE CONNECTION</span>
          <h3>{narrative ? narrative.narrative_id : "No canonical narrative link recorded."}</h3>
        </div>
        {narrative ? (
          <>
            <div className="narrative-meta">
              <Badge variant={narrative.status === "supported" ? "supported" : "partial"}>{narrative.status}</Badge>
              <strong>{confidenceLabel(narrative.confidence)}</strong>
              <span>{narrative.relation.replaceAll("_", " ")}</span>
            </div>
            <div className="narrative-warning">
              <strong>CORRELATION ≠ ORIGIN</strong>
              {narrative.counterpoints.map((item) => <p key={item}>{item}</p>)}
            </div>
          </>
        ) : (
          <p>The canonical event object makes no origin claim. Absence of a narrative link is kept explicit rather than inferred.</p>
        )}
      </section>
    </article>
  )
}

function EventArchive() {
  const [query, setQuery] = useState("")
  const [type, setType] = useState("all")
  const [selectedId, setSelectedId] = useState(events[0].id)

  const availableTypes = useMemo(
    () => Array.from(new Set(events.map((event) => event.event_type))),
    [],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return events.filter((event) => {
      const typeMatch = type === "all" || event.event_type === type
      const textMatch =
        !needle ||
        event.title.toLowerCase().includes(needle) ||
        event.id.toLowerCase().includes(needle) ||
        event.aliases.some((alias) => alias.toLowerCase().includes(needle)) ||
        event.summary.toLowerCase().includes(needle)
      return typeMatch && textMatch
    })
  }, [query, type])

  useEffect(() => {
    if (!filtered.some((event) => event.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? "")
    }
  }, [filtered, selectedId])

  const selected = events.find((event) => event.id === selectedId) ?? null

  return (
    <section id="events" className="archive-section">
      <header className="archive-heading">
        <div>
          <p className="section-kicker">01 / CANONICAL EVENT ARCHIVE</p>
          <h2>TRACE THE EVENT.<br />NOT THE VIBE.</h2>
        </div>
        <p>
          Seven canonical event records. Search by name, alias, or evidence context.
          Every dossier keeps confidence, provenance, uncertainty, and alternatives visible.
        </p>
      </header>

      <div className="archive-controls" id="search">
        <label>
          <span className="sr-only">Search canonical events</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search canonical events, aliases, evidence…"
          />
        </label>
        <div className="type-filters" aria-label="Filter events by type">
          <button className={type === "all" ? "active" : ""} onClick={() => setType("all")}>ALL</button>
          {availableTypes.map((item) => (
            <button key={item} className={type === item ? "active" : ""} onClick={() => setType(item)}>
              {typeLabel(item)}
            </button>
          ))}
        </div>
        {(query || type !== "all") ? (
          <Button variant="secondary" size="sm" onClick={() => { setQuery(""); setType("all") }}>
            RESET
          </Button>
        ) : null}
      </div>

      <div className="archive-workbench">
        <aside className="event-index" aria-label="Canonical events">
          <div className="event-index-heading">
            <span>CANONICAL RECORDS</span>
            <strong>{filtered.length.toString().padStart(2, "0")}</strong>
          </div>
          {filtered.map((event) => (
            <EventListItem
              key={event.id}
              event={event}
              active={event.id === selectedId}
              onSelect={() => setSelectedId(event.id)}
            />
          ))}
          {!filtered.length ? (
            <div className="no-results">
              <strong>NO MATCH</strong>
              <p>Try a different event name, alias, or event type.</p>
            </div>
          ) : null}
        </aside>
        <main className="dossier-stage">
          {selected ? <Dossier event={selected} /> : (
            <div className="empty-dossier">NO CANONICAL EVENT SELECTED.</div>
          )}
        </main>
      </div>
    </section>
  )
}

function MethodSection() {
  return (
    <section id="method" className="method-section">
      <div className="method-copy">
        <p className="section-kicker">02 / METHOD</p>
        <h2>EVIDENCE BEFORE<br />INTERPRETATION.</h2>
        <p>
          LEGEND owns EVENT semantics. Sources attest. Evidence supports or weakens.
          Counterevidence stays in view. Alternative explanations stay available.
          A later narrative connection never overwrites the event record.
        </p>
        <div className="method-rule">
          <span>EVENT → SOURCE → EVIDENCE → COUNTEREVIDENCE → UNCERTAINTY</span>
          <strong>NO SOURCELESS LORE.</strong>
        </div>
      </div>
      <div className="method-visuals">
        <figure><img src={evidenceTimeline} alt="Evidence timeline asset from rocksoul-assets" /><figcaption>PROVENANCE / TIMELINE</figcaption></figure>
        <figure><img src={evidenceMatrix} alt="Evidence matrix asset from rocksoul-assets" /><figcaption>EVIDENCE / MATRIX</figcaption></figure>
      </div>
    </section>
  )
}

function TrailSection() {
  return (
    <section id="trail" className="trail-section">
      <figure className="trail-visual">
        <img src={graphNodes} alt="Graph node language from rocksoul-assets" />
      </figure>
      <div className="trail-copy">
        <p className="section-kicker">03 / EVENT INTELLIGENCE GRAPH</p>
        <h2>THE TRAIL SHOULD<br />STAY INSPECTABLE.</h2>
        <p>
          An event can be strongly supported while motive, sequence, identity, or narrative origin
          remains disputed. The interface preserves those boundaries instead of flattening them into one score.
        </p>
        <div className="trail-principles">
          <span>SIMILARITY ≠ TRANSMISSION</span>
          <span>LATER SOURCE ≠ CONTEMPORARY EVIDENCE</span>
          <span>TRADITION = EVIDENCE OF TRADITION</span>
          <span>UNCERTAINTY = DATA</span>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="legend-footer">
      <div className="footer-brand">
        <MoonWitnessMark className="footer-mark" />
        <div><strong>MOONWITNESS</strong><span>ROCKSOUL RESEARCH / LEGEND</span></div>
      </div>
      <p>Reality first. Interpretation second. Provenance always.</p>
      <div className="footer-meta"><span>TRACE THE EVENT.</span><span>WHERE REALITY BECOMES STORY.</span></div>
    </footer>
  )
}

function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = window.localStorage.getItem("rocksoul-legend-theme")
    return saved === "light" ? "light" : "dark"
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem("rocksoul-legend-theme", theme)
  }, [theme])

  return (
    <div className="legend-app">
      <Header theme={theme} onToggleTheme={() => setTheme((value) => value === "dark" ? "light" : "dark")} />
      <main>
        <Hero />
        <EventArchive />
        <MethodSection />
        <TrailSection />
      </main>
      <Footer />
    </div>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
