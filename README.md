# swapupg — Small apps. Clear ideas.

The personal project homepage at [swapupg.github.io](https://swapupg.github.io/).

## Purpose

A home for useful, open-source applications. Visitors can read a short introduction, discover a project through a screenshot and explanation, try it, view its source, and find the creator on GitHub. Agent Explainer is the first featured project.

## Structure

- `index.html`: accessible introduction, project cards, About section, and GitHub links.
- `styles.css`: responsive layout, system light/dark themes, keyboard focus, and reduced-motion support.
- `assets/`: project screenshot, icons, and social preview. The screenshot comes from the Agent Explainer project.
- No dependencies, build step, account requirements, forms, third-party fonts, or analytics. The homepage works without JavaScript.

The small inline script preserves old root links beginning with `#/experiment/`, forwarding them to Agent Explainer with the same hash. Normal visits and the `#projects` and `#about` anchors stay on the homepage. If a browser incorrectly returns to the top after a section-link reload, it restores the selected section. Query parameters are not forwarded to the app. The existing [Agent Explainer site](https://swapupg.github.io/agent-explainer/) is deployed independently.

## Add a project

Copy the `article.project-card` in the Projects section. Give the new card a unique heading ID, then replace its title, description, status, screenshot (with accurate alt text), demo link, and source link. Include only projects that visitors can actually try. Match screenshot dimensions to the image file and verify the card on mobile.

## Preview and publish

Run `python3 -m http.server 4175` from this directory, then open `http://localhost:4175/`. The application link points to `/agent-explainer/`; it works on the public domain and requires the app to be served at that path for a complete local journey.

GitHub Pages publishes the root of `main`, with `.nojekyll` preserving static files. Push a commit to deploy, inspect the Pages workflow, and verify the live homepage afterward.

## Verification and recovery

Check navigation, keyboard focus, mobile overflow, image alternatives, light/dark contrast, reduced motion, no-JavaScript behavior, the project launch, and old root experiment links. Verify both the homepage and `/agent-explainer/` after publishing. Physical devices and manual screen-reader use require separate verification.

The previous redirect is preserved at commit `6759015024d79940dc5ac1734998703d2747e4ff`. Revert the homepage change and push to restore it. The app itself is maintained in a separate repository and is unaffected by a homepage rollback.

MIT licensed; see [LICENSE](LICENSE).
