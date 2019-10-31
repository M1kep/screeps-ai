var roleHarvester = require('./role.harvester')

module.exports = {
  /**
   *
   * @param {Creep} creep
   */
  run: function (creep) {
    const ruinTargets = creep.room.find(FIND_RUINS, {
      filter: (ruin) => Object.entries(ruin.store).length !== 0
    })
    if (creep.memory.working === true && creep.store.getUsedCapacity() === 0 && ruinTargets.length !== 0) {
      creep.memory.working = false
    } else if (creep.memory.working === false && (creep.store.getFreeCapacity() === 0 || ruinTargets.length === 0)) {
      creep.memory.working = true
    } else if (creep.memory.working === true && ruinTargets.length === 0) {
      roleHarvester.run(creep)
    }
    // console.log("Name: " + creep.name + " Working: " + creep.memory.working + " Task: " + creep.memory.task)
    // _.filter(Object.keys(Game.getObjectById('5db5a22181ae6a72d7d7bdee').store), resource => Game.getObjectById('5db5a22181ae6a72d7d7bdee').store[resource] > 0)

    if (creep.memory.working === false) {
      if (ruinTargets.length !== 0 && creep.room.storage !== undefined) {
        creep.memory.task = 'gathering'
        creep.say('Gathering')
        const resources = _.filter(Object.keys(ruinTargets[0].store), resource => ruinTargets[0].store[resource] > 0)
        // console.log("Target: " + ruinTargets[0] + "|| Resouce: " + resources[0] + "|| Ammount: " + ruinTargets[0].store[resources[0]])
        if (creep.withdraw(ruinTargets[0], resources[0]) === ERR_NOT_IN_RANGE) {
          creep.travelTo(ruinTargets[0])
        }
      }
    } else {
      creep.say('Deposit!')
      creep.memory.task = 'deposit'
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
