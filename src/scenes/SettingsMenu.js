export default class SettingsMenu extends Phaser.Scene {
  constructor() {
    super('SettingsMenu');
  }

  create() {
    this.add.image(640, 360, 'menuBg').setOrigin(0.5);

    this.add.text(100, 100, 'Ajustes', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#FFFFFF'
    });

    this.add.text(100, 160, 'Volumen música (próximamente)', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#AAAAAA'
    });

    const volver = this.add.text(100, 300, '← Volver', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#FFFFFF'
    }).setInteractive();

    volver.on('pointerover', () => volver.setStyle({ color: '#00ffcc' }));
    volver.on('pointerout', () => volver.setStyle({ color: '#ffffff' }));
    volver.on('pointerdown', () => this.scene.start('MainMenu'));
  }
}
