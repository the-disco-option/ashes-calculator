import React, {
  memo,
  PropsWithChildren,
  useDeferredValue,
  useState,
  useSyncExternalStore,
} from 'react'
import { createRoot } from 'react-dom/client'
import { spec } from '../factory'
import { Item } from '../item'
import { Tooltip, TooltipContent, TooltipTrigger } from '../new-tooltip'
import { BuildTarget } from '../target'
import { FactoryProvider, useFactory } from '../build-targets/atom'

export function BuildTargets() {
  const [search, setSearch] = useState('')
  const [factory] = useFactory()

  return (
    <div>
      <div>Build Targets</div>
      <ul>
        {factory.targets.map((buildTarget, i) => (
          <li key={buildTarget.id}>
            <button onClick={() => spec.removeTargetIndex(i)}>x</button>
            {buildTarget.itemKey}
            {buildTarget.count}
            {buildTarget.recipeKey}
          </li>
        ))}
        <li>
          <button onClick={() => spec.addTarget('water')}>Add</button>
        </li>
      </ul>
    </div>
  )
}
