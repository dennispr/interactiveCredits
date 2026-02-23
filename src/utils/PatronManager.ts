import { Patron, BuildingLayout, Floor, Room, RoomPosition } from '../types/GameTypes';
import { GameConfig } from '../config/GameConfig';
import patronsData from '../data/patrons.json';

export class PatronManager {
  private patrons: Patron[] = [];
  private building: BuildingLayout = { floors: [] };

  constructor() {
    this.loadPatrons();
    this.generateBuilding();
  }

  private loadPatrons(): void {
    this.patrons = patronsData.patrons as Patron[];
    console.log(`📋 Loaded ${this.patrons.length} patrons`);
  }

  private generateBuilding(): void {
    // Clear existing building
    this.building.floors = [];
    
    // Separate patrons with specific room assignments from those without
    const assignedPatrons = this.patrons.filter(p => p.floor !== undefined && p.roomNumber !== undefined);
    const unassignedPatrons = this.patrons.filter(p => p.floor === undefined || p.roomNumber === undefined);
    
    // Determine how many floors we need
    const maxAssignedFloor = assignedPatrons.reduce((max, p) => Math.max(max, p.floor || 0), 0);
    const totalPatrons = this.patrons.length;
    const roomsNeeded = totalPatrons;
    const floorsNeeded = Math.max(
      Math.ceil(roomsNeeded / GameConfig.ROOMS_PER_FLOOR),
      maxAssignedFloor,
      1
    );
    
    // Initialize floors
    for (let floorNum = 1; floorNum <= Math.min(floorsNeeded, GameConfig.MAX_FLOORS); floorNum++) {
      const floor: Floor = {
        floorNumber: floorNum,
        rooms: []
      };
      
      // Initialize rooms for this floor
      for (let roomNum = 1; roomNum <= GameConfig.ROOMS_PER_FLOOR; roomNum++) {
        const room: Room = {
          roomNumber: roomNum,
          patron: null,
          isEmpty: true
        };
        floor.rooms.push(room);
      }
      
      this.building.floors.push(floor);
    }
    
    // Assign patrons with specific room assignments first
    for (const patron of assignedPatrons) {
      if (patron.floor && patron.roomNumber) {
        const floor = this.building.floors.find(f => f.floorNumber === patron.floor);
        if (floor) {
          const room = floor.rooms.find(r => r.roomNumber === patron.roomNumber);
          if (room && room.isEmpty) {
            room.patron = patron;
            room.isEmpty = false;
          } else {
            console.warn(`Room ${patron.floor}-${patron.roomNumber} is already occupied or doesn't exist for patron ${patron.name}`);
          }
        }
      }
    }
    
    // Assign remaining patrons to available rooms sequentially
    let currentFloorIndex = 0;
    let currentRoomIndex = 0;
    
    for (const patron of unassignedPatrons) {
      // Find next available room
      let roomAssigned = false;
      
      while (currentFloorIndex < this.building.floors.length && !roomAssigned) {
        const floor = this.building.floors[currentFloorIndex];
        
        while (currentRoomIndex < floor.rooms.length && !roomAssigned) {
          const room = floor.rooms[currentRoomIndex];
          
          if (room.isEmpty) {
            room.patron = patron;
            room.isEmpty = false;
            roomAssigned = true;
            console.log(`🏠 Assigned ${patron.name} to Floor ${floor.floorNumber}, Room ${room.roomNumber}`);
          }
          
          currentRoomIndex++;
        }
        
        if (!roomAssigned) {
          currentFloorIndex++;
          currentRoomIndex = 0;
        }
      }
      
      if (!roomAssigned) {
        console.warn(`Could not assign room for patron ${patron.name} - building is full`);
      }
    }
    
    console.log(`🏢 Generated building with ${this.building.floors.length} floors`);
  }

  getPatrons(): Patron[] {
    return [...this.patrons];
  }

  getBuilding(): BuildingLayout {
    return this.building;
  }

  getPatronById(id: string): Patron | undefined {
    return this.patrons.find(p => p.id === id);
  }

  getPatronInRoom(floor: number, roomNumber: number): Patron | null {
    const floorData = this.building.floors.find(f => f.floorNumber === floor);
    if (!floorData) return null;
    
    const room = floorData.rooms.find(r => r.roomNumber === roomNumber);
    return room ? room.patron : null;
  }

  getFloorCount(): number {
    return this.building.floors.length;
  }

  getRoomCount(floor: number): number {
    const floorData = this.building.floors.find(f => f.floorNumber === floor);
    return floorData ? floorData.rooms.length : 0;
  }

  isRoomEmpty(floor: number, roomNumber: number): boolean {
    const floorData = this.building.floors.find(f => f.floorNumber === floor);
    if (!floorData) return true;
    
    const room = floorData.rooms.find(r => r.roomNumber === roomNumber);
    return room ? room.isEmpty : true;
  }

  getAllOccupiedRooms(): RoomPosition[] {
    const occupiedRooms: RoomPosition[] = [];
    
    for (const floor of this.building.floors) {
      for (const room of floor.rooms) {
        if (!room.isEmpty && room.patron) {
          occupiedRooms.push({
            floor: floor.floorNumber,
            roomNumber: room.roomNumber
          });
        }
      }
    }
    
    return occupiedRooms;
  }
}