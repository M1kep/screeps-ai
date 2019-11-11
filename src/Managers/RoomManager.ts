import {MemoryApi} from "../API/MemoryApi";
import {RoomHelper} from "../Helpers/RoomHelper";
import {RoomApi} from "../API/RoomApi";

export class RoomManager {
  public static runRoomManager() {
    RoomHelper.doForMyRooms((room: Room) => {
      this.manageRoom(room)
    })
  }

  public static manageRoom(room: Room) {
    if(Game.time % 5 === 0) {
      RoomApi.setRoomState(room)
    }
  }
}
