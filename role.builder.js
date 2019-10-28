var roleUpgrader = require('./role.upgrader')

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
        // console.log("Status(" + creep.name + ") - transfer: " + creepBuild + " - " + constructionSite)
        if (creepBuild === ERR_NOT_IN_RANGE) {
          if (!creep.fatigue) {
            const moveRes = creep.moveTo(constructionSite, { visualizePathStyle: {} })
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      } else {
        roleUpgrader.run(creep)
      }
    } else {
      creep.memory.task = 'harvest'
      creep.say('B_H' + creep.carry.energy)
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
