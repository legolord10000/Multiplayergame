// Get the canvas and drawing context
let canvas = document.getElementById("gameCanvas");
let pencil = canvas.getContext("2d");
pencil.imageSmoothingEnabled = false;

let background = document.getElementById("background");
let itemSprite = document.getElementById("coin");

// Score variables
let neuroScore = 0;
let evilScore = 0;
const winningScore = 10; // You set the minimum points to reach

const neuroScoreDiv = document.getElementById("neuroScoreDisplay");
const evilScoreDiv = document.getElementById("evilScoreDisplay");

// -----------------------------------------------
// Character objects with sprite arrays for walking animation

// Player 1: Neuro
let neuro = {
    x: 50,
    y: 50,
    width: 40,
    height: 60,
    spriteFacing: null,
    controls: {
        up: "w",
        down: "s",
        left: "a",
        right: "d"
    },
    spritesUp: [
        document.getElementById("neuro_up_1"),
        document.getElementById("neuro_up_2"),
        document.getElementById("neuro_up_3"),
        document.getElementById("neuro_up_4")
    ],
    spritesDown: [
        document.getElementById("neuro_down_1"),
        document.getElementById("neuro_down_2"),
        document.getElementById("neuro_down_3"),
        document.getElementById("neuro_down_4")
    ],
    spritesLeft: [
        document.getElementById("neuro_left_1"),
        document.getElementById("neuro_left_2")
    ],
    spritesRight: [
        document.getElementById("neuro_right_1"),
        document.getElementById("neuro_right_2")
    ],
    frameIndex: 0,
    frameTimer: 0,
    frameInterval: 10,
    facingDirection: "down"
};

// Player 2: Evil
let evil = {
    x: 200,
    y: 200,
    width: 40,
    height: 60,
    spriteFacing: null,
    controls: {
        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight"
    },
    spritesUp: [
        document.getElementById("evil_up_1"),
        document.getElementById("evil_up_2"),
        document.getElementById("evil_up_3"),
        document.getElementById("evil_up_4")
    ],
    spritesDown: [
        document.getElementById("evil_down_1"),
        document.getElementById("evil_down_2"),
        document.getElementById("evil_down_3"),
        document.getElementById("evil_down_4")
    ],
    spritesLeft: [
        document.getElementById("evil_left_1"),
        document.getElementById("evil_left_2")
    ],
    spritesRight: [
        document.getElementById("evil_right_1"),
        document.getElementById("evil_right_2")
    ],
    frameIndex: 0,
    frameTimer: 0,
    frameInterval: 10,
    facingDirection: "down"
};

// Initialize animation states
function initCharacterAnimation(character) {
    character.frameIndex = 0;
    character.frameTimer = 0;
    character.facingDirection = "down";
}
initCharacterAnimation(neuro);
initCharacterAnimation(evil);

// Track pressed keys
let keysPressed = {};
window.addEventListener("keydown", e => { keysPressed[e.key] = true; });
window.addEventListener("keyup", e => { keysPressed[e.key] = false; });

// Utility to get current sprite based on direction
function getCurrentSprite(character) {
    let spritesArray;
    switch (character.facingDirection) {
        case "up": spritesArray = character.spritesUp; break;
        case "down": spritesArray = character.spritesDown; break;
        case "left": spritesArray = character.spritesLeft; break;
        case "right": spritesArray = character.spritesRight; break;
        default: spritesArray = [character.spritesDown[0]];
    }
    return spritesArray[character.frameIndex];
}

// Update movement and animation, including diagonal movement
function updateCharacter(character, controls) {
    let moveX = 0, moveY = 0;
    if (keysPressed[controls.up]) moveY -= 1;
    if (keysPressed[controls.down]) moveY += 1;
    if (keysPressed[controls.left]) moveX -= 1;
    if (keysPressed[controls.right]) moveX += 1;

    if (moveX !== 0 || moveY !== 0) {
        const mag = Math.sqrt(moveX*moveX + moveY*moveY);
        moveX /= mag;
        moveY /= mag;

        character.x += moveX * 5;
        character.y += moveY * 5;

        if (Math.abs(moveX) > Math.abs(moveY)) {
            character.facingDirection = moveX > 0 ? "right" : "left";
        } else {
            character.facingDirection = moveY > 0 ? "down" : "up";
        }

        // Animate walking
        character.frameTimer++;
        if (character.frameTimer >= character.frameInterval) {
            character.frameTimer = 0;
            const spritesArray = getSpritesArray(character);
            character.frameIndex = (character.frameIndex + 1) % spritesArray.length;
        }
    } else {
        // Not moving
        character.frameIndex = 0;
    }
}

function getSpritesArray(character) {
    switch (character.facingDirection) {
        case "up": return character.spritesUp;
        case "down": return character.spritesDown;
        case "left": return character.spritesLeft;
        case "right": return character.spritesRight;
        default: return [character.spritesDown[0]];
    }
}

function drawCharacter(character) {
    const sprite = getCurrentSprite(character);
    if (sprite) {
        pencil.drawImage(sprite, character.x, character.y, 40, 60);
    }
}

// Initialize item
let item = {
    x: 0,
    y: 0,
    width: 32,
    height: 32,
    sprite: itemSprite,
    draw: function() {
        pencil.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    }
};

// Utility: get distance
function getDistance(a, b) {
    const dx = (a.x + a.width/2) - (b.x + b.width/2);
    const dy = (a.y + a.height/2) - (b.y + b.height/2);
    return Math.sqrt(dx*dx + dy*dy);
}

// Reposition item avoiding players
function repositionItem(avoidCharacters) {
    let validPos = false;
    let newX, newY;
    while (!validPos) {
        newX = Math.random() * (canvas.width - item.width);
        newY = Math.random() * (canvas.height - item.height);
        validPos = true;
        for (let c of avoidCharacters) {
            if (getDistance({x: newX, y: newY, width: item.width, height: item.height}, c) < 50) {
                validPos = false;
                break;
            }
        }
    }
    item.x = newX;
    item.y = newY;
}

// Check if a character collected the item
function checkCollection(character) {
    if (getDistance(character, item) < 30) {
        if (character === neuro) {
            neuroScore++;
            neuroScoreDiv.innerHTML = `Neuro: ${neuroScore}`;
        } else if (character === evil) {
            evilScore++;
            evilScoreDiv.innerHTML = `Evil: ${evilScore}`;
        }
        repositionItem([neuro, evil]);
        checkWin();
    }
}

// Check for game end
function checkWin() {
    if (neuroScore >= 10 && (neuroScore - evilScore) >= 2) {
        showWinScreen(
            "Neuro Wins!", 
            "images/happy_neuro.png",
        );
    } else if (evilScore >= 10 && (evilScore - neuroScore) >= 2) {
        showWinScreen(
            "Evil Wins!", 
            "images/happy_evil.png",
        );
    }
}

// Show win overlay
function showWinScreen(text, winnerImgSrc, loserImgSrc) {
    clearInterval(gameInterval);
    const overlay = document.createElement("div");
    overlay.id = "winOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.8)";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = 9999;

    const msg = document.createElement("h1");
    msg.innerText = text;
    msg.style.color = "white";

    const winnerImg = document.createElement("img");
    winnerImg.src = winnerImgSrc;
    winnerImg.style.width = "300px";

    const restartBtn = document.createElement("button");
    restartBtn.innerText = "Play Again";
    restartBtn.onclick = () => {
        document.body.removeChild(overlay);
        location.reload();
    };

    overlay.appendChild(msg);
    overlay.appendChild(winnerImg);
    overlay.appendChild(restartBtn);
    document.body.appendChild(overlay);
}

// Initialize item position avoiding players
repositionItem([neuro, evil]);

// Main game loop
let gameInterval = setInterval(() => {
    // Clear and draw background
    pencil.clearRect(0, 0, canvas.width, canvas.height);
    pencil.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Update characters
    updateCharacter(neuro, neuro.controls);
    updateCharacter(evil, evil.controls);

    // Draw characters
    drawCharacter(neuro);
    drawCharacter(evil);

    // Draw item
    item.draw();

    // Check for collection
    checkCollection(neuro);
    checkCollection(evil);
}, 50);