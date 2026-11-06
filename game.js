(() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // Configuração (todas as medidas em pixels do jogo; tempos em segundos)
  // ---------------------------------------------------------------------------
  const W = 360;
  const H = 640;

  const BIRD_X = 70;
  const BIRD_W = 34;
  const BIRD_H = 24;
  const BIRD_HITBOX_INSET = 3;   // hitbox um pouco menor que o sprite (mais justo)

  const GRAVITY = 1400;          // px/s²
  const FLAP_VELOCITY = -400;    // px/s (negativo = para cima)
  const MAX_FALL_SPEED = 650;    // px/s

  const PIPE_W = 52;
  const PIPE_H = 416;            // mantém a proporção 1:8 da imagem (384x3072)
  const PIPE_BODY_INSET = 3;     // o corpo do cano é mais estreito que a borda
  const PIPE_RIM_H = 26;         // altura da borda (boca) do cano
  const PIPE_SPACING = 210;      // distância horizontal entre canos
  const EDGE_MARGIN = 60;        // distância mínima do gap até o topo/chão
  const MAX_GAP_SHIFT = 220;     // variação vertical máxima entre gaps seguidos

  const BASE_SPEED = 140;        // px/s
  const MAX_SPEED = 230;
  const SPEED_STEP = 1.08;       // +8% por nível
  const BASE_GAP = 165;
  const MIN_GAP = 130;
  const GAP_STEP = 5;            // gap diminui 5px por nível
  const PIPES_PER_LEVEL = 10;

  const STAR_CHANCE = 0.25;
  const STAR_SIZE = 22;
  const STAR_BASE_VALUE = 10;
  const STAR_MAX_VALUE = 50;      // limite do combo de estrelas

  const MAX_DT = 1 / 30;         // evita "teleporte" após travadas
  const RESTART_DELAY = 600;     // ms antes de aceitar input após o game over

  const RECORD_KEY = 'recorde';

  // ---------------------------------------------------------------------------
  // DOM
  // ---------------------------------------------------------------------------
  const $ = (sel) => document.querySelector(sel);
  const gameEl = $('#game');
  const worldEl = $('#world');
  const birdEl = $('#bird');
  const scoreEl = $('#score');
  const hintEl = $('#hint');
  const pauseEl = $('#pause');
  const menuEl = $('#menu');
  const resultEl = $('#result');
  const finalScoreEl = $('#final-score');
  const newRecordEl = $('#new-record');
  const recordEl = $('#recorde');
  const playButton = $('#play');
  const resetButton = $('#reset');

  // ---------------------------------------------------------------------------
  // Estado
  // ---------------------------------------------------------------------------
  // 'menu' | 'ready' | 'playing' | 'paused'
  let state = 'menu';
  let birdY = 0;
  let birdVY = 0;
  let score = 0;
  let pipesPassed = 0;
  let starValue = STAR_BASE_VALUE;
  let pipes = [];
  let stars = [];
  let lastGapTop = null;
  let distanceToNextPipe = 0;
  let readyTime = 0;
  let lastFrame = 0;
  let inputBlockedUntil = 0;

  // ---------------------------------------------------------------------------
  // Recorde (localStorage pode falhar em modo privado / file://)
  // ---------------------------------------------------------------------------
  function getRecord() {
    try {
      return parseInt(localStorage.getItem(RECORD_KEY), 10) || 0;
    } catch {
      return 0;
    }
  }

  function setRecord(value) {
    try {
      localStorage.setItem(RECORD_KEY, String(value));
    } catch {
      /* sem persistência disponível */
    }
  }

  function updateRecordDisplay() {
    recordEl.textContent = `Recorde: ${getRecord()}`;
  }

  // ---------------------------------------------------------------------------
  // Dificuldade
  // ---------------------------------------------------------------------------
  function level() {
    return Math.floor(pipesPassed / PIPES_PER_LEVEL);
  }

  function currentSpeed() {
    return Math.min(MAX_SPEED, BASE_SPEED * Math.pow(SPEED_STEP, level()));
  }

  function currentGap() {
    return Math.max(MIN_GAP, BASE_GAP - GAP_STEP * level());
  }

  // ---------------------------------------------------------------------------
  // Fluxo do jogo
  // ---------------------------------------------------------------------------
  function clearWorld() {
    pipes.forEach((p) => p.el.remove());
    stars.forEach((s) => s.el.remove());
    worldEl.querySelectorAll('.popup').forEach((el) => el.remove());
    pipes = [];
    stars = [];
  }

  function prepareRun() {
    clearWorld();
    birdY = H / 2 - BIRD_H / 2;
    birdVY = 0;
    score = 0;
    pipesPassed = 0;
    starValue = STAR_BASE_VALUE;
    lastGapTop = null;
    distanceToNextPipe = 0;
    readyTime = 0;

    state = 'ready';
    menuEl.hidden = true;
    pauseEl.hidden = true;
    hintEl.hidden = false;
    scoreEl.hidden = false;
    birdEl.style.display = 'block';
    updateScoreDisplay();
    renderBird();
  }

  function flap() {
    if (performance.now() < inputBlockedUntil) return;

    switch (state) {
      case 'menu':
        prepareRun();
        break;
      case 'ready':
        state = 'playing';
        hintEl.hidden = true;
        birdVY = FLAP_VELOCITY;
        break;
      case 'playing':
        birdVY = FLAP_VELOCITY;
        break;
      case 'paused':
        resume();
        break;
    }
  }

  function pause() {
    if (state !== 'playing') return;
    state = 'paused';
    pauseEl.hidden = false;
  }

  function resume() {
    if (state !== 'paused') return;
    state = 'playing';
    pauseEl.hidden = true;
    lastFrame = performance.now();
    // Um pequeno impulso evita cair direto num cano ao voltar.
    birdVY = Math.min(birdVY, 0);
  }

  function gameOver() {
    if (state !== 'playing') return;
    state = 'menu';

    const previousRecord = getRecord();
    const isNewRecord = score > previousRecord;
    if (isNewRecord) setRecord(score);

    finalScoreEl.textContent = score;
    newRecordEl.hidden = !isNewRecord;
    resultEl.hidden = false;
    updateRecordDisplay();

    scoreEl.hidden = true;
    hintEl.hidden = true;
    menuEl.hidden = false;
    gameEl.classList.remove('shake');
    void gameEl.offsetWidth; // reinicia a animação
    gameEl.classList.add('shake');

    inputBlockedUntil = performance.now() + RESTART_DELAY;
  }

  function resetRecord() {
    setRecord(0);
    newRecordEl.hidden = true;
    updateRecordDisplay();
  }

  // ---------------------------------------------------------------------------
  // Obstáculos
  // ---------------------------------------------------------------------------
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function spawnPipe(x) {
    const gap = currentGap();

    // O gap precisa ficar longe das bordas e os dois canos (de altura PIPE_H)
    // precisam cobrir toda a tela acima e abaixo dele.
    let minTop = Math.max(EDGE_MARGIN, H - PIPE_H - gap);
    let maxTop = Math.min(PIPE_H, H - EDGE_MARGIN - gap);
    if (lastGapTop !== null) {
      minTop = Math.max(minTop, lastGapTop - MAX_GAP_SHIFT);
      maxTop = Math.min(maxTop, lastGapTop + MAX_GAP_SHIFT);
    }
    const gapTop = randomInt(minTop, maxTop);
    lastGapTop = gapTop;

    const el = document.createElement('div');
    el.className = 'pipe';

    const top = document.createElement('img');
    top.src = 'img/toppipe.png';
    top.alt = '';
    top.draggable = false;
    top.style.top = `${gapTop - PIPE_H}px`;

    const bottom = document.createElement('img');
    bottom.src = 'img/bottompipe.png';
    bottom.alt = '';
    bottom.draggable = false;
    bottom.style.top = `${gapTop + gap}px`;

    el.append(top, bottom);
    worldEl.appendChild(el);

    const pipe = { el, x, gapTop, gap, passed: false };
    pipes.push(pipe);
    renderX(el, x);

    if (Math.random() < STAR_CHANCE) {
      spawnStar(x + PIPE_W / 2 - STAR_SIZE / 2, gapTop + gap / 2 - STAR_SIZE / 2);
    }
  }

  function spawnStar(x, y) {
    const el = document.createElement('img');
    el.src = 'img/star.png';
    el.alt = '';
    el.draggable = false;
    el.className = 'star';
    worldEl.appendChild(el);

    const star = { el, x, y, missed: false, collected: false };
    stars.push(star);
    renderStar(star);
  }

  function showPopup(text, x, y) {
    const el = document.createElement('div');
    el.className = 'popup';
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    worldEl.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  // ---------------------------------------------------------------------------
  // Colisão (AABB em coordenadas do jogo — independe da escala da tela)
  // ---------------------------------------------------------------------------
  function overlaps(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  function birdHitbox() {
    return {
      left: BIRD_X + BIRD_HITBOX_INSET,
      right: BIRD_X + BIRD_W - BIRD_HITBOX_INSET,
      top: birdY + BIRD_HITBOX_INSET,
      bottom: birdY + BIRD_H - BIRD_HITBOX_INSET,
    };
  }

  function pipeHitboxes(pipe) {
    const left = pipe.x;
    const right = pipe.x + PIPE_W;
    const bodyLeft = left + PIPE_BODY_INSET;
    const bodyRight = right - PIPE_BODY_INSET;
    const gapBottom = pipe.gapTop + pipe.gap;
    return [
      // cano de cima: corpo + borda
      { left: bodyLeft, right: bodyRight, top: -Infinity, bottom: pipe.gapTop - PIPE_RIM_H },
      { left, right, top: pipe.gapTop - PIPE_RIM_H, bottom: pipe.gapTop },
      // cano de baixo: borda + corpo
      { left, right, top: gapBottom, bottom: gapBottom + PIPE_RIM_H },
      { left: bodyLeft, right: bodyRight, top: gapBottom + PIPE_RIM_H, bottom: Infinity },
    ];
  }

  // ---------------------------------------------------------------------------
  // Loop principal
  // ---------------------------------------------------------------------------
  function update(dt) {
    if (state === 'ready') {
      // pássaro flutuando enquanto espera o primeiro toque
      readyTime += dt;
      birdY = H / 2 - BIRD_H / 2 + Math.sin(readyTime * 6) * 6;
      return;
    }
    if (state !== 'playing') return;

    // --- física do pássaro
    birdVY = Math.min(birdVY + GRAVITY * dt, MAX_FALL_SPEED);
    birdY += birdVY * dt;

    // teto: não morre, mas não pode voar por cima dos canos
    if (birdY < 0) {
      birdY = 0;
      birdVY = 0;
    }

    // chão
    if (birdY + BIRD_H >= H) {
      birdY = H - BIRD_H;
      gameOver();
      return;
    }

    // --- movimento do mundo
    const dx = currentSpeed() * dt;

    distanceToNextPipe -= dx;
    if (distanceToNextPipe <= 0) {
      spawnPipe(W + distanceToNextPipe);
      distanceToNextPipe += PIPE_SPACING;
    }

    const bird = birdHitbox();

    for (const pipe of pipes) {
      pipe.x -= dx;

      if (pipeHitboxes(pipe).some((box) => overlaps(bird, box))) {
        gameOver();
        return;
      }

      if (!pipe.passed && pipe.x + PIPE_W / 2 < BIRD_X) {
        pipe.passed = true;
        pipesPassed++;
        score++;
        updateScoreDisplay();
      }
    }

    for (const star of stars) {
      star.x -= dx;
      const box = { left: star.x, right: star.x + STAR_SIZE, top: star.y, bottom: star.y + STAR_SIZE };

      if (overlaps(bird, box)) {
        score += starValue;
        showPopup(`+${starValue}`, star.x, star.y);
        starValue = Math.min(starValue + STAR_BASE_VALUE, STAR_MAX_VALUE);
        star.collected = true;
        star.el.remove();
        updateScoreDisplay();
      } else if (!star.missed && box.right < bird.left) {
        // estrela ficou para trás: o combo volta ao valor inicial
        star.missed = true;
        starValue = STAR_BASE_VALUE;
      }
    }

    // remove o que saiu da tela
    pipes = pipes.filter((p) => {
      if (p.x + PIPE_W >= 0) return true;
      p.el.remove();
      return false;
    });
    stars = stars.filter((s) => {
      if (!s.collected && s.x + STAR_SIZE >= 0) return true;
      s.el.remove();
      return false;
    });
  }

  function renderX(el, x, y = 0) {
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  // A estrela usa left/top (e não transform) para que a animação de giro
  // (propriedade `rotate`) aconteça em torno do próprio centro.
  function renderStar(star) {
    star.el.style.left = `${star.x}px`;
    star.el.style.top = `${star.y}px`;
  }

  function renderBird() {
    let angle = 0;
    if (state === 'playing') {
      // inclina para cima ao subir e mergulha ao cair
      angle = Math.max(-25, Math.min(90, (birdVY / MAX_FALL_SPEED) * 90));
    }
    birdEl.style.transform = `translate3d(${BIRD_X}px, ${birdY}px, 0) rotate(${angle}deg)`;
  }

  function render() {
    renderBird();
    for (const pipe of pipes) renderX(pipe.el, pipe.x);
    for (const star of stars) renderStar(star);
  }

  function updateScoreDisplay() {
    scoreEl.textContent = score;
  }

  function frame(now) {
    const dt = Math.min((now - lastFrame) / 1000, MAX_DT);
    lastFrame = now;
    update(dt);
    if (state !== 'menu') render();
    requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------------------
  // Escala: o jogo tem 360x640 e é ampliado/reduzido para caber na janela
  // ---------------------------------------------------------------------------
  function fitToScreen() {
    const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    gameEl.style.setProperty('--scale', String(scale));
  }

  // ---------------------------------------------------------------------------
  // Entrada
  // ---------------------------------------------------------------------------
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault(); // evita rolar a página / "clicar" no botão focado
      if (!e.repeat) flap();
    } else if (e.code === 'KeyP' || e.code === 'Escape') {
      if (state === 'playing') pause();
      else if (state === 'paused') resume();
    }
  });

  gameEl.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    if (state === 'menu') return; // no menu, só os botões iniciam
    e.preventDefault();
    flap();
  });

  playButton.addEventListener('click', () => {
    playButton.blur();
    if (performance.now() < inputBlockedUntil) return;
    prepareRun();
  });

  resetButton.addEventListener('click', () => {
    resetButton.blur();
    resetRecord();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
  });
  window.addEventListener('blur', pause);
  window.addEventListener('resize', fitToScreen);

  // ---------------------------------------------------------------------------
  // Início
  // ---------------------------------------------------------------------------
  fitToScreen();
  updateRecordDisplay();
  lastFrame = performance.now();
  requestAnimationFrame(frame);
})();
