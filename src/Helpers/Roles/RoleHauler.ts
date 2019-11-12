import {ROLE_HAULER} from "../../utils/Internal/Constants";

export class RoleHauler implements CreepRoleManager {
  name: RoleConstant = ROLE_HAULER;
  run: (creep: Creep) => void = (creep => {
    if (creep.memory.working === true && creep.carry.energy === 0) {
      creep.memory.working = false
    } else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
      creep.memory.working = true
    }

    if (creep.memory.working) {
      creep.say('🚚', true)
      creep.memory.task = 'deposit'
      // Attempt to transfer energy to storage
      if (creep.room.storage === undefined) {
        throw new Error('creep.room.storage is undefined')
      }
      const creepTransfer = creep.transfer(creep.room.storage, RESOURCE_ENERGY)
      if (creepTransfer === ERR_NOT_IN_RANGE) {
        if (!creep.fatigue) {
          const moveRes = creep.travelTo(creep.room.storage)
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      }
    } else {
      creep.say('🗑️', true)
      const container: StructureContainer | null = Game.getObjectById(creep.memory.containerId)
      if (container === null) {
        throw new Error('Unable to locate container')
      }
      // Get energy from container
      const creepWithdraw = creep.withdraw(container, RESOURCE_ENERGY)
      if (creepWithdraw === ERR_NOT_IN_RANGE) {
        if (!creep.fatigue) {
          const moveRes = creep.travelTo(container)
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      }
    }
  });

}
