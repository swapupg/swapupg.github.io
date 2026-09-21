---
title: 'Retrying without duplicate actions'
description: 'A lost response leaves an uncertain caller and a completed action. Follow the retry, inspect the duplicate, and see what an idempotency contract changes.'
published: 2026-09-21
reviewed: 2026-09-21
status: published
author: Swapnil
authorship: human
topics: [Agents]
order: 1
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

## The engineering question

**When an agent cannot tell whether an action succeeded, how can it try again without doing the work twice?**

The question matters whenever a tool changes something: opening a ticket, sending a message, or creating a resource. A reasonable-sounding final answer is not enough to establish that the requested effect happened exactly once. The caller's knowledge and the system's state can disagree.

## Initial conditions

The simulation begins with a request for one support ticket and an empty ticket store. The first tool call creates a ticket, but its response is lost. Both variants encounter that same missing response and retry. The only repair is retaining one idempotency key for the intended operation and using a simulated service that honors it.

Run the failure and select the event where the first ticket is committed. Inspect the world panel before moving to the retry: the ticket already exists, even though the agent has no confirmation.

## Baseline versus repair

| Observation           | Baseline               | With the repair           |
| --------------------- | ---------------------- | ------------------------- |
| First action          | One ticket committed   | One ticket committed      |
| First response        | Lost                   | Lost                      |
| Retry                 | Creates another ticket | Returns the stored ticket |
| Final world state     | Two tickets            | One ticket                |
| Agent's final message | Claims success         | Claims success            |

These are outcomes of the rule-based simulation. The independent check counts tickets; it does not grade the wording of the completion message.

## Why the repair works

An idempotency key gives the service a stable identity for one intended operation. In this simulation, the tool records the key and ticket together. On the retry it finds that record and returns the existing ticket. The repair changes how the service handles the request, rather than asking the agent to guess whether a timeout meant failure.

[AWS explains this contract](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) using caller-supplied request identifiers and emphasizes atomic handling of the identifier and the action. The key must survive the uncertain attempt. Generating a fresh key for every retry would identify each attempt as a new operation.

## Production considerations

Before enabling retries for a write, check the actual API contract. [Stripe documents](https://docs.stripe.com/api/idempotent_requests) how it stores results, compares request parameters, and eventually removes keys; those details are specific to that service. An arbitrary header does not make an unsupported tool idempotent.

For an implementation review, ask where the operation identity is stored, whether concurrent requests can create two effects, and what happens after the deduplication record expires. Keep a new user request distinct from another attempt at an existing request. If the service cannot deduplicate safely, the product needs a reconciliation or review path for uncertain writes.

Retries also consume resources. Record attempts separately from completed tasks so that a lower visible error rate does not hide duplicated work or higher costs.

## What this does not establish

The lab models atomic in-memory storage and a single lost response. It does not test a database transaction, process crash, concurrent clients, or a real model's choice to retry. One simulated ticket is evidence that this scripted repair satisfies this scenario, not a general exactly-once guarantee.

A useful next test for your own system is to commit an action, interrupt the response, and retry with the same operation identity. Check the authoritative record count and the returned identity independently of the agent's answer.

## Related reading

- [When an agent retries a successful action](/notes/retrying-a-successful-action/) follows the two timelines in more detail.
- [The cost of a completed task](/notes/cost-of-a-completed-task/) connects retries and failures to outcome economics.
- [Verifying completion before saying “done”](/fieldbook/premature-done/) examines a different gap between tool responses and real results.
