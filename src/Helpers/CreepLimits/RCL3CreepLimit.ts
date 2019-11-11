import {ROOM_STATE_RCL3} from "../../utils/Internal/Constants";

export class RCL3CreepLimit implements CreepSpawnLimits {
  public roomState: RoomStateConstant = ROOM_STATE_RCL3

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
