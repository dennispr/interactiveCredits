import { Application, Graphics, Text, Container } from 'pixi.js';
import { BaseScene } from '../core/BaseScene';
import { GameConfig } from '../config/GameConfig';
import { PatronManager } from '../utils/PatronManager';
// RoomScene imported dynamically to avoid circular dependency

export class HallwayScene extends BaseScene {
  private patronManager: PatronManager;
  private currentFloor: number = 1;
  private playerSprite!: Graphics;
  private playerPosition = { x: 100, y: 0 };
  private playerSpeed: number = GameConfig.PLAYER_SPEED;
  private returnFromRoom?: number; // Room number player is returning from
  private selectedFloorInPopup: number = 1; // Currently selected floor in popup
  
  private doors: Container[] = [];
  private hallwayContainer!: Container;
  private uiContainer!: Container;
  private interactionPrompt!: Text;
  private nearDoorIndex: number = -1;
  private elevatorButton!: Container;
  private isNearElevator = false;

  constructor(app: Application) {
    super(app);
    this.patronManager = new PatronManager();
  }

  async enter(): Promise<void> {
    this.playerSpeed = this.layout.playerSpeed;
    this.createBackground(GameConfig.PLACEHOLDER_COLORS.FLOOR);
    this.createHallwayLayout();
    this.createDoors();
    this.createElevator();
    this.createPlayer(); // Create player after elevator to render in front
    this.createUI();
    this.positionPlayer();
    
    console.log(`🚪 Entered hallway - Floor ${this.currentFloor}`);
  }

  private createHallwayLayout(): void {
    this.hallwayContainer = new Container();
    
    // Hallway background (wooden floor pattern)
    const hallwayBg = new Graphics()
      .rect(0, 0, this.layout.screenWidth, this.layout.screenHeight)
      .fill(GameConfig.PLACEHOLDER_COLORS.FLOOR);
    
    // Add some visual elements for the hallway
    // Ceiling
    const ceiling = new Graphics()
      .rect(0, 0, this.layout.screenWidth, this.layout.ceilingHeight)
      .fill(GameConfig.PLACEHOLDER_COLORS.WALL);
    
    this.hallwayContainer.addChild(hallwayBg, ceiling);
    this.container.addChild(this.hallwayContainer);
  }

  private createPlayer(): void {
    this.playerSprite = new Graphics();
    this.updatePlayerSprite();
    this.container.addChild(this.playerSprite);
  }

  private updatePlayerSprite(): void {
    this.playerSprite.clear();
    
    // Simple player representation (colored rectangle for now)
    this.playerSprite
      .rect(0, 0, this.layout.playerWidth, this.layout.playerHeight)
      .fill(GameConfig.UI_COLORS.ACCENT);
    
    // Add a simple "face" 
    this.playerSprite
      .circle(this.layout.playerWidth / 2, this.layout.characterFaceY, this.layout.characterFaceRadius)
      .fill(0x000000);
  }

  private createDoors(): void {
    this.doors = [];
    const doorWidth = this.layout.doorWidth;
    const doorHeight = this.layout.doorHeight;
    const doorSpacing = this.layout.screenWidth / (GameConfig.ROOMS_PER_FLOOR + 1);
    
    for (let i = 0; i < GameConfig.ROOMS_PER_FLOOR; i++) {
      const doorContainer = new Container();
      const roomNumber = i + 1;
      
      // Door frame
      const doorFrame = new Graphics()
        .rect(0, 0, doorWidth, doorHeight)
        .fill(GameConfig.PLACEHOLDER_COLORS.DOOR);
      
      // Door handle
      const doorHandle = new Graphics()
        .circle(doorWidth - this.layout.doorHandleOffset, doorHeight / 2, this.layout.doorHandleRadius)
        .fill(GameConfig.UI_COLORS.ACCENT);
      
      // Room label
      const roomLabel = new Text({
        text: `Room ${roomNumber}`,
        style: {
          fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
          fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.SMALL),
          fill: GameConfig.UI_COLORS.TEXT,
          align: 'center'
        }
      });
      roomLabel.anchor.set(0.5);
      roomLabel.x = doorWidth / 2;
      roomLabel.y = -this.layout.roomLabelOffset;
      
      // Check if room has a patron
      const patron = this.patronManager.getPatronInRoom(this.currentFloor, roomNumber);
      const occupancyLabel = new Text({
        text: patron ? patron.name : 'No one lives here right now',
        style: {
          fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
          fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.SMALL),
          fill: patron ? GameConfig.UI_COLORS.SUCCESS : GameConfig.UI_COLORS.WARNING,
          align: 'center'
        }
      });
      occupancyLabel.anchor.set(0.5);
      occupancyLabel.x = doorWidth / 2;
      occupancyLabel.y = doorHeight + this.layout.occupancyLabelOffset;
      
      doorContainer.addChild(doorFrame, doorHandle, roomLabel, occupancyLabel);
      
      // Position door
      doorContainer.x = doorSpacing * (i + 1) - doorWidth / 2;
      doorContainer.y = this.layout.screenHeight / 2 - doorHeight / 2;
      
      // Store room data
      (doorContainer as any).roomNumber = roomNumber;
      (doorContainer as any).hasPatron = !!patron;
      
      this.doors.push(doorContainer);
      this.container.addChild(doorContainer);
    }
  }

  private createElevator(): void {
    const elevatorContainer = new Container();
    const elevatorWidth = this.layout.elevatorWidth;
    const elevatorHeight = this.layout.elevatorHeight;
    
    // Elevator shaft
    const elevatorShaft = new Graphics()
      .rect(0, 0, elevatorWidth, elevatorHeight)
      .fill(0x2c3e50);
    
    // Elevator buttons
    const upButton = new Graphics()
      .circle(elevatorWidth / 2, this.layout.elevatorUpButtonY, this.layout.elevatorButtonRadius)
      .fill(this.currentFloor < this.patronManager.getFloorCount() ? 
            GameConfig.UI_COLORS.SUCCESS : GameConfig.UI_COLORS.WARNING);
    
    const downButton = new Graphics()
      .circle(elevatorWidth / 2, this.layout.elevatorDownButtonY, this.layout.elevatorButtonRadius)
      .fill(this.currentFloor > 1 ? 
            GameConfig.UI_COLORS.SUCCESS : GameConfig.UI_COLORS.WARNING);
    
    // Floor indicator
    const floorIndicator = new Text({
      text: `Floor ${this.currentFloor}`,
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.UI),
        fill: GameConfig.UI_COLORS.TEXT,
        align: 'center'
      }
    });
    floorIndicator.anchor.set(0.5);
    floorIndicator.x = elevatorWidth / 2;
    floorIndicator.y = this.layout.elevatorFloorIndicatorY;
    
    // Elevator label
    const elevatorLabel = new Text({
      text: 'ELEVATOR',
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.SMALL),
        fill: GameConfig.UI_COLORS.TEXT,
        align: 'center'
      }
    });
    elevatorLabel.anchor.set(0.5);
    elevatorLabel.x = elevatorWidth / 2;
    elevatorLabel.y = this.layout.elevatorLabelY;
    
    elevatorContainer.addChild(elevatorShaft, upButton, downButton, floorIndicator, elevatorLabel);
    elevatorContainer.x = this.layout.screenWidth - elevatorWidth - this.layout.elevatorMargin;
    elevatorContainer.y = this.layout.screenHeight / 2 - elevatorHeight / 2;
    
    this.elevatorButton = elevatorContainer;
    this.container.addChild(this.elevatorButton);
  }

  private createUI(): void {
    this.uiContainer = new Container();
    
    // Floor indicator
    const floorText = new Text({
      text: `Floor ${this.currentFloor} of ${this.patronManager.getFloorCount()}`,
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.UI),
        fill: GameConfig.UI_COLORS.TEXT,
        align: 'left'
      }
    });
    floorText.x = this.layout.margin;
    floorText.y = this.layout.margin;
    
    // Controls hint with background
    const controlsBackground = new Graphics()
      .rect(0, 0, this.layout.hallwayControlsBackgroundWidth, this.layout.hallwayControlsBackgroundHeight)
      .fill(0x000000);
    
    const controlsText = new Text({
      text: 'Use ← → to move, SPACE to interact',
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.SMALL),
        fill: 0xffffff,
        align: 'left'
      }
    });
    controlsBackground.x = this.layout.margin;
    controlsBackground.y = this.layout.screenHeight - this.layout.margin - this.layout.hallwayControlsBackgroundHeight;
    
    controlsText.x = this.layout.margin + this.layout.controlsBackgroundPadding;
    controlsText.y = this.layout.screenHeight - this.layout.margin - controlsText.height - this.layout.controlsBackgroundPadding;
    
    // Interaction prompt (initially hidden)
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
    this.interactionPrompt.y = 100 * this.layout.scale;
    this.interactionPrompt.visible = false;
    
    this.uiContainer.addChild(floorText, controlsBackground, controlsText, this.interactionPrompt);
    this.container.addChild(this.uiContainer);
  }

  private positionPlayer(): void {
    // Check if returning from a specific room
    if (this.returnFromRoom) {
      // Position player at the door of the room they came from
      const doorSpacing = this.layout.screenWidth / (GameConfig.ROOMS_PER_FLOOR + 1);
      this.playerPosition.x = doorSpacing * this.returnFromRoom - (this.layout.playerWidth / 2);
    } else {
      // Start player at the left side of the hallway
      this.playerPosition.x = this.layout.playerStartX;
    }
    
    // Position player so their lower left corner is slightly below door's lower left corner
    const doorHeight = this.layout.doorHeight;
    const doorBottom = this.layout.screenHeight / 2 + doorHeight / 2;
    this.playerPosition.y = doorBottom + this.layout.playerGroundOffset - this.layout.playerHeight;
    
    this.updatePlayerPosition();
  }

  private updatePlayerPosition(): void {
    this.playerSprite.x = this.playerPosition.x;
    this.playerSprite.y = this.playerPosition.y;
  }

  update(deltaTime: number): void {
    this.handleMovement(deltaTime);
    this.checkInteractions();
  }

  private handleMovement(deltaTime: number): void {
    const speed = this.playerSpeed * (deltaTime / 60); // Normalize to 60fps
    
    if (this.isKeyPressed('ArrowLeft')) {
      this.playerPosition.x = Math.max(this.layout.hallwaySideMargin, this.playerPosition.x - speed);
    }
    
    if (this.isKeyPressed('ArrowRight')) {
      this.playerPosition.x = Math.min(
        this.layout.screenWidth - this.layout.playerWidth - this.layout.hallwaySideMargin, 
        this.playerPosition.x + speed
      );
    }
    
    this.updatePlayerPosition();
  }

  private checkInteractions(): void {
    const interactionDistance = this.layout.interactionDistance;
    
    // Check door interactions
    this.nearDoorIndex = -1;
    for (let i = 0; i < this.doors.length; i++) {
      const door = this.doors[i];
      const distance = Math.abs(this.playerPosition.x - door.x);
      
      if (distance < interactionDistance) {
        this.nearDoorIndex = i;
        break;
      }
    }
    
    // Check elevator interaction
    const elevatorDistance = Math.abs(this.playerPosition.x - this.elevatorButton.x);
    this.isNearElevator = elevatorDistance < interactionDistance;
    
    // Update interaction prompt
    if (this.nearDoorIndex >= 0 || this.isNearElevator) {
      this.interactionPrompt.visible = true;
      if (this.nearDoorIndex >= 0) {
        const door = this.doors[this.nearDoorIndex];
        const hasPatron = (door as any).hasPatron;
        this.interactionPrompt.text = hasPatron ? 'Press SPACE to enter room' : 'Room is empty';
      } else {
        this.interactionPrompt.text = 'Press SPACE for elevator';
      }
    } else {
      this.interactionPrompt.visible = false;
    }
  }

  handleKeyDown(keyCode: string): void {
    super.handleKeyDown(keyCode);
    
    // Handle floor selection popup
    if ((this as any).floorSelectionPopup) {
      if (keyCode === 'Escape') {
        // Close popup
        this.container.removeChild((this as any).floorSelectionPopup);
        (this as any).floorSelectionPopup = null;
        return;
      }
      
      // Handle arrow key floor selection
      if (keyCode === 'ArrowUp') {
        this.selectedFloorInPopup = Math.max(1, this.selectedFloorInPopup - 1);
        this.updateFloorSelectionHighlight();
        return;
      }
      
      if (keyCode === 'ArrowDown') {
        this.selectedFloorInPopup = Math.min(this.patronManager.getFloorCount(), this.selectedFloorInPopup + 1);
        this.updateFloorSelectionHighlight();
        return;
      }
      
      // Handle Enter to select highlighted floor
      if (keyCode === 'Enter') {
        this.selectFloor(this.selectedFloorInPopup);
        return;
      }
      
      // Handle number key floor selection
      const floorNum = parseInt(keyCode.replace('Digit', ''));
      if (floorNum >= 1 && floorNum <= this.patronManager.getFloorCount()) {
        this.selectFloor(floorNum);
        return;
      }
    }
    
    if (keyCode === 'Space') {
      this.handleInteraction();
    } else if (keyCode === 'Escape') {
      // Could add pause menu or return to start
    }
  }

  private async handleInteraction(): Promise<void> {
    if (this.nearDoorIndex >= 0) {
      const door = this.doors[this.nearDoorIndex];
      const roomNumber = (door as any).roomNumber;
      const hasPatron = (door as any).hasPatron;
      
      if (hasPatron) {
        console.log(`🚪 Entering room ${roomNumber} on floor ${this.currentFloor}`);
        await this.enterRoom(roomNumber);
      } else {
        console.log('📭 Room is empty');
      }
    } else if (this.isNearElevator) {
      await this.showElevatorMenu();
    }
  }

  private async enterRoom(roomNumber: number): Promise<void> {
    const sceneManager = (this.app as any).sceneManager;
    if (sceneManager) {
      // Import RoomScene dynamically to avoid circular dependency
      const { RoomScene } = await import('./RoomScene');
      
      // Pass room information to the room scene
      const currentFloorRef = this.currentFloor;
      const patronManagerRef = this.patronManager;
      const RoomSceneWithData = class extends RoomScene {
        constructor(app: Application) {
          super(app);
          (this as any).floor = currentFloorRef;
          (this as any).roomNumber = roomNumber;
          (this as any).patronManager = patronManagerRef;
        }
      };
      
      await sceneManager.switchTo(RoomSceneWithData);
    }
  }

  private async showElevatorMenu(): Promise<void> {
    const maxFloors = this.patronManager.getFloorCount();
    
    // Check if there are multiple floors
    if (maxFloors === 1) {
      // Show message for single floor building
      this.showElevatorMessage("This elevator doesn't seem to go anywhere!");
      return;
    }
    
    // Show floor selection popup
    this.showFloorSelectionPopup();
  }

  private showElevatorMessage(message: string): void {
    // Create temporary message overlay
    const messageContainer = new Container();
    const messageWidth = this.layout.screenWidth * 0.6;
    const messageHeight = this.layout.screenHeight * 0.15;
    
    // Message background
    const messageBg = new Graphics()
      .roundRect(0, 0, messageWidth, messageHeight, 10)
      .fill(0x000000, 0.8)
      .stroke({ width: 2, color: GameConfig.UI_COLORS.WARNING });
    
    // Message text
    const messageText = new Text({
      text: message,
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.BODY),
        fill: GameConfig.UI_COLORS.WARNING,
        align: 'center',
        fontWeight: 'bold'
      }
    });
    messageText.anchor.set(0.5);
    messageText.x = messageWidth / 2;
    messageText.y = messageHeight / 2;
    
    messageContainer.addChild(messageBg, messageText);
    messageContainer.x = this.layout.centerX(messageWidth);
    messageContainer.y = this.layout.centerY(messageHeight);
    
    this.container.addChild(messageContainer);
    
    // Auto-remove message after 2 seconds
    setTimeout(() => {
      if (messageContainer.parent) {
        this.container.removeChild(messageContainer);
        messageContainer.destroy();
      }
    }, 2000);
  }

  private showFloorSelectionPopup(): void {
    const maxFloors = this.patronManager.getFloorCount();
    this.selectedFloorInPopup = this.currentFloor; // Start with current floor selected
    const popupContainer = new Container();
    
    // Semi-transparent background
    const overlay = new Graphics()
      .rect(0, 0, this.layout.screenWidth, this.layout.screenHeight)
      .fill(0x000000, 0.7);
    
    // Popup background
    const popupWidth = 300 * this.layout.scale;
    const popupHeight = 200 * this.layout.scale;
    const popup = new Graphics()
      .rect(0, 0, popupWidth, popupHeight)
      .fill(0x2c3e50)
      .stroke({ width: 3, color: GameConfig.UI_COLORS.ACCENT });
    
    popup.x = this.layout.centerX() - popupWidth / 2;
    popup.y = this.layout.centerY() - popupHeight / 2;
    
    // Title
    const title = new Text({
      text: 'Select Floor',
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.SUBTITLE),
        fill: GameConfig.UI_COLORS.TEXT,
        align: 'center',
        fontWeight: 'bold'
      }
    });
    title.anchor.set(0.5);
    title.x = popupWidth / 2;
    title.y = 30 * this.layout.scale;
    
    // Floor buttons container
    const buttonsContainer = new Container();
    const buttonHeight = 35 * this.layout.scale;
    const buttonSpacing = 10 * this.layout.scale;
    const startY = 70 * this.layout.scale;
    
    for (let floor = 1; floor <= maxFloors; floor++) {
      const isCurrentFloor = floor === this.currentFloor;
      const button = new Graphics()
        .rect(0, 0, popupWidth - (40 * this.layout.scale), buttonHeight)
        .fill(isCurrentFloor ? GameConfig.UI_COLORS.WARNING : GameConfig.UI_COLORS.BUTTON);
      
      button.x = 20 * this.layout.scale;
      button.y = startY + (floor - 1) * (buttonHeight + buttonSpacing);
      
      const buttonText = new Text({
        text: isCurrentFloor ? `Floor ${floor} (Current)` : `Floor ${floor}`,
        style: {
          fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
          fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.UI),
          fill: GameConfig.UI_COLORS.TEXT,
          align: 'center'
        }
      });
      buttonText.anchor.set(0.5);
      buttonText.x = button.width / 2;
      buttonText.y = button.height / 2;
      
      button.addChild(buttonText);
      buttonsContainer.addChild(button);
      
      // Store floor number and button for highlighting
      (button as any).floorNumber = floor;
      (button as any).isCurrentFloor = isCurrentFloor;
      (button as any).buttonText = buttonText;
    }
    
    // Instructions
    const instructions = new Text({
      text: 'Use ↑↓ arrows, 1-' + maxFloors + ', ENTER to select, ESC to cancel',
      style: {
        fontFamily: GameConfig.DEFAULT_FONT_FAMILY,
        fontSize: this.layout.getFontSize(GameConfig.FONT_SIZES.SMALL * 0.8),
        fill: GameConfig.UI_COLORS.SECONDARY,
        align: 'center'
      }
    });
    instructions.anchor.set(0.5);
    instructions.x = popupWidth / 2;
    instructions.y = popupHeight - 20 * this.layout.scale;
    
    popup.addChild(title, buttonsContainer, instructions);
    popupContainer.addChild(overlay, popup);
    this.container.addChild(popupContainer);
    
    // Store references for highlighting
    (this as any).floorSelectionPopup = popupContainer;
    (this as any).floorButtons = buttonsContainer;
    
    // Initial highlight
    this.updateFloorSelectionHighlight();
  }
  
  private updateFloorSelectionHighlight(): void {
    const buttonsContainer = (this as any).floorButtons;
    if (!buttonsContainer) return;
    
    // Update all button styles
    for (let i = 0; i < buttonsContainer.children.length; i++) {
      const button = buttonsContainer.children[i] as Graphics;
      const floor = (button as any).floorNumber;
      const isCurrentFloor = (button as any).isCurrentFloor;
      const isSelected = floor === this.selectedFloorInPopup;
      
      // Clear and redraw button
      button.clear();
      if (isSelected) {
        button.rect(0, 0, button.width, button.height)
              .fill(GameConfig.UI_COLORS.ACCENT);
      } else if (isCurrentFloor) {
        button.rect(0, 0, button.width, button.height)
              .fill(GameConfig.UI_COLORS.WARNING);
      } else {
        button.rect(0, 0, button.width, button.height)
              .fill(GameConfig.UI_COLORS.BUTTON);
      }
    }
  }
  
  private selectFloor(floor: number): void {
    // Remove popup
    if ((this as any).floorSelectionPopup) {
      this.container.removeChild((this as any).floorSelectionPopup);
      (this as any).floorSelectionPopup = null;
    }
    
    // If same floor, just exit
    if (floor === this.currentFloor) {
      return;
    }
    
    // Navigate to selected floor with transition
    this.goToFloor(floor);
  }
  
  private async goToFloor(floor: number): Promise<void> {
    const sceneManager = (this.app as any).sceneManager;
    
    if (sceneManager) {
      // Create new hallway scene with updated floor
      const HallwaySceneWithFloor = class extends HallwayScene {
        constructor(app: Application) {
          super(app);
          (this as any).currentFloor = floor;
        }
      };
      
      // For now, directly switch to the new floor without transition screen
      // TODO: Add floor transition screen later
      await sceneManager.switchTo(HallwaySceneWithFloor);
    }
  }

  onResize(): void {
    // Update player speed for new scale
    this.playerSpeed = this.layout.playerSpeed;
    
    // Clear and recreate all elements
    this.container.removeChildren();
    this.createBackground(GameConfig.PLACEHOLDER_COLORS.FLOOR);
    this.createHallwayLayout();
    this.createPlayer();
    this.createDoors();
    this.createElevator();
    this.createUI();
    this.positionPlayer();
  }
}