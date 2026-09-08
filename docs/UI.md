# LEGEND Public UI Contract

## Role

The website is a read-only **Event Observatory** for canonical LEGEND records. Repository JSON remains authoritative.

## Canonical dependency chain

```text
rocksoul-assets (visual truth, v1.3.1)
        ↓ pinned registry
@rocksoul/ui (implementation grammar)
        ↓ composition
rocksoul-legend (EVENT-specific projection)
```

LEGEND must not hand-build reusable MoonWitness primitives that already exist in `@rocksoul/ui`, and it must not fetch mutable `rocksoul-assets/main` URLs at runtime.

Current canonical UI primitives include:

- `DossierHeader`
- `EvidenceMatrix`
- `EventTopologyGraph`
- `HistoricityBand`
- `ConfidenceMeter`
- `RecordFieldGrid`
- `ProvenanceRail`
- `ObservatorySectionNav`
- `ThemeToggle`
- `MoonWitnessRegistryAssetImage`

## Dossier projection

Each event page exposes:

1. event identity, time, type, historicity, and scoped confidence;
2. atomic claims and epistemic status;
3. evidence/counterevidence relation, type, confidence, and limitations;
4. source title, creator, date, quality, provenance, and external locator;
5. place and artifact records;
6. local and foreign relationships;
7. uncertainty and alternative interpretations;
8. narrative links with their basis, counterpoints, confidence, and correlation/origin boundaries;
9. a live topology containing every canonical claim, evidence record, source reference, place, artifact, uncertainty, alternative interpretation, and relevant relationship;
10. a canonical field inspector so no EVENT field is silently dropped by presentation.

Search uses the same canonical graph projection rather than only event titles.

## Routing and SEO

Canonical public route:

```text
/events/EVT-*
```

The production build generates a static HTML entry for every canonical event with event-specific title, description, canonical URL, Open Graph/Twitter metadata, `sitemap.xml`, and `robots.txt`. The canonical origin is resolved from `data/project.json`; it is not duplicated in build code. React then hydrates the same route, updates client-side share metadata during navigation, and keeps History API state shareable.

## Accessibility

The consumer contract requires:

- visible keyboard focus;
- a skip link;
- minimum 44px interactive touch targets;
- semantic `aria-pressed` state for event/filter selection;
- reduced-motion support;
- graph text equivalents;
- semantic confidence meters and historicity progress;
- reduced-motion-aware dossier navigation;
- status text in addition to color;
- automated axe checks on root and representative event permalink.

## Build and deployment

`npm run build` performs schema validation, index generation, UI contract audit, TypeScript checking, Vite build, and event-page generation.

GitHub Actions additionally runs browser smoke and axe. Vercel uses Node 22 and npm 11.6.0 to match CI.

Production: https://rocksoul-legend.vercel.app
