import { moonWitnessAssets, type EventTopologyEdge, type EventTopologyNode, type MoonWitnessAssetRegistryPackId } from "@rocksoul/ui"
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

function registryPackId(value: string): MoonWitnessAssetRegistryPackId {
  if (!(value in moonWitnessAssets.packs)) throw new Error(`Unknown MoonWitness registry asset pack: ${value}`)
  return value as MoonWitnessAssetRegistryPackId
}

function registryAsset<T extends { pack: string; asset_id: string }>(asset: T) {
  return { ...asset, pack: registryPackId(asset.pack) }
}

export const project = {
  ...projectConfig,
  visual_assets: {
    hero: registryAsset(projectConfig.visual_assets.hero),
    method_timeline: registryAsset(projectConfig.visual_assets.method_timeline),
    method_matrix: registryAsset(projectConfig.visual_assets.method_matrix),
    event_topology: registryAsset(projectConfig.visual_assets.event_topology),
    historicity_band: registryAsset(projectConfig.visual_assets.historicity_band),
    place_material: registryAsset(projectConfig.visual_assets.place_material),
    cross_domain: registryAsset(projectConfig.visual_assets.cross_domain),
  },
}
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

function topologyKindForReference(id: string): EventTopologyNode["kind"] {
  if (id.startsWith("PER-")) return "person"
  if (id.startsWith("MYTH-") || id.startsWith("CAND-") || id.startsWith("STORY-")) return "story"
  if (id.startsWith("TXT-") || id.startsWith("RGBL-")) return "text"
  if (id.startsWith("LAW-") || id.startsWith("AWS-")) return "law"
  if (id.startsWith("PERS-") || id.startsWith("JIZZ-")) return "perspective"
  if (id.startsWith("ART-")) return "artifact"
  return "relationship"
}

export function getEventTopology(event: EventRecord) {
  const bundle = getEventBundle(event)
  const nodes = new Map<string, EventTopologyNode>()
  const edges: EventTopologyEdge[] = []

  const addNode = (node: EventTopologyNode) => {
    if (!nodes.has(node.id)) nodes.set(node.id, node)
  }
  const addEdge = (edge: EventTopologyEdge) => {
    if (!edges.some((item) => item.id === edge.id)) edges.push(edge)
  }

  addNode({
    id: event.id,
    kind: "event",
    label: event.title,
    detail: formatEventWindow(event),
    status: event.historicity.status,
    confidence: event.historicity.confidence,
  })

  bundle.places.forEach((place) => {
    addNode({ id: place.id, kind: "place", label: place.name, detail: place.region })
    addEdge({ id: `${event.id}:place:${place.id}`, from: event.id, to: place.id, label: "located_at" })
    place.source_refs.forEach((sourceId) => addEdge({
      id: `${place.id}:source:${sourceId}`,
      from: place.id,
      to: sourceId,
      label: "attested_by",
    }))
  })

  bundle.artifacts.forEach((artifact) => {
    addNode({ id: artifact.id, kind: "artifact", label: artifact.title, detail: artifact.artifact_type })
    addEdge({ id: `${event.id}:artifact:${artifact.id}`, from: event.id, to: artifact.id, label: "material_context" })
    artifact.source_refs.forEach((sourceId) => addEdge({
      id: `${artifact.id}:source:${sourceId}`,
      from: artifact.id,
      to: sourceId,
      label: "attested_by",
    }))
  })

  bundle.claims.forEach((claim) => {
    addNode({ id: claim.id, kind: "claim", label: claim.statement, detail: claim.claim_type, status: claim.epistemic_status })
    addEdge({ id: `${event.id}:claim:${claim.id}`, from: event.id, to: claim.id, label: "asserts", status: claim.epistemic_status })
    claim.source_refs.forEach((sourceId) => addEdge({
      id: `${claim.id}:source:${sourceId}`,
      from: claim.id,
      to: sourceId,
      label: "cites",
    }))
  })

  bundle.evidence.forEach((edge) => {
    addNode({
      id: edge.id,
      kind: "evidence",
      label: edge.summary,
      detail: edge.evidence_type,
      status: edge.relation,
      confidence: edge.confidence,
    })
    addEdge({
      id: `${edge.claim_id}:evidence:${edge.id}`,
      from: edge.claim_id,
      to: edge.id,
      label: edge.relation,
      status: edge.relation,
      confidence: edge.confidence,
    })
    edge.source_refs.forEach((sourceId) => addEdge({
      id: `${edge.id}:source:${sourceId}`,
      from: edge.id,
      to: sourceId,
      label: "sourced_from",
    }))
  })

  bundle.sources.forEach((source) => addNode({
    id: source.id,
    kind: "source",
    label: source.title,
    detail: source.quality,
    external: true,
  }))
  event.source_refs.forEach((sourceId) => addEdge({
    id: `${event.id}:direct-source:${sourceId}`,
    from: event.id,
    to: sourceId,
    label: "event_source",
  }))

  event.uncertainty.forEach((item, index) => {
    const id = `${event.id}:uncertainty:${index + 1}`
    addNode({ id, kind: "uncertainty", label: item, status: "unresolved" })
    addEdge({ id: `${event.id}:uncertainty-edge:${index + 1}`, from: event.id, to: id, label: "unresolved_uncertainty", status: "unresolved" })
  })

  event.alternative_interpretations.forEach((item, index) => {
    const id = `${event.id}:alternative:${index + 1}`
    addNode({ id, kind: "alternative", label: item, status: "unresolved" })
    addEdge({ id: `${event.id}:alternative-edge:${index + 1}`, from: event.id, to: id, label: "alternative_interpretation", status: "unresolved" })
  })

  bundle.relationships.forEach((relationship) => {
    const endpointIds = [relationship.subject_id, relationship.object_id]
    endpointIds.forEach((id) => {
      if (!nodes.has(id)) addNode({
        id,
        kind: topologyKindForReference(id),
        label: id,
        detail: relationship.note ?? undefined,
        status: relationship.status,
        confidence: relationship.confidence,
        external: id !== event.id && !event.artifact_refs.includes(id),
      })
    })
    addNode({
      id: relationship.id,
      kind: "relationship",
      label: relationship.relation.replaceAll("_", " "),
      detail: relationship.note ?? undefined,
      status: relationship.status,
      confidence: relationship.confidence,
    })
    addEdge({
      id: `${relationship.id}:subject`,
      from: relationship.subject_id,
      to: relationship.id,
      label: "relationship",
      status: relationship.status,
      confidence: relationship.confidence,
    })
    addEdge({
      id: `${relationship.id}:object`,
      from: relationship.id,
      to: relationship.object_id,
      label: relationship.relation,
      status: relationship.status,
      confidence: relationship.confidence,
    })
    relationship.source_refs.forEach((sourceId) => addEdge({
      id: `${relationship.id}:source:${sourceId}`,
      from: relationship.id,
      to: sourceId,
      label: "sourced_from",
    }))
  })

  event.narrative_links.forEach((link) => {
    if (!nodes.has(link.narrative_id)) addNode({
      id: link.narrative_id,
      kind: "story",
      label: link.narrative_id,
      detail: link.basis.join(" · "),
      status: link.status,
      confidence: link.confidence,
      external: true,
    })
    addEdge({
      id: `${event.id}:narrative:${link.narrative_id}`,
      from: event.id,
      to: link.narrative_id,
      label: link.relation,
      status: link.status,
      confidence: link.confidence,
    })
    link.source_refs.forEach((sourceId) => addEdge({
      id: `${link.narrative_id}:source:${sourceId}`,
      from: link.narrative_id,
      to: sourceId,
      label: "sourced_from",
    }))
  })

  return { nodes: Array.from(nodes.values()), edges }
}

export function corpusEventTypeCounts() {
  return Array.from(new Set(events.map((event) => event.event_type)))
    .map((eventType) => ({
      id: eventType,
      label: eventTypeLabel[eventType] ?? eventType.replaceAll("_", " "),
      count: events.filter((event) => event.event_type === eventType).length,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

export function corpusConfidenceRange() {
  const values = events.map((event) => event.historicity.confidence)
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    average: values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length),
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
