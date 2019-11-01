var roleHarvester = require('./role.harvester')

module.exports = {
  /**
   *
   * @param {Creep} creep
   */
  run: function (creep) {
    if (creep.memory.working === true && creep.store.getUsedCapacity() === 0) {
      creep.memory.working = false
    } else if (creep.memory.working === false && creep.store.getFreeCapacity() === 0) {
      creep.memory.working = true
    }

    // If there is no target room throw error as that is not supported currently
    if (!creep.memory.targetRoom) {
      throw "No target room for pickupper"
    }

    /**
     *
     * @type {Room}
     */
    const homeRoom = Game.spawns[creep.memory.homeRoom].room
    if (creep.memory.working === false) {
      // If creep is already in room them harvest resources
      if(creep.room.name === creep.memory.targetRoom) {
        console.log("here")
        const ruinTargets = creep.room.find(FIND_RUINS, {
          // filter: (ruin) => Object.entries(ruin.store).length !== 0 && Object.entries()
          filter: function (ruin) {
            const entries = Object.entries(ruin.store)
            return entries.length !== 0 && entries.length !== 1 && ruin.store[RESOURCE_ENERGY] > 0
          }
        })
        if (ruinTargets.length !== 0) {
          creep.memory.task = 'gathering'
          creep.say('🗑️')
          const resources = _.filter(Object.keys(ruinTargets[0].store), resource => ruinTargets[0].store[resource] > 0 && resource !== RESOURCE_ENERGY)
          // console.log("Target: " + ruinTargets[0] + "|| Resouce: " + resources[0] + "|| Ammount: " + ruinTargets[0].store[resources[0]])
          if (creep.withdraw(ruinTargets[0], resources[0]) === ERR_NOT_IN_RANGE) {
            creep.travelTo(ruinTargets[0])
          }
        } else {
          Game.flags['pickup'].remove()
          creep.memory.working = true
        }
      // Otherwise move towards room
      } else {
        if(creep.ticksToLive < 150) {
          creep.suicide()
        } else {
          creep.memory.task = 'travelling'
          creep.say('🏃')
          if (!creep.fatigue) {
            // /**
            //  *
            //  * @type {ExitConstant | ERR_NO_PATH | ERR_INVALID_ARGS}
            //  */
            // const exit = creep.room.findExitTo(creep.memory.targetRoom)
            const moveRes = creep.travelTo(Game.flags['pickup'], { visualizePathStyle: {} })
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      }
    } else {
      // If creep is in home room then deposit, otherwise move to home
      if(creep.room.name === homeRoom.name) {
        console.log('room')
        const creepTransfer = creep.transfer(creep.room.storage, Object.keys(creep.carry)[0])
        // console.log("Status(" + creep.name + ") - upgrade: " + creepTransfer)
        if (creepTransfer === ERR_NOT_IN_RANGE) {
          if (!creep.fatigue) {
            const moveRes = creep.travelTo(creep.room.storage, { visualizePathStyle: {} })
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      } else {
        creep.say('🏃')
        if (!creep.fatigue) {
          const moveRes = creep.travelTo(homeRoom.storage, { visualizePathStyle: {} })
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      }
    }

    // if(creep.room.storage && creep.room.find(FIND_RUINS, )) {
    //  if(creep.memory.working === true) {
    //    creep.memory.task "gathering"
    //    creep.say("Gathering")
    //  } else {

    //  }
    // } else {
    //  roleHarvester.run(creep)
    // }
    // if (creep.memory.working === true) {
    //   creep.memory.task = 'transfer'
    //   creep.say('P_T' + creep.carry.energy)

    // } else {
    //   creep.memory.task = 'harvest'
    //   creep.say('H_H' + creep.carry.energy)
    //   const storage = Game.spawns.Spawn1.room.storage
    //   if (!storage) {
    //     const source = creep.pos.findClosestByPath(FIND_SOURCES)
    //     const creepHarvest = creep.harvest(source)
    //     creep.memory.fromStorage = false
    //     // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
    //     if (creepHarvest === ERR_NOT_IN_RANGE) {
    //       if (!creep.fatigue) {
    //         const moveRes = creep.travelTo(source, { visualizePathStyle: {} })
    //         if (moveRes !== 0) {
    //           console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
    //         }
    //       }
    //     }
    //   } else {

    //     const creepWithdraw = creep.withdraw(storage, RESOURCE_ENERGY)
    //     creep.memory.fromStorage = true
    //     // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
    //     if (creepWithdraw === ERR_NOT_IN_RANGE) {
    //       if (!creep.fatigue) {
    //         const moveRes = creep.travelTo(storage, { visualizePathStyle: {} })
    //         if (moveRes !== 0) {
    //           console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
    //         }
    //       }
    //     }
    //   }
    // }
  }
}
