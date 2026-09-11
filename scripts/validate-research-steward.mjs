import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { countLifecycle, eventRpsV1, eventWipPressure, rankEventResearch } from "./research-policy.mjs";

const steward = fs.readFileSync(path.join(process.cwd(), "scripts/research-steward.mjs"), "utf8");

const ranked = rankEventResearch([
  { id: 2, state: "discovered", noveltyValue: 20 },
  { id: 1, state: "source_inspected", evidenceGain: 10 }
]);
assert.equal(ranked[0].id, 1, "source-inspected EVENT research must outrank routine discovery");

const pressure = eventWipPressure({ counts: countLifecycle(Array(16).fill("discovered")) });
assert.equal(pressure.suppressDiscovery, true, "hard WIP limit must suppress routine EVENT discovery");
assert.ok(
  eventRpsV1({ state: "source_inspected", evidenceGain: 10, pressure }) >
  eventRpsV1({ state: "discovered", noveltyValue: 20, discovery: true, pressure }),
  "RPS_V1 must favor progression under WIP pressure"
);

assert.match(steward, /Actual source content has been inspected/);
assert.match(steward, /Narrative evidence is not treated as EVENT truth/);
assert.match(steward, /EVENT ownership boundary is preserved/);
assert.match(steward, /ready_for_observation/);
assert.match(steward, /rocksoul\.research-signal-batch\.v1/);
assert.match(steward, /allegation, narrative, or LAW holdings as EVENT truth/i);
assert.doesNotMatch(steward, /data\/events/);
assert.doesNotMatch(steward, /writeFileSync/);

console.log("LEGEND Scheduler V2 research steward valid: progression-first, WIP-aware, occurrence guards preserved, no canonical EVENT writes.");
