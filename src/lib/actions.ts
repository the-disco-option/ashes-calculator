import { spec } from '../factory'
import { Item } from '../item'
import { changeRateHandler } from '../target'

export function addBuildTarget(key: string) {
  spec.addTarget(key)
  spec.updateSolution()
}

export function removeBuildTarget(index: number) {
  spec.removeTargetIndex(index)
  spec.updateSolution()
}

export function setBuildTargetAmount(index: number, newAmount: number) {
  const target = spec.buildTargets[index]

  if (!target) {
    throw new Error(`No target at index ${index}`)
  }

  target.setRate(newAmount)
  changeRateHandler(target)()
  spec.updateSolution()
}
