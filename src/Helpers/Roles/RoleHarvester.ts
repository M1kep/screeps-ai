import {RECIEVED_ENERGY, ROLE_HARVESTER} from "../../utils/Internal/Constants";
import {RoleHelper} from "../RoleHelper";
import {CreepHelper} from "../CreepHelper";

export class RoleHarvester implements CreepRoleManager {
  name: RoleConstant = ROLE_HARVESTER;
  run: (creep: Creep) => void = (creep => {
    if (creep.memory.working === true && creep.carry.energy === 0) {
      creep.memory.working = false
    } else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
      creep.memory.working = true
    }
    if (creep.memory.working === true) {
      RoleHelper.harvesterRole_Transfer(creep)
    } else {
      creep.memory.task = 'harvest'
      creep.say('H_H' + creep.carry.energy)
      if (CreepHelper.getEnergy(creep) === RECIEVED_ENERGY) {
        RoleHelper.harvesterRole_Transfer(creep)
      }
    }
  });
}
