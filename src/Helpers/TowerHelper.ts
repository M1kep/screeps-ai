export class TowerHelper {
  public static runDefense(tower: StructureTower): void {
    let target: Creep | null = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
      filter: (c: Creep) => c.getActiveBodyparts(HEAL) > 0
    })
    if(!target) {
      target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
    }

    if (target !== null) {
      tower.attack(target)
    }
  }
}
