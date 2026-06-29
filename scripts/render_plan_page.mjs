import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const siteDir = path.join(root, "site");
const docsDir = path.join(root, "docs");

const docPages = [
  {
    file: "00-source-instructions.md",
    slug: "source-instructions",
    title: "Source Instructions",
    nav: "Source",
    summary: "The human prompt that seeded the repository and later publication requirements.",
  },
  {
    file: "01-tldr.md",
    slug: "tldr",
    title: "TL;DR",
    nav: "TL;DR",
    summary: "A short description of the game, method, document stack, and evidence trail.",
  },
  {
    file: "02-concept.md",
    slug: "vision",
    title: "Vision Document",
    nav: "Vision",
    summary: "The idea, context, success criteria, and non-goals for the worked example.",
  },
  {
    file: "03-prd.md",
    slug: "prd",
    title: "Product Requirements",
    nav: "PRD",
    summary: "Functional, evidence, and documentation requirements for the Breakout game.",
  },
  {
    file: "04-architecture.md",
    slug: "architecture",
    title: "Architecture",
    nav: "Architecture",
    summary: "The static browser game, evidence capture, and documentation publishing model.",
  },
  {
    file: "05-execution-plan.md",
    slug: "plan",
    title: "Execution Plan",
    nav: "Plan",
    summary: "Use cases, dependency graph, issue links, PR links, and lifecycle status.",
  },
  {
    file: "06-lab-notebook.md",
    slug: "lab-notebook",
    title: "Lab Notebook",
    nav: "Notes",
    summary: "Human instructions, agent notes, decisions, detours, and validation observations.",
  },
];

const evidenceScreenshots = [
  ["01-ready.png", "Ready State", "The initial game view before play starts."],
  ["02-playing.png", "Game In Play", "The ball, paddle, score, and bricks during live play."],
  ["03-high-score.png", "High Score", "A persisted browser-local best score."],
  ["04-mobile.png", "Narrow Viewport", "The game running in a mobile-width layout."],
];

const evidenceVideos = [
  ["desktop-gameplay.mp4", "Desktop Gameplay", "A short desktop-width gameplay capture."],
  ["mobile-gameplay.mp4", "Mobile-Width Gameplay", "A short mobile-width gameplay capture."],
];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function linkify(value) {
  return value.replace(
    /(https:\/\/[^\s<)]+)/g,
    '<a href="$1">$1</a>',
  );
}

function inlineMarkdown(value) {
  return linkify(escapeHtml(value))
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let inCode = false;
  let codeLang = "";
  let code = [];
  let inList = false;
  let inQuote = false;

  function closeList() {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  }

  function closeQuote() {
    if (inQuote) {
      html.push("</blockquote>");
      inQuote = false;
    }
  }

  for (const line of lines) {
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      if (inCode) {
        const raw = code.join("\n");
        if (codeLang === "mermaid") {
          html.push(`<pre class="mermaid">${escapeHtml(raw)}</pre>`);
        } else {
          html.push(`<pre><code>${escapeHtml(raw)}</code></pre>`);
        }
        inCode = false;
        codeLang = "";
        code = [];
      } else {
        closeList();
        closeQuote();
        inCode = true;
        codeLang = fence[1] || "";
      }
      continue;
    }

    if (inCode) {
      code.push(line);
      continue;
    }

    if (line.trim().startsWith("<") && line.trim().endsWith(">")) {
      closeList();
      closeQuote();
      html.push(line);
      continue;
    }

    if (line.startsWith(">")) {
      closeList();
      if (!inQuote) {
        html.push("<blockquote>");
        inQuote = true;
      }
      const quote = line.replace(/^>\s?/, "");
      if (quote.trim() === "") {
        html.push("<br>");
      } else {
        html.push(`<p>${inlineMarkdown(quote)}</p>`);
      }
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (image) {
      closeList();
      closeQuote();
      html.push(`<figure><img src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}"></figure>`);
    } else if (line.startsWith("# ")) {
      closeList();
      closeQuote();
      html.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`);
    } else if (line.startsWith("## ")) {
      closeList();
      closeQuote();
      html.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
    } else if (line.startsWith("### ")) {
      closeList();
      closeQuote();
      html.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`);
    } else if (line.startsWith("- ")) {
      closeQuote();
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
    } else if (line.trim() === "") {
      closeList();
      closeQuote();
    } else {
      closeList();
      closeQuote();
      html.push(`<p>${inlineMarkdown(line)}</p>`);
    }
  }

  closeList();
  closeQuote();
  return html.join("\n");
}

function navigation(prefix, active) {
  const items = [
    ["index.html", "Overview"],
    ["game/index.html", "Play"],
    ["evidence/index.html", "Evidence"],
    ["plan.html", "Plan"],
    ["docs/lab-notebook.html", "Notes"],
    ["docs/index.html", "Docs"],
    ["https://github.com/la3lma/agentic-breakout-example", "GitHub"],
  ];

  return items
    .map(([href, label]) => {
      const isExternal = href.startsWith("https://");
      const target = isExternal ? href : `${prefix}${href}`;
      const current = active === label ? ' aria-current="page"' : "";
      const external = isExternal ? ' rel="noopener"' : "";
      return `<a href="${target}"${current}${external}>${label}</a>`;
    })
    .join("");
}

function pageShell({ title, description, body, prefix = "", active = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | Agentic Breakout</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="${prefix}assets/site.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="${prefix}index.html">Agentic Breakout</a>
    <nav class="site-nav" aria-label="Site navigation">
      ${navigation(prefix, active)}
    </nav>
  </header>
  ${body}
  <script type="module">
    import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
    mermaid.initialize({ startOnLoad: true, securityLevel: "loose" });
  </script>
</body>
</html>
`;
}

function actionLink(href, label) {
  return `<a class="action" href="${href}">${label}</a>`;
}

function card(title, body, href, label = "Open") {
  return `<article class="card">
  <h3>${escapeHtml(title)}</h3>
  <p>${escapeHtml(body)}</p>
  <a href="${href}">${escapeHtml(label)}</a>
</article>`;
}

async function readDoc(page) {
  return readFile(path.join(docsDir, page.file), "utf8");
}

async function writeCss() {
  const css = `:root {
  color-scheme: light;
  --ink: #172026;
  --muted: #5c6873;
  --paper: #f5f7fa;
  --panel: #ffffff;
  --line: #d7dde5;
  --nav: #132238;
  --accent: #2f6f73;
  --accent-strong: #194c4f;
  --done-bg: #d9f7d9;
  --done-line: #238636;
  --ready-bg: #fff3bf;
  --ready-line: #b08900;
  --running-bg: #ffe0b2;
  --running-line: #c26a00;
  --review-bg: #dbeafe;
  --review-line: #2563eb;
  --blocked-bg: #ffd6d6;
  --blocked-line: #b42318;
  --deferred-bg: #eadcff;
  --deferred-line: #7e3fb2;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.55;
}

a {
  color: var(--accent-strong);
  font-weight: 700;
}

.site-header {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
  background: var(--nav);
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand,
.site-nav a {
  color: white;
  text-decoration: none;
}

.brand {
  font-weight: 900;
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}

.site-nav a {
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 6px;
  padding: 5px 9px;
  font-size: 0.9rem;
}

.site-nav a[aria-current="page"],
.site-nav a:hover {
  background: rgba(255, 255, 255, 0.14);
}

.hero {
  min-height: min(560px, calc(100vh - 60px));
  padding: clamp(48px, 8vw, 96px) 28px;
  display: grid;
  align-content: end;
  background-size: cover;
  background-position: center;
  color: white;
}

.hero h1 {
  max-width: 880px;
  margin: 0;
  font-size: clamp(2.4rem, 8vw, 6rem);
  line-height: 0.95;
}

.hero p {
  max-width: 760px;
  margin: 18px 0 0;
  font-size: clamp(1.05rem, 2vw, 1.3rem);
  color: #eaf2f4;
}

.kicker {
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.78rem;
  font-weight: 900;
  color: #c8efe5;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.action {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.52);
  border-radius: 7px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.13);
  color: white;
  text-decoration: none;
}

.section {
  padding: 28px;
}

.section > h2,
.doc h1:first-child {
  margin-top: 0;
}

.intro-grid,
.doc-grid,
.evidence-grid,
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.card,
.doc,
.side-panel,
figure,
.game-frame-wrap {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
}

.card {
  padding: 18px;
}

.card h3 {
  margin: 0 0 8px;
}

.card p {
  color: var(--muted);
}

.doc-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.32fr);
  gap: 18px;
  padding: 22px;
}

.doc {
  padding: 22px;
  overflow: auto;
}

.side-panel {
  padding: 18px;
  align-self: start;
  position: sticky;
  top: 78px;
}

.side-panel ul {
  padding-left: 18px;
}

pre {
  background: #f0f3f6;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 12px;
  overflow: auto;
}

code {
  background: #edf1f5;
  border-radius: 4px;
  padding: 1px 4px;
}

pre code {
  background: transparent;
  padding: 0;
}

blockquote {
  margin: 14px 0;
  padding: 2px 16px;
  border-left: 4px solid var(--accent);
  color: #33414d;
  background: #eef5f4;
}

.mermaid {
  background: white;
}

.status-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0 22px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  border-radius: 6px;
  border: 1px solid currentColor;
  padding: 2px 8px;
  font-size: 0.78rem;
  font-weight: 900;
}

.status-done {
  background: var(--done-bg);
  color: #0b3d16;
}

.status-ready {
  background: var(--ready-bg);
  color: #4b3b00;
}

.status-running {
  background: var(--running-bg);
  color: #4a2500;
}

.status-review {
  background: var(--review-bg);
  color: #0f2f70;
}

.status-blocked {
  background: var(--blocked-bg);
  color: #5c1111;
}

.status-deferred {
  background: var(--deferred-bg);
  color: #3a1a5f;
}

figure {
  margin: 0;
  overflow: hidden;
}

figure img,
figure video {
  display: block;
  width: 100%;
  background: #111317;
}

figcaption {
  padding: 12px;
}

figcaption strong {
  display: block;
}

figcaption span {
  display: block;
  margin-top: 3px;
  color: var(--muted);
}

.game-frame-wrap {
  padding: 10px;
}

.game-frame {
  display: block;
  width: 100%;
  height: min(820px, calc(100vh - 130px));
  border: 0;
  border-radius: 6px;
  background: #111317;
}

.timestamp {
  color: var(--muted);
  font-size: 0.85rem;
}

@media (max-width: 860px) {
  .site-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .site-nav {
    justify-content: flex-start;
  }

  .doc-layout {
    grid-template-columns: 1fr;
    padding: 14px;
  }

  .side-panel {
    position: static;
  }
}
`;

  await mkdir(path.join(siteDir, "assets"), { recursive: true });
  await writeFile(path.join(siteDir, "assets/site.css"), css);
}

async function renderHome() {
  const body = `<main>
  <section class="hero" style="background-image: linear-gradient(90deg, rgba(19, 34, 56, 0.92), rgba(19, 34, 56, 0.54), rgba(19, 34, 56, 0.25)), url('evidence/assets/screenshots/02-playing.png');">
    <p class="kicker">Document-stack development example</p>
    <h1>Agentic Breakout Example</h1>
    <p>A playable JavaScript Breakout game built as a worked example of use-case-driven agentic development, with documents, issues, pull requests, evidence captures, and a lab notebook kept together.</p>
    <div class="actions">
      ${actionLink("game/index.html", "Play the game")}
      ${actionLink("evidence/index.html", "Browse evidence")}
      ${actionLink("plan.html", "Open the plan")}
    </div>
  </section>

  <section class="section">
    <h2>What This Demonstrates</h2>
    <div class="intro-grid">
      ${card("TL;DR", "A compact explanation of the worked example and its document stack.", "docs/tldr.html")}
      ${card("Vision", "The concept document explains why Breakout is a useful small target for the method.", "docs/vision.html")}
      ${card("Product Requirements", "The PRD defines the game, evidence, and documentation requirements.", "docs/prd.html")}
      ${card("Execution Plan", "The use-case graph links issues first, then pull requests after completion.", "plan.html")}
      ${card("Lab Notebook", "Notes capture human instructions, agent decisions, detours, and validation.", "docs/lab-notebook.html")}
      ${card("Evidence", "Screenshots and MP4 clips show the game evolving and running in real time.", "evidence/index.html")}
    </div>
  </section>
</main>`;

  await writeFile(
    path.join(siteDir, "index.html"),
    pageShell({
      title: "Project Overview",
      description: "A polished documentation site for the Agentic Breakout worked example.",
      body,
      active: "Overview",
    }),
  );
}

async function renderDocs() {
  await mkdir(path.join(siteDir, "docs"), { recursive: true });

  const docsIndexBody = `<main class="section">
  <h1>Document Stack</h1>
  <p>The project documentation is the working surface for the method: a seed instruction becomes a TL;DR, vision, requirements, architecture, execution plan, and notebook.</p>
  <div class="doc-grid">
    ${docPages.map((page) => card(page.title, page.summary, `${page.slug}.html`, "Read")).join("\n")}
  </div>
</main>`;

  await writeFile(
    path.join(siteDir, "docs/index.html"),
    pageShell({
      title: "Document Stack",
      description: "All documents in the Agentic Breakout document stack.",
      body: docsIndexBody,
      prefix: "../",
      active: "Docs",
    }),
  );

  for (const page of docPages) {
    const markdown = await readDoc(page);
    const body = `<main class="doc-layout">
  <article class="doc">
    ${markdownToHtml(markdown)}
  </article>
  <aside class="side-panel">
    <p class="kicker">Document stack</p>
    <h2>${escapeHtml(page.title)}</h2>
    <p>${escapeHtml(page.summary)}</p>
    <p><a href="index.html">Back to all documents</a></p>
  </aside>
</main>`;

    await writeFile(
      path.join(siteDir, `docs/${page.slug}.html`),
      pageShell({
        title: page.title,
        description: page.summary,
        body,
        prefix: "../",
        active: page.nav === "Notes" ? "Notes" : "Docs",
      }),
    );
  }
}

async function renderPlan() {
  const plan = await readDoc(docPages.find((page) => page.slug === "plan"));
  const notebook = await readDoc(docPages.find((page) => page.slug === "lab-notebook"));
  const body = `<main class="doc-layout">
  <article class="doc">
    ${markdownToHtml(plan)}
  </article>
  <aside class="side-panel">
    <p class="kicker">Live notes</p>
    <h2>Lab Notebook</h2>
    <p>The full notebook records human instructions, agent decisions, detours, and validation observations.</p>
    <p><a href="docs/lab-notebook.html">Open the notes</a></p>
    <h3>Recent Source</h3>
    ${markdownToHtml(notebook).split("<h3>").slice(-3).map((chunk) => `<h3>${chunk}`).join("")}
  </aside>
</main>`;

  await writeFile(
    path.join(siteDir, "plan.html"),
    pageShell({
      title: "Execution Plan",
      description: "Live execution plan with the use-case graph and lab-notebook context.",
      body,
      active: "Plan",
    }),
  );
}

async function renderEvidence() {
  await mkdir(path.join(siteDir, "evidence"), { recursive: true });
  await cp(path.join(root, "evidence/assets"), path.join(siteDir, "evidence/assets"), {
    recursive: true,
    force: true,
  });

  const body = `<main class="section">
  <h1>Evidence</h1>
  <p>The evidence page collects the observable proof requested by the method: implementation links, screenshots, and short MP4 clips of the game running.</p>

  <h2>Implementation Trail</h2>
  <div class="intro-grid">
    ${[
      ["PR #6", "Bootstrap document stack and live plan", "https://github.com/la3lma/agentic-breakout-example/pull/6"],
      ["PR #7", "Implement playable Breakout core", "https://github.com/la3lma/agentic-breakout-example/pull/7"],
      ["PR #8", "Add single-browser high score", "https://github.com/la3lma/agentic-breakout-example/pull/8"],
      ["PR #9", "Polish responsive Breakout input", "https://github.com/la3lma/agentic-breakout-example/pull/9"],
      ["PR #10", "Capture evidence site and final graph", "https://github.com/la3lma/agentic-breakout-example/pull/10"],
      ["PR #12", "Publish documentation site with compact graph legend", "https://github.com/la3lma/agentic-breakout-example/pull/12"],
    ].map(([title, bodyText, href]) => card(title, bodyText, href, "Open")).join("\n")}
  </div>

  <h2>Screenshots</h2>
  <div class="evidence-grid">
    ${evidenceScreenshots.map(([file, title, caption]) => `<figure>
      <img src="assets/screenshots/${file}" alt="${escapeHtml(title)}">
      <figcaption><strong>${escapeHtml(title)}</strong><span>${escapeHtml(caption)}</span></figcaption>
    </figure>`).join("\n")}
  </div>

  <h2>Gameplay Clips</h2>
  <div class="video-grid">
    ${evidenceVideos.map(([file, title, caption]) => `<figure>
      <video controls preload="metadata" src="assets/videos/${file}"></video>
      <figcaption><strong>${escapeHtml(title)}</strong><span>${escapeHtml(caption)}</span></figcaption>
    </figure>`).join("\n")}
  </div>
</main>`;

  await writeFile(
    path.join(siteDir, "evidence/index.html"),
    pageShell({
      title: "Evidence",
      description: "Screenshots, MP4 clips, and implementation links for Agentic Breakout.",
      body,
      prefix: "../",
      active: "Evidence",
    }),
  );
}

async function renderGame() {
  const gameDir = path.join(siteDir, "game");
  await mkdir(gameDir, { recursive: true });
  await cp(path.join(root, "src"), path.join(gameDir, "src"), { recursive: true, force: true });
  await cp(path.join(root, "index.html"), path.join(gameDir, "play.html"), { force: true });

  const body = `<main class="section">
  <h1>Play the Game</h1>
  <p>This is the same browser-only JavaScript Breakout implementation documented by the plan and evidence trail. The best score is local to this browser.</p>
  <div class="game-frame-wrap">
    <iframe class="game-frame" title="Playable Agentic Breakout game" src="play.html"></iframe>
  </div>
</main>`;

  await writeFile(
    path.join(gameDir, "index.html"),
    pageShell({
      title: "Play",
      description: "Playable JavaScript Breakout game.",
      body,
      prefix: "../",
      active: "Play",
    }),
  );
}

async function renderReadme() {
  const readme = await readFile(path.join(root, "README.md"), "utf8");
  const body = `<main class="doc-layout">
  <article class="doc">
    ${markdownToHtml(readme)}
  </article>
  <aside class="side-panel">
    <p class="kicker">Repository</p>
    <h2>README</h2>
    <p>The repository README remains the command-oriented entry point for local development.</p>
  </aside>
</main>`;

  await writeFile(
    path.join(siteDir, "readme.html"),
    pageShell({
      title: "README",
      description: "Repository README for Agentic Breakout.",
      body,
      active: "Docs",
    }),
  );
}

async function renderStaticFiles() {
  await writeFile(path.join(siteDir, ".nojekyll"), "");
}

async function removeStalePages() {
  await rm(siteDir, { recursive: true, force: true });
  await mkdir(siteDir, { recursive: true });
}

await removeStalePages();
await writeCss();
await renderHome();
await renderDocs();
await renderPlan();
await renderEvidence();
await renderGame();
await renderReadme();
await renderStaticFiles();

const generatedFiles = await readdir(siteDir);
console.log(`Generated site/ with ${generatedFiles.length} top-level entries`);
