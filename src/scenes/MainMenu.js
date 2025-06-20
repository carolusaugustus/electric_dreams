export default class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenu' });
  }

  preload() {
    this.load.image('menuBackground', 'assets/main_menu_background.png');
    this.load.audio('menuMusic', 'assets/Neon_Wasteland.mp3');
  }

  create() {
    const { width, height } = this.sys.game.canvas;

    // Escalar fondo al 100% de la pantalla
    const bg = this.add.image(0, 0, 'menuBackground')
      .setOrigin(0, 0)
      .setDisplaySize(width, height);

    // Música
    // const music = this.sound.add('menuMusic', { loop: true, volume: 0.5 });
    // music.play();
    if (!this.sys.game.music) {
      this.sys.game.music = this.sound.add('menuMusic', { loop: true, volume: 0.5 });
      this.sys.game.music.play();
    }

    // Crear grupo para opciones de menú (inicialmente invisible)
    this.menuOptions = this.add.group();
    const options = ['Modo Historia', 'Modo Infinito', 'Modo Agente', 'Ajustes'];

    // Mostrar opciones después de 5 segundos
    this.time.delayedCall(1000, () => {
      options.forEach((text, index) => {
      const menuItem = this.add.text
        (width * 0.2, height * 0.5 + index * 60, text, {
        fontFamily: 'VT323',
        fontSize: '32px',
        color: '#00FF00'
      })
      .setAlpha(0)
      .setInteractive()
      .on('pointerover', () => menuItem.setStyle({ fill: '#FFFFFF' }))
      .on('pointerout', () => menuItem.setStyle({ fill: '#00FF00' }))
      .on('pointerdown', () => {
        if (text === 'Ajustes') this.scene.start('SettingsMenu');
        else if (text === 'Modo Historia') {
          this.sys.game.music.stop();
          this.scene.start('StoryIntroScene');
        }
        else this.scene.start('OfficeScene');
      });

      // Leve parpadeo tipo CRT
      this.tweens.add({
        targets: menuItem,
        alpha: { from: 0.8, to: 1 },
        ease: 'Sine.easeInOut',
        duration: 500,
        yoyo: true,
        repeat: -1
      });

      this.menuOptions.add(menuItem);
    });
    
      this.menuOptions.getChildren().forEach(item => {
        this.tweens.add({
          targets: item,
          alpha: 1,
          duration: 1000,
          ease: 'Power2'
        });
      });
    });
  }
}
