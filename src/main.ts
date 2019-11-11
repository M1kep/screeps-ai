import './utils/Traveler/Traveler'
import * as Profiler from './utils/Profiler/Profiler'
import { ErrorMapper } from './utils/ErrorMapper'
import { TowerHelper } from './Helpers/TowerHelper'
import { RoleManager } from './Managers/RoleManager'
import { SpawnManager } from './Managers/SpawnManager'
import { ConsoleCommands } from './Helpers/ConsoleCommands'
import { MemoryManager } from './Managers/MemoryManager'
import {RoomManager} from "./Managers/RoomManager";

// telephone.initializeTelephone()
// telephone.requestTelephone('Ratstail91', telephone.TELEPHONE_INFO)
// console.log(telephone.getTelephone('Ratstail91', telephone.TELEPHONE_INFO))

// @ts-ignore
global.Profiler = Profiler.init()
ConsoleCommands.init()
export const loop = ErrorMapper.wrapLoop(() => {
  if (Game.time % 15 === 0) {
    for (const i in Memory.creeps) {
      if (!Game.creeps[i]) {
        delete Memory.creeps[i]
      }
    }
  }





  MemoryManager.runMemoryManager()
  RoleManager.handleRoles()
  RoomManager.runRoomManager()
  // find all towers
  const towers = Game.spawns.Spawn1.room.find<StructureTower>(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_TOWER
  })
  // for each tower
  for (/** @type {StructureTower} */const tower of towers) {
    // run tower logic
    TowerHelper.runDefense(tower)
  }

  SpawnManager.handleSpawns()
  if (!Memory.stats) {
    Memory.stats = {}
  }

  Memory.stats['cpu.getUsed'] = Game.cpu.getUsed()
  Memory.stats['cpu.limit'] = Game.cpu.limit
  Memory.stats['cpu.bucket'] = Game.cpu.bucket

  Memory.stats['gcl.progress'] = Game.gcl.progress
  Memory.stats['gcl.progressTotal'] = Game.gcl.progressTotal
  Memory.stats['gcl.level'] = Game.gcl.level
  _.forEach(Object.keys(Game.rooms), function (roomName) {
    const room = Game.rooms[roomName]

    if (room.controller && room.controller.my) {
      Memory.stats['rooms.' + roomName + '.rcl.level'] = room.controller.level
      Memory.stats['rooms.' + roomName + '.rcl.progress'] = room.controller.progress
      Memory.stats['rooms.' + roomName + '.rcl.progressTotal'] = room.controller.progressTotal

      Memory.stats['rooms.' + roomName + '.spawn.energy'] = room.energyAvailable
      Memory.stats['rooms.' + roomName + '.spawn.energyTotal'] = room.energyCapacityAvailable

      if (room.storage) {
        Memory.stats['rooms.' + roomName + '.storage.energy'] = room.storage.store.energy
      }
    }
  })

  RawMemory.segments[99] = JSON.stringify(Memory.stats)
})
