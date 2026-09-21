---
title: 'Agent Explainer'
description: 'Watch an agent fail, inspect the cause, apply one repair, and replay. An interactive lab for understanding what happens between a request and its result.'
published: 2026-09-20
status: published
author: Swapnil
topics: [Agents]
stage: Public beta
demo: /agent-explainer/
repository: https://github.com/swapupg/agent-explainer
image: /assets/agent-explainer.webp
imageAlt: Agent Explainer showing its experiment picker and separate panels for context, activity, and actual world state.
sources:
  - title: Agent Explainer source, scenario tests, and contribution guide
    url: https://github.com/swapupg/agent-explainer
---

## Three small experiments, three useful lessons

- **[The duplicate action](/agent-explainer/#/experiment/duplicate-action/1/baseline/0).** A ticket is created, but its response is lost. A retry creates a second ticket. Reusing an idempotency key repairs the simulated operation.
- **[The forgotten instruction](/agent-explainer/#/experiment/forgotten-instruction/1/baseline/0).** Lossy compaction drops a “draft only” restriction. Retaining the constraint outside the compressed conversation changes the simulation’s outcome.
- **[The premature “done”](/agent-explainer/#/experiment/premature-done/1/baseline/0).** A tool accepts a report request while the report remains pending. Checking the authoritative job status prevents the simulated agent from announcing completion too early.

For the engineering context around each repair, read the [Agent Reliability Fieldbook](/fieldbook/). Each guide links back to the exact scenario revision.

## Inspect the difference

Run an experiment at your own pace. Select a timeline event to inspect its inputs, result, and state change. Apply one repair and replay from the same initial conditions. The comparison makes the mechanism behind the changed outcome visible.

Links preserve the experiment revision, variant, and selected step. Share a precise moment with a colleague or use it during a lesson.

## What this lab establishes

The experiments are deterministic, rule-based simulations running entirely in the browser. They do not use live models, publish real content, create real tickets, or generate reports on external services. They teach failure mechanisms; they are not model benchmarks.

Retaining an instruction does not guarantee that a real model will follow it. Production permissions must independently restrict actions. Likewise, a real service must implement an idempotency contract for a repeated key to have any effect.

The project remains a **public beta**. Its planned human comprehension pilot has not yet established the release target.

## Build on it

The application is MIT licensed and has a typed scenario interface, a copyable example, and reproducibility tests. Contributions can improve an explanation, supply a source, improve accessibility, or add a carefully scoped experiment.

[Read the contribution guide ↗](https://github.com/swapupg/agent-explainer/blob/main/CONTRIBUTING.md)
