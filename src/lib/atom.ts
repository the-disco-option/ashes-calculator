import { atomWithImmer } from 'jotai-immer'
import { atom, createStore, useAtom } from 'jotai'
import { memo, useDeferredValue, useState, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import { BuildTarget } from '../target'
import { Item } from '../item'
import { TargetInterface } from './TargetInterface'
import { Rational } from '../rational'

export interface BuildTargetInterface {
  id: string
  itemKey: string
  count: number
  recipeKey?: string
}

export interface ItemInterface {
  key: string
  name: string
  /** Indicatates if this should be listed as a raw or primary material, or as an intermediate */
  isRaw: boolean
}

export interface FactoryAtomInterface {
  targets: BuildTargetInterface[]
  items: ItemInterface[]
  results: ResultInterface[]
}

export interface ResultInterface {
  item: ItemInterface
  amount: Rational
}

export interface ResultsAtomInterface {
  results: ResultInterface[]
}

export const factoryAtom = atomWithImmer<FactoryAtomInterface>({
  targets: [],
  items: [],
  results: [],
})

export const resultsAtom = atomWithImmer<ResultsAtomInterface>({
  results: [],
})

const craftedItemsAtom = atom((get) => {
  const { results, targets } = get(factoryAtom)
  console.log(results, targets)
  return results.filter(
    (res) => !targets.some((item) => item.itemKey === res.item.key)
  )
})

const rawResultsAtom = atom((get) => {
  const results = get(craftedItemsAtom)
  const rawCosts = results
    .filter((res) => res.item.isRaw)
    .filter((res) => res.item.key != 'fuel')
  const fuelCost = results.find((res) => res.item.key == 'fuel')
  return { rawCosts, fuelCost }
})

export const useResults = () => useAtom(craftedItemsAtom)
export const useRawResults = () => useAtom(rawResultsAtom)

export const itemAtom = atom((get) => {
  return get(factoryAtom).items
})

export const factoryStore = createStore()

export const useFactory = () => useAtom(factoryAtom)

export const useItems = () => useAtom(itemAtom)[0]

// TODO: add handlers for the React side

// bridge actions are used by the core js code to update the store. Don't call from react.
export const bridge_addBuildingTarget = (target: BuildTarget) => {
  factoryStore.set(factoryAtom, (draft) => {
    draft.targets.push({
      itemKey: target.itemKey,
      recipeKey: target.recipe?.key,
      count: target.rate.toFloat() * 60,
      id: crypto.randomUUID(),
    })
  })
}

export const bridge_removeBuildingTarget = (index: number) => {
  factoryStore.set(factoryAtom, (draft) => {
    draft.targets.splice(index, 1)
  })
}

export const bridge_updateBuildingTarget = (target: BuildTarget) => {
  factoryStore.set(factoryAtom, (draft) => {
    const target_ = draft.targets.at(target.index)
    if (!target_) {
      return
    }
    target_.count = target.rate.toFloat() * 60
    target_.itemKey = target.itemKey
    target_.recipeKey = target.recipe?.key
  })
}

export const bridge_clearBuildingTargets = () => {
  factoryStore.set(factoryAtom, (draft) => {
    draft.targets = []
  })
}

export const bridge_setItems = (items: Iterable<Item>) => {
  factoryStore.set(factoryAtom, (draft) => {
    draft.items = []
    for (const itemClass of items) {
      draft.items.push({
        key: itemClass.key,
        name: itemClass.name,
        isRaw: itemClass.isRawMaterial,
      } satisfies ItemInterface)
    }
  })
}

export const bridge_setResults = (results: Iterable<TargetInterface>) => {
  factoryStore.set(factoryAtom, (draft) => {
    draft.results = []
    for (const { item, rate, recipe } of results) {
      const { key, name, isRawMaterial } = item
      draft.results.push({
        item: { key, name, isRaw: isRawMaterial },
        amount: rate,
      })
    }
  })
}
