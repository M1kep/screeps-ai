module.exports = {
  /**
   *
   * @param {Creep} creep
   */
  run: function (creep) {
    const enemies = creep.room.find(FIND_HOSTILE_CREEPS)
    if (!Array.isArray(enemies) || !enemies.length) {
      // console.log(enemies[0])
      // console.log('X: ' + enemies[0].pos.x + '| Y: ' + enemies[0].pos.y)
      creep.moveTo(enemies[0])
      creep.attack(enemies[0])
    }
  }
}
