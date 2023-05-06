import kaboom from "kaboom"; // from another file

// initialize context
kaboom();

// load assets
loadSprite("birdy", "sprites/birdy.png");
loadSprite("bg", "sprites/bg.png");
loadSprite("pipe", "sprites/pipe.png");
loadSound("wooosh", "sounds/wooosh.mp3");
// name = () => {} (function)
scene("game", () => {
  add([
    sprite("bg", {width: width(), height: height() })
  ]);
  // {} = object, [] = array (data)
  const player = add([
    sprite("birdy"),
    scale(3),   
    pos(80, 40),
    area(), // collider
    body(), // gravity & physics
  ]);

  let score = 0;
  const scoreText = add([text(score, {size: 50})]);

  onKeyPress("space", () => {
    play("wooosh");
    player.jump(400);
  });

  onUpdate("pipe", (pipe) => {
    pipe.move(-180, 0);

    if(pipe.passed == false && pipe.pos.x < player.pos.x) {
      pipe.passed = true;
      scoreText.text = ++score;
    }
  });

  const PIPE_GAP = 250;
 
  function producePipes() {
    const offset = rand(-50, 50);

    add([
      sprite("pipe"),
      pos(width(), height() / 2 + offset + PIPE_GAP / 2),
      "pipe", // tag
      area(),
      scale(2),
      {passed:false},
    ]);
 
    add([
      sprite("pipe", {flipY: true}),
      pos(width(), height() / 2 + offset - PIPE_GAP / 2),
      origin("botleft"),
      "pipe",
      scale(2),
      area(),
    ]);
  }

  player.collides("pipe", () => {
    go("gameover", score);
  });

  player.onUpdate( () => {
    if(player.pos.y > height() + 30 || player.pos.y < -30) {
      go("gameover");
    }
  });

  loop(0.7 , () => {
    producePipes();
  });
}); 

let highScore = 0;
scene("gameover", (score) => {
  if(score > highScore) {
    highScore = score;
  }

  add([
    text(
      "Game Over!\n" + "score: " + score + "\nHigh Score: " + highScore,
      {size: 45}
    ),
  ]);

  onKeyPress("space", () => {
     go("game");
  });
});

go("game");
