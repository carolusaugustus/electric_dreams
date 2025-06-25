export default class OfficeScene extends Phaser.Scene {
  constructor() {
    super('OfficeScene');
  }

  preload() {
    // Fondos y elementos visuales
    this.load.image('city', 'assets/city.png');
    this.load.image('office', 'assets/office.png');
    this.load.image('subject', 'assets/profiles/others/neutral_sit_1.png');
    this.load.image('rain1', '/assets/rain_drop_sprite_1.png');
    this.load.image('rain2', '/assets/rain_drop_sprite_2.png');
    this.load.image('rain3', '/assets/rain_drop_sprite_3.png');
    this.load.image('rain_trace', '/assets/rain_trace.png');
    this.load.image('hud_data', '/assets/HUD_Data_v2.png');
    this.load.image('hud_questions', 'assets/HUD_Questions.png');
    this.load.image('btn_questions', 'assets/questions_button.png');

    // Audio
    this.load.audio('in_game_music', 'assets/in_game_audio.m4a');
    // Loading blink sprites
    for (let i = 1; i <= 7; i++) {
      this.load.image(`eye_frame_${i}`, `assets/blink_${i}.png`);
    }
  }

  create() {
    const { width, height } = this.sys.game.canvas;

    this.questionTexts = [];

    // FONDO CIUDAD
    this.city = this.add.image(0, 0, 'city')
    .setOrigin(0)
    .setDisplaySize(width * 0.85, height * 0.85)
    .setDepth(0);

    // OFICINA
    this.office = this.add.image(0, 0, 'office')
      .setOrigin(0)
      .setDisplaySize(width, height)
      .setDepth(2);

    // SUJETO ENTREVISTADO
    this.subject = this.add.image(width / 2 + 30, height / 2 + 78, 'subject')
      .setScale(0.25);
    
    this.subject.setDepth(3);

    // HUDs
    // this.subjectHUD = this.add.image(20, 140, 'hud_data')
    //   .setOrigin(0, 0)
    //   .setDepth(10)
    //   .setScale(0.25);

    // Datos ficticios de prueba (puedes reemplazar con carga dinámica)
    // this.subjectInfoText = this.add.text(40, 160,
    //   `Nombre:\nMaria Volk\n\nEdad:\n34\n\nSexo:\nMujer\n\nOrigen:\nTitan\n\nOcupación:\nXenobióloga`,
    //   {
    //     fontFamily: 'monospace',
    //     fontSize: '15px',
    //     color: '#00ffcc',
    //     lineSpacing: 6
    //   })
    //   .setDepth(11);
    //this.add.image(width / 2, height - 140, 'hud_questions').setDepth(4).setScale(0.95);

    // MÚSICA
    this.music = this.sound.add('in_game_music', {
      loop: true,
      volume: 0.4
    });
    this.music.play();

    //MENU PREGUNTAS
    // Botón de Preguntas
    this.questionsButton = this.add.image(width - 30, 50, 'btn_questions')
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(10)
      .setScale(0.3);

    this.questionsButton.on('pointerdown', () => {
      this.scene.pause();
      this.scene.launch('TerminalModal');
    });

    // this.questionsButton.on('pointerdown', () => {
    //   this.toggleQuestionPanel();
    // });

    // Paso 3: Panel de preguntas (inicialmente oculto)
    this.questionPanel = this.add.image(width / 2 + 250, height / 2, 'hud_questions')
      .setOrigin(0.5)
      .setScale(0.35)
      .setDepth(6)
      .setVisible(false); // se muestra con el botón

    // Lista de preguntas dummy (se puede cargar dinámicamente después)
    this.questionsList = [
      { id: 'empathy_1', text: '¿Qué sientes al ver a un niño llorando por un robot roto?', folder: 'Empatía' },
      { id: 'violence_2', text: '¿Qué harías si ves a alguien golpear a un perro?', folder: 'Violencia' },
      // ...
    ];

    // this.questionGroup = this.add.container(20,140, this.questionPanel);
    this.questionGroup = this.add.container(20, 140); // arreglo aquí
    this.questionGroup.add(this.questionPanel);

    this.questionsList.forEach((q, idx) => {
      const text = this.add.text(width / 2 + 180, 160 + idx * 30, q.text, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#00ffcc',
        backgroundColor: '#111111'
      })
      .setInteractive({ useHandCursor: true })
      .setVisible(false)
      .setDepth(7)
      .on('pointerdown', () => this.askQuestion(q));

      this.questionGroup.add(text);
    });
    
    this.questionGroup.setVisible(false);
    this.questionGroup.setScale(0.40);
    this.questionGroup.setDepth(10);

    // Función para mostrar u ocultar panel
    this.toggleQuestionPanel = () => {
      const visible = !this.questionGroup.visible;
      this.questionGroup.setVisible(visible);
    };

    this.showQuestionsByDifficulty = (level) => {
      this.toggleQuestionPanel(true); // muestra directamente las preguntas

      const questions = getQuestionsByLevel(level);
      this.questionsList = questions;
      this.questionTexts = [];

      this.questionTexts.forEach(t => t.destroy());
      this.questionTexts = [];

      this.questionsList.forEach((q, idx) => {
        const text = this.add.text(width / 2 + 180, 160 + idx * 30, q.text, {
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#00ffcc',
          backgroundColor: '#111111'
        })
          .setInteractive({ useHandCursor: true })
          .setVisible(true)
          .setDepth(7)
          .on('pointerdown', () => this.askQuestion(q));

        this.questionTexts.push(text);
      });
    };

    function getQuestionsByLevel(level) {
      if (level === 1) {
        return [
          { id: 'easy_1', text: '¿Qué sientes al ver un animal herido?', folder: 'Fácil' },
          { id: 'easy_2', text: '¿Por qué ayudan los humanos a otros humanos?' }
        ];
      } else if (level === 2) {
        return [
          { id: 'med_1', text: 'Va por el desierto y ve una tortuga boca arriba. ¿Qué hace?' },
          { id: 'med_2', text: 'Abre una revista y aparece una mujer desnuda. ¿Qué siente?' }
        ];
      }
      // Añadir más
      return [];
    }

    this.askQuestion = (questionObj) => {
      // Mostrar la pregunta en el HUD
      if (!this.questionText) {
        this.questionText = this.add.text(width / 2, height - 180, '', {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#00ffcc'
        }).setOrigin(0.5).setDepth(8);
      }

      this.questionText.setText(questionObj.text);
      this.questionText.setVisible(true);

      // Simular espera y respuesta fisiológica (latidos + parpadeo)
      this.time.delayedCall(1500, () => {
        this.showPhysiologicalResponse();
      });
    };

    // Simular respuesta fisiológica
    this.showPhysiologicalResponse = () => {
      // Ejemplo básico: puedes hacer una animación más elaborada aquí
      if (!this.heartRateText) {
        this.heartRateText = this.add.text(width - 180, height - 100, '', {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#ff0000'
        }).setDepth(9);
      }

      const bpm = Phaser.Math.Between(72, 120); // número simulado
      this.heartRateText.setText(`Pulso: ${bpm} bpm`);
      this.heartRateText.setVisible(true);

      // Añade aquí animación de parpadeo en el ojo del sujeto si lo implementas
    };

    // EFECTO LLUVIA
    // const particles = this.add.particles(0, 100, 'rain_trace', {
    //     x: { min: 100, max: 700 },
    //     lifespan: 2000,
    //     speedY: { min: 200, max: 400 },
    //     scale: { start: 0.5, end: 0.1 },
    //     gravityY: 200,
    //     blendMode: 'ADD',
    //     frequency: 20
    // });
    // Lluvia tras la oficina (fina)
    const rainBack = this.add.particles(0, 100,'rain1', {
         x: { min: 0, max: width },
        lifespan: 2000,
        speedY: { min: 200, max: 400 },
        scale: { start: 0.5, end: 0.1 },
        gravityY: 200,
        blendMode: 'NORMAL',
        quantity: 10,
        frequency: 20
        // x: { min: 0, max: config.width },
        // y: 0,
        // lifespan: 2000,
        // speedY: { min: 100, max: 200 },
        // scale: { start: 0.3, end: 0 },
        // quantity: 10,
        // blendMode: 'NORMAL',
        , depth: 2
    });

    // Lluvia media
    const rainMid = this.add.particles(0, 100,'rain2',{
         x: { min: 0, max: width },
        lifespan: 2000,
        speedY: { min: 200, max: 400 },
        scale: { start: 0.5, end: 0.1 },
        gravityY: 200,
        blendMode: 'ADD',
        quantity: 2,
        frequency: 20
        // x: { min: 0, max: config.width },
        // y: 0,
        // lifespan: 1500,
        // speedY: { min: 250, max: 400 },
        // scale: { start: 0.35, end: 0 },
        // quantity: 2,
        // blendMode: 'ADD',
        ,depth: 3
    });

    // Lluvia intensa cercana
    const rainFront = this.add.particles(0, 100,'rain3',{
         x: { min: 0, width },
        lifespan: 2000,
        speedY: { min: 200, max: 400 },
        scale: { start: 0.5, end: 0.1 },
        gravityY: 200,
        blendMode: 'ADD',
        quantity: 3,
        frequency: 20
        // x: { min: 0, max: config.width },
        // y: 0,
        // lifespan: 1000,
        // speedY: { min: 350, max: 600 },
        // scale: { start: 0.5, end: 0 },
        // quantity: 3,
        // blendMode: 'ADD',
        ,depth: 4
    });

    // Salpicaduras en la parte inferior de la pantalla
    const splashY = height - 320; // Ajusta según necesites

    const rainSplashes = this.add.particles(0, splashY, 'rain_trace', {
      x: { min: 0, max: width },
      lifespan: 500,
      speedY: { min: -50, max: -100 },
      scale: { start: 0.3, end: 0 },
      quantity: 2,
      blendMode: 'ADD',
      frequency: 200
    });

    // Ajustar profundidad de capas para el orden correcto
    this.city.setDepth(0);
    rainBack.setDepth(1);
    rainMid.setDepth(2);
    rainFront.setDepth(3);
    rainSplashes.setDepth(4);
    this.office.setDepth(5);
    this.subject.setDepth(6);

    // Placeholder de texto (para más adelante)
    // this.questionText = this.add.text(width / 2, height - 180, '', {
    //   fontFamily: 'monospace',
    //   fontSize: '16px',
    //   color: '#00ffcc'
    // }).setOrigin(0.5).setDepth(5);

    //Blinking setup
    // this.eyeSprite = this.add.image(400, 190, 'eye_frame_1') // posición inicial
    //   .setScale(150 / 128) // Escalado a ~150px suponiendo sprites de 128px
    //   .setAngle(10) // rotación a la derecha
    //   .setVisible(false) // oculto por defecto
    //   .setOrigin(0.5, 0.5) // centrado
    //   .setDepth(100);
    this.eyeSprite = this.add.image(380, 490, 'eye_frame_1')
      .setScale(.12) // ≈1.17x escalado
      .setAngle(-10) // girado a la derecha
      .setVisible(false)
      .setOrigin(0.5, 0.5)
      .setDepth(100);
  }

  launchQuestion(question) {
    console.log(question);
    // this.blinkEye();
    this.startEyeBlinking();
  }

  update() {
    // Lluvia ahora gestionada por partículas, no es necesario hacer scroll.
  }

  blinkEye() {
    const blinkFrames = ['eye_frame_1', 'eye_frame_2', 'eye_frame_3', 'eye_frame_4', 'eye_frame_5', 'eye_frame_3', 'eye_frame_1'];
    let i = 0;

    this.eyeSprite.setVisible(true);

    this.time.addEvent({
      delay: 50,
      repeat: blinkFrames.length - 1,
      callback: () => {
        this.eyeSprite.setTexture(blinkFrames[i]);
        i++;
        if (i === blinkFrames.length) {
          this.eyeSprite.setVisible(false); // ocultar al final
        }
      }
    });
  }

  startEyeBlinking() {
    if (!this.eyeSprite) return;

    this.eyeSprite.setVisible(true);

    const blinkFrames = [
      'eye_frame_1', 'eye_frame_2', 'eye_frame_3', 'eye_frame_4',
      'eye_frame_5', 'eye_frame_3', 'eye_frame_1'
    ];

    let frameIndex = 0;

    // Guardamos el evento para poder cancelarlo más tarde
    this.blinkTimer = this.time.addEvent({
      delay: 100, // cada frame del parpadeo
      loop: true,
      callback: () => {
        this.eyeSprite.setTexture(blinkFrames[frameIndex]);
        frameIndex++;
        if (frameIndex >= blinkFrames.length) {
          frameIndex = 0;

          // Espera aleatoria entre parpadeos
          this.time.delayedCall(Phaser.Math.Between(2000, 5000), () => {
            frameIndex = 0;
          });
          this.blinkTimer.paused = true;
          this.time.delayedCall(Phaser.Math.Between(2000, 4000), () => {
            this.blinkTimer.paused = false;
          });
        }
      }
    });
  }

}
