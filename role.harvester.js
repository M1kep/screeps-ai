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
      let structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (s) => (s.structureType === STRUCTURE_SPAWN ||
          s.structureType === STRUCTURE_EXTENSION) &&
          s.energy < s.energyCapacity
      })

      if ((structure === undefined || structure === null) && creep.memory.fromStorage === false) {
        structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
          filter: (s) => (s.structureType === STRUCTURE_STORAGE) &&
            (s.store.energy < s.storeCapacity)
        })
      }

      if (structure !== undefined && structure !== null) {
        const creepTransfer = creep.transfer(structure, RESOURCE_ENERGY)
        console.log(structure)
        // console.log("Status(" + creep.name + ") - transfer: " + creepTransfer)
        if (creepTransfer === ERR_NOT_IN_RANGE) {
          if (!creep.fatigue) {
            const moveRes = creep.travelTo(structure, { visualizePathStyle: {} })
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      } // Insert backup role here
    } else {
      creep.memory.task = 'harvest'
      creep.say('H_H' + creep.carry.energy)
      const storage = Game.spawns.Spawn1.room.storage
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
      } else {
        const creepWithdraw = creep.withdraw(storage, RESOURCE_ENERGY)
        creep.memory.fromStorage = true
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
      // var source

      // const tombStone = creep.pos.findClosestByPath(FIND_RUINS, {
      //   filter: (r) => r.store.energy !== 0
      // })
      // console.log(tombStone)
      // if (tombStone) {
      //   source = tombStone
      //   const creepWithdraw = creep.withdraw(tombStone, RESOURCE_ENERGY)
      //   if (creepWithdraw === ERR_NOT_IN_RANGE && !creep.fatigue) {
      //     creep.travelTo(tombStone)
      //   }
      // } else {
      // source = creep.pos.findClosestByPath(FIND_SOURCES)
      // const creepHarvest = creep.harvest(source)
      // // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
      // if (creepHarvest === ERR_NOT_IN_RANGE) {
      //   if (!creep.fatigue) {
      //     const moveRes = creep.travelTo(source, { visualizePathStyle: {} })
      //     if (moveRes !== 0) {
      //       console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
      //     }
      //   }
      // }
      // }
    }
  }
}
