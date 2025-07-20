/*Copyright 2015-2024 Kirk McDonald

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/

import { Item } from './item'

// Sorts items into their groups and subgroups. Used chiefly by the target
// dropdown.
export function getItemGroups(items: Map<string, Item>, _data) {
  const sorted_keys = [...items.keys()].sort()
  const sorted_items = sorted_keys.map((key) => items.get(key))

  return [[sorted_items]]
}
