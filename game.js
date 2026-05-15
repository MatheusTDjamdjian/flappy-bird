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
  let isGameOver = true;
  let gap = 180;
  let score = 0;
  let starScore = 0;
  let starValue = 10;
  let consecutiveStars = 0;
  let passedPipes = 0;
  let gameLoop;
  let pipeGenerateTimeout;
  let pipes = [];
  let stars = [];
  let pipeSpeed = 20;

  let gravity = 0.5;
  const initialJumpVelocity = 7;
  const gameHeight = 640;
  const pipeImgHeight = 392;

  playButton.addEventListener('click', startGame);
  resetButton.addEventListener('click', resetRecorde);

  function startGame() {
    bird.style.display = 'block';
    birdBottom = 300;
    birdLeft = 50;
    jumpVelocity = 0;
    gravity = 0.5;
    isGameOver = false;
    score = 0;
    starScore = 0;
    starValue = 10;
    consecutiveStars = 0;
    passedPipes = 0;
    pipeSpeed = 20;
    menu.style.display = 'none';
    scoreDisplay.style.display = 'block';
    clearInterval(gameLoop);
    clearTimeout(pipeGenerateTimeout);
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
    if (isGameOver) return;
    bird.style.bottom = birdBottom + 'px';
    bird.style.left = birdLeft + 'px';

    if (birdBottom < 0) {
      gameOver();
      return;
    }

    updateScoreDisplay();
    checkCollision();
  }

  function checkCollision() {
    const birdRect = bird.getBoundingClientRect();

    pipes.forEach(pipe => {
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
        gameOver();
      }

      if (
        birdRect.left < bottomPipeRect.right &&
        birdRect.right > bottomPipeRect.left &&
        birdRect.top < bottomPipeRect.bottom &&
        birdRect.bottom > bottomPipeRect.top
      ) {
        gameOver();
      }

      const pipeLeft = parseInt(pipe.style.left);
      if (pipeLeft + 40 < birdLeft && !pipe.passed) {
        score++;
        passedPipes++;
        pipe.passed = true;
        updateScore();
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
        consecutiveStars++;
        score += starValue;
        starValue += 10;
        starScore++;
        clearInterval(star.timerId);
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
  }

  function startJump() {
    jumpVelocity = initialJumpVelocity;
  }

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat) {
      startJump();
    }
  });

  setInterval(jump, 20);

  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function generatePipes() {
    if (isGameOver) return;

    const pipe = document.createElement('div');
    const topPipe = document.createElement('img');
    const bottomPipe = document.createElement('img');

    pipe.classList.add('pipe');
    topPipe.src = 'img/toppipe.png';
    topPipe.classList.add('top-pipe');
    bottomPipe.src = 'img/bottompipe.png';
    bottomPipe.classList.add('bottom-pipe');

    pipe.appendChild(topPipe);
    pipe.appendChild(bottomPipe);
    gameDisplay.appendChild(pipe);

    let pipeLeft = 360;
    const gapTop = randomIntFromInterval(100, gameHeight - gap - 100);
    let pipeTop = pipeImgHeight - gapTop;
    let pipeBottom = gapTop + gap - (gameHeight - pipeImgHeight);

    pipe.style.left = pipeLeft + 'px';
    topPipe.style.top = (pipeTop * -1) + 'px';
    bottomPipe.style.bottom = (pipeBottom * -1) + 'px';

    pipe.passed = false;

    if (Math.random() < 0.25) {
        const star = document.createElement('img');
        star.src = 'img/star.png';
        star.classList.add('star');

        const starBottom = gameHeight - gapTop - (gap / 2) - 10;
        star.style.left = pipeLeft + 'px';
        star.style.bottom = starBottom + 'px';

        gameDisplay.appendChild(star);
        stars.push(star);

        function moveStar() {
            star.style.left = (parseInt(star.style.left) - 2) + 'px';
            if (parseInt(star.style.left) < -20) {
                clearInterval(star.timerId);
                if (gameDisplay.contains(star)) {
                    gameDisplay.removeChild(star);
                }
                stars = stars.filter(s => s !== star);
                consecutiveStars = 0;
                starValue = 10;
            }
        }
        star.moveStar = moveStar;
        star.timerId = setInterval(moveStar, pipeSpeed);
    }

    pipes.push(pipe);

    function movePipes() {
        pipeLeft -= 2;
        pipe.style.left = pipeLeft + 'px';

        if (pipeLeft <= -60) {
            clearInterval(pipe.timerId);
            if (gameDisplay.contains(pipe)) {
                gameDisplay.removeChild(pipe);
            }
            pipes = pipes.filter(p => p !== pipe);
        }
    }

    pipe.movePipes = movePipes;
    pipe.timerId = setInterval(movePipes, pipeSpeed);
    if (!isGameOver) pipeGenerateTimeout = setTimeout(generatePipes, 3000);
}

function updateScore() {
  if (score % 10 === 0) {
      pipeSpeed = pipeSpeed * 0.9;
      gravity *= 1.05;

      pipes.forEach(pipe => {
          clearInterval(pipe.timerId);
          pipe.timerId = setInterval(pipe.movePipes, pipeSpeed);
      });

      stars.forEach(star => {
          clearInterval(star.timerId);
          star.timerId = setInterval(star.moveStar, pipeSpeed);
      });
  }
  updateRecorde();
}

  function gameOver() {
    if (isGameOver) return;
    isGameOver = true;
    clearInterval(gameLoop);
    clearTimeout(pipeGenerateTimeout);
    bird.style.display = 'none';
    scoreDisplay.style.display = 'none';
    const recorde = localStorage.getItem('recorde') || 0;
    if (score > recorde) {
      localStorage.setItem('recorde', score);
    }
    menu.style.display = 'block';
    updateRecorde();

    pipes.forEach(pipe => {
      clearInterval(pipe.timerId);
      if (gameDisplay.contains(pipe)) {
        gameDisplay.removeChild(pipe);
      }
    });
    pipes = [];

    stars.forEach(star => {
      clearInterval(star.timerId);
      if (gameDisplay.contains(star)) {
        gameDisplay.removeChild(star);
      }
    });
    stars = [];

    consecutiveStars = 0;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      gameOver();
    }
  });

  updateRecorde();
});
