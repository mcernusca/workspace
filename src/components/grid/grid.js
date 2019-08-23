import React from 'react'
import styled from 'styled-components'
import {useGesture} from 'react-with-gesture'
import {useSprings, animated, interpolate} from 'react-spring'
import tabbable from 'tabbable'
import cx from 'classnames'
import {Machine} from 'xstate'
import {useKeyState} from '../../hooks/use-key-state'

import {
  gridFrameToPxFrame,
  gridSizeForContainerSize,
  snapToGrid,
  cap,
  zipMap,
  pxToGrid,
  moveH,
  moveV,
  frameFit
} from './grid-utils'
import {useResizeHandles} from './resize-handles.js'
import {useEventCallback} from '../../hooks/use-event-callback'
import {Frame} from '../../models/frame'

const SPRING_CONFIG = {friction: 50, tension: 500}

const getNextFocusableElement = (containerEl, goingBack) => {
  const currentTarget = document.activeElement
  const options = tabbable(containerEl)
  const currentIndex = options.indexOf(currentTarget)
  if (containerEl && containerEl.contains(currentTarget)) {
    // If we're at the start and going back, loop around
    if (currentIndex === 0 && goingBack) {
      return tabbable(containerEl)[options.length - 1] || containerEl
    }
    // If we're at the end and goinf forward, loop around
    if (currentIndex >= options.length - 1 && !goingBack) {
      return tabbable(containerEl)[0] || containerEl
    }
    //Otherwise just increment in the desired direction
    return options[currentIndex + (goingBack ? -1 : 1)]
  }
}

function zoomGridForCount(count) {
  const rows = Math.round(Math.sqrt(count))
  const cols = Math.ceil(count / rows)
  return [cols, rows]
}

function gridFrameForIndex(index, grid) {
  const cols = grid[0]
  const x = index % cols
  const y = Math.floor(index / cols)
  return Frame(x, y, 1, 1)
}

function useDidChange(view) {
  const isTransitioning = React.useRef(true)
  const lastView = React.useRef(view)
  isTransitioning.current = lastView.current !== view
  lastView.current = view
  return isTransitioning.current
}

// States

const PRESENT = 'present'
const EDIT = 'edit'
const ZOOM = 'zoom'
const ADD = 'add'
const EXIT = 'exit'

const StateMachine = Machine({
  id: 'grid',
  initial: PRESENT,
  states: {
    present: {
      on: {edit: EDIT}
    },
    edit: {
      on: {
        exit: PRESENT,
        zoom: ZOOM,
        add: ADD
      }
    },
    zoom: {
      on: {exit: EDIT}
    },
    add: {
      on: {exit: EDIT}
    }
  }
})

export default function Grid({
  view = 1,
  frame,
  rows,
  cols,
  children,
  onFrameChange,
  onOrderChange,
  onRemove,
  onAdd,
  onUndo,
  onRedo
}) {
  const [gridState, setGridState] = React.useState(PRESENT)

  const isEdit = gridState === EDIT
  const isZoom = gridState === ZOOM
  const isAdd = gridState === ADD
  const isEditing = [EDIT, ZOOM, ADD].includes(gridState)

  const isTransitioning = useDidChange(view)
  const [focusKey, setFocusKey] = React.useState(null)

  // const childrenArr = React.Children.toArray(children)
  let childrenArr = React.useMemo(() => {
    const arr = []
    React.Children.forEach(children, child => {
      arr.push(child)
    })
    return arr
  }, [children])

  const cellSize = React.useMemo(() => {
    return gridSizeForContainerSize(frame.size, cols, rows)
  }, [frame.size, cols, rows])

  // Filter out active children
  const activeChildrenArr = React.useMemo(() => {
    const arr = []
    React.Children.forEach(children, child => {
      if (child.props.active) {
        arr.push(child)
      }
    })
    return arr
  }, [children])

  const inactiveChildrenArr = React.useMemo(() => {
    const arr = []
    React.Children.forEach(children, child => {
      if (!child.props.active) {
        arr.push(child)
      }
    })
    return arr
  }, [children])

  // Zoom Grid
  const zoomGrid = React.useMemo(() => zoomGridForCount(activeChildrenArr.length), [
    activeChildrenArr.length
  ])
  const zoomCellSize = React.useMemo(
    () => gridSizeForContainerSize(frame.size, zoomGrid[0], zoomGrid[1]),
    [frame.size, zoomGrid]
  )

  // Add Grid
  const addGrid = React.useMemo(
    () => zoomGridForCount(childrenArr.length - activeChildrenArr.length),
    [childrenArr.length, activeChildrenArr.length]
  )
  const addCellSize = React.useMemo(
    () => gridSizeForContainerSize(frame.size, addGrid[0], addGrid[1]),
    [frame.size, addGrid]
  )
  // TODO handle case where we can't have add mode (no items)

  // Springs
  const propsForChild = React.useCallback(
    child => {
      const isActive = activeChildrenArr.includes(child)
      let gridFrame = child.props.frame
      let childFrame = gridFrameToPxFrame(gridFrame, cellSize)
      let opacity = isActive ? 1 : 0
      let immediate = isActive ? false : true
      let scale = 1

      if (isZoom) {
        const zoomIndex = activeChildrenArr.indexOf(child)
        const zoomGridFrame = gridFrameForIndex(zoomIndex, zoomGrid)
        const zoomChildFrame = gridFrameToPxFrame(zoomGridFrame, zoomCellSize)
        const fitZoomChildFrame = frameFit(childFrame, zoomChildFrame, 20)
        scale = fitZoomChildFrame.size[0] / childFrame.size[0]
        childFrame.origin = fitZoomChildFrame.origin
      }

      if (isAdd && !isActive) {
        const addIndex = inactiveChildrenArr.indexOf(child)
        // render a zoom grid for non active items
        // active items rendered the same just with lower opacity
        // render function needs to render not active items in this mode
        // z-index of not active items has to be higher than the active...
        const addGridFrame = gridFrameForIndex(addIndex, addGrid)
        const addChildFrame = gridFrameToPxFrame(addGridFrame, addCellSize)
        const fitAddChildFrame = frameFit(childFrame, addChildFrame, 20)
        scale = fitAddChildFrame.size[0] / childFrame.size[0]
        childFrame.origin = fitAddChildFrame.origin
        opacity = 1
        immediate = false
      } else if (isAdd && isActive) {
        opacity = 0.1
        immediate = false
      }

      return {
        immediate: immediate,
        cursor: 'grab',
        opacity: opacity,
        scale: scale,
        origin: childFrame.origin,
        originSnap: childFrame.origin,
        size: childFrame.size,
        sizeSnap: childFrame.size,
        config: SPRING_CONFIG
      }
    },
    [
      activeChildrenArr,
      addCellSize,
      addGrid,
      cellSize,
      inactiveChildrenArr,
      isAdd,
      isZoom,
      zoomCellSize,
      zoomGrid
    ]
  )

  // Init springs for all children:
  const [animProps, set] = useSprings(childrenArr.length, index => {
    // This only gets called when spring count changes so we
    // expect it to be stable
    const child = childrenArr[index]
    return propsForChild(child, index)
  })

  // If we don't have a prevFrame we need to set
  // the current position immediately before the next
  // spring setter runs - only runs if view changes:
  React.useEffect(() => {
    if (isTransitioning) {
      set(index => {
        const child = childrenArr[index]
        if (!child.props.prevFrame) {
          let gridFrame = child.props.frame
          let childFrame = gridFrameToPxFrame(gridFrame, cellSize)
          return {
            immediate: true,
            origin: childFrame.origin,
            originSnap: childFrame.origin,
            size: childFrame.size,
            sizeSnap: childFrame.size
          }
        }
      })
    }
  }, [cellSize, childrenArr, set, isTransitioning])

  // Handle model updates

  React.useEffect(() => {
    set(index => {
      const child = childrenArr[index]
      return propsForChild(child, index)
    })
  }, [childrenArr, propsForChild, set, frame.size, isZoom, isAdd])

  // Drag
  const onDragAction = useEventCallback(
    ({args: [index], event, first, delta: [xDelta, yDelta], down, cancel}) => {
      if (!isEdit) {
        return
      }

      // Only handle left click
      if (first && typeof event.button === 'number' && event.button !== 0) {
        event.persist() // TODO useGesture accesses this later - investigate
        cancel()
        return
      }
      // Set focus to target element
      if (first) {
        event.target.focus()
      }

      const child = childrenArr[index]
      const childFrame = gridFrameToPxFrame(child.props.frame, cellSize)

      const _origin = [
        cap(childFrame.origin[0] + xDelta, 0, frame.size[0] - childFrame.size[0]),
        cap(childFrame.origin[1] + yDelta, 0, frame.size[1] - childFrame.size[1])
      ]
      const _originSnap = zipMap(snapToGrid, _origin, cellSize)

      set(
        i =>
          index === i && {
            immediate: down,
            cursor: down ? 'grabbing' : 'grab',
            origin: down ? _origin : _originSnap,
            originSnap: _originSnap
          }
      )

      if (!down && (xDelta || yDelta)) {
        const origin = zipMap(pxToGrid, _originSnap, cellSize)
        onFrameChange(index, {origin: origin})
      }
    }
  )
  const bindDragHandlers = useGesture(onDragAction)

  // Copy / Paste
  const copyPropsBufferRef = React.useRef()

  // Contain Focus
  const canvasRef = React.useRef()

  // Keep active focus key so we know what to move
  // when using keyboard.
  const bindFocusHandlers = function(...key) {
    return {
      onFocus: () => {
        setFocusKey(key)
      },
      onBlur: () => {
        setFocusKey(null)
      }
    }
  }

  // Keyboard

  // - repeat
  const {upArrow, downArrow, leftArrow, rightArrow} = useKeyState(
    {
      upArrow: isEditing ? 'up' : '',
      downArrow: isEditing ? 'down' : '',
      leftArrow: isEditing ? 'left' : '',
      rightArrow: isEditing ? 'right' : ''
    },
    {
      ignoreRepeatEvents: false,
      captureEvents: isEdit && focusKey,
      debug: false
    }
  )
  // - captured
  const {forward, backward, backspace, tab, undo, redo, copy, paste} = useKeyState(
    {
      forward: isEditing ? 'meta+]' : '',
      backward: isEditing ? 'meta+[' : '',
      backspace: isEditing ? 'backspace' : '',
      tab: isEditing ? 'tab' : '',
      undo: isEdit ? ['meta+z', 'ctrl+z'] : '',
      redo: isEdit ? ['shift+meta+z', 'shift+ctrl+z'] : '',
      copy: isEditing ? ['meta+c', 'ctrl+c'] : '',
      paste: isEditing ? ['meta+v', 'ctrl+v'] : ''
    },
    {
      captureEvents: isEditing,
      debug: false
    }
  )
  // - regular
  const {esc, enter, shift, zoomKey, addKey} = useKeyState({
    esc: 'esc',
    enter: 'enter',
    shift: 'shift',
    zoomKey: 'equal',
    addKey: 'shift+equal'
  })

  React.useLayoutEffect(() => {
    if (esc.down) {
      setGridState(state => StateMachine.transition(state, EXIT).value)
      return
    }

    if (focusKey !== null) {
      const [index] = focusKey
      if (copy.down) {
        const child = childrenArr[index]
        copyPropsBufferRef.current = child.props.frame
        // console.log('set buffer to ', copyPropsBufferRef.current)
      } else if (paste.down) {
        if (copyPropsBufferRef.current) {
          onFrameChange(index, copyPropsBufferRef.current)
        }
      }
    }

    if (zoomKey.down) {
      if (addKey.down) {
        setGridState(state => {
          if (state === ADD) {
            return StateMachine.transition(state, EXIT).value
          }
          return StateMachine.transition(state, ADD).value
        })
        return
      }

      setGridState(state => {
        if (state === ZOOM) {
          return StateMachine.transition(state, EXIT).value
        }
        return StateMachine.transition(state, ZOOM).value
      })
      return
    }

    if (enter.down) {
      setGridState(state => {
        if (state === ZOOM || state === ADD) {
          return StateMachine.transition(state, EXIT).value
        }
        return StateMachine.transition(state, EDIT).value
      })
      return
    }

    if (isEdit) {
      // Handle undo / redo
      if (undo.down) {
        if (redo.down) {
          return void onRedo()
        }
        return void onUndo()
      }
    }

    if (isEditing) {
      if (tab.down) {
        let next = getNextFocusableElement(canvasRef.current, shift.pressed)
        if (next) {
          next.focus()
        }
      }

      if (focusKey !== null) {
        const [index] = focusKey

        // Handle delete
        if (backspace.down) {
          setFocusKey(null)
          onRemove(index)
        }

        // Handle forward / backward
        if (forward.down) {
          onOrderChange(index, 1)
        } else if (backward.down) {
          onOrderChange(index, -1)
        }

        // Handle keyboard reframing
        const frame = childrenArr[index].props.frame
        let newFrame = frame
        const ammt = shift.pressed ? 5 : 1

        if (upArrow.down) {
          newFrame = moveV(ammt, -1, newFrame, rows)
        }
        if (downArrow.down) {
          newFrame = moveV(ammt, 1, newFrame, rows)
        }
        if (leftArrow.down) {
          newFrame = moveH(ammt, -1, newFrame, cols)
        }
        if (rightArrow.down) {
          newFrame = moveH(ammt, 1, newFrame, cols)
        }

        if (newFrame !== frame) {
          onFrameChange(index, newFrame)
        }

        // TODO handle keyboard resizing
      }
    }
  })

  // Resize
  const buildResizeHandles = useResizeHandles(
    useEventCallback(
      ({args: [index], down, sizeDelta: [wDelta, hDelta], originDelta: [xDelta, yDelta]}) => {
        const child = childrenArr[index]
        const {
          size: [w, h],
          origin: [x, y]
        } = gridFrameToPxFrame(child.props.frame, cellSize)

        const _xy = [x + xDelta, y + yDelta]
        const _origin = zipMap(cap, _xy, [0, 0], [frame.size[0], frame.size[1]])
        const _originSnap = zipMap(snapToGrid, _origin, cellSize)

        const xOver = _origin[0] - _xy[0]
        const yOver = _origin[1] - _xy[1]

        const _wh = [w + wDelta - xOver, h + hDelta - yOver]
        const _size = zipMap(cap, _wh, cellSize, [
          frame.size[0] - _origin[0],
          frame.size[1] - _origin[1]
        ])
        const _sizeSnap = zipMap(snapToGrid, _size, cellSize)

        set(
          i =>
            index === i && {
              immediate: down,
              size: down ? _size : _sizeSnap,
              sizeSnap: _sizeSnap,
              origin: down ? _origin : _originSnap,
              originSnap: _originSnap
            }
        )

        if (!down) {
          const size = zipMap(pxToGrid, _sizeSnap, cellSize)
          const origin = zipMap(pxToGrid, _originSnap, cellSize)
          onFrameChange(index, {size: size, origin: origin})
        }
      }
    )
  )

  // Click
  const bindClickHandler = index => {
    if (gridState === ZOOM || gridState === ADD) {
      return {
        onClick: () => {
          if (gridState === ADD) {
            onAdd(index)
          }
          setGridState(state => StateMachine.transition(state, EXIT).value)
        }
      }
    }
    return null
  }

  const canvasClasses = cx({
    'grid-canvas': true,
    'is-zoom': isZoom,
    'is-editing': isEditing
  })

  return (
    <Canvas
      className={canvasClasses}
      frame={frame}
      cellSize={cellSize}
      onDragStart={event => event.preventDefault()}
      ref={canvasRef}
      tabIndex={-1}
    >
      <RelativeWrapper className="grid-wrapper">
        {React.Children.map(children, (child, i) => {
          const animChildProps = animProps[i]
          if (!isAdd && child.props.active === false) {
            return null
          }

          let childFrame = gridFrameToPxFrame(child.props.frame, cellSize)
          const sizedWindowChild = React.cloneElement(child, {
            size: childFrame.size
          })

          return (
            <>
              {isEdit && (
                <StickyShadow
                  className="grid-shadow"
                  style={{
                    position: 'absolute',
                    transformOrigin: 'top left',
                    ...interpolateStyles(
                      animChildProps.sizeSnap,
                      animChildProps.originSnap,
                      animChildProps.scale
                    )
                  }}
                />
              )}
              <GridItem
                {...bindFocusHandlers(i)}
                {...bindDragHandlers(i)}
                {...bindClickHandler(i)}
                className="grid-item"
                tabIndex={child.props.viewIndex !== null ? child.props.viewIndex + 1 : 0}
                style={{
                  zIndex: child.props.viewIndex !== null ? child.props.viewIndex + 1 : 100,
                  cursor: isEdit ? animChildProps.cursor : 'initial',
                  opacity: animChildProps.opacity,
                  ...interpolateStyles(
                    animChildProps.size,
                    animChildProps.origin,
                    animChildProps.scale
                  )
                }}
              >
                {sizedWindowChild}
                {isEdit && buildResizeHandles(i)}
              </GridItem>
            </>
          )
        })}
      </RelativeWrapper>
    </Canvas>
  )
}

const interpolateStyles = function(animSize, animOrigin, animScale) {
  return {
    width: animSize.interpolate((w, _) => `${w}px`),
    height: animSize.interpolate((_, h) => `${h}px`),
    transform: interpolate([animOrigin, animScale], ([x, y], s) => {
      return `translate3d(${x}px, ${y}px, 0) scale(${s})`
    })
  }
}

const Canvas = styled.div`
  position: absolute;
  top: ${props => props.frame.origin[1]}px;
  left: ${props => props.frame.origin[0]}px;
  width: ${props => props.frame.size[0]}px;
  height: ${props => props.frame.size[1]}px;
  outline: 0;

  &.is-editing {
    background-size: ${props => props.cellSize[0]}px ${props => props.cellSize[1]}px;
  }
`
const RelativeWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  // perspective: 600;
`
const StickyShadow = styled(animated.div)`
  position: absolute;
  will-change: transform, width, height;
  pointer-events: none;
  transform-origin: top left;
`
const GridItem = styled(animated.div)`
  position: absolute;
  transform-origin: top left;
  will-change: transform, width, height;
  // fix for blurry scaled up element in Chrome (zoom modes)
  backface-visibility: hidden;
`
