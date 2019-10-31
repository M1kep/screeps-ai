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
      // Get Spawn and extensions that need power
      let structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (s) => (s.structureType === STRUCTURE_SPAWN ||
          s.structureType === STRUCTURE_EXTENSION) &&
          s.energy < s.energyCapacity
      })

      // If there are no spawns or extensions that require then give energy to storage if
      // the energy did not come from storage
      if ((structure === undefined || structure === null) && creep.memory.fromStorage === false) {
        structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
          filter: (s) => (s.structureType === STRUCTURE_STORAGE) &&
            (s.store.energy < s.storeCapacity)
        })
      }

      // If there is something to deposit into then do so
      if (structure !== undefined && structure !== null) {
        console.log('hit again')
        const creepTransfer = creep.transfer(structure, RESOURCE_ENERGY)
        console.log('Status(' + creep.name + ') - transfer: ' + creepTransfer)
        if (creepTransfer === ERR_NOT_IN_RANGE) {
          if (!creep.fatigue) {
            const moveRes = creep.travelTo(structure, { visualizePathStyle: {} })
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      }
    } else {
      creep.memory.task = 'harvest'
      creep.say('H_H' + creep.carry.energy)
      const storage = Game.spawns.Spawn1.room.storage
      // If there is no storage fall back to harvesting sources
      if (!storage) {
        const source = creep.pos.findClosestByPath(FIND_SOURCES)
        const creepHarvest = creep.harvest(source)
        creep.memory.fromStorage = false
        // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
        if (creepHarvest === ERR_NOT_IN_RANGE) {
          if (!creep.fatigue) {
            const moveRes = creep.travelTo(source, { visualizePathStyle: {} })
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
        // Otherwise, get energy from storage
      } else {
        const creepWithdraw = creep.withdraw(storage, RESOURCE_ENERGY)
        creep.memory.fromStorage = true
        if (creepWithdraw === ERR_NOT_IN_RANGE) {
          if (!creep.fatigue) {
            const moveRes = creep.travelTo(storage, { visualizePathStyle: {} })
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      }
    }
  }
}
