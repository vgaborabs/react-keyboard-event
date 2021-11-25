import React from 'react'

import { useMyHook } from 'react-use-keyboard'

const App = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
export default App
