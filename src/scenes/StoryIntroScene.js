export default class StoryIntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StoryIntroScene' });
  }

  preload() {
    this.load.audio('inGameMusic', 'assets/audio/in_game_audio.m4a');
  }

  create() {
    const { width, height } = this.sys.game.canvas;

    // Fondo negro
    this.cameras.main.setBackgroundColor('#000');

    // Texto principal (narrativa)
    const storyText = `
Me han seleccionado para un nuevo puesto de trabajo.
Tendré que realizar test de ‘humanidad’ a los pasajeros
que entran o salen de este maldito planeta.

Dicen que algunos de ellos ya no son lo que parecen.
Replicantes. Imitadores. Monstruos sin alma...
Y mi trabajo es descubrirlos.
    `;

    this.add.text(width / 2, height / 2 - 100, storyText, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#00ffcc',
      align: 'center',
      wordWrap: { width: width - 200 }
    }).setOrigin(0.5);

    // Texto de continuar (oculto al inicio)
    const continueText = this.add.text(width / 2, height - 80, 'Pulsa cualquier tecla para continuar', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
    continueText.setAlpha(0); // invisible al principio

    // Mostrar texto de continuar tras 10s
    this.time.delayedCall(10000, () => {
      this.tweens.add({
        targets: continueText,
        alpha: 1,
        duration: 1000,
        ease: 'Power2',
        yoyo: true,
        repeat: -1
      });
    });

    // Música de fondo
    this.inGameMusic = this.sound.add('inGameMusic', { volume: 0.5, loop: true });
    this.inGameMusic.play();

    // Captura cualquier tecla para continuar
    this.input.keyboard.once('keydown', () => {
      this.inGameMusic.stop();
      this.scene.start('OfficeScene');
    });
  }
}