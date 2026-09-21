---
title: 'Retrying without duplicate actions'
description: 'A lost response leaves an uncertain caller and a completed action. Follow the retry, inspect the duplicate, and see what an idempotency contract changes.'
published: 2026-09-21
reviewed: 2026-09-21
status: draft
author: Swapnil
authorship: human
topics: [Agents]
order: 4
evidence: Simulation-based guide
scenario:
  id: duplicate-action
  revision: 1
sources:
  - title: 'AWS Builders’ Library: Making retries safe with idempotent APIs'
    url: https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/
  - title: 'Stripe API: Idempotent requests'
    url: https://docs.stripe.com/api/idempotent_requests
  - title: 'Agent Explainer: duplicate-action revision 1 source'
    url: https://github.com/swapupg/agent-explainer/blob/fc3aae0e1b99520ac33c1e1e40c7759439b429ac/src/scenarios/duplicate-action.ts
  - title: 'Agent Explainer: simulated ticket storage and recorder'
    url: https://github.com/swapupg/agent-explainer/blob/fc3aae0e1b99520ac33c1e1e40c7759439b429ac/src/simulation/engine.ts
---

Use an existing supported scenario/revision. Change the title, description, dates, sources, and order; do not publish a second guide for the same pair. See the publishing guide before adding a new scenario.

## The engineering question

State the decision this guide helps a builder make.

## Initial conditions

Describe the scripted setup and what stays constant.

## Baseline versus repair

Record actual simulated states; do not invent measured results.

## Why the repair works

Connect a specific mechanism to the observed difference.

## Production considerations

Explain dependencies and limits of the repair.

## What this does not establish

Identify untested behavior and what a real evaluation would need.

## Related reading

Link existing articles and original sources.
