<div align="center">

# LEGEND

## WHERE REALITY BECOMES STORY

### **TRACE THE EVENT.**

A provenance-first **Historical & Event Intelligence** repository for tracing real-world events, material evidence, documentary attestation, uncertainty, and their possible relationship to later narratives.

**ROCKSOUL RESEARCH · STORY × EVENT × PERSON**

</div>

---

> **LEGEND starts with evidence of an event—not with the assumption that a story is historically true.**

## Core question

```text
WHAT happened?
WHEN?
WHERE?
WHAT evidence survives?
WHAT sources attest it?
HOW certain are we?
WHAT alternative explanations exist?
IS there a defensible connection to a later narrative?
```

## Golden rule

### **CORRELATION ≠ ORIGIN**

A historical event plus a similar narrative does not prove that the event caused the narrative.

```text
EVENT
  ↓
SOURCE + EVIDENCE
  ↓
HISTORICITY
  ↓
UNCERTAINTY
  ↓
POSSIBLE NARRATIVE CONNECTION
```

## Rocksoul Research ecosystem

| Repository | Domain | Question | Mantra |
|---|---|---|---|
| **rocksoul-mftl** | Narrative Intelligence | What was told? | TRACE THE STORY. |
| **rocksoul-legend** | Historical & Event Intelligence | What happened? | TRACE THE EVENT. |
| **rocksoul-superhero** | Actor & Transmission Intelligence | Who was involved? | TRACE THE PERSON. |

For now, **LEGEND owns EVENT**. MFTL owns narrative records. SUPERHERO owns person / actor / transmission records.

## Ownership rule

```text
What was told?          → MFTL
What happened?          → LEGEND
Who was involved?       → SUPERHERO
```

Shared primitives such as sources, claims, evidence, places, artifacts, and relationships remain interoperable concepts rather than separate repositories.

SUPERHERO now provides the human-agency side of the graph. For example, `PER-COL-JUAN-RODRIGUEZ-FREYLE` links the Guatavita event to a later colonial recorder/transmission chain without changing LEGEND's ownership of the event itself.

## v0.1 maturity

LEGEND is intentionally small, but the core EVENT model has now been tested across three different evidence patterns:

| Case | Event class | Evidence pattern | Result |
|---|---|---|---|
| **Guatavita** | ritual event | archaeology + artifact + colonial text | canonical, with explicit counterevidence |
| **Krakatau 1883** | natural disaster | geology + tsunami + modern institutional record | canonical |
| **Halley 1066** | astronomical event | astronomy + museum/documentary record | canonical |

The validator checks both **JSON shape** and **semantic graph references**. Missing local sources, claims, evidence, places, artifacts, or broken local relationship endpoints fail CI.

The first integration case was **Guatavita / El Dorado**, chosen because MFTL already had a related research lead and the case combines ritual tradition, documentary evidence, place, artifact, counterevidence, and later narrative development.

## First canonical event

### `EVT-COL-GUATAVITA-OFFERINGS`

**Pre-contact Muisca ritual offering activity at Lake Guatavita**

```text
LAKE GUATAVITA
      ↓
ARCHAEOLOGICAL SHRINE EVIDENCE
      ↓
SMALL-SCALE RITUAL OFFERINGS        strongly supported
      │
      ├── COLONIAL GRAND CEREMONY   disputed
      │         ↕
      │    textual support
      │    archaeological counterevidence
      │
      ├── PASCA MUISCA RAFT         contextual artifact
      │
      └── EL DORADO                 historically associated
                                    ≠ proven single origin
```

Current canonical graph:

```text
3 events
3 places
1 artifact
11 sources
15 claims
17 evidence edges
2 relationships
```

The most important result is not a yes/no verdict: **archaeology supports ritual offering activity, while the spectacular investiture narrative remains separately modeled as disputed.**

[Read the canonical event →](data/events/EVT-COL-GUATAVITA-OFFERINGS.json) ·
[Read interoperability →](docs/INTEROP.md)

## Generalization cases

### Krakatau 1883

`EVT-IDN-KRAKATAU-1883`

Tests **natural-science evidence** and separates direct tsunami effects from some remote water-level signals better explained through atmosphere–ocean coupling.

### Halley 1066

`EVT-GBR-HALLEY-1066`

Tests **astronomical + documentary evidence** and separates the observed comet apparition from later omen interpretation.

```text
RITUAL / MATERIAL        ✅
NATURAL SCIENCE          ✅
ASTRONOMICAL / DOCUMENT  ✅
SCHEMA VALIDATION        ✅
GRAPH VALIDATION         ✅
CI                       ✅
```

**LEGEND v0.1 is mature enough to stop expanding the foundation.**

## Research principles

**EVIDENCE BEFORE INTERPRETATION.**

**CORRELATION IS NOT CAUSATION.**

**SIMILARITY IS NOT TRANSMISSION.**

**LATER SOURCE IS NOT CONTEMPORARY EVIDENCE.**

**TRADITION IS EVIDENCE OF TRADITION, NOT AUTOMATIC EVIDENCE OF THE EVENT.**

**UNCERTAINTY IS DATA.**

See [docs/INDEX.md](docs/INDEX.md) after the foundation scaffold is installed.
