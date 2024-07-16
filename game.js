document.addEventListener('DOMContentLoaded', () => {
    const bird = document.querySelector('#bird');
    const gameDisplay = document.querySelector('.game');
    const playButton = document.querySelector('#play');
    const resetButton = document.querySelector('#reset');
    const menu = document.querySelector('#menu');
    const recordeDisplay = document.querySelector('#recorde');

    let birdLeft = 50;
    let birdBottom = 100;
    let gravity = 2;
    let isGameOver = false;
    let gap = 430;
    let score = 0;
    let starScore = 0;
    let starPoints = 10;
    let passedPipes = 0;
    let gameLoop;

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
        clearInterval(gameLoop);
        gameLoop = setInterval(game, 20);
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

    function game() {
        birdBottom -= gravity;
        bird.style.bottom = birdBottom + 'px';
        bird.style.left = birdLeft + 'px';

        if (birdBottom < 0) {
            gameOver();
        }
    }

    function jump() {
        if (birdBottom < 500) birdBottom += 50;
    }

    document.addEventListener('keyup', control);

    function control(e) {
        if (e.keyCode === 32) {
            jump();
        }
    }

    function generatePipes() {
        const pipe = document.createElement('div');
        const topPipe = document.createElement('img');
        const bottomPipe = document.createElement('img');
        const star = document.createElement('div');

        if (!isGameOver) {
            pipe.classList.add('pipe');
            topPipe.src = 'img/toppipe.png';
            topPipe.classList.add('top-pipe');
            bottomPipe.src = 'img/bottompipe.png';
            bottomPipe.classList.add('bottom-pipe');
            star.classList.add('star');

            pipe.appendChild(topPipe);
            pipe.appendChild(bottomPipe);
            gameDisplay.appendChild(pipe);
            gameDisplay.appendChild(star);

            let pipeLeft = 360;
            let randomHeight = Math.random() * 60;
            let pipeBottom = randomHeight;

            pipe.style.left = pipeLeft + 'px';
            pipe.style.bottom = pipeBottom + 'px';

            function movePipes() {
                pipeLeft -= 2;
                pipe.style.left = pipeLeft + 'px';
                star.style.left = pipeLeft + 20 + 'px';
                star.style.bottom = pipeBottom + gap / 2 + 'px';

                if (pipeLeft === -60) {
                    clearInterval(timerId);
                    gameDisplay.removeChild(pipe);
                    gameDisplay.removeChild(star);
                    passedPipes++;
                    updateScore();
                }

                if (
                    pipeLeft > 200 && pipeLeft < 280 && birdLeft === 220 &&
                    (birdBottom < pipeBottom + 150 || birdBottom > pipeBottom + gap - 200) ||
                    birdBottom === 0
                ) {
                    gameOver();
                    clearInterval(timerId);
                }

                if (pipeLeft === 220 && birdBottom > pipeBottom + gap / 2 - 15 && birdBottom < pipeBottom + gap / 2 + 15) {
                    score += starPoints;
                    starPoints += 10;
                    starScore++;
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
        const recorde = localStorage.getItem('recorde') || 0;
        if (score > recorde) {
            localStorage.setItem('recorde', score);
        }
        menu.style.display = 'block';
        updateRecorde();
    }

    updateRecorde();
});