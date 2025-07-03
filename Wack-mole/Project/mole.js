let currMoleTile;
let currPlantTile;
let score = 0;
let gameOver= false;
const soundPop = new Audio("Resources/pop.mp3");
const soundSmack = new Audio("Resources/smack.mp3");
const soundBuzz = new Audio("Resources/buzz.mp3");
const soundGameOver = new Audio("Resources/game-over.mp3");


window.onload = function() {
    setGame();
    document.getElementById("newGame").addEventListener('click', function(){
    soundBuzz.play();
    gameOver = false;
    score = 0;
    document.getElementById("score").innerText = "" + score.toString();
    return false;})

}

function setGame() {
    // Setups the grid for the game
    for (let i=0; i < 9; i++){

        let tile = document.createElement("div");
        tile.id = i.toString();
        tile.addEventListener("click", selectTile);
        document.getElementById("board").appendChild(tile);

    }

    setInterval(setMole, 1000); // 1 seconds spawn mole
    setInterval(setPlant, 2000); // 2 seconds spawn plant

}

function getRandomTile(){
    let num = Math.floor(Math.random() * 9 )
    return num.toString();
}

function setMole() {
    if (gameOver) {
        return;
    }

    if (currMoleTile) {
        currMoleTile.innerHTML = "";
        currMoleTile.clickedMole = false; // reset flag
    }

    let mole = document.createElement("img");
    mole.src = "./Resources/monty-mole.png";
    soundPop.play();


    let num = getRandomTile();
    if (currPlantTile && currPlantTile.id == num)
    {
        return;
    }
    currMoleTile = document.getElementById(num);
    currMoleTile.clickedMole = false; // ensure it's reset
    currMoleTile.appendChild(mole);
}

function setPlant() {
    if (gameOver){
        return;
    }

    if (currPlantTile) {
        currPlantTile.innerHTML = "";
    }

    let plant = document.createElement("img");
    plant.src = "./Resources/piranha-plant.png";

    let num = getRandomTile();

    if (currMoleTile && currMoleTile.id == num)
    {
        return;
    }
    currPlantTile = document.getElementById(num);
    currPlantTile.appendChild(plant);
}

function selectTile() {
    if (gameOver) {
        return;
    }

    if (this == currMoleTile && !this.clickedMole) {
        soundSmack.play();
        score += 10;
        this.clickedMole = true; // mark as clicked
        document.getElementById("score").innerText = score.toString();
    }
    else if (this == currPlantTile) {
        document.getElementById("score").innerText = "GAME OVER: " + score.toString();
        soundGameOver.play();
        gameOver = true;
    }
}


