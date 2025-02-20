import 'phaser';
import { Game } from 'phaser';
import { config } from './game/config';
import { GameScene } from './game/scene';

// Add the game scene to config
config.scene = GameScene;

// Create the game instance
new Game(config); 