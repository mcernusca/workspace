import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import KeyNav from './key-nav'
import IndexNav from './index-nav'
import Section from './section'
import {useTransition, animated} from 'react-spring'
import useWindowSize from '../hooks/use-window-size'
import {useKeyState} from '../hooks/use-key-state'

import Store from '../models/view-store'
import {persist} from '../models/persistence'
import {
  RATIO,
  queryForSpaceAtCursor,
  countViews,
  slugFromTitle,
  buildIndex
} from '../models/document'
import {boundsFit} from '../models/layout'
import {Frame} from '../models/frame'

import DynamicFontSize from './document/dynamic-font-size'

const SPRING_CONFIG = {mass: 0.7, friction: 25, tension: 180}

function useCursorDirection(cursor) {
  const prevCursorRef = React.useRef(cursor)
  React.useLayoutEffect(() => {
    prevCursorRef.current = cursor
  })
  return cursor < prevCursorRef.current ? -1 : cursor > prevCursorRef.current ? 1 : 0
}

function useDocumentFrame() {
  const winSize = useWindowSize()
  const [width, height] = boundsFit(RATIO, winSize.width, winSize.height)
  const x = Math.floor((winSize.width - width) / 2)
  const y = Math.floor((winSize.height - height) / 2)
  return React.useMemo(() => Frame(x, y, width, height), [x, y, width, height])
}

function usePreviewDocumentFrame(documentFrame) {
  const dim = 0.15 * documentFrame.size[0]
  const [width, height] = boundsFit(RATIO, dim, dim)
  return React.useMemo(() => Frame(0, 0, width, height), [width, height])
}

function Document({cursor, navigate, children}) {
  const documentFrame = useDocumentFrame()
  const previewDocumentFrame = usePreviewDocumentFrame(documentFrame)
  const [{viewState, log}, dispatch] = Store.useStore()

  const {slashKey, optKey} = useKeyState({slashKey: '/', optKey: 'opt'})
  const [showNav, setShowNav] = React.useState(false)
  React.useEffect(() => {
    if (slashKey.down) {
      setShowNav(prev => !prev)
    }
  }, [slashKey])

  React.useEffect(() => {
    persist(log)
  }, [log])

  window.dumpLog = React.useCallback(() => {
    console.table(log)
    console.log(viewState)
    const out = log
    console.log(out.join('\n'))
  }, [log, viewState])

  window.exportLog = React.useCallback(() => {
    const out = []

    const chapters = indexRef.current
    chapters.forEach(chapter => {
      const chapterTitleSlug = slugFromTitle(chapter.title)
      chapter.spaces.forEach(space => {
        const spaceTitleSlug = slugFromTitle(space.title)
        for (let view = 1; view <= space.views; view++) {
          const layerPath = `/${chapterTitleSlug}/${spaceTitleSlug}/${view}`
          const layersInView = viewState.layers[layerPath]
          if (layersInView) {
            layersInView.forEach(layerSlug => {
              const layerPropsPath = `${layerPath}/${layerSlug}`
              const layerProps = viewState.layerProps[layerPropsPath]
              if (!layerProps) {
                console.warn('Missing layer props for path', layerPropsPath)
              } else {
                const f = layerProps.frame
                out.push(`add ${layerPropsPath}`)
                out.push(
                  `xywh ${layerPropsPath} ${f.origin[0]} ${f.origin[1]} ${f.size[0]} ${f.size[1]}`
                )
              }
            })
          }
        }
      })
    })

    console.log(out.join('\n'))
  }, [viewState])

  const [total] = React.useState(() => {
    return countViews(children)
  })
  const direction = useCursorDirection(cursor)
  const space = queryForSpaceAtCursor(cursor, children)
  const nextSpace = queryForSpaceAtCursor(cursor + 1, children)

  const transitions = useTransition(space, space => space.props.path, {
    from: {opacity: 1, transform: `translate3d(${100 * direction}%,0,0)`},
    enter: {opacity: 1, transform: 'translate3d(0%,0,0)'},
    leave: {opacity: 1, transform: `translate3d((${-100 * direction}%,0,0)`},
    config: SPRING_CONFIG
  })

  const indexRef = React.useRef(null)
  if (indexRef.current === null) {
    indexRef.current = buildIndex(children)
    console.log(indexRef.current)
  }

  if (space) {
    return (
      <>
        <Wrapper>
          <DynamicFontSize frame={documentFrame}>
            <KeyNav total={total} cursor={cursor} navigate={navigate} />
            {transitions.map(({item, props, key}) => {
              return (
                <Animated key={key} style={props}>
                  {React.cloneElement(item.component, {
                    ...item.props,
                    direction,
                    dispatch,
                    viewState,
                    key: key,
                    frame: documentFrame
                  })}
                </Animated>
              )
            })}
          </DynamicFontSize>
        </Wrapper>
        {optKey.pressed && (
          <NextSlideWrapper frame={previewDocumentFrame}>
            <DynamicFontSize frame={previewDocumentFrame}>
              {React.cloneElement(nextSpace.component, {
                ...nextSpace.props,
                direction,
                dispatch,
                viewState,
                key: nextSpace.props.path,
                frame: previewDocumentFrame
              })}
            </DynamicFontSize>
          </NextSlideWrapper>
        )}
        {showNav && <IndexNav model={indexRef.current} />}
      </>
    )
  }
  return <mark>Couldn't map cursor({cursor}) to a view :S</mark>
}

Document.propTypes = {
  cursor: PropTypes.number.isRequired,
  children: function(props, propName, componentName) {
    const prop = props[propName]
    let error = null
    React.Children.forEach(prop, function(child) {
      if (child.type !== Section) {
        error = new Error('`' + componentName + '` children should be of type `Section`.')
      }
    })
    return error
  }
}

const Wrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transform: translateZ(0);
`

const Animated = styled(animated.div)`
  will-change: transform, opacity;
`

const NextSlideWrapper = styled(animated.div)`
  position: absolute;
  right: 2%;
  bottom: 2%;
  width: ${props => props.frame.size[0]}px;
  height: ${props => props.frame.size[1]}px;
  background: #1a1a1a;
  border-radius: 4px;
  box-shadow: 0 0.15em 0.85em 0 rgba(0, 0, 0, 0.4);
  pointer-events: none;
  opacity: 0.8;
`

export default Document
