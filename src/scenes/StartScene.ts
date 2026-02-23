import { Application, Graphics, Text, Container } from 'pixi.js';
import { BaseScene } from '../core/BaseScene';
import { GameConfig } from '../config/GameConfig';
import { AboutScene } from './AboutScene';
import { TransitionScene } from './TransitionScene';

export class StartScene extends BaseScene {
  private startButton!: Container;
  private aboutButton!: Container;

  constructor(app: Application) {
    super(app);
  }

  async enter(): Promise<void> {
    this.createBackground(GameConfig.BACKGROUND_COLOR);
    this.createTitle();
    this.createButtons();
    this.setupInteractivity();
    
    console.log('🏠 Welcome to Interactive Credits - Start Scene');
  }

  private createTitle(): void {
    // Main title
    const titleText = new Text({
      text: 'Visit the Workshop!',
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.TITLE),
        fill: GameConfig.UI_COLORS.TEXT,
        align: 'center',
        fontWeight: 'bold'
      }
    });
    
    titleText.anchor.set(0.5);
    titleText.x = this.layout.centerX();
    titleText.y = this.layout.screenHeight * 0.3;
    
    // Subtitle
    const subtitleText = new Text({
      text: 'Interactive Credits & Patron Showcase',
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.SUBTITLE),
        fill: GameConfig.UI_COLORS.SECONDARY,
        align: 'center'
      }
    });
    
    subtitleText.anchor.set(0.5);
    subtitleText.x = this.layout.centerX();
    subtitleText.y = titleText.y + this.layout.getFontSize(80);
    
    this.container.addChild(titleText, subtitleText);
  }

  private createButtons(): void {
    const buttonY = this.layout.screenHeight * 0.65;
    const buttonSpacing = this.layout.getFontSize(200);
    const centerX = this.layout.centerX();

    // Start button
    this.startButton = this.createButton(
      'START',
      centerX - buttonSpacing / 2,
      buttonY,
      () => this.switchToTransition()
    );

    // About button  
    this.aboutButton = this.createButton(
      'ABOUT',
      centerX + buttonSpacing / 2,
      buttonY,
      () => this.switchToAbout()
    );

    this.container.addChild(this.startButton, this.aboutButton);
  }

  private createButton(text: string, x: number, y: number, onClick: () => void): Container {
    const buttonContainer = new Container();
    const buttonSize = this.layout.getButtonSize();
    
    // Button background
    const buttonBg = new Graphics()
      .roundRect(0, 0, buttonSize.width, buttonSize.height, 10)
      .fill(GameConfig.UI_COLORS.BUTTON);
    
    // Button text
    const buttonText = new Text({
      text,
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.UI),
        fill: GameConfig.UI_COLORS.TEXT,
        align: 'center',
        fontWeight: 'bold'
      }
    });
    
    buttonText.anchor.set(0.5);
    buttonText.x = buttonSize.width / 2; 
    buttonText.y = buttonSize.height / 2; 
    
    buttonContainer.addChild(buttonBg, buttonText);
    buttonContainer.x = x - buttonSize.width / 2; 
    buttonContainer.y = y - buttonSize.height / 2; 
    
    // Make interactive
    buttonContainer.eventMode = 'static';
    buttonContainer.cursor = 'pointer';
    
    // Store references for hover effects
    (buttonContainer as any).background = buttonBg;
    (buttonContainer as any).text = buttonText;
    (buttonContainer as any).onClick = onClick;
    
    return buttonContainer;
  }

  private setupInteractivity(): void {
    // Start button events
    this.startButton.on('pointerenter', () => {
      this.updateButtonAppearance(this.startButton, true);
    });
    
    this.startButton.on('pointerleave', () => {
      this.updateButtonAppearance(this.startButton, false);
    });
    
    this.startButton.on('pointerdown', () => {
      (this.startButton as any).onClick();
    });
    
    // About button events
    this.aboutButton.on('pointerenter', () => {
      this.updateButtonAppearance(this.aboutButton, true);
    });
    
    this.aboutButton.on('pointerleave', () => {
      this.updateButtonAppearance(this.aboutButton, false);
    });
    
    this.aboutButton.on('pointerdown', () => {
      (this.aboutButton as any).onClick();
    });
  }

  private updateButtonAppearance(button: Container, isHovered: boolean): void {
    const background = (button as any).background as Graphics;
    const color = isHovered ? GameConfig.UI_COLORS.BUTTON_HOVER : GameConfig.UI_COLORS.BUTTON;
    const buttonSize = this.layout.getButtonSize();
    
    background.clear();
    background.roundRect(0, 0, buttonSize.width, buttonSize.height, 10).fill(color);
  }

  onResize(): void {
    // Clear and recreate content on resize
    this.container.removeChildren();
    this.createBackground(GameConfig.BACKGROUND_COLOR);
    this.createTitle();
    this.createButtons();
    this.setupInteractivity();
  }

  handleKeyDown(keyCode: string): void {
    super.handleKeyDown(keyCode);
    
    switch (keyCode) {
      case 'Enter':
      case 'Space':
        this.switchToTransition();
        break;
      case 'Escape':
        // Could add exit confirmation here
        break;
    }
  }

  private async switchToTransition(): Promise<void> {
    const sceneManager = (this.app as any).sceneManager;
    if (sceneManager) {
      await sceneManager.switchTo(new TransitionScene(this.app));
    }
  }

  private async switchToAbout(): Promise<void> {
    const sceneManager = (this.app as any).sceneManager;
    if (sceneManager) {
      await sceneManager.switchTo(AboutScene);
    }
  }
}