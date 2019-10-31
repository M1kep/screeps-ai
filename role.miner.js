/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.miner');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
  /**
   *
   * @param {Creep} creep
   */
  run: function (creep) {
    if (!creep.spawning) {
      /**
       * @type {Source}
       */
      const source = Game.getObjectById(creep.memory.sourceId)

      /**
       * @type {StructureContainer}
       */
      const container = Game.getObjectById(creep.memory.containerId)

      // If on the container then harvest energy
      //    If no energy available, repair container if needed
      // Otherwise Move to container
      if (creep.pos.isEqualTo(container.pos)) {
        if (source.energy > 0) {
          creep.say('⛏️', true)
          creep.harvest(source)
        } else if (container.hits < container.hitsMax && creep.store.energy > 0) {
          creep.say('⚒️', true)
          creep.repair(container)
        }
      } else {
        if (!creep.fatigue) {
          creep.say('🏃', true)
          const moveRes = creep.travelTo(container, { visualizePathStyle: {} })
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      }
    }
  }
}