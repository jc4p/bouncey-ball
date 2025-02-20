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
    mode: Phaser.Scale.RESIZE,
    width: '100%',
    height: '100%',
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
var collided = false;
var lastUpdate = 0;
var scoreText;
var highScoreText;
var score = 0;
var highScore = 0;
var scoreTimer;
var gameStarted = false;

// Make ball size relative to screen height
function getBallSize() {
  return Math.max(game.scale.height * 0.09375, 32); // 48px at 512 height
}

var BOUNCE = 0.25;
var MIN_STRETCH = 350.0;
var MAX_STRETCH = 650.0;

function preload() {
  const centerX = this.cameras.main.width / 2;
  const BALL_SIZE = getBallSize();
  const centerY = BALL_SIZE * 2;
  
  ball = this.add.ellipse(centerX, centerY, BALL_SIZE, BALL_SIZE, 0xEFEFEF);
  this.physics.add.existing(ball, false);

  ball.body.onWorldBounds = true;
  ball.body.setCollideWorldBounds(true);
  ball.body.setBounce(0, BOUNCE);

  // counter = this.add.text(0, 0, 'Velocity Y: ' + ball.body.velocity.y)
}

function create() {
  this.input.mouse.disableContextMenu();

  // Calculate responsive text size and padding using game scale manager
  const gameWidth = this.scale.gameSize.width;
  const gameHeight = this.scale.gameSize.height;
  const fontSize = Math.max(Math.floor(gameHeight * 0.04), 14);
  const padding = Math.max(Math.floor(gameHeight * 0.03), 10);

  const textConfig = {
    fontSize: `${fontSize}px`,
    fontFamily: 'monospace',
    fill: '#ffffff'
  };

  // Add high score text in top left corner
  highScoreText = this.add.text(padding, padding, 'BEST:0', textConfig)
    .setDepth(1)
    .setScrollFactor(0)
    .setOrigin(0, 0);

  // Add score text in top right corner
  scoreText = this.add.text(gameWidth - padding, padding, '0', textConfig)
    .setDepth(1)
    .setScrollFactor(0)
    .setOrigin(1, 0);

  // Handle resize events - bind to scene context
  this.handleResize = function(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;
    const fontSize = Math.max(Math.floor(height * 0.04), 14);
    const padding = Math.max(Math.floor(height * 0.03), 10);

    const newTextConfig = {
      fontSize: `${fontSize}px`,
      fontFamily: 'monospace'
    };

    // Update text styles and positions
    highScoreText
      .setPosition(padding, padding)
      .setStyle(newTextConfig);

    scoreText
      .setPosition(width - padding, padding)
      .setStyle(newTextConfig);

    // Update ball position to stay centered
    ball.setPosition(width / 2, ball.y);
  };

  // Bind resize event
  this.scale.on('resize', this.handleResize, this);

  // Force an initial resize to ensure correct positioning
  this.handleResize(this.scale.gameSize);

  this.input.on('pointerdown', function (pointer) {
    if (ball.body.velocity.y > -100) {
      if (!gameStarted) {
        gameStarted = true;
        // Start incrementing score every second
        scoreTimer = this.time.addEvent({
          delay: 1000,
          callback: incrementScore,
          callbackScope: this,
          loop: true
        });
      }
      
      ball.body.setVelocityY(-200);
      if (ball.height > getBallSize()) {
        // snap back
        ball.setSize(getBallSize(), getBallSize());
      }
      if (collided) {
        collided = false;
      }
    }
  }, this);

  this.physics.world.on('worldbounds', function(ballBody, up, down) {
    // Reset game when ball hits either top or bottom
    if (up || down) {
      resetGame();
    }
  })

  this.physics.world.on('worldstep', function(delta) {
    if (delta < 0.015) {
      // double step (60fps)
      return;
    }

    updateBall(ball.body.velocity.y);
/*
    lastUpdate++;

    if (lastUpdate < 4) {
      return;
    }

    var velocity = ball.body.velocity.y
    counter.setText('Velocity Y: ' + Math.floor(velocity))

    lastUpdate = 0;
*/
  })
}

function update() {
}

function updateBall(velocity) {
  const BALL_SIZE = getBallSize();
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

function incrementScore() {
  score += 1;
  scoreText.setText(score.toString());
}

function resetGame() {
  // Update high score if current score is higher
  if (score > highScore) {
    highScore = score;
    highScoreText.setText('BEST:' + highScore);
  }
  
  // Reset score and timer
  if (scoreTimer) {
    scoreTimer.destroy();
  }
  score = 0;
  gameStarted = false;
  scoreText.setText('0');
  
  const BALL_SIZE = getBallSize();
  ball.setSize(BALL_SIZE, BALL_SIZE);
  ball.body.setBounce(0, BOUNCE);
  collided = true;
}