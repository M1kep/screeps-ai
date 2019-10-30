var roleBuilder = require('./role.builder')

module.exports = {
  /**
   *
   * @param {Creep} creep
   */
  run(creep) {
    if (creep.memory.working === true && creep.carry.energy === 0) {
      creep.memory.working = false
    } else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
      creep.memory.working = true
    }
    if (creep.memory.working === true) {
      creep.memory.task = 'repair'
      creep.say('R_R' + creep.carry.energy)
      const structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.hits < s.hitsMax && s.hits < 750000 // && s.structureType !== STRUCTURE_WALL
      })
      console.log(structure)
      if (structure !== null) {
        // console.log('Defined - ' + structure)
        const creepRepair = creep.repair(structure)
        if (creepRepair === ERR_NOT_IN_RANGE) {
          creep.travelTo(structure)
        }
      } else {
        roleBuilder.run(creep)
      }
    } else {
      creep.memory.task = 'harvest'
      creep.say('R_H' + creep.carry.energy)
      const storage = Game.spawns.Spawn1.room.storage
      if (!storage) {
        const source = creep.pos.findClosestByPath(FIND_SOURCES)
        const creepHarvest = creep.harvest(source)
        // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
        if (creepHarvest === ERR_NOT_IN_RANGE) {
          if (!creep.fatigue) {
            const moveRes = creep.travelTo(source, { visualizePathStyle: {} })
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      } else {
        const creepWithdraw = creep.withdraw(storage, RESOURCE_ENERGY)
        // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
        if (creepWithdraw === ERR_NOT_IN_RANGE) {
          if (!creep.fatigue) {
            const moveRes = creep.travelTo(storage, { visualizePathStyle: {} })
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      }
      // if(!source) {
      //   source = creep.pos.findClosestByPath(FIND_SOURCES)
      // }

      // const tombStone = creep.pos.findClosestByPath(FIND_RUINS, {
      //   filter: (r) => r.store.energy !== 0
      // })
      // if (tombStone) {
      //   source = tombStone
      //   const creepWithdraw = creep.withdraw(tombStone, RESOURCE_ENERGY)
      //   if (creepWithdraw === ERR_NOT_IN_RANGE && !creep.fatigue) {
      //     creep.travelTo(tombStone)
      //   }
      // } else {

    }
  }
}
