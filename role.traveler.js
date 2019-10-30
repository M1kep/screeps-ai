module.exports = {
	/**
	 *
	 * @param {Creep} creep
	 */
	run: function (creep) {
	  const target = Game.flags.investigate
	  if (target) {
		// console.log(enemies[0])
		// console.log('X: ' + enemies[0].pos.x + '| Y: ' + enemies[0].pos.y)
		creep.travelTo(target, {visualizePathStyle: {}})
	  } else if (Game.flags.traveler_wait) {
		// console.log('test')
		creep.travelTo(Game.flags.traveler_wait)
	  }
	}
  }
