import React from 'react'
import {useKeyState} from '../hooks/use-key-state'

export default function KeyNav({total, cursor, navigate}) {
  // Wrapped in a separate component to isolate main component from unecessary
  // re-renders - maybe one good use case for callbacks :)

  const {prev, next} = useKeyState(
    {
      prev: 'left',
      next: 'right'
    },
    {
      captureEvents: false
    }
  )

  const prevDown = prev.down
  const nextDown = next.down

  React.useEffect(() => {
    let newCursor = 0

    if (prevDown) {
      newCursor = Math.max(cursor - 1, 1)
    } else if (nextDown) {
      newCursor = Math.min(cursor + 1, total)
    }

    if (newCursor && newCursor !== cursor) {
      navigate(`/${newCursor}`)
    }
  }, [total, cursor, navigate, prevDown, nextDown])

  return null
}
