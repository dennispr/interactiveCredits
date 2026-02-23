export const GameConfig = {
  // Screen dimensions
  SCREEN_WIDTH: 1200,
  SCREEN_HEIGHT: 800,
  
  // Room dimensions (16:9 aspect ratio as requested)
  ROOM_WIDTH: 800,
  ROOM_HEIGHT: 450,
  
  // Colors
  BACKGROUND_COLOR: 0x1a1a2e,
  
  // Building layout
  ROOMS_PER_FLOOR: 3,
  MAX_FLOORS: 5,
  
  // Player settings
  PLAYER_SPEED: 150, // pixels per second
  PLAYER_WIDTH: 32,
  PLAYER_HEIGHT: 90, // 75% of door height (120)
  
  // NPC settings
  NPC_SPEED: 50, // pixels per second
  NPC_WIDTH: 32,
  NPC_HEIGHT: 48,
  NPC_PACE_DISTANCE: 100, // how far NPCs pace in their rooms
  
  // Interaction settings
  INTERACTION_DISTANCE: 50,
  
  // UI colors
  UI_COLORS: {
    PRIMARY: 0x4a90e2,
    SECONDARY: 0x7b68ee,
    ACCENT: 0xffd700,
    TEXT: 0xffffff,
    BUTTON: 0x2c3e50,
    BUTTON_HOVER: 0x34495e,
    DANGER: 0xe74c3c,
    SUCCESS: 0x27ae60,
    WARNING: 0xf39c12,
  },
  
  // Placeholder colors for assets
  PLACEHOLDER_COLORS: {
    NPC: 0xff6b6b,        // Red-ish for NPCs
    ITEM: 0x4ecdc4,       // Teal for items
    POSTER: 0x45b7d1,     // Blue for posters
    BACKGROUND: 0x96ceb4, // Green for backgrounds
    DOOR: 0x6c5ce7,       // Purple for doors
    WALL: 0x95a5a6,       // Gray for walls
    FLOOR: 0x8d6e63,      // Brown for floors
  },
  
  // Animation timings (in milliseconds)
  FADE_DURATION: 1000,
  TRANSITION_DURATION: 500,
  
  // Text settings
  DEFAULT_FONT_FAMILY: 'Arial, sans-serif',
  FONT_SIZES: {
    TITLE: 48,
    SUBTITLE: 24,
    BODY: 18,
    SMALL: 14,
    UI: 16,
  },
} as const;