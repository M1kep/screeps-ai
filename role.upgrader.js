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
      creep.say('U_U' + creep.carry.energy)
      creep.memory.task = 'upgrade'
      const creepUpgrade = creep.upgradeController(creep.room.controller)
      // console.log("Status(" + creep.name + ") - upgrade: " + creepUpgrade)
      if (creepUpgrade === ERR_NOT_IN_RANGE) {
        if (!creep.fatigue) {
          const moveRes = creep.travelTo(creep.room.controller, { visualizePathStyle: {} })
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      }
    } else {
      creep.say('U_H' + creep.carry.energy)
      creep.memory.task = 'harvest'
      const storage = Game.spawns.Spawn1.room.storage
      // const storage = false
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
      // // var source = creep.pos.findClosestByPath(FIND_SOURCES)
      // var source

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
      //   source = Game.spawns.Spawn1.room.storage
      //   const creepHarvest = creep.withdraw(source, RESOURCE_ENERGY)
      //   // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
      //   if (creepHarvest === ERR_NOT_IN_RANGE) {
      //     if (!creep.fatigue) {
      //       const moveRes = creep.travelTo(source, { visualizePathStyle: {} })
      //       if (moveRes !== 0) {
      //         console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
      //       }
      //     }
      //   }
      // }
    }
  }
}
