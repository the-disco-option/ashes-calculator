import React, {
  memo,
  PropsWithChildren,
  useDeferredValue,
  useState,
} from 'react'
import { createRoot } from 'react-dom/client'
import { spec } from '../factory'
import { Item } from '../item'
import { Tooltip, TooltipContent, TooltipTrigger } from '../new-tooltip'

function DatebaseTab() {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)

  return (
    <div>
      <h3>Database</h3>
      <div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for item"
        />
        <SlowTable search={deferredSearch} />
      </div>
    </div>
  )
}

const SlowTable = memo(function SlowTable({ search }: { search: string }) {
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
          <tr key={item.key}>
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

export function initDB() {
  const root_el = document.querySelector('.db-component')
  if (!root_el) {
    throw new Error('root missing')
  }
  const root = createRoot(root_el)
  root.render(<DatebaseTab />)
}
