export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('menuBg', './assets/main_menu_background.png');
    this.load.image('hudPanel', './assets/Menu_Background.png');
    this.load.audio('menuMusic', './assets/Neon_Wasteland.mp3');
  }

  create() {
    this.scene.start('MainMenu');
  }
}
