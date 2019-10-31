module.exports = {
  /**
   * @this StructureSpawn
   */
  patch: function () {
    StructureSpawn.prototype.createCustomCreep = function (energy, role, parts, partsCost, memory) {
      if (parts === undefined) {
        parts = [WORK, CARRY, MOVE]
      }
      if (partsCost === undefined) {
        partsCost = 200
      }

      if (memory === undefined) {
        memory = {
          role: role,
          working: false
        }
      }

      const numParts = Math.floor(energy / partsCost)
      var body = []

      if (numParts === 1) {
        body.push(MOVE)
      }

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < numParts; j++) {
          body.push(parts[i])
        }
      }
      return this.createCreep(body, undefined, memory)
    }

    StructureSpawn.prototype.createMiner = function (sourceId, containerId) {
      return this.createCreep([WORK, WORK, WORK, WORK, WORK, MOVE], undefined, {
        role: 'miner',
        sourceId: sourceId,
        containerId: containerId
      })
    }
  }
}
