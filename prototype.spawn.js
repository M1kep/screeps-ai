module.exports = {
  /**
   * @this StructureSpawn
   */
  patch: function () {
    StructureSpawn.prototype.createCustomCreep = function (energy, role, parts) {
      if(parts === undefined) {
        parts = [WORK, CARRY, MOVE]
      }
      const numParts = Math.floor(energy / 200)
      var body = []

      if(numParts === 1) {
          body.push(MOVE)
      }

      for(let i = 0; i < 3; i++) {
        for(let j = 0; j < numParts; j++) {
          body.push(parts[i])
        }
      }
      return this.createCreep(body, undefined, {
        role: role,
        working: false
      })
    }
  }
}
