import {ROLE_REMOTEMINER} from "../../utils/Internal/Constants";

export class RoleRemoteMiner implements CreepRoleManager {
  name: RoleConstant = ROLE_REMOTEMINER;
  run: (creep: Creep) => void = creep => {
  };
}
