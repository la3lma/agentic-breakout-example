const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const livesEl = document.querySelector("#lives");
const bestScoreEl = document.querySelector("#bestScore");
const statusEl = document.querySelector("#status");
const startButton = document.querySelector("#startButton");
const pauseButton = document.querySelector("#pauseButton");
const restartButton = document.querySelector("#restartButton");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const HIGH_SCORE_KEY = "agentic-breakout.bestScore";

const colors = {
  bg: "#090b10",
  grid: "#18202b",
  paddle: "#64b5f6",
  ball: "#f4f7fb",
  wall: "#344154",
  text: "#dce6f3",
  brickRows: ["#ef767a", "#ffd166", "#81c784", "#64b5f6", "#ba9cf7", "#f4a261"],
};

const game = {
  state: "ready",
  score: 0,
  bestScore: loadBestScore(),
  lives: 3,
  bricksRemaining: 0,
  keys: new Set(),
  paddle: {
    width: 138,
    height: 18,
    x: WIDTH / 2 - 69,
    y: HEIGHT - 58,
    speed: 720,
  },
  ball: {
    x: WIDTH / 2,
    y: HEIGHT - 90,
    radius: 9,
    vx: 260,
    vy: -330,
  },
  bricks: [],
  lastTime: 0,
};

function loadBestScore() {
  const raw = localStorage.getItem(HIGH_SCORE_KEY);
  const parsed = Number.parseInt(raw || "0", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function saveBestScore() {
  localStorage.setItem(HIGH_SCORE_KEY, String(game.bestScore));
}

function recordScore(value) {
  game.score = value;
  if (game.score > game.bestScore) {
    game.bestScore = game.score;
    saveBestScore();
  }
  updateHud();
}

function resetBricks() {
  const rows = 6;
  const cols = 10;
  const marginX = 54;
  const top = 72;
  const gap = 10;
  const brickWidth = (WIDTH - marginX * 2 - gap * (cols - 1)) / cols;
  const brickHeight = 26;
  game.bricks = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      game.bricks.push({
        x: marginX + col * (brickWidth + gap),
        y: top + row * (brickHeight + gap),
        width: brickWidth,
        height: brickHeight,
        alive: true,
        color: colors.brickRows[row % colors.brickRows.length],
      });
    }
  }

  game.bricksRemaining = game.bricks.length;
}

function resetBall() {
  game.ball.x = game.paddle.x + game.paddle.width / 2;
  game.ball.y = game.paddle.y - game.ball.radius - 3;
  const direction = Math.random() > 0.5 ? 1 : -1;
  game.ball.vx = 245 * direction;
  game.ball.vy = -335;
}

function resetGame() {
  game.state = "ready";
  game.score = 0;
  game.bestScore = loadBestScore();
  game.lives = 3;
  game.paddle.x = WIDTH / 2 - game.paddle.width / 2;
  resetBricks();
  resetBall();
  updateHud();
  draw();
}

function startGame() {
  if (game.state === "won" || game.state === "lost") {
    resetGame();
  }
  if (game.state === "ready" || game.state === "paused") {
    game.state = "playing";
    game.lastTime = performance.now();
    updateHud();
    canvas.focus();
  }
}

function pauseGame() {
  if (game.state === "playing") {
    game.state = "paused";
  } else if (game.state === "paused") {
    game.state = "playing";
    game.lastTime = performance.now();
  }
  updateHud();
}

function updateHud() {
  scoreEl.textContent = String(game.score);
  livesEl.textContent = String(game.lives);
  bestScoreEl.textContent = String(game.bestScore);
  const status = {
    ready: "Ready",
    playing: "Playing",
    paused: "Paused",
    won: "Cleared",
    lost: "Game Over",
  };
  statusEl.textContent = status[game.state];
  pauseButton.disabled = game.state !== "playing" && game.state !== "paused";
  pauseButton.textContent = game.state === "paused" ? "Resume" : "Pause";
  startButton.disabled = game.state === "playing";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function updatePaddle(dt) {
  let direction = 0;
  if (game.keys.has("ArrowLeft") || game.keys.has("KeyA")) direction -= 1;
  if (game.keys.has("ArrowRight") || game.keys.has("KeyD")) direction += 1;

  game.paddle.x = clamp(
    game.paddle.x + direction * game.paddle.speed * dt,
    18,
    WIDTH - game.paddle.width - 18,
  );
}

function updateBall(dt) {
  const ball = game.ball;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x - ball.radius < 18) {
    ball.x = 18 + ball.radius;
    ball.vx *= -1;
  }
  if (ball.x + ball.radius > WIDTH - 18) {
    ball.x = WIDTH - 18 - ball.radius;
    ball.vx *= -1;
  }
  if (ball.y - ball.radius < 18) {
    ball.y = 18 + ball.radius;
    ball.vy *= -1;
  }

  const paddle = game.paddle;
  const onPaddle =
    ball.x + ball.radius >= paddle.x &&
    ball.x - ball.radius <= paddle.x + paddle.width &&
    ball.y + ball.radius >= paddle.y &&
    ball.y - ball.radius <= paddle.y + paddle.height &&
    ball.vy > 0;

  if (onPaddle) {
    const hit = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
    ball.y = paddle.y - ball.radius - 1;
    ball.vx = hit * 380;
    ball.vy = -Math.max(320, Math.abs(ball.vy) + 8);
  }

  for (const brick of game.bricks) {
    if (!brick.alive) continue;
    const hitBrick =
      ball.x + ball.radius > brick.x &&
      ball.x - ball.radius < brick.x + brick.width &&
      ball.y + ball.radius > brick.y &&
      ball.y - ball.radius < brick.y + brick.height;

    if (hitBrick) {
      brick.alive = false;
      game.bricksRemaining -= 1;
      recordScore(game.score + 100);
      ball.vy *= -1;
      if (game.bricksRemaining === 0) {
        game.state = "won";
      }
      updateHud();
      break;
    }
  }

  if (ball.y - ball.radius > HEIGHT) {
    game.lives -= 1;
    if (game.lives <= 0) {
      game.state = "lost";
    } else {
      game.state = "ready";
      resetBall();
    }
    updateHud();
  }
}

function update(now) {
  const dt = Math.min(0.025, (now - game.lastTime) / 1000 || 0);
  game.lastTime = now;

  if (game.state === "playing") {
    updatePaddle(dt);
    updateBall(dt);
  } else if (game.state === "ready") {
    resetBall();
  }

  draw();
  requestAnimationFrame(update);
}

function drawBackground() {
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  for (let x = 30; x < WIDTH; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let y = 30; y < HEIGHT; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }

  ctx.strokeStyle = colors.wall;
  ctx.lineWidth = 8;
  ctx.strokeRect(14, 14, WIDTH - 28, HEIGHT - 28);
}

function drawBricks() {
  for (const brick of game.bricks) {
    if (!brick.alive) continue;
    ctx.fillStyle = brick.color;
    roundRect(brick.x, brick.y, brick.width, brick.height, 5);
    ctx.fill();
  }
}

function drawPaddle() {
  const paddle = game.paddle;
  ctx.fillStyle = colors.paddle;
  roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 9);
  ctx.fill();
}

function drawBall() {
  const ball = game.ball;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = colors.ball;
  ctx.fill();
}

function drawMessage() {
  if (game.state === "playing") return;

  const messages = {
    ready: "Ready",
    paused: "Paused",
    won: "Cleared",
    lost: "Game Over",
  };

  ctx.fillStyle = "rgba(9, 11, 16, 0.62)";
  roundRect(WIDTH / 2 - 140, HEIGHT / 2 - 44, 280, 88, 10);
  ctx.fill();
  ctx.fillStyle = colors.text;
  ctx.font = "700 28px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(messages[game.state], WIDTH / 2, HEIGHT / 2);
}

function roundRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function draw() {
  drawBackground();
  drawBricks();
  drawPaddle();
  drawBall();
  drawMessage();
}

function canvasPointerX(event) {
  const rect = canvas.getBoundingClientRect();
  const pointerX = (event.clientX - rect.left) / rect.width;
  return pointerX * WIDTH;
}

window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "KeyA", "KeyD"].includes(event.code)) {
    game.keys.add(event.code);
    event.preventDefault();
  }
  if (event.code === "Space") {
    if (game.state === "playing") pauseGame();
    else startGame();
    event.preventDefault();
  }
  if (event.code === "KeyR") {
    resetGame();
    startGame();
  }
});

window.addEventListener("keyup", (event) => {
  game.keys.delete(event.code);
});

canvas.addEventListener("pointermove", (event) => {
  const x = canvasPointerX(event);
  game.paddle.x = clamp(x - game.paddle.width / 2, 18, WIDTH - game.paddle.width - 18);
});

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId);
  game.paddle.x = clamp(canvasPointerX(event) - game.paddle.width / 2, 18, WIDTH - game.paddle.width - 18);
  startGame();
  canvas.focus();
});

startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", pauseGame);
restartButton.addEventListener("click", () => {
  resetGame();
  startGame();
});

resetGame();
requestAnimationFrame(update);

window.__breakout = {
  game,
  startGame,
  pauseGame,
  resetGame,
  recordScore,
};
