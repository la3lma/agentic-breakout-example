# Concept Document

## Idea

Build a small, polished implementation of classic Breakout as a JavaScript game and use the build itself as an example of document-stack-driven agentic development.

The repository should be readable as both:

- a playable game project
- a concrete example of the methodology that produced it
- a polished public documentation site that presents the method, the plan, the evidence, and the playable artifact together

## Context

The parent paper describes a way to steer agentic development with a stack of documents, small use cases, explicit pre- and post-conditions, dependency graphs, evidence, and a lab notebook. Breakout is intentionally small enough that the full method can be demonstrated without drowning the reader in product complexity.

## Success Criteria

- A public GitHub repository exists under `la3lma`.
- The repository is checked out under `~/git`.
- The game runs in a browser as static JavaScript.
- The player can move a paddle, break bricks, score points, lose lives, pause, restart, win, and lose.
- The high score persists for one browser/user via `localStorage`.
- The document stack and lab notebook describe the work.
- GitHub issues represent the implementation use cases.
- Pull requests implement the use cases.
- The execution graph links to issues first, then to PRs as they exist.
- Playwright captures screenshots and short MP4 clips.
- A static evidence page presents those artifacts.
- A GitHub Pages site presents the TL;DR, concept document, PRD, architecture, plan, lab notebook, evidence, and playable game.
- The repository README points readers to the Pages site and includes a representative game screenshot.
- The parent paper manuscript points to this repository as a public worked example.

## Non-Goals

- No server backend.
- No user accounts.
- No networked multiplayer.
- No global leaderboard.
- No elaborate asset pipeline.
