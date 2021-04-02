import Phaser from 'phaser';
import BaseScene from './BaseScene';

const PIPES_TO_RENDER = 4;

class PlayScene extends BaseScene {
  constructor(config) {
    super('PlayScene', config);
    this.bird = null;
    this.pipes = null;
    this.flapVelocity = 200;
    this.pipeVerticalDistanceRange = [150, 250];
    this.pipeHorizontalDistanceRange = [350, 500];
    this.score = 0;
    this.bestScore = 0;
    this.scoreText = '';
    this.bestScoreText = '';
    this.isPaused = false;
    this.difficulties = {
      easy: {
        pipeHorizontalDistanceRange: [300, 400],
        pipeVerticalDistanceRange: [150, 200],
      },
      normal: {
        pipeHorizontalDistanceRange: [280, 370],
        pipeVerticalDistanceRange: [140, 190],
      },
      hard: {
        pipeHorizontalDistanceRange: [250, 350],
        pipeVerticalDistanceRange: [85, 120],
      },
      titan: {
        pipeHorizontalDistanceRange: [230, 300],
        pipeVerticalDistanceRange: [50, 100],
      },
    };
  }

  preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.spritesheet('bird', 'assets/birdSprite.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.image('pipe', 'assets/pipe.png');
    this.load.image('pause', 'assets/pause.png');
  }

  create() {
    this.currentDifficulty = 'easy';
    super.create();
    this.createBird();
    this.createPipes();
    this.createColliders();

    this.createScore();
    this.createPause();
    this.handleInput();
    this.listenToEvents();

    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('bird', { start: 8, end: 15 }),
      frameRate: 8,
      repeat: -1,
    });

    this.bird.play('fly');
  }

  update() {
    this.checkGameStatus();
    this.recyclePipes();
  }

  listenToEvents() {
    if (this.pauseEvent) {
      return;
    }

    this.pauseEvent = this.events.on('resume', () => {
      this.initialTime = 3;
      this.countDownText = this.add.text(
        ...this.screenCenter,
        'Fly in: ' + this.initialTime,
        this.fontOptions
      );
      this.timeEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        callbackScope: this,
        loop: true,
      });
    });
  }

  countDown() {
    this.initialTime--;
    this.countDownText.setText('Fly in: ' + this.initialTime);
    if (this.initialTime <= 0) {
      this.isPaused = false;
      this.countDownText.setText('');
      this.physics.resume();
      this.timeEvent.remove();
    }
  }

  checkGameStatus() {
    if (this.bird.getBounds().bottom >= this.config.height || this.bird.y <= 0) {
      this.gameOver();
    }
  }

  createBG() {
    this.add.image(0, 0, 'sky').setOrigin(0, 0);
  }

  createBird() {
    this.bird = this.physics.add
      .sprite(this.config.startPosition.x, this.config.startPosition.y, 'bird')
      .setFlipX(true)
      .setOrigin(0, 0)
      .setScale(2);

    this.bird.setBodySize(this.bird.width - 5, this.bird.height - 6);
    this.bird.body.gravity.y = 400;
    this.bird.setCollideWorldBounds(true);
  }

  createPipes() {
    this.pipes = this.physics.add.group();

    for (let i = 0; i < PIPES_TO_RENDER; i++) {
      const upperPipe = this.pipes.create(0, 0, 'pipe').setImmovable(true).setOrigin(0, 1);
      const lowerPipe = this.pipes.create(0, 0, 'pipe').setImmovable(true).setOrigin(0, 0);

      this.placePipe(upperPipe, lowerPipe);
    }

    this.pipes.setVelocityX(-200);
  }

  createScore() {
    this.score = 0;
    this.scoreText = this.add.text(16, 16, `Score: ${0}`, { fontSize: '23px', fill: '#000' });

    const bestScore = localStorage.getItem('bestScore');
    this.bestScoreText = this.add.text(16, 45, `Best score: ${bestScore || 0}`, {
      fontSize: '14px',
      fill: '#000',
    });
  }

  createPause() {
    this.isPaused = false;

    const pauseButton = this.add
      .image(this.config.width - 10, this.config.height - 10, 'pause')
      .setInteractive()
      .setScale(3)
      .setOrigin(1);

    pauseButton.on('pointerdown', () => {
      this.isPaused = true;
      this.physics.pause();
      this.scene.pause();
      this.scene.launch('PauseScene');
    });
  }

  createColliders() {
    this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
  }

  handleInput() {
    this.input.on('pointerdown', this.flap, this);

    this.input.keyboard.on('keydown_SPACE', this.flap, this);
  }

  flap() {
    if (this.isPaused) {
      return;
    }
    this.bird.body.velocity.y = -this.flapVelocity;
  }

  placePipe(uPipe, lPipe) {
    const difficulty = this.difficulties[this.currentDifficulty];
    const rightMostX = this.getRightMostPipe();
    const pipeVerticalDistance = Phaser.Math.Between(...difficulty.pipeVerticalDistanceRange);
    const pipeHorizontalDistance = Phaser.Math.Between(...difficulty.pipeHorizontalDistanceRange);
    const pipeVerticalPosition = Phaser.Math.Between(
      0 + 30,
      this.config.height - 30 - pipeVerticalDistance
    );

    uPipe.x = rightMostX + pipeHorizontalDistance;
    uPipe.y = pipeVerticalPosition;

    lPipe.x = uPipe.x;
    lPipe.y = uPipe.y + pipeVerticalDistance;
  }

  getRightMostPipe() {
    let rightMostX = 0;

    this.pipes.getChildren().forEach((pipe) => {
      rightMostX = Math.max(pipe.x, rightMostX);
    });

    return rightMostX;
  }

  saveBestScore() {
    const bestScoreText = localStorage.getItem('bestScore');

    const bestScore = bestScoreText && parseInt(bestScoreText, 10);

    if (!bestScore || this.score > bestScore) {
      localStorage.setItem('bestScore', this.score);
    }
  }

  gameOver() {
    this.physics.pause();
    this.bird.setTint(0xee4824);

    this.saveBestScore();

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart();
      },
      loop: false,
    });
  }

  recyclePipes() {
    const tempPipes = [];
    this.pipes.getChildren().forEach((pipe) => {
      if (pipe.getBounds().right <= 0) {
        tempPipes.push(pipe);
        if (tempPipes.length === 2) {
          this.placePipe(...tempPipes);
          this.increaseScore();
          this.saveBestScore();
          this.increaseDifficulty();
        }
      }
    });
  }

  increaseDifficulty() {
    if (this.score === 30) {
      this.currentDifficulty = 'normal';
    }

    if (this.score === 60) {
      this.currentDifficulty = 'hard';
    }

    if (this.score === 80) {
      this.currentDifficulty = 'titan';
    }
  }

  increaseScore() {
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`);
  }
}

export default PlayScene;
