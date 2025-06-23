// TerminalConfig.js - Configuración centralizada
export const TERMINAL_CONFIG = {
  TYPING_DELAY: 25,
  FAST_TYPING_DELAY: 5,
  LINE_HEIGHT: 22,
  FONT_SIZE: '24px',
  FONT_FAMILY: 'monospace',
  COLOR: '#00ff00',
  BACKGROUND_COLOR: 0x000000,
  BACKGROUND_ALPHA: 0.95,
  SOUND_VOLUME: 0.3,
  PAGE_SIZE: 10,
  CURSOR_BLINK_DURATION: 500,
  TEXT_PADDING: 20,
  CHAR_WIDTH: 9
};

export const MENU_DATA = {
  CATEGORIES: [
    { key: '1', label: '[1] Fácil', difficulty: '1' },
    { key: '2', label: '[2] Medio', difficulty: '2' },
    { key: '3', label: '[3] Difícil', difficulty: '3' },
    { key: '4', label: '[4] Extremo', difficulty: '4' }
  ],
  MAIN_MENU_LINES: [
    'ACCESSING TERMINAL·E INTERFACE...',
    '',
    '> CATEGORÍAS DISPONIBLES:',
    '[1] Fácil',
    '[2] Medio',
    '[3] Difícil',
    '[4] Extremo',
    '',
    '[Pulsa número para continuar]'
  ]
};

// TerminalRenderer.js - Manejo de renderizado
export class TerminalRenderer {
  constructor(scene, container, fontFamily) {
    this.fontFamily = fontFamily;
    this.scene = scene;
    this.container = container;
    this.config = TERMINAL_CONFIG;
  }

  createTextLine(text, x, y, addToContainer = true) {
    const textObj = this.scene.add.text(x, y, text, {
      // fontFamily: this.config.FONT_FAMILY,
      fontFamily: this.fontFamily,
      fontSize: this.config.FONT_SIZE,
      color: this.config.COLOR
    });
    
    if (addToContainer) {
      this.container.add(textObj);
    }
    
    return textObj;
  }

  createCursor(x, y) {
    const cursor = this.createTextLine('_', x, y);
    
    this.scene.tweens.add({
      targets: cursor,
      alpha: { from: 1, to: 0 },
      duration: this.config.CURSOR_BLINK_DURATION,
      yoyo: true,
      repeat: -1
    });
    
    return cursor;
  }

  clearContent(keepElements = []) {
    this.container.list.forEach(child => {
      if (!keepElements.includes(child)) {
        child.destroy();
      }
    });
  }

  updateCursorPosition(textObj, lineIndex) {
    const x = this.config.TEXT_PADDING + textObj.text.length * this.config.CHAR_WIDTH;
    const y = this.config.TEXT_PADDING + lineIndex * this.config.LINE_HEIGHT;
    return { x, y };
  }
}

// TerminalTypingEffect.js - Efecto de escritura
export class TerminalTypingEffect {
  constructor(scene, renderer, soundManager) {
    this.scene = scene;
    this.renderer = renderer;
    this.soundManager = soundManager;
    this.typingEvent = null;
    this.isTyping = false;
  }

  typeLines(lines, cursor, onComplete, delay = TERMINAL_CONFIG.TYPING_DELAY) {
    if (this.isTyping) {
      this.stop();
    }

    let currentLine = 0;
    let currentChar = 0;
    const renderedLines = [];

    // Crear líneas vacías
    lines.forEach((_, i) => {
      const y = TERMINAL_CONFIG.TEXT_PADDING + i * TERMINAL_CONFIG.LINE_HEIGHT;
      const line = this.renderer.createTextLine('', TERMINAL_CONFIG.TEXT_PADDING, y);
      renderedLines.push(line);
    });

    cursor.setPosition(TERMINAL_CONFIG.TEXT_PADDING, TERMINAL_CONFIG.TEXT_PADDING);
    cursor.setVisible(true);
    
    this.soundManager.startTyping();
    this.isTyping = true;

    this.typingEvent = this.scene.time.addEvent({
      delay,
      loop: true,
      callback: () => {
        if (currentLine >= lines.length) {
          this.complete(cursor, onComplete);
          return;
        }

        const fullLine = lines[currentLine];
        const textObj = renderedLines[currentLine];

        if (currentChar < fullLine.length) {
          textObj.text += fullLine[currentChar];
          currentChar++;
          const cursorPos = this.renderer.updateCursorPosition(textObj, currentLine);
          cursor.setPosition(cursorPos.x, cursorPos.y);
        } else {
          currentLine++;
          currentChar = 0;
        }
      }
    });

    return renderedLines;
  }

  complete(cursor, onComplete) {
    cursor.setVisible(false);
    this.soundManager.stopTyping();
    this.stop();
    if (onComplete) onComplete();
  }

  stop() {
    if (this.typingEvent) {
      this.typingEvent.remove(false);
      this.typingEvent = null;
    }
    this.isTyping = false;
  }
}

// TerminalSoundManager.js - Manejo de sonidos
export class TerminalSoundManager {
  constructor(scene) {
    this.scene = scene;
    this.typingSound = null;
    this.soundEnabled = true;
  }

  preload() {
    this.scene.load.audio('type', 'assets/computer-keyboard-typing-290582.mp3');
  }

  init() {
    this.typingSound = this.scene.sound.add('type', { 
      volume: TERMINAL_CONFIG.SOUND_VOLUME 
    });
  }

  startTyping() {
    if (this.soundEnabled && this.typingSound && !this.typingSound.isPlaying) {
      this.typingSound.play({ loop: true });
    }
  }

  stopTyping() {
    if (this.typingSound && this.typingSound.isPlaying) {
      this.typingSound.stop();
    }
  }

  destroy() {
    this.stopTyping();
  }
}

// TerminalKeyboardHandler.js - Manejo de teclado
export class TerminalKeyboardHandler {
  constructor(scene) {
    this.scene = scene;
    this.listeners = new Map();
  }

  addListener(key, callback, context = null) {
    this.removeListener(key);
    const listener = this.scene.input.keyboard.on(`keydown-${key}`, callback, context);
    this.listeners.set(key, listener);
    return listener;
  }

  addGeneralListener(callback, context = null) {
    this.removeGeneralListener();
    const listener = this.scene.input.keyboard.on('keydown', callback, context);
    this.listeners.set('general', listener);
    return listener;
  }

  removeListener(key) {
    if (this.listeners.has(key)) {
      this.scene.input.keyboard.off(`keydown-${key}`, this.listeners.get(key));
      this.listeners.delete(key);
    }
  }

  removeGeneralListener() {
    if (this.listeners.has('general')) {
      this.scene.input.keyboard.off('keydown', this.listeners.get('general'));
      this.listeners.delete('general');
    }
  }

  removeAllListeners() {
    this.listeners.forEach((listener, key) => {
      if (key === 'general') {
        this.scene.input.keyboard.off('keydown', listener);
      } else {
        this.scene.input.keyboard.off(`keydown-${key}`, listener);
      }
    });
    this.listeners.clear();
  }
}

// TerminalState.js - Estados del terminal
export class TerminalState {
  constructor() {
    this.currentState = 'MAIN_MENU';
    this.currentPage = 0;
    this.currentQuestions = [];
    this.currentDifficulty = '';
  }

  setState(state, data = {}) {
    this.currentState = state;
    Object.assign(this, data);
  }

  isMainMenu() {
    return this.currentState === 'MAIN_MENU';
  }

  isQuestionList() {
    return this.currentState === 'QUESTION_LIST';
  }
}

// TerminalModal.js - Clase principal refactorizada
export default class TerminalModal extends Phaser.Scene {
  constructor() {
    super({ key: 'TerminalModal' });
    this.initializeComponents();
  }

  initializeComponents() {
    this.bg = null;
    this.cursor = null;
    this.container = null;
    this.renderer = null;
    this.typingEffect = null;
    this.soundManager = null;
    this.keyboardHandler = null;
    this.state = new TerminalState();
  }

  preload() {
    this.soundManager = new TerminalSoundManager(this);
    this.soundManager.preload();
  }

  create() {
    this.setupScene();
    this.showMainMenu();
    this.setupSceneEvents();
  }

  setupScene() {
    const { width, height } = this.sys.game.canvas;
    
    // Crear contenedor principal
    this.container = this.add.container(0, 0).setDepth(100);
    
    // Crear fondo
    this.bg = this.add.rectangle(width / 2, height / 2, width, height, 
      TERMINAL_CONFIG.BACKGROUND_COLOR, TERMINAL_CONFIG.BACKGROUND_ALPHA);
    this.container.add(this.bg);
    
    // Inicializar componentes
    this.renderer = new TerminalRenderer(this, this.container, this.sys.game.registry.get('retroFontFamily'));
    this.soundManager.init();
    this.typingEffect = new TerminalTypingEffect(this, this.renderer, this.soundManager);
    this.keyboardHandler = new TerminalKeyboardHandler(this);
    
    // Crear cursor
    this.cursor = this.renderer.createCursor(TERMINAL_CONFIG.TEXT_PADDING, TERMINAL_CONFIG.TEXT_PADDING);
  }

  showMainMenu() {
    this.state.setState('MAIN_MENU');
    this.renderer.clearContent([this.bg, this.cursor]);
    
    this.typingEffect.typeLines(
      MENU_DATA.MAIN_MENU_LINES,
      this.cursor,
      () => this.setupMainMenuInput()
    );
  }

  setupMainMenuInput() {
    // Configurar listeners de teclado para opciones 1-4
    ['1', '2', '3', '4'].forEach(key => {
      this.keyboardHandler.addListener(key, () => {
        this.selectMainMenuOption(key);
      });
    });

    // Listener para ESC
    this.keyboardHandler.addListener('ESC', () => {
      this.exitTerminal();
    });

    // Hacer las opciones clicables
    this.makeMainMenuOptionsClickable();
  }

  selectMainMenuOption(selectedKey) {
    const preguntasPorDificultad = this.registry.get('preguntasPorDificultad');
    const preguntas = preguntasPorDificultad?.[selectedKey];

    if (preguntas?.length > 0) {
      const difficultyNames = { '1': 'Fácil', '2': 'Medio', '3': 'Difícil', '4': 'Extremo' };
      this.showQuestionsMenu(preguntas, difficultyNames[selectedKey] || selectedKey);
    }
  }

  makeMainMenuOptionsClickable() {
    // Buscar las líneas que contienen las opciones del menú (índices 3-6 en MAIN_MENU_LINES)
    const optionIndices = [3, 4, 5, 6]; // [1] Fácil, [2] Medio, [3] Difícil, [4] Extremo
    
    this.container.list.forEach((child, index) => {
      if (child.type === 'Text' && optionIndices.includes(index - 2)) { // Ajustar por bg y cursor
        const optionNumber = (index - 2 - 2).toString(); // Calcular número de opción (1-4)
        if (['1', '2', '3', '4'].includes(optionNumber)) {
          child.setInteractive();
          child.on('pointerdown', () => {
            this.selectMainMenuOption(optionNumber);
          });
          // Agregar efecto hover
          child.on('pointerover', () => {
            child.setTint(0x00aa00);
          });
          child.on('pointerout', () => {
            child.clearTint();
          });
        }
      }
    });
  }

  showQuestionsMenu(preguntas, difficulty) {
    this.state.setState('QUESTION_LIST', {
      currentQuestions: preguntas,
      currentDifficulty: difficulty,
      currentPage: 0
    });
    
    // Limpiar listeners del menú principal antes de mostrar preguntas
    this.keyboardHandler.removeAllListeners();
    
    this.renderQuestionsPage();
  }

  renderQuestionsPage() {
    const { currentQuestions, currentDifficulty, currentPage } = this.state;
    const startIndex = currentPage * TERMINAL_CONFIG.PAGE_SIZE;
    const endIndex = Math.min(startIndex + TERMINAL_CONFIG.PAGE_SIZE, currentQuestions.length);
    const pageQuestions = currentQuestions.slice(startIndex, endIndex);
    
    const lines = this.buildQuestionsLines(pageQuestions, currentDifficulty, currentQuestions.length);
    
    this.renderer.clearContent([this.bg, this.cursor]);
    
    // Importante: limpiar listeners anteriores antes de renderizar nueva página
    this.keyboardHandler.removeAllListeners();
    
    const renderedLines = this.typingEffect.typeLines(
      lines,
      this.cursor,
      () => {
        this.makeQuestionsInteractive(pageQuestions, renderedLines);
        this.setupQuestionsInput(); // Configurar input después de completar el typing
      },
      TERMINAL_CONFIG.FAST_TYPING_DELAY
    );
  }

  buildQuestionsLines(pageQuestions, difficulty, totalQuestions) {
    const { currentPage } = this.state;
    const startNumber = currentPage * TERMINAL_CONFIG.PAGE_SIZE + 1;
    
    const navigationInfo = [];
    if (this.canGoToPreviousPage() || this.canGoToNextPage()) {
      const navOptions = [];
      if (this.canGoToNextPage()) navOptions.push('[N] Siguiente');
      if (this.canGoToPreviousPage()) navOptions.push('[P] Anterior');
      navOptions.push('[ESC] Menú Principal');
      navigationInfo.push(navOptions.join('  '));
    } else {
      navigationInfo.push('[ESC] Menú Principal');
    }
    
    return [
      '',
      `> DIFICULTAD: ${difficulty.toUpperCase()} — ${totalQuestions} preguntas`,
      '',
      '> SELECCIONA UNA PREGUNTA:',
      ...pageQuestions.map((q, i) => `[${startNumber + i}] ${q.pregunta}`),
      '',
      ...navigationInfo
    ];
  }

  makeQuestionsInteractive(pageQuestions, renderedLines) {
    const questionStartIndex = 4; // Índice donde empiezan las preguntas en las líneas
    
    pageQuestions.forEach((question, i) => {
      const line = renderedLines[questionStartIndex + i];
      if (line) {
        line.setInteractive();
        line.on('pointerdown', () => {
          this.exitTerminal();
          this.scene.get('OfficeScene').launchQuestion(question);
        });
        // Agregar efecto hover para las preguntas
        line.on('pointerover', () => {
          line.setTint(0x00aa00);
        });
        line.on('pointerout', () => {
          line.clearTint();
        });
      }
    });
  }

  setupQuestionsInput() {
    // Configurar navegación por páginas
    this.keyboardHandler.addListener('N', () => {
      if (this.canGoToNextPage()) {
        this.state.currentPage++;
        this.renderQuestionsPage();
      }
    });
    
    this.keyboardHandler.addListener('P', () => {
      if (this.canGoToPreviousPage()) {
        this.state.currentPage--;
        this.renderQuestionsPage();
      }
    });
    
    // Permitir regresar al menú principal con ESC
    this.keyboardHandler.addListener('ESC', () => {
      this.showMainMenu();
    });

    // También permitir selección numérica de preguntas
    const { currentQuestions, currentPage } = this.state;
    const startIndex = currentPage * TERMINAL_CONFIG.PAGE_SIZE;
    const pageQuestions = currentQuestions.slice(startIndex, startIndex + TERMINAL_CONFIG.PAGE_SIZE);
    
    pageQuestions.forEach((question, i) => {
      const questionNumber = (i + 1).toString();
      this.keyboardHandler.addListener(questionNumber, () => {
        this.exitTerminal();
        this.scene.get('OfficeScene').launchQuestion(question);
      });
    });
  }

  canGoToNextPage() {
    const { currentPage, currentQuestions } = this.state;
    return (currentPage + 1) * TERMINAL_CONFIG.PAGE_SIZE < currentQuestions.length;
  }

  canGoToPreviousPage() {
    return this.state.currentPage > 0;
  }

  setupSceneEvents() {
    this.events.on('wake', () => {
      this.scene.pause('OfficeScene');
      this.showMainMenu();
    });
  }

  exitTerminal() {
    this.cleanup();
    this.scene.stop('TerminalModal');
    this.scene.resume('OfficeScene');
  }

  cleanup() {
    this.typingEffect?.stop();
    this.soundManager?.destroy();
    this.keyboardHandler?.removeAllListeners();
  }

  // Método para facilitar testing y debugging
  getCurrentState() {
    return {
      state: this.state.currentState,
      page: this.state.currentPage,
      questionsCount: this.state.currentQuestions.length,
      difficulty: this.state.currentDifficulty
    };
  }
}