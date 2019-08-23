import React from 'react'
import Grid from './grid'
import GridWindow from './grid-window'
import {Frame} from '../../models/frame'
import {slugFromTitle} from '../../models/document'
import Store from '../../models/view-store'

function gridSizeForCount(count) {
  const rows = Math.round(Math.sqrt(count))
  const cols = Math.ceil(count / rows)
  return {
    rows,
    cols
  }
}

function gridFrameForIndex(grid, index) {
  const {cols} = grid
  const x = index % cols
  const y = Math.floor(index / cols)
  return Frame(x, y, 1, 1)
}

function PickerGrid({view, path, frame, children}) {
  const [{viewState}] = Store.useStore()

  const viewKeyPath = `${path}/${view}`

  const activeChildren = React.Children.toArray(children)
  const grid = gridSizeForCount(activeChildren.length)

  const layers = viewState.layers[viewKeyPath] || []

  return (
    <Grid view={view} key={path} path={viewKeyPath} frame={frame} rows={grid.rows} cols={grid.cols}>
      {activeChildren.map((child, index) => {
        const slug = slugFromTitle(child.props.title)
        const fullPath = `${viewKeyPath}/${slug}`
        const zIndex = layers.indexOf(slug) + 1
        const prevProps = viewState.layerProps[fullPath] || null
        const augmentedChild = React.cloneElement(child, {
          style: {
            // transform: 'scale(0.5)',
            width: '200px',
            height: '200px'
          }
        })
        return (
          <GridWindow
            key={slug}
            prevFrame={prevProps ? prevProps.frame : null}
            frame={gridFrameForIndex(grid, index)}
            style={{zIndex: zIndex}}
          >
            {augmentedChild}
          </GridWindow>
        )
      })}
    </Grid>
  )
}

export default PickerGrid
