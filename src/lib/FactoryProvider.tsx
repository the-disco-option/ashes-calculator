import { Provider } from 'jotai'
import React, { PropsWithChildren } from 'react'
import { factoryStore } from './atom'

export function FactoryProvider({ children }: PropsWithChildren) {
  return <Provider store={factoryStore}>{children}</Provider>
}
