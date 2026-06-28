# Product Requirements Document

## Product

A single-page JavaScript Breakout game that can be opened in a browser and played immediately, accompanied by a polished documentation site that presents the method, documents, evidence, and playable artifact.

## Target User

A developer or reader evaluating the document-stack methodology. The game should be simple to run and pleasant enough to play for a short demonstration.

## Functional Requirements

- Render a Breakout playfield with paddle, ball, walls, and bricks.
- Support keyboard controls.
- Support pointer/touch paddle movement where available.
- Let the player start, pause/resume, and restart the game.
- Track current score.
- Track remaining lives.
- Detect ball, wall, paddle, and brick collisions.
- Remove bricks when hit.
- End the round when all bricks are cleared.
- End the game when lives are exhausted.
- Store a single best score in `localStorage`.
- Restore the best score after reload in the same browser.

## Evidence Requirements

- Capture an initial game screenshot.
- Capture a screenshot after gameplay has begun.
- Capture a screenshot at a narrow/mobile viewport.
- Capture at least one short MP4 clip showing real-time gameplay.
- Publish the captures through a static evidence page.

## Documentation Requirements

- Keep the document stack in `docs/`.
- Keep the lab notebook in `docs/06-lab-notebook.md`.
- Keep an execution graph in the plan document.
- Provide a generated `site/plan.html` view of the plan.
- Provide a generated GitHub Pages site with overview, TL;DR, vision/concept, PRD, architecture, source instructions, execution plan, lab notebook, evidence browser, and playable game.
- Keep the use-case graph legend compact, using small lifecycle color chips instead of a large graph block.
- Provide a Makefile target that refreshes the plan tab in the system browser via AppleScript.
- Provide a Makefile target that publishes the generated site through GitHub Pages.
- Point the repository README to the Pages site and show a game screenshot.
