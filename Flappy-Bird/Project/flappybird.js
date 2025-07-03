//sfx
const hop = new Audio("./Resources/sfx_wing.wav");
const bMusic = new Audio("./Resources/bgm_mario.mp3")
bMusic.loop = true;
const flop = new Audio("./Resources/sfx_die.wav")
let flopPlayed = false; // add at the top

//board

let board;
let boardWidth = 1270;
let boardHeight = 640;
let context;

//bird

let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight 
}

//pipes
let pipeArray = [];
let pipeWidth = 64;  //ratio is 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let botPipeImg;

//physics
let velocityX = -3; //pipe moving left speed
let velocityY = 0; // the jump
let gravity = 1500;     // pixels per second squared
let jumpForce = -450; // pixels per second // brings the bird down "down with it xD"
let lastTime = 0;

let gameOver = false;
let score = 0;
let allowRestart = false;
let gameOverTime = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");  // draws on the board

    // Draws the bird place holder
    //context.fillStyle = "green";
    //context.fillRect(bird.x, bird.y, bird.width, bird.height);


    //loading images
    birdImg = new Image();
    birdImg.src= "./Resources/flappybird.gif";
    birdImg.onload = function () {
    context.drawImage(birdImg, bird.x,bird.y,bird.width, bird.height);
    }

    topPipeImg= new Image();
    topPipeImg.src = "./Resources/toppipe.png";

    
    botPipeImg= new Image();
    botPipeImg.src = "./Resources/botpipe.png";


    requestAnimationFrame(update);
    setInterval(placePipes, 1000);  // every 1.2s
    document.addEventListener("keydown", moveBird);
}

   function update(currentTime) {
    requestAnimationFrame(update); // ask for the next frame

    if (!lastTime) lastTime = currentTime; // first frame only
    let delta = (currentTime - lastTime) / 1000; // convert ms to seconds
    lastTime = currentTime;
    if (gameOver) {
        bMusic.pause();
        bMusic.currentTime = 0;

        if (!flopPlayed) {
            flop.play();         // play sound once
            flopPlayed = true;   // prevent replay
        }
        if (Date.now() - gameOverTime > 1000) {
        allowRestart = true;
    }
        return;
     
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity * delta ;
   // bird.y += velocityY;
   bird.y = Math.max(bird.y + velocityY * delta, 0); // stops the bird from going to space when jumping
    let angle = Math.max(Math.min((velocityY / 400) * (Math.PI / 6), Math.PI / 6), -Math.PI / 6);
    context.save();
    context.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    context.rotate(angle);
    context.drawImage(birdImg, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
    context.restore();


    if (bird.y > board.height){
        gameOver = true;
        gameOverTime = Date.now();
        allowRestart = false;
    }

    //pipes
    for (let i = 0; i<pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height)

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // there are 2 pipes genius !!
            pipe.passed = true;
        }

        if (detectCollision (bird, pipe)) {
            gameOver = true;
            gameOverTime = Date.now();
            allowRestart = false;
        }
    }

    //clearing the pipes (cause memory issues xD)
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); // removes first element from array
    }
    //score
    context.fillStyle = "white";
    context.font="45px san-serif";
    context.fillText(score, 5, 45);

    if(gameOver) {
        context.fillText("GAME OVER!, GIT GUD TRASH", 5, 90 )
    }  

}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4 ;


    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed :false
    }
    pipeArray.push(topPipe);

    let botPipe = {
        img : botPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(botPipe);

}
function moveBird(e){
    if (e.code === "Space" || e.code === "KeyX"){
        if (bMusic.paused) {
        bMusic.play();}

        //jump
        if (!gameOver) {
            velocityY = jumpForce;
            hop.play();
        }
        if(gameOver && allowRestart){
            bird.y = birdY;
            velocityY = 0;
            pipeArray = [];
            score = 0;
            gameOver = false;
            flopPlayed = false;
            allowRestart = false;
        }
    }
}

function detectCollision(a, b) {
    return  a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
}

