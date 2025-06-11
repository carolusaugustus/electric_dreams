export default class OfficeScene extends Phaser.Scene {
  constructor() {
    super('OfficeScene');
  }

  preload() {
    // Fondos y elementos visuales
    this.load.image('city', 'assets/city.png');
    this.load.image('office', 'assets/office.png');
    this.load.image('rain', 'assets/rain_trace.png');
    this.load.image('subject', 'assets/profiles/others/neutral_sit_1.png');
    //this.load.image('hud_data', 'assets/HUD_Data_v2.png');
    //this.load.image('hud_questions', 'assets/HUD_Questions.png');

    // Audio
    this.load.audio('in_game_music', 'assets/in_game_audio.m4a');
  }

  create() {
    const { width, height } = this.sys.game.canvas;

    // FONDO
    // this.add.image(width / 2, height / 2, 'city').setDepth(0);
    // this.add.image(width / 2, height / 2, 'office').setDepth(1);

    // LLUVIA
    // this.rain = this.add.tileSprite(width / 2, height / 2, width, height, 'rain');
    // this.rain.setDepth(2);
    // this.rain.setScrollFactor(0);

    this.city = this.add.image(0, 0, 'city')
    .setOrigin(0)
    .setDisplaySize(width * 0.85, height * 0.85)
    .setDepth(0);

    this.rain = this.add.tileSprite(0, 0, width, height, 'rain')
      .setOrigin(0)
      .setAlpha(0.25)
      .setDepth(1);

    this.office = this.add.image(0, 0, 'office')
      .setOrigin(0)
      .setDisplaySize(width, height)
      .setDepth(2);

    // SUJETO ENTREVISTADO
    this.subject = this.add.image(width / 2 + 30, height / 2 + 78, 'subject')
      .setScale(0.25);
    
    this.subject.setDepth(3);

    // HUDs
    // this.add.image(180, 140, 'hud_data').setOrigin(0, 0).setDepth(4).setScale(0.85);
    // this.add.image(width / 2, height - 140, 'hud_questions').setDepth(4).setScale(0.95);

    // MÚSICA
    // this.music = this.sound.add('in_game_music', {
    //   loop: true,
    //   volume: 0.4
    // });
    // this.music.play();

    // EFECTO LLUVIA
    this.rainSpeed = 0.5;

    // Placeholder de texto (para más adelante)
    // this.questionText = this.add.text(width / 2, height - 180, '', {
    //   fontFamily: 'monospace',
    //   fontSize: '16px',
    //   color: '#00ffcc'
    // }).setOrigin(0.5).setDepth(5);
  }

  update() {
    // Scroll vertical de lluvia
    this.rain.tilePositionY -= this.rainSpeed;
  }
}
