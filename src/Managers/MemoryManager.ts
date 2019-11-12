import {MemoryApi} from '../API/MemoryApi'
import {RoomHelper} from "../Helpers/RoomHelper";

export class MemoryManager {
  public static runMemoryManager() {
    this.initMainMemory()

    RoomHelper.doForMyRooms((room: Room) => {
      const isOwnedRoom: boolean = true
      MemoryApi.initRoomMemory(room.name, isOwnedRoom)
    })
  }

  private static initMainMemory() {
    if (!Memory.rooms) {
      Memory.rooms = {}
    }
  }
}
