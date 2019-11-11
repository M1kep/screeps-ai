import {MemoryApi} from "./MemoryApi";
import {
  ROOM_STATE_RCL1,
  ROOM_STATE_RCL2,
  ROOM_STATE_RCL3,
  ROOM_STATE_RCL4,
  ROOM_STATE_RCL5,
  ROOM_STATE_RCL6,
  ROOM_STATE_RCL7,
  ROOM_STATE_RCL8
} from "../utils/Internal/Constants";

export class RoomApi {
  public static setRoomState(room: Room) {
    if (!room.controller) {
      throw new Error("No controller located for room " + room.name)
    }
    switch (room.controller.level) {
      case 1: {
        MemoryApi.updateRoomState(room, ROOM_STATE_RCL1)
        break
      }

      case 2: {
        MemoryApi.updateRoomState(room, ROOM_STATE_RCL2)
        break
      }

      case 3: {
        MemoryApi.updateRoomState(room, ROOM_STATE_RCL3)
        break
      }

      case 4: {
        MemoryApi.updateRoomState(room, ROOM_STATE_RCL4)
        break
      }

      case 5: {
        MemoryApi.updateRoomState(room, ROOM_STATE_RCL5)
        break
      }

      case 6: {
        MemoryApi.updateRoomState(room, ROOM_STATE_RCL6)
        break
      }

      case 7: {
        MemoryApi.updateRoomState(room, ROOM_STATE_RCL7)
        break
      }

      case 8: {
        MemoryApi.updateRoomState(room, ROOM_STATE_RCL8)
        break
      }
    }
  }
}
