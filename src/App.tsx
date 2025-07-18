import { useState } from 'react'
import { BuildTargets } from './tabs/build-targets'

// Top level UI goes here

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 className="text-2xl">Ashes Calculator</h1>
      <BuildTargets />
    </>
  )
}

export default App
