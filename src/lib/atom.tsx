import { atomWithImmer } from 'jotai-immer'
import { atom, createStore, Provider, useAtom } from 'jotai'
import React, {
  memo,
  PropsWithChildren,
  useDeferredValue,
  useState,
  useSyncExternalStore,
} from 'react'
import { createRoot } from 'react-dom/client'
import { BuildTarget } from '../target'
import { Item } from '../item'

export interface BuildTargetInterface {
  id: string
  itemKey: string
  count: number
  recipeKey?: string
}

export interface ItemInterface {
  key: string
  name: string
}

export interface FactoryAtomInterface {
  targets: BuildTargetInterface[]
  items: ItemInterface[]
}

export const factoryAtom = atomWithImmer<FactoryAtomInterface>({
  targets: [],
  items: [],
})

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
      } satisfies ItemInterface)
    }
  })
}

export function FactoryProvider({ children }: PropsWithChildren) {
  return <Provider store={factoryStore}>{children}</Provider>
}
