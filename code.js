// Get the canvas and drawing context
let canvas = document.getElementById("gameCanvas");
let pencil = canvas.getContext("2d");

// Disable image smoothing for pixelated sprites
pencil.imageSmoothingEnabled = false;

// Grab background image
let background = document.getElementById("background");

// Item sprite
let itemSprite = document.getElementById("coin");

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
    // Sprite arrays for walking animation
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
    facingDirection: "down" // default
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
    character.facingDirection = "down"; // default
}
initCharacterAnimation(neuro);
initCharacterAnimation(evil);

// Track pressed keys
let keysPressed = {};
window.addEventListener("keydown", function(e) {
    keysPressed[e.key] = true;
});
window.addEventListener("keyup", function(e) {
    keysPressed[e.key] = false;
});

// Utility to get the current sprite based on direction and animation frame
function getCurrentSprite(character) {
    let spritesArray;
    switch (character.facingDirection) {
        case "up": spritesArray = character.spritesUp; break;
        case "down": spritesArray = character.spritesDown; break;
        case "left": spritesArray = character.spritesLeft; break;
        case "right": spritesArray = character.spritesRight; break;
        default: spritesArray = [character.spritesDown[0]]; // fallback
    }
    return spritesArray[character.frameIndex];
}

// Update character movement, animation, including diagonal movement
function updateCharacter(character, controls) {
    let moveX = 0;
    let moveY = 0;

    if (keysPressed[controls.up]) moveY -= 1;
    if (keysPressed[controls.down]) moveY += 1;
    if (keysPressed[controls.left]) moveX -= 1;
    if (keysPressed[controls.right]) moveX += 1;

    if (moveX !== 0 || moveY !== 0) {
        // Normalize for consistent speed in diagonal
        const mag = Math.sqrt(moveX * moveX + moveY * moveY);
        moveX /= mag;
        moveY /= mag;

        // Move position
        character.x += moveX * 5;
        character.y += moveY * 5;

        // Set facing direction based on dominant movement axis
        if (Math.abs(moveX) > Math.abs(moveY)) {
            // Horizontal dominant
            character.facingDirection = moveX > 0 ? "right" : "left";
        } else {
            // Vertical dominant
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
        // Not moving, reset to first frame
        character.frameIndex = 0;
    }
}

// Helper to get sprites array based on facing direction
function getSpritesArray(character) {
    switch (character.facingDirection) {
        case "up": return character.spritesUp;
        case "down": return character.spritesDown;
        case "left": return character.spritesLeft;
        case "right": return character.spritesRight;
        default: return [character.spritesDown[0]];
    }
}

// Draw character scaled to 40x60
function drawCharacter(character) {
    let sprite = getCurrentSprite(character);
    if (sprite) {
        pencil.drawImage(sprite, character.x, character.y, 40, 60);
    }
}

// Initialize item position
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
function repositionItem() {
    item.x = Math.random() * (canvas.width - item.width);
    item.y = Math.random() * (canvas.height - item.height);
}
repositionItem();

// Utility to get distance
function getDistance(a, b) {
    let dx = (a.x + a.width/2) - (b.x + b.width/2);
    let dy = (a.y + a.height/2) - (b.y + b.height/2);
    return Math.sqrt(dx*dx + dy*dy);
}

function checkCollection(character) {
    if (getDistance(character, item) < 30) {
        repositionItem();
    }
}

// Main game loop
function gameLoop() {
    // Clear and draw background
    pencil.clearRect(0, 0, canvas.width, canvas.height);
    pencil.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Update movement & animation
    updateCharacter(neuro, neuro.controls);
    updateCharacter(evil, evil.controls);

    // Draw characters
    drawCharacter(neuro);
    drawCharacter(evil);

    // Draw item
    item.draw();

    // Check collection
    checkCollection(neuro);
    checkCollection(evil);
}

// Run the game
setInterval(gameLoop, 50);