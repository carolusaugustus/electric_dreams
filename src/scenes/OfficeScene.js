export default class OfficeScene extends Phaser.Scene {
  constructor() {
    super('OfficeScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    this.add.text(100, 100, 'Escena de la Oficina\n(placeholder)', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#FFFFFF'
    });

    const volver = this.add.text(100, 300, '← Volver al Menú', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#FFFFFF'
    }).setInteractive();

    volver.on('pointerover', () => volver.setStyle({ color: '#00ffcc' }));
    volver.on('pointerout', () => volver.setStyle({ color: '#ffffff' }));
    volver.on('pointerdown', () => this.scene.start('MainMenu'));
  }
}
