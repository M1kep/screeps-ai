import {ROLE_ATTACKER} from "../../utils/Internal/Constants";

export class RoleAttacker implements CreepRoleManager {
  name: RoleConstant = ROLE_ATTACKER;
  run: (creep: Creep) => void = creep => {
    const enemies = creep.room.find(FIND_HOSTILE_CREEPS)
    if (!Array.isArray(enemies) || enemies.length) {
      // console.log(enemies[0])
      // console.log('X: ' + enemies[0].pos.x + '| Y: ' + enemies[0].pos.y)
      if (enemies[0].owner.username !== 'Orlet') {
        // console.log(enemies[0].Owner)
        creep.travelTo(enemies[0])
        creep.attack(enemies[0])
      } else if (Game.flags.attack_wait) {
        creep.travelTo(Game.flags.attack_wait)
      }
    } else if (Game.flags.attack_wait) {
      creep.travelTo(Game.flags.attack_wait)
    }
  };
}
