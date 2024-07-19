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
    let pipeSpeed = 20;

    let gravity = 0.5;
    const initialJumpVelocity = 7;

    playButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetRecorde);

    function startGame() {
        bird.style.display = 'block';
        birdBottom = 300;
        birdLeft = 50;
        isGameOver = false;
        score = 0;
        starScore = 0;
        starPoints = 10;
        passedPipes = 0;
        pipeSpeed = 20;
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
        recordeDisplay.classList.add('record-style');
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
        checkCollision();
    }

    function checkCollision() {
        const birdRect = bird.getBoundingClientRect();

        pipes.forEach(pipe => {
            const pipeRect = pipe.getBoundingClientRect();
            const topPipe = pipe.querySelector('.top-pipe');
            const bottomPipe = pipe.querySelector('.bottom-pipe');
            const topPipeRect = topPipe.getBoundingClientRect();
            const bottomPipeRect = bottomPipe.getBoundingClientRect();

            if (
                birdRect.left < topPipeRect.right &&
                birdRect.right > topPipeRect.left &&
                birdRect.top < topPipeRect.bottom &&
                birdRect.bottom > topPipeRect.top
            ) {
                console.log("Colisão");
                gameOver();
            }

            if (
                birdRect.left < bottomPipeRect.right &&
                birdRect.right > bottomPipeRect.left &&
                birdRect.top < bottomPipeRect.bottom &&
                birdRect.bottom > bottomPipeRect.top
            ) {
                console.log("Colisão");
                gameOver();
            }
        });

        stars.forEach(star => {
            const starRect = star.getBoundingClientRect();
            if (
                birdRect.left < starRect.right &&
                birdRect.right > starRect.left &&
                birdRect.top < starRect.bottom &&
                birdRect.bottom > starRect.top
            ) {
                score += starPoints;
                starPoints += 10;
                starScore++;
                if (gameDisplay.contains(star)) {
                    gameDisplay.removeChild(star);
                }
                stars = stars.filter(s => s !== star); 
            }
        });
    }

    function jump() {
        if (isGameOver) return;
        birdBottom += jumpVelocity;
        jumpVelocity -= gravity;

        if (birdBottom < 0) {
            birdBottom = 0;
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
        if (!isGameOver) {
            console.log(birdBottom);
        }
    }, 20);

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
            let pipeBottom = randomIntFromInterval(100, 180); 
            let pipeTop = randomIntFromInterval(100, 180); 

            pipe.style.left = pipeLeft + 'px';
            topPipe.style.top = (pipeTop * -1) + 'px';
            bottomPipe.style.bottom = (pipeBottom * -1) + 'px';

            if (Math.random() < 0.3) {
                const star = document.createElement('img');
                star.src = 'img/star.png';
                star.classList.add('star');

                const starLeft = pipeLeft + 20;
                const starBottom = pipeBottom + (gap / 2);
                const starTop = pipeBottom + (gap / 2) + 20;

                star.style.left = starLeft + 'px';
                star.style.bottom = starBottom + 'px';

                if (starBottom < pipeTop && starTop > pipeBottom) {
                    gameDisplay.appendChild(star);
                stars.push(star);
                stars.push(star);

                function moveStar() {
                    star.style.left = pipeLeft + 20 + 'px';
                    if (
                        pipeLeft === 220 && birdBottom > pipeBottom + gap / 2 - 15 && birdBottom < pipeBottom + gap / 2 + 15
                    ) {
                        score += starPoints;
                        starPoints += 10;
                        starScore++;
                        if (gameDisplay.contains(star)) {
                            gameDisplay.removeChild(star);
                    stars.push(star);

                function moveStar() {
                    star.style.left = pipeLeft + 20 + 'px';
                    if (
                        pipeLeft === 220 && birdBottom > pipeBottom + gap / 2 - 15 && birdBottom < pipeBottom + gap / 2 + 15
                    ) {
                        score += starPoints;
                        starPoints += 10;
                        starScore++;
                        if (gameDisplay.contains(star)) {
                            gameDisplay.removeChild(star);
                        }
                        }
                        stars = stars.filter(s => s !== star); 
                    }
                }
                setInterval(moveStar, 20);
                }
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
                    if (gameDisplay.contains(pipe)) {
                        gameDisplay.removeChild(pipe);
                    }
                    passedPipes++;
                    updateScore();
                    pipes = pipes.filter(p => p !== pipe); 
                }
            }

            let timerId = setInterval(movePipes, pipeSpeed);
            if (!isGameOver) setTimeout(generatePipes, 3000);
        }
    }

    function updateScore() {
        score++;
        if (score % 10 === 0) {
            pipeSpeed = pipeSpeed * 0.9;
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

        pipes.forEach(pipe => {
            if (gameDisplay.contains(pipe)) {
                gameDisplay.removeChild(pipe);
            }
        });
        pipes = [];

        stars.forEach(star => {
            if (gameDisplay.contains(star)) {
                gameDisplay.removeChild(star);
            }
        });
        stars = [];

        starPoints = 10;
    }

    updateRecorde();
});