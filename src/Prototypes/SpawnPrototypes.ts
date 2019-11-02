/**
 *
 * @param {Number} energy
 * @param {String} role
 * @param {BodyPartConstant[]} [parts]
 * @param {CreepMemory} [memory]
 * @returns {ScreepsReturnCode | string}
 */
StructureSpawn.prototype.createCustomCreep = function (energy, role, parts, memory) {
  if (parts === undefined) {
    parts = [WORK, CARRY, MOVE]
  }
  const numParts = parts.length
  const partsCost = this.getSpawnCost(parts)

  memory = { ...{ role: role, working: false, homeRoom: this.name }, ...memory }

  const totalParts = Math.floor(energy / partsCost)
  const body = []

  if (totalParts === 1) {
    body.push(MOVE)
  }

  for (let i = 0; i < numParts; i++) {
    for (let j = 0; j < totalParts; j++) {
      body.push(parts[i])
    }
  }
  return this.createCreep(body, undefined, memory)
}

/**
 *
 * @param {String} sourceId
 * @param {String} containerId
 * @returns {ScreepsReturnCode | string}
 */
StructureSpawn.prototype.createMiner = function (sourceId, containerId) {
  return this.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], undefined, {
    role: 'miner',
    sourceId: sourceId,
    containerId: containerId
  })
}

StructureSpawn.prototype.createLongDistanceHarvester = function (energy, numberOfWorkParts, home, target, sourceId) {
  // create a body with the specified number of WORK parts and one MOVE part per non-MOVE part
  var body = []
  for (let i = 0; i < numberOfWorkParts; i++) {
    body.push(WORK)
  }

  // 150 = 100 (cost of WORK) + 50 (cost of MOVE)
  energy -= 150 * numberOfWorkParts

  var numberOfParts = Math.floor(energy / 100)
  for (let i = 0; i < numberOfParts; i++) {
    body.push(CARRY)
  }
  for (let i = 0; i < numberOfParts + numberOfWorkParts; i++) {
    body.push(MOVE)
  }

  // create creep with the created body
  return this.createCreep(body, undefined, {
    role: 'longDistanceHarvester',
    home: home,
    target: target,
    sourceIndex: sourceIndex,
    working: false
  })
}

/**
 *
 * @param {BodyPartConstant[]} parts
 */
StructureSpawn.prototype.getSpawnCost = function (parts) {
  let partsCost = 0
  parts.forEach((part) => partsCost += BODYPART_COST[part])
  return partsCost
}
