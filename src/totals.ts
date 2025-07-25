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

import { FactorySpecification } from './factory'
import { Item } from './item'
import { Rational } from './rational'
import { Recipe } from './recipe'

function add(map: Map<Item, Rational>, key: Item, rate: Rational) {
  let r = map.get(key)
  if (r === undefined) {
    r = rate
  } else {
    r = r.add(rate)
  }
  map.set(key, r)
}

function set(
  map:
    | Map<Item, Map<Recipe, Rational>>
    | Map<Item, Map<Item, Map<Recipe, Rational>>>,
  key1: Item,
  key2: any,
  value: any
) {
  let submap = map.get(key1)
  if (submap === undefined) {
    submap = new Map()
    map.set(key1, submap)
  }
  submap.set(key2, value)
}

export class Totals {
  consumers: Map<Item, Map<Item, Map<Recipe, Rational>>>
  rates: Map<Recipe, Rational>
  extra: Map<Item, Recipe>
  items: Map<Item, Rational>
  producers: Map<Item, Map<Recipe, Rational>>
  products: Map<Item, Rational>
  proportionate: {
    item: Item
    from: Recipe
    to: Recipe
    rate: Rational
    fuel: boolean
  }[]
  surplus: Map<any, any>
  constructor(
    spec: FactorySpecification,
    products: Map<any, any>,
    rates: Map<any, any>,
    surplus: Map<any, any>,
    extraRecipes: Map<any, any>
  ) {
    this.products = products
    this.rates = rates
    this.surplus = surplus
    this.extra = extraRecipes

    // Construct the rest of the solution-graph. This graph consists of
    // recipe nodes, which point to item nodes, which in turn point to
    // recipe nodes. Each item node and edge contains an item-rate. Each
    // recipe node contains a recipe-rate.
    //
    // The graph begins with resource recipes and ignored items, and ends
    // with the "output" and (possibly) "surplus" pseudo-recipes.

    // Maps item to total item-rate present in the solution.
    this.items = new Map()
    // Maps item to map of {recipe: item-rate} of recipes which produce
    // that item.
    this.producers = new Map()
    // Maps item to map of {recipe: item-rate} of recipes which consume
    // that item.
    this.consumers = new Map()
    for (let [recipe, rate] of rates) {
      for (let ing of recipe.getIngredients()) {
        let itemRate = rate.mul(ing.amount)
        set(this.consumers, ing.item, recipe, itemRate)
        add(this.items, ing.item, itemRate)
      }
      for (let ing of recipe.products) {
        let itemRate = rate.mul(recipe.gives(ing.item))
        set(this.producers, ing.item, recipe, itemRate)
      }
    }
    // List of {item, from, to, rate} links, apportioned proportionately
    // between multiple consumers and producers of each item.
    this.proportionate = []
    for (let [recipe, recipeRate] of rates) {
      let ingredients = recipe.getIngredients()
      for (let i = 0; i < ingredients.length; i++) {
        let ing = ingredients[i]
        let totalRate = this.items.get(ing.item)
        let rate = recipeRate.mul(ing.amount)
        let ratio = rate.div(totalRate)
        let fuel = i >= recipe.ingredients.length
        let subRecipes = spec.getRecipes(ing.item)
        if (extraRecipes.has(ing.item)) {
          subRecipes.push(extraRecipes.get(ing.item))
        }
        for (let subRecipe of subRecipes) {
          if (!rates.has(subRecipe)) {
            continue
          }
          let subRate = rates
            .get(subRecipe)
            .mul(subRecipe.gives(ing.item))
            .mul(ratio)
          this.proportionate.push({
            item: ing.item,
            from: subRecipe,
            to: recipe,
            rate: subRate,
            fuel: fuel,
          })
        }
      }
    }
  }
}
