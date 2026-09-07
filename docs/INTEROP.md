# Rocksoul Research Interoperability

## Three-domain model

```text
MFTL      STORY      What was told?
LEGEND    EVENT      What happened?
PERSONA   PERSON     Who was involved?
```

## Identifier grammar

```text
EVT-*  event
SRC-*  source
CLM-*  claim
EVD-*  evidence
REL-*  relationship
PLC-*  place reference
ART-*  artifact reference
PER-*  person reference (reserved for PERSONA)
```

### Narrative IDs

The existing MFTL corpus already owns canonical IDs such as:

```text
MYTH-MES-INANA-DESCENT-000001
```

LEGEND therefore accepts **`MYTH-*` as the current MFTL narrative namespace**.
`NAR-*` is only reserved for a possible future generic narrative namespace.
LEGEND must not require MFTL to rename existing canonical records.

## Cross-repository rule

Do not copy the full foreign object. Store a stable reference plus an evidence-backed relationship.

```json
{
  "narrative_id": "MYTH-...",
  "relation": "possibly_correlates_with",
  "status": "hypothesis",
  "confidence": 0.62,
  "basis": ["chronological_match", "geographic_match"],
  "counterpoints": ["large transmission gap"]
}
```

## Ownership test

- **What was told?** → MFTL.
- **What happened?** → LEGEND.
- **Who acted, witnessed, recorded, translated, transmitted, or disputed it?** → PERSONA.
