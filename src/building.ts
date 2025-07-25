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
import { powerRepr } from './display'
import { Icon } from './icon'
import { Rational, zero, one } from './rational'
import * as d3 from 'd3'

let thirty = Rational.from_float(30)

export class Building {
  key: string
  name: any
  categories: Set<unknown>
  speed: any
  prodBonus: any
  moduleSlots: any
  power: any
  fuel: any
  icon_col: any
  icon_row: any
  icon: Icon
  constructor(
    key,
    name,
    col,
    row,
    categories,
    speed,
    prodBonus,
    moduleSlots,
    power,
    fuel,
    skill
  ) {
    this.key = key
    this.name = name
    this.categories = new Set(categories)
    this.speed = speed
    this.prodBonus = prodBonus
    this.moduleSlots = moduleSlots
    this.power = power
    this.fuel = fuel

    this.icon_col = col
    this.icon_row = row
    this.icon = new Icon(this, undefined, skill)
  }
  less(other) {
    if (!this.speed.equal(other.speed)) {
      return this.speed.less(other.speed)
    }
    return this.moduleSlots < other.moduleSlots
  }
  getCount(spec, recipe, rate) {
    return rate.div(this.getRecipeRate(spec, recipe))
  }
  getRecipeRate(spec, recipe) {
    let modules = spec.getModuleSpec(recipe)
    let speedEffect
    if (modules) {
      speedEffect = modules.speedEffect()
    } else {
      speedEffect = one
    }
    return recipe.time.reciprocate().mul(this.speed).mul(speedEffect)
  }
  canBeacon() {
    return this.moduleSlots > 0
  }
  prodEffect(spec) {
    return this.prodBonus
  }
  drain() {
    return this.power.div(thirty)
  }
  renderTooltip() {
    let self = this
    let t = d3.create('div').classed('frame', true)
    let header = t.append('h3')
    header.append(() => self.icon.make(32, true))
    header.append(() => new Text(self.name))
    let line = t.append('div')
    line.append('b').text('Energy consumption: ')
    let { power, suffix } = powerRepr(this.power)
    line.append('span').text(`${power.toDecimal(0)} ${suffix}`)
    line = t.append('div')
    line.append('b').text('Crafting speed: ')
    line.append('span').text(this.speed.toDecimal())
    line = t.append('div')
    line.append('b').text('Module slots: ')
    line.append('span').text(String(this.moduleSlots))
    return t.node()
  }
}

class Miner extends Building {
  miningSpeed: any
  constructor(
    key,
    name,
    col,
    row,
    categories,
    miningSpeed,
    moduleSlots,
    power,
    fuel,
    skill
  ) {
    super(
      key,
      name,
      col,
      row,
      categories,
      zero,
      zero,
      moduleSlots,
      power,
      fuel,
      skill
    )
    this.miningSpeed = miningSpeed
  }
  less(other) {
    return one
  }
  drain() {
    return zero
  }
  getRecipeRate(spec, recipe) {
    let modules = spec.getModuleSpec(recipe)
    let speedEffect
    if (modules) {
      speedEffect = modules.speedEffect()
    } else {
      speedEffect = one
    }
    return one
  }
  prodEffect(spec) {
    return spec.miningProd
  }
  renderTooltip() {
    let self = this
    let t = d3.create('div').classed('frame', true)
    let header = t.append('h3')
    header.append(() => self.icon.make(32, true))
    header.append(() => new Text(self.name))
    let line = t.append('div')
    line.append('b').text('Energy consumption: ')
    let { power, suffix } = powerRepr(this.power)
    line.append('span').text(`${power.toDecimal(0)} ${suffix}`)
    line = t.append('div')
    line.append('b').text('Mining speed: ')
    line.append('span').text(this.miningSpeed.toDecimal())
    line = t.append('div')
    line.append('b').text('Module slots: ')
    line.append('span').text(String(this.moduleSlots))
    return t.node()
  }
}

class OffshorePump extends Building {
  pumpingSpeed: any
  constructor(key, name, col, row, pumpingSpeed) {
    super(key, name, col, row, ['offshore-pumping'], zero, zero, 0, zero, null)
    this.pumpingSpeed = pumpingSpeed
  }
  less(other) {
    return this.pumpingSpeed.less(other.pumpingSpeed)
  }
  getRecipeRate(spec, recipe) {
    return this.pumpingSpeed
  }
  renderTooltip() {
    let self = this
    let t = d3.create('div').classed('frame', true)
    let header = t.append('h3')
    header.append(() => self.icon.make(32, true))
    header.append(() => new Text(self.name))
    let line = t.append('div')
    line.append('b').text('Pumping speed: ')
    line
      .append('span')
      .text(`${spec.format.rate(this.pumpingSpeed)}/${spec.format.rateName}`)
    return t.node()
  }
}

let rocketLaunchDuration = Rational.from_floats(2434, 60)

function launchRate(spec) {
  let partRecipe = spec.recipes.get('rocket-part')
  let partFactory = spec.getBuilding(partRecipe)
  let partItem = spec.items.get('rocket-part')
  let gives = partRecipe.gives(partItem)
  // The base rate at which the silo can make rocket parts.
  let rate = Building.prototype.getRecipeRate.call(
    partFactory,
    spec,
    partRecipe
  )
  // Number of times to complete the rocket part recipe per launch.
  let perLaunch = Rational.from_float(100).div(gives)
  // Total length of time required to launch a rocket.
  let time = perLaunch.div(rate).add(rocketLaunchDuration)
  let launchRate = time.reciprocate()
  let partRate = perLaunch.div(time)
  return { part: partRate, launch: launchRate }
}

class RocketLaunch extends Building {
  getRecipeRate(spec, recipe) {
    return launchRate(spec).launch
  }
}

class RocketSilo extends Building {
  getRecipeRate(spec, recipe) {
    return launchRate(spec).part
  }
}

function renderTooltipBase() {
  let self = this
  let t = d3.create('div').classed('frame', true)
  let header = t.append('h3')
  header.append(() => self.icon.make(32, true))
  header.append(() => new Text(self.name))
  return t.node()
}

export function getBuildings(data, items) {
  let buildings = []
  for (let d of data.crafting_machines) {
    let fuel = null
    if (d.energy_source && d.energy_source.type === 'burner') {
      fuel = d.energy_source.fuel_category
    }
    let prod = zero
    if (d.prod_bonus) {
      prod = Rational.from_float_approximate(d.prod_bonus)
    }
    buildings.push(
      new Building(
        d.key,
        d.localized_name.en,
        d.icon_col,
        d.icon_row,
        d.crafting_categories,
        Rational.from_float_approximate(d.crafting_speed),
        prod,
        d.module_slots,
        Rational.from_float_approximate(d.energy_usage),
        fuel,
        d.skill
      )
    )
  }
  for (let d of data.rocket_silo) {
    buildings.push(
      new RocketSilo(
        d.key,
        d.localized_name.en,
        d.icon_col,
        d.icon_row,
        d.crafting_categories,
        Rational.from_float_approximate(d.crafting_speed),
        zero,
        d.module_slots,
        Rational.from_float_approximate(d.energy_usage),
        null
      )
    )
  }
  for (let d of data.offshore_pumps) {
    // Pumping speed is given in units/tick.
    let speed = Rational.from_float_approximate(d.pumping_speed).mul(
      Rational.from_float(60)
    )
    buildings.push(
      new OffshorePump(
        d.key,
        d.localized_name.en,
        d.icon_col,
        d.icon_row,
        speed
      )
    )
  }
  for (let d of data.mining_drills) {
    if (d.key == 'pumpjack') {
      continue
    }
    let fuel = null
    if (d.energy_source && d.energy_source.type === 'burner') {
      fuel = d.energy_source.fuel_category
    }
    buildings.push(
      new Miner(
        d.key,
        d.localized_name.en,
        d.icon_col,
        d.icon_row,
        d.resource_categories,
        Rational.from_float_approximate(d.mining_speed),
        d.module_slots,
        Rational.from_float_approximate(d.energy_usage),
        fuel,
        d.skill
      )
    )
  }
  return buildings
}
