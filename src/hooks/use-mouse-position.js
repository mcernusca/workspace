// From: https://raw.githubusercontent.com/rehooks/window-mouse-position/master/index.js

import React from 'react'

export default function useWindowMousePosition() {
  let [WindowMousePosition, setWindowMousePosition] = React.useState({
    x: null,
    y: null
  })

  function handleMouseMove(e) {
    setWindowMousePosition({
      x: e.pageX,
      y: e.pageY
    })
  }

  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return WindowMousePosition
}
