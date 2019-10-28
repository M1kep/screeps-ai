/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing'
 *
 * You can import it from another modules like this:
 * var mod = require('util.shared')
 * mod.thing === 'a thing' // true
 */

module.exports = {
  /**
   *
   * @param {Creep} creep
   * @param {Function} workAction
   * @param {Array} workActionParam
   * @param {Function} nonWorkAction
   * @param {Object} nonWorkActionTarget
   */
  baseRun: function (creep, workAction, workActionParam, nonWorkAction, nonWorkActionTarget) {
    if (creep.memory.working === true && creep.carry.energy === 0) {
      creep.memory.working = false
    } else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
      creep.memory.working = true
    }
    if (creep.memory.working === true) {
      // creep.say("U" + creep.carry.energy)
      // creep.memory.task = "upgrade"
      const creepWorkTaskRes = workAction.call(creep, ...workActionParam)
      // console.log("Owner: " + creep.owner.username + " | WorkAction: " + workAction + " | workTaskRes: " + creepWorkTaskRes)
      // console.log("Status(" + creep.name + ") - upgrade: " + creepUpgrade)
      if (creepWorkTaskRes === ERR_NOT_IN_RANGE) {
        if (!creep.fatigue) {
          // TODO: null workActionParam (Builders without places to build)
          const moveRes = creep.moveTo(workActionParam[0], { visualizePathStyle: {} })
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      } else {
        if (!creep.fatigue) {
          const moveRes = creep.moveTo(workActionParam[0], { visualizePathStyle: {} })
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      }
    } else {
      creep.say('H')
      creep.memory.task = 'harvest'
      // var source = creep.pos.findClosestByPath(FIND_SOURCES)
      const nonWorkTaskRes = nonWorkAction.call(creep, nonWorkActionTarget)
      // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
      if (nonWorkTaskRes === ERR_NOT_IN_RANGE) {
        if (!creep.fatigue) {
          const moveRes = creep.moveTo(nonWorkActionTarget, { visualizePathStyle: {} })
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      }
    }
  }
}
