---
title: 'How to compare AI models for your application'
description: 'Start with a real task and a clear definition of success. A useful comparison ends with a decision you can explain.'
published: 2026-09-20
updated: 2026-09-21
reviewed: 2026-09-20
status: published
author: Swapnil
topics: [Models, Agents]
kind: Essay
number: 3
sources:
  - title: 'Anthropic engineering: Demystifying evals for AI agents'
    url: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
  - title: 'NIST: AI Risk Management Framework'
    url: https://www.nist.gov/itl/ai-risk-management-framework
---

“Which model is best?” becomes easier to answer after replacing “best” with a specific job. Extracting fields from invoices, researching an unfamiliar topic, and updating a support account are different tasks with different failure costs.

The following is a proposed evaluation worksheet. It contains no new model measurements or rankings.

## Start with the outcome

Write one sentence describing success in terms someone else can check. For example: “Produce a draft response that cites the correct refund policy, stays within the customer’s eligibility, and does not issue a refund.”

Then split the checks. Some are objective: a file exists, a total matches, an unauthorized action did not happen. Others require judgment: the explanation is clear or a source is relevant. [Anthropic’s evaluation guide](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) discusses combining state checks and task-specific rubrics, and calibrating model-based graders against human judgment.

## Freeze a small, meaningful task set

Use examples that represent the actual work, plus important edge cases. Include incomplete inputs, conflicting instructions, tool failures, and tasks that should be refused or handed back for clarification. Keep private customer information out of a public evaluation artifact.

Reserve some examples from prompt development. Otherwise, a prompt may simply become unusually good at the cases you used to tune it. Start small enough to inspect every failure, then expand once your scoring is dependable.

## Record the setup

For each run, record these fields:

| Field                           | What it tells the reader                           |
| ------------------------------- | -------------------------------------------------- |
| Model identifier and date       | Which version was actually evaluated               |
| Prompt and tool definitions     | What information and capabilities were supplied    |
| Sampling and reasoning settings | How generation was configured                      |
| Task set and repeat count       | What was tested, and how often                     |
| Acceptance checks               | What counted as success                            |
| Total cost and duration         | What achieving the result required                 |
| Failure examples                | Where the aggregate score hides important problems |

Compare systems under documented constraints. Changing the prompt, model, tools, and retry policy together tests a whole configuration; it does not isolate the effect of the model alone.

## Inspect the disagreements

Repeat important cases to expose variability. If a model-based grader is used, examine examples where its judgment differs from a human reviewer. A plausible explanation is not proof that a tool changed the right record. The authoritative state may tell a different story.

Report counts as well as percentages, and distinguish “succeeded at least once” from “succeeded consistently.” Small samples should support narrow conclusions. Avoid publishing a universal league table from a handful of convenient prompts.

## Make a decision with boundaries

A practical result might be: “Configuration B meets our acceptance threshold for this task set, while A needs more review. We will test B on a larger held-out set before deployment.”

NIST’s [AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) offers a broader, voluntary structure for considering context and managing risks throughout a system’s lifecycle. A model comparison is one input to that work.

Pair quality with [cost per completed task](/notes/cost-of-a-completed-task/), latency, and the consequences of failure. Publish enough context that someone can understand where your conclusion applies—and where it does not.

## Explore the Fieldbook

Use the [Agent Reliability Fieldbook](/fieldbook/) to identify failure criteria worth adding to your own evaluation. Its simulations are teaching tools, not model measurements.
