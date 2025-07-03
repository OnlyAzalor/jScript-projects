let lastTime = 0;
let musicStarted = false;
let canRestart = true;

// board
let board;
let boardWidth = 450;
let boardHeight = 600;
let context;

// doodler
let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth / 2 - doodlerWidth / 2;
let doodlerY = boardHeight * 7 / 8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
    img: null,
    x: doodlerX,
    y: doodlerY,
    width: doodlerWidth,
    height: doodlerHeight
};

// physics
let velocityX = 0;
let velocityY = 0;
let initialVelocityY = -12.5;
let gravity = 0.6;

// platforms
let platformArray = [];
let platformWidth = 90;
let platformHeight = 18;
let platformImg;
let verticalSpacing = 80;
let maxHorizontalShift = 120;

// score
let score = 0;
let gameOver = false;

// audio
let jumpSound = new Audio("./Resources/jump.wav");
let bgMusic = new Audio("./Resources/bg-music.mp3");
let gameOverSound = new Audio("./Resources/gameover.wav");

bgMusic.loop = true;
bgMusic.volume = 0.5;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    doodlerRightImg = new Image();
    doodlerRightImg.src = "./Resources/doodler-right.png";
    doodler.img = doodlerRightImg;

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "./Resources/doodler-left.png";

    platformImg = new Image();
    platformImg.src = "./Resources/platform.png";

    velocityY = initialVelocityY;
    placePlatforms();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);
};

function update(timestamp) {
    let deltaTime = (timestamp - lastTime) / 16.67;
    lastTime = timestamp;

    context.clearRect(0, 0, board.width, board.height);

    if (!gameOver) {
        doodler.x += velocityX * deltaTime;
        velocityX *= Math.pow(0.991, deltaTime);

        if (doodler.x > board.width) doodler.x = 0;
        else if (doodler.x + doodler.width < 0) doodler.x = boardWidth;

        velocityY += gravity * deltaTime;

        if (doodler.y > board.height) {
            gameOver = true;
            bgMusic.pause();
            gameOverSound.play();
            canRestart = false;
            setTimeout(() => {
                canRestart = true;
            }, 1500); // Delay restart until game over sound plays
        }

        if (velocityY < 0) {
            if (doodler.y > boardHeight * 0.25) {
                doodler.y += velocityY * deltaTime;
            } else {
                for (let platform of platformArray) {
                    platform.y -= velocityY * deltaTime;
                }
            }
        } else {
            doodler.y += velocityY * deltaTime;
        }

        for (let platform of platformArray) {
            if (
                detectCollision(doodler, platform) &&
                velocityY >= 0 &&
                doodler.y + doodler.height <= platform.y + platform.height
            ) {
                velocityY = initialVelocityY;
                jumpSound.currentTime = 0;
                jumpSound.play();
            }
        }

        while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
            platformArray.shift();
            newPlatform();
        }

        updateScore();
    }

    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    for (let platform of platformArray) {
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText("Score: " + score, 5, 20);

    if (gameOver) {
        context.fillText("GAME OVER: PRESS 'SPACE' TO RESTART", boardWidth / 7, boardHeight * 7 / 8);
    }

    requestAnimationFrame(update);
}

function moveDoodler(e) {
    if (!musicStarted) {
        bgMusic.play();
        musicStarted = true;
    }
    if ((e.code === "ArrowRight" || e.code === "KeyD") && !gameOver) {
        velocityX = 5;
        doodler.img = doodlerRightImg;
    } else if ((e.code === "ArrowLeft" || e.code === "KeyA") && !gameOver) {
        velocityX = -5;
        doodler.img = doodlerLeftImg;
    } else if (e.code === "Space" && gameOver && canRestart) {
        gameOver = false;

        doodler.x = doodlerX;
        doodler.y = doodlerY;
        doodler.img = doodlerRightImg;

        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0;
        lastTime = performance.now();
        platformArray = [];

        placePlatforms();
        bgMusic.currentTime = 0;
        bgMusic.play();
    }
}

function placePlatforms() {
    platformArray = [];

    const startY = boardHeight - 60;
    let currentX = boardWidth / 2 - platformWidth / 2;
    let currentY = startY;

    const startPlatform = {
        img: platformImg,
        x: currentX,
        y: currentY,
        width: platformWidth,
        height: platformHeight,
        passed: false
    };
    platformArray.push(startPlatform);

    doodler.y = currentY - doodler.height;

    for (let i = 1; i < 7; i++) {
        currentY -= verticalSpacing;

        // Random shift with wraparound logic
        let shift = Math.floor(Math.random() * maxHorizontalShift * 2) - maxHorizontalShift;
        currentX = (currentX + shift + boardWidth) % boardWidth;

        // Ensure platform stays fully within bounds
        currentX = Math.max(0, Math.min(currentX, boardWidth - platformWidth));

        platformArray.push({
            img: platformImg,
            x: currentX,
            y: currentY,
            width: platformWidth,
            height: platformHeight,
            passed: false
        });
    }
}

function newPlatform() {
    let highestY = Math.min(...platformArray.map(p => p.y));
    let lastX = platformArray[platformArray.length - 1].x;

    let shift = Math.floor(Math.random() * maxHorizontalShift * 2) - maxHorizontalShift;
    let newX = (lastX + shift + boardWidth) % boardWidth;

    // Clamp within bounds
    newX = Math.max(0, Math.min(newX, boardWidth - platformWidth));

    platformArray.push({
        img: platformImg,
        x: newX,
        y: highestY - verticalSpacing,
        width: platformWidth,
        height: platformHeight,
        passed: false
    });
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function updateScore() {
    for (let platform of platformArray) {
        if (!platform.passed && platform.y > doodler.y + doodler.height) {
            platform.passed = true;
            score += 10;
        }
    }
}
