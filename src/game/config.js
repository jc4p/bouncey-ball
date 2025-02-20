import { Scale, AUTO } from 'phaser';

export const config = {
  type: AUTO,
  width: 512,
  height: 512,
  backgroundColor: '#345654',
  parent: 'app',
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
    mode: Scale.RESIZE,
    width: '100%',
    height: '100%',
    autoCenter: Scale.CENTER_BOTH
  }
}; 