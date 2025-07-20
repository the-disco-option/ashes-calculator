import React, { memo } from 'react'
import { ItemInterface, useResults } from '../lib/atom'

type Result = {
  id: number | string
  label: string
  value: string | number
}

type ResultsProps = {}

export const Results: React.FC<ResultsProps> = () => {
  return (
    <ul>
      <ResultsList />
    </ul>
  )
}

const ResultsList = () => {
  const [results] = useResults()

  return (
    <div style={{ maxHeight: '10rem', overflowY: 'scroll' }}>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Name</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr
              key={result.item.key}
              style={{ background: 'darkgrey', cursor: 'pointer' }}
            >
              <td>
                <span>{result.item.key}</span>
              </td>
              <td>{result.item.name}</td>
              <td>
                <img
                  src={`https://raw.githubusercontent.com/the-disco-option/ashes-calculator-images/refs/heads/main/public/images/${result.item.key}.png`}
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
}
