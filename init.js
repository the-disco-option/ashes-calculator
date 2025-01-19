/**
 * @typedef {Object} Material
 * @property {string} key - The unique identifier for the material.
 * @property {Object} localized_name - The localized names of the material.
 * @property {string} localized_name.en - The English name of the material.
 * @property {number} stack_size - The stack size of the material.
 * @property {string} order - The order string for sorting.
 * @property {string} group - The group the material belongs to.
 * @property {string} subgroup - The subgroup the material belongs to.
 * @property {string} type - The type of the material.
 */

/**
 * @typedef {Object} Building
 * @property {Array} allowed_effects - The allowed effects for the building.
 * @property {Array<string>} crafting_categories - The crafting categories the building can use.
 * @property {number} crafting_speed - The crafting speed of the building.
 * @property {Object} energy_source - The energy source for the building.
 * @property {string} energy_source.fuel_category - The fuel category for the energy source.
 * @property {string} energy_source.type - The type of the energy source.
 * @property {number} energy_usage - The energy usage of the building.
 * @property {string} key - The unique identifier for the building.
 * @property {Object} localized_name - The localized names of the building.
 * @property {string} localized_name.en - The English name of the building.
 * @property {number} module_slots - The number of module slots in the building.
 * @property {number} prod_bonus - The production bonus of the building.
 */

/**
 * @typedef {Object} MiningDrill
 * @property {Object} energy_source - The energy source for the mining drill.
 * @property {Object} energy_source.emissions_per_minute - The emissions per minute for the energy source.
 * @property {number} energy_source.emissions_per_minute.pollution - The pollution emissions per minute.
 * @property {string} energy_source.type - The type of the energy source.
 * @property {number} energy_usage - The energy usage of the mining drill.
 * @property {string} key - The unique identifier for the mining drill.
 * @property {Object} localized_name - The localized names of the mining drill.
 * @property {string} localized_name.en - The English name of the mining drill.
 * @property {number} mining_speed - The mining speed of the drill.
 * @property {number} module_slots - The number of module slots in the mining drill.
 * @property {Array<string>} resource_categories - The resource categories the mining drill can mine.
 * @property {boolean} takes_fluid - A flag indicating if the mining drill takes fluid.
 */

/**
 * @typedef {Object} Recipe
 * @property {boolean} allow_productivity - A flag indicating if productivity modules are allowed.
 * @property {string} category - The category of the recipe.
 * @property {number} energy_required - The energy required to craft the recipe.
 * @property {Array<Object>} ingredients - The ingredients required for the recipe.
 * @property {number} ingredients.amount - The amount of the ingredient.
 * @property {string} ingredients.name - The name of the ingredient.
 * @property {string} key - The unique identifier for the recipe.
 * @property {Object} localized_name - The localized names of the recipe.
 * @property {string} localized_name.en - The English name of the recipe.
 * @property {string} order - The order string for sorting.
 * @property {Array<Object>} results - The results of the recipe.
 * @property {number} results.amount - The amount of the result.
 * @property {string} results.name - The name of the result.
 * @property {string} subgroup - The subgroup the recipe belongs to.
 */

/*Copyright 2019 Kirk McDonald

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/
import { getBelts } from './belt.js'
import { getBuildings } from './building.js'
import { csv } from './csv.js'
import { resetDisplay } from './display.js'
import { spec, resetSpec } from './factory.js'
import { formatSettings, loadSettings } from './fragment.js'
import { getFuel } from './fuel.js'
import { getItemGroups } from './group.js'
import { getSprites } from './icon.js'
import { getItems } from './item.js'
import { getModules } from './module.js'
import { getPlanets } from './planet.js'
import { getRecipes } from './recipe.js'
import {
  currentMod,
  MODIFICATIONS,
  renderDataSetOptions,
  renderSettings,
} from './settings.js'

function reset() {
  window.location.hash = ''
  resetDisplay()
  resetSpec()
}

export function changeMod() {
  let currentSettings = loadSettings('#' + formatSettings())
  currentSettings.delete('data')
  let modName = currentMod()
  reset()
  console.log('settings on reset:', currentSettings)
  loadData(modName, currentSettings)
}

let OIL_EXCLUSION = new Map([
  ['basic', ['advanced-oil-processing']],
  ['coal', ['advanced-oil-processing', 'basic-oil-processing']],
])

function fixLegacySettings(settings) {
  if (
    (settings.has('use_3') || settings.has('min') || settings.has('furnace')) &&
    !settings.has('buildings')
  ) {
    let parts = []
    if (settings.has('min')) {
      let n = settings.get('min')
      if (n === '4') {
        n = '3'
      }
      parts.push('assembling-machine-' + n)
      settings.delete('min')
    } else if (settings.has('use_3')) {
      parts.push('assembling-machine-3')
      settings.delete('use_3')
    }
    if (settings.has('furnace')) {
      parts.push(settings.get('furnace'))
      settings.delete('furnace')
    }
    settings.set('buildings', parts.join(','))
  }
  if ((settings.has('k') || settings.has('p')) && !settings.has('disable')) {
    let parts = []
    if (settings.has('k')) {
      settings.delete('k')
      parts.push('kovarex-processing')
    }
    if (settings.has('p')) {
      let p = settings.get('p')
      for (let r of OIL_EXCLUSION.get(p)) {
        parts.push(r)
      }
      settings.delete('p')
    }
    settings.set('disable', parts.join(','))
  }
}

export let useLegacyCalculation
const gathering_files = [
  'fishing',
  'herbalism',
  'hunting',
  'lumberjacking',
  'mining',
]
const processing_files = ['metalworking', 'stonemasonry', 'lumbermilling']
const crafting_files = ['carpentry']

const artisan_skills = [
  ...gathering_files,
  ...processing_files,
  ...crafting_files,
]

const refining_skills = [...processing_files, ...crafting_files]

const artisan_tiers = [
  'novice',
  'apprentice',
  'journeyman',
  'master',
  'grandmaster',
]

const other = ['drops', 'vendor']

const file_path_prefix = ['/data/materials/']

/**
 *
 * @returns {Promise<Array<unknown>>}
 */

async function loadMaterials() {
  const data = await Promise.all([
    ...gathering_files.map((file) =>
      csv(file_path_prefix + '/gathering/' + file + '.csv').then((rows) =>
        rows.map((row) => ({ ...row, skill: file }))
      )
    ),
    ...processing_files.map((file) =>
      csv(file_path_prefix + '/processing/' + file + '.csv').then((rows) =>
        rows.map((row) => ({ ...row, skill: file }))
      )
    ),
    ...crafting_files.map((file) =>
      csv(file_path_prefix + '/crafting/' + file + '.csv').then((rows) =>
        rows.map((row) => ({ ...row, skill: file }))
      )
    ),
  ])
  return data.flat()
}

/**
 *
 * @param {Array<unknown>} materials
 * @returns {Array<Material>}
 */
function createItems(materials) {
  return materials.map((d) => ({
    key: d.key,
    localized_name: { en: d.name },
    stack_size: 20,
    order: 'zz[Western Larch Timber]',
    group: 'intermediate-products',
    subgroup: 'science-pack',
    type: 'item',
  }))
}

function createBuildings() {
  return refining_skills.flatMap((skill) =>
    artisan_tiers.map((tier) => ({
      allowed_effects: [],
      crafting_categories: [`${tier}-${skill}`],
      crafting_speed: 1,
      energy_source: {
        fuel_category: 'chemical',
        type: 'burner',
      },
      energy_usage: 1,
      key: `${tier}-${skill}`,
      localized_name: {
        en: `${tier} ${skill}`,
      },
      module_slots: 0,
      prod_bonus: 0,
    }))
  )
}

function createMiningDrills() {
  return gathering_files.flatMap((skill) =>
    artisan_tiers.map((tier) => ({
      energy_source: {
        emissions_per_minute: {
          pollution: 10,
        },
        type: 'electric',
      },
      energy_usage: 0,
      key: `${tier}-${skill}`,
      localized_name: {
        en: `${tier} ${skill}`,
      },
      mining_speed: 1,
      module_slots: 0,
      resource_categories: [`${tier}-${skill}`],
      takes_fluid: false,
    }))
  )
}

const recipe = {
  allow_productivity: false,
  category: 'novice-carpentry',
  energy_required: 1,
  ingredients: [
    {
      amount: 10,
      name: 'western-larch-timber',
    },
  ],
  key: 'western-larch-caravan-carriage',
  localized_name: {
    en: 'Western Larch Caravan Carriage',
  },
  order: 'a[items]-a[Western Larch Caravan Carriage]',
  results: [
    {
      amount: 1,
      name: 'western-larch-caravan-carriage',
    },
  ],
  subgroup: 'storage',
  _ashes: true,
}

/**
 *
 * @param {Array<Material>} materials
 * @returns {Array<Recipe>}
 */
function createRecipes(materials) {
  return materials.map((m) => ({
    allow_productivity: false,
    category: 'novice-carpentry',
    energy_required: 1,
    ingredients: [
      {
        amount: 10,
        name: 'western-larch-timber',
      },
    ],
    key: m.key,
    localized_name: {
      en: 'Western Larch Caravan Carriage',
    },
    order: 'a[items]-a[Western Larch Caravan Carriage]',
    results: [
      {
        amount: 1,
        name: m.key,
      },
    ],
    subgroup: 'storage',
  }))
}

async function loadData(modName, settings) {
  let mod = MODIFICATIONS.get(modName)
  useLegacyCalculation = mod.legacy
  let filename = 'data/' + mod.filename

  const materials = await loadMaterials()
  console.log('materials', materials)

  const data = await d3.json(filename, { cache: 'reload' })
  data.items = [...data.items, ...createItems(materials)]
  data.crafting_machines = [...data.crafting_machines, ...createBuildings()] //processing and crafting
  data.mining_drills = [...data.mining_drills, ...createMiningDrills()] //gathering
  data.recipes = [...data.recipes, ...createRecipes(materials)]
  let items = getItems(data)
  let recipes = getRecipes(data, items)
  let planets = getPlanets(data, recipes)
  let modules = getModules(data, items)
  let buildings = getBuildings(data, items)
  let belts = getBelts(data)
  let fuel = getFuel(data, items)
  getSprites(data)
  let itemGroups = getItemGroups(items, data)
  spec.setData(
    items,
    recipes,
    planets,
    modules,
    buildings,
    belts,
    fuel,
    itemGroups
  )

  fixLegacySettings(settings)
  renderSettings(settings)

  spec.updateSolution()
}

export function init() {
  let settings = loadSettings(window.location.hash)
  renderDataSetOptions(settings)
  loadData(currentMod(), settings)
}
