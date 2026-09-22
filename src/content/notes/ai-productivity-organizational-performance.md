---
title: 'When faster AI work meets the organization'
description: 'How to examine handoffs, architecture, review capacity, and incentives before turning task-level AI gains into claims about business performance.'
published: 2026-09-21
reviewed: 2026-09-21
status: published
author: Swapnil
authorship: human
topics: [Leadership, Economics]
kind: Essay
number: 7
sources:
  - title: 'Dell’Acqua et al.: The Cybernetic Teammate, Organization Science — published June 12, 2026'
    url: https://pubsonline.informs.org/doi/pdf/10.1287/orsc.2025.20702
  - title: 'Gartner: Strategic trends in software engineering (July 1, 2025)'
    url: https://www.gartner.com/en/newsroom/press-releases/2025-07-01-gartner-identifies-the-top-strategic-trends-in-software-engineering-for-2025-and-beyond
  - title: 'NIST: AI Risk Management Framework 1.0 — responsibilities and oversight (2023)'
    url: https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf
---

Suppose AI helps a team prepare a proposal in half the time. The proposal still waits for a data clarification, a technical review, and a decision from a business owner. Some effort has been saved. The effect on delivery depends on what happens across the rest of the process.

That is an **illustrative situation**, not a customer case study. It raises a leadership question: when the cost of producing work changes, what else needs to change for the organization to benefit?

This essay separates a published study, analyst expectations, and a proposed decision method. It contains no original experiment or forecast of headcount reductions.

## What a teamwork experiment establishes

The published 2026 [Cybernetic Teammate study](https://pubsonline.informs.org/doi/pdf/10.1287/orsc.2025.20702), by Dell’Acqua and colleagues, involved 791 Procter & Gamble professionals working on product-innovation challenges. Participants were randomly assigned to individual or paired work, with or without AI. Individuals with AI produced work of comparable quality to pairs without AI; AI also helped participants integrate technical and commercial perspectives.

The authors identify important limits: the exercise used one-day virtual collaborations, cross-functional pairs, a single company, and a particular model. It did not reproduce long-running team relationships or extended rework cycles. This evidence supports experimenting with collaboration; it does not establish that an AI-assisted individual can replace an operating team or that the same design improves company profits.

The research was published in _Organization Science_. Its findings are author-reported and have not been independently reproduced by Model Fieldnotes.

## Find the constraint across the whole workflow

Map a piece of work from request to accepted outcome. Include time spent waiting, correcting inputs, interpreting requirements, reviewing, and recovering from mistakes. Ask which step currently limits delivery and whether accelerating one step changes that limit.

Here is a simple **invented illustration**, with no parallel work and unchanged downstream steps:

| Stage              | Before AI | After faster drafting |
| ------------------ | --------- | --------------------- |
| Prepare a proposal | 4 hours   | 2 hours               |
| Wait for review    | 12 hours  | 12 hours              |
| Review and decide  | 2 hours   | 2 hours               |
| Elapsed time       | 18 hours  | 16 hours              |

Drafting time falls by half; elapsed time falls by about 11%. The example does not predict a real deployment. It shows why a team should measure the same end-to-end outcome before and after a change.

If drafting accelerates enough to increase the number of proposals awaiting review, examine review capacity and selection rules. Faster production can be useful even when it does not shorten delivery—but the value needs to be named rather than assumed.

## Architecture is a responsibility before it is a title

Gartner’s [July 2025 software-engineering trends release](https://www.gartner.com/en/newsroom/press-releases/2025-07-01-gartner-identifies-the-top-strategic-trends-in-software-engineering-for-2025-and-beyond) anticipates greater emphasis on orchestration, problem solving, and system design. It also discusses platforms for making generative AI capabilities available to developers. These are analyst expectations and recommendations, not evidence that every organization needs a larger architect function.

A useful interpretation is to examine the decisions that connect components: which information the system may use, how tools interact, what happens when they fail, and who owns changes across team boundaries. In a small team, experienced engineers may share that responsibility. A larger organization may need dedicated roles or a platform group. The title alone does not establish whether the work is getting done.

For each proposed architectural role, name the decisions it owns and the delays or failures it should reduce. Also check whether it introduces a new approval queue. The test is a better operating system for the team, not a more elaborate organization chart.

## Design review and decision rights together

If a team produces more candidate solutions, decide which deserve expensive attention. Specify the checks that can run automatically, the judgments that require expertise, and the person authorized to accept the result.

The [NIST AI Risk Management Framework](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf) addresses documented responsibilities, executive accountability, and human–AI oversight in its GOVERN function. It is voluntary guidance, not proof that a particular team arrangement is effective.

In an illustrative reporting workflow, a technical reviewer might check reproducibility while a business owner judges whether the interpretation supports a decision. Combining those responsibilities without agreement can leave each person assuming the other performed the missing check. Record the division of responsibility with the workflow itself.

## Examine incentives and the experience of work

Ask what behavior the current measures encourage. Counting drafts, tickets, or generated code can favor volume even when the desired result is a resolved issue or a maintainable change. A more useful review pairs output with accepted outcomes, correction effort, and consequences of failure.

Invite people who receive the work to assess the change. A claimed saving for one team may create verification work for another. Discuss whether employees have room to explain uncertainty or reject unsuitable suggestions. These are proposed questions for an evaluation; this essay does not claim to have measured their effect.

## Test a change before redrawing the organization

Choose one bounded workflow. Record the current outcome, total effort, waiting time, and failure modes. Agree on delegation and review responsibilities. Run a limited comparison, disclose other changes that could affect the result, and inspect the cases that got worse as well as the average.

Before expanding, answer: did the outcome improve, who gained or absorbed work, and what new dependency did the team create? A favorable result supports the tested scope. Extending it to another workflow is a new decision.

Use [the cost of a completed task](/notes/cost-of-a-completed-task/) to make the economics explicit, and [the manager’s role](/notes/managing-teams-with-generative-ai/) to connect the workflow to coaching and accountability. More reading is available in [Leadership & Organizations](/leadership/).
