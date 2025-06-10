class SplashScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SplashScene' });
  }

  preload() {
    this.load.image('menuBackground', '/assets/main_menu_background.png');
    this.load.audio('bgMusic', '/assets/Neon_Wasteland.mp3');
  }

  create() {
    this.add.image(640, 360, 'menuBackground').setOrigin(0.5);

    this.bgMusic = this.sound.add('bgMusic', { volume: 0.5, loop: true });
    this.bgMusic.play();

    // Efecto de texto retro-futurista
    const title = this.add.text(640, 100, 'Electric Dreams: Terminal·E', {
      fontFamily: 'monospace',
      fontSize: '40px',
      color: '#00ffcc'
    }).setOrigin(0.5);

    // Parpadeo tipo consola
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        title.visible = !title.visible;
      }
    });

    // Lanzar menú tras 5 segundos
    this.time.delayedCall(5000, () => {
      this.scene.start('MenuScene');
    });
  }
}
