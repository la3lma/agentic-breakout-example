# Lab Notebook

This notebook records observations, decisions, detours, and human instructions during the build. It is deliberately less formal than the execution plan.

## 2026-06-28

### Human Instruction

The human asked for a public `la3lma` GitHub repository, checked out under `~/git`, containing a JavaScript Breakout implementation built using the document-stack methodology. The game needs a single-browser high score and no multi-user score system.

### Human Instruction

The human explicitly asked for a lab notebook in the document stack. The notebook should include notes made by the agent, by the human, and by the human through the agent. It should capture decisions and explorations even when they wander outside the strict plan/evidence stack.

### Human Instruction

The human asked for the plan document to be open in the system browser as a tab and updated via AppleScript through the Makefile.

### Agent Note

Created public repository `la3lma/agentic-breakout-example` and cloned it to `/Users/rmz/git/agentic-breakout-example`. Created five GitHub issues representing the initial implementation use cases.

### Agent Decision

The live plan page is generated from Markdown using a small dependency-free Node script. This keeps the planning loop available before installing game/test dependencies.

### Agent Decision

The browser refresh mechanism is implemented as a Makefile target invoking AppleScript. The script attempts to refresh an existing tab for the plan URL in common macOS browsers, and opens the URL if no matching tab exists.

### Agent Note

Merged PR #6 for UC-01. The execution graph now links UC-01 to its pull request instead of the original issue.

### Agent Decision

For UC-02, the game core is implemented as a dependency-light static browser app using `canvas` and `requestAnimationFrame`. The first pass deliberately includes score and lives because those are part of core play, but leaves persistent high score for UC-03.

### Agent Note

Added a small Node static server and a Playwright smoke test so the game can be loaded and checked before the later evidence-capture use case.

### Agent Note

Merged PR #7 for UC-02. The execution graph now links UC-02 to its pull request.

### Agent Decision

For UC-03, high score is intentionally one number in `localStorage` under `agentic-breakout.bestScore`. There is no score history, player name, server call, or leaderboard. This matches the single-user, single-browser requirement and keeps the product surface small.

### Agent Note

Merged PR #8 for UC-03. The execution graph now links UC-03 to its pull request.

### Agent Decision

For UC-04, polish is focused on input ergonomics and responsive stability rather than adding game features. The canvas receives focus when play starts, pause/resume state is reflected in the button, and a narrow-viewport Playwright test checks that the playfield remains usable.

### Agent Note

Merged PR #9 for UC-04. The execution graph now links UC-04 to its pull request.

### Agent Decision

For UC-05, the evidence site is generated as static HTML so it can be inspected directly from the repository. Playwright captures four state screenshots and two short gameplay movies. Because Playwright records WebM natively, the capture script converts the recorded clips to MP4 with `ffmpeg` before writing the final evidence page.

### Agent Note

Mobile evidence capture initially used pointer input, but the narrow viewport layout made that brittle for automation. The capture now starts the game through the same browser-visible Breakout API used by tests and moves the paddle directly for a short demonstration clip.

### Agent Note

Opened PR #10 for UC-05. The execution graph and evidence page now link the final use case to the pull request that produced the evidence artifacts.

### Human Instruction

The human asked to extend the plan with a final documentation-site use case. The site should publish the full document stack through GitHub Pages, including TL;DR, vision/concept, PRD, plan, notes, and evidence. The graph legend should become more discrete, using compact color buttons rather than a large legend block.

### Human Instruction

The human clarified that the Pages site should be a polished presentation of what the project is supposed to do. It should include the document stack, a nicely browsable full evidence set, and a playable version of the game.

### Human Instruction

The human explicitly confirmed that this publication pass should be UC-06, and asked for the change to be recorded in the notes file.

### Human Instruction

The human asked for the repository README to point to the Pages site and include a screenshot of the game from the evidence captures.

### Human Instruction

The human asked for the original paper manuscript to include a pointer to this repository as the worked example, and for the Makefile to include a target that publishes the generated site to GitHub Pages.

### Agent Decision

UC-06 is the final publication pass. It keeps the existing issue-to-PR method intact by linking to issue #11 while the work is running, then updating the graph to the PR when the implementation pull request exists.
