---
title: 'Verifying completion before saying “done”'
description: 'A tool can accept a request before the result exists. Separate acceptance, pending work, and completion before telling the user the task is finished.'
published: 2026-09-21
reviewed: 2026-09-21
status: published
author: Swapnil
authorship: human
topics: [Agents]
order: 3
evidence: Simulation-based guide
scenario:
  id: premature-done
  revision: 1
sources:
  - title: 'MDN: HTTP 202 Accepted'
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/202
  - title: 'Microsoft: Asynchronous Request-Reply pattern'
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/asynchronous-request-reply
  - title: 'Agent Explainer: premature-done revision 1 source'
    url: https://github.com/swapupg/agent-explainer/blob/fc3aae0e1b99520ac33c1e1e40c7759439b429ac/src/scenarios/premature-done.ts
---

## The engineering question

**What evidence must exist before an agent tells a user that a task is complete?**

A report request can be valid and successfully submitted while the report is still unavailable. The user asked for the finished report. Treating a successful submission as the finished task creates a gap between the agent's message and the result the user can actually use.

## Initial conditions

The user requests a weekly report. No report exists. The tool accepts the request, creates a background job, and returns an acknowledgement. The job then remains pending.

Both variants begin with these conditions. The baseline treats the acknowledgement as enough evidence to announce success. The repaired variant reads the job status, keeps the task open while pending, and verifies the report after a scripted completion event.

In the activity timeline, select the acceptance event and inspect the world panel. Then compare the moment when each variant makes its final claim.

## Baseline versus repair

| Observation                    | Baseline                               | With the repair                   |
| ------------------------------ | -------------------------------------- | --------------------------------- |
| Request accepted               | Yes                                    | Yes                               |
| Pending work recognized        | No verification before the final claim | Status checked; task remains open |
| Status when “ready” is claimed | Pending                                | Completed                         |
| Report when “ready” is claimed | Absent                                 | Exists                            |

These outcomes come from scripted virtual steps, not measured service latency. Polling does not cause the work to finish: in the repaired path, the simulation explicitly advances the worker before the next status check.

## Why the repair works

The repair changes the evidence required for the completion message. The agent first sees a pending status and reports that work is still underway. It later observes both a completed job and an existing report before claiming success.

[MDN describes HTTP 202](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/202) as acceptance for processing, without a guarantee that processing will succeed. The lab uses that distinction to separate a tool-call outcome from the user's acceptance criterion.

## Production considerations

Define “done” in terms of an observable result before designing the agent's final message. For a report, that might require a completed job and a retrievable artifact associated with the correct request. An independent check should inspect that evidence rather than ask the agent whether it thinks it succeeded.

[Microsoft's asynchronous request-reply pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/asynchronous-request-reply) describes a status endpoint and guidance for polling, including retry timing. Real implementations also need deadlines, backoff, failure and cancellation states, and a way to report uncertainty. A job that never finishes must not produce an endless wait or an invented success message.

Keep submission errors, status-read errors, and job failures distinct. A transient failure to read status is not evidence that the original job should be submitted again. That decision can reintroduce the [duplicate-action problem](/fieldbook/duplicate-action/).

## What this does not establish

The simulation guarantees the repaired job will finish at its next scripted worker step. It does not test queues, callbacks, flaky storage, artifact permissions, or real-model behavior. It also does not measure the cost or latency introduced by verification.

For your own workflow, include jobs that complete, fail, time out, and are accepted without ever producing an accessible result. Check the world state at the time of the completion claim. A result arriving later does not make an earlier statement accurate.

## Related reading

- [The cost of a completed task](/notes/cost-of-a-completed-task/) helps account for verification calls and failed attempts.
- [How to compare AI models for your application](/notes/comparing-ai-models/) starts with task-specific success criteria.
- [Retrying without duplicate actions](/fieldbook/duplicate-action/) explains why another submission needs careful handling.
