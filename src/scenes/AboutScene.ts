import { Application, Graphics, Text, Container } from 'pixi.js';
import { BaseScene } from '../core/BaseScene';
import { GameConfig } from '../config/GameConfig';

export class AboutScene extends BaseScene {
  private backButton!: Container;

  constructor(app: Application) {
    super(app);
  }

  async enter(): Promise<void> {
    this.createBackground(GameConfig.BACKGROUND_COLOR);
    this.createContent();
    this.createBackButton();
    this.setupInteractivity();
    
    console.log('ℹ️ About Scene - Interactive Credits Information');
  }

  private createContent(): void {
    // Title
    const titleText = new Text({
      text: 'About Interactive Credits',
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
    titleText.y = this.layout.screenHeight * 0.15;
    
    // Main description - split into multiple text objects to avoid overlap
    const descriptionLines = [
      'Welcome to our Interactive Credits system!',
      '',
      'Inspired by Whittier, Alaska - a unique town where everyone lives',
      'under one roof - this experience showcases our amazing patrons',
      'as residents of "The Workshop."',
      '',
      'Each patron has their own room with:',
      '• Personal items and decorations',
      '• A unique story to tell', 
      '• Custom artwork and posters',
      '',
      'Navigate through the building, meet our supporters,',
      'and learn about the incredible people who make our work possible.',
      '',
      'Use the arrow keys to move and SPACE to interact!'
    ];
    
    const lineHeight = this.layout.getFontSize(GameConfig.FONT_SIZES.BODY) * 1.3;
    const startY = this.layout.screenHeight * 0.25;
    
    descriptionLines.forEach((line, index) => {
      const lineText = new Text({
        text: line,
        style: {
          fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
          fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.BODY),
          fill: GameConfig.UI_COLORS.TEXT,
          align: 'center'
        }
      });
      
      lineText.anchor.set(0.5);
      lineText.x = this.layout.centerX();
      lineText.y = startY + (index * lineHeight);
      
      this.container.addChild(lineText);
    });
    
    // Credits
    const creditsText = new Text({
      text: 'Thank you to our supporters!',
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.SMALL),
        fill: GameConfig.UI_COLORS.SECONDARY,
        align: 'center',
        fontStyle: 'italic'
      }
    });
    
    creditsText.anchor.set(0.5);
    creditsText.x = this.layout.centerX();
    creditsText.y = this.layout.screenHeight * 0.85;
    
    this.container.addChild(titleText, creditsText);
  }

  private createBackButton(): void {
    const buttonContainer = new Container();
    const buttonSize = this.layout.getButtonSize();
    
    // Button background
    const buttonBg = new Graphics()
      .roundRect(0, 0, buttonSize.width * 0.8, buttonSize.height * 0.8, 8)
      .fill(GameConfig.UI_COLORS.BUTTON);
    
    // Button text
    const buttonText = new Text({
      text: 'BACK',
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.UI),
        fill: GameConfig.UI_COLORS.TEXT,
        align: 'center',
        fontWeight: 'bold'
      }
    });
    
    buttonText.anchor.set(0.5);
    buttonText.x = (buttonSize.width * 0.8) / 2;
    buttonText.y = (buttonSize.height * 0.8) / 2;
    
    buttonContainer.addChild(buttonBg, buttonText);
    buttonContainer.x = this.layout.centerX(buttonSize.width * 0.8);
    buttonContainer.y = this.layout.screenHeight * 0.92 - (buttonSize.height * 0.8);
    
    // Make interactive
    buttonContainer.eventMode = 'static';
    buttonContainer.cursor = 'pointer';
    
    // Store references for hover effects
    (buttonContainer as any).background = buttonBg;
    (buttonContainer as any).text = buttonText;
    
    this.backButton = buttonContainer;
    this.container.addChild(this.backButton);
  }

  private setupInteractivity(): void {
    this.backButton.on('pointerenter', () => {
      this.updateButtonAppearance(true);
    });
    
    this.backButton.on('pointerleave', () => {
      this.updateButtonAppearance(false);
    });
    
    this.backButton.on('pointerdown', () => {
      this.goBack();
    });
  }

  private updateButtonAppearance(isHovered: boolean): void {
    const background = (this.backButton as any).background as Graphics;
    const color = isHovered ? GameConfig.UI_COLORS.BUTTON_HOVER : GameConfig.UI_COLORS.BUTTON;
    const buttonSize = this.layout.getButtonSize();
    
    background.clear();
    background.roundRect(0, 0, buttonSize.width * 0.8, buttonSize.height * 0.8, 8).fill(color);
  }

  onResize(): void {
    // Clear and recreate content on resize
    this.container.removeChildren();
    this.createBackground(GameConfig.BACKGROUND_COLOR);
    this.createContent();
    this.createBackButton();
    this.setupInteractivity();
  }

  handleKeyDown(keyCode: string): void {
    super.handleKeyDown(keyCode);
    
    switch (keyCode) {
      case 'Escape':
      case 'Backspace':
      case 'Enter':
        this.goBack();
        break;
    }
  }

  private async goBack(): Promise<void> {
    const sceneManager = (this.app as any).sceneManager;
    if (sceneManager) {
      const { StartScene } = await import('./StartScene');
      await sceneManager.switchTo(StartScene);
    }
  }
}