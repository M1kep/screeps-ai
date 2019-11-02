export class SpawnHelper {
  private static getSpawnCost (parts: BodyPartConstant[]): number {
    let partsCost = 0
    parts.forEach((part) => partsCost += BODYPART_COST[part])
    return partsCost
  }

  public static createCustomCreep (spawn: StructureSpawn, energy: number, role: String, parts?: BodyPartConstant[], memory?: CreepMemory): ScreepsReturnCode | string {
    if (parts === undefined) {
      parts = [WORK, CARRY, MOVE]
    }
    const numParts = parts.length
    const partsCost = this.getSpawnCost(parts)

    memory = { ...{ role: role, working: false, homeRoom: this.name }, ...memory } as CreepMemory

    const totalParts = Math.floor(energy / partsCost)
    const body: BodyPartConstant[] = []

    if (totalParts === 1) {
      body.push(MOVE)
    }

    for (let i = 0; i < numParts; i++) {
      for (let j = 0; j < totalParts; j++) {
        body.push(parts[i])
      }
    }
    return spawn.createCreep(body, undefined, memory)
  }

  public static createMiner (spawn: StructureSpawn, sourceId: string, containerId: string): ScreepsReturnCode | string {
    return spawn.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], undefined, {
      role: 'miner',
      sourceId: sourceId,
      containerId: containerId
    })
  }
}
