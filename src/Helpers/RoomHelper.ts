import {MemoryApi} from "../API/MemoryApi";

export class RoomHelper {
  public static getNumAccessTilesForTarget(target: RoomObject): number {
    let accessibleTiles = 0
    const roomTerrain: RoomTerrain = new Room.Terrain(target.pos.roomName)
    for (let y = target.pos.y - 1; y <= target.pos.y + 1; y++) {
      for (let x = target.pos.x - 1; x <= target.pos.x + 1; x++) {
        if (target.pos.x === x && target.pos.y === y) {
          continue
        }
        if (roomTerrain.get(x, y) !== TERRAIN_MASK_WALL) {
          accessibleTiles++
        }
      }
    }
    return accessibleTiles
  }

  public static isOwner(room: Room): boolean {
    if (room.controller !== undefined) {
      return room.controller.my
    } else {
      return false
    }
  }

  public static doForAllRooms(task: (room: Room) => any) {
    _.forEach(Game.rooms, (room: Room) => task(room))
  }

  public static doForMyRooms(task: (room: Room) => any) {
    const ownedRooms: Room[] = MemoryApi.getOwnedRooms()
    _.forEach(ownedRooms, (room: Room) => task(room))
  }

}
