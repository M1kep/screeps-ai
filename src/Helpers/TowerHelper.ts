export class TowerHelper {
  public static runDefense(tower: StructureTower): void {
    const target: Creep | null = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)

    if (target !== null) {
      tower.attack(target)
    }
  }
}
