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
import { BuildTarget, changeRateHandler } from '../target'
import { FactoryProvider, useFactory } from '../build-targets/atom'

export function BuildTargets() {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const addItem = (item: Item) => {
    console.log('click', item)
    setSearch('')
    spec.addTarget(item.key)
  }

  const [factory] = useFactory()
  return (
    <div>
      <div>Build Targets</div>
      <input
        value={search}
        placeholder="Type to search items"
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <SlowTable search={deferredSearch} onClick={addItem} />
      <ul>
        {factory.targets.map((buildTarget, i) => (
          <li key={buildTarget.id}>
            <button onClick={() => spec.removeTargetIndex(i)}>x</button>
            {buildTarget.itemKey}
            {buildTarget.recipeKey}
            <input
              type="number"
              step={1}
              min={1}
              value={buildTarget.count}
              onChange={(e) => {
                const target = spec.buildTargets[i]

                target.setRate(parseInt(e.currentTarget.value))
                changeRateHandler(target)()
              }}
            />
          </li>
        ))}
        <li>
          <button onClick={() => spec.addTarget('water')}>Add</button>
        </li>
      </ul>
    </div>
  )
}

const SlowTable = memo(function SlowTable({
  search,
  onClick: onClick,
}: {
  search: string
  onClick?: (item: Item) => void
}) {
  if (search.trim().length === 0) {
    return
  }
  const items = spec.items ? [...spec.items.values()] : []

  const filteredItems = items.filter(
    (item) => item.key.includes(search) || item.name.includes(search)
  )

  return (
    <div style={{ maxHeight: '10rem', overflowY: 'scroll' }}>
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
            <tr
              key={item.key}
              onClick={() => onClick?.(item)}
              style={{ background: 'darkgrey', cursor: 'pointer' }}
            >
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
    </div>
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
