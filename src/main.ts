import { Application } from 'pixi.js';
import { SceneManager } from './core/SceneManager';
import { StartScene } from './scenes/StartScene';
import { Layout } from './config/Layout';
import './styles/main.css';

class Game {
  private app: Application;
  private sceneManager: SceneManager;

  constructor() {
    this.app = new Application();
    this.sceneManager = new SceneManager(this.app);
  }

  async initialize(): Promise<void> {
    try {
      const layout = Layout.getInstance();
      
      // Initialize PIXI Application with responsive dimensions
      await this.app.init({
        width: layout.screenWidth,
        height: layout.screenHeight,
        backgroundColor: 0x1a1a2e,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      // Add canvas to DOM
      const gameContainer = document.getElementById('gameContainer');
      if (gameContainer) {
        gameContainer.appendChild(this.app.canvas);
      } else {
        document.body.appendChild(this.app.canvas);
      }

      // Setup resize handling
      this.setupResizeHandler(layout);

      // Setup keyboard controls
      this.setupKeyboardControls();

      // Setup the update loop now that app is initialized
      this.sceneManager.setupUpdateLoop();

      // Attach scene manager to app for easy access
      (this.app as any).sceneManager = this.sceneManager;

      // Start with the initial scene
      await this.sceneManager.switchTo(StartScene);

      console.log('🏢 Interactive Credits initialized! Welcome to the Workshop!');
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  }

  private setupResizeHandler(layout: Layout): void {
    layout.onResize((dimensions) => {
      // Resize the PIXI application
      this.app.renderer.resize(dimensions.screenWidth, dimensions.screenHeight);
      
      // Notify current scene about resize
      const currentScene = this.sceneManager.getCurrentScene();
      if (currentScene && (currentScene as any).onResize) {
        (currentScene as any).onResize(dimensions);
      }
    });
  }

  private setupKeyboardControls(): void {
    // Global keyboard event handlers
    document.addEventListener('keydown', (event) => {
      this.sceneManager.handleKeyDown(event.code);
    });

    document.addEventListener('keyup', (event) => {
      this.sceneManager.handleKeyUp(event.code);
    });
  }
}

// Initialize and start the game
async function startGame(): Promise<void> {
  const game = new Game();
  await game.initialize();
}

// Start the game when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startGame);
} else {
  startGame();
}