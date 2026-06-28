import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const plan = await readFile(path.join(root, "docs/05-execution-plan.md"), "utf8");
const notebook = await readFile(path.join(root, "docs/06-lab-notebook.md"), "utf8");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let inCode = false;
  let codeLang = "";
  let code = [];
  let inList = false;

  function closeList() {
    if (inList) {
      html.push("</ul>");
      inList = false;
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
        inCode = true;
        codeLang = fence[1] || "";
      }
      continue;
    }

    if (inCode) {
      code.push(line);
      continue;
    }

    if (line.startsWith("# ")) {
      closeList();
      html.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
    } else if (line.startsWith("## ")) {
      closeList();
      html.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
    } else if (line.startsWith("### ")) {
      closeList();
      html.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
    } else if (line.startsWith("- ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${linkify(escapeHtml(line.slice(2)))}</li>`);
    } else if (line.trim() === "") {
      closeList();
    } else {
      closeList();
      html.push(`<p>${linkify(escapeHtml(line))}</p>`);
    }
  }

  closeList();
  return html.join("\n");
}

function linkify(value) {
  return value.replace(
    /(https:\/\/github\.com\/la3lma\/agentic-breakout-example\/(?:issues|pull)\/\d+)/g,
    '<a href="$1">$1</a>',
  );
}

const now = new Date().toISOString();
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Agentic Breakout Plan</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #172026;
      --muted: #5b6670;
      --line: #d7dde3;
      --paper: #f7f9fb;
      --panel: #ffffff;
      --accent: #315f9f;
    }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--paper);
      color: var(--ink);
      line-height: 1.5;
    }
    header {
      padding: 24px 32px;
      background: #142033;
      color: white;
    }
    header p {
      margin: 4px 0 0;
      color: #c7d2e2;
    }
    main {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
      gap: 18px;
      padding: 20px;
    }
    section {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 18px 20px;
      overflow: auto;
    }
    h1, h2, h3 {
      line-height: 1.2;
    }
    h1 {
      margin-top: 0;
    }
    a {
      color: var(--accent);
    }
    pre {
      background: #f0f3f6;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 12px;
      overflow: auto;
    }
    .mermaid {
      background: white;
    }
    .timestamp {
      color: var(--muted);
      font-size: 13px;
    }
    @media (max-width: 900px) {
      main {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>Agentic Breakout Plan</h1>
    <p>Live generated view of the execution plan and lab notebook.</p>
    <p class="timestamp">Generated ${escapeHtml(now)}</p>
  </header>
  <main>
    <section>
      ${markdownToHtml(plan)}
    </section>
    <section>
      ${markdownToHtml(notebook)}
    </section>
  </main>
  <script type="module">
    import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
    mermaid.initialize({ startOnLoad: true, securityLevel: "loose" });
  </script>
</body>
</html>
`;

await mkdir(path.join(root, "site"), { recursive: true });
await writeFile(path.join(root, "site/plan.html"), html);
console.log("Generated site/plan.html");

