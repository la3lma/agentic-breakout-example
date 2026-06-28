import { expect, test } from "@playwright/test";

test("loads and starts the Breakout core", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("game-canvas")).toBeVisible();
  await expect(page.getByTestId("score")).toHaveText("0");
  await expect(page.getByTestId("lives")).toHaveText("3");
  await expect(page.getByTestId("best-score")).toHaveText("0");
  await expect(page.getByTestId("status")).toHaveText("Ready");

  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByTestId("status")).toHaveText("Playing");

  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(300);
  await page.keyboard.up("ArrowRight");

  const state = await page.evaluate(() => ({
    status: window.__breakout.game.state,
    paddleX: window.__breakout.game.paddle.x,
    bricks: window.__breakout.game.bricksRemaining,
  }));

  expect(state.status).toBe("playing");
  expect(state.paddleX).toBeGreaterThan(480);
  expect(state.bricks).toBe(60);
});

test("persists one best score in the browser", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => window.__breakout.recordScore(700));
  await expect(page.getByTestId("score")).toHaveText("700");
  await expect(page.getByTestId("best-score")).toHaveText("700");

  await page.reload();
  await expect(page.getByTestId("score")).toHaveText("0");
  await expect(page.getByTestId("best-score")).toHaveText("700");
});
