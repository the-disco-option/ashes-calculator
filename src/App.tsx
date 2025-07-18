import { useState } from 'react'
import { BuildTargets } from './tabs/build-targets'

// Top level UI goes here

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Ashes Calculator</h1>
      <BuildTargets />
    </>
  )
}

export default App
