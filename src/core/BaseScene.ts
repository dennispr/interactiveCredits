import { Application, Container, Graphics } from 'pixi.js';
import { IScene } from './SceneManager';
import { Layout, LayoutDimensions } from '../config/Layout';

export abstract class BaseScene implements IScene {
  protected app: Application;
  public container: Container;
  protected keysPressed: Set<string> = new Set();
  protected layout: Layout;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    this.layout = Layout.getInstance();
  }

  abstract enter(): Promise<void> | void;

  exit(): Promise<void> | void {
    // Override in subclasses if needed
  }

  update?(_deltaTime: number): void {
    // Override in subclasses if needed
  }

  handleKeyDown(keyCode: string): void {
    this.keysPressed.add(keyCode);
  }

  handleKeyUp(keyCode: string): void {
    this.keysPressed.delete(keyCode);
  }

  // Optional resize handler - implement in subclasses that need responsive behavior
  onResize?(_dimensions: LayoutDimensions): void;

  isKeyPressed(keyCode: string): boolean {
    return this.keysPressed.has(keyCode);
  }

  destroy(): void {
    this.container.destroy({ children: true });
    this.keysPressed.clear();
  }

  protected createBackground(color: number = 0x000000): void {
    const background = new Graphics()
      .rect(0, 0, this.layout.screenWidth, this.layout.screenHeight)
      .fill(color);
    
    this.container.addChild(background);
  }
}