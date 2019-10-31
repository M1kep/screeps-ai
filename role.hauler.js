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

    if (creep.memory.working) {
      creep.say('🚚', true)
      creep.memory.task = 'deposit'
      // Attempt to transfer energy to storage
      const creepTransfer = creep.transfer(creep.room.storage, RESOURCE_ENERGY)
      if (creepTransfer === ERR_NOT_IN_RANGE) {
        if (!creep.fatigue) {
          const moveRes = creep.travelTo(creep.room.storage, { visualizePathStyle: {} })
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      }
    } else {
      creep.say('🗑️', true)
      const container = Game.getObjectById(creep.memory.containerId)
      // Get energy from container
      const creepWithdraw = creep.withdraw(container, RESOURCE_ENERGY)
      if (creepWithdraw === ERR_NOT_IN_RANGE) {
        if (!creep.fatigue) {
          const moveRes = creep.travelTo(container, { visualizePathStyle: {} })
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      }
    }
  }
}
