import React from 'react'
import PropTypes from 'prop-types'
import Layer from './layer'
import Grid from './grid/grid'
import GridWindow from './grid/grid-window'
import {Frame} from '../models/frame'

import Store from '../models/space-store'

import {COLS, ROWS, slugFromTitle} from '../models/document'

// Default frame is 4:3 aspect ratio because it looks
// nicer in the add picker.
const DEFAULT_COLS = 24
const DEFAULT_ROWS = 18
// Center in grid:
const DefaultFrame = Frame(
  (COLS - DEFAULT_COLS) / 2,
  (ROWS - DEFAULT_ROWS) / 2,
  DEFAULT_COLS,
  DEFAULT_ROWS
)

function buildPath(basePath, slug) {
  return `${basePath}/${slug}`
}

function getChildVariationForView(childrenArr, slug, view) {
  const sub = childrenArr.filter(c => slugFromTitle(c.props.title) === slug)
  // We're before the first view, return first
  const first = sub[0]
  if (view < first.props.view) {
    return first
  }
  // We're after last view, return last
  const last = sub[sub.length - 1]
  if (view > last.props.view) {
    return last
  }
  // Return child for view
  let lastAcceptable = null
  for (let i = 0; i < sub.length; i++) {
    let vc = sub[i]
    if (vc.props.view < view) {
      lastAcceptable = vc
    }
    if (vc.props.view === view) {
      return vc
    }
  }
  return lastAcceptable
}

function Space({frame, view = 1, views, direction, path, viewState, dispatch, children}) {
  const viewKeyPath = buildPath(path, view)
  const prevViewKeyPath = buildPath(path, view - direction)
  const layers = viewState.layers[viewKeyPath] || []

  // Grab active view children in stable order:
  const activeChildrenArr = []
  const childrenArr = []

  const slugMap = {}
  React.Children.forEach(children, child => {
    const slug = slugFromTitle(child.props.title)

    // We've already added this child, skip
    if (slugMap[slug]) {
      return
    }
    slugMap[slug] = true

    // This is a bit of an afterthought, however:
    // If a child has a view prop we expect there will be multiple identical
    // children with different props. We want to pick the most appropriate
    // variation based on the current view:
    if (child.props.view) {
      // Find most appropriate variation of this child
      const variation = getChildVariationForView(children, slug, view)
      if (!variation) {
        throw new Error("Space: Couldn't find child variation for slug: " + slug + ' view: ' + view)
      }
      child = variation
    }

    if (layers.includes(slug)) {
      activeChildrenArr.push(child)
    }
    childrenArr.push(child)
  })

  const childPathForIndex = index => {
    const child = childrenArr[index]
    const slug = slugFromTitle(child.props.title)
    const cPath = `${viewKeyPath}/${slug}`
    return cPath
  }

  const handleFrameChange = (index, frame) => {
    const cPath = childPathForIndex(index)
    if (cPath) {
      dispatch({
        type: 'FRAME',
        payload: {
          path: cPath,
          ...frame
        }
      })
    } else {
      console.warn("handleFrameChange: couldn't map", index, 'to a child path, got:', cPath)
    }
  }

  const handleOrderChange = (index, direction) => {
    const cPath = childPathForIndex(index)
    dispatch({
      type: 'ORDER',
      payload: {
        path: cPath,
        direction: direction
      }
    })
  }

  const handleRemove = index => {
    const cPath = childPathForIndex(index)
    dispatch({
      type: 'REMOVE',
      payload: {
        path: cPath
      }
    })
  }

  const handleAdd = index => {
    const cPath = childPathForIndex(index)
    if (cPath) {
      dispatch({
        type: 'ADD',
        payload: {
          path: cPath,
          frame: DefaultFrame
        }
      })
    } else {
      console.warn("handleAdd: couldn't map", index, 'to a child path, got:', cPath)
    }
  }

  const handleUndo = () => {
    dispatch({
      type: 'UNDO',
      payload: {}
    })
  }

  const handleRedo = () => {
    dispatch({
      type: 'REDO',
      payload: {}
    })
  }

  return (
    <Store.Provider initialState={{}}>
      <Grid
        view={view}
        key={path}
        path={viewKeyPath}
        frame={frame}
        zoom={true}
        rows={ROWS}
        cols={COLS}
        onFrameChange={handleFrameChange}
        onOrderChange={handleOrderChange}
        onRemove={handleRemove}
        onAdd={handleAdd}
        onUndo={handleUndo}
        onRedo={handleRedo}
      >
        {childrenArr.map(child => {
          const slug = slugFromTitle(child.props.title)
          const fullPath = buildPath(viewKeyPath, slug)
          const prevFullPath = buildPath(prevViewKeyPath, slug)
          const isActive = activeChildrenArr.includes(child)
          const zIndex = isActive ? layers.indexOf(slug) : null
          const props = viewState.layerProps[fullPath]
          const prevProps = viewState.layerProps[prevFullPath] || null

          return (
            <GridWindow
              key={slug}
              active={isActive}
              viewIndex={zIndex}
              prevFrame={prevProps ? prevProps.frame : null}
              frame={props ? props.frame : DefaultFrame}
            >
              {child}
            </GridWindow>
          )
        })}
      </Grid>
    </Store.Provider>
  )
}

Space.propTypes = {
  path: PropTypes.string,
  title: PropTypes.string.isRequired,
  children: function(props, propName, componentName) {
    const prop = props[propName]
    let error = null
    React.Children.forEach(prop, function(child) {
      if (child.type !== Layer) {
        error = new Error('`' + componentName + '` children should be of type `Layer`.')
      }
    })
    return error
  }
}

export default Space
