import {ROLE_CLAIMER} from "../../utils/Internal/Constants";

export class RoleClaimer implements CreepRoleManager {
  name: RoleConstant = ROLE_CLAIMER;
  run: (creep: Creep) => void = creep => {

  };
}
