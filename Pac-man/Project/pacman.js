// sfx
let eatSound = new Audio ('./Resources/chomp.wav');
let bMusic = new Audio ('./Resources/bMusic.wav');
let death = new Audio ('./Resources/death.wav');

//board
let board;
const rowCount = 21;
const columnCount = 21;
const tileSize = 32;
const boardWidth = columnCount * tileSize;
const boardHeight = rowCount * tileSize;
let context;

//images
let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;
let pacmanUpImage;
let pacmanDownImage;
let pacmanLeftImage;
let pacmanRightImage;
let wallImage;

//X = wall, O = skip, P = pac man, ' ' = food
//Ghosts: b = blue, o = orange, p = pink, r = red
//X = wall, O = skip, P = pac man, ' ' = food
//Ghosts: b = blue, o = orange, p = pink, r = red
const tileMap = [
    "XXXXXXXXXXXXXXXXXXXXX",
    "XX        X        XX",
    "XX XX XXX X XXX XX XX",
    "XX                 XX",
    "XX XX X XXXXX X XX XX",
    "XX    X       X    XX",
    "XXXXX XXXX XXXX XXXXX",
    "OOOOX X       X XOOOX",
    "XXXXX X XXrXX X XXXXX",
    "XXX       bpo       X",
    "XXXXX X XXXXX X XXXXX",
    "OOOOX X       X XOOOO",
    "XXXXX X XXXXX X XXXXX",
    "XX        X        XX",
    "XX XX XXX X XXX XX XX",
    "XX  X     P     X  XX",
    "XXX X X XXXXX X X XXX",
    "XX    X   X   X    XX",
    "XX XXXXXX X XXXXXX XX",
    "XX                 XX",
    "XXXXXXXXXXXXXXXXXXXXX" 
];

const walls = new Set();
const foods = new Set();
const ghosts = new Set();
let pacman;


const directions = ['U', 'D', 'L', 'R']

let score = 0;
let lives = 3;
let gameOver = false;



window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");  //draws the board

    loadImages();
    loadMap();

document.addEventListener("keydown", () => {
    if (bMusic.paused) {
        bMusic.play();
    }
}, { once: true });

    for (let ghost of ghosts.values()) {
        const newDirection = directions[Math.floor(Math.random()*4)];
        ghost.updateDirection(newDirection);
    }
    update();
    document.addEventListener("keyup", movepacman);
}

function loadImages() {

    wallImage = new Image();
    wallImage.src = "./Resources/wall.png"

    blueGhostImage = new Image();
    blueGhostImage.src = "./Resources/blueGhost.png"

    orangeGhostImage = new Image();
    orangeGhostImage.src = "./Resources/orangeGhost.png"

    pinkGhostImage = new Image();
    pinkGhostImage.src = "./Resources/pinkGhost.png"

    redGhostImage = new Image();
    redGhostImage.src = "./Resources/redGhost.png"

    pacmanUpImage = new Image();
    pacmanUpImage.src = "./Resources/pacmanUp.png"

    pacmanDownImage = new Image();
    pacmanDownImage.src = "./Resources/pacmanDown.png"

    pacmanLeftImage = new Image();
    pacmanLeftImage.src = "./Resources/pacmanLeft.png"

    pacmanRightImage = new Image();
    pacmanRightImage.src = "./Resources/pacmanRight.png"

    pacmanUpClosedImage = new Image();
    pacmanUpClosedImage.src = "./Resources/pacmanUp -closed.png";

    pacmanDownClosedImage = new Image();
    pacmanDownClosedImage.src = "./Resources/pacmanDown -closed.png";

    pacmanLeftClosedImage = new Image();
    pacmanLeftClosedImage.src = "./Resources/pacmanLeft -closed.png";

    pacmanRightClosedImage = new Image();
    pacmanRightClosedImage.src = "./Resources/pacmanRight -closed.png";

}

function loadMap() {
    walls.clear();
    foods.clear();
    ghosts.clear();

    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++){
            const row = tileMap[r];
            const tileMapChar = row[c];

            const x = c*tileSize;
            const y = r*tileSize;

            if (tileMapChar == 'X') { // block wall
                const wall = new block(wallImage, x, y, tileSize, tileSize);
                walls.add(wall);
            }
            else if (tileMapChar == 'b') { // blue ghost
                const ghost = new block(blueGhostImage, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'o') { // orange ghost
                const ghost = new block(orangeGhostImage, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'p') { // pink ghost
                const ghost = new block(pinkGhostImage, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'r') { // red ghost
                const ghost = new block(redGhostImage, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'P') { // pacman
                pacman = new block(pacmanRightImage, x, y, tileSize, tileSize);
            }
            else if (tileMapChar == ' ') { // food
                const food = new block(null, x + 14, y + 14, 4, 4);
                foods.add(food);

            }
        }
    }
}

function update() {
    if (gameOver) {
        return;
    }
    move();
    draw();
    setTimeout(update, 50);
}

function draw(){
    context.clearRect(0, 0, board.width, board.height)
    togglePacmanMouth(); // update the frame
    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);
    for (let ghost of ghosts.values()) {
        context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
    }
    for (let wall of walls.values()) {
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
    }
    context.fillStyle = "White";
    for (let food of foods.values()) {
        context.fillRect(food.x, food.y, food.width, food.height);
    }

    // score
    context.fillStyle = "white";
    context.font = "14px sans-serif";
    if (gameOver) {
        context.fillText("GAME OVER: " + String(score), tileSize/2, tileSize/2);
    }
    else {
        context.fillText("Lives " +"x"+ String(lives) + " " + "Score: " + String(score), tileSize/2, tileSize/2);
    }

}

function move() {
    // Try to change direction if one is queued
    if (pacman.nextDirection) {
        const testPacman = new block(null, pacman.x, pacman.y, pacman.width, pacman.height);
        testPacman.direction = pacman.nextDirection;
        testPacman.updateVelocity();
        testPacman.x += testPacman.velocityX;
        testPacman.y += testPacman.velocityY;

        let canChange = true;
        for (let wall of walls.values()) {
            if (collision(testPacman, wall)) {
                canChange = false;
                break;
            }
        }

        if (canChange) {
            pacman.updateDirection(pacman.nextDirection);
            pacman.nextDirection = null;
        }
    }

    // Move pacman in current direction
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    // Wall collision for pacman
    for (let wall of walls.values()) {
        if (collision(pacman, wall)) {
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break;
        }
    }

    // Ghost movement
    for (let ghost of ghosts.values()) {
        if (collision(ghost, pacman)) {
            death.play();
            lives--;
            if (lives === 0) {
                gameOver = true;
                return;
            }
            resetPositions();
            return;
        }

        if (ghost.y === tileSize * 9 && ghost.direction !== 'U' && ghost.direction !== 'D') {
            ghost.updateDirection('U');
        }

        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;

        for (let wall of walls.values()) {
            if (collision(ghost, wall) || ghost.x < 0 || ghost.x + ghost.width > boardWidth) {
                ghost.x -= ghost.velocityX;
                ghost.y -= ghost.velocityY;
                const newDirection = directions[Math.floor(Math.random() * 4)];
                ghost.updateDirection(newDirection);
            }
        }
    }

    // Food collision
    let foodEaten = null;
    for (let food of foods.values()) {
        if (collision(pacman, food)) {
            foodEaten = food;
            score += 10;
            eatSound.play();
            break;
        }
    }
    foods.delete(foodEaten);

    // Next level
    if (foods.size === 0) {
        bMusic.play();
        loadMap();
        resetPositions();
    }
}

function movepacman(e) {
    if (gameOver) {
        loadMap();
        bMusic.play();
        resetPositions();
        lives = 3;
        score = 0;
        gameOver = false;
        update();
        return;
    }

    if (e.code == "KeyW") pacman.nextDirection = 'U';
    else if (e.code == "KeyS") pacman.nextDirection = 'D';
    else if (e.code == "KeyA") pacman.nextDirection = 'L';
    else if (e.code == "KeyD") pacman.nextDirection = 'R';
    // update image direction for pacman
    if (pacman.direction == 'U') {
        pacman.image = pacmanUpImage
    }
    else if (pacman.direction == 'D') {
        pacman.image = pacmanDownImage
    }
    else if (pacman.direction == 'L') {
        pacman.image = pacmanLeftImage
    }
    else if (pacman.direction == 'R') {
        pacman.image = pacmanRightImage
    }

}

function collision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function resetPositions() {
    pacman.reset();
    pacman.velocityX = 0;
    pacman.velocityY = 0;
    for (let ghost of ghosts.values()) {
        ghost.reset();
        const newDirection = directions[Math.floor(Math.random() * 4)];
        ghost.updateDirection(newDirection);
    }

}

class block {
    constructor(image, x, y, width, height){
    this.image = image;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.startX = x;
    this.startY = y;

    this.direction = 'R';
    this.velocityX = 0;
    this.velocityY = 0;
    this.chompFrame = true;
    this.nextDirection = null;

  }

  updateDirection(direction) {
    const prevDirection = this.direction;
    this.direction = direction;
    this.updateVelocity();
    this.x += this.velocityX;
    this.y += this.velocityY;

    for (let wall of walls.values()){
        if (collision(this, wall)) {
            this.x -= this.velocityX;
            this.y -= this.velocityY;
            this.direction = prevDirection;
            this.updateVelocity();
            return;
        }
    }
  }

  updateVelocity(){
    if (this.direction == 'U') {
        this.velocityX = 0;
        this.velocityY = -tileSize/4;
    }
    else if (this.direction == 'D') {
        this.velocityX = 0;
        this.velocityY = tileSize/4;
    }

      else if (this.direction == 'L') {
        this.velocityX = -tileSize/4;
        this.velocityY = 0;
    }
      else if (this.direction == 'R') {
        this.velocityX = tileSize/4;
        this.velocityY = 0;
    }
 }

 reset() {
    this.x = this.startX;
    this.y = this.startY;
 }
}

function togglePacmanMouth() {
    if (pacman.velocityX !== 0 || pacman.velocityY !== 0) {
        pacman.chompFrame = !pacman.chompFrame;
        if (pacman.direction === 'U') {
            pacman.image = pacman.chompFrame ? pacmanUpImage : pacmanUpClosedImage;
        } else if (pacman.direction === 'D') {
            pacman.image = pacman.chompFrame ? pacmanDownImage : pacmanDownClosedImage;
        } else if (pacman.direction === 'L') {
            pacman.image = pacman.chompFrame ? pacmanLeftImage : pacmanLeftClosedImage;
        } else if (pacman.direction === 'R') {
            pacman.image = pacman.chompFrame ? pacmanRightImage : pacmanRightClosedImage;
        }
    }
}