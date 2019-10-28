module.exports = {
  /**
   *
   * @param {Creep} creep
   */
  run: function (creep) {
    if (creep.memory.working === true && creep.carry.energy === 0) {
      creep.memory.working = false
    } else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
      creep.memory.working = true
    }
    if (creep.memory.working === true) {
      creep.memory.task = 'transfer'
      creep.say('H_T' + creep.carry.energy)
      const structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (s) => (s.structureType === STRUCTURE_SPAWN ||
          s.structureType === STRUCTURE_EXTENSION) &&
          s.energy < s.energyCapacity
      })
      if (structure !== undefined) {
        const creepTransfer = creep.transfer(structure, RESOURCE_ENERGY)
        // console.log("Status(" + creep.name + ") - transfer: " + creepTransfer)
        if (creepTransfer === ERR_NOT_IN_RANGE) {
          if (!creep.fatigue) {
            const moveRes = creep.moveTo(structure, { visualizePathStyle: {} })
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      }
    } else {
      creep.memory.task = 'harvest'
      creep.say('H_H' + creep.carry.energy)
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
