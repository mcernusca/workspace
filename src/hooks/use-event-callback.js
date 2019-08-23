// https://github.com/facebook/react/issues/14099
import React from 'react'

export const useEventCallback = function(fn) {
  let ref = React.useRef()
  React.useLayoutEffect(() => {
    ref.current = fn
  })
  return React.useMemo(() => (...args) => (0, ref.current)(...args), [])
}
