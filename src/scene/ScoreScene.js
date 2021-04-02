import Phaser from 'phaser';
import BaseScene from './BaseScene';

class MenuScene extends BaseScene {
  constructor(config) {
    super('ScoreScene', { ...config, canGoBack: true });
  }

  create() {
    super.create();

    const bestScore = localStorage.getItem('bestScore');
    this.add
      .text(...this.screenCenter, `Best Score: ${bestScore || 0}`, this.fontOptions)
      .setOrigin(0.5);
  }
}

export default MenuScene;
