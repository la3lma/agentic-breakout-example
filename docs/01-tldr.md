# TL;DR

This repository is a worked example of a document-stack method for agentic software development.

The concrete product is a browser-only JavaScript Breakout game. It runs as static web content, stores a single high score in the user's browser with `localStorage`, and intentionally avoids accounts, servers, multi-user scoring, or a global leaderboard.

The method is demonstrated by keeping a complete document stack:

- source instructions
- TL;DR
- concept document
- product requirements document
- architecture document
- execution plan with issue and PR links
- lab notebook
- evidence site with screenshots and gameplay videos

The execution plan starts with GitHub issue links. As each implementation use case is completed through a pull request, the plan graph is updated to link to the PR instead. Playwright captures static screenshots and short MP4 gameplay clips so the evidence can be inspected after the fact.

