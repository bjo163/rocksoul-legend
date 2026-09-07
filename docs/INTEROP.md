# Rocksoul Research Interoperability

## Three-domain model

```text
MFTL      STORY      What was told?
LEGEND    EVENT      What happened?
SUPERHERO PERSON     Who was involved?
RGBL      TEXT       What does the source text say?
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
PER-*  person reference owned by SUPERHERO
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
- **Who acted, witnessed, recorded, translated, transmitted, interpreted, or disputed it?** → SUPERHERO.
- **What does the exact scripture/source passage say?** → RGBL.


## First live cross-repository link

LEGEND's first canonical event is:

`EVT-COL-GUATAVITA-OFFERINGS`

It links to the existing MFTL research candidate:

`CAND-COL-MUISCA-EL-DORADO-GUATAVITA-000001`

through:

`REL-COL-GUATAVITA-MFTL-CAND-000001`

The relation is `associated_with`, not `origin_of`. A canonical `MYTH-*` link remains a later milestone after the MFTL candidate itself is reviewed and promoted.


## SUPERHERO integration

The actor/transmission repository is now:

`bjo163/rocksoul-superhero`

Its first canonical person is:

`PER-COL-JUAN-RODRIGUEZ-FREYLE`

and it references this LEGEND event:

`EVT-COL-GUATAVITA-OFFERINGS`

without moving event ownership out of LEGEND.

## Qualified ecosystem notation

Existing LEGEND v0.1 data uses native unqualified IDs such as:

`EVT-COL-GUATAVITA-OFFERINGS`

For explicit cross-repository notation, the ecosystem may qualify the owner:

```text
mftl:MYTH-...
legend:EVT-...
superhero:PER-...
```

No migration of existing LEGEND IDs is required.

The existing relationship `REL-COL-GUATAVITA-MFTL-CAND-000001` intentionally preserves its v0.1 unqualified external target for backward compatibility. New documentation should prefer qualified notation when ambiguity is possible.

## Validation boundary

LEGEND validates local graph integrity and recognizes external namespaces, but does not remotely dereference every MFTL/SUPERHERO target during each CI run. Cross-repository existence is verified during research/audit so repository builds remain independent.


## RGBL integration

`bjo163/rocksoul-rgbl` is the scripture/text reference layer. LEGEND may use RGBL passages or scoped assertions as textual evidence/context, but RGBL does not decide whether a historical event occurred.

```text
RGBL passage / assertion
        ↓ textual evidence
LEGEND historical claim
        ↓
historicity assessment
```

A source text reporting an event is **textual attestation**, not automatic proof of the event.

Qualified external notation may use:

```text
rgbl:mw:work:...
rgbl:mw:passage:...
```

without renaming RGBL's native `mw:*` IDs.
