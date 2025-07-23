/*Copyright 2019-2021 Kirk McDonald

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/
import { Icon } from './icon'
import { DisabledRecipe, Recipe } from './recipe'
import * as d3 from 'd3'

export interface ItemData {
  key: string
  localized_name: {
    en: string
    [lang: string]: string
  }
  stack_size: number
  order: string
  group: string
  subgroup: string
  type: string
  isRawMaterial?: boolean
}

export class Item {
  key: string
  name: string
  recipes: Recipe[]
  uses: Recipe[]
  icon: Icon
  phase: string
  disableRecipe: any
  isRawMaterial: boolean = false
  icon_col: undefined
  icon_row: undefined
  group: any
  subgroup: any
  order: any
  constructor(data: ItemData) {
    this.key = data.key
    this.name = data.localized_name.en
    this.phase = 'solid'
    this.recipes = []
    this.uses = []
    this.isRawMaterial = !!data.isRawMaterial

    this.icon_col = undefined
    this.icon_row = undefined
    this.icon = new Icon(this, data.localized_name.en, data.key)

    this.group = data.group
    this.subgroup = data.subgroup
    this.order = data.order

    this.disableRecipe = new DisabledRecipe(this)
  }
  allRecipes() {
    return this.recipes.concat([this.disableRecipe])
  }
  addRecipe(recipe: Recipe) {
    this.recipes.push(recipe)
  }
  addUse(recipe: Recipe) {
    this.uses.push(recipe)
  }
  renderTooltip(extra: any) {
    if (this.recipes.length === 1 && this.recipes[0].name === this.name) {
      return this.recipes[0].renderTooltip(extra)
    }
    let self = this
    let t = d3.create('div').classed('frame', true)
    let header = t.append('h3')
    header.append(() => self.icon.make(32, true))
    header.append(() => new Text(self.name))
    if (extra) {
      t.append(() => extra)
    }
    return t.node()
  }
}

export function getItems(data: { items: ItemData[] }) {
  let items = new Map()
  for (let itemData of data.items) {
    if (!itemData.localized_name) {
      console.log('bad item:', itemData)
      continue
    }
    items.set(itemData.key, new Item(itemData))
  }
  return items
}
