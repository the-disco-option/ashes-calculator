import { z, safeParse } from 'zod/v4'

/**
 * fetch a csv file and parse it to an array of rows. Headers row required.
 */
export async function csv<T extends z.ZodTypeAny>(filename: string, schema: T) {
  if (!filename.endsWith('.csv')) {
    console.debug(`DEBUG: "${filename}" does not have the .csv filename`)
  }

  const res = await fetch(filename)
  if (!res.ok) {
    throw new Error(
      `Failed to fetch CSV "${filename}": ${res.status} ${res.statusText}`
    )
  }

  const text = await res.text()

  const [headers, ...rows] = text
    .split('\n')
    .filter((line) => line.trim().length > 0) // filter out empty lines
    .map((line) => line.split(';'))
  const no_columns = headers.length

  const out: z.infer<T>[] = []
  for (const [index, row] of rows.entries()) {
    if (row.length !== no_columns) {
      throw new Error(`CSV: ${filename}: Wrong row length at index ${index}`)
    }
    const obj = {}
    for (const [headerIndex, headerKey] of headers.entries()) {
      const key = headerKey.toLowerCase()
      obj[key] = row[headerIndex]
    }

    out.push(schema.parse(obj))
  }
  return out
}

export function slug(str: string) {
  return str
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/-+/g, '-')
}

/**
 * Parse the name field to a key field
 * @param {T} obj
 * @template T
 */
export function withKey(obj) {
  const name = obj['name']
  if (typeof name !== 'string') {
    throw new Error('Missing "name" field')
  }
  obj['name'] = slug(name)
  return obj
}
