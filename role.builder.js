var roleUpgrader = require('./role.upgrader')
var roleHarvester = require('./role.harvester')
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
      creep.say('B_T' + creep.carry.energy)
      const constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
      if (constructionSite !== null) {
        const creepBuild = creep.build(constructionSite)
        // console.log("Status(" + creep.name + ") - transfer: " + creepBuild + " - " + constructionSite.pos.x + ":" + constructionSite.pos.y)
        if (creepBuild === ERR_NOT_IN_RANGE) {
          if (!creep.fatigue) {
            const moveRes = creep.travelTo(constructionSite, { visualizePathStyle: {} })
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      } else {
        roleUpgrader.run(creep)
        // roleHarvester.run(creep)
      }
    } else {
      creep.memory.task = 'harvest'
      creep.say('B_H' + creep.carry.energy)
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
      // var source = creep.pos.findClosestByPath(FIND_SOURCES)
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
      //   const creepHarvest = creep.harvest(source)
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
