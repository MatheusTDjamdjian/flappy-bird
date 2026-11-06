# Flappy Bird

Clone do Flappy Bird feito em HTML, CSS e JavaScript puro — sem dependências, sem build.

## Como jogar

Abra `index.html` em qualquer navegador moderno e clique em **Jogar**. O pássaro fica flutuando até o primeiro pulo — aí a partida começa. Passe entre os canos para pontuar e colete estrelas para ganhar bônus. Funciona com teclado, mouse e toque (celular).

## Controles

| Tecla / ação | Efeito |
|-------|------|
| `Espaço`, `↑`, `W`, clique ou toque | Pular (e começar a partida) |
| `P` ou `Esc` | Pausar / continuar |

## Mecânicas

- **Pontuação:** +1 ao passar pelo meio de cada cano.
- **Estrelas:** 25% de chance de aparecer no centro do gap. Valem `10` pontos na primeira coleta e +10 a cada estrela seguida coletada (máximo `50`). Se uma estrela passar sem ser coletada, o valor volta a `10`.
- **Dificuldade:** a cada 10 canos atravessados a velocidade aumenta 8% (até um limite) e o gap entre os canos diminui 5px (mínimo 130px). A gravidade é sempre a mesma.
- **Teto e chão:** o pássaro não consegue voar por cima dos canos (o topo da tela é um limite); encostar no chão encerra a partida.
- **Recorde:** salvo no `localStorage` do navegador. O botão **Resetar recorde** zera o valor. Ao bater o recorde aparece "Novo recorde!".
- **Pausa automática:** trocar de aba ou de janela pausa a partida.

## Estrutura

```
flappy-bird/
├── index.html          # markup do menu e do jogo
├── game.js             # loop, física, canos, colisões, pontuação, entrada
├── css/
│   ├── style.css       # layout, pássaro, canos, estrelas
│   └── animation.css   # animações (título, estrelas, popup de pontos, tremida)
├── img/                # sprites (pássaro, canos, estrela, fundo)
├── font/Gamer.ttf      # fonte customizada
├── LICENSE
└── README.md
```

## Detalhes técnicos

- **Loop de jogo:** um único `requestAnimationFrame`; toda a física usa o tempo real entre quadros (`dt`, em px/s), então a velocidade é a mesma em telas de 60 Hz, 144 Hz etc. O `dt` é limitado para evitar saltos após travadas.
- **Resolução:** o jogo tem 360×640 px fixos e é escalado (`--scale`) para caber em qualquer janela, com o fundo alinhado à área jogável.
- **Canos:** gerados por distância (210 px entre canos), não por tempo, então o espaçamento não muda quando a velocidade aumenta. A posição do gap é sorteada respeitando margens das bordas, a altura da imagem do cano e uma variação máxima em relação ao gap anterior.
- **Colisão:** feita em coordenadas do jogo (não depende do zoom da página), com hitbox do pássaro levemente reduzida e hitbox do cano separando corpo e borda — as partes transparentes das imagens não contam.
- **Limpeza:** canos e estrelas que saem da tela são removidos do DOM a cada quadro.

## Requisitos

Apenas um navegador. Não precisa de Node, npm, servidor local ou build (a fonte do título vem do Google Fonts; sem internet, o navegador usa uma fonte serifada padrão).
