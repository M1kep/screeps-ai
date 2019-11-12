import {ROLE_HARVESTER} from "../../utils/Internal/Constants";
import {CreepHelper} from "../CreepHelper";

export class RoleUpgrader implements CreepRoleManager {
  name: RoleConstant = ROLE_HARVESTER
  run: (creep: Creep) => void = (creep => {
    if (creep.memory.working === true && creep.carry.energy === 0) {
      creep.memory.working = false
    } else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
      creep.memory.working = true
    }
    if (creep.memory.working === true) {
      creep.say('U_U' + creep.carry.energy)
      creep.memory.task = 'upgrade'
      if (creep.room.controller === undefined) {
        throw new Error('Creep looking for non existent controller')
      }
      const creepUpgrade = creep.upgradeController(creep.room.controller)
      // console.log("Status(" + creep.name + ") - upgrade: " + creepUpgrade)
      if (creepUpgrade === ERR_NOT_IN_RANGE) {
        if (!creep.fatigue) {
          const moveRes = creep.travelTo(creep.room.controller)
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      }
    } else {
      creep.say('U_H' + creep.carry.energy)
      creep.memory.task = 'harvest'
      CreepHelper.getEnergy(creep)

    }
  })
}
