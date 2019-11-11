import {ROOM_STATE_RCL7} from "../../utils/Internal/Constants";

export class RCL7CreepLimit implements CreepSpawnLimits {
  public roomState: RoomStateConstant = ROOM_STATE_RCL7

  public generateLocalCreepLimits (room: Room): LocalCreepLimits {
    const localLimits: LocalCreepLimits = {
      harvester: 0,
      hauler: 0,
      miner: 0,
      pickupper: 0,
      repairer: 0,
      upgrader: 0
    }
    return localLimits
  }
}
