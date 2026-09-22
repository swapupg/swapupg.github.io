---
title: 'Task Cost Calculator'
description: 'Compare the cost of acceptable AI outcomes, including failed attempts, tools, infrastructure, and human review.'
published: 2026-09-21
status: published
author: Swapnil
topics: [Economics, Agents]
stage: Public beta
format: Browser app
demo: https://modelfieldnotes.com/tools/task-cost/
repository: https://github.com/swapupg/swapupg.github.io/blob/main/src/lib/task-cost.ts
sources:
  - title: The cost of a completed task — method, worked example, and references
    url: https://modelfieldnotes.com/notes/cost-of-a-completed-task/
---

## Count useful outcomes

A cheap attempt is not necessarily a cheap completed task. Enter batch-level costs and successful completions to see the difference. Compare two designs under the same acceptance rule, include human review when relevant, and copy a plain-text summary with the assumptions attached.

## What it calculates

Total included cost combines model, tool, infrastructure, and human-review costs. Dividing by successful tasks gives cost per successful outcome. Zero successful tasks produces an explicit undefined outcome, never a misleading zero price.

The examples are invented, not vendor prices or measured model results. This tool does not forecast success rates or recommend a model. Read [the method and worked example](/notes/cost-of-a-completed-task/).

## Privacy and limitations

The calculator runs in your browser. Inputs are not uploaded, saved, or put into URLs; refresh restores the example. You explicitly choose whether to copy the results. All amounts are in USD, and only entered cost categories are included. The formula and worked example remain readable without JavaScript.

[Open the calculator →](/tools/task-cost/)
