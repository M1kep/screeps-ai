module.exports = {
  /**
   * @this StructureSpawn
   */
  patch: function () {
    StructureSpawn.prototype.createCustomCreep = function (energy, role) {
      const numParts = Math.floor(energy / 200)
      var body = []
      if(numParts === 1) {
          body.push(MOVE)
      }
      for (let i = 0; i < numParts; i++) {
        body.push(WORK)
      }
      for (let i = 0; i < numParts; i++) {
        body.push(CARRY)
      }
      for (let i = 0; i < numParts; i++) {
        body.push(MOVE)
      }
      return this.createCreep(body, undefined, {
        role: role,
        working: false
      })
    }
  }
}
