import {
  ROLE_BUILDER,
  ROLE_HARVESTER,
  ROLE_HAULER,
  ROLE_MINER,
  ROLE_REPAIRER, ROLE_TRAVELLER, ROLE_UPGRADER
} from "../utils/Internal/Constants";
import {SpawnApi} from '../API/SpawnApi'
import {MemoryApi} from "../API/MemoryApi";

export class SpawnManager {
  public static handleSpawns() {
    for (const spawnName in Game.spawns) {
      const spawnObj = Game.spawns[spawnName]
      if (!spawnObj.spawning) {
        this.doSpawn(Game.spawns[spawnName])
      }
    }
  }

  private static doSpawn(spawn: StructureSpawn) {
    SpawnApi.setCreepLimits(spawn.room)
    const minHarvesters = 1
    const minBuilders = 2
    const minRepairers = 2
    const maxUpgraders = 1
    const minAttacker = 1
    const myCreeps = _.groupBy(Game.creeps, (creep) => creep.memory.role)

    const numberOfHarvesters = myCreeps.harvester ? myCreeps.harvester.length : 0
    const numberOfUpgraders = myCreeps.upgrader ? myCreeps.upgrader.length : 0
    const numberOfBuilders = myCreeps.builder ? myCreeps.builder.length : 0
    const numberOfRepairers = myCreeps.repairer ? myCreeps.repairer.length : 0
    const numberOfAttackers = myCreeps.attacker ? myCreeps.attacker.length : 0
    const numberOfTravellers = myCreeps.traveller ? myCreeps.traveller.length : 0
    // eslint-disable-next-line dot-notation
    // const numberOfPickuppers = myCreeps['pickupper'] ? myCreeps['pickupper'].length : 0

    const energy = spawn.room.energyCapacityAvailable
    let name

    const sources = MemoryApi.getSources(spawn.room.name)
    // Get sources and determine if a miner needs to spawn.
    for (const source of sources) {
      // If there are not creeps assigned to source already
      if (!_.some(Game.creeps, c => c.memory.role === ROLE_MINER && c.memory.sourceId === source.id)) {
        // Verify that there is a container for them.
        const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
          filter: s => s.structureType === STRUCTURE_CONTAINER
        })

        if (containers.length > 0) {
          name = SpawnApi.createMiner(spawn, source.id, containers[0].id)
          if (name === ERR_NOT_ENOUGH_ENERGY) {
            name = undefined
          } else {
            break
          }
        }
      }
    }

    const containers = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_CONTAINER
    }) as StructureContainer[]

    for (const aContainer of containers) {
      // eslint-disable-next-line dot-notation
      const assignedCreep = _.filter(myCreeps[ROLE_HAULER], (c) => c.memory.containerId === aContainer.id)
      if (assignedCreep.length === 0) {
        name = SpawnApi.createCustomCreep(spawn, 1300, ROLE_HAULER, [CARRY, CARRY, MOVE], {
          role: ROLE_HAULER,
          working: false,
          containerId: aContainer.id
        })
        if (name === ERR_NOT_ENOUGH_ENERGY) {
          name = undefined
        } else {
          break
        }
        break
      }
    }
    if (name === undefined) {
      switch (true) {
        case numberOfHarvesters < minHarvesters:
          name = SpawnApi.createCustomCreep(spawn, energy, ROLE_HARVESTER, undefined, {homeRoom: spawn.room.name})
          if (name === ERR_NOT_ENOUGH_ENERGY) {
            name = SpawnApi.createCustomCreep(spawn, spawn.room.energyAvailable, ROLE_HARVESTER, undefined, {homeRoom: Game.spawns.Spawn1.room.name})
          }
          break

        case numberOfAttackers < minAttacker:
          name = Game.spawns.Spawn1.createCreep([ATTACK, MOVE, ATTACK, MOVE], undefined, {
            role: 'attacker',
            working: false
          })
          break

        case numberOfRepairers < minRepairers:
          name = SpawnApi.createCustomCreep(spawn, 1300, ROLE_REPAIRER)
          break

        case numberOfBuilders < minBuilders:
          name = SpawnApi.createCustomCreep(spawn, 1300, ROLE_BUILDER)
          break

        // FALL THROUGH IF NO FLAGS!
        // case numberOfPickuppers < minPickup:
        //   /**
        //    * @type {Flag[]}
        //    */
        //   const pickupFlags = _.filter(Game.flags, (flag) => flag.name === 'pickup')
        //   if (pickupFlags.length !== 0) {
        //     name = Game.spawns.Spawn1.createCustomCreep(1300, 'pickupper', [MOVE, CARRY], { targetRoom: pickupFlags[0].pos.roomName })
        //     break
        //   }

        case Game.flags["traveller_wait"] !== undefined && numberOfTravellers !== 1:
          name = SpawnApi.createCustomCreep(spawn, 50, ROLE_TRAVELLER, [MOVE])
          break

        case numberOfUpgraders < maxUpgraders:
          name = SpawnApi.createCustomCreep(spawn, 1500, ROLE_UPGRADER)
          break
      }
    }

    if (_.isString(name)) {
      console.log('Spawned new ' + Game.creeps[name].memory.role + ' creep: ' + name)
    }
  }
}
