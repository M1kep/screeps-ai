export class RoleHelper {
  public static harvesterRole_Transfer(creep: Creep) {
    creep.memory.task = 'transfer'
    creep.say('H_T' + creep.carry.energy)
    // Get Spawn and extensions that need power
    const structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
      filter: (s) => (s.structureType === STRUCTURE_SPAWN ||
        s.structureType === STRUCTURE_EXTENSION ||
        s.structureType === STRUCTURE_TOWER) &&
        s.energy < s.energyCapacity
    }) as StructureSpawn | StructureExtension | StructureTower | null

    // If there are no spawns or extensions that require then give energy to storage if
    // the energy did not come from storage
    // if ((structure === undefined || structure === null) && creep.memory.fromStorage === false) {
    //   structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
    //     filter: (s) => (s.structureType === STRUCTURE_STORAGE) &&
    //       (s.store.energy < s.storeCapacity)
    //   }) as StructureStorage
    // }

    // If there is something to deposit into then do so
    if (structure !== null) {
      const creepTransfer = creep.transfer(structure, RESOURCE_ENERGY)
      // console.log('Status(' + creep.name + ') - transfer: ' + creepTransfer)
      if (creepTransfer === ERR_NOT_IN_RANGE) {
        if (!creep.fatigue) {
          const moveRes = creep.travelTo(structure)
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      }
    }
  }
}
