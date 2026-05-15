# Flappy Bird

Clone do Flappy Bird feito em HTML, CSS e JavaScript puro — sem dependências, sem build.

## Como jogar

Abra `index.html` em qualquer navegador moderno, clique em **Jogar** e use a barra de espaço para fazer o pássaro pular. Passe entre os canos para pontuar e colete estrelas para ganhar bônus.

## Controles

| Tecla | Ação |
|-------|------|
| `Espaço` | Pular |

## Mecânicas

- **Pontuação:** +1 por cano atravessado.
- **Estrelas:** 25% de chance de aparecer no centro do gap entre os canos. Valem `10` pontos na primeira coleta e somam +10 a cada estrela consecutiva coletada. Se uma estrela sair da tela sem ser coletada, o valor volta a `10`.
- **Speed-up:** a cada 10 pontos a velocidade dos canos aumenta (~10%) e a gravidade aumenta (~5%).
- **Recorde:** salvo no `localStorage` do navegador. O botão **Resetar recorde** zera o valor.
- **Auto-pause:** trocar de aba encerra a partida em andamento.

## Estrutura

```
flappy-bird/
├── index.html          # markup do menu e do jogo
├── game.js             # física, geração de canos, colisões, pontuação
├── css/
│   ├── style.css       # layout, pássaro, canos, estrelas
│   └── animation.css   # animações
├── img/                # sprites (pássaro, canos, estrela, fundo)
├── font/Gamer.ttf      # fonte customizada
├── LICENSE
└── README.md
```

## Detalhes técnicos

- **Loop de jogo:** `setInterval(game, 8)` renderiza/colide a ~125 Hz. A física do pulo roda separadamente a 50 Hz (`setInterval(jump, 20)`).
- **Posicionamento dos canos:** um único valor aleatório `gapTop` define onde o gap começa; `pipeTop` e `pipeBottom` são derivados para manter o gap constante (180 px).
- **Colisão:** `getBoundingClientRect()` do pássaro contra cada cano e estrela a cada frame.
- **Limpeza:** todos os `setInterval`/`setTimeout` (canos, estrelas, geração) são rastreados e cancelados no game over para evitar vazamentos.

## Requisitos

Apenas um navegador. Não precisa de Node, npm, servidor local ou build.
