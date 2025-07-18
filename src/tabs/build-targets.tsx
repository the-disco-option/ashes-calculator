import { memo, PropsWithChildren, useDeferredValue, useState } from 'react'
import { Item } from '../item'
import { Tooltip, TooltipContent, TooltipTrigger } from '../new-tooltip'

import { ItemInterface, useFactory, useItems } from '../build-targets/atom'
import {
  addBuildTarget,
  removeBuildTarget,
  setBuildTargetAmount,
} from '../lib/actions'

export function BuildTargets() {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const addItem = (item: ItemInterface) => {
    console.log('click', item)
    setSearch('')
    addBuildTarget(item.key)
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
      <SearchResultsList search={deferredSearch} onClick={addItem} />
      <ul>
        {factory.targets.map((buildTarget, i) => (
          <li key={buildTarget.id}>
            <button onClick={() => removeBuildTarget(i)}>x</button>
            {buildTarget.itemKey}
            {buildTarget.recipeKey}
            <input
              type="number"
              step={1}
              min={1}
              value={buildTarget.count}
              onChange={(e) =>
                setBuildTargetAmount(i, parseInt(e.currentTarget.value))
              }
            />
          </li>
        ))}
        <li>
          <button onClick={() => addBuildTarget('water')}>Add</button>
        </li>
      </ul>
    </div>
  )
}

const SearchResultsList = memo(function SearchResultsList_Memo({
  search,
  onClick: onClick,
}: {
  search: string
  onClick?: (item: ItemInterface) => void
}) {
  const items = useItems()

  if (search.trim().length < 2) {
    return
  }

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
                <span>{item.key}</span>
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

function ItemTooltip({
  children,
  item,
}: { item: Item | ItemInterface } & PropsWithChildren) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent style={{ backgroundColor: 'black', padding: '10px' }}>
        {item.name}
      </TooltipContent>
    </Tooltip>
  )
}
