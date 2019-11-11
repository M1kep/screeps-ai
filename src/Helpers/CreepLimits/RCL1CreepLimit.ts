import {ROOM_STATE_RCL1} from "../../utils/Internal/Constants";
import {MemoryApi} from "../../API/MemoryApi";
import {RoomApi} from "../../API/RoomApi";
import {SpawnHelper} from "../SpawnHelper";

export class RCL1CreepLimit implements CreepSpawnLimits {
  public roomState: RoomStateConstant = ROOM_STATE_RCL1

  public generateLocalCreepLimits (room: Room): LocalCreepLimits {
    const localLimits: LocalCreepLimits = {
      harvester: 1,
      hauler: 0,
      miner: 0,
      pickupper: 0,
      repairer: 0,
      upgrader: 0
    }
    const sourceAccessTiles = MemoryApi.getNumSourceAccessTiles(room.name)

    // const energyCap = room.energyCapacityAvailable
    // const smallMinerCost = SpawnHelper.getSpawnCost([WORK, WORK, WORK, WORK, WORK, MOVE])
    // const largerMinerCost = SpawnHelper.getSpawnCost([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE])
    // localLimits.upgrader = sourceAccessTiles <
    return localLimits
  }
}
