var config = {
  type: Phaser.AUTO,
  width: 512,
  height: 512,
  backgroundColor: '#345654',
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

function preload() {
  ball = this.add.ellipse(256, 96, 48, 48, 0xEFEFEF);
  this.physics.add.existing(ball, false);

  ball.body.setCollideWorldBounds(true);
  ball.body.setBounce(0, 0.25);
}

function create() {
  this.input.mouse.disableContextMenu();

  this.input.on('pointerdown', function (pointer) {
    if (ball.body.velocity.y > -100) {
      ball.body.setVelocityY(-200);
    }
  }, this);
}

function update() {
}
