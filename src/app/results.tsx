import React from 'react'
import { ItemInterface, useRawResults, useResults } from '../lib/atom'

type ResultsProps = {}

export const Results: React.FC<ResultsProps> = () => {
  return (
    <div className="p-4">
      <p>Required Raw Resources</p>
      <ul>
        <ResultsList />
      </ul>
    </div>
  )
}

const ResultsList = () => {
  const [{ rawCosts, fuelCost }] = useRawResults()

  return (
    <div style={{ maxHeight: '10rem', overflowY: 'scroll' }}>
      <table>
        <thead></thead>
        <tbody>
          {rawCosts.map((result) => (
            <tr key={result.item.key}>
              <td>
                <img
                  src={`https://raw.githubusercontent.com/the-disco-option/ashes-calculator-images/refs/heads/main/public/images/${result.item.key}.png`}
                  height="16px"
                  width="16px"
                  loading="lazy"
                />
              </td>
              <td>
                <span>{result.item.name}</span>
              </td>
              <td>{result.amount.toDecimal(10, undefined)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <span>Fuel required: {fuelCost?.amount.toFloat()} units</span>
    </div>
  )
}
