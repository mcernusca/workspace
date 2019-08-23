import React from 'react'
import styled from 'styled-components'
import useMousePosition from '../hooks/use-mouse-position'
import {useKeyState} from '../hooks/use-key-state'

export default function MouseTrail() {
  const pos = useMousePosition()
  const [visible, set] = React.useState(false)
  const {spaceKey} = useKeyState(
    {
      spaceKey: 'space'
    },
    {captureEvents: true}
  )

  React.useEffect(() => {
    if (spaceKey.down) {
      set(prev => !prev)
    }
  }, [spaceKey])

  return (
    <Container>
      {visible && (
        <Pointer
          style={{
            transform: `translate3d(${pos.x - 40}px, ${pos.y - 40}px, 0)`
          }}
        />
      )}
    </Container>
  )
}

export const Container = styled.div`
  position: fixed;
  pointer-events: none;
  width: 100%;
  height: 100%;
  z-index: 9999;
  backface-visibility: hidden;
`

export const Pointer = styled.div`
  position: absolute;
  background-image: radial-gradient(transparent, transparent, #00a3ff);
  width: 80px;
  height: 80px;
  border-radius: 100%;
  opacity: 0.6;
  will-change: transform;
  border: 2px solid #00a3ff;
  backface-visibility: hidden;
`
