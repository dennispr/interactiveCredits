import { Application, Container } from 'pixi.js';

export interface IScene {
  container: Container;
  enter(): Promise<void> | void;
  exit(): Promise<void> | void;
  update?(deltaTime: number): void;
  handleKeyDown?(keyCode: string): void;
  handleKeyUp?(keyCode: string): void;
  destroy(): void;
}

export type SceneConstructor = new (app: Application) => IScene;

export class SceneManager {
  private app: Application;
  private currentScene: IScene | null = null;
  private isTransitioning: boolean = false;

  constructor(app: Application) {
    this.app = app;
  }

  async switchTo(SceneClass: SceneConstructor): Promise<void> {
    if (this.isTransitioning) {
      console.warn('Scene transition already in progress');
      return;
    }

    this.isTransitioning = true;

    try {
      // Exit current scene
      if (this.currentScene) {
        await this.currentScene.exit();
        this.app.stage.removeChild(this.currentScene.container);
        this.currentScene.destroy();
      }

      // Create and enter new scene
      const newScene = new SceneClass(this.app);
      this.currentScene = newScene;
      
      this.app.stage.addChild(newScene.container);
      await newScene.enter();

    } catch (error) {
      console.error('Error during scene transition:', error);
    } finally {
      this.isTransitioning = false;
    }
  }

  handleKeyDown(keyCode: string): void {
    if (this.currentScene && this.currentScene.handleKeyDown) {
      this.currentScene.handleKeyDown(keyCode);
    }
  }

  handleKeyUp(keyCode: string): void {
    if (this.currentScene && this.currentScene.handleKeyUp) {
      this.currentScene.handleKeyUp(keyCode);
    }
  }

  setupUpdateLoop(): void {
    this.app.ticker.add((ticker) => {
      const deltaTime = ticker.deltaTime;
      
      if (this.currentScene && this.currentScene.update) {
        this.currentScene.update(deltaTime);
      }
    });
  }

  getCurrentScene(): IScene | null {
    return this.currentScene;
  }
}