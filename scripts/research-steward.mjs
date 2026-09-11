import { countLifecycle, eventWipPressure, rankEventResearch } from "./research-policy.mjs";

const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
if (!repo || !token) throw new Error("GITHUB_REPOSITORY and GITHUB_TOKEN are required");

const runTimestamp = new Date().toISOString();
const runId = `LEGEND-STEW-${runTimestamp.replace(/[^0-9]/g, "").slice(0, 14)}`;

function meta(body, key) {
  const matches = [...String(body).matchAll(new RegExp(`${key}:([^\\n]+)`, "g"))];
  return matches.at(-1)?.[1]?.trim() ?? null;
}

function checked(body, label) {
  return new RegExp(`- \\[x\\] ${label.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}`, "i").test(String(body));
}

async function jfetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: "application/json",
      "user-agent": "rocksoul-legend-steward/0.1",
      ...(options.headers ?? {})
    },
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
  return response.json();
}

function issueState(issue) {
  return meta(issue.body, "ROCKSOUL-RESEARCH-STATE") ?? "discovered";
}

function eventGate(issue) {
  const body = String(issue.body ?? "");
  return {
    sourceInspected: checked(body, "Actual source content has been inspected"),
    narrativeBoundary: checked(body, "Narrative evidence is not treated as EVENT truth"),
    ownershipBoundary: checked(body, "EVENT ownership boundary is preserved")
  };
}

async function patchIssue(issue, state, decision, score) {
  const marker = "## LEGEND Steward review";
  let body = String(issue.body ?? "").split(marker)[0].trim();
  body += [
    "", "", marker, "",
    `- **RPS_V1:** ${score}/100`,
    `- **Decision:** ${decision}`,
    `- **Reviewed at:** ${new Date().toISOString()}`,
    "",
    `ROCKSOUL-RESEARCH-STATE:${state}`,
    `LEGEND-RESEARCH-STATE:${decision}`
  ].join("\n");
  const [owner, name] = repo.split("/");
  await jfetch(`https://api.github.com/repos/${owner}/${name}/issues/${issue.number}`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28"
    },
    body: JSON.stringify({ body })
  });
}

function signal(issue, action, before, after, nextGate, evidence = []) {
  return {
    run_id: runId,
    timestamp: new Date().toISOString(),
    slot: "story-history-bootstrap:EVENT",
    action,
    domain: "EVENT",
    repository: "rocksoul-legend",
    headline: issue.title,
    why_it_matters: "Progress occurrence evidence and chronology without treating allegation, narrative, or LAW holdings as EVENT truth.",
    evidence_gain: action === "ADVANCED" ? 10 : 0,
    cross_domain_value: 0,
    novelty: 0,
    lifecycle_before: before,
    lifecycle_after: after,
    related_domains: [],
    relationship_handoff: null,
    next_gate: nextGate,
    evidence: [`issue:#${issue.number}`, ...evidence]
  };
}

const [owner, name] = repo.split("/");
const issues = await jfetch(`https://api.github.com/repos/${owner}/${name}/issues?state=open&per_page=100`, {
  headers: {
    authorization: `Bearer ${token}`,
    "x-github-api-version": "2022-11-28"
  }
});
const researchIssues = issues.filter((item) => !item.pull_request && /^\[(?:AUTO-)?RESEARCH\]/.test(item.title));
const counts = countLifecycle(researchIssues.map(issueState));
const pressure = eventWipPressure({ counts });
const ranked = rankEventResearch(researchIssues.map((issue) => {
  const state = issueState(issue);
  const gate = eventGate(issue);
  return {
    id: issue.number,
    state,
    evidenceGain: gate.sourceInspected ? 10 : 0,
    noveltyValue: state === "discovered" ? 5 : 0,
    issue,
    gate
  };
}), { pressure });

const signals = [];
let advanced = 0;
for (const item of ranked) {
  const { issue, state, gate } = item;
  if (state === "source_inspected" && gate.sourceInspected && gate.narrativeBoundary && gate.ownershipBoundary) {
    await patchIssue(issue, "ready_for_observation", "advance_ready_for_observation", item.rps);
    signals.push(signal(issue, "ADVANCED", state, "ready_for_observation", "EVENT_EXTRACTION_REVIEW", [
      "source_content_inspected",
      "narrative_not_event_truth",
      "event_ownership_preserved"
    ]));
    advanced += 1;
    continue;
  }
  if (state === "source_inspected") {
    signals.push(signal(issue, "BLOCKED", state, state, "EVENT_STEWARD_GUARDS", [
      `source_inspected:${gate.sourceInspected}`,
      `narrative_boundary:${gate.narrativeBoundary}`,
      `ownership_boundary:${gate.ownershipBoundary}`
    ]));
    continue;
  }
  if (state === "discovered" && pressure.suppressDiscovery) {
    signals.push(signal(issue, "NO_UPDATE", state, state, "PROGRESS_EXISTING_WIP", [`actionable:${pressure.actionable}`]));
    continue;
  }
  signals.push(signal(issue, "NO_UPDATE", state, state, state === "discovered" ? "SOURCE_TRIAGE" : "EVIDENCE_GATE_REVIEW"));
}

console.log(JSON.stringify({ schema_version: "rocksoul.research-signal-batch.v1", run_id: runId, signals }, null, 2));
console.log(`LEGEND steward: issues=${ranked.length} advanced=${advanced} actionable=${pressure.actionable} discovery_suppressed=${pressure.suppressDiscovery}`);
