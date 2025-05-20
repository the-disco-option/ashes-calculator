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

function subscribe(callback: () => void) {
  //   spec.addEventListener('buildTargets', callback)
  return () => {
    // spec.removeEventListener('buildTargets', callback)
  }
}

let buildTargets: BuildTarget[] = []

function getSnapshot() {
  return buildTargets //spec.getBuildTargets()
}

function useBuildTargets() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

function DatebaseTab() {
  const [search, setSearch] = useState('')
  const build_targets = useBuildTargets()

  return (
    <ul>
      {build_targets.map((bt) => (
        <li key={bt.itemKey}>{bt.itemKey}</li>
      ))}
    </ul>
  )
}

const SlowTable = memo(function SlowTable({
  search,
  setItem,
}: {
  search: string
  setItem?: (item: Item) => void
}) {
  const items = spec.items ? [...spec.items.values()] : []

  const filteredItems = items.filter(
    (item) => item.key.includes(search) || item.name.includes(search)
  )

  return (
    <table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Name</th>
          <th>Image</th>
        </tr>
      </thead>
      <tbody>
        {filteredItems.map((item) => (
          <tr key={item.key} onClick={() => setItem?.(item)}>
            <td>
              <ItemTooltip item={item}>
                <span>{item.key}</span>
              </ItemTooltip>
            </td>
            <td>{item.name}</td>
            <td>
              <img
                src={`https://raw.githubusercontent.com/the-disco-option/ashes-calculator-images/refs/heads/main/public/images/${item.key}.png`}
                height="16px"
                width="16px"
                loading="lazy"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
})

function ItemTooltip({ children, item }: { item: Item } & PropsWithChildren) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent style={{ backgroundColor: 'black', padding: '10px' }}>
        {item.name}
      </TooltipContent>
    </Tooltip>
  )
}

export function initBuildTargets() {
  const root_el = document.querySelector('#react-build-targets')
  if (!root_el) {
    throw new Error('root missing')
  }
  const root = createRoot(root_el)
  root.render(<DatebaseTab />)
}
