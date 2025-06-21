export default class TerminalModal extends Phaser.Scene {
  constructor() {
    super({ key: 'TerminalModal' });
    this.bg = null; // Declarar bg aquí para que sea accesible en todo el scope de la clase
    this.cursor = null; // Declarar cursor aquí también
    this.typingSound = null; // Declarar typingSound para poder detenerlo globalmente si es necesario
    this.typingEvent = null; // Para controlar el evento de escritura
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

    // const container = this.add.container(width / 2 - 250, height / 2 - 140).setDepth(100);
    const container = this.add.container(0, 0).setDepth(100);
    // this.bg = this.add.rectangle(250, 140, 520, 280, 0x000000, 0.95);
    this.bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.95);
    container.add(this.bg); // Añadir bg al container

    const lineHeight = 22;
    const fontSize = '16px';
    let y = 20;
    let currentLine = 0;
    let currentChar = 0;
    const renderedLines = [];

    // Llenar renderedLines con objetos de texto vacíos al principio
    lines.forEach((_, i) => {
      const line = this.add.text(20, y + i * lineHeight, '', {
        fontFamily: 'monospace',
        fontSize,
        color: '#00ff00'
      });
      container.add(line);
      renderedLines.push(line);
    });

    this.cursor = this.add.text(20, y, '_', {
      fontFamily: 'monospace',
      fontSize,
      color: '#00ff00'
    });
    container.add(this.cursor);

    this.tweens.add({
      targets: this.cursor,
      alpha: { from: 1, to: 0 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    this.typingSound = this.sound.add('type', { volume: 0.3 });
    if (soundEnabled) this.typingSound.play({ loop: true });

    // Función para manejar el cierre del terminal y la reanudación de la OfficeScene
    const exitTerminal = () => {
      if (this.typingSound && this.typingSound.isPlaying) {
        this.typingSound.stop();
      }
      if (this.typingEvent) {
        this.typingEvent.remove(false);
        this.typingEvent = null;
      }
      // Limpiar todos los listeners de teclado al salir
      this.input.keyboard.removeAllListeners();

      this.scene.stop('TerminalModal'); // Detener solo esta escena
      this.scene.resume('OfficeScene'); // Reanudar la OfficeScene
    };

    const showQuestionsTerminal = (preguntas, dificultad) => {
      // Remover solo los elementos de texto de las preguntas anteriores, NO el fondo ni el cursor.
      // Se eliminan todos los hijos del contenedor excepto el fondo y el cursor.
      container.list.forEach(child => {
        if (child !== this.bg && child !== this.cursor) {
          child.destroy();
        }
      });
      // Asegurarse de que el fondo está en el contenedor y es el primer elemento
      if (!container.list.includes(this.bg)) {
        container.addAt(this.bg, 0);
      }
      // Asegurarse de que el cursor esté en el contenedor
      if (!container.list.includes(this.cursor)) {
        container.add(this.cursor);
      }


      const pageSize = 10;
      let currentPage = 0;

      // Variables para los listeners de teclado específicos de esta vista
      let nKeyListener, pKeyListener, escKeyListener;

      const renderPage = () => {
        // Remover solo los elementos de texto de las preguntas, manteniendo el fondo y el cursor
        container.list.forEach(child => {
          if (child !== this.bg && child !== this.cursor) {
            child.destroy();
          }
        });

        // Asegurarse de que el fondo está en el contenedor y es el primer elemento
        if (!container.list.includes(this.bg)) {
            container.addAt(this.bg, 0);
        }
        // Asegurarse de que el cursor esté en el contenedor y se muestre encima
        if (!container.list.includes(this.cursor)) {
            container.add(this.cursor);
        }
        this.cursor.setVisible(true);
        container.bringToTop(this.cursor);


        const pageQuestions = preguntas.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
        const fullLines = [
          '',
          `> DIFICULTAD: ${dificultad.toUpperCase()} — ${preguntas.length} preguntas`,
          '',
          '> SELECCIONA UNA PREGUNTA:',
          ...pageQuestions.map((q, i) => `[${(currentPage * pageSize) + i + 1}] ${q}`),
          '',
          '[N] Siguiente  [P] Anterior  [ESC] Cancelar'
        ];

        const newRenderedLines = []; // Usar un nuevo array para las líneas de la página actual
        let yOffset = 20;
        let currentRenderLineIndex = 0;
        let currentRenderCharIndex = 0;

        fullLines.forEach((_, i) => {
          const line = this.add.text(20, yOffset + i * lineHeight, '', {
            fontFamily: 'monospace',
            fontSize,
            color: '#00ff00'
          });
          container.add(line);
          newRenderedLines.push(line);
        });

        this.cursor.setPosition(20, yOffset);

        if (soundEnabled && !this.typingSound.isPlaying) {
          this.typingSound.play({ loop: true });
        }

        if (this.typingEvent) {
          this.typingEvent.remove(false);
        }

        this.typingEvent = this.time.addEvent({
          delay: 25,
          loop: true,
          callback: () => {
            if (currentRenderLineIndex >= fullLines.length) {
              this.cursor.setVisible(false);
              this.typingSound.stop();
              this.typingEvent = null; // Limpiar la referencia al evento

              pageQuestions.forEach((q, i) => {
                const line = newRenderedLines[i + 4]; // Ajustar índice para las preguntas
                if (line) { // Asegurarse de que la línea existe
                  line.setInteractive();
                  line.on('pointerdown', () => {
                    exitTerminal();
                    this.scene.get('OfficeScene').launchQuestion(q);
                  });
                }
              });
              return;
            }

            const fullLine = fullLines[currentRenderLineIndex];
            const textObj = newRenderedLines[currentRenderLineIndex];

            if (currentRenderCharIndex < fullLine.length) {
              textObj.text += fullLine[currentRenderCharIndex];
              currentRenderCharIndex++;
              this.cursor.setPosition(20 + textObj.text.length * 9, yOffset + currentRenderLineIndex * lineHeight);
            } else {
              currentRenderLineIndex++;
              currentRenderCharIndex = 0;
            }
          }
        });
      };

      // Limpiar listeners previos de N, P, ESC antes de añadir nuevos para la paginación
      this.input.keyboard.off('keydown-N', nKeyListener);
      this.input.keyboard.off('keydown-P', pKeyListener);
      this.input.keyboard.off('keydown-ESC', escKeyListener);

      nKeyListener = this.input.keyboard.on('keydown-N', () => {
        if ((currentPage + 1) * pageSize < preguntas.length) {
          currentPage++;
          renderPage();
        }
      });

      pKeyListener = this.input.keyboard.on('keydown-P', () => {
        if (currentPage > 0) {
          currentPage--;
          renderPage();
        }
      });

      escKeyListener = this.input.keyboard.on('keydown-ESC', () => {
        exitTerminal();
      });

      renderPage();
    };

    // Almacenar el listener de teclado del menú principal para poder desactivarlo
    let mainKeyListener;

    this.typingEvent = this.time.addEvent({ // Usar this.typingEvent para el evento de typing inicial
      delay: 25,
      loop: true,
      callback: () => {
        if (currentLine >= lines.length) {
          this.cursor.setVisible(false);
          this.typingSound.stop();
          this.typingEvent = null; // Limpiar la referencia al evento cuando termina

          if (!mainKeyListener) {
            mainKeyListener = this.input.keyboard.on('keydown', (event) => {
              const preguntasPorDificultad = this.registry.get('preguntasPorDificultad');
              const preguntas = preguntasPorDificultad ? preguntasPorDificultad[event.key] : null;

              if (preguntas && preguntas.length > 0) {
                this.input.keyboard.off('keydown', mainKeyListener); // Desactivar el listener principal
                showQuestionsTerminal(preguntas, event.key);
              } else if (event.key === 'Escape') { // Permitir salir con ESC desde el menú principal
                 exitTerminal();
              }
            });
          }
          return;
        }

        const fullLine = lines[currentLine];
        const textObj = renderedLines[currentLine];

        if (currentChar < fullLine.length) {
          textObj.text += fullLine[currentChar];
          currentChar++;
          this.cursor.setPosition(20 + textObj.text.length * 9, y + currentLine * lineHeight);
        } else {
          currentLine++;
          currentChar = 0;
        }
      }
    });

    // Pausar la OfficeScene cuando TerminalModal se lanza
    this.events.on('wake', () => {
        this.scene.pause('OfficeScene');
        // Asegurarse de que el modal se inicialice correctamente al ser reanudado/lanzado
        this.container.setVisible(true); // Hacer visible el contenedor principal
        this.bg.setVisible(true); // Hacer visible el fondo
        this.cursor.setVisible(true); // Hacer visible el cursor
        // Reiniciar la secuencia de escritura del menú principal
        this.typingSound.play({ loop: true });
        this.showMainMenu(); // Una nueva función para mostrar el menú principal
    });
  }

  // Nueva función para re-renderizar el menú principal
  showMainMenu() {
    const { width, height } = this.sys.game.canvas;
    const container = this.children.getByName('mainContainer'); // Asumiendo que le pones un nombre al container

    // Si el contenedor no existe, crea uno nuevo (o asegúrate de que exista y lo rellenas)
    if (!container) {
      // Re-crear o re-inicializar el contenedor y sus elementos si es necesario
      // Por simplicidad, aquí asumimos que el container ya existe desde create()
      // y solo necesitamos limpiarlo y rellenarlo con las líneas del menú principal.
    }

    container.list.forEach(child => {
        if (child !== this.bg && child !== this.cursor) {
            child.destroy();
        }
    });

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

    this.cursor.setPosition(20, y);
    this.cursor.setVisible(true);
    container.bringToTop(this.cursor);


    if (this.typingEvent) {
      this.typingEvent.remove(false);
    }

    // Reestablecer los listeners del teclado del menú principal
    this.input.keyboard.removeAllListeners(); // Eliminar todos los listeners anteriores para evitar duplicados
    let mainKeyListener = this.input.keyboard.on('keydown', (event) => {
        const preguntasPorDificultad = this.registry.get('preguntasPorDificultad');
        const preguntas = preguntasPorDificultad ? preguntasPorDificultad[event.key] : null;

        if (preguntas && preguntas.length > 0) {
            this.input.keyboard.off('keydown', mainKeyListener);
            this.typingSound.stop(); // Detener el sonido de typing al cambiar de vista
            this.typingEvent.remove(false); // Detener el evento de typing
            this.typingEvent = null;
            this.cursor.setVisible(false); // Ocultar cursor
            showQuestionsTerminal(preguntas, event.key);
        } else if (event.key === 'Escape') {
            this.typingSound.stop();
            this.typingEvent.remove(false);
            this.typingEvent = null;
            this.cursor.setVisible(false);
            this.scene.stop('TerminalModal');
            this.scene.resume('OfficeScene');
        }
    });


    this.typingEvent = this.time.addEvent({
      delay: 25,
      loop: true,
      callback: () => {
        if (currentLine >= lines.length) {
          this.cursor.setVisible(false);
          this.typingSound.stop();
          this.typingEvent = null;
          return;
        }

        const fullLine = lines[currentLine];
        const textObj = renderedLines[currentLine];

        if (currentChar < fullLine.length) {
          textObj.text += fullLine[currentChar];
          currentChar++;
          this.cursor.setPosition(20 + textObj.text.length * 9, y + currentLine * lineHeight);
        } else {
          currentLine++;
          currentChar = 0;
        }
      }
    });
  }
}