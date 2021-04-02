import Phaser from 'phaser';
import PlayScene from './scene/PlayScene';
import MenuScene from './scene/MenuScene';
import PreloadScene from './scene/PreloadScene';
import ScoreScene from './scene/ScoreScene';
import PauseScene from './scene/PauseScene';

const WIDTH = 400;
const HEIGHT = 600;
const BIRD_POSITION = { x: WIDTH * 0.1, y: HEIGHT / 2 };

const Scenes = [PreloadScene, MenuScene, ScoreScene, PlayScene, PauseScene];

const initScenes = () => Scenes.map((Scene) => new Scene(SHARE_CONFIG));

const SHARE_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
  startPosition: BIRD_POSITION,
};

const config = {
  type: Phaser.AUTO,
  ...SHARE_CONFIG,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true,
    },
  },
  scene: initScenes(),
};

new Phaser.Game(config);
