export class SpawnHelper {
  public static getSpawnCost (parts: BodyPartConstant[]): number {
    let partsCost = 0
    parts.forEach(function (part) {
      partsCost += BODYPART_COST[part]
    })
    return partsCost
  }
}
