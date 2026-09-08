import bath from "../data/events/EVT-BATH-CURSE-TABLETS.json"
import guatavita from "../data/events/EVT-COL-GUATAVITA-OFFERINGS.json"
import halley from "../data/events/EVT-GBR-HALLEY-1066.json"
import krakatau from "../data/events/EVT-IDN-KRAKATAU-1883.json"
import jerusalem from "../data/events/EVT-JERUSALEM-SECOND-TEMPLE-DESTRUCTION-70.json"
import lindow from "../data/events/EVT-LINDOW-MAN-IRON-AGE.json"
import oseberg from "../data/events/EVT-OSEBERG-SHIP-BURIAL.json"
import corpusIndex from "../data/index.json"

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

export const events: EventRecord[] = [
  jerusalem,
  krakatau,
  halley,
  guatavita,
  oseberg,
  bath,
  lindow,
] as EventRecord[]

export const counts = corpusIndex.counts

export const eventTypeLabel: Record<string, string> = {
  astronomical_event: "Astronomical",
  birth_death: "Birth / death",
  natural_disaster: "Natural disaster",
  ritual_event: "Ritual event",
  war_conflict: "War / conflict",
}

export function formatEventWindow(event: EventRecord) {
  const { start, end, precision } = event.time
  if (!start && !end) return precision.replaceAll("_", " ")
  if (start === end || !end) return start ?? end ?? "Unbounded"
  return String(start) + " → " + String(end)
}

export function sourceRecordUrl(id: string) {
  return "https://github.com/bjo163/rocksoul-legend/blob/dev/data/sources/" + id + ".json"
}

export function evidenceRecordUrl(id: string) {
  return "https://github.com/bjo163/rocksoul-legend/blob/dev/data/evidence/" + id + ".json"
}

export function claimRecordUrl(id: string) {
  return "https://github.com/bjo163/rocksoul-legend/blob/dev/data/claims/" + id + ".json"
}
