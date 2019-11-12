import './utils/Traveler/Traveler'
import * as Profiler from './utils/Profiler/Profiler'
import {ErrorMapper} from './utils/ErrorMapper'
import {TowerHelper} from './Helpers/TowerHelper'
import {RoleManager} from './Managers/RoleManager'
import {SpawnManager} from './Managers/SpawnManager'
import {ConsoleCommands} from './Helpers/ConsoleCommands'
import {MemoryManager} from './Managers/MemoryManager'
import {RoomManager} from "./Managers/RoomManager";
import './utils/Internal/RoomVisual'
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
  // // @ts-ignore
  // const planDef = {"name":"E19N28","shard":"shard3","rcl":"2","buildings":{"spawn":{"pos":[{"x":40,"y":38}]},"road":{"pos":[{"x":39,"y":38},{"x":38,"y":37},{"x":37,"y":36},{"x":36,"y":35},{"x":35,"y":34},{"x":34,"y":33},{"x":33,"y":32},{"x":25,"y":32},{"x":26,"y":32},{"x":27,"y":32},{"x":28,"y":32},{"x":29,"y":32},{"x":30,"y":32},{"x":31,"y":32},{"x":32,"y":32},{"x":39,"y":39},{"x":38,"y":40},{"x":37,"y":41},{"x":36,"y":42},{"x":35,"y":43},{"x":34,"y":43},{"x":33,"y":43},{"x":32,"y":43},{"x":31,"y":43},{"x":30,"y":43},{"x":38,"y":39},{"x":39,"y":37},{"x":40,"y":39},{"x":41,"y":39},{"x":41,"y":38},{"x":41,"y":37},{"x":40,"y":37},{"x":38,"y":42},{"x":38,"y":41},{"x":24,"y":32},{"x":22,"y":32},{"x":23,"y":32},{"x":23,"y":31},{"x":20,"y":31},{"x":20,"y":32},{"x":21,"y":32},{"x":29,"y":44},{"x":29,"y":43},{"x":34,"y":33}]},"extension":{"pos":[{"x":37,"y":42},{"x":39,"y":42},{"x":39,"y":43},{"x":37,"y":43},{"x":38,"y":43}]},"container":{"pos":[{"x":41,"y":27}]},"storage":{"pos":[]},"nuker":{"pos":[]},"lab":{"pos":[]},"terminal":{"pos":[]},"extractor":{"pos":[]},"powerSpawn":{"pos":[]},"observer":{"pos":[]},"tower":{"pos":[]},"rampart":{"pos":[{"x":38,"y":30}]},"constructedWall":{"pos":[{"x":44,"y":27}]},"link":{"pos":[]}}}
  //
  // for(const struc in planDef.buildings) {
  // // @ts-ignore
  // planDef.buildings[struc].pos.forEach((pos: { x: number, y: number }) => Game.rooms["E17N28"].visual.structure(pos.x, pos.y, struc))
  // }

  MemoryManager.runMemoryManager()
  RoleManager.handleRoles()
  RoomManager.runRoomManager()
  // find all towers
  const towers = Game.spawns.Spawn1.room.find<StructureTower>(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_TOWER
  })
  // for each tower
  for (const tower of towers) {
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
