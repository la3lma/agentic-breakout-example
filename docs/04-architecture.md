# Architecture Document

## Overview

The game is a static browser application.

```mermaid
flowchart LR
  Browser[Browser]
  HTML[index.html]
  CSS[style.css]
  JS[game.js]
  Storage[(localStorage)]
  Evidence[Playwright evidence capture]
  Site[Static evidence pages]
  Docs[Generated documentation site]
  Pages[GitHub Pages]

  Browser --> HTML
  HTML --> CSS
  HTML --> JS
  JS --> Storage
  Evidence --> Browser
  Evidence --> Site
  Site --> Docs
  Docs --> Pages
```

## Components

- `index.html`: game shell and UI.
- `src/styles.css`: visual presentation and responsive layout.
- `src/game.js`: game state, rendering, controls, collisions, score, lives, and high-score persistence.
- `evidence/`: static evidence pages, screenshots, videos, and notes.
- `site/`: generated public documentation site for local inspection and GitHub Pages publication.
- `.github/workflows/`: GitHub Pages publication workflow.
- `scripts/`: utility scripts for rendering the documentation site, refreshing the live plan, serving static files, and capturing evidence.
- `docs/`: document stack and lab notebook.

## Runtime Model

The game uses a `requestAnimationFrame` loop. State lives in JavaScript objects. The canvas is redrawn every frame. Input updates the paddle target or paddle velocity. High score is read from and written to `localStorage`.

## Evidence Model

Playwright starts or connects to a local static server, loads the game, interacts with it briefly, captures screenshots, records short MP4 clips, and writes a static `evidence/index.html` page that links the artifacts.

## Documentation Publication Model

The documentation site generator reads the Markdown document stack, the evidence assets, and the browser game files. It writes a static site under `site/` with a presentation-style overview, browsable document pages, a compact lifecycle legend for the execution graph, a full evidence browser, and an embedded playable game. GitHub Pages publishes that generated directory using the repository workflow.
