export default class TerminalModal extends Phaser.Scene {
  constructor() {
    super({ key: 'TerminalModal' });
  }

  preload() {
    this.load.audio('type', 'assets/computer-keyboard-typing-290582.mp3');
  }

create() {
const soundEnabled = true;
const { width, height } = this.sys.game.canvas;

const folders = [
'[1] Fácil',
'[2] Medio',
'[3] Difícil',
'[4] Extremo'
];

const lines = [
'ACCESSING TERMINAL·E INTERFACE...',
'',
'> CATEGORÍAS DISPONIBLES:',
...folders,
'',
'[Pulsa número para continuar]'
];

const container = this.add.container(width / 2 - 250, height / 2 - 140).setDepth(100);
const bg = this.add.rectangle(250, 140, 520, 280, 0x000000, 0.95);
container.add(bg);

const lineHeight = 22;
const fontSize = '16px';
let y = 20;
let currentLine = 0;
let currentChar = 0;
const renderedLines = [];

lines.forEach((_, i) => {
const line = this.add.text(20, y + i * lineHeight, '', {
fontFamily: 'monospace',
fontSize,
color: '#00ff00'
});
container.add(line);
renderedLines.push(line);
});

const cursor = this.add.text(20, y, '_', {
fontFamily: 'monospace',
fontSize,
color: '#00ff00'
});
container.add(cursor);

this.tweens.add({
targets: cursor,
alpha: { from: 1, to: 0 },
duration: 500,
yoyo: true,
repeat: -1
});

const typingSound = this.sound.add('type', { volume: 0.3 });
if (soundEnabled) typingSound.play({ loop: true });

const showQuestionsTerminal = (preguntas, dificultad) => {
container.removeAll(true);
container.add(bg);

const pageSize = 10;
let currentPage = 0;

const renderPage = () => {
container.removeAll(true);
container.add(bg);

const pageQuestions = preguntas.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
const fullLines = [
'',
`> DIFICULTAD: ${dificultad.toUpperCase()} — ${preguntas.length} preguntas`,
'',
'> SELECCIONA UNA PREGUNTA:',
...pageQuestions.map((q, i) => `[${i + 1}] ${q}`),
'',
'[N] Siguiente  [P] Anterior  [ESC] Cancelar'
];

const renderedLines = [];
let yOffset = 20;
let currentLine = 0;
let currentChar = 0;

fullLines.forEach((_, i) => {
const line = this.add.text(20, yOffset + i * lineHeight, '', {
fontFamily: 'monospace',
fontSize,
color: '#00ff00'
});
container.add(line);
renderedLines.push(line);
});

cursor.setVisible(true);
cursor.setPosition(20, yOffset);

if (soundEnabled) typingSound.play({ loop: true });

this.time.addEvent({
delay: 25,
loop: true,
callback: () => {
if (currentLine >= fullLines.length) {
cursor.setVisible(false);
typingSound.stop();

pageQuestions.forEach((q, i) => {
const line = renderedLines[i + 4];
line.setInteractive();
line.on('pointerdown', () => {
this.scene.stop('TerminalModal');
this.scene.resume('OfficeScene');
this.scene.get('OfficeScene').launchQuestion(q);
});
});
return;
}

const fullLine = fullLines[currentLine];
const textObj = renderedLines[currentLine];

if (currentChar < fullLine.length) {
textObj.text += fullLine[currentChar];
currentChar++;
cursor.setPosition(20 + textObj.text.length * 9, yOffset + currentLine * lineHeight);
} else {
currentLine++;
currentChar = 0;
}
}
});
};

this.input.keyboard.once('keydown-N', () => {
if ((currentPage + 1) * pageSize < preguntas.length) {
currentPage++;
renderPage();
}
});

this.input.keyboard.once('keydown-P', () => {
if (currentPage > 0) {
currentPage--;
renderPage();
}
});

this.input.keyboard.once('keydown-ESC', () => {
this.scene.stop('TerminalModal');
this.scene.resume('OfficeScene');
});

renderPage();
};

// Esperar a que termine de escribir para activar teclas
this.time.addEvent({
delay: 25,
loop: true,
callback: () => {
if (currentLine >= lines.length) {
cursor.setVisible(false);
typingSound.stop();

this.input.keyboard.on('keydown', (event) => {
console.log(event.key);
const preguntasPorDificultad = this.registry.get('preguntasPorDificultad');
console.log(preguntasPorDificultad); // Depuración: muestra el objeto de preguntas
const preguntas = preguntasPorDificultad[event.key];
console.log(preguntas);
if (!preguntas || preguntas.length === 0) {
//console.warn(`No hay preguntas para la dificultad: ${event.key}`);
return;
}
showQuestionsTerminal(preguntas, event.key);
});

return;
}

const fullLine = lines[currentLine];
const textObj = renderedLines[currentLine];

if (currentChar < fullLine.length) {
textObj.text += fullLine[currentChar];
currentChar++;
cursor.setPosition(20 + textObj.text.length * 9, y + currentLine * lineHeight);
} else {
currentLine++;
currentChar = 0;
}
}
});
}

}
