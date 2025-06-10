import BootScene from './scenes/BootScene.js';
import MainMenu from './scenes/MainMenu.js';
import SettingsMenu from './scenes/SettingsMenu.js';
import OfficeScene from './scenes/OfficeScene.js';

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MainMenu, SettingsMenu, OfficeScene]
};

new Phaser.Game(config);
