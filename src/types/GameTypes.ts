export interface Patron {
  id: string;
  name: string;
  
  // Room assignment (optional - if not specified, will be assigned sequentially)
  floor?: number;
  roomNumber?: number; // 1, 2, or 3 (per floor)
  
  // Visual assets (URLs or asset identifiers)
  npcImage?: string;      // PNG for the NPC sprite
  itemImage?: string;     // PNG for the item in the room  
  posterImage?: string;   // PNG for the poster frame
  backgroundImage?: string; // Background image for the room
  
  // Interaction content
  dialogText: string;     // What they say when interacted with
  
  // Optional metadata
  tier?: 'bronze' | 'silver' | 'gold' | 'diamond'; // Could affect room decoration
  joinDate?: string;
  specialNotes?: string;
}

export interface RoomPosition {
  floor: number;
  roomNumber: number; // 1, 2, or 3
}

export interface BuildingLayout {
  floors: Floor[];
}

export interface Floor {
  floorNumber: number;
  rooms: Room[];
}

export interface Room {
  roomNumber: number;
  patron: Patron | null;
  isEmpty: boolean;
}

// Game state interfaces
export interface PlayerState {
  currentFloor: number;
  currentRoom: number | null; // null when in hallway
  position: { x: number; y: number };
}

export interface GameState {
  patrons: Patron[];
  building: BuildingLayout;
  player: PlayerState;
  currentScene: 'start' | 'about' | 'transition' | 'hallway' | 'room' | 'elevator';
}