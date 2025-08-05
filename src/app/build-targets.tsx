import { memo, PropsWithChildren, useDeferredValue, useState } from 'react'
import { Item } from '../item'
import { Tooltip, TooltipContent, TooltipTrigger } from '../lib/new-tooltip'

import {
  ItemInterface,
  useFactory,
  useItems,
  BuildTargetInterface,
} from '../lib/atom'
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

  return (
    <div>
      <div>Build Targets</div>
      <input
        value={search}
        placeholder="Type to search items"
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <SearchResultsList search={deferredSearch} onClick={addItem} />
      <BuildTargetList />
    </div>
  )
}

const BuildTargetList = memo(function BuildTargetList_Memo() {
  const [factory] = useFactory()

  return (
    <ul className="list-none p-0">
      {factory.targets.map((buildTarget, i) => (
        <BuildTargetListItem
          key={buildTarget.id}
          buildTarget={buildTarget}
          index={i}
        />
      ))}
      <li>
        <button onClick={() => addBuildTarget('water')}>Add</button>
      </li>
    </ul>
  )
})

const BuildTargetListItem = memo(function BuildTargetListItem_Memo({
  buildTarget,
  index,
}: {
  buildTarget: BuildTargetInterface
  index: number
}) {
  const items = useItems()
  const item = items.find((item) => item.key === buildTarget.itemKey)

  return (
    <li className="mb-3 flex items-center gap-3 rounded-lg border border-gray-600 bg-gray-800 p-3">
      <img
        src={`https://raw.githubusercontent.com/the-disco-option/ashes-calculator-images/refs/heads/main/public/images/${buildTarget.itemKey}.png`}
        height="24px"
        width="24px"
        loading="lazy"
        className="h-6 w-6"
      />
      <span className="text-base font-medium text-white">
        {item?.name || buildTarget.itemKey}
      </span>
      {buildTarget.recipeKey && (
        <span className="text-sm text-gray-400">({buildTarget.recipeKey})</span>
      )}
      <input
        type="number"
        step={1}
        min={1}
        value={buildTarget.count}
        onChange={(e) =>
          setBuildTargetAmount(index, parseInt(e.currentTarget.value))
        }
        className="ml-auto w-20 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      <button
        onClick={() => removeBuildTarget(index)}
        className="rounded bg-red-600 px-2 py-1 text-sm text-white hover:bg-red-700"
      >
        ×
      </button>
    </li>
  )
})

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
    <div className="max-h-40 overflow-y-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-700">
            <th className="px-2 py-1 text-left text-gray-300">Key</th>
            <th className="px-2 py-1 text-left text-gray-300">Name</th>
            <th className="px-2 py-1 text-left text-gray-300">Image</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr
              key={item.key}
              onClick={() => onClick?.(item)}
              className="cursor-pointer border-b border-gray-700 bg-gray-600 hover:bg-gray-500"
            >
              <td className="px-2 py-1">
                <span className="text-gray-200">{item.key}</span>
              </td>
              <td className="px-2 py-1 text-gray-200">{item.name}</td>
              <td className="px-2 py-1">
                <img
                  src={`https://raw.githubusercontent.com/the-disco-option/ashes-calculator-images/refs/heads/main/public/images/${item.key}.png`}
                  height="16px"
                  width="16px"
                  loading="lazy"
                  className="h-4 w-4"
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
