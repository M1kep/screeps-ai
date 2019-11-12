import {ROOM_STATE_CREEP_LIMITS} from "../utils/Internal/Interface_Constants";
import {ROLE_MINER} from "../utils/Internal/Constants";
import {SpawnHelper} from '../Helpers/SpawnHelper'
import {MemoryHelper} from "../Helpers/MemoryHelper";

export class SpawnApi {
  private static generateLocalCreepLimits(room: Room): LocalCreepLimits {
    const roomState: RoomStateConstant = room.memory.roomState as RoomStateConstant;
    if (roomState in ROOM_STATE_CREEP_LIMITS) {
      return ROOM_STATE_CREEP_LIMITS[roomState].generateLocalCreepLimits(room)
    }
    throw new Error("Unable to generate local limits - " + roomState)
  }

  public static setCreepLimits(room: Room): void {
    if (!room.memory.creepLimit) {
      throw new Error("No creep limits found")
    }
    MemoryHelper.updateLocalCreepLimits(room.name, this.generateLocalCreepLimits(room))
  }

  public static createCustomCreep(spawn: StructureSpawn, energy: number, role: RoleConstant, parts?: BodyPartConstant[], memory?: CreepMemory): ScreepsReturnCode | string {
    if (parts === undefined) {
      parts = [WORK, CARRY, MOVE]
    }
    const numParts = parts.length
    const partsCost = SpawnHelper.getSpawnCost(parts)

    memory = {...{role: role, working: false, homeRoom: spawn.room.name}, ...memory} as CreepMemory

    const totalParts = Math.floor(energy / partsCost)
    const body: BodyPartConstant[] = []

    if (totalParts === 1) {
      body.push(MOVE)
    }

    for (let i = 0; i < numParts; i++) {
      for (let j = 0; j < totalParts; j++) {
        body.push(parts[i])
      }
    }
    return spawn.createCreep(body, undefined, memory)
  }

  public static createMiner(spawn: StructureSpawn, sourceId: string, containerId: string): ScreepsReturnCode | string {
    return spawn.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], undefined, {
      role: ROLE_MINER,
      sourceId: sourceId,
      containerId: containerId
    })
  }
}
