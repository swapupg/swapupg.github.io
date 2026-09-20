---
title: 'When an agent retries a successful action'
description: 'A missing response does not mean an action failed. Follow one request all the way to two tickets—and the repair that prevents it.'
published: 2026-09-20
reviewed: 2026-09-20
status: published
author: Swapnil
topics: [Agents]
kind: Essay
number: 1
sources:
  - title: 'AWS Builders’ Library: Making retries safe with idempotent APIs'
    url: https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/
  - title: 'Stripe API: Idempotent requests'
    url: https://docs.stripe.com/api/idempotent_requests
  - title: 'Agent Explainer: scenario source and outcome assertions'
    url: https://github.com/swapupg/agent-explainer
---

An agent asks a tool to create a support ticket. The tool creates it. Then the response disappears before it reaches the agent. From the agent’s perspective, nothing seems to have happened. It tries again. Now there are two tickets.

The interesting failure sits between two different facts: **what the caller knows** and **what the system has already done**.

## Follow the two timelines

In the [duplicate-action experiment](/agent-explainer/#/experiment/duplicate-action/1/baseline/0), the agent’s activity and the actual world state appear separately. This is a deterministic teaching simulation, with no live support system or model behind it.

| Step           | What the agent can observe     | What is actually true      |
| -------------- | ------------------------------ | -------------------------- |
| Create request | A request has been sent        | The tool is processing it  |
| Commit         | No response has arrived        | One ticket exists          |
| Lost response  | The request appears unanswered | The ticket still exists    |
| Retry          | Another request is sent        | A second ticket is created |

Waiting longer might change when the retry happens. It does not, by itself, identify whether the first operation committed. AWS describes this uncertainty in its [discussion of retries and side effects](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/).

## Give the operation a stable identity

An **idempotency key** identifies one intended operation across multiple attempts. Generate it before the first attempt, retain it, and reuse it when retrying that same operation. A new intended action needs its own identity.

The receiving service must implement the contract. In the repaired simulation, it recognizes the repeated key and returns the existing ticket instead of creating another. Adding a key to a request does nothing if the server ignores it.

[Stripe’s API](https://docs.stripe.com/api/idempotent_requests) illustrates a concrete contract: it saves the status and response body for an executed request and reuses that result for subsequent requests with the same key. It checks for changed parameters, and its retention rules matter. Those are service-specific semantics, not a guarantee shared by every API.

## Put the repair in the system

For an agent harness—the software that manages model calls, tools, state, and execution—the useful question is where this operation identity lives. If a retry creates a fresh key every time, it looks like a new operation to the tool.

In a production implementation, examine how the service records the operation alongside the side effect, handles concurrent attempts, scopes keys to callers, and expires them. AWS discusses these design questions, including late-arriving requests and the difference between identical parameters and identical intent.

This still does not establish that the requested action was authorized or correct. Permissions and validation must constrain the action independently.

## Try the difference

Run the baseline, select the lost-response event, and inspect the world state. Then apply the repair and replay. The request is still retried. The observable difference is that **one intended action produces one ticket in this simulated world**.

[Open the experiment →](/agent-explainer/#/experiment/duplicate-action/1/baseline/0)
