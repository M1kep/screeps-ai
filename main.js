require('./prototype.spawn')
require('./prototype.tower')
const roleHarvester = require('./role.harvester')
const roleUpgrader = require('./role.upgrader')
const roleBuilder = require('./role.builder')
const roleRepairer = require('./role.repairer')
const roleAttacker = require('./role.attacker')
const roleTraveler = require('./role.traveler')
const rolePickup = require('./role.pickup')
const roleMiner = require('./role.miner')
const roleHauler = require('./role.hauler')

const telephone = require('./telephone')
// eslint-disable-next-line no-unused-vars
const Traveler = require('./traveler')
global._ = require('./lodash.min')
// var util = require('./util.shared')
const profiler = require('./screeps-profiler')
const minHarvesters = 1
const minBuilders = 2
const minRepairers = 2
const maxUpgraders = 1
const minPickup = 2
const minAttacker = 1

telephone.initializeTelephone()
telephone.requestTelephone('Ratstail91', telephone.TELEPHONE_INFO)
// console.log(telephone.getTelephone('Ratstail91', telephone.TELEPHONE_INFO))
// var roomController = Game.getObjectById('5bbcadfb9099fc012e6383d3')
// protoSpawn.patch()
profiler.enable()
// Creep.prototype.say = (input) => {}
module.exports.loop = function () {
  profiler.wrap(function () {
    // console.log(JSON.stringify(telephone.getTelephone('Ratstail91', telephone.TELEPHONE_INFO)))
    for (const name in Game.creeps) {
      /**
       * @type {Creep}
       */
      const creep = Game.creeps[name]
      switch (creep.memory.role) {
        case 'harvester':
          // util.baseRun(creep, creep.transfer, [Game.spawns.spawn_1, RESOURCE_ENERGY], creep.harvest, creep.pos.findClosestByPath(FIND_SOURCES))
          roleHarvester.run(creep)
          break

        case 'upgrader':
          // util.baseRun(creep, creep.upgradeController, [roomController], creep.harvest, creep.pos.findClosestByPath(FIND_SOURCES))
          roleUpgrader.run(creep)
          break

        case 'builder':
          // util.baseRun(creep, creep.build, [creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)], creep.harvest, creep.pos.findClosestByPath(FIND_SOURCES))
          roleBuilder.run(creep)
          break

        case 'repairer':
          roleRepairer.run(creep)
          break

        case 'attacker':
          roleAttacker.run(creep)
          break

        case 'traveler':
          roleTraveler.run(creep)
          break

        case 'pickupper':
          rolePickup.run(creep)
          break

        case 'miner':
          roleMiner.run(creep)
          break

        case 'hauler':
          roleHauler.run(creep)
          break

        default:
          console.log('NO ROLE: ' + creep.name)
          break
      }
    }

    // find all towers
    /**
     * @type {StructureTower[]}
     */
    const towers = _.filter(Game.structures, s => s.structureType === STRUCTURE_TOWER)
    // for each tower
    for (/** @type {StructureTower} */const tower of towers) {
      // run tower logic
      tower.defend()
    }

    /**
     * @type {Creep[][]}
     */
    const myCreeps = _.groupBy(Game.creeps, (creep) => creep.memory.role)

    // eslint-disable-next-line dot-notation
    const numberOfHarvesters = myCreeps['harvester'] ? myCreeps['harvester'].length : 0
    // eslint-disable-next-line dot-notation
    const numberOfUpgraders = myCreeps['upgrader'] ? myCreeps['upgrader'].length : 0
    // eslint-disable-next-line dot-notation
    const numberOfBuilders = myCreeps['builder'] ? myCreeps['builder'].length : 0
    // eslint-disable-next-line dot-notation
    const numberOfRepairers = myCreeps['repairer'] ? myCreeps['repairer'].length : 0
    // eslint-disable-next-line dot-notation
    const numberOfAttackers = myCreeps['attacker'] ? myCreeps['attacker'].length : 0
    // eslint-disable-next-line dot-notation
    const numberOfPickuppers = myCreeps['pickupper'] ? myCreeps['pickupper'].length : 0

    const energy = Game.spawns.Spawn1.room.energyCapacityAvailable
    let name

    /**
     * @type {Source[]}
     */
    const sources = Game.spawns.Spawn1.room.find(FIND_SOURCES)
    // Get sources and determine if a miner needs to spawn.
    for (const source of sources) {
      // If there are not creeps assigned to source already
      if (!_.some(Game.creeps, c => c.memory.role === 'miner' && c.memory.sourceId === source.id)) {
        // Verify that there is a container for them.
        const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
          filter: s => s.structureType === STRUCTURE_CONTAINER
        })

        if (containers.length > 0) {
          name = Game.spawns.Spawn1.createMiner(source.id, containers[0].id)
          break
        }
      }
    }

    /**
     * @type {StructureContainer[]}
     */
    const containers = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_CONTAINER
    })
    for (const /** @type {StructureContainer} */ aContainer of containers) {
      /**
       * @type {Creep[]}
       */
        // eslint-disable-next-line dot-notation
      const assignedCreep = _.filter(myCreeps['hauler'], (c) => c.memory.containerId === aContainer.id)
      if (assignedCreep.length === 0) {
        name = Game.spawns.Spawn1.createCustomCreep(1300, 'hauler', [CARRY, CARRY, MOVE], {
          role: 'hauler',
          working: false,
          containerId: aContainer.id
        })
        break
      }
    }
    if (name === undefined) {
      switch (true) {
        case numberOfHarvesters < minHarvesters:
          name = Game.spawns.Spawn1.createCustomCreep(energy, 'harvester', undefined, { home: Game.spawns.Spawn1.room.name })
          if (name === ERR_NOT_ENOUGH_ENERGY) {
            name = Game.spawns.Spawn1.createCustomCreep(Game.spawns.Spawn1.room.energyAvailable, 'harvester', undefined, { home: Game.spawns.Spawn1.room.name })
          }
          break

        case numberOfAttackers < minAttacker:
          name = Game.spawns.Spawn1.createCreep([ATTACK, MOVE, ATTACK, MOVE], undefined, {
            role: 'attacker',
            working: false
          })
          break

        case numberOfRepairers < minRepairers:
          name = Game.spawns.Spawn1.createCustomCreep(1300, 'repairer')
          break

        case numberOfBuilders < minBuilders:
          name = Game.spawns.Spawn1.createCustomCreep(1300, 'builder')
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

        case numberOfUpgraders < maxUpgraders:
          name = Game.spawns.Spawn1.createCustomCreep(1300, 'upgrader')
          break
      }
    }
    //   if (numberOfHarvesters < minHarvesters) {
    //     name = Game.spawns.Spawn1.createCustomCreep(energy, 'harvester', undefined, { home: Game.spawns.Spawn1.room.name })
    //     if (name === ERR_NOT_ENOUGH_ENERGY) {
    //       name = Game.spawns.Spawn1.createCustomCreep(Game.spawns.Spawn1.room.energyAvailable, 'harvester', undefined, { home: Game.spawns.Spawn1.room.name })
    //     }
    //   } else if (numberOfAttackers < minAttacker) {
    //     name = Game.spawns.Spawn1.createCreep([ATTACK, MOVE, ATTACK, MOVE], undefined, {
    //       role: 'attacker',
    //       working: false
    //     })
    //   } else if (numberOfRepairers < minRepairers) {
    //     name = Game.spawns.Spawn1.createCustomCreep(energy, 'repairer')
    //     // console.log(name)
    //   } else if (numberOfBuilders < minBuilders) {
    //     name = Game.spawns.Spawn1.createCustomCreep(energy, 'builder')
    //   } else if (numberOfUpgraders < maxUpgraders) {
    //     name = Game.spawns.Spawn1.createCustomCreep(energy, 'upgrader')
    //   }
    // }

    if (_.isString(name)) {
      console.log('Spawned new ' + Game.creeps[name].memory.role + ' creep: ' + name)
    }

    if (!Memory.stats) {
      Memory.stats = {}
    }

    Memory.stats['cpu.getUsed'] = Game.cpu.getUsed()
    Memory.stats['cpu.limit'] = Game.cpu.limit
    Memory.stats['cpu.bucket'] = Game.cpu.bucket

    Memory.stats['gcl.progress'] = Game.gcl.progress
    Memory.stats['gcl.progressTotal'] = Game.gcl.progressTotal
    Memory.stats['gcl.level'] = Game.gcl.level
    _.forEach(Object.keys(Game.rooms), function(roomName){
      let room = Game.rooms[roomName]

      if(room.controller && room.controller.my){
        Memory.stats['rooms.' + roomName + '.rcl.level'] = room.controller.level
        Memory.stats['rooms.' + roomName + '.rcl.progress'] = room.controller.progress
        Memory.stats['rooms.' + roomName + '.rcl.progressTotal'] = room.controller.progressTotal

        Memory.stats['rooms.' + roomName + '.spawn.energy'] = room.energyAvailable
        Memory.stats['rooms.' + roomName + '.spawn.energyTotal'] = room.energyCapacityAvailable

        if(room.storage){
          Memory.stats['rooms.' + roomName + '.storage.energy'] = room.storage.store.energy
        }
      }
    })
  })
}
