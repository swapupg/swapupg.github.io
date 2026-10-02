---
title: 'Your next API customer may be an AI agent'
description: 'Cloudflare has open-sourced Forge and introduced the cf CLI. The useful question for builders: can an agent discover, use, and verify your product’s actions?'
published: 2026-10-02
eventDate: 2026-09-28
reviewed: 2026-10-02
status: published
author: Swapnil
authorship: human
kind: Release analysis
evidence: Source-based analysis
topics: [Agents, Leadership]
sources:
  - title: 'Cloudflare: Introducing Forge (28 September 2026)'
    url: https://blog.cloudflare.com/forge-open-source-generation-pipeline/
  - title: 'Cloudflare: Introducing cf (28 September 2026)'
    url: https://blog.cloudflare.com/cloudflare-cf-cli-launch/
  - title: 'Cloudflare Forge: source repository and Apache 2.0 license'
    url: https://github.com/cloudflare/forge
  - title: 'Cloudflare CLI documentation: overview and beta status'
    url: https://developers.cloudflare.com/cf/
---

An agent can understand a request and still struggle to use your product. It might find an outdated command, misread a result, or retry an action that already succeeded. Better instructions help, but the interface itself deserves attention.

Cloudflare’s latest release makes that a timely engineering question: **would your API make sense to a caller that cannot stop and ask a colleague what the documentation meant?**

## What changed

On **28 September 2026**, Cloudflare introduced [Forge](https://blog.cloudflare.com/forge-open-source-generation-pipeline/), an open-source pipeline for generating interfaces from API definitions. Its [repository](https://github.com/cloudflare/forge) uses the Apache 2.0 license. This is developer tooling, not a new AI model.

Forge already generates output for Cloudflare’s new `cf` command-line interface. Cloudflare describes broader use for its documentation and SDKs as forthcoming. Its design includes checking API changes and producing previews before those changes reach customers.

The accompanying [`cf` announcement](https://blog.cloudflare.com/cloudflare-cf-cli-launch/) describes command discovery, JSON output by default, and typed configuration. These give a calling program more structure to work with. The [documentation](https://developers.cloudflare.com/cf/) labels `cf` as beta: commands, configuration, and build output can change.

## Why this matters beyond Cloudflare

**My interpretation:** an interface used by agents needs to be treated as part of the product experience. The questions are familiar, but the consequences can travel further when a program takes several actions in sequence.

Can the caller find the right operation? Does the response distinguish a request being accepted from work being completed? After a timeout, can the caller discover whether the action happened?

Consider a hypothetical agent asked to prepare a test environment. It creates a resource, receives an identifier, checks readiness, and then configures access. If the creation response is ambiguous, every later step inherits that uncertainty. A clear schema helps describe the response. It still takes application behavior to make that identifier stable and the status authoritative.

A generated interface can keep names and shapes aligned. The service behind it must enforce permissions, define failures, and preserve the meaning of each operation.

## A checklist for one real workflow

Before introducing another agent framework, I would review one existing workflow against these questions:

| Question                                       | Evidence I would look for                                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Can the caller discover the right action?      | Searchable operations, consistent names, required inputs, and a small working example.                       |
| Can it understand the result?                  | Structured responses with documented identifiers, status values, and error categories.                       |
| Can it distinguish acceptance from completion? | A job identifier and an authoritative status check, including failure and timeout states.                    |
| Can it recover after a lost response?          | A way to look up the original operation; server-supported idempotency where retries could duplicate a write. |
| Can it act only within its authority?          | Narrow credentials and permissions enforced by the service, independent of model instructions.               |
| Can someone investigate what happened?         | Request identifiers and an audit trail connecting the intended action to the resulting change.               |

This is a proposed review checklist, not a claim that Forge or `cf` supplies every control. The [duplicate-action guide](/fieldbook/duplicate-action/) and [completion-verification guide](/fieldbook/premature-done/) demonstrate why two of these details matter.

## The leadership decision is ownership

Who owns the experience across the API, command line, examples, and documentation? In a growing organization, those pieces can have different owners and release schedules.

My recommendation is to assign an owner for the complete workflow. Product teams should define what their actions mean. A platform team can help keep shared conventions and generated clients consistent. The person responsible for the workflow should be able to demonstrate how a caller detects success, handles a retry, and stops when authority runs out.

A useful acceptance check is concrete: give a caller the published interface and an authorized test task, then inspect whether it reaches the intended world state. Count unintended writes and recovery failures alongside completed tasks. A convincing demonstration should include a failure path.

## What this release does not establish

Model Fieldnotes has not run Forge, tested `cf`, or measured a reliability improvement from either. The release documents an approach worth evaluating. It does not establish that an agent will select the correct action, resist misleading input, or respect a permission boundary that the service does not enforce.

For a first evaluation, use a disposable environment and scoped credentials. Compare the same bounded workflow through your current interface and a proposed replacement. Record completion, incorrect actions, recovery effort, and total cost. Keep the test configuration and failure cases so someone else can repeat it.

## Related reading

[Jev’s structured decision interface](/developments/jev-structured-decisions/) raises a complementary question: which steps need generated language, and which need a bounded choice? The interface to a model and the interface to a tool both shape what a workflow can reliably do.

Use [How to compare AI models for your application](/notes/comparing-ai-models/) to define the evaluation, and [The cost of a completed task](/notes/cost-of-a-completed-task/) to keep retries and review work inside the cost calculation.
