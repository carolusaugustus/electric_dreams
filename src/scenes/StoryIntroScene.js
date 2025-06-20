export default class StoryIntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StoryIntroScene' });
  }

  preload() {
    this.load.audio('inGameMusic', 'assets/in_game_audio.m4a');
    this.load.text('preguntasCSV', 'assets/preguntas_voight_kampff_extendido 2.csv');
  }

  create() {
    const { width, height } = this.sys.game.canvas;
    // Carga el CSV de preguntas
    const csvText = this.cache.text.get('preguntasCSV');
    const preguntasPorDificultad = parseCSV(csvText);
    this.registry.set('preguntasPorDificultad', preguntasPorDificultad);

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
    this.time.delayedCall(5000, () => {
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

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');

  const preguntasPorDificultad = {
    '1': [],
    '2': [],
    '3': [],
    '4': []
  };

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    console.log(row); // Depuración: muestra cada fila procesada
    if (!row || row.length < 6) continue; // seguridad básica

    const pregunta = row[1].trim();
    const dificultad = row[5].trim(); // El campo 5 es la dificultad
    console.log(dificultad); // Depuración: muestra la dificultad
    console.log(pregunta)
    if (pregunta && ['1', '2', '3', '4'].includes(dificultad)) {
      preguntasPorDificultad[dificultad].push(pregunta);
    }else {
      console.warn(`Pregunta inválida o dificultad no soportada: ${pregunta} (Dificultad: ${dificultad})`);
    }
  }
  console.log(preguntasPorDificultad); // Depuración: muestra el objeto final
  return preguntasPorDificultad;
}

// Esta función soporta comas entre comillas
function parseCSVRow(row) {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      i++; // saltar comilla duplicada
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

