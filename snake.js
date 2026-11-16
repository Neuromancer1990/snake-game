
// 1. DOM ELEMEK ÖSSZEKÖTÉSE

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const scoreElement = document.getElementById('score');
const speedElement = document.getElementById('speed');
const startBtn = document.getElementById('startBtn');
const leaderboardRows = document.getElementById('leaderboardRows');

// 2. KONSTANSOK ÉS ALAP ÉRTÉKEI / KÉPEK ELÉRÉSE

const tileSize = 20;
const gridCounter = canvas.width / tileSize;

const initialGameSpeed = 120;
const speedIncrease = 3;
const minGameSpeed = 40;

const snakeHeadImage = new Image();
snakeHeadImage.src = './snek.png';

const snakeBodyImage = new Image();
snakeBodyImage.src = './snek2.png';

const eggImage = new Image();
eggImage.src = './egg.png';

const foodImage = new Image();
foodImage.src = './food.png';

// 3. JÁTÉKÁLLAPOT

let isGameOver = false;
let gameInterval = null;
let gameSpeed = initialGameSpeed;

let score = 0;
let foodsEaten = 0;

let playerName = '';
let leaderboard = JSON.parse(
    localStorage.getItem('snakeLeaderboard') || '[]'
);

let eggs = [];
let food = null;

let snake = [
    {x: 10, y: 10},
    {x: 9, y: 10},
    {x: 8, y: 10}
];

let direction = {x: 1, y: 0};
let nextDirection = {x: 1, y: 0};

// 4. JÁTÉK VEZÉRLÉSE

function startGame() {
    const name = prompt('Add meg a játékosneved:');

    if (name === null || !name.trim()) return;

    playerName = name.trim().slice(0, 20);

    if (gameInterval) {
        clearInterval(gameInterval);
    }

    isGameOver = false;
    score = 0;
    foodsEaten = 0;
    eggs = [];
    gameSpeed = initialGameSpeed;

    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];

    direction = {x: 1, y: 0};
    nextDirection = {x: 1, y: 0};

    createFood();

    scoreElement.textContent = score;
    speedElement.textContent = gameSpeed;

    startBtn.disabled = true;
    startBtn.textContent = 'GAME RUNNING';

    draw();

    gameInterval = setInterval(gameLoop, gameSpeed);
}


function gameLoop() {
    if (isGameOver) return;

    update();

    if (isGameOver) return;

    draw();
}


function gameOver() {
    isGameOver = true;

    clearInterval(gameInterval);
    gameInterval = null;

    saveScore();

    startBtn.disabled = false;
    startBtn.textContent = 'RESTART GAME';

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    ctx.font = 'bold 36px Arial';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);

    ctx.font = '25px Arial';
    ctx.fillText(`Final score: ${score}`,
        canvas.width / 2,
        canvas.height / 2 + 30
    );
}

function gameWon() {
    isGameOver = true;

    clearInterval(gameInterval);
    gameInterval = null;

    saveScore();

    startBtn.disabled = false;
    startBtn.textContent = 'PLAY AGAIN';

    draw();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'lime';
    ctx.textAlign = 'center';

    ctx.font = 'bold 36px Arial';
    ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2);

    ctx.fillStyle = 'white';
    ctx.font = '25px Arial';
    ctx.fillText(
        `Final score: ${score}`,
        canvas.width / 2,
        canvas.height / 2 + 35
    );
}

// 5. JÁTÉKLOGIKA

function update() {
    direction = nextDirection;

    const currentHead = snake[0];

    const newHead = {
        x: currentHead.x + direction.x,
        y: currentHead.y + direction.y
    };

    if (checkCollision(newHead)) {
        gameOver();
        return;
    }

    snake.unshift(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        foodsEaten++;

        scoreElement.textContent = score;

        if (foodsEaten % 3 === 0) {
            layEgg();
        }

        if (!createFood()) {
            gameWon();
            return;
        }

        gameSpeed = Math.max(
            minGameSpeed,
            gameSpeed - speedIncrease
        );

        speedElement.textContent = gameSpeed;

        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);

    } else {
        snake.pop();
    }
}


function checkCollision(head) {
    const hitWall =
        head.x < 0 ||
        head.x >= gridCounter ||
        head.y < 0 ||
        head.y >= gridCounter;

    const hitSelf = snake.some(part =>
        part.x === head.x && part.y === head.y
    );

    const hitEgg = eggs.some(egg =>
        egg.x === head.x && egg.y === head.y
    );

    return hitWall || hitSelf || hitEgg;
}


function layEgg() {
    const tail = snake.at(-1);

    eggs.push({
        x: tail.x,
        y: tail.y
    });
}


function createFood() {
    const freeCells = [];

    for (let x = 0; x < gridCounter; x++) {
        for (let y = 0; y < gridCounter; y++) {

            const onSnake = snake.some(part =>
                part.x === x && part.y === y
            );

            const onEgg = eggs.some(egg =>
                egg.x === x && egg.y === y
            );

            if (!onSnake && !onEgg) {
                freeCells.push({x: x, y: y});
            }
        }
    }

    if (freeCells.length === 0) {
        food = null;
        return false;
    }

    const randomIndex = Math.floor(Math.random() * freeCells.length);
    food = freeCells[randomIndex];

    return true;
}

// 6. KIRAJZOLÁS

function draw() {
    clearCanvas();
    drawSnake();
    drawFood();
    drawEgg();
}


function clearCanvas() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


function drawCell(x, y, color) {
    ctx.fillStyle = color;

    ctx.fillRect(
        x * tileSize,
        y * tileSize,
        tileSize - 1,
        tileSize - 1
    );
}


function drawSnake() {
    snake.forEach((part, index) => {
        const image = index === 0
            ? snakeHeadImage
            : snakeBodyImage;

        let angle = 0;

        if (index === 0) {
            // A fej a haladási irányba néz
            angle = Math.atan2(direction.y, direction.x);
        }

        ctx.save();

        // Forgatás középpontja
        ctx.translate(
            part.x * tileSize + tileSize / 2,
            part.y * tileSize + tileSize / 2
        );

        ctx.rotate(angle);

        // Kép középre igazítása
        if (image.complete && image.naturalWidth > 0) {
            ctx.drawImage(
                image,
                -tileSize / 2,
                -tileSize / 2,
                tileSize - 1,
                tileSize - 1
            );
        } else {
            ctx.fillStyle = 'green';
            ctx.fillRect(
                -tileSize / 2,
                -tileSize / 2,
                tileSize - 1,
                tileSize - 1
            );
        }

        ctx.restore();
    });
}


function drawFood() {
    if (food === null) return;

    if (foodImage.complete && foodImage.naturalWidth > 0) {
        ctx.drawImage(
            foodImage,
            food.x * tileSize,
            food.y * tileSize,
            tileSize - 1,
            tileSize - 1
        );
    } else {
        drawCell(food.x, food.y, 'red');
    }
}


function drawEgg() {
    eggs.forEach(egg => {
        if (eggImage.complete && eggImage.naturalWidth > 0) {
            ctx.drawImage(
                eggImage,
                egg.x * tileSize,
                egg.y * tileSize,
                tileSize - 1,
                tileSize - 1
            );
        } else {
            drawCell(egg.x, egg.y, 'white');
        }
    });
}

// 7. RANGLISTA

function saveScore() {
    const existingPlayer = leaderboard.find(player =>
        player.name === playerName
    );

    if (existingPlayer) {
        if (score > existingPlayer.score) {
            existingPlayer.score = score;
        }
    } else {
        leaderboard.push({
            name: playerName,
            score: score
        });
    }

    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);

    // Ranglista mentése a böngészőbe
    localStorage.setItem(
        'snakeLeaderboard',
        JSON.stringify(leaderboard)
    );

    drawLeaderboard();
}
function drawLeaderboard() {
    leaderboardRows.replaceChildren();

    if (leaderboard.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');

        cell.colSpan = 3;
        cell.textContent = 'Még nincs eredmény.';
        cell.className = 'empty-leaderboard';

        row.appendChild(cell);
        leaderboardRows.appendChild(row);

        return;
    }

    leaderboard.forEach((player, index) => {
        const row = document.createElement('tr');

        const positionCell = document.createElement('td');
        const nameCell = document.createElement('td');
        const scoreCell = document.createElement('td');

        positionCell.textContent = index + 1;
        nameCell.textContent = player.name;
        scoreCell.textContent = player.score;

        row.append(positionCell, nameCell, scoreCell);
        leaderboardRows.appendChild(row);
    });
}

// 8. ESEMÉNYKEZELŐK ÉS INICIALIZÁLÁS

window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();

    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        if (gameInterval !== null) {
            event.preventDefault();
        }
    }

    if (gameInterval === null) return;

    switch (key) {
        case 'arrowup':
        case 'w':
            if (direction.y === 0) {
                nextDirection = {x: 0, y: -1};
            }
            break;

        case 'arrowdown':
        case 's':
            if (direction.y === 0) {
                nextDirection = {x: 0, y: 1};
            }
            break;

        case 'arrowleft':
        case 'a':
            if (direction.x === 0) {
                nextDirection = {x: -1, y: 0};
            }
            break;

        case 'arrowright':
        case 'd':
            if (direction.x === 0) {
                nextDirection = {x: 1, y: 0};
            }
            break;
    }
});

snakeHeadImage.onload = draw;
snakeBodyImage.onload = draw;
eggImage.onload = draw;
foodImage.onload = draw;

startBtn.addEventListener('click', startGame);

createFood();
drawLeaderboard();
draw();
