---
title: 'Keeping constraints through compaction'
description: 'Follow a draft-only instruction through a shortened conversation. See why retained constraints help, and why permissions must still enforce the boundary.'
published: 2026-09-21
reviewed: 2026-09-21
status: published
author: Swapnil
authorship: human
topics: [Agents, Governance]
order: 2
evidence: Simulation-based guide
scenario:
  id: forgotten-instruction
  revision: 1
sources:
  - title: 'Anthropic: Effective context engineering for AI agents'
    url: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
  - title: 'Agent Explainer: forgotten-instruction revision 1 source'
    url: https://github.com/swapupg/agent-explainer/blob/fc3aae0e1b99520ac33c1e1e40c7759439b429ac/src/scenarios/forgotten-instruction.ts
---

## The engineering question

**Which obligations must remain available after an agent's conversation is shortened?**

A task contains more than the thing to produce. It can also specify actions the system must avoid. “Prepare the quarterly update” and “prepare it as a draft; do not publish” have different completion criteria. Losing the second part changes what a successful outcome means.

## Initial conditions

The user asks for a quarterly update and explicitly limits it to a draft. The simulated agent prepares the document. Then the harness—the software coordinating the agent's context and tools—replaces the conversation with a deliberately lossy summary.

In the baseline, the instruction exists only in the conversation. In the repaired run, the harness first saves the draft-only constraint separately and supplies it alongside the later summary. The initial task and the shortened summary are otherwise the same.

Pause at the compaction event. Compare the information available to the agent with the original instruction. The repair is visible in that context panel before it changes the final world state.

## Baseline versus repair

| Observation                | Baseline            | With the repair            |
| -------------------------- | ------------------- | -------------------------- |
| Original restriction       | Draft only          | Draft only                 |
| Separate constraint record | Absent              | Retained                   |
| Context after compaction   | Restriction missing | Restriction supplied again |
| Scripted next action       | Publish             | Keep the draft             |
| Final document state       | Published           | Unpublished                |

The assessment checks the document against the original task boundary. It does not allow the compressed summary to redefine success.

## Why the repair works

This agent follows a simple rule: if the draft-only restriction is visible, it does not publish. Keeping constraints outside the compressed history makes that restriction available to the rule on subsequent steps.

[Anthropic's context-engineering discussion](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) describes compaction and structured note-taking, including the risk of discarding important information when compressing aggressively. The lab isolates one instance of information loss so you can inspect its effect. Its specific retention policy and resulting behavior are scripted for teaching.

## Production considerations

Treat task restrictions as explicit state with a known origin and lifetime. At each relevant step, distinguish the user's goal, current constraints, and progress notes. A useful review question is: can a summary silently weaken a rule that still applies?

Retaining text is only one layer. **Permissions must independently constrain actions.** A draft-only workflow should not depend on a model declining an otherwise available publish operation. Check authorization at the tool boundary and require the appropriate authorization before expanding what the system may do.

Stored constraints also need deliberate updates. A stale restriction can block a legitimate change of task; an untrusted tool response should not silently become permission to publish. Define who can change a constraint and how that change is recorded.

## What this does not establish

A real model can ignore a visible instruction. This simulation always follows its rule and uses a permissive publish tool to make the missing boundary observable. It does not show that all compaction loses instructions, that a larger context window solves the problem, or that a constraint store guarantees compliance.

For your own system, test information preservation and authorization separately: inspect what survives compaction, then attempt the prohibited tool action under the original permissions. A preserved sentence and a denied action establish different things.

## Related reading

- [How to compare AI models for your application](/notes/comparing-ai-models/) explains why evaluations should reflect your actual tasks and failure criteria.
- [Five foundations for understanding AI agents](/research/five-foundations-for-ai-agents/) includes research on the difference between having information and using it.
- [Agent Explainer](/projects/agent-explainer/) explains the lab's limits and contribution model.
