import { Scene } from 'phaser';
import { BOUNCE, MIN_STRETCH, MAX_STRETCH } from './constants';

export class GameScene extends Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.ball = null;
    this.collided = false;
    this.lastUpdate = 0;
    this.scoreText = null;
    this.highScoreText = null;
    this.score = 0;
    this.highScore = 0;
    this.scoreTimer = null;
    this.gameStarted = false;
  }

  getBallSize() {
    return Math.max(this.scale.height * 0.09375, 32); // 48px at 512 height
  }

  preload() {
    const centerX = this.cameras.main.width / 2;
    const BALL_SIZE = this.getBallSize();
    const centerY = BALL_SIZE * 2;
    
    this.ball = this.add.ellipse(centerX, centerY, BALL_SIZE, BALL_SIZE, 0xEFEFEF);
    this.physics.add.existing(this.ball, false);
  
    this.ball.body.onWorldBounds = true;
    this.ball.body.setCollideWorldBounds(true);
    this.ball.body.setBounce(0, BOUNCE);
  }

  create() {
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
    this.highScoreText = this.add.text(padding, padding, 'BEST:0', textConfig)
      .setDepth(1)
      .setScrollFactor(0)
      .setOrigin(0, 0);
  
    // Add score text in top right corner
    this.scoreText = this.add.text(gameWidth - padding, padding, '0', textConfig)
      .setDepth(1)
      .setScrollFactor(0)
      .setOrigin(1, 0);
  
    // Handle resize events
    this.scale.on('resize', this.handleResize, this);
  
    // Force an initial resize to ensure correct positioning
    this.handleResize(this.scale.gameSize);
  
    this.input.on('pointerdown', this.handlePointerDown, this);
    this.physics.world.on('worldbounds', this.handleWorldBounds, this);
    this.physics.world.on('worldstep', this.handleWorldStep, this);
  }

  handleResize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;
    const fontSize = Math.max(Math.floor(height * 0.04), 14);
    const padding = Math.max(Math.floor(height * 0.03), 10);

    const newTextConfig = {
      fontSize: `${fontSize}px`,
      fontFamily: 'monospace'
    };

    // Update text styles and positions
    this.highScoreText
      .setPosition(padding, padding)
      .setStyle(newTextConfig);

    this.scoreText
      .setPosition(width - padding, padding)
      .setStyle(newTextConfig);

    // Update ball position to stay centered
    this.ball.setPosition(width / 2, this.ball.y);
  }

  handlePointerDown(pointer) {
    if (this.ball.body.velocity.y > -100) {
      if (!this.gameStarted) {
        this.gameStarted = true;
        // Start incrementing score every second
        this.scoreTimer = this.time.addEvent({
          delay: 1000,
          callback: this.incrementScore,
          callbackScope: this,
          loop: true
        });
      }
      
      this.ball.body.setVelocityY(-200);
      if (this.ball.height > this.getBallSize()) {
        // snap back
        this.ball.setSize(this.getBallSize(), this.getBallSize());
      }
      if (this.collided) {
        this.collided = false;
      }
    }
  }

  handleWorldBounds(ballBody, up, down) {
    // Reset game when ball hits either top or bottom
    if (up || down) {
      this.resetGame();
    }
  }

  handleWorldStep(delta) {
    if (delta < 0.015) {
      // double step (60fps)
      return;
    }
    this.updateBall(this.ball.body.velocity.y);
  }

  updateBall(velocity) {
    const BALL_SIZE = this.getBallSize();
    const ratio = (velocity - MIN_STRETCH) / (MAX_STRETCH - MIN_STRETCH);
    const sinRatio = Math.sin(ratio);
  
    if (ratio < 0) {
      return;
    }
  
    const newBounce = BOUNCE * (1.5 + sinRatio);
    this.ball.body.setBounce(0, newBounce);
  
    if (this.collided) {
      return;
    }
  
    const newHeight = BALL_SIZE * (1.0 + sinRatio);
    this.ball.setSize(BALL_SIZE, newHeight);
  }

  incrementScore() {
    this.score += 1;
    this.scoreText.setText(this.score.toString());
  }

  resetGame() {
    // Update high score if current score is higher
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.highScoreText.setText('BEST:' + this.highScore);
    }
    
    // Reset score and timer
    if (this.scoreTimer) {
      this.scoreTimer.destroy();
    }
    this.score = 0;
    this.gameStarted = false;
    this.scoreText.setText('0');
    
    const BALL_SIZE = this.getBallSize();
    this.ball.setSize(BALL_SIZE, BALL_SIZE);
    this.ball.body.setBounce(0, BOUNCE);
    this.collided = true;
  }
} 