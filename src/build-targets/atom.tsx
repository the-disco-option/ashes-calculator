import { atomWithImmer } from 'jotai-immer'
import { createStore, Provider, useAtom } from 'jotai'
import React, {
  memo,
  PropsWithChildren,
  useDeferredValue,
  useState,
  useSyncExternalStore,
} from 'react'
import { createRoot } from 'react-dom/client'
import { BuildTarget } from '../target'

export interface BuildTargetInterface {
  id: string
  itemKey: string
  count: number
  recipeKey?: string
}

export interface FactoryAtomInterface {
  targets: BuildTargetInterface[]
}

export const factoryAtom = atomWithImmer<FactoryAtomInterface>({ targets: [] })

export const factoryStore = createStore()

export const useFactory = () => useAtom(factoryAtom)

// TODO: add handlers for the React side

// these actions are used by the js code to update the store. Don't call from react.
export const addBuildingTarget = (target: BuildTarget) => {
  factoryStore.set(factoryAtom, (draft) => {
    draft.targets.push({
      itemKey: target.itemKey,
      recipeKey: target.recipe?.key,
      count: target.rate.toFloat() * 60,
      id: crypto.randomUUID(),
    })
  })
}

export const removeBuildingTarget = (index: number) => {
  factoryStore.set(factoryAtom, (draft) => {
    draft.targets.splice(index, 1)
  })
}

export const updateBuildingTarget = (target: BuildTarget) => {
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

export const clearBuildingTargets = () => {
  factoryStore.set(factoryAtom, (draft) => {
    draft.targets = []
  })
}

export function FactoryProvider({ children }: PropsWithChildren) {
  return <Provider store={factoryStore}>{children}</Provider>
}
