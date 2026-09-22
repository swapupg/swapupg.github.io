---
title: 'The cost of a completed task'
description: 'Token prices are only the beginning. Count the tools, retries, and failed attempts behind a useful result.'
published: 2026-09-20
updated: 2026-09-21
reviewed: 2026-09-20
status: published
author: Swapnil
topics: [Economics, Agents]
kind: Essay
number: 2
sources:
  - title: 'Claude Platform: Pricing and tool-use costs'
    url: https://platform.claude.com/docs/en/about-claude/pricing
  - title: 'AWS Builders’ Library: Timeouts, retries, and backoff with jitter'
    url: https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
---

A model’s price per million tokens is a useful input. A team usually needs a different answer: how much does it cost to deliver one acceptable outcome?

The denominator changes the decision. An inexpensive attempt is less useful when it repeatedly fails, invokes costly tools, or sends most of its work to a human for repair.

**[Try the task cost calculator](/tools/task-cost/)** to work through your own batch costs or compare the illustrative designs below. Inputs stay in your browser.

## Define what completed means

Choose the acceptance check before measuring cost. For a ticket workflow, it might mean exactly one correct ticket with the required fields. For a report, it might mean a generated file with verified totals and cited inputs. A fluent message saying “done” is not sufficient evidence.

Keep attempted tasks, successful tasks, and model calls as separate counts. One task can make many model calls. It can also fail after consuming most of its budget.

## Build the cost numerator

For a fixed evaluation window, record:

- Model charges for every call, including unsuccessful attempts.
- Tool charges, such as search or external processing.
- Infrastructure attributable to the workload.
- Human review or remediation, when included in the comparison.

Provider contracts can distinguish input, output, cached tokens, and tool use. For example, [Claude’s pricing documentation](https://platform.claude.com/docs/en/about-claude/pricing) separates these categories. Read the actual billing rules for the deployed configuration; do not assume that a single advertised token rate covers the whole workflow.

## Work through an example

**These numbers are invented for illustration. They are not vendor prices or measured model results.** Both designs attempt the same 100 tasks under the same acceptance rule. Human review and shared infrastructure are excluded from both rows.

| Measurement                      | Design A | Design B     |
| -------------------------------- | -------- | ------------ |
| Model charges, including retries | $2.00    | $4.00        |
| Tool charges                     | $1.00    | $1.00        |
| Total included cost              | $3.00    | $5.00        |
| Acceptable completed tasks       | 40       | 90           |
| Cost per completed task          | $0.075   | About $0.056 |

Design A costs less for the batch. Design B costs less per acceptable result. Neither fact establishes a universal winner: a budget-constrained application may care about total spend, while a service commitment may impose a minimum completion rate.

Use `total included cost / acceptable completed tasks`. If no tasks succeed, report “no successful completions”; zero would be misleading.

## Make retries visible

A retry policy is part of both reliability and economics. A loop can consume additional model and tool calls without improving the outcome. [AWS’s retry guidance](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) also explains how retries can add load when a dependency is already struggling.

Track a task’s total spend, number of attempts, wall-clock duration, and final outcome together. Set explicit attempt and spend limits. Test whether a better stopping rule improves the result.

For a useful comparison, publish the task set, date, acceptance rule, included costs, exclusions, and failure rate. The next question then becomes concrete: **which part of this workflow is spending money without producing a better result?**

## Explore the Fieldbook

The [Agent Reliability Fieldbook](/fieldbook/) illustrates why retries and completion checks belong in a task-level cost model.
