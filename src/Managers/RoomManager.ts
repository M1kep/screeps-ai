import {RoomHelper} from "../Helpers/RoomHelper";
import {RoomApi} from "../API/RoomApi";

export class RoomManager {
  public static runRoomManager() {
    RoomHelper.doForOwnedRooms((room: Room) => {
      this.manageRoom(room)
    })
  }

  public static manageRoom(room: Room) {
    if (Game.time % 5 === 0) {
      RoomApi.setRoomState(room)
    }
  }
}
