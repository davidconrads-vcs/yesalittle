# Rules so far
# /refine-story — lessons from the first pipeline stories (YAL, Oct 2026)

## Context the skill must assume
- The dev agent only sees the issue text. Nothing from the refinement session carries over; the issue is the complete handoff.
- Dev agent tools: Read, Write, Edit, Glob, Grep, mkdir, git, `npm ci`, `npm test`, `npm run build`, `gh issue view/comment`, `gh pr create`, `gh pr merge --auto`. No node/npx/tsx, no dev server, no browser.
- Reviewer (Opus) blocks only on: unmet acceptance criterion, spec contradiction, out-of-scope change, likely bug, new logic without tests, security. It reads the spec literally.
- Turn cap 300 and 60-min timeout. The cap appears to be checked after the run (a 213-turn run finished but was marked failed); the timeout is the real hard stop.

## Spec-writing rules
1. **Gates, not reports.** "Report before editing" goes nowhere unattended. Write Part 0 as: "Verify X, Y, Z. If any fails, comment on the issue with what you found and stop without opening a PR."
2. **Only spec checks the agent can do.** Every verification step must be doable with Grep/Read or `npm run build`. Anything needing a script, dev server, or browser is a human check. This includes Part 0 gates. Gate on what Grep can confirm directly (each listed ID exists, a key is absent), not on computed counts or conditions across several fields. #39's first run stopped on a count gate it couldn't compute.
3. **Split verification explicitly.** "Agent verification: npm run build." Then "Human verification on the Vercel preview (NOT for the agent; do not attempt, do not flag needs-human)."
4. **Out of scope must not contradict scope.** Phrase it as "Any change outside A, B, C," listing every file the spec edits. A literal reviewer will block on "any code change outside types.ts" if the spec also edits prompts.json.
5. **Exact text for anything user-facing.** Put final copy and translations in the spec (written by Opus in refinement); the agent transcribes and the reviewer checks verbatim. Translation quality is a human or native-speaker check, never the reviewer's.
6. **Precision beats intent.** Name the element ("text of the `<title>` element", not "content value"), the exact glob (`HANDOFF-*.md`), the dash character, the destination folder. Wrap code, tags, and globs in backticks; GitHub markdown eats bare `<title>` and `*`. An "e.g." file list is open-ended. If a change applies everywhere, say "every occurrence of X (find with Grep)"; otherwise list every file.
7. **Size check.** ~95 JSON edits took 213 turns. If a story needs dozens of repetitive edits, split it or expect a cap overrun. Prefer splitting along "groundwork (no user-facing change)" vs "activation."
8. **Never ship a half feature.** Groundwork stories keep the feature unreachable (e.g. don't add the locale to SUPPORTED_NATIVES); the activation story turns it on.
9. **Dependencies are gates.** The follow-up story's Part 0 verifies the prerequisite is merged by checking for concrete artifacts (function exists, key exists).
10. **Type-system traps.** Before speccing a partial addition (keys for a value not yet in a union), check how the types are derived; tell the agent which type to widen, or to stop and ask.
11. **Boundaries in capitals.** External services and assets (e.g. ElevenLabs/audio): "CRITICAL: do not call X, run Y, or add/delete/rename Z."
12. **No workaround permissions.** Don't tell the agent to write and run a throwaway script. Allowlisting the script's command is equivalent to `node:*`, since the agent writes the file. Hand-edit with Edit, or do it locally. State the allowed method positively in the spec: "Make these edits by hand with Edit; do not write or run scripts." Removing a script instruction is not enough. In #39 the agent still tried `node`, then stopped rather than hand-edit without permission.
13. **Excluded items get a home.** Log anything deliberately skipped (e.g. language-specific prompts) to a notes file, as part of the story.

## Process
- Refine in Claude Code plan mode (codebase context, no edits). Present the final issue as the plan; on approval: "file the issue only, don't implement, no labels."
- Read the issue on GitHub, then apply `status:ready-for-dev` yourself.
- Set `AUTO_MERGE=false` for user-facing or visual stories; merge after the human preview checks.
- Label one story at a time (the concurrency group holds only one pending run).
- After each story, add an entry to `docs/refine-story-notes.md`: questions asked, code looked up, out-of-scope added, outcome, what the spec should have said, num_turns.
- To verify issue text, GitHub's web pages can be cached; the API (`/repos/{owner}/{repo}/issues/N`) shows the live body.

## Skill shape (draft)
1. Interview: what and why, user-facing or not, audience.
2. Inspect code: files, call sites, types, counts to gate on.
3. Size check: estimate edits; split if large.
4. Draft in the Story template: Summary, Acceptance criteria, Spec (Part 0 gate, parts, verification split), Out of scope.
5. Self-check against rules 1–13.
6. Present as plan; on approval file via `gh issue create`, no labels.

# Refine-story notes

One entry per story, added right after it merges or gets stuck.

## #NN – Story title
- **Questions I had to answer:**
- **What CC looked up in the code:**
- **Out of scope I added:**
- **Outcome:** merged clean / review blocked / needs-human
- **What the spec should have said:**
- **Template tweaks:**
- **num_turns:**

## #38 – ZH→EN groundwork: native gate, Chinese UI strings, CJK fonts (no user-facing change)
- **Questions I had to answer:** Refined together with #39. Simplified or Traditional → `zh-CN`. Content scope → reuse the 87 EN targets, no China-specific prompts. Who translates → Opus drafts, a human reviews. Support line → full Chinese translation. In review, I also asked for: Part 0 as a gate, verification split into agent and human checks, a split into groundwork and activation stories, and a check of whether types derived from `SUPPORTED_NATIVES` would break `tsc` (they don't; all are `Record<string, …>`).
- **What CC looked up in the code:** the pair model in `types.ts`; `PLURAL_RULES`; the EN/ES string tables; in `App.tsx`, the `buildScenarios` filter, the `ENTRY` deep-link callback and `<html lang>`; drillable counts (es 108 / pt 75 / en 87); `context[native]` coverage for every live pair; the DM Sans font stacks; how the native/target arrays are typed.
- **Out of scope I added:** keep zh-CN out of `SUPPORTED_NATIVES`/`NATIVE_META`/`TARGETS_BY_NATIVE`; no edits to `prompts.json` or CONTENT-NOTES (those belong to #39).
- **Outcome:** merged clean. PR #40, one run, review PASS, auto-merged.
- **What the spec should have said:** Part 0 gates 1–2 relied on computed counts and a check across fields, which Grep can't confirm. They passed here, but the same kind of gate stopped #39. The font step should have said "every `'DM Sans'` stack (find with Grep)" instead of "e.g. Practice.tsx"; the agent changed 5 more files (Home, Progress, SpeakButton, Summary, index.css), which matched the intent.
- **Template tweaks:** none.
- **num_turns:** 49

## #39 – Activate ZH→EN pair: Chinese content for 83 English prompts + zh-CN native
- **Questions I had to answer:** Same refinement as #38. In review: drop the merge script (the agent has no `node`); change the groc-025 gloss from 225 to 227 克 (half a pound is 226.8 g); fix the out-of-scope wording.
- **What CC looked up in the code:** the 87 en-US targets and their text; the 4 that mention Spanish or Spain (panic-008, greet-038, greet-040, tickets-013); the existing es-ES gloss on groc-025; where `nativePhrase`/`nativeResponse`/`gloss` render; scenario prompts, which have a response only.
- **Out of scope I added:** the first line rewritten to "Any change outside `src/types.ts`, `src/data/prompts.json`, and `CONTENT-NOTES.md`"; no audio; no China-specific prompts (logged to CONTENT-NOTES). "No change to existing text" leaves the es-ES groc-025 gloss at "unos 225 gramos". A follow-up story could fix it.
- **Outcome:** needs-human on run 1, then merged clean. Run 1 stopped at gate 0.2 (it needed `node`) and would not hand-edit without being told it could. After gate 0.2 became a Grep check of each ID with "do not write or run scripts", run 2 opened PR #41 and got review PASS. The run was marked failed after finishing; it was merged manually after the preview checks.
- **What the spec should have said:** Gate on existence that Grep can confirm, not counts. Say "hand-edit with Edit; do not write or run scripts" positively; removing the script paragraph left the agent with no approved method.
- **Template tweaks:** add `num_turns` to the entry stub.
- **num_turns:** 13 (run 1, stopped at gate) + 213 (run 2)
