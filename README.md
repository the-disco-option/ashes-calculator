# Ashes of Creation Calculator

[Go To Calculator](https://calculator.coppercloud.no?ref=GitHubRepo)

Ashes Calculator a tool for calculating crafting requirements for items in[Ashes of Creation](https://ashesofcreation.com). Still a work in progess. More items, icons and functions are being added.

## Running locally

`npm run dev` or `pnpm dev`

## Building

`npm run build` or `pnpm build`

Output can be found on in `/dest`

## Support the original calculator

This tool is build on upon the foundations of the Factorio Calculator. Please consider donating to their [Patreon page](https://www.patreon.com/kirkmcdonald).

- [x] TODO: composite items, more than one materials
- [x] TODO: slate weapon molds
- [] TODO: gathering tools
- [x] TODO: support multiple recipes per resource (use resource tab to change prioritization)
- [ ] handle items(consumable, equipable)
- [ ] support mob spawns and multiple sources better.
- [ ] Add "What is this item used for?"

think up some interfaces
interface Item {
    string Id
    string Name
    kind = [item, material, cargo]
}

interface MatesrialItem extends Item {
    size_x
    size_y
}
// both material and cargo have this.
interface Size extends Item {
    size_x
    size_y
}

interface Equippable {
    EqiupmentSlotId slot
}

interface Cargo {
    kind = "cargo"
}

interface Material {
    kind = "material"
}

interface InventoryItem {
    kind = "item"
}

interface Weapon {
    weapon_type [] // this ties into the weapon skill tree.

}

interface Stats {
    key - stat-id : value
}

interface Armor {
    armor_type [heavy, medium, light]
}

interface Vendor {
    location ?
}
