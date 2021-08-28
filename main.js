var config = {
  type: Phaser.AUTO,
  width: 512,
  height: 512,
  backgroundColor: '#345654',
  audio: {
    noAudio: true,
    disableWebAudio: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false
    },
  },
  scale: {
    mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

var game = new Phaser.Game(config);
var ball;
var counter;
var collided = false;
var lastUpdate = 0;

var BALL_SIZE = 48;
var BOUNCE = 0.25;

var MIN_STRETCH = 350.0;
var MAX_STRETCH = 650.0;

function preload() {
  ball = this.add.ellipse(256, BALL_SIZE * 2, BALL_SIZE, BALL_SIZE, 0xEFEFEF);
  this.physics.add.existing(ball, false);

  ball.body.onWorldBounds = true;
  ball.body.setCollideWorldBounds(true);
  ball.body.setBounce(0, BOUNCE);

  counter = this.add.text(0, 0, 'Velocity Y: ' + ball.body.velocity.y)
}

function create() {
  this.input.mouse.disableContextMenu();

  this.input.on('pointerdown', function (pointer) {
    if (ball.body.velocity.y > -100) {
      ball.body.setVelocityY(-200);
      if (ball.height > BALL_SIZE) {
        // snap back
        ball.setSize(BALL_SIZE, BALL_SIZE);
      }
      if (collided) {
        collided = false;
      }
    }
  }, this);

  this.physics.world.on('worldbounds', function(ballBody, up, down) {
    if (up) {
      return;
    }

    ball.setSize(BALL_SIZE, BALL_SIZE)
    ball.body.setBounce(0, BOUNCE)
    collided = true
  })

  this.physics.world.on('worldstep', function(delta) {
    if (delta < 0.015) {
      // double step (60fps)
      return;
    }

    updateBall(ball.body.velocity.y);

    lastUpdate++;

    if (lastUpdate < 4) {
      return;
    }

    var velocity = ball.body.velocity.y
    counter.setText('Velocity Y: ' + Math.floor(velocity))

    lastUpdate = 0;
  })
}

function update() {
}

function updateBall(velocity) {
  var ratio = (velocity - MIN_STRETCH) / (MAX_STRETCH - MIN_STRETCH)
  var sinRatio = Math.sin(ratio);

  if (ratio < 0) {
    return;
  }


  var newBounce = BOUNCE * (1.5 + sinRatio);
  ball.body.setBounce(0, newBounce);

  if (collided) {
    return
  }

  var newHeight = BALL_SIZE * (1.0 + sinRatio);
  ball.setSize(BALL_SIZE, newHeight);
}