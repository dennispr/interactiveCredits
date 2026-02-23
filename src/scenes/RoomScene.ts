import { Application, Graphics, Text, Container } from 'pixi.js';
import { BaseScene } from '../core/BaseScene';
import { GameConfig } from '../config/GameConfig';
import { PatronManager } from '../utils/PatronManager';
import { Patron } from '../types/GameTypes';
import { HallwayScene } from './HallwayScene';

export class RoomScene extends BaseScene {
  protected patronManager!: PatronManager;
  protected floor!: number;
  protected roomNumber!: number;
  protected patron!: Patron;
  
  private roomContainer!: Container;
  private npcSprite!: Graphics;
  private playerSprite!: Graphics;
  private itemSprite!: Graphics;
  private posterSprite!: Graphics;
  private dialogContainer!: Container;
  
  private playerPosition = { x: 50, y: 0 };
  private npcPosition = { x: 400, y: 0 };
  private npcDirection = 1; // 1 for right, -1 for left
  private npcPaceMin = 300;
  private npcPaceMax = 500;
  
  // Side-scroller specific properties
  private groundLevel = 0;
  private platformHeight = 20;
  
  private isShowingDialog = false;
  private isNearNPC = false;
  private isNearItem = false;
  private isNearPoster = false;
  
  private interactionPrompt!: Text;

  constructor(app: Application) {
    super(app);
  }

  async enter(): Promise<void> {
    // Validate that required data was passed
    if (!this.patronManager || this.floor === undefined || this.roomNumber === undefined) {
      console.error('RoomScene: Missing required data');
      return;
    }
    
    this.patron = this.patronManager.getPatronInRoom(this.floor, this.roomNumber)!;
    if (!this.patron) {
      console.error(`No patron found in room ${this.floor}-${this.roomNumber}`);
      return;
    }
    
    this.createRoomLayout();
    this.createRoomElements();
    this.createPlayer();
    this.createNPC();
    this.createUI();
    this.positionElements();
    
    console.log(`🏠 Entered ${this.patron.name}'s room on floor ${this.floor}`);
  }

  private createRoomLayout(): void {
    this.roomContainer = new Container();
    
    // Calculate ground level for side-scroller
    this.groundLevel = this.layout.roomHeight - this.platformHeight - 20;
    
    // Sky/background gradient
    const skyGradient = new Graphics();
    skyGradient.rect(0, 0, this.layout.roomWidth, this.layout.roomHeight * 0.7)
      .fill(GameConfig.PLACEHOLDER_COLORS.BACKGROUND);
    
    // Ground/floor platform
    const ground = new Graphics();
    ground.rect(0, this.groundLevel, this.layout.roomWidth, this.platformHeight)
      .fill(GameConfig.PLACEHOLDER_COLORS.FLOOR);
    
    // Side walls (left and right)
    const leftWall = new Graphics();
    leftWall.rect(0, 0, 20, this.layout.roomHeight)
      .fill(GameConfig.PLACEHOLDER_COLORS.WALL);
    
    const rightWall = new Graphics();
    rightWall.rect(this.layout.roomWidth - 20, 0, 20, this.layout.roomHeight)
      .fill(GameConfig.PLACEHOLDER_COLORS.WALL);
    
    // Ceiling
    const ceiling = new Graphics();
    ceiling.rect(0, 0, this.layout.roomWidth, 20)
      .fill(GameConfig.PLACEHOLDER_COLORS.WALL);
    
    // Door opening (left side, ground level)
    const doorOpening = new Graphics();
    doorOpening.rect(0, this.groundLevel - 60, 20, 60)
      .fill(GameConfig.PLACEHOLDER_COLORS.BACKGROUND);
    
    // Door frame
    const doorFrame = new Graphics();
    doorFrame.rect(5, this.groundLevel - 65, 10, 70)
      .fill(GameConfig.PLACEHOLDER_COLORS.DOOR);
    
    this.roomContainer.addChild(skyGradient, ground, leftWall, rightWall, ceiling, doorOpening, doorFrame);
    
    // Center the room on screen
    this.roomContainer.x = (this.layout.screenWidth - this.layout.roomWidth) / 2;
    this.roomContainer.y = (this.layout.screenHeight - this.layout.roomHeight) / 2;
    
    this.container.addChild(this.roomContainer);
  }

  private createRoomElements(): void {
    // Create item placeholder (on ground, left side)
    this.itemSprite = new Graphics()
      .rect(0, 0, this.layout.itemSize, this.layout.itemSize)
      .fill(GameConfig.PLACEHOLDER_COLORS.ITEM);
    
    // Create poster placeholder (on back wall, upper area)
    this.posterSprite = new Graphics()
      .rect(0, 0, this.layout.posterWidth, this.layout.posterHeight)
      .fill(GameConfig.PLACEHOLDER_COLORS.POSTER);
      
    // Add a frame around poster
    const posterFrame = new Graphics()
      .rect(-this.layout.posterFrameBorder, -this.layout.posterFrameBorder, 
            this.layout.posterWidth + (this.layout.posterFrameBorder * 2), 
            this.layout.posterHeight + (this.layout.posterFrameBorder * 2))
      .stroke({ width: 2, color: 0x8b4513 });
    
    this.posterSprite.addChild(posterFrame);
    
    this.roomContainer.addChild(this.itemSprite, this.posterSprite);
  }

  private createPlayer(): void {
    this.playerSprite = new Graphics()
      .rect(0, 0, this.layout.playerWidth, this.layout.playerHeight)
      .fill(GameConfig.UI_COLORS.ACCENT);
      
    // Add simple face
    this.playerSprite
      .circle(this.layout.playerWidth / 2, this.layout.characterFaceY, this.layout.characterFaceRadius)
      .fill(0x000000);
    
    this.roomContainer.addChild(this.playerSprite);
  }

  private createNPC(): void {
    this.npcSprite = new Graphics()
      .rect(0, 0, this.layout.npcWidth, this.layout.npcHeight)
      .fill(GameConfig.PLACEHOLDER_COLORS.NPC);
      
    // Add simple face and features based on tier
    this.npcSprite
      .circle(this.layout.npcWidth / 2, this.layout.characterFaceY, this.layout.characterFaceRadius)
      .fill(0x000000);
    
    // Add tier indicator (simple colored dot)
    const tierColor = this.getTierColor(this.patron.tier);
    this.npcSprite
      .circle(this.layout.npcWidth / 2, this.layout.npcHeight - this.layout.tierIndicatorOffset, this.layout.tierIndicatorRadius)
      .fill(tierColor);
    
    this.roomContainer.addChild(this.npcSprite);
  }

  private getTierColor(tier?: string): number {
    switch (tier) {
      case 'bronze': return 0xcd7f32;
      case 'silver': return 0xc0c0c0;
      case 'gold': return 0xffd700;
      case 'diamond': return 0xb9f2ff;
      default: return 0xffffff;
    }
  }

  private createUI(): void {
    // Room title
    const roomTitle = new Text({
      text: `${this.patron.name}'s Workshop`,
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.SUBTITLE),
        fill: GameConfig.UI_COLORS.TEXT,
        align: 'center',
        fontWeight: 'bold'
      }
    });
    roomTitle.anchor.set(0.5);
    roomTitle.x = this.layout.centerX();
    roomTitle.y = this.layout.margin;
    
    // Controls with background
    const controlsBackground = new Graphics()
      .rect(0, 0, this.layout.roomControlsBackgroundWidth, this.layout.roomControlsBackgroundHeight)
      .fill(0x000000);
    
    const controlsText = new Text({
      text: 'Use ← → to move, SPACE to interact, ESC to leave',
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.SMALL),
        fill: 0xffffff,
        align: 'center'
      }
    });
    controlsBackground.x = this.layout.centerX() - (this.layout.roomControlsBackgroundWidth / 2);
    controlsBackground.y = this.layout.screenHeight - this.layout.margin - this.layout.roomControlsBackgroundHeight;
    
    controlsText.anchor.set(0.5);
    controlsText.x = this.layout.centerX();
    controlsText.y = this.layout.screenHeight - this.layout.margin - (this.layout.roomControlsBackgroundHeight / 2);
    
    // Interaction prompt
    this.interactionPrompt = new Text({
      text: 'Press SPACE to interact',
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.UI),
        fill: GameConfig.UI_COLORS.ACCENT,
        align: 'center',
        fontWeight: 'bold'
      }
    });
    this.interactionPrompt.anchor.set(0.5);
    this.interactionPrompt.x = this.layout.centerX();
    this.interactionPrompt.y = this.layout.getFontSize(80);
    this.interactionPrompt.visible = false;
    
    this.container.addChild(roomTitle, controlsBackground, controlsText, this.interactionPrompt);
  }

  private positionElements(): void {
    // Position player at entrance (left side, on ground)
    this.playerPosition.x = 40;
    this.playerPosition.y = this.groundLevel - this.layout.playerHeight;
    
    // Position NPC in center area, on ground
    this.npcPosition.x = this.layout.roomWidth * 0.5;
    this.npcPosition.y = this.groundLevel - this.layout.npcHeight;
    
    // Update NPC pacing boundaries (on ground level)
    this.npcPaceMin = this.layout.roomWidth * 0.3;
    this.npcPaceMax = this.layout.roomWidth * 0.7;
    
    // Position item on ground, left-center area
    this.itemSprite.x = this.layout.roomWidth * 0.25;
    this.itemSprite.y = this.groundLevel - this.layout.itemSize;
    
    // Position poster on back wall, upper area
    this.posterSprite.x = this.layout.roomWidth * 0.75 - this.layout.posterWidth / 2;
    this.posterSprite.y = this.layout.roomHeight * 0.2;
    
    this.updateSpritePositions();
  }

  private updateSpritePositions(): void {
    this.playerSprite.x = this.playerPosition.x;
    this.playerSprite.y = this.playerPosition.y;
    
    this.npcSprite.x = this.npcPosition.x;
    this.npcSprite.y = this.npcPosition.y;
  }

  update(deltaTime: number): void {
    if (!this.isShowingDialog) {
      this.handleMovement(deltaTime);
      this.updateNPCMovement(deltaTime);
    }
    this.checkInteractions();
  }

  private handleMovement(deltaTime: number): void {
    const speed = this.layout.playerSpeed * (deltaTime / 60);
    const roomBounds = {
      left: this.layout.roomSideMargin,
      right: this.layout.roomWidth - this.layout.playerWidth - this.layout.roomSideMargin
    };
    
    if (this.isKeyPressed('ArrowLeft')) {
      this.playerPosition.x = Math.max(roomBounds.left, this.playerPosition.x - speed);
    }
    
    if (this.isKeyPressed('ArrowRight')) {
      this.playerPosition.x = Math.min(roomBounds.right, this.playerPosition.x + speed);
    }
    
    // Keep player on ground level
    this.playerPosition.y = this.groundLevel - this.layout.playerHeight;
    
    this.updateSpritePositions();
  }

  private updateNPCMovement(deltaTime: number): void {
    const npcSpeed = this.layout.npcSpeed * (deltaTime / 60);
    
    // Move NPC back and forth in their pace area (on ground)
    this.npcPosition.x += npcSpeed * this.npcDirection;
    
    // Check bounds and reverse direction
    if (this.npcPosition.x >= this.npcPaceMax) {
      this.npcDirection = -1;
      this.npcPosition.x = this.npcPaceMax;
    } else if (this.npcPosition.x <= this.npcPaceMin) {
      this.npcDirection = 1;
      this.npcPosition.x = this.npcPaceMin;
    }
    
    // Keep NPC on ground level  
    this.npcPosition.y = this.groundLevel - this.layout.npcHeight;
    
    this.updateSpritePositions();
  }

  private checkInteractions(): void {
    const interactionDistance = this.layout.interactionDistance;
    
    // Check NPC interaction
    const npcDistance = Math.abs(this.playerPosition.x - this.npcPosition.x);
    this.isNearNPC = npcDistance < interactionDistance;
    
    // Check item interaction
    const itemDistance = Math.abs(this.playerPosition.x - this.itemSprite.x);
    this.isNearItem = itemDistance < interactionDistance;
    
    // Check poster interaction  
    const posterDistance = Math.abs(this.playerPosition.x - this.posterSprite.x);
    this.isNearPoster = posterDistance < interactionDistance;
    
    // Update interaction prompt
    if (this.isNearNPC || this.isNearItem || this.isNearPoster) {
      this.interactionPrompt.visible = true;
      
      if (this.isNearNPC) {
        this.interactionPrompt.text = `Press SPACE to talk to ${this.patron.name}`;
      } else if (this.isNearItem) {
        this.interactionPrompt.text = 'Press SPACE to examine item';
      } else if (this.isNearPoster) {
        this.interactionPrompt.text = 'Press SPACE to view poster';
      }
    } else {
      this.interactionPrompt.visible = false;
    }
  }

  handleKeyDown(keyCode: string): void {
    super.handleKeyDown(keyCode);
    
    switch (keyCode) {
      case 'Space':
        this.handleInteraction();
        break;
      case 'Escape':
        if (this.isShowingDialog) {
          this.hideDialog();
        } else {
          this.exitRoom();
        }
        break;
    }
  }

  private handleInteraction(): void {
    if (this.isShowingDialog) {
      this.hideDialog();
      return;
    }
    
    if (this.isNearNPC) {
      this.showDialog(this.patron.dialogText);
    } else if (this.isNearItem) {
      this.showDialog(`This is ${this.patron.name}'s special item. It holds great meaning to them!`);
    } else if (this.isNearPoster) {
      this.showDialog(`A beautiful poster chosen by ${this.patron.name}. It reflects their personality and interests.`);
    }
  }

  private showDialog(text: string): void {
    this.isShowingDialog = true;
    
    // Create dialog container
    this.dialogContainer = new Container();
    
    const dialogWidth = this.layout.screenWidth * 0.8;
    const dialogHeight = this.layout.screenHeight * 0.2;
    
    // Dialog background
    const dialogBg = new Graphics()
      .roundRect(0, 0, dialogWidth, dialogHeight, 10)
      .fill(0x000000, 0.8)
      .stroke({ width: 2, color: GameConfig.UI_COLORS.PRIMARY });
    
    // Dialog text
    const dialogText = new Text({
      text: this.wrapText(text, Math.floor(dialogWidth / this.layout.getFontSize(10))), 
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.BODY),
        fill: GameConfig.UI_COLORS.TEXT,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: dialogWidth - 40
      }
    });
    dialogText.x = 20;
    dialogText.y = 20;
    
    // Close instruction
    const closeText = new Text({
      text: 'Press SPACE or ESC to close',
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.SMALL),
        fill: GameConfig.UI_COLORS.SECONDARY,
        align: 'right'
      }
    });
    closeText.anchor.set(1, 1);
    closeText.x = dialogWidth - 20;
    closeText.y = dialogHeight - 10;
    
    this.dialogContainer.addChild(dialogBg, dialogText, closeText);
    
    // Center dialog on screen
    this.dialogContainer.x = this.layout.centerX(dialogWidth);
    this.dialogContainer.y = this.layout.screenHeight - dialogHeight - this.layout.margin;
    
    this.container.addChild(this.dialogContainer);
  }

  private hideDialog(): void {
    if (this.dialogContainer) {
      this.container.removeChild(this.dialogContainer);
      this.dialogContainer.destroy();
    }
    this.isShowingDialog = false;
  }

  private wrapText(text: string, maxLength: number): string {
    // Simple text wrapping
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines.join('\n');
  }

  private async exitRoom(): Promise<void> {
    console.log(`🚪 Leaving ${this.patron.name}'s workshop`);
    
    const sceneManager = (this.app as any).sceneManager;
    if (sceneManager) {
      await sceneManager.switchTo(HallwayScene);
    }
  }

  onResize(): void {
    // Recalculate ground level
    this.groundLevel = this.layout.roomHeight - this.platformHeight - 20;
    
    // Clear and recreate the room layout
    this.container.removeChildren();
    this.createRoomLayout();
    this.createRoomElements();
    this.createPlayer();
    this.createNPC();
    this.createUI();
    this.positionElements();
    
    // Close any open dialog
    if (this.isShowingDialog) {
      this.hideDialog();
    }
  }
}