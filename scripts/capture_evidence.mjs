import { chromium } from "@playwright/test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const port = 4173;
const baseURL = `http://127.0.0.1:${port}`;
const evidenceDir = path.join(root, "evidence");
const screenshotsDir = path.join(evidenceDir, "assets/screenshots");
const videosDir = path.join(evidenceDir, "assets/videos");

await mkdir(screenshotsDir, { recursive: true });
await mkdir(videosDir, { recursive: true });

const server = spawn(process.execPath, ["scripts/serve_static.mjs", String(port)], {
  cwd: root,
  stdio: ["ignore", "pipe", "pipe"],
});

server.stdout.on("data", (chunk) => process.stdout.write(`[server] ${chunk}`));
server.stderr.on("data", (chunk) => process.stderr.write(`[server] ${chunk}`));

await waitForServer(baseURL);

const browser = await chromium.launch();

try {
  await captureScreenshots(browser);
  await captureVideos(browser);
  await writeEvidenceIndex();
} finally {
  await browser.close();
  server.kill("SIGTERM");
}

async function captureScreenshots(browserInstance) {
  const page = await browserInstance.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(baseURL);
  await page.screenshot({ path: path.join(screenshotsDir, "01-ready.png"), fullPage: true });

  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(450);
  await page.keyboard.up("ArrowRight");
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(screenshotsDir, "02-playing.png"), fullPage: true });

  await page.evaluate(() => window.__breakout.recordScore(1200));
  await page.screenshot({ path: path.join(screenshotsDir, "03-high-score.png"), fullPage: true });
  await page.close();

  const mobile = await browserInstance.newPage({ viewport: { width: 390, height: 740 }, isMobile: true });
  await mobile.goto(baseURL);
  await mobile.evaluate(() => window.__breakout.startGame());
  await mobile.waitForTimeout(400);
  await mobile.screenshot({ path: path.join(screenshotsDir, "04-mobile.png"), fullPage: true });
  await mobile.close();
}

async function captureVideos(browserInstance) {
  await rm(videosDir, { recursive: true, force: true });
  await mkdir(videosDir, { recursive: true });

  const desktopContext = await browserInstance.newContext({
    viewport: { width: 1280, height: 900 },
    recordVideo: { dir: videosDir, size: { width: 1280, height: 900 } },
  });
  const desktop = await desktopContext.newPage();
  await desktop.goto(baseURL);
  await desktop.getByRole("button", { name: "Start", exact: true }).click();
  await playForAWhile(desktop);
  const desktopVideo = desktop.video();
  await desktop.close();
  await desktopContext.close();
  await saveAsMp4(desktopVideo, "desktop-gameplay");

  const mobileContext = await browserInstance.newContext({
    viewport: { width: 390, height: 740 },
    isMobile: true,
    recordVideo: { dir: videosDir, size: { width: 390, height: 740 } },
  });
  const mobile = await mobileContext.newPage();
  await mobile.goto(baseURL);
  await mobile.evaluate(() => window.__breakout.startGame());
  await mobile.waitForTimeout(900);
  await mobile.evaluate(() => {
    window.__breakout.game.paddle.x = 80;
  });
  await mobile.waitForTimeout(900);
  await mobile.evaluate(() => {
    window.__breakout.game.paddle.x = 620;
  });
  await mobile.waitForTimeout(900);
  const mobileVideo = mobile.video();
  await mobile.close();
  await mobileContext.close();
  await saveAsMp4(mobileVideo, "mobile-gameplay");
}

async function saveAsMp4(video, basename) {
  const webmPath = path.join(videosDir, `${basename}.webm`);
  const mp4Path = path.join(videosDir, `${basename}.mp4`);
  await video.saveAs(webmPath);
  convertWebmToMp4(webmPath, mp4Path);
  await video.delete();
  await rm(webmPath, { force: true });
}

function convertWebmToMp4(webmPath, mp4Path) {
  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      webmPath,
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "23",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      mp4Path,
    ],
    { encoding: "utf8" },
  );

  if (result.status !== 0) {
    throw new Error(`ffmpeg failed for ${webmPath}:\n${result.stderr}`);
  }
}

async function playForAWhile(page) {
  for (const key of ["ArrowRight", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight"]) {
    await page.keyboard.down(key);
    await page.waitForTimeout(650);
    await page.keyboard.up(key);
  }
  await page.waitForTimeout(500);
}

async function waitForServer(url) {
  const started = Date.now();
  while (Date.now() - started < 10_000) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Keep waiting.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Server did not start at ${url}`);
}

async function writeEvidenceIndex() {
  const generatedAt = new Date().toISOString();
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Agentic Breakout Evidence</title>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f5f7fa;
      color: #172026;
      line-height: 1.5;
    }
    header {
      background: #152238;
      color: white;
      padding: 24px 32px;
    }
    main {
      padding: 22px;
      display: grid;
      gap: 20px;
    }
    section {
      background: white;
      border: 1px solid #d8dee8;
      border-radius: 8px;
      padding: 18px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }
    figure {
      margin: 0;
      border: 1px solid #d8dee8;
      border-radius: 8px;
      overflow: hidden;
      background: #fbfcfe;
    }
    img, video {
      width: 100%;
      display: block;
      background: #111317;
    }
    figcaption {
      padding: 10px 12px;
      font-weight: 700;
    }
    a {
      color: #315f9f;
    }
  </style>
</head>
<body>
  <header>
    <h1>Agentic Breakout Evidence</h1>
    <p>Generated ${generatedAt}</p>
  </header>
  <main>
    <section>
      <h2>Implementation Trail</h2>
      <ul>
        <li><a href="https://github.com/la3lma/agentic-breakout-example/pull/6">PR #6: Bootstrap document stack and live plan</a></li>
        <li><a href="https://github.com/la3lma/agentic-breakout-example/pull/7">PR #7: Implement playable Breakout core</a></li>
        <li><a href="https://github.com/la3lma/agentic-breakout-example/pull/8">PR #8: Add single-browser high score</a></li>
        <li><a href="https://github.com/la3lma/agentic-breakout-example/pull/9">PR #9: Polish responsive Breakout input</a></li>
        <li><a href="https://github.com/la3lma/agentic-breakout-example/pull/10">PR #10: Capture evidence site and final graph</a></li>
      </ul>
    </section>

    <section>
      <h2>Screenshots</h2>
      <div class="grid">
        <figure>
          <img src="assets/screenshots/01-ready.png" alt="Breakout ready state">
          <figcaption>Ready state</figcaption>
        </figure>
        <figure>
          <img src="assets/screenshots/02-playing.png" alt="Breakout in play">
          <figcaption>Game in play</figcaption>
        </figure>
        <figure>
          <img src="assets/screenshots/03-high-score.png" alt="Breakout high score state">
          <figcaption>High score persisted in browser</figcaption>
        </figure>
        <figure>
          <img src="assets/screenshots/04-mobile.png" alt="Breakout narrow viewport">
          <figcaption>Narrow viewport</figcaption>
        </figure>
      </div>
    </section>

    <section>
      <h2>Gameplay Clips</h2>
      <div class="grid">
        <figure>
          <video controls src="assets/videos/desktop-gameplay.mp4"></video>
          <figcaption>Desktop gameplay clip</figcaption>
        </figure>
        <figure>
          <video controls src="assets/videos/mobile-gameplay.mp4"></video>
          <figcaption>Mobile-width gameplay clip</figcaption>
        </figure>
      </div>
    </section>
  </main>
</body>
</html>
`;

  await writeFile(path.join(evidenceDir, "index.html"), html);
  console.log("Generated evidence/index.html");
}
