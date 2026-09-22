# Search discovery: first month

Started September 21, 2026. Submission helps discovery; it does not guarantee indexing, ranking, or traffic. Use Search Console rather than adding tracking scripts.

## Week 1: discovery

- GitHub profile website: updated to `https://modelfieldnotes.com` and read back.
- LinkedIn contact website: added `https://modelfieldnotes.com` as a Blog.
- Both relevant GitHub repositories already link to the canonical domain.
- Search Console Domain property: ownership verified on September 22, 2026 using an apex TXT record in Namecheap. Website, email, and GitHub verification DNS records were preserved.
- Sitemap `https://modelfieldnotes.com/sitemap-index.xml`: submitted once; Google reported Success and “Sitemap index processed successfully” on September 22.
- Google accepted one indexing request for the homepage, `/notes/what-changes-when-ai-can-do-the-work/`, `/fieldbook/`, and `/projects/agent-explainer/`. Before the requests, the first three were unknown to Google; the project was discovered but not indexed. Acceptance is not confirmation of indexing. Do not resubmit solely to increase priority. Check actual status during the scheduled October 12 review.

## Week 2: a concrete demonstration

Target: September 28. [Captioned 30-second MP4](../../public/media/agent-explainer-retry-demo.mp4), with a [plain-text description](../../public/media/agent-explainer-retry-demo.txt). The source is the actual Agent Explainer screen recording in `swapupg/agent-explainer/docs/media/duplicate-action.webm`; added captions explain the sequence. It is a deterministic teaching simulation, not a live-model benchmark. There is no audio or invented result.

LinkedIn post copy:

> A timeout is not proof that an action failed.
>
> A support tool can create a ticket successfully, then lose the response. If an agent retries blindly, one intended action becomes two tickets.
>
> I built Agent Explainer to make failures like this visible. This short simulation shows the same request before and after one repair: reuse an idempotency key for the same intended operation.
>
> The server must support that key and return the stored result without repeating the write. A key in a prompt alone cannot prevent duplicates.
>
> Watch the failure, apply the repair, and inspect what actually changed:
> https://modelfieldnotes.com/fieldbook/duplicate-action/
>
> Free, open source, and no API keys. These are deterministic simulations, not measured model results.

Publish to Swapnil's LinkedIn profile with the video, once. Check recent activity for duplicates before posting; record the resulting post URL. Do not send direct messages or cross-post to unrelated communities. Community sharing should answer an existing question and disclose the author's involvement.

## Week 3: something useful to keep

The cost-per-successful-task calculator is being delivered early with this release at `/tools/task-cost/`, linked from the cost essay and Projects. It includes model, tool, infrastructure, and optional human-review costs across the full batch; comparison requires the same attempted-task count and acceptance rule. Values stay in the browser. Initial numbers are clearly labeled invented examples.

October 5 LinkedIn post copy:

> The cheapest AI attempt is not always the cheapest useful result.
>
> An illustrative example: one design spends $3 to complete 40 of 100 tasks. Another spends $5 to complete 90. Their costs per successful task are $0.075 and about $0.0556 respectively. These are invented numbers, not model benchmarks.
>
> I added a free calculator to Model Fieldnotes so you can use your own batch totals, include tools and human review, and compare completion rates alongside cost. Define the acceptance rule first, count failures and retries in the cost, and compare equivalent tasks.
>
> All calculation happens in your browser. No account, uploads, or API key.
> https://modelfieldnotes.com/tools/task-cost/
>
> Cost per success is one decision input; quality, safety, and latency still need separate evaluation.

Three Codex thread follow-ups are scheduled for Mondays at 9 a.m. Eastern: September 28 for the demo, October 5 for the calculator explanation, and October 12 for the search review. These are scheduled attempts, not evidence that posts are already published. They require available browser sessions and report blockers instead of inventing completion.

## Week 4: use actual evidence

Target: October 12. Inspect Search Console ownership, sitemap processing, page indexing, and Search performance. Report the actual available date range, impressions, clicks, queries, and landing pages. If data is sparse, say so; do not infer rankings from an empty report. Improve titles, internal links, or explanations only where the observed query and page intent support it. Record changes and compare equivalent periods later.

Also record substantive external issues, citations, contributions, and voluntary feedback when actually observed. Do not manufacture engagement. Existing editorial schedules remain unchanged; signed viewpoints require human editorial judgment.

## Official references

- [Verify site ownership](https://support.google.com/webmasters/answer/9008080)
- [Manage a sitemap in Search Console](https://support.google.com/webmasters/answer/7451001)
- [Request crawling](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- [Search performance](https://support.google.com/webmasters/answer/7576553)
- [Helpful, reliable content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
