import { BuildTargets } from './build-targets'
import { Results } from './results'

// Top level UI goes here

function App() {
  return (
    <>
      <div className="p-4">
        <h1 className="text-2xl">Ashes Calculator</h1>
      </div>
      <div className="grid grid-cols-2 p-4">
        <BuildTargets />
        <Results />
      </div>
    </>
  )
}

export default App
