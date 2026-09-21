---
title: 'What changes when AI can do the work?'
description: 'My perspective on the shift from generating answers to delegating work—and what it means for products, engineering teams, and business decisions.'
published: 2026-09-21
reviewed: 2026-09-21
status: published
author: Swapnil
authorship: human
topics: [Agents, Economics, Governance]
kind: Essay
number: 5
sources:
  - title: 'τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains (June 2024, version 1)'
    url: https://arxiv.org/html/2406.12045v1
  - title: 'Anthropic: Building effective agents (originally published December 2024)'
    url: https://www.anthropic.com/engineering/building-effective-agents
  - title: 'AWS Builders’ Library: Making retries safe with idempotent APIs'
    url: https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/
  - title: 'NIST: Artificial Intelligence Risk Management Framework 1.0 (January 2023)'
    url: https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf
---

**My perspective · September 2026.** This essay connects published research and engineering guidance with my interpretation and expectations. It reports no new model measurements. The predictions are judgments to test, not findings established by the sources or the simulations on this site.

The next phase of AI will be judged by the useful work it can reliably complete—and the economics of delivering it. That is the thesis behind Model Fieldnotes.

A useful answer helps someone decide what to do. A system authorized to act can change the situation itself: update a record, create a ticket, prepare a report, or move a process forward. The product question expands from whether the response is useful to whether the work was completed correctly, within the authority granted, and at an acceptable cost.

My background spans research, entrepreneurship, enterprise software, and AI engineering leadership. It makes me interested in the connection between a technical capability and the operating decisions around it. Which work should we delegate? What would make us trust the result? Who handles the cases that fall outside the design?

I see three shifts worth organizing around. They are a way to make decisions, not a claim that every application needs an autonomous agent.

## From answers to outcomes

Consider an **illustrative support workflow**, not an account of a customer deployment. A user asks for a ticket. The tool creates it, but the response never reaches the agent. The agent retries and produces a second ticket. Its final message can be accurate in one narrow sense—a ticket exists—while the overall task has failed.

An outcome definition should catch that difference: exactly one ticket, with the correct fields, created under the right authority. It should also distinguish an automated completion from one rescued by a person. Both can serve the customer, but they imply different capacity and economics.

The 2024 [τ-bench paper](https://arxiv.org/html/2406.12045v1) offers a useful evaluation idea: compare the final database with the expected state, and test consistency across repeated trials. Its authors also note a limitation: reaching the right state may still hide a policy violation along the way. Their benchmark uses simulated users and simplified domains. It is a research method to learn from, not evidence of how a present-day deployment will perform.

My implication for leaders is to define both the destination and the permitted route. A correct refund issued without required authorization is not an acceptable success. A report that exists but uses the wrong data is not finished. Some checks belong in software; others need informed review.

Economics follows the same unit of analysis. Count model calls, tool charges, retries, review, and remediation against acceptable completed tasks. Keep completion rate, elapsed time, and serious errors visible alongside that ratio. Otherwise, an inexpensive system that abandons difficult work can look more attractive than it deserves.

The [cost of a completed task](/notes/cost-of-a-completed-task/) walks through an explicitly invented calculation. The decision is practical: define what counts, include the work failures leave behind, and compare alternatives under the same rules. A lower token price alone cannot answer that question.

## From demos to dependable systems

A demonstration reveals a possibility. A dependable product needs a design for the conditions around it: missing information, unavailable tools, interrupted requests, ambiguous authority, and tasks that take longer than a single interaction.

The model is one component of that design. [Anthropic’s agent architecture guidance](https://www.anthropic.com/engineering/building-effective-agents), originally published in December 2024, distinguishes predetermined workflows from systems where a model directs its next actions. It recommends adding complexity only when the task warrants it and describes using environmental feedback and stopping conditions. I read this as a reason to make autonomy a deliberate choice. It is vendor engineering guidance, not an independent comparison proving one architecture always wins.

Three mechanisms make the surrounding system tangible:

- **Safe retries.** Give one intended operation a stable identity and use a service that honors it. [AWS’s idempotency guidance](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) describes caller-provided request identifiers and the server-side coordination needed to prevent duplicate effects. A key in a prompt is insufficient; the API must implement the contract, including its scope and retention window.
- **Durable constraints.** Preserve task restrictions separately from a compressed conversation and supply them again when needed. This reduces one way an instruction can disappear. It cannot guarantee a model will obey. Independently enforced permissions must limit what the system can do.
- **Verified completion.** Treat “accepted,” “pending,” and “completed” as different states. Check the authoritative job or artifact before claiming success. Real jobs also need deadlines, failure handling, cancellation where supported, and a path for unresolved work.

The [Agent Reliability Fieldbook](/fieldbook/) demonstrates these mechanisms through deterministic simulations. They expose a specific cause and repair; they do not estimate model failure rates or prove production readiness.

For a product team, my recommendation is to include recovery in the feature definition. A retry button should have a known effect. A paused task should have an owner. A rejected action should leave enough context for someone to continue. These details determine how much work the product actually takes off a person’s hands.

## From model selection to organizational design

Choosing a model is a real engineering decision. Delegating work also creates decisions about the organization around it: who sets acceptance criteria, who grants authority, who reviews exceptions, and who can stop the system.

Imagine an **illustrative internal reporting process**. An agent assembles a draft from approved data sources. A business owner checks the interpretation. A designated approver releases it. Improving generation speed helps, but the end-to-end process may still be constrained by ambiguous definitions, unavailable reviewers, or disputed inputs. Measure the whole process before calling the change a productivity gain.

I would make the division of responsibility explicit before expanding autonomy:

| Decision   | What the team needs to agree                                                    |
| ---------- | ------------------------------------------------------------------------------- |
| Delegation | Which steps the agent may perform, and which require a person                   |
| Acceptance | Who defines success and how the result is checked                               |
| Exceptions | Who receives unresolved work, with what context and response expectation        |
| Authority  | Which data and actions the system can access                                    |
| Change     | Who can update the configuration, halt a rollout, and restore the prior version |

The [NIST AI Risk Management Framework 1.0](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf) gives this a broader foundation. Its GOVERN categories address clear responsibilities, executive accountability, and human–AI oversight. It is a voluntary framework, not a substitute for jurisdiction-specific requirements or a certification of a particular deployment.

My interpretation is that organizational design becomes part of AI product design. “Human in the loop” leaves too much unspecified unless that person has time, evidence, authority, and a usable action to take. Review effort should be measured as work, not treated as a free resource outside the system.

The [model comparison guide](/notes/comparing-ai-models/) starts with the task and acceptance checks. I would use its results alongside these operating choices. A better model can improve a configuration; it cannot resolve an undefined business decision on its own.

## What I expect next

These are **three bounded predictions made in September 2026**, not market measurements. I would reassess them against documented deployments and evaluations at the stated horizons. Public examples are useful signals but may overrepresent successful adopters.

### 1. Outcome evidence becomes more important in buying decisions

**Horizon: September 2027.** I expect enterprise evaluations of agents that change business records to place more weight on verified completion, intervention, and cost per successful task.

**Signals I would look for:** published evaluation criteria and deployment reports that define success, include failed attempts, and account for review effort. A product page promising outcomes is weaker evidence than a documented evaluation.

**What would weaken this view:** buying decisions and repeat deployments continuing to rely primarily on model-level scores, with little task-level evidence and no apparent penalty in customer outcomes. I am not predicting a particular pricing model or market share.

### 2. Bounded delegation remains a durable product pattern

**Horizon: March 2028.** For enterprise workflows that change customer or business records, I expect explicit permissions, completion checks, and escalation paths to remain useful even as models improve.

**Signals I would look for:** operating documentation that specifies action boundaries and recovery, plus evaluations showing where those controls prevent unacceptable outcomes.

**What would weaken this view:** repeated, independently assessed deployments achieving acceptable reliability without those surrounding controls at comparable cost and consequence. A successful one-off demonstration would not settle it.

### 3. Adoption exposes the cost of organizational handoffs

**Horizon: September 2028.** In workflows involving several teams, I expect some of the most consequential AI improvements to involve changing ownership and review practices alongside improving the model.

**Signals I would look for:** before-and-after studies reporting queue time, exception volume, reviewer effort, and end-to-end completion, with other process changes disclosed.

**What would weaken this view:** consistent evidence that substituting a stronger model delivers most of the useful improvement while handoffs and responsibilities remain unchanged. The relative importance will differ by workflow; this is not a prediction about job replacement.

## What leaders should do now

Choose one workflow with a recognizable user, a checkable result, and a manageable consequence of failure. Write down the current process before adding automation. Then make five decisions:

1. **Define the outcome.** Specify successful completion, prohibited actions, acceptable delay, and cases that should be handed back.
2. **Establish a baseline.** Record completion, errors, elapsed time, and human effort for the existing process. Keep the measurement boundary consistent.
3. **Set the delegation boundary.** Grant only the access required for the chosen work. Make consequential approvals explicit.
4. **Test the awkward cases.** Include duplicate requests, lost responses, incomplete inputs, conflicting instructions, and unavailable dependencies. Inspect the resulting state.
5. **Make an expansion decision.** Compare quality and total effort, review failure examples, and decide whether to expand, revise, or stop. Preserve a way to restore the earlier process.

This is a proposed decision method. A favorable pilot is evidence for that scope, not permission to generalize across the organization.

## Where I remain uncertain

Model capability may improve faster than integration practices, or make some current engineering work unnecessary. The cost of verification may dominate in one workflow and be negligible in another. Adoption may depend more on trust, incentives, and access to usable data than on generation quality.

I also do not assume that all useful work has an inexpensive automatic check. Open-ended strategy and interpretation can resist a single score. In those settings, the case for delegation needs a credible review process and a realistic account of the effort it consumes.

These uncertainties are why I want Model Fieldnotes to connect a point of view to work readers can inspect. I intend to make the assumptions visible and revise conclusions when better evidence changes the decision.

## Inspect the work

Start with [retrying without duplicate actions](/fieldbook/duplicate-action/), then run its failure and repair in Agent Explainer. Continue with [constraints through compaction](/fieldbook/forgotten-instruction/) and [verifying completion](/fieldbook/premature-done/).

For the wider decision, use the [cost worksheet](/notes/cost-of-a-completed-task/) and [evaluation guide](/notes/comparing-ai-models/). Follow [my signed writing](/writing/rss.xml) for further analysis, guides, and research collections.
