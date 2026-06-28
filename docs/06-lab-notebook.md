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
