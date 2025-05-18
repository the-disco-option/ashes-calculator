interface Material {
  key: string
  localized_name: {
    en: string
  }
  stack_size: number
  order: string
  group: string
  subgroup: string
  type: string
}

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
import { getBelts } from './belt'
import { initDB } from './tabs/db'
import { getBuildings } from './building'
import { withKey, csv, slug } from './csv'
import { resetDisplay } from './display'
import { spec, resetSpec } from './factory'
import { formatSettings, loadSettings } from './fragment'
import { getFuel } from './fuel'
import { getItemGroups } from './group'
import { getSprites } from './icon'
import { getItems } from './item'
import { getModules } from './module'
import { getPlanets } from './planet'
import { getRecipes, RecipeInterface } from './recipe'
import {
  currentMod,
  MODIFICATIONS,
  renderDataSetOptions,
  renderSettings,
} from './settings'
import * as d3 from 'd3'

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
const processing_files = [
  'alchemy',
  'animal-husbandry',
  'cooking',
  'farming',
  'lumber-milling',
  'metalworking',
  'stonemasonry',
  'tanning',
  'weaving',
]
const crafting_files = [
  'arcane-engineering',
  'armor-smithing',
  'carpentry',
  'jeweler',
  'leatherworking',
  'fishing',
  'herbalism',
  'hunting',
  'lumberjacking',
  'mining',
  'scribe',
  'tailoring',
  'weapon-smithing',
]

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

const other_skills = ['drops', 'vendor']

const file_path_prefix = ['data/materials']

class ArtisanCategory {
  constructor(name) {
    this.name = name
    this.key = slug(name)
  }
}

class ArtisanSkill {
  /**
   *
   * @param {string} name
   * @param {ArtisanCategory} category
   */
  constructor(name, category) {
    this.name = name
    this.key = slug(name)
    this.category = category
  }

  toString() {
    return this.name
  }
  inspect() {
    return this.toString()
  }
}

class ArtisanResource {
  /**
   *
   * @param {string} name
   * @param {ArtisanCategory} category
   */
  constructor(name, category) {
    this.name = name
    this.key = slug(name)
    this.category = category
  }
}

class ArtisanItem extends ArtisanResource {}

class ArtisanMaterial extends ArtisanResource {}

class ArtiansRecipe {}

const Gathering = new ArtisanCategory('Gathering')
const Processing = new ArtisanCategory('Processing')
const Crafting = new ArtisanCategory('Crafting')
const Other = new ArtisanCategory('Other')

const CategoryMap = new Map([
  [Gathering.key, Gathering],
  [Processing.key, Processing],
  [Crafting.key, Crafting],
  [Other.key, Other],
])

const artisan_skills_list = [
  ...gathering_files.map((skill) => new ArtisanSkill(skill, Gathering)),
  ...processing_files.map((skill) => new ArtisanSkill(skill, Processing)),
  ...crafting_files.map((skill) => new ArtisanSkill(skill, Crafting)),
  ...other_skills.map((skill) => new ArtisanSkill(skill, Other)),
]

async function loadMaterials() {
  const data = await Promise.all([
    ...artisan_skills_list.map((skill) =>
      csv(`${file_path_prefix}/${skill.category.key}/${skill.key}.csv`).then(
        (rows) =>
          rows.map((row) => ({ ...row, skill: skill, key: slug(row.name) }))
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
  return refining_skills
    .filter((skill) =>
      gathering_files.find((gathering_skill) => skill != gathering_skill)
    )
    .flatMap((skill) =>
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
        skill: skill,
      }))
    )
}

function createMiningDrills() {
  const buildings = gathering_files.flatMap((skill) =>
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
      skill: skill,
    }))
  )
  buildings.push({
    energy_source: {
      emissions_per_minute: {
        pollution: 10,
      },
      type: 'electric',
    },
    energy_usage: 0,
    key: `vendor`,
    localized_name: {
      en: `Vendor Item`,
    },
    mining_speed: 1,
    module_slots: 0,
    resource_categories: [`vendor`],
    takes_fluid: false,
  })
  buildings.push({
    energy_source: {
      emissions_per_minute: {
        pollution: 10,
      },
      type: 'electric',
    },
    energy_usage: 0,
    key: `vendor`,
    localized_name: {
      en: `Monster Drop`,
    },
    mining_speed: 1,
    module_slots: 0,
    resource_categories: [`drops`],
    takes_fluid: false,
  })
  return buildings
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

function logAndPass(obj) {
  console.log(obj)
  return obj
}

function parseIngredient(m, n) {
  const amount = parseInt(m[`amount${n}`])
  const name = m[`material${n}`]
  if (typeof name === 'string' && name.length > 0) {
    return { amount: amount, name: slug(name) }
  }
}

// some recipies return more than one item at a time
// todo: support separate output items
function parseAmount(m) {
  const output = parseInt(m[`output`])
  if (Number.isFinite(output)) {
    return output
  } else {
    return 1
  }
}

function fillIngredients(m) {
  const ingredients = []
  let n = 1

  while (true) {
    const ingredient = parseIngredient(m, n)
    if (ingredient) {
      ingredients.push(ingredient)
      n++
    } else {
      break
    }
  }

  return ingredients
}

function createRecipes(materials: Array<Material>) {
  return materials
    .filter((mat) => mat.skill.category != Gathering)
    .filter(
      (mat) =>
        typeof mat['material1'] == 'string' && typeof mat['amount1'] == 'string'
    )
    .map((m) => ({
      allow_productivity: false,
      category: `${slug(m.level)}-${m.skill.key}`,
      energy_required: 1,
      ingredients: fillIngredients(m),
      key: m.key,
      localized_name: {
        en: m.name,
      },
      order: 'a[items]-a[Western Larch Caravan Carriage]',
      results: [
        {
          amount: parseAmount(m),
          name: m.key,
        },
      ],
      subgroup: 'storage',
    }))
}

async function loadSkills() {
  const skills_raw = await csv(`data/skills.csv`)

  const skills = skills_raw.map(
    (m) => new ArtisanSkill(m.name, CategoryMap.get(m.category))
  )
  return skills
}

interface RawVendorItem {
  name: string
  buyprice: string
}

interface RawVendor {
  name: string
  desc: string
}

interface Vendor {
  id: string
  name: string
  desc: string
}

async function loadVendors() {
  const vendors: Vendor[] = (await csv(`data/vendors.csv`)).map(
    (fields: RawVendor) => ({ id: slug(fields.name), ...fields })
  )
  const wares = await Promise.all(
    vendors.map(async (vendor) =>
      (await csv(`data/vendors/${vendor.id}.csv`)).map(
        (fields: RawVendorItem) => ({ id: slug(fields.name), ...fields })
      )
    )
  )

  return [vendors, wares.flat(1)]
}

function createResources(materials) {
  const res = materials
    .filter((m) => m.skill.category == Gathering || m.skill.category == Other)
    .map((m) => ({
      icon: m.key,
      key: m.key,
      localized_name: {
        en: m.name,
      },
      category:
        m.skill.category == Other
          ? m.skill.key
          : `${slug(m.level)}-${m.skill.key}`,
      mining_time: 1,
      results: [
        {
          amount: 1,
          name: m.key,
        },
      ],
    }))
  return res
}

async function loadData(modName, settings) {
  let mod = MODIFICATIONS.get(modName)
  useLegacyCalculation = mod.legacy
  let filename = 'data/' + mod.filename

  const vendors = await loadVendors()
  console.log(vendors)

  const skills = await loadSkills()
  console.log('skills', skills)

  const materials = await loadMaterials()
  console.log('materials', materials)

  const data = await d3.json(filename, { cache: 'reload' })
  data.items = [...data.items, ...createItems(materials)]
  data.crafting_machines = [...data.crafting_machines, ...createBuildings()] //processing and crafting
  data.mining_drills = [...data.mining_drills, ...createMiningDrills()] //gathering
  data.recipes = [...data.recipes, ...createRecipes(materials)]
  data.resources = [...data.resources, ...createResources(materials)]
  let items = getItems(data)
  let recipes = getRecipes(data, items)
  let planets = getPlanets(data, recipes)
  let modules = getModules(data, items)
  let buildings = getBuildings(data, items)
  let belts = getBelts(data)
  let fuel = getFuel(data, items)
  console.log(recipes)
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
  initDB()
}

export function init() {
  let settings = loadSettings(window.location.hash)
  renderDataSetOptions(settings)
  loadData(currentMod(), settings)
}
