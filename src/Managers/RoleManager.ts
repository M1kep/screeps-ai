import {CREEP_ROLE_MANAGERS} from "../utils/Internal/Interface_Constants";

export class RoleManager {
  public static handleRoles() {
    for (const name in Game.creeps) {

      const creep = Game.creeps[name]

      if (creep.spawning) {
        continue
      }

      if (creep.memory.role && creep.memory.role in CREEP_ROLE_MANAGERS) {
        CREEP_ROLE_MANAGERS[creep.memory.role].run(creep)
      } else {
        console.log('NO ROLE: ' + creep.name + ' : ' + creep.memory.role)
      }
    }
  }
}
