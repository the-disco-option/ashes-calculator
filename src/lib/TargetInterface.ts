import { Item } from '../item'
import { Rational } from '../rational'
import { Recipe } from '../recipe'

export interface TargetInterface {
  item: Item
  rate: Rational
  recipe: Recipe | null
}

export type TargetTuple = [Item, Rational, Recipe | null]
