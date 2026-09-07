# Data Model

## Ownership

```text
MFTL     → narrative
LEGEND   → event
SUPERHERO → person / actor / transmission
```

LEGEND owns **events**. Shared concepts are sources, claims, evidence, places, artifacts, and relationships.

## Event is not interpretation

Keep these questions separate:

1. Is an event attested?
2. What date/location can be defended?
3. How is the event interpreted?
4. Is a connection to a narrative only hypothetical?

Example:

```text
Destruction layer exists  → strongly_supported
Cause was earthquake      → probable
Inspired Narrative X      → unverified / hypothesis
```

## Historicity

`attested`, `strongly_supported`, `probable`, `plausible`, `disputed`,
`weakly_attested`, `unverified`, `contradicted`, `legendary_only`, `indeterminate`.

Confidence is confidence in the stated assessment, not a universal truth score.

## Time

Use explicit precision: `exact`, `date`, `year`, `year_range`, `century`,
`century_range`, `archaeological_phase`, `relative`, or `unknown`.

Do not collapse event time, source composition time, surviving manuscript time, discovery time, and modern interpretation time.

## Narrative correlation dimensions

Chronology, geography, environment, motif, textual continuity, cultural continuity,
actor continuity, artifact connection, transmission plausibility, and competing explanation.

No aggregate correlation score is required in v0.1.
