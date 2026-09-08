import corpusIndex from "../data/index.json"
import projectConfig from "../data/project.json"
import eventTaxonomy from "../taxonomy/event-types.json"

export interface EventTime {
  start: string | null
  end: string | null
  precision: string
  calendar: string | null
  note: string
}

export interface Historicity {
  status: string
  confidence: number
  note: string
}

export interface NarrativeLink {
  narrative_id: string
  relation: string
  status: string
  confidence: number
  basis: string[]
  counterpoints: string[]
  source_refs: string[]
}

export interface EventRecord {
  id: string
  title: string
  event_type: string
  aliases: string[]
  summary: string
  time: EventTime
  place_refs: string[]
  artifact_refs: string[]
  historicity: Historicity
  claims: string[]
  source_refs: string[]
  evidence_refs: string[]
  narrative_links: NarrativeLink[]
  uncertainty: string[]
  alternative_interpretations: string[]
  review: {
    status: string
    reviewed_by: string
    note: string
  }
}

export interface SourceRecord {
  id: string
  title: string
  source_type: string
  creator: string | null
  date: string | null
  language?: string | null
  locator: string
  provenance: string
  quality: string
  notes?: string[]
}

export interface ClaimRecord {
  id: string
  subject_id: string
  statement: string
  claim_type: string
  epistemic_status: string
  source_refs: string[]
  notes?: string[]
}

export interface EvidenceRecord {
  id: string
  claim_id: string
  relation: "supports" | "contradicts" | "contextualizes" | "alternative_explanation" | "unresolved_uncertainty"
  evidence_type: string
  summary: string
  source_refs: string[]
  confidence: number
  limitations?: string[]
}

export interface PlaceRecord {
  id: string
  name: string
  place_type: string
  country: string
  region: string
  historical_names?: string[]
  modern_names?: string[]
  coordinates: null | { lat: number; lon: number; precision: string }
  summary: string
  source_refs: string[]
  uncertainty: string[]
}

export interface ArtifactRecord {
  id: string
  title: string
  artifact_type: string
  culture: string | null
  date: { label: string | null; precision: string }
  discovery: { year: number | null; place_id: string | null; note: string }
  repository: string | null
  registration: string | null
  summary: string
  source_refs: string[]
  uncertainty: string[]
}

export interface RelationshipRecord {
  id: string
  subject_id: string
  relation: string
  object_id: string
  status: string
  confidence: number
  source_refs: string[]
  note?: string | null
}

function loadRecords<T extends { id: string }>(modules: Record<string, unknown>) {
  return Object.values(modules)
    .map((value) => value as T)
    .sort((a, b) => a.id.localeCompare(b.id))
}

const eventModules = import.meta.glob("../data/events/*.json", { eager: true, import: "default" })
const sourceModules = import.meta.glob("../data/sources/*.json", { eager: true, import: "default" })
const claimModules = import.meta.glob("../data/claims/*.json", { eager: true, import: "default" })
const evidenceModules = import.meta.glob("../data/evidence/*.json", { eager: true, import: "default" })
const placeModules = import.meta.glob("../data/places/*.json", { eager: true, import: "default" })
const artifactModules = import.meta.glob("../data/artifacts/*.json", { eager: true, import: "default" })
const relationshipModules = import.meta.glob("../data/relationships/*.json", { eager: true, import: "default" })

export const events = loadRecords<EventRecord>(eventModules)
export const sources = loadRecords<SourceRecord>(sourceModules)
export const claims = loadRecords<ClaimRecord>(claimModules)
export const evidence = loadRecords<EvidenceRecord>(evidenceModules)
export const places = loadRecords<PlaceRecord>(placeModules)
export const artifacts = loadRecords<ArtifactRecord>(artifactModules)
export const relationships = loadRecords<RelationshipRecord>(relationshipModules)

export const counts = corpusIndex.counts

export const sourceById = new Map(sources.map((item) => [item.id, item]))
export const claimById = new Map(claims.map((item) => [item.id, item]))
export const evidenceById = new Map(evidence.map((item) => [item.id, item]))
export const placeById = new Map(places.map((item) => [item.id, item]))
export const artifactById = new Map(artifacts.map((item) => [item.id, item]))

export const project = projectConfig
export const eventTypeLabel: Record<string, string> = Object.fromEntries(
  eventTaxonomy.types.map((item) => [item.id, item.label]),
)

export function formatEventWindow(event: EventRecord) {
  const { start, end, precision } = event.time
  if (!start && !end) return precision.replaceAll("_", " ")
  if (start === end || !end) return start ?? end ?? "Unbounded"
  return String(start) + " → " + String(end)
}

function defined<T>(item: T | undefined): item is T {
  return Boolean(item)
}

export function getEventBundle(event: EventRecord) {
  const eventClaims = event.claims.map((id) => claimById.get(id)).filter(defined)
  const eventEvidence = event.evidence_refs.map((id) => evidenceById.get(id)).filter(defined)
  const eventPlaces = event.place_refs.map((id) => placeById.get(id)).filter(defined)
  const eventArtifacts = event.artifact_refs.map((id) => artifactById.get(id)).filter(defined)

  const relevantRelationships = relationships.filter((item) =>
    item.subject_id === event.id ||
    item.object_id === event.id ||
    event.artifact_refs.includes(item.subject_id) ||
    event.artifact_refs.includes(item.object_id),
  )

  const sourceIds = new Set(event.source_refs)
  eventClaims.forEach((item) => item.source_refs.forEach((id) => sourceIds.add(id)))
  eventEvidence.forEach((item) => item.source_refs.forEach((id) => sourceIds.add(id)))
  eventPlaces.forEach((item) => item.source_refs.forEach((id) => sourceIds.add(id)))
  eventArtifacts.forEach((item) => item.source_refs.forEach((id) => sourceIds.add(id)))
  relevantRelationships.forEach((item) => item.source_refs.forEach((id) => sourceIds.add(id)))
  event.narrative_links.forEach((item) => item.source_refs.forEach((id) => sourceIds.add(id)))

  return {
    claims: eventClaims,
    evidence: eventEvidence,
    places: eventPlaces,
    artifacts: eventArtifacts,
    relationships: relevantRelationships,
    sources: Array.from(sourceIds).map((id) => sourceById.get(id)).filter(defined),
  }
}

export function eventSearchText(event: EventRecord) {
  const bundle = getEventBundle(event)
  return [
    event.id,
    event.title,
    event.summary,
    ...event.aliases,
    ...event.uncertainty,
    ...event.alternative_interpretations,
    ...bundle.claims.flatMap((item) => [item.id, item.statement, item.claim_type, item.epistemic_status]),
    ...bundle.evidence.flatMap((item) => [item.id, item.summary, item.evidence_type, item.relation, ...(item.limitations ?? [])]),
    ...bundle.sources.flatMap((item) => [item.id, item.title, item.creator ?? "", item.provenance, item.quality, item.source_type]),
    ...bundle.places.flatMap((item) => [item.id, item.name, item.country, item.region, item.summary]),
    ...bundle.artifacts.flatMap((item) => [item.id, item.title, item.summary, item.culture ?? ""]),
    ...bundle.relationships.flatMap((item) => [item.id, item.subject_id, item.relation, item.object_id, item.status, item.note ?? ""]),
  ].join(" ").toLowerCase()
}

export const LEGEND_REPO_REF = import.meta.env.VITE_LEGEND_GIT_REF || project.default_ref

export function recordUrl(kind: "sources" | "claims" | "evidence" | "places" | "artifacts" | "relationships" | "events", id: string) {
  return `https://github.com/${project.repository}/blob/${encodeURIComponent(LEGEND_REPO_REF)}/data/${kind}/${id}.json`
}
