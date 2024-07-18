document.addEventListener('DOMContentLoaded', () => {
    const bird = document.querySelector('#bird');
    const gameDisplay = document.querySelector('.game');
    const playButton = document.querySelector('#play');
    const resetButton = document.querySelector('#reset');
    const menu = document.querySelector('#menu');
    const recordeDisplay = document.querySelector('#recorde');
    const scoreDisplay = document.createElement('div');
    scoreDisplay.classList.add('score');
    gameDisplay.appendChild(scoreDisplay);

    let birdLeft = 50;
    let birdBottom = 0;
    let jumpVelocity = 0;
    let isGameOver = false;
    let gap = 250;
    let score = 0;
    let starScore = 0;
    let starPoints = 10;
    let passedPipes = 0;
    let gameLoop;
    let pipes = [];
    let stars = [];
    
    const gravity = 0.5;
    const initialJumpVelocity = 7;

    playButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetRecorde);

    function startGame() {
        bird.style.display = 'block';
        birdBottom = 100;
        birdLeft = 50;
        isGameOver = false;
        score = 0;
        starScore = 0;
        starPoints = 10;
        passedPipes = 0;
        menu.style.display = 'none';
        scoreDisplay.style.display = 'block';
        clearInterval(gameLoop);
        gameLoop = setInterval(game, 8);
        generatePipes();
    }

    function resetRecorde() {
        localStorage.setItem('recorde', 0);
        updateRecorde();
    }

    function updateRecorde() {
        const recorde = localStorage.getItem('recorde') || 0;
        recordeDisplay.textContent = `Recorde: ${recorde}`;
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = `Pontuação: ${score}`;
    }

    function game() {
        birdBottom -= gravity;
        bird.style.bottom = birdBottom + 'px';
        bird.style.left = birdLeft + 'px';

        if (birdBottom < 0) {
            gameOver();
        }

        updateScoreDisplay();
    }
    
    function jump() {
        birdBottom += jumpVelocity;
        jumpVelocity -= gravity;
    
        if (birdBottom < 0) {
            birdBottom = 0;
            jumpVelocity = 0;
        }
    
        if (birdBottom > jumpHeight) {
            birdBottom = jumpHeight;
            jumpVelocity = 0;
        }
    }
    
    function startJump() {
        jumpVelocity = initialJumpVelocity;
    }
    
    document.addEventListener('keyup', (e) => {
        if (e.keyCode === 32) {
            startJump();
        }
    });
    
    setInterval(() => {
        jump();
        console.log(birdBottom);
    }, 20);

    document.addEventListener('keyup', control);

    function control(e) {
        if (e.keyCode === 32) {
            jump();
        }
    }

    function randomIntFromInterval(min, max) { 
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function generatePipes() {
        const pipe = document.createElement('div');
        const topPipe = document.createElement('img');
        const bottomPipe = document.createElement('img');

        if (!isGameOver) {
            pipe.classList.add('pipe');
            topPipe.src = 'img/toppipe.png';
            topPipe.classList.add('top-pipe');
            bottomPipe.src = 'img/bottompipe.png';
            bottomPipe.classList.add('bottom-pipe');

            pipe.appendChild(topPipe);
            pipe.appendChild(bottomPipe);
            gameDisplay.appendChild(pipe);

            let pipeLeft = 360;
            let randomHeight = randomIntFromInterval(100, 180); 
            let randomHeightTop = randomIntFromInterval(100, 180); 
            let pipeBottom = randomHeight;
            let pipeTop = randomHeightTop;

            pipe.style.left = pipeLeft + 'px';
            topPipe.style.top = (pipeTop * -1) + 'px';
            bottomPipe.style.bottom = (pipeBottom * - 1) + 'px';

            console.log(pipeBottom);

            if (Math.random() < 0.3) {
                const star = document.createElement('img');
                star.src = 'img/star.png';
                star.classList.add('star');
                star.style.left = pipeLeft + 20 + 'px';
                star.style.bottom = pipeBottom + gap / 2 + 'px';
                gameDisplay.appendChild(star);

                stars.push(star);

                function moveStar() {
                    star.style.left = pipeLeft + 20 + 'px';
                    if (
                        pipeLeft === 220 && birdBottom > pipeBottom + gap / 2 - 15 && birdBottom < pipeBottom + gap / 2 + 15
                    ) {
                        score += starPoints;
                        starPoints += 10;
                        starScore++;
                        gameDisplay.removeChild(star);
                        stars = stars.filter(s => s !== star); 
                    }
                }
                setInterval(moveStar, 20);
            }

            pipes.push(pipe); 

            function movePipes() {
                pipeLeft -= 2;
                pipe.style.left = pipeLeft + 'px';

                if (pipeLeft === -60) {
                    clearInterval(timerId);
                    gameDisplay.removeChild(pipe);
                    passedPipes++;
                    updateScore();
                    pipes = pipes.filter(p => p !== pipe); 
                }
            }

            let timerId = setInterval(movePipes, 20);
            if (!isGameOver) setTimeout(generatePipes, 3000);
        }
    }

    function updateScore() {
        score++;
        if (score % 15 === 0) {
            gravity *= 1.1;
        }
        updateRecorde();
    }

    function gameOver() {
        clearInterval(gameLoop);
        isGameOver = true;
        bird.style.display = 'none';
        scoreDisplay.style.display = 'none';
        const recorde = localStorage.getItem('recorde') || 0;
        if (score > recorde) {
            localStorage.setItem('recorde', score);
        }
        menu.style.display = 'block';
        updateRecorde();

        pipes.forEach(pipe => gameDisplay.removeChild(pipe));
        pipes = [];

        stars.forEach(star => gameDisplay.removeChild(star));
        stars = [];
    }

    updateRecorde();
});
