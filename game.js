// SELECT CANVAS ELEMENT
const cvs = document.getElementById("breakout");
const ctx = cvs.getContext("2d");

// ADD BORDER TO CANVAS
cvs.style.border = "1px solid #0ff";

// MAKE LINE THICK WHEN DRAWING TO CANVAS
ctx.lineWidth = 3;

// GAME VARIABLES AND CONSTANTS
const PADDLE_WIDTH = 100;
const PADDLE_MARGIN_BOTTOM = 50;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 8;
let LIFE = 3; // PLAYER HAS 3 LIVES
let SCORE = 0;
const SCORE_UNIT = 10;
let LEVEL = 1;
const MAX_LEVEL = 5; // Changed maximum level to 5
let GAME_OVER = false;
let leftArrow = false;
let rightArrow = false;

// CREATE THE PADDLE
const paddle = {
  x: cvs.width / 2 - PADDLE_WIDTH / 2,
  y: cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dx: 5,
};

// DRAW PADDLE
function drawPaddle() {
  ctx.fillStyle = "#2e3548";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.strokeStyle = "#ffcd05";
  ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// CONTROL THE PADDLE WITH KEYBOARD
document.addEventListener("keydown", function (event) {
  if (event.keyCode === 37) {
    leftArrow = true;
  } else if (event.keyCode === 39) {
    rightArrow = true;
  }
});
document.addEventListener("keyup", function (event) {
  if (event.keyCode === 37) {
    leftArrow = false;
  } else if (event.keyCode === 39) {
    rightArrow = false;
  }
});

// CONTROL THE PADDLE WITH TOUCH
let touchStartX = 0;

cvs.addEventListener("touchstart", function (event) {
  touchStartX = event.touches[0].clientX - cvs.getBoundingClientRect().left;

  // Determine initial direction based on touch position
  if (touchStartX < paddle.x) {
    leftArrow = true;
    rightArrow = false;
  } else if (touchStartX > paddle.x + paddle.width) {
    rightArrow = true;
    leftArrow = false;
  }
  event.preventDefault(); // Prevent default touch behavior
});

cvs.addEventListener("touchmove", function (event) {
  const touchX = event.touches[0].clientX - cvs.getBoundingClientRect().left;

  // Move paddle according to touch position
  if (touchX < paddle.x) {
    leftArrow = true;
    rightArrow = false;
  } else if (touchX > paddle.x + paddle.width) {
    rightArrow = true;
    leftArrow = false;
  }

  // Move the paddle to follow the touch
  paddle.x = touchX - paddle.width / 2; // Center the paddle on touch
  if (paddle.x < 0) paddle.x = 0; // Prevent paddle from going off the left edge
  if (paddle.x + paddle.width > cvs.width) paddle.x = cvs.width - paddle.width; // Prevent paddle from going off the right edge

  event.preventDefault(); // Prevent default touch behavior
});

cvs.addEventListener("touchend", function () {
  leftArrow = false;
  rightArrow = false;
});

// MOVE PADDLE
function movePaddle() {
  if (rightArrow && paddle.x + paddle.width < cvs.width) {
    paddle.x += paddle.dx;
  } else if (leftArrow && paddle.x > 0) {
    paddle.x -= paddle.dx;
  }
}

// CREATE THE BALL
const ball = {
  x: cvs.width / 2,
  y: paddle.y - BALL_RADIUS,
  radius: BALL_RADIUS,
  speed: 10, // Increased initial speed
  dx: 3 * (Math.random() * 2 - 1),
  dy: -3,
};

// DRAW THE BALL
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffcd05"; // Ball color
  ctx.fill();
  ctx.strokeStyle = "#2e3548";
  ctx.stroke();
  ctx.closePath();
}

// MOVE THE BALL
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;
}

// BALL AND WALL COLLISION DETECTION
function ballWallCollision() {
  if (ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
    WALL_HIT.play();
  }

  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
    WALL_HIT.play();
  }

  if (ball.y + ball.radius > cvs.height) {
    LIFE--; // LOSE LIFE
    LIFE_LOST.play();
    resetBall();
  }
}

// RESET THE BALL
function resetBall() {
  ball.x = cvs.width / 2;
  ball.y = paddle.y - BALL_RADIUS;
  ball.dx = 3 * (Math.random() * 2 - 1); // Randomize x direction
  ball.dy = -3; // Reset y direction
}

// BALL AND PADDLE COLLISION
function ballPaddleCollision() {
  if (
    ball.x < paddle.x + paddle.width &&
    ball.x > paddle.x &&
    paddle.y < paddle.y + paddle.height &&
    ball.y > paddle.y
  ) {
    // PLAY SOUND
    PADDLE_HIT.play();

    // CHECK WHERE THE BALL HIT THE PADDLE
    let collidePoint = ball.x - (paddle.x + paddle.width / 2);
    collidePoint = collidePoint / (paddle.width / 2);
    let angle = (collidePoint * Math.PI) / 3;

    // Set new ball speed with randomness for realism
    ball.dx = ball.speed * Math.sin(angle) + (Math.random() - 0.5); // Add slight randomness
    ball.dy = -ball.speed * Math.cos(angle) + (Math.random() - 0.5); // Add slight randomness

    // Gradually increase ball speed
    ball.speed *= 1.01; // Gradually increase speed
  }
}

// CREATE THE BRICKS
const brick = {
  row: 4, // Increased rows to fit more bricks in each level
  column: 6,
  width: 50,
  height: 20,
  offSetLeft: 0, // No gap on the left
  offSetTop: 0, // No gap on the top
  marginTop: 40,
};

const defaultBrickColor = "#FF5733";
let bricks = [];

// Center the bricks in the canvas
function createBricks() {
  const totalWidth = brick.width * brick.column;
  const startX = (cvs.width - totalWidth) / 2;

  for (let r = 0; r < brick.row; r++) {
    bricks[r] = [];
    for (let c = 0; c < brick.column; c++) {
      bricks[r][c] = {
        x: startX + c * brick.width,
        y: r * brick.height + brick.marginTop,
        status: true,
        color: defaultBrickColor,
      };
    }
  }
}

createBricks();

// Draw the bricks
function drawBricks() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      let b = bricks[r][c];
      if (b.status) {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, brick.width, brick.height);
        ctx.strokeStyle = "#FFF";
        ctx.strokeRect(b.x, b.y, brick.width, brick.height);
      }
    }
  }
}

// Ball and brick collision
function ballBrickCollision() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      let b = bricks[r][c];
      if (b.status) {
        if (
          ball.x + ball.radius > b.x &&
          ball.x - ball.radius < b.x + brick.width &&
          ball.y + ball.radius > b.y &&
          ball.y - ball.radius < b.y + brick.height
        ) {
          BRICK_HIT.play();
          b.status = false; // The brick is broken
          b.color = "#2e3548"; // Change color to indicate it has been hit
          SCORE += SCORE_UNIT;

          // Add slight randomness to ball direction after hitting brick
          ball.dy = -ball.dy + (Math.random() - 0.5); // Randomize Y direction
          ball.dx = ball.dx + (Math.random() - 0.5); // Randomize X direction
        }
      }
    }
  }
}

// SHOW GAME STATS (SCORE AND LIVES)
function showGameStats(stat, x, y, img, imgX, imgY) {
  ctx.fillStyle = "#fff";
  ctx.font = "20px Germania One";
  ctx.fillText(stat, x, y);
  ctx.drawImage(img, imgX, imgY, 25, 25);
}

// SHOW GAME OVER SCREEN
function showGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  ctx.fillStyle = "#ffcd05";
  ctx.font = "40px Germania One";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", cvs.width / 2, cvs.height / 2 - 20);
  ctx.font = "20px Germania One";
  ctx.fillText(`Score: ${SCORE}`, cvs.width / 2, cvs.height / 2 + 20);
}

// SHOW WIN SCREEN
function showYouWin() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  ctx.fillStyle = "#ffcd05";
  ctx.font = "40px Germania One";
  ctx.textAlign = "center";
  ctx.fillText("YOU WIN!", cvs.width / 2, cvs.height / 2 - 20);
  ctx.font = "20px Germania One";
  ctx.fillText(`Score: ${SCORE}`, cvs.width / 2, cvs.height / 2 + 20);
}

// Draw the current level
function drawLevel() {
  ctx.fillStyle = "#ffcd05";
  ctx.font = "25px Germania One";
  ctx.fillText(`Level: ${LEVEL}`, cvs.width / 2, 30); // Centered at the top
}

// DRAW FUNCTION
function draw() {
  drawPaddle();
  drawBall();
  drawBricks();
  drawLevel(); // Draw the current level

  // SHOW SCORE
  showGameStats(SCORE, 35, 25, SCORE_IMG, 5, 5);
  // SHOW LIVES
  showGameStats(LIFE, cvs.width - 25, 25, LIFE_IMG, cvs.width - 55, 5);
}

// UPDATE FUNCTION
function update() {
  movePaddle();
  moveBall();
  ballWallCollision();
  ballPaddleCollision();
  ballBrickCollision();

  // Check for game over
  if (LIFE <= 0) {
    GAME_OVER = true;
    showGameOver(); // Display Game Over screen
  }

  // Check for level up
  if (checkLevelUp()) {
    levelUp();
  }

  // Check for win condition
  if (LEVEL > MAX_LEVEL) {
    GAME_OVER = true;
    showYouWin(); // Display win screen
  }
}

// Check if level is complete
function checkLevelUp() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      if (bricks[r][c].status) {
        return false; // There are still bricks left
      }
    }
  }
  return true; // All bricks are cleared
}

// LEVEL UP FUNCTION
function levelUp() {
  LEVEL++;
  if (LEVEL > MAX_LEVEL) {
    return; // Stop if max level is reached
  }

  // Create new set of bricks
  createBricks();
}

// MAIN LOOP
function loop() {
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  ctx.drawImage(BG_IMG, 0, 0, cvs.width, cvs.height);
  draw();
  update();

  if (!GAME_OVER) {
    requestAnimationFrame(loop);
  }
}

// START THE GAME
loop();
