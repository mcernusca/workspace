import React from 'react'
import {useImmerReducer} from 'use-immer'

export default function MakeStore(reducer) {
  const context = React.createContext()

  function Provider({initialState, initialAction, children}) {
    const [state, dispatch] = useImmerReducer(reducer, initialState, initialAction)
    const contextValue = React.useMemo(() => [state, dispatch], [state, dispatch])
    return <context.Provider value={contextValue}>{children}</context.Provider>
  }

  function useStore() {
    return React.useContext(context)
  }

  return {
    Provider,
    useStore
  }
}
