import { Application, Graphics, Text } from 'pixi.js';
import { BaseScene } from '../core/BaseScene';
import { GameConfig } from '../config/GameConfig';
import { HallwayScene } from './HallwayScene';

export class TransitionScene extends BaseScene {
  private transitionText!: Text;
  private fadeOverlay!: Graphics;
  private phase: 'fadeIn' | 'display' | 'fadeOut' = 'fadeIn';
  private phaseTimer = 0;
  private readonly DISPLAY_DURATION = 2000; // 2 seconds

  constructor(app: Application) {
    super(app);
  }

  async enter(): Promise<void> {
    // Black background
    this.createBackground(0x000000);
    this.createFadeOverlay();
    this.createTransitionText();
    
    console.log('🚪 Now entering the workshop...');
  }

  private createTransitionText(): void {
    this.transitionText = new Text({
      text: 'Now entering the workshop!',
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.TITLE),
        fill: GameConfig.UI_COLORS.TEXT,
        align: 'center',
        fontWeight: 'bold'
      }
    });
    
    this.transitionText.anchor.set(0.5);
    this.transitionText.x = this.layout.centerX();
    this.transitionText.y = this.layout.centerY();
    this.transitionText.alpha = 0; // Start invisible
    
    this.container.addChild(this.transitionText);
  }

  private createFadeOverlay(): void {
    this.fadeOverlay = new Graphics()
      .rect(0, 0, this.layout.screenWidth, this.layout.screenHeight)
      .fill(0x000000);
    
    this.fadeOverlay.alpha = 0; // Start transparent
    this.container.addChild(this.fadeOverlay);
  }

  update(deltaTime: number): void {
    const deltaMs = deltaTime * 16.67; // Convert to milliseconds (roughly)
    this.phaseTimer += deltaMs;
    
    switch (this.phase) {
      case 'fadeIn':
        this.updateFadeIn(deltaMs);
        break;
      case 'display':
        this.updateDisplay();
        break;
      case 'fadeOut':
        this.updateFadeOut(deltaMs);
        break;
    }
  }

  private updateFadeIn(_deltaMs: number): void {
    const progress = this.phaseTimer / GameConfig.FADE_DURATION;
    
    // Fade in the text
    this.transitionText.alpha = Math.min(progress, 1);
    
    if (progress >= 1) {
      this.phase = 'display';
      this.phaseTimer = 0;
    }
  }

  private updateDisplay(): void {
    if (this.phaseTimer >= this.DISPLAY_DURATION) {
      this.phase = 'fadeOut';
      this.phaseTimer = 0;
    }
  }

  private updateFadeOut(_deltaMs: number): void {
    const progress = this.phaseTimer / GameConfig.FADE_DURATION;
    
    // Fade out the text 
    this.transitionText.alpha = Math.max(1 - progress, 0);
    
    if (progress >= 1) {
      // Transition complete, go to hallway
      this.transitionToHallway();
    }
  }

  private async transitionToHallway(): Promise<void> {
    const sceneManager = (this.app as any).sceneManager;
    if (sceneManager) {
      await sceneManager.switchTo(HallwayScene);
    }
  }

  onResize(): void {
    // Clear and recreate content on resize
    this.container.removeChildren();
    this.createBackground(0x000000);
    this.createFadeOverlay();
    this.createTransitionText();
  }

  handleKeyDown(keyCode: string): void {
    super.handleKeyDown(keyCode);
    
    // Allow skipping the transition with any key
    switch (keyCode) {
      case 'Space':
      case 'Enter':
      case 'Escape':
        this.transitionToHallway();
        break;
    }
  }
}