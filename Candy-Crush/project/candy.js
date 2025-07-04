// CANDY CRUSH CLONE WITH FIXED STRIPED CANDY LOGIC

var candies = ["Blue", "Orange", "Green", "Yellow", "Red", "Purple"];
var board = [];
var rows = 9;
var columns = 9;
var score = 0;

var currTile;
var otherTile;

let sfx = {
    match3: new Audio("./Resources/Sounds/match3.wav"),
    match4: new Audio("./Resources/Sounds/match4.wav"),
    match5: new Audio("./Resources/Sounds/match5.wav"),
    stripe: new Audio("./Resources/Sounds/stripe.wav"),
    bomb: new Audio("./Resources/Sounds/bomb.wav"),
    swap: new Audio("./Resources/Sounds/swap.wav"),
    invalid: new Audio("./Resources/Sounds/invalid.wav"),
    sweet: new Audio("./Resources/Sounds/sweet.wav"),
    tasty: new Audio("./Resources/Sounds/tasty.wav"),
    delicious: new Audio("./Resources/Sounds/delicious.wav"),
    divine: new Audio("./Resources/Sounds/divine.wav"),
    music: new Audio("./Resources/Sounds/music.mp3"),
    win: new Audio("./Resources/Sounds/win.wav"),
    lose: new Audio("./Resources/Sounds/fail.wav"),
    sugar: new Audio("./Resources/Sounds/sugarcrush.wav"),
};

sfx.music.loop = true;
sfx.music.volume = 0.4;

// Add a buffer of 9 rows above the board
var bufferRows = 9;
var candyBuffer = [];

window.onload = function () {
    // Create and insert the banner
    const banner = document.createElement('div');
    banner.id = 'game-banner';
    banner.innerHTML = `
        <button id="startBtn" class="banner-btn">Start Game</button>
    `;
    document.body.appendChild(banner);
    setTimeout(() => banner.classList.add('slide-center'), 50);

    document.getElementById("startBtn").addEventListener("click", () => {
        banner.classList.remove('slide-center');
        banner.classList.add('slide-up');
        setTimeout(() => banner.remove(), 800); // Remove after animation
        sfx.music.play().catch(() => {});
        startGame();
        window.setInterval(function () {
            const result = crushCandy();
            // Only play the match sound for the current match
            if (result.crushed && result.sound) sfx[result.sound].play().catch(() => {});
            slideCandy();
            generateCandy();
        }, 100);
    });

    // Set random hover color for banner button only while hovering
    const bannerBtn = document.querySelector('.banner-btn');
    if (bannerBtn) {
        const hoverColors = ['#3498db', '#ff9800', '#ffe44d', '#a259e6', '#e74c3c', '#43b86a']; // blue, orange, yellow, purple, red, green
        bannerBtn.addEventListener('mouseenter', function() {
            const color = hoverColors[Math.floor(Math.random() * hoverColors.length)];
            bannerBtn.style.setProperty('--banner-btn-hover', color);
        });
        bannerBtn.addEventListener('mouseleave', function() {
            bannerBtn.style.removeProperty('--banner-btn-hover');
        });
    }
};

function randomCandy() {
    return candies[Math.floor(Math.random() * candies.length)];
}

function extractColor(src) {
    let filename = src.split("/").pop().split(".")[0];
    return filename.replace("StripedH-", "").replace("StripedV-", "").replace("ColorBomb", "");
}

function isStriped(src) {
    return src.includes("StripedH-") || src.includes("StripedV-");
}

function createCandyBuffer() {
    candyBuffer = [];
    for (let r = 0; r < bufferRows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("img");
            tile.id = "buffer-" + r + "-" + c;
            tile.src = "./Resources/Images/" + randomCandy() + ".png";
            tile.style.position = "absolute";
            tile.style.top = ((r - bufferRows) * 40) + "px"; // position above the board
            tile.style.left = (c * 40) + "px";
            tile.style.zIndex = "0";
            tile.style.opacity = "0"; // invisible to player
            document.getElementById("board").append(tile);
            row.push(tile);
        }
        candyBuffer.push(row);
    }
}

// Update startGame to also create the buffer and ensure no initial matches on the board
function startGame() {
    board = [];
    document.getElementById("board").innerHTML = "";
    createCandyBuffer();
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("img");
            tile.id = r + "-" + c;
            // Pick a random candy that does not create a match
            let available = candies.slice();
            // Prevent horizontal match
            if (c >= 2) {
                let left1 = row[c-1].src.split("/").pop().split(".")[0];
                let left2 = row[c-2].src.split("/").pop().split(".")[0];
                if (left1 === left2) {
                    available = available.filter(candy => candy !== left1);
                }
            }
            // Prevent vertical match
            if (r >= 2) {
                let up1 = board[r-1][c].src.split("/").pop().split(".")[0];
                let up2 = board[r-2][c].src.split("/").pop().split(".")[0];
                if (up1 === up2) {
                    available = available.filter(candy => candy !== up1);
                }
            }
            tile.src = "./Resources/Images/" + available[Math.floor(Math.random() * available.length)] + ".png";
            tile.addEventListener("click", onCandyClick);
            // Remove drag events
            tile.removeEventListener("dragstart", dragStart);
            tile.removeEventListener("dragover", dragOver);
            tile.removeEventListener("dragenter", dragEnter);
            tile.removeEventListener("dragleave", dragLeave);
            tile.removeEventListener("drop", dragDrop);
            tile.removeEventListener("dragend", dragEnd);
            tile.draggable = false;
            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }
    resetScoreGoal();
}

// --- SCORE GOAL SYSTEM ---
//const SCORE_GOAL = 5000;
// === LEVEL SYSTEM PATCH ===
let level = 1;
let scoreGoal = 5000;
let timeStart = 120;
let levelScore = 0;



// Remove all candy bar/progress bar logic and replace with score bar
function createScoreBar() {
    let bar = document.getElementById('score-bar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'score-bar';
        bar.style.display = 'flex';
        bar.style.justifyContent = 'center';
        bar.style.alignItems = 'center';
        bar.style.margin = '30px auto 0 auto';
        bar.style.width = '400px';
        bar.style.height = '32px';
        bar.style.background = 'rgba(0,0,0,0.12)';
        bar.style.borderRadius = '18px';
        bar.style.padding = '0 16px';
        bar.style.boxShadow = '0 2px 12px rgba(0,0,0,0.10)';
        bar.style.position = 'relative';
        document.body.insertBefore(bar, document.querySelector('.game-footer'));
    }
    // Progress bar inner
    let inner = document.getElementById('score-bar-inner');
    if (!inner) {
        inner = document.createElement('div');
        inner.id = 'score-bar-inner';
        inner.style.height = '100%';
        inner.style.borderRadius = '18px';
        inner.style.background = 'linear-gradient(90deg,#ffe44d,#4d79ff,#b84dff,#ff4d4d,#4dff88,#ffb84d)';
        inner.style.transition = 'width 0.4s cubic-bezier(.4,1.4,.6,1)';
        inner.style.position = 'absolute';
        inner.style.left = '0';
        inner.style.top = '0';
        bar.appendChild(inner);
    }
    // Score text
    let text = document.getElementById('score-bar-text');
    if (!text) {
        text = document.createElement('span');
        text.id = 'score-bar-text';
        text.style.position = 'relative';
        text.style.zIndex = '2';
        text.style.fontWeight = 'bold';
        text.style.fontSize = '1.2rem';
        text.style.color = '#222';
        text.style.textShadow = '0 1px 4px #fff';
        bar.appendChild(text);
    }
    // Update progress
    let percent = Math.min(100, Math.round((levelScore  / scoreGoal) * 100));
    inner.style.width = percent + '%';
    text.innerText = `Score: ${levelScore} / ${scoreGoal} (Level ${level})`;

}

function updateScoreBar() {
    createScoreBar();
    let percent = Math.min(100, Math.round((levelScore / scoreGoal) * 100));
    document.getElementById("score-bar-inner").style.width = percent + '%';
    document.getElementById("score-bar-text").innerText = `Score: ${levelScore} / ${scoreGoal} (Level ${level})`;
}

// Remove all candy bar logic and reset only score
function resetScoreGoal() {
    levelScore  = 0;
    updateScoreBar();
}

// Patch startGame to reset score and update score bar
const origStartGame = startGame;
startGame = function() {
    origStartGame();
    resetScoreGoal();
}

// Patch crushCandy to check for win and show win banner
const origCrushCandy = crushCandy;
let winBannerTimeout = null;
crushCandy = function() {
    let result = origCrushCandy();
    updateScoreBar();
    if (levelScore >= scoreGoal && !document.getElementById('win-banner') && !winBannerTimeout) {
        // Play sugar crush audio, then show win banner after 1.2s
        if (sfx.sugar) sfx.sugar.play().catch(() => {});
        winBannerTimeout = setTimeout(() => {
            if (!document.getElementById('win-banner')) {
                showWinBanner();
            }
            winBannerTimeout = null;
        }, 1200);
    }
    return result;
}

function showWinBanner() {
    if (sfx.win) sfx.win.play().catch(() => {});
    const winBanner = document.createElement('div');
    winBanner.id = 'win-banner';
    winBanner.className = 'game-banner win-banner';
    winBanner.style.top = '-400px';
    winBanner.style.left = '50%';
    winBanner.style.transform = 'translate(-50%, 0) scale(1)';
    winBanner.innerHTML = `
        <div class="banner-title">You Win!</div>
        <button id="restartBtn" class="banner-btn">Next Level</button>
    `;
    document.body.appendChild(winBanner);
    setTimeout(() => {
        winBanner.classList.add('slide-center');
        winBanner.style.top = '';
        winBanner.style.transform = '';
    }, 50);
         document.getElementById('restartBtn').addEventListener('click', () => {
         winBanner.classList.remove('slide-center');
         winBanner.classList.add('slide-up');
        setTimeout(() => {
        winBanner.remove();
        level++;
        scoreGoal = Math.floor(scoreGoal * 1.5);
        timeStart += 30;
        startGame();
    }, 800);
});
    // Random hover color for restart
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        const hoverColors = ['#3498db', '#ff9800', '#ffe44d', '#a259e6', '#e74c3c', '#43b86a'];
        restartBtn.addEventListener('mouseenter', function() {
            const color = hoverColors[Math.floor(Math.random() * hoverColors.length)];
            restartBtn.style.setProperty('--banner-btn-hover', color);
        });
        restartBtn.addEventListener('mouseleave', function() {
            restartBtn.style.removeProperty('--banner-btn-hover');
        });
    }
}

function showLoseBanner() {
    if (sfx.lose) sfx.lose.play().catch(() => {});
    const loseBanner = document.createElement('div');
    loseBanner.id = 'lose-banner';
    loseBanner.className = 'game-banner lose-banner';
    loseBanner.style.top = '-400px';
    loseBanner.style.left = '50%';
    loseBanner.style.transform = 'translate(-50%, 0) scale(1)';
    loseBanner.innerHTML = `
        <div class="banner-title"> </div>
        <div style="font-size:1.2rem;margin-bottom:18px;">You didn't reach the score goal in time.</div>
        <button id="restartBtnLose" class="banner-btn">New Game</button>
    `;
    document.body.appendChild(loseBanner);
    setTimeout(() => {
        loseBanner.classList.add('slide-center');
        loseBanner.style.top = '';
        loseBanner.style.transform = '';
    }, 50);
        document.getElementById('restartBtnLose').addEventListener('click', () => {
         loseBanner.classList.remove('slide-center');
        loseBanner.classList.add('slide-up');
         setTimeout(() => {
        loseBanner.remove();
        level = 1;
        score = 0;
        scoreGoal = 5000;
        timeStart = 120;
        startGame();
    }, 800);
});
    // Random hover color for restart
    const restartBtn = document.getElementById('restartBtnLose');
    if (restartBtn) {
        const hoverColors = ['#3498db', '#ff9800', '#ffe44d', '#a259e6', '#e74c3c', '#43b86a'];
        restartBtn.addEventListener('mouseenter', function() {
            const color = hoverColors[Math.floor(Math.random() * hoverColors.length)];
            restartBtn.style.setProperty('--banner-btn-hover', color);
        });
        restartBtn.addEventListener('mouseleave', function() {
            restartBtn.style.removeProperty('--banner-btn-hover');
        });
    }
}

// Patch startGame to also create the buffer and ensure no initial matches on the board
function startGame() {
    board = [];
    document.getElementById("board").innerHTML = "";
    createCandyBuffer();
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("img");
            tile.id = r + "-" + c;
            // Pick a random candy that does not create a match
            let available = candies.slice();
            // Prevent horizontal match
            if (c >= 2) {
                let left1 = row[c-1].src.split("/").pop().split(".")[0];
                let left2 = row[c-2].src.split("/").pop().split(".")[0];
                if (left1 === left2) {
                    available = available.filter(candy => candy !== left1);
                }
            }
            // Prevent vertical match
            if (r >= 2) {
                let up1 = board[r-1][c].src.split("/").pop().split(".")[0];
                let up2 = board[r-2][c].src.split("/").pop().split(".")[0];
                if (up1 === up2) {
                    available = available.filter(candy => candy !== up1);
                }
            }
            tile.src = "./Resources/Images/" + available[Math.floor(Math.random() * available.length)] + ".png";
            tile.addEventListener("click", onCandyClick);
            // Remove drag events
            tile.removeEventListener("dragstart", dragStart);
            tile.removeEventListener("dragover", dragOver);
            tile.removeEventListener("dragenter", dragEnter);
            tile.removeEventListener("dragleave", dragLeave);
            tile.removeEventListener("drop", dragDrop);
            tile.removeEventListener("dragend", dragEnd);
            tile.draggable = false;
            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }
    resetScoreGoal();
}

// Helper to set a tile to blank and hide it
function setBlank(tile) {
    tile.src = "./Resources/Images/blank.png";
    tile.style.visibility = "hidden";
}
// Helper to set a tile to a candy and show it
function setCandy(tile, candyType) {
    tile.src = "./Resources/Images/" + candyType + ".png";
    tile.style.visibility = "visible";
}

// Update generateCandy to pull from buffer
function generateCandy() {
    for (let c = 0; c < columns; c++) {
        if (board[0][c].src.includes("blank")) {
            // Find the bottom-most non-blank in the buffer column
            let bufferCol = candyBuffer.map(row => row[c]);
            let bufferIndex = bufferRows - 1;
            while (bufferIndex >= 0 && bufferCol[bufferIndex].src.includes("blank")) {
                bufferIndex--;
            }
            if (bufferIndex >= 0) {
                // Move the buffer candy to the board
                board[0][c].src = bufferCol[bufferIndex].src;
                board[0][c].style.visibility = "visible";
                setBlank(bufferCol[bufferIndex]);
            } else {
                setCandy(board[0][c], randomCandy());
            }
            // Shift buffer candies down and generate a new one at the top
            for (let r = bufferIndex; r > 0; r--) {
                bufferCol[r].src = bufferCol[r-1].src;
                bufferCol[r].style.visibility = bufferCol[r-1].style.visibility;
            }
            setCandy(bufferCol[0], randomCandy());
        }
    }
}


// --- Click-to-select swapping system ---
let selectedTile = null;
const selectionColors = [
    '#4d79ff', // Blue
    '#ffe44d', // Yellow
    '#4dff88', // Green
    '#ff4d4d', // Red
    '#b84dff', // Purple
    '#ffb84d'  // Orange
];

function onCandyClick(e) {
    if (this.src.includes("blank")) return;
    if (!selectedTile) {
        selectedTile = this;
        // Pick a random color for the selection highlight
        const color = selectionColors[Math.floor(Math.random() * selectionColors.length)];
        this.style.setProperty('--selected-candy-color', color);
        this.classList.add("selected-candy");
    } else if (selectedTile === this) {
        selectedTile.classList.remove("selected-candy");
        selectedTile = null;
    } else {
        // Check adjacency
        let [r1, c1] = selectedTile.id.split("-").map(Number);
        let [r2, c2] = this.id.split("-").map(Number);
        let isAdjacent = (c2 == c1 - 1 && r1 == r2) || (c2 == c1 + 1 && r1 == r2) || (r2 == r1 - 1 && c1 == c2) || (r2 == r1 + 1 && c1 == c2);
        if (isAdjacent) {
            currTile = selectedTile;
            otherTile = this;
            // Animate the slide visually
            currTile.classList.add('slide-anim');
            otherTile.classList.add('slide-anim');
            // Swap src for visual effect
            let temp = currTile.src;
            currTile.src = otherTile.src;
            otherTile.src = temp;
            setTimeout(() => {
                // Color bomb logic
                if (currTile.src.includes("ColorBomb.png")) {
                    let color = extractColor(otherTile.src);
                    removeAllOfColor(color);
                    currTile.src = "./Resources/Images/blank.png";
                    sfx.bomb.play();
                    currTile.classList.remove('slide-anim');
                    otherTile.classList.remove('slide-anim');
                    selectedTile.classList.remove("selected-candy");
                    selectedTile = null;
                    return;
                }
                if (otherTile.src.includes("ColorBomb.png")) {
                    let color = extractColor(currTile.src);
                    removeAllOfColor(color);
                    otherTile.src = "./Resources/Images/blank.png";
                    sfx.bomb.play();
                    currTile.classList.remove('slide-anim');
                    otherTile.classList.remove('slide-anim');
                    selectedTile.classList.remove("selected-candy");
                    selectedTile = null;
                    return;
                }
                // Striped + striped combo (any color)
                if (isStriped(currTile.src) && isStriped(otherTile.src)) {
                    activateSpecial(currTile);
                    activateSpecial(otherTile);
                    sfx.stripe.play();
                    currTile.classList.remove('slide-anim');
                    otherTile.classList.remove('slide-anim');
                    selectedTile.classList.remove("selected-candy");
                    selectedTile = null;
                    return;
                }
                // Only allow swap if a match is made
                const matchMade = checkValid();
                if (!matchMade) {
                    // Revert swap with animation
                    let revertTemp = currTile.src;
                    currTile.src = otherTile.src;
                    otherTile.src = revertTemp;
                    sfx.invalid.play();
                }
                currTile.classList.remove('slide-anim');
                otherTile.classList.remove('slide-anim');
                selectedTile.classList.remove("selected-candy");
                selectedTile = null;
            }, 280);
        } else {
            // Not adjacent, move highlight
            selectedTile.classList.remove("selected-candy");
            selectedTile = this;
            // Pick a new random color for the new selection
            const color = selectionColors[Math.floor(Math.random() * selectionColors.length)];
            this.style.setProperty('--selected-candy-color', color);
            this.classList.add("selected-candy");
        }
    }
}

function dragStart(e) {
    currTile = this;
    // Hide the default drag image (cross-browser)
    if (e && e.dataTransfer) {
        // Use a transparent 1x1 PNG as drag image
        var img = document.createElement('img');
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
        img.width = img.height = 1;
        e.dataTransfer.setDragImage(img, 0, 0);
    }
}
function dragOver(e) { e.preventDefault(); }
function dragEnter(e) { e.preventDefault(); }
function dragLeave() {}
function dragDrop() { otherTile = this; }

function dragEnd() {
    if (currTile.src.includes("blank") || otherTile.src.includes("blank")) return;

    let [r, c] = currTile.id.split("-").map(Number);
    let [r2, c2] = otherTile.id.split("-").map(Number);

    let isAdjacent = (c2 == c - 1 && r == r2) || (c2 == c + 1 && r == r2) || (r2 == r - 1 && c == c2) || (r2 == r + 1 && c == c2);
    if (!isAdjacent) return;

    // Animate the slide visually
    currTile.classList.add('slide-anim');
    otherTile.classList.add('slide-anim');
    // Swap src for visual effect
    let temp = currTile.src;
    currTile.src = otherTile.src;
    otherTile.src = temp;

    // After animation, check for match and revert if needed
    setTimeout(() => {
        // Color bomb logic
        if (currTile.src.includes("ColorBomb.png")) {
            let color = extractColor(otherTile.src);
            removeAllOfColor(color);
            currTile.src = "./Resources/Images/blank.png";
            sfx.bomb.play();
            currTile.classList.remove('slide-anim');
            otherTile.classList.remove('slide-anim');
            return;
        }
        if (otherTile.src.includes("ColorBomb.png")) {
            let color = extractColor(currTile.src);
            removeAllOfColor(color);
            otherTile.src = "./Resources/Images/blank.png";
            sfx.bomb.play();
            currTile.classList.remove('slide-anim');
            otherTile.classList.remove('slide-anim');
            return;
        }
        // Striped + striped combo (any color)
        if (isStriped(currTile.src) && isStriped(otherTile.src)) {
            activateSpecial(currTile);
            activateSpecial(otherTile);
            sfx.stripe.play();
            currTile.classList.remove('slide-anim');
            otherTile.classList.remove('slide-anim');
            return;
        }
        // Only allow swap if a match is made (including if a striped is part of a match)
        const matchMade = checkValid();
        if (matchMade) {
            // sfx.swap.volume = 0.2;
            // sfx.swap.play();
        } else {
            // Revert swap with animation
            let revertTemp = currTile.src;
            currTile.src = otherTile.src;
            otherTile.src = revertTemp;
            sfx.invalid.play();
        }
        currTile.classList.remove('slide-anim');
        otherTile.classList.remove('slide-anim');
    }, 280); // Animation duration should match CSS (0.28s)
}

function checkValid() {
    // Check for any match of 3 or more after a swap
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let a = board[r][c], b = board[r][c+1], d = board[r][c+2];
            let color = extractColor(a.src);
            if (!a.src.includes("blank") && extractColor(b.src) === color && extractColor(d.src) === color) {
                return true;
            }
        }
    }
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let a = board[r][c], b = board[r+1][c], d = board[r+2][c];
            let color = extractColor(a.src);
            if (!a.src.includes("blank") && extractColor(b.src) === color && extractColor(d.src) === color) {
                return true;
            }
        }
    }
    return false;
}

function getCandyColor(color) {
    switch (color) {
        case 'Red': return '#ff4d4d';
        case 'Blue': return '#4d79ff';
        case 'Green': return '#4dff88';
        case 'Yellow': return '#ffe44d';
        case 'Orange': return '#ffb84d';
        case 'Purple': return '#b84dff';
        default: return '#fff';
    }
}

function flashLine(tiles, color) {
    const flashColor = getCandyColor(color);
    tiles.forEach(tile => {
        tile.style.setProperty('--flash-color', flashColor);
        tile.classList.add('line-flash');
        tile.addEventListener('animationend', function handler() {
            tile.classList.remove('line-flash');
            tile.style.removeProperty('--flash-color');
            tile.removeEventListener('animationend', handler);
        });
    });
}

function flashExplosion(tiles, color) {
    const flashColor = getCandyColor(color);
    tiles.forEach(tile => {
        tile.style.setProperty('--flash-color', flashColor);
        tile.classList.add('line-flash');
        tile.addEventListener('animationend', function handler() {
            tile.classList.remove('line-flash');
            tile.style.removeProperty('--flash-color');
            tile.removeEventListener('animationend', handler);
        });
    });
}

function removeAllOfColor(color) {
    let toRemove = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = board[r][c];
            if (extractColor(tile.src) === color && !tile.src.includes("blank")) {
                toRemove.push(tile);
            }
        }
    }
    // Flash all candies of the color
    flashExplosion(toRemove, color);
    // Activate any special candies of that color
    toRemove.forEach(tile => {
        if (isStriped(tile.src)) activateSpecial(tile);
    });
    // Remove all candies of the color after a short delay for the flash
    setTimeout(() => {
        toRemove.forEach(tile => { setBlank(tile); });
        // Play divine after colorbomb cascade is finished
        sfx.divine.play().catch(() => {});
    }, 350);
    score += 100;
    levelScore += 100;

}

function activateSpecial(tile) {
    let src = tile.src;
    let color = extractColor(tile.src);
    if (src.includes("StripedH-")) {
        let [r] = tile.id.split("-").map(Number);
        // Flash the row
        flashLine(board[r], color);
        for (let c = 0; c < columns; c++) {
            board[r][c].src = "./Resources/Images/blank.png";
        }
        score += 60;
        levelScore += 60;
    } else if (src.includes("StripedV-")) {
        let [, c] = tile.id.split("-").map(Number);
        // Flash the column
        let colTiles = [];
        for (let r = 0; r < rows; r++) colTiles.push(board[r][c]);
        flashLine(colTiles, color);
        for (let r = 0; r < rows; r++) {
            board[r][c].src = "./Resources/Images/blank.png";
        }
        score += 60;
        levelScore += 60;
    }
    // Play a random sound after striped
    const sounds = [sfx.sweet, sfx.tasty, sfx.delicious];
    const rand = Math.floor(Math.random() * sounds.length);
    setTimeout(() => { sounds[rand].play().catch(() => {}); }, 350);
    sfx.stripe.play();
}

function crushCandy() {
    let crushed = false;
    let sound = null;

    if (crushFive()) {
        crushed = true;
        sound = "match5";
    } else if (crushFour()) {
        crushed = true;
        sound = "match4";
    } else if (crushThree()) {
        crushed = true;
        sound = "match3";
    }

    document.getElementById("score").innerText = score;
    return { crushed, sound };
}

function animateCrush(tiles, callback) {
    let count = 0;
    tiles.forEach(tile => {
        tile.classList.add('crush-anim');
        tile.addEventListener('animationend', function handler() {
            tile.classList.remove('crush-anim');
            tile.removeEventListener('animationend', handler);
            count++;
            if (count === tiles.length && callback) callback();
        });
    });
}

function crushFour() {
    let crushed = false;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 3; c++) {
            let a = board[r][c], b = board[r][c+1], d = board[r][c+2], e = board[r][c+3];
            let color = extractColor(a.src);
            if (!a.src.includes("blank") && extractColor(b.src) === color && extractColor(d.src) === color && extractColor(e.src) === color) {
                let tiles = [a, b, d, e];
                // Only activate striped candies of the matching color
                tiles.forEach(tile => {
                    if (isStriped(tile.src) && extractColor(tile.src) === color) activateSpecial(tile);
                });
                // Only create a new striped if none are already striped of the matching color
                if (!isStriped(a.src) && !isStriped(b.src) && !isStriped(d.src) && !isStriped(e.src)) {
                    animateCrush([a, b, e], () => {
                        d.src = `./Resources/Images/StripedH-${color}.png`;
                        a.src = b.src = e.src = "./Resources/Images/blank.png";
                        setBlank(a);
                        setBlank(b);
                        setBlank(e);
                    });
                } else {
                    animateCrush([a, b, d, e], () => {
                        d.src = a.src = b.src = e.src = "./Resources/Images/blank.png";
                        setBlank(d);
                        setBlank(a);
                        setBlank(b);
                        setBlank(e);
                    });
                }
                score += 60;
                levelScore += 60;
                crushed = true;
            }
        }
    }
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 3; r++) {
            let a = board[r][c], b = board[r+1][c], d = board[r+2][c], e = board[r+3][c];
            let color = extractColor(a.src);
            if (!a.src.includes("blank") && extractColor(b.src) === color && extractColor(d.src) === color && extractColor(e.src) === color) {
                let tiles = [a, b, d, e];
                tiles.forEach(tile => {
                    if (isStriped(tile.src) && extractColor(tile.src) === color) activateSpecial(tile);
                });
                if (!isStriped(a.src) && !isStriped(b.src) && !isStriped(d.src) && !isStriped(e.src)) {
                    animateCrush([a, b, e], () => {
                        d.src = `./Resources/Images/StripedV-${color}.png`;
                        a.src = b.src = e.src = "./Resources/Images/blank.png";
                        setBlank(a);
                        setBlank(b);
                        setBlank(e);
                    });
                } else {
                    animateCrush([a, b, d, e], () => {
                        d.src = a.src = b.src = e.src = "./Resources/Images/blank.png";
                        setBlank(d);
                        setBlank(a);
                        setBlank(b);
                        setBlank(e);
                    });
                }
                score += 60;
                levelScore += 60;
                crushed = true;
            }
        }
    }
    return crushed;
}

function crushFive() {
    let crushed = false;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 4; c++) {
            let a = board[r][c], b = board[r][c+1], d = board[r][c+2], e = board[r][c+3], f = board[r][c+4];
            if (!isStriped(a.src) && extractColor(a.src) === extractColor(b.src) && extractColor(b.src) === extractColor(d.src) && extractColor(d.src) === extractColor(e.src) && extractColor(e.src) === extractColor(f.src) && !a.src.includes("blank")) {
                d.src = "./Resources/Images/ColorBomb.png";
                a.src = b.src = e.src = f.src = "./Resources/Images/blank.png";
                setBlank(a);
                setBlank(b);
                setBlank(e);
                setBlank(f);
                score += 100;
                levelScore += 100;
                crushed = true;
            }
        }
    }
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 4; r++) {
            let a = board[r][c], b = board[r+1][c], d = board[r+2][c], e = board[r+3][c], f = board[r+4][c];
            if (!isStriped(a.src) && extractColor(a.src) === extractColor(b.src) && extractColor(b.src) === extractColor(d.src) && extractColor(d.src) === extractColor(e.src) && extractColor(e.src) === extractColor(f.src) && !a.src.includes("blank")) {
                d.src = "./Resources/Images/ColorBomb.png";
                a.src = b.src = e.src = f.src = "./Resources/Images/blank.png";
                setBlank(a);
                setBlank(b);
                setBlank(e);
                setBlank(f);
                score += 100;
                levelScore += 100;
                crushed = true;
            }
        }
    }
    return crushed;
}

function crushThree() {
    let crushed = false;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let a = board[r][c], b = board[r][c+1], d = board[r][c+2];
            let color = extractColor(a.src);
            if (!a.src.includes("blank") && extractColor(b.src) === color && extractColor(d.src) === color) {
                let tiles = [a, b, d];
                tiles.forEach(tile => {
                    if (isStriped(tile.src) && extractColor(tile.src) === color) activateSpecial(tile);
                });
                animateCrush(tiles, () => {
                    a.src = b.src = d.src = "./Resources/Images/blank.png";
                    setBlank(a);
                    setBlank(b);
                    setBlank(d);
                });
                score += 30;
                levelScore += 30;
                crushed = true;
            }
        }
    }
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let a = board[r][c], b = board[r+1][c], d = board[r+2][c];
            let color = extractColor(a.src);
            if (!a.src.includes("blank") && extractColor(b.src) === color && extractColor(d.src) === color) {
                let tiles = [a, b, d];
                tiles.forEach(tile => {
                    if (isStriped(tile.src) && extractColor(tile.src) === color) activateSpecial(tile);
                });
                animateCrush(tiles, () => {
                    a.src = b.src = d.src = "./Resources/Images/blank.png";
                    setBlank(a);
                    setBlank(b);
                    setBlank(d);
                });
                score += 30;
                levelScore += 30;
                crushed = true;
            }
        }
    }
    return crushed;
}

function slideCandy() {
    for (let c = 0; c < columns; c++) {
        // Collect all non-blank candies in this column
        let candiesInCol = [];
        for (let r = 0; r < rows; r++) {
            if (!board[r][c].src.includes("blank")) {
                candiesInCol.push(board[r][c].src);
            }
        }
        // Fill from the bottom up with candies
        let r = rows - 1;
        for (let i = candiesInCol.length - 1; i >= 0; i--, r--) {
            board[r][c].src = candiesInCol[i];
            board[r][c].style.visibility = "visible";
        }
        // Fill the rest with blanks (hidden)
        for (; r >= 0; r--) {
            setBlank(board[r][c]);
        }
    }
}

// --- TIMER SYSTEM ---
let timer = null;
let timeLeft = 120; // seconds
const TIMER_START = 120; // seconds

function createTimerBar() {
    let bar = document.getElementById('timer-bar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'timer-bar';
        bar.style.display = 'flex';
        bar.style.justifyContent = 'center';
        bar.style.alignItems = 'center';
        bar.style.margin = '18px auto 0 auto';
        bar.style.width = '400px';
        bar.style.height = '28px';
        bar.style.background = 'rgba(0,0,0,0.10)';
        bar.style.borderRadius = '16px';
        bar.style.padding = '0 12px';
        bar.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
        bar.style.position = 'relative';
        document.body.insertBefore(bar, document.getElementById('score-bar').nextSibling);
    }
    // Progress bar inner
    let inner = document.getElementById('timer-bar-inner');
    if (!inner) {
        inner = document.createElement('div');
        inner.id = 'timer-bar-inner';
        inner.style.height = '100%';
        inner.style.borderRadius = '16px';
        inner.style.background = 'linear-gradient(90deg,#43b86a,#ffe44d,#e74c3c)';
        inner.style.transition = 'width 0.4s cubic-bezier(.4,1.4,.6,1)';
        inner.style.position = 'absolute';
        inner.style.left = '0';
        inner.style.top = '0';
        bar.appendChild(inner);
    }
    // Timer text
    let text = document.getElementById('timer-bar-text');
    if (!text) {
        text = document.createElement('span');
        text.id = 'timer-bar-text';
        text.style.position = 'relative';
        text.style.zIndex = '2';
        text.style.fontWeight = 'bold';
        text.style.fontSize = '1.1rem';
        text.style.color = '#222';
        text.style.textShadow = '0 1px 4px #fff';
        bar.appendChild(text);
    }
    // Update progress
    let percent = Math.max(0, Math.min(100, Math.round((timeLeft / TIMER_START) * 100)));
    inner.style.width = percent + '%';
    let min = Math.floor(timeLeft / 60);
    let sec = (timeLeft % 60).toString().padStart(2, '0');
    text.innerText = `Time Left: ${min}:${sec}`;
}

function updateTimerBar() {
    createTimerBar();
}

function startTimer() {
    if (timer) clearInterval(timer);
    timeLeft = timeStart;
    updateTimerBar();
    timer = setInterval(() => {
        timeLeft--;
        updateTimerBar();
        if (timeLeft <= 0) {
            clearInterval(timer);
            timer = null;
            if (!document.getElementById('win-banner') && !document.getElementById('lose-banner')) {
                showLoseBanner();
            }
        }
    }, 1000);
}

function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
}

// Patch startGame to also start the timer
const origStartGameWithTimer = startGame;
startGame = function() {
    origStartGameWithTimer();
    startTimer();
}

// Patch crushCandy to stop timer if win
const origCrushCandyWithTimer = crushCandy;
crushCandy = function() {
    let result = origCrushCandyWithTimer();
    if (levelScore >= scoreGoal) stopTimer();
    return result;
}

function showLoseBanner() {
    if (sfx.lose) sfx.lose.play().catch(() => {});
    const loseBanner = document.createElement('div');
    loseBanner.id = 'lose-banner';
    loseBanner.className = 'game-banner lose-banner';
    loseBanner.style.top = '-400px';
    loseBanner.style.left = '50%';
    loseBanner.style.transform = 'translate(-50%, 0) scale(1)';
    loseBanner.innerHTML = `
        <div class="banner-title"></div>
        <div style="font-size:1.2rem;margin-bottom:18px;"></div>
        <button id="restartBtnLose" class="banner-btn">Restart</button>
    `;
    document.body.appendChild(loseBanner);
    setTimeout(() => {
        loseBanner.classList.add('slide-center');
        loseBanner.style.top = '';
        loseBanner.style.transform = '';
    }, 50);
    document.getElementById('restartBtnLose').addEventListener('click', () => {
        loseBanner.classList.remove('slide-center');
        loseBanner.classList.add('slide-up');
        setTimeout(() => { loseBanner.remove(); startGame(); }, 800);
    });
    // Random hover color for restart
    const restartBtn = document.getElementById('restartBtnLose');
    if (restartBtn) {
        const hoverColors = ['#3498db', '#ff9800', '#ffe44d', '#a259e6', '#e74c3c', '#43b86a'];
        restartBtn.addEventListener('mouseenter', function() {
            const color = hoverColors[Math.floor(Math.random() * hoverColors.length)];
            restartBtn.style.setProperty('--banner-btn-hover', color);
        });
        restartBtn.addEventListener('mouseleave', function() {
            restartBtn.style.removeProperty('--banner-btn-hover');
        });
    }
}

