var protoSpawn = require('./prototype.spawn')
var roleHarvester = require('./role.harvester')
var roleUpgrader = require('./role.upgrader')
var roleBuilder = require('./role.builder')
var roleRepairer = require('./role.repairer')
var roleAttacker = require('./role.attacker')
var roleTraveler = require('./role.traveler')
var rolePickup = require('./role.pickup')
var telephone = require('./telephone')
var Traveler = require('./traveler');
global._ = require('./lodash.min')
// var util = require('./util.shared')
const profiler = require('./screeps-profiler')
var minHarvesters = 1
var minBuilders = 2
var minRepairers = 2
var maxUpgraders = 1
var minPickup = 0
var minAttacker = 1

telephone.initializeTelephone()
telephone.requestTelephone('Ratstail91', telephone.TELEPHONE_INFO)
// console.log(telephone.getTelephone('Ratstail91', telephone.TELEPHONE_INFO))
// var roomController = Game.getObjectById('5bbcadfb9099fc012e6383d3')
protoSpawn.patch()
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
          break;

        case 'traveler':
          roleTraveler.run(creep)
          break

        case 'pickup':
          rolePickup.run(creep)

        default:
          // console.log('NO ROLE: ' + creep.name)
          break
      }
    }
    const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester')
    const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader')
    const builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder')
    const repairers = _.filter(Game.creeps, (creep) => creep.memory.role === 'repairer')
    const attackers = _.filter(Game.creeps, (creep) => creep.memory.role === 'attacker')
    const pickuppers = _.filter(Game.creeps, (creep) => creep.memory.role === 'pickup')

    const numberOfHarvesters = harvesters.length
    const numberOfUpgraders = upgraders.length
    const numberOfBuilders = builders.length
    const numberOfRepairers = repairers.length
    const numberOfAttackers = attackers.length
    const numberOfPickuppers = pickuppers.length

    const energy = Game.spawns.Spawn1.room.energyCapacityAvailable
    let name

    if (numberOfHarvesters < minHarvesters) {
      name = Game.spawns.Spawn1.createCustomCreep(energy, 'harvester')
      console.log('harvester!')
      if (name === ERR_NOT_ENOUGH_ENERGY) {
        name = Game.spawns.Spawn1.createCustomCreep(Game.spawns.Spawn1.room.energyAvailable, 'harvester')
      }
    } else if (numberOfAttackers < minAttacker) {
      name = Game.spawns.Spawn1.createCreep([ATTACK, MOVE, ATTACK, MOVE], undefined, {
        role: 'attacker',
        working: false
      })
    } else if (numberOfRepairers < minRepairers) {
      console.log('Rpaireere')
      name = Game.spawns.Spawn1.createCustomCreep(energy, 'repairer')
      console.log(name)
    } else if (numberOfBuilders < minBuilders) {
      name = Game.spawns.Spawn1.createCustomCreep(energy, 'builder')
    } else if (numberOfPickuppers < minPickup) {
      name = Game.spawns.Spawn1.createCustomCreep(energy, 'pickup', [MOVE, CARRY, CARRY])
    } else if (numberOfUpgraders < maxUpgraders) {
      name = Game.spawns.Spawn1.createCustomCreep(energy, 'upgrader')
    }

    if (_.isString(name)) {
      console.log('Spawned new ' + Game.creeps[name].memory.role + ' creep: ' + name)
    }
  })
}
