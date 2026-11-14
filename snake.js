const canvas = document.getElementById('gameCanvas');
const scoreElement = document.getElementById('score');
const speedElement = document.getElementById('speed');
const startBtn = document.getElementById('startBtn');

const snakeHeadImage = new Image();
snakeHeadImage.src = './snek.png';

const snakeBodyImage = new Image();
snakeBodyImage.src = './snek2.png';

snakeHeadImage.onload = () => {
    draw();
};
snakeBodyImage.onload = () => {
    draw();
};

let isGameOver = false;

const ctx = canvas.getContext('2d');
const tileSize = 20;
let score = 0;


const gridCounter = canvas.width / tileSize;

let food = {x: 15, y: 10};

let snake = [
    {x: 10, y: 10},
    {x: 9, y: 10},
    {x: 8, y: 10}
]

let direction = {x: 1, y: 0}
let nextDirection = {x: 1, y: 0};
let gameInterval = null;
const initialGameSpeed = 120;
const speedIncrease = 3;
const minGameSpeed = 40;

let gameSpeed = initialGameSpeed;

function checkCollision(head) {
    const hitWall = head.x < 0 || head.x >= gridCounter || head.y < 0 || head.y >= gridCounter;
    const hitSelf = snake.some(part => part.x === head.x && part.y === head.y);

    return hitWall || hitSelf;
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    gameInterval = null;
    startBtn.disabled = false;
    startBtn.textContent = "RESTART GAME";

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("GAME OVER", canvas.width/2,canvas.height/2);

    ctx.fillStyle= 'white';
    ctx.font = '25px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Final score: ${score}`,canvas.width/2,canvas.height/2 + 30);

}

function gameLoop() {
    if (isGameOver) return;
    update();
    if (isGameOver) return;
    draw();
}

function update() {

    direction = nextDirection;

    const currentHead = snake[0];
    const newHead = {
        x: currentHead.x + direction.x,
        y: currentHead.y + direction.y
    };

    if(checkCollision(newHead)){
        gameOver();
        return;
    }

    snake.unshift(newHead);
    if (newHead.x === food.x && newHead.y === food.y) {
        score+=10;
        scoreElement.textContent = `${score}`;
        createFood();

        gameSpeed = Math.max(minGameSpeed, gameSpeed - speedIncrease);
        speedElement.textContent = gameSpeed;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);


    } else {
        snake.pop();
    }


}

function draw() {
    clearCanvas();
    drawSnake();
    drawFood();
}

function startGame() {
    if (gameInterval) clearInterval(gameInterval);

    isGameOver = false;
    score = 0;
    gameSpeed = initialGameSpeed;

    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];

    direction = {x: 1, y: 0};
    nextDirection = {x: 1, y: 0};

    food = {x: 15, y: 10};

    scoreElement.textContent = score;
    speedElement.textContent = gameSpeed;

    startBtn.disabled = true;
    startBtn.textContent = "GAME RUNNING";

    draw();

    gameInterval = setInterval(gameLoop, gameSpeed);
}


function clearCanvas() {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1)
}

function drawSnake() {
    snake.forEach((part, index) => {
        if (index === 0) {
            ctx.drawImage(
                snakeHeadImage,
                part.x * tileSize,
                part.y * tileSize,
                tileSize - 1,
                tileSize - 1
            );
        } else {
            ctx.drawImage(
                snakeBodyImage,
                part.x * tileSize,
                part.y * tileSize,
                tileSize - 1,
                tileSize - 1
            );
        }
    })
}

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            if (direction.y === 0) {
                nextDirection = {x: 0, y: -1}
            }
            break;
        case 'ArrowDown':
        case 's':
            if (direction.y === 0) {
                nextDirection = {x: 0, y: 1}
            }
            break;
        case 'ArrowLeft':
        case 'a':
            if (direction.x === 0) {
                nextDirection = {x: -1, y: 0}
            }
            break;
        case 'ArrowRight':
        case 'd':
            if (direction.x === 0) {
                nextDirection = {x: 1, y: 0}
            }
            break;
    }
})

function drawFood() {
    drawCell(food.x, food.y, 'red')
}

function createFood() {
    let validPosition = false;

    while (!validPosition) {
        const randomX = Math.floor(Math.random() * gridCounter);
        const randomY = Math.floor(Math.random() * gridCounter);
        const onSnake = snake.some(part => part.x === randomX && part.y === randomY);

        if (!onSnake) {
            food = {x: randomX, y: randomY};
            validPosition = true;
        }
    }

}

startBtn.addEventListener('click', startGame);
