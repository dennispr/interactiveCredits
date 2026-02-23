import { GameConfig } from './GameConfig';

export interface LayoutDimensions {
  screenWidth: number;
  screenHeight: number;
  roomWidth: number;
  roomHeight: number;
  scale: number;
}

interface AnimatedDimensions extends LayoutDimensions {
  isAnimating: boolean;
}

export class Layout {
  private static instance: Layout;
  private dimensions: LayoutDimensions;
  private animatedDimensions: AnimatedDimensions;
  private baseWidth = GameConfig.SCREEN_WIDTH;
  private baseHeight = GameConfig.SCREEN_HEIGHT;
  private animationId: number | null = null;
  private bounceSettings = {
    duration: 300, // ms
    elasticity: 0.3,
    damping: 0.8
  };

  private constructor() {
    this.dimensions = this.calculateDimensions();
    this.animatedDimensions = { ...this.dimensions, isAnimating: false };
    this.setupResizeListener();
  }

  static getInstance(): Layout {
    if (!Layout.instance) {
      Layout.instance = new Layout();
    }
    return Layout.instance;
  }

  private calculateDimensions(): LayoutDimensions {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Calculate scale to fit screen while maintaining aspect ratio
    const scaleX = windowWidth / this.baseWidth;
    const scaleY = windowHeight / this.baseHeight;
    const scale = Math.min(scaleX, scaleY, 1.2); // Cap at 120% for readability
    
    const screenWidth = this.baseWidth * scale;
    const screenHeight = this.baseHeight * scale;
    
    // Room dimensions scale proportionally
    const roomWidth = GameConfig.ROOM_WIDTH * scale;
    const roomHeight = GameConfig.ROOM_HEIGHT * scale;

    return {
      screenWidth,
      screenHeight,
      roomWidth,
      roomHeight,
      scale
    };
  }

  private setupResizeListener(): void {
    window.addEventListener('resize', () => {
      const newDimensions = this.calculateDimensions();
      this.animateToNewDimensions(newDimensions);
    });
  }

  private animateToNewDimensions(targetDimensions: LayoutDimensions): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    const startDimensions = { ...this.animatedDimensions };
    const startTime = performance.now();
    this.animatedDimensions.isAnimating = true;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.bounceSettings.duration, 1);
      
      // Elastic easing function for bounce effect
      const easeElastic = (t: number): number => {
        if (t === 0 || t === 1) return t;
        const p = 0.3;
        const s = p / (2 * Math.PI) * Math.asin(1);
        return -(Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - s) * (2 * Math.PI) / p));
      };
      
      const easedProgress = progress < 1 ? 1 + easeElastic(progress) : 1;
      
      // Interpolate dimensions with bounce
      this.animatedDimensions.screenWidth = startDimensions.screenWidth + 
        (targetDimensions.screenWidth - startDimensions.screenWidth) * easedProgress;
      this.animatedDimensions.screenHeight = startDimensions.screenHeight + 
        (targetDimensions.screenHeight - startDimensions.screenHeight) * easedProgress;
      this.animatedDimensions.roomWidth = startDimensions.roomWidth + 
        (targetDimensions.roomWidth - startDimensions.roomWidth) * easedProgress;
      this.animatedDimensions.roomHeight = startDimensions.roomHeight + 
        (targetDimensions.roomHeight - startDimensions.roomHeight) * easedProgress;
      this.animatedDimensions.scale = startDimensions.scale + 
        (targetDimensions.scale - startDimensions.scale) * easedProgress;

      this.notifyResize();

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.dimensions = targetDimensions;
        this.animatedDimensions = { ...targetDimensions, isAnimating: false };
        this.animationId = null;
        this.notifyResize();
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }

  private resizeCallbacks: Array<(dimensions: LayoutDimensions) => void> = [];

  onResize(callback: (dimensions: LayoutDimensions) => void): void {
    this.resizeCallbacks.push(callback);
  }

  private notifyResize(): void {
    this.resizeCallbacks.forEach(callback => callback(this.dimensions));
  }

  getDimensions(): LayoutDimensions {
    return { ...this.animatedDimensions };
  }

  // Convenience getters - use animated dimensions for smooth transitions
  get screenWidth(): number { return this.animatedDimensions.screenWidth; }
  get screenHeight(): number { return this.animatedDimensions.screenHeight; }
  get roomWidth(): number { return this.animatedDimensions.roomWidth; }
  get roomHeight(): number { return this.animatedDimensions.roomHeight; }
  get scale(): number { return this.animatedDimensions.scale; }

  // Scaled values for UI elements
  get playerWidth(): number { return GameConfig.PLAYER_WIDTH * this.scale; }
  get playerHeight(): number { return GameConfig.PLAYER_HEIGHT * this.scale; }
  get npcWidth(): number { return GameConfig.NPC_WIDTH * this.scale; }
  get npcHeight(): number { return GameConfig.NPC_HEIGHT * this.scale; }
  get interactionDistance(): number { return GameConfig.INTERACTION_DISTANCE * this.scale; }
  get playerSpeed(): number { return GameConfig.PLAYER_SPEED * this.scale; }
  get npcSpeed(): number { return GameConfig.NPC_SPEED * this.scale; }

  // Font sizes that scale with screen size
  getFontSize(baseSize: number): number {
    return Math.max(12, baseSize * this.scale);
  }

  // Positioning helpers
  centerX(width: number = 0): number {
    return (this.screenWidth - width) / 2;
  }

  centerY(height: number = 0): number {
    return (this.screenHeight - height) / 2;
  }

  // Button dimensions
  getButtonSize(): { width: number; height: number } {
    return {
      width: 150 * this.scale,
      height: 50 * this.scale
    };
  }

  // Safe area margins
  get margin(): number {
    return 20 * this.scale;
  }

  // Door dimensions and spacing
  get doorWidth(): number { return 80 * this.scale; }
  get doorHeight(): number { return 120 * this.scale; }
  get doorHandleOffset(): number { return 15 * this.scale; }
  get doorHandleRadius(): number { return 3 * this.scale; }
  get roomLabelOffset(): number { return 20 * this.scale; }
  get occupancyLabelOffset(): number { return 15 * this.scale; }

  // Elevator dimensions
  get elevatorWidth(): number { return 100 * this.scale; }
  get elevatorHeight(): number { return 150 * this.scale; }
  get elevatorButtonRadius(): number { return 15 * this.scale; }
  get elevatorUpButtonY(): number { return 30 * this.scale; }
  get elevatorDownButtonY(): number { return 60 * this.scale; }
  get elevatorFloorIndicatorY(): number { return 90 * this.scale; }
  get elevatorLabelY(): number { return 120 * this.scale; }
  get elevatorMargin(): number { return 50 * this.scale; }

  // UI background dimensions
  get hallwayControlsBackgroundWidth(): number { return 300 * this.scale; }
  get hallwayControlsBackgroundHeight(): number { return 30 * this.scale; }
  get roomControlsBackgroundWidth(): number { return 400 * this.scale; }
  get roomControlsBackgroundHeight(): number { return 30 * this.scale; }
  get controlsBackgroundPadding(): number { return 5 * this.scale; }

  // Player positioning
  get playerStartX(): number { return 100 * this.scale; }
  get playerGroundOffset(): number { return 10 * this.scale; }

  // Room elements
  get itemSize(): number { return 30 * this.scale; }
  get posterWidth(): number { return 60 * this.scale; }
  get posterHeight(): number { return 80 * this.scale; }
  get posterFrameBorder(): number { return 3 * this.scale; }

  // Character features
  get characterFaceY(): number { return 12 * this.scale; }
  get characterFaceRadius(): number { return 3 * this.scale; }
  get tierIndicatorOffset(): number { return 8 * this.scale; }
  get tierIndicatorRadius(): number { return 4 * this.scale; }

  // Movement boundaries
  get hallwaySideMargin(): number { return 50 * this.scale; }
  get roomSideMargin(): number { return 25 * this.scale; }

  // Architecture elements
  get ceilingHeight(): number { return 80 * this.scale; }
}