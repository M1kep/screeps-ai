var roleBuilder = require('./role.builder')

module.exports = {
  /**
   *
   * @param {Creep} creep
   */
  run (creep) {
    if (creep.memory.working === true && creep.carry.energy === 0) {
      creep.memory.working = false
    } else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
      creep.memory.working = true
    }
    if (creep.memory.working === true) {
      creep.memory.task = 'repair'
      creep.say('R_R' + creep.carry.energy)
      const structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL
      })

      if (structure !== null) {
        console.log('Defined - ' + structure)
        const creepRepair = creep.repair(structure)
        if (creepRepair === ERR_NOT_IN_RANGE) {
          creep.moveTo(structure)
        }
      } else {
        roleBuilder.run(creep)
      }
    } else {
      creep.memory.task = 'harvest'
      creep.say('R_H' + creep.carry.energy)
      var source = creep.pos.findClosestByPath(FIND_SOURCES)
      const creepHarvest = creep.harvest(source)
      // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
      if (creepHarvest === ERR_NOT_IN_RANGE) {
        if (!creep.fatigue) {
          const moveRes = creep.moveTo(source, { visualizePathStyle: {} })
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      }
    }
  }
}
