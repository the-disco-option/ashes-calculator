import React, {
  memo,
  PropsWithChildren,
  useDeferredValue,
  useState,
} from 'react'
import { createRoot } from 'react-dom/client'
import { spec } from '../factory'
import { Item } from '../item'
import { Tooltip, TooltipContent, TooltipTrigger } from '../lib/new-tooltip'

function DatebaseTab() {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [selectedItem, setItem] = useState<Item | undefined>()

  return (
    <div>
      <h3>Database</h3>
      <div>{selectedItem?.name}</div>
      <div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for item"
        />
        <div className="flex" style={{ display: 'flex' }}>
          <div>
            <div>Items</div>
            <SlowTable search={deferredSearch} setItem={setItem} />
          </div>
          <div>
            <div>Recipes</div>
            <RecipesTable item={selectedItem} />
          </div>
        </div>
      </div>
    </div>
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

const RecipesTable = memo(function SlowTable({ item }: { item?: Item }) {
  const recipes = item ? spec.getUses(item) : []
  console.log(recipes)

  // Group recipes by key
  const recipesByKey = recipes.reduce(
    (acc, recipe) => {
      acc[recipe.key] = acc[recipe.key] || []
      acc[recipe.key].push(recipe)
      return acc
    },
    {} as Record<string, typeof recipes>
  )

  console.log(recipesByKey)

  const dedupedRecipes = Object.values(recipesByKey).map((group) => group[0]) // needs dedupe workaround beacause some items have more than once recipe for it.
  return (
    <div>
      <div>Recipe Item {item?.name}</div>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Ingredients</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {dedupedRecipes.map((recipe) => (
            <tr key={recipe.key}>
              <td>
                {/* <ItemTooltip item={recipe}> */}
                <span>{recipe.key}</span>
                {/* </ItemTooltip> */}
              </td>
              <td>{recipe.ingredients.map((ing) => ing.item.name).join()}</td>
              <td>
                <img
                  src={`https://raw.githubusercontent.com/the-disco-option/ashes-calculator-images/refs/heads/main/public/images/${recipe.key}.png`}
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

export function initDB() {
  const root_el = document.querySelector('.db-component')
  if (!root_el) {
    throw new Error('root missing')
  }
  const root = createRoot(root_el)
  root.render(<DatebaseTab />)
}
