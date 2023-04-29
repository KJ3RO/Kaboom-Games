import kaboom from "kaboom"

// initialize context
kaboom({
  background: [134, 135, 247],
  width: 320,
  height: 240,
  scale: 2,
  stretch: true,
  letterbox: true,
});

const SPEED = 160;

loadRoot("sprites/");
loadAseprite("mario", "Mario.png", "Mario.json");
loadAseprite("enemies", "enemies.png", "enemies.json");
loadSprite("ground", "ground.png");
loadSprite("questionBox", "questionBox.png");
loadSprite("emptyBox", "emptyBox.png");
loadSprite("brick", "brick.png");
loadSprite("coin", "coin.png");
loadSprite("bigMushy", "bigMushy.png");
loadSprite("pipeTop", "pipeTop.png");
loadSprite("pipeBottom", "pipeBottom.png");
loadSprite("shrubbery", "shrubbery.png");
loadSprite("hill", "hill.png");
loadSprite("cloud", "cloud.png");
loadSprite("castle", "castle.png");

const LEVELS = [
  [
    "                                                                                                ",
    "                                                                                                ",
    "                                                                                                ",
    "                                                                                                ",
    "                                                                                                ",
    "                                                                                                ",
    "                                                                                                ",
    "      -?-b-                                                                                     ",
    "                                                    ?        ?                                  ",
    "                                                                                                ",
    "                                      _                 ?                                       ",
    "                                 _    |                                                         ",
    "                           _     |    |                _                                        ",
    "       E                   |     |    |   E   E        |                            H           ",
    "================     ===========================================================================",
    "================     ===========================================================================",
  ],
  [
    "                                                                                             ",
    "                                                                                             ",
    "                                                                                             ",
    "                                       ?                                                     ",
    "                                                                                             ",
    "                                   -?-                                                       ",
    "                                                                                             ",
    "      -?-b-                  -?-                                                             ",
    "                                                                                             ",
    "                                                                                             ",
    "                                                                                             ",
    "                                                                                             ",
    "       _                                            _                                        ",
    "       |                                            |          E    E            H           ",
    "================     ========================================================================",
    "================     ========================================================================",
  ]
];

const levelConf = {
  // grid size
  width: 16,
  height: 16,
  pos: vec2(0, 0),

  // define each object as a list of components
  "=": () => [
    sprite("ground"),
    area(),
    solid(),
    origin("bot"),
    "ground"
  ],
  "-": () => [
    sprite("brick"),
    area(),
    solid(),
    origin("bot"),
    "brick"
  ],
  "H": () => [
    sprite("castle"),
    area({ width: 1, height: 240 }),
    origin("bot"),
    "castle"
  ],
  "?": () => [
    sprite("questionBox"),
    area(),
    solid(),
    origin("bot"),
    'questionBox',
    'coinBox'
  ],
  "b": () => [
    sprite("questionBox"),
    area(),
    solid(),
    origin("bot"),
    'questionBox',
    'mushyBox'
  ],
  "!": () => [
    sprite("emptyBox"),
    area(),
    solid(),
    bump(),
    origin("bot"),
    'emptyBox'
  ],
  "c": () => [
    sprite("coin"),
    area(),
    solid(),
    bump(64, 8),
    patrol(10000),
    body(),
    cleanup(),
    lifespan(1.5, { fade: 0.01 }),
    origin("bot"),
    "coin"
  ],
  "M": () => [
    sprite("bigMushy"),
    area(),
    solid(),
    patrol(10000),
    body(),
    cleanup(),
    origin("bot"),
    "bigMushy"
  ],
  "|": () => [
    sprite("pipeBottom"),
    area(),
    solid(),
    origin("bot"),
    "pipe"
  ],
  "_": () => [
    sprite("pipeTop"),
    area(),
    solid(),
    origin("bot"),
    "pipe"
  ],
  "E": () => [
    sprite("enemies", { anim: 'Walking' }),
    area({ width: 16, height: 16 }),
    solid(),
    body(),
    patrol(50),
    enemy(),
    origin("bot"),
    health(4),
    "badGuy"
  ],
  "p": () => [
    sprite("mario", { frame: 0 }),
    opacity(1.0),
    area({ width: 16, height: 16 }),
    body(),
    mario(),
    bump(150, 20, false),
    origin("bot"),
    "player"
  ]
}

scene("start", () => {

  add([
    text("Press enter to start", { size: 24 }),
    pos(vec2(160, 120)),
    origin("center"),
    color(255, 255, 255),
  ]);

  onKeyRelease("enter", () => {
    go("game");
  });
});


scene("game", (levelNumber = 0) => {
  layers([
    "bg",
    "game",
    "ui",
  ], "game");

  const level = addLevel(LEVELS[levelNumber], levelConf);

  add([
    sprite("cloud"),
    pos(20, 50),
    layer("bg")
  ]);

  add([
    sprite("hill"),
    pos(32, 208),
    layer("bg"),
    origin("bot")
  ]);

  add([
    sprite("shrubbery"),
    pos(150, 208),
    area(),
    layer("bg"),
    origin("bot"),
    "shrubbery"
  ]);

  add([
    text("Level " + (levelNumber + 1), { size: 24 }),
    pos(vec2(150, 120)),
    color(255, 255, 255),
    origin("center"),
    layer("ui"),
    lifespan(1, { fade: 0.5 })
  ]);

  const player = level.spawn("p", 0, 10);

  onKeyDown("right", () => {
    if (player.isFrozen) return;
    player.flipX(false);
    player.move(SPEED, 0);
  });

  onKeyDown("left", () => {
    if (player.isFrozen) return;
    player.flipX(true);
    if (toScreen(player.pos).x > 8) {
      player.move(-SPEED, 0);
    }
  });

  onKeyDown("space", () => {
    if (player.isAlive && player.grounded()) {
      player.jump();
      canSquash = true;
    }
  });


  onKeyPress("r", () => {
    go("start");
  })

  onCollide("missile", "enemy", (missile, enemy) => {
		destroy(missile);
		enemy.hurt(1);
	})

  on("death", "enemy", (enemy) => {
		destroy(enemy)
		addKaboom(enemy.pos)
	})

  player.onUpdate(() => {
    var currCam = camPos();

    if (currCam.x < player.pos.x) {
      camPos(player.pos.x, currCam.y);
    }

    if (!player.isFrozen) {
      if (player.isAlive && player.grounded()) {
        canSquash = false;
      }
    }

    if (player.pos.y > height() - 16) {
      killed();
    }

  });

  let canSquash = false;
  player.onCollide("badGuy", (baddy) => {
    if (baddy.isAlive == false) return;
    if (player.isAlive == false) return;

    if (canSquash) {
      baddy.squash();
    }
    else {
      if (player.isBig) {
        player.smaller();
        every("badGuy", (obj) => {
          obj.unuse("body");
          obj.unuse("solid");
        });

        wait(1, () => {
          player.isInvincible = false;
          player.opacity = 1.0;
          every("badGuy", (obj) => {
            obj.use("body");
            obj.use("solid");
          });
        });
      } else {
        if (player.isInvincible) {

        } else {
          killed();
        }
      }
    }
  });

  player.onCollide("bigMushy", (mushy) => {
    destroy(mushy);
    player.bigger();
  });

  player.onCollide("castle", (castle, side) => {
    player.freeze();
    player.unuse("body");
    add([
      text("Well Done!", { size: 24 }),
      pos(toWorld(vec2(160, 120))),
      color(255, 255, 255),
      origin("center"),
      layer("ui"),
    ]);
    wait(1, () => {
      player.use("body");
      let nextLevel = levelNumber + 1;
      if (nextLevel >= LEVELS.length) {
        go("start");
      } else {
        go("game", nextLevel);
      }
    })
  })

  player.on("headbutt", (obj) => {
    if (obj.is("questionBox")) {
      if (obj.is("coinBox")) {
        let coin = level.spawn("c", obj.gridPos.sub(0, 1));
        coin.bump();
      } else if (obj.is("mushyBox")) {
        level.spawn("M", obj.gridPos.sub(0, 1));
      }
      var pos = obj.gridPos;
      destroy(obj);
      var box = level.spawn("!", pos);
      box.bump();
    }
  });

  function killed() {
    if (player.isAlive == false)
      return;
    player.die();
    add([
      text("Game Over :(", { size: 24 }),
      pos(toWorld(vec2(160, 120))),
      color(255, 255, 255),
      origin("center"),
      layer("ui"),
    ]);
    wait(2, () => {
      go("start");
    })
  }
});

function patrol(distance = 100, speed = 50, dir = 1) {
  return {
    id: "patrol",
    require: ["pos", "area",],
    startingPos: vec2(0, 0),
    add() {
      this.startingPos = this.pos;

      this.on("collide", (obj, coll) => {
        if (coll.isLeft() || coll.isRight()) {
          if (obj.is("player")) {
            //debug.log(obj.tag);
          }
          dir = -dir;
        }
      });
    },
    update() {
      if (Math.abs(this.pos.x - this.startingPos.x) >= distance) {
        dir = -dir;
      }
      this.move(speed * dir, 0);
    },
  };
}

function enemy() {
  return {
    id: "enemy",
    require: ["pos", "area", "sprite", "patrol"],
    isAlive: true,
    update() {

    },
    squash() {
      this.isAlive = false;
      this.unuse("patrol");
      this.stop();
      this.frame = 2;
      this.area.width = 16;
      this.area.height = 8;
      this.use(lifespan(0.5, { fade: 0.1 }));
    }
  }
}

function bump(offset = 8, speed = 2, stopAtOrigin = true) {
  return {
    id: "bump",
    require: ["pos"],
    bumpOffset: offset,
    speed: speed,
    bumped: false,
    origPos: 0,
    direction: -1,
    update() {
      if (this.bumped) {
        this.pos.y = this.pos.y + this.direction * this.speed;
        if (this.pos.y < this.origPos - this.bumpOffset) {
          this.direction = 1;
        }
        if (stopAtOrigin && this.pos.y >= this.origPos) {
          this.bumped = false;
          this.pos.y = this.origPos;
          this.direction = -1;
        }
      }
    },
    bump() {
      this.bumped = true;
      this.origPos = this.pos.y;
    }
  };
}

function mario() {
  return {
    id: "mario",
    require: ["body", "area", "sprite", "opacity", "bump"],
    smallAnimation: "Running",
    bigAnimation: "RunningBig",
    smallStopFrame: 0,
    bigStopFrame: 8,
    smallJumpFrame: 5,
    bigJumpFrame: 13,
    isBig: false,
    isInvincible: false,
    isFrozen: false,
    isAlive: true,
    update() {
      if (this.isFrozen) {
        //this.standing();
        return;
      }

      if (!this.grounded()) {
        this.jumping();
      } else {
        if (keyIsDown("left") || keyIsDown("right")) {
          this.running();
        } else {
          this.standing();
        }
      }
    },
    bigger() {
      this.isBig = true;
      this.area.width = 24;
      this.area.height = 32;
    },
    smaller() {
      this.isBig = false;
      this.isInvincible = true;
      this.opacity = 0.5;
      this.area.width = 16;
      this.area.height = 16;
    },
    standing() {
      this.stop();
      this.frame = this.isBig ? this.bigStopFrame : this.smallStopFrame;
    },
    jumping() {
      this.stop();
      this.frame = this.isBig ? this.bigJumpFrame : this.smallJumpFrame;
    },
    running() {
      const animation = this.isBig ? this.bigAnimation : this.smallAnimation;
      if (this.curAnim() !== animation) {
        this.play(animation);
      }
    },
    freeze() {
      this.isFrozen = true;
    },
    die() {
      this.unuse("body");
      this.bump();
      this.isAlive = false;
      this.freeze();
      this.use(lifespan(1, { fade: 1 }));
    }
  }
}

go("start");