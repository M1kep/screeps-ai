import {ROOM_STATE_RCL6} from "../../utils/Internal/Constants";

export class RCL6CreepLimit implements CreepSpawnLimits {
  public roomState: RoomStateConstant = ROOM_STATE_RCL6

  public generateLocalCreepLimits (room: Room): LocalCreepLimits {
    const localLimits: LocalCreepLimits = {
      harvester: 1,
      hauler: 2,
      miner: 3,
      pickupper: 4,
      repairer: 5,
      upgrader: 6
    }
    return localLimits
  }
}
