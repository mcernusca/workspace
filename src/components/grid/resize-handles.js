import React from 'react'
import styled from 'styled-components'
import {useGesture} from 'react-with-gesture'

export const useResizeHandles = function(onResize) {
  // Note:
  // Right side handles only change size,
  // Left side handles also change origin and size (top left pivot)

  const bindTop = useGesture(({event, args, first, down, xy, initial}) => {
    if (first) {
      event.preventDefault()
      event.stopPropagation()
    }

    const yDelta = xy[1] - initial[1]

    onResize({
      args: args,
      first: first,
      down: down,
      originDelta: [0, yDelta],
      sizeDelta: [0, -yDelta]
    })
  })

  const bindBottom = useGesture(({event, args, first, down, xy, initial}) => {
    if (first) {
      event.preventDefault()
      event.stopPropagation()
    }

    const yDelta = xy[1] - initial[1]

    onResize({
      args: args,
      first: first,
      down: down,
      originDelta: [0, 0],
      sizeDelta: [0, yDelta]
    })
  })

  const bindLeft = useGesture(({event, args, first, down, xy, initial}) => {
    if (first) {
      event.preventDefault()
      event.stopPropagation()
    }

    const xDelta = xy[0] - initial[0]

    onResize({
      args: args,
      first: first,
      down: down,
      originDelta: [xDelta, 0],
      sizeDelta: [-xDelta, 0]
    })
  })

  const bindRight = useGesture(({event, args, first, down, xy, initial}) => {
    if (first) {
      event.preventDefault()
      event.stopPropagation()
    }

    const xDelta = xy[0] - initial[0]

    onResize({
      args: args,
      first: first,
      down: down,
      originDelta: [0, 0],
      sizeDelta: [xDelta, 0]
    })
  })

  const bindTopLeft = useGesture(({event, args, first, down, xy, initial}) => {
    if (first) {
      event.preventDefault()
      event.stopPropagation()
    }

    const xDelta = xy[0] - initial[0]
    const yDelta = xy[1] - initial[1]

    onResize({
      args: args,
      first: first,
      down: down,
      originDelta: [xDelta, yDelta],
      sizeDelta: [-xDelta, -yDelta]
    })
  })

  const bindTopRight = useGesture(({event, args, first, down, xy, initial}) => {
    if (first) {
      event.preventDefault()
      event.stopPropagation()
    }

    const xDelta = xy[0] - initial[0]
    const yDelta = xy[1] - initial[1]

    onResize({
      args: args,
      first: first,
      down: down,
      originDelta: [0, yDelta],
      sizeDelta: [xDelta, -yDelta]
    })
  })

  const bindBottomLeft = useGesture(({event, args, first, down, xy, initial}) => {
    if (first) {
      event.preventDefault()
      event.stopPropagation()
    }

    const xDelta = xy[0] - initial[0]
    const yDelta = xy[1] - initial[1]

    onResize({
      args: args,
      first: first,
      down: down,
      originDelta: [xDelta, 0],
      sizeDelta: [-xDelta, yDelta]
    })
  })

  const bindBottomRight = useGesture(({event, args, first, down, xy, initial}) => {
    if (first) {
      event.preventDefault()
      event.stopPropagation()
    }

    const xDelta = xy[0] - initial[0]
    const yDelta = xy[1] - initial[1]

    onResize({
      args: args,
      first: first,
      down: down,
      originDelta: [0, 0],
      sizeDelta: [xDelta, yDelta]
    })
  })

  // We return a factory function instead of the component itself
  // in order to capture a unique identifier that is passed along to the
  // resize callback. This is only important if we share a callback between
  // multiple components.
  const [factory] = React.useState(() => {
    return (...args) => {
      return (
        <>
          <TopHandle {...bindTop(...args)} />
          <LeftHandle {...bindLeft(...args)} />
          <RightHandle {...bindRight(...args)} />
          <BottomHandle {...bindBottom(...args)} />
          <TopLeftHandle {...bindTopLeft(...args)} />
          <TopRightHandle {...bindTopRight(...args)} />
          <BottomLeftHandle {...bindBottomLeft(...args)} />
          <BottomRightHandle {...bindBottomRight(...args)} />
        </>
      )
    }
  })
  return factory
}

const Handle = styled.div`
  position: absolute;
  pointer-events: auto;
`

// Corners

const CornerHandle = styled(Handle)`
  position: absolute;
  width: 20px;
  height: 20px;
`

const TopLeftHandle = styled(CornerHandle)`
  top: 0;
  left: 0;
  cursor: nwse-resize;
`

const TopRightHandle = styled(CornerHandle)`
  top: 0;
  right: 0;
  cursor: nesw-resize;
`

const BottomLeftHandle = styled(CornerHandle)`
  bottom: 0;
  left: 0;
  cursor: nesw-resize;
`

const BottomRightHandle = styled(CornerHandle)`
  bottom: 0;
  right: 0;
  cursor: nwse-resize;
`

// Horizontal

const HorizontallHandle = styled(Handle)`
  width: 100%;
  height: 10px;
  cursor: ns-resize;
`

const TopHandle = styled(HorizontallHandle)`
  top: 0;
  left: 0;
`

const BottomHandle = styled(HorizontallHandle)`
  bottom: 0;
  left: 0;
`

// Vertical

const VerticalHandle = styled(Handle)`
  width: 10px;
  height: 100%;
  cursor: ew-resize;
`

const LeftHandle = styled(VerticalHandle)`
  top: 0;
  left: 0;
`

const RightHandle = styled(VerticalHandle)`
  top: 0;
  right: 0;
`
