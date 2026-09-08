# Branching Contract

This repository uses exactly one canonical remote branch:

```text
main  ← stable / development / maintenance / release
```

## Rules

- All implementation, research data, schemas, docs, CI, maintenance, and release-ready work lands on `main`.
- Do not maintain a persistent `dev` branch.
- Do not create persistent remote `feature/*`, `fix/*`, `hotfix/*`, `release/*`, `chore/*`, `experiment/*`, `agent/*`, or `phase*` branches.
- Temporary local branches are allowed, but they must not become canonical remote branches.
- Pull requests, when used, target `main`.
- Release automation may create tags/releases, never additional branches.
- The single validation workflow enforces the main-only remote-branch invariant after successful pushes to `main`.

If an older document describes another branching model, this file wins.
