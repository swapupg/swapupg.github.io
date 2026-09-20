---
title: 'Five foundations for understanding AI agents'
description: 'Reasoning and action, learned tool use, context, reflection, and reliability. Five papers that help explain the systems we build.'
published: 2026-09-20
status: published
author: Swapnil
topics: [Research, Agents]
issue: 1
collection: Foundations
papers:
  - title: ReAct
    url: https://arxiv.org/abs/2210.03629
    published: '2022-10-06'
    finding: Connecting a plan to observations from the world.
  - title: Toolformer
    url: https://arxiv.org/abs/2302.04761
    published: '2023-02-09'
    finding: Learning when an external tool is useful.
  - title: Lost in the Middle
    url: https://arxiv.org/abs/2307.03172
    published: '2023-07-06'
    finding: Having context and using it are different abilities.
  - title: Reflexion
    url: https://arxiv.org/abs/2303.11366
    published: '2023-03-20'
    finding: Carrying feedback into the next attempt.
  - title: τ-bench
    url: https://arxiv.org/abs/2406.12045
    published: '2024-06-17'
    finding: Checking whether an agent reliably did the right thing.
sources:
  - title: 'ReAct — full paper, version 3'
    url: https://arxiv.org/html/2210.03629v3
  - title: 'Toolformer — full paper, version 1'
    url: https://arxiv.org/html/2302.04761v1
  - title: 'Lost in the Middle — full paper, version 3'
    url: https://arxiv.org/html/2307.03172v3
  - title: 'Reflexion — full paper, version 4'
    url: https://arxiv.org/html/2303.11366v4
  - title: 'τ-bench — full paper, version 1'
    url: https://arxiv.org/html/2406.12045v1
---

This first collection is a reading route through five recurring questions: how does an agent act, when should it use a tool, which information does it use, what does it learn from failure, and how do we check its work?

These are foundational papers from 2022–2024, not this week’s releases. The findings below are the authors’ reported results. **Model Fieldnotes has not independently reproduced these experiments.** Original submission dates and the specific paper versions consulted are included so the claims can be traced.

## 01 — ReAct: connect reasoning and action

**Original submission: 6 October 2022 · In depth · [Read the paper](https://arxiv.org/html/2210.03629v3)**

**The problem.** A language model can produce a plausible plan without checking the world. A tool-using system can also take actions without keeping a useful account of its objective.

**The contribution.** ReAct interleaves generated reasoning text, actions, and observations. An observation can change what happens next. Its experiments include Wikipedia-assisted question answering and fact verification, alongside ALFWorld and WebShop decision tasks.

**The evidence.** The authors compare this approach with reasoning-only and action-only baselines. ReAct outperforms action-only variants across their studied settings; a combination with chain-of-thought methods performs best on some knowledge tasks. The paper does not establish one universal prompting winner.

**The limits.** Bad retrieval can derail the process, and the permitted actions and supplied examples constrain behavior. Generated reasoning text is observable output, not guaranteed access to the model’s internal causal process.

**For builders.** Make tool observations explicit and inspect how they affect subsequent actions. This is a design lesson drawn from the paper, not proof that adding a reasoning field makes an agent safe or reliable. Verify the environment’s final state separately.

## 02 — Toolformer: learn when to use a tool

**Original submission: 9 February 2023 · [Read the paper](https://arxiv.org/html/2302.04761v1)**

**Problem and contribution.** Toolformer studies how a model can learn tool use with limited human demonstrations. It samples API calls, executes them, retains calls that improve prediction of subsequent text, and fine-tunes on the resulting examples.

**Evidence.** The authors report improvements across tasks involving tools such as calculation, search, and translation. This is a training approach, rather than simply a prompt that lists available tools.

**Limits.** Their setup does not support chaining tool outputs into new tool inputs or interactive browsing. Tool-call selection does not account for each tool’s computational cost.

**For builders.** Treat tool selection, argument quality, and the cost of invocation as separate evaluation questions. A tool appearing in an interface does not establish that the model will choose it appropriately.

## 03 — Lost in the Middle: context is not comprehension

**Original submission: 6 July 2023 · [Read the paper](https://arxiv.org/html/2307.03172v3)**

**Problem and contribution.** Can a model reliably use information anywhere in its context? The study varies the position of relevant information in multi-document question answering and synthetic key-value retrieval.

**Evidence.** Several tested models perform better when useful information appears near the beginning or end, and worse when it appears in the middle. A larger available context window does not consistently resolve this in the studied configurations.

**Limits.** These findings describe the tested models and tasks; they are not measured results for today’s model versions. Retrieval and use of information are also distinct from deliberately removing information through compression.

**For builders.** Test information placement and distractors on your own task. The lesson is to measure effective context use, rather than treating maximum context capacity as an accuracy guarantee.

## 04 — Reflexion: carry feedback forward

**Original submission: 20 March 2023 · [Read the paper](https://arxiv.org/html/2303.11366v4)**

**Problem and contribution.** An agent can repeat an unsuccessful approach. Reflexion converts feedback into language-based reflections, stores them in an episodic memory, and uses them to inform later attempts without updating model weights.

**Evidence.** The authors report gains on decision-making, reasoning, and programming tasks. Their ablations examine the contribution of testing and reflection, rather than treating every additional attempt as equivalent.

**Limits.** The method depends on informative feedback and can settle on poor strategies. Self-generated tests are not an independent guarantee of correctness. Repeated attempts may also be inappropriate when an action has irreversible consequences.

**For builders.** Evaluate the quality of retained feedback and the conditions under which retrying is acceptable. A lesson stored in memory should remain distinguishable from an independently verified fact.

## 05 — τ-bench: inspect the outcome and consistency

**Original submission: 17 June 2024 · [Read the paper](https://arxiv.org/html/2406.12045v1)**

**Problem and contribution.** Tool correctness, conversation, and domain policy interact. τ-bench combines simulated users, API tools, policy instructions, and database-backed tasks in retail and airline settings.

**Evidence.** It checks task outcomes against expected database changes and required answer content. Its pass^k measure examines success across repeated trials, showing a consistency challenge for the models tested in the paper.

**Limits.** The user is simulated. Domains, tools, and model versions bound the conclusions. The authors also note that an outcome check can miss a policy violation, such as an action performed without required confirmation.

**For builders.** Inspect both the result and important constraints on the path taken. Distinguish success on every repeated trial from success at least once; those answer different operational questions.

## Bring the questions back to your system

Together, these readings suggest a useful review of an agent application: what can it observe, what can it change, what does it remember, and what evidence would convince you that it succeeded?

Keep those questions visible in the implementation. The [Agent Explainer lab](/projects/agent-explainer/) separates available context, tool activity, and world state so you can explore three failure mechanisms. It is a teaching simulation, not a reproduction of these papers.

For an evaluation of a real model or agent configuration, start with [a task-specific comparison](/notes/comparing-ai-models/) and publish the conditions behind the conclusion.
